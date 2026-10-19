import { cn } from "@/lib/utils";
import archiveMarkAsset from "@/assets/archive-mark.png.asset.json";

/**
 * The uploaded archive mark, tinted by the surrounding text colour so it follows
 * the theme. Every archive and restore control in the app uses this one mark, so
 * the same action never looks different from screen to screen.
 */
export function ArchiveGlyph({ className }: { className?: string | undefined }) {
  const mask = `url(${archiveMarkAsset.url})`;
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block shrink-0 bg-current", className)}
      style={{
        maskImage: mask,
        WebkitMaskImage: mask,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    />
  );
}

/**
 * Content for a revealed swipe strip: the mark above the word, so the action
 * stays readable while every screen shows the same drawing.
 */
export function ArchiveSwipeAction({ archived }: { archived: boolean }) {
  return (
    <span className="flex flex-col items-center gap-1">
      <ArchiveGlyph className="size-5" />
      <span className="t-caption font-extrabold">{archived ? "Restore" : "Archive"}</span>
    </span>
  );
}
