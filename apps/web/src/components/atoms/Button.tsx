"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variantStyles = {
  primary:
    "bg-[#50c878] hover:bg-[#50c878]/90 text-[#1e293b] font-extrabold shadow-lg shadow-[#50c878]/20 border border-transparent",
  secondary:
    "bg-[#FFC300] hover:bg-[#FFC300]/90 text-[#1e293b] font-extrabold shadow-lg shadow-[#FFC300]/20 border border-transparent",
  outline:
    "bg-slate-800/40 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600",
  danger:
    "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30",
  ghost:
    "bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-white border border-transparent",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs rounded-xl",
  md: "px-4 py-2.5 text-sm rounded-2xl",
  lg: "px-6 py-3.5 text-base rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 size={16} className="animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
