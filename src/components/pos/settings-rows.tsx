import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/**
 * Settings list rows. Styling follows the original imported design: rounded
 * colour-filled icon tiles, bordered surface cards, compact type scale.
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

const tileBg: Record<TileColor, string> = {
  green: "bg-tile-green",
  violet: "bg-tile-violet",
  orange: "bg-tile-orange",
  indigo: "bg-tile-indigo",
  purple: "bg-tile-purple",
  slate: "bg-tile-slate",
  sky: "bg-tile-sky",
  pink: "bg-tile-pink",
  magenta: "bg-tile-magenta",
  yellow: "bg-tile-yellow",
  red: "bg-tile-red",
  blue: "bg-tile-blue",
  grey: "bg-tile-grey",
  black: "bg-tile-black",
};

export function IconTile({
  icon: Icon,
  color = "slate",
}: {
  icon: LucideIcon;
  color?: TileColor | undefined;
}) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-md text-accent-foreground",
        tileBg[color],
      )}
    >
      <Icon className="size-[1.05rem]" strokeWidth={2.25} />
    </span>
  );
}


export function GroupCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-card border border-border bg-surface elev-1", className)}>
      {children}
    </div>
  );
}

export function Caption({ children, tone }: { children: ReactNode; tone?: "danger" }) {
  return (
    <p
      className={cn(
        "px-1 pt-2 t-caption",
        tone === "danger" ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {children}
    </p>
  );
}

export function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-1 pb-2 pt-4 t-section text-muted-foreground">
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
      <span className="min-w-0 flex-1 truncate t-row text-foreground">{title}</span>
      {value ? (
        <span className="shrink-0 truncate t-value text-muted-foreground">{value}</span>
      ) : null}
      {right}
      {chevron ? <ChevronRight className="size-4 shrink-0 text-muted-foreground" /> : null}
    </>
  );
}

const rowBase =
  "flex min-h-row w-full items-center gap-row border-b border-border px-4 py-3 text-left last:border-b-0";

/** Shared row metrics so settings screens can compose custom rows. */
export const settingsRowClass = rowBase;


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

/** Column captions for two-toggle lists (Enabled / Auto Close Payment). */
export function ToggleColumnHeaders({
  primary,
  secondary,
  shortPrimary,
  shortSecondary,
}: {
  primary: string;
  secondary: string;
  shortPrimary?: string;
  shortSecondary?: string;
}) {
  return (
    <div className="flex items-end gap-row px-4 pb-1">
      <span className="min-w-0 flex-1" />
      <span className="w-11 shrink-0 text-center t-caption leading-tight text-muted-foreground">
        <span className="sm:hidden">{shortPrimary ?? primary}</span>
        <span className="hidden sm:inline">{primary}</span>
      </span>
      <span className="w-11 shrink-0 text-center t-caption leading-tight text-muted-foreground">
        <span className="sm:hidden">{shortSecondary ?? secondary}</span>
        <span className="hidden sm:inline">{secondary}</span>
      </span>
    </div>
  );
}

/** Row with two independent switches, the second one optionally disabled. */
export function IconDualToggleRow({
  checked,
  onChange,
  secondaryChecked,
  onSecondaryChange,
  secondaryDisabled,
  secondaryLabel,
  ...rest
}: RowShellProps & {
  checked: boolean;
  onChange: (v: boolean) => void;
  secondaryChecked: boolean;
  onSecondaryChange: (v: boolean) => void;
  secondaryDisabled?: boolean;
  secondaryLabel: string;
}) {
  return (
    <div className={rowBase}>
      <RowInner
        {...rest}
        right={
          <>
            <span className="grid size-11 shrink-0 place-items-center">
              <Switch
                checked={checked}
                onCheckedChange={onChange}
                aria-label={rest.title}
                className="tap-safe shrink-0"
              />
            </span>
            <span className="grid size-11 shrink-0 place-items-center">
              <Switch
                checked={secondaryChecked}
                onCheckedChange={onSecondaryChange}
                disabled={secondaryDisabled}
                aria-label={`${secondaryLabel} - ${rest.title}`}
                className={cn(
                  "tap-safe shrink-0",
                  secondaryDisabled ? "opacity-40" : undefined,
                )}
              />
            </span>
          </>
        }
      />
    </div>
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
          <span className="grid size-11 shrink-0 place-items-center">
            <Switch
              checked={checked}
              onCheckedChange={onChange}
              aria-label={rest.title}
              className="tap-safe shrink-0"
            />
          </span>
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
      <span className="min-w-0 flex-1 truncate t-row text-foreground">{title}</span>
      <div
        role="radiogroup"
        aria-label={title}
        className="flex shrink-0 gap-1 rounded-pill bg-muted p-1"
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
                "min-h-ctl-sm flex-1 whitespace-nowrap rounded-pill px-3 t-badge transition-colors",
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

/** Dropdown row: one value picked from a list (payment provider, reader model). */
export function IconSelectRow({
  icon,
  color,
  title,
  value,
  options,
  onChange,
  disabled,
}: {
  icon?: LucideIcon;
  color?: TileColor;
  title: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className={rowBase}>
      {icon ? <IconTile icon={icon} color={color} /> : null}
      <span className="min-w-0 flex-1 truncate t-row text-foreground">{title}</span>
      <Select value={value} onValueChange={onChange} disabled={disabled ?? false}>
        <SelectTrigger
          aria-label={title}
          className="h-ctl-sm w-[11rem] shrink-0 rounded-pill border-border bg-muted px-3 t-value text-foreground"
        >
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o} className="t-row">
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
