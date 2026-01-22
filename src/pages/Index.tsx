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
    <div className="relative min-h-[100svh] w-full overflow-hidden flex items-center justify-center font-mono selection:bg-lime-500/30 bg-[#020604]">

      <BroadcastBanner />

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <CosmicBackground />
      </div>

      <div className="absolute inset-0 z-0 bg-black/40 pointer-events-none mix-blend-multiply" />
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(transparent_50%,rgba(163,230,53,0.1)_50%)] bg-[length:100%_4px]" />

      {/* Admin Gateway */}
      <div className="absolute top-6 sm:top-8 right-4 sm:right-8 z-50">
        <CodeverseButton
          variant="ghost"
          onClick={() => navigate("/admin")}
          className="group relative overflow-hidden bg-black/40 border-lime-500/30 text-lime-100 hover:text-white hover:border-lime-400 transition-all duration-300 px-4 sm:px-5 py-2 backdrop-blur-md shadow-[0_0_15px_rgba(163,230,53,0.15)]"
        >
          <div className="absolute inset-0 bg-lime-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <div className="flex items-center gap-2 relative z-10">
            <Shield className="w-4 h-4 text-lime-400 group-hover:text-lime-200 transition-colors" />
            <span className="text-[10px] sm:text-[11px] tracking-[0.15em] font-bold uppercase">
              Admin Gateway
            </span>
          </div>
        </CodeverseButton>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-[92vw] sm:max-w-[480px] px-4 sm:px-6">
        <div className="relative bg-black/60 backdrop-blur-xl rounded-xl border border-lime-500/20 shadow-2xl shadow-lime-900/20 overflow-hidden ring-1 ring-lime-500/30">

          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-lime-500 to-transparent opacity-80 shadow-[0_0_10px_rgba(163,230,53,0.8)]" />

          <div className="p-6 sm:p-10">

            {/* Header */}
            <div className="text-center mb-10 sm:mb-12 relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-28 h-28 bg-lime-500/15 blur-[50px]" />
              </div>

              <div className="flex items-center justify-center gap-2 mb-4 text-lime-400 text-[10px] sm:text-xs tracking-[0.25em] uppercase font-bold">
                <Cpu className="w-4 sm:w-5 h-4 sm:h-5" />
                System Access Terminal
              </div>

              <h1 className="
                text-[2.75rem] sm:text-5xl
                font-black
                tracking-tight
                leading-none
                text-white
                mb-2
                drop-shadow-lg
              ">
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-lime-300 to-lime-600 drop-shadow-[0_0_10px_rgba(163,230,53,0.3)]">
                  CODEVERSE
                </span>
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">

              <div className="space-y-3">
                <label className="ml-1 flex items-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-lime-300/80">
                  <Terminal className="w-3 h-3" />
                  Enter Team Identification
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lime-400 font-bold animate-pulse">
                    &gt;_
                  </span>

                  <CodeverseInput
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="TEAM_IDENTIFIER"
                    disabled={isSubmitting}
                    autoComplete="off"
                    className="
                      pl-10
                      h-12 sm:h-14
                      bg-black/50
                      border-white/10
                      focus:border-lime-500/80
                      focus:ring-1 focus:ring-lime-500/50
                      text-lime-100
                      placeholder:text-lime-700/50
                      font-mono
                      text-base sm:text-lg
                      tracking-wide sm:tracking-wider
                      transition-all
                      rounded-lg
                    "
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-950/40 border border-red-500/50 text-red-200 text-sm">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span>ACCESS ERROR: {error}</span>
                </div>
              )}

              <CodeverseButton
                type="submit"
                size="xl"
                disabled={!teamName.trim() || isSubmitting}
                className={`w-full h-12 sm:h-14 relative overflow-hidden group border-0 rounded-lg shadow-[0_0_20px_rgba(163,230,53,0.25)]
                  ${!teamName.trim()
                    ? "opacity-60 grayscale cursor-not-allowed"
                    : "hover:shadow-[0_0_35px_rgba(163,230,53,0.5)]"
                  }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-lime-600 via-lime-500 to-lime-600" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-40 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out" />

                <div className="relative z-10 flex items-center justify-center gap-3 text-black font-black tracking-[0.15em] text-xs sm:text-sm">
                  {isSubmitting ? (
                    "INITIALIZING UPLINK..."
                  ) : (
                    <>
                      INITIALIZE SESSION
                      <ChevronRight className="w-5 h-5 stroke-[3px]" />
                    </>
                  )}
                </div>
              </CodeverseButton>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <span className="text-[9px] sm:text-[10px] text-lime-500/60 tracking-widest uppercase">
                Secure Connection Established v2.4.1
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
