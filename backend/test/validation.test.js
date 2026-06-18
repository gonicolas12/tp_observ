// Tests unitaires de la validation (runner intégré "node:test", Node >= 18).
// Lancés par l'étape "test" du pipeline CI via `npm test`.

const { test } = require("node:test");
const assert = require("node:assert");
const { validateTitle } = require("../src/validation");

test("refuse un titre vide", () => {
  const r = validateTitle("   ");
  assert.strictEqual(r.ok, false);
});

test("refuse un titre non-string", () => {
  const r = validateTitle(42);
  assert.strictEqual(r.ok, false);
});

test("accepte un titre valide et le normalise (trim)", () => {
  const r = validateTitle("  Ma tâche  ");
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.value, "Ma tâche");
});

test("refuse un titre trop long (> 120)", () => {
  const r = validateTitle("a".repeat(121));
  assert.strictEqual(r.ok, false);
});
