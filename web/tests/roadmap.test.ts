import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { basename, extname } from "node:path";
import test from "node:test";

import { mlProblems } from "../src/data/mlProblems.ts";
import { problems } from "../src/data/problems.ts";
import {
	courses,
	exerciseHref,
	modules,
	modulesForTrack,
	totalHours,
	tracks,
	validateRoadmap,
	type ReferenceCatalog,
} from "../src/data/roadmap.ts";

const projectRoot = new URL("../..", import.meta.url);

function slugsFromSource(relativePath: string): Set<string> {
	const source = readFileSync(new URL(relativePath, projectRoot), "utf8");
	return new Set([...source.matchAll(/\bslug:\s*"([^"]+)"/g)].map((match) => match[1]));
}

function noteSlugs(directory: URL, prefix = ""): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		if (entry.name === "README.md") return [];
		const childPrefix = prefix ? `${prefix}/${entry.name}` : entry.name;
		if (entry.isDirectory()) return noteSlugs(new URL(`${entry.name}/`, directory), childPrefix);
		const extension = extname(entry.name);
		if (extension !== ".md" && extension !== ".mdx") return [];
		return [`${prefix ? `${prefix}/` : ""}${basename(entry.name, extension)}`];
	});
}

const catalog: ReferenceCatalog = {
	algorithm: new Set(problems.map((problem) => problem.slug)),
	ml: new Set(mlProblems.map((problem) => problem.slug)),
	sql: slugsFromSource("web/src/data/sqlProblems.ts"),
	note: new Set(noteSlugs(new URL("notes/", projectRoot))),
	"system-design": new Set(["sd-real-time-ml-inference"]),
};

test("the roadmap foundation validates against existing content", () => {
	assert.deepEqual(validateRoadmap(catalog), []);
});

test("every track reuses the same eight foundation modules", () => {
	const sharedIds = tracks[0].foundationIds;
	assert.equal(sharedIds.length, 8);
	assert.equal(new Set(sharedIds).size, 8);

	for (const track of tracks) {
		assert.deepEqual(track.foundationIds, sharedIds);
		assert.equal(modulesForTrack(track).length, 8);
	}
	assert.equal(modules.filter((module) => module.phase === "foundation").length, 8);
});

test("foundation weeks stay within the required time budget and produce evidence", () => {
	for (const module of modules) {
		assert.equal(totalHours(module.hours), 15, `${module.id} should use the 15-hour foundation budget`);
		assert.ok(module.deliverable.trim(), `${module.id} is missing a deliverable`);
		assert.ok(module.evidence.length > 0, `${module.id} is missing evidence`);
	}
});

test("course records are versioned and explain access and compute limits", () => {
	for (const course of courses) {
		assert.match(course.offering, /\d{4}/, `${course.id} has no offering year`);
		assert.match(course.url, /^https:\/\//, `${course.id} has no secure source URL`);
		assert.ok(course.accessNotes.trim(), `${course.id} has no access notes`);
		assert.ok(course.computeNotes.trim(), `${course.id} has no compute notes`);
	}
});

test("exercise links map to stable site routes", () => {
	assert.equal(
		exerciseHref({ domain: "algorithm", slug: "1-two-sum", label: "Two Sum" }),
		"/algorithms/1-two-sum/",
	);
	assert.equal(
		exerciseHref({ domain: "ml", slug: "scaled-dot-product-attention", label: "Attention" }),
		"/machine-learning/scaled-dot-product-attention/",
	);
	assert.equal(
		exerciseHref({ domain: "sql", slug: "customers-without-orders", label: "SQL" }),
		"/sql/customers-without-orders/",
	);
	assert.equal(
		exerciseHref({ domain: "note", slug: "asymptotic-analysis", label: "Analysis" }),
		"/notes/asymptotic-analysis/",
	);
});
