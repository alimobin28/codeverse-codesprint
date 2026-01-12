import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CosmicBackground } from "@/components/CosmicBackground";
import { CodeverseButton } from "@/components/ui/codeverse-button";
import { CodeverseInput } from "@/components/ui/codeverse-input";
import { useTeamSession } from "@/hooks/useTeamSession";
import { Terminal, Shield, ChevronRight, AlertCircle, Cpu } from "lucide-react";
import { BroadcastBanner } from "@/components/BroadcastBanner";

const Index = () => {
  const [teamName, setTeamName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // We get the team status, but we DO NOT auto-redirect anymore
  const { createTeam, error } = useTeamSession();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    setIsSubmitting(true);
    const result = await createTeam(teamName.trim());
    setIsSubmitting(false);

    if (result) navigate("/welcome");
  };

  return (
    // Main Container - Full Screen, font-mono for tech feel
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center font-mono selection:bg-lime-500/30 bg-[#020604]">

      {/* Broadcast Banner */}
      <BroadcastBanner />

      {/* 1. BACKGROUND LAYERS */}
      <div className="absolute inset-0 z-0">
        <CosmicBackground />
      </div>

      {/* Dark overlay to ensure neon pops */}
      <div className="absolute inset-0 z-0 bg-black/40 pointer-events-none mix-blend-multiply" />

      {/* Scanline Texture */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(transparent_50%,rgba(163,230,53,0.1)_50%)] bg-[length:100%_4px]" />

      {/* 2. ADMIN ACCESS (Top Right) */}
      <div className="absolute top-8 right-8 z-50">
        <CodeverseButton
          variant="ghost"
          onClick={() => navigate("/admin")}
          className="group relative overflow-hidden bg-black/40 border-lime-500/30 text-lime-100 hover:text-white hover:border-lime-400 transition-all duration-300 px-5 py-2 backdrop-blur-md shadow-[0_0_15px_rgba(163,230,53,0.15)]"
        >
          {/* Hover glow effect background */}
          <div className="absolute inset-0 bg-lime-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <div className="flex items-center gap-2 relative z-10">
            <Shield className="w-4 h-4 text-lime-400 group-hover:text-lime-200 transition-colors" />
            <span className="text-[11px] tracking-[0.15em] font-bold uppercase text-lime-200 group-hover:text-white">Admin Gateway</span>
          </div>
        </CodeverseButton>
      </div>

      {/* 3. MAIN GLASS INTERFACE CARD */}
      <div className="relative z-10 w-full max-w-[480px] px-6">

        {/* The Glass Container */}
        <div className="relative bg-black/60 backdrop-blur-xl rounded-xl border border-lime-500/20 shadow-2xl shadow-lime-900/20 overflow-hidden ring-1 ring-lime-500/30">

          {/* Top decorative glowing line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-lime-500 to-transparent opacity-80 shadow-[0_0_10px_rgba(163,230,53,0.8)]" />

          <div className="p-10">

            {/* Header Section */}
            <div className="text-center mb-12 relative">
              {/* Subtle background glow behind title */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-lime-500/15 blur-[50px] pointer-events-none" />

              <div className="flex items-center justify-center gap-2 mb-4 text-lime-400 drop-shadow-[0_0_5px_rgba(163,230,53,0.5)]">
                <Cpu className="w-5 h-5" />
                <span className="text-xs tracking-[0.25em] uppercase font-bold">
                  System Access Terminal
                </span>
              </div>

              <h1 className="text-5xl font-black tracking-tighter text-white mb-2 drop-shadow-lg">
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-lime-300 to-lime-600 drop-shadow-[0_0_10px_rgba(163,230,53,0.3)]">
                  CODEVERSE
                </span>
              </h1>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="space-y-8">

              <div className="space-y-3">
                <label className="text-[11px] uppercase tracking-widest font-bold text-lime-300/80 ml-1 flex items-center gap-2">
                  <Terminal className="w-3 h-3" />
                  Enter Team Identification
                </label>

                <div className="relative group">
                  <div className="relative flex items-center">
                    {/* Animated Prompt Character */}
                    <span className="absolute left-4 text-lime-400 font-bold animate-pulse shadow-lime-500/50 drop-shadow-sm">&gt;_</span>
                    <CodeverseInput
                      id="teamName"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="TEAM_IDENTIFIER"
                      disabled={isSubmitting}
                      autoComplete="off"
                      // Neon Input Styles
                      className="pl-10 bg-black/50 border-white/10 focus:border-lime-500/80 focus:ring-1 focus:ring-lime-500/50 text-lime-100 placeholder:text-lime-700/50 h-14 font-mono text-lg tracking-wider transition-all rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-950/40 border border-red-500/50 text-red-200 text-sm animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span>ACCESS ERROR: {error}</span>
                </div>
              )}

              <CodeverseButton
                type="submit"
                size="xl"
                // Button styles: Neon Green gradient, disabled state handling
                className={`w-full h-14 relative overflow-hidden group border-0 rounded-lg shadow-[0_0_20px_rgba(163,230,53,0.25)] ${!teamName.trim() ? "opacity-60 grayscale cursor-not-allowed" : "hover:shadow-[0_0_35px_rgba(163,230,53,0.5)]"
                  }`}
                disabled={!teamName.trim() || isSubmitting}
              >
                {/* Button Background Gradient - Lime/Neon mix */}
                <div className="absolute inset-0 bg-gradient-to-r from-lime-600 via-lime-500 to-lime-600 transition-all duration-300" />

                {/* Shine Animation Effect on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-40 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out" />

                <div className="relative z-10 flex items-center justify-center gap-3 text-black font-black tracking-[0.15em] text-sm">
                  {isSubmitting ? (
                    "INITIALIZING UPLINK..."
                  ) : (
                    <>
                      INITIALIZE SESSION <ChevronRight className="w-5 h-5 stroke-[3px]" />
                    </>
                  )}
                </div>
              </CodeverseButton>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <span className="text-[10px] text-lime-500/60 tracking-widest uppercase drop-shadow-[0_0_2px_rgba(163,230,53,0.3)]">Secure Connection Established v2.4.1</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;