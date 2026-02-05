/**
 * Retroactive Constraint Propagation Optimizer
 * 
 * Implements loss function optimization that works backward:
 * Given a desired conclusion, optimize the evidence selection
 * to support that conclusion while maintaining coherence.
 * 
 * Paradigm 2: Acausal Retrocohesion (Extension)
 */

import { v4 as uuidv4 } from 'uuid';
import { EvidenceItem, RetroactiveConstraint } from './acausal-search';

export interface OptimizationConfig {
  targetConclusion: string;
  constraints: RetroactiveConstraint[];
  evidencePool: EvidenceItem[];
  iterations: number;
  learningRate: number;
  convergenceThreshold: number;
}

export interface OptimizationStep {
  iteration: number;
  selectedEvidence: EvidenceItem[];
  loss: number;
  coherenceScore: number;
  constraintSatisfaction: number[];
  timestamp: Date;
}

export interface RetroactiveOptimizationResult {
  id: string;
  targetConclusion: string;
  optimizedEvidenceChain: EvidenceItem[];
  finalLoss: number;
  convergenceAchieved: boolean;
  iterationsNeeded: number;
  coherenceMetrics: {
    evidenceCoherence: number;
    conclusionSupport: number;
    constraintSatisfaction: number;
  };
  steps: OptimizationStep[];
}

/**
 * Loss Function for Retroactive Reasoning
 * 
 * Measures how well a set of evidence supports reaching the target conclusion
 * while satisfying all retroactive constraints.
 * 
 * Loss = weighted_sum([
 *   constraint_violation_loss,
 *   conclusion_support_loss,
 *   evidence_coherence_loss,
 *   paradox_penalty
 * ])
 */
class RetroactiveLossFunction {
  private targetConclusion: string;
  private constraints: RetroactiveConstraint[];

  constructor(targetConclusion: string, constraints: RetroactiveConstraint[]) {
    this.targetConclusion = targetConclusion;
    this.constraints = constraints;
  }

  /**
   * Calculate total loss for a given evidence selection
   */
  calculateLoss(
    selectedEvidence: EvidenceItem[],
    allEvidence: EvidenceItem[]
  ): {
    totalLoss: number;
    components: {
      constraintLoss: number;
      conclusionLoss: number;
      coherenceLoss: number;
      paradoxPenalty: number;
    };
  } {
    const constraintLoss = this.calculateConstraintViolation(selectedEvidence);
    const conclusionLoss = this.calculateConclusionSupport(selectedEvidence);
    const coherenceLoss = this.calculateCoherence(selectedEvidence);
    const paradoxPenalty = this.calculateParadoxPenalty(selectedEvidence, allEvidence);

    const weights = {
      constraint: 0.4,
      conclusion: 0.35,
      coherence: 0.2,
      paradox: 0.05
    };

    const totalLoss = 
      (constraintLoss * weights.constraint) +
      (conclusionLoss * weights.conclusion) +
      (coherenceLoss * weights.coherence) +
      (paradoxPenalty * weights.paradox);

    return {
      totalLoss: Math.max(0, Math.min(1, totalLoss)),
      components: {
        constraintLoss,
        conclusionLoss,
        coherenceLoss,
        paradoxPenalty
      }
    };
  }

  /**
   * How many constraints are violated?
   * Lower is better (0 = all constraints satisfied)
   */
  private calculateConstraintViolation(selectedEvidence: EvidenceItem[]): number {
    if (this.constraints.length === 0) return 0;

    let violationCount = 0;

    for (const constraint of this.constraints) {
      // Check if any selected evidence satisfies this constraint
      const satisfied = selectedEvidence.some(e =>
        constraint.affectsEvidenceIds.includes(e.id) &&
        e.relevance >= constraint.certainty
      );

      if (!satisfied) {
        violationCount++;
      }
    }

    return violationCount / this.constraints.length;
  }

  /**
   * How well does the evidence chain support the target conclusion?
   * Lower is better (0 = strongly supports)
   */
  private calculateConclusionSupport(selectedEvidence: EvidenceItem[]): number {
    if (selectedEvidence.length === 0) return 1;

    // Measure semantic similarity between evidence chain and conclusion
    const avgRelevance = selectedEvidence.reduce((sum, e) => sum + e.relevance, 0)
      / selectedEvidence.length;

    // Loss = 1 - relevance (inverted: high relevance = low loss)
    const relevanceLoss = 1 - avgRelevance;

    // Measure chain coherence (do pieces connect logically?)
    const coherenceBonus = this.measureChainCoherence(selectedEvidence);

    return Math.max(0, relevanceLoss - coherenceBonus * 0.2);
  }

  /**
   * How coherent is the evidence chain?
   * 0 = pieces don't connect, 1 = perfect logical flow
   */
  private calculateCoherence(selectedEvidence: EvidenceItem[]): number {
    if (selectedEvidence.length < 2) return 0.2; // Penalty for single evidence

    // Calculate how well consecutive pieces logically follow
    let coherenceSum = 0;

    for (let i = 0; i < selectedEvidence.length - 1; i++) {
      const current = selectedEvidence[i];
      const next = selectedEvidence[i + 1];

      // Estimate coherence between pieces
      // (In practice, use embedding similarity)
      const coherence = this.estimateConceptSimilarity(current.content, next.content);
      coherenceSum += coherence;
    }

    const avgCoherence = coherenceSum / (selectedEvidence.length - 1);

    // Loss = 1 - coherence
    return 1 - avgCoherence;
  }

  /**
   * Penalty for temporal paradoxes or circular reasoning
   */
  private calculateParadoxPenalty(
    selectedEvidence: EvidenceItem[],
    allEvidence: EvidenceItem[]
  ): number {
    // Detect if we're using evidence that would be derived from our conclusion
    // (This would create a causal loop)

    const selectedIds = new Set(selectedEvidence.map(e => e.id));

    let paradoxCount = 0;

    for (const evidence of selectedEvidence) {
      // Check if this evidence references information that would only be
      // known after reaching the conclusion
      if (evidence.content.toLowerCase().includes('future') ||
          evidence.content.toLowerCase().includes('will be')) {
        // High-risk evidence for creating temporal paradoxes
        paradoxCount++;
      }
    }

    // Return penalty (0 = no paradoxes, 1 = severe paradoxes)
    return Math.min(1, paradoxCount / Math.max(1, selectedEvidence.length));
  }

  /**
   * Estimate conceptual similarity between two text pieces
   * (Simplified: in practice use embedding vectors)
   */
  private estimateConceptSimilarity(text1: string, text2: string): number {
    // Extract key concepts (keywords)
    const concepts1 = this.extractConcepts(text1);
    const concepts2 = this.extractConcepts(text2);

    // Jaccard similarity
    const intersection = new Set(
      [...concepts1].filter(c => concepts2.has(c))
    );
    const union = new Set([...concepts1, ...concepts2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private extractConcepts(text: string): Set<string> {
    return new Set(
      text
        .toLowerCase()
        .split(/\W+/)
        .filter(word => word.length > 3)
    );
  }

  private measureChainCoherence(selectedEvidence: EvidenceItem[]): number {
    if (selectedEvidence.length < 2) return 0;

    let coherenceSum = 0;
    for (let i = 0; i < selectedEvidence.length - 1; i++) {
      const coherence = this.estimateConceptSimilarity(
        selectedEvidence[i].content,
        selectedEvidence[i + 1].content
      );
      coherenceSum += coherence;
    }

    return coherenceSum / (selectedEvidence.length - 1);
  }
}

/**
 * Gradient-based optimizer for evidence selection
 * Uses loss function to iteratively improve evidence chains
 */
export class RetroactiveOptimizer {
  private lossFunction: RetroactiveLossFunction;

  constructor(
    private config: OptimizationConfig
  ) {
    this.lossFunction = new RetroactiveLossFunction(
      config.targetConclusion,
      config.constraints
    );
  }

  /**
   * Run optimization to find best evidence chain supporting the conclusion
   */
  async optimize(): Promise<RetroactiveOptimizationResult> {
    const resultId = uuidv4();
    const steps: OptimizationStep[] = [];

    // Initialize with all evidence
    let selectedEvidence = [...this.config.evidencePool];
    let previousLoss = Infinity;

    for (let iteration = 0; iteration < this.config.iterations; iteration++) {
      // Calculate loss
      const lossResult = this.lossFunction.calculateLoss(
        selectedEvidence,
        this.config.evidencePool
      );

      // Record step
      const step: OptimizationStep = {
        iteration,
        selectedEvidence: [...selectedEvidence],
        loss: lossResult.totalLoss,
        coherenceScore: 1 - lossResult.components.coherenceLoss,
        constraintSatisfaction: this.config.constraints.map(c =>
          selectedEvidence.some(e => c.affectsEvidenceIds.includes(e.id))
            ? 1
            : 0
        ),
        timestamp: new Date()
      };

      steps.push(step);

      // Check convergence
      const improvement = previousLoss - lossResult.totalLoss;
      if (improvement < this.config.convergenceThreshold && iteration > 5) {
        return this.buildResult(
          resultId,
          selectedEvidence,
          lossResult.totalLoss,
          true,
          iteration,
          steps
        );
      }

      // Update selection based on gradient
      selectedEvidence = this.updateSelection(
        selectedEvidence,
        lossResult,
        iteration
      );

      previousLoss = lossResult.totalLoss;
    }

    // Didn't fully converge, but return best result
    const finalLoss = this.lossFunction.calculateLoss(
      selectedEvidence,
      this.config.evidencePool
    );

    return this.buildResult(
      resultId,
      selectedEvidence,
      finalLoss.totalLoss,
      false,
      this.config.iterations,
      steps
    );
  }

  /**
   * Update evidence selection based on loss gradient
   * (Simplified gradient-free approach: add/remove items with highest impact)
   */
  private updateSelection(
    currentSelection: EvidenceItem[],
    lossResult: any,
    iteration: number
  ): EvidenceItem[] {
    const newSelection = [...currentSelection];

    // Calculate impact of each evidence item
    const impacts = newSelection.map(evidence => {
      const withoutThis = newSelection.filter(e => e.id !== evidence.id);
      const lossWithout = this.lossFunction.calculateLoss(
        withoutThis,
        this.config.evidencePool
      );
      const impact = lossResult.totalLoss - lossWithout.totalLoss;
      return { evidence, impact };
    });

    // Remove low-impact items (gradient descent)
    const threshold = Math.max(0.01, 0.1 * (1 - iteration / this.config.iterations));
    const filtered = impacts
      .filter(({ impact }) => impact > -threshold)
      .map(({ evidence }) => evidence);

    // Add high-value evidence from pool if it helps
    const currentIds = new Set(filtered.map(e => e.id));
    const unused = this.config.evidencePool.filter(e => !currentIds.has(e.id));

    for (const candidate of unused.slice(0, 2)) {
      const withCandidate = [...filtered, candidate];
      const lossWithCandidate = this.lossFunction.calculateLoss(
        withCandidate,
        this.config.evidencePool
      );

      if (lossWithCandidate.totalLoss < lossResult.totalLoss - threshold) {
        filtered.push(candidate);
      }
    }

    return filtered;
  }

  private buildResult(
    resultId: string,
    evidence: EvidenceItem[],
    finalLoss: number,
    converged: boolean,
    iterations: number,
    steps: OptimizationStep[]
  ): RetroactiveOptimizationResult {
    // Calculate final metrics
    const coherenceLoss = this.lossFunction['calculateCoherence'](evidence);
    const conclusionLoss = this.lossFunction['calculateConclusionSupport'](evidence);
    const constraintLoss = this.lossFunction['calculateConstraintViolation'](evidence);

    return {
      id: resultId,
      targetConclusion: this.config.targetConclusion,
      optimizedEvidenceChain: evidence,
      finalLoss,
      convergenceAchieved: converged,
      iterationsNeeded: iterations,
      coherenceMetrics: {
        evidenceCoherence: 1 - coherenceLoss,
        conclusionSupport: 1 - conclusionLoss,
        constraintSatisfaction: 1 - constraintLoss
      },
      steps
    };
  }
}

/**
 * Helper: Optimize evidence chain for a paradigm conclusion
 */
export async function optimizeEvidenceForConclusion(
  targetConclusion: string,
  evidencePool: EvidenceItem[],
  constraints: RetroactiveConstraint[],
  options?: Partial<OptimizationConfig>
): Promise<RetroactiveOptimizationResult> {
  const config: OptimizationConfig = {
    targetConclusion,
    evidencePool,
    constraints,
    iterations: options?.iterations ?? 50,
    learningRate: options?.learningRate ?? 0.01,
    convergenceThreshold: options?.convergenceThreshold ?? 0.0001
  };

  const optimizer = new RetroactiveOptimizer(config);
  return optimizer.optimize();
}
