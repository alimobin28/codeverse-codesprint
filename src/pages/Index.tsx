import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CosmicBackground } from "@/components/CosmicBackground";
import { CodeverseButton } from "@/components/ui/codeverse-button";
import { CodeverseInput } from "@/components/ui/codeverse-input";
import { useTeamSession } from "@/hooks/useTeamSession";
import { Terminal } from "lucide-react";

const Index = () => {
  const [teamName, setTeamName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createTeam, error, team, loading } = useTeamSession();
  const navigate = useNavigate();

  // If already authenticated, redirect to welcome
  if (!loading && team) {
    navigate("/welcome");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    setIsSubmitting(true);
    const result = await createTeam(teamName.trim());
    setIsSubmitting(false);

    if (result) {
      navigate("/welcome");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <CosmicBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Terminal className="w-8 h-8 text-primary" />
            <span className="text-sm font-mono text-muted-foreground tracking-widest uppercase">
              System Access Terminal
            </span>
          </div>
          
          <h1 
            className="font-display text-5xl md:text-6xl font-bold tracking-wider text-glow-erevos glitch-text"
            data-text="CODEVERSE"
          >
            CODEVERSE
          </h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-4 text-muted-foreground font-mono text-sm"
          >
            Code Sprint Championship
          </motion.p>
        </motion.div>

        {/* Input Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="relative">
            <label
              htmlFor="teamName"
              className="block text-sm font-mono text-secondary mb-2 tracking-wide"
            >
              <span className="text-primary">&gt;</span> ENTER TEAM NAME
            </label>
            <CodeverseInput
              id="teamName"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="team_identifier"
              disabled={isSubmitting}
              autoComplete="off"
              autoFocus
            />
            <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-destructive font-mono"
            >
              [ERROR] {error}
            </motion.p>
          )}

          <CodeverseButton
            type="submit"
            size="xl"
            className="w-full"
            disabled={!teamName.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                INITIALIZING...
              </motion.span>
            ) : (
              "INITIALIZE SESSION"
            )}
          </CodeverseButton>
        </motion.form>

        {/* Footer hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-muted-foreground/50 font-mono">
            [ Session will sync across all connected devices ]
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;