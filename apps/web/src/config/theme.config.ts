/**
 * Configuração e Tipagens do Sistema de Temas Aletis
 */

export type ThemeId =
  | "original"
  | "natal"
  | "ano-novo"
  | "aniversario"
  | "light"
  | "dark";

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  description: string;
  isSeasonal?: boolean;
}

export const AVAILABLE_THEMES: Record<ThemeId, ThemeMeta> = {
  original: {
    id: "original",
    name: "Original (Dark)",
    description: "Identidade visual padrão do Aletis em tom escuro elegante",
  },
  natal: {
    id: "natal",
    name: "Natal",
    description: "Tema comemorativo de Natal",
    isSeasonal: true,
  },
  "ano-novo": {
    id: "ano-novo",
    name: "Ano Novo",
    description: "Tema comemorativo de Réveillon / Ano Novo",
    isSeasonal: true,
  },
  aniversario: {
    id: "aniversario",
    name: "Aniversário do Usuário",
    description: "Tema festivo personalizado para o dia de aniversário",
    isSeasonal: true,
  },
  light: {
    id: "light",
    name: "Light Mode",
    description: "Modo claro alternativo",
  },
  dark: {
    id: "dark",
    name: "Dark Mode",
    description: "Modo escuro de alto contraste",
  },
};

export const DEFAULT_THEME: ThemeId = "original";

/**
 * Obtém o tema ativo atualmente (do localStorage ou o DEFAULT_THEME)
 */
export function getActiveTheme(): ThemeId {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("aletis_theme") as ThemeId;
    if (saved && AVAILABLE_THEMES[saved]) return saved;
  }
  return DEFAULT_THEME;
}

/**
 * Aplica o atributo data-theme no elemento raiz <html> da página e persiste a escolha
 */
export function applyTheme(themeId: ThemeId): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", themeId);
  if (typeof window !== "undefined") {
    localStorage.setItem("aletis_theme", themeId);
    window.dispatchEvent(new CustomEvent("aletis-theme-changed", { detail: { themeId } }));
  }
}
