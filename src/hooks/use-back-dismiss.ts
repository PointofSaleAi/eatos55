import { useEffect, useRef } from "react";

/**
 * Android hardware / gesture back (and browser back) closes the open overlay
 * instead of leaving the screen. Pushes a throwaway history entry while open.
 *
 * The latest `onClose` is kept in a ref so an inline callback from the call site
 * cannot re-run this effect (which would otherwise loop pushState/back forever).
 */
export function useBackDismiss(open: boolean, onClose: () => void) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    let closedByBack = false;
    window.history.pushState({ posOverlay: true }, "");

    const onPop = () => {
      closedByBack = true;
      closeRef.current();
    };
    window.addEventListener("popstate", onPop);

    return () => {
      window.removeEventListener("popstate", onPop);
      // Only unwind our own throwaway entry, and only if it is still current.
      if (!closedByBack && window.history.state?.posOverlay === true) {
        window.history.back();
      }
    };
  }, [open]);
}
