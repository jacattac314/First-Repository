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

### [🦸 Odd Job Heroes: Senior-First Service Platform](docs/odd-job-heroes-architecture.md)

A complete website architecture for a service business designed specifically for older customers—built for trust, simplicity, and speed.

**Key capabilities:**
- Photo-based estimates (signature feature: "Show us. We'll quote it.")
- Senior-first UX (large buttons, plain language, phone-first)
- Dual pricing models (By Job for predictability, By Hour for flexibility)
- Complete admin operations platform (requests → estimates → scheduling → completion)
- Multi-channel communication (SMS, email, phone with smart automation)

**Documentation depth:**
- [Core architecture and UX design](docs/odd-job-heroes-architecture.md) - Product strategy, user flows, page architecture
- [Data model and technical specs](docs/odd-job-heroes-data-model.md) - Database schema, API endpoints, notifications, security
- [Implementation strategy](docs/odd-job-heroes-implementation.md) - Tech stack, MVP roadmap, phased delivery, cost structure
- **[Frontend Implementation →](odd-job-heroes/)** - Live Next.js application (8 pages, mobile-responsive)

**What this demonstrates:**
- **User-centered design**: Accessibility and senior-friendly UX as core requirements, not afterthoughts
- **Business model architecture**: Pricing strategy (packages vs. hourly), photo estimates as differentiator
- **Operational efficiency**: Admin dashboard optimized for solo operator, manual → automated progression
- **Pragmatic tech choices**: Modern stack (Next.js, Supabase, Twilio) optimized for speed-to-market
- **Phased delivery**: Ship MVP in 6 weeks, validate demand, then automate what's proven
- **Trust architecture**: Privacy-first, minimal data collection, clear policies for vulnerable demographic

**Real-world constraints:**
- Solo operator (not a team of engineers)
- Profitable from job #1 (<$10/month platform costs in MVP)
- Bootstrapped (no VC funding needed)
- Serves underserved market (seniors often ignored by modern web design)

This isn't just a website. It's a **complete business platform** that respects its users.

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
├── agent-control-plane.md                # AI Control Plane: Core architecture
├── control-plane-technical-specs.md      # AI Control Plane: Technical specs
├── example-configurations.md             # AI Control Plane: Deployment configs
├── architecture-decisions.md             # AI Control Plane: Design rationale (12 ADRs)
├── odd-job-heroes-architecture.md        # Odd Job Heroes: Product & UX architecture
├── odd-job-heroes-data-model.md          # Odd Job Heroes: Database & API specs
└── odd-job-heroes-implementation.md      # Odd Job Heroes: Tech stack & delivery plan
```

**Lines of documentation:** ~5,000+ lines of production-ready architecture specs

**AI Control Plane coverage:**
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

**Odd Job Heroes coverage:**
- Complete product architecture (11 public pages + admin dashboard)
- User flow design (3 user types, 3 core flows)
- SQL schema (8 core tables + supporting tables)
- REST API specification (10+ endpoints)
- Notification system (7 customer triggers, 6 admin triggers)
- Tech stack selection with rationale
- 7-week phased implementation plan
- Cost structure ($6/month MVP → $72/month at scale)
- Accessibility requirements (WCAG-compliant senior-first design)

Not side projects. Platforms.
