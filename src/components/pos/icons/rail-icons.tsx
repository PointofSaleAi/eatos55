/**
 * Left-rail icons copied 1:1 from the reference app
 * (pointofsale6.lovable.app): white-on-transparent PNG artwork rendered as
 * images. The rail is a dark shell in every theme, so the white artwork
 * stays visible; sizing matches the Lucide icons elsewhere in navigation.
 */
import newOrderUrl from "@/assets/icons/new-order.png";
import tableOrderUrl from "@/assets/icons/table-order.png";
import ticketsUrl from "@/assets/icons/tickets.png";

function RailImage({
  className,
  src,
  alt,
}: {
  className?: string | undefined;
  src: string;
  alt: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      aria-hidden="true"
      draggable={false}
      className={className}
    />
  );
}

/** New Order — receipt with a plus, as rendered on the reference rail. */
export function NewOrderIcon({ className }: { className?: string }) {
  return <RailImage className={className} src={newOrderUrl} alt="New Order" />;
}

/** Table Order — round table seen from above, as on the reference rail. */
export function TableOrderIcon({ className }: { className?: string }) {
  return <RailImage className={className} src={tableOrderUrl} alt="Table Order" />;
}

/** Tickets — dollar bills, as rendered on the reference rail. */
export function TicketsIcon({ className }: { className?: string }) {
  return <RailImage className={className} src={ticketsUrl} alt="Tickets" />;
}
