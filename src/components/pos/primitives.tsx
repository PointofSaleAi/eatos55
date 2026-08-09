import { Link } from "@tanstack/react-router";
import { ChevronRight, Delete, Inbox, Table2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { modeOrderType, money, statusMeta, type Ticket } from "@/lib/demo-data";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-1 pb-2 pt-4 t-section text-muted-foreground">
      {children}
    </p>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-card border border-border bg-surface elev-1", className)}>{children}</div>
  );
}

export function NavRow({
  to,
  title,
  detail,
  icon,
}: {
  to: string;
  title: string;
  detail?: string;
  icon?: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex min-h-row items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 transition-colors hover:bg-muted"
    >
      {icon ? <span className="shrink-0 text-accent">{icon}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate t-row text-foreground">{title}</span>
        {detail ? (
          <span className="block truncate t-caption text-muted-foreground">{detail}</span>
        ) : null}
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

export function ActionRow({
  title,
  detail,
  onClick,
  tone = "default",
  right,
}: {
  title: string;
  detail?: string;
  onClick: () => void;
  tone?: "default" | "danger";
  right?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-row w-full items-center gap-3 border-b border-border px-4 py-3 text-left last:border-b-0 transition-colors hover:bg-muted"
    >
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-fs-sm font-bold",
            tone === "danger" ? "text-destructive" : "text-foreground",
          )}
        >
          {title}
        </span>
        {detail ? (
          <span className="block truncate t-caption text-muted-foreground">{detail}</span>
        ) : null}
      </span>
      {right ?? <ChevronRight className="size-4 shrink-0 text-muted-foreground" />}
    </button>
  );
}

export function ToggleRow({
  title,
  detail,
  checked,
  onChange,
}: {
  title: string;
  detail?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex min-h-row items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="truncate t-row text-foreground">{title}</p>
        {detail ? <p className="truncate t-caption text-muted-foreground">{detail}</p> : null}
      </div>
      <span className="grid size-11 shrink-0 place-items-center">
        <Switch
          checked={checked}
          onCheckedChange={onChange}
          aria-label={title}
          className="shrink-0"
        />
      </span>

    </div>
  );
}

export function ValueRow({
  title,
  value,
  onClick,
}: {
  title: string;
  value: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="min-w-0 flex-1 truncate t-row text-foreground">{title}</span>
      <span className="shrink-0 truncate t-value text-muted-foreground">{value}</span>
    </>
  );
  if (!onClick) {
    return (
      <div className="flex min-h-row items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
        {content}
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-row w-full items-center gap-3 border-b border-border px-4 py-3 text-left last:border-b-0 transition-colors hover:bg-muted"
    >
      {content}
    </button>
  );
}

export function Pills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            "min-h-ctl-sm shrink-0 rounded-pill px-3.5 t-row transition-colors",
            value === o.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-secondary",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Live m:ss timer counting up from the ticket's arrival. */
function useTicketTimer(minutesAgo: number) {
  const [seconds, setSeconds] = useState(minutesAgo * 60);
  useEffect(() => {
    setSeconds(minutesAgo * 60);
    const id = window.setInterval(() => setSeconds((v) => v + 1), 1000);
    return () => window.clearInterval(id);
  }, [minutesAgo]);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const sec = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

function Cell({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <span className="block min-w-0">
      <span className="block truncate t-caption uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <span className={cn("block truncate t-row text-foreground", tone)}>{value}</span>
    </span>
  );
}

export function TicketCard({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) {
  const meta = statusMeta[ticket.status];
  const timer = useTicketTimer(ticket.arrivedMinutesAgo);
  const dateLabel = new Date(`${ticket.date}T12:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <button
      type="button"
      onClick={onClick}
      className="@container w-full rounded-card border border-border bg-surface px-3 py-3 text-left transition-colors hover:bg-muted"
    >
      <div className="flex items-center gap-2">
        <span className="flex shrink-0 items-center gap-1.5 rounded-row bg-muted px-2 py-1 t-row text-foreground">
          <Table2 className="size-4" aria-hidden />
          {ticket.number}
        </span>
        <span className="min-w-0 flex-1 truncate t-row text-foreground">{ticket.label}</span>
        <span className={cn("shrink-0 t-badge", meta.tone)}>{meta.label}</span>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 @[30rem]:grid-cols-4 @[46rem]:grid-cols-6">

        <Cell label="Timer" value={timer} />
        <Cell label="Check" value={String(ticket.checkNumber ?? ticket.number)} />
        <Cell label="Total" value={money(ticket.total)} />
        <Cell label="Tips" value={money(ticket.tips ?? 0)} />
        <Cell label="Order No" value={String(ticket.number)} />
        <Cell label="Arrived At" value={ticket.arrivedAt} />
        <Cell label="Date" value={dateLabel} />
        <Cell label="Employee" value={ticket.server} />
        <Cell label="Revenue Center" value={ticket.revenueCenter ?? "Main dining"} />
        <Cell label="Order Type" value={modeOrderType(ticket.mode)} />
        <Cell
          label="Payment Type"
          value={ticket.paymentType ?? (ticket.status === "paid" ? "Card" : "Unpaid")}
        />
      </div>
    </button>
  );
}


export function Keypad({
  onDigit,
  onBackspace,
  extraKey,
}: {
  onDigit: (d: string) => void;
  onBackspace: () => void;
  extraKey?: { label: string; onPress: () => void };
}) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  return (
    <div className="grid grid-cols-3 gap-2">
      {keys.map((k) => (
        <KeypadKey key={k} onPress={() => onDigit(k)}>
          {k}
        </KeypadKey>
      ))}
      {extraKey ? (
        <KeypadKey onPress={extraKey.onPress}>{extraKey.label}</KeypadKey>
      ) : (
        <span />
      )}
      <KeypadKey onPress={() => onDigit("0")}>0</KeypadKey>
      <KeypadKey onPress={onBackspace} label="Backspace">
        <Delete className="size-5" />
      </KeypadKey>
    </div>
  );
}

function KeypadKey({
  children,
  onPress,
  label,
}: {
  children: ReactNode;
  onPress: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        haptic("light");
        onPress();
      }}
      className="grid min-h-row place-items-center rounded-key bg-surface t-numeric text-foreground elev-1 transition-transform active:scale-[0.97]"
    >
      {children}
    </button>
  );
}

export function EmptyState({
  title,
  detail,
  icon,
  action,
}: {
  title: string;
  detail: string;
  icon?: ReactNode;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <div className="grid place-items-center px-6 py-12 text-center">
      <div>
        <span className="mx-auto mb-3 grid size-12 place-items-center rounded-card bg-muted text-muted-foreground">
          {icon ?? <Inbox className="size-6" aria-hidden />}
        </span>
        <p className="t-row text-foreground">{title}</p>
        <p className="mt-1 t-caption text-muted-foreground">{detail}</p>
        {action ? (
          <button
            type="button"
            onClick={action.onPress}
            className="min-h-ctl-sm mt-4 rounded-pill bg-primary px-5 t-row text-primary-foreground transition-opacity hover:opacity-90"
          >
            {action.label}
          </button>
        ) : null}
      </div>
    </div>
  );
}
