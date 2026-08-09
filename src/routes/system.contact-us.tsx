import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, ChevronDown, FileText, Home, HelpCircle, Rocket, Search, Tablet } from "lucide-react";
import { useState } from "react";
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
  { label: "Frequently Asked Questions", icon: HelpCircle, slug: "faq" },
  { label: "Getting Started", icon: Rocket, slug: "getting-started" },
  { label: "How-To Articles", icon: FileText, slug: "how-to" },
  { label: "Point of Sale", icon: Tablet, slug: "point-of-sale" },
];

const regions = [
  { label: "United States", flag: "\u{1F1FA}\u{1F1F8}" },
  { label: "United Kingdom", flag: "\u{1F1EC}\u{1F1E7}" },
  { label: "Canada", flag: "\u{1F1E8}\u{1F1E6}" },
  { label: "Australia", flag: "\u{1F1E6}\u{1F1FA}" },
];

function ContactUs() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState(regions[0]!.label);
  const [regionOpen, setRegionOpen] = useState(false);
  const current = regions.find((r) => r.label === region) ?? regions[0]!;
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
                onClick={() => setRegionOpen((v) => !v)}
                aria-expanded={regionOpen}
                className="flex min-h-ctl-md items-center gap-1 rounded-pill bg-surface px-3 text-fs-sm font-bold"
                aria-label={`Region: ${region}. Choose region`}
              >
                <span aria-hidden>{current.flag}</span>
                <ChevronDown className="size-5 text-muted-foreground" />
              </button>
              <button
                type="button"
                aria-label="Help center home"
                onClick={() => setQuery("")}
                className="grid size-11 shrink-0 place-items-center rounded-row bg-muted-foreground/40 text-shell-foreground"
              >
                <Home className="size-6 text-shell-foreground" />
              </button>
            </div>
          </div>

          {regionOpen ? (
            <ul className="mt-3 overflow-hidden rounded-card bg-surface">
              {regions.map((r) => (
                <li key={r.label} className="border-b border-border last:border-0">
                  <button
                    type="button"
                    onClick={() => {
                      setRegion(r.label);
                      setRegionOpen(false);
                    }}
                    className="flex min-h-ctl-md w-full items-center gap-3 px-4 text-left tap-safe text-fs-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <span aria-hidden>{r.flag}</span>
                    <span className="min-w-0 flex-1 truncate">{r.label}</span>
                    {r.label === region ? <Check className="size-4 shrink-0 text-accent" /> : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <h2 className="mt-6 text-center text-fs-xl font-extrabold text-shell-foreground">
            How can we help you?
          </h2>

          <label className="mt-4 flex min-h-ctl-lg items-center gap-3 rounded-pill bg-surface px-4">
            <Search className="size-6 shrink-0 text-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search our help center..."
              className="min-h-tap min-w-0 flex-1 bg-transparent text-center text-fs-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>
        </div>

        <ScreenBody className="flex-none overflow-visible py-6">
          <h3 className="text-center text-fs-lg font-extrabold text-foreground">
            Browse All Categories
          </h3>
          <div className="mt-5 space-y-4">
            {list.map(({ label, icon: Icon, slug }) => (
              <button
                key={label}
                type="button"
                onClick={() => navigate({ to: "/system/article/$slug", params: { slug } })}
                className="flex w-full items-center gap-5 rounded-card bg-surface px-5 py-6 text-left transition-colors hover:bg-muted"
              >
                <Icon className="size-12 shrink-0 text-foreground" strokeWidth={1.75} />
                <span className="min-w-0 flex-1 rounded-row bg-foreground px-3 py-2 text-fs-sm font-extrabold text-surface">
                  {label}
                </span>
              </button>
            ))}
            {list.length === 0 ? (
              <p className="py-8 text-center text-fs-sm text-muted-foreground">
                No help articles match “{query}”.
              </p>
            ) : null}
          </div>
        </ScreenBody>
      </div>
    </>
  );
}
