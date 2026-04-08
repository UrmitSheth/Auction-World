import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const THEMES = [
  { id: "light", name: "Light", emoji: "☀️", preview: { bg: "#f0fdf4", accent: "#059669", card: "#ffffff" } },
  { id: "dark", name: "Dark", emoji: "🌙", preview: { bg: "#0f172a", accent: "#34d399", card: "#1e293b" } },
  { id: "emerald", name: "Emerald", emoji: "💎", preview: { bg: "#ecfdf5", accent: "#047857", card: "#d1fae5" } },
  { id: "ocean", name: "Ocean", emoji: "🌊", preview: { bg: "#0c1222", accent: "#38bdf8", card: "#1a2744" } },
  { id: "sunset", name: "Sunset", emoji: "🌅", preview: { bg: "#1a1020", accent: "#f97316", card: "#2a1a30" } },
];

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("aw-theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("aw-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
