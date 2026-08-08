import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

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
  | "grey";

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
};

export function IconTile({ icon: Icon, color }: { icon: LucideIcon; color: TileColor }) {
  return (
    <span
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-xl text-surface",
        tileBg[color],
      )}
    >
      <Icon className="size-5" strokeWidth={2.25} />
    </span>
  );
}

export function GroupCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-2xl bg-surface", className)}>{children}</div>
  );
}

export function Caption({ children, tone }: { children: ReactNode; tone?: "danger" }) {
  return (
    <p
      className={cn(
        "px-1 pt-2 text-sm leading-snug",
        tone === "danger" ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {children}
    </p>
  );
}

export function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-1 pb-2 pt-4 text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">
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
      {icon && color ? <IconTile icon={icon} color={color} /> : null}
      <span
        className={cn(
          "min-w-0 flex-1 text-lg font-medium leading-tight text-foreground",
          icon ? "pl-1" : "",
        )}
      >
        {title}
      </span>
      {value ? (
        <span className="shrink-0 text-lg font-normal text-muted-foreground">{value}</span>
      ) : null}
      {right}
      {chevron ? <ChevronRight className="size-6 shrink-0 text-muted-foreground" /> : null}
    </>
  );
}

const rowBase =
  "flex min-h-[70px] w-full items-center gap-3 border-b border-border px-4 py-3 text-left last:border-b-0";

export function IconNavRow({
  to,
  params,
  onClick,
  ...rest
}: RowShellProps & { to?: string; params?: Record<string, string>; onClick?: () => void }) {
  if (to) {
    return (
      <Link
        to={to}
        params={params}
        className={cn(rowBase, "transition-colors hover:bg-muted")}
      >
        <RowInner {...rest} chevron />
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cn(rowBase, "transition-colors hover:bg-muted")}>
      <RowInner {...rest} chevron />
    </button>
  );
}

export function IconValueRow(props: RowShellProps & { onClick?: () => void }) {
  const { onClick, ...rest } = props;
  if (!onClick) {
    return (
      <div className={rowBase}>
        <RowInner {...rest} />
      </div>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cn(rowBase, "transition-colors hover:bg-muted")}>
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
            className="ml-1 h-8 w-14 shrink-0 [&>span]:size-7 [&>span]:data-[state=checked]:translate-x-6"
          />
        }
      />
    </div>
  );
}
