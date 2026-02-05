# Paradigm Stack Quick Start

## Prerequisites
- Node.js 18+
- npm or yarn
- Docker & Docker Compose (optional, for local Qdrant/Redis)

## Installation

```bash
cd paradigm-stack
npm install
```

## Configuration

```bash
cp .env.example .env
# Edit .env with your API keys if using Claude
# For local testing, defaults work (Ollama will be used if available)
```

## Running Phase 1

### Option 1: Docker Compose (Full Stack)

```bash
# Start all services
docker-compose up -d

# Check status
curl http://localhost:3000/health

# Run test
npm run dev:phase1

# View logs
docker-compose logs -f paradigm-stack
```

### Option 2: Local Development (Minimal)

```bash
# Start dev server (requires local Qdrant, Redis, or mocked)
npm run dev

# In another terminal, run Phase 1 test
npm run dev:phase1
```

### Option 3: Quick Test

```bash
# Run Phase 1 integration test directly
npm run test:integration
```

## First Query

```bash
# Start the API server
npm run dev

# In another terminal, send a query
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the optimal resource allocation strategy?",
    "budget": 500
  }'
```

Expected response:
```json
{
  "queryId": "...",
  "results": [
    {
      "reasonerName": "Affirmative",
      "reasonerFrame": "Interpret query as maximization problem",
      "conclusion": "YES - The query should be interpreted as: ...",
      "confidence": 0.92
    },
    {
      "reasonerName": "Negation",
      "reasonerFrame": "Interpret query as minimization/refutation",
      "conclusion": "NO - The query is fundamentally problematic because: ...",
      "confidence": 0.88
    },
    {
      "reasonerName": "Neutral",
      "reasonerFrame": "Interpret query as frame-independent (indifferent)",
      "conclusion": "BOTH/NEITHER - The query is simultaneously valid and invalid: ...",
      "confidence": 0.85
    }
  ],
  "consumption": {
    "tokensUsed": 342,
    "energyBurned": 1.78,
    "necrticLayersCreated": 1
  },
  "ralphDecision": {
    "decision": "APPROVE",
    "voidPressure": 0.0,
    "justification": "Budget available, cost ratio acceptable"
  },
  "paradigmInstantiations": [
    "polyphonic-subjectivity",
    "negation-becoming",
    "liberated-signification"
  ]
}
```

## Metrics & Monitoring

```bash
# System health
curl http://localhost:3000/health

# Full metrics
curl http://localhost:3000/metrics

# View logs
tail -f logs/paradigm-metrics.log
tail -f logs/void-pressure.log
tail -f logs/consumption.log
```

## Development

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Watch mode (auto-rebuild on changes)
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## Docker Commands

```bash
# Build image
npm run docker:build

# Run container
npm run docker:run

# View logs
docker logs paradigm-stack-api

# Stop container
docker stop paradigm-stack-api

# Full stack with docker-compose
docker-compose up              # Start
docker-compose down            # Stop
docker-compose logs -f         # Logs
docker-compose ps              # Status
```

## Troubleshooting

**"Cannot find module" errors:**
```bash
npm install
npm run build
```

**Port 3000 already in use:**
```bash
PORT=3001 npm run dev
# Or: pkill -f "node.*paradigm"
```

**Qdrant connection refused:**
```bash
# Make sure docker-compose is running
docker-compose up -d qdrant

# Or use mock mode (set QDRANT_URL=mock in .env)
```

**API returns 500 errors:**
```bash
# Check logs
tail -f logs/paradigm-stack.log

# Verify config
npm run type-check
```

## What's Implemented (Phase 1)

✅ Ralph Evaluator (Paradigm 10: Negation/Void-Pressure)
✅ MCP Router (Paradigm 3: Polyphonic Subjectivity) 
✅ API Gateway (Paradigm 6: Liberated Signification)
✅ Basic logging + metrics
✅ Configuration system
✅ Docker setup

## What's Next (Phase 2)

🔜 VectorDB + Semantic Search
🔜 RAG (Retrieval Augmented Generation)
🔜 CCA (Code Generation)
🔜 SUI Blockchain Integration
🔜 Acausal Reasoning
🔜 Semiotic Code Selection

## Documentation

- [Architecture](./ARCHITECTURE.md) - System design & paradigm mapping
- [Phases](./PHASES.md) - Timeline & milestones
- [Roadmap](./ROADMAP.md) - Week-by-week tasks

## Support

For issues or questions, check the logs and review the architecture documentation.

---

**Status:** Phase 1 - Week 1
**Next Milestone:** Week 3-4 Component Integration
