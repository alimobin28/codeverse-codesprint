import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Team = Tables<"teams">;

const SESSION_KEY = "codeverse_session_id";

export const useTeamSession = () => {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeamBySessionId = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("session_id", sessionId)
        .single();

      if (error) throw error;
      setTeam(data);
      return data;
    } catch (err) {
      console.error("Error loading team:", err);
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }, []);

  const initializeSession = useCallback(async () => {
    setLoading(true);
    try {
      const storedSessionId = localStorage.getItem(SESSION_KEY);
      if (storedSessionId) {
        const existingTeam = await loadTeamBySessionId(storedSessionId);
        if (existingTeam) {
          setTeam(existingTeam);
        }
      }
    } catch (err) {
      console.error("Error initializing session:", err);
    } finally {
      setLoading(false);
    }
  }, [loadTeamBySessionId]);

  const createTeam = async (teamName: string): Promise<Team | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if team already exists
      const { data: existingTeam } = await supabase
        .from("teams")
        .select("*")
        .eq("name", teamName)
        .single();

      if (existingTeam) {
        // Team exists, join existing session
        localStorage.setItem(SESSION_KEY, existingTeam.session_id);
        setTeam(existingTeam);
        return existingTeam;
      }

      // Create new team
      const { data: newTeam, error: createError } = await supabase
        .from("teams")
        .insert({ name: teamName })
        .select()
        .single();

      if (createError) {
        if (createError.code === "23505") {
          setError("Team name already exists. Joining existing session...");
          // Race condition - team was created between check and insert
          const { data: raceTeam } = await supabase
            .from("teams")
            .select("*")
            .eq("name", teamName)
            .single();
          if (raceTeam) {
            localStorage.setItem(SESSION_KEY, raceTeam.session_id);
            setTeam(raceTeam);
            return raceTeam;
          }
        }
        throw createError;
      }

      localStorage.setItem(SESSION_KEY, newTeam.session_id);
      setTeam(newTeam);
      return newTeam;
    } catch (err: any) {
      setError(err.message || "Failed to create team");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
    setTeam(null);
  };

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return {
    team,
    loading,
    error,
    createTeam,
    clearSession,
    isAuthenticated: !!team,
  };
};

export default useTeamSession;