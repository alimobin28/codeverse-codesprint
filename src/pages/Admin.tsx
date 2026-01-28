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
import { Shield, Settings, FileText, Lightbulb, Radio } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/authService";

// Admin Components
import { RoundControl } from "@/components/Admin/RoundControl";
import { ProblemEditor } from "@/components/Admin/ProblemEditor";
import { HintManager } from "@/components/Admin/HintManager";
import { BroadcastPanel } from "@/components/Admin/BroadcastPanel";

type AdminTab = "rounds" | "problems" | "hints" | "broadcast";

const Admin = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("rounds");
  const [selectedRound, setSelectedRound] = useState<number | undefined>(undefined);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const isValid = await authService.verify();
        if (isValid) {
          setIsAuthenticated(true);
        }
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error("Please enter a password");
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.login(password);

      if (result.success) {
        setIsAuthenticated(true);
        toast.success("Admin access granted");
        setPassword(""); // Clear password input
      } else if (result.locked) {
        toast.error(result.error || "Account is locked");
      } else if (result.attemptsRemaining !== undefined) {
        toast.error(`${result.error}. ${result.attemptsRemaining} attempts remaining`);
      } else {
        toast.error(result.error || "Authentication failed");
      }
    } catch (error) {
      toast.error("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setPassword("");
    toast.info("Logged out successfully");
  };

  // Neon Green Glow Helpers
  const neonText = "text-lime-400 drop-shadow-[0_0_5px_rgba(163,230,53,0.8)]";
  const neonBorder = "border-lime-500/50 shadow-[0_0_15px_rgba(163,230,53,0.15)]";

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "rounds", label: "Rounds", icon: <Settings className="w-4 h-4" /> },
    { id: "problems", label: "Problems", icon: <FileText className="w-4 h-4" /> },
    { id: "hints", label: "Hints", icon: <Lightbulb className="w-4 h-4" /> },
    { id: "broadcast", label: "Broadcast", icon: <Radio className="w-4 h-4" /> },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <CosmicBackground />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md"
        >
          <CodeverseCard
            variant="elevated"
            className={`bg-black/80 backdrop-blur-xl ${neonBorder}`}
          >
            <CodeverseCardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-lime-400 drop-shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
                <CodeverseCardTitle className="text-lime-100">
                  Admin Access
                </CodeverseCardTitle>
              </div>
            </CodeverseCardHeader>

            <form onSubmit={handleLogin} className="space-y-4">
              <CodeverseInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
                disabled={isLoading}
                className="border-lime-500/30 focus:border-lime-400 focus:ring-lime-500/20"
              />
              <CodeverseButton
                type="submit"
                disabled={isLoading}
                className="
                  w-full 
                  !bg-[#7BC62D] 
                  !text-black 
                  font-bold 
                  hover:!bg-[#8cd63d] 
                  shadow-[0_0_20px_rgba(123,198,45,0.5)] 
                  transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {isLoading ? "AUTHENTICATING..." : "AUTHENTICATE"}
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

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6 pb-4 border-b border-lime-500/20"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-lime-500 drop-shadow-[0_0_10px_rgba(163,230,53,0.6)]" />
            <h1 className="font-display text-2xl font-bold text-white">
              ADMIN <span className={neonText}>CONTROL PANEL</span>
            </h1>
          </div>
          <div className="flex gap-2">
            <CodeverseButton
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-lime-400 hover:bg-lime-500/10"
            >
              Logout
            </CodeverseButton>
          </div>
        </motion.header>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 p-1 bg-black/40 rounded-lg border border-white/10 w-fit">
          {tabs.map((tab) => (
            <CodeverseButton
              key={tab.id}
              variant={activeTab === tab.id ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 ${activeTab === tab.id
                ? "bg-lime-500 text-black"
                : "text-gray-400 hover:text-white"
                }`}
            >
              {tab.icon}
              {tab.label}
            </CodeverseButton>
          ))}
        </div>

        {/* Round Filter for Problems */}
        {activeTab === "problems" && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-400">Filter by Round:</span>
            <select
              value={selectedRound || ""}
              onChange={(e) =>
                setSelectedRound(e.target.value ? parseInt(e.target.value) : undefined)
              }
              className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-lime-500/50 focus:outline-none"
            >
              <option value="">All Rounds</option>
              <option value="1">Round 1</option>
              <option value="2">Round 2</option>
              <option value="3">Round 3</option>
            </select>
          </div>
        )}

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "rounds" && <RoundControl />}
          {activeTab === "problems" && <ProblemEditor roundNumber={selectedRound} />}
          {activeTab === "hints" && <HintManager />}
          {activeTab === "broadcast" && <BroadcastPanel />}
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;