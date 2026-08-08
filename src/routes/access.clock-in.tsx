import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Fingerprint } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ScreenBody, ScreenFooter, ScreenHeader } from "@/components/pos/shell";
import { Keypad } from "@/components/pos/primitives";
import { Button } from "@/components/ui/button";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/access/clock-in")({
  head: () => ({
    meta: [
      { title: "Clock in — EATOS Handheld" },
      { name: "description", content: "PIN and biometric entry to start your shift." },
      { property: "og:title", content: "Clock in — EATOS Handheld" },
      { property: "og:description", content: "PIN and biometric entry to start your shift." },
    ],
  }),
  component: ClockIn,
});

function ClockIn() {
  const navigate = useNavigate();
  const { clockIn, session } = usePos();
  const [pin, setPin] = useState("");

  const submit = (viaBiometric = false) => {
    clockIn();
    toast.success(viaBiometric ? "Clocked in with Face ID" : "Clocked in");
    navigate({ to: "/access/select-station" });
  };

  return (
    <>
      <ScreenHeader eyebrow="Access" title="Clock in" />
      <ScreenBody className="flex flex-col">
        <div className="text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary text-base font-extrabold text-primary-foreground">
            EC
          </div>
          <p className="mt-3 text-sm font-extrabold text-foreground">{session.name}</p>
          <p className="text-xs text-muted-foreground">{session.role} · Enter your 4-digit PIN</p>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn(
                "size-3.5 rounded-full",
                pin.length > i ? "bg-accent" : "bg-muted-foreground/25",
              )}
            />
          ))}
        </div>

        <div className="mx-auto mt-8 w-full max-w-[300px]">
          <Keypad
            onDigit={(d) => {
              if (pin.length >= 4) return;
              const next = pin + d;
              setPin(next);
              if (next.length === 4) setTimeout(() => submit(), 250);
            }}
            onBackspace={() => setPin(pin.slice(0, -1))}
            extraKey={{ label: "Face", onPress: () => submit(true) }}
          />
        </div>

        <button
          type="button"
          onClick={() => submit(true)}
          className="mx-auto mt-6 flex items-center gap-2 text-sm font-bold text-accent"
        >
          <Fingerprint className="size-4" /> Use biometrics instead
        </button>
      </ScreenBody>
      <ScreenFooter>
        <Button
          variant="ghost"
          className="h-12 w-full rounded-full text-sm font-bold"
          onClick={() => navigate({ to: "/" })}
        >
          Switch user
        </Button>
      </ScreenFooter>
    </>
  );
}
