import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Load a screen's code on touch/hover so the tap itself opens instantly.
    defaultPreload: "intent",
    defaultPreloadDelay: 0,
  });

  return router;
};
