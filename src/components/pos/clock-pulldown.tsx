import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PinPad } from "@/components/pos/pin-pad";
import { usePos } from "@/lib/pos-store";

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
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 px-2">
          <AccountInfo />
          <button
            type="button"
            aria-label={open ? "Close clock pad" : "Open clock pad"}
            aria-expanded={open}
            onClick={() => (open ? close() : setOpen(true))}
            className="flex h-7 tap-safe w-24 items-center justify-center rounded-b-xl border border-t-0 border-border bg-surface text-muted-foreground"
          >
            {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
          <AccountActions />
        </div>
      </div>


      {open ? (
        <div className="absolute inset-0 z-30 flex flex-col bg-shell/80 px-3 pb-4 pt-8">
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
