import { createFileRoute } from "@tanstack/react-router";
import {
  BadgePercent,
  Coins,
  CreditCard,
  HandCoins,
  Receipt,
  ReceiptText,
  ScrollText,
} from "lucide-react";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Caption, GroupCard, IconNavRow, IconValueRow } from "@/components/pos/settings-rows";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/settings/payments")({
  head: () => ({
    meta: [
      { title: "Payments — EATOS Handheld settings" },
      {
        name: "description",
        content: "Gratuity, taxes, discounts, service charge, cash management and receipts.",
      },
      { property: "og:title", content: "Payments — EATOS Handheld settings" },
      {
        property: "og:description",
        content: "Gratuity, taxes, discounts, service charge, cash management and receipts.",
      },
    ],
  }),
  component: PaymentsSettings,
});

function PaymentsSettings() {
  const { settings } = usePos();

  return (
    <>
      <SubHeader title="Payments" />
      <ScreenBody className="py-2">
        <GroupCard>
          <IconNavRow
            title="Gratuity"
            icon={HandCoins}
            color="magenta"
            topic="gratuity"
          />
          <IconNavRow
            title="Taxes"
            icon={ScrollText}
            color="violet"
            topic="taxes"
          />
          <IconNavRow
            title="Discounts"
            icon={BadgePercent}
            color="sky"
            topic="discounts"
          />
          <IconNavRow
            title="Service Charge"
            icon={ReceiptText}
            color="pink"
            topic="service-charge"
          />
          <IconNavRow
            title="Cash Management"
            icon={Coins}
            color="magenta"
            topic="cash-management"
          />
          <IconNavRow
            title="Receipts"
            icon={Receipt}
            color="blue"
            topic="receipts"
          />
        </GroupCard>

        <GroupCard className="mt-6">
          <IconValueRow
            title="Payment Platform"
            value={settings.paymentPlatform}
            icon={CreditCard}
            color="yellow"
          />
        </GroupCard>
        <Caption>
          The shown payment processor is being used to handle the transactions in your current
          device.
        </Caption>
      </ScreenBody>
    </>
  );
}
