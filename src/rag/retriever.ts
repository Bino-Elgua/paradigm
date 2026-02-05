/**
 * RAG Retriever (Paradigm 2: Acausal Retrocohesion)
 * 
 * Outcome-conditioned retrieval (Phase 2).
 * Basic forward retrieval in Phase 1.
 */

import { ragLogger } from '../utils/logger';
import { EvidenceItem } from '../types';
import { vectordb } from '@vectordb/client.js';

export class RAGRetriever {
  /**
   * Retrieve evidence for query
   * Phase 1: Basic forward retrieval
   * Phase 2: Outcome-conditioned (future determines past)
   */
  async retrieve(
    query: string,
    limit: number = 5
  ): Promise<EvidenceItem[]> {
    ragLogger.info(
      {
        query: query.substring(0, 50),
        limit,
      },
      'Retrieving evidence'
    );

    try {
      // Phase 1: Create embedding from query text
      const embedding = await this.generateEmbedding(query);
      
      const searchResults = await vectordb.search(
        embedding,
        limit
      );

      const evidence: EvidenceItem[] = searchResults.map((result, idx) => ({
        source: result.vector.metadata?.source || 'vectordb',
        content: result.vector.content,
        relevanceScore: result.similarity,
        embedding: result.vector.embedding,
        timestamp: new Date(),
      }));

      ragLogger.debug(
        { retrievedCount: evidence.length },
        'Evidence retrieved'
      );

      return evidence;
    } catch (error: any) {
      ragLogger.error(
        { error: error.message },
        'Evidence retrieval failed, using fallback'
      );
      
      // Fallback: return default evidence
      return this.getFallbackEvidence(query, limit);
    }
  }

  /**
   * Generate embedding for query text
   * Phase 1: Deterministic embedding
   * Phase 2+: Claude embeddings API
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // Phase 1: Deterministic hash-based embedding for testing
    // In Phase 2, this will use Claude embeddings API
    const embedding = Array(384).fill(0);
    
    // Create deterministic embedding from text hash
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    // Populate embedding with pseudo-random values seeded by hash
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] = Math.sin(hash + i) * 0.5 + 0.5;
    }
    
    return embedding;
  }

  /**
   * Fallback evidence when retrieval fails
   */
  private getFallbackEvidence(query: string, limit: number): EvidenceItem[] {
    const fallback: EvidenceItem[] = [
      {
        source: 'fallback-reasoning',
        content: `Direct reasoning about: "${query.substring(0, 100)}"`,
        relevanceScore: 0.9,
        timestamp: new Date(),
      },
      {
        source: 'fallback-context',
        content: 'Contextual background for distributed system optimization',
        relevanceScore: 0.8,
        timestamp: new Date(),
      },
    ];

    return fallback.slice(0, limit);
  }

  /**
   * Rank evidence by relevance
   */
  rankEvidence(evidence: EvidenceItem[]): EvidenceItem[] {
    return evidence.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Filter evidence by confidence threshold
   */
  filterByConfidence(evidence: EvidenceItem[], threshold: number = 0.7): EvidenceItem[] {
    return evidence.filter((e) => e.relevanceScore >= threshold);
  }
}

export const ragRetriever = new RAGRetriever();
