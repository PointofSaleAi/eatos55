import { useState } from "react";
import { splitPicked } from "@/components/pos/discount-sheet";
import { discountPresets, money, serviceChargePresets } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

/** Splits a combined discount total across the picked presets by their percent. */
export function discountParts(label: string | null | undefined, total: number) {
  const picked = discountPresets.filter((d) => splitPicked(label).includes(d.name));
  const sum = picked.reduce((s, d) => s + d.percent, 0);
  return picked.map((d) => ({ name: d.name, amount: sum ? (total * d.percent) / sum : 0 }));
}

/** Flat charges keep their amount; the rest is shared by percent presets. */
export function serviceChargeParts(label: string | null | undefined, total: number) {
  const picked = serviceChargePresets.filter((p) => splitPicked(label).includes(p.name));
  const flat = picked.reduce((s, p) => s + (p.amount ?? 0), 0);
  const pct = picked.reduce((s, p) => s + (p.percent ?? 0), 0);
  return picked.map((p) => ({
    name: p.name,
    amount: p.percent != null ? (pct ? ((total - flat) * p.percent) / pct : 0) : (p.amount ?? 0),
  }));
}

/** Totals line whose count pill lists each picked discount / charge vertically with its amount. */
export function BreakdownRow({
  label,
  value,
  parts,
  negative,
  tone = "default",
  className,
}: {
  label: string;
  value: string;
  parts: { name: string; amount: number }[];
  negative?: boolean;
  /** "red" prints the listed names and amounts in the destructive red. */
  tone?: "default" | "red";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("py-0 font-bold text-muted-foreground", className)}>
      <div className="flex items-center justify-between gap-2">
        <dt className="flex min-w-0 items-center gap-1.5">
          <span>{label}</span>
          {parts.length ? (
            <button
              type="button"
              aria-expanded={open}
              aria-label={`${open ? "Hide" : "Show"} the ${parts.length} applied ${label.toLowerCase()} details`}
              title={`${parts.length} applied`}
              onClick={() => setOpen((v) => !v)}
              className={cn(
                "grid min-w-6 shrink-0 place-items-center rounded-full px-1.5 py-0.5 text-[0.7em] font-bold leading-none tabular-nums hover:bg-muted",
                tone === "red" ? "bg-destructive/12 text-destructive" : "bg-muted text-muted-foreground",
              )}
            >
              {parts.length}
            </button>
          ) : null}
        </dt>
        <dd className="tabular-nums">{value}</dd>
      </div>
      {open ? (
        <ul className="mb-0.5 ml-3 border-l border-border pl-2 text-[1.05em] font-semibold">
          {parts.map((p) => (
            <li key={p.name} className="flex items-center justify-between gap-2 py-0.5">
              <span className={cn("min-w-0", tone === "red" && "text-destructive")}>{p.name}</span>
              <span className={cn("shrink-0 tabular-nums", tone === "red" && "text-destructive")}>
                {negative ? "-" : ""}
                {money(p.amount)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
