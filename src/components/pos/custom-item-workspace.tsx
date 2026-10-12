import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { NumPad } from "@/components/pos/numpad";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/demo-data";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export function CustomItemWorkspace({
  onClose,
  className,
}: {
  onClose?: () => void;
  className?: string;
}) {
  const { addCustomItem } = usePos();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const price = Number(amount || "0");

  const addLine = () => {
    if (price <= 0) return;
    const itemName = name.trim() || "Custom Item";
    addCustomItem(itemName, price);
    setName("");
    setAmount("");
    toast.success(`${itemName} added`);
  };

  return (
    <section
      aria-label="Custom Item"
      className={cn("flex min-h-0 flex-1 flex-col overflow-hidden bg-background", className)}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-surface px-3 py-2">
        <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center rounded-row border border-border bg-background focus-within:border-accent">
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-label="Custom item name"
            placeholder="Item Name"
            className="h-12 min-w-0 bg-transparent px-4 text-fs-sm font-bold text-foreground outline-none placeholder:text-muted-foreground"
          />
          <output
            aria-label="Custom item price"
            className="min-w-24 border-l border-border px-4 text-right text-fs-xl font-extrabold tabular-nums text-foreground"
          >
            {money(price)}
          </output>
        </div>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close Custom Item"
            title="Close Custom Item"
            onClick={onClose}
            className="size-10 shrink-0 rounded-pill"
          >
            <X className="size-5" />
          </Button>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 p-3 pb-[calc(0.75rem+var(--kb-inset,0px))]">
        <NumPad
          variant="order"
          className="w-full"
          onDigit={(digit) =>
            setAmount((current) => {
              if (digit === "." && current.includes(".")) return current;
              const next = `${current}${digit}`;
              return next.length > 9 ? current : next;
            })
          }
          onBackspace={() => setAmount((current) => current.slice(0, -1))}
          onPlus={addLine}
        />
      </div>
    </section>
  );
}