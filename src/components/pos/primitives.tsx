import { Link } from "@tanstack/react-router";
import { ChevronRight, Delete, Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { money, statusMeta, type Ticket } from "@/lib/demo-data";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-1 pb-2 pt-4 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
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
    <div className={cn("rounded-2xl border border-border bg-surface", className)}>{children}</div>
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
      className="flex min-h-[60px] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 transition-colors hover:bg-muted"
    >
      {icon ? <span className="shrink-0 text-accent">{icon}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-foreground">{title}</span>
        {detail ? (
          <span className="block truncate text-xs text-muted-foreground">{detail}</span>
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
      className="flex min-h-[60px] w-full items-center gap-3 border-b border-border px-4 py-3 text-left last:border-b-0 transition-colors hover:bg-muted"
    >
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-sm font-bold",
            tone === "danger" ? "text-destructive" : "text-foreground",
          )}
        >
          {title}
        </span>
        {detail ? (
          <span className="block truncate text-xs text-muted-foreground">{detail}</span>
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
    <div className="flex min-h-[60px] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">{title}</p>
        {detail ? <p className="truncate text-xs text-muted-foreground">{detail}</p> : null}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} className="shrink-0" />
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
      <span className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">{title}</span>
      <span className="shrink-0 truncate text-sm text-muted-foreground">{value}</span>
    </>
  );
  if (!onClick) {
    return (
      <div className="flex min-h-[56px] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
        {content}
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[56px] w-full items-center gap-3 border-b border-border px-4 py-3 text-left last:border-b-0 transition-colors hover:bg-muted"
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
            "min-h-ctl-sm shrink-0 rounded-full px-3.5 text-fs-sm font-bold transition-colors",
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

export function TicketCard({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) {
  const meta = statusMeta[ticket.status];
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-3 text-left transition-colors hover:bg-muted"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-sm font-extrabold text-foreground">
        {ticket.seats}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-extrabold text-foreground">
          {ticket.label}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          Arrived {ticket.arrivedAt} · {ticket.arrivedMinutesAgo} min ago
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-sm font-extrabold text-foreground">{money(ticket.total)}</span>
        <span className={cn("block text-xs font-bold", meta.tone)}>{meta.label}</span>
      </span>
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
      className="grid min-h-[56px] place-items-center rounded-2xl bg-surface text-xl font-extrabold text-foreground shadow-sm transition-transform active:scale-[0.97]"
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
        <span className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
          {icon ?? <Inbox className="size-6" aria-hidden />}
        </span>
        <p className="text-fs-sm font-extrabold text-foreground">{title}</p>
        <p className="mt-1 text-fs-xs text-muted-foreground">{detail}</p>
        {action ? (
          <button
            type="button"
            onClick={action.onPress}
            className="min-h-ctl-sm mt-4 rounded-full bg-primary px-5 text-fs-sm font-extrabold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {action.label}
          </button>
        ) : null}
      </div>
    </div>
  );
}
