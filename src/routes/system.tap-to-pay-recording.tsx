import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { ScreenBody, ScreenHeader } from "@/components/pos/shell";
import { ActionRow, Card, SectionLabel } from "@/components/pos/primitives";
import { TTP } from "@/components/pos/tap-to-pay";

export const Route = createFileRoute("/system/tap-to-pay-recording")({
  head: () => ({
    meta: [
      { title: `${TTP} recording guide - ${brand.appName}` },
      {
        name: "description",
        content:
          "Step by step guide to recording the new user, existing user and checkout clips Apple asks for when reviewing Tap to Pay on iPhone.",
      },
      { property: "og:title", content: `${TTP} recording guide - ${brand.appName}` },
      {
        property: "og:description",
        content: "The new user, existing user and checkout clips Apple asks for, in order.",
      },
    ],
  }),
  component: RecordingGuide,
});

type Clip = {
  id: string;
  title: string;
  detail: string;
  to?: { path: string; step?: string; from?: string };
};

/**
 * Apple asked for a New User video, an Existing User video and a Checkout
 * video, with the checkout recorded on a second physical device. This screen
 * lists the exact route to walk for each clip so a store recording matches the
 * requirement numbers.
 */
const clips: Clip[] = [
  {
    id: "1",
    title: "Clip 1 · New user sees the invitation",
    detail: "Fresh install, first sign in. Requirements 3.1, 3.3, 3.5",
    to: { path: "welcome" },
  },
  {
    id: "2",
    title: "Clip 2 · New user completes setup",
    detail: "Apple terms sheet, progress, ready. Requirements 3.4, 3.7",
    to: { path: "setup", from: "awareness" },
  },
  {
    id: "3",
    title: "Clip 3 · Education straight after setup",
    detail: "Contactless card, then wallets. Requirements 4.1, 4.4, 4.5",
    to: { path: "education", step: "1" },
  },
  {
    id: "4",
    title: "Clip 4 · Existing user turns it on from Settings",
    detail: "Permanent entry point outside checkout. Requirement 3.6",
    to: { path: "settings" },
  },
  {
    id: "5",
    title: "Clip 5 · Existing user turns it on at checkout",
    detail: "Ticket held, setup, back to the same ticket. Requirement 3.2",
    to: { path: "setup", from: "checkout" },
  },
  {
    id: "6",
    title: "Clip 6 · Checkout on a real card",
    detail: "Film this one with a second device. Screen recordings are rejected",
    to: { path: "payment" },
  },
];

function RecordingGuide() {
  const navigate = useNavigate();

  const go = (to: Clip["to"]) => {
    if (!to) return;
    if (to.path === "welcome") navigate({ to: "/tap-to-pay/welcome" });
    else if (to.path === "setup")
      navigate({ to: "/tap-to-pay/setup/$from", params: { from: to.from ?? "awareness" } });
    else if (to.path === "education")
      navigate({ to: "/tap-to-pay/education/$step", params: { step: to.step ?? "1" } });
    else if (to.path === "settings") navigate({ to: "/settings/tap-to-pay" });
    else navigate({ to: "/payment/method" });
  };

  return (
    <>
      <ScreenHeader eyebrow="System" title="Recording guide" back />
      <ScreenBody>
        <p className="px-1 pb-3 text-fs-sm leading-relaxed text-muted-foreground">
          Record these six clips in order, on a device that has never had {TTP} switched on. The
          checkout clip must be filmed with a second camera, not captured from the screen.
        </p>
        <SectionLabel>Clips</SectionLabel>
        <Card className="overflow-hidden">
          {clips.map((c) => (
            <ActionRow key={c.id} title={c.title} detail={c.detail} onClick={() => go(c.to)} />
          ))}
        </Card>
        <SectionLabel>Before you film</SectionLabel>
        <Card className="overflow-hidden">
          <ActionRow
            title="Reset this device to not set up"
            detail="So clips 1 to 3 show a genuine first run"
            onClick={() => navigate({ to: "/settings/tap-to-pay" })}
          />
        </Card>
      </ScreenBody>
    </>
  );
}
