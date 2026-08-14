import { useEffect, useState } from "react";
import { Wordmark } from "@/components/pos/brand";
import { APP_VERSION } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const captions = [
  "Warming the ovens…",
  "Setting the tables…",
  "Loading your menu…",
  "Polishing the glasses…",
];

/**
 * Brand boot screen: wordmark, circular progress ring with percentage and a
 * rotating status caption. Used while the app loads after sign-in.
 */
export function BootScreen({
  title = "Point of Sale",
  durationMs = 1800,
  onDone,
  className,
}: {
  title?: string;
  durationMs?: number;
  onDone?: () => void;
  className?: string;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      const pct = Math.min(100, Math.round(((Date.now() - start) / durationMs) * 100));
      setProgress(pct);
      if (pct >= 100) {
        window.clearInterval(id);
        onDone?.();
      }
    }, 60);
    return () => window.clearInterval(id);
  }, [durationMs, onDone]);

  const caption = captions[Math.min(captions.length - 1, Math.floor(progress / 26))];
  const circumference = 2 * Math.PI * 46;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-0 flex-1 flex-col items-center justify-center gap-8 bg-background px-6 py-10",
        className,
      )}
    >
      <div className="flex flex-col items-center">
        <Wordmark />
        <h1 className="mt-4 text-fs-2xl font-extrabold leading-tight text-foreground">{title}</h1>
      </div>

      <div className="relative grid size-[clamp(8rem,28dvh,12rem)] place-items-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-accent transition-[stroke-dashoffset] duration-200 motion-reduce:transition-none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress / 100)}
          />
        </svg>
        <span className="text-fs-2xl font-extrabold text-foreground">{progress}%</span>
      </div>

      <p className="text-fs-base font-bold text-muted-foreground">{caption}</p>
      <p className="mt-auto text-center text-fs-xs text-muted-foreground">{APP_VERSION}</p>
    </div>
  );
}
