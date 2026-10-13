import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * `/dashboard` now lives at `/order/menu` (the rail's Dashboard item). This
 * route keeps old links — the header chevron, pre-warm list, shift summary —
 * landing on the same page instead of duplicating it.
 */
export const Route = createFileRoute("/dashboard/")({
  beforeLoad: () => {
    throw redirect({ to: "/order/menu", replace: true });
  },
});
