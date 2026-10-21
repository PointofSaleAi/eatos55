import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePos } from "@/lib/pos-store";

/**
 * navigator.onLine alone reports "offline" on machines whose connectivity
 * check is blocked (corporate networks, sandboxed preview frames) even though
 * the app itself is clearly being served. Confirm with a real same-origin
 * request and only fall back to navigator.onLine when that request fails.
 */
export function useDeviceOnline(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    let cancelled = false;
    const probe = async () => {
      if (navigator.onLine !== false) {
        try {
          await fetch(window.location.href, {
            method: "HEAD",
            cache: "no-store",
            signal: AbortSignal.timeout(8000),
          });
          if (!cancelled) setOnline(true);
          return;
        } catch {
          /* unreachable or blocked - fall through to navigator.onLine */
        }
      }
      if (!cancelled) setOnline(navigator.onLine);
    };
    const update = () => void probe();
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const interval = window.setInterval(update, 60000);
    return () => {
      cancelled = true;
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      window.clearInterval(interval);
    };
  }, []);
  return online;
}

/**
 * Tap to Pay on iPhone is an iPhone only capability. iPad, Android tablets,
 * Windows machines and desktop browsers must never present it as usable. An
 * iPhone held in landscape renders the tablet/web layout, and Tap to Pay needs
 * a phone screen, so the phone layout is required on top of the device check.
 */
export function detectIPhone(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  // iPadOS in desktop mode reports "Macintosh" with touch points: not an iPhone.
  if (/iPad/i.test(ua)) return false;
  if (/Macintosh/i.test(ua) && (navigator.maxTouchPoints ?? 0) > 1) return false;
  return /iPhone|iPod/i.test(ua);
}

/** null until hydration has resolved the real device, so SSR output is stable. */
export function useIsIPhone(): boolean | null {
  const [isIPhone, setIsIPhone] = useState<boolean | null>(null);
  useEffect(() => {
    setIsIPhone(detectIPhone());
  }, []);
  return isIPhone;
}

/** The handheld layout: phone widths only, never tablet or web. */
const PHONE_VIEWPORT = "(max-width: 767px)";

/**
 * True only while the phone layout is showing. The server snapshot is null so
 * nothing flashes on a tablet or desktop render before the real viewport is
 * read; DeviceFrame holds rendering until mounted, so that never reaches the DOM.
 */
export function useIsMobileView(): boolean | null {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(PHONE_VIEWPORT);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(PHONE_VIEWPORT).matches,
    () => null,
  );
}

export const TTP_DEVICE_NOTE = "Available on iPhone only";

export type TapToPayAvailability = {
  /** True when Tap to Pay may be used here. */
  available: boolean;
  /** False until the device and layout checks have run on the client. */
  resolved: boolean;
  /** Short explanation for a disabled control. */
  reason: string;
  /** True when the hidden developer switch is forcing availability. */
  override: boolean;
};

export function useTapToPayAvailable(): TapToPayAvailability {
  const { settings } = usePos();
  const isIPhone = useIsIPhone();
  const mobileView = useIsMobileView();
  const override = settings.tapToPayDevOverride;
  return {
    available: override || (isIPhone === true && mobileView === true),
    resolved: override || (isIPhone !== null && mobileView !== null),
    reason: TTP_DEVICE_NOTE,
    override,
  };
}

/**
 * The generic contactless tender carries the "Tap to Pay" name, so it follows
 * the same phone-only rule and steps aside when the iPhone flow is offered.
 */
export function useTapToPayTenderVisible(): boolean {
  const mobileView = useIsMobileView();
  const ttp = useTapToPayAvailable();
  return mobileView === true && !ttp.available;
}

/**
 * Route guard for the Tap to Pay screens. The check is client side, so it runs
 * in an effect after hydration rather than in a loader.
 */
export function useRequireTapToPayDevice(): TapToPayAvailability {
  const state = useTapToPayAvailable();
  const navigate = useNavigate();
  useEffect(() => {
    if (state.resolved && !state.available) {
      void navigate({ to: "/settings/payments", replace: true });
    }
  }, [state.resolved, state.available, navigate]);
  return state;
}
