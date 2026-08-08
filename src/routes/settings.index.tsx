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
  SquarePen,
  Tablet,
  UserRoundCog,
  Utensils,
  Wallet,
  Wifi,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BottomTabs, ScreenBody } from "@/components/pos/shell";
import { GroupCard, IconNavRow, type TileColor } from "@/components/pos/settings-rows";
import { EmptyState } from "@/components/pos/primitives";
import { PinSheet } from "@/components/pos/pin-sheet";
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
  const { session, settings, signOut, startOrder } = usePos();
  const [query, setQuery] = useState("");
  const [pinOpen, setPinOpen] = useState(false);

  const groups = useMemo<Row[][]>(
    () => [
      [
        { title: "General", icon: UserRoundCog, color: "green", to: "/settings/general" },
        { title: "Control Center", icon: SmartphoneNfc, color: "violet", to: "/settings/control-center" },
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
      ],
      [
        {
          title: "Switch User",
          icon: Settings2,
          color: "slate",
          onClick: () => setPinOpen(true),
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
        <h1 className="px-1 text-4xl font-extrabold tracking-tight text-foreground">Settings</h1>

        <label className="mt-4 flex min-h-[56px] items-center gap-3 rounded-xl bg-secondary px-4">
          <Search className="size-6 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="min-w-0 flex-1 bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground"
          />
          <Mic className="size-6 shrink-0 text-muted-foreground" />
        </label>

        <GroupCard className="mt-6">
          <div className="flex items-center gap-4 px-4 py-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-secondary text-xl font-medium text-foreground">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-2xl font-extrabold text-foreground">{session.name}</p>
              <p className="truncate text-lg text-muted-foreground">{session.role}</p>
            </div>
          </div>
          <div className="border-t border-border px-4 py-3">
            <p className="text-lg text-foreground">Clocked in at {settings.clockedInAt}</p>
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
        <div className="h-6" />
      </ScreenBody>

      <button
        type="button"
        aria-label="New ticket"
        onClick={() => {
          startOrder();
          navigate({ to: "/order/new" });
        }}
        className="absolute bottom-20 right-4 z-10 grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
      >
        <SquarePen className="size-7" />
      </button>

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

      <BottomTabs />
    </>
  );
}
