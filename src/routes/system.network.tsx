import { createFileRoute } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { toast } from "sonner";
import { ScreenBody, ScreenHeader } from "@/components/pos/shell";
import { ActionRow, Card, SectionLabel, ToggleRow, ValueRow } from "@/components/pos/primitives";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/system/network")({
  head: () => ({
    meta: [
      { title: `Network - ${brand.appName} Handheld` },
      { name: "description", content: "Wi-Fi, cellular fallback and cloud sync status." },
      { property: "og:title", content: `Network - ${brand.appName} Handheld` },
      { property: "og:description", content: "Wi-Fi, cellular fallback and cloud sync status." },
    ],
  }),
  component: Network,
});

function Network() {
  const { settings, updateSettings } = usePos();

  return (
    <>
      <ScreenHeader eyebrow="System" title="Network" back />
      <ScreenBody>
        <SectionLabel>Connection</SectionLabel>
        <Card className="overflow-hidden">
          <ValueRow title="Wi-Fi" value=`${brand.appName}-Staff · Strong` />
          <ValueRow title="IP address" value="10.0.4.118" />
          <ValueRow title="Cellular fallback" value="Active · LTE" />
          <ValueRow title="Last sync" value="42 seconds ago" />
        </Card>

        <SectionLabel>Behaviour</SectionLabel>
        <Card className="overflow-hidden">
          <ToggleRow
            title="Offline mode"
            detail="Queue tickets locally when the network drops"
            checked={settings.offlineMode}
            onChange={(v) => updateSettings({ offlineMode: v })}
          />
        </Card>

        <SectionLabel>Actions</SectionLabel>
        <Card className="overflow-hidden">
          <ActionRow
            title="Test connection"
            detail=`Ping the ${brand.appName} cloud`
            onClick={() => toast.success("Connection healthy · 38 ms")}
          />
          <ActionRow
            title="Force sync"
            detail="Push queued tickets now"
            onClick={() => toast.success("Everything is up to date")}
          />
        </Card>
      </ScreenBody>
    </>
  );
}
