"use client";

import React, { useState } from "react";
import {
  X,
  Shield,
  Crown,
  User,
  Check,
  Ban,
  MessageSquare,
  Link as LinkIcon,
  Video,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { CommunityMember, RoleType } from "@aletis/domain";
import {
  updateMemberRoleAction,
  updateMemberPermissionsAction,
  kickMemberAction,
  banMemberAction,
  muteMemberAction,
} from "@/app/actions/community-actions";

interface MemberProfileModalProps {
  communityId: string;
  member: CommunityMember;
  currentUserRole: RoleType | null;
  currentUserId?: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function MemberProfileModal({
  communityId,
  member,
  currentUserRole,
  currentUserId,
  onClose,
  onUpdate,
}: MemberProfileModalProps) {
  const [role, setRole] = useState<RoleType>(member.role);
  const [allowText, setAllowText] = useState(member.allowText ?? true);
  const [allowLinks, setAllowLinks] = useState(member.allowLinks ?? true);
  const [allowVideos, setAllowVideos] = useState(member.allowVideos ?? true);
  const [allowPhotos, setAllowPhotos] = useState(member.allowPhotos ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [isKicking, setIsKicking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canManage =
    (currentUserRole === "OWNER" || currentUserRole === "MODERATOR") &&
    member.role !== "OWNER" &&
    member.userId !== currentUserId;

  const handleRoleChange = async (newRole: RoleType) => {
    setRole(newRole);
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await updateMemberRoleAction(communityId, member.userId, newRole);
      if (res.message === "invitation_sent") {
        setMessage("Convite para moderador enviado por DM.");
      } else if (res.success) {
        setMessage("Cargo atualizado.");
        onUpdate();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePermission = async (
    key: "allowText" | "allowLinks" | "allowVideos" | "allowPhotos",
    currentVal: boolean
  ) => {
    const newVal = !currentVal;
    if (key === "allowText") setAllowText(newVal);
    if (key === "allowLinks") setAllowLinks(newVal);
    if (key === "allowVideos") setAllowVideos(newVal);
    if (key === "allowPhotos") setAllowPhotos(newVal);

    setIsSaving(true);
    try {
      await updateMemberPermissionsAction(communityId, member.userId, {
        [key]: newVal,
      });
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKick = async () => {
    if (!window.confirm(`Expulsar ${member.name} do grupo?`)) return;
    setIsKicking(true);
    try {
      const res = await kickMemberAction(communityId, member.userId);
      if (res.success) {
        onUpdate();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsKicking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-200 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#1e293b] max-w-md w-full rounded-3xl border border-slate-700/60 p-6 shadow-2xl animate-in zoom-in-95 duration-150 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative">
            <img
              src={member.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"}
              alt={member.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-mint-500/40 shadow-lg"
            />
            <div className="absolute -bottom-2 -right-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700">
              {member.role === "OWNER" && <Crown size={16} className="text-yellow-400" />}
              {member.role === "MODERATOR" && <Shield size={16} className="text-mint-400" />}
              {member.role === "MEMBER" && <User size={16} className="text-slate-400" />}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white font-display">
              @{member.name}
            </h3>
            <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {member.role === "OWNER" && "👑 Dono do Grupo"}
              {member.role === "MODERATOR" && "🛡️ Moderador"}
              {member.role === "MEMBER" && "👤 Membro"}
            </span>
          </div>

          {message && (
            <div className="bg-mint-500/10 border border-mint-500/30 text-mint-400 text-xs py-2 px-4 rounded-xl font-medium w-full">
              {message}
            </div>
          )}

          {canManage && (
            <div className="w-full mt-4 flex flex-col gap-4 text-left border-t border-slate-800 pt-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Gerenciar Cargo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleRoleChange("MEMBER")}
                    disabled={isSaving}
                    className={`py-2 px-3 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 border ${role === "MEMBER"
                        ? "bg-slate-800 text-white border-slate-600"
                        : "bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800"
                      }`}
                  >
                    <User size={14} /> Membro
                  </button>
                  <button
                    onClick={() => handleRoleChange("MODERATOR")}
                    disabled={isSaving}
                    className={`py-2 px-3 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 border ${role === "MODERATOR"
                        ? "bg-mint-500/20 text-mint-400 border-mint-500/40"
                        : "bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800"
                      }`}
                  >
                    <Shield size={14} /> Moderador
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Permissões de Envio de Conteúdo
                </label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-xs font-medium text-slate-300 flex items-center gap-2">
                      <MessageSquare size={14} className="text-slate-400" />
                      Enviar Mensagens de Texto
                    </span>
                    <button
                      onClick={() => handleTogglePermission("allowText", allowText)}
                      className={`w-10 h-6 rounded-full transition-colors relative ${allowText ? "bg-mint-500" : "bg-slate-700"
                        }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${allowText ? "right-1" : "left-1"
                          }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-xs font-medium text-slate-300 flex items-center gap-2">
                      <LinkIcon size={14} className="text-slate-400" />
                      Postar Links Externos
                    </span>
                    <button
                      onClick={() => handleTogglePermission("allowLinks", allowLinks)}
                      className={`w-10 h-6 rounded-full transition-colors relative ${allowLinks ? "bg-mint-500" : "bg-slate-700"
                        }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${allowLinks ? "right-1" : "left-1"
                          }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-xs font-medium text-slate-300 flex items-center gap-2">
                      <Video size={14} className="text-slate-400" />
                      Enviar Vídeos
                    </span>
                    <button
                      onClick={() => handleTogglePermission("allowVideos", allowVideos)}
                      className={`w-10 h-6 rounded-full transition-colors relative ${allowVideos ? "bg-mint-500" : "bg-slate-700"
                        }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${allowVideos ? "right-1" : "left-1"
                          }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-xs font-medium text-slate-300 flex items-center gap-2">
                      <ImageIcon size={14} className="text-slate-400" />
                      Enviar Fotos & Imagens
                    </span>
                    <button
                      onClick={() => handleTogglePermission("allowPhotos", allowPhotos)}
                      className={`w-10 h-6 rounded-full transition-colors relative ${allowPhotos ? "bg-mint-500" : "bg-slate-700"
                        }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${allowPhotos ? "right-1" : "left-1"
                          }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={handleKick}
                  disabled={isKicking}
                  className="py-2.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-xl border border-red-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isKicking ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <>
                      <Ban size={15} /> Expulsar
                    </>
                  )}
                </button>

                <button
                  onClick={async () => {
                    const reason = window.prompt(`Motivo do banimento de @${member.name}:`);
                    if (reason === null) return;
                    setIsSaving(true);
                    try {
                      const res = await banMemberAction(communityId, member.userId, reason || "Violação de regras");
                      if (res.success) {
                        setMessage("Membro banido com sucesso.");
                        onUpdate();
                        onClose();
                      } else {
                        setMessage(res.message || "Erro ao banir membro.");
                      }
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                  className="py-2.5 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 font-bold text-xs rounded-xl border border-red-600/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Ban size={15} /> Banir
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Silenciar Membro (Mute)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={async () => {
                      setIsSaving(true);
                      await muteMemberAction(communityId, member.userId, 15);
                      setMessage("Membro silenciado por 15 minutos.");
                      setIsSaving(false);
                    }}
                    disabled={isSaving}
                    className="py-2 px-2 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-medium text-xs rounded-xl border border-slate-800 transition-colors text-center"
                  >
                    15 min
                  </button>
                  <button
                    onClick={async () => {
                      setIsSaving(true);
                      await muteMemberAction(communityId, member.userId, 60);
                      setMessage("Membro silenciado por 1 hora.");
                      setIsSaving(false);
                    }}
                    disabled={isSaving}
                    className="py-2 px-2 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-medium text-xs rounded-xl border border-slate-800 transition-colors text-center"
                  >
                    1 hora
                  </button>
                  <button
                    onClick={async () => {
                      setIsSaving(true);
                      await muteMemberAction(communityId, member.userId, 1440);
                      setMessage("Membro silenciado por 24 horas.");
                      setIsSaving(false);
                    }}
                    disabled={isSaving}
                    className="py-2 px-2 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-medium text-xs rounded-xl border border-slate-800 transition-colors text-center"
                  >
                    24 horas
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
