// Error handling utilities for production
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Logging utility
export const logger = {
  error: (message: string, error?: Error, context?: Record<string, any>) => {
    const logData = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
      context,
    };

    if (import.meta.env.DEV) {
      console.error('❌', message, error, context);
    } else {
      // In production, you might want to send to a logging service
      console.error(JSON.stringify(logData));
    }
  },

  warn: (message: string, context?: Record<string, any>) => {
    const logData = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    if (import.meta.env.DEV) {
      console.warn('⚠️', message, context);
    } else {
      console.warn(JSON.stringify(logData));
    }
  },

  info: (message: string, context?: Record<string, any>) => {
    const logData = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    if (import.meta.env.DEV) {
      console.info('ℹ️', message, context);
    } else {
      console.info(JSON.stringify(logData));
    }
  },
};

// Async error wrapper
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error(
        `Error in ${context || fn.name}`,
        error instanceof Error ? error : new Error(String(error)),
        { args }
      );
      throw error;
    }
  }) as T;
}

// Retry utility for network requests
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        logger.error(`Failed after ${maxAttempts} attempts`, lastError);
        throw lastError;
      }

      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, {
        error: lastError.message,
      });

      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  throw lastError!;
} 