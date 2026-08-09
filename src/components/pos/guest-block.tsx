import { ChevronDown } from "lucide-react";
import { usePos } from "@/lib/pos-store";

/**
 * Tappable guest identity block: name, phone and current order type.
 * Opens the guest details sheet.
 */
export function GuestBlock({ onEdit }: { onEdit: () => void }) {
  const { guest, orderType, activeTable } = usePos();
  return (
    <button
      type="button"
      onClick={onEdit}
      aria-label="Edit guest details and order type"
      className="flex min-h-tap min-w-0 flex-1 items-center gap-1.5 rounded-row px-1 py-0.5 text-left transition-colors hover:bg-muted"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-fs-sm font-bold text-foreground">
          {guest.name || activeTable || "Guest Name"}
        </span>
        <span className="block truncate text-fs-xs text-muted-foreground">
          {guest.phone || "(XXX) XXX-XXXX"} · {orderType}
        </span>
      </span>
      <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}
