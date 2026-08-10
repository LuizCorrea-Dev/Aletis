"use client";

import React from "react";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-24 h-24 text-2xl",
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "Avatar",
  size = "md",
  className = "",
}) => {
  const [hasError, setHasError] = React.useState(false);
  const initials = alt ? alt.charAt(0).toUpperCase() : "?";

  const isSvg = src ? src.includes("svg") || src.includes("dicebear") : false;

  return (
    <div
      className={`relative rounded-full overflow-hidden flex items-center justify-center bg-slate-700 text-slate-200 font-bold border border-slate-600/50 shrink-0 ${sizeClasses[size]} ${className}`}
    >
      {src && !hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized={isSvg}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
