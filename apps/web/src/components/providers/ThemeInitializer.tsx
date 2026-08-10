"use client";

import { useEffect } from "react";
import { applyTheme, getActiveTheme } from "@/config/theme.config";

export function ThemeInitializer() {
  useEffect(() => {
    // Aplica o tema ativo e atualiza no DOM e localStorage
    const active = getActiveTheme();
    applyTheme(active);

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ themeId: string }>;
      if (customEvent.detail?.themeId) {
        document.documentElement.setAttribute("data-theme", customEvent.detail.themeId);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "aletis_theme" && e.newValue) {
        document.documentElement.setAttribute("data-theme", e.newValue);
      }
    };

    window.addEventListener("aletis-theme-changed", handleThemeChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("aletis-theme-changed", handleThemeChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return null;
}
