import { createFileRoute } from "@tanstack/react-router";
import {
  Boxes,
  CircleDot,
  Grid2x2,
  Layers,
  LayoutList,
  PencilRuler,
  ScrollText,
  UtensilsCrossed,
} from "lucide-react";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { GroupCard, IconNavRow } from "@/components/pos/settings-rows";

export const Route = createFileRoute("/settings/menu")({
  head: () => ({
    meta: [
      { title: "Menu — EATOS Handheld settings" },
      {
        name: "description",
        content: "Menus, categories, modifiers, add-ons, products, inventory and groups.",
      },
      { property: "og:title", content: "Menu — EATOS Handheld settings" },
      {
        property: "og:description",
        content: "Menus, categories, modifiers, add-ons, products, inventory and groups.",
      },
    ],
  }),
  component: MenuSettings,
});

function MenuSettings() {
  return (
    <>
      <SubHeader title="Menu" />
      <ScreenBody className="py-2">
        <GroupCard>
          <IconNavRow title="Menu" icon={ScrollText} color="magenta" to="/order/menu" />
          <IconNavRow
            title="Categories"
            icon={LayoutList}
            color="violet"
            topic="categories"
          />
          <IconNavRow
            title="Modifiers"
            icon={CircleDot}
            color="yellow"
            topic="modifiers"
          />
          <IconNavRow
            title="Add-Ons"
            icon={Grid2x2}
            color="pink"
            topic="add-ons"
          />
          <IconNavRow
            title="Products"
            icon={UtensilsCrossed}
            color="magenta"
            to="/order/new"
          />
          <IconNavRow
            title="Inventory"
            icon={PencilRuler}
            color="sky"
            topic="inventory"
          />
          <IconNavRow
            title="Default Modifiers"
            icon={Boxes}
            color="indigo"
            topic="default-modifiers"
          />
          <IconNavRow
            title="Groups"
            icon={Layers}
            color="slate"
            topic="groups"
          />
        </GroupCard>
      </ScreenBody>
    </>
  );
}
