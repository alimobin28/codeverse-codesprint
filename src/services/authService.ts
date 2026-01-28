/**
 * Auth Service - Client-side authentication for localhost
 * Uses bcryptjs for password verification (works in browser)
 */

import bcrypt from 'bcryptjs';
import { supabase } from '@/integrations/supabase/client';

export interface AuthResponse {
    success?: boolean;
    error?: string;
    attemptsRemaining?: number;
    locked?: boolean;
}

class AuthService {
    private isAuth: boolean = false;
    private sessionExpiry: number | null = null;

    constructor() {
        // Check if session still valid
        const expiry = sessionStorage.getItem('admin_session_expiry');
        if (expiry && parseInt(expiry) > Date.now()) {
            this.isAuth = true;
            this.sessionExpiry = parseInt(expiry);
        }
    }

    /**
     * Login with password
     */
    async login(password: string): Promise<AuthResponse> {
        try {
            // Fetch admin settings from database (only get columns that exist in types)
            const { data, error } = await supabase
                .from('admin_settings')
                .select('*')
                .eq('setting_key', 'admin_account')
                .single();

            // Cast to any to access custom columns
            const settings: any = data;

            // Better error messages for debugging
            if (error) {
                console.error('Database error:', error);
                if (error.code === 'PGRST116') {
                    return { error: 'Admin account not found. Check supabase/CHANGE_PASSWORD.md' };
                }
                return { error: `Database error: ${error.message}` };
            }

            if (!settings) {
                return { error: 'Admin account not configured. Check supabase/CHANGE_PASSWORD.md' };
            }

            if (!settings.password_hash) {
                return { error: 'Password not set. Use supabase/CHANGE_PASSWORD.md to set password.' };
            }

            // Check if account is locked
            if (settings.locked_until && new Date(settings.locked_until) > new Date()) {
                const remainingMinutes = Math.ceil(
                    (new Date(settings.locked_until).getTime() - Date.now()) / 60000
                );
                return {
                    error: `Account locked. Try again in ${remainingMinutes} minute(s)`,
                    locked: true,
                };
            }

            // Verify password using bcryptjs
            const passwordMatch = await bcrypt.compare(password, settings.password_hash);

            if (!passwordMatch) {
                // Increment failed attempts
                const newFailedAttempts = (settings.failed_attempts || 0) + 1;
                const updateData: any = { failed_attempts: newFailedAttempts };

                // Lock account after 5 failed attempts
                if (newFailedAttempts >= 5) {
                    const lockUntil = new Date(Date.now() + 15 * 60 * 1000);
                    updateData.locked_until = lockUntil.toISOString();
                }

                await supabase
                    .from('admin_settings')
                    .update(updateData)
                    .eq('setting_key', 'admin_account');

                return {
                    error: 'Invalid password',
                    attemptsRemaining: Math.max(0, 5 - newFailedAttempts),
                };
            }

            // Password correct - reset failed attempts
            await supabase
                .from('admin_settings')
                .update({ failed_attempts: 0, locked_until: null })
                .eq('setting_key', 'admin_account');

            // Set session (1 hour)
            this.isAuth = true;
            this.sessionExpiry = Date.now() + 60 * 60 * 1000;
            sessionStorage.setItem('admin_session_expiry', this.sessionExpiry.toString());

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { error: 'Authentication failed. Check database connection.' };
        }
    }

    /**
     * Verify current session
     */
    async verify(): Promise<boolean> {
        if (!this.sessionExpiry || Date.now() >= this.sessionExpiry) {
            this.logout();
            return false;
        }
        return this.isAuth;
    }

    /**
     * Logout
     */
    async logout(): Promise<void> {
        this.isAuth = false;
        this.sessionExpiry = null;
        sessionStorage.removeItem('admin_session_expiry');
    }

    /**
     * Check if currently authenticated
     */
    isAuthenticated(): boolean {
        return this.isAuth && this.sessionExpiry !== null && Date.now() < this.sessionExpiry;
    }
}

export const authService = new AuthService();
