import test from 'node:test';
import assert from 'node:assert/strict';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import '../test/setup';
import { AuthProvider, useAuth } from './auth-provider';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost',
});

(globalThis as typeof globalThis & { window: Window }).window = dom.window as unknown as Window;
(globalThis as typeof globalThis & { document: Document }).document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
});
Object.defineProperty(globalThis, 'localStorage', {
  value: dom.window.localStorage,
  configurable: true,
});

test('AuthProvider signIn and signOut update state and storage', async () => {
  const container = dom.window.document.getElementById('root');
  const root = createRoot(container!);

  const TestComponent = () => {
    const { authState, signIn, signOut } = useAuth();
    return (
      <div>
        <span id="status">{authState.isAuthenticated ? 'auth' : 'guest'}</span>
        <button id="in" onClick={() => signIn('tok')}>in</button>
        <button id="out" onClick={() => signOut()}>out</button>
      </div>
    );
  };

  await act(async () => {
    root.render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    await new Promise((r) => setTimeout(r, 0));
  });

  const status = container!.querySelector('#status')!;
  assert.equal(status.textContent, 'guest');

  await act(async () => {
    const btn = container!.querySelector('#in')!;
    btn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
  });

  assert.equal(container!.querySelector('#status')!.textContent, 'auth');
  assert.ok(dom.window.localStorage.getItem('swagger-studio-auth'));

  await act(async () => {
    const btn = container!.querySelector('#out')!;
    btn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
  });

  assert.equal(container!.querySelector('#status')!.textContent, 'guest');
  assert.equal(dom.window.localStorage.getItem('swagger-studio-auth'), null);

  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

  await act(async () => {
    root.unmount();
    await new Promise((r) => setTimeout(r, 0));
  });
});
