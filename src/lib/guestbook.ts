import type { Ticket } from "@/lib/demo-data";
import type { Guest } from "@/lib/pos-store";

export type GuestRecord = { id: string; name: string; email?: string | undefined; phone?: string | undefined; address?: string | undefined; tickets: Ticket[] };
/** Directory entries always carry a demo email and phone, so every row can show both. */
export type DirectoryEntry = GuestRecord & { email: string; phone: string };

const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();
const named = (name: string) => Boolean(name.trim()) && !/^(guest(?:\s*\d+)?|bar tab|curb side|party of \d+|table\b.*)$/i.test(name.trim());

const AREA_CODES = ["212", "312", "415", "503", "617", "646", "702", "720", "917"];
const hash = (value: string) => [...value].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Sample contact details for guests with none on file — demo values only, nothing is sent. */
export function mockEmail(name: string) {
  const parts = name.trim().toLowerCase().replace(/[^a-z\s.]/g, "").split(/\s+/).filter(Boolean);
  const first = (parts[0] ?? "guest").replace(/\./g, "") || "guest";
  const last = (parts[1] ?? "").replace(/\./g, "");
  return last ? `${first}.${last}@eatos.com` : `${first}@eatos.com`;
}

export function mockPhone(name: string) {
  const value = hash(name.trim().toLowerCase());
  return `(${AREA_CODES[value % AREA_CODES.length]}) 555-0${100 + (value % 900)}`;
}

/** Never combine two known, different email identities just because names match. */
export function guestDirectory(tickets: Ticket[], current: Guest): DirectoryEntry[] {
  const records: GuestRecord[] = [];
  for (const ticket of tickets) {
    if (!named(ticket.label)) continue;
    const email = ticket.guestEmail?.trim() || undefined;
    const phone = ticket.guestPhone?.trim() || undefined;
    const id = `${normalize(ticket.label)}|${normalize(email ?? "")}`;
    let record = records.find((row) => row.id === id);
    if (!record) {
      record = { id, name: ticket.label.trim(), email, phone, tickets: [] };
      records.push(record);
    }
    if (email && !record.email) record.email = email;
    if (phone && !record.phone) record.phone = phone;
    record.tickets.push(ticket);
  }
  if (named(current.name)) {
    const matches = records.filter((row) => normalize(row.name) === normalize(current.name));
    const email = current.email?.trim() || undefined;
    const phone = current.phone?.trim() || undefined;
    const record = matches.find((row) => email && normalize(row.email ?? "") === normalize(email))
      ?? (matches.length === 1 && !email ? matches[0] : undefined);
    if (record) {
      // Keep the guest's stored contacts; only a value this order actually has replaces one.
      if (phone) record.phone = phone;
      if (current.address?.trim()) record.address = current.address.trim();
    } else {
      records.push({ id: `${normalize(current.name)}|current`, name: current.name.trim(), email, phone, address: current.address || undefined, tickets: [] });
    }
  }
  return records
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((row) => ({ ...row, email: row.email || mockEmail(row.name), phone: row.phone || mockPhone(row.name) }));
}

/**
 * Guest a New Order inherits when it is started from a Guestbook profile.
 * Every identity field is listed on purpose: a previous guest's details must
 * not stay attached just because setGuest merges a patch.
 */
export function guestOrderPatch(entry: DirectoryEntry): Guest {
  return {
    name: entry.name,
    phone: entry.phone,
    email: entry.email,
    address: entry.address,
    partySize: 1,
    firstName: undefined,
    middleName: undefined,
    lastName: undefined,
    customerSince: undefined,
    dateOfBirth: undefined,
    anniversary: undefined,
    photo: undefined,
    notes: undefined,
    vehicle: undefined,
    addressStreet: undefined,
    addressUnit: undefined,
    addressCity: undefined,
    addressState: undefined,
    addressZipCode: undefined,
    event: undefined,
    scheduledAt: undefined,
    customLabel: undefined,
  };
}

