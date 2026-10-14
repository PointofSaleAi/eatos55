import { Link, useNavigate } from "@tanstack/react-router";
import { BookUser, ChartNoAxesColumn, ChevronUp, CircleDollarSign, Headset, LayoutGrid, Lock, LogOut, SlidersHorizontal, Users, Utensils, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useConfirm } from "@/components/pos/confirm-sheet";
import { Button } from "@/components/ui/button";
import { useBackDismiss } from "@/hooks/use-back-dismiss";
import { settingsGroups } from "@/lib/settings-destinations";
import { usePos } from "@/lib/pos-store";

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
  const bodyRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ x: number; y: number; eligible: boolean } | null>(null);
  const suppressClickUntil = useRef(0);
  const beginGesture = (x: number, y: number, handle: boolean) => {
    const body = bodyRef.current;
    const atBottom = !body || body.scrollHeight - body.clientHeight - body.scrollTop <= 2;
    gesture.current = { x, y, eligible: handle || atBottom };
  };
  const finishGesture = (x: number, y: number) => {
    const start = gesture.current;
    gesture.current = null;
    if (!start) return;
    const dy = y - start.y;
    const dx = x - start.x;
    // A drag must never become a shortcut tap, even if it did not close.
    if (Math.abs(dy) > 10 || Math.abs(dx) > 10) suppressClickUntil.current = Date.now() + 500;
    if (start.eligible && dy <= -40 && Math.abs(dy) > Math.abs(dx) * 1.5) onClose();
  };
  useEffect(() => {
    if (open) { setPresent(true); return; }
    gesture.current = null;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setPresent(false); return; }
    // Fallback if an interrupted animation does not emit animationend.
    const timer = window.setTimeout(() => setPresent(false), 400);
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
      inert={!open}
      className="header-settings-panel absolute inset-x-0 bottom-0 top-14 z-[35] flex flex-col bg-settings-overlay text-topbar-foreground outline-none"
      onAnimationEnd={(event) => { if (event.target === event.currentTarget && event.animationName === "settings-collapse" && !open) setPresent(false); }}
      onClickCapture={(event) => { if (Date.now() < suppressClickUntil.current) { event.preventDefault(); event.stopPropagation(); } }}
      onClick={(event) => { if (!(event.target as HTMLElement).closest("a,button")) onClose(); }}>
      <div ref={bodyRef} className="header-settings-body no-scrollbar min-h-0 flex-1 overflow-y-auto"
        onDragStart={(event) => event.preventDefault()}
        onTouchStart={(event) => { const touch = event.touches[0]; if (touch && event.touches.length === 1) beginGesture(touch.clientX, touch.clientY, false); else gesture.current = null; }}
        onTouchEnd={(event) => { const touch = event.changedTouches[0]; if (touch) finishGesture(touch.clientX, touch.clientY); }}
        onTouchCancel={() => { gesture.current = null; }}
        onPointerDown={(event) => { if (event.pointerType !== "touch" && event.button === 0) beginGesture(event.clientX, event.clientY, false); }}
        onPointerUp={(event) => { if (event.pointerType !== "touch") finishGesture(event.clientX, event.clientY); }}
        onPointerCancel={(event) => { if (event.pointerType !== "touch") gesture.current = null; }}>
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
          onPointerDown={(event) => { if (event.button !== 0) return; beginGesture(event.clientX, event.clientY, true); event.currentTarget.setPointerCapture(event.pointerId); }}
          onPointerUp={(event) => finishGesture(event.clientX, event.clientY)}
          onPointerCancel={() => { gesture.current = null; }}><ChevronUp className="size-6" /></Button>
      </div>
    </div>
  );
}
