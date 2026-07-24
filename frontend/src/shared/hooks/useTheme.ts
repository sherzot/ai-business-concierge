import { useTheme as useNextTheme } from "next-themes";

type Theme = "light" | "dark";

export function useTheme() {
  const { resolvedTheme, setTheme: setNextTheme } = useNextTheme();
  const theme: Theme = resolvedTheme === "dark" ? "dark" : "light";

  function setTheme(next: Theme) {
    setNextTheme(next);
  }

  function toggle() {
    setNextTheme(theme === "dark" ? "light" : "dark");
  }

  return { theme, toggle, setTheme };
}
