import wordmark from "@/assets/eatos-wordmark-black.png.asset.json";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * Brand wordmark (eatOS or lcrOS, set by the build variant). Black on light surfaces, automatically white in the dark
 * appearance. `invert` pins it to white for surfaces that are dark in both
 * appearances (e.g. the `bg-shell` help-centre header).
 * Never use the pink app icon inside page content - pink is for launcher icons only.
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
      alt={brand.tagline}
      className={cn(
        "h-14 w-auto object-contain",
        invert ? "invert" : "dark:invert",
        className,
      )}
    />
  );
}


