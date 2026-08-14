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
  available: { label: "AVAILABLE", strip: "bg-success/20", text: "text-success" },
  ordering: { label: "ORDERING", strip: "bg-accent/15", text: "text-accent" },
  ordered: { label: "ORDERED", strip: "bg-warning/20", text: "text-warning" },
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

/** Stay detail shown when a room is picked for a room charge. */
export type RoomStay = {
  bookingNumber: string;
  stayFrom: string;
  stayTo: string;
  nights: number;
  occupancy: string;
  roomType: string;
  bedType: string;
  maxAdults: number;
  maxChildren: number;
  creditLimit: number;
  creditUsed: number;
  foodAllowancePerDay: number;
  alcoholAllowed: boolean;
  meals: string[];
  entitlements: string;
};

export type Room = {
  id: string;
  name: string;
  /** Room number as printed on the key card. */
  number: string;
  floor: string;
  guest?: string;
  amount?: number;
  state: "available" | "occupied";
  stay?: RoomStay;
};

export const rooms: Room[] = [
  {
    id: "r1",
    name: "Room 2",
    number: "2",
    floor: "Ground Floor",
    guest: "Maa DD",
    state: "available",
    stay: {
      bookingNumber: "BK-O91B0PEQ",
      stayFrom: "Feb 23",
      stayTo: "Feb 23",
      nights: 0,
      occupancy: "1 Adult",
      roomType: "Double",
      bedType: "King",
      maxAdults: 2,
      maxChildren: 0,
      creditLimit: 100,
      creditUsed: 98.12,
      foodAllowancePerDay: 0,
      alcoholAllowed: false,
      meals: [
        "Breakfast",
        "Lunch",
        "Dinner",
        "Brunch",
        "Evening Snacks",
        "Tea / Coffee",
        "All On Board",
      ],
      entitlements: "Free Wi-Fi, Free Parking, Gym Access",
    },
  },
  {
    id: "r2",
    name: "Mahmoud Shaaban",
    number: "104",
    floor: "First Floor",
    guest: "saof ali",
    amount: 0,
    state: "occupied",
    stay: {
      bookingNumber: "BK-MS104QQ",
      stayFrom: "Feb 21",
      stayTo: "Feb 25",
      nights: 4,
      occupancy: "2 Adults",
      roomType: "Suite",
      bedType: "Twin",
      maxAdults: 3,
      maxChildren: 2,
      creditLimit: 500,
      creditUsed: 120,
      foodAllowancePerDay: 45,
      alcoholAllowed: true,
      meals: ["Breakfast", "Dinner", "Tea / Coffee"],
      entitlements: "Free Wi-Fi, Airport Transfer",
    },
  },
  {
    id: "r3",
    name: "Ocean",
    number: "222",
    floor: "First Floor",
    guest: "Test sdfsdf",
    state: "available",
    stay: {
      bookingNumber: "BK-OC222TX",
      stayFrom: "Feb 22",
      stayTo: "Feb 24",
      nights: 2,
      occupancy: "1 Adult",
      roomType: "Deluxe",
      bedType: "Queen",
      maxAdults: 2,
      maxChildren: 1,
      creditLimit: 250,
      creditUsed: 0,
      foodAllowancePerDay: 30,
      alcoholAllowed: false,
      meals: ["Breakfast", "Lunch"],
      entitlements: "Free Wi-Fi, Pool Access",
    },
  },
  {
    id: "r4",
    name: "Francis Room",
    number: "303",
    floor: "Patio",
    guest: "Francis Obera",
    amount: 2500,
    state: "occupied",
    stay: {
      bookingNumber: "BK-FR303PL",
      stayFrom: "Feb 18",
      stayTo: "Feb 28",
      nights: 10,
      occupancy: "2 Adults, 1 Child",
      roomType: "Presidential",
      bedType: "King",
      maxAdults: 4,
      maxChildren: 2,
      creditLimit: 3000,
      creditUsed: 2500,
      foodAllowancePerDay: 120,
      alcoholAllowed: true,
      meals: ["Breakfast", "Lunch", "Dinner", "Evening Snacks", "All On Board"],
      entitlements: "Free Wi-Fi, Butler Service, Spa Credit",
    },
  },
  {
    id: "r5",
    name: "King room",
    number: "982",
    floor: "Patio",
    guest: "Tommy telles",
    state: "available",
    stay: {
      bookingNumber: "BK-KR982MM",
      stayFrom: "Feb 20",
      stayTo: "Feb 21",
      nights: 1,
      occupancy: "1 Adult",
      roomType: "Standard",
      bedType: "King",
      maxAdults: 2,
      maxChildren: 0,
      creditLimit: 80,
      creditUsed: 80,
      foodAllowancePerDay: 0,
      alcoholAllowed: false,
      meals: ["Breakfast"],
      entitlements: "Free Wi-Fi",
    },
  },
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
