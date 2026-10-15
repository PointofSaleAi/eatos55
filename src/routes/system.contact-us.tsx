import { createFileRoute } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { SubHeader } from "@/components/pos/shell";

export const Route = createFileRoute("/system/contact-us")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: `Contact Us - ${brand.appName} Help Center` },
      {
        name: "description",
        content: `Choose your region and browse ${brand.appName} support topics, guides and how-to articles.`,
      },
      { property: "og:title", content: `Contact Us - ${brand.appName} Help Center` },
      {
        property: "og:description",
        content: `Choose your region and browse ${brand.appName} support topics, guides and how-to articles.`,
      },
    ],
  }),
  component: ContactUs,
});

function ContactUs() {
  return (
    <>
      <SubHeader
        title="Contact Us"
        backLabel="Customer Support"
        backTo="/system/customer-support"
      />
      <div className="flex min-h-0 flex-1 flex-col bg-surface pb-[var(--tabs-h,0px)]">
        <iframe title="eatOS Support Center" src="https://support.eatos.com/en-us/" className="min-h-0 w-full flex-1 border-0 bg-surface" referrerPolicy="strict-origin-when-cross-origin" />
      </div>
    </>
  );
}
