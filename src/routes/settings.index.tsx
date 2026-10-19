import { Link, Navigate, createFileRoute, useNavigate } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { Bell, ChevronRight, LogOut, Mic, Search, Settings2 } from "lucide-react";
import { isSettingsDestinationVisible, settingsDestinations } from "@/lib/settings-destinations";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ScreenBody, useWideLayout } from "@/components/pos/shell";
import { GroupCard, IconNavRow, type TileColor } from "@/components/pos/settings-rows";
import { EmptyState } from "@/components/pos/primitives";
import { PinSheet } from "@/components/pos/pin-sheet";
import { cn } from "@/lib/utils";
import { SearchDock } from "@/components/pos/search-dock";
import { useVoiceSearch } from "@/lib/voice-search";
import { usePos } from "@/lib/pos-store";
import { useProfileSettings } from "@/lib/profile-settings";
import { useConfirm } from "@/components/pos/confirm-sheet";

export const Route = createFileRoute("/settings/")({
  head: () => ({
    meta: [
      { title: `Settings - ${brand.appName} Handheld` },
      {
        name: "description",
        content: "Device, menu, payments, workforce and hardware settings for the handheld app.",
      },
      { property: "og:title", content: `Settings - ${brand.appName} Handheld` },
      {
        property: "og:description",
        content: "Device, menu, payments, workforce and hardware settings for the handheld app.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsHub,
});

type Row = {
  title: string;
  icon: typeof Bell;
  color: TileColor;
  to?: string;
  onClick?: () => void;
};

function SettingsHub() {
  const navigate = useNavigate();
  const { session, settings, signOut, canManageSettings } = usePos();
  const { profile } = useProfileSettings();
  const confirmAction = useConfirm();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const { listening, start: startVoice } = useVoiceSearch(setQuery);
  const [pinOpen, setPinOpen] = useState(false);
  const wide = useWideLayout();

  const groups = useMemo<Row[][]>(
    () => [
      settingsDestinations
        .filter((row) => isSettingsDestinationVisible(row, session, canManageSettings))
        .map((row) => ({ title: row.label, icon: row.icon, color: row.color, to: row.to })),
      [
        {
          title: "Switch User",
          icon: Settings2,
          color: "slate",
          onClick: () => setPinOpen(true),
        },
        {
          title: "Sign Out",
          icon: LogOut,
          color: "red",
          onClick: () => {
            void (async () => {
              const ok = await confirmAction({
                title: "Sign out?",
                message: "You will need to sign in again to use this device.",
                confirmLabel: "Sign Out",
                destructive: true,
              });
              if (!ok) return;
              signOut();
              navigate({ to: "/", replace: true });
            })();
          },
        },
      ],
    ],
    [canManageSettings, session.role, session.clockedIn, confirmAction, navigate, signOut],
  );

  const q = query.trim().toLowerCase();
  const filtered = groups
    .map((g) => g.filter((r) => r.title.toLowerCase().includes(q)))
    .filter((g) => g.length > 0);

  const initials = session.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  // Landscape keeps the settings sidebar alongside the detail pane, so the hub
  // list would be a duplicate: land on General instead of an empty pane.
  if (wide) return <Navigate to="/settings/general" replace />;

  return (
    <>
      <ScreenBody className="pt-5">
        <div className="flex min-w-0 items-center gap-1">
          <h1 className="truncate text-fs-xl font-extrabold text-foreground">Settings</h1>

        </div>

        <div className="mt-4 flex min-h-ctl-md w-full items-center gap-2 rounded-pill border border-border bg-surface px-4 transition-colors hover:bg-muted">
          <button
            type="button"
            onClick={() => setSearching(true)}
            className="flex min-h-tap min-w-0 flex-1 items-center gap-3 text-left"
          >
            <Search className="size-6 shrink-0 text-muted-foreground" />
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-fs-sm",
                query ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {query || "Search"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSearching(true);
              startVoice();
            }}
            aria-label="Search settings by voice"
            aria-pressed={listening}
            className={cn(
              "grid size-8 tap-safe shrink-0 place-items-center rounded-pill transition-colors",
              listening
                ? "animate-pulse text-accent"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Mic className="size-6" />
          </button>
        </div>

        <SearchDock
          open={searching}
          value={query}
          onChange={setQuery}
          onClose={() => setSearching(false)}
          placeholder="Search settings"
          compact
          voice={{ listening, onStart: startVoice }}
        />

        <GroupCard className="mt-6">
          <Link to="/settings/profile" aria-label="Open profile" className="block hover:bg-muted">
          <div className="flex items-center gap-4 px-4 py-4">
            {profile.photo ? <img src={profile.photo} alt="" className="size-12 shrink-0 rounded-pill object-cover" /> :
            <span className="grid size-12 shrink-0 place-items-center rounded-pill bg-muted text-fs-sm font-extrabold text-foreground">
              {initials}
            </span>}
            <div className="min-w-0 flex-1">
              <p className="truncate text-fs-base font-extrabold text-foreground">{session.name}</p>
              <p className="truncate text-fs-xs text-muted-foreground">{session.role}</p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </div>
          <div className="border-t border-border px-4 py-3">
            <p className="text-fs-xs text-muted-foreground">{session.clockedIn ? `Clocked in at ${settings.clockedInAt}` : "Not Clocked-In"}</p>
          </div>
          </Link>
        </GroupCard>

        {filtered.length === 0 ? (
          <EmptyState title="No settings found" detail="Try a different search term." />
        ) : (
          filtered.map((group, i) => (
            <GroupCard key={i} className="mt-6">
              {group.map((row) => (
                <IconNavRow
                  key={row.title}
                  title={row.title}
                  icon={row.icon}
                  color={row.color}
                  {...(row.to ? { to: row.to } : { onClick: row.onClick ?? (() => {}) })}
                />
              ))}
            </GroupCard>
          ))
        )}
      </ScreenBody>

      <PinSheet
        open={pinOpen}
        onOpenChange={setPinOpen}
        onSubmit={() => {
          setPinOpen(false);
          signOut();
          toast.success("Signed out - switch user");
          navigate({ to: "/access/clock-in", replace: true });
        }}
      />
    </>
  );
}
