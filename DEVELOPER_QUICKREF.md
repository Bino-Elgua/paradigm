# Paradigm Stack Developer Quick Reference

Quick commands and patterns for working with the Paradigm Stack.

---

## Quick Start

```bash
# Install and build
npm install
npm run build

# Run tests
npm test

# Start server
npm run dev

# Start Phase 1 demo
npm run dev:phase1
```

---

## Common Tasks

### Testing a Component

```bash
# Test specific file
npm test -- ralph.test.ts

# Test with coverage
npm test -- --coverage

# Test in watch mode
npm run test:watch

# Run only integration tests
npm run test:integration
```

### Testing the API

```bash
# Start server
npm run dev

# In another terminal:

# Simple query
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"question":"What is AI?","budget":500}'

# With paradigm context
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"question":"Optimal allocation?","budget":500,"paradigmContext":"optimization"}'

# Health check
curl http://localhost:3000/health

# System metrics
curl http://localhost:3000/metrics

# Reset system
curl -X POST http://localhost:3000/reset
```

### Adding a New Paradigm Feature

1. Create component file:
```bash
touch src/paradigm{N}/feature-name.ts
```

2. Define types:
```typescript
// src/types/index.ts - add type
export interface NewFeature {
  id: string;
  value: number;
}
```

3. Implement component:
```typescript
// src/paradigm{N}/feature-name.ts
import { featureLogger } from '@utils/logger.js';

export class NewFeature {
  async execute(): Promise<void> {
    featureLogger.info('Executing feature');
  }
}

export const newFeature = new NewFeature();
```

4. Create test:
```typescript
// tests/integration/new-feature.test.ts
import { describe, it, expect } from 'vitest';
import { newFeature } from '@paradigm{N}/feature-name.js';

describe('NewFeature', () => {
  it('should work', async () => {
    await newFeature.execute();
    expect(true).toBe(true);
  });
});
```

5. Export from index:
```typescript
// src/index.ts
export { newFeature } from '@paradigm{N}/feature-name.js';
```

### Modifying the API

Gateway file: `src/api/gateway.ts`

Add a new endpoint:
```typescript
this.app.post('/new-endpoint', async (req, res) => {
  try {
    const { data } = req.body;
    apiLogger.info({ data }, 'New endpoint called');
    
    // Process
    const result = await someComponent.process(data);
    
    return res.status(200).json(result);
  } catch (error: any) {
    apiLogger.error({ error: error.message }, 'Failed');
    return res.status(500).json({ error: error.message });
  }
});
```

### Adding Logging

```typescript
// Import logger
import { someLogger } from '@utils/logger.js';

// Log at different levels
someLogger.debug({ context }, 'Debug message');
someLogger.info({ context }, 'Info message');
someLogger.warn({ context }, 'Warning message');
someLogger.error({ context }, 'Error message');
```

Available loggers:
- `logger` - General logging
- `apiLogger` - API requests/responses
- `ralphLogger` - Ralph evaluator
- `voidLogger` - Void-pressure
- `mcpLogger` - MCP router
- `ragLogger` - RAG retrieval
- `vectordbLogger` - VectorDB
- `ccaLogger` - CCA operations
- `persistenceLogger` - SUI/Walrus
- `consumptionLogger` - Consumption metrics

### Running Specific Tests

```bash
# All tests
npm test

# Ralph tests only
npm test -- ralph

# Integration tests only
npm run test:integration

# Specific test file
npm test -- tests/integration/phase1.test.ts

# Specific test case
npm test -- -t "should process complete query"

# With verbose output
npm test -- --reporter=verbose
```

### Code Quality

```bash
# Lint
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# All checks
npm run lint && npm run type-check && npm test
```

### Docker

```bash
# Build image
npm run docker:build

# Run container
npm run docker:run

# Docker Compose (multi-service)
docker-compose up

# Docker Compose with optional services
docker-compose up --profile optional

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

---

## File Locations

```
paradigm-stack/
├── src/
│   ├── api/          # API gateway
│   ├── ralph/        # Paradigm 10 (Negation)
│   ├── mcp/          # Paradigm 3 (Plurality)
│   ├── rag/          # Paradigm 2 (Acausal)
│   ├── vectordb/     # Paradigm 6 (Semiotic)
│   ├── cca/          # Paradigm 1+5 (Atemporal+Fuzzy)
│   ├── persistence/  # Paradigm 4+8 (Necrosis+Hierarchy)
│   ├── types/        # Type definitions
│   ├── utils/        # Logging, config
│   └── index.ts      # Entry point
├── tests/
│   └── integration/  # Integration tests
├── package.json
├── tsconfig.json
├── Dockerfile
└── docker-compose.yml
```

---

## Key Interfaces

### Query
```typescript
interface Query {
  id: string;
  question: string;
  budget: number;
  paradigmContext?: string;
  timestamp: Date;
}
```

### QueryResponse
```typescript
interface QueryResponse {
  queryId: string;
  results: ReasonerResult[];
  evidence: EvidenceItem[];
  codePatterns: CodePattern[];
  consumption: ConsumptionMetrics;
  ralphDecision: RalphDecision;
  suiTransactionHash?: string;
  timestamp: Date;
  paradigmInstantiations: string[];
}
```

### ReasonerResult
```typescript
interface ReasonerResult {
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
```

---

## Paradigm Quick Reference

| P# | Name | Component | Status |
|----|------|-----------|--------|
| 1 | Atemporal | CCA Manifest | ✅ Active |
| 2 | Acausal | RAG Retriever | ✅ Active |
| 3 | Polyphonic | MCP Router | ✅ Active |
| 4 | Necrotic | SUI Bridge | ✅ Active |
| 5 | Fuzzy | MCP Frames | ✅ Active |
| 6 | Semiotic | VectorDB | ✅ Active |
| 7 | Inversion | TBD | ⏳ Phase 2 |
| 8 | Hierarchy | RLM/Consumption | ✅ Active |
| 9 | Alienation | TBD | ⏳ Phase 2 |
| 10 | Void | Ralph | ✅ Active |

---

## Debugging Tips

### Enable Debug Logging
```bash
# Set in .env
LOG_LEVEL=debug

# Or at runtime
DEBUG=paradigm-stack:* npm run dev
```

### Test a Single Query
```bash
# Create test.json
{
  "question": "Your question here",
  "budget": 500
}

# Send
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d @test.json | jq .
```

### Check System Health
```bash
curl http://localhost:3000/health | jq .
```

### View Metrics
```bash
curl http://localhost:3000/metrics | jq .
```

### Reset System
```bash
curl -X POST http://localhost:3000/reset
```

---

## Environment Variables

```bash
# .env
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Phase configuration
PHASE=1
PARADIGM_MODE=isolated

# Ralph budget
RALPH_BUDGET_TOKENS=10000
RALPH_COST_PER_TOKEN=0.01
RALPH_DENIAL_THRESHOLD=0.5

# LLM (for Phase 2)
LLM_PROVIDER=claude
ANTHROPIC_API_KEY=your-key

# Qdrant (for Phase 2)
QDRANT_URL=http://localhost:6333
QDRANT_TIMEOUT=30000

# SUI (for Phase 2)
SUI_RPC_URL=https://fullnode.devnet.sui.io
```

---

## Type Checking

Add types for new features:

```typescript
// src/types/index.ts

export interface MyNewType {
  id: string;
  value: number;
}

export interface MyConfig {
  enabled: boolean;
  threshold: number;
}
```

Use in components:
```typescript
import { MyNewType } from '@types/index.js';

const item: MyNewType = {
  id: 'test',
  value: 42,
};
```

---

## Common Errors

### "Cannot find module"
```
Error: Cannot find module '@utils/logger'
Fix: Check path aliases in tsconfig.json
```

### "Port already in use"
```
Error: listen EADDRINUSE: address already in use :::3000
Fix: npm run reset  (kills old process)
or: lsof -ti:3000 | xargs kill -9
```

### "Type mismatch"
```
Error: Type 'X' is not assignable to type 'Y'
Fix: Check type definitions in src/types/index.ts
```

### Tests failing
```
npm test -- --reporter=verbose  (see details)
npm run type-check  (check types)
npm run lint  (check syntax)
```

---

## Build & Deploy

### Build
```bash
npm run build
```

Output in `dist/`

### Docker
```bash
npm run docker:build
npm run docker:run
```

### Type Check
```bash
npm run type-check
```

### Format Code
```bash
npm run format
```

---

## Contributing

1. Create feature branch:
```bash
git checkout -b feature/description
```

2. Make changes:
- Create/modify files
- Add tests
- Update docs

3. Test:
```bash
npm test
npm run lint
npm run type-check
```

4. Commit:
```bash
git add .
git commit -m "Add feature description"
```

5. Push and create PR

---

## Next Steps

- **For Phase 2:** See PHASE2_KICKOFF.md
- **For Architecture:** See ARCHITECTURE.md
- **For Testing:** See tests/integration/phase1.test.ts
- **For API:** Send queries to http://localhost:3000/query

---

**Last Updated:** 2026-02-05
**Phase:** 1 Complete, Phase 2 Ready
