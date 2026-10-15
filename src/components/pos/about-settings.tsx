import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { GroupCard, GroupLabel, IconValueRow, settingsRowClass } from "@/components/pos/settings-rows";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

const softwareRows: [string, string][] = [
  ["Software Name", "lcrOS Point of Sale"],
  ["App Version", "5.1.1004+1004"],
  ["Flutter Version", "FL 3.47.4"],
  ["Build Date", "BD 09.10.26"],
];

const termsRows: { label: string; url?: string }[] = [
  { label: "Privacy Policy", url: "https://www.eatos.com/privacy-policy" },
  { label: "Legal Terms", url: "https://www.eatos.com/terms-and-conditions" },
  { label: "Report Fraud" },
];

function openTermsRow(row: { label: string; url?: string }) {
  if (row.url) {
    window.open(row.url, "_blank", "noopener,noreferrer");
    return;
  }
  toast.info(`${row.label} opens in the full app.`, {
    description: "This demo does not include the linked document.",
  });
}

export function AboutSettings() {
  const { settings } = usePos();

  const deviceRows: [string, string][] = [
    ["Device Name", settings.deviceName || "LCROS-ee3a"],
    ["OS Name", "iPadOS"],
    ["OS Version", "26.5"],
    ["Model Name", "iPad"],
    ["Serial Number", "DEE090ED-2D8C-56D9-BBEE-CDA59A0F90CF"],
    ["Inbuilt CFD", "Not Connected"],
  ];

  return (
    <>
      <SubHeader title="About" backLabel="General" />
      <ScreenBody className="py-2">
        <GroupLabel>Software</GroupLabel>
        <GroupCard>
          {softwareRows.map(([label, value]) => (
            <IconValueRow key={label} title={label} value={value} />
          ))}
        </GroupCard>

        <GroupLabel>Device</GroupLabel>
        <GroupCard>
          {deviceRows.map(([label, value]) => (
            <IconValueRow key={label} title={label} value={value} />
          ))}
        </GroupCard>

        <GroupLabel>Terms & Policies</GroupLabel>
        <GroupCard>
          {termsRows.map((row) => (
            <button
              key={row.label}
              type="button"
              onClick={() => openTermsRow(row)}
              className={cn(settingsRowClass, "transition-colors hover:bg-muted")}
            >
              <span className="min-w-0 flex-1 truncate t-row text-foreground">{row.label}</span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </GroupCard>
        <div className="h-6" />
      </ScreenBody>
    </>
  );
}
