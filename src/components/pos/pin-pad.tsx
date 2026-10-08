import { useState } from "react";
import { ChevronDown, Delete, Fingerprint, ScanFace, Store } from "lucide-react";
import { cn } from "@/lib/utils";

const gateDigits = ["7", "8", "9", "4", "5", "6", "1", "2", "3"];

/** Uploaded PIN indicator artwork: solid star for filled, hollow star for empty. */
const pinIndicatorOuter =
  "M22.8261 0C23.0764 0 23.2422 0.15976 23.2422 0.400391V9.15918L30.8965 4.40137C30.9387 4.36232 31.0216 4.32129 31.1045 4.32129C31.2295 4.32136 31.3546 4.40127 31.4375 4.52148L36.4297 11.8809C36.5548 12.0808 36.5126 12.3201 36.3047 12.4404L27.4023 18L36.3047 23.5605C36.5127 23.6793 36.5548 23.9201 36.4297 24.1201L31.4375 31.4795C31.3546 31.5998 31.2295 31.6796 31.1045 31.6797C31.0622 31.6797 30.9793 31.6402 30.8965 31.5996L23.2422 26.8408V35.5996C23.2422 35.8402 23.0764 36 22.8261 36H13.6738C13.4235 36 13.2578 35.8402 13.2578 35.5996V26.8408L5.60349 31.5986C5.56121 31.6377 5.47831 31.6787 5.39548 31.6787C5.27044 31.6786 5.14532 31.5987 5.06247 31.4785L0.0702858 24.1191C-0.0548358 23.9192 -0.0126825 23.6799 0.195286 23.5596L9.09763 18L0.195286 12.4395C-0.0127264 12.3207 -0.054846 12.0799 0.0702858 11.8799L5.06247 4.52051C5.14532 4.40025 5.27041 4.32039 5.39548 4.32031C5.43773 4.32031 5.52062 4.35977 5.60349 4.40039L13.2578 9.15918V0.400391C13.2578 0.15976 13.4235 0 13.6738 0H22.8261Z";
const pinIndicatorInner =
  "M21.5791 1.52051H14.8799V12.1045L12.2851 10.4951L5.6699 6.34961L2.02732 11.7412L9.93943 16.6133L12.1162 17.9805L9.93943 19.3486L2.02732 24.2988L5.6699 29.6904L12.2851 25.5469L14.8799 23.9375V34.5195H21.5791V23.9766L24.1738 25.5859L30.789 29.6904L34.4726 24.3379L26.5605 19.3877L24.3838 18.0195L26.5195 16.6523L34.4316 11.7412L30.789 6.34961L24.1738 10.4932L21.5791 12.1025V1.52051Z";

/** PIN mask slot: transparent outlined indicator when empty, solid when filled. */
function AsteriskMark({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 37 36"
      className="size-[0.92em] text-gate-key-foreground"
      aria-hidden="true"
    >
      <path
        d={filled ? pinIndicatorOuter : `${pinIndicatorOuter} ${pinIndicatorInner}`}
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

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
  revenueCenterOptions,
  onRevenueCenterSelect,
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
  revenueCenterOptions?: string[];
  onRevenueCenterSelect?: (center: string) => void;
  onLogOut?: () => void;
  className?: string;
}) {
  const showClockRow = Boolean(onClockOut || onBreak || onClockIn);
  const showBiometricRow = Boolean(onBiometric || revenueCenter);
  const canPickCenter = Boolean(revenueCenterOptions?.length && onRevenueCenterSelect);
  const [centerPickerOpen, setCenterPickerOpen] = useState(false);
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
            aria-hidden
            className="grid place-items-center text-[clamp(2rem,4vw,3.25rem)] font-normal leading-none"
          >
            <AsteriskMark filled={i < pin.length} />
          </span>
        ))}
      </div>

      {centerPickerOpen && canPickCenter ? (
        <div className="grid min-h-0 grid-rows-[auto_1fr] border border-gate-separator bg-surface">
          <div className="flex items-center justify-between border-b border-gate-separator px-3 py-1.5">
            <span className="text-[clamp(0.6rem,1.1vw,0.78rem)] font-extrabold uppercase tracking-wide text-gate-key-foreground">
              Select Revenue Center
            </span>
            <button
              type="button"
              aria-label="Close revenue center picker"
              onClick={() => setCenterPickerOpen(false)}
              className="text-[clamp(0.6rem,1.1vw,0.78rem)] font-bold uppercase text-gate-action-foreground/70 transition-colors hover:text-gate-action-foreground"
            >
              Back
            </button>
          </div>
          <div className="grid min-h-0 grid-cols-2 gap-1.5 overflow-y-auto p-1.5">
            {revenueCenterOptions!.map((center) => {
              const active = center === revenueCenter;
              return (
                <button
                  key={center}
                  type="button"
                  onClick={() => {
                    onRevenueCenterSelect!(center);
                    setCenterPickerOpen(false);
                  }}
                  className={cn(
                    "flex min-h-0 flex-col items-center justify-center gap-1 rounded-sm border bg-gradient-to-b from-gate-key-top to-gate-key-bottom px-2 py-2 text-center transition-[filter,transform] hover:brightness-95 active:scale-[0.985]",
                    active ? "border-gate-key-foreground ring-1 ring-gate-key-foreground" : "border-gate-separator",
                  )}
                >
                  <Store className="size-[clamp(0.95rem,1.8vw,1.3rem)] text-gate-action-foreground/70" aria-hidden />
                  <span className="text-[clamp(0.66rem,1.25vw,0.9rem)] font-extrabold leading-tight text-gate-key-foreground">
                    {center}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
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
      )}

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
          <GateKey
            onPress={() => canPickCenter && setCenterPickerOpen((o) => !o)}
            label="Select revenue center"
          >
            <span className="flex flex-col items-center justify-center gap-0.5 px-2 text-center">
              <span className="text-[clamp(0.55rem,1vw,0.7rem)] font-bold uppercase tracking-wide text-gate-action-foreground/70">
                Revenue Center
              </span>
              <span className="flex items-center gap-1 text-[clamp(0.75rem,1.4vw,1rem)] font-extrabold text-gate-action-foreground">
                {revenueCenter ?? "Main"}
                {canPickCenter ? (
                  <ChevronDown
                    className={cn(
                      "size-[clamp(0.7rem,1.3vw,0.95rem)] transition-transform",
                      centerPickerOpen && "rotate-180",
                    )}
                    aria-hidden
                  />
                ) : null}
              </span>
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
