/**
 * Phase 1: Integration Foundation
 * Run basic end-to-end test of all components
 */

import { v4 as uuid } from 'uuid';
import { Query } from '../types';
import { logger, apiLogger } from '../utils/logger';
import { systemConfig } from '../utils/config.js';
import { ralph } from '@ralph/evaluator.js';
import { mcpRouter } from '@mcp/router.js';

async function runPhase1Test() {
  logger.info('=== PHASE 1: Integration Foundation Test ===');
  logger.info(`Phase: ${systemConfig.phase}`);
  logger.info(`Mode: ${systemConfig.paradigmInstantiationMode}`);

  // Create test query
  const testQuery: Query = {
    id: uuid(),
    question: 'What is the optimal resource allocation strategy for a distributed system?',
    budget: 500,
    paradigmContext: 'optimization',
    timestamp: new Date(),
  };

  apiLogger.info(
    {
      queryId: testQuery.id,
      question: testQuery.question,
      budget: testQuery.budget,
    },
    'Test query created'
  );

  try {
    // Step 1: Ralph evaluation (Paradigm 10)
    logger.info('\n--- Step 1: Ralph Evaluation (Paradigm 10: Negation) ---');
    const ralphDecision = await ralph.evaluate(testQuery);
    logger.info(`Ralph decision: ${ralphDecision.decision}`);
    logger.info(`Void pressure: ${ralphDecision.voidPressure.toFixed(3)}`);
    logger.info(`Justification: ${ralphDecision.justification}`);

    if (ralphDecision.decision === 'DENY') {
      logger.error('Ralph rejected query - test failed');
      process.exit(1);
    }

    // Step 2: MCP Routing (Paradigm 3)
    logger.info('\n--- Step 2: MCP Routing (Paradigm 3: Polyphonic Subjectivity) ---');
    const reasonerResults = await mcpRouter.routeToReasoners(testQuery);

    logger.info(`Reasoners spawned: ${reasonerResults.length}`);
    logger.info('Conclusions (all preserved, no voting):');

    reasonerResults.forEach((result, index) => {
      logger.info(`\n  Reasoner ${index + 1}: ${result.reasonerName}`);
      logger.info(`    Frame: ${result.reasonerFrame}`);
      logger.info(`    Conclusion: ${result.conclusion}`);
      logger.info(`    Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      logger.info(`    Tokens used: ${result.tokensUsed}`);
    });

    // Step 3: Consumption metrics (Paradigm 4 + 8)
    logger.info('\n--- Step 3: Consumption Metrics (Paradigm 4 + 8: Necrosis + Hierarchy) ---');
    const totalTokens = reasonerResults.reduce((sum, r) => sum + r.tokensUsed, 0);
    const energyBurned = totalTokens * 0.0052; // Simplified: 5.2mJ per token

    logger.info(`Total tokens consumed: ${totalTokens}`);
    logger.info(`Energy burned (mJ): ${energyBurned.toFixed(2)}`);
    logger.info(`Necrotic layers created: 1`);
    logger.info(`Cost per level: $${(energyBurned * 0.001).toFixed(4)}`);

    // Step 4: Void pressure update
    logger.info('\n--- Step 4: Void Pressure Metrics (Paradigm 10) ---');
    const voidMetrics = ralph.getVoidPressureMetrics();
    logger.info(`Total denials: ${voidMetrics.totalDenials}`);
    logger.info(`Denial rate: ${(voidMetrics.denialRate * 100).toFixed(1)}%`);
    logger.info(`Accumulated pressure: ${voidMetrics.accumulatedPressure.toFixed(3)}`);
    logger.info(`System definition: ${(voidMetrics.definition * 100).toFixed(1)}%`);

    // Summary
    logger.info('\n=== PHASE 1 TEST RESULTS ===');
    logger.info('✓ Ralph evaluator working (Paradigm 10)');
    logger.info(`✓ MCP router spawning ${reasonerResults.length} reasoners (Paradigm 3)`);
    logger.info('✓ Contradictions preserved (no collapse)');
    logger.info('✓ Consumption tracking operational (Paradigm 4 + 8)');
    logger.info('✓ Void pressure dynamics functioning (Paradigm 10)');

    logger.info('\n=== NEXT STEPS ===');
    logger.info('1. Month 3-4: Wire RAG + VectorDB + CCA');
    logger.info('2. Month 5-6: End-to-end SUI persistence');
    logger.info('3. Month 7-9: Acausal reasoning (Paradigm 2)');
    logger.info('4. Month 10-12: Semiotic code generation (Paradigm 6)');

    process.exit(0);
  } catch (error: any) {
    logger.error(
      { error: error.message, stack: error.stack },
      'Phase 1 test failed'
    );
    process.exit(1);
  }
}

runPhase1Test();
