import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Lock } from "lucide-react";
import { brand } from "@/lib/brand";
import { TTP } from "@/components/pos/tap-to-pay";
import { tapToPayTerms } from "@/lib/tap-to-pay-terms";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/tap-to-pay/activate")({
  head: () => ({
    meta: [
      { title: `${TTP} Platform Terms and Conditions - ${brand.appName}` },
      {
        name: "description",
        content:
          "Read and accept the Tap to Pay on iPhone Platform Terms and Conditions, then prepare this iPhone to take contactless cards and digital wallets.",
      },
      { property: "og:title", content: `${TTP} Platform Terms and Conditions - ${brand.appName}` },
      {
        property: "og:description",
        content: "Accept the Apple terms, then finish preparing this iPhone for card payments.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TapToPayActivate,
});

type Step = "terms" | "passcode" | "configuring" | "ready" | "failed";

const PROGRESS_STEPS = [
  "Checked this iPhone",
  "Linked your merchant account",
  "Preparing the reader…",
];

function TapToPayActivate() {
  const navigate = useNavigate();
  const { settings, updateSettings } = usePos();
  const [step, setStep] = useState<Step>("terms");
  const [done, setDone] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const bodyTerms = useMemo(() => {
    const footerIndex = tapToPayTerms.findIndex(
      (b) => b.tag === "h2" && b.text === "Apple Footer",
    );
    return footerIndex >= 0 ? tapToPayTerms.slice(0, footerIndex) : tapToPayTerms;
  }, []);

  useEffect(() => {
    const clear = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    clear();
    if (step === "configuring") {
      setDone(0);
      timers.current.push(setTimeout(() => setDone(1), 900));
      timers.current.push(setTimeout(() => setDone(2), 1900));
      timers.current.push(
        setTimeout(() => {
          setDone(3);
          updateSettings({ tapToPayState: "ready" });
          setStep("ready");
        }, 2900),
      );
    }
    if (step === "ready") {
      timers.current.push(setTimeout(() => setStep("failed"), 5000));
    }
    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const primary =
    "h-ctl-lg w-full rounded-row bg-primary text-fs-base font-extrabold text-primary-foreground";
  const secondary = "mt-2 h-ctl-md w-full rounded-row text-fs-sm font-semibold text-accent";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background px-[var(--pad-screen)] pb-[calc(1rem+var(--tabs-h,0px))] pt-5">
      <div className="mx-auto flex w-full max-w-[34rem] flex-1 flex-col">
        {step === "terms" ? (
          <>
            <h1 className="text-left text-fs-2xl font-extrabold leading-tight text-foreground">
              {TTP}
              <br />
              Terms and Conditions
            </h1>
            <div className="mt-5 flex-1 space-y-3">
              {bodyTerms.map((b, i) =>
                b.tag === "h2" || b.tag === "h3" || b.tag === "h1" ? (
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
            <div className="sticky bottom-0 mt-6 flex items-center justify-between gap-3 border-t border-border bg-background py-3">
              <button
                type="button"
                onClick={() => navigate({ to: "/settings/tap-to-pay" })}
                className="h-ctl-md rounded-row px-2 text-fs-base font-semibold text-foreground"
              >
                Disagree
              </button>
              <button
                type="button"
                onClick={() => {
                  updateSettings({ tapToPayTermsAcceptedAt: new Date().toISOString() });
                  setStep("passcode");
                }}
                className="h-ctl-md rounded-row px-2 text-fs-base font-extrabold text-accent"
              >
                Agree
              </button>
            </div>
          </>
        ) : null}

        {step === "passcode" ? (
          <div className="flex flex-1 flex-col items-center text-center">
            <Lock className="mt-6 size-8 text-foreground" aria-hidden />
            <h1 className="mt-4 text-fs-2xl font-extrabold text-foreground">Set a passcode first</h1>
            <p className="mt-2 max-w-[22rem] text-fs-base leading-relaxed text-muted-foreground">
              {TTP} needs a device passcode. Add one in the iPhone Settings app, then come back.
            </p>
            <div className="mt-auto w-full pt-8">
              <button type="button" onClick={() => setStep("configuring")} className={primary}>
                Open iPhone Settings
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/settings/tap-to-pay" })}
                className={secondary}
              >
                Back
              </button>
            </div>
          </div>
        ) : null}

        {step === "configuring" ? (
          <>
            <h1 className="text-fs-2xl font-extrabold leading-tight text-foreground">
              Setting up {TTP}
            </h1>
            <p className="mt-2 text-fs-base leading-relaxed text-muted-foreground">
              Keep this iPhone unlocked and connected.
            </p>
            <div
              className="mt-5 h-2 w-full overflow-hidden rounded-pill bg-muted"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={3}
              aria-valuenow={done}
            >
              <span
                className="block h-full rounded-pill bg-accent transition-all duration-500"
                style={{ width: `${Math.max(8, (done / 3) * 100)}%` }}
              />
            </div>
            <ul className="mt-5 space-y-3">
              {PROGRESS_STEPS.map((label, i) => (
                <li
                  key={label}
                  className={
                    i < done
                      ? "flex items-center gap-2 text-fs-base font-semibold text-success"
                      : "flex items-center gap-2 text-fs-base text-muted-foreground"
                  }
                >
                  <span aria-hidden>{i < done ? "✓" : "◦"}</span>
                  {label}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {step === "ready" ? (
          <div className="flex flex-1 flex-col items-center text-center">
            <CheckCircle2 className="mt-6 size-9 text-success" aria-hidden />
            <h1 className="mt-4 text-fs-2xl font-extrabold leading-tight text-foreground">
              {TTP} is ready
            </h1>
            <p className="mt-2 max-w-[22rem] text-fs-base leading-relaxed text-muted-foreground">
              This iPhone can now take contactless cards and digital wallets.
            </p>
            <div className="mt-auto w-full pt-8">
              <button
                type="button"
                onClick={() =>
                  navigate({ to: "/tap-to-pay/education/$step", params: { step: "1" } })
                }
                className={primary}
              >
                See how to take a payment
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/payment/method" })}
                className={secondary}
              >
                Back to the ticket
              </button>
            </div>
          </div>
        ) : null}

        {step === "failed" ? (
          <div className="flex flex-1 flex-col items-center text-center">
            <AlertTriangle className="mt-6 size-9 text-warning" aria-hidden />
            <h1 className="mt-4 text-fs-2xl font-extrabold text-foreground">
              Setup didn&apos;t finish
            </h1>
            <p className="mt-2 max-w-[22rem] text-fs-base leading-relaxed text-muted-foreground">
              We couldn&apos;t reach the payments service. Check your connection and try again,
              nothing has been charged.
            </p>
            <div className="mt-auto w-full pt-8">
              <button type="button" onClick={() => setStep("configuring")} className={primary}>
                Try again
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/payment/method" })}
                className={secondary}
              >
                Take payment another way
              </button>
            </div>
          </div>
        ) : null}

        {settings.tapToPayDeviceLabel && step === "ready" ? null : null}
      </div>
    </div>
  );
}
