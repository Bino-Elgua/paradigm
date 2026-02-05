/**
 * Query Validation Middleware
 * 
 * Validates incoming query requests
 * Phase 2: Week 2 Implementation
 */

import { Request, Response, NextFunction } from 'express';

export const validateQuery = (req: Request, res: Response, next: NextFunction): void => {
  const { query, reasoning_type, max_depth, timeout_ms } = req.body;

  // Validate query field
  if (!query) {
    res.status(400).json({
      error: {
        code: 'MISSING_QUERY',
        message: 'Query field is required',
        details: { field: 'query' }
      }
    });
    return;
  }

  if (typeof query !== 'string') {
    res.status(400).json({
      error: {
        code: 'INVALID_QUERY_TYPE',
        message: 'Query must be a string',
        details: { field: 'query', type: typeof query }
      }
    });
    return;
  }

  if (query.length < 10) {
    res.status(400).json({
      error: {
        code: 'QUERY_TOO_SHORT',
        message: 'Query must be at least 10 characters',
        details: { field: 'query', min_length: 10, provided_length: query.length }
      }
    });
    return;
  }

  if (query.length > 10000) {
    res.status(400).json({
      error: {
        code: 'QUERY_TOO_LONG',
        message: 'Query must not exceed 10000 characters',
        details: { field: 'query', max_length: 10000, provided_length: query.length }
      }
    });
    return;
  }

  // Validate reasoning_type
  if (reasoning_type && !['forward', 'backward', 'acausal'].includes(reasoning_type)) {
    res.status(400).json({
      error: {
        code: 'INVALID_REASONING_TYPE',
        message: 'Reasoning type must be forward, backward, or acausal',
        details: { field: 'reasoning_type', provided: reasoning_type }
      }
    });
    return;
  }

  // Validate max_depth
  if (max_depth !== undefined) {
    if (!Number.isInteger(max_depth) || max_depth < 1 || max_depth > 5) {
      res.status(400).json({
        error: {
          code: 'INVALID_MAX_DEPTH',
          message: 'Max depth must be an integer between 1 and 5',
          details: { field: 'max_depth', range: '1-5', provided: max_depth }
        }
      });
      return;
    }
  }

  // Validate timeout
  if (timeout_ms !== undefined) {
    if (!Number.isInteger(timeout_ms) || timeout_ms < 1000 || timeout_ms > 60000) {
      res.status(400).json({
        error: {
          code: 'INVALID_TIMEOUT',
          message: 'Timeout must be between 1000 and 60000 milliseconds',
          details: { field: 'timeout_ms', range: '1000-60000', provided: timeout_ms }
        }
      });
      return;
    }
  }

  // All validations passed
  next();
};
