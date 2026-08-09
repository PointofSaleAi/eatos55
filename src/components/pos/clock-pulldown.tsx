import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Fingerprint, ScanFace } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * Pull-down clock pad (live app parity): the top handle reveals the PIN keypad
 * with Clock Out / Break / Clock In, biometrics, revenue center and Log Out.
 */
export function ClockPullDown() {
  const navigate = useNavigate();
  const { session, settings, clockIn, clockOut, signOut } = usePos();
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");

  const close = () => {
    setOpen(false);
    setPin("");
  };

  const requirePin = (action: () => void, message: string) => {
    if (pin.length < 4) {
      toast.error("Enter your 4-digit PIN");
      return;
    }
    action();
    toast.success(message);
    close();
  };

  return (
    <>
      <div className="relative z-40 shrink-0 bg-background">
        <button
          type="button"
          aria-label={open ? "Close clock pad" : "Open clock pad"}
          aria-expanded={open}
          onClick={() => (open ? close() : setOpen(true))}
          className="mx-auto flex h-7 tap-safe w-32 items-center justify-center rounded-b-xl border border-t-0 border-border bg-surface text-muted-foreground"
        >
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </div>

      {open ? (
        <div className="absolute inset-0 z-30 flex flex-col bg-shell/80 px-3 pb-4 pt-8">
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
            <div className="rounded-card border border-border bg-surface px-4 py-4">
              <div className="flex items-center justify-center gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "grid size-11 place-items-center text-fs-xl font-extrabold",
                      pin.length > i ? "text-foreground" : "text-muted-foreground/40",
                    )}
                  >
                    ✳
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2">
              {keys.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setPin((p) => (p.length < 4 ? p + k : p))}
                  className="grid min-h-row place-items-center rounded-card bg-surface text-fs-xl font-extrabold text-foreground elev-1 transition-transform active:scale-[0.97]"
                >
                  {k}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPin("")}
                className="grid min-h-row place-items-center rounded-card bg-surface text-fs-xl font-extrabold text-destructive elev-1"
              >
                C
              </button>
              <button
                type="button"
                onClick={() => setPin((p) => (p.length < 4 ? `${p}0` : p))}
                className="grid min-h-row place-items-center rounded-card bg-surface text-fs-xl font-extrabold text-foreground elev-1"
              >
                0
              </button>
              <button
                type="button"
                onClick={() =>
                  requirePin(() => {
                    clockIn();
                    navigate({ to: "/floor" });
                  }, "PIN accepted")
                }
                className="grid min-h-row place-items-center rounded-card bg-shell text-fs-lg font-extrabold text-shell-foreground elev-1"
              >
                ENTER
              </button>

              <button
                type="button"
                onClick={() => requirePin(clockOut, "Clocked out")}
                className="grid min-h-row place-items-center rounded-card bg-destructive text-fs-base font-extrabold text-destructive-foreground elev-1"
              >
                Clock Out
              </button>
              <button
                type="button"
                onClick={() => requirePin(() => undefined, "Break started")}
                className="grid min-h-row place-items-center rounded-card bg-surface text-fs-base font-extrabold text-foreground elev-1"
              >
                Break
              </button>
              <button
                type="button"
                onClick={() => requirePin(clockIn, `Clocked in at ${settings.clockedInAt}`)}
                className="grid min-h-row place-items-center rounded-card bg-success text-fs-base font-extrabold text-success-foreground elev-1"
              >
                Clock In
              </button>

              <button
                type="button"
                aria-label="Fingerprint sign in"
                onClick={() => toast.info("Fingerprint not enrolled on this device")}
                className="grid min-h-row place-items-center rounded-card bg-shell text-shell-foreground elev-1"
              >
                <Fingerprint className="size-6" />
              </button>
              <span className="grid min-h-row place-items-center rounded-card bg-surface px-2 text-center text-fs-xs font-bold leading-tight text-foreground">
                {session.station ?? "Test Revenue Center"}
              </span>
              <button
                type="button"
                aria-label="Face ID sign in"
                onClick={() => toast.info("Face ID not enrolled on this device")}
                className="grid min-h-row place-items-center rounded-card bg-shell text-shell-foreground elev-1"
              >
                <ScanFace className="size-6" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                signOut();
                close();
                navigate({ to: "/" });
              }}
              className="mt-3 min-h-key w-full rounded-card border border-shell-foreground/60 text-fs-base font-extrabold uppercase tracking-[0.08em] text-shell-foreground"
            >
              Log out
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
