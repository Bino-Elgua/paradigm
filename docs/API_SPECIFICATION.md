# Paradigm Stack REST API Specification

**Version:** 1.0.0  
**Status:** Phase 2 Week 1 Deliverable  
**Last Updated:** 2026-02-05

---

## Overview

The Paradigm Stack API enables external systems (like Clawbot) to query the reasoning engine and receive multi-paradigm responses. The API is designed to:

- Support **acausal reasoning queries** with bidirectional evidence chains
- Return **paradigm-native outputs** (8 simultaneous reasoning perspectives)
- Maintain **contradiction preservation** across paradigms
- Enable **real-world execution** via structured responses
- Provide **safety approval workflows** before action execution

---

## Base URL

```
http://localhost:3000/api/v1
```

All requests must include:
- `Content-Type: application/json`
- Optional: `Authorization: Bearer <token>` (for protected endpoints)

---

## Endpoints

### 1. Query Endpoint

**POST** `/query`

Execute a multi-paradigm query and receive reasoning from all active paradigms.

#### Request

```json
{
  "query": "How should we optimize resource allocation in a distributed system?",
  "reasoning_type": "acausal",
  "desired_outcome": "Find the most efficient allocation strategy",
  "include_evidence": true,
  "include_code_patterns": true,
  "max_depth": 4,
  "paradigm_filter": ["all"],
  "timeout_ms": 30000
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | ✅ | The question or problem statement |
| `reasoning_type` | enum | ❌ | `forward` \| `backward` \| `acausal` (default: `acausal`) |
| `desired_outcome` | string | ❌ | Outcome for backward/acausal reasoning |
| `include_evidence` | boolean | ❌ | Include citation sources (default: `true`) |
| `include_code_patterns` | boolean | ❌ | Include code examples (default: `false`) |
| `max_depth` | number | ❌ | Max chain depth for evidence (default: 3, max: 5) |
| `paradigm_filter` | array | ❌ | Paradigm IDs to include (default: `["all"]`) |
| `timeout_ms` | number | ❌ | Response timeout (default: 30000, max: 60000) |

#### Response

```json
{
  "request_id": "req_3f1a2b4c5d6e7f8g",
  "timestamp": "2026-02-05T14:23:45Z",
  "query": "How should we optimize resource allocation?",
  "paradigm_responses": [
    {
      "paradigm_id": "P1_ATEMPORAL_MANIFOLD",
      "name": "Atemporal Manifold",
      "reasoning": "Resource allocation exists atemporally across all possible states...",
      "confidence": 0.92,
      "perspective": "affirmative",
      "contradiction_with": ["P4_PARASITIC_MATERIALITY"]
    },
    {
      "paradigm_id": "P2_ACAUSAL_RETROCOHESION",
      "name": "Acausal Retrocohesion",
      "reasoning": "Optimal allocation retroactively influences resource availability...",
      "confidence": 0.87,
      "perspective": "affirmative",
      "evidence_chain": [
        {
          "rank": 1,
          "source": "Distributed Systems Paper #47",
          "relevance": 0.98,
          "direction": "forward"
        },
        {
          "rank": 2,
          "source": "Optimization Theory Study",
          "relevance": 0.95,
          "direction": "backward"
        }
      ],
      "contradiction_with": []
    }
  ],
  "merged_synthesis": {
    "affirmative_perspectives": 5,
    "negation_perspectives": 2,
    "neutral_perspectives": 1,
    "consensus": "Multiple valid approaches exist with context-dependent trade-offs",
    "void_pressure": 0.34
  },
  "evidence_summary": {
    "total_sources": 12,
    "high_confidence": 8,
    "contradictions_found": 2,
    "evidence_gaps": ["Long-term sustainability impact"]
  },
  "code_patterns": [
    {
      "pattern_type": "load_balancing",
      "differential_position": 0.78,
      "code_snippet": "// Round-robin allocation with weighted fairness...",
      "applicability": 0.91
    }
  ],
  "execution_recommendation": {
    "action": "PROCEED_WITH_CAUTION",
    "risk_level": "MEDIUM",
    "requires_human_approval": true,
    "approval_endpoint": "/api/v1/approvals/{approval_id}"
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `request_id` | string | Unique request identifier for tracking |
| `timestamp` | ISO 8601 | Server timestamp |
| `paradigm_responses` | array | Array of per-paradigm reasoning outputs |
| `merged_synthesis` | object | Cross-paradigm synthesis and consensus |
| `evidence_summary` | object | Aggregated evidence analysis |
| `code_patterns` | array | Relevant code patterns (if requested) |
| `execution_recommendation` | object | Safety/execution guidance |

#### Status Codes

| Code | Meaning |
|------|---------|
| 200 | Successful query and response |
| 400 | Invalid request format |
| 408 | Timeout exceeded |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

### 2. Paradigm Status Endpoint

**GET** `/paradigms`

List all available paradigms and their status.

#### Response

```json
{
  "total_paradigms": 10,
  "active": 8,
  "partial": 2,
  "paradigms": [
    {
      "id": "P1_ATEMPORAL_MANIFOLD",
      "name": "Atemporal Manifold",
      "status": "active",
      "implementation_percentage": 100,
      "description": "Code exists atemporally in a topological manifold",
      "monthly_queries": 1247,
      "avg_response_time_ms": 124
    },
    {
      "id": "P2_ACAUSAL_RETROCOHESION",
      "name": "Acausal Retrocohesion",
      "status": "active",
      "implementation_percentage": 95,
      "description": "Bidirectional reasoning with retroactive constraint propagation",
      "monthly_queries": 892,
      "avg_response_time_ms": 287
    }
  ],
  "entanglement_pairs": [
    {
      "pair": ["P1_ATEMPORAL_MANIFOLD", "P6_LIBERATED_SIGNIFICATION"],
      "synergy": "high",
      "emergent_behavior": "Meanings emerge from topological positions"
    }
  ]
}
```

---

### 3. Evidence Chain Endpoint

**POST** `/evidence-chains`

Request detailed evidence chain analysis for a specific query-outcome pair.

#### Request

```json
{
  "query": "How to optimize allocation?",
  "desired_outcome": "Maximize efficiency while preserving fairness",
  "max_chain_length": 5,
  "include_contradictions": true
}
```

#### Response

```json
{
  "chains": [
    {
      "chain_id": "chain_forward_001",
      "direction": "forward",
      "links": [
        {
          "position": 0,
          "content": "Query: How to optimize?",
          "type": "query"
        },
        {
          "position": 1,
          "content": "Efficiency maximization strategy",
          "source": "Resource Optimization Paper",
          "relevance": 0.97,
          "type": "evidence"
        },
        {
          "position": 2,
          "content": "Fairness constraints in systems",
          "source": "Distributed Systems Book",
          "relevance": 0.94,
          "type": "evidence"
        },
        {
          "position": 3,
          "content": "Hybrid allocation algorithm",
          "source": "GitHub Repo #optimization-algo",
          "relevance": 0.89,
          "type": "conclusion"
        }
      ],
      "convergence_score": 0.91
    },
    {
      "chain_id": "chain_backward_001",
      "direction": "backward",
      "links": [
        {
          "position": 0,
          "content": "Outcome: Maximize efficiency while preserving fairness",
          "type": "desired_outcome"
        },
        {
          "position": 1,
          "content": "Fairness metrics must be quantified",
          "source": "Ethics in Computing Paper",
          "relevance": 0.92,
          "type": "retroactive_constraint"
        }
      ],
      "convergence_score": 0.85
    }
  ],
  "convergence_analysis": {
    "forward_backward_match": 0.88,
    "contradictions": [
      {
        "forward_claim": "Maximum efficiency requires aggressive optimization",
        "backward_constraint": "Fairness must not be compromised",
        "resolution": "Weighted multi-objective optimization"
      }
    ]
  }
}
```

---

### 4. Code Patterns Endpoint

**POST** `/code-patterns`

Retrieve code patterns from the semiotic manifold based on differential positioning.

#### Request

```json
{
  "query": "How to implement load balancing?",
  "pattern_type": "all",
  "max_patterns": 5,
  "include_differential_analysis": true
}
```

#### Response

```json
{
  "patterns": [
    {
      "pattern_id": "pattern_lb_001",
      "pattern_type": "load_balancing",
      "differential_position": 0.87,
      "meaning": "Distributes load by inverse request frequency",
      "code": "function loadBalance(servers, requests) { ... }",
      "source_repo": "nginx/src",
      "applicability_score": 0.95
    }
  ]
}
```

---

### 5. Execution Approval Endpoint

**POST** `/approvals`

Create an approval request for execution of paradigm recommendations.

#### Request

```json
{
  "query_id": "req_3f1a2b4c5d6e7f8g",
  "action": "Deploy resource allocation algorithm",
  "risk_level": "MEDIUM",
  "requires_human_review": true,
  "execution_timeframe": "immediate"
}
```

#### Response

```json
{
  "approval_id": "appr_8h9i0j1k2l3m4n5o",
  "status": "pending",
  "created_at": "2026-02-05T14:23:45Z",
  "expires_at": "2026-02-05T14:33:45Z",
  "review_url": "https://paradigm-stack.local/approvals/appr_8h9i0j1k2l3m4n5o"
}
```

**GET** `/approvals/{approval_id}`

```json
{
  "approval_id": "appr_8h9i0j1k2l3m4n5o",
  "status": "approved",
  "approved_by": "user@example.com",
  "approved_at": "2026-02-05T14:25:30Z",
  "execution_status": "pending",
  "execution_id": "exec_9i0j1k2l3m4n5o6p"
}
```

---

### 6. Metrics Endpoint

**GET** `/metrics`

Retrieve system metrics and paradigm performance data.

#### Response

```json
{
  "system": {
    "uptime_hours": 72,
    "total_queries": 4521,
    "avg_response_time_ms": 245,
    "error_rate": 0.012
  },
  "paradigms": {
    "P1_ATEMPORAL_MANIFOLD": {
      "queries": 1247,
      "avg_confidence": 0.91,
      "contribution_to_consensus": 0.18
    },
    "P2_ACAUSAL_RETROCOHESION": {
      "queries": 892,
      "avg_confidence": 0.87,
      "contribution_to_consensus": 0.16
    }
  },
  "void_pressure": {
    "current": 0.34,
    "average_24h": 0.32,
    "peak": 0.58
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "INVALID_QUERY",
    "message": "Query must be between 10 and 10000 characters",
    "details": {
      "field": "query",
      "provided_length": 5,
      "required_range": "10-10000"
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `INVALID_QUERY` | 400 | Query validation failed |
| `PARADIGM_NOT_ACTIVE` | 400 | Requested paradigm not active |
| `TIMEOUT_EXCEEDED` | 408 | Query exceeded timeout |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

- **Free Tier:** 100 requests/hour
- **Standard:** 10,000 requests/hour
- **Enterprise:** Unlimited

Rate limit info provided in response headers:
```
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9875
X-RateLimit-Reset: 1675779245
```

---

## Authentication

Protected endpoints require Bearer token:

```bash
curl -H "Authorization: Bearer sk-paradigm-xxxxx" \
  https://api.paradigm-stack.com/api/v1/query
```

Token format: `sk-paradigm-{random_32_chars}`

---

## Webhook Integration

Paradigm Stack can push results via webhooks for async processing:

```json
{
  "webhook_url": "https://clawbot.example.com/paradigm-callback",
  "events": ["query.completed", "approval.status_changed"],
  "retry_policy": {
    "max_retries": 3,
    "backoff_ms": 1000
  }
}
```

---

## SDK/Client Integration

### JavaScript/TypeScript

```typescript
import { ParadigmClient } from '@paradigm-stack/client';

const client = new ParadigmClient({
  apiKey: 'sk-paradigm-xxxxx',
  baseUrl: 'http://localhost:3000/api/v1'
});

const response = await client.query({
  query: 'How to optimize?',
  reasoning_type: 'acausal',
  include_evidence: true
});

console.log(response.merged_synthesis.consensus);
```

### Python

```python
from paradigm_stack import ParadigmClient

client = ParadigmClient(api_key='sk-paradigm-xxxxx')

response = client.query(
    query='How to optimize?',
    reasoning_type='acausal',
    include_evidence=True
)

print(response['merged_synthesis']['consensus'])
```

---

## Version History

### v1.0.0 (2026-02-05)
- Initial API specification
- Query, paradigms, evidence-chains, code-patterns endpoints
- Execution approval workflow
- Metrics and monitoring

---

## Support & Documentation

- **OpenAPI Spec:** `/api/v1/openapi.json`
- **Interactive Docs:** `http://localhost:3000/docs`
- **Support:** support@paradigm-stack.com

