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
import { ArrowLeft, CheckCircle, Circle, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";

const Round1 = () => {
  const navigate = useNavigate();
  const { team, loading: teamLoading } = useTeamSession();
  const { getRound, loading: roundsLoading } = useRounds();
  const { problems, loading: problemsLoading } = useProblems(1);
  const [expandedProblem, setExpandedProblem] = useState<string | null>(null);
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());

  const round = getRound(1);
  const loading = teamLoading || roundsLoading || problemsLoading;

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

  const markSolved = (problemId: string) => {
    const newSolved = new Set(solvedProblems);
    if (newSolved.has(problemId)) {
      newSolved.delete(problemId);
    } else {
      newSolved.add(problemId);
    }
    setSolvedProblems(newSolved);
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
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground font-mono">ROUND 1</span>
              <h1 className="font-display text-3xl font-bold text-glow-cyan">
                Fragmented Logic Recovery
              </h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-mono">Progress</p>
              <p className="text-2xl font-display font-bold text-secondary">
                {solvedProblems.size}/{problems.length}
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
          {problems.map((problem, index) => {
            const isSolved = solvedProblems.has(problem.id);
            const isExpanded = expandedProblem === problem.id;

            return (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <CodeverseCard
                  variant={isSolved ? "cyan" : "default"}
                  className="cursor-pointer"
                  onClick={() => toggleProblem(problem.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-lg ${
                          isSolved
                            ? "bg-secondary/20 text-secondary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
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
                      {isSolved ? (
                        <CheckCircle className="w-5 h-5 text-secondary" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
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
                            <p className="text-sm font-mono text-foreground/90 leading-relaxed">
                              {problem.statement}
                            </p>
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

                          <div className="flex justify-end">
                            <CodeverseButton
                              variant={isSolved ? "ghost" : "secondary"}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markSolved(problem.id);
                              }}
                            >
                              {isSolved ? "Mark Unsolved" : "Mark as Solved"}
                            </CodeverseButton>
                          </div>
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