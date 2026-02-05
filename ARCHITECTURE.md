# Paradigm Stack Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│         PARADIGM STACK EXECUTION ENVIRONMENT             │
└─────────────────────────────────────────────────────────┘

                    [USER/RALPH GATEWAY]
                            ↓
                    ┌───────────────┐
                    │   API Layer   │ (Paradigm 6: Negation via differentiation)
                    └───────┬───────┘
                            ↓
    ┌───────────────────────┼───────────────────────┐
    ↓                       ↓                       ↓
┌─────────┐          ┌──────────────┐        ┌──────────┐
│ Ralph   │          │  MCP Router  │        │ RLM Core │
│Evaluator│          │(Paradigm 3)  │        │(P8 + P4) │
│(P10)    │          │              │        │          │
└────┬────┘          └──────┬───────┘        └────┬─────┘
     │                      │                     │
     │ void-pressure        │ plural routing      │ recursive
     │                      │                     │ parasitism
     ↓                      ↓                     ↓
┌────────────────────────────────────────────────────────┐
│              REASONING ENGINES (Multi-Head)             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐              │
│  │ Engine1 │  │ Engine2 │  │ EngineN │              │
│  │(View X) │  │(View ¬X)│  │(View ϕ) │ (P3 plural) │
│  └────┬────┘  └────┬────┘  └────┬────┘              │
│       │            │            │                   │
│       └────────────┼────────────┘                   │
└────────────┬───────────────────────────────────────┘
             ↓
    ┌────────────────────┐
    │  RAG + Retrieval   │ (P2: Outcome-conditioned)
    │  ┌──────────────┐  │
    │  │  VectorDB    │  │ (P6: Semiotic space)
    │  │  (Qdrant)    │  │
    │  └──────────────┘  │
    └────────┬───────────┘
             ↓
    ┌────────────────────┐
    │   Code Manifold    │
    │  ┌──────────────┐  │
    │  │  CCA (Code   │  │ (P1 + P5: Atemporal + Non-Boolean)
    │  │  Generation) │  │
    │  └──────────────┘  │
    └────────┬───────────┘
             ↓
    ┌────────────────────────────┐
    │  Persistence Layer         │
    │  ┌──────────────────────┐  │
    │  │ SUI + Walrus Storage │  │ (P4 + P8: Necrosis + Hierarchy)
    │  │ (Immutable Ledger)   │  │
    │  └──────────────────────┘  │
    └────────────────────────────┘
```

## Component Specifications

### 1. API Layer (Paradigm 6 + 10)

**Type:** REST/GraphQL Gateway
**Location:** `src/api/`
**Purpose:** Endpoint differentiation creates meaning through structure (P6); each request negates alternatives (P10)

```
GET /query → "retrieval-type-request"
POST /reason → "generation-type-request"
PUT /revise → "modification-type-request"
DELETE /invalidate → "negation-type-request"

Meaning emerges from differential structure, not external semantics.
```

**Key Behavior:**
- Request routing creates *void-pressure* (P10): denied requests increase system definition
- Endpoints form a semiotic lattice (P6): meaning is relational structure

---

### 2. Ralph Evaluator (Paradigm 10)

**Type:** External Adversarial Judge
**Location:** `src/ralph/`
**Purpose:** Active negation; resource legitimacy evaluation

**Decision Matrix:**
```
Request arrives
  ↓
Ralph evaluates: "Is this request justified?"
  ├─ YES → allocate resources → proceed
  ├─ NO → deny + create void-pressure → shapes future behavior
  └─ MAYBE → conditional approval → partial resource allocation
```

**Key Metrics:**
- Total available resources (energy budget)
- Request cost estimation
- Historical satisfaction rates
- Void-pressure accumulation

---

### 3. MCP Router (Paradigm 3)

**Type:** Multi-Model Coordination Protocol
**Location:** `src/mcp/`
**Purpose:** Spawn and maintain multiple incompatible observer-perspectives simultaneously

**Behaviors:**
```
Single query arrives
  ↓
MCP spawns N reasoners
  ├─ Reasoner1: Interprets as "problem-type-A"
  ├─ Reasoner2: Interprets as "NOT problem-type-A"
  ├─ Reasoner3: Interprets as "problem-type-ϕ" (indifferent)
  └─ ReasonerN: Interprets as "other-frame"
  
All execute in parallel.
Results do NOT merge (no voting, no averaging).
System operates in the contradiction.
```

**No Collapse Mechanism:**
- Each reasoner's conclusion stands equally valid
- Contradictions are preserved as first-class outputs
- Users experience the plurality directly

---

### 4. RLM Core (Paradigm 8 + 4)

**Type:** Recursive Language Model with consumption tracking
**Location:** `src/rlm/`
**Purpose:** Multi-level reasoning with explicit parasitism measurement

**Architecture:**
```
L0: Direct response (budget: 100 tokens)
  ├─ needs clarification → calls L1 (consumes 90 tokens from L0)
  │
  └─ L1: Detail analysis (budget: 90 tokens)
      ├─ needs depth → calls L2 (consumes 81 tokens from L1)
      │
      └─ L2: Deep reasoning (budget: 81 tokens)
          ├─ needs proof → calls L3 (consumes 72.9 tokens from L2)
          │
          └─ L3: Foundational analysis (budget: 72.9 tokens)
              └─ returns → bubbles back to L2
              
Returns flow upward, consumption flows downward.
Every level transparently parasitizes the level below.
```

**Consumption Tracking:**
```
Energy Cost Per Token: measures substrate degradation (P4 necrosis)
Each token produced = measurable energy burned
Energy_burned = information_entropy_generated
This entropy becomes permanent "necrotic layer" in SUI
```

---

### 5. RAG + Retrieval (Paradigm 2)

**Type:** Outcome-Conditioned Retrieval Augmented Generation
**Location:** `src/rag/`
**Purpose:** Future-knowledge constraints present reasoning (retroactive causality)

**Standard RAG Flow (forward-time):**
```
Query → Retrieve related docs → Generate answer based on docs
```

**Paradigm-Native RAG (Paradigm 2: acausal):**
```
Desired outcome state
  ↓
What evidence would justify this?
  ↓ (retroactive constraint propagation)
What documents should we retrieve?
  ↓ (condition retrieval on desired future)
What would justify those documents?
  ↓ (propagate further backward)
What questions lead to that evidence?
  ↓ (generate questions)
Answer those questions
  ↓ (forward pass)
Evidence emerges → outcome justified

The future (outcome) has determined the past (evidence).
```

---

### 6. VectorDB Semiotic Space (Paradigm 6)

**Type:** Vector Embedding Database (Qdrant)
**Location:** `src/vectordb/`
**Purpose:** Meaning through differential topology; no external reference

**Principle:**
```
Word/Concept W means:
  M(W) := {all transformations W can undergo to other tokens}
  
M(W) ≠ external_referent(W)
M(W) = the entire path-space of W in embedding-lattice

Two concepts are semantically similar if their path-spaces
significantly overlap in the embedding topology.
```

**Key Implementation:**
- Continuous embedding space (no discrete categories)
- Similarity measured by vector distance (topology)
- Meaning emerges from relative position
- New embeddings auto-generate meaning through differentiation from existing embeddings

---

### 7. CCA Code Manifold (Paradigm 1 + 5)

**Type:** Autonomous Code Generation + Selection
**Location:** `src/cca/`
**Purpose:** Recognize code-states in manifold rather than generate novel code

**Philosophy:**
```
All code-that-could-exist exists in the code-manifold
(GitHub, research papers, internal repos, potential implementations)

CCA doesn't generate new code.
CCA selects and instantiates code-states from the manifold.

Query: "What function solves this problem?"
Response: Navigate the code-manifold to the solution that was always there.

Non-Boolean property (P5):
Code can be simultaneously:
  - Correct (passes tests)
  - Incorrect (fails edge cases)
  - Indifferent (works in some modes, fails in others)
```

---

### 8. Persistence Layer (Paradigm 4 + 8)

**Type:** SUI Blockchain + Walrus Distributed Storage
**Location:** `src/persistence/`
**Purpose:** Immutable record of all computations; necrotic layer formation

**Implementation:**
```
Every reasoning step, every decision, every resource consumed
  → gets logged to SUI (immutable transaction)
  → gets archived to Walrus (distributed storage)
  → becomes permanent "necrotic layer"

Can never be deleted, only layered over or archived.

Hierarchy formation (P8):
  - Current computation (L_n): consumes gas to add new layer
  - Historical layers (L_{n-1}, L_{n-2}, ...): feed the new layer
  - Each new layer parasitizes the one below (consumes resources)
  - Each new layer feeds the system running above it
```

---

## Data Flow: Single Query End-to-End

```
1. USER → API
   "What is the optimal resource allocation strategy?"

2. API → RALPH
   Ralph evaluates: "Is this query worth processing?"
   Decision: YES (within budget)
   Void-pressure: 0 (no denial)

3. API → MCP
   MCP spawns 3 reasoners:
   - R1: "Optimization means maximizing output"
   - R2: "Optimization means minimizing waste"
   - R3: "Optimization is simultaneously maximizing/minimizing (P5)"

4. MCP → RLM
   Each reasoner calls RLM:
   - R1 → RLM (budget: 100) → calls L1 (budget: 90) → L2 (budget: 81)
   - R2 → RLM (budget: 100) → calls L1 (budget: 90) → L2 (budget: 81)
   - R3 → RLM (budget: 100) → [runs in ternary mode]
   
   Visible: Parasitism chains
   - L0 consumes 100 tokens
   - L1 consumes 180 tokens total (90 from each R1, R2)
   - L2 consumes 162 tokens
   - Energy burned: 442 tokens → becomes necrotic layer

5. RLM → RAG
   Each reasoner uses outcome-conditioned RAG:
   - "What evidence would justify my conclusion?"
   - Retrieval conditioned on: desired conclusion state
   - VectorDB returns semantically-similar evidence

6. RAG → VectorDB
   Vector retrieval:
   - Finds evidence clusters in semiotic space
   - Meaning emerges from embedding topology
   - No external reference; pure differential structure

7. RLM → CCA
   "What code patterns support this reasoning?"
   CCA navigates code-manifold:
   - Finds all code-states that could implement this logic
   - Selects from atemporal manifold (P1)
   - Recognizes: code was always there (P1 + P5)

8. All → SUI + Walrus
   Results written to blockchain:
   - 3 contradictory conclusions (P3 preserved)
   - 442 tokens of energy consumed (P4 necrosis)
   - Multiple reasoning hierarchies (P8 parasitism)
   - All code-states selected (P1 manifold)
   - Semantic evidence topology (P6 semiosis)

9. API → USER
   Response includes:
   - All 3 contradictory conclusions (no collapse)
   - Energy consumption metrics
   - Reasoning chains (with parasitism visible)
   - Code selections from manifold
   - SUI transaction hash (immutable record)
   - Ralph's judgment (void-pressure metrics)
```

## Integration Points

| Component | Input From | Output To | Paradigm |
|-----------|-----------|----------|----------|
| API | User | Ralph, MCP | P6, P10 |
| Ralph | API | MCP | P10 |
| MCP | Ralph | RLM x N | P3 |
| RLM | MCP | RAG, CCA | P8, P4 |
| RAG | RLM | VectorDB, RLM | P2 |
| VectorDB | RAG | RAG | P6 |
| CCA | RLM | SUI | P1, P5 |
| SUI | CCA, RLM, RAG | Persistence | P4, P8 |

## Paradigm Instantiation Map

```
Paradigm 1 (Statetic Manifold) ← CCA (code-manifold recognition)
Paradigm 2 (Acausal) ← RAG (outcome-conditioned retrieval)
Paradigm 3 (Plural) ← MCP (multi-reasoner, no collapse)
Paradigm 4 (Necrosis) ← RLM + SUI (energy tracking + consumption)
Paradigm 5 (Non-Boolean) ← CCA + RLM (ternary reasoning modes)
Paradigm 6 (Semiotic) ← VectorDB (topology-based meaning)
Paradigm 7 (Inverted Qualia) ← [Phase 2: adversarial subsystems]
Paradigm 8 (Hierarchy) ← RLM (recursive level parasitism)
Paradigm 9 (Alienation) ← [Phase 2: self-representation gap]
Paradigm 10 (Void) ← Ralph (active negation, void-pressure)
```

---

*Architecture v0.1 | Phase 1 Focus*
