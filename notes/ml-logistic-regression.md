---
title: Logistic Regression from Scratch
description: Build a binary classifier with a vectorized forward pass, binary cross-entropy, and gradient descent.
category: Machine Learning
order: 10
status: stable
tags:
  - machine-learning
  - classification
  - optimization
  - numpy
---

# Logistic Regression from Scratch

Logistic regression turns a linear score into the probability that an example belongs to the positive class. It is a small model with a complete machine-learning loop: define an objective, compute predictions, derive gradients, update parameters, and validate the result.

## Intuition

For each example, start with a weighted sum of features:

$$
z = Xw + b
$$

where $X$ contains examples by rows, $w$ is one weight per feature, and $b$ is a scalar bias. The sigmoid function maps each score to a probability between zero and one:

$$
\sigma(z) = \frac{1}{1 + e^{-z}}
$$

A positive score produces a probability above $0.5$; a negative score produces one below $0.5$. The model classifies an example by comparing that probability with a configurable threshold.

## Baseline and Improvement

A loop that computes one score and one gradient contribution per example is useful for understanding the model, but NumPy can express the same work for an entire batch.

For $n$ examples and $d$ features:

- `X` has shape `(n, d)`.
- `weights` has shape `(d,)`.
- `X @ weights` has shape `(n,)`.
- `bias` broadcasts over all $n$ scores.
- `y_hat` has shape `(n,)`.

The repository implementation uses this vectorized forward pass:

```python
z = X @ self.weights + self.bias
y_hat = self._sigmoid(z)
```

That keeps the code close to the mathematical definition while avoiding unnecessary Python loops over examples.

## Objective and Gradients

For binary labels $y \in \{0, 1\}$ and predicted probabilities $\hat{y}$, binary cross-entropy penalizes confident incorrect predictions:

$$
L = -\frac{1}{n} \sum_{i=1}^{n}
\left(y_i \log(\hat{y}_i) + (1-y_i)\log(1-\hat{y}_i)\right)
$$

The gradient of this objective with respect to the weights and bias is:

$$
dw = \frac{1}{n} X^T(\hat{y} - y)
$$

$$
db = \frac{1}{n} \sum_{i=1}^{n}(\hat{y}_i - y_i)
$$

The update rule moves parameters in the direction that reduces loss:

```python
self.weights -= self.learning_rate * dw
self.bias -= self.learning_rate * db
```

## Invariant and Correctness

Each gradient-descent iteration maintains a consistent parameter state: `weights` has one value per input feature and `bias` remains scalar. The forward pass produces exactly one predicted probability per training example, so the residual vector `y_hat - y` also has shape `(n,)`.

Multiplying `X.T` with that residual sums each feature's contribution to the current error. A positive gradient means increasing that parameter would increase loss locally, so subtracting the gradient moves the parameter toward lower loss for a sufficiently small learning rate.

## Numerical Stability

Directly evaluating `np.exp(-z)` can overflow when the magnitude of `z` is large. The implementation clips logits before applying sigmoid:

```python
z = np.clip(z, -250, 250)
return 1 / (1 + np.exp(-z))
```

If you explicitly compute binary cross-entropy, also clip probabilities away from exactly zero and one before taking logarithms. For more advanced models, use stable log-sum-exp formulations rather than relying on clipping alone.

## Complexity

Each training iteration performs matrix-vector products involving $n$ examples and $d$ features:

- Time: $O(nd)$ per iteration.
- Extra working space: $O(n)$ for scores, probabilities, and residuals, excluding the input matrix.

With `num_iterations` iterations, total training time is $O(\text{num_iterations} \cdot n d)$.

## Implementation Notes

The local [`LogisticRegression`](https://github.com/whanyu1212/mental-gym/blob/main/src/ml/logistic_regression.py) class follows a familiar estimator interface:

- `fit(X, y)` initializes parameters and runs gradient descent.
- `predict_proba(X)` returns one probability per example.
- `predict(X, threshold=0.5)` returns hard binary labels.

Its smoke test creates a synthetic classification dataset, uses a deterministic train/test split, trains the model, and reports test accuracy. That is a useful first validation, but it should not replace checking loss behavior, data leakage, class balance, calibration, and metrics appropriate to the problem.

## Edge Cases and Pitfalls

- Ensure labels are encoded as zero and one before using the binary objective.
- Verify that `X` is two-dimensional and that its feature count matches `weights`.
- Keep `y` aligned with the first dimension of `X`; accidental broadcasting can hide shape mistakes.
- Feature scaling often makes gradient descent converge more reliably.
- Accuracy alone can be misleading for imbalanced classes; examine precision, recall, F1, or calibration when relevant.
- The default $0.5$ threshold is a decision rule, not a universal optimum.

## Related Practice

- [Logistic Regression from Scratch prompt](../../machine-learning/logistic-regression-from-scratch/)
- [Repository implementation](https://github.com/whanyu1212/mental-gym/blob/main/src/ml/logistic_regression.py)
- [ML engineering hub](../../machine-learning/)
