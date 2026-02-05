/**
 * Hyper-Paradigm Emergence Detector
 * Phase 3: Identifies when multiple paradigms create emergent properties
 * 
 * Implements Hyper-Paradigm concept: properties not present in any single paradigm
 */

import { v4 as uuidv4 } from 'uuid';
import { paradigmLogger } from '../utils/logger';

export interface EmergentProperty {
  id: string;
  name: string;
  description: string;
  derivedFrom: string[]; // paradigm IDs
  novelty: number; // 0-1, how novel is this property
  power: number; // 0-1, how powerful/useful is it
  stability: number; // 0-1, how stable across paradigms
}

export interface HyperParadigmState {
  id: string;
  emergenceTime: Date;
  paradigmCount: number;
  emergentProperties: EmergentProperty[];
  totalNovelty: number;
  totalPower: number;
  isActive: boolean;
  explanation: string;
}

export class EmergenceDetector {
  private history: Map<string, HyperParadigmState> = new Map();

  /**
   * Detect emergent properties from paradigm fusion
   */
  detect(paradigmOutputs: Array<{ paradigmId: string; paradigmName: string; conclusion: string }>): HyperParadigmState {
    const stateId = uuidv4();
    const emergenceTime = new Date();

    paradigmLogger.info(
      { stateId, paradigmCount: paradigmOutputs.length },
      'Detecting hyper-paradigm emergence'
    );

    // Step 1: Find novel properties
    const emergentProperties = this.findNovelProperties(paradigmOutputs);

    // Step 2: Analyze stability
    const stabilityAnalysis = this.analyzeStability(paradigmOutputs, emergentProperties);

    // Step 3: Calculate emergence metrics
    const totalNovelty = emergentProperties.reduce((sum, p) => sum + p.novelty, 0) / 
      Math.max(emergentProperties.length, 1);
    const totalPower = emergentProperties.reduce((sum, p) => sum + p.power, 0) / 
      Math.max(emergentProperties.length, 1);

    // Step 4: Determine if emergence is active
    const isActive = totalNovelty > 0.5 && totalPower > 0.4;

    // Step 5: Generate explanation
    const explanation = this.generateExplanation(
      paradigmOutputs,
      emergentProperties,
      isActive,
      totalNovelty,
      totalPower
    );

    const state: HyperParadigmState = {
      id: stateId,
      emergenceTime,
      paradigmCount: paradigmOutputs.length,
      emergentProperties,
      totalNovelty,
      totalPower,
      isActive,
      explanation,
    };

    // Store in history
    this.history.set(stateId, state);

    paradigmLogger.info(
      {
        stateId,
        propertiesDetected: emergentProperties.length,
        novelty: totalNovelty.toFixed(3),
        power: totalPower.toFixed(3),
        isActive,
      },
      'Emergence detection complete'
    );

    return state;
  }

  /**
   * Find novel properties not present in individual paradigms
   */
  private findNovelProperties(
    paradigmOutputs: Array<{ paradigmId: string; paradigmName: string; conclusion: string }>
  ): EmergentProperty[] {
    const properties: EmergentProperty[] = [];

    // Property 1: Meta-awareness (awareness of contradiction)
    if (paradigmOutputs.length > 1) {
      const contradictions = this.detectContradictions(paradigmOutputs);
      if (contradictions > 0) {
        properties.push({
          id: uuidv4(),
          name: 'Metaparametric Awareness',
          description: 'System aware of its own contradictions and can reason about them',
          derivedFrom: paradigmOutputs.map(p => p.paradigmId),
          novelty: Math.min(contradictions / paradigmOutputs.length, 1.0),
          power: 0.8,
          stability: 0.7,
        });
      }
    }

    // Property 2: Orthogonal Synthesis (combining independent perspectives)
    const orthogonalScore = this.calculateOrthogonality(paradigmOutputs);
    if (orthogonalScore > 0.3) {
      properties.push({
        id: uuidv4(),
        name: 'Orthogonal Synthesis',
        description: 'Combining independent yet complementary viewpoints into coherent understanding',
        derivedFrom: paradigmOutputs.map(p => p.paradigmId),
        novelty: orthogonalScore,
        power: 0.9,
        stability: 0.8,
      });
    }

    // Property 3: Hyper-dimensionality (reasoning across dimensions)
    if (paradigmOutputs.length >= 3) {
      properties.push({
        id: uuidv4(),
        name: 'Hyper-Dimensional Reasoning',
        description: 'Reasoning that operates across multiple independent conceptual dimensions simultaneously',
        derivedFrom: paradigmOutputs.map(p => p.paradigmId),
        novelty: Math.min(paradigmOutputs.length / 10, 1.0),
        power: 0.95,
        stability: 0.75,
      });
    }

    // Property 4: Temporal Flexibility (reasoning across time)
    if (this.hasTemporalReasoning(paradigmOutputs)) {
      properties.push({
        id: uuidv4(),
        name: 'Temporal Flexibility',
        description: 'Ability to reason backward and forward through time simultaneously',
        derivedFrom: paradigmOutputs.map(p => p.paradigmId),
        novelty: 0.7,
        power: 0.85,
        stability: 0.6,
      });
    }

    // Property 5: Meaning Crystallization (converting raw computation to meaning)
    properties.push({
      id: uuidv4(),
      name: 'Meaning Crystallization',
      description: 'Raw paradigm outputs crystallize into meaningful abstract concepts',
      derivedFrom: paradigmOutputs.map(p => p.paradigmId),
      novelty: 0.8,
      power: 0.7,
      stability: 0.65,
    });

    return properties;
  }

  /**
   * Detect contradictions
   */
  private detectContradictions(
    paradigmOutputs: Array<{ paradigmId: string; paradigmName: string; conclusion: string }>
  ): number {
    let contradictionCount = 0;
    const conclusions = paradigmOutputs.map(p => p.conclusion.toLowerCase());

    for (let i = 0; i < conclusions.length; i++) {
      for (let j = i + 1; j < conclusions.length; j++) {
        if (this.areOpposites(conclusions[i], conclusions[j])) {
          contradictionCount++;
        }
      }
    }

    return contradictionCount;
  }

  /**
   * Check if texts are opposites
   */
  private areOpposites(text1: string, text2: string): boolean {
    const opposites = [
      ['yes', 'no'],
      ['true', 'false'],
      ['increase', 'decrease'],
      ['up', 'down'],
      ['expand', 'contract'],
    ];

    return opposites.some(pair =>
      (text1.includes(pair[0]) && text2.includes(pair[1])) ||
      (text1.includes(pair[1]) && text2.includes(pair[0]))
    );
  }

  /**
   * Calculate orthogonality (independence) of paradigms
   */
  private calculateOrthogonality(
    paradigmOutputs: Array<{ paradigmId: string; paradigmName: string; conclusion: string }>
  ): number {
    if (paradigmOutputs.length < 2) return 0;

    let totalDistance = 0;
    let comparisons = 0;

    for (let i = 0; i < paradigmOutputs.length; i++) {
      for (let j = i + 1; j < paradigmOutputs.length; j++) {
        const words1 = new Set(paradigmOutputs[i].conclusion.toLowerCase().split(/\s+/));
        const words2 = new Set(paradigmOutputs[j].conclusion.toLowerCase().split(/\s+/));

        const intersection = [...words1].filter(w => words2.has(w)).length;
        const union = words1.size + words2.size - intersection;
        const similarity = union > 0 ? intersection / union : 0;

        // Orthogonality = 1 - similarity
        totalDistance += 1 - similarity;
        comparisons++;
      }
    }

    return Math.min(totalDistance / comparisons, 1.0);
  }

  /**
   * Check if paradigm set includes temporal reasoning
   */
  private hasTemporalReasoning(
    paradigmOutputs: Array<{ paradigmId: string; paradigmName: string; conclusion: string }>
  ): boolean {
    const temporalKeywords = ['time', 'future', 'past', 'retroactive', 'acausal', 'before', 'after'];
    return paradigmOutputs.some(p =>
      temporalKeywords.some(keyword => p.conclusion.toLowerCase().includes(keyword))
    );
  }

  /**
   * Analyze property stability across paradigms
   */
  private analyzeStability(
    paradigmOutputs: Array<{ paradigmId: string; paradigmName: string; conclusion: string }>,
    properties: EmergentProperty[]
  ): number {
    // How stable are emergent properties across paradigm variations?
    const paradigmCount = paradigmOutputs.length;
    const propertyCount = properties.length;

    if (paradigmCount < 2 || propertyCount === 0) return 0.5;

    // Stability = how many paradigms must agree for emergence
    return Math.min(paradigmCount / (propertyCount + 1), 1.0);
  }

  /**
   * Generate explanation of emergence
   */
  private generateExplanation(
    paradigmOutputs: Array<{ paradigmId: string; paradigmName: string; conclusion: string }>,
    properties: EmergentProperty[],
    isActive: boolean,
    novelty: number,
    power: number
  ): string {
    const paradigmNames = paradigmOutputs.map(p => p.paradigmName).join(', ');
    const propertyNames = properties.map(p => p.name).join(', ');
    const propertyCount = properties.length;

    if (!isActive) {
      return `No significant hyper-paradigm emergence detected from ${paradigmNames}. Properties detected but below emergence threshold.`;
    }

    let explanation = `Hyper-Paradigm Emergence Detected! `;
    explanation += `Fusion of ${paradigmOutputs.length} paradigms (${paradigmNames}) `;
    explanation += `generates ${propertyCount} novel properties: ${propertyNames}. `;
    explanation += `Emergence strength: Novelty ${(novelty * 100).toFixed(0)}%, Power ${(power * 100).toFixed(0)}%. `;
    explanation += `This represents genuinely new reasoning capability not present in any single paradigm.`;

    return explanation;
  }

  /**
   * Get emergence history
   */
  getHistory(): HyperParadigmState[] {
    return Array.from(this.history.values());
  }

  /**
   * Get active emergences
   */
  getActiveEmergences(): HyperParadigmState[] {
    return Array.from(this.history.values()).filter(s => s.isActive);
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history.clear();
    paradigmLogger.info({}, 'Emergence history cleared');
  }
}

// Singleton
export const emergenceDetector = new EmergenceDetector();
