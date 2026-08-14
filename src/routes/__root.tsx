import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { DeviceFrame } from "@/components/pos/shell";
import { PosProvider } from "@/lib/pos-store";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-extrabold text-foreground">404</h1>
        <h2 className="mt-4 text-fs-xl font-bold text-foreground">Screen not found</h2>
        <p className="mt-2 text-fs-sm text-muted-foreground">
          This handheld screen doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/tickets"
            className="inline-flex min-h-ctl-lg items-center justify-center rounded-pill bg-accent px-5 text-fs-sm font-bold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Back to tickets
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-fs-xl font-bold tracking-tight text-foreground">This screen didn't load</h1>
        <p className="mt-2 text-fs-sm text-muted-foreground">
          Something went wrong. You can try again or head back to the ticket queue.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex min-h-ctl-lg items-center justify-center rounded-pill bg-accent px-5 text-fs-sm font-bold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Try again
          </button>
          <a
            href="/tickets"
            className="inline-flex min-h-ctl-lg items-center justify-center rounded-pill border border-input bg-surface px-5 text-fs-sm font-bold text-foreground transition-colors hover:bg-muted"
          >
            Back to tickets
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { name: "theme-color", content: "#111111" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "eatOS" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "format-detection", content: "telephone=no" },
      { title: "EATOS Handheld - Restaurant POS" },
      {
        name: "description",
        content:
          "EATOS Handheld: a fast operator POS for tickets, orders, payments and store settings.",
      },
      { property: "og:title", content: "EATOS Handheld - Restaurant POS" },
      {
        property: "og:description",
        content: "A faster, clearer handheld operator experience for every shift.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <PosProvider>
        <DeviceFrame>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </DeviceFrame>
        <Toaster position="top-center" />
      </PosProvider>
    </QueryClientProvider>
  );
}
