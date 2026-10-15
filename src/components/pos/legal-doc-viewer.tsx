import { ExternalLink, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { SubHeader } from "@/components/pos/shell";
import { Button } from "@/components/ui/button";

/**
 * Legal documents (Privacy Policy, Legal Terms, Report Fraud) shown inside the
 * right settings pane. The pages are embedded from local copies under
 * /docs/ (eatos.com blocks direct embedding), styled by eatos.com's own
 * stylesheets loaded through the injected <base> tag.
 */
export const docTopics: Record<string, { title: string; slug: string }> = {
  "doc-privacy-policy": { title: "Privacy Policy", slug: "privacy-policy" },
  "doc-legal-terms": { title: "Legal Terms", slug: "terms-and-conditions" },
  "doc-report-fraud": { title: "Report Fraud", slug: "report-fraud" },
};

export function LegalDocViewer({ topic }: { topic: string }) {
  const doc = docTopics[topic];
  if (!doc) return null;
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleLoad = () => {
    setLoaded(true);
    try {
      if (frameRef.current?.contentDocument?.querySelector("[data-doc-error]")) {
        setFailed(true);
      }
    } catch {
      // Cross-origin or inaccessible frame: treat as loaded.
    }
  };

  return (
    <>
      <SubHeader title={doc.title} backLabel="About" backTo="/settings/detail/about" />
      <div
        className="relative flex min-h-0 flex-1 flex-col bg-surface"
        style={{ paddingBottom: "var(--tabs-h, 0px)" }}
      >
        {failed ? (
          <div className="grid min-h-0 flex-1 place-items-center px-6">
            <div className="rounded-card border border-border bg-surface px-6 py-8 text-center">
              <p className="text-fs-base font-bold text-foreground">{doc.title}</p>
              <p className="mt-1 max-w-xs text-fs-sm text-muted-foreground">
                This document could not be loaded right now.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() =>
                  window.open(`https://www.eatos.com/${doc.slug}`, "_blank", "noopener,noreferrer")
                }
              >
                <ExternalLink className="size-4" />
                Open in browser
              </Button>
            </div>
          </div>
        ) : (
          <iframe
            ref={frameRef}
            title={doc.title}
            src={`/docs/${doc.slug}.html`}
            onLoad={handleLoad}
            sandbox="allow-same-origin"
            className="min-h-0 w-full flex-1 border-0 bg-white"
          />
        )}
        {!loaded && !failed ? (
          <div className="absolute inset-0 grid place-items-center bg-surface">
            <div className="flex items-center gap-2 text-fs-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading {doc.title}…
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
