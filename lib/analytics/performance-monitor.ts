// Performance monitoring utility
interface PerformanceMetric {
  endpoint: string;
  duration: number;
  timestamp: number;
  status: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 metrics
  private readonly slowThreshold = 5000; // 5 seconds

  logRequest(endpoint: string, duration: number, status: number = 200) {
    const metric: PerformanceMetric = {
      endpoint,
      duration,
      timestamp: Date.now(),
      status
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow requests
    if (duration > this.slowThreshold) {
      console.warn(`🐌 Slow request detected: ${endpoint} took ${duration}ms`);
    }
  }

  getSlowRequests(limit: number = 10): PerformanceMetric[] {
    return this.metrics
      .filter(m => m.duration > this.slowThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  getAverageResponseTime(endpoint?: string): number {
    const relevantMetrics = endpoint 
      ? this.metrics.filter(m => m.endpoint === endpoint)
      : this.metrics;

    if (relevantMetrics.length === 0) return 0;

    const total = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
    return Math.round(total / relevantMetrics.length);
  }

  getStats() {
    const now = Date.now();
    const lastHour = this.metrics.filter(m => now - m.timestamp < 3600000);
    
    return {
      totalRequests: this.metrics.length,
      requestsLastHour: lastHour.length,
      averageResponseTime: this.getAverageResponseTime(),
      slowRequests: this.getSlowRequests(5),
      errorRate: this.metrics.filter(m => m.status >= 400).length / this.metrics.length
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Middleware wrapper for API routes
export function withPerformanceMonitoring(handler: (...args: unknown[]) => Promise<unknown>, endpoint: string) {
  return async (...args: unknown[]) => {
    const startTime = Date.now();
    let status = 200;
    
    try {
      const result = await handler(...args);
      
      // Try to extract status from NextResponse
      const res = result as { status?: number }
      if (res?.status) {
        status = res.status;
      }
      
      return result;
    } catch (error) {
      status = 500;
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      performanceMonitor.logRequest(endpoint, duration, status);
    }
  };
}