/**
 * Left-rail icons copied 1:1 from the reference app
 * (pointofsale6.lovable.app): white-on-transparent PNG artwork. Each PNG is
 * used as a CSS mask and painted with background-color: currentColor, so the
 * icons follow the same dim/hover/active color treatment as the Lucide icons
 * and the orderOS mark elsewhere in navigation. Sizing matches those icons.
 */
import type { CSSProperties } from "react";
import newOrderUrl from "@/assets/icons/new-order.png";
import tableOrderUrl from "@/assets/icons/table-order.png";
import ticketsUrl from "@/assets/icons/tickets.png";

function RailIcon({
  className,
  src,
}: {
  className?: string | undefined;
  src: string;
}) {
  const style: CSSProperties = {
    maskImage: `url(${src})`,
    WebkitMaskImage: `url(${src})`,
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
    backgroundColor: "currentColor",
  };
  return <span aria-hidden="true" className={className} style={style} />;
}

/** New Order — receipt with a plus, as rendered on the reference rail. */
export function NewOrderIcon({ className }: { className?: string }) {
  return <RailIcon className={className} src={newOrderUrl} />;
}

/** Table Order — round table seen from above, as on the reference rail. */
export function TableOrderIcon({ className }: { className?: string }) {
  return <RailIcon className={className} src={tableOrderUrl} />;
}

/** Tickets — dollar bills, as rendered on the reference rail. */
export function TicketsIcon({ className }: { className?: string }) {
  return <RailIcon className={className} src={ticketsUrl} />;
}
