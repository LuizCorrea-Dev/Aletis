"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Hash,
  Volume2,
  Settings,
  MessageSquare,
  ChevronDown,
  Menu,
  X,
  Loader2,
  Clock,
  Check,
  Shield,
  Users,
  BellOff,
  Crown,
  LogOut,
  AlertOctagon,
  Lock,
  Plus,
  Trash2,
  Pencil,
  MoreVertical,
  Ban,
  User,
  Video,
  Mic,
  MicOff,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  UserPlus,
  UserCheck,
} from "lucide-react";
import {
  requestFriendshipAction,
  toggleFollowAction,
} from "@/app/actions/connection-actions";
import {
  joinCommunityAction,
  leaveCommunityAction,
  approveAccessAction,
  rejectAccessAction,
  kickMemberAction,
  updateMemberRoleAction,
  banMemberAction,
  muteMemberAction,
  getMembersAction,
  getChannelsAction,
  deleteChannelAction,
} from "@/app/actions/community-actions";
import { Community, Channel, CommunityMember, RoleType } from "@aletis/domain";
import CommunityChat from "./CommunityChat";
import CommunityFeed from "./CommunityFeed";
import CommunityVoice from "./CommunityVoice";
import CommunitySettings from "./CommunitySettings";
import CreateChannelModal from "./CreateChannelModal";
import EditChannelModal from "./EditChannelModal";
import MemberProfileModal from "./MemberProfileModal";
import { UserIdentity } from "@/components/molecules/UserIdentity";


interface CommunityViewClientProps {
  initialCommunity: Community;
  initialChannels: Channel[];
  currentUserProfile: {
    id: string;
    username: string;
    avatarUrl: string;
  } | null;
}

export default function CommunityViewClient({
  initialCommunity,
  initialChannels,
  currentUserProfile,
}: CommunityViewClientProps) {
  const router = useRouter();
  const [community, setCommunity] = useState<Community>(initialCommunity);
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(initialChannels[0] || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommunitySidebarCollapsed, setIsCommunitySidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const getAvatarUrl = (participant: any) => {
    if (!participant) return "https://api.dicebear.com/7.x/avataaars/svg?seed=User";
    try {
      if (participant.metadata) {
        const parsed = JSON.parse(participant.metadata);
        if (parsed.avatarUrl) return parsed.avatarUrl;
      }
    } catch {}
    const seed = participant.name || participant.identity || "User";
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  };
  const [isJoining, setIsJoining] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"channels" | "members">("channels");
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [createChannelType, setCreateChannelType] = useState<"CHAT" | "VOICE">("CHAT");
  const [selectedMemberForModal, setSelectedMemberForModal] = useState<CommunityMember | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; member: CommunityMember } | null>(null);

  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [voiceParticipants, setVoiceParticipants] = useState<any[]>([]);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleChannelCreated = (newChannel: Channel) => {
    setChannels((prev) => [...prev, newChannel]);
    setActiveChannel(newChannel);
  };

  const handleChannelUpdated = (updatedChannel: Channel) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === updatedChannel.id ? updatedChannel : c))
    );
    if (activeChannel?.id === updatedChannel.id) {
      setActiveChannel(updatedChannel);
    }
  };


  const fetchCommunityData = async () => {
    try {
      const freshChannels = await getChannelsAction(community.id);
      setChannels(freshChannels);
      if (freshChannels.length > 0 && !activeChannel) {
        setActiveChannel(freshChannels[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const refreshMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const data = await getMembersAction(community.id);
      setMembers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (sidebarTab === "members") {
      refreshMembers();
    }
  }, [sidebarTab]);

  const handleJoinCommunity = async () => {
    setIsJoining(true);
    try {
      const res = await joinCommunityAction(community.id);
      if (res.success && res.data) {
        setCommunity((prev) => ({
          ...prev,
          currentUserRole: res.data.role,
          isMember: res.data.role === "MEMBER" || res.data.role === "OWNER" || res.data.role === "MODERATOR",
        }));
        fetchCommunityData();
      } else {
        alert("Erro ao participar da comunidade.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!window.confirm("Deseja mesmo sair desta comunidade?")) return;
    try {
      const res = await leaveCommunityAction(community.id);
      if (res.success) {
        router.push("/communities");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleApproveMember = async (userId: string) => {
    const res = await approveAccessAction(community.id, userId);
    if (res.success) {
      refreshMembers();
    }
  };

  const handleRejectMember = async (userId: string) => {
    const res = await rejectAccessAction(community.id, userId);
    if (res.success) {
      refreshMembers();
    }
  };

  const handleKickMember = async (userId: string) => {
    if (!window.confirm("Deseja mesmo expulsar este membro?")) return;
    const res = await kickMemberAction(community.id, userId);
    if (res.success) {
      refreshMembers();
    }
  };

  const handlePromoteMember = async (userId: string, currentRole: RoleType) => {
    const nextRoleMap: Record<RoleType, RoleType> = {
      MEMBER: "MODERATOR",
      MODERATOR: "MEMBER",
      OWNER: "OWNER",
      PENDING: "MEMBER",
      REJECTED: "PENDING",
    };
    const nextRole = nextRoleMap[currentRole];
    if (nextRole === currentRole) return;

    const res = await updateMemberRoleAction(community.id, userId, nextRole);
    if (res.success) {
      alert(res.message === "invitation_sent" ? "Convite de moderação enviado por mensagem direta!" : "Cargo atualizado!");
      refreshMembers();
    }
  };

  const handleDeleteChannel = async (e: React.MouseEvent, channelId: string) => {
    e.stopPropagation();
    if (channels.length <= 1) {
      alert("A comunidade precisa de pelo menos 1 canal.");
      return;
    }
    if (!window.confirm("Tem certeza que deseja excluir este canal?")) return;

    const res = await deleteChannelAction(community.id, channelId);
    if (res.success) {
      const updated = channels.filter((c) => c.id !== channelId);
      setChannels(updated);
      if (activeChannel?.id === channelId) {
        setActiveChannel(updated[0] || null);
      }
    } else {
      alert("Erro ao excluir o canal.");
    }
  };

  const isMember = community.isMember;
  const isPending = community.currentUserRole === "PENDING";
  const hasModerationPower = community.currentUserRole === "OWNER" || community.currentUserRole === "MODERATOR";

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-73px-80px)] xl:h-[calc(100vh-73px)] overflow-hidden max-w-full mx-auto relative">

      {/* Banner de Não Membros */}
      {!isMember && (
        <div className="absolute bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:min-w-112.5 z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-slate-900/95 border border-slate-800 p-5 rounded-3xl shadow-2xl flex items-center justify-between gap-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              {community.privacy === "PRIVATE" ? (
                <Lock className="text-gold-400" size={20} />
              ) : (
                <Users className="text-mint-500" size={20} />
              )}
              <div>
                <p className="text-white font-bold text-sm">
                  {isPending ? "Solicitação Pendente" : "Modo Visitante"}
                </p>
                <p className="text-slate-400 text-xs">
                  {isPending ? "Aguarde a aprovação dos moderadores." : "Junte-se à tribo para interagir!"}
                </p>
              </div>
            </div>

            <button
              onClick={handleJoinCommunity}
              disabled={isPending || isJoining}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95 ${isPending
                  ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-default"
                  : "bg-mint-500 hover:bg-mint-600 text-slate-900 shadow-[0_0_15px_rgba(80,200,120,0.2)]"
                }`}
            >
              {isJoining ? (
                <Loader2 className="animate-spin" size={16} />
              ) : isPending ? (
                <>Aguardando <Clock size={16} /></>
              ) : (
                <>Participar <Check size={16} /></>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Header Mobile */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-850 shrink-0 z-40">
        <div className="flex items-center gap-2.5 font-bold text-white overflow-hidden">
          <img src={community.avatarUrl} className="w-8 h-8 rounded-lg object-cover" alt="" />
          <span className="truncate text-sm font-display">{community.name}</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="text-slate-300 p-1.5 hover:bg-slate-800 rounded-xl">
          <Menu size={20} />
        </button>
      </div>

      {/* Sidebar de Canais/Membros */}
      <aside
        className={`
          fixed top-18.25 bottom-0 left-0 z-60 w-64 bg-slate-900/95 border-r border-slate-700/80 flex flex-col shrink-0
          md:relative md:top-0 md:bottom-auto md:inset-auto md:h-full md:bg-slate-800/30 md:backdrop-blur-sm
          transition-all duration-300 overflow-hidden
          ${isCommunitySidebarCollapsed ? "md:w-0 md:opacity-0 md:border-r-0 md:pointer-events-none" : "md:w-64 md:opacity-100"}
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Topo da Sidebar */}
        <div className="p-4 border-b border-slate-700/80 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold text-white truncate text-base font-display flex-1">
              {community.name}
            </h2>
            
            {/* Botão de Ocultar Menu da Comunidade */}
            <button
              type="button"
              onClick={() => {
                setIsSidebarOpen(false);
                setIsCommunitySidebarCollapsed(true);
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
              title="Ocultar Menu do Grupo"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>

          {isMember ? (
            <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-850">
              <button
                onClick={() => setSidebarTab("channels")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${sidebarTab === "channels" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                Canais
              </button>
              <button
                onClick={() => setSidebarTab("members")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${sidebarTab === "members" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                Membros
              </button>
            </div>
          ) : (
            <div className="text-center py-2 bg-slate-950/30 rounded-xl border border-slate-850">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Modo Leitura
              </span>
            </div>
          )}
        </div>

        {/* Lista de Canais/Membros */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {community.isSuspended && hasModerationPower && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 flex flex-col gap-1 mx-1">
              <span className="text-red-400 font-bold text-xs flex items-center gap-1.5">
                <AlertOctagon size={14} /> Grupo Suspenso
              </span>
              <span className="text-[10px] text-red-300 leading-normal">
                Este grupo está temporariamente suspenso pela moderação.
              </span>
            </div>
          )}

          {sidebarTab === "channels" ? (
            <div className="space-y-4">
              {/* Canais de Texto */}
              <div>
                <div className="flex items-center justify-between px-2.5 mb-2 group">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Canais de Texto
                  </h3>
                  {hasModerationPower && (
                    <button
                      type="button"
                      onClick={() => {
                        setCreateChannelType("CHAT");
                        setIsCreateChannelOpen(true);
                      }}
                      className="text-slate-500 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Criar Canal de Texto"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  {channels
                    .filter((c) => c.type === "FEED" || c.type === "CHAT")
                    .map((channel) => (
                      <div
                        key={channel.id}
                        onClick={() => {
                          setActiveChannel(channel);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors group cursor-pointer ${activeChannel?.id === channel.id
                            ? "bg-mint-500/10 text-mint-450 font-bold"
                            : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                          }`}
                      >
                        {channel.type === "FEED" ? (
                          <MessageSquare size={16} className="shrink-0" />
                        ) : (
                          <Hash size={16} className="shrink-0" />
                        )}
                        <span className="truncate text-left flex-1">{channel.name}</span>
                        {channel.isPrivate && (
                          <Lock size={12} className="text-slate-500 shrink-0" />
                        )}
                        {hasModerationPower && (
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingChannel(channel);
                              }}
                              className="text-slate-500 hover:text-mint-400 p-1 rounded transition-colors"
                              title="Editar canal"
                            >
                              <Pencil size={13} />
                            </button>
                            {channels.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteChannel(e, channel.id)}
                                className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                                title="Excluir canal"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                </div>
              </div>

              {/* Canais de Voz */}
              {isMember && (
                <div>
                  <div className="flex items-center justify-between px-2.5 mb-2 group">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Canais de Voz
                    </h3>
                    {hasModerationPower && (
                      <button
                        type="button"
                        onClick={() => {
                          setCreateChannelType("VOICE");
                          setIsCreateChannelOpen(true);
                        }}
                        className="text-slate-500 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Criar Canal de Voz"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    {channels
                      .filter((c) => c.type === "VOICE")
                      .map((channel) => {
                        const isActive = activeChannel?.id === channel.id;

                        return (
                          <div key={channel.id} className="space-y-0.5">
                            <div
                              onClick={() => {
                                if (activeChannel?.id !== channel.id) {
                                  setVoiceParticipants([]);
                                }
                                setActiveChannel(channel);
                                setIsSidebarOpen(false);
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors group cursor-pointer ${
                                isActive
                                  ? "bg-mint-500/10 text-mint-450 font-bold"
                                  : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                              }`}
                            >
                              <Volume2
                                size={16}
                                className={`shrink-0 ${
                                  isActive ? "text-mint-400 animate-pulse" : ""
                                }`}
                              />
                              <span className="truncate text-left flex-1">
                                {channel.name}
                              </span>
                              {channel.isPrivate && (
                                <Lock size={12} className="text-slate-500 shrink-0" />
                              )}
                              {hasModerationPower && (
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingChannel(channel);
                                    }}
                                    className="text-slate-500 hover:text-mint-400 p-1 rounded transition-colors"
                                    title="Editar canal"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  {channels.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={(e) => handleDeleteChannel(e, channel.id)}
                                      className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                                      title="Excluir canal"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* SUB-LISTA ESTILO DISCORD: Membros conectados na chamada de voz */}
                            {isActive && voiceParticipants.length > 0 && (
                              <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-mint-500/30 ml-4 animate-in fade-in slide-in-from-top-1 duration-150">
                                {voiceParticipants.map((p) => {
                                  const name = p.name || p.identity || "Membro";
                                  const isSpeaking = p.isSpeaking;
                                  const isMicOn = p.isMicrophoneEnabled;
                                  const isCamOn = p.isCameraEnabled;

                                  return (
                                    <div
                                      key={p.sid}
                                      className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-slate-800/60 text-xs text-slate-300 transition-colors group/user cursor-default"
                                    >
                                      <UserIdentity
                                        user={{
                                          id: p.identity,
                                          name,
                                          avatarUrl: getAvatarUrl(p),
                                          isSpeaking,
                                          isMicOn,
                                          isCamOn,
                                          isLocal: p.isLocal,
                                          metadata: p.metadata,
                                        }}
                                        size="xs"
                                        showStatusIcons={true}
                                        className="flex-1"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-2.5">
                Membros da Tribo
              </h3>
              {isLoadingMembers ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin text-slate-500" size={20} />
                </div>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.userId}
                      onClick={() => setSelectedMemberForModal(member)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setContextMenu({ x: e.clientX, y: e.clientY, member });
                      }}
                      className="group flex items-center justify-between p-2 rounded-xl bg-slate-800/20 border border-slate-850 hover:bg-slate-800/60 transition-all cursor-pointer relative select-none"
                    >
                      <UserIdentity
                        user={{
                          id: member.userId,
                          name: member.name,
                          avatarUrl: member.avatar,
                          role: member.role,
                        }}
                        size="xs"
                        showBadges={true}
                        className="flex-1 min-w-0"
                      />

                      {/* Badges e Ações de Moderação */}
                      <div className="flex items-center gap-1.5">
                        {member.role === "OWNER" && (
                          <span title="Dono" className="inline-flex">
                            <Crown size={12} className="text-gold-450 shrink-0" />
                          </span>
                        )}
                        {member.role === "MODERATOR" && (
                          <span title="Moderador" className="inline-flex">
                            <Shield size={12} className="text-mint-500 shrink-0" />
                          </span>
                        )}

                        {/* Ações de aprovação para solicitações privadas */}
                        {hasModerationPower && member.role === "PENDING" && (
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveMember(member.userId);
                              }}
                              className="p-1 bg-mint-500/20 hover:bg-mint-500 text-mint-500 hover:text-slate-900 rounded-lg transition-colors"
                              title="Aprovar"
                            >
                              <Check size={10} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectMember(member.userId);
                              }}
                              className="p-1 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-colors"
                              title="Rejeitar"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        )}

                        {/* Botão de 3 Pontinhos / Engrenagem no Hover / Mobile */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMemberForModal(member);
                          }}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/70 rounded-lg transition-colors opacity-80 md:opacity-0 group-hover:opacity-100"
                          title="Gerenciar cargo e permissões"
                        >
                          <MoreVertical size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé da Sidebar (Fiel ao web-legacy) */}
        <div className="p-3 bg-slate-900/50 border-t border-slate-700/50 flex items-center justify-between gap-3">
          <UserIdentity
            user={{
              id: currentUserProfile?.id,
              name: currentUserProfile?.username || "Você",
              avatarUrl: currentUserProfile?.avatarUrl,
              status: "online",
              subtitle: "Online",
            }}
            size="sm"
            className="flex-1 min-w-0"
          />

          {community.isMuted && (
            <div className="text-slate-500" title="Silenciado">
              <BellOff size={16} />
            </div>
          )}

          {isMember && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
              title="Configurações da Comunidade"
            >
              <Settings size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
        {!activeChannel ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8">
            <Hash size={48} className="mb-4 text-slate-600" />
            <p className="text-sm font-semibold">Selecione ou crie um canal para interagir.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header do Canal */}
            <div className="px-4 md:px-6 py-3.5 bg-slate-900/40 border-b border-slate-800 shrink-0 flex items-center justify-between z-15 backdrop-blur-md">
              <div className="flex items-center gap-3">
                {/* Botão de Expandir o Menu da Comunidade quando colapsado ou no mobile */}
                {(isCommunitySidebarCollapsed || !isSidebarOpen) && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCommunitySidebarCollapsed(false);
                      setIsSidebarOpen(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-mint-400 rounded-xl font-bold text-xs border border-slate-700/80 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                    title="Mostrar Menu da Comunidade"
                  >
                    <PanelLeftOpen size={16} />
                    <span className="hidden sm:inline">Menu da Comunidade</span>
                  </button>
                )}

                <div className="flex items-center gap-2">
                  {activeChannel.type === "FEED" ? (
                    <MessageSquare className="text-mint-500" size={18} />
                  ) : activeChannel.type === "VOICE" ? (
                    <Volume2 className="text-mint-500" size={18} />
                  ) : (
                    <Hash className="text-mint-500" size={18} />
                  )}
                  <h1 className="font-bold text-white text-base leading-tight font-display">{activeChannel.name}</h1>
                </div>
              </div>
            </div>

            {/* Painel Central */}
            <div className="flex-1 overflow-hidden relative">
              {activeChannel.type === "FEED" && (
                <CommunityFeed
                  key={activeChannel.id}
                  community={community}
                  isMember={!!isMember}
                  canModeratorDelete={hasModerationPower}
                />
              )}
              {activeChannel.type === "CHAT" && (
                <CommunityChat
                  key={activeChannel.id}
                  communityId={community.id}
                  channel={activeChannel}
                  isMember={!!isMember}
                  currentUserProfile={currentUserProfile}
                  canModeratorDelete={hasModerationPower}
                  onMemberClick={(userId, userName, userAvatar) => {
                    const existing = members.find((m) => m.userId === userId);
                    if (existing) {
                      setSelectedMemberForModal(existing);
                    } else {
                      setSelectedMemberForModal({
                        userId: userId,
                        name: userName || "Usuário",
                        avatar: userAvatar || "https://api.dicebear.com/7.x/avataaars/svg",
                        role: "MEMBER",
                        allowText: true,
                        allowLinks: true,
                        allowVideos: true,
                        allowPhotos: true,
                      });
                    }
                  }}
                />
              )}
              {activeChannel.type === "VOICE" && (
                <CommunityVoice
                  channel={activeChannel}
                  currentUserProfile={currentUserProfile}
                  onParticipantsChange={setVoiceParticipants}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modais */}
      {isSettingsOpen && (
        <CommunitySettings
          community={community}
          onClose={() => setIsSettingsOpen(false)}
          onUpdate={(updated) => {
            if (updated) setCommunity(updated);
            setIsSettingsOpen(false);
          }}
        />
      )}

      {isCreateChannelOpen && (
        <CreateChannelModal
          communityId={community.id}
          initialType={createChannelType}
          onClose={() => setIsCreateChannelOpen(false)}
          onCreated={handleChannelCreated}
        />
      )}

      {editingChannel && (
        <EditChannelModal
          communityId={community.id}
          channel={editingChannel}
          onClose={() => setEditingChannel(null)}
          onUpdated={handleChannelUpdated}
        />
      )}


      {selectedMemberForModal && (
        <MemberProfileModal
          member={selectedMemberForModal}
          currentUserRole={community.currentUserRole || "MEMBER"}
          communityId={community.id}
          onClose={() => setSelectedMemberForModal(null)}
          onUpdate={() => {
            refreshMembers();
            setSelectedMemberForModal(null);
          }}
        />
      )}

      {/* Menu de Contexto Flutuante (Estilo Discord) */}
      {contextMenu && (
        <div
          style={{
            top: `${Math.min(contextMenu.y, window.innerHeight - 200)}px`,
            left: `${Math.min(contextMenu.x, window.innerWidth - 220)}px`,
          }}
          className="fixed z-[300] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-1.5 min-w-[210px] animate-in fade-in zoom-in-95 duration-100 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 border-b border-slate-800 text-xs font-bold text-slate-300 truncate flex items-center justify-between">
            <span>@{contextMenu.member.name}</span>
            {contextMenu.member.role === "OWNER" && <Crown size={12} className="text-gold-450" />}
            {contextMenu.member.role === "MODERATOR" && <Shield size={12} className="text-mint-500" />}
          </div>

          <div className="py-1 space-y-0.5">
            <button
              onClick={() => {
                setSelectedMemberForModal(contextMenu.member);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-mint-500/10 hover:text-mint-400 rounded-xl transition-colors text-left cursor-pointer font-bold"
            >
              <User size={14} className="text-mint-400" /> Ver Perfil & Permissões
            </button>

            {contextMenu.member.userId !== currentUserProfile?.id && (
              <>
                <button
                  onClick={async () => {
                    const targetId = contextMenu.member.userId;
                    setContextMenu(null);
                    const res = await requestFriendshipAction(targetId);
                    alert(res.success ? "Solicitação de amizade enviada com sucesso!" : (res.message || "Não foi possível enviar a solicitação."));
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-mint-500/10 hover:text-mint-400 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <UserPlus size={14} className="text-mint-400" /> Adicionar Amigo
                </button>

                <button
                  onClick={async () => {
                    const targetId = contextMenu.member.userId;
                    setContextMenu(null);
                    const res = await toggleFollowAction(targetId);
                    if (res.success) {
                      alert(res.isFollowing ? `Você agora está seguindo ${contextMenu.member.name}!` : `Você deixou de seguir ${contextMenu.member.name}.`);
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-indigo-500/10 hover:text-indigo-300 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <UserCheck size={14} className="text-indigo-400" /> Seguir / Deixar de Seguir
                </button>
              </>
            )}

            {hasModerationPower &&
              contextMenu.member.role !== "OWNER" &&
              contextMenu.member.userId !== currentUserProfile?.id && (
                <>
                  <button
                    onClick={() => {
                      handlePromoteMember(contextMenu.member.userId, contextMenu.member.role);
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <Shield size={14} />{" "}
                    {contextMenu.member.role === "MODERATOR" ? "Rebaixar a Membro" : "Promover a Moderador"}
                  </button>

                  <button
                    onClick={() => {
                      handleKickMember(contextMenu.member.userId);
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <X size={14} /> Expulsar do Grupo
                  </button>

                  <button
                    onClick={() => {
                      setSelectedMemberForModal(contextMenu.member);
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <Ban size={14} /> Banir / Silenciar
                  </button>
                </>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
