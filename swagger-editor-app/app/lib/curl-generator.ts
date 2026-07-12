export interface RequestParams {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  cookies?: Record<string, string>;
}

export function generateCurl(params: RequestParams): string {
  const { url, method, headers, body, cookies } = params;
  
  let curl = `curl -X ${method} '${url}'`;
  
  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    curl += ` \\\n  -H '${key}: ${value}'`;
  });
  
  // Add cookies
  if (cookies && Object.keys(cookies).length > 0) {
    const cookieString = Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    curl += ` \\\n  -H 'Cookie: ${cookieString}'`;
  }
  
  // Add body if present
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    const escapedBody = body.replace(/'/g, "'\\''");
    curl += ` \\\n  -d '${escapedBody}'`;
  }
  
  return curl;
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard
      .writeText(text)
      .then(() => true)
      .catch(() => false);
  } else {
    // Fallback for non-secure contexts or older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    
    try {
      textArea.select();
      const success = document.execCommand('copy');
      return Promise.resolve(success);
    } catch {
      return Promise.resolve(false);
    } finally {
      document.body.removeChild(textArea);
    }
  }
}
