import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { ArrowLeft, ChevronDown, Eye, EyeOff } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { countries, restaurantTypes } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/access/create-account")({
  head: () => ({
    meta: [
      { title: `Create an Account - ${brand.appName} Point of Sale` },
      { name: "description", content: `Onboard a restaurant onto the ${brand.appName} Point of Sale app.` },
      { property: "og:title", content: `Create an Account - ${brand.appName} Point of Sale` },
      {
        property: "og:description",
        content: `Onboard a restaurant onto the ${brand.appName} Point of Sale app.`,
      },
    ],
  }),
  component: CreateAccount,
});

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="relative block rounded-row border border-input bg-surface">
      <span className="absolute -top-2 left-3 bg-surface px-1 text-fs-xs font-extrabold text-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "h-12 w-full rounded-row bg-transparent px-3 text-fs-sm text-foreground outline-none placeholder:text-muted-foreground";

function CreateAccount() {
  const navigate = useNavigate();
  const router = useRouter();
  const { signIn } = usePos();
  const [show, setShow] = useState(false);
  const [agree, setAgree] = useState(false);
  const [form, setForm] = useState({
    first: "",
    last: "",
    email: "",
    phone: "",
    password: "",
    country: countries[0]!,
    restaurant: "",
    type: "",
  });
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex shrink-0 items-center gap-3 px-4 pb-2 pt-5">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.history.back()}
          className="grid size-11 place-items-center rounded-pill text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-6" />
        </button>
        <h1 className="text-fs-xl font-extrabold text-foreground">Create an Account</h1>
      </div>

      <div className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-5 pb-[calc(1.5rem+var(--kb-inset,0px))] pt-6">
        <Field label="First Name">
          <input
            className={inputClass}
            placeholder="Enter First Name"
            value={form.first}
            onChange={(e) => set("first")(e.target.value)}
          />
        </Field>
        <Field label="Last Name">
          <input
            className={inputClass}
            placeholder="Enter Last Name"
            value={form.last}
            onChange={(e) => set("last")(e.target.value)}
          />
        </Field>
        <Field label="Email Address">
          <input
            className={inputClass}
            type="email"
            placeholder="Enter  Email Address"
            value={form.email}
            onChange={(e) => set("email")(e.target.value)}
          />
        </Field>
        <Field label="Phone Number">
          <div className="flex h-12 items-center">
            <span className="flex h-8 tap-safe shrink-0 items-center gap-2 border-r border-input px-3 text-fs-sm font-bold text-foreground">
              <span aria-hidden>🇺🇸</span> +1
            </span>
            <input
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-fs-sm text-foreground outline-none placeholder:text-muted-foreground"
              inputMode="tel"
              placeholder="(123) 456 7890"
              value={form.phone}
              onChange={(e) => set("phone")(e.target.value)}
            />
          </div>
        </Field>
        <Field label="Password">
          <div className="relative">
            <input
              className={`${inputClass} pr-12`}
              type={show ? "text" : "password"}
              placeholder="Enter Password"
              value={form.password}
              onChange={(e) => set("password")(e.target.value)}
            />
            <button
              type="button"
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 grid size-10 tap-safe -translate-y-1/2 place-items-center rounded-pill text-muted-foreground"
            >
              {show ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
            </button>
          </div>
        </Field>
        <Field label="Country">
          <div className="relative">
            <select
              aria-label="Country"
              className={`${inputClass} appearance-none pr-10 font-bold`}
              value={form.country}
              onChange={(e) => set("country")(e.target.value)}
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </Field>
        <Field label="Restaurant Name">
          <input
            className={inputClass}
            placeholder="Enter Restaurant Name"
            value={form.restaurant}
            onChange={(e) => set("restaurant")(e.target.value)}
          />
        </Field>
        <Field label="Restaurant Type">
          <div className="relative">
            <select
              aria-label="Restaurant Type"
              className={`${inputClass} appearance-none pr-10`}
              value={form.type}
              onChange={(e) => set("type")(e.target.value)}
            >
              <option value="">Select Restaurant Type</option>
              {restaurantTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </Field>

        <label className="flex items-start gap-3 pt-1 text-fs-sm text-foreground">
          <Checkbox
            checked={agree}
            onCheckedChange={(v) => setAgree(v === true)}
            aria-label=`Accept the ${brand.appName} Seller Agreement and e-Sign Consent`
            className="mt-0.5 size-6 rounded-none"
          />

          <span>
            {brand.appName}'s <span className="font-extrabold">Seller Agreement</span> and{" "}
            <span className="font-extrabold">e-Sign Consent</span>
          </span>
        </label>
      </div>

      <div className="shrink-0 border-t border-border bg-surface px-5 pb-5 pt-3">
        <Button
          disabled={!agree}
          className="h-12 w-full rounded-pill bg-accent text-fs-base font-bold text-accent-foreground hover:bg-accent/90 disabled:opacity-40"
          onClick={() => {
            signIn();
            toast.success(`Account created - welcome to ${brand.appName}`);
            navigate({ to: "/access/clock-in" });
          }}
        >
          Create Account
        </Button>
      </div>
    </div>
  );
}
