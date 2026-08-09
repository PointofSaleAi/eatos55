import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Briefcase,
  FileText,
  Headset,
  Mic,
  Search,
  Settings2,
  SmartphoneNfc,
  Tablet,
  UserRoundCog,
  Utensils,
  Wallet,
  Wifi,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MenuButton, ScreenBody } from "@/components/pos/shell";
import { GroupCard, IconNavRow, type TileColor } from "@/components/pos/settings-rows";
import { EmptyState } from "@/components/pos/primitives";
import { PinSheet } from "@/components/pos/pin-sheet";
import { cn } from "@/lib/utils";
import { SearchDock } from "@/components/pos/search-dock";
import { usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/settings/")({
  head: () => ({
    meta: [
      { title: "Settings — EATOS Handheld" },
      {
        name: "description",
        content: "Device, menu, payments, workforce and hardware settings for the handheld app.",
      },
      { property: "og:title", content: "Settings — EATOS Handheld" },
      {
        property: "og:description",
        content: "Device, menu, payments, workforce and hardware settings for the handheld app.",
      },
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
  const { session, settings, signOut } = usePos();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);

  const groups = useMemo<Row[][]>(
    () => [
      [
        { title: "General", icon: UserRoundCog, color: "green", to: "/settings/general" },
        {
          title: "Control Center",
          icon: SmartphoneNfc,
          color: "violet",
          to: "/settings/control-center",
        },
        { title: "Menu", icon: Utensils, color: "orange", to: "/settings/menu" },
        { title: "Payments", icon: Wallet, color: "indigo", to: "/settings/payments" },
        { title: "Workforce", icon: Briefcase, color: "purple", to: "/settings/workforce" },
        {
          title: "Sales Summary Report",
          icon: FileText,
          color: "slate",
          to: "/settings/sales-summary",
        },
      ],
      [
        { title: "Network", icon: Wifi, color: "sky", to: "/settings/network" },
        { title: "Hardware", icon: Tablet, color: "violet", to: "/settings/hardware" },
      ],
      [
        { title: "Notifications", icon: Bell, color: "grey", to: "/settings/notifications" },
        { title: "Customer Support", icon: Headset, color: "red", to: "/system/customer-support" },
        { title: "Contact Us", icon: Mail, color: "blue", to: "/system/contact-us" },
        { title: "Help Center", icon: LifeBuoy, color: "sky", to: "/system/help-center" },
      ],
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
              const ok = await confirm({
                title: "Sign out?",
                message: "You will need to sign in again to use this device.",
                confirmLabel: "Sign Out",
                destructive: true,
              });
              if (!ok) return;
              signOut();
              navigate({ to: "/" });
            })();
          },
        },
      ],
    ],
    [],
  );

  const q = query.trim().toLowerCase();
  const filtered = groups
    .map((g) => g.filter((r) => r.title.toLowerCase().includes(q)))
    .filter((g) => g.length > 0);

  const initials = session.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <>
      <ScreenBody className="pt-5">
        <div className="flex min-w-0 items-center gap-1">
          <MenuButton className="-ml-2" />
          <h1 className="truncate text-fs-xl font-extrabold text-foreground">Settings</h1>
        </div>

        <button
          type="button"
          onClick={() => setSearching(true)}
          className="mt-4 flex min-h-ctl-lg w-full items-center gap-3 rounded-pill border border-border bg-surface px-4 text-left transition-colors hover:bg-muted"
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
          <Mic className="size-6 shrink-0 text-muted-foreground" />
        </button>

        <SearchDock
          open={searching}
          value={query}
          onChange={setQuery}
          onClose={() => setSearching(false)}
          placeholder="Search settings"
        />

        <GroupCard className="mt-6">
          <div className="flex items-center gap-4 px-4 py-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-pill bg-muted text-fs-sm font-extrabold text-foreground">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-fs-base font-extrabold text-foreground">{session.name}</p>
              <p className="truncate text-fs-xs text-muted-foreground">{session.role}</p>
            </div>
          </div>
          <div className="border-t border-border px-4 py-3">
            <p className="text-fs-xs text-muted-foreground">Clocked in at {settings.clockedInAt}</p>
          </div>
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
          toast.success("Signed out — switch user");
          navigate({ to: "/access/clock-in" });
        }}
      />
    </>
  );
}
