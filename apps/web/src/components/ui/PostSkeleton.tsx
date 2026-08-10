// Componente puro (sem "use client") — pode ser Server Component
// Renderiza o skeleton de carregamento de um PostCard

export const PostSkeleton = () => {
  return (
    <div className="mx-auto w-full overflow-hidden rounded-2xl bg-slate-800/40 border border-slate-700/50 mb-4 p-5">
      <div className="flex items-center gap-3 mb-4">
        {/* Avatar */}
        <div className="h-10 w-10 rounded-full bg-slate-700 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-28 rounded bg-slate-700 animate-pulse" />
          <div className="h-2 w-16 rounded bg-slate-700/60 animate-pulse" />
        </div>
      </div>

      <div className="space-y-3 mb-5">
        <div className="h-4 w-full rounded bg-slate-700 animate-pulse" />
        <div className="h-4 w-[88%] rounded bg-slate-700 animate-pulse" />
        <div className="h-4 w-[72%] rounded bg-slate-700/60 animate-pulse" />
      </div>

      {/* Media placeholder */}
      <div className="w-full h-40 rounded-xl mb-4 bg-slate-700/40 animate-pulse" />

      <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
        <div className="h-8 w-20 rounded-full bg-slate-700 animate-pulse" />
        <div className="flex gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-700 animate-pulse" />
          <div className="h-8 w-8 rounded-full bg-slate-700 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default PostSkeleton;
