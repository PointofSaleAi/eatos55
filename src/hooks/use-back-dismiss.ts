import { useEffect, useRef } from "react";

/**
 * Android hardware / gesture back (and browser back) closes the open overlay
 * instead of leaving the screen. Pushes a throwaway history entry while open.
 *
 * The latest `onClose` is kept in a ref so an inline callback from the call site
 * cannot re-run this effect (which would otherwise loop pushState/back forever).
 *
 * The throwaway entry is only unwound when the overlay was dismissed *without*
 * navigating. If a row inside the overlay navigated (the router already pushed a
 * new URL before this cleanup runs), calling history.back() here would cancel
 * that navigation and bounce straight back to the previous screen.
 */
export function useBackDismiss(open: boolean, onClose: () => void) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    let closedByBack = false;
    const openedAt = window.location.href;
    window.history.pushState({ posOverlay: true }, "");

    const onPop = () => {
      closedByBack = true;
      closeRef.current();
    };
    window.addEventListener("popstate", onPop);

    return () => {
      window.removeEventListener("popstate", onPop);
      if (closedByBack) return;
      // Deferred by a tick: a row tap closes the overlay *before* the router
      // pushes the new URL, so an immediate history.back() here would cancel
      // that navigation. After the tick we can tell the two cases apart.
      window.setTimeout(() => {
        const stillHere = window.location.href === openedAt;
        const ours =
          (window.history.state as { posOverlay?: boolean } | null)?.posOverlay === true;
        if (stillHere && ours) window.history.back();
      }, 0);
    };

  }, [open]);
}
