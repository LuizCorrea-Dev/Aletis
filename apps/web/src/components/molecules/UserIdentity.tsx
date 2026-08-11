"use client";

import React from "react";
import { Avatar } from "@/components/atoms/Avatar";
import { Crown, Shield, Mic, MicOff, Video, VideoOff, Monitor } from "lucide-react";

export interface UserIdentityObject {
  id?: string;
  name?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  avatar?: string | null;
  role?: "OWNER" | "MODERATOR" | "MEMBER" | "PENDING" | string | null;
  isLocal?: boolean;
  isSpeaking?: boolean;
  isMicOn?: boolean;
  isCamOn?: boolean;
  isScreenOn?: boolean;
  subtitle?: string | null;
  status?: "online" | "offline" | "busy" | string | null;
  metadata?: string | null;
}

export interface UserIdentityProps {
  user: UserIdentityObject;
  size?: "xs" | "sm" | "md" | "lg";
  showBadges?: boolean;
  showStatusIcons?: boolean;
  className?: string;
  avatarClassName?: string;
  nameClassName?: string;
  subtitleClassName?: string;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export function resolveUserAvatar(user?: UserIdentityObject | null, fallbackSeed?: string): string {
  if (!user) {
    const seed = fallbackSeed || "User";
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
  }

  let url = user.avatarUrl || user.avatar;

  if (!url && user.metadata) {
    try {
      const parsed = JSON.parse(user.metadata);
      if (parsed.avatarUrl) url = parsed.avatarUrl;
      else if (parsed.avatar) url = parsed.avatar;
    } catch {}
  }

  if (!url || url.trim() === "") {
    const seed = user.name || user.username || user.id || fallbackSeed || "User";
    url = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
  }

  return url;
}

export const UserIdentity: React.FC<UserIdentityProps> = ({
  user,
  size = "sm",
  showBadges = true,
  showStatusIcons = false,
  className = "",
  avatarClassName = "",
  nameClassName = "",
  subtitleClassName = "",
  onClick,
  onContextMenu,
}) => {
  const displayName = user.name || user.username || "Usuário";
  const avatarUrl = resolveUserAvatar(user, displayName);

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`flex items-center gap-2.5 min-w-0 transition-colors ${className}`}
    >
      {/* Avatar do Usuário */}
      <div className="relative shrink-0">
        <Avatar
          src={avatarUrl}
          alt={displayName}
          size={size}
          className={`${
            user.isSpeaking
              ? "ring-2 ring-mint-500/50 border-mint-400 animate-pulse"
              : ""
          } ${avatarClassName}`}
        />
        {user.status === "online" && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-mint-500 border-2 border-slate-900 rounded-full" />
        )}
      </div>

      {/* Nome e Informações do Usuário */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`font-semibold truncate text-white ${
              size === "xs"
                ? "text-xs"
                : size === "sm"
                ? "text-xs"
                : size === "md"
                ? "text-sm"
                : "text-base"
            } ${user.isSpeaking ? "text-mint-300 font-bold" : ""} ${nameClassName}`}
          >
            {displayName}
          </span>

          {user.isLocal && (
            <span className="text-[10px] text-mint-400 font-mono font-normal shrink-0">
              (Você)
            </span>
          )}

          {showBadges && user.role === "OWNER" && (
            <span title="Dono do Grupo" className="inline-flex shrink-0">
              <Crown size={13} className="text-gold-450" />
            </span>
          )}

          {showBadges && user.role === "MODERATOR" && (
            <span title="Moderador" className="inline-flex shrink-0">
              <Shield size={13} className="text-mint-500" />
            </span>
          )}
        </div>

        {user.subtitle && (
          <p
            className={`text-[10px] text-slate-400 font-mono truncate ${
              user.isSpeaking ? "text-mint-400" : ""
            } ${subtitleClassName}`}
          >
            {user.subtitle}
          </p>
        )}
      </div>

      {/* Ícones de Áudio / Vídeo / Tela opcional */}
      {showStatusIcons && (
        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {user.isScreenOn && <Monitor size={13} className="text-mint-400" />}
          {user.isCamOn ? (
            <Video size={13} className="text-mint-400" />
          ) : (
            <VideoOff size={13} className="text-slate-600" />
          )}
          {user.isMicOn ? (
            <Mic
              size={13}
              className={user.isSpeaking ? "text-mint-400" : "text-slate-400"}
            />
          ) : (
            <MicOff size={13} className="text-red-400/80" />
          )}
        </div>
      )}
    </div>
  );
};
