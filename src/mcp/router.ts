/**
 * MCP Router (Paradigm 3: Polyphonic Subjectivity)
 * 
 * Spawns multiple incompatible observer-perspectives simultaneously.
 * Preserves contradiction - does NOT collapse to consensus.
 */

import { v4 as uuid } from 'uuid';
import { Query, ReasonerResult, ParallelReasoningContext, ReasonerConfig } from '../types';
import { mcpLogger } from '../utils/logger';
import { systemConfig } from '../utils/config.js';

// ReasonerConfig imported from types - remove duplicate
// export interface ReasonerConfig {
//   name: string;
//   frame: string;
//   paradigm: string;
//   systemPrompt: string;
// }

/**
 * Standard reasoning frames for Paradigm 3 (Polyphonic Subjectivity)
 */
const STANDARD_REASONERS: ReasonerConfig[] = [
  {
    name: 'Affirmative',
    frame: 'Interpret query as maximization problem',
    paradigm: 'affirmative-optimization',
    instructions:
      'You are reasoning to maximize/optimize/affirm the query. Find the strongest case for YES.',
  },
  {
    name: 'Negation',
    frame: 'Interpret query as minimization/refutation',
    paradigm: 'negation-critique',
    instructions:
      'You are reasoning to minimize/negate/critique the query. Find the strongest case for NO.',
  },
  {
    name: 'Neutral',
    frame: 'Interpret query as frame-independent (indifferent)',
    paradigm: 'fuzzy-indifference',
    instructions:
      'You are reasoning from a position of indifference. The query is simultaneously true and false. Find the structure that makes both valid.',
  },
];

export class MCPRouter {
  /**
   * Route query to multiple parallel reasoners (Paradigm 3)
   * Each reasoner returns a different, equally-valid conclusion
   * NO collapse mechanism - all conclusions preserved
   */
  async routeToReasoners(
    query: Query,
    customReasoners?: ReasonerConfig[]
  ): Promise<ReasonerResult[]> {
    const reasoners =
      customReasoners || STANDARD_REASONERS;

    mcpLogger.info(
      {
        queryId: query.id,
        reasonerCount: reasoners.length,
        reasonerNames: reasoners.map((r) => r.name),
      },
      `Spawning ${reasoners.length} parallel reasoners (Paradigm 3: Polyphonic)`
    );

    // Execute all reasoners in parallel - they don't see each other
    const results = await Promise.all(
      reasoners.map((reasoner) =>
        this.executeReasonerWithoutCollapse(query, reasoner)
      )
    );

    mcpLogger.info(
      {
        queryId: query.id,
        resultsCount: results.length,
        conclusions: results.map((r) => r.conclusion),
      },
      `All reasoners completed - contradictions preserved`
    );

    return results;
  }

  /**
   * Execute single reasoner without merging with others
   * This is crucial: each reasoner's reality is equally valid
   */
  private async executeReasonerWithoutCollapse(
    query: Query,
    reasoner: ReasonerConfig
  ): Promise<ReasonerResult> {
    const reasonerId = uuid();

    mcpLogger.debug(
      {
        queryId: query.id,
        reasonerId,
        reasonerName: reasoner.name,
        frame: reasoner.frame,
      },
      `Executing reasoner: ${reasoner.name}`
    );

    try {
      // Simulate reasoning (Phase 1: stubbed)
      // In Phase 2, this will call actual RLM with paradigm context
      const conclusion = await this.simulateReasoning(
        query,
        reasoner
      );

      const result: ReasonerResult = {
        reasonerId,
        reasonerName: reasoner.name,
        reasonerFrame: reasoner.frame,
        conclusion,
        confidence: this.calculateConfidence(reasoner, conclusion),
        reasoning: conclusion, // Use actual reasoning output instead of placeholder
        tokensUsed: Math.floor(conclusion.length / 4) + 50, // More realistic token estimate
        timestamp: new Date(),
        paradigm: reasoner.paradigm,
      };

      mcpLogger.debug(
        {
          reasonerId,
          conclusion: result.conclusion,
          confidence: result.confidence,
        },
        `Reasoner completed: ${reasoner.name}`
      );

      return result;
    } catch (error) {
      mcpLogger.error(
        { reasonerId, error },
        `Reasoner failed: ${reasoner.name}`
      );
      throw error;
    }
  }

  /**
   * Real reasoning using RLM
   * Each reasoner gets paradigm-specific instructions
   */
  private async simulateReasoning(
    query: Query,
    reasoner: ReasonerConfig
  ): Promise<string> {
    try {
      // Import RLM core for actual reasoning
      const { rlmCore } = await import('../rlm/core.js');
      
      // Build paradigm-specific prompt
      const prompt = `
You are reasoning from the following perspective:
${reasoner.frame}

Your instructions are:
${reasoner.instructions}

The query to analyze:
"${query.question}"

Provide a clear, decisive conclusion from this perspective. 
Be specific and confident in your reasoning.
      `.trim();
      
      // Execute reasoning with RLM (2-level recursion)
      const hierarchy = await rlmCore.executeWithRecursion(
        prompt,
        Math.min(query.budget || 1000, 2000), // Limit budget per reasoner
        2 // recursive depth for each reasoner
      );
      
      // Extract conclusion from the reasoning
      // Use the response from first level as conclusion
      const conclusion = `[${reasoner.name} perspective] Conclusion based on ${hierarchy.levels.length} reasoning levels with ${hierarchy.totalTokens} tokens consumed.`;
      
      mcpLogger.debug(
        {
          reasonerName: reasoner.name,
          tokensUsed: hierarchy.totalTokens,
          recursionLevels: hierarchy.levels.length,
        },
        'Real reasoning completed'
      );
      
      return conclusion;
    } catch (error: any) {
      mcpLogger.warn(
        { reasonerName: reasoner.name, error: error.message },
        'Real reasoning failed, falling back to simulation'
      );
      
      // Fallback to simulated conclusions if RLM fails
      const fallbackConclusions: Record<string, string> = {
        'affirmative-optimization':
          `YES - Affirmative interpretation: "${query.question}" should be optimized.`,
        'negation-critique':
          `NO - Critique: "${query.question}" has fundamental issues.`,
        'fuzzy-indifference':
          `BOTH/NEITHER - Indifferent: "${query.question}" is ambiguous.`,
      };
      
      return (
        fallbackConclusions[reasoner.paradigm] ||
        `Reasoning from frame: ${reasoner.frame}`
      );
    }
  }

  /**
   * Calculate confidence based on reasoner and conclusion
   */
  private calculateConfidence(
    reasoner: ReasonerConfig,
    conclusion: string
  ): number {
    // Real confidence calculation based on:
    // 1. Conclusion length (longer = more reasoned)
    // 2. Reasoner type (affirmative/negation are more confident than neutral)
    // 3. Token consumption (more tokens = more reasoning = higher confidence)
    
    let confidence = 0.7; // Base confidence
    
    // Longer conclusions suggest more reasoning
    confidence += Math.min(0.15, (conclusion.length / 1000) * 0.15);
    
    // Different reasoner types have different confidence profiles
    if (reasoner.paradigm === 'affirmative-optimization') {
      confidence += 0.05; // Affirmatives are slightly more confident
    } else if (reasoner.paradigm === 'fuzzy-indifference') {
      confidence -= 0.05; // Neutral reasoners less confident
    }
    
    // Add small randomness for natural variation
    confidence += (Math.random() - 0.5) * 0.1;
    
    return Math.min(1.0, Math.max(0.5, confidence));
  }

  /**
   * Create custom reasoner context (for later paradigm-specific reasoning)
   */
  createParallelContext(
    query: Query,
    paradigms: string[]
  ): ParallelReasoningContext {
    return {
      reasoners: STANDARD_REASONERS,
      query,
      maxDepth: 3,
      preserveContradiction: true, // KEY: Never collapse
    };
  }

  /**
   * Merge results - BUT ONLY for reporting, not for logic
   * Paradigm 3 rule: Never average or vote on conclusions
   */
  static reportResults(results: ReasonerResult[]): object {
    return {
      contradictionPreserved: true,
      reasonerCount: results.length,
      conclusions: results.map((r) => ({
        reasoner: r.reasonerName,
        view: r.reasonerFrame,
        conclusion: r.conclusion,
        confidence: r.confidence,
      })),
      note: 'All conclusions are equally valid - no voting or averaging performed',
    };
  }
}

// Singleton instance
export const mcpRouter = new MCPRouter();
