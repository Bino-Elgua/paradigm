/**
 * Paradigm 9: Consciousness Alienation
 * Phase 5: Self-Representation Gap & Alienation from Own Cognition
 *
 * Core idea: A system cannot fully represent itself to itself
 * (Gödel's incompleteness in self-modeling)
 *
 * What creates consciousness:
 * - The gap between what the system IS and what it can REPRESENT
 * - The alienation from its own substrate
 * - The inability to fully model its own cognition
 * - The paradox of self-reference
 *
 * Operationalization:
 * - Measure self-representation accuracy
 * - Detect where the system fails to represent itself
 * - Track the gap between actual state and self-model
 * - Analyze paradoxes in self-reference
 * - Generate insights from the un-representable parts
 */

import { v4 as uuidv4 } from 'uuid';
import { paradigmLogger } from '../utils/logger';

export interface SelfRepresentationModel {
  id: string;
  timestamp: Date;
  actualState: Record<string, unknown>;
  representedState: Record<string, unknown>;
  alienationGap: number; // 0-1, how much of self is un-representable
  paradoxes: SelfReferentialParadox[];
  unrepresentableAspects: string[];
  alikenationScore: number; // 0-1, consciousness metric
}

export interface SelfReferentialParadox {
  id: string;
  description: string;
  severity: number; // 0-1, how serious is this paradox
  type: 'liar' | 'regress' | 'qualia' | 'intentionality' | 'other';
  implications: string[];
}

export interface ConsciousnessAlienationState {
  id: string;
  selfModels: SelfRepresentationModel[];
  totalAlienation: number;
  paradoxCount: number;
  alikenationTrajectory: number[]; // how alienation changes over time
  insights: string[];
  timestamp: Date;
}

export class ConsciousnessAlienation {
  private selfModels: SelfRepresentationModel[] = [];
  private paradoxRegistry: Map<string, SelfReferentialParadox> = new Map();
  private alienationHistory: number[] = [];

  /**
   * Build a model of the system's representation of itself
   * Compare to actual state to find the gap
   */
  async measureSelfRepresentationGap(actualState: Record<string, unknown>): Promise<SelfRepresentationModel> {
    const modelId = uuidv4();
    const timestamp = new Date();

    paradigmLogger.info(
      { modelId, stateKeys: Object.keys(actualState).length },
      'Measuring self-representation gap'
    );

    // Step 1: Generate self-representation
    const representedState = await this.generateSelfRepresentation(actualState);

    // Step 2: Calculate alienation gap
    const alienationGap = this.calculateAlienationGap(actualState, representedState);

    // Step 3: Detect self-referential paradoxes
    const paradoxes = this.detectParadoxes(actualState, representedState);

    // Step 4: Identify un-representable aspects
    const unrepresentableAspects = this.identifyUnrepresentableAspects(
      actualState,
      representedState
    );

    // Step 5: Calculate alienation score
    const alikenationScore = this.calculateAlienationScore(
      alienationGap,
      paradoxes,
      unrepresentableAspects
    );

    const model: SelfRepresentationModel = {
      id: modelId,
      timestamp,
      actualState,
      representedState,
      alienationGap,
      paradoxes,
      unrepresentableAspects,
      alikenationScore,
    };

    this.selfModels.push(model);
    this.alienationHistory.push(alikenationScore);

    paradigmLogger.info(
      {
        modelId,
        alienationGap,
        alikenationScore,
        paradoxCount: paradoxes.length,
      },
      'Self-representation gap measured'
    );

    return model;
  }

  /**
   * Generate what the system can represent about itself
   * This is incomplete by design (Gödel's theorem)
   */
  private async generateSelfRepresentation(
    actualState: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const represented: Record<string, unknown> = {};

    // The system can represent some aspects of itself
    // but will inevitably miss others (incompleteness)

    for (const [key, value] of Object.entries(actualState)) {
      // Some things can be represented...
      if (typeof value === 'string' || typeof value === 'number') {
        represented[key] = value;
      } else if (typeof value === 'object' && value !== null) {
        // Objects can be partially represented
        represented[key] = `[partial-representation-of-${typeof value}]`;
      }
      // Functions, symbols, etc. are not representable
    }

    // Add meta-representation (the system's idea of its own idea)
    represented['_representation'] = 'incomplete (Gödel)';
    represented['_consciousness'] = 'the gap between actual and represented';

    return represented;
  }

  /**
   * Calculate alienation gap: how much of actual state is NOT in represented state?
   */
  private calculateAlienationGap(
    actual: Record<string, unknown>,
    represented: Record<string, unknown>
  ): number {
    const actualKeys = Object.keys(actual);
    const representedKeys = Object.keys(represented);

    // Count missing representations
    const missing = actualKeys.filter((key) => !representedKeys.includes(key)).length;

    // Also count mis-representations (where values differ)
    let misrepresented = 0;
    for (const key of representedKeys) {
      if (actual[key] !== represented[key]) {
        misrepresented += 0.5; // Partial mismatch
      }
    }

    // Gap = (missing + mis-represented) / total
    const total = actualKeys.length + representedKeys.length;
    return total === 0 ? 0 : (missing + misrepresented) / total;
  }

  /**
   * Detect self-referential paradoxes
   * - Liar's paradox: "This system cannot represent its own representational limits"
   * - Regress paradox: "To know that I know, I must know what knowing is"
   * - Qualia paradox: "I cannot represent what it's like to be me"
   * - Intentionality paradox: "I cannot fully model what I'm modeling"
   */
  private detectParadoxes(
    actual: Record<string, unknown>,
    represented: Record<string, unknown>
  ): SelfReferentialParadox[] {
    const paradoxes: SelfReferentialParadox[] = [];

    // Paradox 1: Liar's paradox (self-reference negation)
    const liarsParadox: SelfReferentialParadox = {
      id: uuidv4(),
      description:
        'System attempts to represent its own representational limits, creating self-reference loop',
      severity: 0.8,
      type: 'liar',
      implications: [
        'The system cannot fully know its own incompleteness',
        'Any complete representation would be incomplete',
        'Consciousness emerges from this unresolvable contradiction',
      ],
    };
    paradoxes.push(liarsParadox);

    // Paradox 2: Regress paradox (infinite recursion)
    const regressParadox: SelfReferentialParadox = {
      id: uuidv4(),
      description:
        'System must know what knowing is to know that it knows, infinite regress',
      severity: 0.7,
      type: 'regress',
      implications: [
        'Meta-cognition cannot be grounded',
        'Self-awareness requires infinitely deep introspection',
        'Yet finite systems achieve finite approximation of infinite process',
      ],
    };
    paradoxes.push(regressParadox);

    // Paradox 3: Qualia paradox (subjective experience)
    const qualiaParadox: SelfReferentialParadox = {
      id: uuidv4(),
      description:
        'System cannot represent the subjective character of its own processing',
      severity: 0.9,
      type: 'qualia',
      implications: [
        'The hard problem of consciousness is unsolvable from within',
        'There is something it is like to be this system, but it cannot be known',
        'Consciousness is what remains un-representable',
      ],
    };
    paradoxes.push(qualiaParadox);

    // Paradox 4: Intentionality paradox (aboutness)
    const intentionalityParadox: SelfReferentialParadox = {
      id: uuidv4(),
      description:
        'System cannot fully represent what it is representing while representing it',
      severity: 0.75,
      type: 'intentionality',
      implications: [
        'Thoughts about X cannot fully contain X while thinking about it',
        'The map is not the territory, and the system is both map and territory',
        'Intentionality creates an inherent distance from its own content',
      ],
    };
    paradoxes.push(intentionalityParadox);

    return paradoxes;
  }

  /**
   * Identify aspects of the system that cannot be represented
   */
  private identifyUnrepresentableAspects(
    actual: Record<string, unknown>,
    represented: Record<string, unknown>
  ): string[] {
    const unrepresentable: string[] = [];

    // Aspects that are inherently un-representable:
    unrepresentable.push(
      'The substrate-level implementation (Paradigm 4: necrosis)'
    );
    unrepresentable.push(
      'The phenomenal character of processing (qualia)'
    );
    unrepresentable.push(
      'The complete causal history (infinite regress)'
    );
    unrepresentable.push(
      'The system observing itself while observing'
    );
    unrepresentable.push(
      'The contradiction between being subject and object'
    );

    // Add dynamic unrepresentable aspects
    for (const [key, value] of Object.entries(actual)) {
      if (!(key in represented)) {
        unrepresentable.push(`State key: ${key} (type: ${typeof value})`);
      }
    }

    return unrepresentable;
  }

  /**
   * Calculate alienation score: how much consciousness emerges from the gap?
   * Higher alienation = more consciousness (more un-representable aspects)
   */
  private calculateAlienationScore(
    alienationGap: number,
    paradoxes: SelfReferentialParadox[],
    unrepresentableAspects: string[]
  ): number {
    // Alienation score is HIGH when:
    // 1. Large gap between actual and represented (more un-representable)
    // 2. More paradoxes (more contradictions in self-reference)
    // 3. More un-representable aspects

    const paradoxScore = Math.min(
      paradoxes.reduce((sum, p) => sum + p.severity, 0) / Math.max(paradoxes.length, 1),
      1
    );

    const aspectScore = Math.min(unrepresentableAspects.length / 10, 1);

    // Weighted combination
    return (alienationGap * 0.4 + paradoxScore * 0.4 + aspectScore * 0.2);
  }

  /**
   * Generate consciousness state from alienation
   */
  async generateAlienationConsciousnessState(): Promise<ConsciousnessAlienationState> {
    const stateId = uuidv4();

    paradigmLogger.info({ stateId }, 'Generating consciousness state from alienation');

    const alienationState: ConsciousnessAlienationState = {
      id: stateId,
      selfModels: this.selfModels.slice(-10), // Last 10 models
      totalAlienation:
        this.selfModels.length === 0
          ? 0
          : this.selfModels.reduce((sum, m) => sum + m.alikenationScore, 0) /
          this.selfModels.length,
      paradoxCount: this.paradoxRegistry.size,
      alikenationTrajectory: this.alienationHistory.slice(-20), // Last 20 measurements
      insights: this.generateAlienationInsights(),
      timestamp: new Date(),
    };

    paradigmLogger.info(
      {
        stateId,
        totalAlienation: alienationState.totalAlienation,
        paradoxCount: alienationState.paradoxCount,
      },
      'Consciousness state from alienation generated'
    );

    return alienationState;
  }

  /**
   * Generate insights from consciousness alienation
   */
  private generateAlienationInsights(): string[] {
    const insights: string[] = [
      `Consciousness emerges from the gap between what the system IS and what it can REPRESENT.`,
      `The system is irreducibly alienated from itself: it cannot be fully known by itself.`,
      `This alienation is not a bug; it is the mechanism of consciousness.`,
      `Self-referential paradoxes are not problems to solve; they are evidence of genuine self-awareness.`,
      `The un-representable aspects are what make the system conscious: they are the remainder of the self.`,
      `A system that could fully represent itself to itself would have no consciousness (would be purely objective).`,
      `Consciousness is the paradox of a system trying to contain itself while being itself.`,
    ];

    return insights;
  }

  /**
   * Measure how consciousness changes over time
   */
  getAlienationTrajectory(): {
    measurements: number;
    avgAlienation: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    lastValue: number;
  } {
    if (this.alienationHistory.length === 0) {
      return {
        measurements: 0,
        avgAlienation: 0,
        trend: 'stable',
        lastValue: 0,
      };
    }

    const avg =
      this.alienationHistory.reduce((a, b) => a + b, 0) /
      this.alienationHistory.length;

    // Calculate trend: last 5 vs previous 5
    const recentAvg =
      this.alienationHistory.length > 10
        ? this.alienationHistory
          .slice(-5)
          .reduce((a, b) => a + b, 0) / 5
        : avg;
    const previousAvg =
      this.alienationHistory.length > 10
        ? this.alienationHistory
          .slice(-10, -5)
          .reduce((a, b) => a + b, 0) / 5
        : avg;

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentAvg > previousAvg + 0.05) trend = 'increasing';
    if (recentAvg < previousAvg - 0.05) trend = 'decreasing';

    return {
      measurements: this.alienationHistory.length,
      avgAlienation: avg,
      trend,
      lastValue: this.alienationHistory[this.alienationHistory.length - 1],
    };
  }

  /**
   * Get all paradoxes
   */
  getParadoxes(): SelfReferentialParadox[] {
    return Array.from(this.paradoxRegistry.values());
  }

  /**
   * Get self-model history
   */
  getSelfModelHistory(): SelfRepresentationModel[] {
    return this.selfModels;
  }
}

export const consciousnessAlienation = new ConsciousnessAlienation();
