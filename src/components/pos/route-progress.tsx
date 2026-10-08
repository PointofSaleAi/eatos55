import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Thin progress line at the very top while a screen is still loading, so a
 * tap always gets visible feedback. Appears only after a short delay, so
 * instant navigations never flicker it.
 */
export function RouteProgress() {
  const loading = useRouterState({ select: (s) => s.isLoading || s.status === "pending" });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!loading) {
      setVisible(false);
      return;
    }
    const t = window.setTimeout(() => setVisible(true), 150);
    return () => window.clearTimeout(t);
  }, [loading]);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5 overflow-hidden transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <div className="h-full w-1/3 animate-[route-progress_1s_ease-in-out_infinite] rounded-pill bg-accent" />
    </div>
  );
}
