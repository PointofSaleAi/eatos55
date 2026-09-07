import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QrCode, X } from "lucide-react";
import { brand } from "@/lib/brand";
import { TTP, TapToPayMark } from "@/components/pos/tap-to-pay";
import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/payment/tap-to-pay")({
  head: () => ({
    meta: [
      { title: `${TTP} - ${brand.appName} Point of Sale` },
      {
        name: "description",
        content:
          "Prepare the reader, then hold a contactless card or digital wallet to the top of this iPhone to take payment.",
      },
      { property: "og:title", content: `${TTP} - ${brand.appName} Point of Sale` },
      {
        property: "og:description",
        content: "Hold a contactless card or wallet to the top of this iPhone to take payment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaymentTapToPay,
});

function PaymentTapToPay() {
  const navigate = useNavigate();
  const { settings, totals, paidSoFar, commitPayment } = usePos();
  const due = Math.max(0, Math.round((totals.total - paidSoFar) * 100) / 100);

  const [phase, setPhase] = useState<"setup" | "reader">("setup");
  const [progress, setProgress] = useState(20);

  useEffect(() => {
    if (phase !== "setup") return;
    const bump = window.setTimeout(() => setProgress(72), 700);
    const done = window.setTimeout(() => setPhase("reader"), 2200);
    return () => {
      window.clearTimeout(bump);
      window.clearTimeout(done);
    };
  }, [phase]);

  const complete = () => {
    commitPayment("card", due, { tenderId: "contactless", label: TTP });
    navigate({ to: "/payment/success" });
  };

  if (phase === "setup") {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background px-[var(--pad-screen)] pb-[calc(1rem+var(--tabs-h,0px))] pt-6">
        <div className="mx-auto flex w-full max-w-[34rem] flex-1 flex-col">
          <h1 className="text-fs-2xl font-extrabold leading-tight text-foreground">
            Setting up {TTP}
          </h1>
          <p className="mt-2 text-fs-base text-muted-foreground">
            You will come straight back to this ticket.
          </p>

          <div
            className="mt-5 h-2 w-full overflow-hidden rounded-pill bg-muted"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-pill bg-accent transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-5 text-fs-sm font-bold text-success">✓ Terms accepted</p>
          <p className="mt-2 text-fs-sm text-foreground">◦ Preparing the reader...</p>

          <div className="mt-auto pt-10">
            <button
              type="button"
              onClick={() => navigate({ to: "/payment/method" })}
              className="h-ctl-md w-full rounded-row text-fs-base font-semibold text-accent"
            >
              Take this payment another way
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Apple system payment sheet stand-in. Requirement: this moment matches the
   * Apple-supplied "Hold Here to Pay" presentation, so the dark treatment is
   * fixed by Apple and not themed by the app.
   */
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#0b0b0f] text-white">
      <div className="mx-auto flex w-full max-w-[26rem] flex-1 flex-col px-6 pb-6 pt-10">
        <div className="flex flex-col items-center">
          <TapToPayMark className="size-16 text-white" />
          <p className="mt-4 text-fs-2xl font-extrabold">Hold Here to Pay</p>
        </div>

        <div className="mt-10 rounded-sheet bg-[#1c1c1e] px-6 py-8 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#f2a30a]">
            <span aria-hidden className="text-2xl">
              🛍️
            </span>
          </div>
          <p className="mt-4 text-fs-lg font-bold">{settings.restaurantName}</p>
          <p className="mt-1 text-[2.5rem] font-extrabold leading-none">{money(due)}</p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-10">
          <button
            type="button"
            aria-label="Cancel this payment"
            onClick={() => navigate({ to: "/payment/method" })}
            className="grid size-14 place-items-center rounded-full bg-white/10 text-white"
          >
            <X className="size-6" />
          </button>
          <button
            type="button"
            onClick={complete}
            className="grid size-14 place-items-center rounded-full bg-white/10 text-white"
            aria-label="Simulate a completed tap"
          >
            <QrCode className="size-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
