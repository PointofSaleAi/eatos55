import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

export type ConfirmRequest = {
  title: string;
  message?: string;
  /** Label of the action that performs the change. */
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type Resolver = (ok: boolean) => void;

const ConfirmContext = createContext<((req: ConfirmRequest) => Promise<boolean>) | null>(null);

/**
 * Thumb-reachable action sheet for confirming (and especially destructive)
 * actions. Cancel is always the safe default and is the largest target.
 */
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  return (
    ctx ??
    (async () => {
      // Without a provider, never silently perform a destructive action.
      return false;
    })
  );
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [req, setReq] = useState<ConfirmRequest | null>(null);
  const resolver = useRef<Resolver | null>(null);

  const confirm = useCallback((next: ConfirmRequest) => {
    haptic("warning");
    setReq(next);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const finish = (ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setReq(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {req && typeof document !== "undefined"
        ? createPortal(<ConfirmSheet req={req} onDone={finish} />, document.body)
        : null}
    </ConfirmContext.Provider>
  );
}

function ConfirmSheet({ req, onDone }: { req: ConfirmRequest; onDone: (ok: boolean) => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={req.title}
      className="fixed inset-0 z-[70] flex items-end justify-center md:items-center"
    >
      <button
        type="button"
        aria-label={req.cancelLabel ?? "Cancel"}
        onClick={() => onDone(false)}
        className="absolute inset-0 bg-black/50"
      />
      <div
        className={cn(
          "relative m-3 w-full max-w-[26rem] rounded-sheet border border-border bg-surface p-4",
          "pb-[calc(1rem+var(--sab,0px))] md:pb-4",
        )}
      >
        <div className="px-2 pb-3 pt-1 text-center">
          <p className="text-fs-base font-extrabold text-foreground">{req.title}</p>
          {req.message ? (
            <p className="mt-1 text-fs-sm text-muted-foreground">{req.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <button
            type="button"
            autoFocus
            onClick={() => {
              haptic(req.destructive ? "error" : "success");
              onDone(true);
            }}
            className={cn(
              "min-h-ctl-lg w-full rounded-card text-fs-base font-extrabold transition-colors",
              req.destructive
                ? "bg-destructive text-destructive-foreground hover:opacity-90"
                : "bg-primary text-primary-foreground hover:opacity-90",
            )}
          >
            {req.confirmLabel}
          </button>
          <button
            type="button"
            onClick={() => onDone(false)}
            className="min-h-ctl-lg w-full rounded-card bg-muted text-fs-base font-extrabold text-foreground transition-colors hover:bg-secondary"
          >
            {req.cancelLabel ?? "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
