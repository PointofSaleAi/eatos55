import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { submenuRows } from "@/lib/submenu-rows";
import { cn } from "@/lib/utils";

export function MenuSubcategories({ entries, selected, onSelect, layout }: {
  entries: readonly string[];
  selected: string;
  onSelect: (entry: string) => void;
  layout: "horizontal" | "vertical";
}) {
  const container = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<number[][]>([]);
  useEffect(() => {
    const el = container.current;
    const measuring = probe.current;
    if (!el || !measuring) return;
    const measure = () => {
      const widths = Array.from(measuring.children, (child) => child.getBoundingClientRect().width);
      const gap = parseFloat(getComputedStyle(measuring).columnGap) || 0;
      setRows(submenuRows(widths, el.clientWidth, gap));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    observer.observe(measuring);
    let active = true;
    document.fonts.ready.then(() => { if (active) measure(); });
    return () => { active = false; observer.disconnect(); };
  }, [entries]);
  const chipClass = "flex h-10 shrink-0 items-center justify-center rounded-card px-3 text-center text-[0.75rem] font-extrabold uppercase leading-none transition-colors";
  const visibleRows = layout === "horizontal" ? [entries.map((_, index) => index)] : rows;
  return <div ref={container} className="relative mt-2 min-w-0" aria-label="Submenus">
    <div ref={probe} aria-hidden="true" className="invisible pointer-events-none absolute left-0 top-0 flex w-max gap-1.5">
      {entries.map((entry) => <span key={entry} className={chipClass}><span className="whitespace-nowrap">{entry}</span></span>)}
    </div>
    <div className="flex flex-col gap-1.5">
      {visibleRows.map((row, index) => <div key={index} data-submenu-row={index + 1} className="no-scrollbar flex min-w-0 gap-1.5 overflow-x-auto">
        {row.map((itemIndex) => {
          const entry = entries[itemIndex];
          if (!entry) return null;
          return <Button key={entry} type="button" variant="ghost" onClick={() => onSelect(entry)} aria-pressed={entry === selected}
            className={cn(chipClass, entry === selected ? "bg-accent text-accent-foreground hover:bg-accent/90 hover:text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-secondary")}>
            <span className="whitespace-nowrap">{entry}</span>
          </Button>;
        })}
      </div>)}
    </div>
  </div>;
}