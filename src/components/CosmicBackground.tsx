import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

const CodeFragment = ({ delay, x, y }: { delay: number; x: number; y: number }) => {
  const fragments = ["0101", "1010", "{ }", "< />", "=>", "&&", "||", "++", "!=", "=="];
  const fragment = fragments[Math.floor(Math.random() * fragments.length)];
  
  return (
    <motion.span
      className="absolute font-mono text-xs opacity-20 pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        color: Math.random() > 0.5 ? "hsl(185, 100%, 50%)" : "hsl(270, 80%, 60%)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: [0, 0.3, 0],
        y: [-20, -100],
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {fragment}
    </motion.span>
  );
};

const ErevosSttar = () => (
  <motion.div
    className="absolute"
    style={{
      top: "15%",
      right: "20%",
    }}
    animate={{
      scale: [1, 1.1, 1],
      opacity: [0.8, 1, 0.8],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    <div className="relative">
      <div className="w-4 h-4 rounded-full bg-primary blur-sm" />
      <div className="absolute inset-0 w-4 h-4 rounded-full bg-primary animate-ping opacity-30" />
      <motion.div
        className="absolute -inset-4 rounded-full"
        style={{
          background: "radial-gradient(circle, hsla(348, 100%, 50%, 0.4) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  </motion.div>
);

export const CosmicBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    // Initialize particles
    const colors = [
      "hsla(348, 100%, 50%, 0.6)",
      "hsla(185, 100%, 50%, 0.6)",
      "hsla(270, 80%, 60%, 0.6)",
      "hsla(0, 0%, 100%, 0.4)",
    ];
    
    for (let i = 0; i < 100; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);
  
  const codeFragments = Array.from({ length: 20 }, (_, i) => ({
    delay: i * 0.5,
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));
  
  return (
    <>
      <div className="codeverse-bg" />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
      />
      <ErevosSttar />
      {codeFragments.map((props, i) => (
        <CodeFragment key={i} {...props} />
      ))}
      <div className="scanlines" />
    </>
  );
};

export default CosmicBackground;