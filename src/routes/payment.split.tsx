import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { toast } from "sonner";
import { SplitPayments } from "@/components/pos/split-payments";
import { money } from "@/lib/demo-data";

export const Route = createFileRoute("/payment/split")({
  head: () => ({
    meta: [
      { title: `Split Payments - ${brand.appName} Point of Sale` },
      {
        name: "description",
        content:
          "Split a check evenly or item by item, review each child check and take payment on the same screen.",
      },
      { property: "og:title", content: `Split Payments - ${brand.appName} Point of Sale` },
      {
        property: "og:description",
        content: "Split a check evenly or item by item and take payment on the same screen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SplitCheckRoute,
});

function SplitCheckRoute() {
  const navigate = useNavigate();
  const back = () => navigate({ to: "/payment/method" });
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <SplitPayments
        onClose={back}
        onProceed={(result) => {
          if (result.mode !== "standard") {
            toast.info(`${result.checks} checks · first check ${money(result.firstTotal)}`);
          }
          back();
        }}
      />
    </div>
  );
}
