import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, FileText, Home, HelpCircle, Rocket, Search, Tablet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Wordmark } from "@/components/pos/brand";

export const Route = createFileRoute("/system/contact-us")({
  head: () => ({
    meta: [
      { title: "Contact Us — EATOS Help Center" },
      {
        name: "description",
        content: "Search the EATOS help center or browse FAQs, guides and how-to articles.",
      },
      { property: "og:title", content: "Contact Us — EATOS Help Center" },
      {
        property: "og:description",
        content: "Search the EATOS help center or browse FAQs, guides and how-to articles.",
      },
    ],
  }),
  component: ContactUs,
});

const categories = [
  { label: "Frequently Asked Questions", icon: HelpCircle },
  { label: "Getting Started", icon: Rocket },
  { label: "How-To Articles", icon: FileText },
  { label: "Point of Sale", icon: Tablet },
];

function ContactUs() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const list = categories.filter((c) => c.label.toLowerCase().includes(q));

  return (
    <>
      <SubHeader title="Customer Support" backLabel="" />
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-[var(--kb-inset,0px)]">
        <div className="bg-shell px-5 pb-7 pt-5">
          <div className="flex items-start justify-between gap-3">
            <Wordmark invert className="h-12" />
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => toast.info("Region: United States")}
                className="flex min-h-[40px] items-center gap-1 rounded-full bg-surface px-3 text-sm font-bold"
                aria-label="Choose region"
              >
                <span aria-hidden>🇺🇸</span>
                <ChevronDown className="size-5 text-muted-foreground" />
              </button>
              <button
                type="button"
                aria-label="Help center home"
                onClick={() => setQuery("")}
                className="grid size-11 shrink-0 place-items-center rounded-lg bg-muted-foreground/40 text-shell-foreground"
              >
                <Home className="size-6 text-surface" />
              </button>
            </div>
          </div>

          <h2 className="mt-6 text-center text-2xl font-extrabold text-surface">
            How can we help you?
          </h2>
          <label className="mt-4 flex min-h-[48px] items-center gap-3 rounded-full bg-surface px-4">
            <Search className="size-6 shrink-0 text-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search our help center..."
              className="min-w-0 flex-1 bg-transparent text-center text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>
        </div>

        <ScreenBody className="flex-none overflow-visible py-6">
          <h3 className="text-center text-lg font-extrabold text-foreground">
            Browse All Categories
          </h3>
          <div className="mt-5 space-y-4">
            {list.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => toast.info(`Opening ${label}`)}
                className="flex w-full items-center gap-5 rounded-2xl bg-surface px-5 py-6 text-left transition-colors hover:bg-muted"
              >
                <Icon className="size-12 shrink-0 text-foreground" strokeWidth={1.75} />
                <span className="min-w-0 flex-1 rounded-xl bg-foreground px-3 py-2 text-sm font-extrabold text-surface">
                  {label}
                </span>
              </button>
            ))}
            {list.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No help articles match “{query}”.
              </p>
            ) : null}
          </div>
        </ScreenBody>
      </div>
    </>
  );
}
