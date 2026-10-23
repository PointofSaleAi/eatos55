export type BugReportDraft = { title: string; email: string; description: string };

export function bugReporterVisible(sentry: boolean, signedIn: boolean) {
  return sentry && signedIn;
}

export function validateBugReport(draft: BugReportDraft) {
  return {
    title: draft.title.trim() ? undefined : "Title is required.",
    description: draft.description.trim() ? undefined : "Description is required.",
    email: !draft.email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())
      ? undefined : "Enter a valid email address.",
  };
}