import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Problem = Tables<"problems">;

export const useProblems = (roundNumber?: number) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProblems = useCallback(async () => {
    try {
      let query = supabase
        .from("problems")
        .select("*")
        .order("sort_order", { ascending: true });

      if (roundNumber) {
        query = query.eq("round_number", roundNumber);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProblems(data || []);
    } catch (err) {
      console.error("Error fetching problems:", err);
    } finally {
      setLoading(false);
    }
  }, [roundNumber]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  return {
    problems,
    loading,
    refetch: fetchProblems,
  };
};

export default useProblems;