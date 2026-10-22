import { Mic, Search, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * iOS-style docked search field: pinned directly above the on-screen keyboard
 * (or above the bottom tab bar when no keyboard is open), so the field is never
 * covered while typing. Rendered into the device frame via a portal.
 */
export function SearchDock({
  open,
  value,
  onChange,
  onClose,
  onSubmit,
  placeholder = "Search",
  above,
  below,
  voice,
  compact = false,
  inline = false,
}: {
  open: boolean;
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
  onSubmit?: (v: string) => void;
  placeholder?: string;
  /** Optional row rendered above the field (e.g. scope chips). */
  above?: ReactNode;
  /** Optional row rendered below the field (e.g. result count). */
  below?: ReactNode;
  /** Optional dictation control inside the field. */
  voice?: { listening: boolean; onStart: () => void };
  /** Shorter field for sections that use the medium control step (Settings). */
  compact?: boolean;
  /** Render in place (landscape headers) instead of docking at the bottom. */
  inline?: boolean;
}) {

  const [host, setHost] = useState<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setHost(document.getElementById("pos-dock-root"));
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!open || (!inline && !host)) return null;

  const body = (
    <div
      className={cn(
        inline
          ? "w-full min-w-0"
          : "pointer-events-auto absolute inset-x-0 z-40 border-t border-border bg-surface/95 px-3 pb-2 pt-2 backdrop-blur shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.25)]",
      )}
      style={
        inline
          ? undefined
          : { bottom: "max(var(--kb-inset, 0px), calc(var(--tabs-h, 0px) + var(--sab, 0px)))" }
      }
    >
      {above ? <div className={cn("mx-auto w-full pb-2", inline ? "max-w-none" : "max-w-sheet")}>{above}</div> : null}
      <div className={cn("mx-auto flex w-full items-center gap-2", inline ? "max-w-none" : "max-w-sheet")}>

        <label
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 rounded-pill border border-border bg-muted px-4",
            inline || compact ? "min-h-ctl-md" : "min-h-ctl-lg",
          )}
        >
          <Search className="size-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit?.(value);
              if (e.key === "Escape") onClose();
            }}
            type="text"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            placeholder={placeholder}
            aria-label={placeholder}
            className="min-h-tap min-w-0 flex-1 bg-transparent text-fs-base text-foreground outline-none placeholder:text-muted-foreground"
          />
          {voice ? (
            <button
              type="button"
              onClick={voice.onStart}
              aria-label="Search by voice"
              aria-pressed={voice.listening}
              className={cn(
                "grid size-7 tap-safe shrink-0 place-items-center rounded-pill transition-colors",
                voice.listening
                  ? "animate-pulse text-accent"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Mic className="size-4" />
            </button>
          ) : null}
          {value ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onChange("")}
              className="grid size-7 tap-safe shrink-0 place-items-center rounded-pill text-muted-foreground"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </label>
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "shrink-0 rounded-pill px-2 text-fs-sm font-bold text-accent",
            inline || compact ? "min-h-ctl-md" : "min-h-ctl-lg",
          )}
        >
          Cancel
        </button>
      </div>
      {below ? <div className={cn("mx-auto w-full pt-1.5", inline ? "max-w-none" : "max-w-sheet")}>{below}</div> : null}
    </div>
  );
  return inline ? body : createPortal(body, host!);
}
