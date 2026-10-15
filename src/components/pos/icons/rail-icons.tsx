/**
 * Left-rail icons copied 1:1 from the published eatOS app's rail
 * (eatos46.lovable.app): Lucide `file-plus-corner`, `sofa` and `receipt`
 * rendered as inline SVG with currentColor, matching the sizing/colouring
 * treatment of OrderOSIcon and the Lucide icons elsewhere in navigation.
 */
function StrokeIcon({
  className,
  viewBox = "0 0 24 24",
  children,
}: {
  className?: string;
  viewBox?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

/** New Order — file-plus-corner, as rendered on the published rail. */
export function NewOrderIcon({ className }: { className?: string }) {
  return (
    <StrokeIcon className={className}>
      <path d="M11.35 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v5.35" />
      <path d="M14 2v5a1 1 0 0 0 1 1h5" />
      <path d="M14 19h6" />
      <path d="M17 16v6" />
    </StrokeIcon>
  );
}

/** Table Order — sofa, as rendered on the published rail. */
export function TableOrderIcon({ className }: { className?: string }) {
  return (
    <StrokeIcon className={className}>
      <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
      <path d="M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
      <path d="M4 18v2" />
      <path d="M20 18v2" />
      <path d="M12 4v9" />
    </StrokeIcon>
  );
}

/** Tickets — receipt, as rendered on the published rail. */
export function TicketsIcon({ className }: { className?: string }) {
  return (
    <StrokeIcon className={className}>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17.5v-11" />
    </StrokeIcon>
  );
}
