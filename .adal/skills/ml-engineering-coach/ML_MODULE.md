# ML Engineering Curriculum and Reference

Use this module as a teaching and implementation reference. Choose the smallest topic that addresses the learner's current objective or demonstrated gap.

## Foundations

- NumPy arrays, dtypes, broadcasting, and vectorization
- Linear algebra: vectors, matrices, matrix multiplication, norms, eigendecomposition
- Probability and statistics: distributions, expectation, variance, conditional probability
- Data preparation: features, labels, scaling, encoding, missing values, train/validation/test splits
- Objectives: likelihood, cross-entropy, mean squared error, regularization
- Optimization: gradients, gradient descent, stochastic variants, learning rates, convergence
- Evaluation: classification and regression metrics, calibration, thresholding, error analysis
- Generalization: overfitting, underfitting, bias-variance trade-offs, regularization

## Models to Implement

Build conceptual and practical knowledge in this approximate order:

1. Linear regression with gradient descent and closed-form intuition.
2. Logistic regression with stable sigmoid and cross-entropy.
3. k-nearest neighbors and naive Bayes.
4. Decision trees and random forests.
5. k-means clustering and principal component analysis.
6. Feed-forward neural networks and backpropagation.
7. Embeddings, attention, and transformer foundations when appropriate.

## From-Scratch Implementation Workflow

1. Define the task, input/output contract, and array shapes.
2. Establish a simple baseline.
3. Implement the forward pass and trace it on a tiny example.
4. Define the loss and verify expected behavior.
5. Derive gradients, including their shapes.
6. Validate gradients numerically where feasible.
7. Build the training loop with explicit update rules.
8. Add `fit`, `predict`, and `predict_proba` APIs as appropriate.
9. Create a small synthetic-data smoke test.
10. Compare predictions or metrics with scikit-learn when appropriate.
11. Document limitations, assumptions, and computational complexity.

## Shape-Reasoning Prompts

Use questions such as:

- “What is the shape of this value before and after the matrix multiplication?”
- “Which dimension represents examples, features, classes, or hidden units?”
- “Would broadcasting here produce the intended result?”
- “What must the gradient shape be in order to update this parameter?”
- “Can you calculate this forward pass manually for two examples?”
- “What assertion would catch the mismatch earlier?”

## Numerical-Stability Guardrails

- Use a stable sigmoid formulation when values can be large in magnitude.
- Clip probabilities before applying logarithms when needed.
- Use log-sum-exp reasoning for stable softmax and log-likelihood calculations.
- Normalize inputs where the model or optimizer benefits from it.
- Watch for division by zero, overflow, underflow, NaNs, and exploding gradients.
- Verify that loss decreases on a simple separable or synthetic dataset before diagnosing complex data.

## Evaluation and Data Guardrails

- Choose a metric that matches the task and error costs.
- Keep train, validation, and test responsibilities distinct.
- Fit preprocessing only on training data, then apply it to validation and test data.
- Check for target leakage, duplicate records across splits, and temporal leakage.
- Compare against a simple baseline before claiming improvement.
- Use a fixed seed when a result must be reproducible.
- Inspect errors and calibration; do not rely on a single aggregate metric.

## Review Checklist

For each implementation or experiment, examine:

1. API contract and shape assumptions.
2. Forward-pass correctness.
3. Loss definition and label encoding.
4. Gradient/update correctness.
5. Vectorization and computational complexity.
6. Numerical stability.
7. Training-loop state and convergence.
8. Evaluation protocol and metric choice.
9. Reproducibility and tests.
10. Clear limitations and next experiments.

## Repository Alignment

- Place from-scratch ML implementations under `src/ml/`.
- Follow the project's NumPy-first style and scikit-learn-compatible API conventions.
- Use a small `if __name__ == "__main__":` smoke test when it helps demonstrate behavior.
- Apply existing formatting, linting, and test conventions before considering an implementation complete.
- Add ML notes only when they provide reusable conceptual value beyond a single implementation.

## Mastery Check

A learner has demonstrated working mastery of a topic when they can:

- Explain the input/output contract, objective, and update rule.
- Annotate important tensor or array shapes.
- Implement and validate a minimal version without copying a template.
- Identify numerical and data-quality risks.
- Choose an appropriate metric and evaluation protocol.
- Explain the model's limitations and a meaningful next improvement.
