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
import { toast } from "sonner";
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
            onClick={() => toast.info(`Tip presets: ${settings.tipPresets}`)}
          />
          <IconNavRow
            title="Taxes"
            icon={ScrollText}
            color="violet"
            onClick={() => toast.info(`Tax rate: ${settings.taxRate}`)}
          />
          <IconNavRow
            title="Discounts"
            icon={BadgePercent}
            color="sky"
            onClick={() => toast.info("No discounts configured")}
          />
          <IconNavRow
            title="Service Charge"
            icon={ReceiptText}
            color="pink"
            onClick={() => toast.info("No service charge on this device")}
          />
          <IconNavRow
            title="Cash Management"
            icon={Coins}
            color="magenta"
            onClick={() => toast.info("Cash drawer is not assigned to this handheld")}
          />
          <IconNavRow
            title="Receipts"
            icon={Receipt}
            color="blue"
            onClick={() =>
              toast.info(settings.autoPrintReceipts ? "Auto-print is on" : "Auto-print is off")
            }
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
