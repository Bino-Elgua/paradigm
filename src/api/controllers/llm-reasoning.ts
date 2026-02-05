/**
 * LLM Reasoning Controller
 * Phase 2: Integrates Claude API into query pipeline
 */

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { rlmCore } from '../../rlm/core.js';
import { claudeProvider } from '../../llm/claude-provider.js';
import { embeddingService } from '../../vectordb/embeddings.js';
import { queryLogger } from '../../utils/logger';

export interface LLMReasoningRequest {
  query: string;
  maxDepth?: number;
  budget?: number;
  model?: string;
}

export interface LLMReasoningResponse {
  id: string;
  query: string;
  status: 'success' | 'error' | 'partial';
  reasoning: {
    levels: Array<{
      level: number;
      tokensUsed: number;
      energyBurned: number;
      parasitismRate: number;
    }>;
    totalTokens: number;
    totalEnergy: number;
    recursionDepth: number;
  };
  result?: string;
  error?: string;
  executionTimeMs: number;
}

/**
 * Handle LLM reasoning requests
 */
export async function handleLLMReasoning(
  req: Request,
  res: Response
): Promise<void> {
  const startTime = Date.now();
  const requestId = uuidv4();

  try {
    const { query, maxDepth = 3, budget = 8192 } = req.body as LLMReasoningRequest;

    if (!query || typeof query !== 'string') {
      res.status(400).json({
        error: 'Invalid query: must be non-empty string',
      });
      return;
    }

    queryLogger.info(
      {
        requestId,
        queryLength: query.length,
        maxDepth,
        budget,
      },
      'LLM reasoning request'
    );

    // Execute recursive reasoning with Claude
    const hierarchy = await rlmCore.executeWithRecursion(
      query,
      budget,
      maxDepth
    );

    const response: LLMReasoningResponse = {
      id: requestId,
      query,
      status: 'success',
      reasoning: {
        levels: hierarchy.levels.map(level => ({
          level: level.level,
          tokensUsed: level.tokensConsumed,
          energyBurned: level.energyBurned,
          parasitismRate: level.tokensConsumed / (level.tokensAllocated || 1),
        })),
        totalTokens: hierarchy.totalTokens,
        totalEnergy: hierarchy.totalEnergy,
        recursionDepth: hierarchy.levels.length,
      },
      executionTimeMs: Date.now() - startTime,
    };

    queryLogger.info(
      {
        requestId,
        status: 'success',
        totalTokens: hierarchy.totalTokens,
        executionTime: response.executionTimeMs,
      },
      'LLM reasoning completed'
    );

    res.json(response);
  } catch (error) {
    const executionTime = Date.now() - startTime;

    queryLogger.error(
      {
        requestId,
        error: String(error),
        executionTime,
      },
      'LLM reasoning failed'
    );

    res.status(500).json({
      id: requestId,
      query: req.body.query || 'unknown',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      reasoning: {
        levels: [],
        totalTokens: 0,
        totalEnergy: 0,
        recursionDepth: 0,
      },
      executionTimeMs: executionTime,
    });
  }
}

/**
 * Get LLM model info
 */
export async function getModelInfo(
  req: Request,
  res: Response
): Promise<void> {
  const modelInfo = claudeProvider.getModelInfo();

  res.json({
    model: modelInfo.model,
    maxTokens: modelInfo.maxTokens,
    temperature: modelInfo.temperature,
    provider: 'Claude (Anthropic)',
    available: process.env.ANTHROPIC_API_KEY ? true : false,
  });
}

/**
 * Test LLM connection
 */
export async function testLLMConnection(
  req: Request,
  res: Response
): Promise<void> {
  try {
    queryLogger.info({}, 'Testing LLM connection');

    const response = await claudeProvider.generateResponse(
      'Say "LLM connection successful" in one sentence.'
    );

    res.json({
      status: 'connected',
      model: response.model,
      response: response.content.substring(0, 100),
      tokenUsage: response.tokenUsage,
    });
  } catch (error) {
    queryLogger.error({ error }, 'LLM connection test failed');

    res.status(500).json({
      status: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Generate embeddings for text
 */
export async function generateEmbeddings(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { texts } = req.body as { texts: string[] };

    if (!Array.isArray(texts) || texts.length === 0) {
      res.status(400).json({
        error: 'Invalid request: texts must be non-empty array',
      });
      return;
    }

    queryLogger.info(
      { textCount: texts.length },
      'Embedding generation request'
    );

    const embeddings = await embeddingService.generateBatchEmbeddings(texts);

    res.json({
      status: 'success',
      embeddings: embeddings.map(e => ({
        text: e.text.substring(0, 50) + (e.text.length > 50 ? '...' : ''),
        dimensions: e.dimensions,
        model: e.model,
      })),
      totalEmbeddings: embeddings.length,
    });
  } catch (error) {
    queryLogger.error({ error }, 'Embedding generation failed');

    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get embedding service stats
 */
export async function getEmbeddingStats(
  req: Request,
  res: Response
): Promise<void> {
  const stats = embeddingService.getCacheStats();

  res.json({
    cacheSize: stats.cacheSize,
    recentEmbeddings: stats.cacheEntries.map(e => 
      e.substring(0, 50) + (e.length > 50 ? '...' : '')
    ),
  });
}
