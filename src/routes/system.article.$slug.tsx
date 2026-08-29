import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { ChevronRight } from "lucide-react";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { EmptyState } from "@/components/pos/primitives";
import { GroupCard } from "@/components/pos/settings-rows";
import { helpArticles } from "@/lib/help-content";

export const Route = createFileRoute("/system/article/$slug")({
  head: () => ({
    meta: [
      { title: `Support guide - ${brand.appName} Handheld` },
      { name: "description", content: `Step-by-step guidance for using the ${brand.appName} handheld.` },
      { property: "og:title", content: `Support guide - ${brand.appName} Handheld` },
      {
        property: "og:description",
        content: `Step-by-step guidance for using the ${brand.appName} handheld.`,
      },
    ],
  }),
  component: ArticleScreen,
  notFoundComponent: () => (
    <>
      <SubHeader title="Guide" backLabel="" />
      <ScreenBody className="py-2">
        <EmptyState title="Guide unavailable" detail="This guide has moved or is not published yet." />
      </ScreenBody>
    </>
  ),
});

function ArticleScreen() {
  const { slug } = Route.useParams();
  const article = helpArticles[slug];
  if (!article) throw notFound();

  return (
    <>
      <SubHeader title={article.title} backLabel="" />
      <ScreenBody className="py-2">
        <p className="px-1 text-fs-xs font-bold uppercase tracking-wide text-muted-foreground">
          {article.eyebrow}
        </p>
        <p className="mt-2 px-1 text-fs-sm leading-relaxed text-foreground">{article.intro}</p>

        {article.sections.map((s) => (
          <div key={s.heading} className="mt-5 rounded-card border border-border bg-surface p-4">
            <p className="text-fs-sm font-extrabold text-foreground">{s.heading}</p>
            <p className="mt-1.5 text-fs-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </div>
        ))}

        {article.links?.length ? (
          <>
            <p className="px-1 pb-1 pt-6 t-section text-muted-foreground">Related guides</p>
            <GroupCard>
              {article.links.map((l) => (
                <Link
                  key={l.slug}
                  to="/system/article/$slug"
                  params={{ slug: l.slug }}
                  className="flex min-h-ctl-md items-center gap-3 px-4 py-2 tap-safe t-row text-foreground transition-colors hover:bg-muted"
                >
                  <span className="min-w-0 flex-1 truncate">{l.label}</span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </GroupCard>
          </>
        ) : null}

        {!article.sections.length && !article.links?.length ? (
          <EmptyState title="Nothing here yet" detail="This guide is being written." />
        ) : null}
        <div className="h-6" />
      </ScreenBody>
    </>
  );
}
