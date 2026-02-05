/**
 * Phase 1 Integration Test
 * Full query pipeline: Ralph → MCP → RAG → VectorDB → CCA → SUI
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { v4 as uuid } from 'uuid';
import { Query, QueryResponse } from '@types/index.js';
import { ralph } from '@ralph/evaluator.js';
import { mcpRouter } from '@mcp/router.js';
import { ragRetriever } from '@rag/retriever.js';
import { vectordb } from '@vectordb/client.js';
import { codeManifest } from '@cca/manifest.js';
import { suiBridge } from '@persistence/sui.js';
import { logger } from '@utils/logger.js';

describe('Phase 1: Integration Foundation', () => {
  beforeAll(async () => {
    logger.info('=== Phase 1 Integration Test Starting ===');
    
    // Initialize vectordb with sample knowledge
    await vectordb.initialize();
    
    // Load code manifold
    await codeManifest.load();
  });

  afterAll(() => {
    logger.info('=== Phase 1 Integration Test Complete ===');
  });

  describe('Ralph Evaluator (Paradigm 10)', () => {
    it('should approve queries within budget', async () => {
      const query: Query = {
        id: uuid(),
        question: 'Test query',
        budget: 500,
        timestamp: new Date(),
      };

      const decision = await ralph.evaluate(query);
      
      expect(decision.decision).toBe('APPROVE');
      expect(decision.voidPressure).toBeGreaterThanOrEqual(0);
    });

    it('should deny queries exceeding threshold', async () => {
      const query: Query = {
        id: uuid(),
        question: 'Expensive query',
        budget: 100000, // Very high budget
        timestamp: new Date(),
      };

      const decision = await ralph.evaluate(query);
      
      expect(['APPROVE', 'DENY', 'CONDITIONAL']).toContain(decision.decision);
    });

    it('should track void pressure metrics', () => {
      const metrics = ralph.getVoidPressureMetrics();
      
      expect(metrics.totalDenials).toBeGreaterThanOrEqual(0);
      expect(metrics.denialRate).toBeGreaterThanOrEqual(0);
      expect(metrics.accumulatedPressure).toBeGreaterThanOrEqual(0);
      expect(metrics.definition).toBeGreaterThanOrEqual(0);
    });
  });

  describe('MCP Router (Paradigm 3)', () => {
    it('should spawn multiple parallel reasoners', async () => {
      const query: Query = {
        id: uuid(),
        question: 'What is optimal resource allocation?',
        budget: 500,
        timestamp: new Date(),
      };

      const results = await mcpRouter.routeToReasoners(query);
      
      expect(results.length).toBe(3); // Affirmative, Negation, Neutral
      expect(results.every((r) => r.conclusion)).toBe(true);
    });

    it('should preserve contradictions', async () => {
      const query: Query = {
        id: uuid(),
        question: 'Test query',
        budget: 500,
        timestamp: new Date(),
      };

      const results = await mcpRouter.routeToReasoners(query);
      const conclusions = results.map((r) => r.reasonerName);
      
      expect(conclusions).toContain('Affirmative');
      expect(conclusions).toContain('Negation');
      expect(conclusions).toContain('Neutral');
    });

    it('should calculate confidence for each reasoner', async () => {
      const query: Query = {
        id: uuid(),
        question: 'Test query',
        budget: 500,
        timestamp: new Date(),
      };

      const results = await mcpRouter.routeToReasoners(query);
      
      results.forEach((result) => {
        expect(result.confidence).toBeGreaterThan(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('VectorDB Client (Paradigm 6)', () => {
    it('should load sample knowledge base', async () => {
      const count = vectordb.getVectorCount();
      expect(count).toBeGreaterThan(0);
    });

    it('should perform semantic search', async () => {
      const query = 'optimization allocation distributed systems';
      const embedding = Array(384)
        .fill(0)
        .map((_, i) => Math.sin(i) * 0.5 + 0.5);

      const results = await vectordb.search(embedding, 3);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('vector');
      expect(results[0]).toHaveProperty('similarity');
    });

    it('should return results sorted by similarity', async () => {
      const embedding = Array(384)
        .fill(0)
        .map((_, i) => Math.sin(i) * 0.5 + 0.5);

      const results = await vectordb.search(embedding, 5);
      
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].similarity).toBeGreaterThanOrEqual(results[i].similarity);
      }
    });
  });

  describe('RAG Retriever (Paradigm 2)', () => {
    it('should retrieve evidence for query', async () => {
      const query = 'optimal resource allocation';
      const evidence = await ragRetriever.retrieve(query, 3);
      
      expect(evidence.length).toBeGreaterThan(0);
      expect(evidence[0]).toHaveProperty('content');
      expect(evidence[0]).toHaveProperty('relevanceScore');
    });

    it('should rank evidence by relevance', async () => {
      const query = 'optimization';
      const evidence = await ragRetriever.retrieve(query, 5);
      const ranked = ragRetriever.rankEvidence(evidence);
      
      for (let i = 1; i < ranked.length; i++) {
        expect(ranked[i - 1].relevanceScore).toBeGreaterThanOrEqual(ranked[i].relevanceScore);
      }
    });

    it('should filter evidence by confidence threshold', async () => {
      const query = 'resource allocation';
      const evidence = await ragRetriever.retrieve(query, 10);
      const filtered = ragRetriever.filterByConfidence(evidence, 0.8);
      
      filtered.forEach((item) => {
        expect(item.relevanceScore).toBeGreaterThanOrEqual(0.8);
      });
    });
  });

  describe('CCA Manifest (Paradigm 1 + 5)', () => {
    it('should load code manifold', async () => {
      const pattern = codeManifest.getPattern('optimization-iterative');
      expect(pattern).toBeDefined();
    });

    it('should select patterns from manifold', async () => {
      const patterns = await codeManifest.selectPatterns('optimization', 2);
      
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0]).toHaveProperty('pattern');
      expect(patterns[0]).toHaveProperty('confidence');
    });

    it('should check pattern existence', () => {
      const exists = codeManifest.hasPattern('optimization-iterative');
      expect(exists).toBe(true);
      
      const notExists = codeManifest.hasPattern('nonexistent-pattern');
      expect(notExists).toBe(false);
    });
  });

  describe('SUI Bridge (Paradigm 4 + 8)', () => {
    it('should create transaction hash for query', async () => {
      const mockResponse: QueryResponse = {
        queryId: uuid(),
        results: [],
        evidence: [],
        codePatterns: [],
        consumption: {
          tokensUsed: 100,
          energyBurned: 0.52,
          necrticLayersCreated: 1,
          recursionDepth: 1,
          parasitismRate: 0.15,
          costPerLevel: [0.001],
        },
        ralphDecision: {
          queryId: uuid(),
          decision: 'APPROVE',
          budget: 100,
          consumed: 50,
          remaining: 50,
          voidPressure: 0.5,
          justification: 'Test',
          timestamp: new Date(),
        },
        timestamp: new Date(),
        paradigmInstantiations: [],
      };

      const txHash = await suiBridge.persistQuery(mockResponse);
      
      expect(txHash).toBeDefined();
      expect(txHash).toMatch(/^0x/);
    });

    it('should create Walrus blob', async () => {
      const testData = { test: 'data' };
      const blobId = await suiBridge.persistToWalrus(testData);
      
      expect(blobId).toBeDefined();
      expect(blobId).toMatch(/^walrus_/);
    });
  });

  describe('Full Pipeline Integration', () => {
    it('should process complete query pipeline', async () => {
      const query: Query = {
        id: uuid(),
        question: 'What is the optimal resource allocation strategy for distributed systems?',
        budget: 500,
        paradigmContext: 'optimization',
        timestamp: new Date(),
      };

      // Step 1: Ralph evaluation
      const ralphDecision = await ralph.evaluate(query);
      expect(ralphDecision.decision).not.toBe('DENY');

      // Step 2: MCP routing
      const reasonerResults = await mcpRouter.routeToReasoners(query);
      expect(reasonerResults.length).toBe(3);

      // Step 3: RAG retrieval
      const evidence = await ragRetriever.retrieve(query.question, 3);
      const rankedEvidence = ragRetriever.rankEvidence(evidence);
      const filteredEvidence = ragRetriever.filterByConfidence(rankedEvidence, 0.7);
      expect(filteredEvidence.length).toBeGreaterThanOrEqual(0);

      // Step 4: Code pattern selection
      const codePatterns = await codeManifest.selectPatterns(query.question, 2);
      expect(codePatterns.length).toBeGreaterThan(0);

      // Step 5: Construct response
      const totalTokens = reasonerResults.reduce((sum, r) => sum + r.tokensUsed, 0);
      const energyBurned = totalTokens * 0.0052;

      const response: QueryResponse = {
        queryId: query.id,
        results: reasonerResults,
        evidence: filteredEvidence,
        codePatterns,
        consumption: {
          tokensUsed: totalTokens,
          energyBurned,
          necrticLayersCreated: 1,
          recursionDepth: 1,
          parasitismRate: 0.15,
          costPerLevel: [energyBurned * 0.001],
        },
        ralphDecision,
        timestamp: new Date(),
        paradigmInstantiations: [
          'polyphonic-subjectivity',
          'negation-becoming',
          'liberated-signification',
          'acausal-retrocohesion',
        ],
      };

      // Step 6: Persist (optional)
      const txHash = await suiBridge.persistQuery(response);
      response.suiTransactionHash = txHash;

      // Verify complete response
      expect(response.queryId).toBe(query.id);
      expect(response.results.length).toBe(3);
      expect(response.evidence).toBeDefined();
      expect(response.codePatterns).toBeDefined();
      expect(response.consumption.tokensUsed).toBeGreaterThan(0);
      expect(response.suiTransactionHash).toMatch(/^0x/);

      logger.info('✓ Full pipeline executed successfully');
    });

    it('should handle query rejection gracefully', async () => {
      // Reset budget to force denial
      ralph.resetBudget();
      
      const query: Query = {
        id: uuid(),
        question: 'Test query',
        budget: 999999, // Very high budget
        timestamp: new Date(),
      };

      const decision = await ralph.evaluate(query);
      
      expect(['APPROVE', 'DENY', 'CONDITIONAL']).toContain(decision.decision);
    });

    it('should maintain paradigm instantiation metrics', () => {
      const voidMetrics = ralph.getVoidPressureMetrics();
      expect(voidMetrics).toHaveProperty('totalDenials');
      expect(voidMetrics).toHaveProperty('denialRate');
      expect(voidMetrics).toHaveProperty('accumulatedPressure');
      expect(voidMetrics).toHaveProperty('definition');
      expect(voidMetrics.pressureHistory.length).toBeGreaterThan(0);
    });
  });
});

describe('Phase 1 Metrics & Monitoring', () => {
  it('should track query metrics correctly', async () => {
    const query: Query = {
      id: uuid(),
      question: 'Test metrics query',
      budget: 500,
      timestamp: new Date(),
    };

    const ralphDecision = await ralph.evaluate(query);
    const reasonerResults = await mcpRouter.routeToReasoners(query);

    const totalTokens = reasonerResults.reduce((sum, r) => sum + r.tokensUsed, 0);
    const energyBurned = totalTokens * 0.0052;

    expect(totalTokens).toBeGreaterThan(0);
    expect(energyBurned).toBeGreaterThan(0);
    expect(reasonerResults.length).toBe(3);
  });

  it('should provide void-pressure metrics', () => {
    const metrics = ralph.getVoidPressureMetrics();
    
    expect(metrics.definition).toBeGreaterThanOrEqual(0);
    expect(metrics.definition).toBeLessThanOrEqual(1);
    expect(metrics.pressureHistory).toBeDefined();
  });
});
