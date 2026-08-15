import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { NumPad } from "@/components/pos/numpad";
import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

/** Add-tip sheet: presets from tip settings, custom keypad amount, or no tip. */
export function TipSheet({
  open,
  onOpenChange,
  base,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  base: number;
  onConfirm: (amount: number) => void;
}) {
  const { settings } = usePos();
  const [custom, setCustom] = useState("");
  const [preset, setPreset] = useState<number | null>(null);

  const percents = settings.tipPresets
    .split(/[·,]/)
    .map((p) => Number.parseFloat(p.replace("%", "").trim()))
    .filter((n) => Number.isFinite(n) && n > 0);

  const amount = custom
    ? Math.round(Number.parseFloat(custom || "0") * 100) / 100
    : preset != null
      ? Math.round(base * (preset / 100) * 100) / 100
      : 0;

  const close = () => {
    setCustom("");
    setPreset(null);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <SheetContent
        hideClose
        side="bottom"
        className="max-h-[92dvh] overflow-y-auto rounded-t-sheet border-t border-border bg-background px-4 pb-6 pt-4"
      >
        <SheetHeader className="pb-2">
          <SheetTitle className="text-center text-fs-xl font-extrabold text-foreground">
            Add Tip
          </SheetTitle>
        </SheetHeader>

        <p className="text-center text-fs-xs text-muted-foreground">
          {settings.tipBasis} total {money(base)}
        </p>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {percents.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setCustom("");
                setPreset(p);
              }}
              className={cn(
                "grid min-h-ctl-lg place-items-center rounded-card border text-fs-sm font-extrabold transition-colors",
                preset === p && !custom
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-surface text-foreground",
              )}
            >
              <span>{p}%</span>
              <span className="text-fs-xs font-bold text-muted-foreground">
                {money(Math.round(base * (p / 100) * 100) / 100)}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-3 flex min-h-ctl-lg items-center justify-between rounded-card border border-border bg-surface px-4">
          <span className="text-fs-sm font-bold text-muted-foreground">Custom tip</span>
          <span className="text-fs-xl font-extrabold text-foreground">
            {custom ? `$${custom}` : money(amount)}
          </span>
        </div>

        <NumPad
          className="mt-3"
          onDigit={(d) => {
            setPreset(null);
            setCustom((v) => (v + d).replace(/^0+(?=\d)/, "").slice(0, 7));
          }}
          onBackspace={() => setCustom((v) => v.slice(0, -1))}
        />

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => {
              onConfirm(0);
              close();
            }}
            className="min-h-ctl-lg flex-1 rounded-card border border-border text-fs-sm font-bold text-foreground"
          >
            No tip
          </button>
          <button
            type="button"
            disabled={amount <= 0}
            onClick={() => {
              onConfirm(amount);
              close();
            }}
            className="min-h-ctl-lg flex-1 rounded-card bg-primary text-fs-sm font-bold text-primary-foreground disabled:opacity-40"
          >
            Add {money(amount)}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
