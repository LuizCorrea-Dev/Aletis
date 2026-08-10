"use client";

import React, { useState } from "react";
import { Zap } from "lucide-react";

interface ZapButtonProps {
  count: number;
  active: boolean;
  onClick: () => void;
  isLoading?: boolean;
}

export const ZapButton: React.FC<ZapButtonProps> = ({
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
      {isExploding && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-[#FFC300] shadow-[0_0_10px_#FFC300] animate-ping"
              style={{
                transform: `translate(${(Math.random() - 0.5) * 80}px, ${(Math.random() - 0.5) * 80}px)`,
                animationDuration: "500ms",
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
          relative flex items-center gap-2 px-4 py-2 rounded-full font-extrabold text-xs transition-all duration-300 active:scale-95 cursor-pointer
          ${
            active
              ? "bg-[#FFC300] text-[#1e293b] border-2 border-[#FFC300] shadow-[0_0_18px_rgba(255,195,0,0.4)] scale-105"
              : "bg-slate-800/60 text-slate-400 border border-slate-700 hover:border-[#FFC300]/60 hover:text-slate-200"
          }
          ${isLoading ? "opacity-70 cursor-wait" : ""}
        `}
      >
        <Zap
          className={`transition-transform duration-200 ${
            active ? "fill-[#1e293b] text-[#1e293b]" : "text-slate-400"
          }`}
          size={16}
        />
        <span>{count}</span>
      </button>
    </div>
  );
};
