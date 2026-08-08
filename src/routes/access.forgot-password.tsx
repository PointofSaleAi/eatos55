import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ScreenBody, ScreenFooter, ScreenHeader } from "@/components/pos/shell";
import { Pills } from "@/components/pos/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/access/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — EATOS Handheld" },
      { name: "description", content: "Recover handheld access by email or mobile number." },
      { property: "og:title", content: "Forgot password — EATOS Handheld" },
      { property: "og:description", content: "Recover handheld access by email or mobile number." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<"email" | "mobile">("email");
  const [value, setValue] = useState("elizer@eatos.com");

  return (
    <>
      <ScreenHeader eyebrow="Access" title="Forgot password" back />
      <ScreenBody>
        <p className="text-sm text-muted-foreground">
          Choose how you want to receive a one-time recovery code.
        </p>
        <div className="mt-4">
          <Pills
            value={method}
            onChange={(m) => {
              setMethod(m);
              setValue(m === "email" ? "elizer@eatos.com" : "+1 (415) 555-0132");
            }}
            options={[
              { id: "email", label: "Email" },
              { id: "mobile", label: "Mobile" },
            ]}
          />
        </div>
        <div className="mt-5 space-y-1.5">
          <Label htmlFor="recovery">{method === "email" ? "Work email" : "Mobile number"}</Label>
          <Input
            id="recovery"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-12 rounded-xl bg-surface"
          />
        </div>
      </ScreenBody>
      <ScreenFooter>
        <Button
          className="h-12 w-full rounded-full bg-accent text-base font-bold text-accent-foreground hover:bg-accent/90"
          onClick={() => {
            toast.success(`Recovery code sent by ${method}`);
            navigate({ to: "/" });
          }}
        >
          Send recovery code
        </Button>
      </ScreenFooter>
    </>
  );
}
