import '../test/setup';
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSpec, stringifySpec, getDefaultSpec } from './swagger-editor';

test('parseSpec returns error when top-level is not an object', () => {
  const result = parseSpec('"just a string"');
  assert.ok(result.error);
  assert.match(result.error ?? '', /top-level object/i);
});

test('parseSpec returns error when paths is present but not an object', () => {
  const result = parseSpec(`openapi: 3.0.3
paths: 42`);
  assert.ok(result.error);
  assert.match(result.error ?? '', /paths/i);
});

test('parseSpec returns error when openapi/swagger missing', () => {
  const result = parseSpec(`paths:\n  /x:\n    get:\n      responses: {}`);
  assert.ok(result.error);
  assert.match(result.error ?? '', /OpenAPI|Swagger/i);
});

test('stringifySpec returns defaults when value is undefined', () => {
  const json = stringifySpec(undefined, 'json');
  assert.ok(json.includes('openapi'));

  const yaml = stringifySpec(undefined, 'yaml');
  assert.ok(yaml.includes('openapi'));
});

test('getDefaultSpec returns both json and yaml forms', () => {
  const j = getDefaultSpec('json');
  const y = getDefaultSpec('yaml');
  assert.ok(j.trim().startsWith('{'));
  assert.ok(y.includes('openapi: 3.0.3'));
});
