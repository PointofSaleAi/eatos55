import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ScreenBody, ScreenHeader } from "@/components/pos/shell";
import { Card, SectionLabel, ToggleRow } from "@/components/pos/primitives";

export const Route = createFileRoute("/system/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — EATOS Handheld" },
      { name: "description", content: "Connect delivery, accounting and loyalty partners." },
      { property: "og:title", content: "Integrations — EATOS Handheld" },
      { property: "og:description", content: "Connect delivery, accounting and loyalty partners." },
    ],
  }),
  component: Integrations,
});

const partners = [
  { id: "doordash", name: "DoorDash", detail: "Delivery orders into the queue", on: true },
  { id: "ubereats", name: "Uber Eats", detail: "Delivery orders into the queue", on: false },
  { id: "quickbooks", name: "QuickBooks", detail: "Nightly sales journal", on: true },
  { id: "mailchimp", name: "Mailchimp", detail: "Guest email capture", on: false },
  { id: "loyalty", name: "EATOS Loyalty", detail: "Points on every closed ticket", on: true },
];

function Integrations() {
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(partners.map((p) => [p.id, p.on])),
  );

  return (
    <>
      <ScreenHeader eyebrow="System" title="Integrations" back />
      <ScreenBody>
        <SectionLabel>Connected partners</SectionLabel>
        <Card className="overflow-hidden">
          {partners.map((p) => (
            <ToggleRow
              key={p.id}
              title={p.name}
              detail={p.detail}
              checked={state[p.id] ?? false}
              onChange={(v) => {
                setState((s) => ({ ...s, [p.id]: v }));
                toast.success(`${p.name} ${v ? "connected" : "disconnected"}`);
              }}
            />
          ))}
        </Card>
      </ScreenBody>
    </>
  );
}
