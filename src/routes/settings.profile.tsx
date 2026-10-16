import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BriefcaseBusiness, Camera, ChevronRight, Images, LocateFixed, Pencil, ShieldCheck, UserRound, XCircle } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { brand } from "@/lib/brand";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Caption, GroupCard, GroupLabel } from "@/components/pos/settings-rows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { WheelDatePicker } from "@/components/pos/time-picker";
import { PinPad } from "@/components/pos/pin-pad";
import { useConfirm } from "@/components/pos/confirm-sheet";
import { usePos } from "@/lib/pos-store";
import { formatAddress, useProfileSettings, type ProfileSettings } from "@/lib/profile-settings";
import { formatPhoneFor, isValidPhoneFor, maxPhoneDigits, phoneCountries, phoneCountryByName, phoneErrorFor } from "@/lib/phone";
import { useLiveTime } from "@/lib/use-live-time";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings/profile")({
  head: () => ({
    meta: [
      { title: `Profile - ${brand.appName} Handheld settings` },
      { name: "description", content: "Your personal information, security, two factor authentication, PIN and job type." },
      { property: "og:title", content: `Profile - ${brand.appName} Handheld settings` },
      { property: "og:description", content: "Your personal information, security, two factor authentication, PIN and job type." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfileScreen,
});

const JOB_TYPES = ["Busser", "Chef", "Cook", "Cashier", "Dishwasher"];
const AUTH_CODE = "EV2FE4CCLQDBGFAR";
const row = "flex min-h-12 w-full items-center gap-3 border-b border-border bg-surface px-4 py-2 text-left last:border-0";
const initials = (n: string) => n.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";
const fmtDob = (iso: string) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso); return m ? `${m[3]}/${m[2]}/${m[1]}` : ""; };

type View = "main" | "personal" | "address" | "security";

function ProfileScreen() {
  const { session, setName } = usePos();
  const { profile, patch } = useProfileSettings();
  const [view, setView] = useState<View>("main");
  useEffect(() => {
    if (profile.first || profile.last) return;
    const parts = session.name.trim().split(/\s+/);
    patch({ first: parts[0] ?? "", last: parts.length > 1 ? parts[parts.length - 1]! : "", middle: parts.slice(1, -1).join(" ") });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const setPart = (q: Partial<ProfileSettings>) => {
    patch(q);
    const n = { ...profile, ...q };
    const full = [n.first, n.middle, n.last].map((s) => s.trim()).filter(Boolean).join(" ");
    if (full) setName([n.first, n.last].map((s) => s.trim()).filter(Boolean).join(" ") || full);
  };
  if (view === "personal") return <Personal profile={profile} patch={patch} setPart={setPart} onBack={() => setView("main")} onAddress={() => setView("address")} />;
  if (view === "address") return <Address profile={profile} patch={patch} onBack={() => setView("personal")} />;
  if (view === "security") return <Security profile={profile} patch={patch} onBack={() => setView("main")} />;
  return <Main profile={profile} patch={patch} onOpen={setView} />;
}

function NavRow({ icon, label, value, onClick }: { icon?: ReactNode; label: string; value?: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={cn(row, "hover:bg-muted")}>
    {icon}<span className="flex-1 t-body font-medium">{label}</span>
    {value ? <span className="max-w-[55%] truncate t-body text-muted-foreground">{value}</span> : null}
    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
  </button>;
}

function TextRow({ label, value, placeholder = "", type = "text", onChange, onCommit }: { label: string; value: string; placeholder?: string; type?: string; onChange?: (v: string) => void; onCommit?: (v: string) => void }) {
  const [text, setText] = useState<string | null>(null);
  return <label className={row}>
    <span className="w-36 shrink-0 t-body font-medium">{label}</span>
    <input aria-label={label} type={type} placeholder={placeholder} value={text ?? value}
      onChange={(e) => (onChange ? onChange(e.target.value) : setText(e.target.value))}
      onBlur={() => { if (text !== null) { onCommit?.(text); setText(null); } }} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
      className="min-w-0 flex-1 bg-transparent text-right t-body outline-none placeholder:text-muted-foreground" />
  </label>;
}

function Avatar({ profile, size = "size-24", name }: { profile: ProfileSettings; size?: string; name: string }) {
  return profile.photo ? <img src={profile.photo} alt="" className={cn(size, "rounded-full object-cover")} />
    : <span className={cn(size, "grid place-items-center rounded-full bg-muted text-fs-xl font-extrabold")}>{initials(name)}</span>;
}

function Main({ profile, patch, onOpen }: { profile: ProfileSettings; patch: (q: Partial<ProfileSettings>) => void; onOpen: (v: View) => void }) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { session, signOut, clockIn, setRole } = usePos();
  const [photo, setPhoto] = useState(false);
  const [job, setJob] = useState(false);
  const full = [profile.first, profile.middle, profile.last].filter(Boolean).join(" ") || session.name;
  const cam = useRef<HTMLInputElement>(null);
  const lib = useRef<HTMLInputElement>(null);
  const read = (f?: File) => { if (!f) return; const r = new FileReader(); r.onload = () => { patch({ photo: String(r.result) }); setPhoto(false); }; r.readAsDataURL(f); };
  return <>
    <SubHeader title="Profile" backLabel="Settings" backTo="/settings" />
    <ScreenBody className="py-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <button type="button" aria-label="Change profile photo" onClick={() => setPhoto(true)} className="relative">
          <Avatar profile={profile} name={full} />
          <span className="absolute bottom-0 right-0 grid size-8 place-items-center rounded-full border border-border bg-surface"><Pencil className="size-4" /></span>
        </button>
        <p className="mt-2 text-fs-xl font-extrabold">{full}</p>
        <p className="t-caption text-muted-foreground">{session.role}</p>
      </div>
      <GroupCard className="mt-6">
        <NavRow icon={<UserRound className="size-5 text-muted-foreground" />} label="Personal Information" onClick={() => onOpen("personal")} />
        <NavRow icon={<ShieldCheck className="size-5 text-muted-foreground" />} label="Security" onClick={() => onOpen("security")} />
        <NavRow icon={<BriefcaseBusiness className="size-5 text-muted-foreground" />} label="Job Type" value={session.clockedIn ? session.role : undefined} onClick={() => setJob(true)} />
      </GroupCard>
      <Button variant="outline" className="mt-6 w-full" onClick={() => void (async () => {
        const ok = await confirm({ title: "Log out?", message: "You will need to sign in again to use this device.", confirmLabel: "Log Out", destructive: true });
        if (!ok) return; signOut(); navigate({ to: "/", replace: true });
      })()}>LOG OUT</Button>
    </ScreenBody>
    <Dialog open={photo} onOpenChange={(o) => { if (!o) setPhoto(false); }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-lg">
        <DialogDescription className="sr-only">Change your profile photo</DialogDescription>
        <div className="flex flex-col items-center gap-3 py-2">
          <Avatar profile={profile} size="size-20" name={full} />
          <DialogTitle className="text-center text-fs-xl font-bold">{full}</DialogTitle>
          <div className="flex gap-3">
            <Button variant="outline" size="icon" aria-label="Take photo" onClick={() => cam.current?.click()}><Camera /></Button>
            <Button variant="outline" size="icon" aria-label="Choose from library" onClick={() => lib.current?.click()}><Images /></Button>
          </div>
          <input ref={cam} type="file" accept="image/*" capture="user" hidden onChange={(e) => read(e.target.files?.[0])} />
          <input ref={lib} type="file" accept="image/*" hidden onChange={(e) => read(e.target.files?.[0])} />
        </div>
        {profile.photo && <Button variant="ghost" onClick={() => { patch({ photo: "" }); setPhoto(false); }}>Remove Photo</Button>}
        <Button variant="ghost" onClick={() => setPhoto(false)}>Cancel</Button>
      </DialogContent>
    </Dialog>
    {job && <JobType name={profile.first || session.name} current={session.clockedIn ? session.role : undefined} onClose={() => setJob(false)}
      onClockIn={(r) => { setRole(r); if (!session.clockedIn) clockIn(); setJob(false); toast.success(`Clocked in as ${r}`); }} />}
  </>;
}

function JobType({ name, current, onClose, onClockIn }: { name: string; current?: string | undefined; onClose: () => void; onClockIn: (r: string) => void }) {
  const [pick, setPick] = useState(current && JOB_TYPES.includes(current) ? current : "");
  const now = useLiveTime();
  const h = new Date().getHours();
  const greet = h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
  const d = new Date();
  const date = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  return <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
    <DialogContent className="flex max-h-[90dvh] w-[calc(100vw-2rem)] max-w-xl flex-col gap-4 overflow-y-auto">
      <DialogTitle className="text-center text-fs-xl font-extrabold">{greet}, {name}!<br />Are you sure you want to clock in?</DialogTitle>
      <DialogDescription className="sr-only">Choose your job type and clock in.</DialogDescription>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {JOB_TYPES.map((r) => <button key={r} type="button" aria-pressed={pick === r} onClick={() => setPick(r)}
          className={cn("flex flex-col items-center overflow-hidden rounded-lg border-2 bg-surface", pick === r ? "border-foreground" : "border-border hover:bg-muted")}>
          <span className="grid h-14 w-full place-items-center bg-foreground text-fs-xl font-extrabold text-background">{r[0]}</span>
          <span className="py-2 t-body font-medium">{r}</span>
        </button>)}
      </div>
      <p className="mt-4 text-center text-fs-lg font-bold tabular-nums">{date} {now}</p>
      <Button disabled={!pick} onClick={() => onClockIn(pick)}>CLOCK IN</Button>
    </DialogContent>
  </Dialog>;
}

function Personal({ profile, patch, setPart, onBack, onAddress }: { profile: ProfileSettings; patch: (q: Partial<ProfileSettings>) => void; setPart: (q: Partial<ProfileSettings>) => void; onBack: () => void; onAddress: () => void }) {
  const navigate = useNavigate();
  const [dob, setDob] = useState(false);
  const [dobValue, setDobValue] = useState(profile.dob || "2000-01-01");
  const country = phoneCountryByName(profile.phoneCountry);
  const [phoneErr, setPhoneErr] = useState("");
  return <>
    <SubHeader title="Personal Information" backLabel="Profile" onBack={onBack} />
    <ScreenBody className="py-4">
      <GroupCard>
        <TextRow label="First Name" value={profile.first} placeholder="Required" onCommit={(v) => v.trim() ? setPart({ first: v.trim() }) : toast.error("First name is required")} />
        <TextRow label="Middle Name" value={profile.middle} placeholder="Optional" onCommit={(v) => setPart({ middle: v.trim() })} />
        <TextRow label="Last Name" value={profile.last} placeholder="Optional" onCommit={(v) => setPart({ last: v.trim() })} />
      </GroupCard>
      <GroupCard className="mt-4">
        <NavRow label="Date of Birth" value={fmtDob(profile.dob) || "Select"} onClick={() => { setDobValue(profile.dob || "2000-01-01"); setDob(true); }} />
      </GroupCard>
      <GroupCard className="mt-4">
        <TextRow label="Email" type="email" value={profile.email} placeholder="name@example.com"
          onCommit={(v) => { const e = v.trim(); if (e && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { toast.error("Enter a valid email address"); return; } patch({ email: e }); }} />
        <div className={row}>
          <span className="w-36 shrink-0 t-body font-medium">Phone Number</span>
          <select aria-label="Phone country" value={country.name} onChange={(e) => patch({ phoneCountry: e.target.value, phone: "" })}
            className="rounded-md bg-muted px-2 py-1 t-caption outline-none">
            {phoneCountries.map((c) => <option key={c.name} value={c.name}>{c.flag} {c.dial}</option>)}
          </select>
          <input aria-label="Phone Number" inputMode="tel" placeholder={country.placeholder} value={formatPhoneFor(country, profile.phone)}
            onChange={(e) => { patch({ phone: e.target.value.replace(/\D/g, "").slice(0, maxPhoneDigits(country)) }); setPhoneErr(""); }}
            onBlur={() => setPhoneErr(profile.phone && !isValidPhoneFor(country, profile.phone) ? phoneErrorFor(country) : "")}
            className="min-w-0 flex-1 bg-transparent text-right t-body tabular-nums outline-none placeholder:text-muted-foreground" />
        </div>
      </GroupCard>
      {phoneErr && <Caption><span className="text-destructive">{phoneErr}</span></Caption>}
      <GroupLabel>ADDRESS</GroupLabel>
      <GroupCard><NavRow label={formatAddress(profile) || "Add Address"} onClick={onAddress} /></GroupCard>
      <button type="button" className="mt-6 w-full text-center t-caption text-muted-foreground underline-offset-2 hover:underline"
        onClick={() => navigate({ to: "/settings/detail/$topic", params: { topic: "doc-privacy-policy" } })}>See how your data is managed...</button>
    </ScreenBody>
    <Dialog open={dob} onOpenChange={(o) => { if (!o) setDob(false); }}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm">
        <DialogTitle className="text-center">Date of Birth</DialogTitle>
        <DialogDescription className="sr-only">Choose your date of birth.</DialogDescription>
        <WheelDatePicker value={dobValue} onChange={setDobValue} />
        <Button onClick={() => { patch({ dob: dobValue }); setDob(false); }}>Done</Button>
      </DialogContent>
    </Dialog>
  </>;
}

function Address({ profile, patch, onBack }: { profile: ProfileSettings; patch: (q: Partial<ProfileSettings>) => void; onBack: () => void }) {
  const summary = formatAddress(profile);
  const clear = () => patch({ address1: "", address2: "", city: "", state: "", postcode: "", country: "" });
  const locate = () => toast("Location lookup isn't available in this demo");
  const f = (label: string, key: keyof ProfileSettings, placeholder = "") =>
    <TextRow key={key} label={label} value={String(profile[key])} placeholder={placeholder} onCommit={(v) => patch({ [key]: v.trim() } as Partial<ProfileSettings>)} />;
  return <>
    <SubHeader title="Address" backLabel="Personal Information" onBack={onBack} />
    <ScreenBody className="py-4">
      <div className="flex items-center gap-2">
        <div className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-row border border-border bg-surface px-4">
          <span className="min-w-0 flex-1 truncate t-body">{summary || <span className="text-muted-foreground">Search address</span>}</span>
          {summary && <button type="button" aria-label="Clear address" onClick={clear}><XCircle className="size-4 text-muted-foreground" /></button>}
        </div>
        <Button variant="outline" size="icon" aria-label="Use current location" onClick={locate}><LocateFixed /></Button>
      </div>
      <GroupCard className="mt-4">
        {f("Address 1", "address1", "Required")}{f("Address 2", "address2", "Optional")}{f("City", "city")}{f("State", "state")}
        {f("PostCode", "postcode", "Optional")}{f("Country", "country", "Optional")}
      </GroupCard>
    </ScreenBody>
  </>;
}

function Notice({ title, message, onClose }: { title: string; message: string; onClose: () => void }) {
  return <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
    <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-lg">
      <DialogTitle className="text-center">{title}</DialogTitle>
      <DialogDescription className="text-center">{message}</DialogDescription>
      <Button onClick={onClose}>OK</Button>
    </DialogContent>
  </Dialog>;
}

function CodeStep({ onVerify }: { onVerify: () => void }) {
  const [code, setCode] = useState("");
  return <div className="flex flex-col gap-3">
    <Input aria-label="Verification code" autoFocus inputMode="numeric" placeholder="Enter 6-digit code" className="text-center tracking-widest"
      value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
    <Button disabled={code.length !== 6} onClick={onVerify}>Verify</Button>
  </div>;
}

function Security({ profile, patch, onBack }: { profile: ProfileSettings; patch: (q: Partial<ProfileSettings>) => void; onBack: () => void }) {
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);
  const [sheet, setSheet] = useState<"sms" | "app" | "pin" | null>(null);
  const submitPw = () => {
    if (!pw.current || !pw.next || !pw.confirm) return setNotice({ title: "Empty Fields", message: "Please fill all fields" });
    if (pw.next.length < 8 || !/[A-Z]/.test(pw.next) || !/[a-z]/.test(pw.next)) return setNotice({ title: "Invalid Password", message: "Your password must be at least 8 characters long, an uppercase letter and a lowercase letter." });
    if (pw.next !== pw.confirm) return setNotice({ title: "Password Mismatch", message: "New and confirm passwords do not match." });
    setPw({ current: "", next: "", confirm: "" }); toast.success("Password updated (demo only)");
  };
  const pwRow = (label: string, key: keyof typeof pw) => <label className={row}>
    <span className="w-28 shrink-0 t-body font-medium">{label}</span>
    <input aria-label={`${label} password`} type="password" placeholder="••••••••••" value={pw[key]} onChange={(e) => setPw({ ...pw, [key]: e.target.value })}
      onKeyDown={(e) => { if (e.key === "Enter") submitPw(); }} className="min-w-0 flex-1 bg-transparent text-right t-body outline-none placeholder:text-muted-foreground" />
  </label>;
  const anyFilled = pw.current || pw.next || pw.confirm;
  return <>
    <SubHeader title="Security" backLabel="Profile" onBack={onBack} />
    <ScreenBody className="py-2">
      <GroupLabel>PASSWORD</GroupLabel>
      <GroupCard>{pwRow("Current", "current")}{pwRow("New", "next")}{pwRow("Confirm", "confirm")}</GroupCard>
      <Caption>Your password must be at least 8 characters long, an uppercase letter and a lowercase letter.</Caption>
      {anyFilled && <Button className="mt-2 w-full" onClick={submitPw}>Update Password</Button>}
      <GroupLabel>TWO FACTOR AUTHENTICATION</GroupLabel>
      <GroupCard>
        <div className={row}><span className="flex-1 t-body font-medium">Two Factor Authentication</span>
          <Switch aria-label="Two Factor Authentication" checked={profile.twoFactor} onCheckedChange={(v) => patch(v ? { twoFactor: true } : { twoFactor: false, twoFactorSms: false, twoFactorApp: false })} /></div>
        {profile.twoFactor && <>
          <div className={row}><span className="flex-1 t-body font-medium">Mobile Number</span>
            <Switch aria-label="Mobile Number" checked={profile.twoFactorSms} onCheckedChange={(v) => (v ? setSheet("sms") : patch({ twoFactorSms: false }))} /></div>
          <div className={row}><span className="flex-1 t-body font-medium">Authenticator App</span>
            <Switch aria-label="Authenticator App" checked={profile.twoFactorApp} onCheckedChange={(v) => (v ? setSheet("app") : patch({ twoFactorApp: false }))} /></div>
        </>}
      </GroupCard>
      <Caption>Enable two factor authentication to add an extra layer of security to your account.</Caption>
      <GroupLabel>PIN SETTINGS</GroupLabel>
      <GroupCard><NavRow label="Change Pin" value="••••" onClick={() => setSheet("pin")} /></GroupCard>
    </ScreenBody>
    {notice && <Notice {...notice} onClose={() => setNotice(null)} />}
    {sheet === "sms" && <SmsSheet initial={profile.smsPhone} onClose={() => setSheet(null)} onDone={(p) => { patch({ twoFactorSms: true, smsPhone: p }); setSheet(null); toast.success("Mobile number verified"); }} />}
    {sheet === "app" && <AppSheet onClose={() => setSheet(null)} onDone={() => { patch({ twoFactorApp: true }); setSheet(null); toast.success("Authenticator app connected"); }} />}
    {sheet === "pin" && <PinSheet onClose={() => setSheet(null)} />}
  </>;
}

function SmsSheet({ initial, onClose, onDone }: { initial: string; onClose: () => void; onDone: (p: string) => void }) {
  const [countryName, setCountryName] = useState("United States");
  const country = phoneCountryByName(countryName);
  const [phone, setPhone] = useState(initial);
  const [sent, setSent] = useState(false);
  return <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
    <DialogContent className="w-[calc(100vw-2rem)] max-w-sm">
      <DialogTitle className="text-center">Phone Number</DialogTitle>
      <DialogDescription>{sent ? `Enter the code for ${country.dial} ${formatPhoneFor(country, phone)}. No real text message is sent in this demo — any 6 digits work.` : "Enter mobile number for Verification to enhance the security"}</DialogDescription>
      {sent ? <CodeStep onVerify={() => onDone(phone)} /> : <div className="flex flex-col gap-3">
        <select aria-label="Country" value={countryName} onChange={(e) => { setCountryName(e.target.value); setPhone(""); }} className="h-11 rounded-md border border-border bg-surface px-3 t-body">
          {phoneCountries.map((c) => <option key={c.name} value={c.name}>{c.flag} {c.dial} ({c.name})</option>)}
        </select>
        <Input aria-label="Enter Phone Number" inputMode="tel" placeholder="Enter Phone Number" value={formatPhoneFor(country, phone)}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, maxPhoneDigits(country)))} />
        <Button disabled={!isValidPhoneFor(country, phone)} onClick={() => setSent(true)}>Send OTP</Button>
      </div>}
    </DialogContent>
  </Dialog>;
}

function AppSheet({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [qr, setQr] = useState("");
  const [step, setStep] = useState<"scan" | "code">("scan");
  useEffect(() => { void QRCode.toDataURL(`otpauth://totp/eatOS?secret=${AUTH_CODE}&issuer=eatOS`, { margin: 1, width: 320 }).then(setQr); }, []);
  return <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
    <DialogContent className="w-[calc(100vw-2rem)] max-w-sm">
      <DialogTitle className="text-center">Authenticator App</DialogTitle>
      {step === "scan" ? <>
        <DialogDescription className="text-center">Use your mobile device to scan the barcode with a two-factor authentication app like Google Authenticator to start generating verification codes.</DialogDescription>
        <div className="mx-auto size-44 rounded-md bg-surface">{qr && <img src={qr} alt="Authenticator QR code" className="size-full" />}</div>
        <p className="text-center t-caption text-muted-foreground">or enter this code in your Authentication app</p>
        <p className="mx-auto rounded-md border border-border px-4 py-2 font-mono t-body tracking-wider">{AUTH_CODE}</p>
        <Button onClick={() => setStep("code")}>Next</Button>
      </> : <>
        <DialogDescription className="text-center">Enter the 6-digit code from your authenticator app. In this demo any 6 digits work.</DialogDescription>
        <CodeStep onVerify={onDone} />
      </>}
    </DialogContent>
  </Dialog>;
}

function PinSheet({ onClose }: { onClose: () => void }) {
  const steps = ["Enter Current PIN", "Enter New PIN", "Confirm New PIN"];
  const [step, setStep] = useState(0);
  const [pin, setPin] = useState("");
  const [fresh, setFresh] = useState("");
  const enter = (value: string) => {
    if (value.length !== 4) return;
    if (step === 0) { setStep(1); setPin(""); }
    else if (step === 1) { setFresh(value); setStep(2); setPin(""); }
    else if (value !== fresh) { toast.error("PINs do not match"); setStep(1); setPin(""); }
    else { toast.success("PIN updated (demo only)"); onClose(); }
  };
  return <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
    <DialogContent className="w-[calc(100vw-2rem)] max-w-sm">
      <DialogTitle className="text-center">{steps[step]}</DialogTitle>
      <DialogDescription className="sr-only">Change your four digit PIN.</DialogDescription>
      <div className="flex justify-center gap-3">{[0, 1, 2, 3].map((i) => <span key={i} className={cn("size-3 rounded-full border border-foreground", i < pin.length && "bg-foreground")} />)}</div>
      <PinPad pin={pin} onDigit={(d) => { if (pin.length >= 4) return; const n = pin + d; setPin(n); if (n.length === 4) setTimeout(() => enter(n), 150); }}
        onClear={() => setPin("")} onBackspace={() => setPin((p) => p.slice(0, -1))} />
    </DialogContent>
  </Dialog>;
}
