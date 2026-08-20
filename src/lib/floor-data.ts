/** Floor plan, rooms and kitchen-board data (matches the live handheld app). */

export type TableState =
  | "available"
  | "ordering"
  | "ordered"
  | "reserved"
  | "seated"
  | "running-late"
  | "course-1"
  | "course-2"
  | "course-3"
  | "dessert"
  | "partially-seated";

export type FloorTable = {
  id: string;
  name: string;
  state: TableState;
  /** Seat capacity. */
  seats: number;
  /** Guests currently seated. */
  seated?: number;
  since?: string | undefined;
  floor: string;
  /** Section of the floor the table belongs to. */
  section?: "B1" | "B2";
  shape?: "round" | "square";
  /** Position on the layout canvas, in percent of canvas width / height. */
  x?: number;
  y?: number;
};

export const floors = ["Ground Floor", "First Floor", "Patio"] as const;

export const floorSections = ["all", "B2", "B1"] as const;
export type FloorSection = (typeof floorSections)[number];

export const tableStateTabs: { id: TableState | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "available", label: "Available" },
  { id: "ordering", label: "Ordering" },
  { id: "ordered", label: "Ordered" },
  { id: "reserved", label: "Reserved" },
];

/**
 * Status meta for the floor tiles, layout canvas and status sheet.
 * `strip` fills the card footer, `text` colours the label, `dot` the sheet swatch
 * and `ring` the outline of the shape on the layout canvas.
 */
export const tableStateMeta: Record<
  TableState,
  { label: string; strip: string; text: string; dot: string; ring: string }
> = {
  available: {
    label: "AVAILABLE",
    strip: "bg-success/20",
    text: "text-success",
    dot: "text-success",
    ring: "border-success/60",
  },
  ordering: {
    label: "ORDERING",
    strip: "bg-accent/15",
    text: "text-accent",
    dot: "text-accent",
    ring: "border-accent/60",
  },
  ordered: {
    label: "ORDERED",
    strip: "bg-warning/20",
    text: "text-warning",
    dot: "text-warning",
    ring: "border-warning/60",
  },
  reserved: {
    label: "RESERVED",
    strip: "bg-muted",
    text: "text-muted-foreground",
    dot: "text-muted-foreground",
    ring: "border-border",
  },
  seated: {
    label: "SEATED",
    strip: "bg-tile-slate/20",
    text: "text-tile-slate",
    dot: "text-tile-slate",
    ring: "border-tile-slate/60",
  },
  "running-late": {
    label: "RUNNING LATE",
    strip: "bg-tile-red/20",
    text: "text-tile-red",
    dot: "text-tile-red",
    ring: "border-tile-red/60",
  },
  "course-1": {
    label: "1ST COURSE",
    strip: "bg-tile-violet/20",
    text: "text-tile-violet",
    dot: "text-tile-violet",
    ring: "border-tile-violet/60",
  },
  "course-2": {
    label: "2ND COURSE",
    strip: "bg-tile-purple/20",
    text: "text-tile-purple",
    dot: "text-tile-purple",
    ring: "border-tile-purple/60",
  },
  "course-3": {
    label: "3RD COURSE",
    strip: "bg-tile-indigo/20",
    text: "text-tile-indigo",
    dot: "text-tile-indigo",
    ring: "border-tile-indigo/60",
  },
  dessert: {
    label: "DESSERT",
    strip: "bg-tile-pink/20",
    text: "text-tile-pink",
    dot: "text-tile-pink",
    ring: "border-tile-pink/60",
  },
  "partially-seated": {
    label: "PARTIALLY SEATED",
    strip: "bg-tile-orange/20",
    text: "text-tile-orange",
    dot: "text-tile-orange",
    ring: "border-tile-orange/60",
  },
};

/** Order the status sheet lists the states in. */
export const tableStateOrder: TableState[] = [
  "available",
  "ordering",
  "ordered",
  "reserved",
  "seated",
  "running-late",
  "course-1",
  "course-2",
  "course-3",
  "dessert",
  "partially-seated",
];

export const floorTables: FloorTable[] = [
  // Ground floor, section B1
  { id: "ft-test", name: "test", state: "available", seats: 1, seated: 0, floor: "Ground Floor", section: "B1", shape: "square", x: 74, y: 46 },
  { id: "ft-t1", name: "T1", state: "ordered", seats: 4, seated: 4, since: "23H", floor: "Ground Floor", section: "B1", shape: "round", x: 33, y: 34 },
  { id: "ft-ew1", name: "EW1", state: "available", seats: 1, seated: 0, floor: "Ground Floor", section: "B1", shape: "round", x: 62, y: 20 },
  { id: "ft-t3", name: "T3", state: "ordered", seats: 4, seated: 1, since: "48M", floor: "Ground Floor", section: "B1", shape: "round", x: 33, y: 55 },
  { id: "ft-t4", name: "T4", state: "available", seats: 4, seated: 0, floor: "Ground Floor", section: "B1", shape: "round", x: 33, y: 74 },
  { id: "ft-4", name: "4", state: "available", seats: 1, seated: 0, floor: "Ground Floor", section: "B1", shape: "round", x: 60, y: 12 },
  { id: "ft-t7", name: "T7", state: "available", seats: 2, seated: 0, floor: "Ground Floor", section: "B1", shape: "round", x: 66, y: 34 },
  { id: "ft-t8", name: "T8", state: "available", seats: 8, seated: 0, floor: "Ground Floor", section: "B1", shape: "round", x: 44, y: 55 },
  { id: "ft-t9", name: "T9", state: "available", seats: 8, seated: 0, floor: "Ground Floor", section: "B1", shape: "round", x: 53, y: 55 },
  { id: "ft-t10", name: "T10", state: "available", seats: 8, seated: 0, floor: "Ground Floor", section: "B1", shape: "round", x: 44, y: 74 },
  // Ground floor, section B2
  { id: "ft-ew11", name: "EW11", state: "available", seats: 1, seated: 0, floor: "Ground Floor", section: "B2", shape: "round", x: 55, y: 82 },
  { id: "ft-ew12", name: "EW12", state: "available", seats: 1, seated: 0, floor: "Ground Floor", section: "B2", shape: "square", x: 14, y: 22 },
  { id: "ft-ew104", name: "EW104", state: "available", seats: 1, seated: 0, floor: "Ground Floor", section: "B2", shape: "square", x: 84, y: 62 },
  { id: "ft-ew112", name: "EW112", state: "available", seats: 1, seated: 0, floor: "Ground Floor", section: "B2", shape: "square", x: 76, y: 72 },
  { id: "ft-ew123", name: "EW123", state: "available", seats: 1, seated: 0, floor: "Ground Floor", section: "B2", shape: "square", x: 14, y: 52 },
  { id: "ft-ew4426", name: "EW4426", state: "available", seats: 4, seated: 0, floor: "Ground Floor", section: "B2", shape: "square", x: 24, y: 88 },
  { id: "ft-ew6072", name: "EW6072", state: "ordering", seats: 3, seated: 2, since: "14M", floor: "Ground Floor", section: "B2", shape: "round", x: 60, y: 92 },
  { id: "ft-ew19374", name: "EW19374", state: "ordered", seats: 4, seated: 2, since: "31M", floor: "Ground Floor", section: "B2", shape: "round", x: 70, y: 92 },
  { id: "ft-ew23324", name: "EW23324", state: "available", seats: 3, seated: 0, floor: "Ground Floor", section: "B2", shape: "round", x: 74, y: 58 },
  { id: "ft-ew32298", name: "EW32298", state: "available", seats: 4, seated: 0, floor: "Ground Floor", section: "B2", shape: "round", x: 86, y: 84 },
  { id: "ft-ew77353", name: "EW77353", state: "available", seats: 3, seated: 0, floor: "Ground Floor", section: "B2", shape: "round", x: 88, y: 92 },
  { id: "ft-ew79223", name: "EW79223", state: "ordering", seats: 4, seated: 3, since: "9M", floor: "Ground Floor", section: "B2", shape: "round", x: 22, y: 26 },
  // First floor
  { id: "ft-f1", name: "T8", state: "reserved", seats: 6, seated: 0, floor: "First Floor", section: "B1", shape: "round", x: 30, y: 30 },
  { id: "ft-f2", name: "T9", state: "course-2", seats: 4, seated: 4, since: "12M", floor: "First Floor", section: "B1", shape: "round", x: 60, y: 40 },
  { id: "ft-f3", name: "T11", state: "running-late", seats: 2, seated: 2, since: "1H", floor: "First Floor", section: "B2", shape: "square", x: 40, y: 70 },
  { id: "ft-f4", name: "T12", state: "dessert", seats: 6, seated: 5, since: "52M", floor: "First Floor", section: "B2", shape: "round", x: 74, y: 74 },
  // Patio
  { id: "ft-p1", name: "P1", state: "available", seats: 4, seated: 0, floor: "Patio", section: "B1", shape: "round", x: 28, y: 36 },
  { id: "ft-p2", name: "P2", state: "ordering", seats: 2, seated: 2, since: "8M", floor: "Patio", section: "B1", shape: "round", x: 56, y: 36 },
  { id: "ft-p3", name: "P3", state: "partially-seated", seats: 6, seated: 3, since: "22M", floor: "Patio", section: "B2", shape: "square", x: 44, y: 72 },
];

/** Staff roster shown in the floor plan staff panel, grouped by role. */
export type StaffMember = { id: string; name: string; role: string };

export const staffRoster: StaffMember[] = [
  { id: "st-1", name: "Zherwin Ladera", role: "Supervisor" },
  { id: "st-2", name: "Naveen Khanna", role: "Supervisor" },
  { id: "st-3", name: "Dheeraj Jaiswal", role: "Supervisor" },
  { id: "st-4", name: "Manisha Arya", role: "Supervisor" },
  { id: "st-5", name: "Toni Rony", role: "Barista" },
  { id: "st-6", name: "Test Invite One", role: "Barista" },
  { id: "st-7", name: "Saif Ali", role: "Waiter" },
  { id: "st-8", name: "Android Bahadur", role: "Waiter" },
  { id: "st-9", name: "Server A", role: "Server" },
  { id: "st-10", name: "Server B", role: "Server" },
  { id: "st-11", name: "Mahmoud Shaaban", role: "Delivery Staff" },
  { id: "st-12", name: "Vinit Choudhari", role: "Delivery Staff" },
  { id: "st-13", name: "Rohan Yadav", role: "Line Cook" },
  { id: "st-14", name: "Vinay Choudhary", role: "Line Cook" },
  { id: "st-15", name: "Joren Bryan Soto", role: "Kitchen Manager" },
];

/** Role order used by the staff panel groups. */
export const staffRoles = [
  "Supervisor",
  "Barista",
  "Waiter",
  "Server",
  "Delivery Staff",
  "Line Cook",
  "Kitchen Manager",
] as const;

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + second).toUpperCase();
}


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
