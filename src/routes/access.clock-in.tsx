import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Fingerprint, ScanFace, ChevronDown, ReceiptText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ClockPanel } from "@/components/pos/clock-panel";
import { useLayoutMode } from "@/hooks/use-layout-mode";
import { orderTypes } from "@/lib/demo-data";
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

const keyBase =
  "grid min-h-key place-items-center rounded-card text-fs-xl font-extrabold shadow-sm transition-transform active:scale-[0.97]";

function ClockIn() {
  const navigate = useNavigate();
  const { clockIn, clockOut, signOut, setStation, session } = usePos();
  const { wide } = useLayoutMode();
  const [pin, setPin] = useState("");
  const [showTypes, setShowTypes] = useState(false);
  const [orderType, setOrderType] = useState(orderTypes[0]!);

  const digit = (d: string) => setPin((p) => (p.length >= 4 ? p : p + d));

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      {/* Tickets screen chrome behind the keypad overlay */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-4 pb-3 pt-4">
        <p className="text-fs-xl font-extrabold text-foreground">Tickets</p>
        <span className="text-fs-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {session.station ?? orderType}
        </span>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {/* Landscape puts the date/time/weather panel beside the keypad; phones
            keep the keypad in a comfortable single column with a compact strip. */}
        <div
          className={cn(
            wide
              ? "mx-auto grid w-full max-w-[64rem] grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] items-center gap-10"
              : "mx-auto w-full max-w-[26rem]",
          )}
        >
          {wide ? <ClockPanel /> : <ClockPanel compact className="mb-3" />}
          <div className="w-full">
        <div className="rounded-card border border-border bg-surface px-4 py-5">

          <div className="flex items-center justify-center gap-8">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "text-fs-xl font-extrabold leading-none",
                  pin.length > i ? "text-foreground" : "text-foreground/25",
                )}
              >
                ✱
              </span>
            ))}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => digit(k)}
              className={cn(keyBase, "bg-surface text-foreground")}
            >
              {k}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin("")}
            className={cn(keyBase, "bg-surface text-destructive")}
          >
            C
          </button>
          <button
            type="button"
            onClick={() => digit("0")}
            className={cn(keyBase, "bg-surface text-foreground")}
          >
            0
          </button>
          <button
            type="button"
            onClick={() => {
              clockIn();
              toast.success("PIN accepted");
              navigate({ to: "/tickets" });
            }}
            className={cn(keyBase, "bg-accent text-fs-sm text-accent-foreground")}
          >
            ENTER
          </button>

          <button
            type="button"
            onClick={() => {
              clockOut();
              toast.success("Clocked out");
              setPin("");
            }}
            className={cn(keyBase, "bg-destructive text-fs-sm text-destructive-foreground")}
          >
            Clock Out
          </button>
          <button
            type="button"
            onClick={() => toast.success("Break started")}
            className={cn(keyBase, "bg-surface text-fs-sm text-foreground")}
          >
            Break
          </button>
          <button
            type="button"
            onClick={() => {
              clockIn();
              toast.success("Clocked in");
              navigate({ to: "/tickets" });
            }}
            className={cn(keyBase, "bg-success text-fs-sm text-success-foreground")}
          >
            Clock In
          </button>

          <button
            type="button"
            aria-label="Clock in with fingerprint"
            onClick={() => {
              clockIn();
              toast.success("Clocked in with Touch ID");
              navigate({ to: "/tickets" });
            }}
            className={cn(keyBase, "bg-primary text-primary-foreground")}
          >
            <Fingerprint className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowTypes((s) => !s)}
            className={cn(keyBase, "bg-surface text-fs-sm text-foreground")}
          >
            {orderType}
          </button>
          <button
            type="button"
            aria-label="Clock in with Face ID"
            onClick={() => {
              clockIn();
              toast.success("Clocked in with Face ID");
              navigate({ to: "/tickets" });
            }}
            className={cn(keyBase, "bg-primary text-primary-foreground")}
          >
            <ScanFace className="size-5" />
          </button>
        </div>

        <div className="relative mt-3">
          <button
            type="button"
            onClick={() => {
              signOut();
              navigate({ to: "/" });
            }}
            className="h-12 w-full rounded-pill border border-border text-fs-sm font-bold text-foreground transition-colors hover:bg-muted"
          >
            Log out
          </button>
          {!showTypes ? (
            <button
              type="button"
              aria-label="New ticket"
              onClick={() => navigate({ to: "/order/new" })}
              className="absolute -top-1 right-2 grid size-12 place-items-center rounded-pill bg-primary text-primary-foreground shadow-lg"
            >
              <ReceiptText className="size-5" />
            </button>
          ) : null}
        </div>

        {showTypes ? (
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto rounded-card border border-border bg-surface p-3">
            {orderTypes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setOrderType(t);
                  setStation(t);
                  setShowTypes(false);
                  toast.success(`Order type set to ${t}`);
                }}
                className={cn(
                  "min-h-ctl-sm shrink-0 rounded-pill px-3.5 text-fs-sm font-bold transition-colors",
                  t === orderType
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        ) : null}

        {!wide ? (
          <div className="mt-3 flex justify-center text-muted-foreground">
            <ChevronDown className="size-4" />
          </div>
        ) : null}
          </div>
        </div>
      </div>

    </div>
  );
}
