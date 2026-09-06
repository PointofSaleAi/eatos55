import { Link } from "@tanstack/react-router";
import { CheckCircle2, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePos, type TapToPayState } from "@/lib/pos-store";

/**
 * Tap to Pay on iPhone shared pieces.
 *
 * Apple naming rule: always the full product name, never a short form. Every
 * enable button reads "Set Up Tap to Pay on iPhone" and the checkout button
 * reads exactly "Tap to Pay on iPhone" with nothing appended.
 */
export const TTP = "Tap to Pay on iPhone";
export const TTP_SET_UP = `Set Up ${TTP}`;

export const ttpCopy = {
  awarenessTitle: "Accept payments right on this iPhone",
  awarenessBody:
    "Take contactless cards and digital wallets with Tap to Pay on iPhone. No extra card reader needed.",
  benefits: [
    "Contactless credit and debit cards",
    "Apple Pay, Apple Watch and digital wallets",
    "Sales land in your usual payouts",
  ],
  later: "Not now",
  onboardingEyebrow: "One last thing",
  settingsRowDetail: "Use this iPhone as your card reader",
  unavailable: "Available on iPhone XS or later, in supported regions",
};

/**
 * Contactless mark. The iOS build must use the SF Symbol
 * wave.3.right.circle.fill; this is the web stand-in for the same shape.
 */
export function TapToPayMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-6", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="9.2" />
      <path d="M9 8.4c1.9 1.7 1.9 5.5 0 7.2" />
      <path d="M11.8 7c2.6 2.4 2.6 7.6 0 10" />
      <path d="M14.6 5.8c3.2 3 3.2 9.4 0 12.4" />
    </svg>
  );
}

/** Apple-supplied artwork and system sheets are never redrawn by us. */
export function AppleAssetSlot({
  label,
  detail,
  className,
}: {
  label: string;
  detail?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-row border border-dashed border-border bg-muted/40 px-4 py-6 text-center",
        className,
      )}
    >
      <TapToPayMark className="size-7 text-muted-foreground" />
      <p className="text-fs-sm font-bold text-foreground">{label}</p>
      <p className="text-fs-xs text-muted-foreground">
        {detail ?? "Apple-supplied artwork from the Tap to Pay on iPhone Marketing Toolkit"}
      </p>
    </div>
  );
}

export function ttpStatusLabel(state: TapToPayState) {
  switch (state) {
    case "ready":
      return "Ready";
    case "configuring":
      return "Setting up";
    case "needsAttention":
      return "Needs attention";
    case "ineligible":
      return "Not available";
    default:
      return "Set up";
  }
}

export function TtpStatusPill({ state }: { state: TapToPayState }) {
  const tone =
    state === "ready"
      ? "bg-success/15 text-success"
      : state === "needsAttention"
        ? "bg-warning/15 text-warning"
        : "bg-muted text-muted-foreground";
  return (
    <span className={cn("shrink-0 rounded-pill px-2.5 py-1 text-fs-xs font-bold", tone)}>
      {ttpStatusLabel(state)}
    </span>
  );
}

/** Bullet list used on the awareness screens. */
export function TtpBenefits() {
  return (
    <ul className="space-y-2">
      {ttpCopy.benefits.map((b) => (
        <li key={b} className="flex items-start gap-2 text-fs-sm text-foreground">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Home nudge (requirement 3.1). Returns after the awareness screen is
 * dismissed and disappears for good once this device is ready.
 */
export function TapToPayNudge({ className }: { className?: string }) {
  const { settings, updateSettings } = usePos();
  const state = settings.tapToPayState;
  if (state === "ready" || state === "ineligible" || state === "configuring") return null;
  if (settings.tapToPayDismissedAt === "hidden") return null;

  return (
    <div className={cn("rounded-card border border-border bg-surface p-3", className)}>
      <div className="flex items-start gap-2">
        <TapToPayMark className="mt-0.5 size-5 shrink-0 text-foreground" />
        <div className="min-w-0 flex-1">
          <p className="text-fs-sm font-extrabold text-foreground">
            Take card payments on this iPhone
          </p>
          <p className="mt-0.5 text-fs-xs text-muted-foreground">
            Set up {TTP} once and this device works as your card reader.
          </p>
        </div>
        <button
          type="button"
          aria-label="Hide this reminder"
          onClick={() => updateSettings({ tapToPayDismissedAt: "hidden" })}
          className="grid size-8 shrink-0 place-items-center rounded-pill text-muted-foreground transition-colors hover:bg-muted"
        >
          <X className="size-4" />
        </button>
      </div>
      <Link
        to="/tap-to-pay/setup/$from"
        params={{ from: "nudge" }}
        className="mt-3 flex h-ctl-md w-full items-center justify-center rounded-row bg-primary text-fs-sm font-extrabold text-primary-foreground transition-colors"
      >
        {TTP_SET_UP}
      </Link>
    </div>
  );
}

/** Settings and Help rows both link into the same status screen. */
export function TapToPaySettingsLink({ className }: { className?: string }) {
  const { settings } = usePos();
  return (
    <Link
      to="/settings/tap-to-pay"
      className={cn(
        "flex min-h-ctl-lg items-center gap-3 px-3 py-2 transition-colors hover:bg-muted",
        className,
      )}
    >
      <TapToPayMark className="size-5 shrink-0 text-foreground" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-fs-sm font-bold text-foreground">{TTP}</span>
        <span className="block truncate text-fs-xs text-muted-foreground">
          {settings.tapToPayState === "ineligible"
            ? ttpCopy.unavailable
            : ttpCopy.settingsRowDetail}
        </span>
      </span>
      <TtpStatusPill state={settings.tapToPayState} />
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}
