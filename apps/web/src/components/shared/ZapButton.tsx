"use client";

import { useState, useCallback } from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ZapButtonProps {
  count: number;
  active: boolean;
  onClick: () => void;
  isLoading?: boolean;
}

export const ZapButton = ({ count, active, onClick, isLoading }: ZapButtonProps) => {
  const [flash, setFlash] = useState(false);

  const handlePress = useCallback(() => {
    if (active || isLoading) return;
    setFlash(true);
    onClick();
    setTimeout(() => setFlash(false), 600);
  }, [active, isLoading, onClick]);

  return (
    <button
      onClick={handlePress}
      disabled={isLoading || active}
      className={cn(
        "relative flex items-center gap-2 px-5 py-2 rounded-full font-bold transition-all duration-300 border active:scale-95 overflow-hidden",
        active
          ? "bg-gold-400 text-slate-900 border-gold-400 shadow-[0_0_20px_rgba(255,195,0,0.35)]"
          : "bg-slate-700/30 text-slate-400 border-slate-600 hover:border-gold-400/50",
        isLoading && "opacity-70 cursor-wait"
      )}
    >
      {/* Flash overlay ao clicar */}
      {flash && (
        <span className="absolute inset-0 bg-white/30 animate-ping rounded-full" />
      )}

      <Zap
        size={18}
        className={cn(
          "relative z-10 transition-all duration-300",
          active ? "fill-slate-900 text-slate-900 scale-110" : "text-slate-400"
        )}
      />
      <span className={cn("relative z-10 text-sm font-bold", active ? "text-slate-900" : "text-slate-200")}>
        {count}
      </span>
    </button>
  );
};

export default ZapButton;
