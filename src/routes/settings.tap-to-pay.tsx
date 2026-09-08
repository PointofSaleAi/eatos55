import { createFileRoute, Link } from "@tanstack/react-router";
import { Smartphone } from "lucide-react";
import { brand } from "@/lib/brand";
import tapToPayImage from "@/assets/tap-to-pay-iphone-card.png.asset.json";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Caption, GroupCard, IconValueRow } from "@/components/pos/settings-rows";
import { TTP, ttpCopy, ttpStatusLabel } from "@/components/pos/tap-to-pay";
import { usePos } from "@/lib/pos-store";
import { TTP_DEVICE_NOTE, useTapToPayAvailable } from "@/lib/device";

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
 * Permanent Tap to Pay on iPhone settings entry point outside every
 * communication and the checkout flow (requirement 3.6).
 */
function TapToPaySettings() {
  const { settings, canManageSettings } = usePos();
  const ttpDevice = useTapToPayAvailable();
  const state = settings.tapToPayState;
  const ready = state === "ready" && ttpDevice.available;

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
              !ttpDevice.available
                ? TTP_DEVICE_NOTE
                : state === "ineligible"
                ? ttpCopy.unavailable
                : `${ttpStatusLabel(state)} · ${settings.tapToPayDeviceLabel}`
            }
          />
        </GroupCard>

        {!ttpDevice.available ? (
          <Caption>
            Tap to Pay on iPhone works on iPhone only. Take contactless payments on a supported
            iPhone signed in to this venue, or use a paired card reader on this device.
          </Caption>
        ) : state === "ineligible" ? (
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
              Set Up {TTP}
            </Link>
          </div>
        )}

        {ready && canManageSettings ? (
          <Link
            to="/tap-to-pay/turn-off"
            className="mt-4 flex h-ctl-md w-full items-center justify-center rounded-row border border-border text-fs-sm font-bold text-destructive"
          >
            Turn off on this iPhone
          </Link>
        ) : null}
      </ScreenBody>
    </>
  );
}
