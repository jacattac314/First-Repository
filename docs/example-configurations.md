# Example Configurations & Deployment Guide

## Quick Start Deployment

### Prerequisites

```bash
# Required services
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- Python 3.11+
```

### Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: agent_control_plane
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  api:
    build: ./api
    environment:
      DATABASE_URL: postgresql://admin:${DB_PASSWORD}@postgres:5432/agent_control_plane
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./api:/app
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  grafana:
    image: grafana/grafana:latest
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources
    ports:
      - "3000:3000"
    depends_on:
      - postgres

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

volumes:
  postgres_data:
  redis_data:
  grafana_data:
  prometheus_data:
```

### Environment Configuration

```bash
# .env
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_jwt_secret_key_here
GRAFANA_PASSWORD=admin_password_here

# LLM Provider API Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# n8n Integration
N8N_API_URL=https://n8n.yourdomain.com/api/v1
N8N_API_KEY=your_n8n_api_key

# Notification channels
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_FROM_ADDRESS=alerts@yourdomain.com
```

---

## Sample Agent Configurations

### 1. Job Application Agent

```yaml
# agents/job-application-agent.yaml
name: job-application-agent
version: 2.1.0
owner_email: recruiting-ops@company.com

description: |
  Automated job application submission system.
  Reads job postings, generates tailored cover letters,
  and submits applications via greenhouse/lever APIs.

capabilities:
  read: true          # Can read job listings database
  write: true         # Can write application records
  notify: true        # Can send Slack notifications
  execute: false      # Cannot execute shell commands

data_scope:
  datasets:
    - job_listings_db
    - user_profiles_db
    - application_history
  apis:
    - greenhouse_api
    - lever_api
    - linkedin_api
  secrets:
    - GREENHOUSE_API_KEY
    - LEVER_API_KEY

allowed_destinations:
  email: false              # No email sending
  slack: true               # Slack notifications OK
  external_api: true        # Can call job board APIs
  webhook: true
  database_write: true

n8n_workflow_id: wf_job_apply_v2
trigger_type: webhook

tags:
  - recruiting
  - automation
  - high-volume
  - customer-facing

# Agent-specific policies
policies:
  - rate_limit:
      max_executions: 50
      window_minutes: 60
  - time_window:
      allowed_hours: [9, 10, 11, 12, 13, 14, 15, 16, 17]
      timezone: America/Los_Angeles
  - approval_required:
      actions: []  # No approval needed for this agent
```

### 2. Customer Email Agent (High-Risk)

```yaml
# agents/customer-email-agent.yaml
name: customer-email-agent
version: 1.0.0
owner_email: support-team@company.com

description: |
  Generates personalized customer support responses.
  Reviews support tickets and drafts email replies.
  **Requires human approval before sending.**

capabilities:
  read: true
  write: false        # Cannot auto-write to customer DB
  notify: true
  execute: false

data_scope:
  datasets:
    - support_tickets_db
    - customer_profiles_db
  apis:
    - zendesk_api
  secrets:
    - ZENDESK_API_KEY

allowed_destinations:
  email: true         # Can send email (with approval)
  slack: true
  external_api: false
  webhook: true
  database_write: false

n8n_workflow_id: wf_support_email_v1
trigger_type: cron
cron_schedule: "0 */2 * * *"  # Every 2 hours

tags:
  - customer-facing
  - support
  - high-risk
  - requires-approval

policies:
  - approval_required:
      actions: [send_email]
      approvers:
        - support-manager@company.com
        - ops-lead@company.com
      auto_expire_hours: 4
      risk_level: high

  - rate_limit:
      max_executions: 10
      window_minutes: 120

  - content_safety:
      check_for:
        - profanity
        - sensitive_data
        - pricing_mentions
      block_on_detection: true
```

### 3. Internal Data Sync Agent (Low-Risk)

```yaml
# agents/data-sync-agent.yaml
name: data-sync-agent
version: 3.0.1
owner_email: data-eng@company.com

description: |
  Syncs data between internal systems.
  No external API calls. No customer data.
  Low-risk automation for internal ops.

capabilities:
  read: true
  write: true
  notify: true
  execute: false

data_scope:
  datasets:
    - analytics_db
    - reporting_db
  apis: []  # Internal only
  secrets: []

allowed_destinations:
  email: false
  slack: true
  external_api: false
  webhook: false
  database_write: true

n8n_workflow_id: wf_data_sync_v3
trigger_type: cron
cron_schedule: "0 2 * * *"  # Daily at 2 AM

tags:
  - internal
  - data-engineering
  - low-risk

policies:
  - rate_limit:
      max_executions: 5
      window_minutes: 1440  # Once per day max

  - time_window:
      allowed_hours: [0, 1, 2, 3, 4, 5]  # Off-hours only
      timezone: UTC

  - cost_optimization:
      use_cheapest_model: true
      max_cost_per_run: 0.50
```

---

## Policy Configuration Examples

### Global Rate Limiting Policy

```python
# policies/global_rate_limit.py
from datetime import datetime, timedelta

global_rate_limit = {
    "policy_name": "global-platform-rate-limit",
    "policy_type": "rate_limit",
    "applies_to": "all",
    "rules": {
        "max_total_executions": 10000,
        "window_minutes": 60,
        "action_on_violation": "queue",
        "queue_max_delay_minutes": 30
    },
    "enabled": True,
    "priority": 1,  # Highest priority
    "metadata": {
        "reason": "Prevent platform overload",
        "owner": "platform-team@company.com"
    }
}
```

### Cost Control Policy

```python
# policies/cost_control.py

cost_control_policy = {
    "policy_name": "daily-cost-limit",
    "policy_type": "cost_limit",
    "applies_to": "all",
    "rules": {
        "max_cost_per_day_usd": 500.00,
        "max_cost_per_agent_per_day_usd": 50.00,
        "warning_threshold_pct": 80,  # Alert at 80% of limit
        "action_on_violation": "pause_agent",
        "notification_channels": ["slack", "email"]
    },
    "enabled": True,
    "priority": 5
}
```

### Customer-Facing Approval Policy

```python
# policies/customer_facing_approval.py

customer_approval_policy = {
    "policy_name": "customer-facing-approval-required",
    "policy_type": "approval_required",
    "applies_to": "tag",
    "target_tags": ["customer-facing"],
    "rules": {
        "require_approval_for": [
            "send_email",
            "send_sms",
            "post_to_social",
            "create_ticket"
        ],
        "approvers": [
            "customer-success@company.com",
            "support-manager@company.com"
        ],
        "require_multiple_approvals": False,
        "auto_expire_hours": 24,
        "risk_threshold": "medium",
        "escalation": {
            "after_hours": 8,
            "escalate_to": ["director@company.com"]
        }
    },
    "enabled": True,
    "priority": 10
}
```

### Business Hours Enforcement

```python
# policies/business_hours.py

business_hours_policy = {
    "policy_name": "business-hours-only",
    "policy_type": "time_window",
    "applies_to": "tag",
    "target_tags": ["customer-facing", "external"],
    "rules": {
        "allowed_days": ["MON", "TUE", "WED", "THU", "FRI"],
        "allowed_hours": list(range(9, 18)),  # 9 AM - 6 PM
        "timezone": "America/New_York",
        "action_on_violation": "delay_until_allowed",
        "max_delay_hours": 72,  # Don't delay more than 3 days
        "holidays": [
            "2026-01-01",  # New Year's
            "2026-07-04",  # Independence Day
            "2026-12-25"   # Christmas
        ]
    },
    "enabled": True,
    "priority": 15
}
```

---

## Monitoring Queries

### Prometheus Metrics Configuration

```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'agent-control-plane-api'
    static_configs:
      - targets: ['api:8000']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
```

### Useful Queries for Grafana

```promql
# Total executions per minute
rate(agent_executions_total[1m])

# Success rate by agent
sum(rate(agent_executions_total{status="success"}[5m])) by (agent_name)
/
sum(rate(agent_executions_total[5m])) by (agent_name)

# Average execution latency
histogram_quantile(0.95,
  rate(agent_execution_duration_seconds_bucket[5m])
)

# Cost per hour
sum(increase(agent_execution_cost_usd[1h]))

# Policy violations per hour
sum(increase(policy_violations_total[1h])) by (policy_name)

# Pending approvals count
agent_approvals_pending

# Top 5 most expensive agents
topk(5,
  sum(increase(agent_execution_cost_usd[24h])) by (agent_name)
)

# Failure rate spike detection
(
  sum(rate(agent_executions_total{status="failed"}[5m]))
  /
  sum(rate(agent_executions_total[5m]))
) > 0.05  # Alert if >5% failure rate
```

### SQL Queries for Analysis

```sql
-- Cost breakdown by agent (last 30 days)
SELECT
    a.name,
    a.owner_email,
    COUNT(e.execution_id) as total_executions,
    SUM(e.estimated_cost_usd) as total_cost,
    AVG(e.estimated_cost_usd) as avg_cost_per_run,
    SUM(e.total_tokens) as total_tokens
FROM agents a
LEFT JOIN executions e ON a.agent_id = e.agent_id
WHERE e.started_at > NOW() - INTERVAL '30 days'
GROUP BY a.agent_id, a.name, a.owner_email
ORDER BY total_cost DESC;

-- Agents with degraded performance
SELECT
    a.name,
    COUNT(CASE WHEN e.status = 'failed' THEN 1 END) as failures,
    COUNT(e.execution_id) as total_runs,
    ROUND(
        100.0 * COUNT(CASE WHEN e.status = 'failed' THEN 1 END) / COUNT(e.execution_id),
        2
    ) as failure_rate_pct
FROM agents a
LEFT JOIN executions e ON a.agent_id = e.agent_id
WHERE e.started_at > NOW() - INTERVAL '7 days'
GROUP BY a.agent_id, a.name
HAVING COUNT(e.execution_id) > 10  -- Min 10 runs
    AND failure_rate_pct > 5.0      -- >5% failure rate
ORDER BY failure_rate_pct DESC;

-- Approval queue bottlenecks
SELECT
    approvers,
    COUNT(*) as pending_count,
    AVG(EXTRACT(EPOCH FROM (NOW() - created_at))/3600) as avg_wait_hours,
    MAX(created_at) as oldest_request
FROM approval_queue
WHERE status = 'pending'
GROUP BY approvers
ORDER BY pending_count DESC;

-- LLM provider cost comparison
SELECT
    llm_provider,
    llm_model,
    COUNT(*) as execution_count,
    SUM(estimated_cost_usd) as total_cost,
    AVG(estimated_cost_usd) as avg_cost,
    AVG(total_latency_ms) as avg_latency_ms
FROM executions
WHERE started_at > NOW() - INTERVAL '7 days'
    AND status = 'success'
GROUP BY llm_provider, llm_model
ORDER BY total_cost DESC;

-- Peak usage hours
SELECT
    EXTRACT(HOUR FROM started_at) as hour_of_day,
    COUNT(*) as execution_count,
    SUM(estimated_cost_usd) as total_cost
FROM executions
WHERE started_at > NOW() - INTERVAL '30 days'
GROUP BY hour_of_day
ORDER BY hour_of_day;
```

---

## Alert Configuration

### Grafana Alerts

```yaml
# grafana/alerts/high_failure_rate.yaml
name: High Agent Failure Rate
description: Alert when agent failure rate exceeds 10% over 15 minutes

rules:
  - alert: HighAgentFailureRate
    expr: |
      (
        sum(rate(agent_executions_total{status="failed"}[15m])) by (agent_name)
        /
        sum(rate(agent_executions_total[15m])) by (agent_name)
      ) > 0.10
    for: 5m
    labels:
      severity: warning
      team: platform
    annotations:
      summary: "Agent {{ $labels.agent_name }} has high failure rate"
      description: "Failure rate: {{ $value | humanizePercentage }}"
```

```yaml
# grafana/alerts/cost_spike.yaml
name: Cost Spike Detection
description: Alert when hourly cost exceeds baseline by 200%

rules:
  - alert: CostSpike
    expr: |
      sum(increase(agent_execution_cost_usd[1h]))
      >
      2 * avg_over_time(sum(increase(agent_execution_cost_usd[1h]))[24h:1h])
    for: 10m
    labels:
      severity: critical
      team: finance
    annotations:
      summary: "Agent platform cost spike detected"
      description: "Hourly cost: ${{ $value | printf \"%.2f\" }}"
```

```yaml
# grafana/alerts/approval_queue_backup.yaml
name: Approval Queue Backup
description: Alert when approval queue has too many pending items

rules:
  - alert: ApprovalQueueBackup
    expr: agent_approvals_pending > 20
    for: 30m
    labels:
      severity: warning
      team: operations
    annotations:
      summary: "Approval queue has {{ $value }} pending items"
      description: "Review queue may be understaffed"
```

---

## Deployment Checklist

### Pre-Launch

- [ ] Database migrations applied
- [ ] All secrets configured in environment
- [ ] n8n workflows deployed and tested
- [ ] API authentication configured
- [ ] Rate limiting policies in place
- [ ] Monitoring dashboards created
- [ ] Alert rules configured
- [ ] Approval workflow tested
- [ ] Backup strategy implemented
- [ ] Disaster recovery plan documented

### Launch

- [ ] Deploy to staging environment
- [ ] Run integration tests
- [ ] Load test with synthetic traffic
- [ ] Deploy 1-2 low-risk agents first
- [ ] Monitor for 48 hours
- [ ] Gradual rollout of remaining agents
- [ ] Document any issues in runbook

### Post-Launch

- [ ] Daily cost review for first week
- [ ] Weekly performance tuning
- [ ] Policy adjustment based on usage patterns
- [ ] Team training on approval workflows
- [ ] Establish on-call rotation
- [ ] Quarterly architecture review

---

## Runbook: Common Operations

### Pausing a Misbehaving Agent

```bash
# Via API
curl -X POST https://api.yourdomain.com/api/v1/agents/{agent_id}/pause \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "High failure rate detected", "paused_by": "ops-team"}'

# Via CLI tool
./agent-cli pause job-application-agent \
  --reason "High failure rate" \
  --notify-owner
```

### Emergency Cost Shutdown

```bash
# Pause all agents immediately
./agent-cli pause-all \
  --reason "Cost limit exceeded" \
  --exclude "critical-monitoring-agent"

# Re-enable after investigation
./agent-cli activate job-application-agent \
  --after-review
```

### Rolling Back Agent Version

```bash
# Rollback to previous version
curl -X POST https://api.yourdomain.com/api/v1/agents/{agent_id}/rollback \
  -H "Authorization: Bearer $JWT_TOKEN"

# Or specify version
./agent-cli rollback job-application-agent --to-version 1.9.0
```

---

*These configurations demonstrate production-ready deployment practices with realistic constraints, monitoring, and operational procedures.*
