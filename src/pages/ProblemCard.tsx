import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, ExternalLink, Lightbulb, Clock } from "lucide-react";
import {
  CodeverseCard,
  CodeverseCardContent,
} from "@/components/ui/codeverse-card";
import { supabase } from "@/integrations/supabase/client";

interface Hint {
  id: string;
  content: string;
  unlock_after_minutes: number;
  sort_order: number;
}

interface ProblemCardProps {
  problem: any;
  contestId: string;
  index: number;
  showHints?: boolean;
  roundStartTime?: string | null; // Timer start time for time-gated hints
  vjudgeUrl?: string | null;
  forceExpanded?: boolean;
}

export const ProblemCard = ({
  problem,
  contestId,
  index,
  showHints = true,
  roundStartTime,
  vjudgeUrl,
  forceExpanded = false
}: ProblemCardProps) => {
  const [isExpanded, setIsExpanded] = useState(forceExpanded);
  const [hints, setHints] = useState<Hint[]>([]);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  const vjudgeLink = vjudgeUrl
    ? `${vjudgeUrl}#problem/${problem.problem_code}`
    : `https://vjudge.net/contest/${contestId}#problem/${problem.problem_code}`;

  // Update expanded state if forceExpanded changes
  useEffect(() => {
    if (forceExpanded) {
      setIsExpanded(true);
    }
  }, [forceExpanded]);

  // Fetch hints for this problem
  useEffect(() => {
    const fetchHints = async () => {
      const { data, error } = await supabase
        .from("hints")
        .select("*")
        .eq("problem_id", problem.id)
        .order("sort_order", { ascending: true });

      if (!error && data) {
        setHints(data);
      }
    };

    if (showHints && problem.id) {
      fetchHints();
    }
  }, [problem.id, showHints]);

  // Timer logic for hint unlocking
  useEffect(() => {
    if (!roundStartTime) {
      setElapsedMinutes(0);
      return;
    }

    const calculateElapsed = () => {
      const start = new Date(roundStartTime).getTime();
      const now = Date.now();
      const minutes = Math.floor((now - start) / 1000 / 60);
      setElapsedMinutes(minutes);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [roundStartTime]);

  const availableHints = hints.filter(h => elapsedMinutes >= h.unlock_after_minutes);
  const lockedHints = hints.filter(h => elapsedMinutes < h.unlock_after_minutes);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <CodeverseCard className="overflow-hidden bg-black/80 border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-colors">
        {/* Header - Click to expand if not forced */}
        <div
          className={`p-4 flex items-center justify-between ${!forceExpanded ? "cursor-pointer" : ""}`}
          onClick={() => !forceExpanded && setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-lg ${isExpanded ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}`}>
              {problem.problem_code}
            </div>
            <div>
              <h3 className="font-display font-semibold text-white">{problem.title}</h3>
              <p className="text-sm text-muted-foreground font-mono">
                Problem {problem.problem_code}
              </p>
            </div>
          </div>

          <div className="text-muted-foreground">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="mt-2 pt-2 border-t border-white/10">
                <CodeverseCardContent className="p-0 space-y-4">
                  <div>
                    <div
                      className="problem-statement text-sm font-mono text-gray-300 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: problem.statement }}
                    />
                  </div>

                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 group hover:border-primary/40 transition-colors">
                    <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      VJUDGE LINK
                    </h4>
                    <a
                      href={vjudgeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-mono text-primary/80 hover:text-primary flex items-center gap-2 break-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {vjudgeLink}
                    </a>
                  </div>

                  {/* Hints Section */}
                  {showHints && (
                    <div className="space-y-3 pt-2">
                      {availableHints.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-yellow-500 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            HINTS ({availableHints.length})
                          </h4>
                          {availableHints.map((hint, idx) => (
                            <div
                              key={hint.id}
                              className="p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20"
                            >
                              <p className="text-sm font-mono text-gray-400">
                                <span className="text-yellow-500 font-bold">Hint {idx + 1}:</span> {hint.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {lockedHints.length > 0 && (
                        <div className="p-3 bg-gray-500/10 rounded-lg border border-gray-500/20">
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {lockedHints.length} more hint(s) will unlock later
                          </p>
                        </div>
                      )}

                      {/* Guidance Fallback */}
                      {availableHints.length === 0 && problem.guidance && (
                        <div className="p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                          <h4 className="text-sm font-semibold text-yellow-500 mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            GUIDANCE
                          </h4>
                          <p className="text-sm font-mono text-gray-400">
                            {problem.guidance}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CodeverseCardContent>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CodeverseCard>
    </motion.div>
  );
};