import test from 'node:test';
import assert from 'node:assert/strict';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import '../test/setup';
import { JSDOM } from 'jsdom';
import { I18nProvider, useI18n } from './i18n-provider';

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

async function renderWithProvider() {
  const container = dom.window.document.getElementById('root');
  const root = createRoot(container!);
  const TestComponent = () => {
    const { language, setLanguage, t } = useI18n();
    return (
      <div>
        <span data-language={language}>{t('common.editor', 'Editor')}</span>
        <button onClick={() => setLanguage('ru')}>switch</button>
      </div>
    );
  };

  await act(async () => {
    root.render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>,
    );
    await new Promise((r) => setTimeout(r, 0));
  });

  return { dom, root, container };
}

test('I18nProvider resolves translations and updates language', async () => {
  const { dom, root, container } = await renderWithProvider();
  const span = container?.querySelector('span');
  assert.equal(span?.textContent, 'Editor');

  await act(async () => {
    const button = container?.querySelector('button');
    button?.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
  });
  assert.equal(container?.querySelector('span')?.getAttribute('data-language'), 'ru');

  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

  await act(async () => {
    root.unmount();
    await new Promise((r) => setTimeout(r, 0));
  });
});

test('I18nProvider renders children without window during initial render', () => {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const previousNavigator = globalThis.navigator;

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: undefined,
  });
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: undefined,
  });
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: undefined,
  });

  try {
    const html = renderToStaticMarkup(
      <I18nProvider>
        <span>ready</span>
      </I18nProvider>,
    );

    assert.match(html, /ready/);
  } finally {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: previousWindow,
    });
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: previousDocument,
    });
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: previousNavigator,
    });
  }
});
