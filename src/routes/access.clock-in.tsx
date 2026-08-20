import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ClockPanel } from "@/components/pos/clock-panel";
import { PinPad } from "@/components/pos/pin-pad";
import { useLayoutMode } from "@/hooks/use-layout-mode";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <div
        className={cn(
          "flex min-h-0 flex-1 gap-6 px-3 py-3",
          wide
            ? "mx-auto w-full max-w-[72rem] items-stretch"
            : "mx-auto w-full max-w-[26rem] flex-col",
        )}
      >
        {wide ? (
          <ClockPanel className="min-w-0 flex-1" />
        ) : (
          <ClockPanel compact className="shrink-0" />
        )}
        <div
          className={cn(
            "flex min-h-0 flex-col justify-center",
            wide ? "w-[26rem] shrink-0" : "flex-1",
          )}
        >
          <PinPad
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
          />
        </div>
      </div>
    </div>
  );
}
