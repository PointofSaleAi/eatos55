import type { Ticket } from "@/lib/demo-data";
import type { Guest } from "@/lib/pos-store";

export type GuestRecord = { id: string; name: string; email?: string | undefined; phone?: string | undefined; address?: string | undefined; tickets: Ticket[] };
const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();
const named = (name: string) => Boolean(name.trim()) && !/^(guest(?:\s*\d+)?|bar tab|curb side|party of \d+|table\b.*)$/i.test(name.trim());

/** Never combine two known, different email identities just because names match. */
export function guestDirectory(tickets: Ticket[], current: Guest): GuestRecord[] {
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
    const record = matches.find((row) => email && normalize(row.email ?? "") === normalize(email))
      ?? (matches.length === 1 && !email && !matches[0]?.email ? matches[0] : undefined);
    if (record) {
      record.phone = current.phone || undefined;
      record.address = current.address || undefined;
    } else {
      records.push({ id: `${normalize(current.name)}|current`, name: current.name.trim(), email, phone: current.phone || undefined, address: current.address || undefined, tickets: [] });
    }
  }
  return records.sort((a, b) => a.name.localeCompare(b.name));
}