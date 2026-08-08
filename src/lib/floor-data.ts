/** Floor plan, rooms and kitchen-board data (matches the live handheld app). */

export type TableState = "available" | "ordering" | "ordered" | "reserved";

export type FloorTable = {
  id: string;
  name: string;
  state: TableState;
  seats: number;
  since?: string;
  floor: string;
};

export const floors = ["Ground Floor", "First Floor", "Patio"] as const;

export const tableStateTabs: { id: TableState | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "available", label: "Available" },
  { id: "ordering", label: "Ordering" },
  { id: "ordered", label: "Ordered" },
  { id: "reserved", label: "Reserved" },
];

export const tableStateMeta: Record<TableState, { label: string; strip: string; text: string }> = {
  available: { label: "AVAILABLE", strip: "bg-emerald-100", text: "text-emerald-600" },
  ordering: { label: "ORDERING", strip: "bg-accent/15", text: "text-accent" },
  ordered: { label: "ORDERED", strip: "bg-amber-100", text: "text-amber-600" },
  reserved: { label: "RESERVED", strip: "bg-muted", text: "text-muted-foreground" },
};

export const floorTables: FloorTable[] = [
  { id: "ft-test", name: "test", state: "available", seats: 1, floor: "Ground Floor" },
  { id: "ft-t1", name: "T1", state: "ordering", seats: 4, since: "23H", floor: "Ground Floor" },
  { id: "ft-ew1", name: "EW1", state: "available", seats: 1, floor: "Ground Floor" },
  { id: "ft-t3", name: "T3", state: "available", seats: 4, floor: "Ground Floor" },
  { id: "ft-t4", name: "T4", state: "available", seats: 4, floor: "Ground Floor" },
  { id: "ft-4", name: "4", state: "available", seats: 1, floor: "Ground Floor" },
  { id: "ft-t6", name: "T6", state: "available", seats: 2, floor: "Ground Floor" },
  { id: "ft-t7", name: "T7", state: "available", seats: 2, floor: "Ground Floor" },
  { id: "ft-t8", name: "T8", state: "reserved", seats: 6, floor: "First Floor" },
  { id: "ft-t9", name: "T9", state: "ordered", seats: 4, since: "12M", floor: "First Floor" },
  { id: "ft-p1", name: "P1", state: "available", seats: 4, floor: "Patio" },
  { id: "ft-p2", name: "P2", state: "ordering", seats: 2, since: "8M", floor: "Patio" },
];

export type Room = {
  id: string;
  name: string;
  guest?: string;
  amount?: number;
  state: "available" | "occupied";
};

export const rooms: Room[] = [
  { id: "r1", name: "Room 2", state: "available" },
  { id: "r2", name: "Mahmoud Shaaban", guest: "saof ali", amount: 0, state: "occupied" },
  { id: "r3", name: "Ocean", state: "available" },
  { id: "r4", name: "Francis Room", guest: "Francis Obera", amount: 2500, state: "occupied" },
];

export const boardChannels = ["DINE IN", "ONLINE"] as const;

export type BoardChannel = (typeof boardChannels)[number];

export const boardColumns = [
  { id: "new", label: "New Order" },
  { id: "preparing", label: "Preparing" },
  { id: "ready", label: "Ready" },
  { id: "delivery", label: "Out For Delivery" },
  { id: "completed", label: "Completed" },
] as const;
