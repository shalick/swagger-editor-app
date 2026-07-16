import test from 'node:test';
import assert from 'node:assert/strict';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import '../test/setup';
import { ToastProvider, useToast } from './toast-provider';

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

async function renderWithToast() {
  const container = dom.window.document.getElementById('root');
  const root = createRoot(container!);

  const TestComponent = () => {
    const { addToast, toasts, removeToast } = useToast();
    return (
      <div>
        <button onClick={() => addToast('hello', 'success', 0)}>add</button>
        <button onClick={() => removeToast(toasts[0]?.id ?? '')}>remove</button>
        <span>{toasts.length}</span>
      </div>
    );
  };

  await act(async () => {
    root.render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );
    await new Promise((r) => setTimeout(r, 0));
  });

  return { dom, root, container };
}

test('ToastProvider adds and removes toasts', async () => {
  const { dom, root, container } = await renderWithToast();
  await act(async () => {
    const addButton = container?.querySelector('button');
    addButton?.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
  });
  assert.equal(container?.querySelector('span')?.textContent, '1');

  await act(async () => {
    const removeButton = container?.querySelectorAll('button')[1];
    removeButton?.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
  });
  assert.equal(container?.querySelector('span')?.textContent, '0');

  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

  await act(async () => {
    root.unmount();
    await new Promise((r) => setTimeout(r, 0));
  });
});
