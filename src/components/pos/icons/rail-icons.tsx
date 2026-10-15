/**
 * Left-rail icons drawn in the Lucide stroke language so they match the
 * ConciergeBell (Rooms) and Lucide icons beside them: 24x24 viewBox, 2px
 * rounded strokes on currentColor, dim/hover/active handled by the rail.
 * Shapes follow the reference app artwork: receipt with a plus, round table
 * seen from above, and overlapping banknotes.
 */

/** New Order — receipt with a wavy bottom, text lines and a plus. */
export function NewOrderIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v18l-2.65-1.6-2.68 1.6-2.67-1.6L9.33 21l-2.66-1.6L4 21V3z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M16.5 14v6" />
      <path d="M13.5 17h6" />
    </svg>
  );
}

/** Table Order — round table seen from above with four place settings. */
export function TableOrderIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="4.5" r="1.5" />
      <circle cx="19.5" cy="12" r="1.5" />
      <circle cx="12" cy="19.5" r="1.5" />
      <circle cx="4.5" cy="12" r="1.5" />
    </svg>
  );
}

/** Tickets — two overlapping banknotes with a dollar centre. */
export function TicketsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="7.5" y="3" width="13.5" height="8" rx="1.5" />
      <rect x="3" y="9" width="13.5" height="10" rx="1.5" />
      <circle cx="9.75" cy="14" r="2.75" />
      <path d="M9.75 12.6v2.8" />
      <path d="M10.8 13.3c-.4-.5-2.1-.6-2.1.2 0 .9 2.1.5 2.1 1.4 0 .8-1.7.9-2.1.2" />
    </svg>
  );
}
