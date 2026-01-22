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

### [🤖 ML/AI Models for Cost Prediction & Anomaly Detection](models/README.md)

Production-ready machine learning models that integrate with the Control Plane for intelligent operations.

**Models:**
- **Cost Prediction Model** - Predict LLM costs before execution, recommend optimal providers
- **Anomaly Detection Model** - Real-time detection of unusual agent behavior patterns

**Key capabilities:**
- Proactive cost optimization across LLM providers
- Statistical anomaly detection (cost spikes, latency issues, failures)
- Batch processing for historical analysis
- Confidence scoring and actionable recommendations

**Implementation:**
- 3 production-ready Python models with full API
- Synthetic data generation for training and testing
- Model evaluation utilities (MAE, RMSE, precision/recall)
- Jupyter notebook for interactive exploration
- Integration examples with Control Plane

**What this demonstrates:**
- **Applied ML**: Practical machine learning for operational problems
- **Production engineering**: Model versioning, evaluation metrics, retraining pipelines
- **Data science**: Feature engineering, anomaly detection, cost optimization
- **Business value**: Measurable ROI through cost savings and risk reduction

ML that saves money, not just slide deck magic.

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

models/
├── src/
│   ├── cost_prediction_model.py        # Cost prediction ML model
│   ├── anomaly_detection_model.py      # Anomaly detection ML model
│   └── training_utils.py               # Training and evaluation utilities
├── notebooks/
│   └── quickstart.ipynb                # Interactive model demo
├── data/                                # Training data storage
├── requirements.txt                     # Python dependencies
└── README.md                            # Model documentation
```

**Lines of code:** ~2,000+ lines of production-ready architecture specs + ~1,000 lines of ML code

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
- Production ML models (cost prediction, anomaly detection)
- Model training pipelines and evaluation metrics
- Interactive Jupyter notebooks

Not a side project. A platform.
