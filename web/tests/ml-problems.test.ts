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
