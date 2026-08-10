"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Feather, Zap, Bell, MessageSquare, UserPlus, Shield, ExternalLink, Loader2 } from "lucide-react";
import { getUserVibesAndNotificationsAction } from "@/app/actions/user-actions";
import { getDetailedNotificationsAction, markNotificationsAsReadAction, NotificationItem } from "@/app/actions/connection-actions";

export function Header() {
  const [vibes, setVibes] = useState(50);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchStatus = async () => {
    const res = await getUserVibesAndNotificationsAction();
    setVibes(res.vibes);
    setNotificationsCount(res.notifications);
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTogglePopover = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      setIsLoading(true);
      const detailed = await getDetailedNotificationsAction();
      setItems(detailed);
      await markNotificationsAsReadAction();
      setNotificationsCount(0);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-4 flex justify-between items-center shadow-lg h-18.25">
      <Link href="/feed" className="flex items-center gap-2 text-white group select-none">
        <div className="w-10 h-10 rounded-2xl bg-[#50c878]/10 border border-[#50c878]/30 flex items-center justify-center group-hover:scale-105 transition-transform">
          <Feather className="text-[#50c878] group-hover:rotate-12 transition-transform" size={22} />
        </div>
        <span className="text-xl font-extrabold tracking-tight font-display text-white">
          ALETIS
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700/80 shadow-inner hover:border-[#FFC300]/50 transition-all select-none">
          <Zap className="text-[#FFC300] scale-110" size={16} fill="#FFC300" />
          <span className="font-extrabold text-[#FFC300] tracking-wider text-xs">
            {vibes} VIBES
          </span>
        </div>

        {/* Notificações (Sino + Dropdown) */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={handleTogglePopover}
            className="relative p-2.5 rounded-2xl border border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white hover:border-slate-700 transition-all group cursor-pointer"
            title="Notificações e Conexões"
          >
            <Bell size={20} className="group-hover:text-[#50c878] transition-colors" />
            {notificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center border-2 border-[#0f172a] animate-bounce">
                {notificationsCount > 9 ? "9+" : notificationsCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-3 w-80 md:w-96 bg-[#0f172a] border border-slate-700/90 rounded-3xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <h3 className="font-extrabold text-sm text-white font-display flex items-center gap-2">
                  <Bell size={16} className="text-[#50c878]" /> Notificações
                </h3>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                  {notificationsCount} novas
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 p-2">
                {isLoading ? (
                  <div className="flex justify-center items-center py-8 text-slate-400">
                    <Loader2 className="animate-spin text-[#50c878]" size={20} />
                  </div>
                ) : items.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs font-medium">
                    Nenhuma notificação nova no momento.
                  </div>
                ) : (
                  items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.linkUrl}
                      onClick={() => setIsOpen(false)}
                      className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={item.avatarUrl || "https://api.dicebear.com/7.x/initials/svg?seed=User"}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover bg-slate-800"
                        />
                        <span className="absolute -bottom-1 -right-1 p-1 bg-slate-900 rounded-full border border-slate-700 text-[#50c878]">
                          {item.type === "dm_message" && <MessageSquare size={10} />}
                          {item.type === "friend_message" && <MessageSquare size={10} className="text-[#50c878]" />}
                          {item.type === "friend_request" && <UserPlus size={10} className="text-blue-400" />}
                          {item.type === "group_invite" && <Shield size={10} className="text-amber-400" />}
                          {(item.type === "group_chat_message" || item.type === "following_group_chat") && (
                            <MessageSquare size={10} className="text-purple-400" />
                          )}
                          {item.type === "following_post" && <Feather size={10} className="text-[#50c878]" />}
                          {item.type === "following_atrio" && <Zap size={10} className="text-[#FFC300]" />}
                          {item.type === "following_group_post" && <Shield size={10} className="text-purple-400" />}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h4 className="font-bold text-xs text-white truncate group-hover:text-[#50c878] transition-colors">
                            {item.title}
                          </h4>
                          <span className="text-[9px] text-slate-500 shrink-0">{item.createdAt}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              <div className="p-3 border-t border-slate-800 bg-slate-900/40 text-center">
                <Link
                  href="/connections"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold text-[#50c878] hover:underline flex items-center justify-center gap-1"
                >
                  Ver Central de Conexões <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

