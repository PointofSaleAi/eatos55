import { useEffect, useState } from "react";

/**
 * Tracks how many pixels the on-screen keyboard covers at the bottom of the
 * layout viewport. Returns 0 on desktop / when no keyboard is open.
 */
export function useKeyboardInset() {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : undefined;
    if (!vv) return;

    const update = () => {
      const covered = window.innerHeight - vv.height - vv.offsetTop;
      setInset(covered > 80 ? Math.round(covered) : 0);
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return inset;
}

/** Scrolls the focused field into view once the keyboard animation settles. */
export function scrollFieldIntoView(e: { currentTarget: HTMLElement | null }) {
  const el = e.currentTarget;
  if (!el) return;
  window.setTimeout(() => {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 300);
}
