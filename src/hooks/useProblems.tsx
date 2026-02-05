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
      // Check if user is authenticated (admin)
      const { data: { session } } = await supabase.auth.getSession();
      const isAdmin = !!session;

      let data, error;

      if (isAdmin) {
        // Admins query problems table directly
        let query = supabase
          .from("problems")
          .select("*")
          .order("sort_order", { ascending: true });

        if (roundNumber) {
          query = query.eq("round_number", roundNumber);
        }

        const result = await query;
        data = result.data;
        error = result.error;
      } else {
        // Public users query masked view (content is hidden until unlocked)
        let query = supabase
          .from("problems_masked" as any)
          .select("*")
          .order("sort_order", { ascending: true });

        if (roundNumber) {
          query = query.eq("round_number", roundNumber);
        }

        const result = await query;
        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      // Force new array reference to trigger React re-render
      // This ensures UI updates when locked content becomes visible
      setProblems(data ? [...data] : []);
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
    const setupUpdates = async () => {
      // Initial fetch
      await fetchProblems();

      // Check if user is admin
      const { data: { session } } = await supabase.auth.getSession();
      const isAdmin = !!session;

      if (isAdmin) {
        // Admins get realtime updates
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
      } else {
        // Public users: No automatic updates
        // Round2Page will manually call refetch() when problems unlock
        return () => { };
      }
    };

    const cleanup = setupUpdates();

    return () => {
      cleanup.then(cleanupFn => {
        if (cleanupFn) cleanupFn();
      });
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