import wordmark from "@/assets/eatos-wordmark-black.png.asset.json";
import { cn } from "@/lib/utils";

/**
 * eatOS wordmark. Black on light surfaces, automatically white in the dark
 * appearance. `invert` flips that for a surface that opposes the appearance
 * (e.g. a dark header shown in light mode).
 * Never use the pink app icon inside page content — pink is for launcher icons only.
 */
export function Wordmark({
  className,
  invert = false,
}: {
  className?: string;
  invert?: boolean;
}) {
  return (
    <img
      src={wordmark.url}
      alt="eatOS — Restaurants Made Simple"
      className={cn(
        "h-14 w-auto object-contain",
        // Non-cumulative: exactly one of the two states inverts.
        invert ? "invert dark:invert-0" : "dark:invert",
        className,
      )}
    />
  );
}

