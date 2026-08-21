import {
  Bike,
  CalendarDays,
  Car,
  Check,
  Clock,
  Crosshair,
  Globe,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  Users,
  Utensils,
  Warehouse,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SheetGrabber, useSheetDrag } from "@/components/pos/drag-close";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  eventTypes,
  serviceOrderRequirements,
  serviceOrderTypeLabels,
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

export const orderTypeIcons: Record<ServiceOrderType, typeof Utensils> = {
  "Dine In": Utensils,
  "Take Away": ShoppingBag,
  Delivery: Bike,
  "Drive Thru": Car,
  Banquet: Warehouse,
  Scheduled: CalendarDays,
  "Phone In": PhoneCall,
  Custom: Sparkles,
  Pickup: Truck,
  Online: Globe,
};

const fieldRow =
  "flex items-center gap-2 rounded-row border border-border bg-surface px-3";
const fieldInput = "h-ctl-lg min-w-0 flex-1 bg-transparent text-fs-sm text-foreground outline-none";
const fieldLabel = "block pb-1 text-fs-xs font-bold text-muted-foreground";
const selectBox =
  "h-ctl-lg w-full rounded-row border border-border bg-surface px-3 text-fs-sm font-bold text-foreground outline-none";

/** New Order guest info: order type strip plus the fields that type needs. */
export function GuestSheet({
  open,
  onClose,
  initialType,
}: {
  open: boolean;
  onClose: () => void;
  initialType?: ServiceOrderType | undefined;
}) {
  const { guest, setGuest, orderType, setOrderType } = usePos();
  const [name, setName] = useState(guest.name);
  const [email, setEmail] = useState(guest.email ?? "");
  const [phone, setPhone] = useState(guest.phone);
  const [party, setParty] = useState(guest.partySize);
  const [type, setType] = useState<ServiceOrderType>(initialType ?? orderType);
  const [address, setAddress] = useState(guest.address ?? "");
  const [eventType, setEventType] = useState(guest.event?.type ?? "");
  const [eventDate, setEventDate] = useState(guest.event?.date ?? "");
  const [eventTime, setEventTime] = useState(guest.event?.time ?? "");
  const [eventGuests, setEventGuests] = useState(
    guest.event?.guests ? String(guest.event.guests) : "",
  );
  const [scheduledAt, setScheduledAt] = useState(guest.scheduledAt ?? "");
  const [customLabel, setCustomLabel] = useState(guest.customLabel ?? "");
  const [vehicleType, setVehicleType] = useState(guest.vehicle?.type ?? vehicleTypes[0]!);
  const [vehicleColor, setVehicleColor] = useState(guest.vehicle?.color ?? vehicleColors[0]!.name);
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
      setType(initialType ?? orderType);
      setAddress(guest.address ?? "");
      setEventType(guest.event?.type ?? "");
      setEventDate(guest.event?.date ?? "");
      setEventTime(guest.event?.time ?? "");
      setEventGuests(guest.event?.guests ? String(guest.event.guests) : "");
      setScheduledAt(guest.scheduledAt ?? "");
      setCustomLabel(guest.customLabel ?? "");
      setVehicleType(guest.vehicle?.type ?? vehicleTypes[0]!);
      setVehicleColor(guest.vehicle?.color ?? vehicleColors[0]!.name);
      setBrand(guest.vehicle?.brand ?? "");
      setPlate(guest.vehicle?.plate ?? "");
      setNotes(guest.notes ?? "");
    }
  }, [open, guest, orderType, initialType]);

  // Keep the chosen order type pill in sight when the sheet opens or type changes.
  const stripRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const active = stripRef.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    active?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [open, type]);

  const isDriveThru = type === "Drive Thru";
  const isBanquet = type === "Banquet";
  const isScheduled = type === "Scheduled";
  const isCustom = type === "Custom";
  const isOnline = type === "Online";
  const required = serviceOrderRequirements[type];
  const showAddress = type === "Delivery" || isBanquet;
  const values: Record<string, string> = { name, phone, address, scheduledAt };
  const missing = required.filter((f) => !values[f]?.trim());
  const vehicleComplete = Boolean(vehicleType && vehicleColor);
  const colorHex = vehicleColors.find((c) => c.name === vehicleColor)?.hex ?? "#b6bcc2";
  const star = (f: string) => (required.includes(f as never) ? "*" : "");

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <SheetContent
        hideClose
        side="bottom"
        style={dragStyle}
        className="mx-auto flex max-h-[min(90dvh,48rem)] w-full max-w-[min(48rem,96vw)] flex-col overflow-hidden rounded-t-sheet border-0 bg-background p-0 pb-[calc(1rem+var(--kb-inset,0px))]"
      >
        <SheetGrabber handleProps={handleProps} />

        {/* Order type strip, pinned so the type can change in place */}
        <div className="no-scrollbar mx-3 mt-1 flex shrink-0 gap-2 overflow-x-auto rounded-row bg-surface p-1.5">
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
                  "min-h-tap flex shrink-0 items-center gap-1.5 rounded-row px-3 text-fs-xs font-extrabold uppercase tracking-[0.04em] transition-colors",
                  active
                    ? "border-2 border-foreground bg-secondary text-foreground shadow-sm"
                    : "border border-transparent bg-muted text-muted-foreground hover:bg-secondary",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {serviceOrderTypeLabels[t]}
              </button>
            );
          })}
        </div>

        <SheetHeader className="flex-row shrink-0 items-center gap-2 px-4 pb-1.5 pt-3 text-left">
          <SheetTitle className="min-w-0 flex-1 text-fs-base font-extrabold text-foreground">
            Guest Information
          </SheetTitle>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close guest information"
            className="grid size-9 shrink-0 place-items-center rounded-pill bg-foreground text-background"
          >
            <X className="size-4" aria-hidden />
          </button>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto pb-2">
        <div className="grid gap-2 px-4 sm:grid-cols-2">
          <div className={cn(fieldRow, "sm:col-span-2")}>
            <User className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Guest Name - Table Number - Order Name${star("name")}`}
              aria-label="Guest name, table number or order name"
              className={fieldInput}
            />
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </div>

          <div className={fieldRow}>
            <Mail className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              inputMode="email"
              placeholder="name@example.com"
              aria-label="Guest email"
              className={fieldInput}
            />
          </div>

          <div
            className={cn(
              fieldRow,
              required.includes("phone") && !phone ? "border-accent" : "border-border",
            )}
          >
            <span className="shrink-0 text-fs-sm font-bold text-muted-foreground">+1</span>
            <Phone className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              inputMode="tel"
              placeholder={`(XXX) XXX-XXXX${star("phone")}`}
              aria-label="Guest phone number"
              className={fieldInput}
            />
          </div>

          {showAddress ? (
            <div className="flex items-center gap-2 sm:col-span-2">
              <div
                className={cn(
                  fieldRow,
                  "min-w-0 flex-1",
                  required.includes("address") && !address ? "border-accent" : "border-border",
                )}
              >
                <MapPin className="size-4 shrink-0 text-muted-foreground" />
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={`Address${star("address")}`}
                  aria-label="Address"
                  className={fieldInput}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setAddress("1 Market St, San Francisco, CA");
                  toast.success("Current location used");
                }}
                aria-label="Use current location"
                className="grid h-ctl-lg min-h-tap w-11 shrink-0 place-items-center rounded-row border border-border bg-surface text-foreground"
              >
                <Crosshair className="size-4" aria-hidden />
              </button>
            </div>
          ) : null}

          {type === "Dine In" ? (
            <div className={cn(fieldRow, "sm:col-span-2")}>
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
          ) : null}

          {isScheduled ? (
            <label className="block sm:col-span-2">
              <span className={fieldLabel}>Scheduled Date and Time*</span>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className={cn(selectBox, !scheduledAt && "border-accent")}
              />
            </label>
          ) : null}

          {isCustom ? (
            <label className="block sm:col-span-2">
              <span className={fieldLabel}>Custom Order Label</span>
              <input
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="Optional"
                className={selectBox}
              />
            </label>
          ) : null}

          {isOnline ? (
            <p className="text-fs-xs font-semibold text-muted-foreground sm:col-span-2">
              Online orders arrive from the ordering channel and cannot be edited here.
            </p>
          ) : null}
        </div>

        {/* Banquet event details */}
        {isBanquet ? (
          <div className="mx-4 mt-3 grid gap-3 rounded-card border border-border bg-surface p-3 sm:grid-cols-2">
            <label className="block">
              <span className={fieldLabel}>Event Type</span>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className={selectBox}
              >
                <option value="">Select Event Type</option>
                {eventTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={fieldLabel}>Number of Guests</span>
              <input
                value={eventGuests}
                onChange={(e) => setEventGuests(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                placeholder="Enter number of guests"
                className={selectBox}
              />
            </label>
            <label className="block">
              <span className={fieldLabel}>Event Date</span>
              <span className="relative block">
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className={selectBox}
                />
                <CalendarDays
                  className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
              </span>
            </label>
            <label className="block">
              <span className={fieldLabel}>Event Time</span>
              <span className="relative block">
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className={selectBox}
                />
                <Clock
                  className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
              </span>
            </label>
          </div>
        ) : null}

        {/* Vehicle information, Drive Thru only */}
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
            <div className="mx-4 grid gap-3 rounded-card border border-border bg-surface p-3 sm:grid-cols-2">
              <label className="block">
                <span className={fieldLabel}>Vehicle Type*</span>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className={selectBox}
                >
                  {vehicleTypes.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={fieldLabel}>Color*</span>
                <span className={fieldRow}>
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
                <span className={fieldLabel}>Brand</span>
                <input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Optional"
                  className={selectBox}
                />
              </label>
              <label className="block">
                <span className={fieldLabel}>License Plate</span>
                <input
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="Optional"
                  className={cn(selectBox, "uppercase")}
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

        {missing.length ? (
          <p className="px-4 pt-2 text-fs-xs font-semibold text-accent">
            {serviceOrderTypeLabels[type]} orders need {missing.join(", ")} before saving.
          </p>
        ) : null}

        </div>

        <div className="mt-2 flex shrink-0 items-center gap-2 border-t border-border px-4 pt-3">
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
                address: "",
                event: undefined,
                scheduledAt: "",
                customLabel: "",
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
            disabled={missing.length > 0}
            onClick={() => {
              setGuest({
                name: name.trim(),
                phone,
                partySize: party,
                email: email.trim(),
                notes,
                address: showAddress ? address.trim() : "",
                scheduledAt: isScheduled ? scheduledAt : "",
                customLabel: isCustom ? customLabel.trim() : "",
                event: isBanquet
                  ? {
                      type: eventType,
                      date: eventDate,
                      time: eventTime,
                      guests: eventGuests ? Number(eventGuests) : undefined,
                    }
                  : undefined,
                vehicle: isDriveThru
                  ? {
                      type: vehicleType,
                      color: vehicleColor,
                      brand: brand.trim(),
                      plate: plate.trim(),
                    }
                  : undefined,
              });
              setOrderType(type);
              toast.success("Guest details saved");
              onClose();
            }}
            className="h-ctl-lg flex-1 rounded-pill bg-primary text-fs-sm font-extrabold uppercase tracking-[0.06em] text-primary-foreground disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
