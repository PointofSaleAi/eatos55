import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ScreenBody, ScreenHeader } from "@/components/pos/shell";
import { ActionRow, Card, NavRow, SectionLabel, ToggleRow } from "@/components/pos/primitives";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/settings/more")({
  head: () => ({
    meta: [
      { title: "More settings — EATOS Handheld" },
      { name: "description", content: "Advanced device options, support and legal information." },
      { property: "og:title", content: "More settings — EATOS Handheld" },
      {
        property: "og:description",
        content: "Advanced device options, support and legal information.",
      },
    ],
  }),
  component: MoreSettings,
});

function MoreSettings() {
  const { settings, updateSettings } = usePos();
  const { appearance, setAppearance } = useAppearance();

  return (
    <>
      <ScreenHeader eyebrow="Settings" title="More" back />
      <ScreenBody>
        <SectionLabel>Appearance</SectionLabel>
        <Card className="overflow-hidden p-3">
          <div
            role="radiogroup"
            aria-label="Appearance"
            className="grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1"
          >
            {(["light", "dark", "system"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={appearance === mode}
                onClick={() => setAppearance(mode)}
                className={
                  "min-h-ctl-sm rounded-xl text-fs-sm font-extrabold capitalize transition-colors " +
                  (appearance === mode
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {mode}
              </button>
            ))}
          </div>
          <p className="px-1 pt-2 text-fs-xs text-muted-foreground">
            System follows your phone&apos;s light or dark setting.
          </p>
        </Card>

        <SectionLabel>Device behaviour</SectionLabel>

        <Card className="overflow-hidden">
          <ToggleRow
            title="Offline mode"
            detail="Keep taking orders without a network"
            checked={settings.offlineMode}
            onChange={(v) => updateSettings({ offlineMode: v })}
          />
          <ToggleRow
            title="Haptic feedback"
            detail="Vibrate on keypad and payment"
            checked={settings.hapticFeedback}
            onChange={(v) => updateSettings({ hapticFeedback: v })}
          />
          <ToggleRow
            title="Dark kitchen display"
            detail="Use the dark KDS theme"
            checked={settings.darkKds}
            onChange={(v) => updateSettings({ darkKds: v })}
          />
        </Card>

        <SectionLabel>Support</SectionLabel>
        <Card className="overflow-hidden">
          <NavRow to="/system/customer-support" title="Customer support" detail="Chat, call, email" />
          <NavRow to="/system/help-center" title="Help center" detail="Guides and troubleshooting" />
        </Card>

        <SectionLabel>Advanced</SectionLabel>
        <Card className="overflow-hidden">
          <ActionRow
            title="Clear local cache"
            detail="Removes cached menu images"
            onClick={() => toast.success("Local cache cleared")}
          />
          <ActionRow
            title="Reset device"
            detail="Unpairs this handheld from the venue"
            tone="danger"
            onClick={() => toast.error("Reset requires an owner PIN")}
          />
        </Card>
      </ScreenBody>
    </>
  );
}
