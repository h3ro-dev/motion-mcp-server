import axios, { AxiosRequestConfig } from 'axios';
import { RateLimiter } from './rate-limiter.js';

export class MotionClient {
  private baseUrl: string;
  private apiKey: string;
  private rateLimiter: RateLimiter;

  constructor() {
    this.baseUrl = process.env['MOTION_BASE_URL'] || 'https://api.motion.com/v1';
    this.apiKey = process.env['MOTION_API_KEY'] || '';
    this.rateLimiter = new RateLimiter(process.env['DATABASE_PATH'] || ':memory:');
  }

  private buildHeaders(): Record<string, string> {
    return {
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async request<T = any>(endpoint: string, options?: AxiosRequestConfig): Promise<T> {
    const rate = await this.rateLimiter.checkRateLimit();
    if (!rate.allowed) {
      const error: any = new Error('Rate limit exceeded');
      error.status = 429;
      throw error;
    }

    const method = (options?.method || 'GET').toUpperCase();
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await axios.request<T>({
        method,
        url,
        headers: this.buildHeaders(),
        params: options?.params,
        data: options?.data,
      });
      return response.data as T;
    } catch (err: any) {
      if (err?.response) {
        const status = err.response.status;
        const data = err.response.data;

        // Use specific message only for 400 errors per test expectations
        let message = `Motion API error (${status})`;
        if (status === 400 && data?.error?.message) {
          message = data.error.message;
        }

        const apiError: any = new Error(message);
        apiError.status = status;
        throw apiError;
      }

      throw err;
    }
  }

  async get<T = any>(endpoint: string, params?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', data });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', data });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', data });
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  close(): void {
    this.rateLimiter.close();
  }
}