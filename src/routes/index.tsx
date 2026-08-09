import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Wordmark } from "@/components/pos/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_VERSION } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Point of Purchase — eatOS Sign in" },
      { name: "description", content: "Secure team access to the eatOS Point of Purchase app." },
      { property: "og:title", content: "Point of Purchase — eatOS Sign in" },
      {
        property: "og:description",
        content: "Secure team access to the eatOS Point of Purchase app.",
      },
    ],
  }),
  component: SignInScreen,
});

function SignInScreen() {
  const { signIn } = usePos();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="no-scrollbar flex flex-1 flex-col justify-center overflow-y-auto px-6 pb-[calc(2rem+var(--kb-inset,0px))] pt-8 [html[data-kb=open]_&]:justify-start">
        <div className="my-auto w-full [html[data-kb=open]_&]:my-0">
        <div className="flex flex-col items-center">
          <Wordmark />
          <h1 className="mt-5 text-fs-2xl font-extrabold leading-tight text-foreground">Point of Purchase</h1>
        </div>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            signIn();
            toast.success("Signed in");
            navigate({ to: "/access/clock-in" });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">
              Email Address
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email or Phone Number"
              className="h-12 rounded-xl bg-surface"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="h-12 rounded-xl bg-surface pr-12"
              />
              <button
                type="button"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-muted-foreground"
              >
                {show ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-full bg-accent text-base font-bold text-accent-foreground hover:bg-accent/90"
          >
            Sign in
          </Button>
        </form>

        <Link
          to="/access/forgot-password"
          className="mt-6 block text-center text-sm font-bold text-foreground transition-colors hover:text-accent active:text-accent focus-visible:text-accent"
        >
          Forgot Your Password?
        </Link>

        <Link
          to="/access/create-account"
          className="mt-4 flex h-12 items-center justify-center rounded-full border border-border text-sm font-bold text-foreground transition-colors hover:bg-muted hover:text-accent active:text-accent focus-visible:text-accent"
        >
          Create an account
        </Link>

        <p className="mt-6 text-center text-fs-xs text-muted-foreground">{APP_VERSION}</p>
        </div>
      </div>
    </div>
  );
}
