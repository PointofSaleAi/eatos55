import { useEffect, useSyncExternalStore } from "react";

const WIDE = "(min-width: 768px)";
const LANDSCAPE_WIDE = "(min-width: 768px) and (min-aspect-ratio: 1/1)";

/**
 * Reads a media query synchronously on the client so components mounted after
 * hydration get the real value on their first render (no phone-then-wide jump).
 * The server snapshot is `false`; DeviceFrame holds rendering until mounted, so
 * the server/client difference never reaches the DOM.
 */
function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** True when the viewport is wide enough for the tablet/desktop layout. */
export function useWideViewport() {
  return useMediaQuery(WIDE);
}

/**
 * True in landscape on tablet/desktop: used by the PIN gate to place the clock
 * panel beside the pad. Tablet portrait stacks instead.
 */
export function useLandscapeWide() {
  return useMediaQuery(LANDSCAPE_WIDE);
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
