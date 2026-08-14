import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/payment/success")({
  head: () => ({
    meta: [
      { title: "Payment Successful — eatOS Point of Sale" },
      {
        name: "description",
        content: "Payment confirmation with change due, receipt sharing and printing options.",
      },
      { property: "og:title", content: "Payment Successful — eatOS Point of Sale" },
      {
        property: "og:description",
        content: "Payment confirmation with change due, receipt sharing and printing options.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaymentSuccess,
});

function Row({
  label,
  value,
  onClick,
  chevron,
}: {
  label: string;
  value?: string;
  onClick?: () => void;
  chevron?: boolean;
}) {
  const content = (
    <>
      <span className="min-w-0 flex-1 truncate text-fs-sm font-bold text-foreground">{label}</span>
      {value ? (
        <span className="shrink-0 text-fs-sm text-muted-foreground">{value}</span>
      ) : null}
      {chevron ? <ChevronRight className="size-4 shrink-0 text-muted-foreground" /> : null}
    </>
  );
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-row w-full items-center gap-2 border-b border-border px-4 py-3 text-left last:border-b-0 transition-colors hover:bg-muted"
    >
      {content}
    </button>
  ) : (
    <div className="flex min-h-row w-full items-center gap-2 border-b border-border px-4 py-3 last:border-b-0">
      {content}
    </div>
  );
}

function ShareRow({
  icon: Icon,
  label,
  placeholder,
  inputMode,
  defaultValue,
}: {
  icon: typeof Phone;
  label: string;
  placeholder: string;
  inputMode: "tel" | "email";
  defaultValue: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-row w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-muted"
      >
        <Icon className="size-4 shrink-0 text-foreground" aria-hidden />
        <span className="min-w-0 flex-1 text-fs-sm font-bold text-foreground">{label}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <div className="flex items-center gap-2 px-4 pb-3">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            inputMode={inputMode === "tel" ? "tel" : "email"}
            aria-label={`${label} for receipt`}
            className="h-ctl-lg min-w-0 flex-1 rounded-row border border-border bg-surface px-3 text-fs-sm text-foreground outline-none"
          />
          <button
            type="button"
            onClick={() => toast.success(`Receipt sent by ${label.toLowerCase()}`)}
            className="h-ctl-lg shrink-0 rounded-pill bg-primary px-4 text-fs-sm font-extrabold text-primary-foreground"
          >
            Send
          </button>
        </div>
      ) : null}
    </div>
  );
}

function PaymentSuccess() {
  const navigate = useNavigate();
  const { lastPayment, guest, tickets } = usePos();
  const ticket = lastPayment ? tickets.find((t) => t.id === lastPayment.ticketId) : undefined;
  const orderNumber = lastPayment?.orderNumber ?? ticket?.number ?? 0;
  const guestName = (lastPayment?.guestName || guest.name || ticket?.label || "").trim();
  const total = lastPayment?.total ?? 0;
  const change = lastPayment?.change ?? 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex shrink-0 items-center gap-1 px-2 pt-2">
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate({ to: "/tickets" })}
          className="grid size-11 place-items-center rounded-pill text-foreground transition-colors hover:bg-muted"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="mx-auto pr-11 text-fs-lg font-extrabold text-foreground">
          Payment Successful
        </h1>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-[calc(1rem+var(--kb-inset,0px)+var(--tabs-h,0px))] pt-4">
        <div className="mx-auto grid size-14 place-items-center rounded-pill bg-foreground">
          <Check className="size-7 text-background" aria-hidden />
        </div>

        <div className="mx-auto w-full max-w-sheet overflow-hidden rounded-card bg-surface">
          <Row label="Order Number" value={String(orderNumber)} />
          <Row label="Guest Name" value={guestName || "-"} />
        </div>

        <div className="mx-auto w-full max-w-sheet overflow-hidden rounded-card bg-surface">
          <Row label="Total Amount" value={money(total)} />
          <Row label="Change Amount" value={money(change)} />
        </div>

        <button
          type="button"
          onClick={() => toast.success("Receipt shared")}
          className="mx-auto flex min-h-ctl-lg w-full max-w-sheet items-center justify-center rounded-card bg-surface text-fs-base font-extrabold text-foreground"
        >
          Share Receipt
        </button>

        <div className="mx-auto w-full max-w-sheet overflow-hidden rounded-card bg-surface">
          <ShareRow
            icon={Phone}
            label="Phone"
            placeholder="(XXX) XXX-XXXX"
            inputMode="tel"
            defaultValue={guest.phone}
          />
          <ShareRow
            icon={Mail}
            label="Email"
            placeholder="name@example.com"
            inputMode="email"
            defaultValue={guest.email ?? ""}
          />
        </div>

        <div className="mx-auto w-full max-w-sheet overflow-hidden rounded-card bg-surface">
          <Row label="Bill" onClick={() => toast.success("Bill printed")} />
          <Row
            label="Receipt"
            value="Choose"
            chevron
            onClick={() => toast.success("Receipt printed")}
          />
          <Row
            label="Bill + Receipt"
            value="Choose"
            chevron
            onClick={() => toast.success("Bill and receipt printed")}
          />
        </div>

        <div className="mx-auto w-full max-w-sheet space-y-3 pt-1">
          <button
            type="button"
            onClick={() => toast.success("Receipt sent to printer")}
            className="min-h-ctl-lg w-full rounded-card border border-border bg-surface text-fs-base font-bold uppercase tracking-[0.04em] text-foreground"
          >
            Print Receipt
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/tickets" })}
            className="min-h-ctl-lg w-full rounded-card bg-foreground text-fs-base font-bold uppercase tracking-[0.04em] text-background"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
