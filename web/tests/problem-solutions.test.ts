import assert from "node:assert/strict";
import test from "node:test";
import { getProblemSolutions } from "../src/lib/problem-solutions.ts";

test("Rust-only problems have a Rust default rather than an empty Python panel", () => {
	assert.deepEqual(getProblemSolutions({ rust: "fn solve() {}" }), [
		{ language: "rust", label: "Rust", code: "fn solve() {}" },
	]);
});

test("Julia-only and TypeScript-only implementations are supported", () => {
	assert.equal(getProblemSolutions({ julia: "solve() = 1" })[0].language, "julia");
	assert.equal(getProblemSolutions({ typescript: "const solve = () => 1;" })[0].label, "TypeScript");
});

test("tabs follow a stable language order and omit empty implementations", () => {
	assert.deepEqual(
		getProblemSolutions({ rust: "rust", typescript: "ts", julia: "  ", python: "py" }).map((s) => s.language),
		["python", "typescript", "rust"],
	);
	assert.deepEqual(getProblemSolutions({}), []);
});
