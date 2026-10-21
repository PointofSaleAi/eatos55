import { useState } from "react";
import { ChevronDown } from "lucide-react";
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

/** Totals line whose arrow lists each picked discount / charge vertically with its amount. */
export function BreakdownRow({
  label,
  value,
  parts,
  negative,
  className,
}: {
  label: string;
  value: string;
  parts: { name: string; amount: number }[];
  negative?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("py-0 font-bold text-muted-foreground", className)}>
      <div className="flex items-center justify-between gap-2">
        <dt className="flex min-w-0 items-center gap-1">
          <span>{label}</span>
          {parts.length ? (
            <button
              type="button"
              aria-expanded={open}
              aria-label={`${open ? "Hide" : "Show"} ${label} details`}
              onClick={() => setOpen((v) => !v)}
              className="grid size-6 place-items-center rounded-md hover:bg-muted"
            >
              <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
            </button>
          ) : null}
        </dt>
        <dd className="tabular-nums">{value}</dd>
      </div>
      {open ? (
        <ul className="mb-0.5 ml-3 border-l border-border pl-2 text-[0.8em] font-semibold">
          {parts.map((p) => (
            <li key={p.name} className="flex items-center justify-between gap-2 py-0.5">
              <span className="min-w-0">{p.name}</span>
              <span className="shrink-0 tabular-nums">{negative ? "-" : ""}{money(p.amount)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
