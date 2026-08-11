"use client";

import React from "react";
import Image from "next/image";

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-24 h-24 text-2xl",
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "User",
  size = "md",
  className = "",
}) => {
  const [hasError, setHasError] = React.useState(false);

  // Fallback image using Dicebear bottts SVG based on alt/username
  const fallbackUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
    alt || "User"
  )}`;

  const finalSrc = src && src.trim() !== "" && !hasError ? src : fallbackUrl;
  const isSvg = finalSrc.includes("svg") || finalSrc.includes("dicebear");

  return (
    <div
      className={`relative rounded-full overflow-hidden flex items-center justify-center bg-slate-800 border border-slate-700/80 shrink-0 ${sizeClasses[size]} ${className}`}
    >
      <Image
        src={finalSrc}
        alt={alt}
        fill
        unoptimized={isSvg}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
};
