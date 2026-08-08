import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { ScreenBody, ScreenHeader } from "@/components/pos/shell";
import { ActionRow, Card, SectionLabel } from "@/components/pos/primitives";
import { menuModes } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/order/menu")({
  head: () => ({
    meta: [
      { title: "Choose menu — EATOS Handheld" },
      { name: "description", content: "Switch the selling mode and menu for this order." },
      { property: "og:title", content: "Choose menu — EATOS Handheld" },
      { property: "og:description", content: "Switch the selling mode and menu for this order." },
    ],
  }),
  component: ChooseMenu,
});

function ChooseMenu() {
  const navigate = useNavigate();
  const { mode, setMode } = usePos();

  return (
    <>
      <ScreenHeader eyebrow="Order" title="Choose menu" back />
      <ScreenBody>
        <SectionLabel>Selling mode</SectionLabel>
        <Card className="overflow-hidden">
          {menuModes.map((m) => (
            <ActionRow
              key={m.id}
              title={m.name}
              detail={m.hint}
              right={
                mode === m.id ? (
                  <Check className="size-5 shrink-0 text-accent" />
                ) : (
                  <span className="size-5 shrink-0" />
                )
              }
              onClick={() => {
                setMode(m.id);
                navigate({ to: "/order/new" });
              }}
            />
          ))}
        </Card>
      </ScreenBody>
    </>
  );
}
