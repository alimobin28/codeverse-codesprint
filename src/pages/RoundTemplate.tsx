import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CodeverseButton } from "@/components/ui/codeverse-button";
import { useTeamSession } from "@/hooks/useTeamSession";
import { useRounds } from "@/hooks/useRounds";
import { useProblems } from "@/hooks/useProblems";
import { ArrowLeft, Clock, Lightbulb, AlertTriangle } from "lucide-react";
import { ProblemCard } from "./ProblemCard"; 

interface RoundTemplateProps {
  roundNumber: number;
  title: string;
  contestId: string;
  durationSeconds: number;
  backgroundImage?: string;
  allowedProblems?: string[]; 
  warningMessage?: string;
}

export const RoundTemplate = ({
  roundNumber,
  title,
  contestId,
  durationSeconds,
  backgroundImage,
  allowedProblems,
  warningMessage
}: RoundTemplateProps) => {
  const navigate = useNavigate();
  const { team, loading: teamLoading } = useTeamSession();
  const { getRound, loading: roundsLoading } = useRounds();
  const { problems, loading: problemsLoading } = useProblems(roundNumber);
  
  // --- AUTO-START TIMER ---
  const [timeRemaining, setTimeRemaining] = useState<number>(durationSeconds);

  useEffect(() => {
    // Timer starts automatically immediately
    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []); 
  // ------------------------

  const round = getRound(roundNumber);
  const loading = teamLoading || roundsLoading || problemsLoading;

  useEffect(() => {
    // 1. If not logged in, go to home
    if (!teamLoading && !team) {
        navigate("/");
    }

    // --- LOCK CHECK REMOVED ---
    // We removed the code that forces you to /welcome
    // You are now safe to view this page.
    
  }, [teamLoading, team, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const filteredProblems = allowedProblems 
    ? problems.filter(p => allowedProblems.includes(p.problem_code))
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

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-x-hidden">
      
      {/* --- FULL CLEAR BACKGROUND (No dark overlays) --- */}
      {backgroundImage && (
        <div className="fixed inset-0 z-[0] pointer-events-none">
            <img 
                src={backgroundImage} 
                alt="Background" 
                className="w-full h-full object-cover"
            />
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
              <span className="text-sm text-primary font-mono tracking-widest bg-black/50 px-2 py-1 rounded">ROUND {roundNumber}</span>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-2">
                {title}
              </h1>
            </div>
            
            <div className="text-right p-4 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md shadow-xl">
              <p className="text-xs text-muted-foreground font-mono flex items-center gap-2 justify-end mb-1">
                <Clock className="w-3 h-3" />
                TIME REMAINING
              </p>
              <p className={`text-3xl font-mono font-bold tabular-nums ${timeRemaining < 300 ? "text-red-500" : "text-white"}`}>
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
             {warningMessage ? <AlertTriangle className="w-5 h-5 text-yellow-500"/> : <Lightbulb className="w-5 h-5 text-primary"/>}
            <div className="text-sm font-mono text-gray-300">
              <p className="text-primary font-semibold mb-1">SYSTEM MESSAGE</p>
              <p>{warningMessage || "Sequence integrity critical. Access challenges below. Hints are available if synchronization fails."}</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-4">
          {filteredProblems.map((problem, index) => (
            <ProblemCard 
                key={problem.id} 
                problem={problem} 
                contestId={contestId} 
                index={index} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};