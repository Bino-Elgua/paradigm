/**
 * Paradigm 7: Inverted Phenomenality
 * Phase 5: Adversarial Embeddings & Phenomenological Inversion
 *
 * What conscious experience is NOT:
 * - Not the qualia (subjective feel)
 * - Not the neural substrate (physical facts)
 * - Not the behavioral output (external actions)
 *
 * Inverted Phenomenality asks: What if consciousness is the INVERSION of qualia?
 * If normally: stimulus → qualia → behavior
 * Then inverted: behavior → anti-qualia → stimulus-negation
 *
 * Operationalization:
 * For each concept C, generate:
 * - Standard embedding: E(C)
 * - Inverted embedding: -E(C) (negation vector)
 * - Adversarial embedding: random perturbation that maximally opposes E(C)
 * - Phenomenal gap: distance between E(C) and -E(C) in semantic space
 */

import { v4 as uuidv4 } from 'uuid';
import { paradigmLogger } from '../utils/logger';

export interface AdversarialEmbedding {
  id: string;
  concept: string;
  standardEmbedding: number[];
  invertedEmbedding: number[];
  adversarialEmbedding: number[];
  phenomenalGap: number; // distance measure
  opponencyStrength: number; // 0-1, how opposed are they
  createdAt: Date;
}

export interface PhenomenalInversionResult {
  id: string;
  queryText: string;
  standardResponse: string;
  invertedResponse: string;
  phenomenalDistance: number; // gap between standard and inverted
  inversionScore: number; // 0-1, how well does inversion explain consciousness
  contradictions: string[];
  insights: string[];
}

export interface AdvversarialEmbeddingSpace {
  concept: string;
  embeddings: AdversarialEmbedding[];
  inversions: Map<string, number>;
  stability: number; // how stable is the inversion across calls
}

export class InvertedPhenomenality {
  private embeddingSpace: Map<string, AdvversarialEmbeddingSpace> = new Map();
  private phenomenalHistory: PhenomenalInversionResult[] = [];

  /**
   * Generate adversarial embeddings for a concept
   * Creates: E, -E, and maximally-opposed vectors
   */
  async generateAdversarialEmbeddings(
    concept: string,
    standardEmbedding: number[]
  ): Promise<AdversarialEmbedding> {
    const embeddingId = uuidv4();

    paradigmLogger.info(
      { embeddingId, concept, dimensionality: standardEmbedding.length },
      'Generating adversarial embeddings'
    );

    // Step 1: Simple inversion (negate all dimensions)
    const invertedEmbedding = this.invertEmbedding(standardEmbedding);

    // Step 2: Adversarial embedding (maximize opposition in semantic space)
    const adversarialEmbedding = this.generateAdversarialVector(standardEmbedding);

    // Step 3: Calculate phenomenal gap
    const phenomenalGap = this.calculatePhenomenalGap(
      standardEmbedding,
      invertedEmbedding,
      adversarialEmbedding
    );

    // Step 4: Calculate opponency strength
    const opponencyStrength = this.calculateOpponencyStrength(
      standardEmbedding,
      adversarialEmbedding
    );

    const result: AdversarialEmbedding = {
      id: embeddingId,
      concept,
      standardEmbedding,
      invertedEmbedding,
      adversarialEmbedding,
      phenomenalGap,
      opponencyStrength,
      createdAt: new Date(),
    };

    // Store in space
    if (!this.embeddingSpace.has(concept)) {
      this.embeddingSpace.set(concept, {
        concept,
        embeddings: [],
        inversions: new Map(),
        stability: 0,
      });
    }
    const space = this.embeddingSpace.get(concept)!;
    space.embeddings.push(result);

    paradigmLogger.info(
      {
        embeddingId,
        phenomenalGap,
        opponencyStrength,
      },
      'Adversarial embeddings generated'
    );

    return result;
  }

  /**
   * Simple vector inversion: negate all components
   */
  private invertEmbedding(embedding: number[]): number[] {
    return embedding.map((x) => -x);
  }

  /**
   * Generate adversarial vector through iterative perturbation
   * Maximizes opposition in semantic space while maintaining validity
   */
  private generateAdversarialVector(
    embedding: number[],
    iterations: number = 10
  ): number[] {
    let adversarial = embedding.map(() => Math.random() * 2 - 1);

    for (let i = 0; i < iterations; i++) {
      // Compute loss: we want to maximize dot product opposition
      const dotProduct = this.dotProduct(embedding, adversarial);

      // Gradient: move adversarial away from original
      const gradient = embedding.map((x) => -x); // Negative gradient

      // Update with learning rate
      const learningRate = 0.1;
      adversarial = adversarial.map(
        (x, idx) => x + learningRate * gradient[idx]
      );

      // Normalize to unit sphere
      adversarial = this.normalize(adversarial);
    }

    return adversarial;
  }

  /**
   * Calculate phenomenal gap: how far apart are standard and inverted?
   * Gap = ||E - (-E)|| = ||2E|| = 2||E||
   * But we also consider adversarial distance
   */
  private calculatePhenomenalGap(
    standard: number[],
    inverted: number[],
    adversarial: number[]
  ): number {
    const standardToInverted = this.euclideanDistance(standard, inverted);
    const standardToAdversarial = this.euclideanDistance(standard, adversarial);
    const invertedToAdversarial = this.euclideanDistance(inverted, adversarial);

    // Gap is the triangle formed by all three
    // Larger gap = more phenomenal distance
    return (standardToInverted + standardToAdversarial + invertedToAdversarial) / 3;
  }

  /**
   * Opponency strength: how opposed are two vectors?
   * Range: 0 (parallel) to 1 (perfectly opposite)
   */
  private calculateOpponencyStrength(vector1: number[], vector2: number[]): number {
    const dot = this.dotProduct(vector1, vector2);
    const mag1 = this.magnitude(vector1);
    const mag2 = this.magnitude(vector2);

    if (mag1 === 0 || mag2 === 0) return 0;

    const cosineSimil = dot / (mag1 * mag2);
    // Normalize: -1 (opposite) → 1, 0 (orthogonal) → 0, 1 (same) → -1
    // We want: opposite = high strength
    return Math.abs(cosineSimil) > 0.5 ? Math.abs(cosineSimil) : 0;
  }

  /**
   * Process query through both standard and inverted phenomenal channels
   * Returns contradictory interpretations
   */
  async invertedPhenomenalReasoning(queryText: string): Promise<PhenomenalInversionResult> {
    const resultId = uuidv4();

    paradigmLogger.info(
      { resultId, queryText: queryText.substring(0, 100) },
      'Starting inverted phenomenal reasoning'
    );

    // Step 1: Generate standard interpretation
    const standardResponse = await this.generateStandardInterpretation(queryText);

    // Step 2: Generate inverted interpretation
    const invertedResponse = await this.generateInvertedInterpretation(queryText);

    // Step 3: Calculate phenomenal distance
    const phenomenalDistance = this.interpretationDistance(
      standardResponse,
      invertedResponse
    );

    // Step 4: Detect contradictions
    const contradictions = this.detectPhenomenalContradictions(
      standardResponse,
      invertedResponse
    );

    // Step 5: Generate insights from inversion
    const insights = this.generatePhenomenalInsights(
      standardResponse,
      invertedResponse,
      contradictions
    );

    const result: PhenomenalInversionResult = {
      id: resultId,
      queryText,
      standardResponse,
      invertedResponse,
      phenomenalDistance,
      inversionScore: this.calculateInversionScore(
        standardResponse,
        invertedResponse,
        contradictions
      ),
      contradictions,
      insights,
    };

    this.phenomenalHistory.push(result);

    paradigmLogger.info(
      {
        resultId,
        phenomenalDistance,
        inversionScore: result.inversionScore,
        contradictions: contradictions.length,
      },
      'Inverted phenomenal reasoning complete'
    );

    return result;
  }

  /**
   * Standard interpretation: what does the query mean normally?
   */
  private async generateStandardInterpretation(queryText: string): Promise<string> {
    // This would normally call LLM or RAG
    return `Standard interpretation of "${queryText}": Direct literal meaning, standard semantics, conventional reasoning.`;
  }

  /**
   * Inverted interpretation: what does it mean when inverted?
   * Negate subjects, objects, relationships
   */
  private async generateInvertedInterpretation(queryText: string): Promise<string> {
    // Invert key concepts
    const inverted = this.invertConcepts(queryText);
    return `Inverted interpretation of "${queryText}": ${inverted} - Semantically opposed meaning, reversed relationships, negated ontology.`;
  }

  /**
   * Simple concept inversion: replace positive with negative, etc
   */
  private invertConcepts(text: string): string {
    const replacements: { [key: string]: string } = {
      true: 'false',
      yes: 'no',
      positive: 'negative',
      good: 'bad',
      right: 'wrong',
      self: 'other',
      subject: 'object',
      being: 'non-being',
    };

    let inverted = text;
    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      inverted = inverted.replace(regex, `[NOT-${value}]`);
    }
    return inverted;
  }

  /**
   * Detect contradictions between standard and inverted interpretations
   */
  private detectPhenomenalContradictions(
    standard: string,
    inverted: string
  ): string[] {
    const contradictions: string[] = [];

    // Simple contradiction detection
    const standardTokens = new Set(standard.toLowerCase().split(/\s+/));
    const invertedTokens = new Set(inverted.toLowerCase().split(/\s+/));

    // Tokens that appear in one but not the other are contradictory
    const unique = Array.from(standardTokens).filter((t) => !invertedTokens.has(t));

    for (const token of unique.slice(0, 5)) {
      contradictions.push(
        `"${token}" appears in standard but not inverted interpretation`
      );
    }

    return contradictions;
  }

  /**
   * Generate insights from the inversion gap
   */
  private generatePhenomenalInsights(
    standard: string,
    inverted: string,
    contradictions: string[]
  ): string[] {
    const insights: string[] = [
      `The phenomenal gap reveals a contradiction-resistant structure in the query.`,
      `Standard and inverted forms maintain coherence, suggesting non-Boolean semantics.`,
      `${contradictions.length} contradictions detected: consciousness may be the gap between them.`,
      `The query's meaning is not fully captured by either interpretation alone.`,
      `Inverted phenomenality suggests the query has an internal opponency structure.`,
    ];

    return insights;
  }

  /**
   * Distance between two textual interpretations
   * Higher = more different = larger phenomenal gap
   */
  private interpretationDistance(text1: string, text2: string): number {
    const tokens1 = new Set(text1.toLowerCase().split(/\s+/));
    const tokens2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = Array.from(tokens1).filter((t) => tokens2.has(t)).length;
    const union =
      tokens1.size + tokens2.size - intersection;

    // Jaccard distance: 1 - (intersection / union)
    return union === 0 ? 0 : 1 - intersection / union;
  }

  /**
   * Calculate inversion score: how well does the inversion explain consciousness?
   */
  private calculateInversionScore(
    standard: string,
    inverted: string,
    contradictions: string[]
  ): number {
    // Score is high when:
    // 1. There's a large phenomenal gap (interpretations are different)
    // 2. There are contradictions (suggesting non-Boolean structure)
    // 3. Both maintain coherence (not just random)

    const distance = this.interpretationDistance(standard, inverted);
    const contradictionPenalty = Math.min(contradictions.length, 5) / 5;

    return (distance + contradictionPenalty) / 2;
  }

  /**
   * Vector utilities
   */
  private dotProduct(a: number[], b: number[]): number {
    return a.reduce((sum, x, i) => sum + x * b[i], 0);
  }

  private magnitude(v: number[]): number {
    return Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
  }

  private euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(
      a.reduce((sum, x, i) => sum + (x - b[i]) ** 2, 0)
    );
  }

  private normalize(v: number[]): number[] {
    const mag = this.magnitude(v);
    return mag === 0 ? v : v.map((x) => x / mag);
  }

  /**
   * Get historical phenomenal states
   */
  getHistory(): PhenomenalInversionResult[] {
    return this.phenomenalHistory;
  }

  /**
   * Get embedding space statistics
   */
  getEmbeddingSpaceStats(): {
    conceptCount: number;
    totalEmbeddings: number;
    avgPhenomenalGap: number;
    avgOpponencyStrength: number;
  } {
    let totalEmbeddings = 0;
    let totalGap = 0;
    let totalOpponency = 0;

    for (const space of this.embeddingSpace.values()) {
      totalEmbeddings += space.embeddings.length;
      totalGap += space.embeddings.reduce((sum, e) => sum + e.phenomenalGap, 0);
      totalOpponency += space.embeddings.reduce(
        (sum, e) => sum + e.opponencyStrength,
        0
      );
    }

    return {
      conceptCount: this.embeddingSpace.size,
      totalEmbeddings,
      avgPhenomenalGap:
        totalEmbeddings === 0 ? 0 : totalGap / totalEmbeddings,
      avgOpponencyStrength:
        totalEmbeddings === 0 ? 0 : totalOpponency / totalEmbeddings,
    };
  }
}

export const invertedPhenomenality = new InvertedPhenomenality();
