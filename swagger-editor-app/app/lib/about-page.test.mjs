import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('about page includes RS School, team, and resource information', () => {
  const aboutPagePath = path.join(__dirname, '../about/page.tsx');
  const aboutPageSource = fs.readFileSync(aboutPagePath, 'utf8');

  assert.match(aboutPageSource, /RS School/i);
  assert.match(aboutPageSource, /Alexander Shabanovich/i);
  assert.match(aboutPageSource, /github.com\/shalick/i);
  assert.match(aboutPageSource, /resources?/i);
});
