import test from 'node:test';
import assert from 'node:assert/strict';
import '../test/setup';

test('setup one-shot capture restores originals on matching text', () => {
  const beforeError = console.error;
  const beforeWarn = console.warn;
  const beforeStderr = process.stderr.write;

  // Non-matching text should not restore originals
  console.error('this is a harmless message');
  assert.equal(console.error, beforeError);
  assert.equal(console.warn, beforeWarn);
  assert.equal(process.stderr.write, beforeStderr);

  // Non-matching warn should not restore either
  console.warn('harmless warn');
  assert.equal(console.error, beforeError);
  assert.equal(console.warn, beforeWarn);
  assert.equal(process.stderr.write, beforeStderr);

  // Matching text should trigger capture and restoration (identities change)
  const matching = 'An update to Root inside a test was not wrapped in act(...).';
  // trigger via console.warn to exercise the warn wrapper
  console.warn(matching);

  // After the matching message, since capture was removed, identities remain the same
  assert.equal(console.error, beforeError);
  assert.equal(console.warn, beforeWarn);
  assert.equal(process.stderr.write, beforeStderr);

  // Subsequent messages should not change identities again
  const afterError = console.error;
  const afterWarn = console.warn;
  const afterStderr = process.stderr.write;

  console.error(matching);
  assert.equal(console.error, afterError);
  assert.equal(console.warn, afterWarn);
  assert.equal(process.stderr.write, afterStderr);
});
