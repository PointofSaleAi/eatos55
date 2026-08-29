import { ShiftDashboard } from "@/components/pos/dashboard/shift-dashboard";
import { useBackDismiss } from "@/hooks/use-back-dismiss";

/**
 * The panel that pulls down from the dark top bar: a shift dashboard for the
 * server, with the settings destinations as one slim column on the right.
 */
export function SettingsPullDown({ open, onClose }: { open: boolean; onClose: () => void }) {
  useBackDismiss(open, onClose);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-30 flex flex-col">
      <div className="no-scrollbar max-h-full overflow-y-auto bg-shell pt-[5.5rem]"
        style={{ paddingBottom: "calc(1rem + var(--tabs-h, 0px))" }}>
        <div className="mx-auto w-full max-w-[92rem] px-[clamp(0.75rem,2vw,1.5rem)]">
          <ShiftDashboard onClose={onClose} />
        </div>
      </div>
      <button
        type="button"
        aria-label="Close dashboard"
        onClick={onClose}
        className="min-h-0 flex-1 bg-shell/50"
      />
    </div>
  );
}
