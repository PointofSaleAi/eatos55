import { createFileRoute, useNavigate, useRouter, useCanGoBack } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { ArrowLeft, ChevronDown, Eye, EyeOff, Check } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { PinPad } from "@/components/pos/pin-pad";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Checkbox } from "@/components/ui/checkbox";
import { countries, restaurantTypes } from "@/lib/demo-data";
import { formatPhoneFor, isValidPhoneFor, phoneCountryByName, phoneErrorFor } from "@/lib/phone";
import { Wordmark } from "@/components/pos/brand";
import { useLandscapeWide } from "@/hooks/use-layout-mode";
import { cn } from "@/lib/utils";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/access/create-account")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
    <label className="relative block min-w-0 rounded-row border border-input bg-surface">
      <span className="absolute -top-2 left-3 bg-surface px-1 text-fs-xs font-extrabold text-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "h-12 min-w-0 w-full rounded-row bg-transparent px-3 text-fs-sm text-foreground outline-none placeholder:text-muted-foreground";

function CreateAccount() {
  const navigate = useNavigate();
  const router = useRouter();
  const { signIn } = usePos();
  const wide = useLandscapeWide();
  const canGoBack = useCanGoBack();
  const [step, setStep] = useState(0);
  const [pin, setPin] = useState("");
  const [channel, setChannel] = useState<"email" | "phone">("email");
  const [code, setCode] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [remaining, setRemaining] = useState(300);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const steps = ["Create Account", "Set PIN", "Confirmation", "OTP"];
  const goBack = () => {
    setError(""); setNotice("");
    if (step > 0) { setStep(step - 1); setCode(""); return; }
    if (canGoBack) router.history.back(); else navigate({ to: "/" });
  };
  useEffect(() => {
    if (step !== 3) return;
    const update = () => setRemaining(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [step, expiresAt]);
  const [show, setShow] = useState(false);
  const [agree, setAgree] = useState(false);
  const [form, setForm] = useState({
    first: "",
    last: "",
    email: "",
    phone: "",
    password: "",
    country: countries[0] ?? "",
    restaurant: "",
    type: "",
  });
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const startCode = () => {
    setError(""); setCode(""); setRemaining(300); setExpiresAt(Date.now() + 300000); setStep(3);
  };
  const validateAccount = () => {
    if (!form.first.trim() || !form.last.trim() || !form.restaurant.trim() || !form.country || !form.type) { setError("Complete all account and restaurant fields."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setError("Enter a valid email address."); return; }
    if (!isValidPhoneFor(phoneCountryByName(form.country), form.phone)) { setError(phoneErrorFor(phoneCountryByName(form.country))); return; }
    if (form.password.length < 8) { setError("Use at least 8 characters for your password."); return; }
    if (!agree) { setError("Accept the Seller Agreement and e-Sign Consent to continue."); return; }
    setError(""); setStep(1);
  };
  const verify = () => {
    if (Date.now() >= expiresAt) { setError("This code has expired. Select Resend Code to try again."); return; }
    if (code !== "1234") { setError("Incorrect code. Use the demo code 1234."); return; }
    setError(""); setPin(""); setForm((f) => ({ ...f, password: "" })); setStep(4);
  };
  const progress = (
    <ol aria-label="Signup progress" className={cn(wide ? "mt-10 space-y-5" : "mb-7 grid grid-cols-4 gap-2")}>
      {steps.map((label, index) => (
        <li key={label} aria-current={step === index ? "step" : undefined} className={cn("flex min-w-0 items-center gap-3 text-fs-sm", wide ? "flex-row" : "flex-col text-center", index > step ? "text-muted-foreground" : "font-bold text-foreground")}>
          <span className="grid size-7 shrink-0 place-items-center rounded-pill border border-border">{index < step ? <Check className="size-4" /> : index + 1}</span>
          <span className={wide ? "" : "text-fs-xs leading-tight"}>{label}</span>
        </li>
      ))}
    </ol>
  );

  return (
    <div className={cn("flex min-h-0 min-w-0 flex-1 bg-background", wide ? "flex-row" : "flex-col")}>
      {wide ? (
        <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface px-6 py-5">
          <Button type="button" variant="ghost" size="icon" aria-label="Go back" onClick={goBack} className="size-11 rounded-pill">
            <ArrowLeft className="size-5" />
          </Button>
          <div className="mt-8 flex flex-col items-center">
            <Wordmark />
            <p className="mt-4 text-fs-lg font-extrabold text-foreground">Point of Sale</p>
          </div>
          {progress}
        </aside>
      ) : null}
      <div className="no-scrollbar flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto pb-[var(--kb-inset,0px)]">
        <div className={cn("mx-auto flex w-full max-w-[52rem] flex-col", wide ? "my-auto px-10 py-8 [html[data-kb=open]_&]:my-0" : "max-w-[32rem] px-5 py-5")}>
          <div className="mb-8 flex min-w-0 items-center gap-3">
            {!wide ? (
              <Button type="button" variant="ghost" size="icon" aria-label="Go back" onClick={goBack} className="size-11 shrink-0 rounded-pill">
                <ArrowLeft className="size-6" />
              </Button>
            ) : null}
            <h1 className="min-w-0 text-fs-xl font-extrabold text-foreground">{step === 0 ? "Create an Account" : step === 4 ? "Demo Signup Complete" : steps[step]}</h1>
          </div>
          {!wide ? progress : null}
          {step === 0 ? (<>
          <div className={cn("grid min-w-0 gap-x-6 gap-y-6", wide ? "grid-cols-2" : "grid-cols-1")}>
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
        <Field label="Phone Number">
          <div className="flex h-12 items-center">
            <span className="flex h-8 tap-safe shrink-0 items-center gap-2 border-r border-input px-3 text-fs-sm font-bold text-foreground">
              <span aria-hidden>{phoneCountryByName(form.country).flag}</span> {phoneCountryByName(form.country).dial}
            </span>
            <input
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-fs-sm text-foreground outline-none placeholder:text-muted-foreground"
              inputMode="tel"
              placeholder={phoneCountryByName(form.country).placeholder}
              value={form.phone}
              onChange={(e) => set("phone")(formatPhoneFor(phoneCountryByName(form.country), e.target.value))}
            />
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

          </div>
        <label className="mt-7 flex items-start gap-3 text-fs-sm text-foreground">
          <Checkbox
            checked={agree}
            onCheckedChange={(v) => setAgree(v === true)}
            aria-label={`Accept the ${brand.appName} Seller Agreement and e-Sign Consent`}
            className="mt-0.5 size-6 rounded-none"
          />

          <span>
            {brand.appName}'s <span className="font-extrabold">Seller Agreement</span> and{" "}
            <span className="font-extrabold">e-Sign Consent</span>
          </span>
        </label>

      {error ? <p role="alert" className="mt-4 text-fs-sm text-destructive">{error}</p> : null}
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
        <Button type="button" variant="outline" className="h-12 rounded-pill text-fs-sm font-bold" onClick={() => navigate({ to: "/" })}>Cancel</Button>
        <Button
          disabled={!agree}
          className="h-12 w-full rounded-pill bg-accent text-fs-sm font-bold text-accent-foreground hover:bg-accent/90 disabled:opacity-40"
          onClick={validateAccount}
        >
          Create Account
        </Button>
      </div>
          </>) : (
            <div className="mx-auto w-full max-w-[26rem]">
              {step === 1 ? (
                <>
                  <PinPad pin={pin} onDigit={(digit) => setPin((value) => (value + digit).slice(0, 4))} onClear={() => setPin("")} onBackspace={() => setPin((value) => value.slice(0, -1))} className="h-[23rem] w-full" />
                  <Button className="mt-6 h-12 w-full rounded-pill bg-accent font-bold text-accent-foreground hover:bg-accent/90" disabled={pin.length !== 4} onClick={() => setStep(2)}>Continue</Button>
                </>
              ) : step === 2 ? (
                <>
                  <p className="mb-6 text-fs-sm text-muted-foreground">Where do you want to send your confirmation code?</p>
                  <fieldset className="space-y-4">
                    <legend className="sr-only">Confirmation destination</legend>
                    {(["email", "phone"] as const).map((value) => (
                      <label key={value} className="flex min-w-0 items-start gap-3 rounded-row border border-input bg-surface p-4 text-foreground">
                        <input type="radio" name="confirmation" className="mt-1 shrink-0" checked={channel === value} onChange={() => setChannel(value)} />
                        <span className="min-w-0"><span className="block text-fs-xs font-bold text-muted-foreground">{value === "email" ? "Email Address" : "Mobile Number"}</span><span className="mt-1 block break-words text-fs-sm font-bold">{value === "email" ? form.email : `+1 ${form.phone}`}</span></span>
                      </label>
                    ))}
                  </fieldset>
                  <Button className="mt-6 h-12 w-full rounded-pill bg-accent font-bold text-accent-foreground hover:bg-accent/90" onClick={startCode}>Send Code</Button>
                </>
              ) : step === 3 ? (
                <form onSubmit={(e) => { e.preventDefault(); verify(); }}>
                  <p className="text-fs-sm text-muted-foreground">Enter the confirmation code for <span className="break-words font-bold text-foreground">{channel === "email" ? form.email : `+1 ${form.phone}`}</span>.</p>
                  <p className="mt-3 text-fs-sm text-muted-foreground">Demo code: <strong className="text-foreground">1234</strong>. No email or SMS is sent.</p>
                  <InputOTP aria-label="Confirmation code" maxLength={4} pattern="[0-9]*" value={code} onChange={(value) => { setCode(value); setError(""); }} autoComplete="one-time-code" containerClassName="mt-7 justify-center">
                    <InputOTPGroup>{[0, 1, 2, 3].map((index) => <InputOTPSlot key={index} index={index} className="h-14 w-14 bg-surface text-fs-xl" />)}</InputOTPGroup>
                  </InputOTP>
                  <p className="mt-5 text-center text-fs-sm tabular-nums text-muted-foreground">{remaining > 0 ? `Code expires in ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}` : "Code expired"}</p>
                  {error ? <p role="alert" className="mt-4 text-fs-sm text-destructive">{error}</p> : null}
                  {notice ? <p role="status" className="mt-4 text-fs-sm text-muted-foreground">{notice}</p> : null}
                  <Button type="submit" disabled={code.length !== 4} className="mt-6 h-12 w-full rounded-pill bg-accent font-bold text-accent-foreground hover:bg-accent/90">Verify Code</Button>
                  <Button type="button" variant="outline" className="mt-3 h-11 w-full rounded-pill" onClick={() => { startCode(); setNotice("Demo code refreshed. Use 1234."); }}>Resend Code</Button>
                </form>
              ) : (
                <>
                  <p role="status" className="text-fs-sm text-muted-foreground">Demo signup is complete. No real account was created. Your chosen setup PIN does not change the existing demo employee PIN behavior.</p>
                  <Button className="mt-6 h-12 w-full rounded-pill bg-accent font-bold text-accent-foreground hover:bg-accent/90" onClick={() => { signIn(); navigate({ to: "/access/clock-in" }); }}>Continue to Clock In</Button>
                </>
              )}
              {step < 4 ? <div className="mt-4 grid grid-cols-2 gap-3"><Button variant="outline" className="h-11 rounded-pill" onClick={goBack}>Back</Button><Button variant="ghost" className="h-11 rounded-pill" onClick={() => navigate({ to: "/" })}>Cancel</Button></div> : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
