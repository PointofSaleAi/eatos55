import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/**
 * Settings list rows. Styling follows the original imported design system
 * (bordered surface cards, accent icons, compact type scale); the `color` prop
 * is kept for API compatibility but no longer paints a coloured tile.
 */
export type TileColor =
  | "green"
  | "violet"
  | "orange"
  | "indigo"
  | "purple"
  | "slate"
  | "sky"
  | "pink"
  | "magenta"
  | "yellow"
  | "red"
  | "blue"
  | "grey"
  | "black";

export function IconTile({ icon: Icon }: { icon: LucideIcon; color?: TileColor | undefined }) {
  return (
    <span className="shrink-0 text-accent">
      <Icon className="size-5" strokeWidth={2} />
    </span>
  );
}

export function GroupCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-surface", className)}>
      {children}
    </div>
  );
}

export function Caption({ children, tone }: { children: ReactNode; tone?: "danger" }) {
  return (
    <p
      className={cn(
        "px-1 pt-2 text-xs leading-snug",
        tone === "danger" ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {children}
    </p>
  );
}

export function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-1 pb-2 pt-4 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </p>
  );
}

type RowShellProps = {
  icon?: LucideIcon;
  color?: TileColor;
  title: string;
  value?: string;
  right?: ReactNode;
  chevron?: boolean;
};

function RowInner({ icon, color, title, value, right, chevron }: RowShellProps) {
  return (
    <>
      {icon ? <IconTile icon={icon} color={color} /> : null}
      <span className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">{title}</span>
      {value ? (
        <span className="shrink-0 truncate text-sm text-muted-foreground">{value}</span>
      ) : null}
      {right}
      {chevron ? <ChevronRight className="size-4 shrink-0 text-muted-foreground" /> : null}
    </>
  );
}

const rowBase =
  "flex min-h-[60px] w-full items-center gap-3 border-b border-border px-4 py-3 text-left last:border-b-0";

export function IconNavRow({
  to,
  topic,
  onClick,
  ...rest
}: RowShellProps & { to?: string; topic?: string; onClick?: () => void }) {
  if (topic) {
    return (
      <Link
        to="/settings/detail/$topic"
        params={{ topic }}
        className={cn(rowBase, "transition-colors hover:bg-muted")}
      >
        <RowInner {...rest} chevron />
      </Link>
    );
  }
  if (to) {
    return (
      <Link to={to} className={cn(rowBase, "transition-colors hover:bg-muted")}>
        <RowInner {...rest} chevron />
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(rowBase, "transition-colors hover:bg-muted")}
    >
      <RowInner {...rest} chevron />
    </button>
  );
}

export function IconValueRow(props: RowShellProps & { onClick?: () => void; topic?: string }) {
  const { onClick, topic, ...rest } = props;
  if (topic) {
    return (
      <Link
        to="/settings/detail/$topic"
        params={{ topic }}
        className={cn(rowBase, "transition-colors hover:bg-muted")}
      >
        <RowInner {...rest} chevron />
      </Link>
    );
  }
  if (!onClick) {
    return (
      <div className={rowBase}>
        <RowInner {...rest} />
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(rowBase, "transition-colors hover:bg-muted")}
    >
      <RowInner {...rest} />
    </button>
  );
}

export function IconToggleRow({
  checked,
  onChange,
  ...rest
}: RowShellProps & { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className={rowBase}>
      <RowInner
        {...rest}
        right={
          <Switch
            checked={checked}
            onCheckedChange={onChange}
            aria-label={rest.title}
            className="shrink-0"
          />
        }
      />
    </div>
  );
}

/** Either/or row: exactly one of the options is selected. */
export function SegmentRow({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={cn(rowBase, "flex-col items-stretch gap-2 sm:flex-row sm:items-center")}>
      <span className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">{title}</span>
      <div
        role="radiogroup"
        aria-label={title}
        className="flex shrink-0 gap-1 rounded-full bg-muted p-1"
      >
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option)}
              className={cn(
                "min-h-ctl-sm flex-1 whitespace-nowrap rounded-full px-3 text-xs font-bold transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
