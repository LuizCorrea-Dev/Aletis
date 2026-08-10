"use client";

import React, { useState } from "react";
import { Zap } from "lucide-react";

interface VibeButtonProps {
  count: number;
  active: boolean;
  onClick: () => void;
  isLoading?: boolean;
}

export const VibeButton: React.FC<VibeButtonProps> = ({
  count,
  active,
  onClick,
  isLoading,
}) => {
  const [isExploding, setIsExploding] = useState(false);

  const handlePress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (active || isLoading) return;
    setIsExploding(true);
    onClick();
    setTimeout(() => setIsExploding(false), 800);
  };

  return (
    <div className="relative inline-block">
      {/* Explosão de Partículas */}
      {isExploding && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-[#FFC300] shadow-[0_0_8px_#FFC300] animate-ping"
              style={{
                transform: `translate(${(Math.random() - 0.5) * 60}px, ${(Math.random() - 0.5) * 60}px)`,
                animationDuration: "600ms",
              }}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handlePress}
        disabled={isLoading || active}
        className={`
          relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border cursor-pointer active:scale-95
          ${
            active
              ? "bg-[#FFC300]/20 text-[#FFC300] border-[#FFC300]/50 shadow-[0_0_12px_rgba(255,195,0,0.25)]"
              : "bg-slate-800/40 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200"
          }
          ${isLoading ? "opacity-70 cursor-wait" : ""}
        `}
      >
        <Zap
          className={`transition-transform duration-200 ${
            active ? "fill-[#FFC300] text-[#FFC300] scale-110" : "text-slate-500"
          }`}
          size={15}
        />
        <span className={active ? "text-[#FFC300]" : "text-slate-400"}>
          {count}
        </span>
      </button>
    </div>
  );
};
