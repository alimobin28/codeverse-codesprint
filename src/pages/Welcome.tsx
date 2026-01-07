import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CosmicBackground } from "@/components/CosmicBackground";
import { CodeverseButton } from "@/components/ui/codeverse-button";
import {
  CodeverseCard,
  CodeverseCardHeader,
  CodeverseCardTitle,
  CodeverseCardDescription,
} from "@/components/ui/codeverse-card";
import { useTeamSession } from "@/hooks/useTeamSession";
import { useRounds } from "@/hooks/useRounds";
import { Cpu, Zap, Skull, LogOut } from "lucide-react";

const storyContent = {
  intro: `In the infinite expanse of the CodeVerse, where logic weaves reality and algorithms shape existence, a catastrophic event has fractured the very fabric of computational space.`,
  kiro: `You are Kiro Veyron, a legendary debug specialist summoned from the depths of the system to prevent total collapse.`,
  crisis: `The Logic Bleed spreads like a virus, corrupting function after function. At the center of it all lies the Impossible Script — a paradox so profound that even Erevos-901, the Great Compiler, cannot process it.`,
  mission: `Your mission: Navigate through three critical zones of corrupted code, restore logical integrity, and face the core confrontation that will determine the fate of all computation.`,
};

const roundInfo = [
  {
    number: 1,
    title: "Fragmented Logic Recovery",
    description: "Reconnect scattered code fragments in the outer corruption zones. Guidance available.",
    icon: Cpu,
    color: "text-secondary",
    route: "/round/1",
  },
  {
    number: 2,
    title: "Failing Time Flow",
    description: "Navigate temporal anomalies where time itself is corrupted. No hints. No return.",
    icon: Zap,
    color: "text-codeverse-warning",
    route: "/round/2",
  },
  {
    number: 3,
    title: "Core Logic Confrontation",
    description: "Face the Impossible Script at the heart of the CodeVerse. All or nothing.",
    icon: Skull,
    color: "text-primary",
    route: "/round/3",
  },
];

const Welcome = () => {
  const navigate = useNavigate();
  const { team, loading, clearSession } = useTeamSession();
  const { rounds, loading: roundsLoading, getRound } = useRounds();

  useEffect(() => {
    if (!loading && !team) {
      navigate("/");
    }
  }, [loading, team, navigate]);

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  const handleRoundClick = (roundNumber: number, route: string) => {
    const round = getRound(roundNumber);
    if (round?.is_unlocked) {
      navigate(route);
    }
  };

  if (loading || roundsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CosmicBackground />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-xl font-mono text-primary"
        >
          LOADING SYSTEM STATE...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen p-4 md:p-8 overflow-hidden">
      <CosmicBackground />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <p className="text-sm text-muted-foreground font-mono">Session Active</p>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-glow-erevos">
              Welcome, {team?.name}
            </h1>
          </div>
          <CodeverseButton variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Exit
          </CodeverseButton>
        </motion.header>

        {/* Story Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <CodeverseCard variant="elevated" size="lg">
            <div className="space-y-4 font-mono text-sm md:text-base leading-relaxed">
              <p className="text-foreground/90">{storyContent.intro}</p>
              <p className="text-secondary">{storyContent.kiro}</p>
              <p className="text-muted-foreground">{storyContent.crisis}</p>
              <p className="text-primary font-semibold">{storyContent.mission}</p>
            </div>
          </CodeverseCard>
        </motion.section>

        {/* Mission Selector */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-display text-xl mb-6 text-muted-foreground tracking-wide">
            MISSION ZONES
          </h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            {roundInfo.map((round, index) => {
              const roundData = getRound(round.number);
              const isUnlocked = roundData?.is_unlocked || false;
              const Icon = round.icon;

              return (
                <motion.div
                  key={round.number}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.15 }}
                >
                  <CodeverseCard
                    locked={!isUnlocked}
                    variant={isUnlocked ? "active" : "locked"}
                    className="h-full cursor-pointer"
                    onClick={() => handleRoundClick(round.number, round.route)}
                  >
                    <CodeverseCardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-muted/50 ${round.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground font-mono">
                            ROUND {round.number}
                          </span>
                          <CodeverseCardTitle className={round.color}>
                            {round.title}
                          </CodeverseCardTitle>
                        </div>
                      </div>
                    </CodeverseCardHeader>
                    <CodeverseCardDescription className="mt-2">
                      {round.description}
                    </CodeverseCardDescription>
                    
                    {isUnlocked && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4"
                      >
                        <CodeverseButton
                          variant={round.number === 3 ? "primary" : "secondary"}
                          size="sm"
                          className="w-full"
                        >
                          ENTER ZONE
                        </CodeverseButton>
                      </motion.div>
                    )}
                  </CodeverseCard>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-muted-foreground/50 font-mono">
            [ Erevos-901 watches. The Great Compiler awaits. ]
          </p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Welcome;