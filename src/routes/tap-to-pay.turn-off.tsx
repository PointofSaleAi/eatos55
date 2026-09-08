import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { brand } from "@/lib/brand";
import { TTP } from "@/components/pos/tap-to-pay";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { usePos } from "@/lib/pos-store";

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

const POINTS = [
  "This iPhone stops accepting contactless cards and digital wallets.",
  "Your linked Apple ID and merchant account stay linked.",
  "Payments you have already taken are not affected.",
  "You can set up Tap to Pay on iPhone again at any time.",
];

function TapToPayTurnOff() {
  const navigate = useNavigate();
  const { updateSettings } = usePos();
  const [step, setStep] = useState<Step>("confirm");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

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
              {TTP} is turned off
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
              Check your connection and try again. Tap to Pay on iPhone is still on for this device.
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

      <Sheet
        open={step === "confirm"}
        onOpenChange={(open) => {
          if (!open) backToSettings();
        }}
      >
        <SheetContent
          hideClose
          side="bottom"
          className="flex h-[100dvh] flex-col overflow-hidden rounded-t-[1.75rem] border-t border-border bg-white px-5 pb-[calc(1rem+var(--safe-bottom,0px))] pt-7"
        >
          <SheetTitle className="text-left text-fs-2xl font-extrabold leading-tight text-black">
            Turn off {TTP}?
          </SheetTitle>
          <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1">
            {POINTS.map((point) => (
              <p
                key={point}
                className="pl-4 text-fs-sm leading-relaxed text-neutral-600 before:mr-2 before:content-['•']"
              >
                {point}
              </p>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-3 pt-4">
            <button
              type="button"
              onClick={backToSettings}
              className="h-ctl-md flex-1 rounded-full border border-neutral-300 bg-white text-fs-base font-bold text-[#0a84ff]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setStep("turningOff")}
              className="h-ctl-md flex-1 rounded-full border border-neutral-300 bg-white text-fs-base font-bold text-[#ff3b30]"
            >
              Turn Off
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
