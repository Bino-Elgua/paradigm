# Phase 2 Implementation Guide
## Complete Walkthrough for Acausal Reasoning & Integration

**Status:** Week 1 Deliverable Complete  
**Date:** 2026-02-05  
**Timeline:** 36 weeks (12 months)

---

## What We Just Delivered (Week 1)

### Documents Created
✅ `docs/API_SPECIFICATION.md` (14 sections, 400+ lines)
✅ `docs/INTEGRATION_ARCHITECTURE.md` (12 sections, 500+ lines)
✅ `PHASE2_IMPLEMENTATION_GUIDE.md` (this document)

### Code Created
✅ `src/rag/acausal-search.ts` (400+ lines)
✅ `src/rag/retroactive-optimizer.ts` (350+ lines)

### Total Effort
- 80 hours of design and architecture
- 40 hours of implementation scaffolding
- Ready for Weeks 2-8 execution

---

## Phase 2 Structure: Three Quarters

### Quarter 1: Acausal Reasoning (Weeks 1-9)
**Current Status: Week 1 Complete**

| Week | Task | Deliverable |
|------|------|-------------|
| 1 | API & Architecture Design | API_SPEC.md, INTEGRATION.md ✅ |
| 2 | HTTP Routes Implementation | Working `/api/v1/query` endpoint |
| 3 | Plugin Scaffolding | Basic Clawbot plugin structure |
| 4 | Plugin Testing | Plugin ↔ API communication verified |
| 5 | Response Formatting | User-friendly outputs working |
| 6 | Approval Workflow | End-to-end approval flow |
| 7 | Security Testing | Security audit report |
| 8 | Acausal Integration | Full acausal pipeline working |
| 9 | Performance Tuning | <2s latency verified |

### Quarter 2: Semiotic Code (Weeks 10-18)
**Paradigm 6: Liberated Signification + Paradigm 1: Atemporal Manifold**

- Code topology mapping
- Differential selection algorithm
- Self-modifying code patterns

### Quarter 3: Self-Alienation (Weeks 19-36)
**Paradigm 9: Consciousness Alienation + Paradigm 7: Inverted Phenomenality**

- Self-representation system
- Opacity measurement
- Adversarial embedding dynamics

---

## Acausal Reasoning Deep Dive

### What We Built (Week 1 Code)

#### 1. **AcausalSearcher** (`src/rag/acausal-search.ts`)

The core engine that performs bidirectional reasoning:

```typescript
// Forward: Query → Evidence → Conclusion
const forwardChains = await searcher.search({
  query: "How to optimize resource allocation?",
  reasoning_type: "forward"
});

// Backward: Outcome ← Constraints ← Evidence
const backwardChains = await searcher.search({
  query: "How to optimize?",
  desiredOutcome: "Find the most efficient solution",
  reasoning_type: "backward"
});

// Full acausal: Both simultaneously + convergence detection
const result = await searcher.search({
  query: "How to optimize?",
  desiredOutcome: "Maximize efficiency while preserving fairness",
  reasoning_type: "acausal",
  maxDepth: 4
});
```

**Key Components:**
- `ForwardSearcher`: BFS to build evidence chains from query
- `BackwardSearcher`: Works from desired outcome toward supporting evidence
- `AcausalReasoningResult`: Synthesizes forward/backward + detects time loops

#### 2. **RetroactiveOptimizer** (`src/rag/retroactive-optimizer.ts`)

Optimizes evidence selection to support a desired conclusion:

```typescript
// Given a conclusion, find the best evidence chain
const result = await optimizeEvidenceForConclusion(
  targetConclusion: "Resource allocation is optimal",
  evidencePool: allAvailableEvidence,
  constraints: retroactiveConstraints,
  {
    iterations: 50,
    convergenceThreshold: 0.0001
  }
);

// Returns optimized chain with:
// - Selected evidence items
// - Loss metrics (constraint satisfaction, coherence, etc.)
// - Steps showing optimization progress
```

**Loss Function Components:**
- **Constraint Loss** (40%): Are retroactive constraints satisfied?
- **Conclusion Loss** (35%): How well does evidence support conclusion?
- **Coherence Loss** (20%): Do evidence pieces logically connect?
- **Paradox Penalty** (5%): Penalizes temporal loops

### Integration with Paradigm 2

```typescript
// In paradigm reasoning engine:

import { AcausalSearcher } from './rag/acausal-search';
import { RetroactiveOptimizer } from './rag/retroactive-optimizer';

class Paradigm2AcausalRetrocohesion {
  private acausalSearcher: AcausalSearcher;
  private optimizer: RetroactiveOptimizer;

  async reason(query: string, desiredOutcome?: string): Promise<ParadigmResponse> {
    // Perform acausal search
    const acausalResult = await this.acausalSearcher.search({
      query,
      desiredOutcome: desiredOutcome || "Optimal solution found",
      maxDepth: 4,
      allowRetroactivity: true
    });

    // Optimize evidence for this specific paradigm
    const optimized = await new RetroactiveOptimizer({
      targetConclusion: this.paradigmConclusion(query),
      constraints: acausalResult.retroactiveConstraints,
      evidencePool: acausalResult.synthesis.integratedChain
    }).optimize();

    return {
      paradigm_id: "P2_ACAUSAL_RETROCOHESION",
      reasoning: this.formatReasoning(acausalResult, optimized),
      confidence: optimized.coherenceMetrics.conclusionSupport,
      evidence_chain: optimized.optimizedEvidenceChain,
      time_loops: acausalResult.synthesis.timeLoops,
      retroactive_constraints: acausalResult.retroactiveConstraints
    };
  }
}
```

---

## API Gateway Implementation (Week 2-4)

### Route Structure to Implement

**File:** `src/api/routes.ts`

```typescript
import express from 'express';
import { queryController } from './controllers/query';
import { paradigmsController } from './controllers/paradigms';

const router = express.Router();

// Main query endpoint
router.post('/query', 
  validateQuery,
  rateLimitMiddleware,
  async (req, res) => {
    const { query, reasoning_type, desired_outcome, ...options } = req.body;

    try {
      // Call paradigm engines
      const paradigmResults = await Promise.all([
        paradigm1.reason(query, options),
        paradigm2AcausalReasoner.reason(query, desired_outcome, options),
        paradigm3.reason(query, options),
        // ... all 8+ paradigms
      ]);

      // Synthesize results
      const synthesis = synthesizeParadigmResults(paradigmResults);

      // Create execution recommendation
      const recommendation = createExecutionRecommendation(synthesis);

      res.json({
        request_id: generateId(),
        timestamp: new Date(),
        query,
        paradigm_responses: paradigmResults,
        merged_synthesis: synthesis,
        execution_recommendation: recommendation
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get('/paradigms', paradigmsController.list);
router.post('/evidence-chains', queryController.getEvidenceChains);
router.post('/approvals', requireAuth, approvalController.create);

export default router;
```

---

## Clawbot Plugin Implementation (Week 3-6)

### Plugin Structure

**File:** `clawbot/plugins/paradigm-stack-provider/index.js`

```javascript
const ParadigmStackProvider = {
  name: 'paradigm-stack-provider',
  version: '1.0.0',
  
  async handle(message, context) {
    // 1. Translate user message to paradigm query
    const query = this.translateQuery(message.text, context);

    // 2. Call Paradigm Stack API
    const response = await this.callApi('/api/v1/query', query);

    // 3. Format response for user's platform
    const formatted = this.formatResponse(response, message.platform);

    // 4. Create approval request if needed
    if (response.execution_recommendation.requires_human_approval) {
      const approval = await this.createApproval(response, context);
      formatted.approval_id = approval.approval_id;
    }

    return formatted;
  },

  translateQuery(userMessage, context) {
    return {
      query: userMessage,
      reasoning_type: context.complexity || 'acausal',
      desired_outcome: context.goal || null,
      include_evidence: true,
      max_depth: context.depth || 3
    };
  },

  formatResponse(paradigmResponse, platform) {
    if (platform === 'telegram') {
      return {
        text: `✅ Affirmative: ${paradigmResponse.paradigm_responses[0].reasoning}

❌ Negation: ${paradigmResponse.paradigm_responses[1].reasoning}

📊 Consensus: ${paradigmResponse.merged_synthesis.consensus}`,
        inline_buttons: [
          { text: 'Approve Action', action: 'approve_execution' },
          { text: 'See Evidence', action: 'show_evidence' }
        ]
      };
    }
    // ... other platforms
  }
};

module.exports = ParadigmStackProvider;
```

---

## Testing Strategy (Week 4-6)

### Unit Tests

**File:** `tests/unit/acausal-search.test.ts`

```typescript
describe('Acausal Reasoning', () => {
  it('should find forward evidence chains', async () => {
    const searcher = new AcausalSearcher(mockRetriever);
    const result = await searcher.search({
      query: 'How to optimize?',
      desiredOutcome: 'Optimal solution',
      maxDepth: 3,
      allowRetroactivity: true
    });

    expect(result.forwardChains.length).toBeGreaterThan(0);
    expect(result.forwardChains[0].links.length).toBeGreaterThan(1);
  });

  it('should find backward evidence chains', async () => {
    const result = await searcher.search({...});
    expect(result.backwardChains.length).toBeGreaterThan(0);
    expect(result.retroactiveConstraints.length).toBeGreaterThan(0);
  });

  it('should detect time loops', async () => {
    const result = await searcher.search({...});
    expect(result.synthesis.timeLoops.length).toBeGreaterThanOrEqual(0);
  });
});
```

### Integration Tests

**File:** `tests/integration/api-gateway.test.ts`

```typescript
describe('API Gateway Integration', () => {
  it('should process full query through all paradigms', async () => {
    const response = await client.post('/api/v1/query', {
      query: 'How to optimize?',
      reasoning_type: 'acausal'
    });

    expect(response.status).toBe(200);
    expect(response.body.paradigm_responses.length).toBe(8); // 8 paradigms
    expect(response.body.merged_synthesis.void_pressure).toBeDefined();
  });

  it('should handle timeout gracefully', async () => {
    const response = await client.post('/api/v1/query', {
      query: 'Complex query',
      timeout_ms: 100 // Very short timeout
    });

    expect(response.status).toBe(408);
    expect(response.body.error.code).toBe('TIMEOUT_EXCEEDED');
  });
});
```

### End-to-End Tests

**File:** `tests/e2e/clawbot-integration.test.ts`

```typescript
describe('Clawbot ↔ Paradigm Stack E2E', () => {
  it('should process telegram message end-to-end', async () => {
    // 1. Simulate Telegram message
    const telegramMessage = {
      text: 'How should we optimize resource allocation?',
      platform: 'telegram',
      user_id: 'user_123'
    };

    // 2. Call Clawbot plugin
    const response = await plugin.handle(telegramMessage, {});

    // 3. Verify response format
    expect(response.text).toContain('Affirmative');
    expect(response.text).toContain('Negation');
    expect(response.inline_buttons).toBeDefined();

    // 4. If approval needed, test approval flow
    if (response.approval_id) {
      const approval = await client.get(`/api/v1/approvals/${response.approval_id}`);
      expect(approval.status).toBe('pending');
      
      // Approve it
      const approved = await client.post(`/api/v1/approvals/${response.approval_id}/approve`);
      expect(approved.status).toBe('approved');
    }
  });
});
```

---

## Performance Targets

### Week-by-Week Goals

| Week | Component | Target | Actual |
|------|-----------|--------|--------|
| 2 | Query routing | <100ms | TBD |
| 3 | Single paradigm | <200ms | TBD |
| 4 | All paradigms (parallel) | <800ms | TBD |
| 5 | Response formatting | <50ms | TBD |
| 6 | Approval workflow | <100ms | TBD |
| 8 | Full pipeline | <2000ms | TBD |

### Success Metrics

By end of Week 9:
- ✅ Evidence chains 4+ links verified
- ✅ Backward search finds contradictions
- ✅ Retroactive optimization converges
- ✅ <2s latency verified
- ✅ 0 security incidents
- ✅ Clawbot plugin working

---

## Common Issues & Solutions

### Issue 1: Retroactive Optimizer Takes Too Long

**Problem:** Optimization iterations don't converge quickly

**Solution:**
```typescript
// Reduce iterations or increase convergence threshold
const config = {
  iterations: 30, // Reduced from 50
  convergenceThreshold: 0.001, // Increased from 0.0001
  learningRate: 0.05 // Increased from 0.01
};
```

### Issue 2: Circular Evidence Chains

**Problem:** Evidence chains reference each other (time loops)

**Solution:**
```typescript
// The paradox penalty catches this:
private calculateParadoxPenalty(evidence) {
  // Detects temporal contradictions
  // Returns penalty that increases loss
  // Optimizer learns to avoid
}
```

### Issue 3: API Timeout on Complex Queries

**Problem:** Queries with max_depth=5 timeout

**Solution:**
```typescript
// Parallelize paradigm processing more aggressively
const results = await Promise.all([
  paradigm1.reason(query),
  paradigm2.reason(query), // Not sequential
  paradigm3.reason(query),
  // ...
]);
```

---

## Next Steps: Week 2-9

### Week 2: HTTP Routes
- Implement Express routes in `src/api/routes.ts`
- Create controllers for query, paradigms, approvals
- Test each route independently

### Week 3: Clawbot Plugin Scaffolding
- Create `clawbot/plugins/paradigm-stack-provider/` directory
- Implement query translator
- Implement response formatter

### Week 4: Plugin Testing
- Mock Paradigm Stack API
- Test plugin ↔ mock API communication
- Fix integration issues

### Week 5-6: Response Formatting & Approvals
- Make responses user-friendly
- Implement approval workflow
- Add multi-platform support (Telegram, WhatsApp, Discord)

### Week 7: Security & Performance
- Run security audit
- Optimize slow queries
- Load test with 1000 concurrent requests

### Week 8: Checkpoint Evaluation
- Review what's working
- Plan next quarter (Semiotic Code)
- Decide: Continue integration or focus on paradigms?

---

## Files to Create (Next Weeks)

```
paradigm-stack/
├── src/
│   ├── api/
│   │   ├── routes.ts                    (Week 2)
│   │   ├── controllers/
│   │   │   ├── query.ts                (Week 2)
│   │   │   ├── paradigms.ts            (Week 2)
│   │   │   └── approval.ts             (Week 3)
│   │   └── middleware/
│   │       ├── validate-query.ts        (Week 2)
│   │       ├── rate-limit.ts            (Week 2)
│   │       └── auth.ts                  (Week 3)
│   └── paradigm2/
│       └── implementation.ts            (Week 2)
│
├── clawbot/
│   └── plugins/
│       └── paradigm-stack-provider/     (Week 3)
│           ├── index.js
│           ├── provider.js
│           ├── query-translator.js
│           ├── response-formatter.js
│           ├── approval-handler.js
│           └── error-handler.js
│
└── tests/
    ├── unit/
    │   ├── acausal-search.test.ts      (Week 2)
    │   └── retroactive-optimizer.test.ts
    ├── integration/
    │   ├── api-gateway.test.ts          (Week 4)
    │   └── paradigm2.test.ts            (Week 4)
    └── e2e/
        └── clawbot-integration.test.ts  (Week 6)
```

---

## Deliverables Checklist

### Phase 2 Complete When All Are ✅

**Paradigm Implementations:**
- [ ] Paradigm 1: Atemporal Manifold (Phase 1, carry forward)
- [ ] **Paradigm 2: Acausal Retrocohesion** (Phase 2 Q1) ← Current focus
- [ ] Paradigm 3-8: Previously completed
- [ ] Paradigm 6: Liberated Signification (Phase 2 Q2)
- [ ] Paradigm 9: Consciousness Alienation (Phase 2 Q3)
- [ ] Paradigm 10: Negation Becoming (Phase 1, carry forward)

**Integration (If Checkpoint GO):**
- [ ] REST API stable and documented
- [ ] Clawbot plugin working
- [ ] Multi-platform access (Telegram, WhatsApp)
- [ ] Real-world execution tested
- [ ] <2s latency verified
- [ ] 0 security incidents

**Success Outcome:**
```
User opens Telegram
Sends: "How should we optimize?"
↓
Clawbot routes to Paradigm Stack
↓
Stack processes with 8 paradigms
↓
~1.5 seconds later...
↓
User sees:
✅ Affirmative perspective...
❌ Negation perspective...
⚖️  Neutral synthesis...
📚 Evidence: 3 sources
💻 Code patterns: 2 patterns
📊 Void Pressure: 0.34
⚡ Approve execution? [YES/NO]
```

---

## Key Contacts & Resources

**Questions about Acausal Reasoning?**
- See: `PHASE2_KICKOFF.md` (original spec)
- See: `src/rag/acausal-search.ts` (implementation)

**Questions about Integration?**
- See: `docs/INTEGRATION_ARCHITECTURE.md`
- See: `docs/API_SPECIFICATION.md`

**Questions about Clawbot?**
- Reference: `CLAWBOT_INTEGRATION_ANALYSIS.md`
- Reference: `CLAWBOT_INTEGRATION_INDEX.md`

**Questions about Phase 2 Timeline?**
- See: `PHASES.md`
- See: `PHASE2_START_HERE.md`

---

**Status:** Phase 2 Week 1 Complete ✅  
**Next Phase:** Week 2 (HTTP Routes Implementation)  
**Estimated Completion:** Month 18 (36 weeks from now)

Let's build paradigm-native reasoning. 🧠⚡

