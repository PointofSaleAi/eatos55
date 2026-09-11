import { Mail, MessageSquare, Printer, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cashDenominations, money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

type Receipt = "email" | "sms" | "print";

const tiles: { id: Receipt; label: string; icon: typeof Mail }[] = [
  { id: "email", label: "Email", icon: Mail },
  { id: "sms", label: "SMS", icon: MessageSquare },
  { id: "print", label: "Print Receipt", icon: Printer },
];

/**
 * Confirmation card shown the moment a check clears: change due as the hero,
 * a compact tender summary and one receipt choice. Used as an overlay on the
 * payment screen and full width on /payment/success.
 */
export function PaymentCompleteCard({
  onDone,
  className,
  doneLabel = "New Order",
}: {
  onDone: () => void;
  className?: string;
  /** Label of the closing action, e.g. the next check of a split. */
  doneLabel?: string;
}) {
  const { lastPayment, guest, settings } = usePos();
  const [choice, setChoice] = useState<Receipt | null>(null);
  const [email, setEmail] = useState(guest.email ?? "");
  const [phone, setPhone] = useState(guest.phone ?? "");

  const total = lastPayment?.total ?? 0;
  const tip = lastPayment?.tip ?? 0;
  const tendered = lastPayment?.tendered ?? 0;
  const change = lastPayment?.change ?? 0;
  const notes = lastPayment?.notes;
  const noteLine = notes
    ? cashDenominations
        .filter((d) => (notes[d] ?? 0) > 0)
        .map((d) => `${notes[d]} x $${d}`)
        .join(", ")
    : "";

  // Auto Close Payment: settings decide per tender whether the order closes itself.
  const tenderId = lastPayment?.tenderId;
  const autoClose = tenderId ? (settings.tenderAutoClose[tenderId] ?? false) : false;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    if (!autoClose || !lastPayment) return;
    const t = window.setTimeout(() => doneRef.current(), 1600);
    return () => window.clearTimeout(t);
  }, [autoClose, lastPayment]);

  const send = (what: string) => {
    toast.success(what);
    setChoice(null);
  };

  return (
    <div className={cn("flex min-h-0 flex-col gap-3 p-4 sm:p-6", className)}>
      <div className="flex shrink-0 items-start gap-3">
        <DialogTitle asChild>
          <h1 className="min-w-0 flex-1 text-center text-fs-money font-extrabold leading-none tabular-nums text-foreground">
            {money(change)} Change
          </h1>
        </DialogTitle>
        <button
          type="button"
          onClick={onDone}
          aria-label="Close payment confirmation"
          className="grid size-10 shrink-0 place-items-center rounded-pill text-foreground transition-colors hover:bg-muted"
        >
          <X className="size-6" />
        </button>
      </div>

      <div className="shrink-0 border-t border-border pt-3 text-center">
        <p className="text-fs-base font-extrabold text-muted-foreground">Total Amount</p>
        <p className="flex flex-wrap items-baseline justify-center gap-2">
          <span className="text-fs-money font-extrabold leading-none tabular-nums text-foreground">
            {money(total)}
          </span>
          <span className="text-fs-base font-bold tabular-nums text-muted-foreground">
            +{money(tip)} Tip
          </span>
        </p>
        <p className="pt-1 text-fs-sm font-bold text-muted-foreground">
          Amount Tendered: <span className="tabular-nums">{money(tendered)}</span>
        </p>
        {noteLine ? (
          <p className="text-fs-sm font-bold text-muted-foreground">Notes tendered: {noteLine}</p>
        ) : null}
        <p className="text-fs-sm font-bold text-muted-foreground">
          Change due: <span className="tabular-nums">{money(change)}</span>
        </p>
      </div>

      <div className="grid shrink-0 grid-cols-3 gap-2">
        {tiles.map((t) => {
          const on = choice === t.id;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={on}
              onClick={() => setChoice(on ? null : t.id)}
              className={cn(
                "flex min-h-tap flex-col items-center justify-center gap-1 rounded-card border-2 px-1 py-2 transition-colors",
                on
                  ? "border-success bg-success/10 text-foreground"
                  : "border-border bg-surface text-foreground hover:bg-muted",
              )}
            >
              <t.icon
                className={cn("size-6 sm:size-7", on ? "text-success" : "text-foreground")}
                aria-hidden
              />
              <span className="text-center text-fs-xs font-extrabold uppercase leading-tight tracking-[0.04em]">
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="shrink-0 text-center text-fs-lg font-extrabold text-foreground">
        Please select receipt type
      </p>

      {choice === "email" ? (
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Receipt"
          inputMode="email"
          aria-label="Email for receipt"
          className="h-ctl-lg w-full shrink-0 rounded-card border-2 border-border bg-surface px-3 text-fs-base font-bold text-foreground outline-none placeholder:text-muted-foreground"
        />
      ) : null}

      {choice === "sms" ? (
        <div className="flex shrink-0 items-center gap-2">
          <span className="grid h-ctl-lg shrink-0 place-items-center rounded-card border-2 border-border bg-surface px-3 text-fs-base font-extrabold text-foreground">
            +1
          </span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
            inputMode="tel"
            aria-label="Phone number for receipt"
            className="h-ctl-lg min-w-0 flex-1 rounded-card border-2 border-border bg-surface px-3 text-fs-base font-bold text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      ) : null}

      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:justify-center">
        {choice === "email" ? (
          <button
            type="button"
            disabled={!email.trim()}
            onClick={() => send(`Receipt sent to ${email.trim()}`)}
            className="h-ctl-lg shrink-0 rounded-card bg-shell px-8 text-fs-base font-extrabold uppercase tracking-[0.04em] text-shell-foreground disabled:opacity-40"
          >
            Send
          </button>
        ) : null}
        {choice === "sms" ? (
          <button
            type="button"
            disabled={!phone.trim()}
            onClick={() => send(`Receipt texted to ${phone.trim()}`)}
            className="h-ctl-lg shrink-0 rounded-card bg-shell px-8 text-fs-base font-extrabold uppercase tracking-[0.04em] text-shell-foreground disabled:opacity-40"
          >
            Send
          </button>
        ) : null}
        {choice === "print" ? (
          <button
            type="button"
            onClick={() => send("Receipt sent to printer")}
            className="h-ctl-lg shrink-0 rounded-card bg-shell px-8 text-fs-base font-extrabold uppercase tracking-[0.04em] text-shell-foreground"
          >
            Print Receipt
          </button>
        ) : null}
        <button
          type="button"
          onClick={onDone}
          className={cn(
            "h-ctl-lg shrink-0 rounded-card px-8 text-fs-base font-extrabold tracking-[0.04em]",
            choice
              ? "border-2 border-border bg-surface text-foreground hover:bg-muted"
              : "bg-shell text-shell-foreground",
          )}
        >
          {doneLabel}
        </button>
      </div>
    </div>
  );
}

export function PaymentCompleteDialog({
  open,
  onDone,
  doneLabel,
}: {
  open: boolean;
  onDone: () => void;
  doneLabel?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => (next ? null : onDone())}>
      <DialogContent
        hideClose
        className="max-h-[92dvh] w-[min(40rem,94vw)] max-w-none gap-0 overflow-hidden rounded-sheet border-border bg-surface p-0"
      >
        <PaymentCompleteCard onDone={onDone} {...(doneLabel ? { doneLabel } : {})} />
      </DialogContent>
    </Dialog>
  );
}
