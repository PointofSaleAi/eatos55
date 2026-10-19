import { test } from "node:test";
import { strict as assert } from "node:assert";
import { isSettingsDestinationVisible, settingsDestinations } from "./settings-destinations";

test("Login Screen is visible only for a clocked-in manager", () => {
  const row = { to: "/settings/login-screen" };
  assert.equal(isSettingsDestinationVisible(row, { role: "Manager", clockedIn: true }, true), true);
  assert.equal(isSettingsDestinationVisible(row, { role: "Manager", clockedIn: false }, true), false);
  for (const role of ["Supervisor", "Owner", "Admin", "Server", "Cashier"]) {
    assert.equal(isSettingsDestinationVisible(row, { role, clockedIn: true }, true), false);
    assert.equal(isSettingsDestinationVisible(row, { role, clockedIn: false }, false), false);
  }
});

test("settings navigation shows every option in alphabetical order", () => {
  assert.deepEqual(settingsDestinations.map((row) => row.label), [
    "Advanced",
    "Control Center",
    "Customer Support",
    "General",
    "Guestbook",
    "Hardware",
    "Login Screen",
    "Menu",
    "Network",
    "Notifications",
    "Payments",
    "Sales",
    "Workforce",
  ]);
});
