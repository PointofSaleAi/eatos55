import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Headphones, RotateCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AccountActions, AccountInfo } from "@/components/pos/account-bar";
import { ClockPanel } from "@/components/pos/clock-panel";
import { PinPad } from "@/components/pos/pin-pad";
import { useLandscapeWide } from "@/hooks/use-layout-mode";
import { usePos } from "@/lib/pos-store";

/**
 * Dark top bar (design parity) plus the pull-down clock pad: the handle hanging
 * from the bar reveals the PIN keypad with Clock Out / Break / Clock In,
 * biometrics, revenue center and Log Out.
 */
export function ClockPullDown() {
  const navigate = useNavigate();
  const { session, settings, clockIn, clockOut, signOut } = usePos();
  const wide = useLandscapeWide();
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
      <div className="relative z-40 shrink-0 bg-shell">
        <div className="flex h-12 items-center gap-2 px-2">
          <AccountInfo onSwitchUser={() => setOpen(true)} />
          <div className="min-w-0 flex-1" />
          <AccountActions />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-full flex justify-center">
          <button
            type="button"
            aria-label={open ? "Close clock pad" : "Open clock pad"}
            aria-expanded={open}
            onClick={() => (open ? close() : setOpen(true))}
            className="pointer-events-auto flex h-6 tap-safe w-32 items-center justify-center rounded-b-2xl bg-shell text-shell-foreground/80 transition-colors hover:text-shell-foreground"
          >
            {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="absolute inset-0 z-30 flex flex-col overflow-hidden bg-gate-overlay px-[clamp(0.75rem,5vw,5rem)] pb-[clamp(0.75rem,3dvh,2rem)] pt-[5.5rem] sm:pt-10">
          <div
            className={
              wide
                ? "mx-auto grid min-h-0 w-full max-w-[68rem] flex-1 grid-cols-[1fr_minmax(22rem,30rem)] gap-[clamp(2rem,7vw,8rem)]"
                : "mx-auto flex min-h-0 w-full max-w-[28rem] flex-1 flex-col"
            }
          >
            {wide ? <ClockPanel gate className="min-w-0" /> : null}
            <div className="flex min-h-0 flex-1 flex-col justify-center">
              <PinPad
                pin={pin}
                onDigit={(d) => setPin((p) => (p.length < 4 ? p + d : p))}
                onClear={() => setPin("")}
                onEnter={() =>
                  requirePin(() => {
                    clockIn();
                    navigate({ to: "/floor" });
                  }, "PIN accepted")
                }
                onClockOut={() => requirePin(clockOut, "Clocked out")}
                onBreak={() => requirePin(() => undefined, "Break started")}
                onClockIn={() =>
                  requirePin(clockIn, `Clocked in at ${settings.clockedInAt}`)
                }
                onBiometric={() => toast.info("Biometrics not enrolled on this device")}
                revenueCenter={session.station ?? "Test Revenue Center"}
                onLogOut={() => {
                  signOut();
                  close();
                  navigate({ to: "/" });
                }}
                className="h-full max-h-[34rem] w-full"
              />
            </div>
          </div>
          <div className="mt-2 flex shrink-0 items-center justify-center gap-2 sm:hidden">
            <button
              type="button"
              onClick={() => toast.success("Tickets refreshed")}
              className="flex min-h-ctl-sm items-center gap-2 rounded-pill bg-white/10 px-3 text-fs-xs font-bold text-shell-foreground"
            >
              <RotateCw className="size-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                close();
                navigate({ to: "/system/customer-support" });
              }}
              className="flex min-h-ctl-sm items-center gap-2 rounded-pill bg-white/10 px-3 text-fs-xs font-bold text-shell-foreground"
            >
              <Headphones className="size-4" />
              Support
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
