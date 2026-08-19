import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeDollarSign,
  BedDouble,
  Bike,
  CreditCard,
  Gift,
  HandHeart,
  Heart,
  Landmark,
  Split,
  SquareUser,
  UploadCloud,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import {
  Caption,
  GroupCard,
  GroupLabel,
  IconToggleRow,
  type TileColor,
} from "@/components/pos/settings-rows";
import { usePos, type TenderId } from "@/lib/pos-store";

export const Route = createFileRoute("/settings/payment-methods")({
  head: () => ({
    meta: [
      { title: "Payment Methods - eatOS Point of Sale settings" },
      {
        name: "description",
        content: "Switch tenders on or off so only the payment methods you accept appear at tender.",
      },
      { property: "og:title", content: "Payment Methods - eatOS Point of Sale settings" },
      {
        property: "og:description",
        content: "Switch tenders on or off so only the payment methods you accept appear at tender.",
      },
    ],
  }),
  component: PaymentMethodsSettings,
});

type Row = { id: TenderId; icon: LucideIcon; color: TileColor; locked?: boolean };

const sections: { title: string; rows: Row[] }[] = [
  {
    title: "Standard",
    rows: [
      { id: "cash", icon: Wallet, color: "green", locked: true },
      { id: "manual-card", icon: CreditCard, color: "blue" },
      { id: "manual-cc", icon: BadgeDollarSign, color: "indigo" },
      { id: "external", icon: UploadCloud, color: "sky" },
      { id: "split", icon: Split, color: "violet" },
    ],
  },
  {
    title: "Accounts and rewards",
    rows: [
      { id: "account", icon: SquareUser, color: "slate" },
      { id: "house", icon: Landmark, color: "grey" },
      { id: "gift", icon: Gift, color: "magenta" },
      { id: "loyalty", icon: Heart, color: "pink" },
      { id: "in-kind", icon: HandHeart, color: "orange" },
    ],
  },
  {
    title: "Lodging",
    rows: [{ id: "room", icon: BedDouble, color: "purple" }],
  },
  {
    title: "Delivery partners",
    rows: [
      { id: "uber", icon: Bike, color: "yellow" },
      { id: "doordash", icon: Bike, color: "red" },
      { id: "grubhub", icon: Utensils, color: "orange" },
    ],
  },
];

const labels: Record<TenderId, string> = {
  cash: "Cash",
  "manual-card": "Manual Card",
  "manual-cc": "Manual CC",
  external: "External CC",
  split: "Split Check",
  account: "Account",
  house: "House",
  gift: "Gift Card",
  loyalty: "Loyalty",
  "in-kind": "In-kind",
  room: "Room Charge",
  uber: "Uber Eats",
  doordash: "Doordash",
  grubhub: "Grubhub",
};

function PaymentMethodsSettings() {
  const { settings, updateSettings, canManageSettings } = usePos();
  const tenders = settings.tenders;

  const set = (id: TenderId, value: boolean) =>
    updateSettings({ tenders: { ...tenders, [id]: value } });

  return (
    <>
      <SubHeader title="Payment Methods" />
      <ScreenBody className="py-2">
        {sections.map((section) => (
          <div key={section.title}>
            <GroupLabel>{section.title}</GroupLabel>
            <GroupCard>
              {section.rows.map((row) => (
                <IconToggleRow
                  key={row.id}
                  title={labels[row.id]}
                  icon={row.icon}
                  color={row.color}
                  checked={row.locked ? true : tenders[row.id]}
                  onChange={(v) => {
                    if (row.locked || !canManageSettings) return;
                    set(row.id, v);
                  }}
                />
              ))}
            </GroupCard>
            {section.title === "Lodging" && !settings.roomService ? (
              <Caption>
                Room Charge also needs the Room service module switched on in Settings &gt; General.
              </Caption>
            ) : null}
          </div>
        ))}
        <Caption>
          Only the methods switched on here appear on the payment screen. Cash always stays available
          so a check can be tendered.
        </Caption>
      </ScreenBody>
    </>
  );
}
