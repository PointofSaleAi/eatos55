import { createFileRoute } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { ShiftDashboard } from "@/components/pos/dashboard/shift-dashboard";
import { ScreenBody, ScreenHeader } from "@/components/pos/shell";

export const Route = createFileRoute("/order/menu")({
  head: () => ({
    meta: [
      { title: `Dashboard - ${brand.appName} Point of Sale` },
      { name: "description", content: "Your shift figures, checks, live floor and Maya AI suggestions." },
      { property: "og:title", content: `Dashboard - ${brand.appName} Point of Sale` },
      {
        property: "og:description",
        content: "Your shift figures, checks, live floor and Maya AI suggestions.",
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
      <ScreenHeader title="Dashboard" />

      <ScreenBody>
        <div className="mx-auto w-full max-w-[92rem]">
          <ShiftDashboard />
        </div>
      </ScreenBody>
    </>
  );
}
