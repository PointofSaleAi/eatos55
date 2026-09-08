import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { usePos } from "@/lib/pos-store";

/**
 * Tap to Pay on iPhone is an iPhone only capability. iPad, Android tablets,
 * Windows machines and desktop browsers must never present it as usable, in
 * portrait or landscape. An iPhone held in landscape still counts as iPhone,
 * so this is a device check and never a viewport check.
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

export const TTP_DEVICE_NOTE = "Available on iPhone only";

export type TapToPayAvailability = {
  /** True when Tap to Pay may be used here. */
  available: boolean;
  /** False until the device check has run on the client. */
  resolved: boolean;
  /** Short explanation for a disabled control. */
  reason: string;
  /** True when the hidden developer switch is forcing availability. */
  override: boolean;
};

export function useTapToPayAvailable(): TapToPayAvailability {
  const { settings } = usePos();
  const isIPhone = useIsIPhone();
  const override = settings.tapToPayDevOverride;
  return {
    available: override || isIPhone === true,
    resolved: override || isIPhone !== null,
    reason: TTP_DEVICE_NOTE,
    override,
  };
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
