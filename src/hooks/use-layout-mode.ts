import { useEffect, useState } from "react";

const WIDE = "(min-width: 768px)";


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
 * Layout mode for the shell. Purely viewport driven: phone widths get the
 * handheld single pane, 768px and up get the tablet/web layout.
 */
export function useLayoutMode() {
  const wide = useWideViewport();

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset["layout"] = wide ? "wide" : "phone";
  }, [wide]);

  return { wide, wideViewport: wide };

}
