import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { brand } from "@/lib/brand";
import { TTP } from "@/components/pos/tap-to-pay";
import { usePos } from "@/lib/pos-store";
import { useRequireTapToPayDevice } from "@/lib/device";

export const Route = createFileRoute("/tap-to-pay/turn-off")({
  head: () => ({
    meta: [
      { title: `Turn off ${TTP} - ${brand.appName}` },
      {
        name: "description",
        content:
          "Turn off Tap to Pay on iPhone for this device. Contactless payments stop on this iPhone and it can be set up again at any time.",
      },
      { property: "og:title", content: `Turn off ${TTP} - ${brand.appName}` },
      {
        property: "og:description",
        content: "Stop taking contactless payments on this iPhone. You can set it up again later.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TapToPayTurnOff,
});

type Step = "confirm" | "turningOff" | "done" | "failed";

/**
 * Merchant-owned turn off screens. These are deliberately our own UI, not a
 * copy of any Apple system sheet, and they never state what Apple does with
 * the Apple ID or the device link.
 *
 * iOS team: the turn off step must call the real Apple deactivate/unlink API
 * and the resulting state belongs server side per merchant, the same as the
 * setup proof, so a reinstall cannot erase it.
 */
const POINTS = [
  "This iPhone stops taking contactless cards and digital wallets.",
  "Payments you have already taken are not affected.",
  "You can set up Tap to Pay on iPhone again at any time.",
  "Anything to do with your Apple ID is managed in the iPhone Settings app.",
];

function TapToPayTurnOff() {
  useRequireTapToPayDevice();
  const navigate = useNavigate();
  const { updateSettings, canManageSettings } = usePos();
  const [step, setStep] = useState<Step>("confirm");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!canManageSettings) navigate({ to: "/settings/tap-to-pay", replace: true });
  }, [canManageSettings, navigate]);

  useEffect(() => {
    const clear = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    clear();
    if (step === "turningOff") {
      timers.current.push(
        setTimeout(() => {
          updateSettings({ tapToPayState: "notSetUp" });
          setStep("done");
        }, 1600),
      );
    }
    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const backToSettings = () => navigate({ to: "/settings/tap-to-pay" });
  const primary =
    "h-ctl-lg w-full rounded-row bg-primary text-fs-base font-extrabold text-primary-foreground";
  const secondary = "mt-2 h-ctl-md w-full rounded-row text-fs-sm font-semibold text-accent";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background px-[var(--pad-screen)] pb-[calc(1rem+var(--tabs-h,0px))] pt-5">
      <div className="mx-auto flex w-full max-w-[34rem] flex-1 flex-col">
        {step === "confirm" ? (
          <>
            <h1 className="text-fs-2xl font-extrabold leading-tight text-foreground">
              Turn off {TTP}
            </h1>
            <div className="mt-5 space-y-3 rounded-card border border-border bg-surface p-4">
              {POINTS.map((point) => (
                <p
                  key={point}
                  className="pl-4 text-fs-sm leading-relaxed text-muted-foreground before:mr-2 before:content-['•']"
                >
                  {point}
                </p>
              ))}
            </div>
            <div className="mt-auto pt-8">
              <button
                type="button"
                onClick={() => setStep("turningOff")}
                className="h-ctl-lg w-full rounded-row bg-destructive text-fs-base font-extrabold text-destructive-foreground"
              >
                Turn Off
              </button>
              <button type="button" onClick={backToSettings} className={secondary}>
                Cancel
              </button>
            </div>
          </>
        ) : null}

        {step === "turningOff" ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h1 className="text-fs-2xl font-extrabold leading-tight text-foreground">
              Turning off {TTP}
            </h1>
            <p className="mt-2 max-w-[22rem] text-fs-base leading-relaxed text-muted-foreground">
              Keep this iPhone unlocked and connected.
            </p>
            <div
              className="mt-5 h-2 w-full max-w-[22rem] overflow-hidden rounded-pill bg-muted"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={1}
            >
              <span className="block h-full w-1/2 animate-pulse rounded-pill bg-accent" />
            </div>
          </div>
        ) : null}

        {step === "done" ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <CheckCircle2 className="size-16 text-success" aria-hidden />
            <h1 className="mt-4 text-fs-2xl font-extrabold leading-tight text-foreground">
              {TTP} is off on this iPhone
            </h1>
            <p className="mt-2 max-w-[22rem] text-fs-base leading-relaxed text-muted-foreground">
              This iPhone no longer takes contactless cards or digital wallets. You can set it up
              again whenever you need it.
            </p>
            <div className="mt-8 w-full max-w-[22rem]">
              <button type="button" onClick={backToSettings} className={primary}>
                Done
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate({ to: "/tap-to-pay/setup/$from", params: { from: "settings" } })
                }
                className={secondary}
              >
                Set Up Again
              </button>
            </div>
          </div>
        ) : null}

        {step === "failed" ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <AlertTriangle className="size-16 text-warning" aria-hidden />
            <h1 className="mt-4 text-fs-2xl font-extrabold text-foreground">
              We could not turn it off
            </h1>
            <p className="mt-2 max-w-[22rem] text-fs-base leading-relaxed text-muted-foreground">
              Check your connection and try again. {TTP} is still on for this device.
            </p>
            <div className="mt-8 w-full max-w-[22rem]">
              <button type="button" onClick={() => setStep("turningOff")} className={primary}>
                Try again
              </button>
              <button type="button" onClick={backToSettings} className={secondary}>
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
