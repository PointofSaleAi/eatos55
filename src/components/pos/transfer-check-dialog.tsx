import { useState } from "react";
import { Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { employees } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function TransferCheckDialog({ currentOwner, onClose, onTransfer }: {
  currentOwner: string;
  onClose: () => void;
  onTransfer: (owner: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(currentOwner);
  const owners = employees.some((employee) => employee.name === currentOwner)
    ? employees
    : [...employees, { id: "current-owner", name: currentOwner, role: "", level: "", state: "" }];
  const visible = owners.filter((employee) => employee.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sheet gap-0 rounded-sheet border-border bg-surface p-0">
        <div className="grid grid-cols-[5rem_minmax(0,1fr)_5rem] items-center border-b border-border px-3 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <DialogTitle className="text-center text-fs-base font-extrabold tracking-normal">Transfer Check</DialogTitle>
          <Button variant="ghost" size="sm" disabled={selected === currentOwner} onClick={() => onTransfer(selected)} className="text-accent hover:text-accent">Update</Button>
        </div>
        <div className="px-4 pt-3">
          <label className="flex h-11 items-center gap-2 rounded-row border border-border bg-muted px-3 focus-within:ring-2 focus-within:ring-ring">
            <Search className="size-5 shrink-0 text-muted-foreground" />
            <input autoFocus aria-label="Search employees" placeholder="Search" value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-fs-sm text-foreground outline-none" />
          </label>
          <DialogDescription className="py-3 text-fs-xs text-muted-foreground">Select an employee to transfer the ordering check</DialogDescription>
        </div>
        <div role="group" aria-label="Employees" className="no-scrollbar max-h-[min(24rem,50dvh)] overflow-y-auto pb-2">
          {visible.map((employee) => (
            <Button key={employee.id} variant="ghost" aria-pressed={selected === employee.name} onClick={() => setSelected(employee.name)} className={cn("h-auto min-h-12 w-full justify-start gap-3 rounded-none border-t border-border px-4 py-2 text-left hover:bg-muted", selected === employee.name && "bg-accent/10")}>
              <span className="grid size-8 shrink-0 place-items-center rounded-pill bg-secondary text-fs-xs font-bold text-secondary-foreground">{employee.name.split(" ").filter(Boolean).map((part) => part[0]).slice(0, 2).join("")}</span>
              <span className="min-w-0 flex-1 whitespace-normal text-fs-sm font-bold">{employee.name}</span>
              {employee.name === currentOwner ? <span className="shrink-0 text-fs-xs text-muted-foreground">Current Owner</span> : null}
              <span className="grid size-5 shrink-0 place-items-center">{selected === employee.name ? <Check className="size-5 text-accent" /> : null}</span>
            </Button>
          ))}
          {visible.length === 0 ? <p className="px-4 py-6 text-center text-fs-sm text-muted-foreground">No employees found</p> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}