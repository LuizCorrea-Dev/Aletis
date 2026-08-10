"use client";

import { useState, useCallback } from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface VibeButtonProps {
  count: number;
  active: boolean;
  onClick: () => void;
  isLoading?: boolean;
}

export const VibeButton = ({ count, active, onClick, isLoading }: VibeButtonProps) => {
  const [particles, setParticles] = useState<number[]>([]);

  const handlePress = useCallback(() => {
    if (active || isLoading) return;
    // Dispara partículas CSS
    setParticles(Array.from({ length: 8 }, (_, i) => i));
    onClick();
    setTimeout(() => setParticles([]), 800);
  }, [active, isLoading, onClick]);

  return (
    <div className="relative inline-flex items-center">
      {/* Partículas CSS puras (sem Framer Motion) */}
      {particles.map((i) => (
        <span
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping pointer-events-none"
          style={{
            left: `${50 + (Math.cos((i / 8) * Math.PI * 2) * 30)}%`,
            top: `${50 + (Math.sin((i / 8) * Math.PI * 2) * 30)}%`,
            animationDuration: "0.7s",
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}

      <button
        onClick={handlePress}
        disabled={isLoading || active}
        className={cn(
          "relative flex items-center gap-2 px-4 py-1.5 rounded-full font-bold transition-all duration-300 border active:scale-95",
          active
            ? "bg-gold-400/20 text-gold-400 border-gold-400/50 shadow-[0_0_12px_rgba(255,195,0,0.2)]"
            : "bg-slate-800/40 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200",
          isLoading && "opacity-70 cursor-wait"
        )}
      >
        <Zap
          size={18}
          className={cn(
            "transition-all duration-300",
            active ? "fill-gold-400 text-gold-400 scale-110" : "text-slate-500"
          )}
        />
        <span className={cn("text-sm", active ? "text-gold-400" : "text-slate-400")}>
          {count}
        </span>
      </button>
    </div>
  );
};

export default VibeButton;
