// // lib/api-client.ts
// "use client";

// export interface ApiResponse<T> {
//   success: boolean;
//   data?: T;
//   message?: string;
// }

// interface LoginResponse {
//   accessToken: string;
//   refreshToken: string;
//   user: any;
// }

// class ApiClient {
//   private baseUrl: string;
//   private accessToken: string | null = null;
//   private isRefreshing = false;
//   private failedRequestQueue: Array<(token: string) => void> = [];

//   constructor() {
//     this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
//     if (typeof window !== "undefined") {
//       this.accessToken = localStorage.getItem("access_token");
//     }
//   }

//   public setToken(token: string | null) {
//     this.accessToken = token;
//     if (typeof window !== "undefined" && token) {
//       localStorage.setItem("access_token", token);
//     } else if (typeof window !== "undefined") {
//       localStorage.removeItem("access_token");
//     }
//   }

//   public async logout() {
//     this.setToken(null);
//     if (typeof window !== "undefined") {
//       localStorage.removeItem("refresh_token");
//     }
//   }

//   public async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
//     try {
//       const response = await this.fetchWithAuth(endpoint, options);
//       if (response.status === 401) {
//         return this.handle401Error<T>(endpoint, options);
//       }
//       const json = await response.json();
//       if (!response.ok) {
//         throw new Error(json.message || `HTTP error! status: ${response.status}`);
//       }
//       return json as ApiResponse<T>;
//     } catch (error: any) {
//       throw new Error(error.message || `Request failed for ${endpoint}`);
//     }
//   }

//   private handle401Error<T>(originalEndpoint: string, originalOptions: RequestInit): Promise<ApiResponse<T>> {
//     const retryOriginalRequest = new Promise<ApiResponse<T>>((resolve) => {
//       this.failedRequestQueue.push((newAccessToken: string) => {
//         const newOptions = { ...originalOptions, headers: { ...originalOptions.headers, Authorization: `Bearer ${newAccessToken}` } };
//         this.request<T>(originalEndpoint, newOptions).then(resolve);
//       });
//     });

//     if (!this.isRefreshing) {
//       this.isRefreshing = true;
//       this.refreshToken().finally(() => {
//         this.isRefreshing = false;
//       });
//     }

//     return retryOriginalRequest;
//   }

//   private async refreshToken(): Promise<void> {
//     const refreshToken = localStorage.getItem("refresh_token");
//     console.log("[refreshToken] Starting refresh with token:", refreshToken);
//     try {
//       if (!refreshToken) throw new Error("No refresh token available.");
      
//       const response = await fetch(`${this.baseUrl}/auth/refresh`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ refreshToken }),
//       });
//       const result = await response.json();
//       console.log("[refreshToken] Refresh response:", result, "Status:", response.status);
//       if (!result.success) throw new Error("Could not refresh token.");
      
//       const newAccessToken = result.data.accessToken;
//       this.setToken(newAccessToken);
//       this.processQueue(newAccessToken);
//     } catch (error) {
//       console.error("[refreshToken] Error:", error);
//       this.failedRequestQueue = [];
//       this.forceLogout();
//     }
//   }

//   private forceLogout = async () => {
//     console.log("[forceLogout] Logging out and redirecting...");
//     await this.logout();
//     if (typeof window !== "undefined") {
//       console.log("[forceLogout] Redirecting to /auth/login");
//       window.location.href = "/auth/login";
//     }
//   }

//   private processQueue = (token: string) => {
//     this.failedRequestQueue.forEach((promise) => promise(token));
//     this.failedRequestQueue = [];
//   }

//   private fetchWithAuth(endpoint: string, options: RequestInit): Promise<Response> {
//     const url = `${this.baseUrl}${endpoint}`;
//     const headers = new Headers(options.headers);
//     if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
//     if (this.accessToken) headers.set("Authorization", `Bearer ${this.accessToken}`);
//     const config: RequestInit = { ...options, headers };
//     return fetch(url, config);
//   }

//   public async login(credentials: { usernameOrEmail: string; password: string }): Promise<ApiResponse<LoginResponse>> {
//     const response = await this.request<LoginResponse>("/auth/login", {
//       method: "POST",
//       body: JSON.stringify(credentials),
//     });
//     if (response.success && response.data) {
//       this.setToken(response.data.accessToken);
//       if (typeof window !== "undefined") {
//         localStorage.setItem("refresh_token", response.data.refreshToken);
//       }
//     }
//     return response;
//   }

//   public getCurrentUserProfile<T>(): Promise<ApiResponse<T>> {
//     return this.request<T>("/users/profile", { method: "GET" });
//   }

//   public updateProfile<T>(data: any): Promise<ApiResponse<T>> {
//     return this.request<T>("/users/profile", { method: "PUT", body: JSON.stringify(data) });
//   }

//   public getUserProfileByUsername<T>(username: string): Promise<ApiResponse<T>> {
//     return this.request<T>(`/users/${username}`, { method: "GET" });
//   }

//   public getPosts<T>(params?: Record<string, string>): Promise<ApiResponse<T>> {
//     const query = params ? "?" + new URLSearchParams(params).toString() : "";
//     return this.request<T>(`/posts${query}`, { method: "GET" });
//   }

//   public createPost<T>(postData: any): Promise<ApiResponse<T>> {
//     return this.request<T>("/posts", { method: "POST", body: JSON.stringify(postData) });
//   }
// }

// export const apiClient = new ApiClient();

// lib/api-client.ts
"use client";

import { getSession, signOut } from "next-auth/react";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface LoginResponse {
  user: any;
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
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  
  // Cache configurations for different endpoints
  private cacheConfigs: Record<string, CacheConfig> = {
    '/users/profile': { ttl: 5 * 60 * 1000 }, // 5 minutes
    '/profile': { ttl: 5 * 60 * 1000 },
    '/trending': { ttl: 2 * 60 * 1000, staleWhileRevalidate: true }, // 2 minutes with SWR
    '/leaderboard': { ttl: 3 * 60 * 1000, staleWhileRevalidate: true },
    '/dashboard': { ttl: 1 * 60 * 1000 }, // 1 minute
    '/posts': { ttl: 30 * 1000 }, // 30 seconds for posts
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

  private isStale(entry: CacheEntry<any>, config: CacheConfig): boolean {
    return Date.now() - entry.timestamp > config.ttl;
  }

  private async revalidateInBackground<T>(cacheKey: string, endpoint: string, options: RequestInit): Promise<void> {
    try {
      const response = await this.fetchRequest<T>(endpoint, options);
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.warn('Background revalidation failed:', error);
    }
  }

  private async fetchRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const session = await getSession();
    
    const headers = new Headers(options.headers);
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    
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
    
    const fullUrl = `${this.baseUrl}${endpoint}`;
    const response = await fetch(fullUrl, config);
    
    // Only redirect to login for protected endpoints, not public ones like trending
    if (response.status === 401 && !endpoint.includes('/trending')) {
      await signOut({ redirect: false });
      window.location.href = "/auth/login";
      throw new Error("Unauthorized");
    }
    
    const text = await response.text();
    
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      throw new Error(`Invalid JSON response from ${endpoint}`);
    }
    
    if (!response.ok) {
      const error = new Error(json.error?.message || json.message || `HTTP error! status: ${response.status}`);
      (error as any).response = { data: json, status: response.status };
      throw error;
    }
    
    return json as ApiResponse<T>;
  }

  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
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
          return cached.data;
        }
        
        if (cacheConfig.staleWhileRevalidate) {
          // Return stale data immediately, revalidate in background
          this.revalidateInBackground<T>(cacheKey, endpoint, options);
          return cached.data;
        }
      }
      
      // Check for pending request to avoid duplicate calls
      const pending = this.pendingRequests.get(cacheKey);
      if (pending) {
        return pending;
      }
    }
    
    try {
      const requestPromise = this.fetchRequest<T>(endpoint, options);
      
      // Store pending request
      if (method === 'GET') {
        this.pendingRequests.set(cacheKey, requestPromise);
      }
      
      const response = await requestPromise;
      
      // Cache successful GET responses
      if (method === 'GET' && cacheConfig && response.success) {
        this.cache.set(cacheKey, {
          data: response,
          timestamp: Date.now(),
        });
      }
      
      return response;
    } catch (error: any) {
      throw new Error(error.message || `Request failed for ${endpoint}`);
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

  public async updateProfile<T>(data: any): Promise<ApiResponse<T>> {
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

  public getPosts<T>(params?: Record<string, string>): Promise<ApiResponse<T>> {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.request<T>(`/posts${query}`, { method: "GET" });
  }

  public async createPost<T>(postData: any): Promise<ApiResponse<T>> {
    try {
      const jsonBody = JSON.stringify(postData);
      const response = await this.request<T>("/posts", { method: "POST", body: jsonBody });
      
      // Invalidate posts cache after creating
      if (response.success) {
        this.invalidateCache('/posts');
        this.invalidateCache('/dashboard');
      }
      
      return response;
    } catch (error) {
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
    return this.request<T>(`/leaderboard${query}`, { method: "GET" });
  }

  public searchPosts<T>(params: Record<string, string>): Promise<ApiResponse<T>> {
    const query = "?" + new URLSearchParams(params).toString();
    return this.request<T>(`/search${query}`, { method: "GET" });
  }

  public getDashboardData<T>(): Promise<ApiResponse<T>> {
    return this.request<T>("/dashboard", { method: "GET" });
  }

  public getDashboard<T>(period?: string): Promise<ApiResponse<T>> {
    const query = period ? `?period=${period}` : "";
    return this.request<T>(`/dashboard${query}`, { method: "GET" });
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

  public getAffiliations(): Promise<ApiResponse<any>> {
    try {
      return this.request<any>("/affiliations", { 
        method: "GET",
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
    } catch (error: any) {
      console.error('Affiliations API error:', error);
      throw new Error(`Failed to fetch affiliations: ${error.message}`);
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

  public trackMissionProgress<T>(metric: string, increment?: number, metadata?: any): Promise<ApiResponse<T>> {
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
