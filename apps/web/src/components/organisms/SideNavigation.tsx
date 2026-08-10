"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Sparkles,
  User,
  Building2,
  MessageCircle,
  LogOut,
} from "lucide-react";
import { logoutAction } from "@/app/actions/user-actions";

const NAV_ITEMS = [
  { label: "Feed", path: "/feed", icon: Home, color: "#50c878" },
  { label: "Átrio", path: "/atrio", icon: Sparkles, color: "#2dd4bf" },
  { label: "Conexões", path: "/connections", icon: MessageCircle, color: "#3b82f6" },
  { label: "Comunidades", path: "/communities", icon: Building2, color: "#a855f7" },
  { label: "Perfil", path: "/profile", icon: User, color: "#FFC300" },
];

export const SideNavigation: React.FC = () => {
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutAction();
    window.location.href = "/";
  };

  return (
    <>
      {/* Desktop Navigation Side Bar */}
      <aside className="hidden xl:flex fixed left-0 top-[73px] bottom-0 w-24 flex-col items-center py-8 gap-8 bg-slate-950/70 backdrop-blur-md border-r border-slate-700/80 z-40 shadow-2xl">
        <nav className="flex flex-col gap-6 w-full flex-grow">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path || (item.path === "/feed" && pathname === "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group flex flex-col items-center gap-1.5 w-full relative transition-transform duration-300 ${
                  isActive ? "scale-110" : "hover:scale-105"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#50c878] rounded-r-full shadow-[0_0_12px_#50c878]" />
                )}

                <div
                  className={`p-3 rounded-2xl transition-colors duration-300 ${
                    isActive ? "bg-[#50c878]/10" : "bg-transparent"
                  }`}
                >
                  <Icon
                    size={26}
                    className={isActive ? "text-[#50c878]" : "text-slate-400 group-hover:text-white"}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span
                  className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${
                    isActive ? "text-[#50c878]" : "text-slate-400 group-hover:text-white"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 group w-full mb-4 cursor-pointer"
          title="Sair da Conta"
        >
          <div className="p-3 rounded-2xl transition-colors bg-transparent group-hover:bg-red-500/10">
            <LogOut size={22} className="text-slate-500 group-hover:text-red-500 transition-colors" />
          </div>
          <span className="text-[10px] font-bold tracking-wide text-slate-500 group-hover:text-red-500">
            Sair
          </span>
        </button>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 xl:hidden bg-slate-950/90 backdrop-blur-md border-t border-slate-700/80 px-4 py-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path || (item.path === "/feed" && pathname === "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                  isActive ? "text-[#50c878]" : "text-slate-400"
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] font-extrabold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};
