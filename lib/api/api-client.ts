
"use client";

import { signOut, getSession } from "next-auth/react";

import type { User } from '@/types'

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  etag?: string;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  staleWhileRevalidate?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private cache = new Map<string, CacheEntry<ApiResponse<Record<string, unknown>>>>();
  private pendingRequests = new Map<string, Promise<ApiResponse<Record<string, unknown>>>>();
  
  // Cache configurations for different endpoints
  private cacheConfigs: Record<string, CacheConfig> = {
    '/users/profile': { ttl: 2 * 60 * 1000 }, // 2 minutes
    '/profile': { ttl: 2 * 60 * 1000 },
    '/trending': { ttl: 30 * 1000, staleWhileRevalidate: true }, // 30 seconds with SWR
    '/gamification/leaderboard': { ttl: 1 * 60 * 1000, staleWhileRevalidate: true }, // 1 minute
    // Posts, dashboard, and dynamic content are NOT cached
  };

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
  }

  private getCacheKey(endpoint: string, options: RequestInit = {}): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${endpoint}:${body}`;
  }

  private getCacheConfig(endpoint: string): CacheConfig | null {
    // Only cache GET requests
    const method = 'GET';
    if (method !== 'GET') return null;
    
    // Find matching cache config
    for (const [pattern, config] of Object.entries(this.cacheConfigs)) {
      if (endpoint.startsWith(pattern)) {
        return config;
      }
    }
    return null;
  }

  private isStale(entry: CacheEntry<ApiResponse<Record<string, unknown>>>, config: CacheConfig): boolean {
    return Date.now() - entry.timestamp > config.ttl;
  }

  private async revalidateInBackground<T>(cacheKey: string, endpoint: string, options: RequestInit): Promise<void> {
    try {
      const response = await this.fetchRequest<T>(endpoint, options);
      this.cache.set(cacheKey, {
        data: response as ApiResponse<Record<string, unknown>>,
        timestamp: Date.now(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Revalidation failed';
      console.warn('Background revalidation failed:', errorMessage);
    }
  }

  private async fetchRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const session = await getSession();
    
    const headers = new Headers(options.headers);
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    
    // Add Authorization header if session exists
    const accessToken = (session?.user as any)?.accessToken;
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    
    // Handle body serialization
    let body = options.body;
    if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof URLSearchParams)) {
      body = JSON.stringify(body);
    }
    
    const config: RequestInit = { 
      ...options, 
      headers,
      credentials: 'include',
      body
    };
    
    // Ensure we use the absolute backend URL
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
    const fullUrl = `${backendUrl}${endpoint}`;
    const response = await fetch(fullUrl, config);
    
    // Only redirect to login for protected endpoints, not public ones like trending
    if (response.status === 401 && !endpoint.includes('/trending') && !endpoint.includes('/auth/login')) {
      await signOut({ redirect: false });
      window.location.href = "/auth/login";
      throw new Error("Unauthorized");
    }
    
    const text = await response.text();
    
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON response from ${endpoint}`);
    }
    
    if (!response.ok) {
      const error = new Error((json as { error?: { message?: string }; message?: string }).error?.message || (json as { message?: string }).message || `HTTP error! status: ${response.status}`);
      (error as { response?: { data: unknown; status: number } }).response = { data: json, status: response.status };
      throw error;
    }
    
    return json as ApiResponse<T>;
  }

  public async request<T = Record<string, unknown>>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const method = options.method || 'GET';
    const cacheKey = this.getCacheKey(endpoint, options);
    const cacheConfig = this.getCacheConfig(endpoint);
    
    // Only use cache for GET requests
    if (method === 'GET' && cacheConfig) {
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        const isStale = this.isStale(cached, cacheConfig);
        
        if (!isStale) {
          // Return fresh cached data
          return cached.data as ApiResponse<T>;
        }
        
        if (cacheConfig.staleWhileRevalidate) {
          // Return stale data immediately, revalidate in background
          this.revalidateInBackground<T>(cacheKey, endpoint, options);
          return cached.data as ApiResponse<T>;
        }
      }
      
      // Check for pending request to avoid duplicate calls
      const pending = this.pendingRequests.get(cacheKey);
      if (pending) {
        return pending as Promise<ApiResponse<T>>;
      }
    }
    
    try {
      const requestPromise = this.fetchRequest<T>(endpoint, options);
      
      // Store pending request
      if (method === 'GET') {
        this.pendingRequests.set(cacheKey, requestPromise as Promise<ApiResponse<Record<string, unknown>>>);
      }
      
      const response = await requestPromise;
      
      // Cache successful GET responses
      if (method === 'GET' && cacheConfig && response.success) {
        this.cache.set(cacheKey, {
          data: response as ApiResponse<Record<string, unknown>>,
          timestamp: Date.now(),
        });
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Request failed for ${endpoint}`;
      throw new Error(errorMessage);
    } finally {
      // Clean up pending request
      if (method === 'GET') {
        this.pendingRequests.delete(cacheKey);
      }
    }
  }

  public invalidateCache(pattern?: string): void {
    if (pattern) {
      // Invalidate specific pattern
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  public preload<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Preload data without waiting for result
    return this.request<T>(endpoint, options).catch(() => ({} as ApiResponse<T>));
  }

  public async login(credentials: { usernameOrEmail: string; password: string }): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return response;
  }

  public getCurrentUserProfile<T>(): Promise<ApiResponse<T>> {
    return this.request<T>("/users/profile", { method: "GET" });
  }

  public getProfile<T>(): Promise<ApiResponse<T>> {
    return this.request<T>("/profile", { method: "GET" });
  }

  public async updateProfile<T>(data: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response = await this.request<T>("/users/profile", { method: "PUT", body: JSON.stringify(data) });
    
    // Invalidate profile caches after update
    if (response.success) {
      this.invalidateCache('/users/profile');
      this.invalidateCache('/profile');
    }
    
    return response;
  }

  public getUserProfileByUsername<T>(username: string): Promise<ApiResponse<T>> {
    return this.request<T>(`/users/${username}`, { method: "GET" });
  }

  public async getPosts<T>(params?: Record<string, string>): Promise<ApiResponse<T>> {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    const cacheKey = this.getCacheKey(`/posts${query}`, { method: 'GET' });
    this.cache.delete(cacheKey); // Always clear posts cache before fetching
    
    return this.fetchRequest<T>(`/posts${query}`, { 
      method: "GET",
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  }

  public async createPost<T>(postData: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      const jsonBody = JSON.stringify(postData);
      const response = await this.request<T>("/posts", { method: "POST", body: jsonBody });
      
      // Invalidate posts cache after creating
      if (response.success) {
        this.invalidateCache('/posts');
        this.invalidateCache('/dashboard');
      }
      
      return response;
    } catch {
      throw new Error('Failed to serialize post data');
    }
  }

  public getPostById<T>(postId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`/posts/${postId}`, { method: "GET" });
  }

  public getPost<T>(postId: string): Promise<ApiResponse<T>> {
    return this.getPostById<T>(postId);
  }

  public async togglePostLike<T>(postId: string): Promise<ApiResponse<T>> {
    const response = await this.request<T>(`/likes/posts/${postId}`, { method: "POST" });
    
    // Invalidate posts cache after like toggle
    if (response.success) {
      this.invalidateCache('/posts');
      this.invalidateCache(`/posts/${postId}`);
    }
    
    return response;
  }

  public toggleCommentLike<T>(commentId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`/likes/comments/${commentId}`, { method: "POST" });
  }

  public toggleLike<T>(type: 'post' | 'comment', id: string): Promise<ApiResponse<T>> {
    if (type === 'post') {
      return this.togglePostLike<T>(id);
    } else {
      return this.toggleCommentLike<T>(id);
    }
  }

  public getComments<T>(postId: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const query = params ? "&" + new URLSearchParams(params).toString() : "";
    return this.request<T>(`/comments/${postId}?${query}`, { method: "GET" });
  }

  public createComment<T>(postId: string, content: string, parentCommentId?: string, imageUrl?: string): Promise<ApiResponse<T>> {
    return this.request<T>(`/comments/${postId}`, {
      method: "POST",
      body: JSON.stringify({ content, parentCommentId, imageUrl })
    });
  }

  public getTrendingData<T>(period?: string): Promise<ApiResponse<T>> {
    const query = period ? `?period=${period}` : "";
    return this.request<T>(`/trending${query}`, { method: "GET" });
  }

  public getLeaderboard<T>(params?: Record<string, string>): Promise<ApiResponse<T>> {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.request<T>(`/gamification/leaderboard${query}`, { method: "GET" });
  }

  public searchPosts<T>(params: Record<string, string>): Promise<ApiResponse<T>> {
    const query = "?" + new URLSearchParams(params).toString();
    return this.request<T>(`/search${query}`, { method: "GET" });
  }

  public getDashboardData<T>(): Promise<ApiResponse<T>> {
    return this.request<T>("/dashboard", { method: "GET" });
  }

  public async getDashboard<T>(period?: string): Promise<ApiResponse<T>> {
    const query = period ? `?period=${period}` : "";
    const cacheKey = this.getCacheKey(`/dashboard${query}`, { method: 'GET' });
    this.cache.delete(cacheKey); // Always clear dashboard cache
    
    return this.fetchRequest<T>(`/dashboard${query}`, { 
      method: "GET",
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }

  public async deletePost<T>(postId: string): Promise<ApiResponse<T>> {
    const response = await this.request<T>(`/posts/${postId}`, { method: "DELETE" });
    
    // Invalidate related caches after deletion
    if (response.success) {
      this.invalidateCache('/posts');
      this.invalidateCache('/dashboard');
      this.invalidateCache(`/posts/${postId}`);
    }
    
    return response;
  }

  // Follow system methods
  public followUser<T>(userId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`/users/follow/${userId}`, { method: "POST" });
  }

  public unfollowUser<T>(userId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`/users/follow/${userId}`, { method: "DELETE" });
  }

  public getFollowers<T>(username: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.request<T>(`/users/${username}/followers${query}`, { method: "GET" });
  }

  public getFollowing<T>(username: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.request<T>(`/users/${username}/following${query}`, { method: "GET" });
  }

  public getAffiliations(): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      return this.request<Record<string, unknown>>("/affiliations", { 
        method: "GET",
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch affiliations';
      console.error('Affiliations API error:', errorMessage);
      throw new Error(`Failed to fetch affiliations: ${errorMessage}`);
    }
  }

  public trackPostView<T>(postId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`/posts/${postId}/views`, { method: "POST" });
  }

  public getMissions<T>(params?: Record<string, string>): Promise<ApiResponse<T>> {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.request<T>(`/missions${query}`, { method: "GET" });
  }

  public updateMissionProgress<T>(missionId: string, stepId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`/missions/${missionId}/progress`, {
      method: "POST",
      body: JSON.stringify({ stepId })
    });
  }

  public joinMission<T>(missionId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`/missions/join`, {
      method: "POST",
      body: JSON.stringify({ missionId })
    });
  }

  public trackMissionProgress<T>(metric: string, increment?: number, metadata?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(`/missions/track`, {
      method: "POST",
      body: JSON.stringify({ metric, increment, metadata })
    });
  }

  public generateMissions<T>(count?: number): Promise<ApiResponse<T>> {
    return this.request<T>(`/missions/generate`, {
      method: "POST",
      body: JSON.stringify({ count })
    });
  }
}

export const apiClient = new ApiClient();
