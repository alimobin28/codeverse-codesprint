import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Broadcast = Tables<"broadcasts">;

const typeIcons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
};

const typeColors = {
    info: "bg-blue-500/20 border-blue-500/50 text-blue-200",
    success: "bg-lime-500/20 border-lime-500/50 text-lime-200",
    warning: "bg-yellow-500/20 border-yellow-500/50 text-yellow-200",
    error: "bg-red-500/20 border-red-500/50 text-red-200",
};

const DISPLAY_DURATION_MS = 2 * 60 * 1000; // 2 minutes

export const BroadcastBanner = () => {
    const [activeBroadcasts, setActiveBroadcasts] = useState<Broadcast[]>([]);
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Fetch active broadcasts
        const fetchBroadcasts = async () => {
            const { data, error } = await supabase
                .from("broadcasts")
                .select("*")
                .eq("is_active", true)
                .order("created_at", { ascending: false })
                .limit(5);

            if (!error && data) {
                // Filter out old broadcasts (older than 2 minutes)
                const now = Date.now();
                const recentBroadcasts = data.filter((broadcast) => {
                    const createdAt = new Date(broadcast.created_at).getTime();
                    return now - createdAt < DISPLAY_DURATION_MS;
                });
                setActiveBroadcasts(recentBroadcasts);
            }
        };

        fetchBroadcasts();

        // Realtime subscription for new broadcasts
        const channel = supabase
            .channel("broadcast-banner")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "broadcasts" },
                (payload) => {
                    const newBroadcast = payload.new as Broadcast;
                    setActiveBroadcasts((prev) => [newBroadcast, ...prev.slice(0, 4)]);
                }
            )
            .subscribe();

        // Cleanup old broadcasts every 10 seconds
        const cleanupInterval = setInterval(() => {
            const now = Date.now();
            setActiveBroadcasts((prev) =>
                prev.filter((broadcast) => {
                    const createdAt = new Date(broadcast.created_at).getTime();
                    return now - createdAt < DISPLAY_DURATION_MS;
                })
            );
        }, 10000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(cleanupInterval);
        };
    }, []);

    const handleDismiss = (id: string) => {
        setDismissedIds((prev) => new Set(prev).add(id));
    };

    const visibleBroadcasts = activeBroadcasts.filter(
        (b) => !dismissedIds.has(b.id)
    );

    if (visibleBroadcasts.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4 space-y-2">
            <AnimatePresence>
                {visibleBroadcasts.map((broadcast) => {
                    const Icon = typeIcons[broadcast.type as keyof typeof typeIcons] || Info;
                    const colors = typeColors[broadcast.type as keyof typeof typeColors] || typeColors.info;

                    return (
                        <motion.div
                            key={broadcast.id}
                            initial={{ opacity: 0, y: -50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl ${colors}`}
                        >
                            <Icon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-mono font-semibold uppercase tracking-wider mb-1 opacity-70">
                                    Broadcast
                                </p>
                                <p className="font-medium">{broadcast.message}</p>
                            </div>
                            <button
                                onClick={() => handleDismiss(broadcast.id)}
                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 opacity-70 hover:opacity-100" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default BroadcastBanner;
