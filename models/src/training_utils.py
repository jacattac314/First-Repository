"""
Training Utilities for ML/AI Models

Provides utilities for:
- Synthetic data generation for testing
- Model training pipelines
- Model evaluation and metrics
- Integration with Control Plane data sources
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import json


class SyntheticDataGenerator:
    """Generate synthetic agent execution data for model training and testing"""

    def __init__(self, seed: int = 42):
        """
        Initialize generator with random seed for reproducibility

        Args:
            seed: Random seed for numpy
        """
        np.random.seed(seed)

    def generate_agent_executions(
        self,
        n_agents: int = 10,
        executions_per_agent: int = 100,
        start_date: str = "2025-01-01",
        include_anomalies: bool = True,
        anomaly_rate: float = 0.05
    ) -> pd.DataFrame:
        """
        Generate synthetic execution history for multiple agents.

        Args:
            n_agents: Number of unique agents to simulate
            executions_per_agent: Number of executions per agent
            start_date: Start date for execution timestamps
            include_anomalies: Whether to inject anomalous executions
            anomaly_rate: Fraction of executions that should be anomalous

        Returns:
            DataFrame with execution history
        """
        executions = []
        start = pd.to_datetime(start_date)

        agent_types = [
            'data_analyzer', 'content_generator', 'code_reviewer',
            'customer_support', 'job_application', 'email_responder',
            'document_processor', 'report_generator', 'task_scheduler',
            'notification_handler'
        ]

        providers = ['claude-sonnet', 'claude-opus', 'claude-haiku',
                    'gpt-4', 'gpt-3.5-turbo']

        for agent_idx in range(n_agents):
            agent_id = f"agent_{agent_idx:03d}"
            agent_type = agent_types[agent_idx % len(agent_types)]

            # Define agent-specific baselines
            baseline = self._get_agent_baseline(agent_type)

            for exec_idx in range(executions_per_agent):
                timestamp = start + timedelta(hours=agent_idx * executions_per_agent + exec_idx)

                # Determine if this should be an anomaly
                is_anomaly = (include_anomalies and
                            np.random.random() < anomaly_rate)

                execution = self._generate_execution(
                    agent_id=agent_id,
                    agent_type=agent_type,
                    execution_id=f"exec_{agent_idx}_{exec_idx}",
                    timestamp=timestamp,
                    baseline=baseline,
                    is_anomaly=is_anomaly,
                    providers=providers
                )

                executions.append(execution)

        return pd.DataFrame(executions)

    def _get_agent_baseline(self, agent_type: str) -> Dict:
        """Get baseline metrics for an agent type"""
        baselines = {
            'data_analyzer': {
                'duration_mean': 15.0, 'duration_std': 3.0,
                'tokens_mean': 5000, 'tokens_std': 800,
                'cost_mean': 0.08, 'cost_std': 0.015,
                'api_calls_mean': 8, 'api_calls_std': 2,
                'failure_rate': 0.03
            },
            'content_generator': {
                'duration_mean': 8.0, 'duration_std': 2.0,
                'tokens_mean': 3000, 'tokens_std': 500,
                'cost_mean': 0.05, 'cost_std': 0.01,
                'api_calls_mean': 3, 'api_calls_std': 1,
                'failure_rate': 0.02
            },
            'code_reviewer': {
                'duration_mean': 20.0, 'duration_std': 5.0,
                'tokens_mean': 6000, 'tokens_std': 1000,
                'cost_mean': 0.10, 'cost_std': 0.02,
                'api_calls_mean': 10, 'api_calls_std': 3,
                'failure_rate': 0.05
            },
            'customer_support': {
                'duration_mean': 5.0, 'duration_std': 1.0,
                'tokens_mean': 2000, 'tokens_std': 400,
                'cost_mean': 0.03, 'cost_std': 0.008,
                'api_calls_mean': 2, 'api_calls_std': 1,
                'failure_rate': 0.01
            },
            'job_application': {
                'duration_mean': 12.0, 'duration_std': 3.0,
                'tokens_mean': 4000, 'tokens_std': 600,
                'cost_mean': 0.06, 'cost_std': 0.012,
                'api_calls_mean': 5, 'api_calls_std': 2,
                'failure_rate': 0.08
            },
            'email_responder': {
                'duration_mean': 4.0, 'duration_std': 1.0,
                'tokens_mean': 1500, 'tokens_std': 300,
                'cost_mean': 0.025, 'cost_std': 0.005,
                'api_calls_mean': 2, 'api_calls_std': 1,
                'failure_rate': 0.02
            },
            'document_processor': {
                'duration_mean': 25.0, 'duration_std': 6.0,
                'tokens_mean': 7000, 'tokens_std': 1200,
                'cost_mean': 0.12, 'cost_std': 0.025,
                'api_calls_mean': 12, 'api_calls_std': 3,
                'failure_rate': 0.04
            },
        }

        # Return baseline or default
        return baselines.get(agent_type, baselines['content_generator'])

    def _generate_execution(
        self,
        agent_id: str,
        agent_type: str,
        execution_id: str,
        timestamp: datetime,
        baseline: Dict,
        is_anomaly: bool,
        providers: List[str]
    ) -> Dict:
        """Generate a single execution record"""

        # Normal execution
        if not is_anomaly:
            duration = max(0.5, np.random.normal(
                baseline['duration_mean'],
                baseline['duration_std']
            ))
            tokens = int(max(100, np.random.normal(
                baseline['tokens_mean'],
                baseline['tokens_std']
            )))
            cost = max(0.001, np.random.normal(
                baseline['cost_mean'],
                baseline['cost_std']
            ))
            api_calls = int(max(0, np.random.normal(
                baseline['api_calls_mean'],
                baseline['api_calls_std']
            )))
            success = np.random.random() > baseline['failure_rate']

        # Anomalous execution
        else:
            anomaly_type = np.random.choice([
                'latency_spike', 'cost_spike', 'token_spike',
                'api_volume_spike', 'failure'
            ])

            if anomaly_type == 'latency_spike':
                duration = baseline['duration_mean'] * np.random.uniform(3, 8)
                tokens = int(baseline['tokens_mean'] * np.random.uniform(1.5, 3))
                cost = baseline['cost_mean'] * np.random.uniform(1.5, 3)
                api_calls = int(baseline['api_calls_mean'] * np.random.uniform(2, 4))
                success = True

            elif anomaly_type == 'cost_spike':
                duration = baseline['duration_mean'] * np.random.uniform(1, 2)
                tokens = int(baseline['tokens_mean'] * np.random.uniform(4, 10))
                cost = baseline['cost_mean'] * np.random.uniform(5, 12)
                api_calls = int(baseline['api_calls_mean'])
                success = True

            elif anomaly_type == 'token_spike':
                duration = baseline['duration_mean'] * np.random.uniform(1.5, 3)
                tokens = int(baseline['tokens_mean'] * np.random.uniform(5, 15))
                cost = baseline['cost_mean'] * np.random.uniform(3, 8)
                api_calls = int(baseline['api_calls_mean'])
                success = True

            elif anomaly_type == 'api_volume_spike':
                duration = baseline['duration_mean'] * np.random.uniform(2, 4)
                tokens = int(baseline['tokens_mean'] * np.random.uniform(1, 2))
                cost = baseline['cost_mean'] * np.random.uniform(1.5, 3)
                api_calls = int(baseline['api_calls_mean'] * np.random.uniform(5, 15))
                success = True

            else:  # failure
                duration = baseline['duration_mean'] * np.random.uniform(0.1, 0.5)
                tokens = int(baseline['tokens_mean'] * 0.2)
                cost = baseline['cost_mean'] * 0.2
                api_calls = int(baseline['api_calls_mean'] * 0.3)
                success = False

        return {
            'agent_id': agent_id,
            'agent_type': agent_type,
            'execution_id': execution_id,
            'timestamp': timestamp,
            'duration_seconds': round(duration, 2),
            'total_tokens': tokens,
            'input_tokens': int(tokens * 0.7),
            'output_tokens': int(tokens * 0.3),
            'cost_usd': round(cost, 4),
            'success': success,
            'error_type': None if success else np.random.choice([
                'timeout', 'rate_limit', 'invalid_response', 'api_error'
            ]),
            'api_calls_made': api_calls,
            'provider': np.random.choice(providers),
            'task_complexity': np.random.randint(1, 11),
            'data_scope_size': np.random.randint(10, 5000),
            'has_tool_use': np.random.choice([True, False]),
            'max_iterations': np.random.randint(1, 6)
        }

    def save_dataset(self, df: pd.DataFrame, filepath: str):
        """Save generated dataset to CSV"""
        df.to_csv(filepath, index=False)
        print(f"Dataset saved to {filepath}")
        print(f"  Total executions: {len(df)}")
        print(f"  Unique agents: {df['agent_id'].nunique()}")
        print(f"  Date range: {df['timestamp'].min()} to {df['timestamp'].max()}")


class ModelEvaluator:
    """Evaluate model performance with various metrics"""

    @staticmethod
    def evaluate_cost_predictions(
        actual_costs: np.ndarray,
        predicted_costs: np.ndarray
    ) -> Dict[str, float]:
        """
        Evaluate cost prediction model performance.

        Returns:
            Dictionary with MAE, RMSE, MAPE, and R²
        """
        mae = np.mean(np.abs(actual_costs - predicted_costs))
        rmse = np.sqrt(np.mean((actual_costs - predicted_costs) ** 2))
        mape = np.mean(np.abs((actual_costs - predicted_costs) / actual_costs)) * 100

        # R² score
        ss_res = np.sum((actual_costs - predicted_costs) ** 2)
        ss_tot = np.sum((actual_costs - np.mean(actual_costs)) ** 2)
        r2 = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0

        return {
            'mae': round(mae, 4),
            'rmse': round(rmse, 4),
            'mape': round(mape, 2),
            'r2_score': round(r2, 4)
        }

    @staticmethod
    def evaluate_anomaly_detection(
        true_labels: np.ndarray,
        predicted_labels: np.ndarray
    ) -> Dict[str, float]:
        """
        Evaluate anomaly detection performance.

        Returns:
            Dictionary with precision, recall, F1, and accuracy
        """
        tp = np.sum((true_labels == 1) & (predicted_labels == 1))
        fp = np.sum((true_labels == 0) & (predicted_labels == 1))
        fn = np.sum((true_labels == 1) & (predicted_labels == 0))
        tn = np.sum((true_labels == 0) & (predicted_labels == 0))

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        accuracy = (tp + tn) / len(true_labels)

        return {
            'precision': round(precision, 4),
            'recall': round(recall, 4),
            'f1_score': round(f1, 4),
            'accuracy': round(accuracy, 4),
            'true_positives': int(tp),
            'false_positives': int(fp),
            'false_negatives': int(fn),
            'true_negatives': int(tn)
        }


def example_usage():
    """Demonstrate training utilities"""

    # Generate synthetic data
    generator = SyntheticDataGenerator(seed=42)

    print("Generating synthetic training data...")
    training_data = generator.generate_agent_executions(
        n_agents=5,
        executions_per_agent=200,
        include_anomalies=True,
        anomaly_rate=0.05
    )

    print(f"\nGenerated {len(training_data)} executions")
    print(f"Columns: {list(training_data.columns)}")
    print("\nSample data:")
    print(training_data.head())

    # Save dataset
    generator.save_dataset(training_data, 'models/data/training_data.csv')

    # Evaluate models (example)
    print("\n" + "="*60)
    print("Example Model Evaluation")
    print("="*60)

    # Simulate predictions
    actual_costs = training_data['cost_usd'].values[:100]
    predicted_costs = actual_costs + np.random.normal(0, 0.01, 100)  # Add noise

    cost_metrics = ModelEvaluator.evaluate_cost_predictions(
        actual_costs, predicted_costs
    )

    print("\nCost Prediction Metrics:")
    for metric, value in cost_metrics.items():
        print(f"  {metric}: {value}")


if __name__ == "__main__":
    example_usage()
