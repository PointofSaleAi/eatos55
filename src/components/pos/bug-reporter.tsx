import { useState } from "react";
import { Bug, Camera, Loader2, Triangle, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { usePos } from "@/lib/pos-store";
import { bugReporterVisible, validateBugReport, type BugReportDraft } from "@/lib/bug-report";

const emptyDraft: BugReportDraft = { title: "", email: "", description: "" };

export function BugReporter() {
  const { settings, session, sessionReady } = usePos();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [attempted, setAttempted] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [screenshot, setScreenshot] = useState<string>();
  const errors = validateBugReport(draft);

  if (!sessionReady || !bugReporterVisible(settings.sentry, session.signedIn)) return null;

  const close = () => { setOpen(false); setDraft(emptyDraft); setAttempted(false); setScreenshot(undefined); };
  const capture = async () => {
    const surface = document.querySelector<HTMLElement>("[data-pos-screen]");
    if (!surface) return;
    setCapturing(true);
    try {
      const { toPng } = await import("html-to-image");
      const image = await toPng(surface, { pixelRatio: 1, cacheBust: false,
        filter: (node) => !(node instanceof HTMLElement && node.hasAttribute("data-bug-reporter")),
      });
      setScreenshot(image);
    } catch {
      toast.error("Screenshot could not be captured. You can still describe the issue.");
    } finally { setCapturing(false); }
  };

  const fieldClass = "w-full rounded-sm border border-input bg-surface px-3 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring aria-[invalid=true]:border-destructive";

  return <>
    <Button data-bug-reporter variant="default" size="icon" aria-label="Report a Bug" title="Report a Bug"
      className="fixed right-4 top-[calc(var(--sat,0px)+5.5rem)] z-40 size-12 rounded-full bg-accent text-accent-foreground shadow-lg hover:bg-accent/90"
      onClick={() => setOpen(true)}><Bug className="size-5!" /></Button>
    <Dialog open={open} onOpenChange={(next) => { if (!next) close(); }}>
      <DialogContent aria-describedby={undefined} className="inset-0 flex h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 bg-surface p-0 sm:rounded-none">
        <header className="grid min-h-14 shrink-0 grid-cols-[3rem_1fr_3rem] items-center bg-tile-blue px-2 pt-[var(--sat,0px)] text-primary-foreground">
          <Button variant="ghost" size="icon" aria-label="Close bug report" onClick={close}><X className="size-5!" /></Button>
          <DialogTitle className="text-center text-lg tracking-normal">Report a Bug</DialogTitle>
          <Triangle aria-label="Sentry" className="mx-auto size-8 text-primary-foreground" />
        </header>
        <form className="flex min-h-0 flex-1 flex-col" noValidate onSubmit={(event) => {
          event.preventDefault(); setAttempted(true);
          if (Object.values(errors).some(Boolean)) return;
          const report = { ...draft, screenshot, createdAt: new Date().toISOString(), page: window.location.pathname };
          const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }));
          const link = document.createElement("a"); link.href = url; link.download = "eatos-bug-report.json"; link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          toast.info("Report downloaded. Sending reports to support is not connected yet.");
        }}>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            <div className="space-y-1"><label htmlFor="bug-title" className="text-xs text-foreground">Title (Required)</label>
              <input id="bug-title" className={fieldClass} placeholder="Briefly describe the issue" value={draft.title} required aria-invalid={attempted && !!errors.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              {attempted && errors.title && <p role="alert" className="text-xs text-destructive">{errors.title}</p>}
            </div>
            <div className="space-y-1"><label htmlFor="bug-email" className="text-xs text-foreground">Email</label>
              <input id="bug-email" type="email" className={fieldClass} placeholder="your.email@example.org" value={draft.email} aria-invalid={attempted && !!errors.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
              {attempted && errors.email && <p role="alert" className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1"><label htmlFor="bug-description" className="text-xs text-foreground">Description (Required)</label>
              <textarea id="bug-description" className={`${fieldClass} min-h-32 resize-y`} placeholder="What's the bug? What did you expect?" value={draft.description} required aria-invalid={attempted && !!errors.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              {attempted && errors.description && <p role="alert" className="text-xs text-destructive">{errors.description}</p>}
            </div>
            <Button type="button" disabled={capturing} className="w-full bg-tile-blue text-primary-foreground hover:bg-tile-blue/90" onClick={capture}>
              {capturing ? <Loader2 className="animate-spin" /> : <Camera />} {capturing ? "Capturing…" : "Capture a screenshot"}
            </Button>
            {screenshot && <div className="flex items-start gap-3"><img src={screenshot} alt="Attached screenshot" className="max-h-40 min-w-0 rounded-sm border border-border object-contain" /><Button type="button" variant="ghost" size="icon" aria-label="Remove screenshot" onClick={() => setScreenshot(undefined)}><Trash2 /></Button></div>}
          </div>
          <footer className="shrink-0 px-4 pb-[calc(var(--sab,0px)+1rem)] pt-3">
            <Button type="submit" disabled={capturing} className="w-full rounded-full bg-tile-blue text-primary-foreground hover:bg-tile-blue/90">Send Bug Report</Button>
            <Button type="button" variant="ghost" className="mt-1 w-full text-tile-blue" onClick={close}>Cancel</Button>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  </>;
}