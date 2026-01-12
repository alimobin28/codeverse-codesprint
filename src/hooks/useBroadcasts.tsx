import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Broadcast = Tables<"broadcasts">;

export const useBroadcasts = () => {
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBroadcasts = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("broadcasts")
                .select("*")
                .eq("is_active", true)
                .order("created_at", { ascending: false })
                .limit(10);

            if (error) throw error;
            setBroadcasts(data || []);
        } catch (err) {
            console.error("Error fetching broadcasts:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const sendBroadcast = async (message: string, type: string = "info") => {
        try {
            const { error } = await supabase.from("broadcasts").insert({
                message,
                type,
                is_active: true,
            });
            if (error) throw error;
            toast.success("Broadcast sent!");
            await fetchBroadcasts();
            return true;
        } catch (err) {
            console.error("Error sending broadcast:", err);
            toast.error("Failed to send broadcast");
            return false;
        }
    };

    const dismissBroadcast = async (id: string) => {
        try {
            const { error } = await supabase
                .from("broadcasts")
                .update({ is_active: false })
                .eq("id", id);
            if (error) throw error;
            await fetchBroadcasts();
            return true;
        } catch (err) {
            console.error("Error dismissing broadcast:", err);
            return false;
        }
    };

    useEffect(() => {
        fetchBroadcasts();

        // Realtime subscription for new broadcasts
        const channel = supabase
            .channel("broadcasts-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "broadcasts" },
                (payload) => {
                    if (payload.eventType === "INSERT") {
                        const newBroadcast = payload.new as Broadcast;
                        // Show toast notification for new broadcasts
                        toast[newBroadcast.type as "info" | "success" | "warning" | "error" || "info"](
                            newBroadcast.message,
                            { duration: 10000 }
                        );
                    }
                    fetchBroadcasts();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchBroadcasts]);

    return {
        broadcasts,
        loading,
        sendBroadcast,
        dismissBroadcast,
        refetch: fetchBroadcasts,
    };
};

export default useBroadcasts;
