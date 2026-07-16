'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from './auth-provider';
import { ParameterForm } from './parameter-form';
import { EndpointDetail } from '../lib/endpoint-utils';
import { generateCurl, copyToClipboard } from '../lib/curl-generator';

interface TryItOutProps {
  endpoint: EndpointDetail;
  baseUrl: string;
  onResponseChange?: (response: string) => void;
}

export function TryItOut({ endpoint, baseUrl, onResponseChange }: TryItOutProps) {
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [headers, setHeaders] = useState<Record<string, string>>({
    'Content-Type': 'application/json',
  });
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<{
    status: number;
    headers: Record<string, string>;
    body: string;
  } | null>(null);
  const [copyStatus, setCopyStatus] = useState('');

  // Build URL with path parameters
  let url = baseUrl + endpoint.path;
  Object.entries(parameters)
    .filter(([_, param]) => endpoint.parameters?.some((p) => p.name === _ && p.in === 'path'))
    .forEach(([name, value]) => {
      url = url.replace(`{${name}}`, value);
    });

  // Add query parameters
  const queryParams = Object.entries(parameters)
    .filter(([name]) => endpoint.parameters?.some((p) => p.name === name && p.in === 'query'))
    .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
    .join('&');
  if (queryParams) {
    url += `?${queryParams}`;
  }

  async function handleExecute(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setResponse(null);

    try {
      const requestHeaders: Record<string, string> = { ...headers };
      
      // Add headers from parameters
      endpoint.parameters
        ?.filter((p) => p.in === 'header')
        .forEach((p) => {
          if (parameters[p.name]) {
            requestHeaders[p.name] = parameters[p.name];
          }
        });

      const requestInit: RequestInit = {
        method: endpoint.method,
        headers: requestHeaders,
      };

      if (body && (endpoint.method === 'POST' || endpoint.method === 'PUT' || endpoint.method === 'PATCH')) {
        requestInit.body = body;
      }

      // Send through proxy to avoid CORS
      const encodedUrl = encodeURIComponent(url);
      const proxyUrl = `/api/proxy?target=${encodedUrl}`;
      const startedAt = performance.now();
      const result = await fetch(proxyUrl, requestInit);
      
      const responseBody = await result.text();
      const responseHeaders: Record<string, string> = {};
      
      result.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const responseData = {
        status: result.status,
        headers: responseHeaders,
        body: responseBody,
      };

      const durationMs = Math.round(performance.now() - startedAt);
      const requestSize = JSON.stringify({ headers: requestHeaders, body: requestInit.body }).length;
      const responseSize = JSON.stringify(responseData).length;

      setResponse(responseData);
      onResponseChange?.(JSON.stringify(responseData, null, 2));

      // Track request for authenticated users
      if (authState.isAuthenticated && authState.token) {
        try {
          await fetch('/api/request-history', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authState.token}`,
            },
            body: JSON.stringify({
              method: endpoint.method,
              path: endpoint.path,
              url,
              parameters,
              request: {
                headers: requestHeaders,
                body: requestInit.body,
              },
              response: responseData,
              timestamp: new Date().toISOString(),
              durationMs,
              requestSize,
              responseSize,
              error: null,
            }),
          });
        } catch {
          // Silently fail request tracking
        }
      }
    } catch (error) {
      const failureBody = `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      const failureResponse = {
        status: 0,
        headers: {},
        body: failureBody,
      };

      setResponse(failureResponse);
      onResponseChange?.(failureBody);

      if (authState.isAuthenticated && authState.token) {
        try {
          await fetch('/api/request-history', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authState.token}`,
            },
            body: JSON.stringify({
              method: endpoint.method,
              path: endpoint.path,
              url,
              parameters,
              request: {
                headers: { ...headers },
                body: body || null,
              },
              response: failureResponse,
              timestamp: new Date().toISOString(),
              durationMs: 0,
              requestSize: JSON.stringify({ headers: { ...headers }, body: body || null }).length,
              responseSize: JSON.stringify(failureResponse).length,
              error: failureBody,
            }),
          });
        } catch {
          // Silently fail request tracking
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerateCurl() {
    const curlCommand = generateCurl({
      url,
      method: endpoint.method,
      headers,
      body: body || undefined,
    });

    const success = await copyToClipboard(curlCommand);
    setCopyStatus(success ? 'Copied to clipboard!' : 'Copy failed');
    setTimeout(() => setCopyStatus(''), 2000);
  }

  const supportsBody =
    endpoint.method === 'POST' ||
    endpoint.method === 'PUT' ||
    endpoint.method === 'PATCH';

  return (
    <div className="space-y-6">
      <form onSubmit={handleExecute} className="space-y-6">
        {endpoint.parameters && endpoint.parameters.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Parameters
            </h3>
            <ParameterForm
              parameters={endpoint.parameters}
              onParametersChange={(newParams) =>
                setParameters({ ...parameters, ...newParams })
              }
              baseUrl={baseUrl}
            />
          </div>
        )}

        {endpoint.parameters?.some((p) => p.in === 'header') && (
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Additional Headers
            </h3>
            <div className="space-y-3">
              {Object.entries(headers).map(([key, value]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {key}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      setHeaders({ ...headers, [key]: e.target.value })
                    }
                    className="w-full mt-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {supportsBody && endpoint.requestBody && (
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Request Body
            </h3>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter JSON request body"
              rows={8}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-mono outline-none focus:border-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Executing...' : 'Execute'}
          </button>
          <button
            type="button"
            onClick={handleGenerateCurl}
            className="px-6 py-2 rounded-lg border border-zinc-300 text-zinc-900 font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900"
          >
            Generate cURL
          </button>
          {copyStatus && (
            <span className="text-sm text-green-600 dark:text-green-400">
              {copyStatus}
            </span>
          )}
        </div>
      </form>

      {response && (
        <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            Response
          </h3>
          <div className="space-y-4">
            <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 p-3">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                Status: {response.status}
              </p>
            </div>

            {Object.keys(response.headers).length > 0 && (
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white mb-2">
                  Response Headers:
                </p>
                <pre className="rounded-lg bg-zinc-100 dark:bg-zinc-900 p-3 text-xs overflow-auto dark:text-zinc-200">
                  {JSON.stringify(response.headers, null, 2)}
                </pre>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white mb-2">
                Response Body:
              </p>
              <pre className="rounded-lg bg-zinc-100 dark:bg-zinc-900 p-3 text-xs overflow-auto dark:text-zinc-200">
                {response.body}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
