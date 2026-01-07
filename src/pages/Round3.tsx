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
import { ArrowLeft, Clock, Skull, Eye, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const VJUDGE_CONTEST_ID = "779643";
const GLOBAL_ROUND_TIME = 55 * 60; // 55 minutes in seconds
const PROBLEM_TIMER_DURATION = 11 * 60; // 11 minutes per problem

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
  
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [globalTimeRemaining, setGlobalTimeRemaining] = useState<number | null>(null);
  const [problemStartTime, setProblemStartTime] = useState<number | null>(null);
  const [problemTimeRemaining, setProblemTimeRemaining] = useState<number | null>(null);
  const [visitedProblems, setVisitedProblems] = useState<Set<string>>(new Set());

  const round = getRound(3);
  const loading = teamLoading || roundsLoading || problemsLoading;
  const timerActive = round?.timer_active || false;
  const timerStartedAt = round?.timer_started_at;

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

  // Calculate global time remaining based on server start time
  useEffect(() => {
    if (!timerActive || !timerStartedAt) {
      setGlobalTimeRemaining(null);
      return;
    }

    const calculateRemaining = () => {
      const startTime = new Date(timerStartedAt).getTime();
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, GLOBAL_ROUND_TIME - elapsed);
      return remaining;
    };

    setGlobalTimeRemaining(calculateRemaining());

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setGlobalTimeRemaining(remaining);
      
      if (remaining <= 0) {
        toast.error("Time's up! The Core Logic Confrontation has ended.");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timerStartedAt]);

  // Per-problem timer when a problem is selected
  useEffect(() => {
    if (!selectedProblem || !timerActive) {
      setProblemTimeRemaining(null);
      setProblemStartTime(null);
      return;
    }

    const startTime = Date.now();
    setProblemStartTime(startTime);
    setProblemTimeRemaining(PROBLEM_TIMER_DURATION);

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, PROBLEM_TIMER_DURATION - elapsed);
      setProblemTimeRemaining(remaining);
      
      if (remaining <= 0) {
        toast.error(`Time's up for this problem!`);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedProblem, timerActive]);

  const openProblem = (problemId: string) => {
    if (selectedProblem) {
      // Track that we're leaving the current problem
      setVisitedProblems((prev) => new Set([...prev, selectedProblem]));
    }
    setSelectedProblem(problemId);
  };

  const closeProblem = () => {
    if (selectedProblem) {
      setVisitedProblems((prev) => new Set([...prev, selectedProblem]));
    }
    setSelectedProblem(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentProblem = filteredProblems.find((p) => p.id === selectedProblem);
  const globalTimeIsUp = globalTimeRemaining !== null && globalTimeRemaining <= 0;
  const problemTimeIsUp = problemTimeRemaining !== null && problemTimeRemaining <= 0;

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

  return (
    <div className="min-h-screen p-4 md:p-8">
      <CosmicBackground />
      
      <div className="relative z-10 max-w-6xl mx-auto">
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
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="text-sm text-muted-foreground font-mono">ROUND 3</span>
              <h1 className="font-display text-3xl font-bold text-glow-erevos flex items-center gap-3">
                <Skull className="w-8 h-8" />
                Core Logic Confrontation
              </h1>
            </div>
            
            {/* Global Timer */}
            <motion.div
              animate={
                timerActive && globalTimeRemaining !== null && globalTimeRemaining < 60
                  ? { scale: [1, 1.05, 1], borderColor: ["hsl(348,100%,50%)", "hsl(348,100%,70%)", "hsl(348,100%,50%)"] }
                  : {}
              }
              transition={{ duration: 0.5, repeat: timerActive && globalTimeRemaining !== null && globalTimeRemaining < 60 ? Infinity : 0 }}
              className={`p-4 rounded-lg border ${
                timerActive
                  ? globalTimeRemaining !== null && globalTimeRemaining < 60
                    ? "border-destructive bg-destructive/10 animate-pulse"
                    : "border-primary/50 bg-primary/5"
                  : "border-muted bg-muted/20"
              }`}
            >
              <p className="text-sm text-muted-foreground font-mono flex items-center gap-2">
                <Clock className="w-4 h-4" />
                GLOBAL TIMER
              </p>
              <p
                className={`text-4xl font-display font-bold ${
                  !timerActive
                    ? "text-muted-foreground"
                    : globalTimeRemaining !== null && globalTimeRemaining < 60
                    ? "text-destructive"
                    : "text-primary"
                }`}
              >
                {timerActive && globalTimeRemaining !== null
                  ? formatTime(globalTimeRemaining)
                  : "WAITING"}
              </p>
              {!timerActive && (
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting admin activation
                </p>
              )}
            </motion.div>
          </div>
        </motion.header>

        {/* Time Up Overlay */}
        {globalTimeIsUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
          >
            <CodeverseCard variant="elevated" className="max-w-md text-center">
              <CodeverseCardHeader>
                <CodeverseCardTitle className="text-destructive text-2xl">
                  TIME EXPIRED
                </CodeverseCardTitle>
              </CodeverseCardHeader>
              <CodeverseCardContent>
                <p className="text-muted-foreground font-mono mb-6">
                  The Core Logic Confrontation has ended. Erevos-901 has rendered its judgment.
                </p>
                <CodeverseButton onClick={() => navigate("/welcome")}>
                  RETURN TO HUB
                </CodeverseButton>
              </CodeverseCardContent>
            </CodeverseCard>
          </motion.div>
        )}

        {/* Problem Grid or Detail View */}
        {selectedProblem && currentProblem ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <CodeverseCard variant="active" size="lg">
              <CodeverseCardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50">
                      <span className="font-display font-bold text-2xl text-primary">
                        {currentProblem.problem_code}
                      </span>
                    </div>
                    <div>
                      <CodeverseCardTitle className="text-xl">
                        {currentProblem.title}
                      </CodeverseCardTitle>
                      <p className="text-sm text-muted-foreground font-mono">
                        Core Logic Challenge
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {problemTimeRemaining !== null && (
                      <motion.div
                        animate={problemTimeRemaining < 60 ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 0.5, repeat: problemTimeRemaining < 60 ? Infinity : 0 }}
                        className={`p-3 rounded-lg border ${
                          problemTimeRemaining < 60
                            ? "border-destructive bg-destructive/10"
                            : "border-primary/50 bg-primary/5"
                        }`}
                      >
                        <p className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          PROBLEM TIME
                        </p>
                        <p className={`text-xl font-display font-bold ${
                          problemTimeRemaining < 60 ? "text-destructive" : "text-primary"
                        }`}>
                          {formatTime(problemTimeRemaining)}
                        </p>
                      </motion.div>
                    )}
                    <CodeverseButton variant="ghost" size="icon" onClick={closeProblem}>
                      <X className="w-5 h-5" />
                    </CodeverseButton>
                  </div>
                </div>
              </CodeverseCardHeader>

              <CodeverseCardContent>
                <div className="space-y-6">
                  <div className="p-6 bg-muted/30 rounded-lg border border-primary/20 min-h-[200px]">
                    <h4 className="text-sm font-semibold text-primary mb-3">
                      PROBLEM STATEMENT
                    </h4>
                    <p className="font-mono text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {currentProblem.statement}
                    </p>
                  </div>

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
                  
                  <div className="text-center text-sm text-muted-foreground font-mono">
                    <p>[ No hints. No explanations. Core logic exposed. ]</p>
                  </div>
                </div>
              </CodeverseCardContent>
            </CodeverseCard>
          </motion.div>
        ) : (
          <>
            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 p-4 border border-primary/30 rounded-lg bg-primary/5"
            >
              <div className="flex items-start gap-3">
                <Skull className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm font-mono text-muted-foreground">
                  <p className="text-primary font-semibold mb-1">FINAL CONFRONTATION</p>
                  <p>All problems visible. No hints. One problem at a time. Once you leave, you cannot return if time expires.</p>
                </div>
              </div>
            </motion.div>

            {/* Problems Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProblems.map((problem, index) => {
                const wasVisited = visitedProblems.has(problem.id);
                
                return (
                  <motion.div
                    key={problem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <CodeverseCard
                      variant={wasVisited ? "default" : "elevated"}
                      className={`cursor-pointer h-full ${
                        !timerActive ? "opacity-60" : ""
                      }`}
                      onClick={() => timerActive && !globalTimeIsUp && openProblem(problem.id)}
                    >
                      <CodeverseCardHeader>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center font-display font-bold text-xl ${
                              wasVisited
                                ? "bg-muted text-muted-foreground"
                                : "bg-primary/20 text-primary border border-primary/30"
                            }`}
                          >
                            {problem.problem_code}
                          </div>
                          <div className="flex-1">
                            <CodeverseCardTitle className="text-base">
                              {problem.title}
                            </CodeverseCardTitle>
                            {wasVisited && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Eye className="w-3 h-3" /> Viewed
                              </span>
                            )}
                          </div>
                        </div>
                      </CodeverseCardHeader>
                      
                      {timerActive && !globalTimeIsUp && (
                        <CodeverseButton
                          variant={wasVisited ? "ghost" : "primary"}
                          size="sm"
                          className="w-full mt-2"
                        >
                          {wasVisited ? "REVISIT" : "OPEN"}
                        </CodeverseButton>
                      )}
                    </CodeverseCard>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* Erevos watching */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-primary/50 font-mono animate-pulse">
            [ Erevos-901 observes. The Great Compiler awaits your solution. ]
          </p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Round3;