class RateLimiter {
  private requests: number[] = []
  private readonly maxRequests = 12 // Stay under 15/min limit for gemini-2.0-flash
  private readonly windowMs = 60000 // 1 minute

  canMakeRequest(): boolean {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.windowMs)
    return this.requests.length < this.maxRequests
  }

  recordRequest(): void {
    this.requests.push(Date.now())
  }

  getWaitTime(): number {
    if (this.canMakeRequest()) return 0
    const oldestRequest = this.requests[0]
    return this.windowMs - (Date.now() - oldestRequest)
  }
}

export const geminiRateLimiter = new RateLimiter()
