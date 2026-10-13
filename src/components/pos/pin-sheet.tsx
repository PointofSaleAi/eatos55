import { useEffect, useRef, useState } from "react";
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
  const submitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPendingSubmit = () => {
    if (submitTimer.current !== null) clearTimeout(submitTimer.current);
    submitTimer.current = null;
  };

  useEffect(() => {
    if (!open) {
      if (submitTimer.current !== null) clearTimeout(submitTimer.current);
      submitTimer.current = null;
      setPin("");
    }
    return () => {
      if (submitTimer.current !== null) clearTimeout(submitTimer.current);
      submitTimer.current = null;
    };
  }, [open]);

  const submit = () => {
    cancelPendingSubmit();
    setPin("");
    onSubmit();
  };

  const push = (d: string) => {
    cancelPendingSubmit();
    const next = (pin + d).slice(0, 4);
    setPin(next);
    if (next.length === 4) submitTimer.current = setTimeout(submit, 180);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        cancelPendingSubmit();
        setPin("");
        onOpenChange(o);
      }}
    >
      <SheetContent
        side="bottom"
        className="flex max-h-[92dvh] flex-col overflow-hidden rounded-t-sheet border-t border-border bg-background px-3 pb-6 pt-4"
      >
        <SheetTitle className="pb-2 text-center text-fs-xl font-extrabold text-foreground">
          Enter PIN
        </SheetTitle>

        <PinPad
          pin={pin}
          onDigit={push}
          onClear={() => { cancelPendingSubmit(); setPin(""); }}
          onBackspace={() => { cancelPendingSubmit(); setPin((p) => p.slice(0, -1)); }}
          onBiometric={submit}
          revenueCenter={session.station ?? "Main"}
          className="mx-auto h-[min(28rem,68dvh)] w-full max-w-sheet"
        />
      </SheetContent>
    </Sheet>
  );
}
