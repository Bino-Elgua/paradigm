/**
 * Paradigm Fusion Engine
 * Phase 3: Combines multiple paradigm outputs into emergent reasoning
 * 
 * Implements entanglement between paradigms (Paradigm 3 + all others)
 */

import { v4 as uuidv4 } from 'uuid';
import { paradigmLogger } from '../utils/logger';

export interface ParadigmOutput {
  paradigmId: string;
  paradigmName: string;
  conclusion: string;
  confidence: number;
  reasoning: string;
  tokens?: number;
}

export interface EntanglementLink {
  from: string;
  to: string;
  strength: number; // 0-1
  type: 'synergy' | 'contradiction' | 'neutral';
  explanation: string;
}

export interface FusionResult {
  fusionId: string;
  paradigmOutputs: ParadigmOutput[];
  entanglementLinks: EntanglementLink[];
  emergentInsight: string;
  consensusScore: number; // 0-1, higher = more agreement
  contradictionIntensity: number; // 0-1, higher = more disagreement
  synthesisQuality: number; // 0-1
  executionTimeMs: number;
}

export class ParadigmFusionEngine {
  /**
   * Fuse multiple paradigm outputs into emergent reasoning
   * Paradigm 3: Preserve contradictions while finding emergence
   */
  fuse(outputs: ParadigmOutput[]): FusionResult {
    const startTime = Date.now();
    const fusionId = uuidv4();

    paradigmLogger.info(
      { fusionId, paradigmCount: outputs.length },
      'Starting paradigm fusion'
    );

    // Step 1: Calculate consensus score
    const consensusScore = this.calculateConsensus(outputs);

    // Step 2: Detect contradictions (don't collapse them!)
    const contradictionIntensity = this.calculateContradiction(outputs);

    // Step 3: Find entanglement links (synergies)
    const entanglementLinks = this.findEntanglements(outputs);

    // Step 4: Generate emergent insight
    const emergentInsight = this.synthesizeEmergence(
      outputs,
      entanglementLinks,
      consensusScore,
      contradictionIntensity
    );

    // Step 5: Calculate synthesis quality
    const synthesisQuality = this.calculateSynthesisQuality(
      outputs,
      entanglementLinks,
      consensusScore,
      contradictionIntensity
    );

    const result: FusionResult = {
      fusionId,
      paradigmOutputs: outputs,
      entanglementLinks,
      emergentInsight,
      consensusScore,
      contradictionIntensity,
      synthesisQuality,
      executionTimeMs: Date.now() - startTime,
    };

    paradigmLogger.info(
      {
        fusionId,
        consensusScore: consensusScore.toFixed(3),
        contradictionIntensity: contradictionIntensity.toFixed(3),
        synthesisQuality: synthesisQuality.toFixed(3),
        entanglements: entanglementLinks.length,
      },
      'Paradigm fusion complete'
    );

    return result;
  }

  /**
   * Calculate consensus among paradigms
   * How much do they agree on the conclusion?
   */
  private calculateConsensus(outputs: ParadigmOutput[]): number {
    if (outputs.length < 2) return 1.0;

    // Similarity matrix based on conclusion overlap
    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < outputs.length; i++) {
      for (let j = i + 1; j < outputs.length; j++) {
        const similarity = this.textSimilarity(
          outputs[i].conclusion,
          outputs[j].conclusion
        );
        totalSimilarity += similarity;
        comparisons++;
      }
    }

    // Weight by confidence
    const confidenceWeight = outputs.reduce((sum, o) => sum + o.confidence, 0) / outputs.length;

    return (comparisons > 0 ? totalSimilarity / comparisons : 1.0) * confidenceWeight;
  }

  /**
   * Calculate contradiction intensity
   * How much do they disagree?
   */
  private calculateContradiction(outputs: ParadigmOutput[]): number {
    if (outputs.length < 2) return 0;

    // Detect logical opposites in conclusions
    let contradictionCount = 0;
    let totalComparisons = 0;

    for (let i = 0; i < outputs.length; i++) {
      for (let j = i + 1; j < outputs.length; j++) {
        const conclusion1 = outputs[i].conclusion.toLowerCase();
        const conclusion2 = outputs[j].conclusion.toLowerCase();

        // Check for negation patterns
        if (
          (conclusion1.includes('not') && conclusion2.includes(conclusion1.replace('not', ''))) ||
          (conclusion2.includes('not') && conclusion1.includes(conclusion2.replace('not', '')))
        ) {
          contradictionCount++;
        }

        totalComparisons++;
      }
    }

    return totalComparisons > 0 ? contradictionCount / totalComparisons : 0;
  }

  /**
   * Find entanglement links (synergies between paradigms)
   * Where do they support each other?
   */
  private findEntanglements(outputs: ParadigmOutput[]): EntanglementLink[] {
    const links: EntanglementLink[] = [];

    for (let i = 0; i < outputs.length; i++) {
      for (let j = i + 1; j < outputs.length; j++) {
        const output1 = outputs[i];
        const output2 = outputs[j];

        // Extract keywords/concepts
        const concepts1 = this.extractConcepts(output1.reasoning);
        const concepts2 = this.extractConcepts(output2.reasoning);

        // Calculate concept overlap
        const overlap = this.calculateOverlap(concepts1, concepts2);
        const strength = overlap * (output1.confidence + output2.confidence) / 2;

        // Determine link type
        let type: 'synergy' | 'contradiction' | 'neutral' = 'neutral';
        if (strength > 0.7) {
          type = 'synergy';
        } else if (strength < 0.3 && this.areOpposites(output1.conclusion, output2.conclusion)) {
          type = 'contradiction';
        }

        if (strength > 0.2) {
          // Only include significant links
          links.push({
            from: output1.paradigmId,
            to: output2.paradigmId,
            strength: Math.min(strength, 1.0),
            type,
            explanation: this.explainLink(output1, output2, type, strength),
          });
        }
      }
    }

    return links;
  }

  /**
   * Synthesize emergent insight
   * What new understanding emerges from the fusion?
   */
  private synthesizeEmergence(
    outputs: ParadigmOutput[],
    links: EntanglementLink[],
    consensus: number,
    contradiction: number
  ): string {
    const paradigmNames = outputs.map(o => o.paradigmName).join(', ');
    const synergyCount = links.filter(l => l.type === 'synergy').length;
    const contradictionCount = links.filter(l => l.type === 'contradiction').length;

    let insight = `Fusion of ${outputs.length} paradigms (${paradigmNames}): `;

    if (consensus > 0.8) {
      insight += `Strong convergence on conclusion with high confidence. ${synergyCount} synergistic links detected.`;
    } else if (contradiction > 0.5) {
      insight += `Contradictory conclusions preserved: ${contradictionCount} links. Meta-paradox: truth may exist in the gap between paradigms.`;
    } else {
      insight += `Orthogonal perspectives identified. ${synergyCount} points of synergy with nuanced disagreements.`;
    }

    insight += ` Synthesis quality: ${(consensus * 100).toFixed(0)}% consensus, ${(contradiction * 100).toFixed(0)}% contradiction preserved.`;

    return insight;
  }

  /**
   * Calculate synthesis quality
   * How well did the fusion work?
   */
  private calculateSynthesisQuality(
    outputs: ParadigmOutput[],
    links: EntanglementLink[],
    consensus: number,
    contradiction: number
  ): number {
    // Quality = consensus * synergy + contradiction_preservation
    const synergyScore =
      links.filter(l => l.type === 'synergy').reduce((sum, l) => sum + l.strength, 0) / 
      Math.max(links.length, 1);

    const contradictionPreservation = contradiction > 0.3 && contradiction < 0.8 ? 1.0 : 0.5;

    const qualityScore =
      consensus * 0.4 +           // Consensus matters
      synergyScore * 0.4 +        // Synergy matters
      contradictionPreservation * 0.2; // Contradiction preservation matters

    return Math.min(qualityScore, 1.0);
  }

  /**
   * Calculate text similarity (simple)
   */
  private textSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = [...words1].filter(w => words2.has(w)).length;
    const union = words1.size + words2.size - intersection;

    return union > 0 ? intersection / union : 0;
  }

  /**
   * Extract concepts/keywords from text
   */
  private extractConcepts(text: string): Set<string> {
    const words = text.toLowerCase().split(/\s+/);
    // Filter out common words
    const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'is', 'are', 'to', 'of', 'in']);
    return new Set(words.filter(w => w.length > 3 && !stopwords.has(w)));
  }

  /**
   * Calculate set overlap
   */
  private calculateOverlap(set1: Set<string>, set2: Set<string>): number {
    const intersection = [...set1].filter(item => set2.has(item)).length;
    const union = set1.size + set2.size - intersection;
    return union > 0 ? intersection / union : 0;
  }

  /**
   * Check if conclusions are opposites
   */
  private areOpposites(conclusion1: string, conclusion2: string): boolean {
    const opposites = [
      ['yes', 'no'],
      ['true', 'false'],
      ['possible', 'impossible'],
      ['increase', 'decrease'],
      ['agree', 'disagree'],
    ];

    const lower1 = conclusion1.toLowerCase();
    const lower2 = conclusion2.toLowerCase();

    return opposites.some(pair =>
      (lower1.includes(pair[0]) && lower2.includes(pair[1])) ||
      (lower1.includes(pair[1]) && lower2.includes(pair[0]))
    );
  }

  /**
   * Explain why paradigms are linked
   */
  private explainLink(
    output1: ParadigmOutput,
    output2: ParadigmOutput,
    type: string,
    strength: number
  ): string {
    if (type === 'synergy') {
      return `${output1.paradigmName} and ${output2.paradigmName} reinforce each other (strength: ${(strength * 100).toFixed(0)}%)`;
    } else if (type === 'contradiction') {
      return `${output1.paradigmName} contradicts ${output2.paradigmName} (creating productive tension)`;
    } else {
      return `${output1.paradigmName} and ${output2.paradigmName} operate independently`;
    }
  }
}

// Singleton
export const paradigmFusionEngine = new ParadigmFusionEngine();
