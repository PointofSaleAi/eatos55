import { CloudSun } from "lucide-react";
import { useEffect, useState } from "react";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

/**
 * Date / live time / weather panel beside the clock-in PIN pad.
 * Time and date are live; the venue label and weather values come from
 * Settings → Login Screen.
 */
export function ClockPanel({
  compact,
  gate,
  className,
}: {
  compact?: boolean;
  gate?: boolean;
  className?: string;
}) {
  const { settings } = usePos();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const dateLabel = now
    ? now.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";
  const timeLabel = now
    ? now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : "";

  if (gate) {
    return (
      <div
        className={cn(
          "flex min-h-0 flex-col justify-center text-shell-foreground",
          compact && "grid grid-cols-[1fr_auto] grid-rows-2 content-center gap-x-4 gap-y-1",
          className,
        )}
      >
        <p className={cn("text-[clamp(0.95rem,1.8vw,1.35rem)] font-normal", compact && "self-end truncate text-fs-xs")}>{dateLabel}</p>
        <p className={cn("mt-[clamp(1.4rem,5dvh,3rem)] text-[clamp(3rem,7.5vw,5.5rem)] font-bold leading-none tabular-nums", compact && "row-start-2 mt-0 text-[2rem]")}>
          {timeLabel}
        </p>
        <div className={cn("mt-[clamp(1.4rem,5dvh,3rem)] flex items-center gap-6", compact && "col-start-2 row-span-2 row-start-1 mt-0 gap-2")}>
          <CloudSun className={cn("size-[clamp(2.25rem,5vw,3.7rem)] fill-shell-foreground text-shell-foreground", compact && "size-8")} aria-hidden />
          <p className={cn("text-[clamp(2.2rem,5vw,3.7rem)] font-normal leading-none", compact && "text-xl")}>{settings.weatherTemp}</p>
          <span className="sr-only">{settings.weatherCondition}</span>
        </div>
        <p className={cn("mt-[clamp(1.4rem,5dvh,3rem)] text-[clamp(1.25rem,2.6vw,2rem)] font-bold", compact && "col-span-2 mt-1 hidden text-sm min-[430px]:block")}>
          {settings.venueLocation}
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3",
          className,
        )}
      >
        <div className="min-w-0">
          <p className="truncate text-fs-xs text-muted-foreground">{dateLabel}</p>
          <p className="text-fs-xl font-extrabold leading-tight text-foreground">{timeLabel}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <CloudSun className="size-6 text-muted-foreground" aria-hidden />
          <div className="text-right">
            <p className="text-fs-base font-extrabold text-foreground">{settings.weatherTemp}</p>
            <p className="truncate text-fs-xs text-muted-foreground">{settings.venueLocation}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col justify-center gap-8 px-2", className)}>
      <p className="text-fs-lg font-bold text-foreground">{dateLabel}</p>
      <p className="text-[clamp(2.75rem,9vw,5rem)] font-extrabold leading-none text-foreground">
        {timeLabel}
      </p>
      <div className="flex items-center gap-4">
        <p className="text-fs-2xl font-extrabold text-foreground">{settings.weatherTemp}</p>
        <CloudSun className="size-10 text-muted-foreground" aria-hidden />
        <span className="sr-only">{settings.weatherCondition}</span>
      </div>
      <p className="text-fs-xl font-extrabold text-foreground">{settings.venueLocation}</p>
    </div>
  );
}
