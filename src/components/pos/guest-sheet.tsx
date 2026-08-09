import { Phone, User, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SheetGrabber, useSheetDrag } from "@/components/pos/drag-close";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { serviceOrderTypes, type ServiceOrderType } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { useBackDismiss } from "@/hooks/use-back-dismiss";
import { cn } from "@/lib/utils";

/** Format raw digits as (XXX) XXX-XXXX while typing. */
export function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Guest details sheet: name, phone, party size and order type. */
export function GuestSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { guest, setGuest, orderType, setOrderType } = usePos();
  const [name, setName] = useState(guest.name);
  const [phone, setPhone] = useState(guest.phone);
  const [party, setParty] = useState(guest.partySize);
  const [type, setType] = useState<ServiceOrderType>(orderType);
  const { dragStyle, handleProps } = useSheetDrag(onClose);
  useBackDismiss(open, onClose);

  useEffect(() => {
    if (open) {
      setName(guest.name);
      setPhone(guest.phone);
      setParty(guest.partySize);
      setType(orderType);
    }
  }, [open, guest, orderType]);

  const needsPhone = type === "Delivery" || type === "Take Away" || type === "Pickup";

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <SheetContent
        side="bottom"
        style={dragStyle}
        className="mx-auto flex max-h-[85dvh] w-full max-w-[420px] flex-col overflow-y-auto rounded-t-3xl border-0 bg-surface p-0 pb-[calc(1.25rem+var(--kb-inset,0px))]"
      >
        <SheetGrabber handleProps={handleProps} />
        <SheetHeader className="px-4 pb-2 pt-1 text-left">
          <SheetTitle className="text-base font-extrabold uppercase text-foreground">
            Guest Details
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-2 px-4">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3">
            <User className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Guest Name"
              aria-label="Guest name"
              className="h-ctl-lg min-w-0 flex-1 bg-transparent text-fs-sm text-foreground outline-none"
            />
          </div>
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border bg-surface px-3",
              needsPhone && !phone ? "border-accent" : "border-border",
            )}
          >
            <Phone className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              inputMode="tel"
              placeholder="(XXX) XXX-XXXX"
              aria-label="Guest phone number"
              className="h-ctl-lg min-w-0 flex-1 bg-transparent text-fs-sm text-foreground outline-none"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3">
            <Users className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 text-fs-sm text-muted-foreground">Party Size</span>
            <select
              value={party}
              onChange={(e) => setParty(Number(e.target.value))}
              aria-label="Party size"
              className="h-ctl-lg shrink-0 bg-transparent text-fs-sm font-bold text-foreground outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="px-4 pb-1.5 pt-3 text-xs font-bold text-muted-foreground">Order Type</p>
        <div className="flex flex-wrap gap-2 px-4">
          {serviceOrderTypes.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={t === type}
              onClick={() => setType(t)}
              className={cn(
                "min-h-ctl-sm rounded-full px-3.5 text-fs-sm font-bold transition-colors",
                t === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-secondary",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        {needsPhone && !phone ? (
          <p className="px-4 pt-2 text-fs-xs font-semibold text-accent">
            {type} orders usually need a contact number.
          </p>
        ) : null}

        <div className="mt-4 flex items-center gap-2 border-t border-border px-4 pt-3">
          <button
            type="button"
            onClick={() => {
              setGuest({ name: "", phone: "", partySize: 1 });
              setOrderType("Dine In");
              onClose();
            }}
            className="h-ctl-lg shrink-0 rounded-full border border-border px-4 text-fs-sm font-bold text-foreground"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              setGuest({ name: name.trim(), phone, partySize: party });
              setOrderType(type);
              toast.success("Guest details saved");
              onClose();
            }}
            className="h-ctl-lg flex-1 rounded-full bg-primary text-fs-sm font-extrabold uppercase tracking-[0.06em] text-primary-foreground"
          >
            Save
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
