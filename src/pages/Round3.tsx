import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CosmicBackground } from "@/components/CosmicBackground";
import { CodeverseButton } from "@/components/ui/codeverse-button";
import {
  CodeverseCard,
  CodeverseCardHeader,
  CodeverseCardTitle,
  CodeverseCardContent,
} from "@/components/ui/codeverse-card";
import { useTeamSession } from "@/hooks/useTeamSession";
import { useRounds } from "@/hooks/useRounds";
import { useProblems } from "@/hooks/useProblems";
import { ArrowLeft, Clock, AlertTriangle, Lock, ExternalLink, Skull } from "lucide-react";
import { toast } from "sonner";

const VJUDGE_CONTEST_ID = "779643";
const PROBLEM_TIMER_DURATION = 11 * 60; // 11 minutes in seconds

const getVJudgeLink = (problemCode: string) => {
  return `https://vjudge.net/contest/${VJUDGE_CONTEST_ID}#problem/${problemCode}`;
};

const Round3 = () => {
  const navigate = useNavigate();
  const { team, loading: teamLoading } = useTeamSession();
  const { getRound, loading: roundsLoading } = useRounds();
  const { problems, loading: problemsLoading } = useProblems(3);
  
  // Filter to only show problems A-E
  const filteredProblems = problems.filter(p => ['A', 'B', 'C', 'D', 'E'].includes(p.problem_code)).slice(0, 5);
  
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [lockedProblems, setLockedProblems] = useState<Set<number>>(new Set());
  const [hasStarted, setHasStarted] = useState(false);

  const round = getRound(3);
  const loading = teamLoading || roundsLoading || problemsLoading;
  const currentProblem = filteredProblems[currentProblemIndex];

  useEffect(() => {
    if (!teamLoading && !team) {
      navigate("/");
    }
  }, [teamLoading, team, navigate]);

  useEffect(() => {
    if (!roundsLoading && round && !round.is_unlocked) {
      navigate("/welcome");
    }
  }, [roundsLoading, round, navigate]);

  // Initialize timer when problem changes
  useEffect(() => {
    if (hasStarted && currentProblem && !lockedProblems.has(currentProblemIndex)) {
      setTimeRemaining(PROBLEM_TIMER_DURATION);
    }
  }, [currentProblemIndex, currentProblem, hasStarted, lockedProblems]);

  // Timer countdown
  useEffect(() => {
    if (!hasStarted || timeRemaining === null || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasStarted, timeRemaining]);

  const handleTimeUp = useCallback(() => {
    toast.error(`Time's up for Problem ${currentProblem?.problem_code}!`);
    
    // Lock current problem
    setLockedProblems((prev) => new Set([...prev, currentProblemIndex]));
    
    // Auto-advance to next problem
    if (currentProblemIndex < filteredProblems.length - 1) {
      setCurrentProblemIndex((prev) => prev + 1);
    } else {
      toast.info("Round 3 complete - all problems attempted");
    }
  }, [currentProblemIndex, currentProblem, filteredProblems.length]);

  const startRound = () => {
    setHasStarted(true);
    toast.success("Round 3 started - timer is now active!");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CosmicBackground />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-xl font-mono text-primary"
        >
          ACCESSING CORE LOGIC...
        </motion.div>
      </div>
    );
  }

  const isLocked = lockedProblems.has(currentProblemIndex);
  const allComplete = lockedProblems.size === filteredProblems.length;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <CosmicBackground />
      
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
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Mission Hub
          </CodeverseButton>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground font-mono">ROUND 3</span>
              <h1 className="font-display text-3xl font-bold text-glow-erevos flex items-center gap-3">
                <Skull className="w-8 h-8" />
                Core Logic Confrontation
              </h1>
            </div>
            {hasStarted && timeRemaining !== null && !allComplete && (
              <motion.div
                animate={timeRemaining < 30 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: timeRemaining < 30 ? Infinity : 0 }}
                className={`text-right p-4 rounded-lg border ${
                  timeRemaining < 30
                    ? "border-destructive bg-destructive/10"
                    : "border-primary/50 bg-primary/5"
                }`}
              >
                <p className="text-sm text-muted-foreground font-mono flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  TIME REMAINING
                </p>
                <p
                  className={`text-4xl font-display font-bold ${
                    timeRemaining < 30 ? "text-destructive" : "text-primary"
                  }`}
                >
                  {formatTime(timeRemaining)}
                </p>
              </motion.div>
            )}
          </div>
        </motion.header>

        {/* Warning Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-4 border border-destructive/50 rounded-lg bg-destructive/5"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm font-mono text-muted-foreground">
              <p className="text-destructive font-semibold mb-1">NO HINTS • NO RETURN</p>
              <p>Each problem has its own timer. Once time expires, you cannot return. There is no going back.</p>
            </div>
          </div>
        </motion.div>

        {/* Start Button or Problem Display */}
        {!hasStarted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <CodeverseCard variant="elevated" className="max-w-md mx-auto">
              <CodeverseCardHeader>
                <CodeverseCardTitle className="text-primary">
                  Ready to Begin?
                </CodeverseCardTitle>
              </CodeverseCardHeader>
              <CodeverseCardContent>
                <p className="text-muted-foreground font-mono mb-6">
                  Once started, the timer cannot be paused. Ensure you're ready for all {filteredProblems.length} problems. Each problem has 11 minutes.
                </p>
                <CodeverseButton size="lg" onClick={startRound}>
                  START ROUND 3
                </CodeverseButton>
              </CodeverseCardContent>
            </CodeverseCard>
          </motion.div>
        ) : allComplete ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <CodeverseCard variant="elevated" className="max-w-md mx-auto">
              <CodeverseCardHeader>
                <CodeverseCardTitle className="text-primary">
                  Round 3 Complete
                </CodeverseCardTitle>
              </CodeverseCardHeader>
              <CodeverseCardContent>
                <p className="text-muted-foreground font-mono mb-6">
                  You have completed the Core Logic Confrontation. All problems have been attempted.
                </p>
                <CodeverseButton onClick={() => navigate("/welcome")}>
                  RETURN TO HUB
                </CodeverseButton>
              </CodeverseCardContent>
            </CodeverseCard>
          </motion.div>
        ) : (
          <motion.div
            key={currentProblemIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <CodeverseCard variant="elevated" size="lg">
              <CodeverseCardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <span className="font-display font-bold text-xl text-primary">
                        {currentProblem?.problem_code}
                      </span>
                    </div>
                    <div>
                      <CodeverseCardTitle>{currentProblem?.title}</CodeverseCardTitle>
                      <p className="text-sm text-muted-foreground font-mono">
                        Problem {currentProblemIndex + 1} of {filteredProblems.length}
                      </p>
                    </div>
                  </div>
                  {isLocked && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Lock className="w-5 h-5" />
                      <span className="font-mono text-sm">LOCKED</span>
                    </div>
                  )}
                </div>
              </CodeverseCardHeader>

              <CodeverseCardContent>
                <div className="space-y-6">
                  <div className="p-6 bg-muted/30 rounded-lg border border-border">
                    <h4 className="text-sm font-semibold text-primary mb-3">
                      PROBLEM STATEMENT
                    </h4>
                    <p className="font-mono text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {currentProblem?.statement}
                    </p>
                  </div>

                  {currentProblem && (
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        VJUDGE LINK
                      </h4>
                      <a
                        href={getVJudgeLink(currentProblem.problem_code)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-mono text-primary hover:underline flex items-center gap-2"
                      >
                        {getVJudgeLink(currentProblem.problem_code)}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </CodeverseCardContent>
            </CodeverseCard>
          </motion.div>
        )}

        {/* Progress Indicator */}
        {hasStarted && !allComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex justify-center gap-2"
          >
            {filteredProblems.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentProblemIndex
                    ? "bg-primary scale-125"
                    : lockedProblems.has(index)
                    ? "bg-muted-foreground"
                    : "bg-muted"
                }`}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Round3;
