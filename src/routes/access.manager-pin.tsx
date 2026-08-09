import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ScreenBody, ScreenFooter, ScreenHeader } from "@/components/pos/shell";
import { Keypad } from "@/components/pos/primitives";
import { Button } from "@/components/ui/button";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  action: z.string().optional(),
  next: z.string().optional(),
});

export const Route = createFileRoute("/access/manager-pin")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Manager PIN — EATOS Handheld" },
      { name: "description", content: "Manager approval for protected handheld actions." },
      { property: "og:title", content: "Manager PIN — EATOS Handheld" },
      { property: "og:description", content: "Manager approval for protected handheld actions." },
    ],
  }),
  component: ManagerPin,
});

function ManagerPin() {
  const navigate = useNavigate();
  const { action, next } = useSearch({ from: "/access/manager-pin" });
  const { unlockManager } = usePos();
  const [pin, setPin] = useState("");

  const approve = () => {
    unlockManager();
    toast.success(`${action ?? "Action"} approved by manager`);
    if (next === "manager-controls") {
      navigate({ to: "/tickets/manager-controls" });
    } else {
      navigate({ to: "/tickets" });
    }
  };



  return (
    <>
      <ScreenHeader eyebrow="Access" title="Manager PIN" back />
      <ScreenBody className="flex flex-col">
        <div className="rounded-card border border-border bg-surface p-4 text-center">
          <ShieldCheck className="mx-auto size-6 text-accent" />
          <p className="mt-2 text-fs-sm font-extrabold text-foreground">Protected action</p>
          <p className="text-fs-xs text-muted-foreground">
            {action ?? "This action"} requires a manager PIN.
          </p>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn(
                "size-3.5 rounded-pill",
                pin.length > i ? "bg-accent" : "bg-muted-foreground/25",
              )}
            />
          ))}
        </div>

        <div className="mx-auto mt-8 w-full max-w-[300px]">
          <Keypad
            onDigit={(d) => {
              if (pin.length >= 4) return;
              const value = pin + d;
              setPin(value);
              if (value.length === 4) setTimeout(approve, 250);
            }}
            onBackspace={() => setPin(pin.slice(0, -1))}
          />
        </div>
      </ScreenBody>
      <ScreenFooter>
        <Button
          variant="ghost"
          className="h-12 w-full rounded-pill text-fs-sm font-bold"
          onClick={() => navigate({ to: "/tickets" })}
        >
          Cancel
        </Button>
      </ScreenFooter>
    </>
  );
}
