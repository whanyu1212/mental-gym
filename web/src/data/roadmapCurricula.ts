import type {
	ExerciseReference,
	RoadmapModule,
	RoadmapPhase,
	TrackId,
	WeeklyHours,
} from "./roadmap.ts";

type ModuleSeed = {
	key: string;
	title: string;
	summary: string;
	courseId: string;
	selection: string;
	exercises: ExerciseReference[];
	deliverable: string;
	evidence: string;
	stretch: string;
};

const ml = (slug: string, label: string): ExerciseReference => ({ domain: "ml", slug, label });
const note = (slug: string, label: string): ExerciseReference => ({ domain: "note", slug, label });
const sql = (slug: string, label: string): ExerciseReference => ({ domain: "sql", slug, label });
const algorithm = (slug: string, label: string): ExerciseReference => ({ domain: "algorithm", slug, label });
const systemDesign = (slug: string, label: string): ExerciseReference => ({
	domain: "system-design",
	slug,
	label,
});

function hoursFor(trackId: TrackId, phase: RoadmapPhase): WeeklyHours {
	if (phase === "capstone") return { study: 3, implementation: 9, interview: 3, language: 0 };
	const language = trackId === "applied-ai" || trackId === "ai-product" ? 2 : 0;
	return { study: 5, implementation: 7 - language, interview: 3, language };
}

function buildTrackModules(trackId: TrackId, seeds: ModuleSeed[]): RoadmapModule[] {
	return seeds.map((seed, index) => {
		const week = index + 9;
		const phase: RoadmapPhase = week <= 20 ? "specialization" : "capstone";
		const id = `${trackId}-${String(week).padStart(2, "0")}-${seed.key}`;
		const previousId =
			index === 0
				? "foundation-08-systems-baseline"
				: `${trackId}-${String(week - 1).padStart(2, "0")}-${seeds[index - 1].key}`;

		return {
			id,
			phase,
			title: seed.title,
			summary: seed.summary,
			prerequisiteIds: [previousId],
			resources: [{ courseId: seed.courseId, selection: seed.selection }],
			exercises: seed.exercises,
			hours: hoursFor(trackId, phase),
			deliverable: seed.deliverable,
			evidence: [
				seed.evidence,
				"Reproducible command and versioned source",
				"Short reflection naming one failure, correction, or trade-off",
			],
			stretch: [seed.stretch],
		};
	});
}

const appliedAI: ModuleSeed[] = [
	{
		key: "retrieval-foundations",
		title: "Retrieval foundations",
		summary: "Build a small corpus pipeline and understand the index and query contracts beneath retrieval-augmented generation.",
		courseId: "stanford-cs276-2019",
		selection: "Inverted indices, tokenization, Boolean retrieval, and index construction.",
		exercises: [
			ml("095-build-an-inverted-index", "Build an Inverted Index"),
			ml("096-boolean-and-search", "Boolean AND Search"),
		],
		deliverable: "Index a small document collection and expose deterministic Boolean search with source identifiers.",
		evidence: "Retrieval tests covering missing terms, duplicates, and stable ordering",
		stretch: "Add phrase-query support without changing the document ID contract.",
	},
	{
		key: "sparse-representations",
		title: "Sparse text representations",
		summary: "Connect token counts to sparse document representations before introducing embeddings.",
		courseId: "stanford-cs276-2019",
		selection: "Term weighting and vector-space retrieval.",
		exercises: [
			ml("081-term-frequency", "Term Frequency"),
			ml("082-inverse-document-frequency", "Inverse Document Frequency"),
		],
		deliverable: "Create a TF-IDF document matrix and explain how corpus changes alter its values.",
		evidence: "A hand-checked corpus with expected term and inverse-document frequencies",
		stretch: "Compare sublinear term frequency with raw counts on the same corpus.",
	},
	{
		key: "lexical-ranking",
		title: "Lexical ranking",
		summary: "Implement interpretable ranking baselines that remain useful beside neural retrieval.",
		courseId: "stanford-cs276-2019",
		selection: "BM25, probabilistic retrieval, and efficient scoring.",
		exercises: [
			ml("098-bm25-term-score", "BM25 Term Score"),
			ml("097-rank-by-dot-product", "Rank by Dot Product"),
		],
		deliverable: "Rank documents with BM25 and a dot-product baseline, then compare their top-five results.",
		evidence: "Golden ranking fixtures with deterministic tie handling",
		stretch: "Add field weights for title and body text.",
	},
	{
		key: "embedding-retrieval",
		title: "Embedding retrieval",
		summary: "Build a dense retrieval baseline and make normalization and similarity choices explicit.",
		courseId: "stanford-cs224n-2024",
		selection: "Distributed word representations and contextual representations.",
		exercises: [
			ml("018-pairwise-cosine-similarity", "Pairwise Cosine Similarity"),
			ml("004-cosine-similarity", "Cosine Similarity"),
		],
		deliverable: "Implement normalized embedding search and compare its misses with the lexical baseline.",
		evidence: "Retrieval examples showing one semantic win and one lexical regression",
		stretch: "Combine lexical and dense scores with a documented fixed weight.",
	},
	{
		key: "retrieval-evaluation",
		title: "Retrieval evaluation",
		summary: "Use query-level judgments and ranked metrics rather than evaluating a retriever by anecdotes.",
		courseId: "stanford-cs276-2019",
		selection: "Evaluation methods, relevance judgments, and ranking metrics.",
		exercises: [
			ml("019-precision-at-k", "Precision at K"),
			ml("020-mean-reciprocal-rank", "Mean Reciprocal Rank"),
		],
		deliverable: "Create a versioned evaluation set and report Precision@k and MRR for two retrieval baselines.",
		evidence: "Per-query results, aggregate metrics, and documented relevance assumptions",
		stretch: "Add bootstrap confidence intervals for the metric difference.",
	},
	{
		key: "ranking-quality",
		title: "Graded relevance and ranking quality",
		summary: "Measure ranked results when useful documents have different levels of relevance.",
		courseId: "stanford-cs276-2019",
		selection: "Average precision, discounted cumulative gain, and learning-to-rank context.",
		exercises: [
			ml("099-average-precision", "Average Precision"),
			ml("101-normalized-dcg", "Normalized DCG"),
		],
		deliverable: "Add graded judgments and compare AP with NDCG on a failure-focused query set.",
		evidence: "Metric tests and a written explanation of where the metrics disagree",
		stretch: "Test sensitivity to alternative relevance grades.",
	},
	{
		key: "rag-pipeline",
		title: "Grounded generation pipeline",
		summary: "Compose retrieval, context selection, prompting, and citation output with inspectable boundaries.",
		courseId: "stanford-cs224v-2025",
		selection: "RAG without hallucination and question answering over long documents.",
		exercises: [
			ml("027-single-head-attention", "Single-Head Attention"),
			ml("025-masked-softmax", "Masked Softmax"),
		],
		deliverable: "Build a local RAG path that returns an answer, cited chunks, and an explicit no-answer result.",
		evidence: "Regression cases for supported, unsupported, and conflicting evidence",
		stretch: "Add a second-stage reranker and measure the change rather than assuming improvement.",
	},
	{
		key: "tool-using-agents",
		title: "Tool-using agents",
		summary: "Treat tools as typed capabilities with validation, error paths, and bounded control flow.",
		courseId: "stanford-cs224v-2025",
		selection: "Non-hallucinating task agents and reliable computational workflows.",
		exercises: [
			ml("094-append-to-a-kv-cache", "Append to a KV Cache"),
			ml("005-greedy-decoding", "Greedy Decoding"),
		],
		deliverable: "Implement a two-tool agent loop with schema validation, a step limit, and surfaced tool errors.",
		evidence: "Recorded traces for success, invalid arguments, tool failure, and loop termination",
		stretch: "Add an idempotency key to one state-changing tool.",
	},
	{
		key: "generation-controls",
		title: "Generation controls",
		summary: "Understand how decoding choices change diversity, determinism, latency, and evaluation repeatability.",
		courseId: "stanford-cs224n-2024",
		selection: "Language-model decoding and generation behavior.",
		exercises: [
			ml("029-top-k-sampling-distribution", "Top-K Sampling Distribution"),
			ml("091-top-p-distribution", "Top-P Distribution"),
		],
		deliverable: "Implement deterministic seeded top-k and top-p sampling and document safe product defaults.",
		evidence: "Distribution checks and repeated seeded generation examples",
		stretch: "Measure output diversity across a small temperature sweep.",
	},
	{
		key: "agent-evaluation",
		title: "Agent evaluation",
		summary: "Evaluate task completion, grounding, tool behavior, and regressions separately.",
		courseId: "stanford-cs329s-2022",
		selection: "Model evaluation, business metrics, monitoring, and iterative ML system development.",
		exercises: [
			ml("093-sequence-log-probability", "Sequence Log Probability"),
			ml("087-bleu-1-score", "BLEU-1 Score"),
		],
		deliverable: "Create an agent evaluation harness with task, citation, tool-call, latency, and cost fields.",
		evidence: "Versioned cases and a baseline report with per-dimension failures",
		stretch: "Add pairwise human preference collection without collapsing it into one opaque score.",
	},
	{
		key: "safety-and-privacy",
		title: "Safety, fairness, and privacy",
		summary: "Define trust boundaries and evaluate disparate behavior before an agent reaches production data.",
		courseId: "stanford-cs329s-2022",
		selection: "Privacy, fairness, security, and stakeholder objectives in ML systems.",
		exercises: [
			ml("154-demographic-parity-gap", "Demographic Parity Gap"),
			ml("156-equal-opportunity-gap", "Equal Opportunity Gap"),
		],
		deliverable: "Write and test an agent threat model covering prompt injection, data leakage, and unsafe tool actions.",
		evidence: "Adversarial test cases plus documented residual risks and mitigations",
		stretch: "Add redaction at one external-data trust boundary.",
	},
	{
		key: "reliability-and-cost",
		title: "Reliability and cost controls",
		summary: "Bound retries, context growth, latency, and spend while preserving useful failure information.",
		courseId: "stanford-cs329s-2022",
		selection: "Deployment, monitoring, scaling, and maintaining real-world ML systems.",
		exercises: [
			ml("161-l2-gradient-clipping", "L2 Gradient Clipping"),
			ml("163-k-anonymity-group-size", "K-Anonymity Group Size"),
		],
		deliverable: "Add timeout, retry, fallback, token, and cost budgets to the agent workflow.",
		evidence: "Fault-injection runs with latency and cost summaries",
		stretch: "Implement a quality-aware fallback between two local or mocked model tiers.",
	},
	{
		key: "capstone-scope",
		title: "Capstone scope and baseline",
		summary: "Choose one user need, define a measurable baseline, and constrain the system before building.",
		courseId: "stanford-cs224v-2025",
		selection: "Project-oriented assistant design and domain selection.",
		exercises: [
			note("recommendation-system/online-experiment-lifecycle", "Online Experiment Lifecycle"),
			systemDesign("sd-real-time-ml-inference", "Real-Time ML Inference Platform"),
		],
		deliverable: "Publish a capstone brief with user need, baseline, architecture, evaluation set, budget, and non-goals.",
		evidence: "Reviewed project brief and reproducible baseline measurement",
		stretch: "Interview one target user and revise only evidence-backed assumptions.",
	},
	{
		key: "capstone-build",
		title: "Capstone vertical slice",
		summary: "Build the thinnest end-to-end path that can generate trustworthy evidence.",
		courseId: "stanford-cs224v-2025",
		selection: "Hands-on assistant implementation with tools and retrieval.",
		exercises: [
			sql("latest-event-per-device", "Latest Event Per Device"),
			algorithm("705-design-hashset", "Design HashSet"),
		],
		deliverable: "Ship one end-to-end workflow with retrieval, a tool boundary, citations, and telemetry.",
		evidence: "Runnable demo linked to a commit and an end-to-end smoke test",
		stretch: "Add one alternate provider behind the same validated boundary.",
	},
	{
		key: "capstone-evaluate",
		title: "Capstone evaluation and hardening",
		summary: "Turn observed failures into targeted fixes without hiding regressions in aggregate scores.",
		courseId: "stanford-cs329s-2022",
		selection: "Monitoring, deployment changes, and iterative system improvement.",
		exercises: [
			note("recommendation-system/metrics", "Recommendation Metrics"),
			note("recommendation-system/ab-testing", "A/B Testing"),
		],
		deliverable: "Run the frozen evaluation set, fix the highest-impact failure, and publish before-and-after results.",
		evidence: "Versioned evaluation report with latency, quality, cost, and failure slices",
		stretch: "Run a small blinded preference comparison.",
	},
	{
		key: "capstone-interview",
		title: "Capstone narrative and interviews",
		summary: "Explain the system as evidence: constraints, alternatives, failures, decisions, and measurable outcomes.",
		courseId: "stanford-cs329s-2022",
		selection: "Stakeholders, system trade-offs, team communication, and project presentation.",
		exercises: [
			systemDesign("sd-real-time-ml-inference", "Inference System Design Review"),
			algorithm("239-sliding-window-maximum", "Sliding Window Maximum"),
		],
		deliverable: "Record a ten-minute capstone walkthrough and complete one timed coding and one system-design mock.",
		evidence: "Video or notes, rubric scores, and a prioritized weakness list",
		stretch: "Repeat only the weakest rubric dimension after a two-day delay.",
	},
];

const mlInfrastructure: ModuleSeed[] = [
	{
		key: "data-observability",
		title: "Data pipelines and rolling signals",
		summary: "Build incremental data summaries with explicit windows, freshness, and late-data behavior.",
		courseId: "stanford-cs329s-2022",
		selection: "Data management, data engineering, and production data quality.",
		exercises: [
			ml("151-rolling-window-means", "Rolling Window Means"),
			ml("152-exponential-moving-average", "Exponential Moving Average"),
		],
		deliverable: "Implement a batch feature pipeline with freshness and schema checks.",
		evidence: "Fixture-based checks for missing, late, duplicated, and reordered records",
		stretch: "Add an incremental recomputation path for one feature.",
	},
	{
		key: "training-state",
		title: "Training state and normalization",
		summary: "Understand stateful training operations and the differences between training and evaluation paths.",
		courseId: "stanford-cs230-2018",
		selection: "Optimization, regularization, normalization, and practical training workflows.",
		exercises: [
			ml("073-batch-normalization", "Batch Normalization"),
			ml("072-inverted-dropout", "Inverted Dropout"),
		],
		deliverable: "Add deterministic train/eval behavior to a minimal model and persist the required state.",
		evidence: "Mode-specific tests and a serialized checkpoint round trip",
		stretch: "Compare batch and layer-style normalization on tiny batches.",
	},
	{
		key: "stable-training",
		title: "Stable loss and gradients",
		summary: "Detect and contain numerical failures before they corrupt a long-running training job.",
		courseId: "stanford-cs336-2024",
		selection: "PyTorch, resource accounting, and implementation-heavy language-model basics.",
		exercises: [
			ml("077-cross-entropy-from-logits", "Cross-Entropy from Logits"),
			ml("161-l2-gradient-clipping", "L2 Gradient Clipping"),
		],
		deliverable: "Instrument a toy training loop for non-finite loss, gradient norm, and failed batches.",
		evidence: "A fault-injection test proving the run stops or recovers safely",
		stretch: "Add automatic mixed precision with an explicit CPU fallback.",
	},
	{
		key: "optimizer-state",
		title: "Optimizer state",
		summary: "Trace optimizer memory, updates, and checkpoint requirements instead of treating optimization as a black box.",
		courseId: "stanford-cs336-2024",
		selection: "Architectures, hyperparameters, and training implementation.",
		exercises: [
			ml("248-momentum-optimizer-step", "Momentum Optimizer Step"),
			ml("249-adam-optimizer-step", "Adam Optimizer Step"),
		],
		deliverable: "Implement momentum and Adam updates and resume both from serialized optimizer state.",
		evidence: "Update-by-update numerical checks and resumed-run equivalence",
		stretch: "Report optimizer-state memory as model size scales.",
	},
	{
		key: "schedules-and-restarts",
		title: "Schedules, checkpoints, and restarts",
		summary: "Make training interruption a planned state transition rather than a data-loss event.",
		courseId: "stanford-cs336-2024",
		selection: "Scaling laws, training budgets, and resource-aware experimentation.",
		exercises: [
			ml("250-cosine-learning-rate-schedule", "Cosine Learning-Rate Schedule"),
			ml("247-quadratic-gradient-descent-path", "Quadratic Gradient Descent Path"),
		],
		deliverable: "Resume an interrupted run with model, optimizer, scheduler, data position, and random state intact.",
		evidence: "Continuous-versus-resumed parameter comparison",
		stretch: "Add checkpoint retention under a fixed storage budget.",
	},
	{
		key: "inference-memory",
		title: "Inference memory and caching",
		summary: "Account for parameter, activation, and KV-cache memory when sizing an inference service.",
		courseId: "stanford-cs229s-2024",
		selection: "Transformer inference, KV caching, and performance arithmetic.",
		exercises: [
			ml("094-append-to-a-kv-cache", "Append to a KV Cache"),
			ml("089-rms-normalization", "RMS Normalization"),
		],
		deliverable: "Implement a toy KV cache and calculate memory growth by batch, sequence, head, and dtype.",
		evidence: "Shape tests and a capacity worksheet checked against measured allocations",
		stretch: "Add a bounded eviction policy for multi-turn requests.",
	},
	{
		key: "attention-layout",
		title: "Attention layout and batching",
		summary: "Make tensor layout, head partitioning, padding, and batching decisions visible.",
		courseId: "stanford-cs229s-2024",
		selection: "Transformer architecture and efficient inference.",
		exercises: [
			ml("090-split-attention-heads", "Split Attention Heads"),
			ml("027-single-head-attention", "Single-Head Attention"),
		],
		deliverable: "Build a batched attention benchmark that reports shapes, memory, and throughput.",
		evidence: "Correctness comparison against an unbatched baseline",
		stretch: "Compare two tensor layouts and explain the observed difference.",
	},
	{
		key: "masked-batching",
		title: "Masked and variable-length batches",
		summary: "Handle padding and causal masking without silently changing attention probabilities.",
		courseId: "stanford-cs229s-2024",
		selection: "Efficient Transformer training and inference.",
		exercises: [
			ml("011-scaled-attention-weights", "Scaled Attention Weights"),
			ml("025-masked-softmax", "Masked Softmax"),
		],
		deliverable: "Implement variable-length batching with padding and causal masks plus invariance tests.",
		evidence: "Single-example versus padded-batch output equivalence",
		stretch: "Bucket requests by length and measure padding waste.",
	},
	{
		key: "service-monitoring",
		title: "Service-level monitoring",
		summary: "Connect operational signals to user-visible model behavior and alert only on actionable states.",
		courseId: "stanford-cs329s-2022",
		selection: "Monitoring, deployment, data distributions, and changing requirements.",
		exercises: [
			ml("228-rolling-z-score-anomalies", "Rolling Z-Score Anomalies"),
			ml("230-forecast-interval-coverage", "Forecast Interval Coverage"),
		],
		deliverable: "Define and emit latency, error, saturation, quality-proxy, and freshness metrics.",
		evidence: "Synthetic incident timeline showing the expected alerts and non-alerts",
		stretch: "Add burn-rate alerts for one availability objective.",
	},
	{
		key: "drift-and-debugging",
		title: "Drift and model debugging",
		summary: "Separate data drift, model regressions, and pipeline breakage using inspectable diagnostics.",
		courseId: "stanford-cs329s-2022",
		selection: "Continual monitoring, feature engineering, and model maintenance.",
		exercises: [
			ml("123-absolute-anomaly-z-scores", "Absolute Anomaly Z-Scores"),
			ml("159-permutation-importance-drops", "Permutation Importance Drops"),
		],
		deliverable: "Create a drift report with one distribution check, one quality slice, and one pipeline invariant.",
		evidence: "Known-change fixtures that distinguish three failure classes",
		stretch: "Add a shadow comparison between two model versions.",
	},
	{
		key: "distributed-graphs",
		title: "Dependency and communication graphs",
		summary: "Reason about distributed work as a graph of dependencies, communication, and failure domains.",
		courseId: "stanford-cs229s-2024",
		selection: "Multi-node platforms, parallelism, and network properties.",
		exercises: [
			ml("166-graph-bfs-distances", "Graph BFS Distances"),
			ml("168-symmetric-normalized-adjacency", "Symmetric Normalized Adjacency"),
		],
		deliverable: "Model a training or serving topology and identify its critical path and single points of failure.",
		evidence: "Topology diagram plus failure-propagation examples",
		stretch: "Estimate communication volume for data and tensor parallel variants.",
	},
	{
		key: "kernel-performance",
		title: "Kernel and memory performance",
		summary: "Measure arithmetic work, data movement, and implementation overhead before optimizing kernels.",
		courseId: "stanford-cs336-2024",
		selection: "GPUs, kernels, Triton, and memory hierarchy.",
		exercises: [
			ml("197-valid-2d-convolution", "Valid 2D Convolution"),
			ml("215-same-padded-2d-convolution", "Same-Padded 2D Convolution"),
		],
		deliverable: "Benchmark a simple numerical kernel and explain whether it is compute- or memory-bound.",
		evidence: "Correctness oracle, timing protocol, and arithmetic-intensity estimate",
		stretch: "Implement one optimized GPU version only if suitable hardware is available.",
	},
	{
		key: "capstone-slo",
		title: "Platform capstone and SLOs",
		summary: "Scope a platform improvement around a measured bottleneck and a user-facing service objective.",
		courseId: "stanford-cs229s-2024",
		selection: "Systems-for-ML final project framing and performance goals.",
		exercises: [
			systemDesign("sd-real-time-ml-inference", "Real-Time ML Inference Platform"),
			sql("latest-event-per-device", "Latest Event Per Device"),
		],
		deliverable: "Write a platform brief with workload, baseline, SLO, architecture, capacity, and cost assumptions.",
		evidence: "Reproducible baseline and reviewed measurement plan",
		stretch: "Capture one production-like trace from a synthetic workload.",
	},
	{
		key: "capstone-load",
		title: "Load and failure testing",
		summary: "Exercise the platform under realistic concurrency, overload, dependency failure, and restart scenarios.",
		courseId: "stanford-cs229s-2024",
		selection: "High-performance serving and scalable inference systems.",
		exercises: [
			algorithm("239-sliding-window-maximum", "Sliding Window Maximum"),
			sql("three-day-login-streak", "Three-Day Login Streak"),
		],
		deliverable: "Run a load test and implement bounded backpressure, timeout, and graceful-degradation behavior.",
		evidence: "Latency distributions, saturation point, and failure-recovery timeline",
		stretch: "Compare fixed and adaptive batching under the same workload.",
	},
	{
		key: "capstone-optimize",
		title: "Measured platform optimization",
		summary: "Optimize the dominant bottleneck while preserving correctness and rollback capability.",
		courseId: "stanford-cs336-2024",
		selection: "Resource accounting, systems optimization, and scaling.",
		exercises: [
			algorithm("347-top-k-frequent-elements", "Top K Frequent Elements"),
			note("sd-real-time-ml-inference", "Inference Platform Case Study"),
		],
		deliverable: "Ship one measured optimization with before-and-after throughput, latency, resource, and cost results.",
		evidence: "Benchmark report, regression tests, and rollback notes",
		stretch: "Validate the result on a second workload shape.",
	},
	{
		key: "capstone-interview",
		title: "Platform narrative and interviews",
		summary: "Defend capacity estimates, bottleneck choices, failure handling, and cost trade-offs under questioning.",
		courseId: "stanford-cs329s-2022",
		selection: "Deployable and scalable ML system design trade-offs.",
		exercises: [
			systemDesign("sd-real-time-ml-inference", "Inference System Design Review"),
			algorithm("155-min-stack", "Min Stack"),
		],
		deliverable: "Complete one platform design mock, one debugging mock, and a concise capstone walkthrough.",
		evidence: "Rubric scores, corrected estimates, and a prioritized weakness list",
		stretch: "Repeat the weakest scenario with a different workload after a delay.",
	},
];

const modelPostTraining: ModuleSeed[] = [
	{
		key: "tensor-foundations",
		title: "Tensor operations",
		summary: "Build fluency with the primitive operations that dominate model implementations.",
		courseId: "stanford-cs336-2024",
		selection: "Language-model implementation prerequisites and numerical programming.",
		exercises: [
			ml("012-vector-addition", "Vector Addition"),
			ml("013-dot-product", "Dot Product"),
		],
		deliverable: "Implement and test core vector operations with explicit shape and dtype contracts.",
		evidence: "Property checks against NumPy and documented invalid inputs",
		stretch: "Add a tiny timing comparison for vectorized and scalar implementations.",
	},
	{
		key: "linear-maps",
		title: "Linear maps and matrix multiplication",
		summary: "Trace batches and features through matrix operations before composing a network.",
		courseId: "stanford-cs336-2024",
		selection: "Transformer construction and implementation from first principles.",
		exercises: [
			ml("037-matrix-vector-multiplication", "Matrix–Vector Multiplication"),
			ml("038-matrix-multiplication", "Matrix Multiplication"),
		],
		deliverable: "Implement matrix multiplication and explain every dimension in a batched linear layer.",
		evidence: "Shape table and numerical comparison across rectangular inputs",
		stretch: "Implement a blocked CPU version and measure only after correctness.",
	},
	{
		key: "backpropagation",
		title: "Layers and backpropagation",
		summary: "Derive and test local gradients before relying on automatic differentiation.",
		courseId: "stanford-cs230-2018",
		selection: "Neural-network foundations and backpropagation.",
		exercises: [
			ml("067-dense-layer-forward-pass", "Dense Layer Forward Pass"),
			ml("070-chain-rule-gradients", "Chain Rule Gradients"),
		],
		deliverable: "Implement a dense layer forward and backward pass and verify it by finite differences.",
		evidence: "Gradient-check report across multiple seeds and tolerances",
		stretch: "Add a custom automatic-differentiation primitive.",
	},
	{
		key: "stable-objectives",
		title: "Stable objectives",
		summary: "Implement probability objectives without overflow, underflow, or undefined edge behavior.",
		courseId: "stanford-cs336-2024",
		selection: "Model implementation, numerical stability, and training basics.",
		exercises: [
			ml("077-cross-entropy-from-logits", "Cross-Entropy from Logits"),
			ml("002-softmax", "Softmax"),
		],
		deliverable: "Implement stable softmax and cross-entropy from logits with extreme-value tests.",
		evidence: "Reference comparisons and finite outputs for adversarial logits",
		stretch: "Derive and test label-smoothed cross-entropy.",
	},
	{
		key: "transformer-blocks",
		title: "Transformer block internals",
		summary: "Connect position information, normalization, and residual computation into a coherent block.",
		courseId: "stanford-cs336-2024",
		selection: "Architectures, hyperparameters, and Transformer details.",
		exercises: [
			ml("088-sinusoidal-position-encoding", "Sinusoidal Position Encoding"),
			ml("089-rms-normalization", "RMS Normalization"),
		],
		deliverable: "Implement positional encoding and RMS normalization inside a minimal pre-normalized block.",
		evidence: "Shape, scale-invariance, and deterministic-output checks",
		stretch: "Compare learned and sinusoidal positions on a toy sequence task.",
	},
	{
		key: "multi-head-attention",
		title: "Multi-head attention",
		summary: "Implement head partitioning and attention composition with explicit tensor layouts.",
		courseId: "stanford-cs224n-2024",
		selection: "Self-attention, Transformers, and contextual representations.",
		exercises: [
			ml("090-split-attention-heads", "Split Attention Heads"),
			ml("027-single-head-attention", "Single-Head Attention"),
		],
		deliverable: "Compose a tested multi-head attention layer from reshape, attention, and output projection steps.",
		evidence: "Shape invariants and comparison with a trusted framework primitive",
		stretch: "Add grouped-query attention and document the memory trade-off.",
	},
	{
		key: "masking-and-cache",
		title: "Causal masking and KV cache",
		summary: "Connect autoregressive correctness to masking and incremental decoding state.",
		courseId: "stanford-cs229s-2024",
		selection: "Transformer inference with KV caching.",
		exercises: [
			ml("025-masked-softmax", "Masked Softmax"),
			ml("094-append-to-a-kv-cache", "Append to a KV Cache"),
		],
		deliverable: "Implement causal attention with cached keys and values and compare it with full-prefix decoding.",
		evidence: "Token-by-token equivalence and cache-growth measurements",
		stretch: "Add a bounded cache policy for long contexts.",
	},
	{
		key: "language-model-evaluation",
		title: "Language-model likelihood and evaluation",
		summary: "Measure token likelihood and perplexity while documenting what they cannot establish about usefulness.",
		courseId: "stanford-cs336-2024",
		selection: "Language-model evaluation before deployment.",
		exercises: [
			ml("093-sequence-log-probability", "Sequence Log Probability"),
			ml("086-sequence-perplexity", "Sequence Perplexity"),
		],
		deliverable: "Evaluate a toy language model with sequence log probability, perplexity, and qualitative error slices.",
		evidence: "Hand-checked likelihood examples and a limitations section",
		stretch: "Compare per-token results across two small public models if compute permits.",
	},
	{
		key: "optimizer-dynamics",
		title: "Optimizer dynamics",
		summary: "Understand momentum and adaptive updates as stateful algorithms with measurable behavior.",
		courseId: "stanford-cs336-2024",
		selection: "Optimization and implementation-heavy model training.",
		exercises: [
			ml("248-momentum-optimizer-step", "Momentum Optimizer Step"),
			ml("249-adam-optimizer-step", "Adam Optimizer Step"),
		],
		deliverable: "Plot and explain momentum and Adam trajectories on two controlled objectives.",
		evidence: "Numerical update checks and trajectory comparison",
		stretch: "Add decoupled weight decay and distinguish it from L2 regularization.",
	},
	{
		key: "schedules-and-checks",
		title: "Learning-rate schedules and gradient checks",
		summary: "Use schedules intentionally and catch derivative errors before scaling training.",
		courseId: "stanford-cs336-2024",
		selection: "Training budgets, scaling laws, and reliable implementation.",
		exercises: [
			ml("250-cosine-learning-rate-schedule", "Cosine Learning-Rate Schedule"),
			ml("246-gradient-check-relative-errors", "Gradient Check Relative Errors"),
		],
		deliverable: "Add warmup plus cosine decay and a reusable relative-error gradient check.",
		evidence: "Schedule boundary tests and injected-gradient failure detection",
		stretch: "Compare two schedules under an identical small compute budget.",
	},
	{
		key: "preference-optimization",
		title: "Preference optimization",
		summary: "Connect preference data, policy objectives, and stability controls without treating alignment as one metric.",
		courseId: "stanford-cs336-2024",
		selection: "Alignment by supervised fine-tuning and human feedback.",
		exercises: [
			ml("132-reinforce-policy-loss", "REINFORCE Policy Loss"),
			ml("133-ppo-clipped-objective", "PPO Clipped Objective"),
		],
		deliverable: "Implement policy-loss primitives and document data, reward, and optimization failure modes.",
		evidence: "Objective tests plus a preference-data quality checklist",
		stretch: "Implement a direct pairwise preference loss on toy logits.",
	},
	{
		key: "generative-models",
		title: "Generative-model objectives",
		summary: "Compare latent-variable and guided generative objectives through small numerical implementations.",
		courseId: "stanford-cs230-2018",
		selection: "Generative models and representation learning.",
		exercises: [
			ml("134-vae-reparameterization", "VAE Reparameterization"),
			ml("140-classifier-free-guidance", "Classifier-Free Guidance"),
		],
		deliverable: "Implement two generative-model primitives and explain where stochasticity enters each path.",
		evidence: "Seeded numerical examples and distribution-shape checks",
		stretch: "Visualize a two-dimensional latent interpolation.",
	},
	{
		key: "capstone-baseline",
		title: "Model capstone baseline",
		summary: "Choose a bounded adaptation or training question and establish a reproducible small-model baseline.",
		courseId: "stanford-cs336-2024",
		selection: "From-scratch model development, data, training, and evaluation.",
		exercises: [
			note("ml-logistic-regression", "Reproducible Model Baseline"),
			algorithm("53-maximum-subarray", "Maximum Subarray"),
		],
		deliverable: "Publish a model card draft with data version, baseline, metric, compute budget, and known limitations.",
		evidence: "Seeded baseline run linked to code, config, and measured compute",
		stretch: "Add one deliberately weak baseline to calibrate progress.",
	},
	{
		key: "capstone-ablation",
		title: "Controlled training and ablation",
		summary: "Change one factor at a time and preserve failed runs as evidence rather than hiding them.",
		courseId: "stanford-cs336-2024",
		selection: "Scaling, data, and model experiments under explicit budgets.",
		exercises: [
			algorithm("912-sort-an-array", "Sort an Array"),
			note("recommendation-system/aa-testing", "A/A Testing"),
		],
		deliverable: "Run one controlled ablation with fixed data, seeds, evaluation, and a hard compute ceiling.",
		evidence: "Learning curves, configs, hardware, duration, and failed-run notes",
		stretch: "Repeat the highest-variance condition with one additional seed.",
	},
	{
		key: "capstone-evaluate",
		title: "Model evaluation and limitations",
		summary: "Evaluate quality, robustness, and subgroup behavior without presenting one score as proficiency.",
		courseId: "stanford-cs336-2024",
		selection: "Language-model evaluations and alignment assessment.",
		exercises: [
			note("recommendation-system/metrics", "Evaluation Metrics"),
			sql("monthly-paid-revenue", "Monthly Paid Revenue"),
		],
		deliverable: "Publish a versioned evaluation report with baselines, slices, confidence, and limitations.",
		evidence: "Per-example outputs, aggregate metrics, and reproducible evaluation command",
		stretch: "Add one adversarial or out-of-distribution slice.",
	},
	{
		key: "capstone-interview",
		title: "Model narrative and interviews",
		summary: "Defend objective, data, optimization, ablation, and evaluation choices with measured evidence.",
		courseId: "stanford-cs229s-2024",
		selection: "Efficient model training and inference trade-offs.",
		exercises: [
			systemDesign("sd-real-time-ml-inference", "Model Serving Design Review"),
			algorithm("150-evaluate-reverse-polish-notation", "Evaluate Reverse Polish Notation"),
		],
		deliverable: "Complete one ML coding mock, one model-design mock, and a ten-minute experiment walkthrough.",
		evidence: "Rubric scores, corrected weak answers, and a prioritized study list",
		stretch: "Repeat the weakest explanation without notes after a delay.",
	},
];

const aiProduct: ModuleSeed[] = [
	{
		key: "metric-baselines",
		title: "Product and model baselines",
		summary: "Separate product success, model quality, and operational health before choosing features.",
		courseId: "stanford-cs329s-2022",
		selection: "Stakeholders, objectives, business metrics, and ML design choices.",
		exercises: [
			ml("054-binary-confusion-matrix", "Binary Confusion Matrix"),
			ml("055-classification-accuracy", "Classification Accuracy"),
		],
		deliverable: "Write a metric tree connecting one user outcome to model and system indicators.",
		evidence: "Baseline values, metric owners, and documented counter-metrics",
		stretch: "Identify one metric that would create a harmful incentive if optimized alone.",
	},
	{
		key: "precision-recall",
		title: "Error costs and decision metrics",
		summary: "Translate false positives and false negatives into user and business costs.",
		courseId: "stanford-cs229-2022",
		selection: "Supervised learning evaluation and error analysis.",
		exercises: [
			ml("056-binary-precision", "Binary Precision"),
			ml("057-binary-recall", "Binary Recall"),
		],
		deliverable: "Create an error-cost table and choose a primary metric for a concrete product decision.",
		evidence: "Confusion-matrix examples tied to user consequences",
		stretch: "Add segment-specific costs and compare the chosen threshold.",
	},
	{
		key: "thresholds",
		title: "Thresholds and product policies",
		summary: "Treat thresholds as versioned product policy rather than a hidden model constant.",
		courseId: "stanford-cs229-2022",
		selection: "Classification, calibration context, and decision thresholds.",
		exercises: [
			ml("058-binary-f1-score", "Binary F1 Score"),
			ml("014-threshold-predictions", "Threshold Predictions"),
		],
		deliverable: "Build a threshold explorer showing quality, volume, and error-cost trade-offs.",
		evidence: "Tested threshold boundaries and a documented launch choice",
		stretch: "Add a reject or human-review region.",
	},
	{
		key: "ranking-products",
		title: "Ranking-product evaluation",
		summary: "Measure the quality of limited result surfaces where position changes user attention.",
		courseId: "stanford-cs276-2019",
		selection: "Information-retrieval evaluation and ranked result metrics.",
		exercises: [
			ml("019-precision-at-k", "Precision at K"),
			ml("020-mean-reciprocal-rank", "Mean Reciprocal Rank"),
		],
		deliverable: "Evaluate a search or recommendation surface with query-level Precision@k and MRR.",
		evidence: "Judgment guidelines, per-query results, and disagreement examples",
		stretch: "Compare metric changes at two interface result limits.",
	},
	{
		key: "graded-relevance",
		title: "Graded relevance",
		summary: "Represent partial usefulness and ranking position instead of forcing every outcome into binary labels.",
		courseId: "stanford-cs276-2019",
		selection: "Average precision, NDCG, and ranked evaluation.",
		exercises: [
			ml("099-average-precision", "Average Precision"),
			ml("101-normalized-dcg", "Normalized DCG"),
		],
		deliverable: "Define relevance grades and compare AP with NDCG for one product workflow.",
		evidence: "Hand-checked metric examples and reviewer agreement notes",
		stretch: "Test sensitivity to alternate gain and discount choices.",
	},
	{
		key: "recommendation-data",
		title: "Recommendation data and cold start",
		summary: "Model user-item interactions while preserving missingness, sparsity, and cold-start behavior.",
		courseId: "stanford-cs329s-2022",
		selection: "Data engineering, feature engineering, and product requirements.",
		exercises: [
			ml("231-build-a-user-item-matrix", "Build a User–Item Matrix"),
			ml("233-item-popularity-scores", "Item Popularity Scores"),
		],
		deliverable: "Build an interaction matrix plus a popularity baseline with explicit cold-start behavior.",
		evidence: "Sparse-data fixtures and a baseline coverage report",
		stretch: "Add recency weighting and document its product assumption.",
	},
	{
		key: "personalization",
		title: "Personalized ranking",
		summary: "Build a transparent collaborative baseline before reaching for a complex recommender.",
		courseId: "stanford-cs276-2019",
		selection: "Personalization and ranking trade-offs.",
		exercises: [
			ml("235-weighted-neighbor-rating", "Weighted Neighbor Rating"),
			ml("239-recommend-unseen-top-k", "Recommend Unseen Top K"),
		],
		deliverable: "Generate unseen-item recommendations with a documented fallback for sparse users.",
		evidence: "Expected recommendations for known, sparse, and new users",
		stretch: "Add a diversity reranker and quantify the relevance cost.",
	},
	{
		key: "recommendation-objectives",
		title: "Recommendation objectives",
		summary: "Connect pairwise training objectives to the product behavior visible in top-k recommendations.",
		courseId: "stanford-cs329s-2022",
		selection: "Model selection, evaluation, and business objectives.",
		exercises: [
			ml("240-recommendation-hit-rate", "Recommendation Hit Rate"),
			ml("238-bpr-pairwise-loss", "BPR Pairwise Loss"),
		],
		deliverable: "Compare a popularity and pairwise-ranking baseline using hit rate plus one guardrail.",
		evidence: "Offline report with coverage, popularity bias, and failure slices",
		stretch: "Add a time-based split to reduce leakage.",
	},
	{
		key: "fairness-baselines",
		title: "Fairness baselines",
		summary: "Measure group-level outcome differences and connect them to product context and data limitations.",
		courseId: "stanford-cs329s-2022",
		selection: "Fairness, privacy, security, and stakeholder trade-offs.",
		exercises: [
			ml("154-demographic-parity-gap", "Demographic Parity Gap"),
			ml("155-disparate-impact-ratio", "Disparate Impact Ratio"),
		],
		deliverable: "Add a fairness slice report with clear group definitions and limitations.",
		evidence: "Metric tests and a review of label and sampling bias",
		stretch: "Compare the result under one alternate grouping choice.",
	},
	{
		key: "fairness-tradeoffs",
		title: "Fairness trade-offs",
		summary: "Avoid treating one fairness metric as universally correct by documenting incompatible objectives.",
		courseId: "stanford-cs329s-2022",
		selection: "Stakeholder objectives and responsible ML system design.",
		exercises: [
			ml("156-equal-opportunity-gap", "Equal Opportunity Gap"),
			ml("157-equalized-odds-gap", "Equalized Odds Gap"),
		],
		deliverable: "Write a decision memo comparing two fairness definitions for one product scenario.",
		evidence: "Segment metrics, explicit assumptions, and unresolved trade-offs",
		stretch: "Add uncertainty intervals for small groups.",
	},
	{
		key: "explanations-and-privacy",
		title: "Explanations and privacy",
		summary: "Provide useful model explanations without leaking sensitive records or overstating causality.",
		courseId: "stanford-cs329s-2022",
		selection: "Privacy, security, feature engineering, and model interpretation.",
		exercises: [
			ml("159-permutation-importance-drops", "Permutation Importance Drops"),
			ml("163-k-anonymity-group-size", "K-Anonymity Group Size"),
		],
		deliverable: "Create a user-facing explanation prototype and a privacy review for the data it exposes.",
		evidence: "Explanation stability examples and identified privacy failure cases",
		stretch: "Add a minimum-group-size guard to one analytics view.",
	},
	{
		key: "forecast-products",
		title: "Forecast-driven product decisions",
		summary: "Evaluate forecasts in the units and uncertainty ranges that product decisions consume.",
		courseId: "stanford-cs329s-2022",
		selection: "Business metrics, deployment decisions, and monitoring.",
		exercises: [
			ml("229-mean-absolute-percentage-error", "Mean Absolute Percentage Error"),
			ml("230-forecast-interval-coverage", "Forecast Interval Coverage"),
		],
		deliverable: "Build a forecast scorecard with an error metric, interval coverage, and a decision threshold.",
		evidence: "Edge cases for zeros, misses, and under-covered intervals",
		stretch: "Compare against a seasonal naive baseline.",
	},
	{
		key: "capstone-discovery",
		title: "Product capstone discovery",
		summary: "Choose a narrow user workflow and establish evidence that the problem is worth solving.",
		courseId: "stanford-cs224v-2025",
		selection: "Useful assistants for a chosen domain and project-oriented development.",
		exercises: [
			note("recommendation-system/online-experiment-lifecycle", "Online Experiment Lifecycle"),
			note("recommendation-system/metrics", "Recommendation Metrics"),
		],
		deliverable: "Publish a problem brief with target user, current workflow, baseline, risks, and success criteria.",
		evidence: "Usability observations or interviews plus a measured current-state baseline",
		stretch: "Test one low-fidelity prototype before writing production code.",
	},
	{
		key: "capstone-prototype",
		title: "Product capstone prototype",
		summary: "Build one complete task flow with clear corrections, fallbacks, and user control.",
		courseId: "stanford-cs224v-2025",
		selection: "Hands-on assistant creation and reliable task completion.",
		exercises: [
			sql("customers-without-orders", "Customers Without Orders"),
			algorithm("706-design-hashmap", "Design HashMap"),
		],
		deliverable: "Ship a usable vertical slice that completes one target task and records corrections.",
		evidence: "Task walkthrough, smoke tests, and observed user friction",
		stretch: "Add one accessibility improvement identified during testing.",
	},
	{
		key: "capstone-experiment",
		title: "Product capstone experiment",
		summary: "Evaluate task completion and correction burden before claiming a product improvement.",
		courseId: "stanford-cs329s-2022",
		selection: "Iterative development, deployment, business metrics, and monitoring.",
		exercises: [
			note("recommendation-system/aa-testing", "A/A Testing"),
			note("recommendation-system/ab-testing", "A/B Testing"),
		],
		deliverable: "Run a bounded usability or offline experiment and publish outcomes, guardrails, and limitations.",
		evidence: "Protocol, observations, task results, corrections, and analysis",
		stretch: "Repeat with one contrasting user profile.",
	},
	{
		key: "capstone-interview",
		title: "Product narrative and interviews",
		summary: "Explain the user need, model behavior, system constraints, and evidence without inflating claims.",
		courseId: "stanford-cs329s-2022",
		selection: "Stakeholders, business metrics, system trade-offs, and project communication.",
		exercises: [
			systemDesign("sd-real-time-ml-inference", "AI Product System Design Review"),
			algorithm("3-longest-substring-without-repeating-characters", "Longest Substring Without Repeating Characters"),
		],
		deliverable: "Complete one product-sense mock, one coding mock, and a ten-minute evidence-based capstone walkthrough.",
		evidence: "Rubric scores, revised narrative, and prioritized weakness list",
		stretch: "Answer the weakest trade-off question again after a two-day delay.",
	},
];

export const specializationModules = [
	...buildTrackModules("applied-ai", appliedAI),
	...buildTrackModules("ml-infrastructure", mlInfrastructure),
	...buildTrackModules("model-post-training", modelPostTraining),
	...buildTrackModules("ai-product", aiProduct),
];

export const specializationSchedules: Record<
	TrackId,
	{ specializationIds: string[]; capstoneIds: string[] }
> = Object.fromEntries(
	(["applied-ai", "ml-infrastructure", "model-post-training", "ai-product"] as TrackId[]).map(
		(trackId) => {
			const trackModules = specializationModules.filter((module) => module.id.startsWith(`${trackId}-`));
			return [
				trackId,
				{
					specializationIds: trackModules
						.filter((module) => module.phase === "specialization")
						.map((module) => module.id),
					capstoneIds: trackModules
						.filter((module) => module.phase === "capstone")
						.map((module) => module.id),
				},
			];
		},
	),
) as Record<TrackId, { specializationIds: string[]; capstoneIds: string[] }>;
