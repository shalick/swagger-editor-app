import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AuthProvider, useAuth } from './auth-provider';

test('AuthProvider keeps the initial render unauthenticated until hydration completes', () => {
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
    const TestComponent = () => {
      const { authState } = useAuth();
      return <div>{authState.isAuthenticated ? 'auth' : 'guest'}</div>;
    };

    const html = renderToStaticMarkup(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    assert.match(html, /guest/);
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
