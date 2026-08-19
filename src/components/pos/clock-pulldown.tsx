import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Headphones, RotateCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AccountActions, AccountInfo } from "@/components/pos/account-bar";
import { PinPad } from "@/components/pos/pin-pad";
import { usePos } from "@/lib/pos-store";

/**
 * Dark top bar (design parity) plus the pull-down clock pad: the handle hanging
 * from the bar reveals the PIN keypad with Clock Out / Break / Clock In,
 * biometrics, revenue center and Log Out.
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
        <div className="absolute inset-0 z-30 flex flex-col bg-shell/80 px-3 pb-4 pt-10">
          <div className="mb-2 flex items-center justify-center gap-2 sm:hidden">
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
          <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
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
              onShell
              revenueCenter={session.station ?? "Test Revenue Center"}
              onLogOut={() => {
                signOut();
                close();
                navigate({ to: "/" });
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
