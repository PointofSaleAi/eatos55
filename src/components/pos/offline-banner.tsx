import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

/** Venue Wi-Fi drops constantly on handhelds — say so instead of failing silently. */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="flex shrink-0 items-center justify-center gap-2 bg-warning px-4 py-1.5 text-fs-xs font-bold text-warning-foreground"
    >
      <WifiOff className="size-3.5 shrink-0" />
      <span>Offline — orders are held on this device</span>
    </div>
  );
}
