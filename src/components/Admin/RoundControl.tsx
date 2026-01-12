import { useState } from "react";
import { motion } from "framer-motion";
import { useRounds } from "@/hooks/useRounds";
import {
    CodeverseCard,
    CodeverseCardHeader,
    CodeverseCardTitle,
} from "@/components/ui/codeverse-card";
import { CodeverseButton } from "@/components/ui/codeverse-button";
import { CodeverseInput } from "@/components/ui/codeverse-input";
import { Lock, Unlock, Play, Pause, Clock, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const neonText = "text-lime-400 drop-shadow-[0_0_5px_rgba(163,230,53,0.8)]";

export const RoundControl = () => {
    const { rounds, unlockRound, toggleRound3Timer, refetch } = useRounds();
    const [editingDuration, setEditingDuration] = useState<number | null>(null);
    const [durationValue, setDurationValue] = useState("");

    const handleUnlockToggle = async (roundNumber: number, currentState: boolean) => {
        const success = await unlockRound(roundNumber, !currentState);
        if (success) {
            toast.success(`Round ${roundNumber} ${!currentState ? "unlocked" : "locked"}`);
        }
    };

    const handleTimerToggle = async (roundNumber: number, currentActive: boolean) => {
        try {
            const updateData = {
                timer_active: !currentActive,
                timer_started_at: !currentActive ? new Date().toISOString() : null,
            };

            const { error } = await supabase
                .from("rounds")
                .update(updateData)
                .eq("round_number", roundNumber);

            if (error) throw error;
            toast.success(`Timer ${!currentActive ? "started" : "stopped"} for Round ${roundNumber}`);
            refetch();
        } catch (err) {
            toast.error("Failed to toggle timer");
        }
    };

    const handleDurationSave = async (roundNumber: number) => {
        try {
            const { error } = await supabase
                .from("rounds")
                .update({ duration_minutes: parseInt(durationValue) || 60 })
                .eq("round_number", roundNumber);

            if (error) throw error;
            toast.success("Duration updated");
            setEditingDuration(null);
            refetch();
        } catch (err) {
            toast.error("Failed to update duration");
        }
    };

    const getRound = (num: number) => rounds.find((r) => r.round_number === num);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-lime-400" />
                Round Control
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((num) => {
                    const round = getRound(num);
                    const isUnlocked = round?.is_unlocked || false;
                    const timerActive = round?.timer_active || false;
                    const durationMins = round?.duration_minutes || 60;

                    return (
                        <motion.div
                            key={num}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: num * 0.1 }}
                        >
                            <CodeverseCard
                                variant={isUnlocked ? "active" : "default"}
                                className={`transition-all duration-300 ${isUnlocked
                                        ? "border-lime-500 shadow-[0_0_30px_rgba(163,230,53,0.15)] bg-lime-950/20"
                                        : "border-white/10"
                                    }`}
                            >
                                <CodeverseCardHeader>
                                    <CodeverseCardTitle
                                        className={`text-lg ${isUnlocked ? "text-lime-300" : "text-gray-400"}`}
                                    >
                                        Round {num}: {round?.title || `Round ${num}`}
                                    </CodeverseCardTitle>
                                    <span className="text-xs text-gray-500">
                                        {round?.type === "sequential" ? "Sequential" : "Standard"}
                                    </span>
                                </CodeverseCardHeader>

                                <div className="space-y-3">
                                    {/* Status Row */}
                                    <div
                                        className={`flex items-center justify-between p-3 rounded-lg border ${isUnlocked
                                                ? "bg-lime-500/10 border-lime-500/30"
                                                : "bg-black/40 border-white/5"
                                            }`}
                                    >
                                        <span className="text-sm font-mono text-gray-400">Status</span>
                                        <span
                                            className={`text-sm font-bold tracking-wider ${isUnlocked ? neonText : "text-gray-500"
                                                }`}
                                        >
                                            {isUnlocked ? "UNLOCKED" : "LOCKED"}
                                        </span>
                                    </div>

                                    {/* Duration Edit (for Standard rounds) */}
                                    {round?.type !== "sequential" && (
                                        <div className="flex items-center gap-2 p-2 rounded-lg bg-black/30">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            {editingDuration === num ? (
                                                <>
                                                    <CodeverseInput
                                                        type="number"
                                                        value={durationValue}
                                                        onChange={(e) => setDurationValue(e.target.value)}
                                                        className="w-20 h-8 text-sm"
                                                        placeholder="mins"
                                                    />
                                                    <CodeverseButton
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDurationSave(num)}
                                                        className="text-lime-400"
                                                    >
                                                        Save
                                                    </CodeverseButton>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-sm text-gray-300">{durationMins} min</span>
                                                    <CodeverseButton
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setEditingDuration(num);
                                                            setDurationValue(durationMins.toString());
                                                        }}
                                                        className="text-gray-400 text-xs"
                                                    >
                                                        Edit
                                                    </CodeverseButton>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Timer Toggle (for unlocked rounds) */}
                                    {isUnlocked && (
                                        <CodeverseButton
                                            variant="outline"
                                            size="sm"
                                            className={`w-full ${timerActive
                                                    ? "!bg-orange-500 !text-white border-transparent"
                                                    : "border-orange-500/30 text-orange-400"
                                                }`}
                                            onClick={() => handleTimerToggle(num, timerActive)}
                                        >
                                            {timerActive ? (
                                                <>
                                                    <Pause className="w-4 h-4 mr-2" />
                                                    STOP TIMER
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="w-4 h-4 mr-2" />
                                                    START TIMER
                                                </>
                                            )}
                                        </CodeverseButton>
                                    )}

                                    {/* Lock/Unlock Button */}
                                    <CodeverseButton
                                        variant="outline"
                                        size="sm"
                                        className={`w-full font-bold transition-all duration-300 ${isUnlocked
                                                ? "!bg-lime-500 !text-black hover:!bg-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.5)] border-transparent"
                                                : "border-lime-500/30 text-lime-500 hover:bg-lime-500/10"
                                            }`}
                                        onClick={() => handleUnlockToggle(num, isUnlocked)}
                                    >
                                        {isUnlocked ? (
                                            <>
                                                <Lock className="w-4 h-4 mr-2" />
                                                LOCK ROUND
                                            </>
                                        ) : (
                                            <>
                                                <Unlock className="w-4 h-4 mr-2" />
                                                UNLOCK ROUND
                                            </>
                                        )}
                                    </CodeverseButton>
                                </div>
                            </CodeverseCard>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default RoundControl;
