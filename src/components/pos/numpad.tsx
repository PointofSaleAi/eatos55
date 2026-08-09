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
        "grid h-full min-h-ctl-lg place-items-center rounded-2xl bg-surface text-fs-xl font-extrabold text-foreground shadow-sm transition-transform active:scale-[0.97]",
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
      <div className={cn("grid min-h-0 flex-1 grid-cols-4 grid-rows-4 auto-rows-fr gap-2", className)}>
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
          <Delete className="size-5" />
        </Key>
        <Key
          onPress={() => onPlus?.()}
          label="Add another"
          className="col-start-4 row-start-3 row-span-2 bg-primary text-primary-foreground"
        >
          <Plus className="size-5" />
        </Key>
      </div>
    );
  }


  return (
    <div className={cn("grid auto-rows-fr grid-cols-3 grid-rows-4 gap-2", className)}>
      {digits.map((d) => (
        <Key key={d} onPress={() => onDigit(d)}>
          {d}
        </Key>
      ))}
      <Key onPress={() => onDigit(".")}>.</Key>
      <Key onPress={() => onDigit("0")}>0</Key>
      <Key onPress={onBackspace} label="Backspace">
        <Delete className="size-5" />
      </Key>
    </div>
  );
}
