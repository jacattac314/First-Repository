# Architecture Decision Records (ADRs)

## Overview

This document captures key architectural decisions made while designing the Agent Control Plane, including context, alternatives considered, and rationale.

---

## ADR-001: Centralized Control Plane vs. Distributed Governance

**Status:** Accepted

**Context:**

Two primary approaches for governing agent execution:

1. **Centralized Control Plane**: Single system manages all agents, policies, and execution
2. **Distributed Governance**: Each agent self-governs with shared policy library

**Decision:** Centralized Control Plane

**Rationale:**

**Pros of centralized approach:**
- Single source of truth for all agent state
- Easier to enforce global policies
- Unified observability and debugging
- Simpler approval workflows (one queue)
- Clear audit trail for compliance
- Cost tracking in one place

**Cons:**
- Single point of failure (mitigated with HA deployment)
- Potential bottleneck (mitigated with async processing)
- More complex initial implementation

**Alternatives considered:**
- **Distributed**: Would scale better but lose governance guarantees
- **Hybrid**: Adds complexity without clear benefits at current scale

**Trade-offs accepted:**
- Additional infrastructure complexity
- Slight execution latency overhead (~50-100ms for policy checks)

**When to revisit:**
- If execution volume exceeds 1M/day
- If multi-region deployment required

---

## ADR-002: Policy-as-Code vs. UI-Based Policy Builder

**Status:** Accepted

**Context:**

How should operators define and manage policies?

1. **Policy-as-Code**: YAML/JSON configs in version control
2. **UI Builder**: Web-based policy configuration tool
3. **Hybrid**: Both options available

**Decision:** Policy-as-Code (YAML) with API for programmatic access

**Rationale:**

**Why code over UI:**
- Version control and GitOps workflow
- Code review process for policy changes
- Easy to replicate across environments (dev/staging/prod)
- Infrastructure-as-Code mindset aligns with platform engineering
- Can still build UI layer later as convenience feature

**Example policy-as-code:**
```yaml
policy_name: customer-email-approval
policy_type: approval_required
applies_to: tag
target_tags: [customer-facing]
rules:
  require_approval_for: [send_email]
  approvers: [manager@co.com]
```

**Trade-offs:**
- Steeper learning curve for non-technical operators
- Requires CI/CD pipeline for policy deployment

**Future enhancement:**
- Add web UI for policy creation (generates YAML)
- Keep version control as source of truth

---

## ADR-003: Sync vs. Async Execution Model

**Status:** Accepted

**Context:**

When an agent is triggered, should the control plane wait for completion or fire-and-forget?

1. **Synchronous**: API call blocks until execution completes
2. **Asynchronous**: Immediate response with execution_id, poll for status
3. **Hybrid**: Sync for quick tasks (<30s), async for long-running

**Decision:** Asynchronous by default

**Rationale:**

**Why async:**
- Agent executions can take minutes (LLM processing, API calls, waits)
- Prevents API timeouts
- Enables better scaling (non-blocking workers)
- Supports retry logic and failure handling
- Allows user to cancel long-running jobs

**API Pattern:**
```python
# Trigger execution
response = POST /api/v1/executions/trigger
{
  "execution_id": "exec_123",
  "status": "running",
  "estimated_completion": "2026-01-19T14:35:00Z"
}

# Poll for status
response = GET /api/v1/executions/exec_123
{
  "execution_id": "exec_123",
  "status": "success",
  "completed_at": "2026-01-19T14:34:12Z",
  "output": {...}
}
```

**Trade-offs:**
- More complex client implementation (need to poll)
- Requires robust status tracking

**Mitigations:**
- Provide webhooks for completion notifications
- Offer WebSocket stream for real-time updates

---

## ADR-004: Pre-execution vs. Post-execution Policy Checks

**Status:** Accepted

**Context:**

When should policies be evaluated?

1. **Pre-execution only**: Check before agent runs
2. **Post-execution only**: Validate output after completion
3. **Both**: Check before and after

**Decision:** Pre-execution checks with post-execution audit

**Rationale:**

**Pre-execution checks prevent issues:**
- Rate limiting
- Time window enforcement
- Approval requirements
- Cost estimates

**Post-execution audit catches:**
- Unexpected API calls
- Data exfiltration
- Policy violations that slipped through

**Why not post-execution only:**
- Can't un-send an email
- Can't un-charge an API call
- Prevention > detection for high-risk actions

**Implementation:**
```python
# Pre-execution
if not passes_policies(agent, context):
    return {"status": "blocked"}

# Execute
result = run_agent(agent, context)

# Post-execution audit
audit_log = validate_actions(result)
if audit_log.violations:
    alert_security_team(audit_log)
```

---

## ADR-005: SQL Database vs. NoSQL for Agent Registry

**Status:** Accepted

**Context:**

What database should store agent metadata and execution logs?

1. **SQL (PostgreSQL)**: Relational database
2. **NoSQL (MongoDB)**: Document store
3. **Time-series (InfluxDB)**: Optimized for metrics
4. **Hybrid**: SQL for registry, NoSQL for logs

**Decision:** PostgreSQL for all operational data

**Rationale:**

**Why PostgreSQL:**
- ACID guarantees for critical data (agent config, policies)
- Strong querying for analytics (cost breakdowns, failure analysis)
- JSON support (JSONB) for flexible schema where needed
- Mature ecosystem, well-understood ops
- Excellent performance for expected scale (<10M executions/month)

**When NoSQL makes sense:**
- >100M events/month
- Unstructured execution logs
- Multi-region replication requirements

**Future migration path:**
- Move execution logs to ClickHouse/InfluxDB if query performance degrades
- Keep agent registry in PostgreSQL (low write volume, high consistency needs)

---

## ADR-006: LLM Provider Abstraction Layer

**Status:** Accepted

**Context:**

Agents use multiple LLM providers (Anthropic, OpenAI, local models). How to manage this?

1. **Hard-coded provider per agent**: Each agent picks its own LLM
2. **Abstraction layer**: Control plane routes to optimal provider
3. **User choice**: Let agent developer specify in workflow

**Decision:** Abstraction layer with policy-based routing

**Rationale:**

**Benefits:**
- Cost optimization (route simple tasks to cheaper models)
- Failover to backup provider if primary is down
- A/B testing across providers
- Centralized API key management
- Usage tracking and cost attribution

**Example routing policy:**
```python
if task_complexity == "simple":
    provider = "openai", model = "gpt-4o-mini"
elif task_complexity == "medium":
    provider = "anthropic", model = "claude-haiku-4"
else:
    provider = "anthropic", model = "claude-sonnet-4-5"
```

**Trade-offs:**
- Agents lose direct control over provider selection
- Requires complexity classification logic

**Mitigations:**
- Allow agent-level override via config
- Provide feedback loop to improve routing

---

## ADR-007: Approval Workflow Design

**Status:** Accepted

**Context:**

How should human-in-the-loop approvals work for high-risk actions?

1. **Blocking**: Agent pauses mid-execution, waits for approval
2. **Pre-approval**: Get approval before execution starts
3. **Post-generation review**: Generate output, approve before sending

**Decision:** Post-generation review (draft → approve → execute)

**Rationale:**

**Why post-generation:**
- Reviewers see exactly what will be sent (email text, API payload)
- Faster iteration (can edit draft without re-running LLM)
- Better UX (reviewers don't wait for generation)

**Workflow:**
```
1. Agent generates email draft
2. Draft submitted to approval queue
3. Manager reviews, can:
   - Approve (send as-is)
   - Edit and approve
   - Reject (with feedback)
4. If approved, agent sends email
5. Log final action
```

**Alternative considered:**
- Pre-approval: "Can I send email to customer@co.com?" - Too vague, reviewers can't judge
- Blocking mid-execution: Poor UX, ties up resources

**Trade-offs:**
- Agents must support "draft mode"
- Slightly more complex state management

---

## ADR-008: Rate Limiting Strategy

**Status:** Accepted

**Context:**

How to prevent agents from overwhelming downstream systems?

**Techniques:**
1. Token bucket
2. Fixed window counter
3. Sliding window log
4. Distributed rate limiter (Redis)

**Decision:** Redis-backed sliding window with token bucket fallback

**Rationale:**

**Sliding window advantages:**
- Smooth traffic (no burst at window boundaries)
- Accurate rate limiting
- Works well with distributed systems

**Implementation:**
```python
# Redis key: rate_limit:{agent_id}:{window}
# Sorted set: {timestamp: execution_id}

async def check_rate_limit(agent_id: str, limit: int, window_sec: int):
    now = time.time()
    window_start = now - window_sec

    # Remove old entries
    await redis.zremrangebyscore(
        f"rate_limit:{agent_id}",
        0,
        window_start
    )

    # Count executions in window
    count = await redis.zcard(f"rate_limit:{agent_id}")

    if count >= limit:
        return False, limit - count  # Rate limited

    # Add current execution
    await redis.zadd(
        f"rate_limit:{agent_id}",
        {execution_id: now}
    )

    return True, limit - count - 1
```

**Fallback to token bucket:**
- If Redis unavailable, use in-memory token bucket (less accurate but functional)

**Trade-offs:**
- Redis dependency
- Slightly more complex than fixed window

---

## ADR-009: Cost Tracking Granularity

**Status:** Accepted

**Context:**

What level of detail should cost tracking provide?

1. **Agent-level**: Total cost per agent
2. **Execution-level**: Cost per run
3. **Step-level**: Cost per LLM call within execution
4. **Token-level**: Cost per prompt/completion

**Decision:** Execution-level with step breakdown

**Rationale:**

**Granularity needed:**
- Agent-level: Too coarse, can't optimize
- Execution-level: Can identify expensive runs
- Step-level: Can pinpoint which prompts are costly
- Token-level: Overkill, adds storage overhead

**Data model:**
```json
{
  "execution_id": "exec_123",
  "total_cost_usd": 0.0427,
  "steps": [
    {
      "step": "generate_cover_letter",
      "provider": "anthropic",
      "model": "claude-sonnet-4-5",
      "tokens": 5420,
      "cost_usd": 0.0271
    },
    {
      "step": "submit_application",
      "provider": "openai",
      "model": "gpt-4o",
      "tokens": 3122,
      "cost_usd": 0.0156
    }
  ]
}
```

**Enables:**
- Identify most expensive steps
- Optimize prompts to reduce tokens
- Compare cost across providers
- Budget forecasting

---

## ADR-010: Security Model - Agent Isolation

**Status:** Accepted

**Context:**

How to prevent agents from accessing each other's data or secrets?

**Approaches:**
1. **Trust-based**: Agents are trusted not to misbehave
2. **RBAC**: Role-based access control per agent
3. **Sandboxing**: Execute agents in isolated containers
4. **Data scoping**: Explicitly define allowed data per agent

**Decision:** Data scoping + RBAC with runtime enforcement

**Rationale:**

**Each agent declares allowed resources:**
```yaml
data_scope:
  datasets: [job_listings_db, user_profiles_db]
  apis: [greenhouse_api]
  secrets: [GREENHOUSE_API_KEY]
```

**Control plane enforces:**
- Database queries filtered by allowed datasets
- API calls validated against allowed list
- Secrets injection only for specified keys

**Runtime checks:**
```python
async def execute_database_query(agent_id: str, query: str):
    agent = await get_agent(agent_id)
    allowed_tables = agent.data_scope.datasets

    # Parse query, extract tables
    tables_used = extract_tables(query)

    if not all(t in allowed_tables for t in tables_used):
        raise PermissionDenied(
            f"Agent {agent_id} cannot access {tables_used}"
        )

    return await db.execute(query)
```

**Trade-offs:**
- Requires upfront data scoping (more config)
- Runtime overhead for validation

**Why not full sandboxing:**
- Overkill for current trust model (internal agents)
- Can add container isolation later if needed

---

## ADR-011: Monitoring Strategy - Metrics vs. Logs vs. Traces

**Status:** Accepted

**Context:**

What observability data should the control plane collect?

1. **Metrics**: Counters, gauges, histograms (Prometheus)
2. **Logs**: Structured event logs (ELK stack)
3. **Traces**: Distributed tracing (Jaeger)
4. **All three**: Full observability

**Decision:** Metrics-first with structured logs; traces later

**Rationale:**

**Phase 1: Metrics + Logs**
- Metrics for dashboards and alerts
  - Execution count, success rate, latency, cost
- Structured logs for debugging
  - Execution context, errors, policy decisions

**Why delay traces:**
- Adds infrastructure complexity
- Most debugging can be done with logs
- Tracing valuable at higher scale (>100k executions/day)

**Metrics collected:**
```python
# Prometheus metrics
agent_executions_total (counter) - labels: agent_name, status
agent_execution_duration_seconds (histogram) - labels: agent_name
agent_execution_cost_usd (gauge) - labels: agent_name, provider
policy_violations_total (counter) - labels: policy_name, agent_name
approval_queue_size (gauge)
```

**When to add tracing:**
- Multi-service execution becomes common
- Latency debugging requires cross-service visibility

---

## ADR-012: Agent Versioning Strategy

**Status:** Accepted

**Context:**

How to manage agent updates without breaking production?

**Approaches:**
1. **In-place updates**: Update agent config, all executions use new version
2. **Blue-green**: Deploy new version alongside old, switch traffic
3. **Semantic versioning**: Version agents like software (1.0.0 → 1.1.0 → 2.0.0)

**Decision:** Semantic versioning with promotion gates

**Rationale:**

**Versioning scheme:**
- `MAJOR.MINOR.PATCH`
- MAJOR: Breaking changes (new data requirements, different behavior)
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

**Promotion workflow:**
```
Draft → Staging → Production

Draft:
  - Editable, not executable
  - Used for development

Staging:
  - Executable with test data
  - Can run shadow mode (execute but don't take actions)

Production:
  - Active version
  - Immutable
  - Can have multiple prod versions (gradual rollout)
```

**Rollout strategies:**
- Canary: Route 5% traffic to v2.0.0, monitor for issues
- Blue-green: Switch all traffic at once
- Gradual: Increase % over days

**Implementation:**
```python
# Each agent can have multiple active versions
agent_versions = [
    {"version": "1.9.0", "traffic_pct": 80},
    {"version": "2.0.0", "traffic_pct": 20}  # Canary
]

# Route execution based on weight
def select_version(agent_name: str):
    versions = get_active_versions(agent_name)
    return weighted_random_choice(versions)
```

---

## Architectural Principles

### 1. **Observable by Default**
Every action logged, every decision explained, every cost tracked.

### 2. **Progressive Enhancement**
Start simple, add complexity only when needed.

### 3. **Fail Safe, Not Fail Silent**
Errors are loud. Failures trigger alerts. No silent degradation.

### 4. **Policy Over Process**
Automate governance with code, not manual reviews.

### 5. **Cost-Conscious Design**
LLMs are expensive. Design assumes budgets matter.

### 6. **Human in the Loop When It Matters**
Automate low-risk, require approval for high-risk.

### 7. **Incremental Deployment**
No big-bang launches. Gradual rollout with quick rollback.

---

## When to Revisit These Decisions

**Scale Triggers:**
- Execution volume: >1M/day
- Agent count: >500 active agents
- Cost: >$10k/month
- Team size: >5 platform engineers

**New Requirements:**
- Multi-region deployment
- External customer agents (not just internal)
- Real-time execution (<100ms latency)
- Compliance requirements (SOC2, HIPAA)

**Technology Changes:**
- Better LLM providers emerge
- Cost structure changes (much cheaper or more expensive)
- New frameworks (LangChain → something better)

---

*These decisions reflect pragmatic trade-offs for a production system, not ivory-tower ideals. Every choice optimized for shipping quickly while maintaining safety.*
