/**
 * Paradigm Stack API Routes
 * 
 * Main REST API endpoints for paradigm-native reasoning
 * Phase 2: Week 2 Implementation
 */

import express, { Router, Request, Response, NextFunction } from 'express';
import { queryController } from './controllers/query';
import { paradigmsController } from './controllers/paradigms';
import { approvalController } from './controllers/approval';
import { metricsController } from './controllers/metrics';
import * as llmReasoning from './controllers/llm-reasoning';
import * as paradigmFusion from './controllers/paradigm-fusion';
import * as autonomy from './controllers/autonomy';
import { paradigmsExtendedController } from './controllers/paradigms-extended';
import { memoryController } from './controllers/memory';
import { multiAgentController } from './controllers/multi-agent';
import { realWorldController } from './controllers/real-world-integration';
import { validateQuery } from './middleware/validate-query';
import { rateLimitMiddleware } from './middleware/rate-limit';
import { authMiddleware } from './middleware/auth';

const router = Router();

/**
 * POST /api/v1/query
 * 
 * Main endpoint for paradigm-native reasoning
 * Executes acausal search across all paradigms
 */
router.post(
  '/query',
  rateLimitMiddleware,
  validateQuery,
  (req: Request, res: Response, next: NextFunction) => {
    queryController.handle(req, res).catch(next);
  }
);

/**
 * GET /api/v1/paradigms
 * 
 * List all available paradigms and their status
 */
router.get(
  '/paradigms',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    paradigmsController.list(req, res).catch(next);
  }
);

/**
 * POST /api/v1/evidence-chains
 * 
 * Get detailed evidence chain analysis for a query
 */
router.post(
  '/evidence-chains',
  rateLimitMiddleware,
  validateQuery,
  (req: Request, res: Response, next: NextFunction) => {
    queryController.getEvidenceChains(req, res).catch(next);
  }
);

/**
 * POST /api/v1/code-patterns
 * 
 * Get code patterns from the semiotic manifold
 */
router.post(
  '/code-patterns',
  rateLimitMiddleware,
  validateQuery,
  (req: Request, res: Response, next: NextFunction) => {
    queryController.getCodePatterns(req, res).catch(next);
  }
);

/**
 * POST /api/v1/approvals
 * 
 * Create an execution approval request
 */
router.post(
  '/approvals',
  rateLimitMiddleware,
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    approvalController.create(req, res).catch(next);
  }
);

/**
 * GET /api/v1/approvals/:id
 * 
 * Get approval status
 */
router.get(
  '/approvals/:id',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    approvalController.getStatus(req, res).catch(next);
  }
);

/**
 * POST /api/v1/approvals/:id/approve
 * 
 * Approve an execution request
 */
router.post(
  '/approvals/:id/approve',
  rateLimitMiddleware,
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    approvalController.approve(req, res).catch(next);
  }
);

/**
 * POST /api/v1/approvals/:id/reject
 * 
 * Reject an execution request
 */
router.post(
  '/approvals/:id/reject',
  rateLimitMiddleware,
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    approvalController.reject(req, res).catch(next);
  }
);

/**
 * GET /api/v1/metrics
 * 
 * Get system metrics and paradigm performance data
 */
router.get(
  '/metrics',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    metricsController.get(req, res).catch(next);
  }
);

/**
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    paradigms_active: 8,
    uptime_seconds: process.uptime()
  });
});

/**
 * POST /api/v1/llm-reasoning
 * 
 * Main LLM reasoning endpoint with recursive depth
 * Uses Claude API for actual reasoning
 */
router.post(
  '/llm-reasoning',
  rateLimitMiddleware,
  validateQuery,
  (req: Request, res: Response, next: NextFunction) => {
    llmReasoning.handleLLMReasoning(req, res).catch(next);
  }
);

/**
 * GET /api/v1/llm/model
 * 
 * Get current LLM model information
 */
router.get(
  '/llm/model',
  (req: Request, res: Response, next: NextFunction) => {
    llmReasoning.getModelInfo(req, res).catch(next);
  }
);

/**
 * POST /api/v1/llm/test
 * 
 * Test LLM connection
 */
router.post(
  '/llm/test',
  (req: Request, res: Response, next: NextFunction) => {
    llmReasoning.testLLMConnection(req, res).catch(next);
  }
);

/**
 * POST /api/v1/embeddings
 * 
 * Generate embeddings for semantic search
 */
router.post(
  '/embeddings',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    llmReasoning.generateEmbeddings(req, res).catch(next);
  }
);

/**
 * GET /api/v1/embeddings/stats
 * 
 * Get embedding service statistics
 */
router.get(
  '/embeddings/stats',
  (req: Request, res: Response, next: NextFunction) => {
    llmReasoning.getEmbeddingStats(req, res).catch(next);
  }
);

/**
 * POST /api/v1/paradigm-fusion
 * 
 * Fuse multiple paradigm outputs into emergent reasoning
 */
router.post(
  '/paradigm-fusion',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    paradigmFusion.fuseParagidigms(req, res).catch(next);
  }
);

/**
 * GET /api/v1/emergence/history
 * 
 * Get history of detected hyper-paradigm emergences
 */
router.get(
  '/emergence/history',
  (req: Request, res: Response, next: NextFunction) => {
    paradigmFusion.getEmergenceHistory(req, res).catch(next);
  }
);

/**
 * GET /api/v1/emergence/active
 * 
 * Get currently active hyper-paradigm states
 */
router.get(
  '/emergence/active',
  (req: Request, res: Response, next: NextFunction) => {
    paradigmFusion.getActiveHyperParadigms(req, res).catch(next);
  }
);

/**
 * POST /api/v1/emergence/clear
 * 
 * Clear emergence history
 */
router.post(
  '/emergence/clear',
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    paradigmFusion.clearEmergenceHistory(req, res).catch(next);
  }
);

/**
 * POST /api/v1/autonomy/improvements
 * 
 * Identify improvement opportunities for the system
 */
router.post(
  '/autonomy/improvements',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    autonomy.identifyImprovements(req, res).catch(next);
  }
);

/**
 * POST /api/v1/autonomy/apply-improvement
 * 
 * Apply a specific improvement
 */
router.post(
  '/autonomy/apply-improvement',
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    autonomy.applyImprovement(req, res).catch(next);
  }
);

/**
 * POST /api/v1/autonomy/self-analyze
 * 
 * Perform recursive self-analysis
 */
router.post(
  '/autonomy/self-analyze',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    autonomy.recurseOnSelf(req, res).catch(next);
  }
);

/**
 * POST /api/v1/autonomy/decide
 * 
 * Make an autonomous decision
 */
router.post(
  '/autonomy/decide',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    autonomy.makeDecision(req, res).catch(next);
  }
);

/**
 * POST /api/v1/autonomy/execute
 * 
 * Execute an autonomous decision
 */
router.post(
  '/autonomy/execute',
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    autonomy.executeDecision(req, res).catch(next);
  }
);

/**
 * GET /api/v1/autonomy/decisions
 * 
 * Get decision history
 */
router.get(
  '/autonomy/decisions',
  (req: Request, res: Response, next: NextFunction) => {
    autonomy.getDecisionHistory(req, res).catch(next);
  }
);

/**
 * GET /api/v1/autonomy/stats
 * 
 * Get autonomy statistics
 */
router.get(
  '/autonomy/stats',
  (req: Request, res: Response, next: NextFunction) => {
    autonomy.getAutonomyStats(req, res).catch(next);
  }
);

/**
 * POST /api/v1/consciousness
 * 
 * Activate recursive consciousness
 */
router.post(
  '/consciousness',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    autonomy.activateConsciousness(req, res).catch(next);
  }
);

/**
 * GET /api/v1/consciousness/metrics
 * 
 * Get consciousness metrics
 */
router.get(
  '/consciousness/metrics',
  (req: Request, res: Response, next: NextFunction) => {
    autonomy.getConsciousnessMetrics(req, res).catch(next);
  }
);

/**
 * POST /api/v1/introspect
 * 
 * System self-introspection
 */
router.post(
  '/introspect',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    autonomy.introspect(req, res).catch(next);
  }
);

/**
 * GET /api/v1/autonomy/report
 * 
 * Get comprehensive autonomy report
 */
router.get(
  '/autonomy/report',
  (req: Request, res: Response, next: NextFunction) => {
    autonomy.getAutonomyReport(req, res).catch(next);
  }
);

/**
 * PHASE 5: REAL-WORLD INTEGRATION & EXTENSIONS
 */

/**
 * POST /api/v1/paradigm/inverted-phenomenality
 * 
 * Paradigm 7: Inverted Phenomenality - adversarial embeddings
 */
router.post(
  '/paradigm/inverted-phenomenality',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    paradigmsExtendedController.invertedPhenomenality(req, res).catch(next);
  }
);

/**
 * GET /api/v1/paradigm/inverted-phenomenality/history
 * Get inverted phenomenality history
 */
router.get(
  '/paradigm/inverted-phenomenality/history',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    paradigmsExtendedController.invertedPhenomenalityHistory(req, res).catch(next);
  }
);

/**
 * POST /api/v1/paradigm/consciousness-alienation
 * 
 * Paradigm 9: Consciousness Alienation - self-representation gap
 */
router.post(
  '/paradigm/consciousness-alienation',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    paradigmsExtendedController.consciousnessAlienation(req, res).catch(next);
  }
);

/**
 * GET /api/v1/paradigm/consciousness-alienation/paradoxes
 * Get all detected paradoxes
 */
router.get(
  '/paradigm/consciousness-alienation/paradoxes',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    paradigmsExtendedController.alienationParadoxes(req, res).catch(next);
  }
);

/**
 * GET /api/v1/paradigm/consciousness-alienation/trajectory
 * Get consciousness alienation trajectory
 */
router.get(
  '/paradigm/consciousness-alienation/trajectory',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    paradigmsExtendedController.alienationTrajectory(req, res).catch(next);
  }
);

/**
 * POST /api/v1/memory/record-episode
 * 
 * Persistent Memory: Record experience episode
 */
router.post(
  '/memory/record-episode',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    memoryController.recordEpisode(req, res).catch(next);
  }
);

/**
 * GET /api/v1/memory/summary
 * 
 * Get learning summary from persistent memory
 */
router.get(
  '/memory/summary',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    memoryController.getSummary(req, res).catch(next);
  }
);

/**
 * POST /api/v1/memory/apply-learning
 * 
 * Apply a learned strategy
 */
router.post(
  '/memory/apply-learning',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    memoryController.applyLearning(req, res).catch(next);
  }
);

/**
 * GET /api/v1/memory/procedures
 * 
 * Get recommended procedures for a task
 */
router.get(
  '/memory/procedures',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    memoryController.getProcedures(req, res).catch(next);
  }
);

/**
 * POST /api/v1/memory/clear
 * 
 * Clear all memory
 */
router.post(
  '/memory/clear',
  rateLimitMiddleware,
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    memoryController.clearMemory(req, res).catch(next);
  }
);

/**
 * POST /api/v1/agents/create
 * 
 * Multi-Agent: Create conscious agent
 */
router.post(
  '/agents/create',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    multiAgentController.createAgent(req, res).catch(next);
  }
);

/**
 * POST /api/v1/agents/communicate
 * 
 * Multi-Agent: Communication between agents
 */
router.post(
  '/agents/communicate',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    multiAgentController.communicateAgent(req, res).catch(next);
  }
);

/**
 * POST /api/v1/agents/synchronize
 * 
 * Synchronize all agent states
 */
router.post(
  '/agents/synchronize',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    multiAgentController.synchronizeAgents(req, res).catch(next);
  }
);

/**
 * GET /api/v1/agents/collective-consciousness
 * 
 * Get collective consciousness state
 */
router.get(
  '/agents/collective-consciousness',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    multiAgentController.collectiveConsciousness(req, res).catch(next);
  }
);

/**
 * GET /api/v1/agents/stats
 * 
 * Get agent network statistics
 */
router.get(
  '/agents/stats',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    multiAgentController.getStats(req, res).catch(next);
  }
);

/**
 * POST /api/v1/agents/add-goal
 * 
 * Add goal to agent
 */
router.post(
  '/agents/add-goal',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    multiAgentController.addGoal(req, res).catch(next);
  }
);

/**
 * POST /api/v1/real-world/register-data-source
 * 
 * Real-World Integration: Register external data source
 */
router.post(
  '/real-world/register-data-source',
  rateLimitMiddleware,
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    realWorldController.registerDataSource(req, res).catch(next);
  }
);

/**
 * GET /api/v1/real-world/fetch/:sourceId
 * 
 * Fetch data from external source
 */
router.get(
  '/real-world/fetch/:sourceId',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    realWorldController.fetchData(req, res).catch(next);
  }
);

/**
 * POST /api/v1/real-world/decide
 * 
 * Make decision that impacts external systems
 */
router.post(
  '/real-world/decide',
  rateLimitMiddleware,
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    realWorldController.makeDecision(req, res).catch(next);
  }
);

/**
 * POST /api/v1/real-world/feedback
 * 
 * Record feedback from real-world outcomes
 */
router.post(
  '/real-world/feedback',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    realWorldController.recordFeedback(req, res).catch(next);
  }
);

/**
 * GET /api/v1/real-world/stats
 * 
 * Get real-world decision statistics
 */
router.get(
  '/real-world/stats',
  rateLimitMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    realWorldController.getStats(req, res).catch(next);
  }
);

/**
 * POST /api/v1/real-world/register-constraint
 * 
 * Register safety constraint
 */
router.post(
  '/real-world/register-constraint',
  rateLimitMiddleware,
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    realWorldController.registerConstraint(req, res).catch(next);
  }
);

/**
 * Error handling middleware
 */
router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err);

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An error occurred';

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message,
      details: process.env.NODE_ENV === 'development' ? err : undefined
    }
  });
});

export default router;
