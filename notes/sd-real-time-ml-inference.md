---
title: Real-Time ML Inference Platform
description: Design a low-latency prediction service with versioned models, online features, safe rollouts, and observable feedback loops.
category: System Design
order: 1
status: stable
tags:
  - ml-systems
  - inference
  - model-serving
  - latency
---

# Real-Time ML Inference Platform

A real-time inference platform receives a prediction request, enriches it with the features required by a model, executes the model within a latency budget, and records enough information to operate and improve the system later.

The challenge is not only returning a score. The online path must stay reliable while model versions, features, traffic, cost, and quality evolve.

## Product Goal and Success Metrics

Assume a product needs a prediction during an interactive user request, such as ranking content, detecting fraud, or choosing a recommendation.

A useful starting contract is:

- Return a prediction for each valid request.
- Keep p99 end-to-end latency below an agreed budget, for example 100 ms.
- Support versioned model rollout and fast rollback.
- Log predictions and eventual feedback without blocking the request path.
- Preserve availability with a safe fallback when the model path is unavailable.

Track both operational and model outcomes:

- Request volume, error rate, and p50/p95/p99 latency.
- Feature-fetch, preprocessing, and model-execution latency separately.
- Batch size, accelerator utilization, and cost per prediction.
- Prediction distribution, confidence, and fallback rate.
- Delayed quality metrics such as conversion, precision, recall, or calibration.

## Requirements and Assumptions

### Functional Requirements

- Clients submit a prediction request with an entity or request context.
- The platform resolves the model version assigned to that traffic.
- It fetches or computes required features and returns a prediction.
- Operators can register a new model, route a small traffic slice to it, and roll it back.
- The platform records prediction context for monitoring, evaluation, and feedback joins.

### Non-Functional Requirements

- Low tail latency matters more than average latency for interactive products.
- A temporary model-serving or feature-store failure should not take down the caller.
- Training and serving must use compatible feature definitions.
- The system must protect sensitive request data and model artifacts.
- Capacity should scale with traffic while controlling CPU, GPU, and memory cost.

## High-Level Architecture

```text
Client
  │
  ▼
Inference API ──► Request validation and authentication
  │
  ├──► Model router ──► Model registry and rollout policy
  ├──► Feature resolver ──► Online feature store / cache
  ├──► Preprocessing ──► Model server pool
  │                              │
  └──► Prediction response ◄─────┘
  │
  └──► Asynchronous event log ──► Monitoring, evaluation, and feedback joins
```

The synchronous path should contain only work required to return a prediction. Logging, analytics, label joining, and most monitoring aggregation should happen asynchronously.

## Request Flow

1. Validate the caller, request schema, and required entity identifiers.
2. Select a model version using a stable routing key, rollout policy, and model metadata.
3. Fetch precomputed online features and derive request-time features.
4. Apply the transformations expected by the selected model.
5. Execute the model and receive a prediction, score, or ranking.
6. Apply business policy, such as thresholding, filtering, or fallback selection.
7. Return the response while asynchronously recording model version, feature version, latency, and prediction metadata.

## Data and Feature Consistency

Training-serving skew occurs when the model sees different feature definitions offline and online. Treat feature definitions as versioned contracts:

- Define transformations once and reuse or validate them in both pipelines.
- Store feature timestamps and freshness expectations.
- Make missing-value defaults explicit and test them.
- Log the feature schema and model version used for every prediction.
- Compare offline feature distributions with online observations.

An online feature store is useful when features must be retrieved quickly by entity key. Simple request-only features can be computed directly, while expensive or shared features are often precomputed offline.

## Model Registry and Rollouts

A model registry should store immutable artifacts and metadata:

- model identifier and version;
- training-data or feature-schema version;
- evaluation results and approval state;
- runtime requirements;
- owner, creation time, and rollback target.

Do not replace a live artifact in place. Route traffic to versions explicitly:

1. Validate a candidate offline and in staging.
2. Shadow it on production requests without affecting responses when feasible.
3. Send a small, stable percentage of traffic to the candidate.
4. Compare latency, error rate, prediction distributions, and delayed quality metrics.
5. Increase traffic only while guardrail metrics remain healthy.
6. Roll back by changing routing, not by overwriting artifacts.

## Latency, Throughput, and Cost

A latency budget is divided among request validation, feature fetch, preprocessing, model execution, and response serialization. Optimize the largest contributor first.

### Batching

Batching improves accelerator utilization and throughput, but waiting for a batch increases latency.

- **Static batching** is predictable but can waste capacity during variable traffic.
- **Dynamic batching** collects requests for a short bounded window or until a batch-size limit is reached.
- Set a maximum wait time so low traffic does not violate the tail-latency budget.
- Route models with incompatible shapes or runtime requirements separately.

### Hardware and Autoscaling

CPU inference can be sufficient for small or low-throughput models. GPUs often improve throughput for larger neural models but introduce cold-start, memory, and scheduling costs.

Autoscale on queue depth, concurrency, latency, and accelerator utilization—not only request count. Keep a small warm pool when strict latency targets make cold starts unacceptable.

## Reliability and Fallbacks

Make the prediction path degrade safely:

- Use timeouts and bounded retries for feature and model calls.
- Serve a cached prediction, heuristic, default ranking, or rules-based decision when the model is unavailable.
- Avoid silently substituting stale features when correctness or safety depends on freshness.
- Isolate models so one overloaded or malformed model cannot exhaust shared serving capacity.
- Use request correlation IDs for retries and debugging.

The fallback should be a deliberate product decision. Track its rate and outcome so it does not become an invisible permanent path.

## Observability and Monitoring

Monitor operational health and model behavior separately.

### Operational Signals

- API error rate and per-stage latency.
- Model-server saturation, queue depth, memory, and accelerator utilization.
- Feature-store availability, cache hit rate, and feature freshness.
- Model-load failures, cold starts, and fallback rate.

### Model Signals

- Prediction score and class distributions by model version.
- Feature drift and missing-feature rates.
- Delayed quality metrics once labels arrive.
- Calibration, fairness, and slice-level performance where relevant.
- Differences between candidate and control versions during rollout.

A prediction event should include a request identifier, timestamps, routing decision, model and feature versions, latency breakdown, result metadata, and privacy-safe join keys for later feedback.

## Security and Safety

- Authenticate callers and authorize model access by tenant or product.
- Minimize logged raw data; apply retention and redaction policies.
- Validate feature ranges and request payload sizes to prevent abuse.
- Scan and approve model artifacts before deployment.
- Define policy checks for unsafe outputs, especially for generative or high-impact decisions.

## Follow-Up Questions

- How would the design change for asynchronous batch inference?
- Which features belong in an online feature store versus request-time computation?
- How would you detect and respond to model drift before labels arrive?
- How do you balance stronger models against a fixed p99 latency budget?
- What experiment design prevents a model rollout from misleading product conclusions?
- How would you serve an LLM or retrieval-augmented system using the same platform principles?

## Related Practice

- [ML engineering hub](../../machine-learning/)
- [Logistic Regression from Scratch](../ml-logistic-regression/)
- [System-design hub](../../system-design/)
