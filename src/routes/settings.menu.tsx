import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ScreenBody, ScreenHeader } from "@/components/pos/shell";
import { Card, Pills, SectionLabel, ToggleRow } from "@/components/pos/primitives";
import { categories, menu, money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/settings/menu")({
  head: () => ({
    meta: [
      { title: "Menu settings — EATOS Handheld" },
      { name: "description", content: "Manage items, categories and sold out availability." },
      { property: "og:title", content: "Menu settings — EATOS Handheld" },
      { property: "og:description", content: "Manage items, categories and sold out availability." },
    ],
  }),
  component: MenuSettings,
});

function MenuSettings() {
  const { settings, updateSettings } = usePos();
  const [category, setCategory] = useState<string>("Burgers");
  const [soldOut, setSoldOut] = useState<string[]>([]);
  const items = menu.filter((m) => m.category === category);

  return (
    <>
      <ScreenHeader eyebrow="Settings" title="Menu" back />
      <div className="shrink-0 border-b border-border bg-surface px-4 pb-3">
        <Pills
          value={category}
          onChange={setCategory}
          options={categories.filter((c) => c !== "Popular").map((c) => ({ id: c, label: c }))}
        />
      </div>
      <ScreenBody>
        <SectionLabel>Availability</SectionLabel>
        <Card className="overflow-hidden">
          <ToggleRow
            title="Show sold out items"
            detail="Keep unavailable items visible on the grid"
            checked={settings.showSoldOut}
            onChange={(v) => updateSettings({ showSoldOut: v })}
          />
        </Card>

        <SectionLabel>{category} items</SectionLabel>
        <Card className="overflow-hidden">
          {items.map((item) => (
            <ToggleRow
              key={item.id}
              title={item.name}
              detail={`${money(item.price)} · ${soldOut.includes(item.id) ? "Sold out" : "Available"}`}
              checked={!soldOut.includes(item.id)}
              onChange={(v) => {
                setSoldOut((list) => (v ? list.filter((id) => id !== item.id) : [...list, item.id]));
                toast.success(`${item.name} ${v ? "available" : "marked sold out"}`);
              }}
            />
          ))}
        </Card>
      </ScreenBody>
    </>
  );
}
