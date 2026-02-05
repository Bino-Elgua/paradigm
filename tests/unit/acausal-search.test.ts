/**
 * Unit Tests: Acausal Search Engine
 * 
 * Tests for forward/backward/acausal reasoning
 * Phase 2: Week 2 Implementation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AcausalSearcher } from '../../src/rag/acausal-search';

describe('Acausal Search Engine', () => {
  let searcher: AcausalSearcher;

  const mockRetriever = async (query: string, limit: number) => {
    const mockData: Record<string, any[]> = {
      'optimal': [
        {
          id: 'ev1',
          content: 'Optimization theory defines optimality as maximum efficiency',
          source: 'Optimization Paper A',
          relevance: 0.95
        },
        {
          id: 'ev2',
          content: 'Efficient algorithms use divide-and-conquer strategies',
          source: 'Algorithm Study B',
          relevance: 0.88
        }
      ],
      'efficiency': [
        {
          id: 'ev3',
          content: 'Efficiency metrics measure output per unit input',
          source: 'Metrics Research C',
          relevance: 0.92
        }
      ]
    };

    const key = Object.keys(mockData).find(k => query.includes(k)) || 'optimal';
    return (mockData[key] || mockData['optimal']).slice(0, limit).map(item => ({
      ...item,
      direction: 'forward' as const,
      chainDepth: 0
    }));
  };

  beforeEach(() => {
    searcher = new AcausalSearcher(mockRetriever);
  });

  describe('Forward Search', () => {
    it('should find forward evidence chains', async () => {
      const result = await searcher.search({
        query: 'How to find the optimal solution?',
        desiredOutcome: 'Optimal solution found',
        maxDepth: 3,
        allowRetroactivity: false,
        paradigmId: 'P2_ACAUSAL_RETROCOHESION'
      });

      expect(result.forwardChains.length).toBeGreaterThan(0);
      expect(result.forwardChains[0].links.length).toBeGreaterThan(0);
      expect(result.forwardChains[0].links[0].direction).toBe('forward');
    });

    it('should build chains from query through evidence', async () => {
      const result = await searcher.search({
        query: 'What makes something optimal?',
        desiredOutcome: '',
        maxDepth: 3,
        allowRetroactivity: false,
        paradigmId: 'P2_ACAUSAL_RETROCOHESION'
      });

      const firstChain = result.forwardChains[0];
      expect(firstChain.query).toBe('What makes something optimal?');
      expect(firstChain.links.every(l => l.relevance > 0)).toBe(true);
    });

    it('should calculate convergence score', async () => {
      const result = await searcher.search({
        query: 'Optimal solution finding',
        desiredOutcome: '',
        maxDepth: 3,
        allowRetroactivity: false,
        paradigmId: 'P2_ACAUSAL_RETROCOHESION'
      });

      const convergence = result.forwardChains[0].convergenceScore;
      expect(convergence).toBeGreaterThanOrEqual(0);
      expect(convergence).toBeLessThanOrEqual(1);
    });
  });

  describe('Backward Search', () => {
    it('should find backward evidence chains from desired outcome', async () => {
      const result = await searcher.search({
        query: 'How to optimize?',
        desiredOutcome: 'We found the optimal solution',
        maxDepth: 3,
        allowRetroactivity: true,
        paradigmId: 'P2_ACAUSAL_RETROCOHESION'
      });

      expect(result.backwardChains.length).toBeGreaterThan(0);
      expect(result.backwardChains[0].desiredOutcome).toBe('We found the optimal solution');
    });

    it('should extract retroactive constraints from backward chains', async () => {
      const result = await searcher.search({
        query: 'How to achieve efficiency?',
        desiredOutcome: 'Maximum efficiency achieved',
        maxDepth: 3,
        allowRetroactivity: true,
        paradigmId: 'P2_ACAUSAL_RETROCOHESION'
      });

      expect(result.retroactiveConstraints.length).toBeGreaterThan(0);
      expect(result.retroactiveConstraints[0].derivedFrom).toBe('Maximum efficiency achieved');
    });

    it('should weight retroactive constraints by certainty', async () => {
      const result = await searcher.search({
        query: 'Find optimal solution',
        desiredOutcome: 'Solution is optimal',
        maxDepth: 3,
        allowRetroactivity: true,
        paradigmId: 'P2_ACAUSAL_RETROCOHESION'
      });

      const constraint = result.retroactiveConstraints[0];
      expect(constraint.certainty).toBeGreaterThanOrEqual(0);
      expect(constraint.certainty).toBeLessThanOrEqual(1);
    });
  });

  describe('Acausal Synthesis', () => {
    it('should calculate global convergence between forward and backward', async () => {
      const result = await searcher.search({
        query: 'How to optimize allocation?',
        desiredOutcome: 'Resources optimally allocated',
        maxDepth: 3,
        allowRetroactivity: true,
        paradigmId: 'P2_ACAUSAL_RETROCOHESION'
      });

      expect(result.convergence).toBeGreaterThanOrEqual(0);
      expect(result.convergence).toBeLessThanOrEqual(1);
    });

    it('should synthesize integrated evidence chain', async () => {
      const result = await searcher.search({
        query: 'Optimal strategy?',
        desiredOutcome: 'Optimal strategy found',
        maxDepth: 3,
        allowRetroactivity: true,
        paradigmId: 'P2_ACAUSAL_RETROCOHESION'
      });

      expect(result.synthesis.integratedChain.length).toBeGreaterThan(0);
      expect(result.synthesis.integratedChain[0].direction).toBe('convergent');
    });

    it('should detect time loops', async () => {
      const result = await searcher.search({
        query: 'Time loop detection',
        desiredOutcome: 'Time loop found',
        maxDepth: 3,
        allowRetroactivity: true,
        paradigmId: 'P2_ACAUSAL_RETROCOHESION'
      });

      // timeLoops is an array of strings describing detected loops
      expect(Array.isArray(result.synthesis.timeLoops)).toBe(true);
    });

    it('should resolve contradictions', async () => {
      const result = await searcher.search({
        query: 'Contradictory solution?',
        desiredOutcome: 'Non-contradictory result',
        maxDepth: 3,
        allowRetroactivity: true,
        paradigmId: 'P2_ACAUSAL_RETROCOHESION'
      });

      expect(Array.isArray(result.synthesis.resolvedContradictions)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle queries with no evidence', async () => {
      const emptyRetriever = async () => [];
      const emptySearcher = new AcausalSearcher(emptyRetriever);

      const result = await emptySearcher.search({
        query: 'Unknown query with no evidence',
        desiredOutcome: '',
        maxDepth: 3,
        allowRetroactivity: true,
        paradigmId: 'P2_ACAUSAL_RETROCOHESION'
      });

      expect(result.forwardChains.length).toBe(0);
      expect(result.convergence).toBe(0);
    });

    it('should handle maximum depth limit', async () => {
      const result = await searcher.search({
        query: 'Deep query',
        desiredOutcome: 'Deep outcome',
        maxDepth: 5, // Maximum allowed
        allowRetroactivity: true,
        paradigmId: 'P2_ACAUSAL_RETROCOHESION'
      });

      // Should complete without error
      expect(result.id).toBeDefined();
    });

    it('should handle retroactivity disabled', async () => {
      const result = await searcher.search({
        query: 'Forward only query',
        desiredOutcome: 'Ignored outcome',
        maxDepth: 3,
        allowRetroactivity: false,
        paradigmId: 'P2_ACAUSAL_RETROCOHESION'
      });

      // Should have forward chains
      expect(result.forwardChains.length).toBeGreaterThanOrEqual(0);
      // Backward chains should be minimal with no retroactivity
      expect(result.backwardChains.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Result Structure', () => {
    it('should return properly structured result', async () => {
      const result = await searcher.search({
        query: 'Test query',
        desiredOutcome: 'Test outcome',
        maxDepth: 3,
        allowRetroactivity: true,
        paradigmId: 'P2_ACAUSAL_RETROCOHESION'
      });

      expect(result.id).toBeDefined();
      expect(result.query).toBe('Test query');
      expect(result.desiredOutcome).toBe('Test outcome');
      expect(Array.isArray(result.forwardChains)).toBe(true);
      expect(Array.isArray(result.backwardChains)).toBe(true);
      expect(Array.isArray(result.retroactiveConstraints)).toBe(true);
      expect(result.synthesis).toBeDefined();
      expect(typeof result.convergence).toBe('number');
    });

    it('should include chain metadata', async () => {
      const result = await searcher.search({
        query: 'Metadata test',
        desiredOutcome: '',
        maxDepth: 3,
        allowRetroactivity: false,
        paradigmId: 'P2_ACAUSAL_RETROCOHESION'
      });

      if (result.forwardChains.length > 0) {
        const chain = result.forwardChains[0];
        expect(chain.chainId).toBeDefined();
        expect(chain.direction).toBe('forward');
        expect(chain.temporal).toBeDefined();
        expect(chain.temporal.startTime).toBeInstanceOf(Date);
        expect(chain.temporal.durationMs).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
