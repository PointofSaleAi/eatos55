import { ArrowRight, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatMoney } from "@/lib/brand";
import { floorTables, tableStateMeta } from "@/lib/floor-data";
import { usePos } from "@/lib/pos-store";
import { useShiftSummary } from "@/lib/shift-summary";
import { cn } from "@/lib/utils";

type Msg = { id: string; from: "ai" | "me"; text: string };

const quickAsks = ["Summarise this shift", "Which tables are free?", "Flag slow orders"];

/** The small pink tile used as the assistant mark, no third party logo needed. */
export function AiMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-card bg-accent text-accent-foreground",
        className,
      )}
      aria-hidden
    >
      <Sun className="size-5" />
    </span>
  );
}

/**
 * Answers are read straight off the tickets, tables and shift figures already in
 * the store. Nothing is invented and nothing leaves the device.
 */
function useAnswer() {
  const { kpis, suggestions, tickets } = useShiftSummary();
  const { floor, tableStates, settings, canManageSettings } = usePos();
  const showTotals = settings.serverShiftTotals || canManageSettings;

  return (question: string): string => {
    const q = question.toLowerCase();

    if (q.includes("free") || q.includes("table") || q.includes("available")) {
      const mine = floorTables.filter((t) => t.floor === floor);
      const free = mine.filter((t) => (tableStates[t.name] ?? t.state) === "available");
      if (!free.length) return `Every table on ${floor} is in use right now.`;
      return `${free.length} of ${mine.length} tables are free on ${floor}: ${free
        .slice(0, 8)
        .map((t) => t.name)
        .join(", ")}${free.length > 8 ? " and more" : ""}.`;
    }

    if (q.includes("slow") || q.includes("late") || q.includes("waiting")) {
      const slow = [...tickets]
        .filter((t) => t.status === "preparing" || t.status === "payment")
        .sort((a, b) => b.arrivedMinutesAgo - a.arrivedMinutesAgo)
        .slice(0, 3);
      if (!slow.length) return "Nothing is running slow, every ticket is moving.";
      return slow
        .map(
          (t) =>
            `${t.label}${t.table ? ` (Table ${t.table})` : ""} has been ${
              t.status === "payment" ? "unpaid" : "preparing"
            } for ${t.arrivedMinutesAgo} min.`,
        )
        .join(" ");
    }

    if (q.includes("tip")) {
      const tip = kpis.find((k) => k.id === "tip");
      return showTotals && tip
        ? `Tips are at ${tip.value} so far this shift.`
        : "Tip totals are turned off for servers at this venue.";
    }

    if (q.includes("summar") || q.includes("shift") || q.includes("how")) {
      const open = tickets.filter((t) => t.status !== "paid").length;
      const money = kpis.find((k) => k.id === "sale");
      const sale = showTotals && money ? ` Sales are ${money.value}.` : "";
      const unpaid = tickets.filter((t) => t.status === "payment");
      const owed = unpaid.reduce((n, t) => n + t.total, 0);
      return `You have ${tickets.length} tickets, ${open} still open.${sale}${
        unpaid.length && showTotals
          ? ` ${unpaid.length} still owe ${formatMoney(owed)}.`
          : ""
      }`;
    }

    const named = floorTables.find((t) => q.includes(t.name.toLowerCase()));
    if (named) {
      const state = tableStates[named.name] ?? named.state;
      return `${named.name} is ${tableStateMeta[state].label.toLowerCase()}, seats ${named.seats}.`;
    }

    const first = suggestions[0];
    return first
      ? `Here is what I would do next: ${first.text}.`
      : "Nothing needs chasing right now, your floor is clear.";
  };
}

/** Full width overlay chat, opened from the Suggested next card. */
export function EatosAiChat({ onClose }: { onClose: () => void }) {
  const { suggestions } = useShiftSummary();
  const answer = useAnswer();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>(() => [
    {
      id: "open",
      from: "ai",
      text: suggestions[0]
        ? `${suggestions[0].text}. Want me to help with it?`
        : "Nothing needs chasing right now. Ask me anything about your shift.",
    },
  ]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [msgs]);

  const send = (text: string) => {
    const value = text.trim();
    if (!value) return;
    setDraft("");
    setMsgs((prev) => [
      ...prev,
      { id: `me-${prev.length}`, from: "me", text: value },
      { id: `ai-${prev.length}`, from: "ai", text: answer(value) },
    ]);
  };

  return (
    <div className="rounded-card border border-border bg-surface shadow-lg">
      <div className="flex items-start gap-2 border-b border-border p-3">
        <AiMark />
        <div className="min-w-0 flex-1">
          <p className="truncate text-fs-sm font-extrabold text-foreground">eatOS AI</p>
          <p className="flex items-center gap-1.5 text-fs-2xs font-semibold text-success">
            <span className="size-1.5 rounded-full bg-success" aria-hidden />
            Live on this shift
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close eatOS AI"
          className="grid size-8 shrink-0 place-items-center rounded-row text-muted-foreground transition-colors hover:bg-muted"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div
        ref={listRef}
        className="no-scrollbar max-h-[14rem] space-y-2 overflow-y-auto p-3"
        aria-live="polite"
      >
        {msgs.map((m) => (
          <div
            key={m.id}
            className={cn("flex gap-2", m.from === "me" ? "justify-end" : "items-start")}
          >
            {m.from === "ai" ? <AiMark className="size-7 rounded-row bg-accent/15 text-accent" /> : null}
            <p
              className={cn(
                "max-w-[85%] rounded-card px-3 py-2 text-fs-sm",
                m.from === "me"
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "bg-muted text-foreground",
              )}
            >
              {m.text}
            </p>
          </div>
        ))}

        <ul className="flex flex-wrap gap-1.5 pt-1">
          {quickAsks.map((a) => (
            <li key={a}>
              <button
                type="button"
                onClick={() => send(a)}
                className="rounded-pill border border-border px-3 py-1.5 text-fs-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                {a}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask eatOS AI anything..."
          aria-label="Ask eatOS AI anything"
          className="min-w-0 flex-1 rounded-card bg-muted px-3 py-2.5 text-fs-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          aria-label="Send"
          className="grid size-10 shrink-0 place-items-center rounded-card bg-accent text-accent-foreground transition-opacity disabled:opacity-40"
          disabled={!draft.trim()}
        >
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}
