"use client";

import React from "react";
import Link from "next/link";
import { Avatar } from "@/components/atoms/Avatar";
import { Crown, Shield, ShieldCheck, Anchor, Mic, MicOff, Video, VideoOff, Monitor } from "lucide-react";

export interface UserIdentityObject {
  id?: string;
  name?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  avatar?: string | null;
  tipoPerfil?: "verificado" | "ancora" | "comum" | string | null;
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
  user?: UserIdentityObject;
  name?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  tipoPerfil?: "verificado" | "ancora" | "comum" | string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showBadges?: boolean;
  showStatusIcons?: boolean;
  className?: string;
  avatarClassName?: string;
  nameClassName?: string;
  subtitleClassName?: string;
  href?: string;
  clickable?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export function resolveUserAvatar(user?: UserIdentityObject | null, fallbackSeed?: string): string {
  if (!user) {
    const seed = fallbackSeed || "User";
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}`;
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
    url = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}`;
  }

  return url;
}

export const UserIdentity: React.FC<UserIdentityProps> = ({
  user,
  name,
  username,
  avatarUrl: avatarUrlProp,
  tipoPerfil: tipoPerfilProp,
  size = "sm",
  showBadges = true,
  showStatusIcons = false,
  className = "",
  avatarClassName = "",
  nameClassName = "",
  subtitleClassName = "",
  href,
  clickable = true,
  onClick,
  onContextMenu,
}) => {
  const displayName = name || user?.name || username || user?.username || "Usuário";
  const rawUsername = username || user?.username || displayName.toLowerCase().replace(/\s+/g, "");
  const cleanUsername = rawUsername.startsWith("@") ? rawUsername.substring(1) : rawUsername;
  const avatarUrl = avatarUrlProp || user?.avatarUrl || user?.avatar || resolveUserAvatar(user, displayName);
  const profileType = tipoPerfilProp || user?.tipoPerfil || "comum";

  const targetHref = href || (cleanUsername ? `/u/${cleanUsername}` : "/profile");

  const badgeSize =
    size === "xs" ? 11 : size === "sm" ? 13 : size === "md" ? 15 : size === "lg" ? 18 : 22;

  const content = (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`flex items-center gap-2.5 min-w-0 transition-colors group/user ${
        clickable ? "cursor-pointer" : ""
      } ${className}`}
    >
      {/* Avatar do Usuário */}
      <div className="relative shrink-0">
        <Avatar
          src={avatarUrl}
          alt={displayName}
          size={size as any}
          className={`${
            user?.isSpeaking
              ? "ring-2 ring-mint-500/50 border-mint-400 animate-pulse"
              : ""
          } ${avatarClassName}`}
        />
        {user?.status === "online" && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#50c878] border-2 border-slate-900 rounded-full" />
        )}
      </div>

      {/* Nome, Selo e @username do Usuário */}
      <div className="flex-1 min-w-0 flex flex-col justify-center leading-tight">
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
            } ${user?.isSpeaking ? "text-mint-300 font-bold" : ""} group-hover/user:text-[#50c878] transition-colors ${nameClassName}`}
          >
            {displayName}
          </span>

          {/* Selos de Perfil (Verificado, Âncora, Owner, Moderator) */}
          {showBadges && profileType === "verificado" && (
            <span title="Profissional Verificado" className="inline-flex shrink-0 text-sky-400">
              <ShieldCheck size={badgeSize} className="fill-sky-400/20" />
            </span>
          )}

          {showBadges && profileType === "ancora" && (
            <span title="Membro Âncora" className="inline-flex shrink-0 text-amber-400">
              <Anchor size={badgeSize} />
            </span>
          )}

          {user?.isLocal && (
            <span className="text-[10px] text-mint-400 font-mono font-normal shrink-0">
              (Você)
            </span>
          )}

          {showBadges && user?.role === "OWNER" && (
            <span title="Dono do Grupo" className="inline-flex shrink-0">
              <Crown size={13} className="text-[#FFC300]" />
            </span>
          )}

          {showBadges && user?.role === "MODERATOR" && (
            <span title="Moderador" className="inline-flex shrink-0">
              <Shield size={13} className="text-[#50c878]" />
            </span>
          )}
        </div>

        {/* @username logo abaixo do nome */}
        <span
          className={`text-[11px] text-slate-400 font-medium truncate ${
            user?.isSpeaking ? "text-mint-400" : ""
          } ${subtitleClassName}`}
        >
          {user?.subtitle || `@${cleanUsername}`}
        </span>
      </div>

      {/* Ícones de Áudio / Vídeo se necessário */}
      {showStatusIcons && user && (
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

  if (clickable && targetHref) {
    return (
      <Link href={targetHref} onClick={(e) => e.stopPropagation()}>
        {content}
      </Link>
    );
  }

  return content;
};
