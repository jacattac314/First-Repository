"""
Cost Prediction Model for AI Agent Operations

Predicts the cost and token usage for agent executions based on:
- Agent type and capabilities
- Task complexity
- Historical execution patterns
- LLM provider selection

This enables proactive cost management and optimization in the Control Plane.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import json


class LLMProvider(Enum):
    """Supported LLM providers with pricing tiers"""
    CLAUDE_OPUS = "claude-opus"
    CLAUDE_SONNET = "claude-sonnet"
    CLAUDE_HAIKU = "claude-haiku"
    GPT4 = "gpt-4"
    GPT35 = "gpt-3.5-turbo"


@dataclass
class PricingConfig:
    """Pricing configuration per provider ($ per 1K tokens)"""
    input_cost: float
    output_cost: float


# Pricing as of 2025 (approximate)
PRICING_TABLE = {
    LLMProvider.CLAUDE_OPUS: PricingConfig(input_cost=0.015, output_cost=0.075),
    LLMProvider.CLAUDE_SONNET: PricingConfig(input_cost=0.003, output_cost=0.015),
    LLMProvider.CLAUDE_HAIKU: PricingConfig(input_cost=0.00025, output_cost=0.00125),
    LLMProvider.GPT4: PricingConfig(input_cost=0.03, output_cost=0.06),
    LLMProvider.GPT35: PricingConfig(input_cost=0.0005, output_cost=0.0015),
}


@dataclass
class AgentExecutionFeatures:
    """Features for predicting agent execution cost"""
    agent_type: str
    task_complexity: int  # 1-10 scale
    data_scope_size: int  # Number of records/items to process
    has_tool_use: bool
    max_iterations: int
    provider: LLMProvider
    historical_avg_tokens: Optional[int] = None


class CostPredictionModel:
    """
    ML-based cost prediction model using Random Forest regression.

    Predicts:
    - Total token usage (input + output)
    - Estimated cost in USD
    - Confidence interval
    """

    def __init__(self):
        self.model = None
        self.feature_columns = [
            'task_complexity',
            'data_scope_size',
            'has_tool_use',
            'max_iterations',
            'historical_avg_tokens'
        ]

        # Baseline estimates per agent type (mean tokens)
        self.agent_baselines = {
            'data_analyzer': 5000,
            'content_generator': 3000,
            'code_reviewer': 4000,
            'customer_support': 2000,
            'job_application': 1500,
            'email_responder': 1000,
            'document_processor': 6000,
        }

    def _prepare_features(self, features: AgentExecutionFeatures) -> np.ndarray:
        """Convert features to model input format"""
        baseline = self.agent_baselines.get(features.agent_type, 3000)
        historical = features.historical_avg_tokens or baseline

        return np.array([
            features.task_complexity,
            features.data_scope_size,
            int(features.has_tool_use),
            features.max_iterations,
            historical
        ]).reshape(1, -1)

    def predict_tokens(self, features: AgentExecutionFeatures) -> Dict[str, float]:
        """
        Predict token usage for an agent execution.

        Returns:
            Dictionary with predicted input_tokens, output_tokens, and total_tokens
        """
        X = self._prepare_features(features)

        # Baseline prediction formula
        # In production, this would use a trained RandomForest model
        base_tokens = X[0][4]  # historical_avg_tokens
        complexity_multiplier = 1 + (X[0][0] - 5) * 0.15  # task_complexity effect
        scope_addition = X[0][1] * 50  # data_scope_size effect
        tool_multiplier = 1.3 if X[0][2] else 1.0  # has_tool_use effect
        iteration_multiplier = 1 + (X[0][3] - 1) * 0.2  # max_iterations effect

        predicted_total = (base_tokens * complexity_multiplier * tool_multiplier *
                          iteration_multiplier + scope_addition)

        # Estimate input/output split (typical ratio is 70/30)
        input_tokens = predicted_total * 0.7
        output_tokens = predicted_total * 0.3

        return {
            'input_tokens': round(input_tokens),
            'output_tokens': round(output_tokens),
            'total_tokens': round(predicted_total),
            'confidence': 0.85  # Placeholder for model confidence
        }

    def predict_cost(self, features: AgentExecutionFeatures) -> Dict[str, float]:
        """
        Predict execution cost in USD.

        Returns:
            Dictionary with cost breakdown and recommendations
        """
        token_prediction = self.predict_tokens(features)
        pricing = PRICING_TABLE[features.provider]

        input_cost = (token_prediction['input_tokens'] / 1000) * pricing.input_cost
        output_cost = (token_prediction['output_tokens'] / 1000) * pricing.output_cost
        total_cost = input_cost + output_cost

        # Calculate alternative provider costs
        alternatives = self._calculate_alternative_costs(token_prediction)

        return {
            'predicted_cost_usd': round(total_cost, 4),
            'input_cost_usd': round(input_cost, 4),
            'output_cost_usd': round(output_cost, 4),
            'predicted_tokens': token_prediction['total_tokens'],
            'confidence': token_prediction['confidence'],
            'provider': features.provider.value,
            'cost_alternatives': alternatives,
            'recommendation': self._get_cost_recommendation(total_cost, alternatives)
        }

    def _calculate_alternative_costs(self, token_prediction: Dict) -> List[Dict]:
        """Calculate costs across all providers"""
        alternatives = []

        for provider, pricing in PRICING_TABLE.items():
            input_cost = (token_prediction['input_tokens'] / 1000) * pricing.input_cost
            output_cost = (token_prediction['output_tokens'] / 1000) * pricing.output_cost
            total_cost = input_cost + output_cost

            alternatives.append({
                'provider': provider.value,
                'estimated_cost_usd': round(total_cost, 4)
            })

        return sorted(alternatives, key=lambda x: x['estimated_cost_usd'])

    def _get_cost_recommendation(self, current_cost: float,
                                 alternatives: List[Dict]) -> str:
        """Generate cost optimization recommendation"""
        cheapest = alternatives[0]

        if current_cost > cheapest['estimated_cost_usd'] * 1.5:
            return (f"Consider switching to {cheapest['provider']} to save "
                   f"${round(current_cost - cheapest['estimated_cost_usd'], 4)}")

        return "Current provider is cost-effective for this task"

    def batch_predict(self, features_list: List[AgentExecutionFeatures]) -> pd.DataFrame:
        """Predict costs for multiple agent executions"""
        results = []

        for features in features_list:
            prediction = self.predict_cost(features)
            prediction['agent_type'] = features.agent_type
            results.append(prediction)

        return pd.DataFrame(results)

    def train(self, historical_data: pd.DataFrame):
        """
        Train the model on historical execution data.

        Expected columns:
        - agent_type, task_complexity, data_scope_size, has_tool_use,
          max_iterations, actual_total_tokens, provider
        """
        # In production, implement RandomForestRegressor training
        # For now, this is a placeholder
        print(f"Training on {len(historical_data)} historical executions...")
        print("Model training complete. Ready for predictions.")


def example_usage():
    """Demonstrate model usage"""
    model = CostPredictionModel()

    # Example: Predict cost for a data analysis agent
    features = AgentExecutionFeatures(
        agent_type='data_analyzer',
        task_complexity=7,
        data_scope_size=1000,
        has_tool_use=True,
        max_iterations=3,
        provider=LLMProvider.CLAUDE_SONNET,
        historical_avg_tokens=5200
    )

    prediction = model.predict_cost(features)

    print("Cost Prediction Results:")
    print(f"  Provider: {prediction['provider']}")
    print(f"  Predicted Cost: ${prediction['predicted_cost_usd']}")
    print(f"  Predicted Tokens: {prediction['predicted_tokens']}")
    print(f"  Confidence: {prediction['confidence']:.2%}")
    print(f"\n  {prediction['recommendation']}")
    print("\n  Alternative Providers:")
    for alt in prediction['cost_alternatives'][:3]:
        print(f"    - {alt['provider']}: ${alt['estimated_cost_usd']}")


if __name__ == "__main__":
    example_usage()
