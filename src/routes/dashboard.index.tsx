import { createFileRoute } from "@tanstack/react-router";
import { ShiftDashboard } from "@/components/pos/dashboard/shift-dashboard";
import { ScreenBody, ScreenHeader } from "@/components/pos/shell";
import { brand } from "@/lib/brand";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: `Dashboard - ${brand.appName} Point of Sale` },
      { name: "description", content: "Your shift figures, checks, live floor and Maya AI suggestions." },
      { property: "og:title", content: `Dashboard - ${brand.appName} Point of Sale` },
      { property: "og:description", content: "Your shift figures, checks, live floor and Maya AI suggestions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
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