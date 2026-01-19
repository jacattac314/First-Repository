# AI Platform Architecture Portfolio

Platform design and systems thinking for AI operations at scale.

## Case Studies

### [🧭 Central Control Plane for All Agents](docs/agent-control-plane.md)

A unified operational platform to observe, control, govern, and evolve AI agents in production.

**Key capabilities:**
- Agent registry and lifecycle management
- Real-time execution monitoring
- Policy enforcement and governance
- Cost optimization and performance tracking
- Human-in-the-loop workflows

**Documentation depth:**
- [Core architecture and business case](docs/agent-control-plane.md) - The "why" and "what"
- [Technical specifications](docs/control-plane-technical-specs.md) - Database schema, API design, implementation details
- [Example configurations](docs/example-configurations.md) - Docker deployment, agent configs, monitoring queries, runbooks
- [Architecture decisions](docs/architecture-decisions.md) - Design rationale, trade-offs, alternatives considered (12 ADRs)

**What this demonstrates:**
- **Systems thinking**: Central control plane for distributed agent execution
- **Production engineering**: Rate limiting, policy enforcement, cost tracking, observability
- **Risk management**: Approval workflows, audit logging, security isolation
- **Pragmatic delivery**: 3-phase implementation strategy, no big-bang deployments
- **Technical depth**: SQL schema, API specs, Prometheus metrics, deployment automation

This is how automation graduates from scripts to managed infrastructure.

---

## Architecture Philosophy

These designs prioritize:
- **Pragmatic incrementalism** over big-bang platforms
- **Observable systems** over black-box automation
- **Governed deployment** over move-fast-break-things
- **Business outcomes** over technical complexity

Built for operators who need AI to be infrastructure, not experiments.

---

## Repository Structure

```
docs/
├── agent-control-plane.md              # Core architecture overview
├── control-plane-technical-specs.md    # Implementation specifications
├── example-configurations.md           # Deployment configs & runbooks
└── architecture-decisions.md           # Design rationale (12 ADRs)
```

**Lines of documentation:** ~2,000+ lines of production-ready architecture specs

**Coverage:**
- System architecture and business case
- SQL schema (4 tables with indexes)
- REST API specification (20+ endpoints)
- Sample agent configurations (3 realistic examples)
- Policy engine implementation
- Docker deployment stack
- Monitoring queries (Prometheus + SQL)
- Security model and isolation strategy
- 12 Architecture Decision Records
- Operational runbooks

Not a side project. A platform.
