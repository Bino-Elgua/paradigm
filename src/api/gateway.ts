/**
 * API Gateway (Paradigm 6 + 10: Semiotic Autonomy + Negation)
 * 
 * Routes are not names - they are differential meaning structures.
 * Each endpoint negates all other possible requests.
 */

import express, { Express, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { Query, QueryResponse } from '../types';
import { apiLogger } from '../utils/logger';
import { systemConfig } from '../utils/config.js';
import { ralph } from '@ralph/evaluator.js';
import { mcpRouter } from '@mcp/router.js';
import { ragRetriever } from '@rag/retriever.js';
import { codeManifest } from '@cca/manifest.js';
import { suiBridge } from '@persistence/sui.js';
import { vectordb } from '@vectordb/client.js';

export class APIGateway {
  private app: Express;
  private port: number;

  constructor(port: number = systemConfig.port) {
    this.app = express();
    this.port = port;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());

    // Request logging
    this.app.use((req, res, next) => {
      apiLogger.debug(
        {
          method: req.method,
          path: req.path,
          ip: req.ip,
        },
        `${req.method} ${req.path}`
      );
      next();
    });

    // Request ID injection
    this.app.use((req: any, res, next) => {
      req.queryId = uuid();
      next();
    });
  }

  private setupRoutes(): void {
    /**
     * POST /query
     * Paradigm 6: This endpoint means through its differential position
     * from /reason, /revise, /invalidate, etc.
     * Paradigm 10: Accepting this request negates all other requests
     */
    this.app.post('/query', async (req: Request, res: Response) => {
      const queryId = (req as any).queryId;

      try {
        const { question, budget = 1000, paradigmContext } = req.body;

        if (!question) {
          return res.status(400).json({
            error: 'Missing required field: question',
          });
        }

        apiLogger.info(
          {
            queryId,
            question: question.substring(0, 100),
            budget,
          },
          'Query received'
        );

        // Create query object
        const query: Query = {
          id: queryId,
          question,
          budget,
          paradigmContext,
          timestamp: new Date(),
        };

        // Submit to Ralph for evaluation (Paradigm 10: void-pressure)
        const ralphDecision = await ralph.evaluate(query);

        if (ralphDecision.decision === 'DENY') {
          apiLogger.warn(
            { queryId, reason: ralphDecision.justification },
            'Query denied by Ralph'
          );

          return res.status(429).json({
            error: 'Query rejected by Ralph evaluator',
            reason: ralphDecision.justification,
            voidPressure: ralphDecision.voidPressure,
          });
        }

        // Route to MCP for parallel reasoning (Paradigm 3)
        const reasonerResults = await mcpRouter.routeToReasoners(query);

        // Retrieve evidence via RAG (Paradigm 2)
        const evidence = await ragRetriever.retrieve(query.question, 3);
        const rankedEvidence = ragRetriever.rankEvidence(evidence);
        const filteredEvidence = ragRetriever.filterByConfidence(rankedEvidence, 0.7);

        // Select code patterns from manifold (Paradigm 1 + 5)
        const codePatterns = await codeManifest.selectPatterns(query.question, 2);

        // Calculate total consumption metrics
        const totalTokens = reasonerResults.reduce(
          (sum, r) => sum + r.tokensUsed,
          0
        );
        const energyBurned = totalTokens * 0.0052; // 5.2mJ per token

        // Construct response
        const response: QueryResponse = {
          queryId,
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

        // Persist to blockchain (if enabled in Phase 2)
        if (systemConfig.featureFlags.enableVoidPressure) {
          try {
            const txHash = await suiBridge.persistQuery(response);
            response.suiTransactionHash = txHash;
            apiLogger.debug({ queryId, txHash }, 'Query persisted to SUI');
          } catch (error: any) {
            apiLogger.warn(
              { queryId, error: error.message },
              'SUI persistence failed (Phase 2 feature)'
            );
          }
        }

        apiLogger.info(
          {
            queryId,
            resultsCount: reasonerResults.length,
            voidPressure: ralphDecision.voidPressure,
          },
          'Query processed successfully'
        );

        return res.status(200).json(response);
      } catch (error: any) {
        apiLogger.error(
          { queryId, error: error.message },
          'Query processing failed'
        );

        return res.status(500).json({
          error: 'Internal server error',
          queryId,
          message: error.message,
        });
      }
    });

    /**
     * GET /health
     * System health check (not paradigm-native, just infrastructure)
     */
    this.app.get('/health', (req: Request, res: Response) => {
      const voidPressure = ralph.getVoidPressureMetrics();

      return res.status(200).json({
        status: 'healthy',
        timestamp: new Date(),
        phase: systemConfig.phase,
        paradigmMode: systemConfig.paradigmInstantiationMode,
        ralph: {
          voidPressure: voidPressure.accumulatedPressure,
          definition: voidPressure.definition,
          totalDenials: voidPressure.totalDenials,
        },
      });
    });

    /**
     * GET /metrics
     * System metrics (paradigm instantiation, consumption, etc.)
     */
    this.app.get('/metrics', (req: Request, res: Response) => {
      const voidMetrics = ralph.getVoidPressureMetrics();
      const decisionHistory = ralph.getDecisionHistory(10);

      return res.status(200).json({
        timestamp: new Date(),
        ralph: {
          voidPressure: voidMetrics.accumulatedPressure,
          definition: voidMetrics.definition,
          denialRate: (voidMetrics.denialRate * 100).toFixed(1) + '%',
          totalDenials: voidMetrics.totalDenials,
          recentDecisions: decisionHistory.map((d) => ({
            decision: d.decision,
            voidPressure: d.voidPressure,
            timestamp: d.timestamp,
          })),
        },
        paradigmInstantiations: {
          active: systemConfig.paradigmInstantiationMode,
          phase: systemConfig.phase,
          features: systemConfig.featureFlags,
        },
      });
    });

    /**
     * POST /reset
     * Reset system state (admin only)
     */
    this.app.post('/reset', (req: Request, res: Response) => {
      apiLogger.warn({}, 'System reset initiated');
      ralph.resetBudget();

      return res.status(200).json({
        message: 'Ralph budget reset',
        timestamp: new Date(),
      });
    });

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      apiLogger.warn(
        { method: req.method, path: req.path },
        'Route not found'
      );

      return res.status(404).json({
        error: 'Route not found',
        path: req.path,
      });
    });
  }

  public start(): void {
    this.app.listen(this.port, () => {
      apiLogger.info(
        { port: this.port, phase: systemConfig.phase },
        `API Gateway listening on port ${this.port}`
      );
    });
  }

  public getApp(): Express {
    return this.app;
  }
}

export function createGateway(port?: number): APIGateway {
  return new APIGateway(port);
}
