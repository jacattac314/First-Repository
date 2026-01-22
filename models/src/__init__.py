"""
ML/AI Models for AI Agent Control Plane

This package provides machine learning models for:
- Cost prediction and optimization
- Anomaly detection in agent behavior
- Performance analysis and forecasting

Models integrate with the Control Plane for real-time monitoring and optimization.
"""

from .cost_prediction_model import (
    CostPredictionModel,
    LLMProvider,
    AgentExecutionFeatures,
    PricingConfig
)

from .anomaly_detection_model import (
    AnomalyDetectionModel,
    AnomalyType,
    Severity,
    ExecutionMetrics,
    AnomalyResult
)

from .training_utils import (
    SyntheticDataGenerator,
    ModelEvaluator
)

__all__ = [
    'CostPredictionModel',
    'LLMProvider',
    'AgentExecutionFeatures',
    'PricingConfig',
    'AnomalyDetectionModel',
    'AnomalyType',
    'Severity',
    'ExecutionMetrics',
    'AnomalyResult',
    'SyntheticDataGenerator',
    'ModelEvaluator'
]

__version__ = '1.0.0'
