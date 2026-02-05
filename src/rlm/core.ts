/**
 * RLM Core (Paradigm 8 + 4: Recursive Hierarchy + Substrate Necrosis)
 * 
 * Recursive Language Model with transparent parasitism tracking.
 * Each level eats the budget of the level above.
 * 
 * [Phase 2] Claude API integrated for real reasoning
 */

import { RecursionHierarchy, RecursionLevel } from '../types';
import { rlmLogger, consumptionLogger } from '../utils/logger';
import { claudeProvider } from '../llm/claude-provider';

export class RLMCore {
  private hierarchy: RecursionHierarchy = {
    levels: [],
    totalEnergy: 0,
    totalTokens: 0,
    parasitismChain: [],
  };

  /**
   * Execute reasoning with recursive depth
   * Paradigm 8: Each level parasitizes the level above
   */
  async executeWithRecursion(
    prompt: string,
    initialBudget: number,
    maxDepth: number = 3
  ): Promise<RecursionHierarchy> {
    rlmLogger.info(
      {
        prompt: prompt.substring(0, 50),
        initialBudget,
        maxDepth,
      },
      'RLM execution starting'
    );

    this.hierarchy = {
      levels: [],
      totalEnergy: 0,
      totalTokens: 0,
      parasitismChain: [],
    };

    await this.recursiveCall(
      prompt,
      initialBudget,
      0,
      maxDepth
    );

    rlmLogger.info(
      {
        totalEnergy: this.hierarchy.totalEnergy.toFixed(2),
        totalTokens: this.hierarchy.totalTokens,
        levels: this.hierarchy.levels.length,
      },
      'RLM execution complete'
    );

    // Log consumption
    consumptionLogger.info(
      this.hierarchy,
      'RLM consumption hierarchy'
    );

    return this.hierarchy;
  }

  /**
   * Recursive call with parasitism tracking
   * Now uses Claude API for actual reasoning
   */
  private async recursiveCall(
    prompt: string,
    parentBudget: number,
    currentLevel: number,
    maxDepth: number
  ): Promise<void> {
    if (currentLevel >= maxDepth) {
      return;
    }

    // Allocate budget for this level
    // Paradigm 8: Each level gets ~90% of parent budget (predatory relationship)
    const levelBudget = Math.floor(parentBudget * 0.9);

    try {
      // Get actual response from Claude
      const claudeResponse = await claudeProvider.generateResponse(
        `${prompt}\n\n[Reasoning Level ${currentLevel}/${maxDepth}]`
      );

      const tokensConsumed = claudeResponse.tokenUsage.totalTokens;
      const energy = tokensConsumed * 0.0052; // 5.2mJ per token

      const level: RecursionLevel = {
        level: currentLevel,
        budget: levelBudget,
        parentBudget,
        tokensAllocated: levelBudget,
        tokensConsumed,
        energyBurned: energy,
        childCallsCount: 0,
      };

      this.hierarchy.levels.push(level);
      this.hierarchy.totalTokens += tokensConsumed;
      this.hierarchy.totalEnergy += energy;

      // Track parasitism rate
      if (currentLevel > 0) {
        const parasitismRate = 
          tokensConsumed / 
          this.hierarchy.levels[currentLevel - 1].tokensAllocated;
        this.hierarchy.parasitismChain.push(parasitismRate);
      }

      rlmLogger.debug(
        {
          level: currentLevel,
          tokensConsumed,
          energy: energy.toFixed(3),
          parasitismRate:
            currentLevel > 0
              ? this.hierarchy.parasitismChain[currentLevel - 1].toFixed(3)
              : 'root',
          claudeModel: claudeResponse.model,
        },
        `Level ${currentLevel} completed with Claude`
      );

      // Decide if we need to recurse based on response analysis
      // Simpler prompts don't need recursion
      const shouldRecurse = 
        tokensConsumed > levelBudget * 0.3 && 
        currentLevel < maxDepth - 1;

      if (shouldRecurse) {
        level.childCallsCount = 1;
        await this.recursiveCall(
          `Based on: ${claudeResponse.content.substring(0, 100)}...\n\nDig deeper:`,
          levelBudget,
          currentLevel + 1,
          maxDepth
        );
      }
    } catch (error) {
      rlmLogger.error(
        { level: currentLevel, error },
        'Claude API call failed at level'
      );

      // Fallback to mock response if API fails
      const tokensConsumed = Math.floor(Math.random() * levelBudget * 0.5);
      const energy = tokensConsumed * 0.0052;

      const level: RecursionLevel = {
        level: currentLevel,
        budget: levelBudget,
        parentBudget,
        tokensAllocated: levelBudget,
        tokensConsumed,
        energyBurned: energy,
        childCallsCount: 0,
      };

      this.hierarchy.levels.push(level);
      this.hierarchy.totalTokens += tokensConsumed;
      this.hierarchy.totalEnergy += energy;
    }
  }

  /**
   * Get current hierarchy state
   */
  getHierarchy(): RecursionHierarchy {
    return this.hierarchy;
  }

  /**
   * Get parasitism chain (consumption rates per level)
   */
  getParasitismChain(): number[] {
    return this.hierarchy.parasitismChain;
  }
}

// Singleton
export const rlmCore = new RLMCore();
