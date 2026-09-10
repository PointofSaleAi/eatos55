import { createFileRoute, useParams } from "@tanstack/react-router";
import { brand } from "@/lib/brand";
import { Check, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import {
  Caption,
  GroupCard,
  GroupLabel,
  IconToggleRow,
  IconValueRow,
  settingsRowClass,
} from "@/components/pos/settings-rows";
import {
  usePos,
  TENDER_LABELS,
  type AppSettings,
  type SettingsListItem,
  type TenderId,
} from "@/lib/pos-store";
import { settingsDetails, type DetailRow } from "@/lib/settings-details";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings/detail/$topic")({
  head: () => ({
    meta: [
      { title: `Settings detail - ${brand.appName} Handheld` },
      {
        name: "description",
        content: "Device, menu, payment, hardware and workforce settings detail on the handheld.",
      },
      { property: "og:title", content: `Settings detail - ${brand.appName} Handheld` },
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

type EditTarget =
  | { type: "text"; label: string; field: keyof AppSettings; value: string }
  | {
      type: "item";
      label: string;
      field: keyof AppSettings;
      id: string | null;
      name: string;
      detail: string;
    };

function SettingsDetail() {
  const { topic } = useParams({ from: "/settings/detail/$topic" });
  const { settings, updateSettings, canManageSettings } = usePos();
  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditTarget | null>(null);
  const screen = settingsDetails[topic];

  if (!screen) {
    return (
      <>
        <SubHeader title="Not found" backLabel="Settings" />
        <ScreenBody className="grid place-items-center">
          <p className="text-fs-sm text-muted-foreground">This settings screen is not available.</p>
        </ScreenBody>
      </>
    );
  }

  const Icon = screen.icon;
  const rows = screen.rows ?? [];
  const listRows = rows.filter((r): r is Extract<DetailRow, { kind: "list" }> => r.kind === "list");
  const fieldRows = rows.filter((r) => r.kind !== "list");
  const str = (field: keyof AppSettings) => String(settings[field] ?? "");
  const bool = (field: keyof AppSettings) => Boolean(settings[field]);
  const list = (field: keyof AppSettings) => (settings[field] as SettingsListItem[]) ?? [];
  const tipTenderIds: TenderId[] = [
    "card-present",
    "cash",
    "contactless",
    "tap-to-pay",
    "manual-card",
    "manual-cc",
    "external",
    "pay-by-link",
    "qr",
    "open-banking",
    "bank-transfer",
    "paypal",
    "klarna",
    "cheque",
    "voucher",
    "account",
    "gift",
    "loyalty",
    "in-kind",
    "staff",
    "room",
  ];

  const saveItem = (field: keyof AppSettings, item: SettingsListItem, id: string | null) => {
    const current = list(field);
    const next = id
      ? current.map((i) => (i.id === id ? item : i))
      : [...current, { ...item, id: `x${Date.now()}` }];
    updateSettings({ [field]: next } as Partial<AppSettings>);
  };

  const removeItem = (field: keyof AppSettings, id: string) =>
    updateSettings({ [field]: list(field).filter((i) => i.id !== id) } as Partial<AppSettings>);

  return (
    <>
      <SubHeader title={screen.title} backLabel={screen.backLabel ?? "Settings"} />
      <ScreenBody className="py-2">
        {screen.intro ? (
          <p className="px-1 pb-4 text-fs-sm leading-relaxed text-muted-foreground">
            {screen.intro}
          </p>
        ) : null}

        {fieldRows.length ? (
          <GroupCard>
            {fieldRows.map((row) => {
              if (row.kind === "tender-tips") {
                return (
                  <div key={row.label}>
                    <div className="border-b border-border bg-muted/40 px-4 py-2 text-fs-xs font-bold uppercase text-muted-foreground">
                      {row.label}
                    </div>
                    {tipTenderIds.map((id) => (
                      <IconToggleRow
                        key={id}
                        title={TENDER_LABELS[id]}
                        checked={settings.tipTenders?.[id] ?? id === "card-present"}
                        onChange={(checked) =>
                          updateSettings({
                            tipTenders: { ...settings.tipTenders, [id]: checked },
                          })
                        }
                      />
                    ))}
                  </div>
                );
              }
              if (row.kind === "readonly") {
                return (
                  <IconValueRow
                    key={row.label}
                    title={row.label}
                    {...(row.value ? { value: row.value } : {})}
                  />
                );
              }

              if (row.kind === "toggle") {
                if (!canManageSettings) {
                  return (
                    <IconValueRow
                      key={row.label}
                      title={row.label}
                      value={bool(row.field) ? "On" : "Off"}
                    />
                  );
                }
                return (
                  <IconToggleRow
                    key={row.label}
                    title={row.label}
                    checked={bool(row.field)}
                    onChange={(v) => updateSettings({ [row.field]: v } as Partial<AppSettings>)}
                  />
                );
              }

              if (row.kind === "text") {
                return (
                  <IconValueRow
                    key={row.label}
                    title={row.label}
                    value={str(row.field)}
                    {...(canManageSettings
                      ? {
                          onClick: () =>
                            setEdit({
                              type: "text",
                              label: row.label,
                              field: row.field,
                              value: str(row.field),
                            }),
                        }
                      : {})}
                  />
                );
              }

              // choice
              const open = openPicker === row.label;
              if (!canManageSettings) {
                return <IconValueRow key={row.label} title={row.label} value={str(row.field)} />;
              }
              return (
                <div key={row.label} className="border-b border-border last:border-b-0">
                  <button
                    type="button"
                    onClick={() => setOpenPicker(open ? null : row.label)}
                    aria-expanded={open}
                    className={cn(settingsRowClass, "border-b-0 transition-colors hover:bg-muted")}
                  >
                    <span className="min-w-0 flex-1 truncate t-row text-foreground">
                      {row.label}
                    </span>
                    <span className="shrink-0 truncate t-value text-muted-foreground">
                      {str(row.field)}
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform",
                        open && "rotate-180",
                      )}
                    />
                  </button>
                  {open ? (
                    <div className="bg-muted/40">
                      {row.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            updateSettings({ [row.field]: option } as Partial<AppSettings>);
                            setOpenPicker(null);
                          }}
                          className={cn(
                            settingsRowClass,
                            "pl-8 transition-colors hover:bg-muted",
                          )}
                        >
                          <span className="min-w-0 flex-1 truncate t-row text-foreground">
                            {option}
                          </span>
                          {str(row.field) === option ? (
                            <Check className="size-4 shrink-0 text-accent" />
                          ) : null}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </GroupCard>
        ) : null}

        {listRows.map((row) => {
          const items = list(row.field);
          return (
            <div key={row.label}>
              <GroupLabel>{row.label}</GroupLabel>
              {items.length ? (
                <GroupCard>
                  {items.map((item) => (
                    <div key={item.id} className={settingsRowClass}>
                      <button
                        type="button"
                        disabled={!canManageSettings}
                        onClick={() =>
                          setEdit({
                            type: "item",
                            label: row.label,
                            field: row.field,
                            id: item.id,
                            name: item.name,
                            detail: item.detail,
                          })
                        }
                        className="flex min-w-0 flex-1 items-center gap-row text-left"
                      >
                        <span className="min-w-0 flex-1 truncate t-row text-foreground">
                          {item.name}
                        </span>
                        <span className="shrink-0 truncate t-value text-muted-foreground">
                          {item.detail}
                        </span>
                      </button>
                      {canManageSettings ? (
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeItem(row.field, item.id)}
                          className="grid size-11 shrink-0 place-items-center rounded-md text-destructive transition-colors hover:bg-muted"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </GroupCard>
              ) : (
                <div className="grid place-items-center rounded-card border border-border bg-surface px-6 py-10 text-center">
                  {Icon ? <Icon className="mb-3 size-8 text-muted-foreground" /> : null}
                  <p className="text-fs-sm text-muted-foreground">
                    {screen.empty ?? "Nothing configured yet."}
                  </p>
                </div>
              )}
              {canManageSettings ? (
                <GroupCard className="mt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEdit({
                        type: "item",
                        label: row.label,
                        field: row.field,
                        id: null,
                        name: "",
                        detail: "",
                      })
                    }
                    className={cn(settingsRowClass, "transition-colors hover:bg-muted")}
                  >
                    <Plus className="size-4 shrink-0 text-accent" />
                    <span className="min-w-0 flex-1 truncate t-row text-accent">
                      {row.addLabel ?? "Add"}
                    </span>
                  </button>
                </GroupCard>
              ) : null}
            </div>
          );
        })}

        {screen.note ? <Caption>{screen.note}</Caption> : null}
        {!canManageSettings ? <Caption>Only managers can change these settings.</Caption> : null}
        <div className="h-6" />
      </ScreenBody>

      {edit ? (
        <EditSheet
          target={edit}
          onClose={() => setEdit(null)}
          onSave={(next) => {
            if (next.type === "text") {
              updateSettings({ [next.field]: next.value } as Partial<AppSettings>);
            } else {
              saveItem(
                next.field,
                { id: next.id ?? "", name: next.name, detail: next.detail },
                next.id,
              );
            }
            setEdit(null);
          }}
        />
      ) : null}
    </>
  );
}

function EditSheet({
  target,
  onClose,
  onSave,
}: {
  target: EditTarget;
  onClose: () => void;
  onSave: (t: EditTarget) => void;
}) {
  const [draft, setDraft] = useState<EditTarget>(target);
  useEffect(() => setDraft(target), [target]);

  const disabled =
    draft.type === "text" ? draft.value.trim() === "" : draft.name.trim() === "";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={draft.label}
      className="fixed inset-0 z-[70] flex items-end justify-center md:items-center"
    >
      <button
        type="button"
        aria-label="Cancel"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div className="relative m-3 w-full max-w-[26rem] rounded-sheet border border-border bg-surface p-4 pb-[calc(1rem+var(--sab,0px))] md:pb-4">
        <p className="pb-3 text-center text-fs-base font-extrabold text-foreground">
          {draft.label}
        </p>
        <div className="grid gap-3">
          {draft.type === "text" ? (
            <input
              autoFocus
              value={draft.value}
              onChange={(e) => setDraft({ ...draft, value: e.target.value })}
              className="min-h-ctl-md w-full rounded-card border border-border bg-background px-3 text-fs-sm text-foreground"
              aria-label={draft.label}
            />
          ) : (
            <>
              <input
                autoFocus
                value={draft.name}
                placeholder="Name"
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="min-h-ctl-md w-full rounded-card border border-border bg-background px-3 text-fs-sm text-foreground"
                aria-label="Name"
              />
              <input
                value={draft.detail}
                placeholder="Details"
                onChange={(e) => setDraft({ ...draft, detail: e.target.value })}
                className="min-h-ctl-md w-full rounded-card border border-border bg-background px-3 text-fs-sm text-foreground"
                aria-label="Details"
              />
            </>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSave(draft)}
            className="min-h-ctl-md w-full rounded-pill bg-accent text-fs-sm font-extrabold text-accent-foreground disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-ctl-md w-full rounded-pill border border-border text-fs-sm font-bold text-foreground"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
