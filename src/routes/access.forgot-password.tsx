import { createFileRoute, useNavigate, useRouter, useCanGoBack, Link } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LoginCarousel } from "@/components/pos/login-carousel";
import { useLandscapeWide } from "@/hooks/use-layout-mode";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/pos/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/access/forgot-password")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: `Forgot Password - ${brand.appName} Point of Sale` },
      { name: "description", content: "Recover access by email or mobile number with an OTP." },
      { property: "og:title", content: `Forgot Password - ${brand.appName} Point of Sale` },
      {
        property: "og:description",
        content: "Recover access by email or mobile number with an OTP.",
      },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const navigate = useNavigate();
  const router = useRouter();
  const wide = useLandscapeWide();
  const canGoBack = useCanGoBack();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <div className={cn("grid min-h-0 min-w-0 flex-1 bg-background", wide ? "grid-cols-[minmax(0,3fr)_minmax(22rem,2fr)]" : "grid-cols-1")}>
      {wide ? <LoginCarousel /> : null}
      <section className="relative flex min-h-0 min-w-0 flex-col">
      <div className="shrink-0 px-6 pt-5">
        <Button variant="ghost" size="icon"
          type="button"
          aria-label="Go back"
          onClick={() => canGoBack ? router.history.back() : navigate({ to: "/" })}
          className="-ml-2 grid size-11 place-items-center rounded-pill text-foreground transition-colors hover:bg-muted"
        >
          <ChevronLeft className="size-6" />
        </Button>
      </div>
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-[calc(2rem+var(--kb-inset,0px))] pt-4">
        <div className="mx-auto my-auto w-full max-w-[26rem] [html[data-kb=open]_&]:my-0">
        <div className="flex flex-col items-center">
          <Wordmark />
          <h1 className="mt-4 text-fs-2xl font-extrabold leading-tight text-foreground">Point of Sale</h1>
        </div>

        <h2 className="mt-3 text-fs-xl font-extrabold text-foreground">Forgot Password</h2>
        <p className="mt-1 text-fs-sm text-muted-foreground">
          Please select an option to change password
        </p>

        <div className="mt-7 space-y-2">
          <Label htmlFor="fp-email" className="text-fs-sm font-extrabold">
            Email Address
          </Label>
          <Input
            id="fp-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Your Email"
            className="h-12 rounded-row bg-surface"
          />
        </div>

        <p className="py-4 text-center text-fs-sm font-bold text-muted-foreground">Or</p>

        <div className="space-y-2">
          <Label htmlFor="fp-phone" className="text-fs-sm font-extrabold">
            Mobile Number
          </Label>
          <div className="flex h-12 items-center overflow-hidden rounded-row border border-input bg-surface">
            <span className="flex h-full shrink-0 items-center gap-2 border-r border-input px-3 text-fs-sm font-bold text-foreground">
              <span aria-hidden>🇺🇸</span> +1
            </span>
            <input
              id="fp-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(XXX) XXX-XXXX"
              inputMode="tel"
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-fs-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <Button
          className="mt-8 h-12 w-full rounded-pill bg-accent text-fs-base font-bold text-accent-foreground hover:bg-accent/90"
          onClick={() => {
            toast.success(email ? "OTP sent by email" : "OTP sent by SMS");
            navigate({ to: "/" });
          }}
        >
          Send OTP
        </Button>

        <p className="mt-6 text-center text-fs-sm text-muted-foreground">
          Got your password?{" "}
          <Link to="/" className="tap-safe font-extrabold text-foreground">
            Sign In
          </Link>
        </p>
        </div>
      </div>
      </section>
    </div>
  );
}
