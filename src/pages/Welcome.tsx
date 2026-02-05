import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CosmicBackground } from "@/components/CosmicBackground";
import { CodeverseButton } from "@/components/ui/codeverse-button";
import { CodeverseCard } from "@/components/ui/codeverse-card";
import { useTeamSession } from "@/hooks/useTeamSession";
import { useRounds } from "@/hooks/useRounds";
import { Cpu, Zap, Skull, LogOut } from "lucide-react";
import { BroadcastBanner } from "@/components/BroadcastBanner";

/* ===== STORY CONTENT ===== */
const storyContent = {
  universe: {
    title: "The Universe",
    text: `CodeVerse is a universe where reality operates on logic and execution rules.
At its core lies Erevos-901, the central compiler that keeps all systems stable.`,
  },
  attack: {
    title: "Attack on CodeVerse",
    text: `A critical Glitch has triggered a Logic Bleed across the system.
Rules are breaking, time is unstable, and corrupted logic is spreading.`,
  },
  team: {
    title: "The Team",
    text: `You and your team play as Kiro, elite coders and debuggers of CodeVerse.
Each member contributes logic, speed, and precision to restore stability.`,
  },
  mission: {
    title: "The Mission",
    text: `Execute the Impossible Script across three missions to save CodeVerse.
Each stage removes support and increases consequences.`,
  },
};

/* ===== ROUNDS ===== */
const roundInfo = [
  {
    number: 1,
    title: "Fragment Logic Recovery",
    description: "Reconnect scattered parts of the universe freely.",
    icon: Cpu,
    route: "/round/1",
  },
  {
    number: 2,
    title: "Failing Time Flow",
    description: "Tasks appear briefly. Miss them and they are lost forever.",
    icon: Zap,
    route: "/round/2",
  },
  {
    number: 3,
    title: "Core Logic Confrontation",
    description: "Final execution. Accuracy matters more than speed.",
    icon: Skull,
    route: "/round/3",
  },
] as const;

/* ===== ICON STYLES (NO RED) ===== */
const zoneTheme = {
  1: { icon: "bg-lime-500/15 text-lime-200 ring-lime-500/30" },
  2: { icon: "bg-lime-500/15 text-lime-200 ring-lime-500/30" },
  3: { icon: "bg-lime-500/15 text-lime-200 ring-lime-500/30" },
} as const;

/* ===== BRAND (FORCE NEON GREEN) ===== */
const brand = {
  pill: "border-lime-400/30 bg-lime-500/10 text-lime-100",
  pillDot: "bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.6)]",
  heading: "text-lime-200 drop-shadow-[0_0_5px_rgba(163,230,53,0.4)]",

  // UPDATED: SOLID NEON GREEN BUTTON
  // Uses !important to force override the red background
  button: `
    !bg-lime-400 
    !text-black 
    !border-lime-400
    font-bold 
    tracking-wide
    shadow-[0_0_15px_rgba(163,230,53,0.5)] 
    hover:!bg-lime-300 
    hover:shadow-[0_0_25px_rgba(163,230,53,0.8)] 
    hover:scale-[1.02]
    transition-all duration-200
  `,
};

const Welcome = () => {
  const navigate = useNavigate();
  const { team, loading, clearSession } = useTeamSession();
  const { loading: roundsLoading, getRound } = useRounds();

  useEffect(() => {
    if (!loading && !team) navigate("/", { replace: true });
  }, [loading, team, navigate]);

  const handleLogout = () => {
    clearSession();
    navigate("/", { replace: true });
  };

  const handleRoundClick = (roundNumber: number, route: string) => {
    if (getRound(roundNumber)?.is_unlocked) navigate(route);
  };

  if (loading || roundsLoading) {
    return (
      <div className="relative min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-lime-200 font-semibold drop-shadow-[0_0_10px_rgba(163,230,53,0.5)]"
        >
          Loading dashboard…
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Broadcast Banner */}
      <BroadcastBanner />

      <CosmicBackground />

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/main_screen.webp')" }}
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
      <div className="absolute inset-0 [background:radial-gradient(55%_40%_at_50%_0%,rgba(163,230,53,0.12),transparent_60%)]" />

      {/* HEADER */}
      <header className="relative z-20 border-b border-white/10 bg-slate-950/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${brand.pill}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${brand.pillDot}`} />
              SESSION ACTIVE
            </span>
            <h1 className="text-lg font-semibold">
              Welcome, <span className={brand.heading}>{team?.name}</span>
            </h1>
          </div>

          <div className="flex gap-3">
            <CodeverseButton variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Exit
            </CodeverseButton>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10">

        {/* SYSTEM BRIEFING */}
        <CodeverseCard
          className="
            mb-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md
            transition hover:border-lime-400/40
            hover:shadow-[0_0_20px_-5px_rgba(163,230,53,0.3)]
          "
        >
          <div className="px-6 py-6 space-y-6 text-sm text-white/70">
            {Object.values(storyContent).map((section) => (
              <div key={section.title}>
                <h3 className="mb-1 text-xs font-semibold tracking-widest uppercase text-lime-200 drop-shadow-[0_0_5px_rgba(163,230,53,0.4)]">
                  {section.title}
                </h3>
                <p>{section.text}</p>
              </div>
            ))}
          </div>
        </CodeverseCard>

        {/* MISSION ZONES */}
        <div className="grid gap-6 md:grid-cols-3">
          {roundInfo.map((round) => {
            const unlocked = getRound(round.number)?.is_unlocked;
            const Icon = round.icon;

            return (
              <CodeverseCard
                key={round.number}
                className={`
                  rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition
                  ${unlocked
                    ? "hover:border-lime-400/50 hover:shadow-[0_0_30px_-10px_rgba(163,230,53,0.3)]"
                    : "opacity-60"
                  }
                `}
              >
                <div className="px-6 py-6">
                  <div className="flex items-center gap-4">
                    <div className={`h-11 w-11 rounded-full ring-1 grid place-items-center ${zoneTheme[round.number].icon}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs uppercase text-white/50">
                        Round {round.number}
                      </div>
                      <div className="font-semibold text-lime-200 drop-shadow-[0_0_5px_rgba(163,230,53,0.3)]">
                        {round.title}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-white/65">
                    {round.description}
                  </p>

                  {/* ENTER ZONE — FIXED NEON BUTTON */}
                  <CodeverseButton
                    variant="ghost"
                    size="sm"
                    disabled={!unlocked}
                    onClick={() => handleRoundClick(round.number, round.route)}
                    className={`mt-6 w-full ${brand.button}`}
                  >
                    {unlocked ? "ENTER ZONE" : "LOCKED"}
                  </CodeverseButton>
                </div>
              </CodeverseCard>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-white/40">
          System status nominal. Audit logging enabled.
        </p>
      </main>
    </div>
  );
};

export default Welcome;