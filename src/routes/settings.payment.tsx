import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ScreenBody, ScreenHeader } from "@/components/pos/shell";
import { Card, SectionLabel, ToggleRow, ValueRow } from "@/components/pos/primitives";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/settings/payment")({
  head: () => ({
    meta: [
      { title: "Payment settings — EATOS Handheld" },
      { name: "description", content: "Tips, receipts and accepted tenders on this handheld." },
      { property: "og:title", content: "Payment settings — EATOS Handheld" },
      { property: "og:description", content: "Tips, receipts and accepted tenders on this handheld." },
    ],
  }),
  component: PaymentSettings,
});

function PaymentSettings() {
  const { settings, updateSettings } = usePos();

  return (
    <>
      <ScreenHeader eyebrow="Settings" title="Payment" back />
      <ScreenBody>
        <SectionLabel>Tips</SectionLabel>
        <Card className="overflow-hidden">
          <ToggleRow
            title="Ask for a tip"
            detail="Prompt the guest after card approval"
            checked={settings.askForTip}
            onChange={(v) => updateSettings({ askForTip: v })}
          />
          <ValueRow title="Tip presets" value={settings.tipPresets} />
        </Card>

        <SectionLabel>Receipts</SectionLabel>
        <Card className="overflow-hidden">
          <ToggleRow
            title="Auto print receipts"
            detail="Print on every closed ticket"
            checked={settings.autoPrintReceipts}
            onChange={(v) => updateSettings({ autoPrintReceipts: v })}
          />
          <ToggleRow
            title="Email receipts"
            detail="Offer a digital receipt first"
            checked={settings.emailReceipts}
            onChange={(v) => updateSettings({ emailReceipts: v })}
          />
        </Card>

        <SectionLabel>Tenders</SectionLabel>
        <Card className="overflow-hidden">
          <ValueRow title="Card processor" value="EATOS Pay" />
          <ValueRow title="Cash drawer" value="Paired" />
          <ValueRow
            title="Run a test charge"
            value="$1.00"
            onClick={() => toast.success("Test charge approved and voided")}
          />
        </Card>
      </ScreenBody>
    </>
  );
}
