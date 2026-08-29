import React from "react";
import { Feather } from "lucide-react";

interface AletisLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const AletisLogo: React.FC<AletisLogoProps> = ({ size = "md", className = "" }) => {
  const circleSizes = {
    sm: "w-7 h-7 border p-1",
    md: "w-10 h-10 border-[1.5px] p-2",
    lg: "w-12 h-12 border-2 p-2.5",
    xl: "w-16 h-16 border-2 p-3.5",
  };

  const iconSizes = {
    sm: 14,
    md: 20,
    lg: 24,
    xl: 32,
  };

  const textSizes = {
    sm: "text-lg font-black tracking-tight",
    md: "text-2xl font-black tracking-tight",
    lg: "text-3xl font-black tracking-tight",
    xl: "text-4xl font-black tracking-tight",
  };

  return (
    <div className={`group flex items-center gap-2.5 select-none ${className}`}>
      {/* Círculo do Logo Aletis com Pena Verde #50c878 e rotação no hover */}
      <div className={`rounded-full border-[#50c878]/60 bg-[#50c878]/10 text-[#50c878] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(80,200,120,0.2)] transition-all duration-300 group-hover:border-[#50c878] ${circleSizes[size]}`}>
        <Feather 
          size={iconSizes[size]} 
          strokeWidth={2.2} 
          className="transition-transform duration-300 ease-out group-hover:-rotate-12 group-hover:scale-110" 
        />
      </div>

      {/* Texto ALETIS em Negrito Puro e Branco */}
      <span className={`text-white uppercase font-black tracking-tight transition-colors duration-300 group-hover:text-[#50c878] ${textSizes[size]}`}>
        ALETIS
      </span>
    </div>
  );
};
