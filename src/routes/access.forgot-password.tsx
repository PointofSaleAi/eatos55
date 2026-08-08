import { createFileRoute, useNavigate, useRouter, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Wordmark } from "@/components/pos/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/access/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — eatOS Point of Purchase" },
      { name: "description", content: "Recover access by email or mobile number with an OTP." },
      { property: "og:title", content: "Forgot Password — eatOS Point of Purchase" },
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
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-6 pt-5">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.history.back()}
          className="-ml-2 grid size-11 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
        >
          <ChevronLeft className="size-6" />
        </button>

        <div className="flex flex-col items-center">
          <Wordmark />
          <h1 className="mt-4 text-3xl font-extrabold text-foreground">Point of Purchase</h1>
        </div>

        <h2 className="mt-3 text-2xl font-extrabold text-foreground">Forgot Password</h2>
        <p className="mt-1 text-base text-muted-foreground">
          Please select an option to change password
        </p>

        <div className="mt-7 space-y-2">
          <Label htmlFor="fp-email" className="text-sm font-extrabold">
            Email Address
          </Label>
          <Input
            id="fp-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Your Email"
            className="h-14 rounded-xl bg-surface text-base"
          />
        </div>

        <p className="py-4 text-center text-base font-extrabold text-foreground">Or</p>

        <div className="space-y-2">
          <Label htmlFor="fp-phone" className="text-sm font-extrabold">
            Mobile Number
          </Label>
          <div className="flex h-14 items-center overflow-hidden rounded-xl border border-input bg-surface">
            <span className="flex h-full shrink-0 items-center gap-2 border-r border-input px-3 text-base font-bold text-foreground">
              <span aria-hidden>🇺🇸</span> +1
            </span>
            <input
              id="fp-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(XXX) XXX-XXXX"
              inputMode="tel"
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-base text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <Button
          className="mt-8 h-14 w-full rounded-xl bg-primary text-base font-extrabold uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
          onClick={() => {
            toast.success(email ? "OTP sent by email" : "OTP sent by SMS");
            navigate({ to: "/" });
          }}
        >
          Send OTP
        </Button>

        <p className="mt-6 text-center text-base text-muted-foreground">
          Got your password?{" "}
          <Link to="/" className="font-extrabold text-foreground">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
