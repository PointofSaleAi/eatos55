import { MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatUsAddress, usAddressSuggestions, usStates, type UsAddress } from "@/lib/us-addresses";

const inputClass = "h-11 w-full min-w-0 rounded-row border border-border bg-muted px-3 text-fs-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";

export function AddressSearch({ value, onChange, required = false }: { value: UsAddress; onChange: (value: UsAddress) => void; required?: boolean }) {
  const [query, setQuery] = useState(() => formatUsAddress(value));
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const suggestions = useMemo(() => {
    const words = debouncedQuery.toLocaleLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return usAddressSuggestions.filter((address) => {
      const searchable = formatUsAddress(address).toLocaleLowerCase();
      return words.every((word) => searchable.includes(word));
    }).slice(0, 6);
  }, [debouncedQuery]);

  const update = (key: keyof UsAddress, next: string) => onChange({ ...value, [key]: next });
  const hasSelectedAddress = Boolean(value.street || value.city || value.state || value.zipCode);

  return (
    <div className="space-y-3">
      <label className="relative block min-w-0 space-y-1.5" onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}>
        <span className="text-fs-xs font-bold text-foreground">Search Address{required ? <span className="text-destructive"> *</span> : null}</span>
        <span className="flex items-center rounded-row border border-border bg-muted px-3 focus-within:ring-2 focus-within:ring-ring">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            value={query}
            onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
              if (event.key === "Escape") setOpen(false);
            }}
            aria-label="Search address"
            aria-autocomplete="list"
            aria-expanded={open && debouncedQuery.length > 0}
            autoComplete="off"
            placeholder="Search address"
            className="h-11 min-w-0 flex-1 bg-transparent px-2 text-fs-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </span>
        {open && debouncedQuery ? (
          <div role="listbox" aria-label="Address suggestions" className="absolute inset-x-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-row border border-border bg-popover p-1 shadow-lg">
            {suggestions.length ? suggestions.map((address) => {
              const formatted = formatUsAddress(address);
              return (
                <Button key={formatted} type="button" role="option" variant="ghost" className="h-auto min-h-11 w-full justify-start gap-2 whitespace-normal px-3 py-2 text-left hover:bg-muted hover:text-foreground" onMouseDown={(event) => event.preventDefault()} onClick={() => { onChange(address); setQuery(formatted); setOpen(false); }}>
                  <MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="min-w-0 text-fs-sm leading-snug">{formatted}</span>
                </Button>
              );
            }) : <p className="px-3 py-3 text-fs-sm text-muted-foreground">No matching addresses</p>}
          </div>
        ) : null}
      </label>

      {hasSelectedAddress ? (
        <div className="grid grid-cols-2 gap-3">
          <AddressField label="Street Address" value={value.street} onChange={(next) => update("street", next)} className="col-span-2" />
          <AddressField label="Apartment / Suite" value={value.unit} onChange={(next) => update("unit", next)} className="col-span-2" />
          <AddressField label="City" value={value.city} onChange={(next) => update("city", next)} />
          <label className="min-w-0 space-y-1.5"><span className="text-fs-xs font-bold text-foreground">State</span><select aria-label="State" value={value.state} onChange={(event) => update("state", event.target.value)} className={inputClass}><option value="">Select state</option>{usStates.map((state) => <option key={state}>{state}</option>)}</select></label>
          <AddressField label="ZIP Code" value={value.zipCode} onChange={(next) => update("zipCode", next.replace(/[^\d-]/g, "").slice(0, 10))} inputMode="numeric" />
        </div>
      ) : null}
    </div>
  );
}

function AddressField({ label, value, onChange, className, inputMode }: { label: string; value: string; onChange: (value: string) => void; className?: string; inputMode?: "numeric" }) {
  return <label className={cn("min-w-0 space-y-1.5", className)}><span className="text-fs-xs font-bold text-foreground">{label}</span><input aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} inputMode={inputMode} className={inputClass} /></label>;
}