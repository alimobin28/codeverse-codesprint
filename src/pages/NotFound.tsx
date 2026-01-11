import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { CosmicBackground } from "@/components/CosmicBackground";
import { CodeverseButton } from "@/components/ui/codeverse-button";
import { AlertTriangle, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black font-mono text-lime-500">
      <CosmicBackground />
      
      {/* Glitch Overlay Effect */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(transparent_50%,rgba(74,222,128,0.05)_50%)] bg-[length:100%_4px] pointer-events-none" />

      <div className="relative z-10 text-center p-8 bg-black/60 backdrop-blur-xl border border-lime-500/20 rounded-2xl shadow-[0_0_50px_rgba(74,222,128,0.1)]">
        
        {/* Animated 404 Glitch Text */}
        <h1 
          className="mb-2 text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-lime-300 to-lime-600 glitch-text drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]"
          data-text="404"
        >
          404
        </h1>

        <div className="flex items-center justify-center gap-2 mb-8 text-lime-400/80">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-xl font-bold tracking-widest uppercase">
            System Logic Failure
          </p>
        </div>

        <p className="mb-8 text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
          The coordinates <span className="text-lime-300 font-mono bg-lime-900/30 px-2 py-0.5 rounded">
            {location.pathname}
          </span> do not exist in this timeline. The requested sector has been purged or never existed.
        </p>

        <CodeverseButton 
          onClick={() => navigate("/")}
          className="!bg-lime-500 !text-black font-bold hover:!bg-lime-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(74,222,128,0.4)]"
          size="lg"
        >
          <Home className="mr-2 w-4 h-4" />
          RETURN TO MISSION HUB
        </CodeverseButton>
      </div>
    </div>
  );
};

export default NotFound;