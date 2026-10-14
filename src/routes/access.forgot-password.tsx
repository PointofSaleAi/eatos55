import { createFileRoute, useNavigate, useRouter, useCanGoBack, Link } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { ChevronLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { LoginCarousel } from "@/components/pos/login-carousel";
import { useLandscapeWide } from "@/hooks/use-layout-mode";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/pos/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type RecoveryStep = "contact" | "verify" | "password" | "complete";

export const Route = createFileRoute("/access/forgot-password")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: `Forgot Password - ${brand.appName} Point of Sale` },
      { name: "description", content: "Preview email or mobile code verification and password recovery in the eatOS demo." },
      { property: "og:title", content: `Forgot Password - ${brand.appName} Point of Sale` },
      { property: "og:description", content: "Preview email or mobile code verification and password recovery in the eatOS demo." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const navigate = useNavigate();
  const router = useRouter();
  const wide = useLandscapeWide();
  const canGoBack = useCanGoBack();
  const [step, setStep] = useState<RecoveryStep>("contact");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<"email" | "phone">("email");
  const [code, setCode] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [remaining, setRemaining] = useState(300);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const both = Boolean(email.trim() && phone.trim());
  const destination = channel === "email" ? email.trim() : phone.trim();

  useEffect(() => {
    if (step !== "verify") return;
    const update = () => setRemaining(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [step, expiresAt]);

  const startCode = () => {
    setCode("");
    setError("");
    setRemaining(300);
    setExpiresAt(Date.now() + 300000);
  };
  const back = () => {
    setError(""); setNotice("");
    if (step === "verify") { setCode(""); setStep("contact"); return; }
    if (step === "password") { setPassword(""); setConfirm(""); setCode(""); setStep("verify"); return; }
    if (step === "complete") { navigate({ to: "/" }); return; }
    if (canGoBack) router.history.back(); else navigate({ to: "/" });
  };
  const submitContact = () => {
    const selected = both ? channel : email.trim() ? "email" : "phone";
    if (selected === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address."); return;
    }
    if (selected === "phone" && !/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
      setError("Enter a valid 10-digit U.S. mobile number."); return;
    }
    setChannel(selected); setNotice(""); startCode(); setStep("verify");
  };
  const verify = () => {
    if (Date.now() >= expiresAt) { setError("This code has expired. Select Resend Code to try again."); return; }
    if (code !== "1234") { setError("Incorrect code. Use the demo code 1234."); return; }
    setError(""); setNotice(""); setStep("password");
  };
  const finish = () => {
    if (password.length < 8) { setError("Use at least 8 characters for your new password."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setPassword(""); setConfirm(""); setError(""); setStep("complete");
  };

  return (
    <div className={cn("grid min-h-0 min-w-0 flex-1 bg-background", wide ? "grid-cols-[minmax(0,3fr)_minmax(22rem,2fr)]" : "grid-cols-1")}>
      {wide ? <LoginCarousel /> : null}
      <section className="relative flex min-h-0 min-w-0 flex-col">
        <div className="shrink-0 px-6 pt-5">
          <Button variant="ghost" size="icon" type="button" aria-label="Go back" onClick={back} className="-ml-2 size-11 rounded-pill">
            <ChevronLeft className="size-6" />
          </Button>
        </div>
        <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-[calc(2rem+var(--kb-inset,0px))] pt-4">
          <div className="mx-auto my-auto w-full max-w-[26rem] [html[data-kb=open]_&]:my-0">
            <div className="flex flex-col items-center">
              <Wordmark />
              <h1 className="mt-4 text-fs-2xl font-extrabold leading-tight text-foreground">Point of Sale</h1>
            </div>
            <h2 className="mt-5 text-fs-xl font-extrabold text-foreground">
              {step === "contact" ? "Forgot Password" : step === "verify" ? channel === "email" ? "Email Verification" : "Mobile Verification" : step === "password" ? "Set New Password" : "Demo Recovery Complete"}
            </h2>
            {step === "contact" ? (
              <form noValidate onSubmit={(e) => { e.preventDefault(); submitContact(); }}>
                <p className="mt-1 text-fs-sm text-muted-foreground">Please select an option to change password</p>
                <div className="mt-7 space-y-2">
                  <Label htmlFor="fp-email" className="text-fs-sm font-extrabold">Email Address</Label>
                  <Input id="fp-email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="Enter Your Email" className="h-12 rounded-row bg-surface" />
                </div>
                <p className="py-4 text-center text-fs-sm font-bold text-muted-foreground">Or</p>
                <div className="space-y-2">
                  <Label htmlFor="fp-phone" className="text-fs-sm font-extrabold">Mobile Number</Label>
                  <div className="flex h-12 items-center overflow-hidden rounded-row border border-input bg-surface">
                    <span className="flex h-full shrink-0 items-center gap-2 border-r border-input px-3 text-fs-sm font-bold text-foreground"><span aria-hidden>🇺🇸</span> +1</span>
                    <input id="fp-phone" type="tel" autoComplete="tel-national" value={phone} onChange={(e) => { setPhone(e.target.value); setError(""); }} placeholder="(XXX) XXX-XXXX" inputMode="tel" className="h-full min-w-0 flex-1 bg-transparent px-3 text-fs-sm text-foreground outline-none placeholder:text-muted-foreground" />
                  </div>
                </div>
                {both ? (
                  <fieldset className="mt-5 space-y-2 text-fs-sm text-foreground">
                    <legend className="mb-2 font-bold">Verify using</legend>
                    <label className="flex items-center gap-2"><input type="radio" name="delivery" checked={channel === "email"} onChange={() => setChannel("email")} />Email</label>
                    <label className="flex items-center gap-2"><input type="radio" name="delivery" checked={channel === "phone"} onChange={() => setChannel("phone")} />Mobile number</label>
                  </fieldset>
                ) : null}
                {error ? <p role="alert" className="mt-4 text-fs-sm text-destructive">{error}</p> : null}
                <Button type="submit" className="mt-8 h-12 w-full rounded-pill bg-accent text-fs-base font-bold text-accent-foreground hover:bg-accent/90">Send OTP</Button>
              </form>
            ) : step === "verify" ? (
              <form onSubmit={(e) => { e.preventDefault(); verify(); }}>
                <p className="mt-2 text-fs-sm text-muted-foreground">Enter the 4-digit verification code for <span className="break-words font-bold text-foreground">{destination}</span>.</p>
                <p className="mt-3 text-fs-sm text-muted-foreground">Demo code: <strong className="text-foreground">1234</strong>. No email or SMS is sent.</p>
                <InputOTP aria-label="Verification code" maxLength={4} pattern="[0-9]*" value={code} onChange={(value) => { setCode(value); setError(""); }} autoComplete="one-time-code" containerClassName="mt-7 justify-center">
                  <InputOTPGroup>{[0, 1, 2, 3].map((index) => <InputOTPSlot key={index} index={index} className="h-14 w-14 bg-surface text-fs-xl" />)}</InputOTPGroup>
                </InputOTP>
                <p className="mt-5 text-center text-fs-sm tabular-nums text-muted-foreground">{remaining > 0 ? `Code expires in ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}` : "Code expired"}</p>
                {error ? <p role="alert" className="mt-4 text-fs-sm text-destructive">{error}</p> : null}
                {notice ? <p role="status" className="mt-4 text-fs-sm text-muted-foreground">{notice}</p> : null}
                <Button type="submit" disabled={code.length !== 4} className="mt-6 h-12 w-full rounded-pill bg-accent font-bold text-accent-foreground hover:bg-accent/90">Verify Code</Button>
                <Button type="button" variant="ghost" className="mt-2 h-11 w-full" onClick={() => { startCode(); setNotice("Demo code refreshed. Use 1234."); }}>Resend Code</Button>
              </form>
            ) : step === "password" ? (
              <form noValidate onSubmit={(e) => { e.preventDefault(); finish(); }} className="mt-5 space-y-5">
                <p className="text-fs-sm text-muted-foreground">Use at least 8 characters for your new password.</p>
                {([{ id: "new-password", label: "New Password", value: password, update: setPassword, show: showPassword, toggle: () => setShowPassword((v) => !v) }, { id: "confirm-password", label: "Confirm Password", value: confirm, update: setConfirm, show: showConfirm, toggle: () => setShowConfirm((v) => !v) }]).map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <div className="relative">
                      <Input id={field.id} autoComplete="new-password" type={field.show ? "text" : "password"} value={field.value} onChange={(e) => { field.update(e.target.value); setError(""); }} className="h-12 rounded-row bg-surface pr-12" />
                      <Button type="button" variant="ghost" size="icon" aria-label={`${field.show ? "Hide" : "Show"} ${field.label.toLowerCase()}`} onClick={field.toggle} className="absolute right-1 top-1 size-10 rounded-pill text-muted-foreground">{field.show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</Button>
                    </div>
                  </div>
                ))}
                {error ? <p role="alert" className="text-fs-sm text-destructive">{error}</p> : null}
                <Button type="submit" className="h-12 w-full rounded-pill bg-accent font-bold text-accent-foreground hover:bg-accent/90">Reset Password</Button>
              </form>
            ) : (
              <div className="mt-6 space-y-5">
                <CheckCircle2 className="size-10 text-foreground" aria-hidden />
                <p role="status" className="text-fs-sm text-muted-foreground">The demo recovery flow is complete. No real account password was changed.</p>
                <Button className="h-12 w-full rounded-pill bg-accent font-bold text-accent-foreground hover:bg-accent/90" onClick={() => navigate({ to: "/" })}>Return to Sign In</Button>
              </div>
            )}
            {step !== "complete" ? <p className="mt-6 text-center text-fs-sm text-muted-foreground">Got your password? <Link to="/" className="tap-safe font-extrabold text-foreground transition-colors hover:text-accent">Sign In</Link></p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
