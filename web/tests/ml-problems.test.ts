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
	assert.match(bm25.prompt, /tf or k1 is negative/);
	assert.match(bm25.prompt, /b lies outside \[0, 1\]/);

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

	const marginal = bySlug.get("109-marginalize-a-joint-distribution")!;
	assert.match(marginal.prompt, /any entry is negative/);

	const giniSplit = bySlug.get("063-decision-tree-gini-split")!;
	assert.match(giniSplit.prompt, /strictly reduces the parent node's Gini impurity/);
	assert.match(giniSplit.expectations.join(" "), /including for a pure node/);

	const svm = bySlug.get("064-linear-svm-hinge-gradient")!;
	assert.match(svm.prompt, /non-empty feature matrix/);
	assert.match(svm.prompt, /X has no rows/);

	const scaledDots = bySlug.get("024-scaled-dot-products")!;
	assert.match(scaledDots.prompt, /non-empty query vector/);
	assert.match(scaledDots.prompt, /d is 0/);

	const singleHead = bySlug.get("027-single-head-attention")!;
	assert.match(singleHead.prompt, /non-empty list of n key vectors/);
	assert.match(singleHead.prompt, /non-empty list of n non-empty value vectors/);
	assert.match(singleHead.prompt, /d or dv is 0/);

	const temperature = bySlug.get("028-temperature-scaling")!;
	assert.match(temperature.prompt, /non-empty vector of logits/);
	assert.match(temperature.prompt, /logits are empty/);

	const rmsNorm = bySlug.get("089-rms-normalization")!;
	assert.match(rmsNorm.prompt, /non-empty vector x/);
	assert.match(rmsNorm.prompt, /x is empty/);

	const topP = bySlug.get("091-top-p-distribution")!;
	assert.match(topP.prompt, /any input probability is outside \[0, 1\]/);

	const sequenceProbability = bySlug.get("093-sequence-log-probability")!;
	assert.match(sequenceProbability.prompt, /every row to contain probabilities in \[0, 1\] that sum to 1/);
	assert.match(sequenceProbability.prompt, /selected probability to lie in \(0, 1\]/);

	const completeKMeans = bySlug.get("110-complete-k-means-clustering")!;
	assert.match(completeKMeans.prompt, /smallest centroid index/);
	assert.match(completeKMeans.expectations.join(" "), /smallest centroid index to break distance ties/);

	const averagePrecisionNoDuplicates = bySlug.get("099-average-precision")!;
	assert.match(averagePrecisionNoDuplicates.prompt, /only the first occurrence of each relevant id/);
	assert.match(averagePrecisionNoDuplicates.prompt, /each relevant id contributes at most once/);

	const gradientCheck = bySlug.get("246-gradient-check-relative-errors")!;
	assert.match(gradientCheck.prompt, /epsilon eps > 0/);
	assert.match(gradientCheck.prompt, /eps is not strictly positive/);

	const binaryCrossEntropyEpsilon = bySlug.get("009-binary-cross-entropy")!;
	assert.match(binaryCrossEntropyEpsilon.prompt, /clipping epsilon eps in \(0, 0\.5\)/);
	assert.match(binaryCrossEntropyEpsilon.prompt, /eps is outside \(0, 0\.5\)/);

	const gaussianNaiveBayes = bySlug.get("062-gaussian-naive-bayes-prediction")!;
	assert.match(gaussianNaiveBayes.prompt, /non-empty collection of per-class log priors/);
	assert.match(gaussianNaiveBayes.prompt, /there are no classes/);

	const validatedMixtureMStep = bySlug.get("113-gaussian-mixture-m-step")!;
	assert.match(validatedMixtureMStep.prompt, /every responsibility to be non-negative/);
	assert.match(validatedMixtureMStep.prompt, /every responsibility row to sum to 1/);
	assert.match(validatedMixtureMStep.prompt, /feature matrix is empty/);

	const ndcg = bySlug.get("101-normalized-dcg")!;
	assert.match(ndcg.prompt, /non-negative graded relevance scores/);
	assert.match(ndcg.prompt, /any relevance score is negative/);
	assert.match(ndcg.prompt, /k is not positive/);

	const ucb = bySlug.get("127-upper-confidence-bound-scores")!;
	assert.match(ucb.prompt, /non-negative integer pull counts/);
	assert.match(ucb.prompt, /count is negative or non-integral/);

	const positiveKMeans = bySlug.get("110-complete-k-means-clustering")!;
	assert.match(positiveKMeans.prompt, /positive cluster count k/);
	assert.match(positiveKMeans.prompt, /k is not positive/);

	const beamSearch = bySlug.get("030-beam-search")!;
	assert.match(beamSearch.prompt, /return up to b sequences/);
	assert.match(beamSearch.prompt, /min\(b, candidate_count\)/);
	assert.match(beamSearch.expectations.join(" "), /at most b beams/);

	const boundedBm25 = bySlug.get("098-bm25-term-score")!;
	assert.match(boundedBm25.prompt, /parameter k1 >= 0/);
	assert.match(boundedBm25.prompt, /parameter b in \[0, 1\]/);
	assert.match(boundedBm25.prompt, /b lies outside \[0, 1\]/);

	const visualContext = bySlug.get("191-attended-visual-context")!;
	assert.match(visualContext.prompt, /non-negative attention weights/);
	assert.match(visualContext.prompt, /any weight is negative/);

	const adaboost = bySlug.get("066-adaboost-weight-update")!;
	assert.match(adaboost.prompt, /non-negative current example weights/);
	assert.match(adaboost.prompt, /any incoming weight is negative/);

	const validatedKMeansPlusPlus = bySlug.get("111-k-means-plus-plus-centroid-selection")!;
	assert.match(validatedKMeansPlusPlus.prompt, /uniform random draws in \[0, 1\)/);
	assert.match(validatedKMeansPlusPlus.prompt, /any supplied draw lies outside \[0, 1\)/);
	assert.match(validatedKMeansPlusPlus.prompt, /first index is out of range/);

	const deterministicMixtureMStep = bySlug.get("113-gaussian-mixture-m-step")!;
	assert.match(deterministicMixtureMStep.prompt, /variance floor greater than 0/);
	assert.match(deterministicMixtureMStep.prompt, /max\(variance, variance_floor\)/);
	assert.match(deterministicMixtureMStep.prompt, /variance floor is not positive/);

	const anchorMatching = bySlug.get("220-match-anchor-boxes")!;
	assert.match(anchorMatching.prompt, /both thresholds to lie in \[0, 1\]/);
	assert.match(anchorMatching.prompt, /either threshold is outside \[0, 1\]/);

	const boundedKMeans = bySlug.get("110-complete-k-means-clustering")!;
	assert.match(boundedKMeans.prompt, /positive maximum iteration count/);
	assert.match(boundedKMeans.prompt, /iteration cap is not positive/);

	const userItemMatrix = bySlug.get("231-build-a-user-item-matrix")!;
	assert.match(userItemMatrix.prompt, /Reject duplicate \(user_index, item_index\) pairs/);
	assert.match(userItemMatrix.prompt, /user-item pair appears more than once/);
	assert.match(userItemMatrix.expectations.join(" "), /reject duplicate user-item pairs/);

	const channelNormalization = bySlug.get("214-normalize-image-channels")!;
	assert.match(channelNormalization.prompt, /standard deviation is not strictly positive/);
	assert.match(channelNormalization.expectations.join(" "), /non-positive standard deviation/);

	const bm25ParameterDomains = bySlug.get("098-bm25-term-score")!;
	assert.match(bm25ParameterDomains.prompt, /parameter k1 >= 0/);
	assert.match(bm25ParameterDomains.prompt, /parameter b in \[0, 1\]/);

	const qLearning = bySlug.get("130-q-learning-update")!;
	assert.match(qLearning.prompt, /at least one next-state action value when the transition is nonterminal/);
	assert.match(qLearning.prompt, /empty list is valid for a terminal transition/);
	assert.match(qLearning.prompt, /nonterminal transition has no next-action values/);

	const interpolatedThreshold = bySlug.get("141-dynamic-threshold-latents")!;
	assert.match(interpolatedThreshold.prompt, /linear interpolation at zero-based rank/);
	assert.match(interpolatedThreshold.prompt, /r = \(p \/ 100\) \* \(n - 1\)/);
	assert.match(interpolatedThreshold.prompt, /floor\(r\) and ceil\(r\)/);

	const boundedUcb = bySlug.get("127-upper-confidence-bound-scores")!;
	assert.match(boundedUcb.prompt, /integer total pull count of at least 1/);
	assert.match(boundedUcb.prompt, /total is not an integer of at least 1/);

	const pixelAccuracy = bySlug.get("209-segmentation-pixel-accuracy")!;
	assert.match(pixelAccuracy.prompt, /identical positive shape/);
	assert.match(pixelAccuracy.prompt, /no rows or no columns/);

	const autocorrelation = bySlug.get("227-lagged-autocorrelation")!;
	assert.match(autocorrelation.prompt, /Return 1\.0 immediately at lag 0/);
	assert.match(autocorrelation.prompt, /including for a constant series/);
	assert.match(autocorrelation.prompt, /For positive lags/);

	const binomial = bySlug.get("107-binomial-probability")!;
	assert.match(binomial.prompt, /non-negative integer trial count n/);
	assert.match(binomial.prompt, /integer success count k/);
	assert.match(binomial.prompt, /n or k is not an integer/);

	const categoricalSampling = bySlug.get("108-categorical-inverse-sampling")!;
	assert.match(categoricalSampling.prompt, /last index whose probability is positive/);
	assert.match(categoricalSampling.expectations.join(" "), /last positive-probability category/);
	assert.match(categoricalSampling.prompt, /no probability is positive/);

	const adamMoments = bySlug.get("249-adam-optimizer-step")!;
	assert.match(adamMoments.prompt, /non-negative second moment v/);
	assert.match(adamMoments.prompt, /incoming second-moment value is negative/);

	const histogram = bySlug.get("049-histogram-counts")!;
	assert.match(histogram.prompt, /positive integer bin count k/);
	assert.match(histogram.prompt, /k is not a positive integer/);

	const deterministicAnchors = bySlug.get("220-match-anchor-boxes")!;
	assert.match(deterministicAnchors.prompt, /smallest original ground-truth index/);
	assert.match(deterministicAnchors.expectations.join(" "), /smallest ground-truth index on a tie/);

	const deterministicGini = bySlug.get("063-decision-tree-gini-split")!;
	assert.match(deterministicGini.prompt, /smallest feature index, then the smallest threshold/);
	assert.match(deterministicGini.expectations.join(" "), /feature index then threshold/);

	const deterministicTopP = bySlug.get("091-top-p-distribution")!;
	assert.match(deterministicTopP.prompt, /original token index ascending/);
	assert.match(deterministicTopP.expectations.join(" "), /original token index ascending/);

	const nonNegativeUcb = bySlug.get("127-upper-confidence-bound-scores")!;
	assert.match(nonNegativeUcb.prompt, /non-negative exploration constant c/);
	assert.match(nonNegativeUcb.prompt, /c is negative/);

	const immutableKvCache = bySlug.get("094-append-to-a-kv-cache")!;
	assert.match(immutableKvCache.expectations.join(" "), /O\(n\) time and O\(n\) additional list space/);
	assert.match(immutableKvCache.expectations.join(" "), /mutable in-place cache would make the append O\(1\) amortized/);

	const deterministicNaiveBayes = bySlug.get("062-gaussian-naive-bayes-prediction")!;
	assert.match(deterministicNaiveBayes.prompt, /smallest class index/);
	assert.match(deterministicNaiveBayes.expectations.join(" "), /smallest index when scores tie/);

	const safeTreePrediction = bySlug.get("065-decision-tree-prediction")!;
	assert.match(safeTreePrediction.prompt, /not an integer in \[0, len\(sample\)\)/);
	assert.match(safeTreePrediction.expectations.join(" "), /validate each visited feature index/);

	const maskedSingleHead = bySlug.get("027-single-head-attention")!;
	assert.match(maskedSingleHead.prompt, /require at least one allowed position/);
	assert.match(maskedSingleHead.prompt, /mask is all false/);
	assert.match(maskedSingleHead.expectations.join(" "), /mask allows at least one position/);
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
