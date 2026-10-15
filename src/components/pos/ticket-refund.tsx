import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { SwipeRow } from "@/components/pos/swipe-row";
import { money, type Ticket } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const REFUND_REASONS = ["QSA", "Food Cold", "Prepared Incorrectly", "Long Wait", "Out of Stock", "Other"] as const;

/** Paid / refund rows for a closed ticket. Swipe left (or tap Refund) to start a refund. */
export function ClosedPaymentRows({ ticket, onRefund }: { ticket: Ticket; onRefund: () => void }) {
  const last = ticket.payments?.[ticket.payments.length - 1];
  const method = ticket.paymentType ?? last?.method ?? "Cash";
  const paidAt = last?.at ?? ticket.arrivedAt;
  const refund = ticket.refund;
  return (
    <div data-ticket-closed-payments className="mt-3 space-y-2">
      <SwipeRow
        className="overflow-hidden rounded-row border border-border bg-surface"
        action={refund ? undefined : { label: "Refund", destructive: true, onAction: onRefund }}
      >
        <div className="flex items-center gap-3 bg-surface px-3 py-2">
          <span className="min-w-0 flex-1">
            <span className={cn("block text-fs-xs font-extrabold uppercase", refund ? "text-destructive" : "text-foreground")}>
              {refund ? "Refunded" : "Paid"} <span className="font-bold normal-case text-muted-foreground">{paidAt}</span>
            </span>
            <span className="block text-fs-xs text-muted-foreground">{method} Payment</span>
          </span>
          <span className="shrink-0 text-fs-sm font-extrabold tabular-nums text-foreground">{money(ticket.total)}</span>
          {refund ? null : (
            <Button size="sm" variant="outline" onClick={onRefund}
              className="h-8 shrink-0 rounded-row border-destructive/40 px-3 text-fs-xs font-extrabold uppercase text-destructive">
              Refund
            </Button>
          )}
        </div>
      </SwipeRow>
      {refund ? (
        <div className="flex items-center gap-3 rounded-row border border-border bg-surface px-3 py-2">
          <span className="min-w-0 flex-1">
            <span className="block text-fs-xs font-extrabold uppercase text-destructive">
              Refund <span className="font-bold normal-case text-muted-foreground">{refund.at}</span>
            </span>
            <span className="block break-words text-fs-xs text-muted-foreground">{refund.reason}</span>
          </span>
          <span className="shrink-0 text-fs-sm font-extrabold tabular-nums text-foreground">-{money(refund.amount)}</span>
        </div>
      ) : null}
    </div>
  );
}

/** Reason picker; tapping outside cancels without refunding. */
export function RefundReasonDialog({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (v: boolean) => void; onDone: (reason: string) => void }) {
  const [choice, setChoice] = useState<string | null>(null);
  const [other, setOther] = useState("");
  useEffect(() => { if (open) { setChoice(null); setOther(""); } }, [open]);
  const ready = choice !== null && (choice !== "Other" || other.trim().length > 0);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 p-0">
        <DialogTitle className="px-4 pb-2 pt-4 text-fs-lg font-extrabold">Select a Reason Code</DialogTitle>
        <div role="radiogroup" aria-label="Refund reason" className="px-3">
          {REFUND_REASONS.map((r) => {
            const on = choice === r;
            return (
              <button key={r} type="button" role="radio" aria-checked={on} onClick={() => setChoice(r)}
                className={cn("flex min-h-row w-full items-center justify-between border-b border-border px-2 text-left text-fs-sm font-bold text-foreground hover:bg-muted", on && "bg-muted")}>
                {r}
                <span className={cn("grid size-5 place-items-center rounded-full border", on ? "border-foreground bg-foreground text-background" : "border-muted-foreground/50")}>
                  {on ? <Check className="size-3.5" /> : null}
                </span>
              </button>
            );
          })}
          {choice === "Other" ? (
            <Textarea autoFocus value={other} onChange={(e) => setOther(e.target.value)} placeholder="Enter the reason"
              aria-label="Refund reason" className="mt-3 min-h-20" />
          ) : null}
        </div>
        <div className="p-3">
          <Button disabled={!ready} className="h-11 w-full rounded-row bg-primary font-extrabold uppercase text-primary-foreground"
            onClick={() => { if (!ready) return; onDone(choice === "Other" ? other.trim() : choice!); onOpenChange(false); }}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
