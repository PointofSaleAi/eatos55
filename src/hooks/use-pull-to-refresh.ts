import { useCallback, useRef, useState } from "react";
import { haptic } from "@/lib/haptics";

/**
 * Pull-to-refresh for a scrollable region.
 * Spread `bind` on the scroll container and render `indicator` inside it.
 */
export function usePullToRefresh(onRefresh: () => void | Promise<void>, threshold = 68) {
  const [pull, setPull] = useState(0);
  const [busy, setBusy] = useState(false);
  const startY = useRef<number | null>(null);

  const run = useCallback(async () => {
    setBusy(true);
    haptic("light");
    try {
      await onRefresh();
    } finally {
      setBusy(false);
      setPull(0);
    }
  }, [onRefresh]);

  const end = () => {
    if (startY.current === null) return;
    const moved = pull;
    startY.current = null;
    if (moved >= threshold && !busy) void run();
    else setPull(0);
  };

  const bind = {
    onTouchStart: (e: React.TouchEvent<HTMLElement>) => {
      const el = e.currentTarget;
      if (el.scrollTop > 0 || busy) return;
      startY.current = e.touches[0]?.clientY ?? null;
    },
    onTouchMove: (e: React.TouchEvent<HTMLElement>) => {
      if (startY.current === null) return;
      const y = e.touches[0]?.clientY ?? startY.current;
      setPull(Math.max(0, Math.min(threshold * 1.4, y - startY.current)));
    },
    onTouchEnd: end,
    onTouchCancel: end,
  };

  return { bind, pull, busy, refresh: run, threshold };
}
