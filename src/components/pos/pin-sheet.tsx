import { useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { PinPad } from "@/components/pos/pin-pad";
import { usePos } from "@/lib/pos-store";

/** Screen 70 - "Enter PIN" bottom sheet using the live app's full keypad. */
export function PinSheet({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}) {
  const { session } = usePos();
  const [pin, setPin] = useState("");

  const submit = () => {
    setPin("");
    onSubmit();
  };

  const push = (d: string) => {
    const next = (pin + d).slice(0, 4);
    setPin(next);
    if (next.length === 4) setTimeout(submit, 180);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        setPin("");
        onOpenChange(o);
      }}
    >
      <SheetContent
        side="bottom"
        className="max-h-[92dvh] overflow-y-auto rounded-t-sheet border-t border-border bg-background px-3 pb-6 pt-4"
      >
        <SheetTitle className="pb-2 text-center text-fs-xl font-extrabold text-foreground">
          Enter PIN
        </SheetTitle>

        <PinPad
          pin={pin}
          onDigit={push}
          onClear={() => setPin("")}
          onBackspace={() => setPin((p) => p.slice(0, -1))}
          onBiometric={submit}
          revenueCenter={session.station ?? "Main"}
        />
      </SheetContent>
    </Sheet>
  );
}
