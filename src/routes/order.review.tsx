import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * The separate review step is retired: the running order panel on /order/new
 * carries the totals plus Save, Fire and Charge, so this route only redirects.
 */
export const Route = createFileRoute("/order/review")({
  beforeLoad: () => {
    throw redirect({ to: "/order/new" });
  },
});
