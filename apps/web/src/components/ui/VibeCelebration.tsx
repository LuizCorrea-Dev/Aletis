"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  shape: "circle" | "star" | "zap";
}

interface VibeCelebrationProps {
  trigger: boolean; // Muda para true para ativar a celebração
  onComplete?: () => void;
}

export const VibeCelebration = ({ trigger, onComplete }: VibeCelebrationProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 60 + 20,
      size: Math.random() * 10 + 6,
      duration: Math.random() * 0.8 + 0.5,
      delay: Math.random() * 0.4,
      shape: (["circle", "star", "zap"] as const)[Math.floor(Math.random() * 3)],
    }));

    setParticles(newParticles);
    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 1400);

    return () => clearTimeout(timer);
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes burst {
          0%   { transform: translate(0,0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        .celebration-particle {
          position: fixed;
          animation: burst ease-out forwards;
          pointer-events: none;
          z-index: 9999;
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          className="celebration-particle"
          style={{
            left: `${p.x}vw`,
            top: `${p.y}vh`,
            width: p.size,
            height: p.size,
            backgroundColor: p.id % 3 === 0 ? "#FFC300" : p.id % 3 === 1 ? "#50c878" : "#3b82f6",
            borderRadius: p.shape === "circle" ? "50%" : p.shape === "star" ? "20%" : "10%",
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            // @ts-ignore
            "--tx": `${(Math.random() - 0.5) * 200}px`,
            "--ty": `${-(Math.random() * 200 + 50)}px`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
};

export default VibeCelebration;
