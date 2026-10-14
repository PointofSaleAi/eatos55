import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { phoneCountries, phoneCountry, validatePhone, type PhoneCountry } from "@/lib/phone";

export function PhoneField({ value, onChange, country, onCountryChange, label = "Mobile number", required = false, mobile = true, hideCountry = false, compact = false, onCommit, forceError = false, className }: {
  value: string;
  onChange: (value: string) => void;
  country: PhoneCountry;
  onCountryChange?: (country: PhoneCountry) => void;
  label?: string;
  required?: boolean;
  mobile?: boolean;
  hideCountry?: boolean;
  compact?: boolean;
  onCommit?: (value: string, country: PhoneCountry) => void;
  forceError?: boolean;
  className?: string;
}) {
  const id = useId();
  const [touched, setTouched] = useState(false);
  const previousCountry = useRef(country);
  useEffect(() => {
    if (previousCountry.current !== country && value.trim()) setTouched(true);
    previousCountry.current = country;
  }, [country, value]);
  const result = validatePhone(value, country, required, mobile);
  const error = (touched || forceError) && !result.valid ? result.error : "";
  const info = phoneCountry(country);
  return (
    <div className={cn("min-w-0", className)}>
      <div className={cn("flex min-w-0 items-center rounded-row border bg-surface text-foreground focus-within:ring-1 focus-within:ring-ring", compact ? "min-h-8" : "min-h-11", error ? "border-destructive" : "border-input")}>
        {hideCountry ? <span className="shrink-0 border-r border-input px-3 text-fs-sm font-bold">{info.dial}</span> : (
          <select aria-label={`${label} country`} title={info.name} value={country} onChange={(event) => {
            const next = phoneCountries.find((item) => item.code === event.target.value);
            if (!next) return;
            setTouched(Boolean(value)); onCountryChange?.(next.code);
            if (onCommit && validatePhone(value, next.code, required, mobile).valid) onCommit(value, next.code);
          }} className={cn("shrink-0 rounded-l-row border-r border-input bg-surface px-1 text-fs-xs font-bold text-foreground outline-none", compact ? "h-8 w-14" : "h-11 w-[5.5rem]")}>
            {phoneCountries.map((item) => <option key={item.code} value={item.code}>{item.code === country ? compact ? item.dial : `${item.code} ${item.dial}` : `${item.name} (${item.dial})`}</option>)}
          </select>
        )}
        <input id={id} type="tel" inputMode="tel" autoComplete="tel" aria-label={label} aria-required={required} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} value={value} onChange={(event) => onChange(event.target.value)} placeholder={info.example} onBlur={() => {
          setTouched(true);
          if (result.valid) onCommit?.(value, country);
        }} onKeyDown={(event) => {
          if (event.key !== "Enter" || !onCommit) return;
          event.preventDefault(); setTouched(true);
          if (result.valid) { onCommit(value, country); event.currentTarget.blur(); }
        }} className={cn("min-w-0 w-full flex-1 rounded-r-row bg-transparent px-2 text-foreground outline-none placeholder:text-muted-foreground", compact ? "h-8 text-fs-xs" : "h-11 text-fs-sm")} />
      </div>
      {error ? <p id={`${id}-error`} role="alert" className="mt-1 break-words text-fs-xs leading-snug text-destructive">{error}</p> : null}
    </div>
  );
}