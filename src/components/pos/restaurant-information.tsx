import { useState } from "react";
import { ChevronRight, LocateFixed, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { usePos, type AppSettings } from "@/lib/pos-store";
import { formatPhoneFor, isValidPhoneFor, phoneCountries, phoneCountryByName, phoneErrorFor } from "@/lib/phone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GroupCard, GroupLabel, Caption } from "@/components/pos/settings-rows";
import { ScreenBody, SubHeader } from "@/components/pos/shell";
import { Wordmark } from "@/components/pos/brand";
import { restaurantTypes } from "@/lib/demo-data";

type Field = "restaurantName" | "restaurantType" | "restaurantEmail" | "restaurantPhone";

export function RestaurantInformation() {
  const { settings, updateSettings, canManageSettings } = usePos();
  const [editing, setEditing] = useState<{ field: Field; label: string } | null>(null);
  const [draft, setDraft] = useState("");
  const [phoneCountry, setPhoneCountry] = useState(settings.restaurantCountry);
  const [error, setError] = useState("");
  const address = [settings.restaurantAddress, settings.restaurantAddress2, settings.restaurantCity, settings.restaurantPostCode, settings.restaurantCountry].filter(Boolean).join(", ");
  const [addressDraft, setAddressDraft] = useState<string | null>(null);

  const open = (field: Field, label: string) => {
    setError("");
    setEditing({ field, label });
    if (field === "restaurantPhone") {
      const country = phoneCountries.find(c => settings.restaurantPhone.startsWith(c.dial)) ?? phoneCountryByName(settings.restaurantCountry);
      setPhoneCountry(country.name);
      const national = settings.restaurantPhone.startsWith(country.dial) ? settings.restaurantPhone.slice(country.dial.length) : settings.restaurantPhone;
      setDraft(formatPhoneFor(country, national));
    } else setDraft(settings[field]);
  };

  const save = () => {
    if (!editing || !canManageSettings) return;
    let value = draft.trim();
    if (!value) { setError(`Enter ${editing.label.toLowerCase()}.`); return; }
    if (editing.field === "restaurantEmail" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { setError("Enter a valid email address."); return; }
    if (editing.field === "restaurantPhone") {
      const country = phoneCountryByName(phoneCountry);
      if (!isValidPhoneFor(country, value)) { setError(phoneErrorFor(country)); return; }
      value = `${country.dial} ${formatPhoneFor(country, value)}`;
    }
    updateSettings({ [editing.field]: value });
    setEditing(null);
  };

  const row = (field: Field, label: string) => (
    <Button key={field} variant="ghost" disabled={!canManageSettings} onClick={() => open(field, label)} className="h-auto min-h-row w-full justify-start gap-3 whitespace-normal rounded-none border-b border-border px-4 py-3 text-left hover:bg-muted hover:text-foreground last:border-b-0">
      <span className="shrink-0 t-row">{label}</span>
      <span className="min-w-0 flex-1 break-words text-right t-value text-muted-foreground">{settings[field] || "Not set"}</span>
      {canManageSettings ? <ChevronRight className="size-4 shrink-0 text-muted-foreground" /> : null}
    </Button>
  );

  const addressField = (field: keyof AppSettings, label: string, optional = false) => (
    <label key={field} className="grid min-h-row grid-cols-[6rem_minmax(0,1fr)] items-center gap-3 border-b border-border px-4 py-2 last:border-b-0 sm:grid-cols-[9rem_minmax(0,1fr)]">
      <span className="t-row">{label}</span>
      <Input aria-label={label} disabled={!canManageSettings} value={String(settings[field] ?? "")} placeholder={optional ? "Optional" : label} onChange={e => { setAddressDraft(null); updateSettings({ [field]: e.target.value }); }} className="min-w-0 border-transparent bg-transparent shadow-none" />
    </label>
  );

  return <>
    <SubHeader title="Restaurant Information" backLabel="General" />
    <ScreenBody>
      <div className="w-full">
        <div className="flex justify-center py-6"><div className="grid size-32 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-surface p-5"><Wordmark className="h-auto w-full" /></div></div>
        <GroupCard>{row("restaurantName", "Name")}{row("restaurantType", "Type")}</GroupCard>
        <GroupCard className="mt-6">{row("restaurantEmail", "Email Address")}{row("restaurantPhone", "Phone Number")}</GroupCard>
        <GroupLabel>Description</GroupLabel>
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <Textarea aria-label="Description" maxLength={250} value={settings.restaurantDescription} disabled={!canManageSettings} onChange={e => updateSettings({ restaurantDescription: e.target.value })} className="min-h-28 resize-y bg-surface text-fs-base" />
            <Caption>{settings.restaurantDescription.length}/250</Caption>
          </div>
          <Button variant="outline" size="icon" disabled={!canManageSettings} title="Description assistance" aria-label="Description assistance" onClick={() => toast.info("Description assistance is not connected in this demo.")} className="size-11 shrink-0"><Sparkles className="size-5" /></Button>
        </div>
        <GroupLabel>Address</GroupLabel>
        <div className="mb-2 flex items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <Input aria-label="Address" value={addressDraft ?? address} disabled={!canManageSettings} onChange={e => setAddressDraft(e.target.value)} onBlur={() => {
              if (addressDraft !== null) {
                updateSettings({ restaurantAddress: addressDraft, restaurantAddress2: "", restaurantCity: "", restaurantPostCode: "", restaurantCountry: "" });
                setAddressDraft(null);
              }
            }} className="h-11 bg-surface pr-11" />
            <Button variant="ghost" size="icon" title="Clear address" aria-label="Clear address" disabled={!canManageSettings || !(addressDraft ?? address)} onClick={() => { setAddressDraft(null); updateSettings({ restaurantAddress: "", restaurantAddress2: "", restaurantCity: "", restaurantPostCode: "", restaurantCountry: "" }); }} className="absolute right-0 top-0 size-11 text-muted-foreground"><X className="size-4" /></Button>
          </div>
          <Button variant="outline" size="icon" title="Find address" aria-label="Find address" disabled={!canManageSettings} onClick={() => toast.info("Address lookup is not connected in this demo. Enter the address below.")} className="size-11 shrink-0"><LocateFixed className="size-5" /></Button>
        </div>
        <GroupCard>
          {addressField("restaurantAddress", "Address 1")}
          {addressField("restaurantAddress2", "Address 2", true)}
          {addressField("restaurantCity", "Town")}
          {addressField("restaurantPostCode", "PostCode", true)}
          <div className="grid min-h-row grid-cols-[6rem_minmax(0,1fr)] items-center gap-3 px-4 py-2 sm:grid-cols-[9rem_minmax(0,1fr)]">
            <span className="t-row">Country</span>
            <Select value={settings.restaurantCountry} disabled={!canManageSettings} onValueChange={v => { setAddressDraft(null); updateSettings({ restaurantCountry: v }); }}>
              <SelectTrigger aria-label="Country" className="w-full min-w-0 border-transparent shadow-none"><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>{phoneCountries.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </GroupCard>
        {!canManageSettings ? <Caption>Only managers can change these settings.</Caption> : null}
      </div>
    </ScreenBody>
    <Dialog open={editing !== null} onOpenChange={v => { if (!v) setEditing(null); }}>
      <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-card" aria-describedby={undefined}>
        <DialogHeader><DialogTitle>{editing?.label}</DialogTitle></DialogHeader>
        <form onSubmit={e => { e.preventDefault(); save(); }} className="space-y-4">
          {editing?.field === "restaurantPhone" ? <Select value={phoneCountry} onValueChange={v => { setPhoneCountry(v); setDraft(""); setError(""); }}><SelectTrigger aria-label="Phone country"><SelectValue /></SelectTrigger><SelectContent>{phoneCountries.map(c => <SelectItem key={c.name} value={c.name}>{c.flag} {c.name} {c.dial}</SelectItem>)}</SelectContent></Select> : null}
          {editing?.field === "restaurantType" ? <Select value={draft} onValueChange={v => { setDraft(v); setError(""); }}><SelectTrigger aria-label="Type"><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent>{["Casual Dining", ...restaurantTypes].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select> : <Input autoFocus aria-label={editing?.label ?? "Value"} type={editing?.field === "restaurantEmail" ? "email" : editing?.field === "restaurantPhone" ? "tel" : "text"} value={draft} onChange={e => { setError(""); setDraft(editing?.field === "restaurantPhone" ? formatPhoneFor(phoneCountryByName(phoneCountry), e.target.value) : e.target.value); }} />}
          {error ? <p role="alert" className="text-fs-sm text-destructive">{error}</p> : null}
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit">Save</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  </>;
}