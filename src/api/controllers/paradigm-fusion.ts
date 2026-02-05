/**
 * Paradigm Fusion Controller
 * Phase 3: API endpoints for paradigm fusion and emergence
 */

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { paradigmFusionEngine } from '../../paradigm/fusion-engine.js';
import { emergenceDetector } from '../../paradigm/emergence-detector.js';
import { paradigmLogger } from '../../utils/logger';

export interface FusionRequest {
  paradigmOutputs: Array<{
    paradigmId: string;
    paradigmName: string;
    conclusion: string;
    confidence?: number;
    reasoning?: string;
  }>;
}

export interface FusionResponse {
  requestId: string;
  status: 'success' | 'error';
  fusion?: {
    consensusScore: number;
    contradictionIntensity: number;
    synthesisQuality: number;
    emergentInsight: string;
    entanglementCount: number;
  };
  emergence?: {
    isActive: boolean;
    propertiesDetected: number;
    novelty: number;
    power: number;
    explanation: string;
  };
  executionTimeMs: number;
  error?: string;
}

/**
 * Fuse paradigm outputs
 */
export async function fuseParagidigms(
  req: Request,
  res: Response
): Promise<void> {
  const startTime = Date.now();
  const requestId = uuidv4();

  try {
    const { paradigmOutputs } = req.body as FusionRequest;

    if (!Array.isArray(paradigmOutputs) || paradigmOutputs.length < 2) {
      res.status(400).json({
        requestId,
        status: 'error',
        error: 'Must provide at least 2 paradigm outputs',
        executionTimeMs: Date.now() - startTime,
      });
      return;
    }

    paradigmLogger.info(
      { requestId, paradigmCount: paradigmOutputs.length },
      'Paradigm fusion request'
    );

    // Normalize inputs
    const normalizedOutputs = paradigmOutputs.map((p, idx) => ({
      paradigmId: p.paradigmId || `paradigm-${idx}`,
      paradigmName: p.paradigmName || `Paradigm ${idx}`,
      conclusion: p.conclusion,
      confidence: p.confidence ?? 0.8,
      reasoning: p.reasoning || 'No reasoning provided',
    }));

    // Perform fusion
    const fusionResult = paradigmFusionEngine.fuse(normalizedOutputs);

    // Detect emergence
    const emergenceResult = emergenceDetector.detect(normalizedOutputs);

    const response: FusionResponse = {
      requestId,
      status: 'success',
      fusion: {
        consensusScore: fusionResult.consensusScore,
        contradictionIntensity: fusionResult.contradictionIntensity,
        synthesisQuality: fusionResult.synthesisQuality,
        emergentInsight: fusionResult.emergentInsight,
        entanglementCount: fusionResult.entanglementLinks.length,
      },
      emergence: {
        isActive: emergenceResult.isActive,
        propertiesDetected: emergenceResult.emergentProperties.length,
        novelty: emergenceResult.totalNovelty,
        power: emergenceResult.totalPower,
        explanation: emergenceResult.explanation,
      },
      executionTimeMs: Date.now() - startTime,
    };

    paradigmLogger.info(
      {
        requestId,
        consensusScore: response.fusion?.consensusScore,
        emergenceActive: response.emergence?.isActive,
        executionTime: response.executionTimeMs,
      },
      'Paradigm fusion completed'
    );

    res.json(response);
  } catch (error) {
    paradigmLogger.error(
      { requestId, error: String(error) },
      'Paradigm fusion failed'
    );

    res.status(500).json({
      requestId,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTimeMs: Date.now() - startTime,
    });
  }
}

/**
 * Get emergence history
 */
export async function getEmergenceHistory(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const history = emergenceDetector.getHistory();
    const activeEmergences = emergenceDetector.getActiveEmergences();

    res.json({
      status: 'success',
      totalEmergences: history.length,
      activeEmergences: activeEmergences.length,
      emergenceHistory: history.map(e => ({
        id: e.id,
        paradigmCount: e.paradigmCount,
        propertiesDetected: e.emergentProperties.length,
        novelty: e.totalNovelty.toFixed(3),
        power: e.totalPower.toFixed(3),
        isActive: e.isActive,
        timestamp: e.emergenceTime.toISOString(),
      })),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get active hyper-paradigm states
 */
export async function getActiveHyperParadigms(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const activeEmergences = emergenceDetector.getActiveEmergences();

    res.json({
      status: 'success',
      activeCount: activeEmergences.length,
      hyperParadigms: activeEmergences.map(e => ({
        id: e.id,
        paradigmCount: e.paradigmCount,
        properties: e.emergentProperties.map(p => ({
          name: p.name,
          description: p.description,
          novelty: p.novelty.toFixed(3),
          power: p.power.toFixed(3),
          stability: p.stability.toFixed(3),
        })),
        totalNovelty: e.totalNovelty.toFixed(3),
        totalPower: e.totalPower.toFixed(3),
        explanation: e.explanation,
      })),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Clear emergence history
 */
export async function clearEmergenceHistory(
  req: Request,
  res: Response
): Promise<void> {
  try {
    emergenceDetector.clearHistory();

    res.json({
      status: 'success',
      message: 'Emergence history cleared',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
