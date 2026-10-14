import { Link, useNavigate } from "@tanstack/react-router";
import { BookUser, ChartNoAxesColumn, ChevronUp, CircleDollarSign, Headset, LayoutGrid, Lock, LogOut, SlidersHorizontal, Users, Utensils, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useConfirm } from "@/components/pos/confirm-sheet";
import { Button } from "@/components/ui/button";
import { useBackDismiss } from "@/hooks/use-back-dismiss";
import { settingsGroups } from "@/lib/settings-destinations";
import { usePos } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

const shortcuts: { to?: string; label: string; description: string; icon: LucideIcon; manager?: boolean }[] = [
  { to: "/settings/general", label: "Restaurant", description: "View and manage your restaurant & owner information.", icon: LayoutGrid },
  { to: "/settings/menu", label: "Menu", description: "View and manage your restaurant menu, categories, default modifiers, modifiers, add-ons, products, group.", icon: Utensils },
  { to: "/settings/payments", label: "Payment", description: "View and manage your accepted payment types, taxes, discounts, gratuity, service charge, card reader, card management, reports.", icon: CircleDollarSign },
  { to: "/settings/workforce", label: "Workforce", description: "View and manage your team and their schedules.", icon: Users },
  { to: "/settings/reports", label: "Reports", description: "View your daily performance data.", icon: ChartNoAxesColumn },
  { to: "/settings/more", label: "Advanced", description: "View and manage your advanced point of sale features.", icon: SlidersHorizontal, manager: true },
  { to: "/settings/guestbook", label: "Guestbook", description: "Guest contact information and order history.", icon: BookUser },
  { to: "/system/customer-support", label: "Support", description: "View support personnel information.", icon: Headset },
  { label: "Log out", description: "Sign out of this device.", icon: LogOut },
];

/**
 * Full settings menu opened by the header chevron, separate from Dashboard.
 */
export function SettingsPullDown({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { canManageSettings, signOut } = usePos();
  const confirm = useConfirm();
  const navigate = useNavigate();
  useBackDismiss(open, onClose);
  const [present, setPresent] = useState(open);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragY = useRef<number | null>(null);
  useEffect(() => {
    if (open) { setPresent(true); return; }
    const timer = window.setTimeout(() => setPresent(false), 230);
    return () => window.clearTimeout(timer);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    panelRef.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (document.querySelector('[role="dialog"][data-state="open"], [role="alertdialog"], [role="dialog"]:not([data-state="closed"])')) return;
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key === "Tab") {
        const controls = panelRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])');
        if (!controls?.length) return;
        const first = controls[0]; const last = controls[controls.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("keydown", escape); if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, [open, onClose]);
  if (!present && !open) return null;

  const logout = async () => {
    const accepted = await confirm({ title: "Sign out?", message: "You will need to sign in again to use this device.", confirmLabel: "Sign Out", destructive: true });
    if (!accepted) return;
    onClose(); signOut(); void navigate({ to: "/", replace: true });
  };

  return (
    <div ref={panelRef} tabIndex={-1} role="region" aria-label="Settings menu" aria-hidden={!open} data-open={open}
      className={cn("header-settings-panel absolute inset-x-0 bottom-0 top-14 z-[35] flex flex-col bg-settings-overlay text-topbar-foreground outline-none", open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0")}
      onClick={(event) => { if (!(event.target as HTMLElement).closest("a,button")) onClose(); }}>
      <div className="header-settings-body no-scrollbar min-h-0 flex-1 overflow-y-auto">
        <nav aria-label="Settings categories" className="header-settings-grid mx-auto w-full max-w-[90rem]">
          {shortcuts.map((entry) => {
            const destination = settingsGroups.flat().find((row) => row.to === entry.to);
            const locked = Boolean(destination?.manager || entry.manager) && !canManageSettings;
            const content = <><entry.icon className="header-settings-icon shrink-0" strokeWidth={1.8} /><span className="min-w-0 flex-1 whitespace-normal text-left"><span className="header-settings-heading inline-flex max-w-full items-center gap-2 border-b border-topbar-muted">{entry.label}{locked ? <Lock className="size-4 shrink-0" /> : null}</span><span className="header-settings-description block">{entry.description}</span></span></>;
            return <Button key={entry.label} asChild={Boolean(entry.to) && !locked} disabled={locked} variant="ghost"
              onClick={entry.to ? undefined : () => void logout()}
              className="header-settings-shortcut h-auto w-full min-w-0 items-start justify-start rounded-none text-topbar-foreground hover:bg-topbar-border hover:text-topbar-foreground">
              {entry.to && !locked ? <Link to={destination?.to ?? entry.to} preload="intent" onClick={onClose}>{content}</Link> : content}
            </Button>;
          })}
        </nav>
      </div>
      <div className="flex shrink-0 justify-center pb-[var(--sab,0px)]">
        <Button variant="ghost" aria-label="Close settings panel" title="Close settings panel" className="h-11 w-24 touch-none rounded-none text-topbar-foreground hover:bg-topbar-border hover:text-topbar-foreground"
          onClick={onClose}
          onPointerDown={(event) => { dragY.current = event.clientY; event.currentTarget.setPointerCapture(event.pointerId); }}
          onPointerUp={(event) => { if (dragY.current !== null && event.clientY - dragY.current < -25) onClose(); dragY.current = null; }}
          onPointerCancel={() => { dragY.current = null; }}><ChevronUp className="size-6" /></Button>
      </div>
    </div>
  );
}
