import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Team = Tables<"teams">;

const SESSION_KEY = "codeverse_session_id";
const LAST_ACTIVITY_KEY = "codeverse_last_activity";
const INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes

export const useTeamSession = () => {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeamBySessionId = useCallback(async (sessionId: string) => {
    try {
      // Check if session has expired due to inactivity
      const lastActivity = sessionStorage.getItem(LAST_ACTIVITY_KEY);
      if (lastActivity) {
        const inactiveTime = Date.now() - parseInt(lastActivity);
        if (inactiveTime >= INACTIVITY_TIMEOUT_MS) {
          console.warn("Session expired due to inactivity, clearing.");
          sessionStorage.removeItem(SESSION_KEY);
          sessionStorage.removeItem(LAST_ACTIVITY_KEY);
          return null;
        }
      }
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("session_id", sessionId)
        .single();

      if (error) {
        // Only clear session if the team was truly not found
        // PGRST116 is "The result contains 0 rows" (single() returned nothing)
        if (error.code === "PGRST116" || error.code === "406") {
          console.warn("Session invalid, clearing.");
          sessionStorage.removeItem(SESSION_KEY);
          sessionStorage.removeItem(LAST_ACTIVITY_KEY);
          return null;
        }
        // For other errors (network, etc), throw to keep the loading state or handle gracefully
        // but DO NOT logout the user.
        throw error;
      }
      setTeam(data);
      return data;
    } catch (err: any) {
      console.error("Error loading team:", err);
      // Only clear if we explicitly decided to above, otherwise keep session
      if (!sessionStorage.getItem(SESSION_KEY)) {
        return null;
      }
      // If network error, we might want to return null but NOT clear storage
      // so the user can refresh later.
      return null;
    }
  }, []);

  const initializeSession = useCallback(async () => {
    setLoading(true);
    try {
      const storedSessionId = sessionStorage.getItem(SESSION_KEY);
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
        sessionStorage.setItem(SESSION_KEY, existingTeam.session_id);
        sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
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
            sessionStorage.setItem(SESSION_KEY, raceTeam.session_id);
            sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
            setTeam(raceTeam);
            return raceTeam;
          }
        }
        throw createError;
      }

      sessionStorage.setItem(SESSION_KEY, newTeam.session_id);
      sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
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
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(LAST_ACTIVITY_KEY);
    setTeam(null);
  };

  const updateActivity = useCallback(() => {
    if (team) {
      sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    }
  }, [team]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return {
    team,
    loading,
    error,
    createTeam,
    clearSession,
    updateActivity,
    isAuthenticated: !!team,
  };
};

export default useTeamSession;