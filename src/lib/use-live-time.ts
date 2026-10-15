import { useEffect, useState } from "react";
import { formatTime } from "@/lib/brand";

/**
 * Live wall-clock label in the app's time format, e.g. "4:34 PM".
 *
 * The label is empty until the component mounts (so server and client markup
 * match), then refreshes on each minute boundary. The state update is skipped
 * when the formatted label has not actually changed, so consumers only
 * re-render once a minute.
 *
 * Callers use it as the arrival-time fallback: an order that has not started
 * yet shows the current time, and the stored arrival time takes over as soon
 * as it is captured.
 */
export function useLiveTime(): string {
  const [label, setLabel] = useState("");

  useEffect(() => {
    setLabel(formatTime());

    let timer = 0;
    const schedule = () => {
      // Wake just after the next minute boundary so the displayed minute
      // rolls over without drifting or polling every second.
      const msToNextMinute = 60_000 - (Date.now() % 60_000) + 25;
      timer = window.setTimeout(tick, msToNextMinute);
    };
    const tick = () => {
      const next = formatTime();
      setLabel((prev) => (prev === next ? prev : next));
      schedule();
    };

    schedule();
    return () => window.clearTimeout(timer);
  }, []);

  return label;
}
