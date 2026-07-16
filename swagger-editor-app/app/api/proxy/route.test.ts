import '../../test/setup';
import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { GET } from './route';

test('proxy route returns a 400 without a target', async () => {
  const request = new NextRequest('http://localhost/api/proxy');
  const response = await GET(request);
  assert.equal(response.status, 400);
});

test('proxy route forwards a request to the target', async () => {
  const request = new NextRequest('http://localhost/api/proxy?target=http://example.com');
  const response = await GET(request);
  assert.equal(response.status, 200);
});
