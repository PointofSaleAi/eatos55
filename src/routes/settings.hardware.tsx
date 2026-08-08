import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Inbox, Printer, ScanLine, Tablet } from "lucide-react";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { GroupCard, IconNavRow } from "@/components/pos/settings-rows";

export const Route = createFileRoute("/settings/hardware")({
  head: () => ({
    meta: [
      { title: "Hardware — EATOS Handheld settings" },
      {
        name: "description",
        content: "Manage printers, card readers, cash drawer and hardware emulators.",
      },
      { property: "og:title", content: "Hardware — EATOS Handheld settings" },
      {
        property: "og:description",
        content: "Manage printers, card readers, cash drawer and hardware emulators.",
      },
    ],
  }),
  component: HardwareSettings,
});

function HardwareSettings() {
  return (
    <>
      <SubHeader title="Hardware" />
      <ScreenBody className="py-2">
        <p className="px-1 pb-4 text-sm leading-relaxed text-muted-foreground">
          Manage hardware components including printers, cash drawer for secure cash transactions,
          and card readers for electronic card processing.
        </p>
        <GroupCard>
          <IconNavRow
            title="Printer"
            icon={Printer}
            color="magenta"
            topic="printer"
          />
          <IconNavRow
            title="Card Reader"
            icon={Tablet}
            color="violet"
            topic="card-reader"
          />
          <IconNavRow
            title="Integrations"
            icon={ScanLine}
            color="yellow"
            to="/settings/hardware/integrations"
          />
          <IconNavRow
            title="Cash Drawer"
            icon={Inbox}
            color="yellow"
            topic="cash-drawer"
          />
          <IconNavRow
            title="Hardware Emulators"
            icon={CreditCard}
            color="blue"
            topic="hardware-emulators"
          />
        </GroupCard>
      </ScreenBody>
    </>
  );
}
