import type { AlgorithmGuide } from "../data/algorithmGuides";
import type { MLProblem } from "../data/mlProblems";
import type { Problem } from "../data/problems";
import { buildQuickReviewItem } from "./quick-review.ts";

export interface HeroRep {
	slug: string;
	title: string;
	prompt: string;
	pattern: string;
	topTrap: string;
	href: string;
}

export interface HeroRepSeed {
	domain: "algorithms" | "ml";
	slug: string;
	prompt: string;
}

export const HERO_REP_SEEDS: readonly HeroRepSeed[] = [
	{
		domain: "algorithms",
		slug: "128-longest-consecutive-sequence",
		prompt:
			"Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence in O(n) time.",
	},
	{
		domain: "algorithms",
		slug: "560-subarray-sum-equals-k",
		prompt:
			"Given an integer array nums (including negatives) and an integer k, return the total number of contiguous subarrays whose sum equals k.",
	},
	{
		domain: "ml",
		slug: "logistic-regression-from-scratch",
		prompt:
			"Implement binary logistic regression with sigmoid activation, binary cross-entropy loss, and gradient descent without a high-level ML library.",
	},
];

export interface HeroRepSources {
	problems: Problem[];
	getGuide: (slug: string) => AlgorithmGuide | undefined;
	mlProblems: MLProblem[];
}

/** Build the curated sample deck for the landing-page Live Rep card. */
export function buildHeroReps(sources: HeroRepSources, basePrefix = ""): HeroRep[] {
	const prefix = basePrefix.replace(/\/$/, "");

	return HERO_REP_SEEDS.map((seed) => {
		if (seed.domain === "algorithms") {
			const problem = sources.problems.find((entry) => entry.slug === seed.slug);
			if (!problem) {
				throw new Error(`Hero rep missing algorithm problem: ${seed.slug}`);
			}
			const item = buildQuickReviewItem(problem, sources.getGuide(seed.slug));
			const complexity = [item.timeComplexity, item.spaceComplexity].filter(Boolean).join(" / ");
			const pattern = [item.pattern, complexity].filter(Boolean).join(" · ");

			return {
				slug: item.slug,
				title: item.title,
				prompt: seed.prompt,
				pattern,
				topTrap: item.topTrap,
				href: `${prefix}/algorithms/${item.slug}/`,
			};
		}

		const ml = sources.mlProblems.find((entry) => entry.slug === seed.slug);
		if (!ml) {
			throw new Error(`Hero rep missing ML problem: ${seed.slug}`);
		}

		return {
			slug: ml.slug,
			title: ml.title,
			prompt: seed.prompt,
			pattern: ml.category,
			topTrap: ml.hints.at(-1) ?? "",
			href: `${prefix}/machine-learning/${ml.slug}/`,
		};
	});
}

/** Safely serialize hero reps for embedding inside `<script type="application/json">`. */
export function serializeHeroReps(reps: HeroRep[]): string {
	return JSON.stringify(reps).replace(/</g, "\\u003c");
}
