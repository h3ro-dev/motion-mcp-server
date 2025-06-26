import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { config } from '../config/index.js';
import { RateLimiter } from '../rate-limit/index.js';

export interface MotionError {
  code: string;
  message: string;
  details?: any;
}

export class MotionAPIError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'MotionAPIError';
  }
}

export class MotionClient {
  private client: AxiosInstance;
  private rateLimiter: RateLimiter;

  constructor() {
    this.rateLimiter = new RateLimiter();
    
    this.client = axios.create({
      baseURL: config.motion.baseUrl,
      headers: {
        'X-API-Key': config.motion.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      this.handleError.bind(this)
    );
  }

  private async handleError(error: AxiosError): Promise<never> {
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle specific Motion API errors
      switch (status) {
        case 400:
          throw new MotionAPIError('BAD_REQUEST', 'Invalid request parameters', status, data);
        case 401:
          throw new MotionAPIError('UNAUTHORIZED', 'Invalid API key', status);
        case 403:
          throw new MotionAPIError('FORBIDDEN', 'Access forbidden', status);
        case 404:
          throw new MotionAPIError('NOT_FOUND', 'Resource not found', status);
        case 429:
          throw new MotionAPIError('RATE_LIMITED', 'Too many requests', status, data);
        case 500:
          throw new MotionAPIError('SERVER_ERROR', 'Motion server error', status);
        default:
          throw new MotionAPIError('UNKNOWN_ERROR', `Request failed with status ${status}`, status, data);
      }
    } else if (error.request) {
      throw new MotionAPIError('NETWORK_ERROR', 'Network error - no response received');
    } else {
      throw new MotionAPIError('REQUEST_ERROR', error.message || 'Failed to make request');
    }
  }

  async request<T>(endpoint: string, options?: AxiosRequestConfig): Promise<T> {
    // Check rate limit
    const rateLimit = await this.rateLimiter.checkLimit(endpoint);
    
    if (!rateLimit.allowed) {
      throw new MotionAPIError(
        'RATE_LIMITED',
        `Rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds`,
        429,
        { retryAfter: rateLimit.retryAfter }
      );
    }

    if (config.debug) {
      console.error(`[Motion API] ${options?.method || 'GET'} ${endpoint}`);
    }

    const response = await this.client.request<T>({
      url: endpoint,
      ...options,
    });

    return response.data;
  }

  async get<T>(endpoint: string, params?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', data });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', data });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  close(): void {
    this.rateLimiter.close();
  }
}