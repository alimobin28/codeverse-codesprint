import { useEffect, useRef } from 'react';

const ACTIVITY_UPDATE_DEBOUNCE = 30000; // Update max once per 30 seconds

interface UseActivityTrackerOptions {
    onActivity: () => void;
    enabled?: boolean;
}

/**
 * Hook to track user activity and call callback when activity is detected
 * Listens to: mouse movement, keyboard, scrolling, clicks, touch
 * Debounced to avoid excessive updates
 */
export const useActivityTracker = ({ onActivity, enabled = true }: UseActivityTrackerOptions) => {
    const lastUpdateRef = useRef<number>(0);

    useEffect(() => {
        if (!enabled) return;

        const handleActivity = () => {
            const now = Date.now();

            // Debounce: only update if 30 seconds have passed since last update
            if (now - lastUpdateRef.current > ACTIVITY_UPDATE_DEBOUNCE) {
                lastUpdateRef.current = now;
                onActivity();
            }
        };

        // List of events that indicate user activity
        const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];

        // Add event listeners
        events.forEach(event => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        // Initial activity registration
        onActivity();

        // Cleanup
        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [onActivity, enabled]);
};
