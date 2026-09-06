import assert from "node:assert/strict";
import test from "node:test";

import { mlProblems } from "../src/data/mlProblems.ts";
import { mlCatalogProblems } from "../src/data/mlProblemCatalog.ts";

const HAND_AUTHORED = 4;

test("catalog drills are appended to the hand-authored problems", () => {
	assert.equal(mlProblems.length, HAND_AUTHORED + mlCatalogProblems.length);

	for (const title of [
		"Logistic Regression from Scratch",
		"Confusion Matrix + Precision / Recall / F1",
		"Scaled Dot-Product Attention",
		"PyTorch Training Loop",
	]) {
		assert.ok(
			mlProblems.some((problem) => problem.title === title),
			`hand-authored capstone missing: ${title}`,
		);
	}
});

test("ids and slugs are unique across the whole bank", () => {
	const ids = mlProblems.map((problem) => problem.id);
	const slugs = mlProblems.map((problem) => problem.slug);

	assert.equal(new Set(ids).size, ids.length, "duplicate id");
	assert.equal(new Set(slugs).size, slugs.length, "duplicate slug");
});

test("each catalog drill carries a unique source number and a derived slug", () => {
	const sourceNumbers = mlCatalogProblems.map((problem) => problem.sourceNumber);
	assert.equal(new Set(sourceNumbers).size, sourceNumbers.length, "duplicate source number");

	for (const problem of mlCatalogProblems) {
		assert.match(
			problem.slug,
			/^\d{3}-[a-z0-9-]+$/,
			`slug is not source-number-prefixed kebab-case: ${problem.slug}`,
		);
		assert.equal(
			problem.slug.slice(0, 3),
			String(problem.sourceNumber).padStart(3, "0"),
			`slug prefix does not match source number: ${problem.slug}`,
		);
	}
});

test("every problem has non-empty coaching content", () => {
	for (const problem of mlProblems) {
		for (const field of ["title", "summary", "whyItMatters", "prompt", "category"] as const) {
			assert.ok(problem[field].trim().length > 0, `${problem.slug} has empty ${field}`);
		}
		for (const field of ["expectations", "hints", "followUps", "tags"] as const) {
			assert.ok(problem[field].length > 0, `${problem.slug} has empty ${field}`);
			for (const entry of problem[field]) {
				assert.ok(entry.trim().length > 0, `${problem.slug} has a blank entry in ${field}`);
			}
		}
	}
});

test("numerical and ranking prompts state implementable contracts", () => {
	const bySlug = new Map(mlCatalogProblems.map((problem) => [problem.slug, problem]));

	const sigmoid = bySlug.get("001-sigmoid-activation")!;
	assert.match(sigmoid.prompt, /value in \[0, 1\]/);
	assert.match(sigmoid.prompt, /saturate to exactly 0\.0 or 1\.0/);
	assert.doesNotMatch(sigmoid.prompt, /strictly inside/);

	const repetitionPenalty = bySlug.get("092-repetition-penalty")!;
	assert.match(repetitionPenalty.prompt, /r >= 1/);
	assert.match(repetitionPenalty.prompt, /r is less than 1/);
	assert.match(repetitionPenalty.prompt, /r = 1 as a no-op/);

	const averagePrecision = bySlug.get("099-average-precision")!;
	assert.match(averagePrecision.prompt, /sum precision@i/);
	assert.match(averagePrecision.prompt, /divide that sum once/);
	assert.doesNotMatch(averagePrecision.prompt, /mean of precision@i/);

	const logisticPrediction = bySlug.get("053-logistic-regression-prediction")!;
	assert.match(logisticPrediction.expectations.join(" "), /probabilities in \[0, 1\]/);
	assert.match(logisticPrediction.expectations.join(" "), /saturation at exactly 0\.0 or 1\.0/);
	assert.doesNotMatch(logisticPrediction.expectations.join(" "), /strictly inside/);

	const kMeansPlusPlus = bySlug.get("111-k-means-plus-plus-centroid-selection")!;
	assert.match(kMeansPlusPlus.prompt, /smallest unused point index/);
	assert.match(kMeansPlusPlus.prompt, /do not consume a draw/);
	assert.match(kMeansPlusPlus.expectations.join(" "), /all remaining weights are zero/);

	const pairedRanks = bySlug.get("193-paired-retrieval-ranks")!;
	assert.match(pairedRanks.prompt, /optimistic tie-breaking/);
	assert.match(pairedRanks.prompt, /strictly greater similarity/);
	assert.doesNotMatch(pairedRanks.prompt, /smaller column index/);

	const sigmoidDerivative = bySlug.get("069-sigmoid-derivative")!;
	assert.match(sigmoidDerivative.prompt, /outputs s in \[0, 1\]/);
	assert.match(sigmoidDerivative.expectations.join(" "), /values in \[0, 0\.25\]/);
	assert.match(sigmoidDerivative.expectations.join(" "), /zero at saturated endpoints/);

	const dropout = bySlug.get("072-inverted-dropout")!;
	assert.match(dropout.expectations.join(" "), /p = 0 and the supplied mask keeps every activation/);

	const zeroCrossing = bySlug.get("177-zero-crossing-rate")!;
	assert.match(zeroCrossing.prompt, /strictly opposite signs/);
	assert.match(zeroCrossing.prompt, /pair containing a sample of exactly 0 does not count/);

	const neighborAggregation = bySlug.get("167-mean-neighbor-aggregation")!;
	assert.match(neighborAggregation.expectations.join(" "), /unless its adjacency list contains a self-loop/);

	const weightedRating = bySlug.get("235-weighted-neighbor-rating")!;
	assert.match(weightedRating.hints.join(" "), /single positive-similarity neighbour returns its rating/);
	assert.match(weightedRating.hints.join(" "), /single negative-similarity neighbour returns the negated rating/);

	const binaryCrossEntropy = bySlug.get("009-binary-cross-entropy")!;
	assert.match(binaryCrossEntropy.prompt, /non-empty equal-length lists/);
	assert.match(binaryCrossEntropy.prompt, /lists are empty/);

	const nearestNeighbors = bySlug.get("061-k-nearest-neighbors")!;
	assert.match(nearestNeighbors.prompt, /original training index/);
	assert.match(nearestNeighbors.expectations.join(" "), /training index to break equal-distance ties/);

	const perplexity = bySlug.get("086-sequence-perplexity")!;
	assert.match(perplexity.prompt, /probability outside \(0, 1\]/);

	const mixtureMStep = bySlug.get("113-gaussian-mixture-m-step")!;
	assert.match(mixtureMStep.prompt, /zero effective count/);
	assert.match(mixtureMStep.expectations.join(" "), /Reject a component with zero effective count/);

	const epsilonGreedy = bySlug.get("126-epsilon-greedy-action")!;
	assert.match(epsilonGreedy.prompt, /action draw v in \[0, 1\)/);
	assert.match(epsilonGreedy.prompt, /floor\(v \* action_count\)/);
	assert.match(epsilonGreedy.prompt, /either draw is outside \[0, 1\)/);

	const nonMaxSuppression = bySlug.get("202-non-max-suppression")!;
	assert.match(nonMaxSuppression.prompt, /original box index ascending/);
	assert.match(nonMaxSuppression.expectations.join(" "), /smaller original indices to break equal-score ties/);

	const regressionGradient = bySlug.get("059-linear-regression-gradient")!;
	assert.match(regressionGradient.prompt, /non-empty feature matrix/);
	assert.match(regressionGradient.prompt, /X has no rows/);

	const topK = bySlug.get("029-top-k-sampling-distribution")!;
	assert.match(topK.prompt, /non-empty vector of logits/);
	assert.match(topK.prompt, /logits are empty/);

	const silhouette = bySlug.get("122-point-silhouette-score")!;
	assert.match(silhouette.prompt, /max\(a, b\) is 0/);
	assert.match(silhouette.expectations.join(" "), /zero denominator/);

	const bm25 = bySlug.get("098-bm25-term-score")!;
	assert.match(bm25.prompt, /Return 0 immediately when tf is 0/);
	assert.match(bm25.prompt, /tf, k1, or b is negative/);

	const mape = bySlug.get("229-mean-absolute-percentage-error")!;
	assert.match(mape.prompt, /non-empty equal-length lists/);
	assert.match(mape.prompt, /lists are empty/);

	const cosine = bySlug.get("004-cosine-similarity")!;
	assert.match(cosine.expectations.join(" "), /equal empty vectors are accepted and return 0\.0/);
	assert.doesNotMatch(cosine.expectations.join(" "), /same non-zero length/);

	const attentionWeights = bySlug.get("011-scaled-attention-weights")!;
	assert.match(attentionWeights.prompt, /non-empty query vector/);
	assert.match(attentionWeights.prompt, /d is 0/);

	const mixtureEStep = bySlug.get("112-gaussian-mixture-e-step")!;
	assert.match(mixtureEStep.prompt, /non-negative mixture weights that sum to 1/);
	assert.match(mixtureEStep.prompt, /zero-weight component's log contribution as negative infinity/);
	assert.match(mixtureEStep.expectations.join(" "), /without taking log\(0\)/);

	const adam = bySlug.get("249-adam-optimizer-step")!;
	assert.match(adam.prompt, /epsilon is not strictly positive/);

	const nearestResize = bySlug.get("205-nearest-neighbor-resize")!;
	assert.match(nearestResize.prompt, /non-empty rectangular image/);
	assert.match(nearestResize.prompt, /source has no rows or columns/);
	assert.match(nearestResize.prompt, /is ragged/);

	const bellman = bySlug.get("128-bellman-expected-value")!;
	assert.match(bellman.prompt, /any probability is outside \[0, 1\]/);

	const ppo = bySlug.get("133-ppo-clipped-objective")!;
	assert.match(ppo.prompt, /non-empty equal-length lists/);
	assert.match(ppo.prompt, /trajectory is empty/);

	const recoverDiffusion = bySlug.get("139-recover-a-clean-diffusion-sample")!;
	assert.match(recoverDiffusion.prompt, /cumulative alpha lies outside \(0, 1\]/);

	const dynamicThreshold = bySlug.get("141-dynamic-threshold-latents")!;
	assert.match(dynamicThreshold.prompt, /non-empty latent vector/);
	assert.match(dynamicThreshold.prompt, /latent vector is empty/);

	const contrastiveLoss = bySlug.get("186-symmetric-contrastive-loss")!;
	assert.match(contrastiveLoss.prompt, /non-empty square similarity matrix/);
	assert.match(contrastiveLoss.prompt, /matrix is empty or not square/);

	const crossModalAttention = bySlug.get("190-cross-modal-attention-weights")!;
	assert.match(crossModalAttention.prompt, /non-empty query vector/);
	assert.match(crossModalAttention.prompt, /query dimension is 0/);
});

test("difficulty and status stay within the allowed values", () => {
	for (const problem of mlProblems) {
		assert.ok(
			["Easy", "Medium", "Hard"].includes(problem.difficulty),
			`${problem.slug} has difficulty ${problem.difficulty}`,
		);
		assert.ok(
			["Placeholder", "Completed"].includes(problem.status),
			`${problem.slug} has status ${problem.status}`,
		);
		if (problem.status === "Completed") {
			assert.ok(problem.solution?.python, `${problem.slug} is Completed without a solution`);
		}
	}
});
