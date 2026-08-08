import wordmark from "@/assets/eatos-wordmark-black.png.asset.json";
import { cn } from "@/lib/utils";

/**
 * eatOS wordmark. Black by default; `invert` renders it white for dark surfaces.
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
      className={cn("h-14 w-auto object-contain", invert && "invert", className)}
    />
  );
}
