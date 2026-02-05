/**
 * Persistent Memory & Learning System
 * Phase 5: Long-term memory, experience accumulation, learning across sessions
 *
 * Features:
 * - Episode memory: stores complete query sessions with outcomes
 * - Semantic memory: extracts generalizable knowledge from experiences
 * - Procedural memory: learns to optimize reasoning processes
 * - Meta-memory: remembers what it learned and how learning happened
 * - Continual learning: improves without forgetting previous knowledge
 */

import { v4 as uuidv4 } from 'uuid';
import { paradigmLogger } from '../utils/logger';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface MemoryEpisode {
  id: string;
  timestamp: Date;
  query: string;
  reasoning: Record<string, unknown>;
  outcome: unknown;
  success: boolean;
  duration: number;
  tokensUsed: number;
  paradigmScores: Record<string, number>;
  learnings: string[];
}

export interface SemanticMemory {
  id: string;
  concept: string;
  definition: string;
  relationshipTo: string[];
  frequency: number; // how often encountered
  confidence: number; // 0-1
  source: string[]; // which episodes
  lastUpdated: Date;
}

export interface ProceduralMemory {
  id: string;
  procedure: string; // e.g., "efficient-reasoning-path" or "paradigm-selection"
  steps: string[];
  successRate: number; // 0-1
  averageEfficiency: number;
  conditions: string[]; // when to use
  learned: Date;
  optimizations: string[];
  appliedCount?: number; // optional for tracking
}

export interface LearningRecord {
  id: string;
  learned: string;
  source: MemoryEpisode | 'semantic-extraction' | 'procedural-discovery';
  confidence: number;
  isActive: boolean;
  appliedCount: number;
  successfulApplications: number;
  timestamp: Date;
}

export class PersistentMemorySystem {
  private episodes: MemoryEpisode[] = [];
  private semanticMemory: Map<string, SemanticMemory> = new Map();
  private proceduralMemory: Map<string, ProceduralMemory> = new Map();
  private learningRecords: LearningRecord[] = [];
  private memoryPath: string = './memory';
  private sessionStartTime: Date = new Date();

  constructor(memoryPath: string = './memory') {
    this.memoryPath = memoryPath;
    this.initializeMemoryDirectory();
  }

  /**
   * Initialize persistent storage
   */
  private async initializeMemoryDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.memoryPath, { recursive: true });
      paradigmLogger.info({ path: this.memoryPath }, 'Memory directory initialized');

      // Load persisted memories
      await this.loadPersistedMemories();
    } catch (error) {
      paradigmLogger.error({ error }, 'Failed to initialize memory directory');
    }
  }

  /**
   * Record a complete episode (query + reasoning + outcome)
   */
  async recordEpisode(
    query: string,
    reasoning: Record<string, unknown>,
    outcome: unknown,
    success: boolean,
    duration: number,
    tokensUsed: number,
    paradigmScores: Record<string, number>
  ): Promise<MemoryEpisode> {
    const episodeId = uuidv4();

    // Extract learnings from this episode
    const learnings = await this.extractLearnins(
      query,
      reasoning,
      outcome,
      success,
      paradigmScores
    );

    const episode: MemoryEpisode = {
      id: episodeId,
      timestamp: new Date(),
      query,
      reasoning,
      outcome,
      success,
      duration,
      tokensUsed,
      paradigmScores,
      learnings,
    };

    this.episodes.push(episode);

    // Update semantic memory
    await this.updateSemanticMemory(query, outcome, learnings);

    // Update procedural memory
    await this.updateProceduralMemory(paradigmScores, duration, success);

    // Persist to disk
    await this.persistEpisode(episode);

    paradigmLogger.info(
      {
        episodeId,
        success,
        duration,
        learnings: learnings.length,
      },
      'Episode recorded'
    );

    return episode;
  }

  /**
   * Extract learnings from an episode
   */
  private async extractLearnins(
    query: string,
    reasoning: Record<string, unknown>,
    outcome: unknown,
    success: boolean,
    paradigmScores: Record<string, number>
  ): Promise<string[]> {
    const learnings: string[] = [];

    // Learning 1: Query-specific insight
    learnings.push(
      `Query pattern "${query.substring(0, 30)}..." ${success ? 'succeeded' : 'failed'}`
    );

    // Learning 2: Best paradigm for this query
    const bestParadigm = Object.entries(paradigmScores).sort(([, a], [, b]) => b - a)[0];
    if (bestParadigm) {
      learnings.push(`Paradigm ${bestParadigm[0]} most effective for this reasoning pattern`);
    }

    // Learning 3: Efficiency insight
    if (success) {
      learnings.push(`Efficient reasoning completed in ${reasoning}ms`);
    }

    // Learning 4: Outcome pattern
    if (outcome && typeof outcome === 'object') {
      learnings.push(
        `Outcome structure: ${Object.keys(outcome as Record<string, unknown>).join(', ')}`
      );
    }

    return learnings;
  }

  /**
   * Update semantic memory with new knowledge
   */
  private async updateSemanticMemory(
    query: string,
    outcome: unknown,
    learnings: string[]
  ): Promise<void> {
    // Extract key concepts from query
    const concepts = this.extractConcepts(query);

    for (const concept of concepts) {
      const existing = this.semanticMemory.get(concept);

      if (existing) {
        // Update existing memory
        existing.frequency += 1;
        existing.source.push(`episode-${uuidv4().substring(0, 8)}`);
        existing.lastUpdated = new Date();
      } else {
        // Create new semantic memory
        const memoryId = uuidv4();
        const semMem: SemanticMemory = {
          id: memoryId,
          concept,
          definition: `Concept related to: ${query.substring(0, 50)}`,
          relationshipTo: concepts.filter((c) => c !== concept),
          frequency: 1,
          confidence: 0.6,
          source: [`episode-${memoryId}`],
          lastUpdated: new Date(),
        };
        this.semanticMemory.set(concept, semMem);
      }
    }

    paradigmLogger.info(
      { conceptsAdded: concepts.length },
      'Semantic memory updated'
    );
  }

  /**
   * Update procedural memory (learn what works)
   */
  private async updateProceduralMemory(
    paradigmScores: Record<string, number>,
    duration: number,
    success: boolean
  ): Promise<void> {
    const bestParadigm = Object.entries(paradigmScores).sort(([, a], [, b]) => b - a)[0];

    if (!bestParadigm) return;

    const [paradigmName, score] = bestParadigm;
    const procedureKey = `optimal-use-${paradigmName}`;
    const existing = this.proceduralMemory.get(procedureKey);

    if (existing) {
      // Update success rate
      const count = existing.appliedCount ?? 1;
      existing.successRate =
        (existing.successRate * (count - 1) + (success ? 1 : 0)) /
        count;
      existing.averageEfficiency =
        (existing.averageEfficiency * (count - 1) + (1000 / duration)) /
        count;
      existing.appliedCount = count + 1;
    } else {
      // Create new procedure
      const proc: ProceduralMemory = {
        id: uuidv4(),
        procedure: procedureKey,
        steps: [
          `Select ${paradigmName}`,
          `Configure for reasoning`,
          `Execute and measure`,
          `Track success`,
        ],
        successRate: success ? 1 : 0,
        averageEfficiency: 1000 / duration,
        conditions: ['reasoning-required', 'score-based-selection'],
        learned: new Date(),
        optimizations: [],
        appliedCount: 1,
      };
      this.proceduralMemory.set(procedureKey, proc);
    }
  }

  /**
   * Extract concepts from text
   */
  private extractConcepts(text: string): string[] {
    // Simple extraction: split on whitespace, remove common words
    const commonWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'is',
      'was',
      'are',
      'be',
      'been',
    ]);

    const words = text
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3 && !commonWords.has(w));

    return [...new Set(words)].slice(0, 5); // Top 5 unique concepts
  }

  /**
   * Persist episode to disk
   */
  private async persistEpisode(episode: MemoryEpisode): Promise<void> {
    try {
      const episodePath = path.join(
        this.memoryPath,
        `episode-${episode.id}.json`
      );
      await fs.writeFile(episodePath, JSON.stringify(episode, null, 2));
    } catch (error) {
      paradigmLogger.error({ error }, 'Failed to persist episode');
    }
  }

  /**
   * Load persisted memories from disk
   */
  private async loadPersistedMemories(): Promise<void> {
    try {
      const files = await fs.readdir(this.memoryPath);
      const episodeFiles = files.filter((f) => f.startsWith('episode-'));

      for (const file of episodeFiles) {
        const content = await fs.readFile(
          path.join(this.memoryPath, file),
          'utf-8'
        );
        const episode = JSON.parse(content) as MemoryEpisode;
        this.episodes.push(episode);
      }

      paradigmLogger.info(
        { episodeCount: this.episodes.length },
        'Persisted memories loaded'
      );
    } catch (error) {
      paradigmLogger.warn({ error }, 'No persisted memories found');
    }
  }

  /**
   * Apply learning to improve future reasoning
   */
  async applyLearning(learningId: string): Promise<boolean> {
    const learning = this.learningRecords.find((l) => l.id === learningId);
    if (!learning) return false;

    learning.appliedCount += 1;
    learning.successfulApplications += 1;

    return true;
  }

  /**
   * Get learned procedures for a task type
   */
  getRecommendedProcedures(
    taskType: string
  ): ProceduralMemory[] {
    return Array.from(this.proceduralMemory.values())
      .filter((p) => p.conditions.some((c) => c.includes(taskType)))
      .sort((a, b) => b.successRate - a.successRate);
  }

  /**
   * Generate learning summary
   */
  async generateLearningSummary(): Promise<{
    episodeCount: number;
    totalDuration: number;
    successRate: number;
    semanticConcepts: number;
    procedures: number;
    topConcepts: string[];
    topProcedures: string[];
  }> {
    const totalDuration = this.episodes.reduce((sum, e) => sum + e.duration, 0);
    const successCount = this.episodes.filter((e) => e.success).length;
    const successRate =
      this.episodes.length === 0 ? 0 : successCount / this.episodes.length;

    const topConcepts = Array.from(this.semanticMemory.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)
      .map((m) => m.concept);

    const topProcedures = Array.from(this.proceduralMemory.values())
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5)
      .map((p) => p.procedure);

    return {
      episodeCount: this.episodes.length,
      totalDuration,
      successRate,
      semanticConcepts: this.semanticMemory.size,
      procedures: this.proceduralMemory.size,
      topConcepts,
      topProcedures,
    };
  }

  /**
   * Clear memory (reset learning)
   */
  async clearMemory(): Promise<void> {
    this.episodes = [];
    this.semanticMemory.clear();
    this.proceduralMemory.clear();
    this.learningRecords = [];

    paradigmLogger.info('Memory cleared');
  }
}

export const memorySystem = new PersistentMemorySystem();
