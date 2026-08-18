"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, Loader2 } from "lucide-react";
import { transferVibeAction } from "@/app/actions/post-actions";

export interface VibeZapButtonProps {
  recipientUserId?: string;
  postId?: string;
  commentId?: string;
  atrioId?: string;
  channelMessageId?: string;
  initialVibes?: number;
  initialUserHasVibed?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  onVibeSuccess?: (newVibesCount: number) => void;
}

export const VibeZapButton: React.FC<VibeZapButtonProps> = ({
  recipientUserId,
  postId,
  commentId,
  atrioId,
  channelMessageId,
  initialVibes = 0,
  initialUserHasVibed = false,
  size = "md",
  className = "",
  onVibeSuccess,
}) => {
  const [vibesCount, setVibesCount] = useState<number>(initialVibes);
  const [hasVibed, setHasVibed] = useState<boolean>(initialUserHasVibed);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExploding, setIsExploding] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleVibeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading || hasVibed) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await transferVibeAction({
        recipientUserId,
        postId,
        commentId,
        atrioId,
        channelMessageId,
      });

      if (res.success) {
        setIsExploding(true);
        const newCount = vibesCount + 1;
        setVibesCount(newCount);
        setHasVibed(true);

        // Notificar via evento global para o Header atualizar o saldo em tempo real
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("vibe-updated", { detail: { newBalance: res.newBalance } })
          );
        }

        onVibeSuccess?.(newCount);

        setTimeout(() => setIsExploding(false), 800);
      } else {
        setErrorMessage(res.message || "Erro ao enviar Vibe.");
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch (err: any) {
      setErrorMessage("Erro ao processar Vibe Zap.");
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-3.5 py-1.5 text-xs",
    lg: "px-4 py-2 text-sm font-extrabold",
  };

  const iconSizes = {
    sm: 13,
    md: 15,
    lg: 18,
  };

  return (
    <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      {/* Explosão de Partículas */}
      {isExploding && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-[#FFC300] shadow-[0_0_10px_#FFC300] animate-ping"
              style={{
                transform: `translate(${(Math.random() - 0.5) * 70}px, ${(Math.random() - 0.5) * 70}px)`,
                animationDuration: "650ms",
              }}
            />
          ))}
        </div>
      )}

      {/* Tooltip de Erro / Informação */}
      {errorMessage && (
        <div className="absolute bottom-full left-0 mb-2 px-3.5 py-2 bg-slate-950/95 text-slate-100 border border-amber-500/80 text-xs font-bold rounded-2xl shadow-2xl z-[100] min-w-max max-w-xs sm:max-w-md whitespace-normal text-left animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md flex items-center justify-between gap-3">
          <span>{errorMessage}</span>
          <Link
            href="/billing?tab=vibe"
            className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 rounded-xl font-extrabold text-[11px] hover:brightness-110 shrink-0 shadow-md"
          >
            Obter VIBEs
          </Link>
        </div>
      )}

      <button
        type="button"
        onClick={handleVibeClick}
        disabled={isLoading || hasVibed}
        className={`
          relative flex items-center gap-1.5 rounded-full font-bold transition-all duration-200 border cursor-pointer active:scale-95 select-none
          ${sizeStyles[size]}
          ${
            hasVibed
              ? "bg-[#FFC300]/20 text-[#FFC300] border-[#FFC300]/50 shadow-[0_0_12px_rgba(255,195,0,0.3)] cursor-default"
              : "bg-slate-800/60 text-slate-400 border-slate-700/80 hover:border-[#FFC300]/50 hover:text-[#FFC300]"
          }
          ${isLoading ? "opacity-70 cursor-wait" : ""}
          ${className}
        `}
        title={hasVibed ? "Você já enviou Vibe Zap!" : "Doar 1 Vibe (Vibe Zap)"}
      >
        {isLoading ? (
          <Loader2 size={iconSizes[size]} className="animate-spin text-[#FFC300]" />
        ) : (
          <Zap
            className={`transition-transform duration-200 ${
              hasVibed ? "fill-[#FFC300] text-[#FFC300] scale-110" : "text-slate-400 group-hover:text-[#FFC300]"
            }`}
            size={iconSizes[size]}
          />
        )}
        <span className={hasVibed ? "text-[#FFC300]" : "text-slate-300"}>
          {vibesCount}
        </span>
      </button>
    </div>
  );
};
