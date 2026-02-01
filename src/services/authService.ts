/**
 * Auth Service - Server-side authentication using Supabase Auth
 * Uses Supabase Auth for proper server-side session management
 */

import { supabase } from '@/integrations/supabase/client';

export interface AuthResponse {
    success?: boolean;
    error?: string;
}

class AuthService {
    /**
     * Login with email and password via Supabase Auth
     */
    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { error: error.message };
            }

            if (!data.session) {
                return { error: 'No session created' };
            }

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { error: 'Authentication failed. Check connection.' };
        }
    }

    /**
     * Verify current session is valid
     */
    async verify(): Promise<boolean> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            return !!session;
        } catch {
            return false;
        }
    }

    /**
     * Logout and clear session
     */
    async logout(): Promise<void> {
        await supabase.auth.signOut();
    }

    /**
     * Check if currently authenticated (async)
     */
    async isAuthenticated(): Promise<boolean> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            return !!session;
        } catch {
            return false;
        }
    }

    /**
     * No-op for backwards compatibility
     * Activity tracking is now handled by Supabase session refresh
     */
    updateActivity(): void {
        // Supabase handles session refresh automatically
    }
}

export const authService = new AuthService();
