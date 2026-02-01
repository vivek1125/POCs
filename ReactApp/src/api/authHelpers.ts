import apiService from './apiService';

export interface RegisterPayload {
  userName: string;
  email: string;
  password: string;
  role: string;
  confirmPassword?: string;
}

export async function registerWithFallback(payload: RegisterPayload) {
  try {
    return await apiService.post('/api/Auth/register', payload);
  } catch (err: any) {
    const status = err?.response?.status;
    // If endpoint not found or not allowed, try alternate path
    if (status === 404 || status === 405) {
      return await apiService.post('/api/Auth/signup', payload);
    }
    throw err;
  }
}

export function extractApiError(err: any): string {
  if (!err) return 'Unknown error';
  const resp = err.response;
  if (!resp) {
    // Network/CORS/SSL issues often surface with no response
    return err.message || 'Network error (server unreachable or CORS)';
  }
  const data = resp.data;
  if (!data) return `HTTP ${resp.status}`;
  if (typeof data === 'string') return data;
  // Common ASP.NET/Axios error shapes
  if (data.message) return data.message;
  if (data.title) return data.title;
  if (data.errors && typeof data.errors === 'object') {
    try {
      return Object.values<string[] | string>(data.errors)
        .flat()
        .join('\n');
    } catch {
      // ignore
    }
  }
  try {
    return JSON.stringify(data);
  } catch {
    return 'Request failed';
  }
}
