import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CodeverseButton } from "@/components/ui/codeverse-button";
import { CodeverseCard, CodeverseCardContent } from "@/components/ui/codeverse-card";
import { useTeamSession } from "@/hooks/useTeamSession";
import { useRounds } from "@/hooks/useRounds";
import { useProblems } from "@/hooks/useProblems";
import {
    ArrowLeft,
    Clock,
    AlertTriangle,
    Lock,
    ExternalLink,
    Timer,
    XCircle,
    Trophy,
} from "lucide-react";
import { ProblemCard } from "./ProblemCard";
import { BroadcastBanner } from "@/components/BroadcastBanner";

interface Round2PageProps {
    contestId?: string; // Now optional - use vjudge_url from database
    backgroundImage?: string;
}

const Round2Page = ({ contestId, backgroundImage }: Round2PageProps) => {
    const navigate = useNavigate();
    const { team, loading: teamLoading } = useTeamSession();
    const { getRound, loading: roundsLoading } = useRounds();
    const { problems, loading: problemsLoading } = useProblems(2);

    const round = getRound(2);
    const loading = teamLoading || roundsLoading || problemsLoading;

    // Sort problems by sort_order
    const sortedProblems = useMemo(() => {
        return [...problems].sort((a, b) => a.sort_order - b.sort_order);
    }, [problems]);

    // Calculate total duration and current problem based on elapsed time
    const totalDurationSeconds = useMemo(() => {
        return sortedProblems.reduce(
            (sum, p) => sum + (p.individual_time_limit_seconds || 600),
            0
        );
    }, [sortedProblems]);

    // Calculate elapsed time and current problem index based on global timer
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [timeInCurrentProblem, setTimeInCurrentProblem] = useState(0);

    const currentProblemData = useMemo(() => {
        if (!round?.timer_started_at || !round?.timer_active) {
            return { index: 0, problem: sortedProblems[0], timeRemaining: 0 };
        }

        let accumulated = 0;
        for (let i = 0; i < sortedProblems.length; i++) {
            const problemDuration = sortedProblems[i].individual_time_limit_seconds || 600;
            if (elapsedSeconds < accumulated + problemDuration) {
                const timeRemaining = accumulated + problemDuration - elapsedSeconds;
                return { index: i, problem: sortedProblems[i], timeRemaining };
            }
            accumulated += problemDuration;
        }

        // All problems completed
        return { index: -1, problem: null, timeRemaining: 0 };
    }, [elapsedSeconds, sortedProblems, round?.timer_started_at, round?.timer_active]);

    // Global timer effect
    useEffect(() => {
        if (!round?.timer_active || !round?.timer_started_at) {
            setElapsedSeconds(0);
            return;
        }

        const calculateElapsed = async () => {
            const startTime = new Date(round.timer_started_at!).getTime();
            const now = Date.now();
            const elapsed = Math.floor((now - startTime) / 1000);
            setElapsedSeconds(elapsed);

            // NOTE: We do NOT auto-stop the timer in the database from the client side.
            // This prevents a user with a fast system clock from ending the round for everyone.
            // When elapsed >= totalDurationSeconds, the UI will simply show "Round Ended" locally.
        };

        calculateElapsed();
        const interval = setInterval(calculateElapsed, 1000);
        return () => clearInterval(interval);
    }, [round?.timer_active, round?.timer_started_at, totalDurationSeconds]);

    // Redirect if not logged in
    useEffect(() => {
        if (!teamLoading && !team) {
            navigate("/");
        }
    }, [teamLoading, team, navigate]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const totalTimeRemaining = Math.max(0, totalDurationSeconds - elapsedSeconds);
    const currentProblem = currentProblemData.problem;
    const currentIndex = currentProblemData.index;
    const problemTimeRemaining = currentProblemData.timeRemaining;

    // Use dynamic vjudge_url from round if available, otherwise fallback to contestId
    const vjudgeLink = currentProblem
        ? (round?.vjudge_url
            ? `${round.vjudge_url}#problem/${currentProblem.problem_code}`
            : (contestId
                ? `https://vjudge.net/contest/${contestId}#problem/${currentProblem.problem_code}`
                : ""))
        : "";

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-xl font-mono text-primary"
                >
                    INITIALIZING ROUND 2...
                </motion.div>
            </div>
        );
    }

    // Show locked message
    if (!round?.is_unlocked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-4">
                {backgroundImage && (
                    <div className="fixed inset-0 z-[0] pointer-events-none opacity-30">
                        <img src={backgroundImage} alt="Background" className="w-full h-full object-cover" />
                    </div>
                )}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 text-center p-8 bg-black/80 rounded-xl border border-red-500/30"
                >
                    <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Round 2 Locked</h1>
                    <p className="text-gray-400 mb-4">This round has not been unlocked by the administrator.</p>
                    <CodeverseButton variant="ghost" onClick={() => navigate("/welcome")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Return to Hub
                    </CodeverseButton>
                </motion.div>
            </div>
        );
    }

    // Show waiting message if timer not started
    if (!round?.timer_active) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-4">
                {backgroundImage && (
                    <div className="fixed inset-0 z-[0] pointer-events-none opacity-30">
                        <img src={backgroundImage} alt="Background" className="w-full h-full object-cover" />
                    </div>
                )}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 text-center p-8 bg-black/80 rounded-xl border border-yellow-500/30"
                >
                    <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-pulse" />
                    <h1 className="text-2xl font-bold text-white mb-2">Round 2 - Waiting</h1>
                    <p className="text-gray-400 mb-2">The round is unlocked but the timer has not started yet.</p>
                    <p className="text-yellow-400 text-sm">Please wait for the administrator to start the timer.</p>
                    <div className="mt-4">
                        <CodeverseButton variant="ghost" onClick={() => navigate("/welcome")}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Return to Hub
                        </CodeverseButton>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Time expired - hide the round
    if (currentIndex === -1 || totalTimeRemaining <= 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-4">
                {backgroundImage && (
                    <div className="fixed inset-0 z-[0] pointer-events-none opacity-30">
                        <img src={backgroundImage} alt="Background" className="w-full h-full object-cover" />
                    </div>
                )}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 text-center p-8 bg-black/80 rounded-xl border border-red-500/30"
                >
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Round 2 Ended</h1>
                    <p className="text-gray-400 mb-4">
                        The time for this round has expired. All {sortedProblems.length} problems have concluded.
                    </p>
                    <CodeverseButton variant="ghost" onClick={() => navigate("/welcome")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Return to Hub
                    </CodeverseButton>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 relative overflow-x-hidden">
            {/* Broadcast Banner */}
            <BroadcastBanner />

            {/* Background */}
            {backgroundImage && (
                <div className="fixed inset-0 z-[0] pointer-events-none">
                    <img src={backgroundImage} alt="Background" className="w-full h-full object-cover" />
                </div>
            )}

            <div className="relative z-10 max-w-4xl mx-auto">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <CodeverseButton
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/welcome")}
                        className="mb-4 text-primary hover:text-primary/80 hover:bg-primary/10"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Mission Hub
                    </CodeverseButton>

                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-primary font-mono tracking-widest bg-black/50 px-2 py-1 rounded">
                                    ROUND 2 - SEQUENTIAL
                                </span>
                                {round?.scoreboard_url && (
                                    <CodeverseButton
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
                                        onClick={() => window.open(round.scoreboard_url!, '_blank')}
                                    >
                                        <Trophy className="w-3 h-3 mr-2" />
                                        SCOREBOARD
                                    </CodeverseButton>
                                )}
                            </div>
                            <h1 className="font-display text-3xl md:text-4xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-2">
                                Failing Time Flow
                            </h1>
                        </div>

                        {/* Timers */}
                        <div className="flex gap-3">
                            {/* Problem Timer */}
                            <div className="text-right p-3 rounded-xl border border-orange-500/30 bg-black/60 backdrop-blur-md">
                                <p className="text-xs text-orange-400 font-mono flex items-center gap-1 justify-end mb-1">
                                    <Timer className="w-3 h-3" />
                                    PROBLEM
                                </p>
                                <p
                                    className={`text-2xl font-mono font-bold tabular-nums ${problemTimeRemaining < 30 ? "text-red-500 animate-pulse" : "text-orange-400"
                                        }`}
                                >
                                    {formatTime(problemTimeRemaining)}
                                </p>
                            </div>

                            {/* Total Timer */}
                            <div className="text-right p-3 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md">
                                <p className="text-xs text-gray-400 font-mono flex items-center gap-1 justify-end mb-1">
                                    <Clock className="w-3 h-3" />
                                    TOTAL
                                </p>
                                <p className="text-2xl font-mono font-bold tabular-nums text-white">
                                    {formatTime(totalTimeRemaining)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mt-4 flex items-center gap-2">
                        {sortedProblems.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-2 flex-1 rounded-full transition-all ${idx < currentIndex
                                    ? "bg-lime-500"
                                    : idx === currentIndex
                                        ? "bg-orange-500"
                                        : "bg-white/20"
                                    }`}
                            />
                        ))}
                    </div>
                    <p className="text-sm text-gray-400 mt-2 text-center">
                        Problem {currentIndex + 1} of {sortedProblems.length}
                    </p>
                </motion.header>

                {/* Warning Banner */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8 p-4 border border-orange-500/30 rounded-lg bg-black/60 backdrop-blur-md"
                >
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        <div className="text-sm font-mono text-gray-300">
                            <p className="text-orange-400 font-semibold mb-1">GLOBAL SYNCHRONIZED TIMER</p>
                            <p>
                                Problems advance automatically based on elapsed time. Current problem is shown to all
                                participants simultaneously. Focus is critical.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Current Problem */}
                <AnimatePresence mode="wait">
                    {currentProblem && (
                        <motion.div
                            key={currentProblem.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ProblemCard
                                problem={currentProblem}
                                contestId={contestId || ""}
                                index={currentIndex}
                                showHints={true}
                                roundStartTime={round?.timer_started_at}
                                vjudgeUrl={round?.vjudge_url || undefined}
                                forceExpanded={true}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Round2Page;
