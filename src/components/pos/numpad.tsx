import { Delete, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

function Key({
  children,
  onPress,
  className,
  label,
}: {
  children: React.ReactNode;
  onPress: () => void;
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onPress}
      className={cn(
        "grid min-h-[60px] place-items-center rounded-xl border border-border bg-surface text-2xl font-bold text-foreground transition-colors active:bg-muted",
        className,
      )}
    >
      {children}
    </button>
  );
}

/**
 * Handheld numeric pad. `variant="order"` adds the tall backspace / plus column
 * used by the custom-item screen; `variant="plain"` is the payment layout.
 */
export function NumPad({
  onDigit,
  onBackspace,
  onPlus,
  variant = "plain",
  className,
}: {
  onDigit: (d: string) => void;
  onBackspace: () => void;
  onPlus?: () => void;
  variant?: "plain" | "order";
  className?: string;
}) {
  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  if (variant === "order") {
    return (
      <div className={cn("grid grid-cols-4 grid-rows-4 gap-2", className)}>
        {digits.map((d, i) => (
          <Key
            key={d}
            onPress={() => onDigit(d)}
            className={cn(i % 3 === 0 && "col-start-1")}
          >
            {d}
          </Key>
        ))}
        <Key onPress={() => onDigit(".")} className="col-start-1 row-start-4">
          .
        </Key>
        <Key onPress={() => onDigit("0")} className="col-start-2 row-start-4">
          0
        </Key>
        <Key onPress={() => onDigit("00")} className="col-start-3 row-start-4">
          00
        </Key>
        <Key
          onPress={onBackspace}
          label="Backspace"
          className="col-start-4 row-start-1 row-span-2"
        >
          <Delete className="size-6" />
        </Key>
        <Key
          onPress={() => onPlus?.()}
          label="Add another"
          className="col-start-4 row-start-3 row-span-2 bg-primary text-primary-foreground"
        >
          <Plus className="size-6" />
        </Key>
      </div>
    );
  }


  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {digits.map((d) => (
        <Key key={d} onPress={() => onDigit(d)}>
          {d}
        </Key>
      ))}
      <Key onPress={() => onDigit(".")}>.</Key>
      <Key onPress={() => onDigit("0")}>0</Key>
      <Key onPress={onBackspace} label="Backspace">
        <Delete className="size-6" />
      </Key>
    </div>
  );
}

/** Guest identity strip shown above the order / custom item keypads. */
export function GuestHeader({
  name = "Guest Name",
  phone = "(XXX) XXX-XXXX",
  right,
}: {
  name?: string;
  phone?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-border bg-surface px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-bold text-muted-foreground">{name}</p>
        <p className="truncate text-base font-bold text-muted-foreground">{phone}</p>
      </div>
      {right ? <div className="flex shrink-0 items-center gap-1">{right}</div> : null}
    </div>
  );
}
