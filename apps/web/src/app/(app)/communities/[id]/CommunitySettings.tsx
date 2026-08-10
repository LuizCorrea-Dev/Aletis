"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Loader2,
  Settings,
  Mic,
  Camera,
  BellOff,
  Bell,
  Shield,
  ChevronRight,
  LogOut,
  Users,
  Crown,
  ShieldAlert,
} from "lucide-react";
import {
  updateCommunityAction,
  deleteCommunityAction,
  leaveCommunityAction,
  getMembersAction,
  updateMemberRoleAction,
  kickMemberAction,
  banMemberAction,
  unbanMemberAction,
  getBannedMembersAction,
  muteMemberAction,
  setMemberNicknameAction,
} from "@/app/actions/community-actions";
import { Community, CommunityMember, RoleType } from "@aletis/domain";
import CommunityRoleManager from "./CommunityRoleManager";
import CommunityPollWidget from "./CommunityPollWidget";
import { Vote } from "lucide-react";

interface CommunitySettingsProps {
  community: Community;
  onClose: () => void;
  onUpdate: (updated?: Community) => void;
  onDelete?: () => void;
}

export default function CommunitySettings({
  community,
  onClose,
  onUpdate,
  onDelete,
}: CommunitySettingsProps) {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isMuted, setIsMuted] = useState(community.isMuted || false);

  const toggleMute = async () => {
    setIsMuted(!isMuted);
  };

  const handleLeave = async () => {
    const res = await leaveCommunityAction(community.id);
    if (res.success) {
      router.push("/communities");
    } else {
      alert("Erro ao sair do grupo.");
    }
  };

  if (showAdvanced) {
    return (
      <AdvancedManagementModal
        community={community}
        onClose={() => setShowAdvanced(false)}
        onUpdate={onUpdate}
        onDelete={() => {
          if (onDelete) onDelete();
          router.push("/communities");
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-100 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e293b] w-full max-w-sm md:max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <Settings className="text-slate-400" size={20} />
            <h2 className="font-bold text-white text-base font-display">Configurações</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Card de Identificação */}
          <div className="flex items-center gap-4 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
            <img
              src={community.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=" + community.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-700"
              alt={community.name}
            />
            <div>
              <h3 className="text-white font-bold text-base font-display">{community.name}</h3>
              <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                {community.currentUserRole === "OWNER"
                  ? "Dono"
                  : community.currentUserRole === "MODERATOR"
                    ? "Moderador"
                    : "Membro"}
              </span>
            </div>
          </div>

          {/* Configurações de Dispositivos */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Dispositivos de Mídia
            </h4>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-slate-400 flex items-center gap-2 mb-1">
                  <Mic size={14} /> Microfone
                </label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-mint-500 transition-colors">
                  <option>Padrão - Microfone Interno</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 flex items-center gap-2 mb-1">
                  <Camera size={14} /> Câmera
                </label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-mint-500 transition-colors">
                  <option>Padrão - Câmera HD Integrada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notificações */}
          <div className="pt-4 border-t border-slate-700/50">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Notificações
            </h4>
            <div className="bg-slate-900/50 p-3 rounded-xl flex items-center justify-between border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${isMuted ? "bg-red-500/10 text-red-400" : "bg-mint-500/10 text-mint-500"}`}
                >
                  {isMuted ? <BellOff size={18} /> : <Bell size={18} />}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    Silenciar Comunidade
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Desativar alertas push e sons
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleMute}
                className={`w-10 h-5 rounded-full relative transition-colors ${isMuted ? "bg-slate-600" : "bg-mint-500"}`}
              >
                <div
                  className={`absolute top-1 w-3 h-3 bg-slate-900 rounded-full transition-all ${isMuted ? "left-1" : "right-1"}`}
                />
              </button>
            </div>
          </div>

          {/* Painel Avançado (Staff) */}
          {(community.currentUserRole === "OWNER" ||
            community.currentUserRole === "MODERATOR") && (
              <button
                type="button"
                onClick={() => setShowAdvanced(true)}
                className="w-full bg-slate-800 hover:bg-slate-700/80 border border-slate-700 p-3.5 rounded-xl flex items-center justify-between group transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-mint-500/10 rounded-lg text-mint-500 group-hover:bg-mint-500/20 transition-colors">
                    <Shield size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white">
                      Painel Avançado
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Gerenciar membros e configurações do grupo
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-slate-500 group-hover:text-white transition-colors"
                />
              </button>
            )}

          {/* Sair do Grupo (Membros normais ou Mods) */}
          {community.currentUserRole !== "OWNER" && (
            <button
              type="button"
              onClick={handleLeave}
              className="w-full text-xs font-bold text-slate-400 hover:text-red-400 py-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut size={14} /> Sair do Grupo
            </button>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-mint-500 hover:bg-mint-600 text-slate-900 font-bold py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-xs"
          >
            Salvar Preferências
          </button>
        </div>
      </div>
    </div>
  );
}

// Painel Avançado de Gestão (Modal 2 Colunas)
function AdvancedManagementModal({
  community,
  onClose,
  onUpdate,
  onDelete,
}: {
  community: Community;
  onClose: () => void;
  onUpdate?: (updated?: Community) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(community.name);
  const [desc, setDesc] = useState(community.description);
  const [bannerUrl, setBannerUrl] = useState(community.bannerUrl || "");
  const [avatarUrl, setAvatarUrl] = useState(community.avatarUrl || "");
  const [welcomeMessage, setWelcomeMessage] = useState(community.welcomeMessage || "");
  const [tags, setTags] = useState(community.tags.join(", "));
  const [isSaving, setIsSaving] = useState(false);

  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | RoleType>("ALL");
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const loadMembers = async () => {
      const data = await getMembersAction(community.id);
      setMembers(data);
    };
    loadMembers();
  }, [community.id]);

  const handleSave = async () => {
    setIsSaving(true);
    const tagsArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);

    try {
      const res = await updateCommunityAction(community.id, {
        name,
        description: desc,
        tags: tagsArray,
        welcomeMessage,
        bannerUrl,
        avatarUrl,
      });

      if (res.success) {
        if (onUpdate) {
          onUpdate({
            ...community,
            name,
            description: desc,
            tags: tagsArray,
            welcomeMessage,
            bannerUrl,
            avatarUrl,
          });
        }
        onClose();
      } else {
        alert(res.message || "Erro ao salvar alterações.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  const [activeTab, setActiveTab] = useState<"general" | "roles" | "members" | "bans" | "polls">("general");
  const [bannedMembers, setBannedMembers] = useState<any[]>([]);
  const [isLoadingBanned, setIsLoadingBanned] = useState(false);

  const loadBannedMembers = async () => {
    setIsLoadingBanned(true);
    try {
      const res = await getBannedMembersAction(community.id);
      if (res.success && res.data) {
        setBannedMembers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingBanned(false);
    }
  };

  useEffect(() => {
    if (activeTab === "bans") {
      loadBannedMembers();
    }
  }, [activeTab, community.id]);

  const handleUnban = async (userId: string) => {
    setIsActionLoading(userId);
    const res = await unbanMemberAction(community.id, userId);
    if (res.success) {
      setBannedMembers((prev) => prev.filter((b) => b.userId !== userId));
    } else {
      alert(res.message || "Erro ao desbanir membro.");
    }
    setIsActionLoading(null);
  };

  const filteredMembers = members.filter((m) => {
    if (m.role === "PENDING" || m.role === "REJECTED") return false;
    const matchesSearch = (m.name || "")
      .toLowerCase()
      .includes(memberSearch.toLowerCase());
    const matchesRole = roleFilter === "ALL" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="fixed inset-0 z-110 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e293b] w-full max-w-5xl h-[90vh] rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">

        {/* Header do Painel Avançado */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Shield className="text-mint-500" size={20} />
            <h2 className="font-bold text-white text-lg font-display">Gestão Avançada do Grupo</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Voltar
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Barra de Navegação por Abas */}
        <div className="flex items-center gap-1 px-4 pt-2 border-b border-slate-700/50 bg-slate-900/60 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${activeTab === "general"
              ? "border-mint-500 text-mint-400 bg-slate-800/60"
              : "border-transparent text-slate-400 hover:text-white"
              }`}
          >
            <Settings size={14} /> Geral & Identidade
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("roles")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${activeTab === "roles"
              ? "border-[#a855f7] text-purple-400 bg-slate-800/60"
              : "border-transparent text-slate-400 hover:text-white"
              }`}
          >
            <Crown size={14} /> Cargos & Permissões
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("members")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${activeTab === "members"
              ? "border-blue-400 text-blue-400 bg-slate-800/60"
              : "border-transparent text-slate-400 hover:text-white"
              }`}
          >
            <Users size={14} /> Membros ({filteredMembers.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bans")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${activeTab === "bans"
              ? "border-rose-400 text-rose-400 bg-slate-800/60"
              : "border-transparent text-slate-400 hover:text-white"
              }`}
          >
            <ShieldAlert size={14} /> Banidos
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("polls")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${activeTab === "polls"
              ? "border-amber-400 text-amber-400 bg-slate-800/60"
              : "border-transparent text-slate-400 hover:text-white"
              }`}
          >
            <Vote size={14} /> Enquetes
          </button>
        </div>

        {/* Conteúdo Dinâmico por Aba */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === "roles" && (
            <CommunityRoleManager communityId={community.id} />
          )}

          {activeTab === "polls" && (
            <CommunityPollWidget communityId={community.id} canCreatePolls={true} />
          )}

          {activeTab === "bans" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <h3 className="text-sm font-extrabold text-white font-display flex items-center gap-2">
                  <ShieldAlert size={18} className="text-rose-400" /> Membros Banidos Permanentemente
                </h3>
                <span className="text-xs text-slate-400">
                  {bannedMembers.length} {bannedMembers.length === 1 ? "banido" : "banidos"}
                </span>
              </div>

              {isLoadingBanned ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-rose-400" size={20} />
                </div>
              ) : bannedMembers.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-6 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
                  Nenhum usuário banido nesta comunidade.
                </p>
              ) : (
                <div className="space-y-2">
                  {bannedMembers.map((ban) => (
                    <div
                      key={ban.id}
                      className="p-3.5 bg-slate-900/80 border border-slate-700/80 rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={ban.userAvatar}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{ban.userName}</p>
                          <p className="text-[10px] text-slate-400">Motivo: {ban.reason || "Não especificado"}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isActionLoading === ban.userId}
                        onClick={() => handleUnban(ban.userId)}
                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isActionLoading === ban.userId ? "Removendo..." : "Desbanir Membro"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "general" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section className="space-y-4">
                <h3 className="text-xs font-bold text-mint-500 uppercase tracking-widest flex items-center gap-2 font-display">
                  <Camera size={14} /> Identidade Visual
                </h3>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase mb-2 block">
                    Banner da Comunidade
                  </label>
                  <div
                    onClick={() => bannerInputRef.current?.click()}
                    className="relative h-32 w-full rounded-2xl border-2 border-mint-500/80 overflow-hidden bg-slate-900 group cursor-pointer shadow-lg transition-all hover:border-mint-400 flex items-center justify-center"
                  >
                    {bannerUrl ? (
                      <img
                        src={bannerUrl}
                        className="w-full h-full object-cover brightness-75 group-hover:brightness-90 transition-all"
                        alt="Banner"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800" />
                    )}
                  </div>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerUpload}
                  />
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
