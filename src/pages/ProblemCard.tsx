import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, ExternalLink, Lightbulb } from "lucide-react";
import {
  CodeverseCard,
  CodeverseCardContent,
} from "@/components/ui/codeverse-card";

interface ProblemCardProps {
  problem: any;
  contestId: string;
  index: number;
}

export const ProblemCard = ({ problem, contestId, index }: ProblemCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const vjudgeLink = `https://vjudge.net/contest/${contestId}#problem/${problem.problem_code}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
    >
      <CodeverseCard
        variant="default"
        className={`cursor-pointer transition-all duration-300 ${
          isExpanded ? "bg-black/80 border-primary/50" : "bg-black/60 border-white/10"
        } backdrop-blur-xl`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-lg ${
              isExpanded ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
            }`}>
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
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6 pt-6 border-t border-white/10">
                <CodeverseCardContent className="p-0 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-primary mb-2">
                      PROBLEM STATEMENT
                    </h4>
                    <p className="text-sm font-mono text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {problem.statement}
                    </p>
                  </div>

                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 group hover:border-primary/40 transition-colors">
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

                  {problem.guidance && (
                    <div className="p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                      <h4 className="text-sm font-semibold text-yellow-500 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        GUIDANCE
                      </h4>
                      <p className="text-sm font-mono text-gray-400">
                        {problem.guidance}
                      </p>
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