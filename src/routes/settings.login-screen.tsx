import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  GroupCard,
  GroupLabel,
  IconToggleRow,
} from "@/components/pos/settings-rows";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/settings/login-screen")({
  head: () => ({
    meta: [
      { title: "Login Screen — eatOS Point of Sale settings" },
      {
        name: "description",
        content: "Manage the sign-in carousel slides, venue label and clock-in weather panel.",
      },
      { property: "og:title", content: "Login Screen — eatOS Point of Sale settings" },
      {
        property: "og:description",
        content: "Manage the sign-in carousel slides, venue label and clock-in weather panel.",
      },
    ],
  }),
  component: LoginScreenSettings,
});

function LoginScreenSettings() {
  const { settings, updateSettings, canManageSettings } = usePos();

  const guard = () => {
    if (canManageSettings) return true;
    toast.error("Only managers can change these settings.");
    return false;
  };

  const patchSlide = (id: string, patch: Partial<(typeof settings.loginSlides)[number]>) => {
    if (!guard()) return;
    updateSettings({
      loginSlides: settings.loginSlides.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  };

  return (
    <>
      <SubHeader title="Login Screen" backLabel="Settings" />
      <ScreenBody className="py-2">
        <GroupLabel>Sign-in carousel</GroupLabel>
        <div className="space-y-3">
          {settings.loginSlides.map((slide, i) => (
            <GroupCard key={slide.id}>
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <img
                  src={slide.image}
                  alt=""
                  loading="lazy"
                  className="size-14 shrink-0 rounded-row object-cover"
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor={`${slide.id}-headline`} className="text-fs-xs">
                      Slide {i + 1} headline
                    </Label>
                    <Input
                      id={`${slide.id}-headline`}
                      value={slide.headline}
                      onChange={(e) => patchSlide(slide.id, { headline: e.target.value })}
                      className="h-11 rounded-row bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`${slide.id}-image`} className="text-fs-xs">
                      Image URL
                    </Label>
                    <Input
                      id={`${slide.id}-image`}
                      value={slide.image}
                      onChange={(e) => patchSlide(slide.id, { image: e.target.value })}
                      className="h-11 rounded-row bg-background"
                    />
                  </div>
                </div>
              </div>
              <IconToggleRow
                title="Show this slide"
                checked={slide.enabled}
                onChange={(v) => patchSlide(slide.id, { enabled: v })}
              />
            </GroupCard>
          ))}
        </div>

        <GroupLabel>Clock-in panel</GroupLabel>
        <GroupCard>
          <div className="space-y-3 px-4 py-3">
            <div className="space-y-1">
              <Label htmlFor="venue-location" className="text-fs-xs">
                Venue location
              </Label>
              <Input
                id="venue-location"
                value={settings.venueLocation}
                onChange={(e) => {
                  if (!guard()) return;
                  updateSettings({ venueLocation: e.target.value });
                }}
                className="h-11 rounded-row bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="weather-temp" className="text-fs-xs">
                  Temperature
                </Label>
                <Input
                  id="weather-temp"
                  value={settings.weatherTemp}
                  onChange={(e) => {
                    if (!guard()) return;
                    updateSettings({ weatherTemp: e.target.value });
                  }}
                  className="h-11 rounded-row bg-background"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="weather-condition" className="text-fs-xs">
                  Condition
                </Label>
                <Input
                  id="weather-condition"
                  value={settings.weatherCondition}
                  onChange={(e) => {
                    if (!guard()) return;
                    updateSettings({ weatherCondition: e.target.value });
                  }}
                  className="h-11 rounded-row bg-background"
                />
              </div>
            </div>
          </div>
        </GroupCard>
      </ScreenBody>
    </>
  );
}
