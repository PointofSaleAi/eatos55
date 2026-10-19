import { test } from "node:test";
import { strict as assert } from "node:assert";
import { isSettingsDestinationVisible } from "./settings-destinations";

test("Login Screen is visible only for a clocked-in manager", () => {
  const row = { to: "/settings/login-screen" };
  assert.equal(isSettingsDestinationVisible(row, { role: "Manager", clockedIn: true }, true), true);
  assert.equal(isSettingsDestinationVisible(row, { role: "Manager", clockedIn: false }, true), false);
  for (const role of ["Supervisor", "Owner", "Admin", "Server", "Cashier"]) {
    assert.equal(isSettingsDestinationVisible(row, { role, clockedIn: true }, true), false);
    assert.equal(isSettingsDestinationVisible(row, { role, clockedIn: false }, false), false);
  }
});