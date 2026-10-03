import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";
import { problems } from "../src/data/problems.ts";
import { getProblemSolutions } from "../src/lib/problem-solutions.ts";

test("every built problem renders exactly its available languages and one default panel", () => {
	for (const problem of problems) {
		const document = new JSDOM(readFileSync(
			new URL(`../dist/algorithms/${problem.slug}/index.html`, import.meta.url), "utf8",
		)).window.document;
		const solutions = getProblemSolutions(problem.solutions);
		const panels = [...document.querySelectorAll(".code-panel[data-lang-panel]")];
		assert.ok(solutions.length > 0, `${problem.slug}: no implementation`);
		assert.deepEqual(panels.map((p) => p.getAttribute("data-lang-panel")), solutions.map((s) => s.language), problem.slug);
		assert.deepEqual(panels.filter((p) => !p.classList.contains("hidden")).map((p) => p.getAttribute("data-lang-panel")), [solutions[0].language], problem.slug);
		assert.ok(panels.every((p) => p.querySelector("pre code")?.textContent?.trim()), problem.slug);
		const tabs = [...document.querySelectorAll(".lang-tab[data-lang]")];
		assert.deepEqual(tabs.map((t) => t.getAttribute("data-lang")), solutions.length > 1 ? solutions.map((s) => s.language) : [], problem.slug);
		if (tabs.length > 0) {
			assert.deepEqual(tabs.filter((t) => t.classList.contains("active")).map((t) => t.getAttribute("data-lang")), [solutions[0].language], problem.slug);
		}
	}
});

test("Minimum Window Substring's catalog entry and breadcrumb point to Sliding Window", () => {
	const page = new JSDOM(readFileSync(
		new URL("../dist/algorithms/76-minimum-window-substring/index.html", import.meta.url), "utf8",
	)).window.document;
	assert.ok(page.querySelector('.breadcrumb a[href$="#algo-sliding-window"]'));
	assert.equal(page.querySelector('.breadcrumb a[href$="#algo-stack"]'), null);
	const catalog = new JSDOM(readFileSync(
		new URL("../dist/problems/index.html", import.meta.url), "utf8",
	)).window.document;
	const selector = 'a[href$="/algorithms/76-minimum-window-substring/"]';
	assert.ok(catalog.querySelector(`#algo-sliding-window ${selector}`));
	assert.equal(catalog.querySelector(`#algo-stack ${selector}`), null);
});
