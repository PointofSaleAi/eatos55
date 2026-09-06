import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Caption, GroupCard, settingsRowClass } from "@/components/pos/settings-rows";
import { brand } from "@/lib/brand";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings/payment-picker/$field")({
  head: () => ({
    meta: [
      { title: `Choose an option - ${brand.appName} payment settings` },
      {
        name: "description",
        content:
          "Pick the payment provider, card reader model or reader connection used by this point of sale device.",
      },
      { property: "og:title", content: `Choose an option - ${brand.appName} payment settings` },
      {
        property: "og:description",
        content: "Pick the payment provider, card reader or connection for this device.",
      },
    ],
  }),
  component: PaymentPicker;
});

const NOT_SET = "Not set";
const CONNECTIONS = ["Bluetooth", "LAN", "Cloud"];

function PaymentPicker() {
  const { field } = Route.useParams();
  const navigate = useNavigate();
  const { settings, updateSettings, canManageSettings } = usePos();

  const config = {
    provider: {
      title: "Provider",
      options: [NOT_SET, ...brand.providerCatalog],
      value: settings.paymentProvider || NOT_SET,
      caption:
        "The provider clears every card payment taken on this device. Changing it unpairs the current card reader.",
      apply: (v: string) =>
        updateSettings({
          paymentProvider: v === NOT_SET ? "" : v,
          cardReaderModel: "",
          cardReaderStatus: "Not paired",
        }),
    },
    reader: {
      title: "Reader",
      options: [NOT_SET, ...brand.readerCatalog],
      value: settings.cardReaderModel || NOT_SET,
      caption: "Only readers certified for the selected provider are listed.",
      apply: (v: string) => updateSettings({ cardReaderModel: v === NOT_SET ? "" : v }),
    },
    connection: {
      title: "Connection",
      options: CONNECTIONS,
      value: settings.cardReaderConnection,
      caption: "How this device talks to the card reader.",
      apply: (v: string) => updateSettings({ cardReaderConnection: v }),
    },
  }[field];

  if (!config) {
    return (
      <>
        <SubHeader title="Not available" />
        <ScreenBody className="py-2">
          <Caption>That option list does not exist.</Caption>
        </ScreenBody>
      </>
    );
  }

  const choose = (option: string) => {
    if (canManageSettings) config.apply(option);
    navigate({ to: "/settings/payment-methods" });
  };

  return (
    <>
      <SubHeader title={config.title} backTo="/settings/payment-methods" />
      <ScreenBody className="py-2">
        <GroupCard>
          {config.options.map((option) => {
            const active = option === config.value;
            return (
              <button
                key={option}
                type="button"
                onClick={() => choose(option)}
                aria-pressed={active}
                className={cn(settingsRowClass, "transition-colors hover:bg-muted")}
              >
                <span className="min-w-0 flex-1 truncate t-row text-foreground">{option}</span>
                {active ? <Check className="size-5 shrink-0 text-accent" /> : null}
              </button>
            );
          })}
        </GroupCard>
        <Caption>{config.caption}</Caption>
        {!canManageSettings ? <Caption tone="danger">Only managers can change this.</Caption> : null}
      </ScreenBody>
    </>
  );
}
