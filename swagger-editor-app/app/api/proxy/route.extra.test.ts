import '../../test/setup';
import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST, GET, HEAD } from './route';

// Helper to restore fetch
const previousFetch = globalThis.fetch;

test('POST forwards body to target', async () => {
  globalThis.fetch = async (target: any, init: any) => {
    return {
      text: async () => (init && init.body) || '',
      status: 201,
      headers: new Headers({ 'content-type': 'text/plain' }),
    } as any;
  };

  const request = new NextRequest('http://localhost/api/proxy?target=http://example.com', { method: 'POST', body: 'hello' } as any);
  const response = await POST(request as any);
  const body = await response.text();
  assert.equal(response.status, 201);
  assert.equal(body, 'hello');
});

test('HEAD does not include body forwarding', async () => {
  globalThis.fetch = async (target: any, init: any) => {
    return {
      text: async () => '',
      status: 200,
      headers: new Headers(),
    } as any;
  };

  const request = new NextRequest('http://localhost/api/proxy?target=http://example.com', { method: 'HEAD' } as any);
  const response = await HEAD(request as any);
  assert.equal(response.status, 200);
});

test('returns 502 when fetch throws', async () => {
  globalThis.fetch = async () => {
    throw new Error('network');
  };

  const request = new NextRequest('http://localhost/api/proxy?target=http://bad', { method: 'GET' } as any);
  const response = await GET(request as any);
  assert.equal(response.status, 502);
});

// restore
globalThis.fetch = previousFetch;
