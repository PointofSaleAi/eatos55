import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ScreenBody, ScreenFooter, ScreenHeader } from "@/components/pos/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/access/create-account")({
  head: () => ({
    meta: [
      { title: "Create account — EATOS Handheld" },
      { name: "description", content: "Onboard a restaurant onto the EATOS handheld POS." },
      { property: "og:title", content: "Create account — EATOS Handheld" },
      { property: "og:description", content: "Onboard a restaurant onto the EATOS handheld POS." },
    ],
  }),
  component: CreateAccount,
});

function CreateAccount() {
  const navigate = useNavigate();
  const { signIn } = usePos();
  const [step, setStep] = useState(0);
  const [restaurant, setRestaurant] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const steps = [
    { label: "Restaurant", hint: "What is the business called?" },
    { label: "Owner", hint: "Who runs the account?" },
    { label: "Login", hint: "Where should we send access?" },
  ];
  const current = steps[step] ?? steps[0]!;

  return (
    <>
      <ScreenHeader eyebrow={`Step ${step + 1} of 3`} title="Create account" back />
      <ScreenBody>
        <div className="flex gap-1.5">
          {steps.map((s, i) => (
            <span
              key={s.label}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-muted"}`}
            />
          ))}
        </div>
        <p className="mt-5 text-sm text-muted-foreground">{current.hint}</p>

        <div className="mt-4 space-y-4">
          {step === 0 ? (
            <div className="space-y-1.5">
              <Label htmlFor="restaurant">Restaurant name</Label>
              <Input
                id="restaurant"
                value={restaurant}
                onChange={(e) => setRestaurant(e.target.value)}
                placeholder="EATOS Kitchen"
                className="h-12 rounded-xl bg-surface"
              />
            </div>
          ) : null}
          {step === 1 ? (
            <div className="space-y-1.5">
              <Label htmlFor="owner">Owner full name</Label>
              <Input
                id="owner"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Elizer Cruz"
                className="h-12 rounded-xl bg-surface"
              />
            </div>
          ) : null}
          {step === 2 ? (
            <div className="space-y-1.5">
              <Label htmlFor="owner-email">Work email</Label>
              <Input
                id="owner-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@restaurant.com"
                className="h-12 rounded-xl bg-surface"
              />
            </div>
          ) : null}
        </div>
      </ScreenBody>
      <ScreenFooter>
        <Button
          className="h-12 w-full rounded-full bg-accent text-base font-bold text-accent-foreground hover:bg-accent/90"
          onClick={() => {
            if (step < 2) {
              setStep(step + 1);
              return;
            }
            signIn();
            toast.success("Account created — welcome to EATOS");
            navigate({ to: "/access/clock-in" });
          }}
        >
          {step < 2 ? "Continue" : "Create account"}
        </Button>
      </ScreenFooter>
    </>
  );
}
