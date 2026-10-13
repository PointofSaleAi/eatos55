import { Home, Printer, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { creditLeft } from "@/components/pos/room-charge-dialog";
import { money, TAX_RATE, type Ticket } from "@/lib/demo-data";
import { rooms } from "@/lib/floor-data";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

/** Status words for a room-charge ticket, shared by cards and detail. */
export function roomChargeLabel(t: Ticket) {
  if (!t.roomCharge) return null;
  if (t.roomCharge.stage === "posted") return { label: "Posted to Room", tone: "text-success" };
  return { label: "Payment in Progress", tone: "text-warning" };
}

export function roomProofLabel(t: Ticket) {
  if (!t.roomCharge) return null;
  return t.roomCharge.stage === "printed" ? "Pending proof" : "Signature collected";
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[0.625rem] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="truncate text-fs-sm font-bold text-foreground">{value}</p>
    </div>
  );
}

/**
 * Footer actions for a room-charge ticket: bill + signature, Post to Room, and tips.
 * Renders nothing for other tickets.
 */
export function RoomTicketActions({ ticket }: { ticket: Ticket }) {
  const { markRoomSigned, postToRoom, roomCreditUsed, settings } = usePos();
  const [billOpen, setBillOpen] = useState(false);
  const [postOpen, setPostOpen] = useState<null | "post" | "tip">(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const rc = ticket.roomCharge;
  if (!rc) return null;
  const room = rooms.find((r) => r.id === rc.roomId) ?? null;
  const base = Math.round((ticket.total - (ticket.tips ?? 0)) * 100) / 100;
  const posted = rc.stage === "posted";

  return (
    <>
      <div className="flex gap-2">
        <button
          type="button"
          aria-label="Room bill"
          onClick={() => setBillOpen(true)}
          className="grid h-12 w-14 shrink-0 place-items-center rounded-pill border border-border text-foreground hover:bg-muted"
        >
          <Printer className="size-5" aria-hidden />
        </button>
        {posted ? (
          <button
            type="button"
            onClick={() => setPostOpen("tip")}
            className="h-12 flex-1 rounded-pill bg-primary text-fs-sm font-extrabold uppercase tracking-[0.08em] text-primary-foreground"
          >
            {(ticket.tips ?? 0) > 0 ? "Edit tip" : "Add tip"}
          </button>
        ) : (
          <button
            type="button"
            disabled={rc.stage !== "signed"}
            onClick={() => setPostOpen("post")}
            className="h-12 flex-1 rounded-pill bg-primary text-fs-sm font-extrabold uppercase tracking-[0.08em] text-primary-foreground disabled:bg-muted disabled:text-muted-foreground"
          >
            {rc.stage === "signed" ? `Post to Room ${money(base)}` : "Awaiting signature"}
          </button>
        )}
      </div>

      {/* Room bill with signature steps */}
      <Dialog open={billOpen} onOpenChange={setBillOpen}>
        <DialogContent className="flex max-h-[90dvh] w-[min(26rem,94vw)] flex-col gap-3 overflow-y-auto rounded-sheet border-border bg-surface p-5">
          <DialogTitle className="text-fs-lg font-extrabold text-foreground">Room Bill</DialogTitle>
          <p className="text-center text-fs-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {settings.restaurantName} · Room bill for signature
          </p>
          <dl className="space-y-1 border-y border-dashed border-border py-2 text-fs-xs">
            {[
              ["Room", room ? `${room.name} · ${room.number}` : rc.roomName],
              ["Guest", room?.guest ?? ticket.label],
              ["Stay", room?.stay ? `${room.stay.stayFrom} – ${room.stay.stayTo}` : "—"],
              ["Order #", `#${ticket.number}`],
              ["Date & time", `${ticket.date} · ${ticket.arrivedAt}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="truncate font-bold text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="space-y-1 text-fs-xs">
            {ticket.lines.map((l) => (
              <div key={l.id} className="flex justify-between gap-3">
                <span className="min-w-0 truncate font-bold uppercase text-foreground">
                  {l.name} ×{l.qty}
                </span>
                <span className="tabular-nums text-foreground">{money(l.price * l.qty)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1 border-t border-dashed border-border pt-2 text-fs-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="tabular-nums">{money(Math.round(base * (TAX_RATE / (1 + TAX_RATE)) * 100) / 100)}</span>
            </div>
            {(ticket.tips ?? 0) > 0 ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tip</span>
                <span className="tabular-nums">{money(ticket.tips ?? 0)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-fs-base font-extrabold">
              <span>Total due</span>
              <span className="tabular-nums">{money(ticket.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment method</span>
              <span className="font-bold">Posted to Room</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toast.success("Bill sent to printer")}
            className="flex h-11 items-center justify-center gap-2 rounded-pill border border-border text-fs-sm font-bold text-foreground hover:bg-muted"
          >
            <Printer className="size-4" aria-hidden />
            Re-print bill
          </button>
          {rc.stage === "printed" ? (
            <>
              <p className="text-center text-fs-xs text-muted-foreground">
                Bill printed. Have the guest review and sign.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  markRoomSigned(ticket.id, f.name);
                  toast.success("Signed bill uploaded");
                  setBillOpen(false);
                }}
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-11 items-center justify-center gap-1.5 rounded-pill border border-border text-fs-sm font-bold text-foreground hover:bg-muted"
                >
                  <Upload className="size-4" aria-hidden />
                  Upload signed bill
                </button>
                <button
                  type="button"
                  onClick={() => {
                    markRoomSigned(ticket.id);
                    toast.success("Signature collected");
                    setBillOpen(false);
                  }}
                  className="h-11 rounded-pill bg-primary text-fs-sm font-bold text-primary-foreground"
                >
                  Signature collected
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-fs-xs font-bold text-success">
              Signature collected{rc.proofName ? ` · ${rc.proofName}` : ""}
            </p>
          )}
        </DialogContent>
      </Dialog>

      <PostToRoomDialog
        open={postOpen !== null}
        withKeypad={postOpen === "tip"}
        ticket={ticket}
        base={base}
        creditAvailable={
          room
            ? creditLeft(room, roomCreditUsed[room.id] ?? 0) + (rc.postedAmount ?? 0)
            : 0
        }
        onClose={() => setPostOpen(null)}
        onPost={(tip) => {
          postToRoom(ticket.id, tip);
          toast.success(`Order posted to ${rc.roomName}`);
          setPostOpen(null);
        }}
      />
    </>
  );
}

function PostToRoomDialog({
  open,
  withKeypad,
  ticket,
  base,
  creditAvailable,
  onClose,
  onPost,
}: {
  open: boolean;
  withKeypad: boolean;
  ticket: Ticket;
  base: number;
  creditAvailable: number;
  onClose: () => void;
  onPost: (tip: number) => void;
}) {
  const rc = ticket.roomCharge!;
  const room = rooms.find((r) => r.id === rc.roomId) ?? null;
  const [cents, setCents] = useState<string>("");
  const tip = withKeypad ? Number(cents || "0") / 100 : (ticket.tips ?? 0);
  const total = Math.round((base + tip) * 100) / 100;
  const remaining = Math.round((creditAvailable - total) * 100) / 100;
  const blocked = remaining < 0;
  const press = (k: string) =>
    setCents((c) => {
      if (k === "C") return "";
      const next = (c + k).replace(/^0+/, "");
      return next.length > 6 ? c : next;
    });

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setCents("");
          onClose();
        }
      }}
    >
      <DialogContent className="flex max-h-[92dvh] w-[min(28rem,94vw)] flex-col gap-3 overflow-y-auto rounded-sheet border-border bg-surface p-5">
        <DialogTitle className="flex items-center gap-2 text-fs-lg font-extrabold text-foreground">
          <Home className="size-5" aria-hidden />
          {withKeypad ? "Add Tip" : "Post to Room"}
        </DialogTitle>
        <div className="grid grid-cols-2 gap-3">
          <Fact label="Order number" value={`#${ticket.number}`} />
          <Fact label="Check number" value={String(ticket.checkNumber ?? ticket.number)} />
        </div>
        <div className="space-y-2 rounded-card bg-muted/60 p-3">
          <div className="flex justify-between text-fs-sm">
            <span className="text-muted-foreground">Base amount</span>
            <span className="font-bold tabular-nums">{money(base)}</span>
          </div>
          <div className="flex items-center justify-between text-fs-sm">
            <span className="text-muted-foreground">Tip</span>
            <span
              className={cn(
                "min-w-20 rounded-row border px-2 py-1 text-right font-bold tabular-nums",
                withKeypad ? "border-foreground bg-surface" : "border-border",
              )}
            >
              {money(tip)}
            </span>
          </div>
          {withKeypad ? (
            <div className="grid grid-cols-3 gap-1.5">
              {["7", "8", "9", "4", "5", "6", "1", "2", "3", "C", "0", "00"].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => press(k)}
                  className="h-10 rounded-row bg-surface text-fs-base font-extrabold text-foreground shadow-sm active:scale-[0.97]"
                >
                  {k}
                </button>
              ))}
            </div>
          ) : null}
          <div className="flex justify-between border-t border-border pt-2 text-fs-base font-extrabold">
            <span>Total to post</span>
            <span className="tabular-nums">{money(total)}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Fact label="Guest name" value={room?.guest ?? ticket.label} />
          <Fact label="Room number" value={room?.number ?? rc.roomName} />
          <Fact
            label="Stay period"
            value={room?.stay ? `${room.stay.stayFrom} – ${room.stay.stayTo}` : "—"}
          />
          <Fact label="Credit limit" value={room?.stay ? money(room.stay.creditLimit) : "—"} />
          <Fact label="Remaining after post" value={money(Math.max(0, remaining))} />
        </div>
        {blocked ? (
          <p className="text-center text-fs-xs font-bold text-destructive">
            Not enough credit left on this stay.
          </p>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setCents("");
              onClose();
            }}
            className="h-11 rounded-pill border border-border text-fs-sm font-bold text-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={blocked}
            onClick={() => {
              onPost(tip);
              setCents("");
            }}
            className="h-11 rounded-pill bg-primary text-fs-sm font-extrabold uppercase text-primary-foreground disabled:opacity-40"
          >
            Post to Room
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
