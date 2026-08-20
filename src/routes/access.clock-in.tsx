import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ClockPanel } from "@/components/pos/clock-panel";
import { PinPad } from "@/components/pos/pin-pad";
import { useLayoutMode } from "@/hooks/use-layout-mode";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/access/clock-in")({
  head: () => ({
    meta: [
      { title: "Clock In - eatOS Point of Sale" },
      { name: "description", content: "PIN, biometric and break controls to run your shift." },
      { property: "og:title", content: "Clock In - eatOS Point of Sale" },
      {
        property: "og:description",
        content: "PIN, biometric and break controls to run your shift.",
      },
    ],
  }),
  component: ClockIn,
});

function ClockIn() {
  const navigate = useNavigate();
  const { clockIn, clockOut, signOut, session, settings } = usePos();
  const { wide } = useLayoutMode();
  const [pin, setPin] = useState("");

  /** Nothing on this gate acts without a full 4-digit PIN. */
  const withPin = (action: () => void, message: string) => {
    if (pin.length < 4) {
      toast.error("Enter your 4-digit PIN");
      return;
    }
    action();
    toast.success(message);
    setPin("");
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
        <div className={wide ? "mx-auto grid min-h-0 w-full max-w-[68rem] grid-cols-[1fr_minmax(25rem,30rem)] gap-[clamp(3rem,8vw,9rem)]" : "mx-auto grid min-h-0 w-full max-w-[28rem] grid-rows-[auto_1fr] gap-3"}>
          <ClockPanel gate className={wide ? "min-w-0" : "hidden"} />
          <div className="flex min-h-0 flex-col justify-center">
          <PinPad
              gate
            pin={pin}
            onDigit={(d) => setPin((p) => (p.length < 4 ? p + d : p))}
            onClear={() => setPin("")}
            onEnter={() =>
              withPin(() => {
                clockIn();
                navigate({ to: "/tickets" });
              }, "PIN accepted")
            }
            onClockOut={() => withPin(clockOut, "Clocked out")}
            onBreak={() => withPin(() => undefined, "Break started")}
            onClockIn={() =>
              withPin(() => {
                clockIn();
                navigate({ to: "/tickets" });
              }, `Clocked in at ${settings.clockedInAt}`)
            }
            onBiometric={() => {
              clockIn();
              toast.success("Clocked in with biometrics");
              navigate({ to: "/tickets" });
            }}
            revenueCenter={session.station ?? "Main"}
            onLogOut={() => {
              signOut();
              navigate({ to: "/" });
            }}
              className="h-full max-h-[34rem] w-full"
          />
          </div>
        </div>
      </div>
    </div>
  );
}
