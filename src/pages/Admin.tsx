import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CosmicBackground } from "@/components/CosmicBackground";
import { CodeverseButton } from "@/components/ui/codeverse-button";
import { CodeverseInput } from "@/components/ui/codeverse-input";
import {
  CodeverseCard,
  CodeverseCardHeader,
  CodeverseCardTitle,
} from "@/components/ui/codeverse-card";
import { useRounds } from "@/hooks/useRounds";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Lock, Unlock, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const navigate = useNavigate();
  const { rounds, unlockRound, refetch } = useRounds();

  useEffect(() => {
    const fetchAdminPassword = async () => {
      const { data } = await supabase
        .from("admin_settings")
        .select("setting_value")
        .eq("setting_key", "admin_password")
        .single();
      
      if (data) {
        setAdminPassword(data.setting_value || "");
      }
    };
    
    fetchAdminPassword();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword) {
      setIsAuthenticated(true);
      toast.success("Admin access granted");
    } else {
      toast.error("Invalid password");
    }
  };

  const handleUnlockToggle = async (roundNumber: number, currentState: boolean) => {
    const success = await unlockRound(roundNumber, !currentState);
    if (success) {
      toast.success(`Round ${roundNumber} ${!currentState ? "unlocked" : "locked"}`);
    } else {
      toast.error("Failed to update round status");
    }
  };

  const getRound = (num: number) => rounds.find((r) => r.round_number === num);

  // Neon Green Glow Helpers
  const neonText = "text-lime-400 drop-shadow-[0_0_5px_rgba(163,230,53,0.8)]";
  const neonBorder = "border-lime-500/50 shadow-[0_0_15px_rgba(163,230,53,0.15)]";

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <CosmicBackground />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md"
        >
          <CodeverseCard variant="elevated" className={`bg-black/80 backdrop-blur-xl ${neonBorder}`}>
            <CodeverseCardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-lime-400 drop-shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
                <CodeverseCardTitle className="text-lime-100">Admin Access</CodeverseCardTitle>
              </div>
            </CodeverseCardHeader>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <CodeverseInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
                className="border-lime-500/30 focus:border-lime-400 focus:ring-lime-500/20"
              />
              {/* UPDATED AUTHENTICATE BUTTON */}
              <CodeverseButton 
                type="submit" 
                className="
                  w-full 
                  !bg-[#7BC62D] 
                  !text-black 
                  font-bold 
                  hover:!bg-[#8cd63d] 
                  shadow-[0_0_20px_rgba(123,198,45,0.5)] 
                  transition-all duration-300
                "
              >
                AUTHENTICATE
              </CodeverseButton>
            </form>
            
            <div className="mt-4">
              <CodeverseButton
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="w-full text-lime-400 hover:text-lime-300 hover:bg-lime-500/10"
              >
                Return to Main
              </CodeverseButton>
            </div>
          </CodeverseCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <CosmicBackground />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 pb-4 border-b border-lime-500/20"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-lime-500 drop-shadow-[0_0_10px_rgba(163,230,53,0.6)]" />
            <h1 className="font-display text-2xl font-bold text-white">
              ADMIN <span className={neonText}>CONTROL PANEL</span>
            </h1>
          </div>
          <div className="flex gap-2">
            <CodeverseButton variant="ghost" size="sm" onClick={refetch} className="text-lime-400 hover:bg-lime-500/10">
              <RefreshCw className="w-4 h-4" />
            </CodeverseButton>
            <CodeverseButton
              variant="ghost"
              size="sm"
              onClick={() => setIsAuthenticated(false)}
              className="text-lime-400 hover:bg-lime-500/10"
            >
              Logout
            </CodeverseButton>
          </div>
        </motion.header>

        {/* Round Controls */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {[1, 2, 3].map((num) => {
            const round = getRound(num);
            const isUnlocked = round?.is_unlocked || false;

            return (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: num * 0.1 }}
              >
                <CodeverseCard 
                  variant={isUnlocked ? "active" : "default"}
                  className={`transition-all duration-300 ${isUnlocked ? "border-lime-500 shadow-[0_0_30px_rgba(163,230,53,0.15)] bg-lime-950/20" : "border-white/10"}`}
                >
                  <CodeverseCardHeader>
                    <CodeverseCardTitle className={`text-lg ${isUnlocked ? "text-lime-300" : "text-gray-400"}`}>
                      Round {num}
                    </CodeverseCardTitle>
                  </CodeverseCardHeader>
                  
                  <div className="space-y-4">
                    <div className={`flex items-center justify-between p-3 rounded-lg border ${isUnlocked ? "bg-lime-500/10 border-lime-500/30" : "bg-black/40 border-white/5"}`}>
                      <span className="text-sm font-mono text-gray-400">Status</span>
                      <span
                        className={`text-sm font-bold tracking-wider ${
                          isUnlocked ? neonText : "text-gray-500"
                        }`}
                      >
                        {isUnlocked ? "UNLOCKED" : "LOCKED"}
                      </span>
                    </div>
                    
                    <CodeverseButton
                      variant="outline"
                      size="sm"
                      className={`w-full font-bold transition-all duration-300 ${
                        isUnlocked 
                          ? "!bg-lime-500 !text-black hover:!bg-lime-400 hover:scale-[1.02] shadow-[0_0_15px_rgba(163,230,53,0.5)] border-transparent" 
                          : "border-lime-500/30 text-lime-500 hover:bg-lime-500/10 hover:border-lime-400"
                      }`}
                      onClick={() => handleUnlockToggle(num, isUnlocked)}
                    >
                      {isUnlocked ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          LOCK ROUND
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4 mr-2" />
                          UNLOCK ROUND
                        </>
                      )}
                    </CodeverseButton>
                  </div>
                </CodeverseCard>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Admin;