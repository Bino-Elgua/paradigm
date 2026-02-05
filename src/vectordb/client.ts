/**
 * VectorDB Client (Paradigm 6: Liberated Signification)
 * 
 * Semantic embedding space where meaning emerges from topology.
 * [Phase 1] In-memory for testing, ready for Qdrant in Phase 2
 */

import { vectordbLogger } from '../utils/logger';
import { SemanticVector, SemanticSearchResult } from '../types';

export class VectorDBClient {
  private vectors: Map<string, SemanticVector> = new Map();
  private sampleKnowledge: SemanticVector[] = [];

  async initialize(): Promise<void> {
    vectordbLogger.info('VectorDB client initialized (in-memory)');
    
    // Load sample knowledge base
    await this.loadSampleKnowledge();
  }

  /**
   * Load sample knowledge base for Phase 1 testing
   */
  private async loadSampleKnowledge(): Promise<void> {
    const samples: SemanticVector[] = [
      {
        id: 'kb-optimization-1',
        content: 'Iterative optimization strategies for resource allocation in distributed systems',
        embedding: this.generateEmbedding('optimization allocation strategy'),
        metadata: { source: 'distributed-systems', category: 'optimization', score: 0.95 },
      },
      {
        id: 'kb-optimization-2',
        content: 'Dynamic programming for constraint satisfaction in multi-agent systems',
        embedding: this.generateEmbedding('dynamic programming constraints'),
        metadata: { source: 'algorithms', category: 'dynamic-programming', score: 0.92 },
      },
      {
        id: 'kb-optimization-3',
        content: 'Greedy algorithms and approximation methods for NP-hard resource problems',
        embedding: this.generateEmbedding('greedy algorithms approximation NP'),
        metadata: { source: 'theory', category: 'algorithms', score: 0.88 },
      },
      {
        id: 'kb-optimization-4',
        content: 'Load balancing and scheduling in cloud computing architectures',
        embedding: this.generateEmbedding('load balancing scheduling cloud'),
        metadata: { source: 'cloud-computing', category: 'scheduling', score: 0.91 },
      },
      {
        id: 'kb-optimization-5',
        content: 'Game theory approaches to distributed decision making and equilibrium',
        embedding: this.generateEmbedding('game theory distributed decision'),
        metadata: { source: 'game-theory', category: 'decision-making', score: 0.89 },
      },
    ];

    for (const sample of samples) {
      this.vectors.set(sample.id, sample);
      this.sampleKnowledge.push(sample);
    }

    vectordbLogger.info(
      { vectorCount: this.vectors.size },
      'Sample knowledge base loaded'
    );
  }

  /**
   * Search semantic space
   * Paradigm 6: Meaning through differential topology
   * Uses cosine similarity for Phase 1
   */
  async search(
    embedding: number[],
    limit: number = 5
  ): Promise<SemanticSearchResult[]> {
    vectordbLogger.debug(
      {
        embeddingDim: embedding.length,
        limit,
        vectorsAvailable: this.vectors.size,
      },
      'Semantic search'
    );

    // Calculate similarity with all vectors
    const results: SemanticSearchResult[] = [];

    for (const vector of this.vectors.values()) {
      const similarity = this.cosineSimilarity(embedding, vector.embedding);
      const distance = 1 - similarity;

      results.push({
        vector,
        distance,
        similarity,
      });
    }

    // Sort by similarity (descending) and limit
    results.sort((a, b) => b.similarity - a.similarity);
    
    const topResults = results.slice(0, Math.min(limit, results.length));

    vectordbLogger.debug(
      {
        resultsReturned: topResults.length,
        topSimilarity: topResults[0]?.similarity.toFixed(3),
      },
      'Search completed'
    );

    return topResults;
  }

  /**
   * Cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (normA * normB);
  }

  /**
   * Generate deterministic embedding from text
   * Phase 1: Deterministic for testing
   * Phase 2: Claude embeddings API
   */
  private generateEmbedding(text: string): number[] {
    const embedding = Array(384).fill(0);
    
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] = Math.sin(hash + i * 7) * 0.5 + 0.5;
    }
    
    return embedding;
  }

  /**
   * Store embedding
   */
  async store(vector: SemanticVector): Promise<void> {
    this.vectors.set(vector.id, vector);
    vectordbLogger.debug(
      { vectorId: vector.id },
      'Vector stored'
    );
  }

  /**
   * Bulk store embeddings
   */
  async storeBatch(vectors: SemanticVector[]): Promise<void> {
    for (const vector of vectors) {
      this.vectors.set(vector.id, vector);
    }
    
    vectordbLogger.info(
      { batchSize: vectors.length, totalVectors: this.vectors.size },
      'Batch store completed'
    );
  }

  /**
   * Delete embedding
   */
  async delete(vectorId: string): Promise<void> {
    this.vectors.delete(vectorId);
    vectordbLogger.debug({ vectorId }, 'Vector deleted');
  }

  /**
   * Get vector by ID
   */
  async get(vectorId: string): Promise<SemanticVector | null> {
    return this.vectors.get(vectorId) || null;
  }

  /**
   * Clear all vectors
   */
  async clear(): Promise<void> {
    this.vectors.clear();
    vectordbLogger.warn({}, 'All vectors cleared');
  }

  /**
   * Get vector count
   */
  getVectorCount(): number {
    return this.vectors.size;
  }

  /**
   * Get all vectors (for debugging)
   */
  getAllVectors(): SemanticVector[] {
    return Array.from(this.vectors.values());
  }
}

export const vectordb = new VectorDBClient();
