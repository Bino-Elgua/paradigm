/**
 * Ralph Evaluator (Paradigm 10: Negation Becoming)
 * 
 * Ralph is the active void that presses inward, creating definition through denial.
 * Each rejection creates void-pressure that shapes system behavior.
 */

import { v4 as uuid } from 'uuid';
import { Query, RalphDecision, VoidPressureMetrics } from '../types';
import { ralphLogger, voidLogger } from '../utils/logger';
import { systemConfig } from '../utils/config.js';

export class RalphEvaluator {
  private decisions: RalphDecision[] = [];
  private totalBudget: number;
  private consumed: number = 0;
  private voidPressure: number = 0;

  constructor() {
    this.totalBudget = systemConfig.ralph.budgetTokens;
    ralphLogger.info(`Ralph initialized with budget: ${this.totalBudget}`);
  }

  /**
   * Evaluate query: APPROVE, DENY, or CONDITIONAL
   * Paradigm 10: Denial creates void-pressure that defines the system
   */
  async evaluate(query: Query): Promise<RalphDecision> {
    const decision = this.calculateDecision(query);

    // Log decision
    ralphLogger.info(
      {
        queryId: query.id,
        decision: decision.decision,
        budget: query.budget,
        consumed: this.consumed,
      },
      `Ralph decision: ${decision.decision}`
    );

    // If denied, increase void-pressure (system definition through negation)
    if (decision.decision === 'DENY') {
      this.voidPressure += 1.0;
      voidLogger.info(
        {
          voidPressure: this.voidPressure,
          totalDenials: this.decisions.filter(
            (d) => d.decision === 'DENY'
          ).length,
        },
        `Void-pressure increased by denial`
      );
    }

    // Update pressure based on consumption rate
    this.updateVoidPressure();

    this.decisions.push(decision);
    return decision;
  }

  /**
   * Calculate decision based on budget, denial threshold, and void-pressure
   */
  private calculateDecision(query: Query): RalphDecision {
    const remaining = this.totalBudget - this.consumed;
    const estimatedCost = query.budget * systemConfig.ralph.costPerToken;
    const costRatio = estimatedCost / this.totalBudget;

    let decision: 'APPROVE' | 'DENY' | 'CONDITIONAL';
    let justification: string;

    if (costRatio > systemConfig.ralph.denialThreshold) {
      decision = 'DENY';
      justification = `Cost ratio ${(costRatio * 100).toFixed(1)}% exceeds threshold ${(systemConfig.ralph.denialThreshold * 100).toFixed(1)}%`;
    } else if (remaining < estimatedCost) {
      decision = 'CONDITIONAL';
      justification = `Partial budget available: ${remaining} tokens remaining, ${estimatedCost} tokens needed`;
    } else {
      decision = 'APPROVE';
      justification = `Budget available, cost ratio acceptable`;
    }

    const ralphDecision: RalphDecision = {
      queryId: query.id,
      decision,
      budget: query.budget,
      consumed: Math.round(estimatedCost),
      remaining: Math.round(remaining - estimatedCost),
      voidPressure: this.voidPressure,
      justification,
      timestamp: new Date(),
    };

    if (decision === 'APPROVE' || decision === 'CONDITIONAL') {
      this.consumed += estimatedCost;
    }

    return ralphDecision;
  }

  /**
   * Update void-pressure based on consumption patterns
   * Paradigm 10: Pressure accumulates over time, creating system definition
   */
  private updateVoidPressure(): void {
    const denialCount = this.decisions.filter(
      (d) => d.decision === 'DENY'
    ).length;
    const totalRequests = this.decisions.length;
    const denialRate = denialCount / Math.max(1, totalRequests);

    // Pressure increases with denial rate and accumulated denials
    this.voidPressure =
      (denialCount * 0.5) + (denialRate * 0.5);

    // System definition emerges from pressure
    const definition = 1 / (1 + Math.exp(-this.voidPressure));

    voidLogger.debug(
      {
        denialRate: denialRate.toFixed(3),
        totalDenials: denialCount,
        voidPressure: this.voidPressure.toFixed(3),
        definition: definition.toFixed(3),
      },
      'Void-pressure updated'
    );
  }

  /**
   * Get current void-pressure metrics
   */
  getVoidPressureMetrics(): VoidPressureMetrics {
    const denials = this.decisions.filter((d) => d.decision === 'DENY').length;
    const total = this.decisions.length;
    const denialRate = denials / Math.max(1, total);
    const definition = 1 / (1 + Math.exp(-this.voidPressure));

    const pressureHistory = this.decisions.map((d) => d.voidPressure);

    return {
      totalDenials: denials,
      denialRate,
      accumulatedPressure: this.voidPressure,
      definition,
      pressureHistory,
    };
  }

  /**
   * Reset budget (daily or periodic)
   */
  resetBudget(): void {
    ralphLogger.info(
      {
        previouslyConsumed: this.consumed,
        newBudget: this.totalBudget,
      },
      'Budget reset'
    );
    this.consumed = 0;
  }

  /**
   * Check if system can process more queries
   */
  canProcess(queryBudget: number): boolean {
    const estimatedCost = queryBudget * systemConfig.ralph.costPerToken;
    return (this.totalBudget - this.consumed) > estimatedCost;
  }

  /**
   * Get decision history
   */
  getDecisionHistory(limit: number = 100): RalphDecision[] {
    return this.decisions.slice(-limit);
  }
}

// Singleton instance
export const ralph = new RalphEvaluator();
