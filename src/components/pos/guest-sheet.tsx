import {
  Bike,
  Car,
  Check,
  Mail,
  Phone,
  Search,
  ShoppingBag,
  Truck,
  User,
  Users,
  Utensils,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SheetGrabber, useSheetDrag } from "@/components/pos/drag-close";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  serviceOrderTypes,
  vehicleColors,
  vehicleTypes,
  type ServiceOrderType,
} from "@/lib/demo-data";
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

const orderTypeIcons: Record<ServiceOrderType, typeof Utensils> = {
  "Dine In": Utensils,
  "Take Away": ShoppingBag,
  Delivery: Truck,
  Pickup: Bike,
  "Drive Thru": Car,
  Online: ShoppingBag,
};

/** New Order – Guest Info: order type, guest details, vehicle info and notes. */
export function GuestSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { guest, setGuest, orderType, setOrderType } = usePos();
  const [name, setName] = useState(guest.name);
  const [email, setEmail] = useState(guest.email ?? "");
  const [phone, setPhone] = useState(guest.phone);
  const [party, setParty] = useState(guest.partySize);
  const [type, setType] = useState<ServiceOrderType>(orderType);
  const [vehicleType, setVehicleType] = useState(guest.vehicle?.type ?? vehicleTypes[0]!);
  const [vehicleColor, setVehicleColor] = useState(
    guest.vehicle?.color ?? vehicleColors[0]!.name,
  );
  const [brand, setBrand] = useState(guest.vehicle?.brand ?? "");
  const [plate, setPlate] = useState(guest.vehicle?.plate ?? "");
  const [notes, setNotes] = useState(guest.notes ?? "");
  const { dragStyle, handleProps } = useSheetDrag(onClose);
  useBackDismiss(open, onClose);

  useEffect(() => {
    if (open) {
      setName(guest.name);
      setEmail(guest.email ?? "");
      setPhone(guest.phone);
      setParty(guest.partySize);
      setType(orderType);
      setVehicleType(guest.vehicle?.type ?? vehicleTypes[0]!);
      setVehicleColor(guest.vehicle?.color ?? vehicleColors[0]!.name);
      setBrand(guest.vehicle?.brand ?? "");
      setPlate(guest.vehicle?.plate ?? "");
      setNotes(guest.notes ?? "");
    }
  }, [open, guest, orderType]);

  const isDriveThru = type === "Drive Thru";
  const needsPhone = type === "Delivery" || type === "Take Away" || type === "Pickup";
  const vehicleComplete = Boolean(vehicleType && vehicleColor);
  const colorHex = vehicleColors.find((c) => c.name === vehicleColor)?.hex ?? "#b6bcc2";

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <SheetContent
        side="bottom"
        style={dragStyle}
        className="mx-auto flex max-h-[min(88dvh,44rem)] w-full max-w-sheet flex-col overflow-y-auto rounded-t-sheet border-0 bg-surface p-0 pb-[calc(1.25rem+var(--kb-inset,0px))]"
      >
        <SheetGrabber handleProps={handleProps} />
        <SheetHeader className="px-4 pb-2 pt-1 text-left">
          <SheetTitle className="text-fs-base font-extrabold text-foreground">
            New Order – Guest Info
          </SheetTitle>
        </SheetHeader>

        {/* Order type strip */}
        <div className="no-scrollbar mx-4 flex gap-2 overflow-x-auto rounded-row bg-muted p-1.5">
          {serviceOrderTypes.map((t) => {
            const Icon = orderTypeIcons[t];
            const active = t === type;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={active}
                onClick={() => setType(t)}
                className={cn(
                  "min-h-ctl-md flex shrink-0 items-center gap-1.5 rounded-row px-3 text-fs-xs font-extrabold uppercase tracking-[0.04em] transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-muted-foreground hover:bg-secondary",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {t}
              </button>
            );
          })}
        </div>

        <p className="px-4 pb-1.5 pt-4 text-fs-sm font-extrabold text-foreground">
          Guest Information
        </p>
        <div className="space-y-2 px-4">
          <div className="flex items-center gap-2 rounded-row border border-border bg-surface px-3">
            <User className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Guest Name - Table Number - Order Name*"
              aria-label="Guest name, table number or order name"
              className="h-ctl-lg min-w-0 flex-1 bg-transparent text-fs-sm text-foreground outline-none"
            />
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </div>
          <div className="flex items-center gap-2 rounded-row border border-border bg-surface px-3">
            <Mail className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              inputMode="email"
              placeholder="name@example.com"
              aria-label="Guest email"
              className="h-ctl-lg min-w-0 flex-1 bg-transparent text-fs-sm text-foreground outline-none"
            />
          </div>
          <div
            className={cn(
              "flex items-center gap-2 rounded-row border bg-surface px-3",
              needsPhone && !phone ? "border-accent" : "border-border",
            )}
          >
            <span className="shrink-0 text-fs-sm font-bold text-muted-foreground">+1</span>
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
          <div className="flex items-center gap-2 rounded-row border border-border bg-surface px-3">
            <Users className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 text-fs-sm text-muted-foreground">Party Size</span>
            <select
              value={party}
              onChange={(e) => setParty(Number(e.target.value))}
              aria-label="Party size"
              className="h-ctl-lg min-h-tap min-w-[3rem] shrink-0 bg-transparent px-1 text-center text-fs-sm font-bold text-foreground outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {needsPhone && !phone ? (
          <p className="px-4 pt-2 text-fs-xs font-semibold text-accent">
            {type} orders usually need a contact number.
          </p>
        ) : null}

        {/* Vehicle information — Drive Thru only */}
        {isDriveThru ? (
          <>
            <div className="flex items-center gap-2 px-4 pb-1.5 pt-4">
              <p className="min-w-0 flex-1 text-fs-sm font-extrabold text-foreground">
                Vehicle Information
              </p>
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-pill",
                  vehicleComplete ? "bg-success text-background" : "bg-muted text-muted-foreground",
                )}
                aria-label={vehicleComplete ? "Vehicle details complete" : "Vehicle details needed"}
              >
                <Check className="size-4" aria-hidden />
              </span>
            </div>
            <div className="mx-4 space-y-3 rounded-card border border-border bg-surface p-3">
              <label className="block">
                <span className="block pb-1 text-fs-xs font-bold text-muted-foreground">
                  Vehicle Type*
                </span>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="h-ctl-lg w-full rounded-row border border-border bg-surface px-3 text-fs-sm font-bold text-foreground outline-none"
                >
                  {vehicleTypes.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block pb-1 text-fs-xs font-bold text-muted-foreground">
                  Color*
                </span>
                <span className="flex items-center gap-2 rounded-row border border-border bg-surface px-3">
                  <span
                    className="size-4 shrink-0 rounded-pill border border-border"
                    style={{ backgroundColor: colorHex }}
                    aria-hidden
                  />
                  <select
                    value={vehicleColor}
                    onChange={(e) => setVehicleColor(e.target.value)}
                    aria-label="Vehicle colour"
                    className="h-ctl-lg min-w-0 flex-1 bg-transparent text-fs-sm font-bold text-foreground outline-none"
                  >
                    {vehicleColors.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </span>
              </label>
              <label className="block">
                <span className="block pb-1 text-fs-xs font-bold text-muted-foreground">Brand</span>
                <input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Optional"
                  className="h-ctl-lg w-full rounded-row border border-border bg-surface px-3 text-fs-sm text-foreground outline-none"
                />
              </label>
              <label className="block">
                <span className="block pb-1 text-fs-xs font-bold text-muted-foreground">
                  License Plate
                </span>
                <input
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="Optional"
                  className="h-ctl-lg w-full rounded-row border border-border bg-surface px-3 text-fs-sm uppercase text-foreground outline-none"
                />
              </label>
            </div>
          </>
        ) : null}

        {/* Notes */}
        <div className="mx-4 mt-3 rounded-card border border-border bg-surface p-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 500))}
            rows={3}
            placeholder="Notes"
            aria-label="Order notes"
            className="w-full resize-none bg-transparent text-fs-sm text-foreground outline-none"
          />
          <p className="text-right text-fs-xs text-muted-foreground">{notes.length}/500</p>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-border px-4 pt-3">
          <button
            type="button"
            onClick={() => {
              setGuest({
                name: "",
                phone: "",
                partySize: 1,
                email: "",
                notes: "",
                vehicle: undefined,
              });
              setOrderType("Dine In");
              onClose();
            }}
            className="h-ctl-lg shrink-0 rounded-pill border border-border px-4 text-fs-sm font-bold text-foreground"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              setGuest({
                name: name.trim(),
                phone,
                partySize: party,
                email: email.trim(),
                notes,
                ...(isDriveThru
                  ? {
                      vehicle: {
                        type: vehicleType,
                        color: vehicleColor,
                        brand: brand.trim(),
                        plate: plate.trim(),
                      },
                    }
                  : {}),
              });
              setOrderType(type);
              toast.success("Guest details saved");
              onClose();
            }}
            className="h-ctl-lg flex-1 rounded-pill bg-primary text-fs-sm font-extrabold uppercase tracking-[0.06em] text-primary-foreground"
          >
            Save
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
