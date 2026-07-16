'use client';

import { useState } from 'react';
import { EndpointDetail, getMediaTypeExample } from '../lib/endpoint-utils';
import { TryItOut } from './try-it-out';

interface EndpointDetailsProps {
  endpoint: EndpointDetail;
  baseUrl: string;
  spec?: Record<string, unknown>;
}

export function EndpointDetails({
  endpoint,
  baseUrl,
  spec,
}: EndpointDetailsProps) {
  const [showTryItOut, setShowTryItOut] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);

  const methodColors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    POST: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    PATCH: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    HEAD: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    OPTIONS: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  const statusCodeColors: Record<string, string> = {
    '2': 'text-green-600 dark:text-green-400',
    '3': 'text-blue-600 dark:text-blue-400',
    '4': 'text-yellow-600 dark:text-yellow-400',
    '5': 'text-red-600 dark:text-red-400',
  };

  const getStatusColor = (code: string) => {
    const firstDigit = code.charAt(0);
    return statusCodeColors[firstDigit] || 'text-zinc-600 dark:text-zinc-400';
  };

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-lg font-semibold text-sm ${
                methodColors[endpoint.method] || methodColors.GET
              }`}
            >
              {endpoint.method}
            </span>
            <code className="text-sm font-mono text-zinc-600 dark:text-zinc-300">
              {endpoint.path}
            </code>
          </div>
          {endpoint.deprecated && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              Deprecated
            </span>
          )}
        </div>

        {endpoint.summary && (
          <p className="text-sm font-medium text-zinc-900 dark:text-white mb-2">
            {endpoint.summary}
          </p>
        )}

        {endpoint.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {endpoint.description}
          </p>
        )}

        {endpoint.tags && endpoint.tags.length > 0 && (
          <div className="flex gap-2 mt-3">
            {endpoint.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        {/* Parameters */}
        {endpoint.parameters && endpoint.parameters.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Parameters
            </h3>
            <div className="space-y-4">
              {endpoint.parameters.map((param) => (
                <div
                  key={param.name}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-sm font-mono font-semibold text-zinc-900 dark:text-white">
                      {param.name}
                    </code>
                    <span className="text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                      {param.in}
                    </span>
                    {param.required && (
                      <span className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                        Required
                      </span>
                    )}
                  </div>
                  {param.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                      {param.description}
                    </p>
                  )}
                  {param.schema?.type && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">
                      Type: {param.schema.type}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Request Body */}
        {endpoint.requestBody && (
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Request Body
            </h3>
            {endpoint.requestBody.description && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                {endpoint.requestBody.description}
              </p>
            )}
            {endpoint.requestBody.required && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                * Required
              </p>
            )}
            {endpoint.requestBody.content && (
              <div className="space-y-4">
                {Object.entries(endpoint.requestBody.content).map(
                  ([mediaType, content]) => (
                    <div key={mediaType}>
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        {mediaType}
                      </p>
                      <pre className="rounded-lg bg-zinc-100 dark:bg-zinc-900 p-3 text-xs overflow-auto dark:text-zinc-200 font-mono">
                        {getMediaTypeExample(endpoint.requestBody?.content, mediaType)}
                      </pre>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* Responses */}
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            Responses
          </h3>
          <div className="space-y-4">
            {Object.entries(endpoint.responses).map(([statusCode, responseInfo]) => (
              <div
                key={statusCode}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setSelectedResponse(
                      selectedResponse === statusCode ? null : statusCode
                    )
                  }
                  className="w-full text-left px-4 py-3 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${getStatusColor(statusCode)}`}>
                      {statusCode}
                    </span>
                    {responseInfo.description && (
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {responseInfo.description}
                      </span>
                    )}
                  </div>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {selectedResponse === statusCode ? '−' : '+'}
                  </span>
                </button>

                {selectedResponse === statusCode && responseInfo.content && (
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900 space-y-4 border-t border-zinc-200 dark:border-zinc-800">
                    {Object.entries(responseInfo.content).map(([mediaType, content]) => (
                      <div key={mediaType}>
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          {mediaType}
                        </p>
                        <pre className="rounded-lg bg-white dark:bg-zinc-950 p-3 text-xs overflow-auto dark:text-zinc-200 font-mono border border-zinc-200 dark:border-zinc-800">
                          {getMediaTypeExample(responseInfo.content, mediaType)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Try It Out Button */}
        <button
          onClick={() => setShowTryItOut(!showTryItOut)}
          className="mt-6 px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          {showTryItOut ? 'Hide Try It Out' : 'Try It Out'}
        </button>

        {showTryItOut && (
          <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <TryItOut endpoint={endpoint} baseUrl={baseUrl} />
          </div>
        )}
      </div>
    </div>
  );
}
