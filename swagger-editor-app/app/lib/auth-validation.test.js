const test = require("node:test");
const assert = require("node:assert/strict");
const { getValidationErrors } = require("./auth-validation");

test("returns no errors for a valid email and strong password", () => {
  const errors = getValidationErrors({
    email: "user@example.com",
    password: "Str0ng!Pass",
    confirmPassword: "Str0ng!Pass",
  });

  assert.deepEqual(errors, {});
});

test("reports invalid email and weak password errors", () => {
  const errors = getValidationErrors({
    email: "not-an-email",
    password: "weak",
    confirmPassword: "different",
  });

  assert.match(errors.email, /valid email/i);
  assert.match(errors.password, /at least 8 characters/i);
  assert.match(errors.confirmPassword, /match/i);
});
