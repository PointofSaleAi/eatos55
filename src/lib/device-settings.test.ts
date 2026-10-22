import { test } from "node:test";
import { strict as assert } from "node:assert";
import { defaultDevicePreferences, productPricesVisible } from "./device-settings";

test("disabling Show Product Prices hides menu prices and enabling it restores them", () => {
  assert.equal(productPricesVisible(defaultDevicePreferences), false);
  assert.equal(productPricesVisible({ ...defaultDevicePreferences, toggles: { ...defaultDevicePreferences.toggles, showProductPrices: false } }), false);
  assert.equal(productPricesVisible({ ...defaultDevicePreferences, toggles: { ...defaultDevicePreferences.toggles, showProductPrices: true } }), true);
});