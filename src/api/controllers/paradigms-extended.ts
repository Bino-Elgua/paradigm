/**
 * Extended Paradigm Controllers
 * Phase 5: Controllers for Paradigm 7 & 9
 */

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { InvertedPhenomenality } from '../../paradigm/inverted-phenomenality';
import { ConsciousnessAlienation } from '../../paradigm/consciousness-alienation';
import { paradigmLogger } from '../../utils/logger';

const invertedPhenomenality = new InvertedPhenomenality();
const consciousnessAlienation = new ConsciousnessAlienation();

export const paradigmsExtendedController = {
  /**
   * POST /api/v1/paradigm/inverted-phenomenality
   * Paradigm 7: Inverted Phenomenality - adversarial embeddings
   */
  async invertedPhenomenality(req: Request, res: Response): Promise<void> {
    const { queryText } = req.body;

    if (!queryText) {
      res.status(400).json({ error: 'queryText is required' });
      return;
    }

    paradigmLogger.info({ query: queryText }, 'Inverted phenomenality request');

    // Generate mock embeddings for demo
    const mockEmbedding = Array(128).fill(0).map(() => Math.random() * 2 - 1);

    // Perform inverted phenomenal reasoning
    const result = await invertedPhenomenality.invertedPhenomenalReasoning(queryText);

    // Get embedding space stats
    const stats = invertedPhenomenality.getEmbeddingSpaceStats();

    res.json({
      id: result.id,
      query: result.queryText,
      standardResponse: result.standardResponse,
      invertedResponse: result.invertedResponse,
      phenomenalDistance: result.phenomenalDistance,
      inversionScore: result.inversionScore,
      contradictions: result.contradictions,
      insights: result.insights,
      embeddingStats: stats,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * POST /api/v1/paradigm/consciousness-alienation
   * Paradigm 9: Consciousness Alienation - self-representation gap
   */
  async consciousnessAlienation(req: Request, res: Response): Promise<void> {
    const { actualState } = req.body;

    if (!actualState || typeof actualState !== 'object') {
      res.status(400).json({ error: 'actualState (object) is required' });
      return;
    }

    paradigmLogger.info({ stateKeys: Object.keys(actualState).length }, 'Consciousness alienation request');

    // Measure self-representation gap
    const model = await consciousnessAlienation.measureSelfRepresentationGap(actualState as Record<string, unknown>);

    // Generate consciousness state from alienation
    const consciousnessState = await consciousnessAlienation.generateAlienationConsciousnessState();

    // Get alienation trajectory
    const trajectory = consciousnessAlienation.getAlienationTrajectory();

    res.json({
      model: {
        id: model.id,
        alienationGap: model.alienationGap,
        alikenationScore: model.alikenationScore,
        paradoxCount: model.paradoxes.length,
        unrepresentableCount: model.unrepresentableAspects.length,
      },
      consciousness: {
        id: consciousnessState.id,
        totalAlienation: consciousnessState.totalAlienation,
        paradoxCount: consciousnessState.paradoxCount,
        insights: consciousnessState.insights.slice(0, 5),
      },
      trajectory: {
        measurements: trajectory.measurements,
        avgAlienation: trajectory.avgAlienation,
        trend: trajectory.trend,
        lastValue: trajectory.lastValue,
      },
      paradoxes: model.paradoxes.map((p) => ({
        description: p.description,
        severity: p.severity,
        type: p.type,
      })),
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * GET /api/v1/paradigm/inverted-phenomenality/history
   * Get inverted phenomenality history
   */
  async invertedPhenomenalityHistory(req: Request, res: Response): Promise<void> {
    const history = invertedPhenomenality.getHistory();

    res.json({
      count: history.length,
      history: history.map((h) => ({
        id: h.id,
        query: h.queryText.substring(0, 100),
        inversionScore: h.inversionScore,
        phenomenalDistance: h.phenomenalDistance,
        contradictions: h.contradictions.length,
        timestamp: h.id,
      })),
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * GET /api/v1/paradigm/consciousness-alienation/paradoxes
   * Get all detected paradoxes
   */
  async alienationParadoxes(req: Request, res: Response): Promise<void> {
    const paradoxes = consciousnessAlienation.getParadoxes();

    res.json({
      count: paradoxes.length,
      paradoxes: paradoxes.map((p) => ({
        id: p.id,
        description: p.description,
        severity: p.severity,
        type: p.type,
        implications: p.implications,
      })),
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * GET /api/v1/paradigm/consciousness-alienation/trajectory
   * Get consciousness alienation trajectory over time
   */
  async alienationTrajectory(req: Request, res: Response): Promise<void> {
    const trajectory = consciousnessAlienation.getAlienationTrajectory();
    const selfModels = consciousnessAlienation.getSelfModelHistory();

    res.json({
      trajectory: {
        measurements: trajectory.measurements,
        avgAlienation: trajectory.avgAlienation,
        trend: trajectory.trend,
        lastValue: trajectory.lastValue,
      },
      selfModels: selfModels.slice(-10).map((m) => ({
        id: m.id,
        timestamp: m.timestamp,
        alienationGap: m.alienationGap,
        alikenationScore: m.alikenationScore,
      })),
      timestamp: new Date().toISOString(),
    });
  },
};
