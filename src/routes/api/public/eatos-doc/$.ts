import { createFileRoute } from "@tanstack/react-router";

/**
 * Same-origin proxy for eatos.com legal documents. eatos.com sends
 * `X-Frame-Options: SAMEORIGIN`, so the app cannot embed the pages directly;
 * fetching them server-side and re-serving them from our own origin lets the
 * POS show the real documents inside the right settings pane.
 */
const allowedDocs = new Set(["privacy-policy", "terms-and-conditions", "report-fraud"]);

function errorPage(message: string) {
  return `<!doctype html><html><body data-doc-error="1" style="font-family:system-ui;padding:24px;color:#333"><p>${message}</p></body></html>`;
}

function debugPage(message: string, detail: string) {
  return `<!doctype html><html><body data-doc-error="1" style="font-family:system-ui;padding:24px;color:#333"><p>${message}</p><pre>${detail}</pre></body></html>`;
}

export const Route = createFileRoute("/api/public/eatos-doc/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slug = params._splat ?? "";
        if (!allowedDocs.has(slug)) {
          return new Response(errorPage("This document is not available."), {
            status: 404,
            headers: { "content-type": "text/html; charset=utf-8" },
          });
        }
        try {
          const upstream = await fetch(`https://www.eatos.com/${slug}`, {
            redirect: "follow",
            headers: {
              "user-agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
              accept: "text/html",
            },
          });
          if (!upstream.ok) {
            return new Response(debugPage("This document could not be loaded right now.", `upstream status ${upstream.status}`), {
              status: 502,
              headers: { "content-type": "text/html; charset=utf-8" },
            });
          }
          let html = await upstream.text();
          // Scripts must never run inside the embedded document.
          html = html.replace(/<script\b[\s\S]*?<\/script\s*>/gi, "");
          html = html.replace(/<meta[^>]+http-equiv=["']?content-security-policy["']?[^>]*>/gi, "");
          // Relative assets resolve against eatos.com; links try to open in a
          // new tab, which the sandboxed frame blocks so navigation stays put.
          html = html.replace(
            /(<head\b[^>]*>)/i,
            '$1<base href="https://www.eatos.com/" target="_blank">',
          );
          return new Response(html, {
            headers: {
              "content-type": "text/html; charset=utf-8",
              "cache-control": "no-store",
              "x-frame-options": "SAMEORIGIN",
            },
          });
        } catch (e) {
          return new Response(debugPage("This document could not be loaded right now.", String(e)), {
            status: 502,
            headers: { "content-type": "text/html; charset=utf-8" },
          });
        }
      },
    },
  },
});
