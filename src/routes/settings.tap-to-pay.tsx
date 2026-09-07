import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Smartphone } from "lucide-react";
import { brand } from "@/lib/brand";
import tapToPayImage from "@/assets/tap-to-pay-iphone-card.png.asset.json";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Caption, GroupCard, IconValueRow } from "@/components/pos/settings-rows";
import { TTP, TTP_SET_UP, ttpCopy, ttpStatusLabel } from "@/components/pos/tap-to-pay";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/settings/tap-to-pay")({
  head: () => ({
    meta: [
      { title: `${TTP} - ${brand.appName} payment settings` },
      {
        name: "description",
        content:
          "Turn Tap to Pay on iPhone on for this device, review the Apple terms and open Apple's merchant education at any time.",
      },
      { property: "og:title", content: `${TTP} - ${brand.appName} payment settings` },
      {
        property: "og:description",
        content: "Enable Tap to Pay on iPhone for this device and reopen the merchant education.",
      },
    ],
  }),
  component: TapToPaySettings,
});

/**
 * Screens 05, 06 and 07 in one place. This row is a permanent entry point
 * outside every communication and the checkout flow (requirement 3.6) and one
 * of the two permanent homes for the education screens (requirement 4.2).
 */
function TapToPaySettings() {
  const navigate = useNavigate();
  const { settings, updateSettings, canManageSettings } = usePos();
  const state = settings.tapToPayState;
  const ready = state === "ready";

  return (
    <>
      <SubHeader title={TTP} />
      <ScreenBody className="py-2">
        <div className="mb-4 overflow-hidden rounded-card border border-border bg-muted">
          <img
            src={tapToPayImage.url}
            alt="Contactless card held near an iPhone for Tap to Pay on iPhone"
            className="h-auto w-full object-cover"
            loading="lazy"
          />
        </div>

        <GroupCard className="mt-4">
          <IconValueRow
            title="This device"
            icon={Smartphone}
            color="blue"
            value={
              state === "ineligible"
                ? ttpCopy.unavailable
                : `${ttpStatusLabel(state)} · ${settings.tapToPayDeviceLabel}`
            }
          />
          <IconValueRow
            title="Terms and Conditions"
            icon={FileText}
            color="slate"
            value={
              settings.tapToPayTermsAcceptedAt
                ? `Accepted ${new Date(settings.tapToPayTermsAcceptedAt).toLocaleDateString()}`
                : "Not accepted"
            }
          />
        </GroupCard>

        {state === "ineligible" ? (
          <Caption>{ttpCopy.unavailable}</Caption>
        ) : ready ? (
          <Caption>
            This iPhone takes contactless cards and digital wallets. On tablet, payments are taken on
            a supported iPhone signed in to the same venue.
          </Caption>
        ) : (
          <div className="mt-3">
            <Link
              to="/tap-to-pay/setup/$from"
              params={{ from: "settings" }}
              className="flex h-ctl-lg w-full items-center justify-center rounded-row bg-primary text-fs-base font-extrabold text-primary-foreground"
            >
              {TTP_SET_UP}
            </Link>
          </div>
        )}

        {ready && canManageSettings ? (
          <button
            type="button"
            onClick={() => updateSettings({ tapToPayState: "notSetUp" })}
            className="mt-4 h-ctl-md w-full rounded-row border border-border text-fs-sm font-bold text-destructive"
          >
            Turn off on this iPhone
          </button>
        ) : null}
      </ScreenBody>
    </>
  );
}
