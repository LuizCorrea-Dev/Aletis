import { useEffect, useState } from "react";
import { applyTheme, getActiveTheme, AVAILABLE_THEMES, ThemeId } from "@/config/theme.config";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("aletis_theme") as string;
    if (saved && saved in AVAILABLE_THEMES) {
      const themeId = saved as ThemeId;
      const themeKey = saved as ThemeId;
      
      if (themeKey === "dark" || themeKey === "light") {
        setTheme(themeKey);
      }
      
      applyTheme(themeId);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <label className="relative inline-flex h-9 w-14 cursor-pointer items-center">
      <input
        type="checkbox"
        checked={theme === "light"}
        onChange={(e) => {
          const newTheme = e.target.checked ? "light" : "dark";
          setTheme(newTheme);
          applyTheme(newTheme);
        }}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 transition duration-200">
        <div className="h-5 w-5 rounded-full bg-white shadow transform transition duration-200">
          {theme === "dark" 
            ? "translate-x-0.5" 
            : "translate-x-5.5"}
        </div>
      </div>
      <div className="absolute left-0 flex h-6 w-11 items-center pointer-events-none justify-between px-1">
        <Moon className="h-4 w-4 text-gray-500" />
        <Sun className="h-4 w-4 text-yellow-400" />
      </div>
    </label>
  );
}