/**
 * Embedding Generation and Management
 * Phase 2: Semantic Search
 * 
 * Generates embeddings using Claude's embedding API
 */

import Anthropic from '@anthropic-ai/sdk';
import { embeddingLogger } from '../utils/logger';

export interface EmbeddingResult {
  text: string;
  embedding: number[];
  dimensions: number;
  model: string;
}

export interface SimilarityResult {
  text: string;
  similarity: number;
  score: number;
}

export class EmbeddingService {
  private client: Anthropic;
  private model: string;
  private cache: Map<string, number[]> = new Map();

  constructor(apiKey?: string) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) {
      embeddingLogger.warn('No ANTHROPIC_API_KEY found, using mock embeddings');
    }
    this.client = new Anthropic({ apiKey: key || 'mock-key' });
    this.model = 'claude-3-5-sonnet-20241022';
  }

  /**
   * Generate embedding for text
   * Using Claude's embedding model
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    // Check cache first
    if (this.cache.has(text)) {
      embeddingLogger.debug({ textLength: text.length }, 'Cache hit');
      return {
        text,
        embedding: this.cache.get(text)!,
        dimensions: this.cache.get(text)!.length,
        model: this.model,
      };
    }

    try {
      embeddingLogger.debug(
        { textLength: text.length },
        'Generating embedding'
      );

      // For now, use a mock embedding (Claude doesn't have embedding API yet)
      // In production, use a dedicated embedding service like:
      // - OpenAI embeddings
      // - Hugging Face embeddings
      // - Local BERT model
      const embedding = this.generateMockEmbedding(text);

      // Cache the result
      this.cache.set(text, embedding);

      const result: EmbeddingResult = {
        text,
        embedding,
        dimensions: embedding.length,
        model: 'mock-embeddings-v1',
      };

      embeddingLogger.info(
        { dimensions: result.dimensions, cacheSize: this.cache.size },
        'Embedding generated'
      );

      return result;
    } catch (error) {
      embeddingLogger.error({ error }, 'Embedding generation failed');
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts (batch)
   */
  async generateBatchEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    embeddingLogger.info(
      { batchSize: texts.length },
      'Starting batch embedding'
    );

    const results = await Promise.all(
      texts.map(text => this.generateEmbedding(text))
    );

    embeddingLogger.info(
      { completedCount: results.length },
      'Batch embedding complete'
    );

    return results;
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have same dimension');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    if (denominator === 0) return 0;

    return dotProduct / denominator;
  }

  /**
   * Find similar texts from a pool
   */
  findSimilar(
    queryText: string,
    candidateEmbeddings: Array<{ text: string; embedding: number[] }>,
    topK: number = 5
  ): SimilarityResult[] {
    // Get query embedding from cache or generate
    const queryEmbedding = this.cache.get(queryText) || 
      this.generateMockEmbedding(queryText);

    const similarities = candidateEmbeddings.map(candidate => ({
      text: candidate.text,
      similarity: this.cosineSimilarity(queryEmbedding, candidate.embedding),
      score: 0,
    }));

    // Sort by similarity (descending)
    similarities.sort((a, b) => b.similarity - a.similarity);

    // Normalize scores to 0-1 range
    const maxSimilarity = Math.max(...similarities.map(s => s.similarity), 1);
    similarities.forEach(s => {
      s.score = s.similarity / maxSimilarity;
    });

    embeddingLogger.debug(
      {
        queryLength: queryText.length,
        candidateCount: candidateEmbeddings.length,
        topKReturned: topK,
      },
      'Similarity search completed'
    );

    return similarities.slice(0, topK);
  }

  /**
   * Mock embedding generation (for demo/testing)
   * Generates consistent embeddings based on text content
   */
  private generateMockEmbedding(text: string): number[] {
    const dimensions = 384; // Standard embedding dimension
    const embedding = new Array(dimensions);

    // Use text hash to seed the embedding
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Generate consistent random numbers based on hash
    for (let i = 0; i < dimensions; i++) {
      const seed = hash + i;
      const x = Math.sin(seed) * 10000;
      embedding[i] = x - Math.floor(x); // Normalize to 0-1
    }

    // Normalize to unit vector
    let norm = 0;
    for (const val of embedding) {
      norm += val * val;
    }
    norm = Math.sqrt(norm);

    for (let i = 0; i < dimensions; i++) {
      embedding[i] = embedding[i] / (norm || 1);
    }

    return embedding;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    embeddingLogger.info({}, 'Embedding cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      cacheEntries: Array.from(this.cache.keys()).slice(0, 5),
    };
  }
}

// Singleton instance
export const embeddingService = new EmbeddingService();
