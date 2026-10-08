import { ChevronDown, Delete, Fingerprint, ScanFace, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { haptic } from "@/lib/haptics";
import { money, type MenuItem } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const MANAGER_PIN = "1500";
const REASONS = ["Manager Discount", "Customer Complaint", "Price Match"];

const keyCls =
  "grid h-12 place-items-center rounded-card border border-border bg-muted text-fs-lg font-extrabold text-foreground transition active:scale-[0.97] hover:bg-secondary sm:h-14";

/**
 * Two-step price edit: manager PIN ("Access Restricted") then "Price Override"
 * with a reason, original vs new price and a decimal keypad.
 */
export function PriceOverrideFlow({
  open,
  item,
  price,
  onClose,
  onApply,
}: {
  open: boolean;
  item: MenuItem;
  price: number;
  onClose: () => void;
  onApply: (price: number, reason: string) => void;
}) {
  const [step, setStep] = useState<"pin" | "override">("pin");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonOpen, setReasonOpen] = useState(false);
  const [entry, setEntry] = useState("");

  useEffect(() => {
    if (open) {
      setStep("pin");
      setPin("");
      setError(false);
      setReason("");
      setReasonOpen(false);
      setEntry("");
    }
  }, [open]);

  const approve = () => {
    haptic("success");
    setStep("override");
  };

  const pushPin = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === MANAGER_PIN) approve();
        else {
          haptic("error");
          setError(true);
          setPin("");
        }
      }, 160);
    }
  };

  const pushPrice = (k: string) => {
    setEntry((e) => {
      if (k === "." && e.includes(".")) return e;
      if (e.includes(".") && (e.split(".")[1] ?? "").length >= 2) return e;
      if (e.replace(".", "").length >= 6) return e;
      return e === "0" && k !== "." ? k : e + k;
    });
  };

  const newPrice = Number(entry || "0");
  const canApply = Boolean(reason) && entry !== "" && newPrice !== price;

  const thumb = item.image ? (
    <img src={item.image} alt="" className="size-10 shrink-0 rounded-card border border-border object-cover" />
  ) : (
    <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-card border border-border bg-muted text-muted-foreground">
      <UtensilsCrossed className="size-4" />
    </span>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-md rounded-sheet border-border bg-surface p-4 sm:p-5">
        {step === "pin" ? (
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <DialogTitle className="text-fs-lg font-extrabold text-foreground">Access Restricted</DialogTitle>
              <DialogDescription className={cn("mt-1 text-fs-sm", error ? "text-destructive" : "text-muted-foreground")}>
                {error ? "Incorrect PIN. Try again." : "Enter Manager PIN to Adjust Price."}
              </DialogDescription>
            </div>
            <div className="flex gap-2.5">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "grid size-12 place-items-center rounded-card border-2 bg-muted text-fs-xl font-extrabold sm:size-14",
                    error ? "border-destructive" : i < pin.length ? "border-foreground" : "border-border",
                  )}
                >
                  {i < pin.length ? "•" : ""}
                </span>
              ))}
            </div>
            <div className="grid w-full max-w-xs grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                <button key={d} type="button" className={keyCls} onClick={() => pushPin(d)}>
                  {d}
                </button>
              ))}
              <button type="button" aria-label="Backspace" className={keyCls} onClick={() => setPin((p) => p.slice(0, -1))}>
                <Delete className="size-5" />
              </button>
              <button type="button" className={keyCls} onClick={() => pushPin("0")}>
                0
              </button>
              <button type="button" aria-label="Clear PIN" className={cn(keyCls, "text-destructive")} onClick={() => setPin("")}>
                C
              </button>
            </div>
            <div className="grid w-full max-w-xs grid-cols-2 gap-2">
              <button type="button" aria-label="Approve with fingerprint" className={keyCls} onClick={approve}>
                <Fingerprint className="size-5" />
              </button>
              <button type="button" aria-label="Approve with Face ID" className={keyCls} onClick={approve}>
                <ScanFace className="size-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 border-b border-border pb-3 pr-8">
              {thumb}
              <div className="min-w-0">
                <DialogTitle className="text-fs-base font-extrabold text-foreground">Price Override</DialogTitle>
                <DialogDescription className="truncate text-fs-sm text-muted-foreground">{item.name}</DialogDescription>
              </div>
            </div>

            <div className="relative">
              <button
                type="button"
                aria-expanded={reasonOpen}
                onClick={() => setReasonOpen((o) => !o)}
                className="flex h-12 w-full items-center justify-between rounded-card border border-border bg-muted px-3.5 text-fs-sm font-bold text-foreground"
              >
                <span className={reason ? "" : "text-muted-foreground"}>{reason || "Select reason for override"}</span>
                <ChevronDown className={cn("size-4 transition-transform", reasonOpen && "rotate-180")} />
              </button>
              {reasonOpen ? (
                <ul className="absolute inset-x-0 top-[calc(100%+0.25rem)] z-20 overflow-hidden rounded-card border border-border bg-surface shadow-lg">
                  {REASONS.map((r) => (
                    <li key={r}>
                      <button
                        type="button"
                        onClick={() => {
                          setReason(r);
                          setReasonOpen(false);
                        }}
                        className={cn(
                          "w-full px-3.5 py-3 text-left text-fs-sm font-bold text-foreground hover:bg-muted",
                          r === reason && "bg-muted",
                        )}
                      >
                        {r}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="space-y-1.5 rounded-card bg-muted px-3.5 py-3">
              <div className="flex justify-between text-fs-sm">
                <span className="text-muted-foreground">Price</span>
                <span className="font-bold text-foreground">{money(price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-fs-sm text-muted-foreground">New Price</span>
                <span className="text-fs-xl font-extrabold text-success">{money(newPrice)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map((k) => (
                <button key={k} type="button" className={keyCls} onClick={() => pushPrice(k)}>
                  {k}
                </button>
              ))}
              <button type="button" aria-label="Backspace" className={keyCls} onClick={() => setEntry((e) => e.slice(0, -1))}>
                <Delete className="size-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="h-12 rounded-pill border border-border text-fs-sm font-extrabold uppercase text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canApply}
                onClick={() => {
                  onApply(newPrice, reason);
                  toast.success(`Price changed to ${money(newPrice)} (${reason})`);
                }}
                className="h-12 rounded-pill bg-primary text-fs-sm font-extrabold uppercase text-primary-foreground disabled:opacity-40"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
