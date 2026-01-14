import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useRounds } from "@/hooks/useRounds";
import { useProblems } from "@/hooks/useProblems";
import {
    CodeverseCard,
    CodeverseCardHeader,
    CodeverseCardTitle,
} from "@/components/ui/codeverse-card";
import { CodeverseButton } from "@/components/ui/codeverse-button";
import { CodeverseInput } from "@/components/ui/codeverse-input";
import { Lock, Unlock, Play, Pause, Clock, Settings, ExternalLink, Trophy, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const neonText = "text-lime-400 drop-shadow-[0_0_5px_rgba(163,230,53,0.8)]";

export const RoundControl = () => {
    const { rounds, unlockRound, toggleRound3Timer, refetch } = useRounds();
    const { problems: round2Problems } = useProblems(2); // For sequential round timer
    const [editingDuration, setEditingDuration] = useState<number | null>(null);
    const [durationValue, setDurationValue] = useState("");

    // URL Editing State
    const [editingLinks, setEditingLinks] = useState<number | null>(null);
    const [vjudgeValue, setVjudgeValue] = useState("");
    const [scoreboardValue, setScoreboardValue] = useState("");

    // Timer Logic
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Calculate Round 2 total duration from individual problem limits
    const round2TotalSeconds = useMemo(() => {
        return round2Problems.reduce(
            (sum, p) => sum + (p.individual_time_limit_seconds || 600),
            0
        );
    }, [round2Problems]);

    const getRemainingTime = (round: any) => {
        if (!round?.timer_started_at || !round?.timer_active) return null;
        const startTime = new Date(round.timer_started_at).getTime();

        // For sequential rounds (Round 2), use sum of individual problem times
        const durationSeconds = round.type === "sequential"
            ? round2TotalSeconds
            : (round.duration_minutes || 60) * 60;

        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const remaining = Math.max(0, durationSeconds - elapsedSeconds);

        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

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

    const handleLinksSave = async (roundNumber: number) => {
        try {
            const { error } = await supabase
                .from("rounds")
                .update({
                    vjudge_url: vjudgeValue || null,
                    scoreboard_url: scoreboardValue || null
                })
                .eq("round_number", roundNumber);

            if (error) throw error;
            toast.success("Links updated successfully");
            setEditingLinks(null);
            refetch();
        } catch (err) {
            toast.error("Failed to update links");
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
                                    <div className="flex flex-col gap-1">
                                        <CodeverseCardTitle
                                            className={`text-lg ${isUnlocked ? "text-lime-300" : "text-gray-400"}`}
                                        >
                                            Round {num}: {round?.title || `Round ${num}`}
                                        </CodeverseCardTitle>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                                {round?.type === "sequential" ? "Sequential" : "Standard"}
                                            </span>
                                            {timerActive && (
                                                <span className="text-xl font-mono font-bold text-lime-400 tabular-nums drop-shadow-[0_0_5px_rgba(163,230,53,0.5)]">
                                                    {getRemainingTime(round)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
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
                                            variant="ghost"
                                            size="sm"
                                            className={`w-full border ${timerActive
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
                                        variant="ghost"
                                        size="sm"
                                        className={`w-full font-bold transition-all duration-300 border ${isUnlocked
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
                                    {/* Links Editor */}
                                    <div className="p-3 bg-black/40 rounded-lg border border-white/5 space-y-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                External Links
                                            </span>
                                            {editingLinks !== num && (
                                                <CodeverseButton
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setEditingLinks(num);
                                                        setVjudgeValue(round?.vjudge_url || "");
                                                        setScoreboardValue(round?.scoreboard_url || "");
                                                    }}
                                                    className="h-6 text-xs text-lime-400 hover:text-lime-300"
                                                >
                                                    Edit
                                                </CodeverseButton>
                                            )}
                                        </div>

                                        {editingLinks === num ? (
                                            <div className="space-y-3 animation-fade-in">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-gray-500 flex items-center gap-1">
                                                        <ExternalLink className="w-3 h-3" /> VJude Contest URL
                                                    </label>
                                                    <CodeverseInput
                                                        value={vjudgeValue}
                                                        onChange={(e) => setVjudgeValue(e.target.value)}
                                                        placeholder="https://vjudge.net/..."
                                                        className="h-8 text-xs bg-black/50"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-gray-500 flex items-center gap-1">
                                                        <Trophy className="w-3 h-3" /> Scoreboard URL
                                                    </label>
                                                    <CodeverseInput
                                                        value={scoreboardValue}
                                                        onChange={(e) => setScoreboardValue(e.target.value)}
                                                        placeholder="https://..."
                                                        className="h-8 text-xs bg-black/50"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <CodeverseButton
                                                        size="sm"
                                                        onClick={() => handleLinksSave(num)}
                                                        className="flex-1 h-7 text-xs bg-lime-500 text-black hover:bg-lime-400"
                                                    >
                                                        <Save className="w-3 h-3 mr-1" /> Save
                                                    </CodeverseButton>
                                                    <CodeverseButton
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setEditingLinks(null)}
                                                        className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </CodeverseButton>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {round?.vjudge_url ? (
                                                    <div className="flex items-center gap-2 text-xs text-blue-400 truncate">
                                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                        <span className="truncate">{round.vjudge_url}</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-600 italic">No VJudge Link set</div>
                                                )}
                                                {round?.scoreboard_url ? (
                                                    <div className="flex items-center gap-2 text-xs text-yellow-400 truncate">
                                                        <Trophy className="w-3 h-3 flex-shrink-0" />
                                                        <span className="truncate">{round.scoreboard_url}</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-600 italic">No Scoreboard Link set</div>
                                                )}
                                            </div>
                                        )}
                                    </div>

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
