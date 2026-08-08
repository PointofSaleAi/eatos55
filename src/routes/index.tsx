import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — EATOS Handheld" },
      { name: "description", content: "Secure team access to the EATOS handheld POS." },
      { property: "og:title", content: "Sign in — EATOS Handheld" },
      { property: "og:description", content: "Secure team access to the EATOS handheld POS." },
    ],
  }),
  component: SignInScreen,
});

function SignInScreen() {
  const { signIn } = usePos();
  const navigate = useNavigate();
  const [email, setEmail] = useState("elizer@eatos.com");
  const [password, setPassword] = useState("demo1234");

  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-6 pt-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">EATOS</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-foreground">
          Handheld,
          <br />
          redesigned for the rush.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to open your shift and take the floor.
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            signIn();
            toast.success("Welcome back, Elizer");
            navigate({ to: "/access/clock-in" });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-xl bg-surface"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 rounded-xl bg-surface"
            />
          </div>
          <Button
            type="submit"
            className="h-12 w-full rounded-full bg-accent text-base font-bold text-accent-foreground hover:bg-accent/90"
          >
            Sign in
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-center text-sm">
          <Link to="/access/forgot-password" className="font-bold text-foreground underline">
            Forgot password?
          </Link>
          <Link to="/access/create-account" className="text-muted-foreground">
            New restaurant? <span className="font-bold text-accent">Create an account</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
