import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const RESYNC_INTERVAL = 5 * 60 * 1000; // Re-sync every 5 minutes
const INITIAL_SYNC_RETRIES = 3; // Retry initial sync if it fails

/**
 * Hook to synchronize client clock with server time
 * Calculates offset once and periodically re-syncs to handle clock drift
 * 
 * @returns clockOffset - Milliseconds to add to Date.now() to get server time
 * @returns getServerTime - Function that returns current server time
 * @returns isSynced - Whether initial sync is complete
 */
export const useServerTime = () => {
    const [clockOffset, setClockOffset] = useState<number>(0);
    const [isSynced, setIsSynced] = useState<boolean>(false);

    /**
     * Sync client clock with server
     * Measures round-trip time to account for network latency
     */
    const syncWithServer = useCallback(async (): Promise<number> => {
        try {
            const startTime = Date.now();

            // Call server to get timestamp
            const { data, error } = await supabase.rpc('get_server_time');

            const endTime = Date.now();

            if (error) {
                console.error('Failed to sync with server:', error);
                return 0;
            }

            // Calculate network latency (round-trip / 2)
            const latency = (endTime - startTime) / 2;

            // Get server time and adjust for latency
            const serverTime = new Date(data).getTime();
            const adjustedServerTime = serverTime + latency;

            // Calculate offset
            const offset = adjustedServerTime - endTime;

            console.log('[Time Sync]', {
                clientTime: new Date(endTime).toISOString(),
                serverTime: new Date(serverTime).toISOString(),
                latency: `${latency}ms`,
                offset: `${offset}ms`,
            });

            return offset;
        } catch (error) {
            console.error('Error syncing time:', error);
            return 0;
        }
    }, []);

    /**
     * Initial sync with retries
     */
    const performInitialSync = useCallback(async () => {
        let attempts = 0;
        let offset = 0;

        while (attempts < INITIAL_SYNC_RETRIES) {
            offset = await syncWithServer();

            // If offset seems reasonable (within 24 hours), accept it
            if (Math.abs(offset) < 24 * 60 * 60 * 1000) {
                break;
            }

            attempts++;
            console.warn(`Time sync attempt ${attempts} failed, retrying...`);

            // Wait a bit before retry
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        setClockOffset(offset);
        setIsSynced(true);
    }, [syncWithServer]);

    /**
     * Periodic re-sync to handle clock drift
     */
    useEffect(() => {
        // Initial sync
        performInitialSync();

        // Re-sync periodically
        const interval = setInterval(async () => {
            const newOffset = await syncWithServer();

            // Only update if offset changed significantly (>1 second)
            if (Math.abs(newOffset - clockOffset) > 1000) {
                console.log('[Time Sync] Clock drift detected, updating offset');
                setClockOffset(newOffset);
            }
        }, RESYNC_INTERVAL);

        return () => clearInterval(interval);
    }, [performInitialSync, syncWithServer, clockOffset]);

    /**
     * Get current server time
     */
    const getServerTime = useCallback((): number => {
        return Date.now() + clockOffset;
    }, [clockOffset]);

    return {
        clockOffset,
        getServerTime,
        isSynced,
    };
};
