import { createFileRoute, useParams } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Caption, GroupCard, GroupLabel, IconValueRow } from "@/components/pos/settings-rows";
import { usePos } from "@/lib/pos-store";
import { settingsDetails } from "@/lib/settings-details";

export const Route = createFileRoute("/settings/detail/$topic")({
  head: () => ({
    meta: [
      { title: "Settings detail — EATOS Handheld" },
      {
        name: "description",
        content: "Device, menu, payment, hardware and workforce settings detail on the handheld.",
      },
      { property: "og:title", content: "Settings detail — EATOS Handheld" },
      {
        property: "og:description",
        content: "Device, menu, payment, hardware and workforce settings detail on the handheld.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsDetail,
});

function SettingsDetail() {
  const { topic } = useParams({ from: "/settings/detail/$topic" });
  const { settings, updateSettings } = usePos();
  const screen = settingsDetails[topic];

  if (!screen) {
    return (
      <>
        <SubHeader title="Not found" backLabel="Settings" />
        <ScreenBody className="grid place-items-center">
          <p className="text-sm text-muted-foreground">This settings screen is not available.</p>
        </ScreenBody>
      </>
    );
  }

  const Icon = screen.icon;

  return (
    <>
      <SubHeader title={screen.title} backLabel={screen.backLabel ?? "Settings"} />
      <ScreenBody className="py-2">
        {screen.intro ? (
          <p className="px-1 pb-4 text-sm leading-relaxed text-muted-foreground">{screen.intro}</p>
        ) : null}

        {screen.choice ? (
          <>
            <GroupLabel>{screen.choice.label}</GroupLabel>
            <GroupCard>
              {screen.choice.options.map((option) => {
                const field = screen.choice!.field;
                const selected = settings[field] === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateSettings({ [field]: option })}
                    className="flex min-h-[60px] w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">
                      {option}
                    </span>
                    {selected ? <Check className="size-4 shrink-0 text-accent" /> : null}
                  </button>
                );
              })}
            </GroupCard>
          </>
        ) : null}

        {screen.rows?.length ? (
          <GroupCard {...(screen.choice ? { className: "mt-6" } : {})}>
            {screen.rows.map((row) => (
              <IconValueRow
                key={row.label}
                title={row.label}
                {...(row.value ? { value: row.value } : {})}
              />
            ))}
          </GroupCard>
        ) : null}

        {screen.empty ? (
          <div className="grid place-items-center px-6 py-16 text-center">
            {Icon ? <Icon className="mb-3 size-8 text-muted-foreground" /> : null}
            <p className="text-sm text-muted-foreground">{screen.empty}</p>
          </div>
        ) : null}

        {screen.note ? <Caption>{screen.note}</Caption> : null}
        <div className="h-6" />
      </ScreenBody>
    </>
  );
}
