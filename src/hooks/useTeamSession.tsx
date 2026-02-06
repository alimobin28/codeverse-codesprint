import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Team = Tables<"teams">;

const SESSION_KEY = "codeverse_session_id";
const LAST_ACTIVITY_KEY = "codeverse_last_activity";
const INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes

// Interface for RPC response
interface VerifyCredentialsResponse {
  success: boolean;
  team?: {
    id: string;
    name: string;
    username: string;
    session_id: string;
    created_at: string;
    auth_user_id: string | null;
  };
  error?: string;
}

export const useTeamSession = () => {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load team by session ID from sessionStorage
  const loadTeamBySessionId = useCallback(async (sessionId: string) => {
    try {
      // Check inactivity timeout
      const lastActivity = sessionStorage.getItem(LAST_ACTIVITY_KEY);
      if (lastActivity) {
        const inactiveTime = Date.now() - parseInt(lastActivity);
        if (inactiveTime >= INACTIVITY_TIMEOUT_MS) {
          console.warn("Session expired due to inactivity");
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
        if (error.code === "PGRST116" || error.code === "406") {
          console.warn("Session invalid, clearing");
          sessionStorage.removeItem(SESSION_KEY);
          sessionStorage.removeItem(LAST_ACTIVITY_KEY);
          return null;
        }
        throw error;
      }

      setTeam(data);
      return data;
    } catch (err) {
      console.error("Error loading team:", err);
      return null;
    }
  }, []);

  // Initialize session on mount
  const initializeSession = useCallback(async () => {
    const storedSessionId = sessionStorage.getItem(SESSION_KEY);

    // If no session stored, we're done loading
    if (!storedSessionId) {
      setLoading(false);
      return;
    }

    // Session exists, load the team
    try {
      const existingTeam = await loadTeamBySessionId(storedSessionId);
      if (existingTeam) {
        setTeam(existingTeam);
      }
    } catch (err) {
      console.error("Error initializing session:", err);
    } finally {
      setLoading(false);
    }
  }, [loadTeamBySessionId]);

  // Simple login using direct RPC call
  const login = async (username: string, password: string): Promise<Team | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log("[LOGIN] Verifying credentials for:", username);

      // Call the RPC function to verify credentials
      const { data, error: rpcError } = await supabase.rpc("verify_team_credentials", {
        p_username: username,
        p_password: password,
      });

      console.log("[LOGIN] RPC response:", data);

      if (rpcError) {
        console.error("[LOGIN] RPC error:", rpcError);
        setError("Login failed. Please try again.");
        setLoading(false);
        return null;
      }

      const response = data as unknown as VerifyCredentialsResponse;

      if (!response.success || !response.team) {
        console.error("[LOGIN] Invalid credentials");
        setError(response.error || "Invalid username or password");
        setLoading(false);
        return null;
      }

      console.log("[LOGIN] Success! Team:", response.team);

      // Store session and set team
      const teamData = response.team as unknown as Team;
      setTeam(teamData);
      sessionStorage.setItem(SESSION_KEY, teamData.session_id);
      sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
      setLoading(false);

      return teamData;
    } catch (err) {
      console.error("[LOGIN] Unexpected error:", err);
      setError("Login failed. Please try again.");
      setLoading(false);
      return null;
    }
  };

  // Create team (legacy - kept for compatibility)
  const createTeam = async (teamName: string): Promise<Team | null> => {
    setLoading(true);
    setError(null);

    try {
      const sessionId = crypto.randomUUID();

      const { data, error } = await supabase
        .from("teams")
        .insert([{ name: teamName, session_id: sessionId }])
        .select()
        .single();

      if (error) {
        setError(error.message);
        return null;
      }

      setTeam(data);
      sessionStorage.setItem(SESSION_KEY, sessionId);
      sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());

      return data;
    } catch (err: any) {
      setError(err.message || "Failed to create team");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Clear session
  const clearSession = useCallback(() => {
    setTeam(null);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(LAST_ACTIVITY_KEY);
    setError(null);
  }, []);

  // Update activity timestamp
  const updateActivity = useCallback(() => {
    if (team) {
      sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    }
  }, [team]);

  // Initialize on mount
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Activity tracking
  useEffect(() => {
    if (!team) return;

    const handleActivity = () => updateActivity();
    const events = ["mousedown", "keydown", "touchstart", "scroll"];

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [team, updateActivity]);

  return {
    team,
    loading,
    error,
    login,
    createTeam,
    clearSession,
    updateActivity,
  };
};