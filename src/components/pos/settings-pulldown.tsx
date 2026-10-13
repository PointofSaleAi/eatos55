import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Lock, LogOut, UserRound } from "lucide-react";
import { useConfirm } from "@/components/pos/confirm-sheet";
import { Button } from "@/components/ui/button";
import { useBackDismiss } from "@/hooks/use-back-dismiss";
import { settingsGroups } from "@/lib/settings-destinations";
import { usePos } from "@/lib/pos-store";

/**
 * Full settings menu opened by the header chevron, separate from Dashboard.
 */
export function SettingsPullDown({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { canManageSettings, signOut } = usePos();
  const confirm = useConfirm();
  const navigate = useNavigate();
  useBackDismiss(open, onClose);

  if (!open) return null;

  return (
    <div role="region" aria-label="Settings menu" className="absolute inset-0 z-30 bg-background">
      <div className="no-scrollbar h-full overflow-y-auto bg-background pt-[5.5rem]"
        style={{ paddingBottom: "calc(1rem + var(--tabs-h, 0px))" }}>
        <div className="mx-auto w-full max-w-[68rem] px-[clamp(0.75rem,2vw,1.5rem)]">
          <h1 className="mb-5 text-fs-xl font-extrabold text-foreground">Settings</h1>
          <nav aria-label="Settings categories" className="grid min-w-0 items-start gap-6 md:grid-cols-2">
            {settingsGroups.map((group, index) => (
              <ul key={index} className="min-w-0 divide-y divide-border border-y border-border">
                {group.map((entry) => {
                  const locked = Boolean(entry.manager) && !canManageSettings;
                  const content = <><entry.icon className="size-5 shrink-0" /><span className="min-w-0 flex-1 whitespace-normal text-left">{entry.label}</span>{locked ? <Lock className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0 text-muted-foreground" />}</>;
                  return <li key={entry.to}>
                    <Button asChild={!locked} variant="ghost" disabled={locked} className="h-auto min-h-ctl-lg w-full justify-start gap-3 rounded-none px-3 py-3 text-fs-sm text-foreground hover:bg-muted hover:text-foreground">
                      {locked ? content : <Link to={entry.to} preload="intent" onClick={onClose}>{content}</Link>}
                    </Button>
                  </li>;
                })}
              </ul>
            ))}
            <ul className="min-w-0 divide-y divide-border border-y border-border">
              <li><Button variant="ghost" className="h-auto min-h-ctl-lg w-full justify-start gap-3 rounded-none px-3 py-3 text-fs-sm text-foreground hover:bg-muted hover:text-foreground" onClick={() => { onClose(); window.dispatchEvent(new Event("pos:switch-user")); }}><UserRound className="size-5" />Switch User</Button></li>
              <li><Button variant="ghost" className="h-auto min-h-ctl-lg w-full justify-start gap-3 rounded-none px-3 py-3 text-fs-sm text-destructive hover:bg-muted hover:text-destructive" onClick={async () => {
                const accepted = await confirm({ title: "Sign out?", message: "You will need to sign in again to use this device.", confirmLabel: "Sign Out", destructive: true });
                if (!accepted) return;
                onClose(); signOut(); void navigate({ to: "/", replace: true });
              }}><LogOut className="size-5" />Sign Out</Button></li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
