import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const ITEM_H = 44;
const VISIBLE = 5;

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const PERIODS = ["AM", "PM"] as const;

/** Parse "HH:MM AM" (12-hour) into wheel indices; falls back to 12:30 AM. */
function parseTime(value: string): { hour: number; minute: number; period: number } {
  const match = /^\s*(\d{1,2}):(\d{2})\s*(AM|PM)\s*$/i.exec(value ?? "");
  if (!match) return { hour: 11, minute: 30, period: 0 };
  const hour = ((Number(match[1]) - 1) % 12 + 12) % 12;
  const minute = Math.min(59, Math.max(0, Number(match[2])));
  const period = match[3].toUpperCase() === "PM" ? 1 : 0;
  return { hour, minute, period };
}

export function formatTime12(hour: number, minute: number, period: number): string {
  return `${HOURS[hour]}:${MINUTES[minute]} ${PERIODS[period]}`;
}

function Column({
  label,
  items,
  index,
  onSelect,
}: {
  label: string;
  items: readonly string[];
  index: number;
  onSelect: (index: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const last = useRef(index);

  // Center the selected value once on mount.
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = index * ITEM_H;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    const el = ref.current;
    if (!el) return;
    const next = Math.min(items.length - 1, Math.max(0, Math.round(el.scrollTop / ITEM_H)));
    if (next !== last.current) {
      last.current = next;
      onSelect(next);
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (ref.current) ref.current.scrollTop = next * ITEM_H;
    }, 140);
  };

  return (
    <div
      role="listbox"
      aria-label={label}
      className="relative w-16 shrink-0 snap-y snap-mandatory overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ height: ITEM_H * VISIBLE }}
      ref={ref}
      onScroll={handleScroll}
    >
      <div style={{ height: (VISIBLE / 2 - 0.5) * ITEM_H }} aria-hidden="true" />
      {items.map((item, i) => (
        <button
          key={item}
          type="button"
          role="option"
          aria-selected={i === index}
          onClick={() => {
            ref.current?.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
          }}
          className="flex snap-center items-center justify-center"
          style={{ height: ITEM_H }}
        >
          <span
            className={cn(
              "grid h-11 w-full place-items-center rounded-xl t-row transition-colors",
              i === index ? "bg-muted font-semibold text-foreground" : "text-muted-foreground",
            )}
          >
            {item}
          </span>
        </button>
      ))}
      <div style={{ height: (VISIBLE / 2 - 0.5) * ITEM_H }} aria-hidden="true" />
    </div>
  );
}

/** iOS-style wheel time picker: hour / minute / AM-PM columns. */
export function WheelTimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const initial = useRef(parseTime(value));
  const [hour, setHour] = useState(initial.current.hour);
  const [minute, setMinute] = useState(initial.current.minute);
  const [period, setPeriod] = useState(initial.current.period);

  useEffect(() => {
    onChange(formatTime12(hour, minute, period));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hour, minute, period]);

  return (
    <div className="flex items-stretch justify-center gap-1">
      <Column label="Hour" items={HOURS} index={hour} onSelect={setHour} />
      <Column label="Minute" items={MINUTES} index={minute} onSelect={setMinute} />
      <Column label="AM / PM" items={PERIODS} index={period} onSelect={setPeriod} />
    </div>
  );
}
