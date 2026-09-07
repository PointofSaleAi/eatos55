import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronRight, Loader2, Lock, X } from "lucide-react";
import tapToPayImage from "@/assets/tap-to-pay-iphone-card.png.asset.json";
import appleIdVideo from "@/assets/tap-to-pay-apple-id.mp4.asset.json";
import { brand } from "@/lib/brand";
import { TTP, TTP_SET_UP, TtpBenefits, TtpStatusPill, ttpCopy } from "@/components/pos/tap-to-pay";
import { tapToPayTerms } from "@/lib/tap-to-pay-terms";

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

type Step =
  | "passcode"
  | "terms"
  | "payments"
  | "appleId"
  | "appleTerms"
  | "linked"
  | "ready"
  | "failed";

const READERS = [
  "Adyen Terminal",
  "Adyen NYC1 Bluetooth",
  "Adyen Tap to Pay NFC",
  "CardConnect",
  "Stripe Tap to Pay NFC",
  "Stripe",
  "IdTech",
];
const DEFAULT_READER = "Adyen Tap to Pay NFC";
const BANK_ACCOUNTS = ["Barclays ····4471", "HSBC ····8820", "Lloyds ····1093"];
const PAYOUT_SCHEDULES = ["Daily", "Weekly", "Monthly"];

function TapToPaySetup() {
  const { from } = useParams({ from: "/tap-to-pay/setup/$from" });
  const navigate = useNavigate();
  const { settings, updateSettings, totals, paidSoFar, tickets } = usePos();
  const fromCheckout = from === "checkout";
  const due = Math.max(0, Math.round((totals.total - paidSoFar) * 100) / 100);

  const [step, setStep] = useState<Step>("terms");
  const [ttpEnabled, setTtpEnabled] = useState(true);
  const [reader, setReader] = useState(settings.cardReaderModel || DEFAULT_READER);
  const [bankAccount, setBankAccount] = useState(BANK_ACCOUNTS[0]);
  const [payoutSchedule, setPayoutSchedule] = useState(PAYOUT_SCHEDULES[0]);
  const [readerSheet, setReaderSheet] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected] = useState(false);

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
    setStep("payments");
  };

  const confirmPayments = () => {
    updateSettings({
      cardReaderModel: reader || "",
      tapToPayState: ttpEnabled ? "ready" : "notSetUp",
    });
    setStep("appleId");
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

        {step === "payments" ? (
          <>
            <h1 className="text-center text-fs-2xl font-extrabold text-foreground">Payments</h1>

            <p className="mt-6 text-fs-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Taking payment
            </p>
            <div className="mt-2 divide-y divide-border rounded-card border border-border bg-surface">
              <div className="flex min-h-ctl-lg items-center gap-3 px-3 py-2">
                <span className="min-w-0 flex-1">
                  <span className="block text-fs-base font-bold text-foreground">{TTP}</span>
                  <span className="block text-fs-sm text-muted-foreground">
                    Use this iPhone as your card reader
                  </span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={ttpEnabled}
                  aria-label={`Enable ${TTP}`}
                  onClick={() => setTtpEnabled((v) => !v)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                    ttpEnabled ? "bg-accent" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 size-6 rounded-full bg-white transition-all ${
                      ttpEnabled ? "left-[1.375rem]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setReaderSheet(true)}
                className="flex min-h-ctl-lg w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-fs-base font-bold text-foreground">Card reader</span>
                  <span className="block text-fs-sm text-muted-foreground">
                    {detected ? "Reader detected" : "Select your card reader"}
                  </span>
                </span>
                <span className="max-w-[9rem] shrink-0 truncate text-fs-sm font-semibold text-muted-foreground">
                  {reader}
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              </button>
            </div>

            <p className="mt-6 text-fs-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Payouts
            </p>
            <div className="mt-2 divide-y divide-border rounded-card border border-border bg-surface">
              <label className="flex min-h-ctl-lg items-center gap-3 px-3 py-2">
                <span className="min-w-0 flex-1">
                  <span className="block text-fs-base font-bold text-foreground">Bank account</span>
                  <span className="block text-fs-sm text-muted-foreground">Select bank account</span>
                </span>
                <select
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="max-w-[9rem] shrink-0 truncate bg-transparent text-fs-sm font-semibold text-muted-foreground"
                >
                  {BANK_ACCOUNTS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex min-h-ctl-lg items-center gap-3 px-3 py-2">
                <span className="min-w-0 flex-1">
                  <span className="block text-fs-base font-bold text-foreground">
                    Payout schedule
                  </span>
                  <span className="block text-fs-sm text-muted-foreground">How often you are paid</span>
                </span>
                <select
                  value={payoutSchedule}
                  onChange={(e) => setPayoutSchedule(e.target.value)}
                  className="max-w-[9rem] shrink-0 truncate bg-transparent text-fs-sm font-semibold text-muted-foreground"
                >
                  {PAYOUT_SCHEDULES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-auto pt-8">
              <button
                type="button"
                onClick={confirmPayments}
                className="h-ctl-lg w-full rounded-row bg-primary text-fs-base font-extrabold text-primary-foreground"
              >
                Manage your Apple ID
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

        {step === "appleId" ? (
          <>
            <button
              type="button"
              onClick={() => setStep("payments")}
              className="self-start text-fs-sm font-semibold text-accent"
            >
              Cancel
            </button>
            <div className="mt-3 overflow-hidden rounded-card bg-white">
              <video
                src={appleIdVideo.url}
                className="aspect-video w-full object-contain"
                autoPlay
                muted
                loop
                playsInline
              />
            </div>
            <div className="mt-3 rounded-sheet border border-border bg-surface px-4 pb-5 pt-6 elev-1">
              <h1 className="text-center text-fs-2xl font-extrabold text-foreground">{TTP}</h1>
              <p className="mt-2 text-center text-fs-sm leading-relaxed text-muted-foreground">
                Accept payments from contactless credit and debit cards, Apple Pay, or other
                contactless payment devices using only your iPhone.
              </p>
              <p className="mt-4 text-center text-fs-sm leading-relaxed text-muted-foreground">
                Your business information will be shared with Apple and linked to{" "}
                antonio1568silva@gmail.com.
              </p>
              <button
                type="button"
                onClick={() => setStep("appleTerms")}
                className="mt-4 block w-full text-center text-fs-sm font-semibold text-accent"
              >
                {TTP} Terms and Conditions
              </button>
              <p className="mt-8 text-center text-fs-sm font-semibold text-accent">
                About {TTP} &amp; Privacy...
              </p>
              <button
                type="button"
                onClick={() => setStep("appleTerms")}
                className="mt-4 h-ctl-lg w-full rounded-row bg-primary text-fs-base font-extrabold text-primary-foreground"
              >
                Continue with This Apple ID
              </button>
              <button
                type="button"
                onClick={() => setStep("appleTerms")}
                className="mt-2 h-ctl-md w-full rounded-row text-fs-sm font-semibold text-accent"
              >
                Use a Different Apple ID
              </button>
            </div>
          </>
        ) : null}

        {step === "appleTerms" ? (
          <>
            <h1 className="text-left text-fs-2xl font-extrabold leading-tight text-foreground">
              {TTP}
              <br />
              Terms and Conditions
            </h1>
            <div className="mt-5 flex-1 space-y-3">
              {termsBody.map((b, i) =>
                b.tag === "h1" || b.tag === "h2" || b.tag === "h3" ? (
                  <h2
                    key={i}
                    className="pt-3 text-fs-lg font-extrabold leading-snug text-foreground"
                  >
                    {b.text}
                  </h2>
                ) : b.tag === "h4" ? (
                  <h3 key={i} className="pt-2 text-fs-base font-bold text-foreground">
                    {b.text}
                  </h3>
                ) : b.tag === "li" ? (
                  <p
                    key={i}
                    className="pl-4 text-fs-sm leading-relaxed text-muted-foreground before:mr-2 before:content-['•']"
                  >
                    {b.text}
                  </p>
                ) : (
                  <p key={i} className="text-fs-sm leading-relaxed text-muted-foreground">
                    {b.text}
                  </p>
                ),
              )}
            </div>
            <div className="mt-auto flex items-center gap-3 border-t border-border bg-background pt-3">
              <button
                type="button"
                onClick={() => setStep("appleId")}
                className="h-ctl-md flex-1 rounded-row bg-muted text-fs-base font-semibold text-foreground"
              >
                Disagree
              </button>
              <button
                type="button"
                onClick={() => {
                  updateSettings({ tapToPayTermsAcceptedAt: new Date().toISOString() });
                  setStep("linked");
                }}
                className="h-ctl-md flex-1 rounded-row bg-primary text-fs-base font-extrabold text-primary-foreground"
              >
                Agree
              </button>
            </div>
          </>
        ) : null}

        {step === "linked" ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <CheckCircle2 className="size-16 text-success" aria-hidden />
            <h1 className="mt-4 text-fs-2xl font-extrabold leading-tight text-foreground">
              Your account is linked
            </h1>
            <p className="mt-2 max-w-[22rem] text-fs-base leading-relaxed text-muted-foreground">
              This Apple ID is now linked to {brand.appName}. You can start taking contactless cards
              and digital wallets on this iPhone.
            </p>
            <div className="mt-auto w-full pt-8">
              <button
                type="button"
                onClick={() => setStep("ready")}
                className="h-ctl-lg w-full rounded-row bg-primary text-fs-base font-extrabold text-primary-foreground"
              >
                Continue
              </button>
            </div>
          </div>
        ) : null}

        {step === "ready" ? (
          <>
            <div className="overflow-hidden rounded-sheet border border-border bg-surface p-1 elev-1">
              <img
                src={tapToPayImage.url}
                alt="Contactless card held near an iPhone for Tap to Pay on iPhone"
                className="aspect-[16/11] w-full rounded-card object-cover"
                loading="lazy"
              />
            </div>

            <h1 className="mt-6 text-fs-2xl font-extrabold text-foreground">{TTP}</h1>
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
              {[
                { step: "1", title: "Taking a contactless card" },
                { step: "2", title: "Taking Apple Pay and wallets" },
                { step: "3", title: "Apple Pay on Apple Watch" },
                { step: "5", title: "Secure PIN Entry" },
              ].map((row) => (
                <Link
                  key={row.step}
                  to="/tap-to-pay/education/$step"
                  params={{ step: row.step }}
                  className="flex min-h-ctl-lg items-center gap-3 px-3 py-2 transition-colors hover:bg-muted"
                >
                  <span className="min-w-0 flex-1 truncate text-fs-sm font-bold text-foreground">
                    {row.title}
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              ))}
              <div className="flex min-h-ctl-lg items-center gap-3 px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-fs-sm font-bold text-foreground">
                  Terms and Conditions
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              </div>
            </div>


            <div className="mt-auto pt-8">
              <button
                type="button"
                onClick={() =>
                  navigate({ to: "/tap-to-pay/education/$step", params: { step: "1" } })
                }
                className="h-ctl-lg w-full rounded-row bg-primary text-fs-base font-extrabold text-primary-foreground"
              >
                Continue
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

      {readerSheet ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            type="button"
            aria-label="Close card reader list"
            onClick={() => setReaderSheet(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative mx-auto w-full max-w-[34rem] rounded-t-sheet bg-surface pb-[calc(1rem+var(--tabs-h,0px))] pt-2 elev-1">
            <div className="mx-auto h-1.5 w-10 rounded-pill bg-border" aria-hidden />
            <div className="flex items-center justify-between px-4 py-3">
              <h2 className="text-fs-base font-extrabold text-foreground">
                Select Card Reader Type
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setReaderSheet(false)}
                className="grid size-8 place-items-center rounded-pill text-muted-foreground transition-colors hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="max-h-[50vh] divide-y divide-border overflow-y-auto">
              {READERS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setReader(r);
                    setDetected(false);
                  }}
                  className="flex min-h-ctl-lg w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-muted"
                >
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${
                      reader === r ? "border-accent" : "border-border"
                    }`}
                  >
                    {reader === r ? (
                      <span className="size-2.5 rounded-full bg-accent" aria-hidden />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-fs-sm font-bold text-foreground">
                    {r}
                  </span>
                </button>
              ))}
            </div>
            <div className="px-4 pt-3">
              <button
                type="button"
                disabled={detecting}
                onClick={() => {
                  setDetecting(true);
                  setDetected(false);
                  window.setTimeout(() => {
                    setDetecting(false);
                    setDetected(true);
                    setReaderSheet(false);
                  }, 1800);
                }}
                className="flex h-ctl-lg w-full items-center justify-center gap-2 rounded-row bg-primary text-fs-base font-extrabold uppercase tracking-[0.08em] text-primary-foreground disabled:opacity-70"
              >
                {detecting ? (
                  <>
                    <Loader2 className="size-5 animate-spin" aria-hidden />
                    Detecting
                  </>
                ) : (
                  "Detect"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
