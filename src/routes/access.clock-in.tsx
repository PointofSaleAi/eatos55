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
  "grid min-h-[58px] place-items-center rounded-md text-2xl font-extrabold transition-transform active:scale-[0.98]";

function ClockIn() {
  const navigate = useNavigate();
  const { clockIn, clockOut, signOut, setStation, session } = usePos();
  const [pin, setPin] = useState("");
  const [showTypes, setShowTypes] = useState(false);
  const [orderType, setOrderType] = useState(orderTypes[0]!);

  const digit = (d: string) => setPin((p) => (p.length >= 4 ? p : p + d));

  return (
    <div className="relative flex flex-1 flex-col bg-shell/70">
      {/* Tickets screen chrome behind the keypad overlay */}
      <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-4 opacity-60">
        <p className="text-xl font-extrabold text-primary-foreground">Tickets</p>
        <span className="text-xs font-bold uppercase tracking-widest text-primary-foreground/70">
          {session.station ?? orderType}
        </span>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-3 pb-4">
        <div className="rounded-lg bg-surface px-4 py-5">
          <div className="flex items-center justify-center gap-8">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "text-4xl font-black leading-none",
                  pin.length > i ? "text-foreground" : "text-foreground/25",
                )}
              >
                ✱
              </span>
            ))}
          </div>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1.5">
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
            className={cn(keyBase, "bg-primary text-lg text-primary-foreground")}
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
            className={cn(keyBase, "bg-destructive text-lg text-destructive-foreground")}
          >
            Clock Out
          </button>
          <button
            type="button"
            onClick={() => toast.success("Break started")}
            className={cn(keyBase, "bg-surface text-lg text-foreground")}
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
            className={cn(keyBase, "bg-success text-lg text-success-foreground")}
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
            <Fingerprint className="size-7" />
          </button>
          <button
            type="button"
            onClick={() => setShowTypes((s) => !s)}
            className={cn(keyBase, "bg-surface text-base text-foreground")}
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
            <ScanFace className="size-7" />
          </button>
        </div>

        <div className="relative mt-3">
          <button
            type="button"
            onClick={() => {
              signOut();
              navigate({ to: "/" });
            }}
            className="h-14 w-full rounded-xl border-2 border-primary-foreground/70 text-base font-extrabold uppercase tracking-wide text-primary-foreground"
          >
            Log out
          </button>
          {!showTypes ? (
            <button
              type="button"
              aria-label="New ticket"
              onClick={() => navigate({ to: "/order/new" })}
              className="absolute -top-1 right-2 grid size-14 place-items-center rounded-full bg-shell text-primary-foreground shadow-lg"
            >
              <ReceiptText className="size-6" />
            </button>
          ) : null}
        </div>

        {showTypes ? (
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto rounded-xl border border-primary-foreground/25 bg-shell/60 p-3">
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
                  "min-h-[56px] shrink-0 rounded-md px-6 text-2xl font-extrabold",
                  t === orderType
                    ? "bg-muted text-foreground"
                    : "bg-shell text-primary-foreground/60",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-3 flex justify-center text-primary-foreground/50">
          <ChevronDown className="size-5" />
        </div>
      </div>

      <BottomTabs />
    </div>
  );
}
