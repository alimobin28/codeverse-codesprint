import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Hint = Tables<"hints">;

export const useHints = (problemId?: string) => {
    const [hints, setHints] = useState<Hint[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHints = useCallback(async () => {
        try {
            let query = supabase
                .from("hints")
                .select("*")
                .order("sort_order", { ascending: true });

            if (problemId) {
                query = query.eq("problem_id", problemId);
            }

            const { data, error } = await query;

            if (error) throw error;
            setHints(data || []);
        } catch (err) {
            console.error("Error fetching hints:", err);
        } finally {
            setLoading(false);
        }
    }, [problemId]);

    const createHint = async (hint: Omit<Hint, "id" | "created_at">) => {
        try {
            const { error } = await supabase.from("hints").insert(hint);
            if (error) throw error;
            toast.success("Hint created successfully");
            await fetchHints();
            return true;
        } catch (err) {
            console.error("Error creating hint:", err);
            toast.error("Failed to create hint");
            return false;
        }
    };

    const updateHint = async (id: string, updates: Partial<Hint>) => {
        try {
            const { error } = await supabase
                .from("hints")
                .update(updates)
                .eq("id", id);
            if (error) throw error;
            toast.success("Hint updated");
            await fetchHints();
            return true;
        } catch (err) {
            console.error("Error updating hint:", err);
            toast.error("Failed to update hint");
            return false;
        }
    };

    const deleteHint = async (id: string) => {
        try {
            const { error } = await supabase.from("hints").delete().eq("id", id);
            if (error) throw error;
            toast.success("Hint deleted");
            await fetchHints();
            return true;
        } catch (err) {
            console.error("Error deleting hint:", err);
            toast.error("Failed to delete hint");
            return false;
        }
    };

    useEffect(() => {
        fetchHints();

        const channel = supabase
            .channel("hints-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "hints" },
                () => {
                    fetchHints();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchHints]);

    return {
        hints,
        loading,
        createHint,
        updateHint,
        deleteHint,
        refetch: fetchHints,
    };
};

export default useHints;
