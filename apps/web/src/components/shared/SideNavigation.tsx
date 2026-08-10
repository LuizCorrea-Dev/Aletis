"use client";

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
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Feed", path: "/feed", icon: Home },
  { label: "Átrio", path: "/atrio", icon: Sparkles },
  { label: "Conexões", path: "/connections", icon: MessageCircle },
  { label: "Comunidades", path: "/communities", icon: Building2 },
  { label: "Perfil", path: "/profile", icon: User },
];

interface NavigationProps {
  onLogout?: () => void;
}

const NavItem = ({ label, path, icon: Icon }: (typeof NAV_ITEMS)[0]) => {
  const pathname = usePathname();
  const isActive = pathname === path;

  return (
    <Link
      href={path}
      className={cn(
        "group relative flex flex-col items-center gap-2 w-full transition-transform duration-300",
        isActive ? "scale-110" : "hover:scale-105"
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-mint-500 rounded-r-full shadow-[0_0_10px_theme(colors.mint.500)]" />
      )}
      <div
        className={cn(
          "p-3 rounded-2xl transition-colors duration-300",
          isActive ? "bg-mint-500/10" : "bg-transparent hover:bg-slate-800"
        )}
      >
        <Icon
          size={28}
          strokeWidth={isActive ? 2.5 : 2}
          className={cn(
            "transition-colors duration-300",
            isActive ? "text-mint-500" : "text-slate-400 group-hover:text-white"
          )}
        />
      </div>
      <span
        className={cn(
          "text-[10px] font-semibold tracking-wide transition-colors duration-300",
          isActive ? "text-mint-500" : "text-slate-400 group-hover:text-white"
        )}
      >
        {label}
      </span>
    </Link>
  );
};

export const SideNavigation = ({ onLogout }: NavigationProps) => {
  return (
    <aside className="hidden xl:flex fixed left-0 top-0 bottom-0 w-24 flex-col items-center py-8 gap-8 bg-background border-r border-slate-800 z-40 shadow-xl">
      <div className="text-mint-500 font-display font-black text-lg">C</div>
      <nav className="flex flex-col gap-8 w-full flex-grow">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="flex flex-col items-center gap-2 group w-full mb-4 transition-all duration-300"
        title="Sair"
      >
        <div className="p-3 rounded-2xl transition-colors bg-transparent group-hover:bg-red-500/10">
          <LogOut
            size={24}
            className="text-slate-500 group-hover:text-red-500 transition-colors"
          />
        </div>
        <span className="text-[10px] font-semibold tracking-wide text-slate-500 group-hover:text-red-500">
          Sair
        </span>
      </button>
    </aside>
  );
};

export const MobileNavigation = ({ onLogout }: NavigationProps) => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 xl:hidden bg-background border-t border-slate-800">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all",
                isActive ? "bg-mint-500/10" : ""
              )}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 2}
                className={cn(
                  "transition-colors",
                  isActive ? "text-mint-500" : "text-slate-500"
                )}
              />
              <span
                className={cn(
                  "text-[9px] font-bold",
                  isActive ? "text-mint-500" : "text-slate-600"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
