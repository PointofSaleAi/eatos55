import { useState } from "react";
import {
  ArrowLeft,
  Beer,
  Check,
  ChevronDown,
  Clock,
  Coffee,
  ConciergeBell,
  EyeOff,
  Lock,
  MapPin,
  ShoppingBag,
  Trees,
  User,
  UserCog,
  UtensilsCrossed,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

type Option = { name: string; icon: LucideIcon; tone: string };

export const jobRoles: Option[] = [
  { name: "Server", icon: UtensilsCrossed, tone: "text-emerald-400" },
  { name: "Host", icon: ConciergeBell, tone: "text-sky-400" },
  { name: "Bartender", icon: Beer, tone: "text-pink-400" },
  { name: "Manager", icon: UserCog, tone: "text-yellow-400" },
  { name: "Barista", icon: Coffee, tone: "text-orange-400" },
  { name: "Runner", icon: User, tone: "text-cyan-400" },
];

export const clockInCenters: Option[] = [
  { name: "Dine Center", icon: UtensilsCrossed, tone: "text-yellow-400" },
  { name: "Main Hall", icon: MapPin, tone: "text-blue-400" },
  { name: "Outdoor Patio", icon: Trees, tone: "text-emerald-400" },
  { name: "Private Dining", icon: Lock, tone: "text-violet-400" },
  { name: "Bar Area", icon: Wine, tone: "text-pink-400" },
  { name: "Takeout Counter", icon: ShoppingBag, tone: "text-cyan-400" },
];

export const moods = [
  { name: "Happy", emoji: "😄", words: ["Joyful", "Cheerful", "Delighted", "Satisfied", "Ecstatic", "Blissful", "Radiant", "Elated", "Gleeful", "Amused", "Jubilant", "Exuberant", "Overjoyed", "Thrilled", "Pleased"] },
  { name: "Energized", emoji: "😍", words: ["Lively", "Pumped", "Vibrant", "Excited", "Alert", "Dynamic", "Charged", "Spirited", "Zestful"] },
  { name: "Motivated", emoji: "😎", words: ["Driven", "Focused", "Determined", "Inspired", "Ambitious", "Confident", "Ready", "Eager"] },
  { name: "Emotional", emoji: "🥺", words: ["Sensitive", "Tender", "Moved", "Overwhelmed", "Nostalgic", "Anxious", "Tired", "Low"] },
  { name: "Okay", emoji: "🤠", words: ["Fine", "Calm", "Steady", "Neutral", "Relaxed", "Content", "Balanced"] },
  { name: "Thankful", emoji: "😊", words: ["Grateful", "Appreciative", "Blessed", "Fortunate", "Humble", "Content", "Warm"] },
];

const tileBase =
  "flex min-h-[clamp(4.5rem,11dvh,6.5rem)] flex-col items-center justify-center gap-1.5 rounded-xl border bg-surface/10 px-2 text-center text-fs-sm font-bold text-shell-foreground transition-[filter,transform] hover:brightness-110 active:scale-[0.98]";

function Grid({ options, value, onPick }: { options: Option[]; value?: string | undefined; onPick: (n: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map(({ name, icon: Icon, tone }) => (
        <button
          key={name}
          type="button"
          onClick={() => onPick(name)}
          className={cn(tileBase, name === value ? "border-shell-foreground/60 bg-surface/20" : "border-transparent")}
        >
          <Icon className={cn("size-7", tone)} aria-hidden />
          <span className="leading-tight">{name}</span>
        </button>
      ))}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Back"
      onClick={onClick}
      className="grid size-10 place-items-center rounded-pill bg-surface/15 text-shell-foreground hover:bg-surface/25"
    >
      <ArrowLeft className="size-5" />
    </button>
  );
}

function CheckHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="grid size-12 place-items-center rounded-pill bg-gate-success text-shell-foreground">
        <Check className="size-6" strokeWidth={3} />
      </span>
      <p className="mt-1 text-fs-lg font-extrabold text-shell-foreground">{title}</p>
      <p className="text-fs-sm text-shell-foreground/70">{subtitle}</p>
    </div>
  );
}

export function RoleStep({ name, value, onBack, onPick }: { name: string; value?: string | undefined; onBack: () => void; onPick: (r: string) => void }) {
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2);
  return (
    <div className="flex flex-col gap-4">
      <BackButton onClick={onBack} />
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="grid size-16 place-items-center rounded-pill bg-surface/20 text-fs-lg font-extrabold text-shell-foreground">{initials}</span>
        <p className="mt-1 text-fs-lg font-extrabold text-shell-foreground">{name}</p>
        <p className="text-fs-sm text-shell-foreground/70">Select your job type</p>
      </div>
      <Grid options={jobRoles} value={value} onPick={onPick} />
    </div>
  );
}

function SummaryRow({ icon: Icon, tone, label, value, open, onToggle }: { icon: LucideIcon; tone: string; label: string; value: string; open?: boolean; onToggle?: () => void }) {
  const Comp = onToggle ? "button" : "div";
  return (
    <Comp
      type={onToggle ? "button" : undefined}
      onClick={onToggle}
      aria-expanded={onToggle ? open : undefined}
      className="flex w-full items-center gap-3 rounded-xl bg-surface/10 px-3 py-3 text-left"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-surface/15">
        <Icon className={cn("size-5", tone)} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-fs-xs text-shell-foreground/70">{label}</span>
        <span className="block text-fs-base font-extrabold text-shell-foreground">{value}</span>
      </span>
      {onToggle ? <ChevronDown className={cn("size-5 text-shell-foreground/70 transition-transform", open && "rotate-180")} /> : null}
    </Comp>
  );
}

export function SummaryStep({
  name, time, center, role, onCenter, onRole, onContinue,
}: { name: string; time: string; center: string; role: string; onCenter: (c: string) => void; onRole: (r: string) => void; onContinue: () => void }) {
  const [open, setOpen] = useState<"center" | "role" | null>(null);
  const c = clockInCenters.find((x) => x.name === center) ?? clockInCenters[0]!;
  const r = jobRoles.find((x) => x.name === role) ?? jobRoles[0]!;
  return (
    <div className="flex flex-col gap-2.5">
      <CheckHeader title="Clocked In!" subtitle={`Welcome back, ${name}`} />
      <div className="mt-2 flex flex-col gap-2.5">
        <SummaryRow icon={Clock} tone="text-shell-foreground" label="Clocked In At" value={time} />
        <SummaryRow icon={c.icon} tone={c.tone} label="Revenue Center" value={c.name} open={open === "center"} onToggle={() => setOpen(open === "center" ? null : "center")} />
        {open === "center" ? <Grid options={clockInCenters} value={c.name} onPick={(n) => { onCenter(n); setOpen(null); }} /> : null}
        <SummaryRow icon={r.icon} tone={r.tone} label="Role" value={r.name} open={open === "role"} onToggle={() => setOpen(open === "role" ? null : "role")} />
        {open === "role" ? <Grid options={jobRoles} value={r.name} onPick={(n) => { onRole(n); setOpen(null); }} /> : null}
      </div>
      <button type="button" onClick={onContinue} className="mt-1 h-12 rounded-xl bg-shell-foreground text-fs-base font-extrabold text-shell">
        Continue
      </button>
    </div>
  );
}

function FinishButtons({ enabled, onSubmit, onSkip }: { enabled: boolean; onSubmit: () => void; onSkip: () => void }) {
  return (
    <>
      <button
        type="button"
        disabled={!enabled}
        onClick={onSubmit}
        className="h-12 rounded-xl bg-gate-success text-fs-base font-extrabold text-shell-foreground transition-opacity disabled:opacity-45"
      >
        Submit &amp; Done
      </button>
      <button type="button" onClick={onSkip} className="mx-auto px-4 py-1 text-fs-sm text-shell-foreground/70 hover:text-shell-foreground">
        Skip
      </button>
    </>
  );
}

export function MoodStep({ name, value, onBack, onPick, onSubmit, onSkip }: { name: string; value?: string | undefined; onBack: () => void; onPick: (m: string) => void; onSubmit: () => void; onSkip: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <BackButton onClick={onBack} />
      <CheckHeader title="Clocked In!" subtitle={`Welcome, ${name}`} />
      <p className="text-center text-fs-base font-extrabold text-shell-foreground">How are you feeling today?</p>
      <div className="grid grid-cols-3 gap-2">
        {moods.map((m) => (
          <button
            key={m.name}
            type="button"
            onClick={() => onPick(m.name)}
            className={cn(tileBase, m.name === value ? "border-shell-foreground/60 bg-surface/20" : "border-transparent")}
          >
            <span className="text-[2rem] leading-none" aria-hidden>{m.emoji}</span>
            {m.name}
          </button>
        ))}
      </div>
      <FinishButtons enabled={Boolean(value)} onSubmit={onSubmit} onSkip={onSkip} />
    </div>
  );
}

export function MoodDetailStep({ mood, onBack, onSubmit, onSkip }: { mood: string; onBack: () => void; onSubmit: () => void; onSkip: () => void }) {
  const m = moods.find((x) => x.name === mood) ?? moods[0]!;
  const [picked, setPicked] = useState<string[]>([]);
  const [anon, setAnon] = useState(true);
  return (
    <div className="flex flex-col gap-3">
      <BackButton onClick={onBack} />
      <div className="flex flex-col items-center gap-1">
        <span className="text-[3.5rem] leading-none" aria-hidden>{m.emoji}</span>
        <p className="text-fs-lg font-extrabold text-shell-foreground">{m.name}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {m.words.map((w) => {
          const on = picked.includes(w);
          return (
            <button
              key={w}
              type="button"
              aria-pressed={on}
              onClick={() => setPicked((p) => (on ? p.filter((x) => x !== w) : [...p, w]))}
              className={cn(
                "rounded-pill px-3.5 py-2 text-fs-xs font-bold uppercase tracking-wide transition-colors",
                on ? "bg-shell-foreground text-shell" : "bg-surface/15 text-shell-foreground hover:bg-surface/25",
              )}
            >
              {w}
            </button>
          );
        })}
      </div>
      <label className="flex items-center gap-2 rounded-xl bg-surface/10 px-3 py-3 text-fs-sm text-shell-foreground">
        <EyeOff className="size-4 opacity-70" aria-hidden />
        <span className="flex-1">Share anonymously</span>
        <Switch checked={anon} onCheckedChange={setAnon} />
      </label>
      <FinishButtons enabled onSubmit={onSubmit} onSkip={onSkip} />
    </div>
  );
}
