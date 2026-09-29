/**
 * Deal Intelligence Agent - Centralized API Client
 * 
 * Strict single source of truth for all network communication.
 * Respects VITE_API_BASE_URL and dynamic runtime override via settings.
 * Never generates or substitutes fake data on failure.
 */

import {
  AuthResponse,
  DashboardSummary,
  Deal,
  DealClosePayload,
  DealIntelligence,
  DealRecallResult,
  DealReflectResult,
  DealRiskAnalysis,
  KnowledgeAnswer,
  KnowledgeDoc,
  ReportsData,
  SimulationResult,
  SimulationScenarioInput,
  Suggestion,
  Transcript,
  User,
  ChatRequestPayload,
  ChatResponsePayload,
} from '../../types';

export class ApiError extends Error {
  public status: number;
  public details?: unknown;
  public isNetworkError: boolean;

  constructor(message: string, status = 500, details?: unknown, isNetworkError = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.isNetworkError = isNetworkError;
  }
}

// Token storage key
const TOKEN_STORAGE_KEY = 'deal_intel_auth_token';
const REFRESH_TOKEN_KEY = 'deal_intel_refresh_token';
const API_URL_OVERRIDE_KEY = 'deal_intel_api_url_override';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(API_URL_OVERRIDE_KEY);
    // Purge any stale localhost:4000 or disconnected localhost configs
    if (stored && (stored.includes('localhost:4000') || stored.includes('localhost:8000') || stored.includes('localhost:5000'))) {
      localStorage.removeItem(API_URL_OVERRIDE_KEY);
    } else if (stored && stored.trim() !== '') {
      return stored.trim().replace(/\/$/, '');
    }
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '' && !envUrl.includes('localhost:4000')) {
    return envUrl.trim().replace(/\/$/, '');
  }
  return '';
}

export function setApiBaseUrlOverride(url: string) {
  if (typeof window !== 'undefined') {
    if (url.trim() && !url.includes('localhost:4000')) {
      localStorage.setItem(API_URL_OVERRIDE_KEY, url.trim().replace(/\/$/, ''));
    } else {
      localStorage.removeItem(API_URL_OVERRIDE_KEY);
    }
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthTokens(token: string, refreshToken?: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearAuthTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const urlString = baseUrl ? `${baseUrl}${cleanEndpoint}` : cleanEndpoint;

  const url = new URL(urlString, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  if (options.params) {
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        url.searchParams.append(key, String(val));
      }
    });
  }

  const headers = new Headers(options.headers || {});
  
  // Only set Content-Type to JSON if body is not FormData
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      ...options,
      headers,
    });
  } catch (err: unknown) {
    // If a custom baseUrl failed, clear the override and retry with relative URL immediately
    if (baseUrl) {
      try {
        localStorage.removeItem(API_URL_OVERRIDE_KEY);
        response = await fetch(cleanEndpoint, {
          ...options,
          headers,
        });
      } catch (fallbackErr: any) {
        const fallbackMsg = fallbackErr instanceof Error ? fallbackErr.message : 'Network request failed';
        throw new ApiError(`Unable to connect to intelligence backend: ${fallbackMsg}`, 0, null, true);
      }
    } else {
      const errorMsg = err instanceof Error ? err.message : 'Network request failed';
      throw new ApiError(`Unable to connect to intelligence backend: ${errorMsg}`, 0, null, true);
    }
  }

  if (response.status === 401) {
    clearAuthTokens();
    // Dispatch custom event for auth store listener
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
  }

  let data: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let errorMessage = response.statusText || 'Backend request failed';
    if (typeof data === 'string' && data.trim()) {
      errorMessage = data;
    } else if (data && typeof data === 'object') {
      if (typeof data.message === 'string' && data.message.trim()) {
        errorMessage = data.message;
      } else if (data.error) {
        if (typeof data.error === 'string' && data.error.trim()) {
          errorMessage = data.error;
        } else if (typeof data.error === 'object') {
          errorMessage = data.error.message || data.error.code || JSON.stringify(data.error);
        }
      } else if (Array.isArray(data.errors) && data.errors.length > 0) {
        errorMessage = data.errors.map((e: any) => (typeof e === 'string' ? e : e?.message || String(e))).join(', ');
      }
    }
    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}

export const api = {
  // Authentication
  auth: {
    login: (credentials: { email: string; password: string; rememberMe?: boolean }) =>
      request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData: {
      fullName: string;
      email: string;
      company: string;
      role: string;
      password: string;
    }) =>
      request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    refresh: () => {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
      return request<AuthResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    },
    getCurrentUser: () => request<User>('/auth/me', { method: 'GET' }),
  },

  // Dashboard
  dashboard: {
    getSummary: () => request<DashboardSummary>('/dashboard/summary', { method: 'GET' }),
  },

  // Deals
  deals: {
    list: (params?: { search?: string; stage?: string; risk?: string; status?: string; page?: number; limit?: number }) =>
      request<{ deals: Deal[]; total: number; page?: number; totalPages?: number }>('/deals', {
        method: 'GET',
        params,
      }),
    get: (id: string) => request<Deal>(`/deals/${id}`, { method: 'GET' }),
    create: (deal: Partial<Deal>) =>
      request<Deal>('/deals', {
        method: 'POST',
        body: JSON.stringify(deal),
      }),
    update: (id: string, deal: Partial<Deal>) =>
      request<Deal>(`/deals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(deal),
      }),
    delete: (id: string) => request<{ success: boolean; id: string }>(`/deals/${id}`, { method: 'DELETE' }),
    close: (id: string, payload: DealClosePayload) =>
      request<{ success: boolean; deal: Deal; retainedLesson?: any }>(`/deals/${id}/close`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getRisk: (id: string) => request<DealRiskAnalysis>(`/deals/${id}/risk`, { method: 'GET' }),
    refreshRisk: (id: string) => request<any>(`/deals/${id}/risk/refresh`, { method: 'POST' }),
    getOutcome: (id: string) => request<any>(`/deals/${id}/outcome-prediction`, { method: 'GET' }),
    getCycle: (id: string) => request<any>(`/deals/${id}/cycle-prediction`, { method: 'GET' }),
    getSimilar: (id: string) => request<any>(`/deals/${id}/similar`, { method: 'GET' }),
    getIntelligenceModels: (id: string) => request<any>(`/deals/${id}/intelligence-models`, { method: 'GET' }),
  },

  // Transcript Intelligence
  transcripts: {
    upload: (dealId: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return request<Transcript>(`/deals/${dealId}/transcripts`, {
        method: 'POST',
        body: formData,
      });
    },
    uploadText: (dealId: string, text: string, title?: string) =>
      request<Transcript>(`/deals/${dealId}/transcripts`, {
        method: 'POST',
        body: JSON.stringify({ text, title }),
      }),
    getStatus: (dealId: string, transcriptId: string) =>
      request<Transcript>(`/deals/${dealId}/transcripts/${transcriptId}`, {
        method: 'GET',
      }),
  },

  // Deal Intelligence
  intelligence: {
    get: (dealId: string) => request<DealIntelligence>(`/deals/${dealId}/intelligence`, { method: 'GET' }),
    refresh: (dealId: string) =>
      request<DealIntelligence>(`/deals/${dealId}/intelligence`, {
        method: 'POST',
      }),
  },

  // Memory (Recall, Reflect, Retain)
  memory: {
    recall: (dealId: string) =>
      request<DealRecallResult>(`/deals/${dealId}/recall`, {
        method: 'POST',
      }),
    reflect: (dealId: string) =>
      request<DealReflectResult>(`/deals/${dealId}/reflect`, {
        method: 'POST',
      }),
    getRetainedLessons: (params?: { category?: string; outcome?: string }) =>
      request<{ lessons: any[] }>('/deals/memory/retained', {
        method: 'GET',
        params,
      }),
  },

  // Suggestions (Explainable Next-Best-Action)
  suggestions: {
    list: (params?: { dealId?: string }) =>
      request<{ suggestions: Suggestion[] }>('/suggestions', {
        method: 'GET',
        params,
      }),
    getForDeal: (dealId: string) =>
      request<{ suggestions: Suggestion[] }>(`/deals/${dealId}/suggestions`, {
        method: 'GET',
      }),
    apply: (id: string) =>
      request<{ success: boolean; suggestion: Suggestion }>(`/suggestions/${id}/apply`, {
        method: 'POST',
      }),
    dismiss: (id: string) =>
      request<{ success: boolean; id: string }>(`/suggestions/${id}/dismiss`, {
        method: 'POST',
      }),
  },

  // Risk
  risk: {
    get: (dealId: string) => request<DealRiskAnalysis>(`/deals/${dealId}/risk`, { method: 'GET' }),
    listAll: () => request<{ risks: DealRiskAnalysis[] }>('/risk', { method: 'GET' }),
  },

  // Simulation
  simulation: {
    simulate: (dealId: string, scenario: SimulationScenarioInput) =>
      request<SimulationResult>(`/deals/${dealId}/simulate`, {
        method: 'POST',
        body: JSON.stringify(scenario),
      }),
  },

  // Knowledge Base (RAG)
  knowledge: {
    getDocs: (params?: { category?: string; search?: string }) =>
      request<{ docs: KnowledgeDoc[] }>('/knowledge/docs', {
        method: 'GET',
        params,
      }),
    uploadDoc: (file: File, category: string) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      return request<KnowledgeDoc>('/knowledge/docs', {
        method: 'POST',
        body: formData,
      });
    },
    ask: (question: string) =>
      request<KnowledgeAnswer>('/knowledge/ask', {
        method: 'POST',
        body: JSON.stringify({ question }),
      }),
  },

  // Reports
  reports: {
    get: (timeframe = 'last_12_months') =>
      request<ReportsData>(`/reports/${timeframe}`, {
        method: 'GET',
      }),
  },

  // Chat Bot & Deal Copilot (Gemini 3.8 Flash)
  chat: {
    send: (payload: ChatRequestPayload) =>
      request<ChatResponsePayload>('/chat', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getDeals: () =>
      request<{ deals: Array<{ id: string; client: string; value: number; stage: string; risk: string; winProbability?: number }> }>(
        '/chat/deals',
        { method: 'GET' }
      ),
  },

  // Machine Learning Models & Registry
  models: {
    getStatus: () => request<any>('/models/status', { method: 'GET' }),
    getModel: (modelName: string) => request<any>(`/models/${modelName}`, { method: 'GET' }),
  },

  // System & Connection Check
  system: {
    ping: () => request<{ status: string; version?: string; timestamp?: string }>('/health', { method: 'GET' }),
  },
};
