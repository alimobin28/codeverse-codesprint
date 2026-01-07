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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <CosmicBackground />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md"
        >
          <CodeverseCard variant="elevated">
            <CodeverseCardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                <CodeverseCardTitle>Admin Access</CodeverseCardTitle>
              </div>
            </CodeverseCardHeader>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <CodeverseInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
              />
              <CodeverseButton type="submit" className="w-full">
                AUTHENTICATE
              </CodeverseButton>
            </form>
            
            <div className="mt-4">
              <CodeverseButton
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="w-full"
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
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="font-display text-2xl font-bold">ADMIN CONTROL PANEL</h1>
          </div>
          <div className="flex gap-2">
            <CodeverseButton variant="ghost" size="sm" onClick={refetch}>
              <RefreshCw className="w-4 h-4" />
            </CodeverseButton>
            <CodeverseButton
              variant="ghost"
              size="sm"
              onClick={() => setIsAuthenticated(false)}
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
                <CodeverseCard variant={isUnlocked ? "active" : "default"}>
                  <CodeverseCardHeader>
                    <CodeverseCardTitle className="text-lg">
                      Round {num}
                    </CodeverseCardTitle>
                  </CodeverseCardHeader>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-mono">Status</span>
                      <span
                        className={`text-sm font-bold ${
                          isUnlocked ? "text-codeverse-terminal" : "text-muted-foreground"
                        }`}
                      >
                        {isUnlocked ? "UNLOCKED" : "LOCKED"}
                      </span>
                    </div>
                    
                    <CodeverseButton
                      variant={isUnlocked ? "destructive" : "secondary"}
                      size="sm"
                      className="w-full"
                      onClick={() => handleUnlockToggle(num, isUnlocked)}
                    >
                      {isUnlocked ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Lock Round
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4 mr-2" />
                          Unlock Round
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