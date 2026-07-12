'use client';

import { useMemo, useState } from 'react';
import { EndpointDetails } from './endpoint-details';
import { extractEndpointDetails, EndpointDetail } from '../lib/endpoint-utils';

interface SwaggerViewerProps {
  spec?: Record<string, unknown>;
  specText?: string;
}

export function SwaggerViewer({ spec, specText }: SwaggerViewerProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const endpoints: EndpointDetail[] = useMemo(() => {
    if (!spec) return [];

    const result: EndpointDetail[] = [];
    const paths = spec.paths as Record<string, Record<string, unknown>> | undefined;

    if (!paths || typeof paths !== 'object') {
      return [];
    }

    Object.entries(paths).forEach(([path, methods]) => {
      if (!methods || typeof methods !== 'object') return;

      Object.entries(methods).forEach(([method, operation]) => {
        if (
          method.startsWith('x-') ||
          !operation ||
          typeof operation !== 'object'
        ) {
          return;
        }

        const detail = extractEndpointDetails(path, method, operation, spec);
        result.push(detail);
      });
    });

    return result;
  }, [spec]);

  const tags = useMemo(() => {
    const tagSet = new Set<string>();
    endpoints.forEach((ep) => {
      ep.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [endpoints]);

  const filteredEndpoints = useMemo(() => {
    return endpoints.filter((ep) => {
      if (filterTag && !ep.tags?.includes(filterTag)) {
        return false;
      }
      return true;
    });
  }, [endpoints, filterTag]);

  const groupedEndpoints = useMemo(() => {
    const groups: Record<string, EndpointDetail[]> = {};

    filteredEndpoints.forEach((ep) => {
      if (!groups[ep.path]) {
        groups[ep.path] = [];
      }
      groups[ep.path].push(ep);
    });

    return groups;
  }, [filteredEndpoints]);

  const baseUrl = useMemo(() => {
    if (!spec || typeof spec.servers !== 'object' || !Array.isArray(spec.servers)) {
      return '';
    }
    const firstServer = spec.servers[0];
    if (firstServer && typeof firstServer === 'object' && 'url' in firstServer) {
      return String(firstServer.url) || '';
    }
    return '';
  }, [spec]);

  const info = spec?.info as { title?: string; version?: string } | undefined;

  if (!spec || endpoints.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-8 text-center">
        <p className="text-zinc-600 dark:text-zinc-400">
          Load a valid OpenAPI/Swagger schema to view endpoints.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 p-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
          {info?.title || 'API Endpoints'}
        </h2>
        {info?.version && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Version {info.version}
          </p>
        )}
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
          Total endpoints: {endpoints.length}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {tags.length > 0 && (
          <div className="flex-1">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Filter by tag:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterTag(null)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                  filterTag === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                All
              </button>
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    filterTag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Endpoints */}
      <div className="space-y-4">
        {Object.entries(groupedEndpoints).map(([path, pathEndpoints]) => (
          <div key={path} className="space-y-3">
            <div className="flex items-center gap-2 py-2 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-900">
              <code className="text-sm font-mono font-semibold text-zinc-900 dark:text-white">
                {path}
              </code>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {pathEndpoints.length} operation{pathEndpoints.length !== 1 ? 's' : ''}
              </span>
            </div>

            {pathEndpoints.map((endpoint) => (
              <div key={`${endpoint.path}-${endpoint.method}`}>
                <button
                  onClick={() => {
                    const key = `${endpoint.path}-${endpoint.method}`;
                    if (selectedPath === endpoint.path && selectedMethod === endpoint.method) {
                      setSelectedPath(null);
                      setSelectedMethod(null);
                    } else {
                      setSelectedPath(endpoint.path);
                      setSelectedMethod(endpoint.method);
                    }
                  }}
                  className="w-full text-left rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-sm font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 min-w-16">
                        {endpoint.method}
                      </span>
                      <div className="flex-1">
                        <p className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                          {endpoint.path}
                        </p>
                        {endpoint.summary && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            {endpoint.summary}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-zinc-400 dark:text-zinc-600 ml-2">
                      {selectedPath === endpoint.path &&
                      selectedMethod === endpoint.method
                        ? '−'
                        : '+'}
                    </span>
                  </div>
                </button>

                {selectedPath === endpoint.path &&
                  selectedMethod === endpoint.method && (
                    <div className="mt-3 ml-4">
                      <EndpointDetails
                        endpoint={endpoint}
                        baseUrl={baseUrl}
                        spec={spec}
                      />
                    </div>
                  )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {filteredEndpoints.length === 0 && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-8 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            No endpoints match the selected filter.
          </p>
        </div>
      )}
    </div>
  );
}
