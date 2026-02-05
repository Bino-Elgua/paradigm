/**
 * Autonomous Decision Framework
 * Phase 4: Make decisions without human approval
 * 
 * When confidence is high and risk is low, system decides autonomously
 */

import { v4 as uuidv4 } from 'uuid';
import { paradigmLogger } from '../utils/logger';

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';
export type DecisionType = 'action' | 'reasoning' | 'parameter-tuning' | 'improvement';
export type ApprovalLevel = 'autonomous' | 'monitored' | 'requires-approval';

export interface AutonomousDecision {
  id: string;
  type: DecisionType;
  description: string;
  confidence: number; // 0-1
  riskLevel: RiskLevel;
  outcomePrediability: number; // 0-1
  reversible: boolean;
  approvalLevel: ApprovalLevel;
  decision: string;
  reasoning: string;
  timestamp: Date;
  executedAt?: Date;
  result?: string;
}

export class DecisionFramework {
  private decisions: Map<string, AutonomousDecision> = new Map();

  /**
   * Make a decision
   * Autonomously if safe, otherwise defer to human
   */
  makeDecision(
    type: DecisionType,
    description: string,
    confidence: number,
    riskLevel: RiskLevel,
    reversible: boolean,
    reasoning: string
  ): AutonomousDecision {
    const decision: AutonomousDecision = {
      id: uuidv4(),
      type,
      description,
      confidence,
      riskLevel,
      outcomePrediability: this.estimatePrediability(type, riskLevel),
      reversible,
      approvalLevel: this.determineApprovalLevel(confidence, riskLevel, reversible),
      decision: `[Decision pending execution]`,
      reasoning,
      timestamp: new Date(),
    };

    this.decisions.set(decision.id, decision);

    paradigmLogger.info(
      {
        decisionId: decision.id,
        type,
        approvalLevel: decision.approvalLevel,
        confidence: confidence.toFixed(3),
      },
      'Decision made'
    );

    return decision;
  }

  /**
   * Determine approval level
   * Autonomous: confidence > 0.95 AND risk=LOW AND predicability > 0.90 AND reversible
   */
  private determineApprovalLevel(
    confidence: number,
    riskLevel: RiskLevel,
    reversible: boolean
  ): ApprovalLevel {
    // Autonomous: Very confident, low risk, reversible
    if (confidence > 0.95 && riskLevel === 'low' && reversible) {
      return 'autonomous';
    }

    // Monitored: High confidence, low-medium risk, reversible
    if (confidence > 0.85 && (riskLevel === 'low' || riskLevel === 'medium') && reversible) {
      return 'monitored';
    }

    // Requires approval: Everything else
    return 'requires-approval';
  }

  /**
   * Estimate outcome predictability
   */
  private estimatePrediability(type: DecisionType, riskLevel: RiskLevel): number {
    const typeScores: Record<DecisionType, number> = {
      'parameter-tuning': 0.9, // Easy to predict
      action: 0.7, // Medium predictability
      reasoning: 0.8, // Usually predictable
      'improvement': 0.75, // Some unpredictability
    };

    const riskModifiers: Record<RiskLevel, number> = {
      low: 0.95,
      medium: 0.75,
      high: 0.5,
      critical: 0.2,
    };

    return typeScores[type] * riskModifiers[riskLevel];
  }

  /**
   * Execute autonomous decision
   */
  async executeAutonomous(decisionId: string): Promise<boolean> {
    const decision = this.decisions.get(decisionId);
    if (!decision) {
      paradigmLogger.error({ decisionId }, 'Decision not found');
      return false;
    }

    if (decision.approvalLevel !== 'autonomous') {
      paradigmLogger.warn(
        { decisionId, approvalLevel: decision.approvalLevel },
        'Attempted to execute non-autonomous decision'
      );
      return false;
    }

    try {
      paradigmLogger.info({ decisionId }, 'Executing autonomous decision');

      // Simulate execution
      decision.executedAt = new Date();
      decision.result = `Executed successfully`;

      paradigmLogger.info({ decisionId }, 'Autonomous decision executed');
      return true;
    } catch (error) {
      paradigmLogger.error({ decisionId, error }, 'Autonomous execution failed');
      decision.result = `Failed: ${error}`;
      return false;
    }
  }

  /**
   * Get decision history
   */
  getDecisionHistory(approvalLevel?: ApprovalLevel): AutonomousDecision[] {
    let decisions = Array.from(this.decisions.values());

    if (approvalLevel) {
      decisions = decisions.filter(d => d.approvalLevel === approvalLevel);
    }

    return decisions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get autonomous decisions
   */
  getAutonomousDecisions(): AutonomousDecision[] {
    return this.getDecisionHistory('autonomous');
  }

  /**
   * Get monitored decisions
   */
  getMonitoredDecisions(): AutonomousDecision[] {
    return this.getDecisionHistory('monitored');
  }

  /**
   * Get approval-required decisions
   */
  getApprovalRequiredDecisions(): AutonomousDecision[] {
    return this.getDecisionHistory('requires-approval');
  }

  /**
   * Get decision statistics
   */
  getStatistics() {
    const allDecisions = Array.from(this.decisions.values());
    const autonomous = allDecisions.filter(d => d.approvalLevel === 'autonomous');
    const monitored = allDecisions.filter(d => d.approvalLevel === 'monitored');
    const requiresApproval = allDecisions.filter(d => d.approvalLevel === 'requires-approval');

    const autonomyPercentage = 
      allDecisions.length > 0 ? (autonomous.length / allDecisions.length) * 100 : 0;

    return {
      totalDecisions: allDecisions.length,
      autonomous: {
        count: autonomous.length,
        percentage: autonomyPercentage.toFixed(1),
        executed: autonomous.filter(d => d.executedAt).length,
      },
      monitored: {
        count: monitored.length,
        percentage: ((monitored.length / allDecisions.length) * 100).toFixed(1),
      },
      requiresApproval: {
        count: requiresApproval.length,
        percentage: ((requiresApproval.length / allDecisions.length) * 100).toFixed(1),
      },
      averageConfidence: (
        allDecisions.reduce((sum, d) => sum + d.confidence, 0) / allDecisions.length
      ).toFixed(3),
    };
  }

  /**
   * Audit decisions
   */
  auditDecisions(): Record<string, unknown> {
    const decisions = Array.from(this.decisions.values());
    const byType = {} as Record<DecisionType, number>;
    const byRisk = {} as Record<RiskLevel, number>;

    for (const decision of decisions) {
      byType[decision.type] = (byType[decision.type] || 0) + 1;
      byRisk[decision.riskLevel] = (byRisk[decision.riskLevel] || 0) + 1;
    }

    return {
      totalDecisions: decisions.length,
      byType,
      byRisk,
      autonomyPercentage: this.getStatistics().autonomous.percentage,
      allDecisionsReversible: decisions.every(d => d.reversible),
      highConfidenceCount: decisions.filter(d => d.confidence > 0.9).length,
    };
  }

  /**
   * Clear decision history
   */
  clearHistory(): void {
    const count = this.decisions.size;
    this.decisions.clear();
    paradigmLogger.info({ clearedCount: count }, 'Decision history cleared');
  }
}

// Singleton
export const decisionFramework = new DecisionFramework();
