import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, CreditCard, Lock, Smartphone, Wallet, Watch } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import contactlessVideo from "@/assets/tap-to-pay-contactless_1.mp4.asset.json";
import applePayPhoneVideo from "@/assets/tap-to-pay-apple-pay-iphone.mp4.asset.json";
import applePayWatchVideo from "@/assets/tap-to-pay-apple-pay-watch.mp4.asset.json";
import walletsVideo from "@/assets/tap-to-pay-digital-wallets.mp4.asset.json";
import pinEntryVideo from "@/assets/tap-to-pay-pin-entry.mp4.asset.json";
import { brand } from "@/lib/brand";
import { TTP } from "@/components/pos/tap-to-pay";

export const Route = createFileRoute("/tap-to-pay/education/$step")({
  head: () => ({
    meta: [
      { title: `How to use ${TTP} - ${brand.appName} Point of Sale` },
      {
        name: "description",
        content:
          "How Tap to Pay on iPhone works: contactless cards, Apple Pay on iPhone and Apple Watch, other digital wallets and secure PIN entry.",
      },
      { property: "og:title", content: `How to use ${TTP} - ${brand.appName} Point of Sale` },
      {
        property: "og:description",
        content: "Contactless cards, Apple Pay, digital wallets and secure PIN entry.",
      },
    ],
  }),
  component: TapToPayEducation,
});

type Step = {
  icon: LucideIcon;
  title: string;
  points: string[];
  tip?: string;
  video: string;
};

const steps: Step[] = [
  {
    icon: CreditCard,
    title: "Accept Contactless Payments",
    points: [
      "Ask your customer to hold their contactless card near the top of your iPhone.",
      "When the checkmark appears, the card has been read and the payment is being processed securely.",
    ],
    tip: "For best results, align the chip of the card near the top edge of the iPhone and hold it steady.",
  },
  {
    icon: Smartphone,
    title: "Apple Pay on iPhone",
    points: [
      "Customers can pay using Apple Pay on their iPhone.",
      "Ask them to hold their iPhone near the top of your device until the payment is confirmed.",
    ],
  },
  {
    icon: Watch,
    title: "Apple Pay on Apple Watch",
    points: [
      "Customers can also pay using Apple Pay on Apple Watch.",
      "Hold the watch near the top of your iPhone until the payment completes.",
    ],
  },
  {
    icon: Wallet,
    title: "Other Digital Wallets & Wearables",
    points: [
      "Tap to Pay on iPhone supports other contactless wallets and wearable devices.",
      "Customers can hold their compatible phone or wearable near the top of your device to complete the payment.",
    ],
  },
  {
    icon: Lock,
    title: "Secure PIN Entry",
    points: [
      "Some payments require the customer to enter a PIN.",
      "When required, a secure PIN entry screen will automatically appear on the device. Customers can enter their PIN directly on the screen.",
      "Accessibility options are available for customers who need assistance.",
    ],
  },
];

function TapToPayEducation() {
  const { step } = useParams({ from: "/tap-to-pay/education/$step" });
  const navigate = useNavigate();

  const index = Math.min(Math.max(Number(step) || 1, 1), steps.length) - 1;
  const current = steps[index]!;
  const Icon = current.icon;
  const isLast = index === steps.length - 1;

  const go = (next: number) =>
    navigate({ to: "/tap-to-pay/education/$step", params: { step: String(next + 1) } });

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background px-[var(--pad-screen)] pb-[calc(1rem+var(--tabs-h,0px))] pt-4">
      <div className="mx-auto flex w-full max-w-[34rem] flex-1 flex-col">
        <div className="flex items-center justify-end">
          <span className="text-fs-sm font-semibold text-muted-foreground">
            {index + 1} of {steps.length}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2" aria-hidden>
          {steps.map((s, i) => (
            <span
              key={s.title}
              className={
                i <= index
                  ? "h-[3px] flex-1 rounded-pill bg-foreground"
                  : "h-[3px] flex-1 rounded-pill bg-border"
              }
            />
          ))}
        </div>

        <div className="mt-5 overflow-hidden rounded-card">
          <img
            src={tapToPayImage.url}
            alt="Contactless payment being taken on an iPhone"
            className="mx-auto h-auto w-full max-w-[18rem] object-contain"
            loading={index === 0 ? "eager" : "lazy"}
          />
        </div>

        <div className="mt-5 flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-row bg-muted">
            <Icon className="size-5 text-foreground" aria-hidden />
          </span>
          <h1 className="text-fs-lg font-extrabold text-foreground">{current.title}</h1>
        </div>

        <ol className="mt-4 space-y-3">
          {current.points.map((p, i) => (
            <li key={p} className="flex gap-2 text-fs-sm leading-relaxed text-muted-foreground">
              <span className="shrink-0 tabular-nums">{i + 1}.</span>
              <span>{p}</span>
            </li>
          ))}
        </ol>

        {current.tip ? (
          <div className="mt-4 rounded-card border border-border bg-accent/5 px-3 py-3 text-fs-sm leading-relaxed text-muted-foreground">
            <span aria-hidden>💡 </span>
            {current.tip}
          </div>
        ) : null}

        <div className="mt-auto flex items-center gap-3 pt-8">
          {index > 0 ? (
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="flex h-ctl-lg flex-1 items-center justify-center gap-1 rounded-pill bg-muted text-fs-base font-bold text-foreground"
            >
              <ChevronLeft className="size-4" aria-hidden />
              Previous
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => (isLast ? navigate({ to: "/settings/tap-to-pay" }) : go(index + 1))}
            className="flex h-ctl-lg flex-[1.4] items-center justify-center gap-1 rounded-pill bg-primary text-fs-base font-bold text-primary-foreground"
          >
            {isLast ? "Got It" : "Next"}
            {isLast ? null : <ChevronRight className="size-4" aria-hidden />}
          </button>
        </div>
      </div>
    </div>
  );
}
