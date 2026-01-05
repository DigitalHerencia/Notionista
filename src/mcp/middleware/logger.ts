/**
 * Logger middleware
 * 
 * Logs MCP requests and responses for debugging.
 */

import type { McpMiddleware, McpRequest, McpResponse } from "../../core/types/mcp.js";

export interface LoggerOptions {
  enabled?: boolean;
  logRequests?: boolean;
  logResponses?: boolean;
  logErrors?: boolean;
  logger?: Logger;
}

export interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

const defaultLogger: Logger = {
  debug: (message, data) => console.debug(`[MCP] ${message}`, data ?? ""),
  info: (message, data) => console.info(`[MCP] ${message}`, data ?? ""),
  warn: (message, data) => console.warn(`[MCP] ${message}`, data ?? ""),
  error: (message, data) => console.error(`[MCP] ${message}`, data ?? ""),
};

export function createLoggerMiddleware(options: LoggerOptions = {}): McpMiddleware {
  const {
    enabled = true,
    logRequests = true,
    logResponses = true,
    logErrors = true,
    logger = defaultLogger,
  } = options;

  return async (req: McpRequest, next: () => Promise<McpResponse>): Promise<McpResponse> => {
    if (!enabled) {
      return next();
    }

    if (logRequests) {
      logger.debug(`Request: ${req.tool}`, {
        params: req.params,
        timestamp: req.timestamp,
      });
    }

    const startTime = Date.now();

    try {
      const response = await next();

      if (logResponses) {
        logger.debug(`Response: ${req.tool}`, {
          duration: response.duration,
          timestamp: response.timestamp,
        });
      }

      return response;
    } catch (error) {
      if (logErrors) {
        logger.error(`Error: ${req.tool}`, {
          error: error instanceof Error ? error.message : String(error),
          duration: Date.now() - startTime,
        });
      }
      throw error;
    }
  };
}
