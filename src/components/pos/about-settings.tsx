import { useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { GroupCard, GroupLabel, IconValueRow, settingsRowClass } from "@/components/pos/settings-rows";
import { cn } from "@/lib/utils";

import {
  APP_BUILD_DATE,
  APP_BUILD_VERSION,
  APP_FLUTTER_VERSION,
} from "@/lib/demo-data";

const softwareRows: [string, string][] = [
  ["App Version", APP_BUILD_VERSION],
  ["Flutter Version", APP_FLUTTER_VERSION],
  ["Build Date", APP_BUILD_DATE],
];

const termsRows: { label: string; topic?: string }[] = [
  { label: "Privacy Policy", topic: "doc-privacy-policy" },
  { label: "Legal Terms", topic: "doc-legal-terms" },
  { label: "Report Fraud", topic: "doc-report-fraud" },
];

export function AboutSettings() {
  const navigate = useNavigate();

  const deviceRows: [string, string][] = [
    ["Device Name", "Point of Sale"],
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
              onClick={() =>
                row.topic &&
                navigate({ to: "/settings/detail/$topic", params: { topic: row.topic } })
              }
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
