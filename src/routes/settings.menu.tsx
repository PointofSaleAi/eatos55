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
import { toast } from "sonner";
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
            onClick={() => toast.info("4 categories synced from Back Office")}
          />
          <IconNavRow
            title="Modifiers"
            icon={CircleDot}
            color="yellow"
            onClick={() => toast.info("No modifier groups on this device")}
          />
          <IconNavRow
            title="Add-Ons"
            icon={Grid2x2}
            color="pink"
            onClick={() => toast.info("No add-ons configured")}
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
            onClick={() => toast.info("Inventory tracking is on for this venue")}
          />
          <IconNavRow
            title="Default Modifiers"
            icon={Boxes}
            color="indigo"
            onClick={() => toast.info("No default modifiers set")}
          />
          <IconNavRow
            title="Groups"
            icon={Layers}
            color="slate"
            onClick={() => toast.info("No product groups on this device")}
          />
        </GroupCard>
      </ScreenBody>
    </>
  );
}
