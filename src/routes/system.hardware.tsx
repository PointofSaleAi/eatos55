import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ScreenBody, ScreenHeader } from "@/components/pos/shell";
import { ActionRow, Card, SectionLabel } from "@/components/pos/primitives";
import { hardware } from "@/lib/demo-data";

export const Route = createFileRoute("/system/hardware")({
  head: () => ({
    meta: [
      { title: "Hardware - EATOS Handheld" },
      { name: "description", content: "Printers, card reader, cash drawer and display pairing." },
      { property: "og:title", content: "Hardware - EATOS Handheld" },
      { property: "og:description", content: "Printers, card reader, cash drawer and display pairing." },
    ],
  }),
  component: Hardware,
});

function Hardware() {
  return (
    <>
      <ScreenHeader eyebrow="System" title="Hardware" back />
      <ScreenBody>
        <SectionLabel>Paired devices</SectionLabel>
        <Card className="overflow-hidden">
          {hardware.map((h) => (
            <ActionRow
              key={h.id}
              title={h.name}
              detail={h.detail}
              right={
                <span
                  className={`shrink-0 text-fs-xs font-bold ${h.ok ? "text-success" : "text-warning"}`}
                >
                  {h.ok ? "Ready" : "Attention"}
                </span>
              }
              onClick={() =>
                toast[h.ok ? "success" : "error"](
                  h.ok ? `${h.name} responded` : `${h.name} needs re-pairing`,
                )
              }
            />
          ))}
        </Card>

        <SectionLabel>Actions</SectionLabel>
        <Card className="overflow-hidden">
          <ActionRow
            title="Pair a new device"
            detail="Scan for nearby EATOS hardware"
            onClick={() => toast.info("Scanning for devices…")}
          />
          <ActionRow
            title="Print test receipt"
            detail="Kitchen printer"
            onClick={() => toast.success("Test receipt printed")}
          />
          <ActionRow
            title="Open cash drawer"
            detail="Requires manager approval on close"
            onClick={() => toast.success("Cash drawer opened")}
          />
        </Card>
      </ScreenBody>
    </>
  );
}
