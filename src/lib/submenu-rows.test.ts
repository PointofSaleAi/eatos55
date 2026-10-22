import { test } from "node:test";
import { strict as assert } from "node:assert";
import { submenuRows } from "./submenu-rows";

test("wrapped submenus never exceed three rows and retain all overflow in the last row", () => {
  assert.deepEqual(submenuRows([100, 100, 100, 100, 100, 100, 100, 100], 206, 6), [[0, 1], [2, 3], [4, 5, 6, 7]]);
  assert.deepEqual(submenuRows([100, 100], 206, 6), [[0, 1]]);
  assert.deepEqual(submenuRows([400, 100, 100, 100], 200, 6), [[0], [1], [2, 3]]);
});