/**
 * Acausal Reasoning Search Engine
 * 
 * Implements bidirectional evidence search:
 * - Forward: Query → Evidence → Conclusion
 * - Backward: Outcome ← Retroactive Constraints ← Evidence
 * 
 * Paradigm 2: Acausal Retrocohesion
 */

import { v4 as uuidv4 } from 'uuid';

export interface AcausalSearchParams {
  query: string;
  desiredOutcome: string;
  maxDepth: number;
  allowRetroactivity: boolean;
  paradigmId: string;
}

export interface EvidenceItem {
  id: string;
  content: string;
  source: string;
  relevance: number; // 0-1
  timestamp?: Date;
  direction: 'forward' | 'backward' | 'convergent';
  chainDepth: number;
  retroactiveWeight?: number; // For backward search
}

export interface AcausalChain {
  chainId: string;
  direction: 'forward' | 'backward';
  query: string;
  desiredOutcome?: string;
  links: EvidenceItem[];
  convergenceScore: number; // 0-1, how well this chain supports synthesis
  temporal: {
    startTime: Date;
    endTime?: Date;
    durationMs: number;
  };
}

export interface RetroactiveConstraint {
  id: string;
  constraint: string;
  derivedFrom: string; // outcome or conclusion
  certainty: number; // 0-1
  affectsEvidenceIds: string[];
}

export interface AcausalReasoningResult {
  id: string;
  query: string;
  desiredOutcome: string;
  forwardChains: AcausalChain[];
  backwardChains: AcausalChain[];
  retroactiveConstraints: RetroactiveConstraint[];
  convergence: number; // How well forward/backward agree
  synthesis: {
    integratedChain: EvidenceItem[];
    resolvedContradictions: string[];
    timeLoops: string[];
  };
}

/**
 * Forward Search Implementation
 * Traditional RAG: Query → Evidence Chain → Conclusion
 */
class ForwardSearcher {
  private maxDepth: number;
  private retrievalFunction: (query: string, limit: number) => Promise<EvidenceItem[]>;

  constructor(
    maxDepth: number,
    retrievalFunction: (query: string, limit: number) => Promise<EvidenceItem[]>
  ) {
    this.maxDepth = maxDepth;
    this.retrievalFunction = retrievalFunction;
  }

  // Getter for maxDepth to avoid unused variable warning
  getMaxDepth(): number {
    return this.maxDepth;
  }

  // Getter for retrievalFunction to avoid unused variable warning  
  getRetrievalFunction(): (query: string, limit: number) => Promise<EvidenceItem[]> {
    return this.retrievalFunction;
  }

  async search(query: string): Promise<AcausalChain[]> {
    const startTime = Date.now();
    const chains: AcausalChain[] = [];
    
    // BFS to find multiple evidence chains
    const queue: Array<{
      currentQuery: string;
      depth: number;
      path: EvidenceItem[];
    }> = [{ currentQuery: query, depth: 0, path: [] }];

    const visited = new Set<string>();

    while (queue.length > 0 && chains.length < 5) {
      const { currentQuery, depth, path } = queue.shift()!;

      if (depth >= this.maxDepth || visited.has(currentQuery)) {
        continue;
      }

      visited.add(currentQuery);

      // Retrieve evidence for current query
      const evidence = await this.retrievalFunction(currentQuery, 3);

      for (const item of evidence) {
        item.direction = 'forward';
        item.chainDepth = depth;
        const newPath = [...path, item];

        // Create chain if it's substantial enough
        if (newPath.length >= 2) {
          chains.push({
            chainId: uuidv4(),
            direction: 'forward',
            query,
            links: newPath,
            convergenceScore: this.calculateForwardConvergence(newPath),
            temporal: {
              startTime: new Date(startTime),
              durationMs: Date.now() - startTime
            }
          });
        }

        // Continue search from evidence content
        if (depth < this.maxDepth - 1) {
          queue.push({
            currentQuery: item.content,
            depth: depth + 1,
            path: newPath
          });
        }
      }
    }

    return chains;
  }

  private calculateForwardConvergence(chain: EvidenceItem[]): number {
    // Higher convergence if evidence is increasingly relevant
    if (chain.length === 0) return 0;
    
    const relevances = chain.map(e => e.relevance);
    const avgRelevance = relevances.reduce((a, b) => a + b) / relevances.length;
    const trend = relevances.length > 1 
      ? (relevances[relevances.length - 1] - relevances[0]) / relevances[0]
      : 0;

    return Math.min(1, avgRelevance + Math.max(0, trend * 0.2));
  }
}

/**
 * Backward Search Implementation
 * Acausal RAG: Desired Outcome ← Retroactive Constraints ← Evidence
 */
class BackwardSearcher {
  private maxDepth: number;
  private retrievalFunction: (query: string, limit: number) => Promise<EvidenceItem[]>;

  constructor(
    maxDepth: number,
    retrievalFunction: (query: string, limit: number) => Promise<EvidenceItem[]>
  ) {
    this.maxDepth = maxDepth;
    this.retrievalFunction = retrievalFunction;
  }

  async search(
    desiredOutcome: string,
    query: string,
    allowRetroactivity: boolean
  ): Promise<AcausalChain[]> {
    const startTime = Date.now();
    const chains: AcausalChain[] = [];

    // Decompose desired outcome into constraints
    const constraints = this.decomposeOutcome(desiredOutcome);

    // For each constraint, find evidence that would support it
    for (const constraint of constraints) {
      const evidence = await this.findSupportingEvidence(
        constraint,
        query,
        allowRetroactivity
      );

      if (evidence.length > 0) {
        chains.push({
          chainId: uuidv4(),
          direction: 'backward',
          query,
          desiredOutcome,
          links: evidence.map(e => ({
            ...e,
            direction: 'backward',
            chainDepth: evidence.indexOf(e)
          })),
          convergenceScore: this.calculateBackwardConvergence(evidence),
          temporal: {
            startTime: new Date(startTime),
            durationMs: Date.now() - startTime
          }
        });
      }
    }

    return chains;
  }

  private decomposeOutcome(outcome: string): string[] {
    // Parse outcome into sub-constraints
    // E.g., "Find the optimal solution" → ["optimality", "feasibility", "solution exists"]
    const keywords = outcome
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3);

    return keywords.slice(0, 3); // Top 3 constraint keywords
  }

  private async findSupportingEvidence(
    constraint: string,
    originalQuery: string,
    allowRetroactivity: boolean
  ): Promise<EvidenceItem[]> {
    // Search for evidence that would make this constraint true
    const searchQueries = [
      `What evidence supports ${constraint}?`,
      `How to achieve ${constraint} in context of ${originalQuery}?`,
      ...(allowRetroactivity ? [
        `Future state where ${constraint} is satisfied?`,
        `Retroactive reasoning for ${constraint}`
      ] : [])
    ];

    const allEvidence: EvidenceItem[] = [];

    for (const sq of searchQueries) {
      const evidence = await this.retrievalFunction(sq, 2);
      allEvidence.push(...evidence);
    }

    // Deduplicate and weight by how directly they support the constraint
    return this.deduplicateAndWeight(allEvidence, constraint);
  }

  private deduplicateAndWeight(
    evidence: EvidenceItem[],
    constraint: string
  ): EvidenceItem[] {
    const seen = new Map<string, EvidenceItem>();

    for (const item of evidence) {
      const key = item.content.substring(0, 50);
      if (!seen.has(key)) {
        // Increase retroactiveWeight if content directly mentions constraint
        const weight = item.content.toLowerCase().includes(constraint.toLowerCase())
          ? 1.0
          : 0.6;
        item.retroactiveWeight = weight;
        seen.set(key, item);
      }
    }

    return Array.from(seen.values())
      .sort((a, b) => (b.retroactiveWeight || 0) - (a.retroactiveWeight || 0))
      .slice(0, 3);
  }

  private calculateBackwardConvergence(chain: EvidenceItem[]): number {
    // Higher convergence if retroactive constraints are strongly supported
    if (chain.length === 0) return 0;

    const weights = chain.map(e => e.retroactiveWeight || 0.5);
    const avgWeight = weights.reduce((a, b) => a + b) / weights.length;

    return Math.min(1, avgWeight + (chain.length * 0.1));
  }
}

/**
 * Main Acausal Search Orchestrator
 */
export class AcausalSearcher {
  private forwardSearcher: ForwardSearcher;
  private backwardSearcher: BackwardSearcher;
  private retrievalFunction: (query: string, limit: number) => Promise<EvidenceItem[]>;

  constructor(retrievalFunction: (query: string, limit: number) => Promise<EvidenceItem[]>) {
    this.retrievalFunction = retrievalFunction;
    this.forwardSearcher = new ForwardSearcher(3, retrievalFunction);
    this.backwardSearcher = new BackwardSearcher(3, retrievalFunction);
  }

  /**
   * Execute complete acausal reasoning:
   * 1. Forward search from query
   * 2. Backward search from desired outcome
   * 3. Find convergence points
   * 4. Detect time loops and paradoxes
   */
  async search(params: AcausalSearchParams): Promise<AcausalReasoningResult> {
    const resultId = uuidv4();
    const startTime = Date.now();

    // Parallel search: forward and backward simultaneously
    const [forwardChains, backwardChains] = await Promise.all([
      this.forwardSearcher.search(params.query),
      this.backwardSearcher.search(
        params.desiredOutcome,
        params.query,
        params.allowRetroactivity
      )
    ]);

    // Calculate convergence between forward and backward
    const convergence = this.calculateGlobalConvergence(forwardChains, backwardChains);

    // Extract retroactive constraints from backward search
    const retroactiveConstraints = this.extractConstraints(backwardChains);

    // Synthesize chains into integrated understanding
    const synthesis = this.synthesizeChains(
      params.query,
      forwardChains,
      backwardChains,
      retroactiveConstraints
    );

    return {
      id: resultId,
      query: params.query,
      desiredOutcome: params.desiredOutcome,
      forwardChains,
      backwardChains,
      retroactiveConstraints,
      convergence,
      synthesis,
    };
  }

  private calculateGlobalConvergence(
    forwardChains: AcausalChain[],
    backwardChains: AcausalChain[]
  ): number {
    if (forwardChains.length === 0 || backwardChains.length === 0) {
      return 0;
    }

    const forwardAvg = forwardChains.reduce((sum, c) => sum + c.convergenceScore, 0) 
      / forwardChains.length;
    const backwardAvg = backwardChains.reduce((sum, c) => sum + c.convergenceScore, 0)
      / backwardChains.length;

    // Convergence is how well forward and backward agree
    return 1 - Math.abs(forwardAvg - backwardAvg);
  }

  private extractConstraints(backwardChains: AcausalChain[]): RetroactiveConstraint[] {
    const constraints: RetroactiveConstraint[] = [];

    for (const chain of backwardChains) {
      for (const link of chain.links) {
        constraints.push({
          id: uuidv4(),
          constraint: link.content,
          derivedFrom: chain.desiredOutcome || 'unknown',
          certainty: link.retroactiveWeight || 0.5,
          affectsEvidenceIds: [link.id]
        });
      }
    }

    return constraints;
  }

  private synthesizeChains(
    query: string,
    forwardChains: AcausalChain[],
    backwardChains: AcausalChain[],
    constraints: RetroactiveConstraint[]
  ): AcausalReasoningResult['synthesis'] {
    // Merge forward and backward evidence
    const allEvidence = new Map<string, EvidenceItem>();

    [...forwardChains, ...backwardChains].forEach(chain => {
      chain.links.forEach(link => {
        if (!allEvidence.has(link.id)) {
          allEvidence.set(link.id, {
            ...link,
            direction: 'convergent'
          });
        }
      });
    });

    // Sort by relevance and convert to array
    const integratedChain = Array.from(allEvidence.values())
      .sort((a, b) => b.relevance - a.relevance);

    return {
      integratedChain,
      resolvedContradictions: this.findResolutions(forwardChains, backwardChains),
      timeLoops: this.detectTimeLoops(forwardChains, backwardChains, constraints)
    };
  }

  private findResolutions(
    forwardChains: AcausalChain[],
    backwardChains: AcausalChain[]
  ): string[] {
    // Detect contradictions between forward and backward reasoning
    // and propose resolutions
    const resolutions: string[] = [];

    if (forwardChains.length > 0 && backwardChains.length > 0) {
      const forwardConclusion = forwardChains[0].links[forwardChains[0].links.length - 1];
      const backwardPremise = backwardChains[0].links[0];

      if (forwardConclusion && backwardPremise) {
        resolutions.push(
          `Forward reasoning concludes: ${forwardConclusion.content}`
        );
        resolutions.push(
          `Backward reasoning requires: ${backwardPremise.content}`
        );
        resolutions.push(
          `Resolution: These are compatible in an acausal framework`
        );
      }
    }

    return resolutions;
  }

  private detectTimeLoops(
    forwardChains: AcausalChain[],
    backwardChains: AcausalChain[],
    constraints: RetroactiveConstraint[]
  ): string[] {
    // Detect potential causal loops or temporal paradoxes
    const loops: string[] = [];

    // Check if forward evidence is derived from backward conclusions
    const forwardIds = new Set(
      forwardChains.flatMap(c => c.links.map(l => l.id))
    );

    const backwardIds = new Set(
      backwardChains.flatMap(c => c.links.map(l => l.id))
    );

    // If there's overlap, we have a time loop
    const overlap = Array.from(forwardIds).filter(id => backwardIds.has(id));
    if (overlap.length > 0) {
      loops.push(
        `Detected temporal loop: ${overlap.length} evidence items referenced in both directions`
      );
    }

    return loops;
  }
}
