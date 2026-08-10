"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  Lock,
  Hash,
  Plus,
  Building2,
} from "lucide-react";
import { getCommunitiesAction } from "@/app/actions/community-actions";
import { CreateCommunityModal } from "./CreateCommunityModal";

interface CommunityItem {
  id: string;
  name: string;
  description: string;
  bannerUrl?: string;
  avatarUrl?: string;
  privacy: "PUBLIC" | "PRIVATE";
  memberCount: number;
  tags: string[];
  currentUserRole?: "OWNER" | "MODERATOR" | "MEMBER" | "PENDING" | null;
}

export default function CommunitiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"ALL" | "MEMBER" | "OWNER">("ALL");
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchCommunities = async () => {
      setIsLoading(true);
      try {
        const commData = await getCommunitiesAction();

        if (commData && commData.length > 0) {
          setCommunities(
            commData.map((c: any) => ({
              id: c.id,
              name: c.name,
              description: c.description || "",
              bannerUrl: c.bannerUrl || "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80",
              avatarUrl: c.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`,
              privacy: c.privacy || "PUBLIC",
              memberCount: c.memberCount || 1,
              tags: c.tags || [],
              currentUserRole: null,
            }))
          );
        } else {
          setCommunities([
            {
              id: "1",
              name: "Jardim da Serenidade",
              description: "Espaço dedicado a práticas diárias de atenção plena, meditação e desabafos de luz.",
              bannerUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80",
              avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Jardim",
              privacy: "PUBLIC",
              memberCount: 128,
              tags: ["meditação", "paz", "mindfulness"],
              currentUserRole: "MEMBER",
            },
            {
              id: "2",
              name: "Escritores da Alma",
              description: "Troca de poesias, reflexões filosóficas e textos profundos sobre a jornada humana.",
              bannerUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
              avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Escritores",
              privacy: "PUBLIC",
              memberCount: 84,
              tags: ["poesia", "escrita", "aletis"],
              currentUserRole: "OWNER",
            },
            {
              id: "3",
              name: "Santuário Anônimo",
              description: "Comunidade restrita para apoio mútuo em momentos de reconstrução e recomeços.",
              bannerUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
              avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Santuario",
              privacy: "PRIVATE",
              memberCount: 45,
              tags: ["apoio", "cura", "superação"],
              currentUserRole: null,
            },
          ]);
        }
      } catch (err) {
        console.error("Erro ao buscar comunidades:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const filteredCommunities = communities.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === "MEMBER") return matchesSearch && c.currentUserRole === "MEMBER";
    if (filter === "OWNER") return matchesSearch && c.currentUserRole === "OWNER";
    return matchesSearch;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Header Fixo */}
      <header className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-white flex items-center gap-2">
              Descubra sua <span className="text-[#a855f7]">Tribo</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Conecte-se com pessoas que compartilham da mesma vibração.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#50c878] hover:bg-[#50c878]/90 text-[#1e293b] font-extrabold text-xs py-3 px-5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_16px_rgba(80,200,120,0.3)] cursor-pointer"
          >
            <Plus size={18} />
            <span>Criar Tribo</span>
          </button>
        </div>

        {/* Busca e Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar tribos por nome ou tag..."
              className="w-full bg-slate-900/60 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#a855f7] transition-colors"
            />
          </div>

          <div className="flex gap-1.5 bg-slate-900/60 p-1 border border-slate-700/80 rounded-2xl shrink-0">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${filter === "ALL" ? "bg-[#a855f7] text-white shadow-md" : "text-slate-400 hover:text-white"
                }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setFilter("MEMBER")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${filter === "MEMBER" ? "bg-[#a855f7] text-white shadow-md" : "text-slate-400 hover:text-white"
                }`}
            >
              Minhas Tribos
            </button>
          </div>
        </div>
      </header>

      {/* Grid de Comunidades */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-60 rounded-3xl bg-slate-800/40 border border-slate-700/60 animate-pulse" />
          ))}
        </div>
      ) : filteredCommunities.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center">
            <Building2 size={24} className="text-slate-500" />
          </div>
          <p className="text-xs text-slate-500 font-medium">Nenhuma tribo encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {filteredCommunities.map((c) => (
            <div
              key={c.id}
              className="bg-[#1e293b] rounded-3xl overflow-hidden border border-slate-700/80 shadow-xl hover:border-[#a855f7]/50 transition-all flex flex-col group"
            >
              <div className="h-28 bg-slate-800 relative overflow-hidden">
                <img
                  src={c.bannerUrl}
                  alt="Banner"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#1e293b] to-transparent" />
                {c.privacy === "PRIVATE" && (
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-white flex items-center gap-1 border border-white/10">
                    <Lock size={12} /> Privada
                  </div>
                )}
              </div>

              <div className="px-5 pb-5 flex-1 flex flex-col -mt-8 relative">
                <img
                  src={c.avatarUrl}
                  alt={c.name}
                  className="w-16 h-16 rounded-2xl border-4 border-[#1e293b] bg-slate-800 object-cover shadow-md mb-3"
                />

                <h3 className="text-lg font-extrabold text-white mb-1.5 group-hover:text-[#a855f7] transition-colors font-display">
                  {c.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {c.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/50">
                    <Users size={12} /> {c.memberCount} membros
                  </span>
                  {c.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-[10px] uppercase font-bold text-[#50c878] bg-[#50c878]/10 px-2.5 py-1 rounded-lg"
                    >
                      <Hash size={10} /> {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto">
                  <Link
                    href={`/communities/${c.id}`}
                    className="w-full py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 bg-[#50c878] hover:bg-[#50c878]/90 text-[#1e293b] transition-all shadow-md active:scale-95"
                  >
                    Acessar Tribo
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateCommunityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
