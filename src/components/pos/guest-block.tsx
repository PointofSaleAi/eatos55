import { ChevronDown } from "lucide-react";
import { usePos } from "@/lib/pos-store";

/**
 * Tappable guest identity block: name, phone and current order type.
 * Opens the guest details sheet.
 */
export function GuestBlock({ onEdit }: { onEdit: () => void }) {
  const { guest, orderType, activeTable, tableGroupLabel } = usePos();
  // A merged party prints its combined name ("T1 + T2") wherever the table shows.
  const tableName = tableGroupLabel(activeTable);
  return (
    <button
      type="button"
      onClick={onEdit}
      aria-label="Edit guest details and order type"
      className="flex min-h-tap min-w-0 flex-1 items-center gap-1 rounded-row px-1 py-0.5 text-left transition-colors hover:bg-muted"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-fs-base font-extrabold leading-tight text-foreground">
          {guest.name || tableName || "Guest Name"}
        </span>
        {/* Order type first so it is never the part that gets cut off. */}
        <span className="flex min-w-0 items-baseline gap-1 text-fs-xs font-semibold text-muted-foreground">
          <span className="shrink-0">{orderType}</span>
          <span className="truncate">· {guest.phone || "(XXX) XXX-XXXX"}</span>
        </span>
      </span>
      <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />

    </button>
  );
}
