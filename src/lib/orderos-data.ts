// Demo-only orderOS orders. Times are offsets (minutes) from page load.
export type OOStatus =
  | "new"
  | "preparing"
  | "ready"
  | "delivery"
  | "completed"
  | "cancelled"
  | "scheduled";
export type OOChannel = "online" | "dinein";
export type OOType = "Delivery" | "Pick Up" | "Curbside" | "Dine In";
export type OOSource = "Grubhub" | "Uber Eats" | "DoorDash" | "eatOS";
export type OOMod = { name: string; removed?: boolean };
export type OOItem = {
  id: string;
  qty: number;
  name: string;
  price: number;
  mods: OOMod[];
  note?: string | undefined;
  unavailable?: "temporary" | "permanent" | undefined;
};
export type OOrder = {
  id: string;
  number: number;
  channel: OOChannel;
  status: OOStatus;
  type: OOType;
  source: OOSource;
  guest: string;
  phone: string;
  address?: string;
  items: OOItem[];
  placedOffset: number; // minutes ago placed
  readyOffset: number; // minutes from now until ready (negative = past)
  scheduledFor?: string;
  utensils: boolean;
  paid: boolean;
  refunded?: boolean;
  cancelReason?: string;
  deliveryFee: number;
  tip: number;
};

const menu: Omit<OOItem, "id" | "qty">[] = [
  { name: "Pan Roasted Salmon Sandwich", price: 10.5, mods: [{ name: "Small" }, { name: "Medium Rare" }, { name: "Parsley", removed: true }] },
  { name: "Hand Cut Fettuccini Alfredo", price: 2.99, mods: [] },
  { name: "Free Range Organic Turkey", price: 2.49, mods: [{ name: "Small" }, { name: "Medium Rare" }, { name: "Parsley", removed: true }] },
  { name: "Meatball", price: 1.99, mods: [] },
  { name: "Prime London Sirloin", price: 2.99, mods: [{ name: "Small" }, { name: "Medium Rare" }, { name: "Parsley", removed: true }], note: "Extra croutons please!" },
  { name: "Prime London Sirloin", price: 3.99, mods: [{ name: "Regular" }, { name: "Medium Rare" }] },
];

function items(seed: number, count: number): OOItem[] {
  return Array.from({ length: count }, (_, i) => {
    const m = menu[(seed + i) % menu.length]!;
    return { ...m, mods: m.mods.map((x) => ({ ...x })), id: `i${seed}-${i}`, qty: ((seed + i) % 2) + 1 };
  });
}

const names = ["Robert Matt Hardy", "Johnson", "Natasha", "John", "Rachael", "Guest", "Albert Anthony", "Robinson", "Maria Lopez", "Kevin Park"];
const sources: OOSource[] = ["Grubhub", "Uber Eats", "DoorDash"];
const addr = "Bush Street 87, San Francisco CA 94108";

let n = 0;
function make(o: Partial<OOrder> & Pick<OOrder, "number" | "status" | "channel">): OOrder {
  n += 1;
  const type = o.type ?? (o.channel === "dinein" ? "Dine In" : n % 3 === 0 ? "Pick Up" : "Delivery");
  return {
    id: `oo-${o.number}-${o.channel}`,
    type,
    source: o.channel === "dinein" ? "eatOS" : sources[n % 3]!,
    guest: names[n % names.length]!,
    phone: "+1 (415) 123-4567",
    address: type === "Delivery" || type === "Curbside" ? addr : undefined,
    items: items(n, (n % 4) + 2),
    placedOffset: 8,
    readyOffset: 10,
    utensils: false,
    paid: true,
    deliveryFee: type === "Delivery" ? 5 : 0,
    tip: n % 2 ? 3 : 0,
    ...o,
  };
}

export function seedOrders(): OOrder[] {
  n = 0;
  const list: OOrder[] = [
    make({ number: 29, status: "new", channel: "online", placedOffset: 0.2, type: "Delivery" }),
    make({ number: 28, status: "new", channel: "online", placedOffset: 3, type: "Pick Up" }),
    make({ number: 27, status: "new", channel: "online", placedOffset: 7, type: "Delivery" }),
    make({ number: 20, status: "preparing", channel: "online", placedOffset: 8, readyOffset: 5 }),
    make({ number: 19, status: "preparing", channel: "online", placedOffset: 9, readyOffset: 6 }),
    make({ number: 18, status: "preparing", channel: "online", placedOffset: 10, readyOffset: 4, type: "Pick Up" }),
    make({ number: 17, status: "ready", channel: "online", type: "Pick Up", readyOffset: -2 }),
    make({ number: 16, status: "ready", channel: "online", type: "Delivery", readyOffset: -3 }),
    make({ number: 15, status: "ready", channel: "online", type: "Pick Up", readyOffset: -4 }),
    make({ number: 14, status: "delivery", channel: "online", type: "Delivery", readyOffset: -6 }),
    make({ number: 13, status: "delivery", channel: "online", type: "Delivery", readyOffset: -7 }),
    make({ number: 11, status: "completed", channel: "online", type: "Delivery", readyOffset: -12 }),
    make({ number: 10, status: "completed", channel: "online", type: "Pick Up", readyOffset: -15 }),
    make({ number: 9, status: "cancelled", channel: "online", type: "Delivery", refunded: true, cancelReason: "Customer request" }),
    make({ number: 84, status: "scheduled", channel: "online", type: "Curbside", scheduledFor: "Tomorrow, 2:00 PM", utensils: true }),
    make({ number: 83, status: "scheduled", channel: "online", type: "Curbside", scheduledFor: "Tomorrow, 2:30 PM" }),
    make({ number: 82, status: "scheduled", channel: "online", type: "Curbside", scheduledFor: "Tomorrow, 6:00 PM" }),
    make({ number: 45, status: "new", channel: "dinein", placedOffset: 0.5 }),
    make({ number: 44, status: "new", channel: "dinein", placedOffset: 4, paid: false }),
    make({ number: 42, status: "preparing", channel: "dinein", readyOffset: 5 }),
    make({ number: 41, status: "preparing", channel: "dinein", readyOffset: 7, paid: false }),
    make({ number: 39, status: "completed", channel: "dinein", paid: false, readyOffset: -10 }),
    make({ number: 38, status: "completed", channel: "dinein", readyOffset: -14 }),
    make({ number: 36, status: "cancelled", channel: "dinein", refunded: true, cancelReason: "Kitchen issue" }),
  ];
  return list;
}

export function orderTotals(o: OOrder) {
  const sub = o.items.reduce((s, i) => s + (i.unavailable ? 0 : i.qty * i.price), 0);
  const tax = Math.round(sub * 0.0875 * 100) / 100;
  const total = sub + tax + o.deliveryFee + o.tip;
  return { sub, discount: 0, delivery: o.deliveryFee, service: 0, tax, tip: o.tip, total };
}

export const cancelReasons = ["Customer request", "Out of stock", "Kitchen too busy", "Store closing", "Other"];
