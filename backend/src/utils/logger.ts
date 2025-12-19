// Custom logger utility to control logging verbosity
interface LoggerConfig {
  enabled: boolean
  level: 'debug' | 'info' | 'warn' | 'error'
  suppressPatterns: RegExp[]
  throttle: {
    [key: string]: {
      interval: number
      lastLogged: number
    }
  }
}

class Logger {
  private config: LoggerConfig = {
    enabled: process.env.NODE_ENV === 'development',
    level: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
    suppressPatterns: [
      /GET \/api\/auth\/session/,
      /GET \/api\/users\/profile/,
      /Compiled in/,
    ],
    throttle: {}
  }

  private levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  private safeStringify(args: unknown[]): string {
    try {
      return args.map(arg => {
        if (typeof arg === 'string') return arg
        if (typeof arg === 'number' || typeof arg === 'boolean') return String(arg)
        if (arg === null) return 'null'
        if (arg === undefined) return 'undefined'
        try {
          return JSON.stringify(arg)
        } catch {
          return '[Circular or Complex Object]'
        }
      }).join(' ')
    } catch {
      return '[Unable to stringify arguments]'
    }
  }

  private shouldLog(level: keyof typeof this.levels, message: string): boolean {
    if (!this.config.enabled) return false
    
    // Check log level
    if (this.levels[level] < this.levels[this.config.level]) return false
    
    // Check suppression patterns
    for (const pattern of this.config.suppressPatterns) {
      if (pattern.test(message)) {
        // Check throttling
        const key = pattern.toString()
        const throttleConfig = this.config.throttle[key]
        
        if (!throttleConfig) {
          this.config.throttle[key] = {
            interval: 5000, // 5 seconds default
            lastLogged: 0
          }
        }
        
        const now = Date.now()
        const timeSinceLastLog = now - this.config.throttle[key].lastLogged
        
        if (timeSinceLastLog < this.config.throttle[key].interval) {
          return false
        }
        
        this.config.throttle[key].lastLogged = now
      }
    }
    
    return true
  }

  private internallyLog(logFunc: (...args: unknown[]) => unknown, level: keyof typeof this.levels, args: unknown[]) {
    try {
      const message = this.safeStringify(args);
      if (this.shouldLog(level, message)) {
        logFunc(...args)
      }
    } catch (error) {
      // Fallback in case of unexpected issue in logging mechanism
      console.error("[Logger Error] An error occurred while logging:", error);
    }
  }

  debug(...args: unknown[]) {
    this.internallyLog(console.debug, 'debug', args);
  }

  info(...args: unknown[]) {
    this.internallyLog(console.info, 'info', args);
  }

  warn(...args: unknown[]) {
    this.internallyLog(console.warn, 'warn', args);
  }

  error(...args: unknown[]) {
    this.internallyLog(console.error, 'error', args);
  }

  log(...args: unknown[]) {
    this.internallyLog(console.log, 'info', args);
  }
}

export const logger = new Logger()

// Optional: Override global console methods (use with caution)
export function overrideConsole() {
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  }

  console.log = (...args) => logger.log(...args)
  console.info = (...args) => logger.info(...args)
  console.warn = (...args) => logger.warn(...args)
  console.error = (...args) => logger.error(...args)
  console.debug = (...args) => logger.debug(...args)

  // Return a function to restore original console
  return () => {
    console.log = originalConsole.log
    console.info = originalConsole.info
    console.warn = originalConsole.warn
    console.error = originalConsole.error
    console.debug = originalConsole.debug
  }
}
