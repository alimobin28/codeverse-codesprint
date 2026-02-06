/**
 * Auth Service - Server-side authentication using Supabase Auth
 * Uses Supabase Auth for proper server-side session management
 * ADMIN ONLY - Team users use separate password verification
 */

import { supabase } from '@/integrations/supabase/client';

// Whitelist of allowed admin emails
const ADMIN_EMAILS = [
    'admin@codeverse.app',
    // Add more admin emails as needed
];

export interface AuthResponse {
    success?: boolean;
    error?: string;
}

class AuthService {
    /**
     * Login with email and password via Supabase Auth
     * Only allows whitelisted admin emails
     */
    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            // Check if email is in admin whitelist
            if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
                return { error: 'Not authorized as admin' };
            }

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
