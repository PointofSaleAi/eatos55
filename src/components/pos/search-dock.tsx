import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
}: {
  open: boolean;
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
  onSubmit?: (v: string) => void;
  placeholder?: string;
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

  if (!open || !host) return null;

  return createPortal(
    <div
      className={cn(
        "pointer-events-auto absolute inset-x-0 z-40 border-t border-border bg-surface/95 px-3 pb-2 pt-2 backdrop-blur",
        "shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.25)]",
      )}
      style={{
        bottom: "max(var(--kb-inset, 0px), calc(var(--tabs-h, 0px) + var(--sab, 0px)))",
      }}
    >
      <div className="mx-auto flex w-full max-w-[420px] items-center gap-2">
        <label className="flex min-h-ctl-lg min-w-0 flex-1 items-center gap-2 rounded-pill border border-border bg-muted px-4">
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
          className="min-h-ctl-lg shrink-0 rounded-pill px-2 text-fs-sm font-bold text-accent"
        >
          Cancel
        </button>
      </div>
    </div>,
    host,
  );
}
