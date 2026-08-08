import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Fingerprint, ScanFace, ChevronDown, ReceiptText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BottomTabs } from "@/components/pos/shell";
import { orderTypes } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/access/clock-in")({
  head: () => ({
    meta: [
      { title: "Clock In — eatOS Point of Purchase" },
      { name: "description", content: "PIN, biometric and break controls to run your shift." },
      { property: "og:title", content: "Clock In — eatOS Point of Purchase" },
      {
        property: "og:description",
        content: "PIN, biometric and break controls to run your shift.",
      },
    ],
  }),
  component: ClockIn,
});

const keyBase =
  "grid min-h-[56px] place-items-center rounded-2xl text-xl font-extrabold shadow-sm transition-transform active:scale-[0.97]";

function ClockIn() {
  const navigate = useNavigate();
  const { clockIn, clockOut, signOut, setStation, session } = usePos();
  const [pin, setPin] = useState("");
  const [showTypes, setShowTypes] = useState(false);
  const [orderType, setOrderType] = useState(orderTypes[0]!);

  const digit = (d: string) => setPin((p) => (p.length >= 4 ? p : p + d));

  return (
    <div className="relative flex flex-1 flex-col bg-background">
      {/* Tickets screen chrome behind the keypad overlay */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-4 pb-3 pt-4">
        <p className="text-2xl font-extrabold text-foreground">Tickets</p>
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {session.station ?? orderType}
        </span>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
        <div className="rounded-2xl border border-border bg-surface px-4 py-5">
          <div className="flex items-center justify-center gap-8">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "text-2xl font-extrabold leading-none",
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
            className={cn(keyBase, "bg-accent text-sm text-accent-foreground")}
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
            className={cn(keyBase, "bg-destructive text-sm text-destructive-foreground")}
          >
            Clock Out
          </button>
          <button
            type="button"
            onClick={() => toast.success("Break started")}
            className={cn(keyBase, "bg-surface text-sm text-foreground")}
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
            className={cn(keyBase, "bg-success text-sm text-success-foreground")}
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
            className={cn(keyBase, "bg-surface text-sm text-foreground")}
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
            className="h-12 w-full rounded-full border border-border text-sm font-bold text-foreground transition-colors hover:bg-muted"
          >
            Log out
          </button>
          {!showTypes ? (
            <button
              type="button"
              aria-label="New ticket"
              onClick={() => navigate({ to: "/order/new" })}
              className="absolute -top-1 right-2 grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg"
            >
              <ReceiptText className="size-5" />
            </button>
          ) : null}
        </div>

        {showTypes ? (
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto rounded-2xl border border-border bg-surface p-3">
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
                  "min-h-[40px] shrink-0 rounded-full px-4 text-sm font-bold transition-colors",
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

        <div className="mt-3 flex justify-center text-muted-foreground">
          <ChevronDown className="size-4" />
        </div>
      </div>

      <BottomTabs />
    </div>
  );
}
