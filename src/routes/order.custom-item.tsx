import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ScreenBody, ScreenFooter, ScreenHeader } from "@/components/pos/shell";
import { Card, Keypad } from "@/components/pos/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/order/custom-item")({
  head: () => ({
    meta: [
      { title: "Custom item — EATOS Handheld" },
      { name: "description", content: "Ring in an open priced item with a custom name." },
      { property: "og:title", content: "Custom item — EATOS Handheld" },
      { property: "og:description", content: "Ring in an open priced item with a custom name." },
    ],
  }),
  component: CustomItem,
});

function CustomItem() {
  const navigate = useNavigate();
  const { addCustomItem } = usePos();
  const [name, setName] = useState("");
  const [digits, setDigits] = useState("");
  const price = Number(digits || "0") / 100;

  return (
    <>
      <ScreenHeader eyebrow="Order" title="Custom item" back />
      <ScreenBody>
        <Card className="p-4">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Item name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Chef special"
            className="mt-2 h-12 rounded-xl bg-background"
          />
        </Card>
        <Card className="mt-3 p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Price
          </p>
          <p className="mt-1 text-4xl font-extrabold tabular-nums text-foreground">
            {money(price)}
          </p>
        </Card>
        <div className="mt-3">
          <Keypad
            onPress={(k) =>
              setDigits((d) => (k === "back" ? d.slice(0, -1) : (d + k).replace(/^0+/, "").slice(0, 7)))
            }
          />
        </div>
      </ScreenBody>
      <ScreenFooter>
        <Button
          disabled={price <= 0}
          className="h-12 w-full rounded-full bg-accent text-base font-bold text-accent-foreground hover:bg-accent/90 disabled:opacity-40"
          onClick={() => {
            addCustomItem(name.trim() || "Custom item", price);
            navigate({ to: "/order/new" });
          }}
        >
          Add to order
        </Button>
      </ScreenFooter>
    </>
  );
}
