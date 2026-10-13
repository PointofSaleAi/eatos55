import { ArrowLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

/** Demo roster grouped by job, shown from the Rooms staff button. */
const roster: { name: string; role: string }[] = [
  { name: "Elizer Cruz", role: "Account Manager" },
  { name: "Nadia Stone", role: "Account Manager" },
  { name: "Abhishek Bhujel", role: "Supervisor" },
  { name: "Ram Acharya", role: "Supervisor" },
  { name: "Shubhek Prasad", role: "Supervisor" },
  { name: "Marcus Lee", role: "Bartender" },
  { name: "Abhishek Bahadur", role: "Bartender" },
  { name: "Dana Whitfield", role: "Cashier" },
  { name: "Sam Okoye", role: "Cashier" },
  { name: "Francis Obera", role: "Manager" },
  { name: "Priya Nair", role: "Manager" },
];

const initials = (n: string) =>
  n
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function StaffListSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    const map = new Map<string, string[]>();
    for (const s of roster) {
      if (term && !s.name.toLowerCase().includes(term) && !s.role.toLowerCase().includes(term))
        continue;
      map.set(s.role, [...(map.get(s.role) ?? []), s.name]);
    }
    return [...map.entries()];
  }, [q]);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-border bg-surface p-0 sm:max-w-xs"
      >
        <div className="shrink-0 space-y-3 border-b border-border px-4 pb-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="flex size-9 items-center justify-center rounded-full text-foreground hover:bg-muted"
          >
            <ArrowLeft className="size-5" aria-hidden />
          </button>
          <SheetTitle className="text-fs-xl font-extrabold text-foreground">Staff List</SheetTitle>
          <label className="flex h-10 items-center gap-2 rounded-pill border border-border bg-background px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              aria-label="Search staff"
              className="min-w-0 flex-1 bg-transparent text-fs-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {groups.length === 0 ? (
            <p className="py-8 text-center text-fs-sm text-muted-foreground">No staff found</p>
          ) : (
            groups.map(([role, names]) => (
              <section key={role} className="mb-4">
                <h3 className="mb-2 text-fs-sm font-extrabold text-foreground">{role}</h3>
                <ul className="space-y-2">
                  {names.map((n) => (
                    <li key={n} className="flex items-center gap-2.5">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[0.625rem] font-extrabold text-foreground">
                        {initials(n)}
                      </span>
                      <span className="truncate text-fs-sm text-foreground">{n}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
