import { useEffect, useState } from "react";

export type Appearance = "light" | "dark" | "system";

const KEY = "pos-appearance";

function systemPrefersDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function apply(appearance: Appearance) {
  if (typeof document === "undefined") return;
  const dark = appearance === "dark" || (appearance === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

/**
 * Follows the system appearance by default, with an explicit Light / Dark
 * override the user can pick in Settings. Persisted on the device.
 */
export function useAppearance() {
  const [appearance, setAppearance] = useState<Appearance>("light");

  // Read the stored preference after hydration to avoid an SSR mismatch.
  useEffect(() => {
    const stored = window.localStorage.getItem(KEY) as Appearance | null;
    const next: Appearance =
      stored === "light" || stored === "dark" || stored === "system" ? stored : "light";
    setAppearance(next);
    apply(next);
  }, []);

  useEffect(() => {
    apply(appearance);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (appearance === "system") apply("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [appearance]);

  const set = (next: Appearance) => {
    window.localStorage.setItem(KEY, next);
    setAppearance(next);
  };

  return { appearance, setAppearance: set };
}
