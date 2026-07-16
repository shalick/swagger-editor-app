import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

export type SpecFormat = "json" | "yaml";

export type EndpointSummary = {
  method: string;
  path: string;
};

export type ParseResult = {
  value?: Record<string, unknown>;
  endpoints: EndpointSummary[];
  error?: string;
};

const SAMPLE_SPEC = `openapi: 3.0.3
info:
  title: Demo API
  version: 1.0.0
paths:
  /pets:
    get:
      summary: List pets
      responses:
        '200':
          description: Success`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function detectFormat(text: string): SpecFormat {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) return 'yaml';
  // Try JSON first — if it parses, treat as JSON; otherwise fallback to YAML
  try {
    JSON.parse(trimmed);
    return 'json';
  } catch {}

  return 'yaml';
}

export function parseSpec(text: string): ParseResult {
  try {
    const detectedFormat = detectFormat(text);
    const value = detectedFormat === "json" ? JSON.parse(text) : parseYaml(text);

    if (!isRecord(value)) {
      return { endpoints: [], error: "The document must be a top-level object." };
    }

    if (value.paths !== undefined && !isRecord(value.paths)) {
      return { endpoints: [], error: "The document must include a paths object." };
    }

    if (!isRecord(value.paths)) {
      return { endpoints: [], error: "The document must include a paths object." };
    }

    if (typeof value.openapi !== "string" && typeof value.swagger !== "string") {
      return { endpoints: [], error: "The document must define an OpenAPI or Swagger version." };
    }

    const endpoints = Object.entries(value.paths).flatMap(([path, methods]) => {
      if (!isRecord(methods)) {
        return [];
      }

      return Object.entries(methods).flatMap(([method, operation]) => {
        if (!isRecord(operation)) {
          return [];
        }

        return [{ method: method.toUpperCase(), path }];
      });
    });

    return { value, endpoints };
  } catch (error) {
    return { endpoints: [], error: error instanceof Error ? error.message : "Unable to parse the schema." };
  }
}

export function stringifySpec(value: Record<string, unknown> | undefined, format: SpecFormat) {
  if (!value) {
    return format === "json" ? JSON.stringify({ openapi: "3.0.3", info: { title: "Demo API", version: "1.0.0" }, paths: {} }, null, 2) : SAMPLE_SPEC;
  }

  if (format === "json") {
    return JSON.stringify(value, null, 2);
  }

  return stringifyYaml(value, { lineWidth: -1 });
}

export function getDefaultSpec(format: SpecFormat) {
  return format === "json"
    ? JSON.stringify(
        {
          openapi: "3.0.3",
          info: { title: "Demo API", version: "1.0.0" },
          paths: {},
        },
        null,
        2,
      )
    : SAMPLE_SPEC;
}

