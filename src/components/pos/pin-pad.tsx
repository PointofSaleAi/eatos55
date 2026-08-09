import { Delete, Fingerprint, ScanFace } from "lucide-react";
import { cn } from "@/lib/utils";

const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

function PadKey({
  children,
  onPress,
  label,
  className,
}: {
  children: React.ReactNode;
  onPress: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onPress}
      className={cn(
        "grid min-h-[clamp(2.75rem,7.5dvh,3.75rem)] place-items-center rounded-card bg-gradient-to-b from-surface to-muted text-fs-xl font-extrabold text-foreground elev-1 transition-transform active:scale-[0.97]",
        className,
      )}
    >
      {children}
    </button>
  );
}

/**
 * Live-app PIN pad: masked entry, 3x4 numeric grid with red C / dark ENTER,
 * the Clock Out / Break / Clock In row, biometrics + revenue center, Log Out.
 */
export function PinPad({
  pin,
  onDigit,
  onClear,
  onBackspace,
  onEnter,
  onClockOut,
  onBreak,
  onClockIn,
  onBiometric,
  revenueCenter,
  onLogOut,
  onShell,
  className,
}: {
  pin: string;
  onDigit: (d: string) => void;
  onClear: () => void;
  onBackspace?: () => void;
  onEnter?: () => void;
  onClockOut?: () => void;
  onBreak?: () => void;
  onClockIn?: () => void;
  onBiometric?: () => void;
  revenueCenter?: string;
  onLogOut?: () => void;
  /** Rendered over the dark shell overlay: invert the Log Out bar. */
  onShell?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-2", className)}>
      <div className="flex min-h-[clamp(2.75rem,7dvh,3.5rem)] shrink-0 items-center justify-center gap-6 rounded-card border border-border bg-surface">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "text-fs-xl font-extrabold leading-none",
              i < pin.length ? "text-foreground" : "text-foreground/25",
            )}
          >
            ✳
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {digits.map((d) => (
          <PadKey key={d} onPress={() => onDigit(d)}>
            {d}
          </PadKey>
        ))}
        <PadKey onPress={onClear} label="Clear PIN" className="text-destructive">
          C
        </PadKey>
        <PadKey onPress={() => onDigit("0")}>0</PadKey>
        {onEnter ? (
          <PadKey
            onPress={onEnter}
            className="bg-shell from-shell to-shell text-fs-lg text-shell-foreground"
          >
            ENTER
          </PadKey>
        ) : (
          <PadKey
            onPress={() => onBackspace?.()}
            label="Delete last digit"
            className="text-destructive"
          >
            <Delete className="size-6" />
          </PadKey>
        )}
      </div>

      {onClockOut || onBreak || onClockIn ? (
        <div className="grid grid-cols-3 gap-2">
          <PadKey
            onPress={() => onClockOut?.()}
            className="bg-destructive from-destructive to-destructive text-fs-base text-destructive-foreground"
          >
            Clock Out
          </PadKey>
          <PadKey onPress={() => onBreak?.()} className="text-fs-base">
            Break
          </PadKey>
          <PadKey
            onPress={() => onClockIn?.()}
            className="bg-success from-success to-success text-fs-base text-success-foreground"
          >
            Clock In
          </PadKey>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2">
        <PadKey
          onPress={() => onBiometric?.()}
          label="Fingerprint sign in"
          className="bg-shell from-shell to-shell text-shell-foreground"
        >
          <Fingerprint className="size-6" />
        </PadKey>
        <span className="grid min-h-[clamp(2.75rem,7.5dvh,3.75rem)] place-items-center rounded-card bg-surface px-2 text-center text-fs-xs font-bold leading-tight text-foreground">
          {revenueCenter ?? "Main"}
        </span>
        <PadKey
          onPress={() => onBiometric?.()}
          label="Face ID sign in"
          className="bg-shell from-shell to-shell text-shell-foreground"
        >
          <ScanFace className="size-6" />
        </PadKey>
      </div>

      {onLogOut ? (
        <button
          type="button"
          onClick={onLogOut}
          className={cn(
            "min-h-[clamp(2.75rem,7dvh,3.5rem)] w-full shrink-0 rounded-card border text-fs-base font-extrabold uppercase tracking-[0.08em]",
            onShell
              ? "border-shell-foreground/60 text-shell-foreground"
              : "border-foreground/40 text-foreground",
          )}
        >
          Log out
        </button>
      ) : null}
    </div>
  );
}
