import { ArrowLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { initialsOf, staffRoles, staffRoster } from "@/lib/floor-data";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useWideViewport } from "@/hooks/use-layout-mode";

function StaffList({ onPick }: { onPick: (name: string) => void }) {
  const [q, setQ] = useState("");
  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return staffRoles
      .map((role) => ({
        role,
        people: staffRoster.filter(
          (s) => s.role === role && (!needle || s.name.toLowerCase().includes(needle)),
        ),
      }))
      .filter((g) => g.people.length > 0);
  }, [q]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-4 pb-3">
        <div className="flex min-h-ctl-sm items-center gap-2 rounded-pill border border-border bg-surface px-3.5">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            aria-label="Search staff"
            className="min-w-0 flex-1 bg-transparent py-2 text-fs-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        {groups.length === 0 ? (
          <p className="py-10 text-center text-fs-sm text-muted-foreground">No staff found</p>
        ) : (
          groups.map((g) => (
            <section key={g.role} className="pt-2">
              <h3 className="pb-1 text-fs-base font-extrabold text-foreground">{g.role}</h3>
              <ul>
                {g.people.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => onPick(s.name)}
                      className="flex min-h-tap w-full items-center gap-3 rounded-row px-1 py-2 text-left transition-colors hover:bg-muted"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-fs-xs font-extrabold text-muted-foreground">
                        {initialsOf(s.name)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-fs-sm font-bold text-foreground">
                        {s.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

/** Staff roster: side panel on wide screens, bottom sheet on phone and tablet portrait. */
export function StaffPanel({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (name: string) => void;
}) {
  const wide = useWideViewport();

  if (wide) {
    return (
      <aside
        aria-hidden={!open}
        className={cn(
          "flex w-[19rem] shrink-0 flex-col border-l border-border bg-surface transition-all",
          open ? "" : "hidden",
        )}
      >
        <div className="flex shrink-0 items-center gap-2 px-4 pb-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close staff list"
            className="grid size-11 shrink-0 place-items-center rounded-pill text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-5" />
          </button>
        </div>
        <h2 className="shrink-0 px-4 pb-3 text-fs-xl font-extrabold text-foreground">Staff List</h2>
        <StaffList onPick={onPick} />
      </aside>
    );
  }

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <SheetContent
        side="bottom"
        className="mx-auto flex h-[80dvh] w-full max-w-sheet flex-col rounded-t-sheet border-0 bg-surface p-0"
      >
        <SheetHeader className="shrink-0 px-4 pb-2 pt-4">
          <SheetTitle className="text-left text-fs-xl font-extrabold text-foreground">
            Staff List
          </SheetTitle>
        </SheetHeader>
        <StaffList onPick={onPick} />
      </SheetContent>
    </Sheet>
  );
}
