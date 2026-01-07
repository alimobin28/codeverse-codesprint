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
    fetchRounds();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("rounds-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rounds" },
        () => {
          fetchRounds();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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