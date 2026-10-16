import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AccountActions, AccountInfo } from "@/components/pos/account-bar";
import { ClockPanel } from "@/components/pos/clock-panel";
import { MoodDetailStep, MoodStep, RoleStep, SummaryStep, clockInCenters } from "@/components/pos/clock-in-flow";
import { PinPad } from "@/components/pos/pin-pad";
import { SettingsPullDown } from "@/components/pos/settings-pulldown";
import { Button } from "@/components/ui/button";
import { useLandscapeWide } from "@/hooks/use-layout-mode";
import { usePos } from "@/lib/pos-store";
import { useBackDismiss } from "@/hooks/use-back-dismiss";
import { useLiveTime } from "@/lib/use-live-time";

/** Phone-only date and large live clock above the PIN pad. */
function PhoneClock() {
  const time = useLiveTime();
  const [today, setToday] = useState("");
  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }));
  }, []);
  const [hm, suffix] = time.split(" ");
  return (
    <div className="shrink-0 pb-2 pt-2 text-center sm:hidden">
      <p className="text-fs-sm font-semibold text-topbar-muted">{today}</p>
      <p className="font-extrabold tabular-nums text-topbar-foreground">
        <span className="text-[3rem] leading-none">{hm}</span>
        {suffix ? <span className="ml-1.5 text-fs-xl text-topbar-muted">{suffix}</span> : null}
      </p>
    </div>
  );
}

/**
 * Dark top bar (design parity) with two pull surfaces: the handle hanging from
 * the bar pulls down the settings map, and the switch-user control on the left
 * reveals the clock PIN keypad (Clock Out / Break / Clock In, biometrics,
 * revenue center and Log Out).
 */
export function ClockPullDown() {
  const navigate = useNavigate();
  const { session, clockIn, clockOut, startBreak, signOut, tickets, setStation, setRole } = usePos();
  const wide = useLandscapeWide();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuDrag = useRef<number | null>(null);
  const skipMenuClick = useRef(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const [pin, setPin] = useState("");

  // Preserve the header Maya AI shortcut independently of the settings chevron.
  useEffect(() => {
    const onOpen = () => {
      setOpen(false);
      setMenuOpen(false);
      void navigate({ to: "/order/menu" });
    };
    // Switch user now lives in the navigation drawer.
    const onSwitchUser = () => {
      setMenuOpen(false);
      setOpen(true);
    };
    window.addEventListener("pos:open-dashboard", onOpen);
    window.addEventListener("pos:switch-user", onSwitchUser);
    return () => {
      window.removeEventListener("pos:open-dashboard", onOpen);
      window.removeEventListener("pos:switch-user", onSwitchUser);
    };
  }, [navigate]);

  const [step, setStep] = useState<"pin" | "role" | "summary" | "mood" | "moodDetail">("pin");
  const [role, setRoleLocal] = useState("Server");
  const [center, setCenter] = useState(clockInCenters[0]!.name);
  const [mood, setMood] = useState<string | undefined>();
  const [clockedAt, setClockedAt] = useState("");

  const close = () => {
    setOpen(false);
    setPin("");
    setStep("pin");
    setMood(undefined);
  };
  const closeRef = useRef(close);
  closeRef.current = close;
  useBackDismiss(open, () => closeRef.current());
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeRef.current(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const finishClockIn = () => {
    setStation(center);
    setRole(role);
    clockIn(pin);
    toast.success(`Clocked in at ${clockedAt}`);
    close();
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
          <AccountInfo />

          <AccountActions />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-11 items-end justify-center sm:flex">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={menuOpen ? "Close settings menu" : "Open settings menu"}
            aria-expanded={menuOpen}
            onPointerDown={(event) => { menuDrag.current = event.clientY; skipMenuClick.current = false; event.currentTarget.setPointerCapture(event.pointerId); }}
            onPointerUp={(event) => {
              const dy = menuDrag.current === null ? 0 : event.clientY - menuDrag.current;
              menuDrag.current = null;
              if (Math.abs(dy) < 25) return;
              skipMenuClick.current = true;
              close(); setMenuOpen(dy > 0);
            }}
            onPointerCancel={() => { menuDrag.current = null; }}
            onClick={() => {
              if (skipMenuClick.current) { skipMenuClick.current = false; return; }
              close();
              setMenuOpen((v) => !v);
            }}
            className="pointer-events-auto h-11 w-14 touch-none items-end rounded-none bg-transparent p-0 text-topbar-muted hover:bg-transparent hover:text-topbar-foreground"
          >
            <span className="grid h-3 w-12 place-items-center rounded-t-md border border-b-0 border-topbar-border bg-topbar text-topbar-foreground">
              {menuOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </span>
          </Button>
        </div>
      </div>

      <SettingsPullDown open={menuOpen} onClose={closeMenu} />


      {open ? (
        <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-topbar sm:bg-gate-overlay px-[clamp(0.75rem,5vw,5rem)] pb-[calc(0.75rem+var(--sab,0px))] pt-[calc(0.75rem+var(--sat,0px))] sm:absolute sm:z-30 sm:pb-[clamp(0.75rem,3dvh,2rem)] sm:pt-10">
          <div
            className={
              wide
                ? "mx-auto grid min-h-0 w-full max-w-[68rem] flex-1 grid-cols-[1fr_minmax(22rem,30rem)] gap-[clamp(2rem,7vw,8rem)]"
                : "mx-auto flex min-h-0 w-full max-w-[28rem] flex-1 flex-col"
            }
          >
            {wide ? <ClockPanel gate className="min-w-0" /> : null}
            <PhoneClock />
            <div className="flex min-h-0 flex-1 flex-col justify-start overflow-y-auto sm:justify-center">
              {step === "role" ? (
                <RoleStep name={session.name} value={role} onBack={() => setStep("pin")} onPick={(r) => { setRoleLocal(r); setStep("summary"); }} />
              ) : step === "summary" ? (
                <SummaryStep name={session.name} time={clockedAt} center={center} role={role} onCenter={setCenter} onRole={setRoleLocal} onContinue={() => setStep("mood")} />
              ) : step === "mood" ? (
                <MoodStep name={session.name} value={mood} onBack={() => setStep("summary")} onPick={(m) => { setMood(m); setStep("moodDetail"); }} onSubmit={finishClockIn} onSkip={finishClockIn} />
              ) : step === "moodDetail" && mood ? (
                <MoodDetailStep mood={mood} onBack={() => setStep("mood")} onSubmit={finishClockIn} onSkip={finishClockIn} />
              ) : (
              <PinPad
                pin={pin}
                onDigit={(d) => setPin((p) => (p.length < 4 ? p + d : p))}
                onClear={() => setPin("")}
                onEnter={() =>
                  requirePin(() => close(), "PIN accepted")
                }
                onClockOut={() => {
                  if (pin.length < 4) return void toast.error("Enter your 4-digit PIN");
                  if (tickets.some((t) => t.server === session.name && !t.closed)) {
                    close();
                    void navigate({ to: "/access/clock-out" });
                  } else requirePin(clockOut, "Clocked out");
                }}
                onBreak={() => requirePin(startBreak, "Break started")}
                clockedIn={session.clockedIn}
                onBreakNow={Boolean(session.onBreak)}
                onClockIn={() => {
                  if (pin.length < 4) return void toast.error("Enter your 4-digit PIN");
                  setClockedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
                  setStep("role");
                }}
                onBiometric={() => toast.info("Biometrics not enrolled on this device")}
                revenueCenter={session.station ?? "Test Revenue Center"}
                onLogOut={() => {
                  signOut();
                  close();
                  navigate({ to: "/" });
                }}
                className="h-full max-h-none w-full sm:max-h-[34rem]"
              />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
