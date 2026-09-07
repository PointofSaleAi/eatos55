import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Circle, Lock } from "lucide-react";
import tapToPayImage from "@/assets/tap-to-pay-iphone-card.png.asset.json";
import { brand } from "@/lib/brand";
import { TTP, TapToPayMark, TTP_SET_UP, TtpBenefits, ttpCopy } from "@/components/pos/tap-to-pay";
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

type Step = "passcode" | "terms" | "configuring" | "ready" | "failed";

function TapToPaySetup() {
  const { from } = useParams({ from: "/tap-to-pay/setup/$from" });
  const navigate = useNavigate();
  const { settings, updateSettings, totals, paidSoFar, tickets } = usePos();
  const fromCheckout = from === "checkout";
  const due = Math.max(0, Math.round((totals.total - paidSoFar) * 100) / 100);

  // Demo pre-flight: a device with no passcode cannot be configured.
  const [step, setStep] = useState<Step>("terms");
  const [prepared, setPrepared] = useState(false);

  useEffect(() => {
    if (step !== "configuring") return;
    const t = setTimeout(() => setPrepared(true), 900);
    const done = setTimeout(() => {
      updateSettings({ tapToPayState: "ready" });
      setStep("ready");
    }, 1600);
    return () => {
      clearTimeout(t);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const backToSource = () => {
    if (fromCheckout) navigate({ to: "/payment/method" });
    else if (from === "settings") navigate({ to: "/settings/tap-to-pay" });
    else navigate({ to: "/tickets" });
  };

  const acceptTerms = () => {
    updateSettings({
      tapToPayTermsAcceptedAt: new Date().toISOString(),
      tapToPayState: "configuring",
    });
    setStep("configuring");
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
            <CheckCircle2 className="size-8 text-success" aria-hidden />
            <h1 className="mt-4 text-fs-2xl font-extrabold text-foreground">{TTP} is ready</h1>
            <p className="mt-2 text-fs-sm leading-relaxed text-muted-foreground">
              This iPhone can now take contactless cards and digital wallets. Terms accepted on{" "}
              {new Date(settings.tapToPayTermsAcceptedAt || Date.now()).toLocaleDateString()}.
            </p>
            <div className="mt-auto pt-8">
              {/* Requirement 4.1: education opens immediately, no extra tap needed. */}
              <Link
                to="/tap-to-pay/education/$step"
                params={{ step: "cards" }}
                className="flex h-ctl-lg w-full items-center justify-center rounded-row bg-primary text-fs-base font-extrabold text-primary-foreground"
              >
                See how to take a payment
              </Link>
              <button
                type="button"
                onClick={backToSource}
                className="mt-2 h-ctl-md w-full rounded-row text-fs-sm font-semibold text-accent"
              >
                {fromCheckout ? "Back to the ticket" : "Done"}
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
