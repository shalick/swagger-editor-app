export interface PathParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required: boolean;
  schema?: { type?: string; items?: unknown };
  description?: string;
}

export interface RequestBodyInfo {
  description?: string;
  required?: boolean;
  content?: Record<string, { schema?: unknown; examples?: Record<string, unknown> }>;
}

export interface ResponseInfo {
  [statusCode: string]: {
    description?: string;
    content?: Record<string, { schema?: unknown; examples?: Record<string, unknown> }>;
    headers?: Record<string, unknown>;
  };
}

export interface EndpointDetail {
  method: string;
  path: string;
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: PathParameter[];
  requestBody?: RequestBodyInfo;
  responses: ResponseInfo;
  deprecated?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function extractParameters(parameters: unknown[]): PathParameter[] {
  if (!isArray(parameters)) return [];
  
  return parameters
    .filter(isRecord)
    .map((param) => ({
      name: String(param.name || ''),
      in: (param.in as PathParameter['in']) || 'query',
      required: Boolean(param.required),
      schema: isRecord(param.schema) ? param.schema : undefined,
      description: String(param.description || ''),
    }))
    .filter((p) => p.name);
}

function extractRequestBody(requestBody: unknown): RequestBodyInfo | undefined {
  if (!isRecord(requestBody)) return undefined;
  
  const content = isRecord(requestBody.content) 
    ? (requestBody.content as Record<string, { schema?: unknown; examples?: Record<string, unknown> }>)
    : undefined;
  
  return {
    description: String(requestBody.description || ''),
    required: Boolean(requestBody.required),
    content,
  };
}

function extractResponses(responses: unknown): ResponseInfo {
  if (!isRecord(responses)) return {};
  
  const result: ResponseInfo = {};
  Object.entries(responses).forEach(([statusCode, response]) => {
    if (isRecord(response)) {
      const content = isRecord(response.content)
        ? (response.content as Record<string, { schema?: unknown; examples?: Record<string, unknown> }>)
        : undefined;
      result[statusCode] = {
        description: String(response.description || ''),
        content,
        headers: isRecord(response.headers) ? response.headers : undefined,
      };
    }
  });
  
  return result;
}

export function extractEndpointDetails(
  path: string,
  method: string,
  operation: unknown,
  spec?: Record<string, unknown>
): EndpointDetail {
  if (!isRecord(operation)) {
    return {
      method: method.toUpperCase(),
      path,
      responses: {},
    };
  }

  const detail: EndpointDetail = {
    method: method.toUpperCase(),
    path,
    summary: String(operation.summary || ''),
    description: String(operation.description || ''),
    operationId: String(operation.operationId || ''),
    tags: isArray(operation.tags)
      ? operation.tags.filter((t) => typeof t === 'string')
      : undefined,
    deprecated: Boolean(operation.deprecated),
    responses: extractResponses(operation.responses),
  };

  if (isArray(operation.parameters)) {
    detail.parameters = extractParameters(operation.parameters);
  }

  if (operation.requestBody) {
    detail.requestBody = extractRequestBody(operation.requestBody);
  }

  return detail;
}

export function getExampleForSchema(schema: unknown, mediaType: string = 'application/json'): string {
  if (!isRecord(schema)) {
    return '{}';
  }

  // If there's an example field, use it
  if ('example' in schema && typeof schema.example === 'object') {
    return JSON.stringify(schema.example, null, 2);
  }

  // Generate a basic example based on schema type
  if (schema.type === 'object' && isRecord(schema.properties)) {
    const properties: Record<string, unknown> = {};
    Object.keys(schema.properties).forEach((key) => {
      properties[key] = `<${key}>`;
    });
    return JSON.stringify(properties, null, 2);
  }

  if (schema.type === 'array') {
    return JSON.stringify([], null, 2);
  }

  return '{}';
}

export function getMediaTypeExample(
  content: Record<string, unknown> | undefined,
  mediaType: string = 'application/json'
): string {
  if (!content || !isRecord(content[mediaType])) {
    return '{}';
  }

  const mediaContent = content[mediaType];

  // Check for examples
  if (isRecord(mediaContent.examples)) {
    const firstExample = Object.values(mediaContent.examples)[0];
    if (isRecord(firstExample) && 'value' in firstExample) {
      return JSON.stringify(firstExample.value, null, 2);
    }
  }

  // Check for example field
  if ('example' in mediaContent) {
    return JSON.stringify(mediaContent.example, null, 2);
  }

  // Generate from schema
  return getExampleForSchema(mediaContent.schema, mediaType);
}
