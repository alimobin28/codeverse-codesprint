import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

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

  const createProblem = async (problem: Omit<Problem, "id" | "created_at" | "updated_at">) => {
    try {
      const { error } = await supabase.from("problems").insert(problem);
      if (error) throw error;
      toast.success("Problem created successfully");
      await fetchProblems();
      return true;
    } catch (err) {
      console.error("Error creating problem:", err);
      toast.error("Failed to create problem");
      return false;
    }
  };

  const updateProblem = async (id: string, updates: Partial<Problem>) => {
    try {
      const { error } = await supabase
        .from("problems")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast.success("Problem updated");
      await fetchProblems();
      return true;
    } catch (err) {
      console.error("Error updating problem:", err);
      toast.error("Failed to update problem");
      return false;
    }
  };

  const deleteProblem = async (id: string) => {
    try {
      const { error } = await supabase.from("problems").delete().eq("id", id);
      if (error) throw error;
      toast.success("Problem deleted");
      await fetchProblems();
      return true;
    } catch (err) {
      console.error("Error deleting problem:", err);
      toast.error("Failed to delete problem");
      return false;
    }
  };

  useEffect(() => {
    fetchProblems();

    const channel = supabase
      .channel("problems-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "problems" },
        () => {
          fetchProblems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProblems]);

  return {
    problems,
    loading,
    createProblem,
    updateProblem,
    deleteProblem,
    refetch: fetchProblems,
  };
};

export default useProblems;