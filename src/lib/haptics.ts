/**
 * Lightweight haptic feedback.
 * Uses the Vibration API where available (Android/Chrome); a no-op elsewhere
 * (iOS Safari has no web haptics), so callers never need to branch.
 */

type Pattern = "light" | "medium" | "success" | "warning" | "error";

const patterns: Record<Pattern, number | number[]> = {
  light: 8,
  medium: 16,
  success: [10, 40, 18],
  warning: [18, 60, 18],
  error: [24, 50, 24, 50, 24],
};

let enabled = true;

/** Mirrors the user's "Haptic feedback" setting into this module. */
export function setHapticsEnabled(v: boolean) {
  enabled = v;
}

/** Fires a short haptic when supported and the user has haptics enabled. */
export function haptic(pattern: Pattern = "light") {
  if (!enabled || typeof navigator === "undefined") return;
  const vibrate = (navigator as Navigator & { vibrate?: (p: number | number[]) => boolean })
    .vibrate;
  if (typeof vibrate !== "function") return;
  try {
    vibrate.call(navigator, patterns[pattern]);
  } catch {
    /* ignore: some browsers throw without a user gesture */
  }
}
