import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type Announce = (message: string) => void;

const LiveRegionContext = createContext<Announce>(() => {});

/** Announces state changes to VoiceOver / TalkBack without visual noise. */
export function useAnnounce() {
  return useContext(LiveRegionContext);
}

export function LiveRegionProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const announce = useCallback<Announce>((m) => {
    if (timer.current) clearTimeout(timer.current);
    // Clear first so identical consecutive messages are re-announced.
    setMessage("");
    timer.current = setTimeout(() => setMessage(m), 60);
  }, []);

  return (
    <LiveRegionContext.Provider value={announce}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {message}
      </div>
    </LiveRegionContext.Provider>
  );
}
