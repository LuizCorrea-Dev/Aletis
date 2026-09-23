"use client";

import React, { useState } from "react";
import { Heart, MessageCircle, ShieldAlert, Sparkles, Send, Zap } from "lucide-react";
import Link from "next/link";

interface Reflection {
  id: string;
  author: string;
  isAnonymous: boolean;
  content: string;
  category: 'santuario' | 'atrio' | 'comunidade';
  vibes: number;
  timeAgo: string;
  badge?: 'clinico' | 'ancora' | 'comum';
  commentsCount: number;
}

const DEMO_REFLECTIONS: Reflection[] = [
  {
    id: "1",
    author: "Anônimo",
    isAnonymous: true,
    content: "Hoje foi um daqueles dias em que o peso do mundo pareceu estar todo nos meus ombros. Não consegui ser produtivo, e a culpa está me consumindo.",
    category: "santuario",
    vibes: 42,
    timeAgo: "2h atrás",
    commentsCount: 5,
  },
  {
    id: "2",
    author: "Marina S.",
    isAnonymous: false,
    content: "Apenas um lembrete: você sobreviveu a 100% dos seus piores dias até agora. Respire fundo.",
    category: "atrio",
    vibes: 128,
    timeAgo: "5h atrás",
    badge: "ancora",
    commentsCount: 12,
  }
];

export function InteractiveExperience() {
  const [activeTab, setActiveTab] = useState<'santuario' | 'atrio'>('santuario');
  const [userVibes, setUserVibes] = useState(100);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const handleVibe = (id: string) => {
    if (likedPosts.has(id)) return;
    if (userVibes < 2) return; // Costs 2 vibes to like

    setUserVibes(prev => prev - 2);
    setLikedPosts(prev => new Set(prev).add(id));
  };

  const visibleReflections = DEMO_REFLECTIONS.filter(r => r.category === activeTab);

  return (
    <section id="simulador" className="px-6 py-24 bg-sage-100 overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] bg-cream-50/40 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Context */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage-200 text-sage-800 text-xs font-semibold tracking-widest uppercase mb-6">
              <Sparkles className="size-3.5 text-sage-600" />
              Experimente a Vibe
            </div>
            
            <h2 className="font-display text-4xl md:text-5xl font-bold text-sage-900 mb-6 leading-tight">
              A empatia tem um custo. <br className="hidden md:block" />
              <span className="text-sage-600 italic font-medium">E é isso que a torna valiosa.</span>
            </h2>
            
            <p className="text-sage-700 text-lg leading-relaxed mb-8">
              No Aletis, apoiar alguém gasta o seu saldo de energia (VIBES). Você recebe VIBES diariamente (O Ciclo do Orvalho), mas se não as usar para apoiar outros, elas evaporam.
            </p>

            <ul className="space-y-4 mb-10">
              <li className="flex items-start gap-3">
                <div className="mt-1 size-6 rounded-full bg-sage-200 flex items-center justify-center shrink-0">
                  <Zap className="size-3.5 text-sage-700" />
                </div>
                <div>
                  <h4 className="font-bold text-sage-900">Economia Soma Zero Ajustada</h4>
                  <p className="text-sm text-sage-600 mt-0.5">O apoio que você recebe tem valor real porque custou algo para quem o deu.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 size-6 rounded-full bg-sage-200 flex items-center justify-center shrink-0">
                  <ShieldAlert className="size-3.5 text-sage-700" />
                </div>
                <div>
                  <h4 className="font-bold text-sage-900">Santuário Seguro</h4>
                  <p className="text-sm text-sage-600 mt-0.5">Sem anúncios. Sem algoritmos puxando sua atenção. Apenas um espaço calmo para existir.</p>
                </div>
              </li>
            </ul>

            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 rounded-full bg-sage-900 px-6 py-3 text-sm font-semibold text-cream-50 transition-all hover:bg-sage-800 hover:shadow-md cursor-pointer"
            >
              Criar meu perfil grátis
            </Link>
          </div>

          {/* Right Column: Simulator UI */}
          <div className="relative z-10 w-full max-w-md mx-auto">
            {/* Phone Mockup Container */}
            <div className="bg-cream-50 rounded-[40px] shadow-2xl overflow-hidden border-8 border-sage-200 relative aspect-[9/19] flex flex-col">
              
              {/* Fake Status Bar */}
              <div className="h-7 w-full bg-cream-50 flex items-center justify-center">
                <div className="w-24 h-4 bg-sage-200 rounded-full" />
              </div>

              {/* App Header */}
              <div className="px-5 py-3 border-b border-sage-200 flex items-center justify-between bg-cream-50 z-10">
                <span className="font-display font-bold text-sage-900">Aletis</span>
                <div className="flex items-center gap-1.5 bg-sage-100 px-3 py-1 rounded-full text-xs font-bold text-sage-700">
                  <Zap className="size-3.5 text-emerald-500 fill-emerald-500" />
                  {userVibes}
                </div>
              </div>

              {/* Fake Tabs */}
              <div className="flex border-b border-sage-200 bg-cream-50">
                <button 
                  onClick={() => setActiveTab('santuario')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'santuario' ? 'text-sage-900 border-b-2 border-sage-900' : 'text-sage-400'}`}
                >
                  Santuário
                </button>
                <button 
                  onClick={() => setActiveTab('atrio')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'atrio' ? 'text-sage-900 border-b-2 border-sage-900' : 'text-sage-400'}`}
                >
                  Átrio
                </button>
              </div>

              {/* Feed Content */}
              <div className="flex-1 bg-[#f4efe7] p-4 overflow-y-auto hide-scrollbar flex flex-col gap-4">
                {visibleReflections.map(ref => {
                  const isLiked = likedPosts.has(ref.id);
                  return (
                    <div key={ref.id} className="bg-cream-50 rounded-2xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold ${ref.isAnonymous ? 'bg-sage-200 text-sage-600' : 'bg-emerald-100 text-emerald-700'}`}>
                            {ref.author.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-sage-900 block leading-tight">{ref.author}</span>
                            <span className="text-[10px] text-sage-500">{ref.timeAgo}</span>
                          </div>
                        </div>
                        {ref.badge === 'ancora' && (
                          <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            Âncora
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-sage-800 leading-relaxed mb-4">
                        {ref.content}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-sage-100">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleVibe(ref.id)}
                            className={`flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${isLiked ? 'text-emerald-500' : 'text-sage-400 hover:text-sage-600'}`}
                          >
                            <Zap className={`size-4 ${isLiked ? 'fill-emerald-500' : ''}`} />
                            {ref.vibes + (isLiked ? 2 : 0)}
                          </button>
                          <button className="flex items-center gap-1.5 text-xs font-semibold text-sage-400 transition-colors cursor-pointer">
                            <MessageCircle className="size-4" />
                            {ref.commentsCount}
                          </button>
                        </div>
                        <button className="text-sage-300 hover:text-sage-500 transition-colors cursor-pointer">
                          <Send className="size-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Empty state instruction */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-sage-500">
                    Toque no <Zap className="inline size-3 mx-0.5" /> para apoiar (-2 VIBES)
                  </p>
                </div>
              </div>

              {/* Bottom Nav Fake */}
              <div className="bg-cream-50 border-t border-sage-200 p-4 flex justify-around items-center">
                <div className="size-6 rounded bg-sage-300" />
                <div className="size-6 rounded bg-sage-200" />
                <div className="size-10 rounded-full bg-sage-900 flex items-center justify-center -mt-8 shadow-lg border-4 border-cream-50 text-cream-50">
                  <Zap className="size-4" />
                </div>
                <div className="size-6 rounded bg-sage-200" />
                <div className="size-6 rounded-full bg-sage-200" />
              </div>

            </div>

            {/* Decorative blobs behind phone */}
            <div className="absolute top-10 -right-6 -z-10 size-24 rounded-full bg-emerald-400/20 blur-xl" />
            <div className="absolute bottom-10 -left-6 -z-10 size-32 rounded-full bg-sage-400/20 blur-xl" />
          </div>

        </div>
      </div>
    </section>
  );
}
