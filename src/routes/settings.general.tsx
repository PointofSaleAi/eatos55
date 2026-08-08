import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ScreenBody, ScreenHeader } from "@/components/pos/shell";
import { Card, SectionLabel, ToggleRow, ValueRow } from "@/components/pos/primitives";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/settings/general")({
  head: () => ({
    meta: [
      { title: "General settings — EATOS Handheld" },
      { name: "description", content: "Venue name, timezone, currency and tax configuration." },
      { property: "og:title", content: "General settings — EATOS Handheld" },
      {
        property: "og:description",
        content: "Venue name, timezone, currency and tax configuration.",
      },
    ],
  }),
  component: GeneralSettings,
});

function GeneralSettings() {
  const { settings, updateSettings } = usePos();

  return (
    <>
      <ScreenHeader eyebrow="Settings" title="General" back />
      <ScreenBody>
        <SectionLabel>Venue</SectionLabel>
        <Card className="overflow-hidden">
          <ValueRow title="Restaurant" value={settings.restaurantName} />
          <ValueRow title="Timezone" value={settings.timezone} />
          <ValueRow title="Currency" value={settings.currency} />
          <ValueRow title="Tax rate" value={settings.taxRate} />
        </Card>

        <SectionLabel>Operations</SectionLabel>
        <Card className="overflow-hidden">
          <ToggleRow
            title="Require manager for voids"
            detail="Ask for a PIN before removing items"
            checked={settings.requireManagerVoid}
            onChange={(v) => updateSettings({ requireManagerVoid: v })}
          />
          <ToggleRow
            title="Track inventory"
            detail="Decrement stock as items are sold"
            checked={settings.trackInventory}
            onChange={(v) => updateSettings({ trackInventory: v })}
          />
        </Card>

        <SectionLabel>Data</SectionLabel>
        <Card className="overflow-hidden">
          <ValueRow
            title="Export sales report"
            value="CSV"
            onClick={() => toast.success("Report emailed to the venue owner")}
          />
        </Card>
      </ScreenBody>
    </>
  );
}
