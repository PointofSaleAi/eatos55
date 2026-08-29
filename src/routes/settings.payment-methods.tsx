import { createFileRoute } from "@tanstack/react-router";
import {
  Banknote,
  BadgeDollarSign,
  BedDouble,
  Bike,
  Building2,
  CalendarClock,
  CreditCard,
  Gift,
  HandHeart,
  Heart,
  Landmark,
  Link2,
  Nfc,
  QrCode,
  Radio,
  Receipt,
  Smartphone,
  Split,
  SquareUser,
  Ticket,
  UploadCloud,
  UserCog,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import {
  Caption,
  GroupCard,
  GroupLabel,
  IconDualToggleRow,
  IconSelectRow,
  IconValueRow,
  ToggleColumnHeaders,
  type TileColor,
} from "@/components/pos/settings-rows";
import { brand, isTenderVisible, tenderLabel } from "@/lib/brand";
import { usePos, TENDER_LABELS, type TenderId } from "@/lib/pos-store";

export const Route = createFileRoute("/settings/payment-methods")({
  head: () => ({
    meta: [
      { title: `Payment Methods - ${brand.appName} Point of Sale settings` },
      {
        name: "description",
        content:
          "Choose your payment provider, pair a card reader, then switch tenders on or off so only the payment methods you accept appear at tender.",
      },
      { property: "og:title", content: `Payment Methods - ${brand.appName} Point of Sale settings` },
      {
        property: "og:description",
        content:
          "Choose your payment provider, pair a card reader, then switch the tenders you accept on or off.",
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
      { id: "card-present", icon: CreditCard, color: "blue" },
      { id: "contactless", icon: Nfc, color: "sky" },
      { id: "manual-card", icon: CreditCard, color: "indigo" },
      { id: "manual-cc", icon: BadgeDollarSign, color: "violet" },
      { id: "external", icon: UploadCloud, color: "slate" },
      { id: "amex", icon: CreditCard, color: "black" },
      { id: "split", icon: Split, color: "purple" },
    ],
  },
  {
    title: "Wallets",
    rows: [
      { id: "apple-pay", icon: Smartphone, color: "black" },
      { id: "google-pay", icon: Smartphone, color: "grey" },
    ],
  },
  {
    title: "Remote and alternative",
    rows: [
      { id: "pay-by-link", icon: Link2, color: "blue" },
      { id: "qr", icon: QrCode, color: "slate" },
      { id: "open-banking", icon: Building2, color: "green" },
      { id: "bank-transfer", icon: Landmark, color: "grey" },
      { id: "paypal", icon: Wallet, color: "indigo" },
      { id: "klarna", icon: CalendarClock, color: "pink" },
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
      { id: "staff", icon: UserCog, color: "violet" },
    ],
  },
  {
    title: "Cash-like and vouchers",
    rows: [
      { id: "cheque", icon: Receipt, color: "sky" },
      { id: "voucher", icon: Ticket, color: "yellow" },
      { id: "round-up", icon: Banknote, color: "green" },
    ],
  },
  {
    title: "Lodging",
    rows: [{ id: "room", icon: BedDouble, color: "purple" }],
  },
  {
    title: "Delivery partners",
    rows: [
      { id: "deliveroo", icon: Bike, color: "sky" },
      { id: "just-eat", icon: Utensils, color: "orange" },
      { id: "uber", icon: Bike, color: "black" },
      { id: "doordash", icon: Bike, color: "red" },
      { id: "grubhub", icon: Utensils, color: "orange" },
    ],
  },
];

const readerModels: Record<string, string[]> = {
  Adyen: ["Adyen S1F2", "Adyen S1E2", "Adyen AMS1", "Tap to Pay on device"],
  Stripe: ["BBPOS WisePOS E", "Stripe Reader S700", "Tap to Pay on device"],
};

const connections = ["Bluetooth", "LAN", "Cloud"];

const DELIVERY_IDS = new Set(["deliveroo", "just-eat", "uber", "doordash", "grubhub"]);

function PaymentMethodsSettings() {
  const { settings, updateSettings, canManageSettings } = usePos();
  const tenders = settings.tenders;
  // Delivery partners are regional: Grubhub is US-only, Deliveroo/Just Eat are not US.

  const autoClose = settings.tenderAutoClose;

  const set = (id: TenderId, value: boolean) =>
    updateSettings({ tenders: { ...tenders, [id]: value } });

  const setAutoClose = (id: TenderId, value: boolean) =>
    updateSettings({ tenderAutoClose: { ...autoClose, [id]: value } });

  const provider = settings.paymentProvider;
  const models = readerModels[provider] ?? [];

  const setProvider = (value: string) => {
    if (!canManageSettings) return;
    const next = value === "Stripe" ? "Stripe" : "Adyen";
    updateSettings({
      paymentProvider: next,
      cardReaderModel: readerModels[next]![0]!,
      cardReaderStatus: "Not paired",
    });
  };

  return (
    <>
      <SubHeader title="Payment Methods" />
      <ScreenBody className="py-2">
        <GroupLabel>Payment provider</GroupLabel>
        <GroupCard>
          <IconSelectRow
            title="Provider"
            icon={Radio}
            color="magenta"
            value={provider}
            options={["Adyen", "Stripe"]}
            onChange={setProvider}
            disabled={!canManageSettings}
          />
          <IconValueRow
            title="Merchant account"
            icon={Building2}
            color="slate"
            value={`${provider} · ${settings.livePin}`}
          />
        </GroupCard>
        <Caption>
          The provider clears every card payment taken on this device. Changing it unpairs the
          current card reader.
        </Caption>

        <GroupLabel>Card reader</GroupLabel>
        <GroupCard>
          <IconSelectRow
            title="Reader"
            icon={CreditCard}
            color="blue"
            value={settings.cardReaderModel}
            options={models}
            onChange={(v) => canManageSettings && updateSettings({ cardReaderModel: v })}
            disabled={!canManageSettings}
          />
          <IconSelectRow
            title="Connection"
            icon={Nfc}
            color="sky"
            value={settings.cardReaderConnection}
            options={connections}
            onChange={(v) => canManageSettings && updateSettings({ cardReaderConnection: v })}
            disabled={!canManageSettings}
          />
          <IconValueRow
            title={settings.cardReaderStatus === "Connected" ? "Test reader" : "Pair reader"}
            icon={Radio}
            color="green"
            value={settings.cardReaderStatus}
            onClick={() => {
              if (!canManageSettings) return;
              if (settings.cardReaderStatus === "Connected") {
                toast.success(`${settings.cardReaderModel} responded to the test charge`);
                return;
              }
              updateSettings({ cardReaderStatus: "Connected" });
              toast.success(`${settings.cardReaderModel} paired over ${settings.cardReaderConnection}`);
            }}
          />
          <IconValueRow
            title="Firmware"
            icon={UploadCloud}
            color="grey"
            value={settings.readerFirmware}
          />
        </GroupCard>

        {sections.map((section) => {
          const rows = section.rows.filter((row) => isTenderVisible(row.id));
          if (rows.length === 0) return null;
          return (
            <div key={section.title}>
              <GroupLabel>{section.title}</GroupLabel>
              <ToggleColumnHeaders
                primary="Enabled"
                secondary="Auto Close Payment"
                shortPrimary="On"
                shortSecondary="Auto Close"
              />
              <GroupCard>
                {rows.map((row) => {
                  const enabled = row.locked ? true : tenders[row.id];
                  return (
                    <IconDualToggleRow
                      key={row.id}
                      title={tenderLabel(row.id, TENDER_LABELS[row.id])}
                      icon={row.icon}
                      color={row.color}
                      checked={enabled}
                      onChange={(v) => {
                        if (row.locked || !canManageSettings) return;
                        set(row.id, v);
                      }}
                      secondaryLabel="Auto Close Payment"
                      secondaryChecked={autoClose[row.id]}
                      secondaryDisabled={!enabled || !canManageSettings}
                      onSecondaryChange={(v) => {
                        if (!enabled || !canManageSettings) return;
                        setAutoClose(row.id, v);
                      }}
                    />
                  );
                })}
              </GroupCard>
              {section.title === "Lodging" && !settings.roomService ? (
                <Caption>
                  Room Charge also needs the Room service module switched on in Settings &gt; General.
                </Caption>
              ) : null}
            </div>
          );
        })}
        <Caption>
          Only the methods switched on here appear on the payment screen. Cash always stays available
          so a check can be tendered.
        </Caption>
        <Caption>
          If Auto Close Payment is enabled, the order closes automatically once a payment with that
          method completes successfully.
        </Caption>
      </ScreenBody>
    </>
  );
}
