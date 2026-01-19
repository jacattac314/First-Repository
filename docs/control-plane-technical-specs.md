# Technical Specifications: Agent Control Plane

## System Architecture

### Technology Stack

**Core Services:**
- **API Gateway:** FastAPI (Python) - async support, auto-generated OpenAPI docs
- **Event Bus:** Redis Streams - lightweight, proven, handles 1M+ msgs/sec
- **Database:** PostgreSQL - agent registry, execution history, audit logs
- **Vector Store:** Qdrant - agent embeddings for semantic search/recommendations
- **Cache Layer:** Redis - policy cache, rate limiting state
- **Monitoring:** Prometheus + Grafana - metrics, dashboards, alerting

**Why this stack:**
- Proven at scale
- Strong Python ecosystem integration (LangChain, agent frameworks)
- Observable by default
- Cheap to run (no enterprise licenses needed)

---

## Database Schema

### Agent Registry Table

```sql
CREATE TABLE agents (
    agent_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'deprecated')),

    -- Capabilities
    capabilities JSONB NOT NULL,  -- {read: true, write: false, notify: true, execute: false}

    -- Access control
    data_scope JSONB NOT NULL,    -- {datasets: [...], apis: [...], services: [...]}
    allowed_destinations JSONB,   -- {email: true, slack: true, external_api: false}

    -- Execution config
    n8n_workflow_id VARCHAR(255),
    trigger_type VARCHAR(50),     -- 'webhook', 'cron', 'manual', 'event'

    -- Metadata
    description TEXT,
    tags VARCHAR(50)[],

    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),

    -- Constraints
    UNIQUE(name, version)
);

CREATE INDEX idx_agents_owner ON agents(owner_email);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_tags ON agents USING GIN(tags);
```

### Execution Logs Table

```sql
CREATE TABLE executions (
    execution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(agent_id),

    -- Trigger context
    trigger_source VARCHAR(100) NOT NULL,  -- 'api', 'webhook', 'cron', 'manual'
    trigger_user VARCHAR(255),

    -- Execution state
    status VARCHAR(20) NOT NULL CHECK (status IN ('running', 'success', 'failed', 'pending_approval')),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,

    -- LLM usage
    llm_provider VARCHAR(50),              -- 'anthropic', 'openai', 'local'
    llm_model VARCHAR(100),
    total_tokens INTEGER,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    estimated_cost_usd DECIMAL(10, 6),

    -- Performance
    total_latency_ms INTEGER,
    steps_executed JSONB,                  -- [{step: 'fetch_data', latency_ms: 150}, ...]

    -- Results
    output_summary TEXT,
    error_message TEXT,
    actions_taken JSONB,                   -- [{action: 'sent_email', target: 'user@co.com', approved: true}, ...]

    -- Audit
    execution_logs TEXT,                   -- Full execution trace

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_executions_agent ON executions(agent_id);
CREATE INDEX idx_executions_status ON executions(status);
CREATE INDEX idx_executions_started ON executions(started_at DESC);
CREATE INDEX idx_executions_cost ON executions(estimated_cost_usd DESC);
```

### Policy Table

```sql
CREATE TABLE policies (
    policy_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_name VARCHAR(255) NOT NULL UNIQUE,
    policy_type VARCHAR(50) NOT NULL,      -- 'rate_limit', 'approval_required', 'time_window', 'destination'

    -- Scope
    applies_to VARCHAR(20) NOT NULL,       -- 'all', 'agent', 'tag'
    target_agent_id UUID REFERENCES agents(agent_id),
    target_tags VARCHAR(50)[],

    -- Rules
    rules JSONB NOT NULL,
    -- Examples:
    -- Rate limit: {max_executions: 100, window_minutes: 60}
    -- Approval: {require_approval: true, approvers: ['manager@co.com']}
    -- Time window: {allowed_hours: [9, 10, 11, ..., 17], timezone: 'UTC'}

    enabled BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 100,          -- Lower = higher priority

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

CREATE INDEX idx_policies_enabled ON policies(enabled);
CREATE INDEX idx_policies_priority ON policies(priority);
```

### Approval Queue Table

```sql
CREATE TABLE approval_queue (
    approval_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES executions(execution_id),
    agent_id UUID REFERENCES agents(agent_id),

    -- Request details
    requested_action JSONB NOT NULL,       -- What the agent wants to do
    risk_level VARCHAR(20),                -- 'low', 'medium', 'high', 'critical'

    -- Approval state
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    approvers VARCHAR(255)[],              -- List of allowed approvers
    approved_by VARCHAR(255),
    reviewed_at TIMESTAMP,
    review_notes TEXT,

    -- Auto-expiry
    expires_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_approvals_status ON approval_queue(status);
CREATE INDEX idx_approvals_expires ON approval_queue(expires_at);
```

---

## API Specification

### Core Endpoints

#### Agent Management

```
POST   /api/v1/agents                    Create new agent
GET    /api/v1/agents                    List all agents (filterable)
GET    /api/v1/agents/{agent_id}         Get agent details
PATCH  /api/v1/agents/{agent_id}         Update agent config
DELETE /api/v1/agents/{agent_id}         Delete agent (soft delete)

POST   /api/v1/agents/{agent_id}/activate      Activate agent
POST   /api/v1/agents/{agent_id}/pause         Pause agent
POST   /api/v1/agents/{agent_id}/promote       Promote draft → staging → prod
POST   /api/v1/agents/{agent_id}/rollback      Rollback to previous version
```

#### Execution Control

```
POST   /api/v1/executions/trigger        Manually trigger agent
GET    /api/v1/executions                List executions (filterable by agent, status, date)
GET    /api/v1/executions/{exec_id}      Get execution details
POST   /api/v1/executions/{exec_id}/cancel     Cancel running execution
```

#### Policy Management

```
POST   /api/v1/policies                  Create policy
GET    /api/v1/policies                  List all policies
GET    /api/v1/policies/{policy_id}      Get policy details
PATCH  /api/v1/policies/{policy_id}      Update policy
DELETE /api/v1/policies/{policy_id}      Delete policy
POST   /api/v1/policies/{policy_id}/enable     Enable policy
POST   /api/v1/policies/{policy_id}/disable    Disable policy
```

#### Approval Workflows

```
GET    /api/v1/approvals                 List pending approvals
GET    /api/v1/approvals/{approval_id}   Get approval request details
POST   /api/v1/approvals/{approval_id}/approve    Approve request
POST   /api/v1/approvals/{approval_id}/reject     Reject request
```

#### Monitoring & Analytics

```
GET    /api/v1/metrics/costs             Agent cost breakdown
GET    /api/v1/metrics/performance       Latency and throughput stats
GET    /api/v1/metrics/failures          Failure analysis
GET    /api/v1/health                    System health check
```

---

## Sample API Payloads

### Register New Agent

```json
POST /api/v1/agents

{
  "name": "job-application-agent",
  "version": "1.2.0",
  "owner_email": "eng-team@company.com",
  "description": "Automated job application submission system",
  "capabilities": {
    "read": true,
    "write": true,
    "notify": true,
    "execute": false
  },
  "data_scope": {
    "datasets": ["job_listings", "user_profiles"],
    "apis": ["greenhouse_api", "lever_api"],
    "services": ["form_filler"]
  },
  "allowed_destinations": {
    "email": false,
    "slack": true,
    "external_api": true,
    "webhook": true
  },
  "n8n_workflow_id": "wf_abc123",
  "trigger_type": "webhook",
  "tags": ["recruiting", "automation", "high-volume"]
}
```

### Create Rate Limit Policy

```json
POST /api/v1/policies

{
  "policy_name": "job-agent-rate-limit",
  "policy_type": "rate_limit",
  "applies_to": "agent",
  "target_agent_id": "agent_job_app_123",
  "rules": {
    "max_executions": 50,
    "window_minutes": 60,
    "action_on_violation": "queue"
  },
  "enabled": true,
  "priority": 50
}
```

### Create Approval Requirement Policy

```json
POST /api/v1/policies

{
  "policy_name": "email-approval-required",
  "policy_type": "approval_required",
  "applies_to": "all",
  "rules": {
    "require_approval_for": ["send_email", "external_api_post"],
    "approvers": ["manager@company.com", "ops-team@company.com"],
    "auto_expire_hours": 24,
    "risk_threshold": "medium"
  },
  "enabled": true,
  "priority": 10
}
```

### Execution Log Response

```json
GET /api/v1/executions/exec_xyz789

{
  "execution_id": "exec_xyz789",
  "agent_id": "agent_job_app_123",
  "agent_name": "job-application-agent",
  "agent_version": "1.2.0",
  "status": "success",
  "trigger_source": "webhook",
  "trigger_user": "system",
  "started_at": "2026-01-19T14:23:11Z",
  "completed_at": "2026-01-19T14:23:45Z",
  "llm_provider": "anthropic",
  "llm_model": "claude-sonnet-4-5",
  "total_tokens": 8542,
  "prompt_tokens": 6200,
  "completion_tokens": 2342,
  "estimated_cost_usd": 0.0427,
  "total_latency_ms": 34200,
  "steps_executed": [
    {
      "step": "fetch_job_details",
      "latency_ms": 850,
      "status": "success"
    },
    {
      "step": "generate_cover_letter",
      "latency_ms": 12300,
      "status": "success",
      "tokens_used": 5420
    },
    {
      "step": "submit_application",
      "latency_ms": 21050,
      "status": "success"
    }
  ],
  "output_summary": "Successfully submitted application to SoftwareCo for Senior Engineer role",
  "actions_taken": [
    {
      "action": "api_call",
      "target": "greenhouse_api",
      "method": "POST",
      "approved": true,
      "auto_approved": true
    },
    {
      "action": "slack_notification",
      "target": "#job-updates",
      "approved": true,
      "auto_approved": true
    }
  ]
}
```

---

## Policy Engine Logic

### Execution Flow with Policy Checks

```python
async def execute_agent(agent_id: str, trigger_context: dict) -> ExecutionResult:
    """
    Main execution flow with policy enforcement
    """
    agent = await get_agent(agent_id)

    # 1. Pre-execution policy checks
    policy_violations = await check_policies(agent, trigger_context)

    if policy_violations:
        if any(v.severity == 'blocking' for v in policy_violations):
            return ExecutionResult(
                status='blocked',
                reason=f"Policy violation: {policy_violations[0].message}"
            )

    # 2. Rate limiting check
    if await is_rate_limited(agent):
        return ExecutionResult(
            status='rate_limited',
            reason='Agent has exceeded rate limit'
        )

    # 3. Check if approval required
    requires_approval = await check_approval_policies(agent, trigger_context)

    if requires_approval:
        approval_id = await create_approval_request(agent, trigger_context)
        return ExecutionResult(
            status='pending_approval',
            approval_id=approval_id
        )

    # 4. Execute agent workflow
    execution_id = await create_execution_record(agent)

    try:
        result = await trigger_n8n_workflow(
            workflow_id=agent.n8n_workflow_id,
            execution_id=execution_id,
            context=trigger_context
        )

        # 5. Track metrics
        await record_execution_metrics(
            execution_id=execution_id,
            tokens=result.tokens_used,
            cost=calculate_cost(result),
            latency=result.total_time_ms
        )

        # 6. Post-execution validation
        await validate_execution_output(result)

        return ExecutionResult(
            status='success',
            execution_id=execution_id,
            output=result.output
        )

    except Exception as e:
        await record_failure(execution_id, error=str(e))
        raise
```

### Sample Policy Rules

#### Time Window Policy

```python
time_window_policy = {
    "policy_name": "business-hours-only",
    "policy_type": "time_window",
    "applies_to": "tag",
    "target_tags": ["customer-facing"],
    "rules": {
        "allowed_days": ["MON", "TUE", "WED", "THU", "FRI"],
        "allowed_hours": list(range(9, 18)),  # 9 AM - 6 PM
        "timezone": "America/New_York",
        "action_on_violation": "delay_until_allowed"
    }
}
```

#### Cost Optimization Policy

```python
cost_optimization_policy = {
    "policy_name": "use-cheaper-model-for-simple-tasks",
    "policy_type": "model_routing",
    "applies_to": "all",
    "rules": {
        "route_by_complexity": {
            "simple": {
                "provider": "openai",
                "model": "gpt-4o-mini",
                "max_tokens": 500
            },
            "medium": {
                "provider": "anthropic",
                "model": "claude-haiku-4",
                "max_tokens": 2000
            },
            "complex": {
                "provider": "anthropic",
                "model": "claude-sonnet-4-5",
                "max_tokens": 8000
            }
        },
        "complexity_detector": "token_estimate"  # or "task_classifier"
    }
}
```

---

## Monitoring Dashboard Spec

### Key Metrics to Display

**Overview Panel:**
- Total agents registered (by status: active, paused, draft)
- Executions today (success rate %)
- Total cost today
- Active executions (real-time)

**Agent Performance Table:**
```
Agent Name          | Executions | Success Rate | Avg Latency | Total Cost
--------------------|------------|--------------|-------------|------------
job-app-agent       | 1,234      | 98.2%        | 8.4s        | $142.30
email-summarizer    | 5,621      | 99.7%        | 2.1s        | $89.50
data-sync-agent     | 892        | 85.3%        | 45.2s       | $301.20
```

**Cost Breakdown Chart:**
- Pie chart: Cost by agent
- Line chart: Daily spend trend (last 30 days)
- Bar chart: Cost by LLM provider

**Failure Analysis:**
- Recent failures (last 24h)
- Failure patterns (grouped by error type)
- Agents with degraded success rates

**Approval Queue:**
- Pending approvals count
- Average approval wait time
- Approval bottlenecks (which approvers are slow)

---

## Security Considerations

### Authentication & Authorization

**API Security:**
- JWT tokens for API authentication
- Role-based access control (RBAC)
  - `admin`: Full control
  - `operator`: Execute, view, approve
  - `viewer`: Read-only access
  - `agent-service`: Service account for agents

**Agent Isolation:**
- Each agent runs in isolated execution context
- No cross-agent data access without explicit grants
- Secrets managed via dedicated vault (HashiCorp Vault or AWS Secrets Manager)

### Audit Logging

All actions logged:
- Who triggered execution
- What policies were evaluated
- What approvals were granted/rejected
- What data was accessed
- What external APIs were called

Retention: 90 days in hot storage, 2 years in cold storage

---

## Scaling Strategy

### Current Design Handles:
- **100 agents** actively deployed
- **10,000 executions/day**
- **<100ms** policy evaluation latency
- **99.9%** uptime SLA

### Scale-up Path:

**Phase 1 (Current):**
- Single API server (vertical scaling)
- Single PostgreSQL instance
- Single Redis instance

**Phase 2 (100k executions/day):**
- Load-balanced API servers (3+ instances)
- PostgreSQL read replicas
- Redis cluster mode
- Execution sharding by agent_id

**Phase 3 (1M+ executions/day):**
- Kubernetes-based autoscaling
- Time-series DB for metrics (TimescaleDB or InfluxDB)
- Distributed tracing (Jaeger)
- Multi-region deployment

---

## Integration Patterns

### n8n Workflow Integration

```javascript
// n8n workflow webhook node receives:
{
  "execution_id": "exec_xyz789",
  "agent_id": "agent_abc123",
  "trigger_context": {...},
  "approved_actions": ["send_email", "call_api"],
  "policy_constraints": {
    "max_emails": 5,
    "rate_limit_remaining": 45
  }
}

// n8n workflow must call back:
POST /api/v1/executions/{execution_id}/report

{
  "status": "success",
  "steps_executed": [...],
  "tokens_used": 8542,
  "llm_provider": "anthropic",
  "llm_model": "claude-sonnet-4-5",
  "actions_taken": [...]
}
```

### LLM Provider Abstraction

```python
class LLMRouter:
    """
    Routes LLM requests based on cost optimization policies
    """
    async def get_completion(
        self,
        agent_id: str,
        prompt: str,
        complexity: str = "medium"
    ) -> LLMResponse:

        # Check policy for this agent
        policy = await self.get_model_policy(agent_id)

        # Route to appropriate provider
        provider_config = policy.rules['route_by_complexity'][complexity]

        if provider_config['provider'] == 'anthropic':
            return await self.anthropic_client.complete(
                model=provider_config['model'],
                prompt=prompt,
                max_tokens=provider_config['max_tokens']
            )
        elif provider_config['provider'] == 'openai':
            return await self.openai_client.complete(...)
```

---

*This technical specification demonstrates production-ready architecture design with concrete implementation details, not theoretical handwaving. Built for operators who need systems that ship, not slide decks.*
