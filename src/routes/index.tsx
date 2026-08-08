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
    <div className="flex flex-1 flex-col bg-background">
      <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto px-6 pb-6 pt-10">
        <div className="flex flex-col items-center">
          <Wordmark />
          <h1 className="mt-5 text-3xl font-extrabold text-foreground">Point of Purchase</h1>
        </div>

        <form
          className="mt-10 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            signIn();
            toast.success("Signed in");
            navigate({ to: "/access/clock-in" });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-extrabold">
              Email Address
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email or Phone Number"
              className="h-14 rounded-xl bg-surface text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-extrabold">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="h-14 rounded-xl bg-surface pr-12 text-base"
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
            className="h-14 w-full rounded-xl bg-primary text-base font-extrabold uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
          >
            Sign in
          </Button>
        </form>

        <Link
          to="/access/forgot-password"
          className="mt-7 text-center text-base font-extrabold text-foreground"
        >
          Forgot Your Password?
        </Link>

        <Link
          to="/access/create-account"
          className="mt-5 flex h-14 items-center justify-center rounded-xl border-2 border-foreground text-base font-extrabold uppercase tracking-wide text-foreground"
        >
          Create an account
        </Link>

        <p className="mt-8 text-center text-xs text-muted-foreground">{APP_VERSION}</p>
      </div>
    </div>
  );
}
