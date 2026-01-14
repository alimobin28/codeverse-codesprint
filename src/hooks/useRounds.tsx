import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Round = Tables<"rounds">;

export const useRounds = () => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRounds = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("rounds")
        .select("*")
        .order("round_number", { ascending: true });

      if (error) throw error;
      setRounds(data || []);
    } catch (err) {
      console.error("Error fetching rounds:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const unlockRound = async (roundNumber: number, unlock: boolean) => {
    try {
      const { error } = await supabase
        .from("rounds")
        .update({ is_unlocked: unlock })
        .eq("round_number", roundNumber);

      if (error) throw error;
      await fetchRounds();
      return true;
    } catch (err) {
      console.error("Error updating round:", err);
      return false;
    }
  };

  const toggleRound3Timer = async (active: boolean) => {
    try {
      const updateData: Partial<Round> = {
        timer_active: active,
        timer_started_at: active ? new Date().toISOString() : null,
      };

      const { error } = await supabase
        .from("rounds")
        .update(updateData)
        .eq("round_number", 3);

      if (error) throw error;
      await fetchRounds();
      return true;
    } catch (err) {
      console.error("Error toggling timer:", err);
      return false;
    }
  };

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let visibilityTimeout: NodeJS.Timeout;

    const setupSubscription = () => {
      // Clean up existing channel if any
      if (channel) supabase.removeChannel(channel);

      // Fetch initial data
      fetchRounds();

      // Subscribe to real-time updates
      channel = supabase
        .channel("rounds-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "rounds" },
          () => {
            fetchRounds();
          }
        )
        .subscribe();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Debounce disconnect to avoid flickering on quick tab switches
        clearTimeout(visibilityTimeout);
        visibilityTimeout = setTimeout(() => {
          if (channel) {
            console.log("Tab hidden for >10m (simulated), pausing updates...");
            // Real requirement is 10 minutes, but for safety we pause immediately
            // or we could set a 10 min timeout. 
            // The prompt asked: "if tab is hidden for more than 10 minutes so connection should also be broke"
            // So we will actually wait 10 minutes.
            supabase.removeChannel(channel!);
            channel = null;
          }
        }, 10 * 60 * 1000); // 10 minutes
      } else {
        clearTimeout(visibilityTimeout);
        if (!channel) {
          console.log("Tab visible, resuming updates...");
          setupSubscription();
        }
      }
    };

    // Initial setup
    setupSubscription();

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (channel) supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(visibilityTimeout);
    };
  }, [fetchRounds]);

  const getRound = (roundNumber: number) => {
    return rounds.find((r) => r.round_number === roundNumber);
  };

  return {
    rounds,
    loading,
    getRound,
    unlockRound,
    toggleRound3Timer,
    refetch: fetchRounds,
  };
};

export default useRounds;