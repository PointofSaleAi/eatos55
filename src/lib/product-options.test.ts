import { test } from "node:test";
import { strict as assert } from "node:assert";
import { itemAddOnGroups, itemModifierGroups, liveMenu } from "./demo-data";

test("chicken sandwich retains all reference modifier groups", () => {
  const item = liveMenu.find((entry) => entry.name === "CHICKEN SANDWICH (POULET)");
  assert.ok(item);
  const groups = itemModifierGroups(item);
  assert.deepEqual(groups.filter((group) => group.name !== "Course").map((group) => group.name), [
    "Bread", "Temperature", "Preparation", "Allergy", "Sandwiches Sides",
  ]);
  assert.equal(groups.find((group) => group.name === "Bread")?.options.length, 5);
  assert.equal(groups.find((group) => group.name === "Temperature")?.options.length, 5);
  assert.equal(groups.find((group) => group.name === "Preparation")?.options.length, 6);
  assert.equal(groups.find((group) => group.name === "Allergy")?.options.length, 4);
  assert.equal(groups.find((group) => group.name === "Sandwiches Sides")?.options.length, 4);
});

test("chicken sandwich retains both add-on groups", () => {
  const item = liveMenu.find((entry) => entry.name === "CHICKEN SANDWICH (POULET)");
  assert.ok(item);
  assert.deepEqual(itemAddOnGroups(item).map((group) => group.name), ["Add-Ons", "Beverage"]);
});