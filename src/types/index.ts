/**
 * Core type definitions for Paradigm Stack
 * Shared across all components
 */

export interface Query {
  id: string;
  question: string;
  budget: number;
  paradigmContext?: string;
  timestamp: Date;
}

export interface ReasonerResult {
  reasonerId: string;
  reasonerName: string;
  reasonerFrame: string;
  conclusion: string;
  confidence: number;
  reasoning: string;
  tokensUsed: number;
  timestamp: Date;
  paradigm: string;
}

export interface ConsumptionMetrics {
  tokensUsed: number;
  energyBurned: number;
  necrticLayersCreated: number;
  recursionDepth: number;
  parasitismRate: number;
  costPerLevel: number[];
}

export interface RalphDecision {
  queryId: string;
  decision: 'APPROVE' | 'DENY' | 'CONDITIONAL';
  budget: number;
  consumed: number;
  remaining: number;
  voidPressure: number;
  justification: string;
  timestamp: Date;
}

export interface EvidenceItem {
  source: string;
  content: string;
  relevanceScore: number;
  embedding?: number[];
  timestamp: Date;
}

export interface CodePattern {
  pattern: string;
  confidence: number;
  source: string;
  implementation?: string;
}

export interface QueryResponse {
  queryId: string;
  results: ReasonerResult[];
  evidence: EvidenceItem[];
  codePatterns: CodePattern[];
  consumption: ConsumptionMetrics;
  ralphDecision: RalphDecision;
  suiTransactionHash?: string;
  walrusBlob?: string;
  timestamp: Date;
  paradigmInstantiations: string[];
}

// MCP Router Types
export interface ReasonerConfig {
  name: string;
  frame: string;
  paradigm: string;
  instructions: string;
}

export interface ParallelReasoningContext {
  reasoners: ReasonerConfig[];
  query: Query;
  maxDepth: number;
  preserveContradiction: boolean;
}

// RLM Types
export interface RecursionLevel {
  level: number;
  budget: number;
  parentBudget: number;
  tokensAllocated: number;
  tokensConsumed: number;
  energyBurned: number;
  childCallsCount: number;
}

export interface RecursionHierarchy {
  levels: RecursionLevel[];
  totalEnergy: number;
  totalTokens: number;
  parasitismChain: number[]; // consumption rate per level
}

// VectorDB Types
export interface SemanticVector {
  id: string;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
}

export interface SemanticSearchResult {
  vector: SemanticVector;
  distance: number;
  similarity: number;
}

// CCA Types
export interface CodeState {
  id: string;
  source: string;
  content: string;
  embedding: number[];
  functionality: string;
  trustScore: number;
}

export interface CodeManifest {
  states: CodeState[];
  topology: Map<string, CodeState[]>;
}

// Persistence Types
export interface NecrticLayer {
  id: string;
  energy: number;
  tokensProcessed: number;
  timestamp: Date;
  data: Record<string, any>;
}

// Paradigm Types
export type ParadigmType = 
  | 'atemporal-manifold'
  | 'acausal-retrocohesion'
  | 'polyphonic-subjectivity'
  | 'parasitic-materiality'
  | 'fuzzy-essence'
  | 'liberated-signification'
  | 'inverted-phenomenality'
  | 'substrate-hierarchy'
  | 'consciousness-alienation'
  | 'negation-becoming';

export interface ParadigmInstantiation {
  paradigm: ParadigmType;
  active: boolean;
  metrics: Record<string, number>;
  behaviors: string[];
}

// Void Pressure Types
export interface VoidPressureMetrics {
  totalDenials: number;
  denialRate: number;
  accumulatedPressure: number;
  definition: number;
  pressureHistory: number[];
}

// Error Types
export class ParadigmStackError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'ParadigmStackError';
  }
}

export class RalphRejectionError extends ParadigmStackError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'RALPH_REJECTION', context);
    this.name = 'RalphRejectionError';
  }
}

export class ParadigmConflictError extends ParadigmStackError {
  constructor(paradigms: string[], context?: Record<string, any>) {
    super(
      `Paradigm conflict: ${paradigms.join(', ')}`,
      'PARADIGM_CONFLICT',
      { paradigms, ...context }
    );
    this.name = 'ParadigmConflictError';
  }
}

// Config Types
export interface SystemConfig {
  environment: 'development' | 'production' | 'test';
  port: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  phase: 1 | 2 | 3;
  paradigmInstantiationMode: 'isolated' | 'hybrid' | 'fusion';
  featureFlags: {
    enablePluralReasoners: boolean;
    enableAcausalRag: boolean;
    enableSemioticCode: boolean;
    enableVoidPressure: boolean;
  };
  llm: {
    primary: 'claude' | 'ollama' | 'hf' | 'grok';
    fallback: string[];
    temperature: number;
    maxTokens: number;
  };
  ralph: {
    budgetTokens: number;
    costPerToken: number;
    denialThreshold: number;
  };
  qdrant: {
    url: string;
    apiKey?: string;
    timeout: number;
  };
  sui: {
    rpcUrl: string;
    packageId: string;
    adminAccount: string;
  };
}
