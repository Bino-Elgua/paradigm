# Paradigm Stack + Clawbot Integration Architecture

**Version:** 1.0.0  
**Status:** Phase 2 Week 1 Design  
**Last Updated:** 2026-02-05

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interaction Layer                    │
│              (Telegram, WhatsApp, Discord, etc.)            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     CLAWBOT INTERFACE                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │    Clawbot Paradigm Stack Provider Plugin              │ │
│  │  ├─ Query Translation (User Message → Structured)      │ │
│  │  ├─ HTTP Client (REST calls to Paradigm Stack)         │ │
│  │  ├─ Response Parsing (Paradigm JSON → User Format)     │ │
│  │  └─ Safety Approval Integration                        │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTP/REST
                   (Port 3000)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              PARADIGM STACK API GATEWAY                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Express Routes:                                       │ │
│  │  POST /api/v1/query                                    │ │
│  │  GET  /api/v1/paradigms                                │ │
│  │  POST /api/v1/evidence-chains                          │ │
│  │  POST /api/v1/approvals                                │ │
│  │  GET  /api/v1/metrics                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │   RAG    │  │   CCA    │  │  Paradigm│
    │Retriever │  │ Manifest │  │Reasoning │
    └──────────┘  └──────────┘  │ Engine   │
                                  └──────────┘
```

---

## Data Flow: Query to Response

```
1. USER MESSAGE (Telegram/WhatsApp)
   └─ "How should we optimize resource allocation?"

2. CLAWBOT PLUGIN
   └─ Translates to structured query
   └─ Adds context (user_id, conversation_id, etc.)

3. HTTP POST /api/v1/query
   ├─ Headers: Content-Type: application/json
   ├─ Body: {query, reasoning_type, desired_outcome, ...}
   └─ Timeout: 30 seconds

4. PARADIGM STACK ROUTING
   ├─ Validates query against schema
   ├─ Selects applicable paradigms
   ├─ Routes to reasoning engines in parallel

5. PARADIGM-NATIVE REASONING
   ├─ P1 (Atemporal): Analyzes across time dimensions
   ├─ P2 (Acausal): Searches backward/forward simultaneously
   ├─ P3-P10: Other paradigm engines process in parallel
   └─ All run concurrently, collect results

6. RESPONSE SYNTHESIS
   ├─ Merge paradigm outputs
   ├─ Calculate consensus metrics
   ├─ Identify contradictions
   └─ Score evidence quality

7. API RESPONSE (JSON)
   ├─ All paradigm perspectives
   ├─ Merged synthesis
   ├─ Evidence chains
   ├─ Code patterns (if requested)
   └─ Execution recommendation

8. CLAWBOT PLUGIN FORMATTING
   ├─ Converts JSON to user-friendly format
   ├─ Extracts action recommendations
   ├─ Creates approval request (if needed)
   └─ Sends formatted response to user

9. USER RECEIVES
   └─ "✅ Affirmative: Yes, optimize via load-balancing..."
      "❌ Negation: No, fairness risks include..."
      "📊 Evidence: 3 sources, high confidence"
      "⚡ Approval needed? [YES/NO]"
```

---

## Clawbot Plugin Architecture

### File Structure

```
clawbot/
├── plugins/
│   └── paradigm-stack-provider/
│       ├── index.js              (Main entry point)
│       ├── provider.js            (Provider class)
│       ├── query-translator.js    (User msg → Paradigm query)
│       ├── response-formatter.js  (Paradigm JSON → User format)
│       ├── approval-handler.js    (Safety approval workflow)
│       ├── http-client.js         (REST calls)
│       ├── error-handler.js       (Error/retry logic)
│       └── types.js               (TypeScript interfaces)
│
└── config/
    └── paradigm-stack-provider.config.js
        ├── API endpoint URL
        ├─ API key/token
        ├─ Timeout settings
        ├─ Retry policy
        └─ Rate limiting
```

### Query Translator Logic

```javascript
// clawbot/plugins/paradigm-stack-provider/query-translator.js

class QueryTranslator {
  translate(userMessage, context) {
    return {
      query: userMessage.text,
      reasoning_type: context.reasoning_type || 'acausal',
      desired_outcome: context.goal || null,
      include_evidence: true,
      include_code_patterns: context.wants_code || false,
      max_depth: context.complexity_level || 3,
      paradigm_filter: context.paradigms || ['all'],
      timeout_ms: 30000,
      
      // Metadata for tracking
      clawbot_request_id: context.message_id,
      user_id: context.user_id,
      platform: context.platform, // 'telegram', 'whatsapp', etc.
      conversation_id: context.conversation_id
    };
  }
}
```

### Response Formatter Logic

```javascript
// clawbot/plugins/paradigm-stack-provider/response-formatter.js

class ResponseFormatter {
  format(paradigmResponse, platform) {
    if (platform === 'telegram') {
      return this.formatTelegram(paradigmResponse);
    } else if (platform === 'whatsapp') {
      return this.formatWhatsApp(paradigmResponse);
    }
  }

  formatTelegram(response) {
    // Extract key perspectives
    const affirmative = response.paradigm_responses
      .filter(p => p.perspective === 'affirmative')[0];
    const negation = response.paradigm_responses
      .filter(p => p.perspective === 'negation')[0];

    return {
      text: `
✅ *Affirmative Perspective*
${affirmative.reasoning}

❌ *Negation Perspective*
${negation.reasoning}

📊 *Consensus*
${response.merged_synthesis.consensus}

⚡ *Void Pressure: ${response.merged_synthesis.void_pressure}*
      `,
      inline_keyboard: [
        [{text: "More Details", callback_data: `paradigm_details_${response.request_id}`}],
        [{text: "Execute Action", callback_data: `paradigm_approve_${response.request_id}`}],
        [{text: "Different Question", callback_data: "new_query"}]
      ]
    };
  }
}
```

---

## API Gateway Implementation

### Route Structure

```typescript
// paradigm-stack/src/api/routes.ts

import express from 'express';
import { queryController } from './controllers/query';
import { paradigmsController } from './controllers/paradigms';
import { approvalController } from './controllers/approval';

const router = express.Router();

// Query endpoint (main)
router.post('/query', 
  validateQuery,
  rateLimitMiddleware,
  queryController.handle
);

// Paradigm listing
router.get('/paradigms',
  paradigmsController.list
);

// Evidence chains
router.post('/evidence-chains',
  validateEvidenceChainRequest,
  queryController.getEvidenceChains
);

// Code patterns
router.post('/code-patterns',
  validateCodePatternRequest,
  queryController.getCodePatterns
);

// Approval workflow
router.post('/approvals',
  requireAuth,
  approvalController.create
);

router.get('/approvals/:id',
  approvalController.getStatus
);

// Metrics
router.get('/metrics',
  metricsController.get
);

export default router;
```

### Query Controller Implementation

```typescript
// paradigm-stack/src/api/controllers/query.ts

export class QueryController {
  async handle(req: Request, res: Response) {
    const requestId = generateRequestId();
    const startTime = Date.now();

    try {
      // 1. Validate and parse request
      const query = req.body;
      validateQuery(query);

      // 2. Run all paradigm engines in parallel
      const paradigmPromises = this.selectedParadigms(query)
        .map(paradigm => 
          paradigm.reason({
            query: query.query,
            desiredOutcome: query.desired_outcome,
            maxDepth: query.max_depth
          })
        );

      const paradigmResults = await Promise.all(paradigmPromises);

      // 3. Synthesize results
      const synthesis = this.synthesizeResults(paradigmResults);

      // 4. Prepare response
      const response = {
        request_id: requestId,
        timestamp: new Date().toISOString(),
        query: query.query,
        paradigm_responses: paradigmResults,
        merged_synthesis: synthesis,
        evidence_summary: this.analyzeEvidence(paradigmResults),
        code_patterns: query.include_code_patterns 
          ? await this.getCodePatterns(query.query)
          : [],
        execution_recommendation: this.getExecutionRec(synthesis)
      };

      res.json(response);
    } catch (error) {
      res.status(400).json({
        error: {
          code: error.code,
          message: error.message
        }
      });
    }
  }
}
```

---

## Safety & Approval Workflow

### Approval Flow

```
User Action Request
        │
        ▼
Calculate Risk Level
├─ LOW: Execute immediately
├─ MEDIUM: Create approval request, wait for human review
└─ HIGH: Block, require explicit approval

        ▼
Create Approval Record
├─ Store in database
├─ Generate approval URL
├─ Set 10-minute expiration
└─ Notify approver

        ▼
Human Review
├─ Approver accesses review URL
├─ Reviews reasoning and evidence
├─ Approves, rejects, or modifies
└─ Records decision and timestamp

        ▼
Update Execution Status
├─ APPROVED: Queue for execution
├─ REJECTED: Notify user
└─ MODIFIED: Send modified action back

        ▼
Execute Action / Report Back
└─ Return execution_id to user
```

### Approval Entity Schema

```typescript
interface Approval {
  approval_id: string;
  query_id: string;
  user_id: string;
  action: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  paradigm_recommendation: string;
  evidence_summary: string;
  
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  created_at: Date;
  expires_at: Date;
  reviewed_at?: Date;
  reviewed_by?: string;
  approval_decision?: string;
  
  execution_status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  execution_id?: string;
  execution_result?: any;
}
```

---

## Error Handling & Retry Logic

### Retry Strategy

```typescript
// paradigm-stack/src/api/http-client.ts

class HttpClient {
  async request(config) {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        return await axios(config);
      } catch (error) {
        attempt++;

        if (this.isRetryable(error) && attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
          await this.sleep(delay);
          continue;
        }

        throw this.formatError(error);
      }
    }
  }

  isRetryable(error) {
    // Retry on network errors, 5xx, 429 (rate limit)
    // Don't retry on 4xx validation errors
    return !error.response || 
           error.response.status >= 500 ||
           error.response.status === 429;
  }
}
```

### Error Categorization

| Error Type | HTTP Status | User Message | Action |
|------------|-------------|--------------|--------|
| Invalid query | 400 | "Please clarify your question" | Suggest examples |
| Paradigm unavailable | 503 | "Some reasoning modes are temporarily offline" | Retry |
| Timeout | 408 | "That's taking too long, try a simpler question" | Suggest simplification |
| Rate limit | 429 | "Please wait before asking again" | Show retry time |
| Server error | 500 | "We encountered an error, please try again" | Log and alert |

---

## Performance Requirements

### Response Time Targets

| Operation | Target | SLA |
|-----------|--------|-----|
| Simple query (forward reasoning) | <500ms | 99.5% |
| Standard query (acausal) | <2s | 99% |
| Complex query (4+ depth) | <5s | 95% |
| Evidence chain analysis | <3s | 99% |

### Concurrency

- **Paradigm engines:** Run in parallel (async/await)
- **Database queries:** Connection pooling (10-20 connections)
- **API rate:** 10,000 req/hour standard tier

### Caching Strategy

```typescript
interface CacheConfig {
  ttl: {
    paradigm_list: 3600, // 1 hour
    user_query_result: 300, // 5 minutes
    code_patterns: 7200, // 2 hours
    metrics: 60 // 1 minute
  }
}
```

---

## Monitoring & Observability

### Metrics to Track

```typescript
interface SystemMetrics {
  // Performance
  avg_response_time_ms: number;
  p95_response_time_ms: number;
  p99_response_time_ms: number;

  // Reliability
  total_queries: number;
  error_rate: number;
  timeout_rate: number;

  // Business
  paradigm_usage: Record<string, number>;
  reasoning_type_distribution: Record<string, number>;
  void_pressure_average: number;

  // Integration
  clawbot_queries: number;
  approval_requests: number;
  approval_approval_rate: number;
}
```

### Logging

```typescript
logger.info('paradigm_query_started', {
  request_id: requestId,
  query_length: query.length,
  paradigm_count: selectedParadigms.length,
  reasoning_type: reasoningType
});

logger.info('paradigm_query_completed', {
  request_id: requestId,
  duration_ms: elapsedTime,
  paradigm_count: results.length,
  void_pressure: synthesis.void_pressure,
  errors: errors.length
});
```

---

## Security Considerations

### Authentication

- Bearer token authentication for protected endpoints
- Token format: `sk-paradigm-{32_random_chars}`
- Stored as bcrypt hash in database
- Tokens expire after 90 days

### Input Validation

```typescript
// Query validation schema
const querySchema = z.object({
  query: z.string().min(10).max(10000),
  reasoning_type: z.enum(['forward', 'backward', 'acausal']),
  desired_outcome: z.string().optional(),
  max_depth: z.number().min(1).max(5),
  timeout_ms: z.number().min(1000).max(60000)
});
```

### Rate Limiting

- Per-IP: 100 requests/minute
- Per-API-key: Tier-based (free/standard/enterprise)
- Sliding window algorithm
- Graceful degradation (queue vs. reject)

### Data Privacy

- Query content not logged (only metadata)
- Approval requests encrypted at rest
- User data isolated by organization
- Compliance: GDPR, CCPA, SOC2

---

## Deployment Architecture

### Docker Setup

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### Environment Variables

```bash
# Paradigm Stack
API_PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# Authentication
API_KEY_SECRET=xxxxxx

# Database
DATABASE_URL=postgresql://user:pass@db:5432/paradigm

# Qdrant (Vector DB)
QDRANT_URL=http://qdrant:6333

# Claude API
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Clawbot Integration
CLAWBOT_WEBHOOK_URL=https://clawbot.example.com/paradigm-callback
```

### Docker Compose

```yaml
version: '3.8'

services:
  paradigm-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://paradigm:password@postgres:5432/paradigm
      - QDRANT_URL=http://qdrant:6333
    depends_on:
      - postgres
      - qdrant

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=paradigm
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=paradigm

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - qdrant_storage:/qdrant/storage
```

---

## Phase 2 Integration Timeline

| Week | Task | Deliverable |
|------|------|-------------|
| 1 | API design & architecture | API_SPECIFICATION.md, INTEGRATION_ARCHITECTURE.md |
| 2 | HTTP routes implementation | Working REST endpoints |
| 3 | Clawbot plugin scaffolding | Basic plugin structure |
| 4 | Plugin integration testing | Plugin ↔ API communication |
| 5 | Response formatting | User-friendly outputs |
| 6 | Approval workflow | End-to-end approval flow |
| 7 | Security audit | Security report |
| 8 | Checkpoint evaluation | GO/STOP decision |

---

