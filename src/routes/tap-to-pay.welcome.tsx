import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { CreditCard } from "lucide-react";
import tapToPayImage from "@/assets/tap-to-pay-iphone-card.png.asset.json";
import { brand } from "@/lib/brand";
import {
  TTP,
  TTP_SET_UP,
  TtpBenefits,
  ttpCopy,
} from "@/components/pos/tap-to-pay";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/tap-to-pay/welcome")({
  head: () => ({
    meta: [
      { title: `${TTP} - ${brand.appName} Point of Sale` },
      {
        name: "description",
        content:
          "Turn this iPhone into a card reader: accept contactless cards, Apple Pay and digital wallets with Tap to Pay on iPhone.",
      },
      { property: "og:title", content: `${TTP} - ${brand.appName} Point of Sale` },
      {
        property: "og:description",
        content: "Accept contactless cards, Apple Pay and digital wallets on this iPhone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TapToPayWelcome,
});

/**
 * Screen 01: awareness takeover. Shown automatically, once, to every eligible
 * venue (requirements 3.1, 3.3, 3.5). Not a banner: it owns the screen.
 */
function TapToPayWelcome() {
  const navigate = useNavigate();
  const { settings, updateSettings } = usePos();

  // Proof of 3.3. In production this write belongs on the server, per merchant.
  useEffect(() => {
    if (!settings.tapToPayAwarenessShownAt) {
      updateSettings({ tapToPayAwarenessShownAt: new Date().toISOString() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background px-[var(--pad-screen)] pb-[calc(1rem+var(--tabs-h,0px))] pt-6">
      <div className="mx-auto flex w-full max-w-[34rem] flex-1 flex-col">
        <div className="overflow-hidden rounded-sheet border border-border bg-surface p-1 elev-1">
          <img
            src={tapToPayImage.url}
            alt="Contactless card held near an iPhone for Tap to Pay on iPhone"
            className="aspect-[16/11] w-full rounded-card object-cover"
            loading="eager"
          />
        </div>

        <div className="mt-6 flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-row bg-muted text-foreground">
            <CreditCard className="size-5" aria-hidden />
          </span>
          <h1 className="min-w-0 flex-1 text-fs-2xl font-extrabold leading-tight text-foreground">
            {ttpCopy.awarenessTitle}
          </h1>
        </div>
        <p className="mt-2 text-fs-sm leading-relaxed text-muted-foreground">
          {ttpCopy.awarenessBody}
        </p>

        <div className="mt-5">
          <TtpBenefits />
        </div>

        <div className="mt-auto pt-8">
          <Link
            to="/tap-to-pay/setup/$from"
            params={{ from: "awareness" }}
            className="flex h-ctl-lg w-full items-center justify-center rounded-row bg-primary text-fs-base font-extrabold text-primary-foreground"
          >
            {TTP_SET_UP}
          </Link>
          <button
            type="button"
            onClick={() => {
              updateSettings({ tapToPayDismissedAt: new Date().toISOString() });
              navigate({ to: "/tickets" });
            }}
            className="mt-2 h-ctl-md w-full rounded-row text-fs-sm font-semibold text-accent transition-colors hover:bg-muted"
          >
            {ttpCopy.later}
          </button>
        </div>
      </div>
    </div>
  );
}
