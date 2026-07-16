import '../test/setup';
import test from "node:test";
import assert from "node:assert/strict";
import { detectFormat, parseSpec, stringifySpec } from "./swagger-editor.ts";

test("detects JSON and YAML formats", () => {
  assert.equal(detectFormat('{"openapi":"3.0.3"}'), "json");
  assert.equal(detectFormat("openapi: 3.0.3\ninfo:\n  title: Demo"), "yaml");
});

test("parses valid OpenAPI and extracts endpoints", () => {
  const result = parseSpec(`openapi: 3.0.3
info:
  title: Demo API
  version: 1.0.0
paths:
  /pets:
    get:
      summary: List pets
      responses:
        '200':
          description: ok`);

  assert.equal(result.error, undefined);
  assert.deepEqual(result.endpoints, [{ method: "GET", path: "/pets" }]);
});

test("returns validation errors for invalid schemas", () => {
  const result = parseSpec('{"paths": 42}');

  assert.ok(result.error);
  assert.match(result.error ?? "", /paths/i);
});

test("switches between JSON and YAML without losing data", () => {
  const source = `openapi: 3.0.3
info:
  title: Demo API
  version: 1.0.0
paths:
  /pets:
    get:
      summary: List pets
      responses:
        '200':
          description: ok`;

  const parsed = parseSpec(source);
  assert.equal(parsed.error, undefined);

  const json = stringifySpec(parsed.value, "json");
  const roundTrip = parseSpec(json);
  assert.equal(roundTrip.error, undefined);
  assert.equal(roundTrip.endpoints?.[0]?.path, "/pets");
});
