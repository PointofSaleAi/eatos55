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

test("reference bread choices retain their surcharges and remaining stock", () => {
  const item = liveMenu.find((entry) => entry.name === "CHICKEN SANDWICH (POULET)");
  assert.ok(item);
  const bread = itemModifierGroups(item).find((group) => group.name === "Bread");
  assert.ok(bread);
  assert.deepEqual(Object.fromEntries(bread.options.map((option) => [option.name, [option.price, option.stock]])), {
    Baguette: [0, 24], Foccacia: [0, 12], "Gluten Free Bun": [2, 5], "Lettuce Wrap": [0, 18], Sourdough: [1, 8],
  });
});

test("reference sandwich sides retain their surcharges and remaining stock", () => {
  const item = liveMenu.find((entry) => entry.name === "CHICKEN SANDWICH (POULET)");
  assert.ok(item);
  const sides = itemModifierGroups(item).find((group) => group.name === "Sandwiches Sides");
  assert.ok(sides);
  assert.deepEqual(Object.fromEntries(sides.options.map((option) => [option.name, [option.price, option.stock]])), {
    Fries: [5, 30], "Fruit Cup": [5, 7], "Side Salad": [4, 16], Soup: [6, 10],
  });
});