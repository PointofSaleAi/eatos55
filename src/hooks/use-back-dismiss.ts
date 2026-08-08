import { useEffect } from "react";

/**
 * Android hardware / gesture back (and browser back) closes the open overlay
 * instead of leaving the screen. Pushes a throwaway history entry while open.
 */
export function useBackDismiss(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    let closedByBack = false;
    window.history.pushState({ posOverlay: true }, "");

    const onPop = () => {
      closedByBack = true;
      onClose();
    };
    window.addEventListener("popstate", onPop);

    return () => {
      window.removeEventListener("popstate", onPop);
      if (!closedByBack && window.history.state?.posOverlay) {
        window.history.back();
      }
    };
  }, [open, onClose]);
}
