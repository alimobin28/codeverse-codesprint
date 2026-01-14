import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CodeverseButton } from "@/components/ui/codeverse-button";
import { useTeamSession } from "@/hooks/useTeamSession";
import { useRounds } from "@/hooks/useRounds";
import { useProblems } from "@/hooks/useProblems";
import { ArrowLeft, Clock, Lightbulb, AlertTriangle, Lock, XCircle, Trophy } from "lucide-react";
import { ProblemCard } from "./ProblemCard";
import { BroadcastBanner } from "@/components/BroadcastBanner";

interface RoundTemplateProps {
  roundNumber: number;
  title: string;
  contestId?: string; // Now optional - prefer vjudge_url from database
  backgroundImage?: string;
  allowedProblems?: string[];
  warningMessage?: string;
  showHints?: boolean;
}

export const RoundTemplate = ({
  roundNumber,
  title,
  contestId,
  backgroundImage,
  allowedProblems,
  warningMessage,
  showHints = true,
}: RoundTemplateProps) => {
  const navigate = useNavigate();
  const { team, loading: teamLoading } = useTeamSession();
  const { getRound, loading: roundsLoading } = useRounds();
  const { problems, loading: problemsLoading } = useProblems(roundNumber);

  const round = getRound(roundNumber);
  const loading = teamLoading || roundsLoading || problemsLoading;

  // Use dynamic VJudge URL if available, otherwise fallback to constructing it from contestId
  const vjudgeUrl = round?.vjudge_url
    ? round.vjudge_url
    : `https://vjudge.net/contest/${contestId}`;

  // Calculate time remaining based on admin timer settings
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const durationSeconds = useMemo(() => {
    return (round?.duration_minutes || 60) * 60;
  }, [round?.duration_minutes]);

  useEffect(() => {
    if (!round?.timer_active || !round?.timer_started_at) {
      setTimeRemaining(durationSeconds);
      return;
    }

    const calculateRemaining = async () => {
      const startTime = new Date(round.timer_started_at!).getTime();
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, durationSeconds - elapsedSeconds);
      setTimeRemaining(remaining);

      // Auto-stop timer when time expires
      if (remaining <= 0 && round.timer_active) {
        try {
          const { supabase } = await import("@/integrations/supabase/client");
          await supabase
            .from("rounds")
            .update({ timer_active: false })
            .eq("round_number", roundNumber);
        } catch (err) {
          console.error("Failed to auto-stop timer:", err);
        }
      }
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);
    return () => clearInterval(interval);
  }, [round?.timer_active, round?.timer_started_at, durationSeconds, roundNumber]);

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

  const filteredProblems = allowedProblems
    ? problems.filter((p) => allowedProblems.includes(p.problem_code))
    : problems;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-xl font-mono text-primary"
        >
          INITIALIZING ROUND {roundNumber}...
        </motion.div>
      </div>
    );
  }

  // Show locked message if round is not unlocked
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
          <h1 className="text-2xl font-bold text-white mb-2">Round {roundNumber} Locked</h1>
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
          <h1 className="text-2xl font-bold text-white mb-2">Round {roundNumber} - Waiting</h1>
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

  // Show "Round Ended" when time expires
  if (timeRemaining <= 0 && round?.timer_active) {
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
          <h1 className="text-2xl font-bold text-white mb-2">Round {roundNumber} Ended</h1>
          <p className="text-gray-400 mb-4">
            The time for this round has expired. Thank you for participating!
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
                  ROUND {roundNumber}
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
                {title}
              </h1>
            </div>

            <div className="text-right p-4 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md shadow-xl">
              <p className="text-xs text-muted-foreground font-mono flex items-center gap-2 justify-end mb-1">
                <Clock className="w-3 h-3" />
                TIME REMAINING
              </p>
              <p
                className={`text-3xl font-mono font-bold tabular-nums ${timeRemaining < 300 ? "text-red-500 animate-pulse" : "text-white"
                  }`}
              >
                {formatTime(timeRemaining)}
              </p>
            </div>
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-4 border border-primary/20 rounded-lg bg-black/60 backdrop-blur-md"
        >
          <div className="flex items-start gap-3">
            {warningMessage ? (
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            ) : (
              <Lightbulb className="w-5 h-5 text-primary" />
            )}
            <div className="text-sm font-mono text-gray-300">
              <p className="text-primary font-semibold mb-1">SYSTEM MESSAGE</p>
              <p>
                {warningMessage ||
                  "Sequence integrity critical. Access challenges below. Hints are available if synchronization fails."}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-4">
          {filteredProblems.map((problem, index) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              contestId={contestId}
              vjudgeUrl={vjudgeUrl}
              index={index}
              showHints={showHints}
              roundStartTime={round?.timer_started_at}
            />
          ))}
        </div>
      </div>
    </div>
  );
};