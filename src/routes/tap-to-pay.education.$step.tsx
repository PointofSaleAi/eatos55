import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { AppleAssetSlot, TTP } from "@/components/pos/tap-to-pay";

export const Route = createFileRoute("/tap-to-pay/education/$step")({
  head: () => ({
    meta: [
      { title: `How to use ${TTP} - ${brand.appName} Point of Sale` },
      {
        name: "description",
        content:
          "Apple's own merchant education for Tap to Pay on iPhone: taking a contactless card, then taking Apple Pay and other digital wallets.",
      },
      { property: "og:title", content: `How to use ${TTP} - ${brand.appName} Point of Sale` },
      {
        property: "og:description",
        content: "Taking a contactless card, then taking Apple Pay and other digital wallets.",
      },
    ],
  }),
  component: TapToPayEducation,
});

/**
 * Screens 13 and 14. On iOS these are Apple's own system screens, presented
 * through ProximityReaderDiscovery, so no copy or artwork of ours appears here
 * (requirement 4.3). We only decide when they are shown.
 */
const steps = {
  cards: {
    title: "Taking a contactless card",
    detail:
      "Apple education content for .payment(.howToTap), drawn by iOS. Requirement 4.4: this must show how a contactless card is accepted.",
    next: "wallets" as const,
  },
  wallets: {
    title: "Taking Apple Pay and digital wallets",
    detail:
      "Apple education content from ProximityReaderDiscovery contentList. Requirement 4.5: Apple Pay, Apple Watch and other digital wallets.",
    next: null,
  },
};

function TapToPayEducation() {
  const { step } = useParams({ from: "/tap-to-pay/education/$step" });
  const navigate = useNavigate();
  const current = steps[step === "wallets" ? "wallets" : "cards"];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background px-[var(--pad-screen)] pb-[calc(1rem+var(--tabs-h,0px))] pt-5">
      <div className="mx-auto flex w-full max-w-[34rem] flex-1 flex-col">
        <p className="text-fs-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {TTP}
        </p>
        <h1 className="mt-1 text-fs-xl font-extrabold text-foreground">{current.title}</h1>

        <AppleAssetSlot
          label={current.title}
          detail={current.detail}
          className="mt-4 min-h-[16rem]"
        />

        <div className="mt-auto pt-8">
          {current.next ? (
            <Link
              to="/tap-to-pay/education/$step"
              params={{ step: current.next }}
              className="flex h-ctl-lg w-full items-center justify-center rounded-row bg-primary text-fs-base font-extrabold text-primary-foreground"
            >
              Next
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => navigate({ to: "/settings/tap-to-pay" })}
              className="h-ctl-lg w-full rounded-row bg-primary text-fs-base font-extrabold text-primary-foreground"
            >
              Done
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate({ to: "/tickets" })}
            className="mt-2 h-ctl-md w-full rounded-row text-fs-sm font-semibold text-accent"
          >
            Back to tickets
          </button>
        </div>
      </div>
    </div>
  );
}
