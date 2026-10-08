import { NotebookPen, Plus, TriangleAlert, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Preset = { label: string; allergy?: boolean };

/** Pre-created item notes, shown when the notes field is focused. */
export const PRESET_NOTES: Preset[] = [
  { label: "Allergic to nuts", allergy: true },
  { label: "Allergic to peanuts", allergy: true },
  { label: "Allergic to shellfish", allergy: true },
  { label: "Allergic to dairy", allergy: true },
  { label: "Allergic to gluten", allergy: true },
  { label: "Allergic to eggs", allergy: true },
  { label: "Allergic to soy", allergy: true },
  { label: "No cutlery needed" },
  { label: "Extra napkins please" },
  { label: "No salt" },
  { label: "Sauce on the side" },
];

const isAllergy = (n: string) => PRESET_NOTES.some((p) => p.allergy && p.label === n);

/** Chip-based notes input: pick presets or type a manual note, remove with the chip's x. */
export function ItemNotesField({
  notes,
  onChange,
}: {
  notes: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = draft.trim().toLowerCase();
  const options = PRESET_NOTES.filter(
    (p) => !notes.includes(p.label) && (!q || p.label.toLowerCase().includes(q)),
  );
  const canAddManual =
    q.length > 0 && !notes.some((n) => n.toLowerCase() === q) && !PRESET_NOTES.some((p) => p.label.toLowerCase() === q);

  const add = (n: string) => {
    const v = n.trim();
    if (!v || notes.includes(v)) return;
    onChange([...notes, v]);
    setDraft("");
    inputRef.current?.focus();
  };
  const remove = (n: string) => onChange(notes.filter((x) => x !== n));

  return (
    <div
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <div
        className={cn(
          "flex min-h-ctl-md cursor-text flex-wrap items-center gap-1.5 rounded-row border bg-surface px-3 py-1.5",
          open ? "border-foreground/40" : "border-border",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <NotebookPen className="size-4 shrink-0 text-muted-foreground" />
        {notes.map((n) => (
          <span
            key={n}
            className={cn(
              "inline-flex max-w-full items-center gap-1 rounded-pill border px-2 py-0.5 text-fs-xs font-medium",
              isAllergy(n)
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-border bg-background text-foreground",
            )}
          >
            {isAllergy(n) && <TriangleAlert className="size-3 shrink-0" />}
            <span className="break-words">{n}</span>
            <button
              type="button"
              aria-label={`Remove note ${n}`}
              onClick={(e) => {
                e.stopPropagation();
                remove(n);
              }}
              className="-mr-1 grid size-5 shrink-0 place-items-center rounded-full hover:bg-foreground/10"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={draft}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setDraft(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && notes.length) {
              remove(notes[notes.length - 1] ?? "");
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder={notes.length ? "Add more..." : "Item Notes"}
          aria-label="Item notes"
          aria-expanded={open}
          className="h-7 min-w-[6rem] flex-1 bg-transparent text-fs-sm text-foreground outline-none"
        />
      </div>

      {open && (options.length > 0 || canAddManual) && (
        <ul
          role="listbox"
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-row border border-border bg-popover py-1 text-popover-foreground shadow-lg"
        >
          {canAddManual && (
            <li>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => add(draft)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-fs-sm hover:bg-muted"
              >
                <Plus className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 break-words">Add "{draft.trim()}"</span>
              </button>
            </li>
          )}
          {options.map((p) => (
            <li key={p.label}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => add(p.label)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-fs-sm hover:bg-muted"
              >
                {p.allergy ? (
                  <TriangleAlert className="size-4 shrink-0 text-destructive" />
                ) : (
                  <NotebookPen className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="min-w-0 flex-1">{p.label}</span>
                {p.allergy && (
                  <span className="text-fs-xs font-semibold uppercase tracking-wide text-destructive">Allergy</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
