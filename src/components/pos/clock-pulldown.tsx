import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AccountActions, AccountInfo } from "@/components/pos/account-bar";
import { ClockPanel } from "@/components/pos/clock-panel";
import { PinPad } from "@/components/pos/pin-pad";
import { SettingsPullDown } from "@/components/pos/settings-pulldown";
import { Button } from "@/components/ui/button";
import { useLandscapeWide } from "@/hooks/use-layout-mode";
import { usePos } from "@/lib/pos-store";

/**
 * Dark top bar (design parity) with two pull surfaces: the handle hanging from
 * the bar pulls down the settings map, and the switch-user control on the left
 * reveals the clock PIN keypad (Clock Out / Break / Clock In, biometrics,
 * revenue center and Log Out).
 */
export function ClockPullDown() {
  const navigate = useNavigate();
  const { session, settings, clockIn, clockOut, signOut } = usePos();
  const wide = useLandscapeWide();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pin, setPin] = useState("");

  // The rail's shift assistant opens the same pull-down pad.
  useEffect(() => {
    const onOpen = () => {
      setOpen(false);
      setMenuOpen(true);
    };
    window.addEventListener("pos:open-dashboard", onOpen);
    return () => window.removeEventListener("pos:open-dashboard", onOpen);
  }, []);

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
      <div className="relative z-40 h-14 shrink-0 border-b border-topbar-border bg-topbar shadow-sm">
        <div className="grid h-full grid-cols-[minmax(0,1fr)_auto] items-center gap-1 px-3 pb-1">
          <AccountInfo
            onSwitchUser={() => {
              setMenuOpen(false);
              setOpen(true);
            }}
          />
          <AccountActions />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-11 items-end justify-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={menuOpen ? "Close settings menu" : "Open settings menu"}
            aria-expanded={menuOpen}
            onClick={() => {
              close();
              setMenuOpen((v) => !v);
            }}
            className="pointer-events-auto h-11 w-14 items-end rounded-none bg-transparent p-0 text-topbar-muted hover:bg-transparent hover:text-topbar-foreground"
          >
            <span className="grid h-3 w-12 place-items-center rounded-t-md border border-b-0 border-topbar-border bg-muted">
              {menuOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </span>
          </Button>
        </div>
      </div>

      <SettingsPullDown open={menuOpen} onClose={() => setMenuOpen(false)} />


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
        </div>
      ) : null}
    </>
  );
}
