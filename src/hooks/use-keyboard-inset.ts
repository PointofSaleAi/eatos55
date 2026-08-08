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

function isTextField(el: Element | null): el is HTMLElement {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "TEXTAREA") return true;
  if (el.isContentEditable) return true;
  if (tag !== "INPUT") return false;
  const type = (el as HTMLInputElement).type;
  return !["checkbox", "radio", "button", "submit", "reset", "range", "file"].includes(type);
}

/**
 * Global keyboard awareness: publishes the keyboard height as the `--kb-inset`
 * CSS variable and `data-kb="open"` on <html>, and keeps the focused field
 * scrolled into view. Mount once, near the app shell.
 */
export function useGlobalKeyboardAware() {
  const inset = useKeyboardInset();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--kb-inset", `${inset}px`);
    if (inset > 0) root.setAttribute("data-kb", "open");
    else root.removeAttribute("data-kb");
  }, [inset]);

  useEffect(() => {
    let timer: number | undefined;
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as Element | null;
      if (!isTextField(target)) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 320);
    };
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      window.clearTimeout(timer);
    };
  }, []);

  return inset;
}
