import { createFileRoute } from "@tanstack/react-router";
import { Bug, FileUp, MessageCircleMore, MessageSquare, RotateCw, Triangle } from "lucide-react";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import {
  Caption,
  GroupCard,
  GroupLabel,
  IconNavRow,
  IconToggleRow,
  IconValueRow,
} from "@/components/pos/settings-rows";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/system/customer-support")({
  head: () => ({
    meta: [
      { title: "Customer Support — EATOS Handheld" },
      {
        name: "description",
        content: "User feedback tools, live chat, Live Pin and log uploads for EATOS support.",
      },
      { property: "og:title", content: "Customer Support — EATOS Handheld" },
      {
        property: "og:description",
        content: "User feedback tools, live chat, Live Pin and log uploads for EATOS support.",
      },
    ],
  }),
  component: CustomerSupport,
});

function randomPin() {
  const chars = "ABCDEF0123456789";
  return `F${Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")}`;
}

function CustomerSupport() {
  const { settings, updateSettings } = usePos();

  return (
    <>
      <SubHeader title="Customer Support" />
      <ScreenBody className="py-2">
        <GroupLabel>User Feedback</GroupLabel>
        <div className="space-y-1">
          <GroupCard>
            <IconToggleRow
              title="Sentry"
              icon={Triangle}
              color="magenta"
              checked={settings.sentry}
              onChange={(v) => updateSettings({ sentry: v })}
            />
          </GroupCard>
          <GroupCard>
            <IconToggleRow
              title="Instabug"
              icon={Bug}
              color="magenta"
              checked={settings.instabug}
              onChange={(v) => updateSettings({ instabug: v })}
            />
          </GroupCard>
        </div>
        <Caption>Error monitoring and performance tracking in real-time.</Caption>

        <GroupCard className="mt-6">
          <IconNavRow
            title="Chat"
            icon={MessageSquare}
            color="blue"
            onClick={() => toast.success("Chat request sent · an agent will join shortly")}
          />
          <IconNavRow
            title="Contact Us"
            icon={MessageCircleMore}
            color="grey"
            to="/system/contact-us"
          />
          <IconValueRow
            title="Live Pin"
            icon={MessageCircleMore}
            color="grey"
            right={
              <>
              <button
                type="button"
                aria-label="Regenerate Live Pin"
                onClick={() => {
                  const next = randomPin();
                  updateSettings({ livePin: next });
                  toast.success(`New Live Pin ${next}`);
                }}
                className="grid size-9 shrink-0 place-items-center rounded-pill text-foreground transition-colors hover:bg-muted"
              >
                <RotateCw className="size-5" />
              </button>
              <span className="shrink-0 text-fs-sm font-bold text-foreground">{settings.livePin}</span>
              </>
            }
          />
          <IconNavRow
            title="Upload Logs"
            icon={FileUp}
            color="black"
            onClick={() => toast.success("Device logs uploaded to EATOS support")}
          />
        </GroupCard>
      </ScreenBody>
    </>
  );
}
