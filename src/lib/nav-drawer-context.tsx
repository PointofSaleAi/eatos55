import { useContext } from "react";
import { pinnedContext } from "@/lib/pinned-context";

/**
 * Shared handle for the global navigation drawer. Lives outside the shell so
 * the top bar (account initials) can open it without a circular import.
 */
export const NavDrawerContext = pinnedContext<{ open: () => void } | null>("navDrawer", null);

/** Opens the global navigation drawer from any header or the top bar. */
export function useNavDrawer() {
  return useContext(NavDrawerContext);
}
