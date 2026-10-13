import { createFileRoute } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { ShiftDashboard } from "@/components/pos/dashboard/shift-dashboard";
import { ScreenBody, ScreenHeader } from "@/components/pos/shell";

export const Route = createFileRoute("/order/menu")({
  head: () => ({
    meta: [
      { title: `Menu - ${brand.appName} Point of Sale` },
      { name: "description", content: "Your shift figures, checks, live floor and Maya AI suggestions in Menu." },
      { property: "og:title", content: `Menu - ${brand.appName} Point of Sale` },
      {
        property: "og:description",
        content: "Your shift figures, checks, live floor and Maya AI suggestions in Menu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  return (
    <>
      <ScreenHeader title="Menu" />
      <ScreenBody>
        <div className="mx-auto w-full max-w-[92rem]">
          <ShiftDashboard />
        </div>
      </ScreenBody>
    </>
  );
}
