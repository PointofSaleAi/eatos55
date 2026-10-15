import { useState, type ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { EMark } from "@/components/pos/brand";
import { ShiftSummaryDialog } from "@/components/pos/shift-summary-dialog";
import { usePos } from "@/lib/pos-store";

/** Header profile bar → profile card with shift summary and log out. */
export function ProfileCard({ children }: { children: ReactNode }) {
  const { session, settings } = usePos();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState(false);
  const m = /^(\d{1,2}:\d{2})\s*(AM|PM)?/i.exec(settings.clockedInAt);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent align="start" sideOffset={8} className="w-[min(20rem,calc(100vw-1.5rem))] p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
              <EMark className="size-7" />
            </span>
            <div className="min-w-0">
              <p className="break-words text-[1.125rem] font-extrabold leading-tight">{session.name}</p>
              <p className="text-[0.875rem] text-muted-foreground">{session.role}</p>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <div className="py-3 text-center">
              <p className="text-[1.375rem] font-extrabold tabular-nums">
                {m?.[1] ?? settings.clockedInAt}
                {m?.[2] && <span className="ml-1 text-[0.75rem] font-semibold">{m[2].toUpperCase()}</span>}
              </p>
              <p className="text-[0.875rem] text-muted-foreground">Clock In</p>
            </div>
            <Button
              className="h-12 w-full rounded-none text-[0.9375rem] font-bold"
              onClick={() => {
                setOpen(false);
                setSummary(true);
              }}
            >
              View Shift Summary
            </Button>
            <Button
              variant="ghost"
              className="h-12 w-full rounded-none text-[0.9375rem] font-bold uppercase"
              onClick={() => {
                setOpen(false);
                window.dispatchEvent(new CustomEvent("pos:switch-user"));
              }}
            >
              Log Out
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <ShiftSummaryDialog open={summary} onOpenChange={setSummary} />
    </>
  );
}
