import { useEffect, useState } from "react";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

/**
 * Sign-in carousel shown beside the form on landscape tablet/web.
 * Slides come from settings (Settings → Login Screen) so they can be swapped
 * for dashboard-managed content later. Crossfades, auto-advances, pauses on
 * hover/focus and holds still when the user prefers reduced motion.
 */
export function LoginCarousel({ className }: { className?: string }) {
  const { settings } = usePos();
  const slides = settings.loginSlides.filter((s) => s.enabled);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => window.clearInterval(id);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className={cn("relative h-full w-full overflow-hidden bg-shell", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <img
          key={slide.id}
          src={slide.image}
          alt={slide.headline}
          {...(i === 0 ? {} : { loading: "lazy" as const })}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-700 motion-reduce:transition-none",
            i === index ? "opacity-100" : "opacity-0",
          )}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-6 p-8">
        <p
          key={slides[index]?.id}
          className="w-full max-w-[26rem] text-fs-2xl font-extrabold leading-tight text-white drop-shadow"
        >
          {slides[index]?.headline}
        </p>
        {slides.length > 1 ? (
          <div className="flex items-center gap-2.5" role="tablist" aria-label="Highlights">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={slide.headline}
                onClick={() => setIndex(i)}
                className="grid size-11 place-items-center"
              >
                <span
                  className={cn(
                    "block size-2.5 rounded-pill transition-colors",
                    i === index ? "bg-white" : "bg-white/40",
                  )}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
