import { brand } from "@/lib/brand";
/** Content for the help centre articles and the Contact Us categories. */
export type HelpArticle = {
  title: string;
  eyebrow: string;
  intro: string;
  sections: { heading: string; body: string }[];
  links?: { label: string; slug: string }[];
};

export const helpArticles: Record<string, HelpArticle> = {
  "first-order": {
    title: "Take your first order",
    eyebrow: "Ordering basics · 3 min read",
    intro: "Open a ticket, add items and send the order to the kitchen from the handheld.",
    sections: [
      {
        heading: "1. Start a ticket",
        body: "Tap the plus action in the tab bar, then pick a table on the Floor Plan or choose an order type for a walk-in guest.",
      },
      {
        heading: "2. Add items",
        body: "Choose a category, tap an item, then set quantity and modifiers in the item sheet. Items with a stock badge show what is left for the shift.",
      },
      {
        heading: "3. Send it",
        body: "Review the order, then send it to the kitchen. The ticket appears on the Order Status Board within a few seconds.",
      },
    ],
  },
  "split-check": {
    title: "Split a check between guests",
    eyebrow: "Payments · 4 min read",
    intro: "Take more than one tender against a single ticket without closing it early.",
    sections: [
      {
        heading: "Split by amount",
        body: "Open Payments, choose a tender, then enter a part payment. The remaining balance stays on the ticket until it reaches zero.",
      },
      {
        heading: "Split by seat",
        body: "On a table service ticket, assign items to seats while ordering. Each seat can then be tendered separately.",
      },
      {
        heading: "Refunds and voids",
        body: "Voiding a paid line needs manager approval. Manager Controls holds the shift-level actions.",
      },
    ],
  },
  "pair-card-reader": {
    title: "Re-pair a card reader",
    eyebrow: "Hardware · 2 min read",
    intro: "Use this when a reader stops responding mid-service.",
    sections: [
      {
        heading: "Check the reader",
        body: "Settings > Hardware > Card Reader shows the paired device and its battery. A reader that reports offline usually needs a power cycle first.",
      },
      {
        heading: "Scan again",
        body: "Open System > Hardware and scan for devices. Keep the reader within a metre of the handheld while it pairs.",
      },
    ],
  },
  "close-shift": {
    title: "Close out a shift",
    eyebrow: "Manager tasks · 5 min read",
    intro: "End-of-day steps for the person closing the venue.",
    sections: [
      {
        heading: "Settle open tickets",
        body: "Tickets filtered to Open shows anything unpaid. Nothing should remain open before the shift report runs.",
      },
      {
        heading: "Run the report",
        body: "Settings > Sales Summary Report totals sales, tax, discounts and tenders for the shift and can be printed to the kitchen printer.",
      },
      {
        heading: "Clock out",
        body: "Clock Out from the navigation drawer ends the shift and leaves the device signed in for the next person.",
      },
    ],
  },
  "work-offline": {
    title: "Work offline safely",
    eyebrow: "Network · 3 min read",
    intro: "The handheld keeps taking orders when the venue network drops.",
    sections: [
      {
        heading: "What still works",
        body: "Ordering, ticket edits and cash tenders continue offline and queue on the device. A banner shows while the connection is down.",
      },
      {
        heading: "What waits",
        body: "Card tenders and report totals need the server. Queued work syncs automatically once the connection returns.",
      },
    ],
  },
  faq: {
    title: "Frequently Asked Questions",
    eyebrow: "Support",
    intro: "The questions our support team is asked most often.",
    sections: [
      {
        heading: "Why is an item greyed out?",
        body: "It is marked out of stock for the shift. Stock counts are set in Back Office or from the item sheet by a manager.",
      },
      {
        heading: "Can two people use one handheld?",
        body: "Yes. Switch User asks for a PIN and starts a new shift without signing the device out.",
      },
      {
        heading: "Where do I change tax?",
        body: "Tax rates come from Back Office. Removing tax from a single order is a manager action in the order More menu.",
      },
    ],
    links: [
      { label: "Take your first order", slug: "first-order" },
      { label: "Split a check between guests", slug: "split-check" },
    ],
  },
  "getting-started": {
    title: "Getting Started",
    eyebrow: "Support",
    intro: "Set the device up and take your first order in about ten minutes.",
    sections: [
      {
        heading: "Set up the device",
        body: `Choose table service or quick service, name the device, then sign in with your ${brand.appName} account and clock in with your PIN.`,
      },
      {
        heading: "Connect hardware",
        body: "Pair the printer, card reader and cash drawer in Settings > Hardware before service starts.",
      },
    ],
    links: [
      { label: "Take your first order", slug: "first-order" },
      { label: "Re-pair a card reader", slug: "pair-card-reader" },
    ],
  },
  "how-to": {
    title: "How-To Articles",
    eyebrow: "Support",
    intro: "Step-by-step guides for everyday service tasks.",
    sections: [],
    links: [
      { label: "Take your first order", slug: "first-order" },
      { label: "Split a check between guests", slug: "split-check" },
      { label: "Close out a shift", slug: "close-shift" },
      { label: "Work offline safely", slug: "work-offline" },
    ],
  },
  "point-of-sale": {
    title: "Point of Sale",
    eyebrow: "Support",
    intro: "How the handheld fits together with the rest of the eatOS point of sale.",
    sections: [
      {
        heading: "Tickets and the board",
        body: "Every order becomes a ticket. The Order Status Board shows preparation state for the kitchen and expo.",
      },
      {
        heading: "Devices share one venue",
        body: "Handhelds, terminals and the kitchen display read the same menu and ticket data, so a change on one device shows on the rest.",
      },
    ],
    links: [{ label: "Work offline safely", slug: "work-offline" }],
  },
};
