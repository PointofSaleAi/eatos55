import { Delete, Fingerprint, ScanFace } from "lucide-react";
import { cn } from "@/lib/utils";

const gateDigits = ["7", "8", "9", "4", "5", "6", "1", "2", "3"];

function GateKey({
  children,
  onPress,
  label,
  tone = "light",
}: {
  children: React.ReactNode;
  onPress: () => void;
  label?: string;
  tone?: "light" | "dark" | "danger" | "success";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onPress}
      className={cn(
        "grid min-h-0 place-items-center border border-gate-separator text-[clamp(1.15rem,2.3vw,1.8rem)] font-extrabold transition-[filter,transform] hover:brightness-95 active:scale-[0.985]",
        tone === "light" &&
          "bg-gradient-to-b from-gate-key-top to-gate-key-bottom text-gate-key-foreground",
        tone === "dark" && "bg-gradient-to-b from-gate-dark-top to-gate-dark-bottom text-shell-foreground",
        tone === "danger" && "bg-destructive text-destructive-foreground",
        tone === "success" && "bg-gate-success text-shell-foreground",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Single PIN pad design used everywhere in the app: masked four-star display,
 * the 7-8-9 / 4-5-6 / 1-2-3 / C-0-ENTER grid, optional Clock Out / Break /
 * Clock In row, biometrics with the revenue center, and the Log Out bar.
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
  className?: string;
}) {
  const showClockRow = Boolean(onClockOut || onBreak || onClockIn);
  const showBiometricRow = Boolean(onBiometric || revenueCenter);
  const rows = [
    "1fr",
    "4fr",
    showClockRow ? "1fr" : null,
    showBiometricRow ? "1fr" : null,
    onLogOut ? "0.72fr" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("grid min-h-0", className)} style={{ gridTemplateRows: rows }}>
      <div className="mb-1 grid min-h-0 grid-cols-4 overflow-hidden rounded-sm border border-gate-separator bg-surface">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "grid place-items-center text-[clamp(2rem,4vw,3.25rem)] font-normal leading-none",
              i < pin.length ? "text-gate-key-foreground" : "text-gate-key-foreground/25",
            )}
          >
            ✳
          </span>
        ))}
      </div>

      <div className="grid min-h-0 grid-cols-3 grid-rows-4">
        {gateDigits.map((d) => (
          <GateKey key={d} onPress={() => onDigit(d)}>
            {d}
          </GateKey>
        ))}
        <GateKey onPress={onClear} label="Clear PIN">
          <span className="text-destructive">C</span>
        </GateKey>
        <GateKey onPress={() => onDigit("0")}>0</GateKey>
        {onEnter ? (
          <GateKey onPress={() => onEnter()} tone="dark">
            <span className="text-[clamp(0.9rem,1.7vw,1.3rem)]">ENTER</span>
          </GateKey>
        ) : (
          <GateKey onPress={() => onBackspace?.()} label="Delete last digit" tone="dark">
            <Delete className="size-[clamp(1.2rem,2.4vw,1.75rem)]" />
          </GateKey>
        )}
      </div>

      {showClockRow ? (
        <div className="grid min-h-0 grid-cols-3">
          <GateKey onPress={() => onClockOut?.()} tone="danger">
            <span className="text-[clamp(0.78rem,1.55vw,1.12rem)]">Clock Out</span>
          </GateKey>
          <GateKey onPress={() => onBreak?.()}>
            <span className="text-[clamp(0.78rem,1.55vw,1.12rem)] text-gate-action-foreground">
              Break
            </span>
          </GateKey>
          <GateKey onPress={() => onClockIn?.()} tone="success">
            <span className="text-[clamp(0.78rem,1.55vw,1.12rem)]">Clock In</span>
          </GateKey>
        </div>
      ) : null}

      {showBiometricRow ? (
        <div className="grid min-h-0 grid-cols-3">
          <GateKey onPress={() => onBiometric?.()} label="Fingerprint sign in" tone="dark">
            <Fingerprint className="size-[clamp(1.4rem,3vw,2.3rem)] opacity-60" />
          </GateKey>
          <GateKey onPress={() => undefined}>
            <span className="px-2 text-center text-[clamp(0.75rem,1.4vw,1rem)] text-gate-action-foreground">
              {revenueCenter ?? "Main"}
            </span>
          </GateKey>
          <GateKey onPress={() => onBiometric?.()} label="Face ID sign in" tone="dark">
            <ScanFace className="size-[clamp(1.4rem,3vw,2.3rem)]" />
          </GateKey>
        </div>
      ) : null}

      {onLogOut ? (
        <button
          type="button"
          onClick={() => onLogOut()}
          className="mt-2 min-h-0 rounded-sm border-2 border-shell-foreground/85 text-[clamp(0.76rem,1.5vw,1rem)] font-extrabold uppercase text-shell-foreground transition-colors hover:bg-shell-foreground/10"
        >
          Log out
        </button>
      ) : null}
    </div>
  );
}
