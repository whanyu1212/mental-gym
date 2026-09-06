import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { basename, extname } from "node:path";
import test from "node:test";

import { mlProblems } from "../src/data/mlProblems.ts";
import { problems } from "../src/data/problems.ts";
import {
	courses,
	exerciseHref,
	moduleHref,
	modules,
	modulesForTrack,
	noteCourseId,
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

test("the complete roadmap validates against existing content", () => {
	assert.deepEqual(validateRoadmap(catalog), []);
});

test("every track has 24 ordered weeks and reuses the shared foundation", () => {
	const sharedIds = tracks[0].foundationIds;
	assert.equal(sharedIds.length, 8);
	assert.equal(new Set(sharedIds).size, 8);
	assert.equal(modules.filter((module) => module.phase === "foundation").length, 8);

	for (const track of tracks) {
		const scheduled = modulesForTrack(track);
		assert.deepEqual(track.foundationIds, sharedIds);
		assert.equal(track.specializationIds.length, 12);
		assert.equal(track.capstoneIds.length, 4);
		assert.equal(scheduled.length, 24);

		const weekById = new Map(scheduled.map((module, index) => [module.id, index + 1]));
		for (const [index, module] of scheduled.entries()) {
			assert.equal(module.phase, index < 8 ? "foundation" : index < 20 ? "specialization" : "capstone");
			for (const prerequisiteId of module.prerequisiteIds) {
				assert.ok(
					(weekById.get(prerequisiteId) ?? Number.POSITIVE_INFINITY) < index + 1,
					`${module.id} prerequisite ${prerequisiteId} must appear earlier`,
				);
			}
		}
	}
});

test("every week fits the required budget and produces concrete evidence", () => {
	for (const module of modules) {
		assert.equal(totalHours(module.hours), 15, `${module.id} should use the 15-hour weekly budget`);
		assert.ok(module.resources.length > 0, `${module.id} is missing selected course material`);
		assert.ok(module.exercises.length > 0, `${module.id} is missing linked practice`);
		assert.ok(module.deliverable.trim(), `${module.id} is missing a deliverable`);
		assert.ok(module.evidence.length > 0, `${module.id} is missing evidence`);
	}
});

test("each track curates 20 to 30 distinct ML drills", () => {
	for (const track of tracks) {
		const mlSlugs = new Set(
			modulesForTrack(track)
				.flatMap((module) => module.exercises)
				.filter((exercise) => exercise.domain === "ml")
				.map((exercise) => exercise.slug),
		);
		assert.ok(
			mlSlugs.size >= 20 && mlSlugs.size <= 30,
			`${track.id} curates ${mlSlugs.size} distinct ML drills`,
		);
	}
});

test("the roadmap overview explains phase-specific hour allocations", () => {
	const overview = readFileSync(new URL("web/src/pages/roadmap/index.astro", projectRoot), "utf8");

	for (const statement of [
		"Shared foundation pacing",
		"ML Infrastructure and Model / Post-training move the two language hours to implementation",
		"Capstone weeks use 3 hours of study, 9 implementation, 3 interview practice, and no language block",
		"Every week remains within 15 hours",
	]) {
		assert.ok(overview.includes(statement), `roadmap overview is missing: ${statement}`);
	}
});

test("course records cover the planned Stanford material and explain limitations", () => {
	const courseCodes = new Set(courses.map((course) => course.code));
	for (const code of ["CS229", "CS230", "CS224N", "CS276", "CS145", "CS229S", "CS336", "CS224V", "CS329S"]) {
		assert.ok(courseCodes.has(code), `missing ${code}`);
	}

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
	assert.equal(moduleHref("foundation-01-python-and-complexity"), "/roadmap/applied-ai/#week-1");
	assert.equal(moduleHref("missing-module"), undefined);
	assert.equal(
		noteCourseId({ moduleId: "foundation-01-python-and-complexity" }),
		"stanford-cs229-2022",
	);
	assert.equal(
		noteCourseId({ courseId: "stanford-cs145-2024", moduleId: "foundation-01-python-and-complexity" }),
		"stanford-cs145-2024",
	);
	assert.equal(noteCourseId({ moduleId: "missing-module" }), undefined);
});
