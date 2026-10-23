import { test } from "node:test";
import { strict as assert } from "node:assert";
import { bugReporterVisible, validateBugReport } from "./bug-report";

test("Sentry on shows the bug reporter for signed-in users", () => {
  assert.equal(bugReporterVisible(true, true), true);
});
test("Sentry off hides the bug reporter", () => {
  assert.equal(bugReporterVisible(false, true), false);
});
test("bug reports require title and description but not email", () => {
  const errors = validateBugReport({ title: " ", description: "", email: "" });
  assert.ok(errors.title);
  assert.ok(errors.description);
  assert.equal(errors.email, undefined);
  assert.deepEqual(validateBugReport({ title: "Order stuck", description: "Cannot open check", email: "" }),
    { title: undefined, description: undefined, email: undefined });
});