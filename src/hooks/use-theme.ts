import { useEffect, useState } from "react";

const KEY = "academia_theme";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem(KEY) as "light" | "dark") || "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const set = (t: "light" | "dark") => {
    setTheme(t);
    localStorage.setItem(KEY, t);
    document.documentElement.classList.toggle("dark", t === "dark");
  };

  const toggle = () => set(theme === "dark" ? "light" : "dark");

  return { theme, set, toggle };
}
