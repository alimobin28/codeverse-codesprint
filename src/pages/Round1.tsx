import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CosmicBackground } from "@/components/CosmicBackground";
import { CodeverseButton } from "@/components/ui/codeverse-button";
import {
  CodeverseCard,
  CodeverseCardHeader,
  CodeverseCardTitle,
  CodeverseCardDescription,
  CodeverseCardContent,
} from "@/components/ui/codeverse-card";
import { useTeamSession } from "@/hooks/useTeamSession";
import { useRounds } from "@/hooks/useRounds";
import { useProblems } from "@/hooks/useProblems";
import { ArrowLeft, Lightbulb, ChevronDown, ChevronUp, ExternalLink, Clock } from "lucide-react";

const VJUDGE_CONTEST_ID = "779643";
const ROUND_DURATION = 55 * 60; // 55 minutes in seconds

const getVJudgeLink = (problemCode: string) => {
  return `https://vjudge.net/contest/${VJUDGE_CONTEST_ID}#problem/${problemCode}`;
};

const Round1 = () => {
  const navigate = useNavigate();
  const { team, loading: teamLoading } = useTeamSession();
  const { getRound, loading: roundsLoading } = useRounds();
  const { problems, loading: problemsLoading } = useProblems(1);
  const [expandedProblem, setExpandedProblem] = useState<string | null>(null);
  const [roundStartTime] = useState<number>(Date.now());
  const [timeRemaining, setTimeRemaining] = useState<number>(ROUND_DURATION);

  // Filter to only show problems A-E
  const filteredProblems = problems.filter(p => ['A', 'B', 'C', 'D', 'E'].includes(p.problem_code)).slice(0, 5);
  
  const round = getRound(1);
  const loading = teamLoading || roundsLoading || problemsLoading;

  // Round timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - roundStartTime) / 1000);
      const remaining = Math.max(0, ROUND_DURATION - elapsed);
      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [roundStartTime]);

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

  const toggleProblem = (problemId: string) => {
    setExpandedProblem(expandedProblem === problemId ? null : problemId);
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
          className="text-xl font-mono text-secondary"
        >
          LOADING FRAGMENTED DATA...
        </motion.div>
      </div>
    );
  }

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
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="text-sm text-muted-foreground font-mono">ROUND 1</span>
              <h1 className="font-display text-3xl font-bold text-glow-cyan">
                Fragmented Logic Recovery
              </h1>
            </div>
            <div className="text-right p-4 rounded-lg border border-secondary/50 bg-secondary/5">
              <p className="text-sm text-muted-foreground font-mono flex items-center gap-2">
                <Clock className="w-4 h-4" />
                TIME REMAINING
              </p>
              <p className="text-2xl font-display font-bold text-secondary">
                {formatTime(timeRemaining)}
              </p>
            </div>
          </div>
        </motion.header>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-4 border border-secondary/30 rounded-lg bg-secondary/5"
        >
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
            <div className="text-sm font-mono text-muted-foreground">
              <p className="text-secondary font-semibold mb-1">GUIDANCE ENABLED</p>
              <p>Solve problems in any order. Click to expand problem statements. Hints are available for each challenge.</p>
            </div>
          </div>
        </motion.div>

        {/* Problems List */}
        <div className="space-y-4">
          {filteredProblems.map((problem, index) => {
            const isExpanded = expandedProblem === problem.id;
            const vjudgeLink = getVJudgeLink(problem.problem_code);

            return (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <CodeverseCard
                  variant="default"
                  className="cursor-pointer"
                  onClick={() => toggleProblem(problem.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-lg bg-secondary/20 text-secondary">
                        {problem.problem_code}
                      </div>
                      <div>
                        <h3 className="font-display font-semibold">{problem.title}</h3>
                        <p className="text-sm text-muted-foreground font-mono">
                          Problem {problem.problem_code}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-border"
                    >
                      <CodeverseCardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-secondary mb-2">
                              PROBLEM STATEMENT
                            </h4>
                            <p className="text-sm font-mono text-foreground/90 leading-relaxed whitespace-pre-wrap">
                              {problem.statement}
                            </p>
                          </div>

                          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                            <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                              <ExternalLink className="w-4 h-4" />
                              VJUDGE LINK
                            </h4>
                            <a
                              href={vjudgeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-mono text-primary hover:underline flex items-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {vjudgeLink}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          {problem.guidance && (
                            <div className="p-4 bg-muted/30 rounded-lg border border-secondary/20">
                              <h4 className="text-sm font-semibold text-secondary mb-2 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                GUIDANCE
                              </h4>
                              <p className="text-sm font-mono text-muted-foreground">
                                {problem.guidance}
                              </p>
                            </div>
                          )}
                        </div>
                      </CodeverseCardContent>
                    </motion.div>
                  )}
                </CodeverseCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Round1;