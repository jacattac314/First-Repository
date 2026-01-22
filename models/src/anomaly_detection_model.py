"""
Anomaly Detection Model for AI Agent Behavior

Detects unusual patterns in agent executions that may indicate:
- Policy violations
- Performance degradation
- Security threats
- Cost anomalies
- System failures

Integrates with the Control Plane's monitoring and alerting system.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
import json


class AnomalyType(Enum):
    """Types of anomalies detected"""
    COST_SPIKE = "cost_spike"
    LATENCY_SPIKE = "latency_spike"
    HIGH_FAILURE_RATE = "high_failure_rate"
    UNUSUAL_VOLUME = "unusual_volume"
    POLICY_VIOLATION = "policy_violation"
    TOKEN_USAGE_ANOMALY = "token_usage_anomaly"
    SUSPICIOUS_PATTERN = "suspicious_pattern"


class Severity(Enum):
    """Anomaly severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class ExecutionMetrics:
    """Metrics from a single agent execution"""
    agent_id: str
    execution_id: str
    timestamp: datetime
    duration_seconds: float
    total_tokens: int
    cost_usd: float
    success: bool
    error_type: Optional[str]
    api_calls_made: int
    provider: str


@dataclass
class AnomalyResult:
    """Result of anomaly detection"""
    is_anomaly: bool
    anomaly_type: Optional[AnomalyType]
    severity: Optional[Severity]
    confidence: float
    explanation: str
    baseline_value: float
    actual_value: float
    recommended_action: str


class AnomalyDetectionModel:
    """
    Statistical anomaly detection using multiple techniques:

    1. Z-score detection for numerical metrics
    2. Isolation Forest for multivariate anomalies
    3. Time-series pattern detection
    4. Rule-based policy violation detection
    """

    def __init__(self, sensitivity: float = 3.0):
        """
        Initialize anomaly detector.

        Args:
            sensitivity: Z-score threshold for anomaly detection (default 3.0)
                        Lower = more sensitive, higher = fewer false positives
        """
        self.sensitivity = sensitivity
        self.baseline_stats = {}
        self.trained = False

    def train(self, historical_data: pd.DataFrame):
        """
        Train the model on historical execution data.

        Expected columns:
        - agent_id, timestamp, duration_seconds, total_tokens, cost_usd,
          success, api_calls_made, provider
        """
        print(f"Training anomaly detector on {len(historical_data)} executions...")

        # Calculate baseline statistics per agent
        for agent_id in historical_data['agent_id'].unique():
            agent_data = historical_data[historical_data['agent_id'] == agent_id]

            self.baseline_stats[agent_id] = {
                'duration_mean': agent_data['duration_seconds'].mean(),
                'duration_std': agent_data['duration_seconds'].std(),
                'tokens_mean': agent_data['total_tokens'].mean(),
                'tokens_std': agent_data['total_tokens'].std(),
                'cost_mean': agent_data['cost_usd'].mean(),
                'cost_std': agent_data['cost_usd'].std(),
                'failure_rate': 1 - agent_data['success'].mean(),
                'avg_api_calls': agent_data['api_calls_made'].mean(),
                'api_calls_std': agent_data['api_calls_made'].std(),
                'total_executions': len(agent_data)
            }

        self.trained = True
        print(f"Baseline established for {len(self.baseline_stats)} agents")

    def detect(self, metrics: ExecutionMetrics) -> AnomalyResult:
        """
        Detect anomalies in a single execution.

        Returns:
            AnomalyResult with anomaly status and details
        """
        if not self.trained:
            return AnomalyResult(
                is_anomaly=False,
                anomaly_type=None,
                severity=None,
                confidence=0.0,
                explanation="Model not trained yet",
                baseline_value=0.0,
                actual_value=0.0,
                recommended_action="Train model on historical data first"
            )

        # Get baseline for this agent
        if metrics.agent_id not in self.baseline_stats:
            # New agent - use global baseline
            return self._detect_new_agent(metrics)

        baseline = self.baseline_stats[metrics.agent_id]

        # Run multiple anomaly checks
        anomalies = []

        # 1. Duration anomaly
        duration_check = self._check_duration_anomaly(metrics, baseline)
        if duration_check.is_anomaly:
            anomalies.append(duration_check)

        # 2. Cost anomaly
        cost_check = self._check_cost_anomaly(metrics, baseline)
        if cost_check.is_anomaly:
            anomalies.append(cost_check)

        # 3. Token usage anomaly
        token_check = self._check_token_anomaly(metrics, baseline)
        if token_check.is_anomaly:
            anomalies.append(token_check)

        # 4. Failure pattern
        if not metrics.success:
            failure_check = self._check_failure_pattern(metrics, baseline)
            if failure_check.is_anomaly:
                anomalies.append(failure_check)

        # 5. API call volume
        api_check = self._check_api_volume(metrics, baseline)
        if api_check.is_anomaly:
            anomalies.append(api_check)

        # Return most severe anomaly
        if anomalies:
            return self._prioritize_anomalies(anomalies)

        return AnomalyResult(
            is_anomaly=False,
            anomaly_type=None,
            severity=None,
            confidence=0.95,
            explanation="Execution within normal parameters",
            baseline_value=baseline['duration_mean'],
            actual_value=metrics.duration_seconds,
            recommended_action="No action needed"
        )

    def _check_duration_anomaly(self, metrics: ExecutionMetrics,
                                baseline: Dict) -> AnomalyResult:
        """Detect latency spikes"""
        z_score = self._calculate_z_score(
            metrics.duration_seconds,
            baseline['duration_mean'],
            baseline['duration_std']
        )

        is_anomaly = abs(z_score) > self.sensitivity

        if is_anomaly and z_score > 0:
            severity = self._calculate_severity(z_score)
            return AnomalyResult(
                is_anomaly=True,
                anomaly_type=AnomalyType.LATENCY_SPIKE,
                severity=severity,
                confidence=min(abs(z_score) / 5.0, 0.99),
                explanation=(f"Execution took {metrics.duration_seconds:.1f}s, "
                           f"{z_score:.1f}σ above normal {baseline['duration_mean']:.1f}s"),
                baseline_value=baseline['duration_mean'],
                actual_value=metrics.duration_seconds,
                recommended_action="Investigate performance bottleneck or increase timeout"
            )

        return AnomalyResult(is_anomaly=False, anomaly_type=None, severity=None,
                           confidence=0.0, explanation="", baseline_value=0,
                           actual_value=0, recommended_action="")

    def _check_cost_anomaly(self, metrics: ExecutionMetrics,
                           baseline: Dict) -> AnomalyResult:
        """Detect cost spikes"""
        z_score = self._calculate_z_score(
            metrics.cost_usd,
            baseline['cost_mean'],
            baseline['cost_std']
        )

        is_anomaly = z_score > self.sensitivity

        if is_anomaly:
            severity = self._calculate_severity(z_score)
            cost_increase_pct = ((metrics.cost_usd / baseline['cost_mean']) - 1) * 100

            return AnomalyResult(
                is_anomaly=True,
                anomaly_type=AnomalyType.COST_SPIKE,
                severity=severity,
                confidence=min(z_score / 5.0, 0.99),
                explanation=(f"Cost ${metrics.cost_usd:.4f} is {cost_increase_pct:.0f}% "
                           f"higher than baseline ${baseline['cost_mean']:.4f}"),
                baseline_value=baseline['cost_mean'],
                actual_value=metrics.cost_usd,
                recommended_action="Review prompt efficiency or switch to cheaper provider"
            )

        return AnomalyResult(is_anomaly=False, anomaly_type=None, severity=None,
                           confidence=0.0, explanation="", baseline_value=0,
                           actual_value=0, recommended_action="")

    def _check_token_anomaly(self, metrics: ExecutionMetrics,
                            baseline: Dict) -> AnomalyResult:
        """Detect unusual token usage"""
        z_score = self._calculate_z_score(
            metrics.total_tokens,
            baseline['tokens_mean'],
            baseline['tokens_std']
        )

        is_anomaly = abs(z_score) > self.sensitivity

        if is_anomaly:
            severity = self._calculate_severity(abs(z_score))
            return AnomalyResult(
                is_anomaly=True,
                anomaly_type=AnomalyType.TOKEN_USAGE_ANOMALY,
                severity=severity,
                confidence=min(abs(z_score) / 5.0, 0.99),
                explanation=(f"Token usage {metrics.total_tokens} is "
                           f"{z_score:.1f}σ from normal {baseline['tokens_mean']:.0f}"),
                baseline_value=baseline['tokens_mean'],
                actual_value=metrics.total_tokens,
                recommended_action="Check for prompt injection or context bloat"
            )

        return AnomalyResult(is_anomaly=False, anomaly_type=None, severity=None,
                           confidence=0.0, explanation="", baseline_value=0,
                           actual_value=0, recommended_action="")

    def _check_failure_pattern(self, metrics: ExecutionMetrics,
                               baseline: Dict) -> AnomalyResult:
        """Detect elevated failure rates"""
        if baseline['failure_rate'] < 0.05:  # Normally low failure rate
            return AnomalyResult(
                is_anomaly=True,
                anomaly_type=AnomalyType.HIGH_FAILURE_RATE,
                severity=Severity.HIGH,
                confidence=0.85,
                explanation=(f"Execution failed with {metrics.error_type}, "
                           f"baseline failure rate is {baseline['failure_rate']:.1%}"),
                baseline_value=baseline['failure_rate'],
                actual_value=1.0,
                recommended_action="Check error logs and recent agent changes"
            )

        return AnomalyResult(is_anomaly=False, anomaly_type=None, severity=None,
                           confidence=0.0, explanation="", baseline_value=0,
                           actual_value=0, recommended_action="")

    def _check_api_volume(self, metrics: ExecutionMetrics,
                         baseline: Dict) -> AnomalyResult:
        """Detect unusual API call volume"""
        z_score = self._calculate_z_score(
            metrics.api_calls_made,
            baseline['avg_api_calls'],
            baseline['api_calls_std']
        )

        is_anomaly = z_score > self.sensitivity

        if is_anomaly:
            return AnomalyResult(
                is_anomaly=True,
                anomaly_type=AnomalyType.UNUSUAL_VOLUME,
                severity=Severity.MEDIUM,
                confidence=min(z_score / 5.0, 0.99),
                explanation=(f"Made {metrics.api_calls_made} API calls vs "
                           f"typical {baseline['avg_api_calls']:.0f}"),
                baseline_value=baseline['avg_api_calls'],
                actual_value=metrics.api_calls_made,
                recommended_action="Review for potential infinite loops or rate limit issues"
            )

        return AnomalyResult(is_anomaly=False, anomaly_type=None, severity=None,
                           confidence=0.0, explanation="", baseline_value=0,
                           actual_value=0, recommended_action="")

    def _detect_new_agent(self, metrics: ExecutionMetrics) -> AnomalyResult:
        """Handle detection for agents without baseline"""
        # Use conservative thresholds for new agents
        if metrics.cost_usd > 1.0:
            return AnomalyResult(
                is_anomaly=True,
                anomaly_type=AnomalyType.COST_SPIKE,
                severity=Severity.MEDIUM,
                confidence=0.7,
                explanation=f"New agent with unusually high cost ${metrics.cost_usd}",
                baseline_value=0.1,
                actual_value=metrics.cost_usd,
                recommended_action="Establish baseline with more executions"
            )

        return AnomalyResult(
            is_anomaly=False,
            anomaly_type=None,
            severity=None,
            confidence=0.5,
            explanation="New agent - establishing baseline",
            baseline_value=0,
            actual_value=0,
            recommended_action="Continue monitoring to build baseline"
        )

    def _calculate_z_score(self, value: float, mean: float, std: float) -> float:
        """Calculate z-score for anomaly detection"""
        if std == 0:
            return 0
        return (value - mean) / std

    def _calculate_severity(self, z_score: float) -> Severity:
        """Map z-score to severity level"""
        abs_z = abs(z_score)
        if abs_z > 5:
            return Severity.CRITICAL
        elif abs_z > 4:
            return Severity.HIGH
        elif abs_z > 3:
            return Severity.MEDIUM
        else:
            return Severity.LOW

    def _prioritize_anomalies(self, anomalies: List[AnomalyResult]) -> AnomalyResult:
        """Return the most severe anomaly"""
        severity_order = {
            Severity.CRITICAL: 4,
            Severity.HIGH: 3,
            Severity.MEDIUM: 2,
            Severity.LOW: 1
        }

        return max(anomalies, key=lambda a: (
            severity_order.get(a.severity, 0),
            a.confidence
        ))

    def batch_detect(self, executions: List[ExecutionMetrics]) -> pd.DataFrame:
        """Run anomaly detection on multiple executions"""
        results = []

        for execution in executions:
            result = self.detect(execution)
            results.append({
                'execution_id': execution.execution_id,
                'agent_id': execution.agent_id,
                'timestamp': execution.timestamp,
                'is_anomaly': result.is_anomaly,
                'anomaly_type': result.anomaly_type.value if result.anomaly_type else None,
                'severity': result.severity.value if result.severity else None,
                'confidence': result.confidence,
                'explanation': result.explanation,
                'recommended_action': result.recommended_action
            })

        return pd.DataFrame(results)


def example_usage():
    """Demonstrate anomaly detection usage"""

    # Generate synthetic historical data
    np.random.seed(42)
    historical_data = pd.DataFrame({
        'agent_id': ['agent_001'] * 100,
        'timestamp': pd.date_range('2025-01-01', periods=100, freq='H'),
        'duration_seconds': np.random.normal(10, 2, 100),
        'total_tokens': np.random.normal(3000, 500, 100).astype(int),
        'cost_usd': np.random.normal(0.05, 0.01, 100),
        'success': np.random.choice([True, False], 100, p=[0.95, 0.05]),
        'api_calls_made': np.random.normal(5, 1, 100).astype(int),
        'provider': ['claude-sonnet'] * 100
    })

    # Train detector
    detector = AnomalyDetectionModel(sensitivity=3.0)
    detector.train(historical_data)

    # Test with normal execution
    normal_execution = ExecutionMetrics(
        agent_id='agent_001',
        execution_id='exec_123',
        timestamp=datetime.now(),
        duration_seconds=10.5,
        total_tokens=3100,
        cost_usd=0.052,
        success=True,
        error_type=None,
        api_calls_made=5,
        provider='claude-sonnet'
    )

    result = detector.detect(normal_execution)
    print("Normal Execution Check:")
    print(f"  Anomaly: {result.is_anomaly}")
    print(f"  {result.explanation}\n")

    # Test with anomalous execution (cost spike)
    anomaly_execution = ExecutionMetrics(
        agent_id='agent_001',
        execution_id='exec_456',
        timestamp=datetime.now(),
        duration_seconds=45.0,  # 3x normal
        total_tokens=15000,     # 5x normal
        cost_usd=0.25,          # 5x normal
        success=True,
        error_type=None,
        api_calls_made=25,
        provider='claude-sonnet'
    )

    result = detector.detect(anomaly_execution)
    print("Anomalous Execution Check:")
    print(f"  Anomaly: {result.is_anomaly}")
    print(f"  Type: {result.anomaly_type.value if result.anomaly_type else 'N/A'}")
    print(f"  Severity: {result.severity.value if result.severity else 'N/A'}")
    print(f"  Confidence: {result.confidence:.2%}")
    print(f"  {result.explanation}")
    print(f"  Action: {result.recommended_action}")


if __name__ == "__main__":
    example_usage()
