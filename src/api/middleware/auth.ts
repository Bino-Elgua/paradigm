/**
 * Authentication Middleware
 * 
 * Validates Bearer token authentication
 * Phase 2: Week 2 Implementation
 */

import { Request, Response, NextFunction } from 'express';

// Mock API key store (in production, query database)
const validApiKeys = new Set([
  'sk-paradigm-test1234567890abcdef12345',
  'sk-paradigm-demo1234567890abcdef123456'
]);

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        apiKey: string;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      error: {
        code: 'MISSING_AUTH',
        message: 'Authorization header is required',
        details: { expected: 'Bearer sk-paradigm-...' }
      }
    });
    return;
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/);
  if (!match) {
    res.status(401).json({
      error: {
        code: 'INVALID_AUTH_FORMAT',
        message: 'Authorization header must be in format: Bearer <token>',
        details: { provided: authHeader.substring(0, 20) + '...' }
      }
    });
    return;
  }

  const token = match[1];

  // Validate token format
  if (!token.startsWith('sk-paradigm-')) {
    res.status(401).json({
      error: {
        code: 'INVALID_TOKEN_FORMAT',
        message: 'API token must start with sk-paradigm-'
      }
    });
    return;
  }

  // Check against valid keys (mock)
  if (!validApiKeys.has(token)) {
    res.status(403).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired API token'
      }
    });
    return;
  }

  // Attach user to request
  (req as any).user = {
    id: `user_${token.substring(0, 20)}`,
    apiKey: token
  };

  next();
};
