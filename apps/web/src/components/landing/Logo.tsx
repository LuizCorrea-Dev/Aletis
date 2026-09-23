import React from "react";

export function Logo({
  className = "",
  showTagline = false,
  inverted = false,
}: {
  className?: string;
  showTagline?: boolean;
  inverted?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div
        className={`relative flex size-10 items-center justify-center rounded-xl transition-transform hover:rotate-3 ${
          inverted
            ? "bg-cream text-navy shadow-sm"
            : "bg-navy text-cream shadow-sm shadow-navy/10"
        }`}
      >
        {/* Organic stylized leaf / Aletis emblem */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
        >
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
        <div
          className={`absolute -top-1 -right-1 size-2 rounded-full ${
            inverted ? "bg-peach" : "bg-mint"
          } animate-pulse`}
        />
      </div>

      <div className="flex flex-col">
        <span
          className={`font-display text-xl font-bold tracking-tight leading-none ${
            inverted ? "text-cream" : "text-navy"
          }`}
        >
          Aletis
        </span>
        {showTagline && (
          <span
            className={`font-sans text-[10px] font-medium tracking-wider uppercase mt-0.5 ${
              inverted ? "text-cream/70" : "text-navy/70"
            }`}
          >
            Slow Tech
          </span>
        )}
      </div>
    </div>
  );
}
