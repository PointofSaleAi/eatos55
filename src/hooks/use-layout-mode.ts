import { useCallback, useEffect, useState } from "react";

export type LayoutMode = "adaptive" | "framed";

const KEY = "pos:layout-mode";
const WIDE = "(min-width: 768px)";

function readStored(): LayoutMode {
  if (typeof window === "undefined") return "adaptive";
  return window.localStorage.getItem(KEY) === "framed" ? "framed" : "adaptive";
}

/** True when the viewport is wide enough for the tablet/desktop layout. */
export function useWideViewport() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(WIDE);
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return wide;
}

/**
 * True in landscape on tablet/desktop: used by the PIN gate to place the clock
 * panel beside the pad. Tablet portrait stacks instead.
 */
export function useLandscapeWide() {
  const [landscape, setLandscape] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (min-aspect-ratio: 1/1)");
    const sync = () => setLandscape(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return landscape;
}

/**
 * Layout mode for the shell.
 * `wide` drives the landscape tablet/web layout (rail + split panes + dialogs);
 * `framed` forces the 420px handheld preview on big screens for design review.
 */
export function useLayoutMode() {
  const wideViewport = useWideViewport();
  const [mode, setMode] = useState<LayoutMode>("adaptive");

  useEffect(() => setMode(readStored()), []);

  const update = useCallback((next: LayoutMode) => {
    setMode(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      /* storage unavailable - session-only */
    }
  }, []);

  const wide = wideViewport && mode === "adaptive";

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset["layout"] = wide ? "wide" : "phone";
  }, [wide]);

  return { mode, setMode: update, wide, wideViewport };
}
