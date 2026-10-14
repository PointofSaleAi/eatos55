import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type SpeechRecognitionLike = {
  lang: string;
  onresult: ((e: { results: { transcript: string }[][] }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

/** The speech engine lives on `window`, so it is only ever read on a tap. */
function getEngine(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Dictation for a search field: tap the mic, speak, and the words land in the
 * field as search text. Nothing is submitted or saved, and text the user already
 * typed is left alone when nothing is heard or the device has no speech engine.
 * Tapping again while listening stops it.
 */
export function useVoiceSearch(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const resultRef = useRef(onResult);

  useEffect(() => {
    resultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    setSupported(getEngine() !== null);
  }, []);

  // A session left running when the screen unmounts must not keep the mic open.
  useEffect(
    () => () => {
      try {
        recRef.current?.stop();
      } catch {
        // Already stopped; nothing to clean up.
      }
      recRef.current = null;
    },
    [],
  );

  const start = useCallback(() => {
    const Engine = getEngine();
    if (!Engine) {
      toast.info("Voice search is not available on this device");
      return;
    }
    if (recRef.current) {
      try {
        recRef.current.stop();
      } catch {
        // Already stopped.
      }
      return;
    }
    let rec: SpeechRecognitionLike;
    try {
      rec = new Engine();
    } catch {
      toast.info("Voice search is not available on this device");
      return;
    }
    rec.lang = (typeof navigator !== "undefined" && navigator.language) || "en-US";
    rec.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript ?? "";
      if (text) resultRef.current(text);
    };
    rec.onerror = () => toast.info("Could not hear anything, try again");
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };
    recRef.current = rec;
    setListening(true);
    try {
      rec.start();
      toast.info("Listening…");
    } catch {
      setListening(false);
      recRef.current = null;
      toast.info("Could not hear anything, try again");
    }
  }, []);

  return { supported, listening, start };
}
