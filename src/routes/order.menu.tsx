import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Barcode, Check, Tag } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/order/menu")({
  head: () => ({
    meta: [
      { title: "Menu - eatOS Point of Sale" },
      { name: "description", content: "Switch between barcode scanning and open price items." },
      { property: "og:title", content: "Menu - eatOS Point of Sale" },
      {
        property: "og:description",
        content: "Switch between barcode scanning and open price items.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MenuSheet,
});

function MenuSheet() {
  const navigate = useNavigate();
  const { mode, setMode } = usePos();

  const options = [
    {
      id: "barcode" as const,
      label: "Barcode",
      icon: Barcode,
      onPick: () => {
        setMode(mode);
        navigate({ to: "/order/new" });
      },
    },
    {
      id: "open-price" as const,
      label: "Open Price Items",
      icon: Tag,
      onPick: () => navigate({ to: "/order/custom-item" }),
    },
  ];

  return (
    <Sheet open onOpenChange={(open) => (open ? null : navigate({ to: "/order/new" }))}>
      <SheetContent hideClose side="bottom" className="rounded-t-sheet border-0 bg-surface p-0 pb-8">
        <SheetHeader className="px-4 pb-2 pt-5">
          <SheetTitle className="text-center text-fs-xl font-extrabold text-foreground">
            Menu
          </SheetTitle>
        </SheetHeader>
        <div>
          {options.map((o, i) => {
            const Icon = o.icon;
            const active = o.id === "barcode";
            return (
              <button
                key={o.id}
                type="button"
                onClick={o.onPick}
                className={cn(
                  "flex w-full items-center gap-4 px-4 py-5 text-left",
                  i % 2 === 0 ? "bg-muted/40" : "bg-surface",
                )}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-row bg-muted text-muted-foreground">
                  <Icon className="size-6" />
                </span>
                <span className="min-w-0 flex-1 truncate text-fs-sm font-bold text-foreground">{o.label}</span>
                {active ? <Check className="size-6 shrink-0 text-success" /> : null}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
