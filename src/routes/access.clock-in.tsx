import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { brand } from "@/lib/brand";
import { useState } from "react";
import { toast } from "sonner";
import { ClockPanel } from "@/components/pos/clock-panel";
import { PinPad } from "@/components/pos/pin-pad";
import {
  MoodDetailStep,
  MoodStep,
  RoleStep,
  SummaryStep,
  clockInCenters,
} from "@/components/pos/clock-in-flow";
import { revenueCenters } from "@/lib/demo-data";
import { useLandscapeWide, useLayoutMode } from "@/hooks/use-layout-mode";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/access/clock-in")({
  head: () => ({
    meta: [
      { title: `Clock In - ${brand.appName} Point of Sale` },
      { name: "description", content: "PIN, biometric and break controls to run your shift." },
      { property: "og:title", content: `Clock In - ${brand.appName} Point of Sale` },
      {
        property: "og:description",
        content: "PIN, biometric and break controls to run your shift.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ClockIn,
});

type Step = "pin" | "role" | "summary" | "mood" | "moodDetail";

function ClockIn() {
  const navigate = useNavigate();
  const { clockIn, clockOut, signOut, session, settings, setStation, setRole } = usePos();
  const { wide: wideLayout } = useLayoutMode();
  const landscape = useLandscapeWide();
  const wide = wideLayout && landscape;
  const [pin, setPin] = useState("");
  // True from a correct PIN until the next screen is actually open.
  const [unlocking, setUnlocking] = useState(false);
  const [step, setStep] = useState<Step>("pin");
  const [role, setRoleLocal] = useState("Server");
  const [center, setCenter] = useState(clockInCenters[0]!.name);
  const [mood, setMood] = useState<string | undefined>();
  const [clockedAt, setClockedAt] = useState("");
  const activeCenter = session.station ?? "Main";

  /** Unlock and open New Order. */
  const unlock = async (enteredPin?: string) => {
    if (unlocking) return;
    setUnlocking(true);
    clockIn(enteredPin);
    try {
      await navigate({ to: "/order/new" });
    } catch {
      setUnlocking(false);
      setPin("");
      setStep("pin");
      toast.error("Couldn't open the next screen. Please try again.");
    }
  };

  const finishClockIn = () => {
    setStation(center);
    setRole(role);
    toast.success(`Clocked in at ${clockedAt}`);
    void unlock(pin);
  };

  /** Nothing on this gate acts without a full 4-digit PIN. */
  const withPin = (action: () => void, message: string | null, keepPin = false) => {
    if (unlocking) return;
    if (pin.length < 4) {
      toast.error("Enter your 4-digit PIN");
      return;
    }
    action();
    if (message) toast.success(message);
    // Unlocking keeps the stars filled until the next screen opens.
    if (!keepPin) setPin("");
  };

  const startClockIn = () => {
    setClockedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    setStep("role");
  };

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden bg-background" aria-label="Locked point of sale">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-surface opacity-50">
        <div className="border-b border-border px-8 py-5 text-fs-xl font-extrabold uppercase text-foreground">
          Ground Floor
        </div>
        <div className="grid grid-cols-4 gap-6 p-8">
          {["Table T1", "Table T2", "Table T3", "Table T4", "Table T5"].map((table, i) => (
            <div key={table} className="grid aspect-[1.15] place-items-center border border-border bg-background text-center">
              <span className="font-bold text-foreground">{table}<br /><small>{i + 1} / 8</small></span>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed inset-0 z-[100] flex overflow-hidden bg-gate-overlay px-[clamp(1rem,6vw,6.5rem)] py-[clamp(1rem,4dvh,3rem)] pt-[calc(clamp(1rem,4dvh,3rem)+3rem)]">
        <div className={wide ? "mx-auto grid min-h-0 w-full max-w-[68rem] grid-cols-[minmax(0,1fr)_minmax(25rem,30rem)] gap-[clamp(3rem,8vw,9rem)]" : "mx-auto grid min-h-0 w-full max-w-[28rem] grid-rows-[4.5rem_1fr] gap-3"}>
          <ClockPanel gate compact={!wide} className="min-w-0" />
          <div className="relative flex min-h-0 flex-col justify-center overflow-y-auto" aria-busy={unlocking}>
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
            onDigit={(d) => !unlocking && setPin((p) => (p.length < 4 ? p + d : p))}
            onClear={() => !unlocking && setPin("")}
            onEnter={() => withPin(() => void unlock(pin), "PIN accepted", true)}
            onClockOut={() => withPin(clockOut, "Clocked out")}
            onBreak={() => withPin(() => undefined, "Break started")}
            onClockIn={() => withPin(startClockIn, null, true)}
            onBiometric={() => {
              if (unlocking) return;
              toast.success("Signed in with biometrics");
              void unlock();
            }}
            revenueCenter={activeCenter}
            revenueCenterOptions={revenueCenters}
            onRevenueCenterSelect={(c) => {
              setStation(c);
              toast.success(`Revenue center set to ${c}`);
            }}
            onLogOut={() => {
              signOut();
              navigate({ to: "/" });
            }}
              className="h-full max-h-[34rem] w-full"
          />
          )}
          {unlocking ? (
            <div
              role="status"
              className="absolute inset-0 z-20 grid place-items-center rounded-md bg-gate-overlay/70"
            >
              <span className="inline-flex items-center gap-2 rounded-pill bg-surface px-4 py-2 text-fs-sm font-bold text-foreground shadow-lg">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Signing in
              </span>
            </div>
          ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
