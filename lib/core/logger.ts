// File: src/lib/logger.ts
// Tiny logger wrapper — swap easily for pino/winston in future.
// Usage:
//  import logger from "@/lib/core/logger";
//  logger.info("message", { extra: 1 });

const isProd = process.env.NODE_ENV === "production";

function timestamp() {
  return new Date().toISOString();
}

const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: "info", time: timestamp(), msg, ...meta }));
  },
  warn: (msg: string, meta?: Record<string, unknown>) => {
    console.warn(JSON.stringify({ level: "warn", time: timestamp(), msg, ...meta }));
  },
  error: (msg: string, meta?: Record<string, unknown>) => {
    console.error(JSON.stringify({ level: "error", time: timestamp(), msg, ...meta }));
  },
  debug: (msg: string, meta?: Record<string, unknown>) => {
    if (!isProd) {
      console.debug(JSON.stringify({ level: "debug", time: timestamp(), msg, ...meta }));
    }
  },
};

export default logger;
