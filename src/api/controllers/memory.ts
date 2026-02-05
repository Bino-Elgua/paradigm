/**
 * Memory System Controller
 * Phase 5: Persistent memory and learning endpoints
 */

import { Request, Response } from 'express';
import { memorySystem } from '../../persistence/memory-system';
import { paradigmLogger } from '../../utils/logger';

export const memoryController = {
  /**
   * POST /api/v1/memory/record-episode
   * Record a complete experience episode
   */
  async recordEpisode(req: Request, res: Response): Promise<void> {
    const {
      query,
      reasoning,
      outcome,
      success,
      duration,
      tokensUsed,
      paradigmScores,
    } = req.body;

    if (!query) {
      res.status(400).json({ error: 'query is required' });
      return;
    }

    paradigmLogger.info({ query: query.substring(0, 50), success }, 'Recording episode');

    const episode = await memorySystem.recordEpisode(
      query,
      reasoning || {},
      outcome || null,
      success || false,
      duration || 0,
      tokensUsed || 0,
      paradigmScores || {}
    );

    res.json({
      episodeId: episode.id,
      timestamp: episode.timestamp,
      success: episode.success,
      learnings: episode.learnings,
      message: 'Episode recorded successfully',
    });
  },

  /**
   * GET /api/v1/memory/summary
   * Get learning summary
   */
  async getSummary(req: Request, res: Response): Promise<void> {
    const summary = await memorySystem.generateLearningSummary();

    res.json({
      episodeCount: summary.episodeCount,
      totalDuration: summary.totalDuration,
      successRate: summary.successRate,
      semanticConcepts: summary.semanticConcepts,
      procedures: summary.procedures,
      topConcepts: summary.topConcepts,
      topProcedures: summary.topProcedures,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * POST /api/v1/memory/apply-learning
   * Apply a learned strategy
   */
  async applyLearning(req: Request, res: Response): Promise<void> {
    const { learningId } = req.body;

    if (!learningId) {
      res.status(400).json({ error: 'learningId is required' });
      return;
    }

    paradigmLogger.info({ learningId }, 'Applying learning');

    const success = await memorySystem.applyLearning(learningId);

    res.json({
      success,
      learningId,
      message: success ? 'Learning applied successfully' : 'Learning not found',
    });
  },

  /**
   * GET /api/v1/memory/procedures
   * Get recommended procedures for a task
   */
  async getProcedures(req: Request, res: Response): Promise<void> {
    const { taskType } = req.query;

    if (!taskType || typeof taskType !== 'string') {
      res.status(400).json({ error: 'taskType query parameter is required' });
      return;
    }

    paradigmLogger.info({ taskType }, 'Getting recommended procedures');

    const procedures = memorySystem.getRecommendedProcedures(taskType);

    res.json({
      taskType,
      procedureCount: procedures.length,
      procedures: procedures.map((p) => ({
        id: p.id,
        procedure: p.procedure,
        successRate: p.successRate,
        averageEfficiency: p.averageEfficiency,
        conditions: p.conditions,
      })),
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * POST /api/v1/memory/clear
   * Clear all memory (reset learning)
   */
  async clearMemory(req: Request, res: Response): Promise<void> {
    const { confirmClear } = req.body;

    if (confirmClear !== true) {
      res.status(400).json({ error: 'confirmClear: true is required to clear memory' });
      return;
    }

    paradigmLogger.warn({}, 'Clearing all memory');

    await memorySystem.clearMemory();

    res.json({
      message: 'Memory cleared successfully',
      timestamp: new Date().toISOString(),
    });
  },
};
