import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, Check, ChevronRight, Loader2, Lock, X } from "lucide-react";
import tapToPayImage from "@/assets/tap-to-pay-iphone-card.png.asset.json";
import appleIdImage from "@/assets/tap-to-pay-apple-id-bg.png.asset.json";
import { brand } from "@/lib/brand";
import {
  TTP,
  TTP_SET_UP,
  TapToPayTermsSheet,
  TtpBenefits,
  TtpStatusPill,
  ttpCopy,
} from "@/components/pos/tap-to-pay";

import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { useRequireTapToPayDevice } from "@/lib/device";

export const Route = createFileRoute("/tap-to-pay/setup/$from")({
  validateSearch: (search: Record<string, unknown>): SetupSearch =>
    search["view"] === "ready" ? { view: "ready" } : {},
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
  | "linked"
  | "ready"
  | "failed";

type SetupSearch = {
  view?: "ready";
};

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

function LinkedSuccess({ onContinue }: { onContinue: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onContinue, 3000);
    return () => window.clearTimeout(t);
  }, [onContinue]);

  return (
    <div className="-mx-[var(--pad-screen)] -mt-5 flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="relative flex h-[13rem] shrink-0 items-center justify-center bg-black">
        <span className="grid size-24 place-items-center rounded-full border-[3px] border-[#0a84ff]">
          <Check className="size-12 text-[#0a84ff]" strokeWidth={2.5} aria-hidden />
        </span>
      </div>
      <div className="flex flex-1 flex-col items-center rounded-t-[1.75rem] bg-white px-6 pt-8">
        <h1 className="flex items-center gap-2 text-fs-2xl font-extrabold text-black">
          Account Linked
          <Check className="size-6 text-[#0a84ff]" strokeWidth={3} aria-hidden />
        </h1>
      </div>
    </div>
  );
}


function TapToPaySetup() {
  const { from } = useParams({ from: "/tap-to-pay/setup/$from" });
  const { view } = Route.useSearch();
  const navigate = useNavigate();
  const { settings, updateSettings, totals, paidSoFar, tickets } = usePos();
  const fromCheckout = from === "checkout";
  const due = Math.max(0, Math.round((totals.total - paidSoFar) * 100) / 100);

  const [step, setStep] = useState<Step>(() => (view === "ready" ? "ready" : "terms"));
  const [ttpEnabled, setTtpEnabled] = useState(true);
  const [reader, setReader] = useState(settings.cardReaderModel || DEFAULT_READER);
  const bankAccount = BANK_ACCOUNTS[0];
  const [payoutSchedule, setPayoutSchedule] = useState(PAYOUT_SCHEDULES[0]);
  const [readerSheet, setReaderSheet] = useState(false);
  const [appleIdSheet, setAppleIdSheet] = useState(false);
  const [altAppleId, setAltAppleId] = useState("");
  const [altPassword, setAltPassword] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected] = useState(false);
  const [termsSheet, setTermsSheet] = useState(false);

  const acceptedOn = settings.tapToPayTermsAcceptedAt
    ? new Date(settings.tapToPayTermsAcceptedAt).toLocaleDateString()
    : "";

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
              <div className="flex min-h-ctl-lg items-center gap-3 px-3 py-2">
                <span className="min-w-0 flex-1">
                  <span className="block text-fs-base font-bold text-foreground">Bank account</span>
                  <span className="block text-fs-sm text-muted-foreground">Select bank account</span>
                </span>
                <span className="max-w-[9rem] shrink-0 truncate text-fs-sm font-semibold text-muted-foreground">
                  {bankAccount}
                </span>
              </div>
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
          <div className="-mx-[var(--pad-screen)] -mt-5 flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="relative shrink-0 bg-black">
              <button
                type="button"
                onClick={() => setStep("payments")}
                className="absolute left-4 top-4 z-10 text-fs-sm font-semibold text-white"
              >
                Cancel
              </button>
              <img
                src={appleIdImage.url}
                alt="Tap to Pay on iPhone contactless symbol on black background"
                className="aspect-video w-full object-contain"
              />
            </div>
            <div className="flex flex-1 flex-col rounded-t-[1.75rem] bg-white px-6 pb-6 pt-7">
              <h1 className="text-center text-fs-2xl font-extrabold text-black">{TTP}</h1>
              <p className="mt-3 text-center text-fs-sm leading-relaxed text-neutral-600">
                Accept payments from contactless credit and debit cards, Apple Pay, or other
                contactless payment devices using only your iPhone.
              </p>
              <p className="mt-4 text-center text-fs-sm leading-relaxed text-neutral-600">
                Your business information will be shared with Apple and linked to
                antonio1568silva@gmail.com.
              </p>
              <button
                type="button"
                onClick={() => setTermsSheet(true)}
                className="mt-4 block w-full text-center text-fs-sm font-semibold text-[#0a84ff]"
              >
                {TTP} Terms and Conditions
              </button>
              <p className="mt-auto pt-8 text-center text-fs-sm font-semibold text-[#0a84ff]">
                About {TTP} &amp; Privacy...
              </p>
              <button
                type="button"
                onClick={() => setTermsSheet(true)}
                className="mt-4 h-ctl-lg w-full rounded-row bg-black text-fs-base font-extrabold text-white"
              >
                Continue with This Apple ID
              </button>
              <button
                type="button"
                onClick={() => setAppleIdSheet(true)}
                className="mt-2 h-ctl-md w-full rounded-row text-fs-sm font-semibold text-[#0a84ff]"
              >
                Use a Different Apple ID
              </button>
            </div>
          </div>
        ) : null}


        <TapToPayTermsSheet
          open={termsSheet}
          onOpenChange={setTermsSheet}
          onAgree={() => {
            updateSettings({ tapToPayTermsAcceptedAt: new Date().toISOString() });
            setTermsSheet(false);
            if (step === "appleId") setStep("linked");
          }}
        />

        {step === "linked" ? (
          <LinkedSuccess onContinue={() => setStep("ready")} />
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
              <button
                type="button"
                onClick={() => setTermsSheet(true)}
                className="flex min-h-ctl-lg w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted"
              >
                <span className="min-w-0 flex-1 truncate text-fs-sm font-bold text-foreground">
                  Terms and Conditions
                </span>
                {acceptedOn ? (
                  <span className="shrink-0 text-fs-sm text-muted-foreground">
                    Accepted {acceptedOn}
                  </span>
                ) : null}
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              </button>
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
                onClick={() => navigate({ to: "/tap-to-pay/turn-off" })}
                className="mt-2 h-ctl-md w-full rounded-row text-fs-sm font-bold text-destructive"
              >
                Turn off on this iPhone
              </button>
            </div>
          </>
        ) : null}


        {step === "failed" ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="flex flex-col items-center justify-center">
              <AlertTriangle className="size-16 text-warning" aria-hidden />
              <h1 className="mt-4 text-fs-2xl font-extrabold text-foreground">Setup did not finish</h1>
              <p className="mt-2 max-w-[22rem] text-fs-base leading-relaxed text-muted-foreground">
                We could not reach the payments service. Check your connection and try again, nothing
                has been charged.
              </p>
              <div className="mt-8 w-full">
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
            </div>
          </div>
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

      {appleIdSheet ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            type="button"
            aria-label="Close Apple ID sign in"
            onClick={() => setAppleIdSheet(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative mx-auto w-full max-w-[34rem] rounded-t-[1.75rem] border border-b-0 border-border bg-white px-6 pb-[calc(1.5rem+var(--tabs-h,0px))] pt-6 elev-1">
            <h2 className="text-center text-fs-xl font-extrabold text-black">
              Sign in with your Apple ID
            </h2>
            <p className="mx-auto mt-2 max-w-[20rem] text-center text-fs-sm leading-relaxed text-neutral-500">
              This lets you use {TTP} with a different Apple account.
            </p>
            <input
              type="email"
              inputMode="email"
              autoComplete="username"
              value={altAppleId}
              onChange={(e) => setAltAppleId(e.target.value)}
              placeholder="Email or phone number"
              className="mt-5 h-ctl-lg w-full rounded-row border border-neutral-200 bg-transparent px-4 text-fs-base text-black placeholder:text-neutral-400"
            />
            <input
              type="password"
              autoComplete="current-password"
              value={altPassword}
              onChange={(e) => setAltPassword(e.target.value)}
              placeholder="Password"
              className="mt-3 h-ctl-lg w-full rounded-row border border-neutral-200 bg-transparent px-4 text-fs-base text-black placeholder:text-neutral-400"
            />
            <p className="mt-3 text-right text-fs-sm font-semibold text-[#0a84ff]">
              Forgot Apple ID or password?
            </p>
            <button
              type="button"
              onClick={() => {
                setAppleIdSheet(false);
                setTermsSheet(true);
              }}
              className="mt-5 h-ctl-lg w-full rounded-row bg-black text-fs-base font-extrabold text-white"
            >
              Sign in
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
