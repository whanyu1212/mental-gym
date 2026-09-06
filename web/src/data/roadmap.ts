export const TRACK_IDS = [
	"applied-ai",
	"ml-infrastructure",
	"model-post-training",
	"ai-product",
] as const;

export type TrackId = (typeof TRACK_IDS)[number];
export type RoadmapPhase = "foundation" | "specialization" | "capstone";
export type ExerciseDomain = "algorithm" | "ml" | "sql" | "note" | "system-design";

export interface WeeklyHours {
	study: number;
	implementation: number;
	interview: number;
	language: number;
}

export interface Course {
	id: string;
	code: string;
	title: string;
	offering: string;
	url: string;
	accessNotes: string;
	computeNotes: string;
}

export interface CourseSelection {
	courseId: string;
	selection: string;
}

export interface ExerciseReference {
	domain: ExerciseDomain;
	slug: string;
	label: string;
}

export interface RoadmapModule {
	id: string;
	phase: RoadmapPhase;
	title: string;
	summary: string;
	prerequisiteIds: string[];
	resources: CourseSelection[];
	exercises: ExerciseReference[];
	hours: WeeklyHours;
	deliverable: string;
	evidence: string[];
	stretch?: string[];
}

export interface RoadmapTrack {
	id: TrackId;
	title: string;
	shortTitle: string;
	description: string;
	audience: string;
	foundationIds: string[];
	specializationIds: string[];
	capstoneIds: string[];
}

export interface ReferenceCatalog {
	algorithm: ReadonlySet<string>;
	ml: ReadonlySet<string>;
	sql: ReadonlySet<string>;
	note: ReadonlySet<string>;
	"system-design": ReadonlySet<string>;
}

export const WEEKLY_HOUR_LIMIT = 15;

export const courses: Course[] = [
	{
		id: "stanford-cs229-2022",
		code: "CS229",
		title: "Machine Learning",
		offering: "Autumn 2022 public materials",
		url: "https://cs229.stanford.edu/",
		accessNotes: "Selected notes and handouts are public; enrollment-only resources may not be available.",
		computeNotes: "Roadmap exercises use small CPU-friendly datasets rather than course-scale jobs.",
	},
	{
		id: "stanford-cs230-2018",
		code: "CS230",
		title: "Deep Learning",
		offering: "Autumn 2018 public materials",
		url: "https://cs230.stanford.edu/",
		accessNotes: "Course notes and selected assignments are public; some hosted services may have changed.",
		computeNotes: "Foundation work is designed for CPU or a free notebook runtime.",
	},
	{
		id: "stanford-cs224n-2024",
		code: "CS224N",
		title: "Natural Language Processing with Deep Learning",
		offering: "Winter 2024 public materials",
		url: "https://web.stanford.edu/class/cs224n/",
		accessNotes: "Lecture videos and notes are public; current assignment access can vary by offering.",
		computeNotes: "Use toy tensors and small models; no paid training run is required.",
	},
	{
		id: "stanford-cs145-2024",
		code: "CS145",
		title: "Introduction to Databases",
		offering: "Fall 2024 public course site",
		url: "https://cs145-fa24.github.io/",
		accessNotes: "Public site availability is historical and does not imply a current Stanford offering.",
		computeNotes: "All selected SQL exercises run locally with PostgreSQL or SQLite.",
	},
];

const foundationModules: RoadmapModule[] = [
	{
		id: "foundation-01-python-and-complexity",
		phase: "foundation",
		title: "Python, arrays, and complexity",
		summary: "Build the language and complexity vocabulary needed to reason about implementations before optimizing them.",
		prerequisiteIds: [],
		resources: [
			{ courseId: "stanford-cs229-2022", selection: "Review the prerequisites and linear-model notation." },
		],
		exercises: [
			{ domain: "note", slug: "python-dsa-toolkit", label: "Python DSA toolkit" },
			{ domain: "note", slug: "asymptotic-analysis", label: "Asymptotic analysis" },
			{ domain: "algorithm", slug: "1-two-sum", label: "Two Sum" },
			{ domain: "algorithm", slug: "217-contains-duplicate", label: "Contains Duplicate" },
		],
		hours: { study: 5, implementation: 5, interview: 3, language: 2 },
		deliverable: "Explain the time and space cost of two hash-table solutions and implement them without reference material.",
		evidence: ["Committed implementations", "Passing local examples", "A short complexity explanation"],
		stretch: ["Compare Python and TypeScript collection semantics on one exercise."],
	},
	{
		id: "foundation-02-data-and-sql",
		phase: "foundation",
		title: "Data modeling and SQL",
		summary: "Treat data shape, cardinality, nulls, and ordering as part of program correctness.",
		prerequisiteIds: ["foundation-01-python-and-complexity"],
		resources: [
			{ courseId: "stanford-cs145-2024", selection: "Relational model, SQL querying, joins, and aggregation." },
		],
		exercises: [
			{ domain: "sql", slug: "customers-without-orders", label: "Customers Without Orders" },
			{ domain: "sql", slug: "monthly-paid-revenue", label: "Monthly Paid Revenue" },
			{ domain: "algorithm", slug: "49-group-anagrams", label: "Group Anagrams" },
		],
		hours: { study: 5, implementation: 5, interview: 3, language: 2 },
		deliverable: "Write two deterministic SQL queries and document their input cardinality and null behavior.",
		evidence: ["Queries run against local fixtures", "Expected rows checked", "Cardinality assumptions recorded"],
		stretch: ["Model the same aggregation with a small Python data pipeline."],
	},
	{
		id: "foundation-03-probability-and-metrics",
		phase: "foundation",
		title: "Probability and classification metrics",
		summary: "Connect uncertainty, conditional probability, and threshold choices to measurable model behavior.",
		prerequisiteIds: ["foundation-01-python-and-complexity"],
		resources: [
			{ courseId: "stanford-cs229-2022", selection: "Probability review and supervised-learning foundations." },
		],
		exercises: [
			{ domain: "ml", slug: "confusion-matrix-and-f1", label: "Confusion Matrix, Precision, Recall, and F1" },
			{ domain: "algorithm", slug: "169-majority-element", label: "Majority Element" },
		],
		hours: { study: 5, implementation: 5, interview: 3, language: 2 },
		deliverable: "Implement binary classification metrics and explain one threshold trade-off for an imbalanced product case.",
		evidence: ["Edge-case examples", "Metric calculations checked by hand", "Written threshold rationale"],
		stretch: ["Add macro and micro averaging for a multiclass example."],
	},
	{
		id: "foundation-04-linear-models",
		phase: "foundation",
		title: "Linear algebra, optimization, and linear models",
		summary: "Follow shapes through a vectorized model and connect the objective to each gradient update.",
		prerequisiteIds: ["foundation-03-probability-and-metrics"],
		resources: [
			{ courseId: "stanford-cs229-2022", selection: "Linear regression, logistic regression, and gradient descent." },
		],
		exercises: [
			{ domain: "note", slug: "ml-logistic-regression", label: "Logistic Regression from Scratch" },
			{ domain: "ml", slug: "logistic-regression-from-scratch", label: "Logistic Regression implementation prompt" },
			{ domain: "algorithm", slug: "238-product-of-array-except-self", label: "Product of Array Except Self" },
		],
		hours: { study: 5, implementation: 5, interview: 3, language: 2 },
		deliverable: "Train a vectorized logistic-regression model and narrate the shape and purpose of every intermediate value.",
		evidence: ["Runnable source", "Loss decreases on a toy dataset", "Shape annotations and failure analysis"],
		stretch: ["Compare direct probability clipping with a stable logits-based loss."],
	},
	{
		id: "foundation-05-evaluation",
		phase: "foundation",
		title: "Evaluation and experiment design",
		summary: "Separate offline model quality, statistical uncertainty, and the product outcome an experiment is meant to change.",
		prerequisiteIds: ["foundation-03-probability-and-metrics", "foundation-04-linear-models"],
		resources: [
			{ courseId: "stanford-cs229-2022", selection: "Bias, variance, error analysis, and evaluation strategy." },
		],
		exercises: [
			{ domain: "note", slug: "recommendation-system/metrics", label: "Recommendation metrics" },
			{ domain: "note", slug: "recommendation-system/aa-testing", label: "A/A testing" },
			{ domain: "note", slug: "recommendation-system/ab-testing", label: "A/B testing" },
			{ domain: "ml", slug: "confusion-matrix-and-f1", label: "Classification metrics review" },
		],
		hours: { study: 5, implementation: 5, interview: 3, language: 2 },
		deliverable: "Write an evaluation plan that links one offline metric, one guardrail, and one product outcome.",
		evidence: ["Evaluation table with baselines", "Named error slices", "Experiment assumptions and stopping rule"],
		stretch: ["Simulate how metric variance changes with sample size."],
	},
	{
		id: "foundation-06-neural-networks",
		phase: "foundation",
		title: "Neural networks and training loops",
		summary: "Understand the mechanics of forward passes, gradients, optimization, validation, and reproducible training.",
		prerequisiteIds: ["foundation-04-linear-models", "foundation-05-evaluation"],
		resources: [
			{ courseId: "stanford-cs230-2018", selection: "Neural-network foundations, optimization, and practical training advice." },
		],
		exercises: [
			{ domain: "ml", slug: "pytorch-training-loop", label: "PyTorch Training Loop" },
			{ domain: "algorithm", slug: "53-maximum-subarray", label: "Maximum Subarray" },
		],
		hours: { study: 5, implementation: 5, interview: 3, language: 2 },
		deliverable: "Run a minimal train/validation loop and diagnose one intentional failure such as missing gradient reset.",
		evidence: ["Reproducible command", "Training and validation curves", "Failure diagnosis"],
		stretch: ["Add checkpointing and resume one interrupted run."],
	},
	{
		id: "foundation-07-attention",
		phase: "foundation",
		title: "Sequence models and attention",
		summary: "Build attention from tensor operations and explain masking, scaling, and the path from tokens to contextual representations.",
		prerequisiteIds: ["foundation-06-neural-networks"],
		resources: [
			{ courseId: "stanford-cs224n-2024", selection: "Word vectors, neural sequence models, and transformers." },
		],
		exercises: [
			{ domain: "ml", slug: "scaled-dot-product-attention", label: "Scaled Dot-Product Attention" },
			{ domain: "algorithm", slug: "567-permutation-in-string", label: "Permutation in String" },
		],
		hours: { study: 5, implementation: 5, interview: 3, language: 2 },
		deliverable: "Implement single-head attention with a mask and explain the shape of scores, weights, and outputs.",
		evidence: ["Shape tests", "Masking example", "Numerical-stability note"],
		stretch: ["Extend the implementation to multiple heads on toy tensors."],
	},
	{
		id: "foundation-08-systems-baseline",
		phase: "foundation",
		title: "From model to production system",
		summary: "Frame an ML feature as a system with data contracts, latency goals, failure modes, monitoring, and feedback.",
		prerequisiteIds: [
			"foundation-02-data-and-sql",
			"foundation-05-evaluation",
			"foundation-07-attention",
		],
		resources: [
			{ courseId: "stanford-cs230-2018", selection: "Error analysis and structuring ML projects." },
		],
		exercises: [
			{ domain: "system-design", slug: "sd-real-time-ml-inference", label: "Real-Time ML Inference Platform" },
			{ domain: "sql", slug: "latest-event-per-device", label: "Latest Event Per Device" },
			{ domain: "algorithm", slug: "155-min-stack", label: "Min Stack" },
		],
		hours: { study: 5, implementation: 5, interview: 3, language: 2 },
		deliverable: "Produce a small inference-system design with explicit quality, latency, availability, and cost constraints.",
		evidence: ["Architecture diagram", "Capacity estimate", "Failure and rollback table"],
		stretch: ["Prototype one health check or fallback path locally."],
	},
];

export const modules: RoadmapModule[] = [...foundationModules];

const foundationIds = foundationModules.map((module) => module.id);

export const tracks: RoadmapTrack[] = [
	{
		id: "applied-ai",
		title: "Applied AI / Agents",
		shortTitle: "Applied AI",
		description: "Build evaluated retrieval, tool-using, and agentic applications.",
		audience: "For engineers shipping reliable AI features and agent workflows.",
		foundationIds,
		specializationIds: [],
		capstoneIds: [],
	},
	{
		id: "ml-infrastructure",
		title: "ML Infrastructure",
		shortTitle: "ML Infrastructure",
		description: "Build dependable data, training, serving, and observability systems.",
		audience: "For engineers focused on platforms, reliability, and ML system performance.",
		foundationIds,
		specializationIds: [],
		capstoneIds: [],
	},
	{
		id: "model-post-training",
		title: "Model / Post-training",
		shortTitle: "Model Training",
		description: "Study transformer internals, optimization, adaptation, and evaluation.",
		audience: "For engineers working closer to models, training loops, and inference kernels.",
		foundationIds,
		specializationIds: [],
		capstoneIds: [],
	},
	{
		id: "ai-product",
		title: "AI Product",
		shortTitle: "AI Product",
		description: "Connect model behavior to useful, measurable, and usable product outcomes.",
		audience: "For engineers building end-to-end AI product experiences.",
		foundationIds,
		specializationIds: [],
		capstoneIds: [],
	},
];

export function totalHours(hours: WeeklyHours): number {
	return hours.study + hours.implementation + hours.interview + hours.language;
}

export function exerciseHref(reference: ExerciseReference): string {
	switch (reference.domain) {
		case "algorithm":
			return `/algorithms/${reference.slug}/`;
		case "ml":
			return `/machine-learning/${reference.slug}/`;
		case "sql":
			return `/sql/${reference.slug}/`;
		case "note":
		case "system-design":
			return `/notes/${reference.slug}/`;
	}
}

export function modulesForTrack(track: RoadmapTrack): RoadmapModule[] {
	const byId = new Map(modules.map((module) => [module.id, module]));
	return [...track.foundationIds, ...track.specializationIds, ...track.capstoneIds]
		.map((id) => byId.get(id))
		.filter((module): module is RoadmapModule => module !== undefined);
}

export function validateRoadmap(catalog?: ReferenceCatalog, requireComplete = false): string[] {
	const issues: string[] = [];
	const courseIds = new Set(courses.map((course) => course.id));
	const moduleIds = new Set(modules.map((module) => module.id));

	if (courseIds.size !== courses.length) issues.push("Course IDs must be unique.");
	if (moduleIds.size !== modules.length) issues.push("Module IDs must be unique.");
	if (new Set(tracks.map((track) => track.id)).size !== tracks.length) issues.push("Track IDs must be unique.");

	for (const module of modules) {
		if (totalHours(module.hours) > WEEKLY_HOUR_LIMIT) {
			issues.push(`${module.id} exceeds the ${WEEKLY_HOUR_LIMIT}-hour weekly limit.`);
		}
		if (!module.deliverable.trim()) issues.push(`${module.id} is missing a deliverable.`);
		if (module.evidence.length === 0) issues.push(`${module.id} is missing completion evidence.`);

		for (const prerequisiteId of module.prerequisiteIds) {
			if (!moduleIds.has(prerequisiteId)) issues.push(`${module.id} has unknown prerequisite ${prerequisiteId}.`);
		}
		for (const resource of module.resources) {
			if (!courseIds.has(resource.courseId)) issues.push(`${module.id} has unknown course ${resource.courseId}.`);
		}
		if (catalog) {
			for (const exercise of module.exercises) {
				if (!catalog[exercise.domain].has(exercise.slug)) {
					issues.push(`${module.id} has unknown ${exercise.domain} reference ${exercise.slug}.`);
				}
			}
		}
	}

	for (const track of tracks) {
		const scheduledIds = [...track.foundationIds, ...track.specializationIds, ...track.capstoneIds];
		if (new Set(scheduledIds).size !== scheduledIds.length) {
			issues.push(`${track.id} schedules a module more than once.`);
		}
		for (const moduleId of scheduledIds) {
			if (!moduleIds.has(moduleId)) issues.push(`${track.id} has unknown module ${moduleId}.`);
		}
		if (track.foundationIds.length !== 8) issues.push(`${track.id} must schedule eight foundation weeks.`);
		if (requireComplete && scheduledIds.length !== 24) issues.push(`${track.id} must schedule 24 weeks.`);
	}

	return issues;
}
