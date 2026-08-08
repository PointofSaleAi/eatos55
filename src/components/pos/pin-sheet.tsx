import { Delete, Fingerprint, ScanFace } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** Screen 70 — "Enter PIN" bottom sheet with masked entry, keypad and biometrics. */
export function PinSheet({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}) {
  const [pin, setPin] = useState("");

  const push = (d: string) => {
    const next = (pin + d).slice(0, 4);
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        setPin("");
        onSubmit();
      }, 180);
    }
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        setPin("");
        onOpenChange(o);
      }}
    >
      <SheetContent
        side="bottom"
        className="max-h-[92dvh] overflow-y-auto rounded-t-3xl border-t border-border bg-background px-4 pb-6 pt-4"
      >
        <SheetTitle className="text-center text-2xl font-extrabold text-foreground">
          Enter PIN
        </SheetTitle>

        <div className="mt-3 flex min-h-[56px] items-center justify-center gap-8 rounded-2xl border border-border bg-surface px-4">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn(
                "text-2xl font-extrabold leading-none",
                i < pin.length ? "text-foreground" : "text-foreground/25",
              )}
            >
              ✳
            </span>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3">
          {keys.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => push(k)}
              className="grid min-h-[56px] place-items-center rounded-2xl bg-surface text-xl font-extrabold text-foreground shadow-sm transition-transform active:scale-[0.97]"
            >
              {k}
            </button>
          ))}
          <button
            type="button"
            aria-label="Clear PIN"
            onClick={() => setPin("")}
            className="grid min-h-[56px] place-items-center rounded-2xl bg-surface text-xl font-extrabold text-destructive shadow-sm transition-transform active:scale-[0.97]"
          >
            C
          </button>
          <button
            type="button"
            onClick={() => push("0")}
            className="grid min-h-[56px] place-items-center rounded-2xl bg-surface text-xl font-extrabold text-foreground shadow-sm transition-transform active:scale-[0.97]"
          >
            0
          </button>
          <button
            type="button"
            aria-label="Delete last digit"
            onClick={() => setPin((p) => p.slice(0, -1))}
            className="grid min-h-[56px] place-items-center rounded-2xl bg-surface text-destructive shadow-sm transition-transform active:scale-[0.97]"
          >
            <Delete className="size-8" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            aria-label="Unlock with fingerprint"
            onClick={onSubmit}
            className="grid min-h-[56px] place-items-center rounded-2xl bg-surface text-foreground shadow-sm transition-transform active:scale-[0.97]"
          >
            <Fingerprint className="size-6" />
          </button>
          <button
            type="button"
            aria-label="Unlock with face"
            onClick={onSubmit}
            className="grid min-h-[56px] place-items-center rounded-2xl bg-surface text-foreground shadow-sm transition-transform active:scale-[0.97]"
          >
            <ScanFace className="size-6" />
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
