import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { extname } from "node:path";
import test from "node:test";

import { mlProblems } from "../src/data/mlProblems.ts";
import { problems } from "../src/data/problems.ts";
import { courses, modules } from "../src/data/roadmap.ts";

const projectRoot = new URL("../..", import.meta.url);
const notesRoot = new URL("notes/", projectRoot);
const courseIds = new Set(courses.map((course) => course.id));
const moduleIds = new Set(modules.map((module) => module.id));
const catalog = {
	algorithm: new Set(problems.map((problem) => problem.slug)),
	ml: new Set(mlProblems.map((problem) => problem.slug)),
	sql: new Set(
		[...readFileSync(new URL("web/src/data/sqlProblems.ts", projectRoot), "utf8").matchAll(/\bslug:\s*"([^"]+)"/g)].map(
			(match) => match[1],
		),
	),
	note: new Set<string>(),
	"system-design": new Set(["sd-real-time-ml-inference"]),
};

interface NoteFile {
	id: string;
	frontmatter: string;
}

function noteFiles(directory: URL, prefix = ""): NoteFile[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		if (entry.name === "README.md") return [];
		if (entry.isDirectory()) return noteFiles(new URL(`${entry.name}/`, directory), prefix ? `${prefix}/${entry.name}` : entry.name);
		const extension = extname(entry.name);
		if (extension !== ".md" && extension !== ".mdx") return [];
		const id = `${prefix ? `${prefix}/` : ""}${entry.name.slice(0, -extension.length)}`;
		const text = readFileSync(new URL(entry.name, directory), "utf8");
		const fence = text.match(/^---\n([\s\S]*?)\n---/);
		assert.ok(fence, `${id} is missing frontmatter`);
		return [{ id, frontmatter: fence[1] }];
	});
}

function scalar(frontmatter: string, name: string): string | undefined {
	const match = frontmatter.match(new RegExp(`^${name}:\\s*(.+)\\s*$`, "m"));
	if (!match) return undefined;
	return match[1].replace(/^["']|["']$/g, "").trim();
}

function relatedExercises(frontmatter: string): { domain: string; slug: string }[] {
	const block = frontmatter.match(/^relatedExercises:\n((?:  .*\n)*)/m);
	if (!block) return [];
	const entries: { domain: string; slug: string }[] = [];
	for (const chunk of block[1].split(/  - /).filter(Boolean)) {
		const domain = chunk.match(/domain:\s*(\S+)/)?.[1];
		const slug = chunk.match(/slug:\s*(\S+)/)?.[1];
		if (domain && slug) entries.push({ domain, slug });
	}
	return entries;
}

const notes = noteFiles(notesRoot);
catalog.note = new Set(notes.map((note) => note.id));

test("existing note URLs stay stable", () => {
	for (const id of [
		"asymptotic-analysis",
		"ml-logistic-regression",
		"two_pointers",
		"recommendation-system/metrics",
	]) {
		assert.ok(catalog.note.has(id), `missing published note ${id}`);
	}
});

test("roadmap course and module IDs on notes are real", () => {
	for (const note of notes) {
		const courseId = scalar(note.frontmatter, "courseId");
		const moduleId = scalar(note.frontmatter, "moduleId");
		if (courseId) assert.ok(courseIds.has(courseId), `${note.id} has unknown courseId ${courseId}`);
		if (moduleId) assert.ok(moduleIds.has(moduleId), `${note.id} has unknown moduleId ${moduleId}`);
		for (const exercise of relatedExercises(note.frontmatter)) {
			const slugs = catalog[exercise.domain as keyof typeof catalog];
			assert.ok(slugs, `${note.id} has unknown exercise domain ${exercise.domain}`);
			assert.ok(slugs.has(exercise.slug), `${note.id} has unknown ${exercise.domain} ${exercise.slug}`);
		}
	}
});

test("templates and the labeled course-note example are present", () => {
	const byId = new Map(notes.map((note) => [note.id, note]));
	for (const id of ["templates/course-note", "templates/weekly-review", "templates/weekly-review-example"]) {
		const note = byId.get(id);
		assert.ok(note, `missing ${id}`);
		assert.equal(scalar(note.frontmatter, "kind"), "template");
	}

	const example = byId.get("roadmap/examples/foundation-01-course-note");
	assert.ok(example, "missing labeled course-note example");
	assert.equal(scalar(example.frontmatter, "kind"), "course");
	assert.equal(scalar(example.frontmatter, "courseId"), "stanford-cs229-2022");
	assert.equal(scalar(example.frontmatter, "moduleId"), "foundation-01-python-and-complexity");
	assert.ok(relatedExercises(example.frontmatter).length > 0);
});

test("notes README documents the collection schema", () => {
	const readme = readFileSync(new URL("notes/README.md", projectRoot), "utf8");
	for (const phrase of ["kind", "courseId", "moduleId", "relatedExercises", "private"]) {
		assert.ok(readme.includes(phrase), `README missing ${phrase}`);
	}
	assert.match(readme, /kind: template/);
	assert.match(readme, /Use `\.mdx` \*\*only\*\*/);
	assert.match(readme, /Keep prose-only notes as `\.md`/);
});
