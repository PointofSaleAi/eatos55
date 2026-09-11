import { createContext, useContext } from "react";

/**
 * Shared handle for the global navigation drawer. Lives outside the shell so
 * the top bar (account initials) can open it without a circular import.
 */
export const NavDrawerContext = createContext<{ open: () => void } | null>(null);

/** Opens the global navigation drawer from any header or the top bar. */
export function useNavDrawer() {
  return useContext(NavDrawerContext);
}
