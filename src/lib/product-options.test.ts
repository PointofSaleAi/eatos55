import { test } from "node:test";
import { strict as assert } from "node:assert";
import { itemAddOnGroups, itemModifierGroups, liveMenu } from "./demo-data";
import { tableOrderModifierGroups, tableOrderLines } from "./table-order";

test("every table-order product offers Course even when product assignments omit or disable it", () => {
  for (const item of liveMenu) {
    const groups = tableOrderModifierGroups(item, true, { [item.id]: { Course: "off" } });
    assert.equal(groups.filter((group) => group.name === "Course").length, 1, item.name);
    assert.deepEqual(groups.find((group) => group.name === "Course")?.options.map((option) => option.name), ["Appetizer", "Main", "Dessert", "Hold"]);
    assert.equal(groups.find((group) => group.name === "Course")?.required, false);
  }
});

test("non-table products never offer Course", () => {
  for (const item of liveMenu) {
    assert.equal(tableOrderModifierGroups(item, false).some((group) => group.name === "Course"), false, item.name);
  }
});

test("table summary displays all unassigned course items before course items without changing insertion order or cart", () => {
  const lines = [
    { id: "main", name: "Main item", qty: 1, price: 10, modifiers: ["Course · Main"] },
    { id: "plain", name: "Plain item", qty: 1, price: 6 },
    { id: "appetizer", name: "Starter item", qty: 1, price: 8, modifiers: ["Course · Appetizer"] },
    { id: "plain2", name: "Second plain item", qty: 1, price: 5, modifiers: ["Preparation · Extra Sauce"] },
  ];
  assert.deepEqual(tableOrderLines(lines, true).map((line) => line.id), ["plain", "plain2", "main", "appetizer"]);
  assert.deepEqual(lines.map((line) => line.id), ["main", "plain", "appetizer", "plain2"]);
  assert.equal(tableOrderLines(lines, false), lines);
});

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