"use client";

import React from "react";

export const PostSkeleton: React.FC = () => {
  return (
    <div className="w-full rounded-2xl bg-slate-800/40 border border-slate-700/60 p-5 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-700/60" />
        <div className="space-y-2">
          <div className="h-3.5 w-28 rounded-full bg-slate-700/60" />
          <div className="h-2.5 w-16 rounded-full bg-slate-700/40" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded-full bg-slate-700/60" />
        <div className="h-3.5 w-5/6 rounded-full bg-slate-700/60" />
        <div className="h-3.5 w-3/4 rounded-full bg-slate-700/40" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-6 w-16 rounded-full bg-slate-700/40" />
        <div className="h-6 w-20 rounded-full bg-slate-700/40" />
      </div>
    </div>
  );
};
