import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ScreenBody, ScreenHeader } from "@/components/pos/shell";
import { ActionRow, Card, SectionLabel, ValueRow } from "@/components/pos/primitives";

export const Route = createFileRoute("/system/customer-support")({
  head: () => ({
    meta: [
      { title: "Customer support — EATOS Handheld" },
      { name: "description", content: "Reach a live EATOS agent by chat, phone or email." },
      { property: "og:title", content: "Customer support — EATOS Handheld" },
      { property: "og:description", content: "Reach a live EATOS agent by chat, phone or email." },
    ],
  }),
  component: CustomerSupport,
});

function CustomerSupport() {
  return (
    <>
      <ScreenHeader eyebrow="System" title="Customer support" back />
      <ScreenBody>
        <Card className="p-4">
          <p className="text-sm font-extrabold text-foreground">Agents online now</p>
          <p className="mt-1 text-xs text-muted-foreground">Average reply time under 2 minutes.</p>
        </Card>

        <SectionLabel>Contact</SectionLabel>
        <Card className="overflow-hidden">
          <ActionRow
            title="Start a live chat"
            detail="Fastest option during service"
            onClick={() => toast.success("Chat request sent · an agent will join shortly")}
          />
          <ActionRow
            title="Call support"
            detail="+1 (855) 555 0142"
            onClick={() => toast.info("Dialing EATOS support…")}
          />
          <ActionRow
            title="Email support"
            detail="support@eatos.com"
            onClick={() => toast.success("Draft opened in your mail app")}
          />
        </Card>

        <SectionLabel>Device details for agents</SectionLabel>
        <Card className="overflow-hidden">
          <ValueRow title="Device ID" value="HH-0421-DT" />
          <ValueRow title="App version" value="4.12" />
          <ValueRow title="Venue" value="EATOS Kitchen · Downtown" />
        </Card>
      </ScreenBody>
    </>
  );
}
