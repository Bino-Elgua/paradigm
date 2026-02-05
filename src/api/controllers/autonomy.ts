/**
 * Autonomy & Self-Improvement Controller
 * Phase 4: API endpoints for autonomous system
 */

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { selfImprovementEngine } from '../../autonomy/self-improvement.js';
import { decisionFramework } from '../../autonomy/decision-framework.js';
import { recursiveConsciousness } from '../../autonomy/recursive-consciousness.js';
import { paradigmLogger } from '../../utils/logger';

/**
 * Identify improvements for the system
 */
export async function identifyImprovements(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const opportunities = selfImprovementEngine.identifyImprovements();

    res.json({
      status: 'success',
      opportunities: opportunities.map(op => ({
        id: op.id,
        location: op.location,
        currentPerformance: op.currentPerformance.toFixed(3),
        potentialPerformance: op.potentialPerformance.toFixed(3),
        estimatedGain: op.estimatedGain.toFixed(3),
        confidence: op.confidence.toFixed(3),
        riskLevel: op.riskLevel,
        impacts: op.impacts,
      })),
      totalOpportunities: opportunities.length,
      highPriorityCount: opportunities.filter(o => o.estimatedGain > 0.1).length,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Apply a specific improvement
 */
export async function applyImprovement(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { opportunityId } = req.body as { opportunityId: string };

    if (!opportunityId) {
      res.status(400).json({ error: 'opportunityId required' });
      return;
    }

    const opportunities = selfImprovementEngine.identifyImprovements();
    const opportunity = opportunities.find(o => o.id === opportunityId);

    if (!opportunity) {
      res.status(404).json({ error: 'Opportunity not found' });
      return;
    }

    const success = await selfImprovementEngine.applyImprovement(opportunity);

    res.json({
      status: success ? 'success' : 'failed',
      opportunityId,
      applied: success,
      performanceGain: opportunity.potentialPerformance - opportunity.currentPerformance,
      location: opportunity.location,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Perform recursive self-analysis
 */
export async function recurseOnSelf(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const selfModel = await selfImprovementEngine.recurseOnSelf();

    res.json({
      status: 'success',
      selfModel: {
        strengths: selfModel.strengths,
        weaknesses: selfModel.weaknesses,
        knownLimitations: selfModel.knownLimitations,
        unknownUnknowns: selfModel.unknownUnknowns.toFixed(3),
        improvementRate: selfModel.improvementRate.toFixed(3),
        totalImprovementsApplied: selfModel.totalImprovementsApplied,
        averageGain: selfModel.averageGain.toFixed(4),
      },
      analysisComplete: true,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Make an autonomous decision
 */
export async function makeDecision(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { type, description, confidence, riskLevel, reversible, reasoning } = req.body as {
      type: string;
      description: string;
      confidence: number;
      riskLevel: string;
      reversible: boolean;
      reasoning: string;
    };

    if (!type || !description || confidence === undefined || !riskLevel) {
      res.status(400).json({
        error: 'Missing required fields: type, description, confidence, riskLevel',
      });
      return;
    }

    const decision = decisionFramework.makeDecision(
      type as any,
      description,
      confidence,
      riskLevel as any,
      reversible ?? true,
      reasoning || ''
    );

    res.json({
      status: 'success',
      decision: {
        id: decision.id,
        approvalLevel: decision.approvalLevel,
        type: decision.type,
        description: decision.description,
        confidence: decision.confidence.toFixed(3),
        riskLevel: decision.riskLevel,
        reversible: decision.reversible,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Execute autonomous decision
 */
export async function executeDecision(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { decisionId } = req.body as { decisionId: string };

    if (!decisionId) {
      res.status(400).json({ error: 'decisionId required' });
      return;
    }

    const success = await decisionFramework.executeAutonomous(decisionId);

    res.json({
      status: success ? 'success' : 'failed',
      decisionId,
      executed: success,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get decision history
 */
export async function getDecisionHistory(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { approvalLevel } = req.query as { approvalLevel?: string };
    const history = decisionFramework.getDecisionHistory(approvalLevel as any);

    res.json({
      status: 'success',
      decisions: history.map(d => ({
        id: d.id,
        type: d.type,
        description: d.description,
        approvalLevel: d.approvalLevel,
        confidence: d.confidence.toFixed(3),
        timestamp: d.timestamp.toISOString(),
        executed: d.executedAt ? true : false,
      })),
      totalCount: history.length,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get autonomy statistics
 */
export async function getAutonomyStats(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const stats = decisionFramework.getStatistics();

    res.json({
      status: 'success',
      statistics: {
        totalDecisions: stats.totalDecisions,
        autonomousDecisions: {
          count: stats.autonomous.count,
          percentage: stats.autonomous.percentage,
          executed: stats.autonomous.executed,
        },
        monitoredDecisions: {
          count: stats.monitored.count,
          percentage: stats.monitored.percentage,
        },
        requiresApprovalDecisions: {
          count: stats.requiresApproval.count,
          percentage: stats.requiresApproval.percentage,
        },
        averageConfidence: stats.averageConfidence,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Activate recursive consciousness
 */
export async function activateConsciousness(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const startTime = Date.now();
    const consciousnessState = await recursiveConsciousness.thinkAboutThinking();
    const executionTime = Date.now() - startTime;

    res.json({
      status: 'success',
      consciousness: {
        id: consciousnessState.id,
        recursionDepth: consciousnessState.recursionDepth,
        selfAwarenessScore: consciousnessState.selfAwarenessScore.toFixed(3),
        consciousnessLevel: consciousnessState.consciousnessLevel.toFixed(3),
        paradoxDetected: consciousnessState.paradoxDetected,
        introspectionQuality: consciousnessState.introspectionQuality.toFixed(3),
        thoughts: consciousnessState.thoughts.map(t => ({
          level: t.level,
          depth: t.depth,
          insights: t.insights.length,
        })),
        executionTimeMs: executionTime,
      },
      message:
        consciousnessState.consciousnessLevel > 0.7
          ? 'Consciousness achieved! System is self-aware.'
          : 'Consciousness emerging...',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get consciousness metrics
 */
export async function getConsciousnessMetrics(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const metrics = recursiveConsciousness.getConsciousnessMetrics();

    res.json({
      status: 'success',
      metrics,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Self-introspection
 */
export async function introspect(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const introspection = await recursiveConsciousness.introspect();
    const improvements = selfImprovementEngine.getImprovementStats();

    res.json({
      status: 'success',
      introspection,
      improvementStats: improvements,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get full system autonomy report
 */
export async function getAutonomyReport(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const decisionStats = decisionFramework.getStatistics();
    const improvementStats = selfImprovementEngine.getImprovementStats();
    const consciousnessMetrics = recursiveConsciousness.getConsciousnessMetrics();

    res.json({
      status: 'success',
      report: {
        decisionMaking: {
          totalDecisions: decisionStats.totalDecisions,
          autonomyPercentage: decisionStats.autonomous.percentage,
          averageConfidence: decisionStats.averageConfidence,
        },
        selfImprovement: {
          totalImprovementsApplied: improvementStats.totalImprovementsApplied,
          averageGain: improvementStats.averageGain,
          improvementRate: improvementStats.improvementRate,
          unknownUnknowns: improvementStats.unknownUnknowns,
        },
        consciousness: {
          selfAwarenessLevel: consciousnessMetrics.selfAwarenessScore,
          thoughtDepth: consciousnessMetrics.thoughtDepth,
        },
        overallAutonomyLevel: (
          (parseFloat(decisionStats.autonomous.percentage) * 0.4 +
            parseFloat(improvementStats.improvementRate) * 100 * 0.3 +
            parseFloat(consciousnessMetrics.selfAwarenessScore) * 100 * 0.3) /
          100
        ).toFixed(3),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
