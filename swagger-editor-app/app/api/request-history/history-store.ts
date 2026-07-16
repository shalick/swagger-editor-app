import { NextRequest } from "next/server";

export const AUTH_COOKIE_NAME = "swagger-auth-token";

export interface StoredRequestInfo {
  headers: Record<string, string>;
  body?: string | null;
}

export interface StoredResponseInfo {
  status: number;
  headers: Record<string, string>;
  body: string | null;
}

export interface RequestHistoryEntry {
  id: string;
  method: string;
  path: string;
  url: string;
  parameters: Record<string, string>;
  request: StoredRequestInfo;
  response: StoredResponseInfo;
  timestamp: string;
  durationMs: number;
  requestSize: number;
  responseSize: number;
  error: string | null;
}

export interface IncomingRequestHistoryEntry {
  id?: string;
  method: string;
  path: string;
  url: string;
  parameters: Record<string, string>;
  request: StoredRequestInfo;
  response: StoredResponseInfo;
  timestamp: string;
  durationMs?: number;
  requestSize?: number;
  responseSize?: number;
  error?: string | null;
}

const requestHistory = new Map<string, RequestHistoryEntry[]>();

export const getTokenFromRequest = (request: NextRequest) => {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
};

const measureSize = (entry: StoredRequestInfo | StoredResponseInfo | undefined | null) => {
  if (!entry) {
    return 0;
  }
  return Buffer.byteLength(JSON.stringify(entry), "utf8");
};

const ensureRequestHistoryEntry = (payload: IncomingRequestHistoryEntry): RequestHistoryEntry => {
  const requestSize =
    typeof payload.requestSize === "number"
      ? payload.requestSize
      : measureSize(payload.request);

  const responseSize =
    typeof payload.responseSize === "number"
      ? payload.responseSize
      : measureSize(payload.response);

  return {
    id: payload.id ?? crypto.randomUUID(),
    method: payload.method,
    path: payload.path,
    url: payload.url,
    parameters: payload.parameters ?? {},
    request: {
      headers: payload.request?.headers ?? {},
      body: payload.request?.body ?? null,
    },
    response: {
      status: payload.response?.status ?? 0,
      headers: payload.response?.headers ?? {},
      body: payload.response?.body ?? null,
    },
    timestamp: payload.timestamp,
    durationMs: payload.durationMs ?? 0,
    requestSize,
    responseSize,
    error: payload.error ?? null,
  };
};

export const saveRequestHistoryEntry = (
  token: string,
  payload: IncomingRequestHistoryEntry,
) => {
  const entry = ensureRequestHistoryEntry(payload);

  if (!requestHistory.has(token)) {
    requestHistory.set(token, []);
  }

  const history = requestHistory.get(token)!;
  history.push(entry);

  if (history.length > 100) {
    history.shift();
  }

  return entry;
};

export const getRequestHistoryEntries = (token: string) => {
  const history = requestHistory.get(token) || [];
  return [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getRequestHistoryEntryById = (token: string, id: string) => {
  const history = requestHistory.get(token) || [];
  return history.find((entry) => entry.id === id) ?? null;
};

export const clearRequestHistory = (token: string) => {
  requestHistory.delete(token);
};
