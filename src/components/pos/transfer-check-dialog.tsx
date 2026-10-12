import { useRef, useState } from "react";
import { Check, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { employees } from "@/lib/demo-data";
import { useConfirm } from "@/components/pos/confirm-sheet";
import { cn } from "@/lib/utils";

export function TransferCheckDialog({ currentOwner, onClose, onTransfer }: {
  currentOwner: string;
  onClose: () => void;
  onTransfer: (owner: string) => void;
}) {
  const confirm = useConfirm();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(currentOwner);
  const [confirming, setConfirming] = useState(false);
  const owners = employees.some((employee) => employee.name === currentOwner)
    ? employees
    : [...employees, { id: "current-owner", name: currentOwner, role: "", level: "", state: "" }];
  const visible = owners.filter((employee) => employee.name.toLowerCase().includes(query.trim().toLowerCase()));
  const canUpdate = selected !== currentOwner;

  const applyTransfer = async () => {
    setConfirming(true);
    const ok = await confirm({
      title: "Confirm",
      message: `Are you sure you want to transfer the ordering check to ${selected}?`,
      confirmLabel: "Yes, Transfer",
      cancelLabel: "No",
      rowButtons: true,
    });
    setConfirming(false);
    if (ok) onTransfer(selected);
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !confirmingRef.current) onClose(); }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sheet gap-0 rounded-sheet border-border bg-surface p-0">
        <div className="border-b border-border px-4 py-3">
          <DialogTitle className="text-center text-fs-base font-extrabold tracking-normal">Transfer Check</DialogTitle>
        </div>
        <div className="px-4 pt-3">
          <label className="flex h-11 items-center gap-2 rounded-row border border-border bg-muted px-3 focus-within:ring-2 focus-within:ring-ring">
            <Search className="size-5 shrink-0 text-muted-foreground" />
            <input autoFocus aria-label="Search employees" placeholder="Search" value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-fs-sm text-foreground outline-none" />
          </label>
          <DialogDescription className="py-3 text-fs-xs text-muted-foreground">Select an employee to transfer the ordering check</DialogDescription>
        </div>
        <div role="group" aria-label="Employees" className="no-scrollbar max-h-[min(24rem,50dvh)] overflow-y-auto">
          {visible.map((employee) => (
            <button key={employee.id} type="button" aria-pressed={selected === employee.name} onClick={() => setSelected(employee.name)} className={cn("flex min-h-12 w-full cursor-pointer items-center gap-3 border-t border-border px-4 py-2 text-left text-foreground transition-colors hover:bg-muted", selected === employee.name && "bg-accent/10")}>
              <span className="grid size-8 shrink-0 place-items-center rounded-pill bg-secondary text-fs-xs font-bold text-secondary-foreground">{employee.name.split(" ").filter(Boolean).map((part) => part[0]).slice(0, 2).join("")}</span>
              <span className="min-w-0 flex-1 whitespace-normal text-fs-sm font-bold text-foreground">{employee.name}</span>
              {employee.name === currentOwner ? <span className="shrink-0 text-fs-xs text-muted-foreground">Current Owner</span> : null}
              <span className="grid size-5 shrink-0 place-items-center">{selected === employee.name ? <Check className="size-5 text-accent" /> : null}</span>
            </button>
          ))}
          {visible.length === 0 ? <p className="px-4 py-6 text-center text-fs-sm text-muted-foreground">No employees found</p> : null}
        </div>
        <div className="border-t border-border p-3 pb-[calc(0.75rem+var(--sab,0px))]">
          <button
            type="button"
            disabled={!canUpdate}
            onClick={applyTransfer}
            className="min-h-ctl-lg w-full cursor-pointer rounded-card bg-primary text-fs-base font-extrabold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Update
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
