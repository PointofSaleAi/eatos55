import { createContext, type Context } from "react";

/**
 * One context instance per browser session, keyed by name. A live update to a
 * module that calls createContext otherwise makes a second context object, so
 * consumers still holding the old one read the default value (e.g. the cart
 * disappearing beside the menu while the nav rail still shows).
 */
export function pinnedContext<T>(key: string, defaultValue: T): Context<T> {
  const registry = globalThis as typeof globalThis & {
    __pinnedContexts?: Record<string, Context<unknown>>;
  };
  const map = (registry.__pinnedContexts ??= {});
  if (!map[key]) map[key] = createContext<T>(defaultValue) as Context<unknown>;
  return map[key] as Context<T>;
}
