'use client';

import { PathParameter } from '../lib/endpoint-utils';

interface ParameterFormProps {
  parameters?: PathParameter[];
  onParametersChange: (params: Record<string, string>) => void;
  baseUrl?: string;
}

export function ParameterForm({
  parameters = [],
  onParametersChange,
  baseUrl = '',
}: ParameterFormProps) {
  const pathParams = parameters.filter((p) => p.in === 'path');
  const queryParams = parameters.filter((p) => p.in === 'query');
  const headerParams = parameters.filter((p) => p.in === 'header');
  const cookieParams = parameters.filter((p) => p.in === 'cookie');

  if (!parameters || parameters.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {pathParams.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
            Path Parameters
          </h4>
          <div className="space-y-3">
            {pathParams.map((param) => (
              <ParameterInput
                key={param.name}
                param={param}
                onChange={(value) =>
                  onParametersChange({ [param.name]: value })
                }
              />
            ))}
          </div>
        </div>
      )}

      {queryParams.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
            Query Parameters
          </h4>
          <div className="space-y-3">
            {queryParams.map((param) => (
              <ParameterInput
                key={param.name}
                param={param}
                onChange={(value) =>
                  onParametersChange({ [param.name]: value })
                }
              />
            ))}
          </div>
        </div>
      )}

      {headerParams.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
            Headers
          </h4>
          <div className="space-y-3">
            {headerParams.map((param) => (
              <ParameterInput
                key={param.name}
                param={param}
                onChange={(value) =>
                  onParametersChange({ [param.name]: value })
                }
              />
            ))}
          </div>
        </div>
      )}

      {cookieParams.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
            Cookies
          </h4>
          <div className="space-y-3">
            {cookieParams.map((param) => (
              <ParameterInput
                key={param.name}
                param={param}
                onChange={(value) =>
                  onParametersChange({ [param.name]: value })
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ParameterInputProps {
  param: PathParameter;
  onChange: (value: string) => void;
}

function ParameterInput({ param, onChange }: ParameterInputProps) {
  const label = `${param.name}${param.required ? '*' : ''}`;

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
        {label}
      </label>
      {param.description && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
          {param.description}
        </p>
      )}
      <input
        type={param.schema?.type === 'integer' ? 'number' : 'text'}
        placeholder={`Enter ${param.name}`}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      />
    </div>
  );
}
