import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronRight, Circle, Lock } from "lucide-react";
import tapToPayImage from "@/assets/tap-to-pay-iphone-card.png.asset.json";
import { brand } from "@/lib/brand";
import {
  TTP,
  TapToPayMark,
  TTP_SET_UP,
  TtpBenefits,
  TtpStatusPill,
  ttpCopy,
} from "@/components/pos/tap-to-pay";

import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/tap-to-pay/setup/$from")({
  head: () => ({
    meta: [
      { title: `Set up ${TTP} - ${brand.appName} Point of Sale` },
      {
        name: "description",
        content:
          "Accept the Apple Terms and Conditions, then prepare this iPhone to take contactless cards and digital wallets.",
      },
      { property: "og:title", content: `Set up ${TTP} - ${brand.appName} Point of Sale` },
      {
        property: "og:description",
        content: "Accept the Apple terms, then prepare this iPhone to take card payments.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TapToPaySetup,
});

type Step = "passcode" | "terms" | "ready" | "failed";

function TapToPaySetup() {
  const { from } = useParams({ from: "/tap-to-pay/setup/$from" });
  const navigate = useNavigate();
  const { settings, updateSettings, totals, paidSoFar, tickets } = usePos();
  const fromCheckout = from === "checkout";
  const due = Math.max(0, Math.round((totals.total - paidSoFar) * 100) / 100);

  const [step, setStep] = useState<Step>("terms");

  const backToSource = () => {
    if (fromCheckout) navigate({ to: "/payment/method" });
    else if (from === "settings") navigate({ to: "/settings/tap-to-pay" });
    else navigate({ to: "/tickets" });
  };

  const acceptTerms = () => {
    updateSettings({
      tapToPayTermsAcceptedAt: new Date().toISOString(),
      tapToPayState: "ready",
    });
    setStep("ready");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background px-[var(--pad-screen)] pb-[calc(1rem+var(--tabs-h,0px))] pt-5">
      <div className="mx-auto flex w-full max-w-[34rem] flex-1 flex-col">
        {fromCheckout ? (
          <div className="mb-4 rounded-row border border-border bg-surface px-3 py-2">
            <p className="text-fs-sm font-extrabold text-foreground">
              Ticket {tickets.length + 1} held · {money(due)}
            </p>
            <p className="text-fs-xs text-muted-foreground">
              You will come straight back to this ticket.
            </p>
          </div>
        ) : null}

        {step === "passcode" ? (
          <>
            <Lock className="size-8 text-foreground" aria-hidden />
            <h1 className="mt-4 text-fs-2xl font-extrabold text-foreground">Set a passcode first</h1>
            <p className="mt-2 text-fs-sm leading-relaxed text-muted-foreground">
              {TTP} needs a device passcode. Add one in the iPhone Settings app, then come back.
            </p>
            <div className="mt-auto pt-8">
              <button
                type="button"
                onClick={() => setStep("terms")}
                className="h-ctl-lg w-full rounded-row bg-primary text-fs-base font-extrabold text-primary-foreground"
              >
                I have added a passcode
              </button>
              <button
                type="button"
                onClick={backToSource}
                className="mt-2 h-ctl-md w-full rounded-row text-fs-sm font-semibold text-accent"
              >
                Back
              </button>
            </div>
          </>
        ) : null}

        {step === "terms" ? (
          <>
            <div className="overflow-hidden rounded-sheet border border-border bg-surface p-1 elev-1">
              <img
                src={tapToPayImage.url}
                alt="Contactless card held near an iPhone for Tap to Pay on iPhone"
                className="aspect-[16/11] w-full rounded-card object-cover"
                loading="lazy"
              />
            </div>

            <h1 className="mt-6 text-fs-2xl font-extrabold leading-tight text-foreground">
              Accept payments right
              <br />
              on this iPhone
            </h1>
            <p className="mt-2 text-fs-base leading-relaxed text-muted-foreground">
              {ttpCopy.awarenessBody}
            </p>

            <div className="mt-5">
              <TtpBenefits />
            </div>

            <div className="mt-auto pt-8">
              <button
                type="button"
                onClick={acceptTerms}
                className="h-ctl-lg w-full rounded-row bg-primary text-fs-base font-extrabold text-primary-foreground"
              >
                {TTP_SET_UP}
              </button>
              <button
                type="button"
                onClick={backToSource}
                className="mt-2 h-ctl-md w-full rounded-row text-fs-sm font-semibold text-accent"
              >
                {ttpCopy.later}
              </button>
            </div>
          </>
        ) : null}

        {step === "configuring" ? (
          <>
            <TapToPayMark className="size-8 text-foreground" />
            <h1 className="mt-4 text-fs-2xl font-extrabold text-foreground">Setting up {TTP}</h1>
            <p className="mt-2 text-fs-sm text-muted-foreground">
              Keep this iPhone unlocked and connected.
            </p>
            <div className="mt-5 h-1.5 overflow-hidden rounded-pill bg-muted">
              <div
                className="h-full rounded-pill bg-accent transition-all duration-700"
                style={{ width: prepared ? "92%" : "48%" }}
              />
            </div>
            <ul className="mt-4 space-y-2 text-fs-sm">
              <li className="flex items-center gap-2 text-success">
                <CheckCircle2 className="size-4" aria-hidden /> Checked this iPhone
              </li>
              <li className="flex items-center gap-2 text-success">
                <CheckCircle2 className="size-4" aria-hidden /> Linked your merchant account
              </li>
              <li
                className={
                  prepared ? "flex items-center gap-2 text-success" : "flex items-center gap-2 text-muted-foreground"
                }
              >
                {prepared ? (
                  <CheckCircle2 className="size-4" aria-hidden />
                ) : (
                  <Circle className="size-4" aria-hidden />
                )}
                Preparing the reader
              </li>
            </ul>
            <p className="mt-4 text-fs-xs text-muted-foreground">
              This can take a minute the first time.
            </p>
          </>
        ) : null}

        {step === "ready" ? (
          <>
            <h1 className="text-fs-2xl font-extrabold text-foreground">{TTP}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <TtpStatusPill state="ready" />
              <span className="text-fs-sm text-muted-foreground">
                {settings.tapToPayDeviceLabel}
              </span>
            </div>

            <p className="mt-6 text-fs-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              How it works
            </p>
            <div className="mt-2 divide-y divide-border rounded-card border border-border bg-surface">
              {(
                [
                  { step: "cards" as const, title: "Taking a contactless card" },
                  { step: "wallets" as const, title: "Taking Apple Pay and wallets" },
                ]
              ).map((row) => (
                <Link
                  key={row.step}
                  to="/tap-to-pay/education/$step"
                  params={{ step: row.step }}
                  className="flex min-h-ctl-lg items-center gap-3 px-3 py-2 transition-colors hover:bg-muted"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-fs-sm font-bold text-foreground">
                      {row.title}
                    </span>
                    <span className="block text-fs-xs text-muted-foreground">Apple guide</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              ))}
              <div className="flex min-h-ctl-lg items-center gap-3 px-3 py-2">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-fs-sm font-bold text-foreground">
                    Terms and Conditions
                  </span>
                  <span className="block text-fs-xs text-muted-foreground">
                    Accepted{" "}
                    {new Date(
                      settings.tapToPayTermsAcceptedAt || Date.now(),
                    ).toLocaleDateString()}
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <button
                type="button"
                onClick={backToSource}
                className="h-ctl-lg w-full rounded-row bg-primary text-fs-base font-extrabold text-primary-foreground"
              >
                {fromCheckout ? "Back to the ticket" : "Done"}
              </button>
              <button
                type="button"
                onClick={() => {
                  updateSettings({ tapToPayState: "notSetUp" });
                  setStep("terms");
                }}
                className="mt-2 h-ctl-md w-full rounded-row text-fs-sm font-bold text-destructive"
              >
                Turn off on this iPhone
              </button>
            </div>
          </>
        ) : null}


        {step === "failed" ? (
          <>
            <AlertTriangle className="size-8 text-warning" aria-hidden />
            <h1 className="mt-4 text-fs-2xl font-extrabold text-foreground">Setup did not finish</h1>
            <p className="mt-2 text-fs-sm leading-relaxed text-muted-foreground">
              We could not reach the payments service. Check your connection and try again, nothing
              has been charged.
            </p>
            <div className="mt-auto pt-8">
              <button
                type="button"
                onClick={() => setStep("terms")}
                className="h-ctl-lg w-full rounded-row bg-primary text-fs-base font-extrabold text-primary-foreground"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={backToSource}
                className="mt-2 h-ctl-md w-full rounded-row text-fs-sm font-semibold text-accent"
              >
                Take payment another way
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
