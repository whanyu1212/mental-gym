import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

// Run after the Astro build to check the actual Markdown-to-HTML output.
const html = readFileSync(
	new URL("../dist/notes/asymptotic-analysis/index.html", import.meta.url),
	"utf8",
);
const document = new JSDOM(html).window.document;
const examples = [...document.querySelectorAll(".worked-example")];
const halving = examples[2];

const titleIds = [
	"example-1--constant-inner-loop",
	"example-2--triangular-sum",
	"example-3--logarithmic-while-loop",
	"example-4--two-independent-passes",
	"example-5--binary-search--linear-work",
	"example-6--recursive-tree-two-branches",
	"example-7--memoised-recursion",
	"example-8--nested-recursion",
];

test("asymptotic note uses the shared page container", () => {
	assert.ok(document.querySelector("main.container > article.asymptotic-note"));
	assert.equal(document.querySelector(".container-wide"), null);
});

test("all eight examples share an accessible title, result, and derivation layout", () => {
	assert.equal(examples.length, 8);
	for (const [index, example] of examples.entries()) {
		const label = example.getAttribute("aria-labelledby");
		assert.equal(label, titleIds[index]);
		assert.equal(document.getElementById(label!), example.querySelector(":scope > h3"));
		assert.equal(example.querySelectorAll("h3").length, 1);
		assert.match(example.querySelector("h3")!.textContent!, new RegExp(`^Example ${index + 1} — `));
		assert.equal(example.querySelector(".example-eyebrow"), null);
		assert.equal(example.querySelectorAll(":scope > .example-result").length, 1);
		assert.ok(example.querySelector(".example-result .katex"));
		assert.match(example.querySelector(".example-result")!.textContent!, /Time/);
		assert.equal(example.querySelectorAll(":scope > .example-derivation").length, 1);
		assert.equal(example.querySelector(".example-derivation > h4")?.textContent, "Derivation");
		assert.equal(example.querySelectorAll(".worked-example, hr, details, .katex-error").length, 0);
	}
	assert.equal(document.querySelector(".halving-example"), null);
	assert.equal(document.querySelectorAll(".katex-error").length, 0);
	assert.equal(examples.at(-1)?.nextElementSibling?.textContent, "Common Mistakes");
});

test("each example keeps its own four-language code group", () => {
	for (const example of examples) {
		const groups = example.querySelectorAll(":scope > [data-code-tabs]");
		assert.equal(groups.length, 1);
		const panels = [...groups[0].querySelectorAll('[role="tabpanel"]')];
		assert.deepEqual(panels.map((panel) => panel.getAttribute("data-lang")), ["python", "julia", "typescript", "rust"]);
		assert.ok(panels.every((panel) => panel.querySelector("pre code")));
	}
});

test("halving explanation keeps three focused steps and its intuition callout", () => {
	assert.ok(halving);
	assert.ok(halving.querySelector("pre code")?.textContent?.includes("i = i // 2"));
	assert.equal(halving.querySelectorAll(".calculation-step h5").length, 3);
	assert.equal(halving.querySelector(".example-takeaway h4")?.textContent, "Why this stays fast");
});

test("vertical trace retains the iteration count and stopping value", () => {
	const table = halving?.querySelector(".calculation-step table");
	assert.ok(table);
	assert.equal(table.querySelectorAll("thead th").length, 3);
	const rows = [...table.querySelectorAll("tbody tr")];
	assert.equal(rows.length, 6);
	assert.deepEqual(
		rows.map((row) => row.querySelector("td")?.textContent?.trim()),
		["0", "1", "2", "3", "4", "5"],
	);
	assert.deepEqual(
		rows.map((row) => row.querySelector("td:last-child")?.textContent?.trim()),
		["16", "8", "4", "2", "1", "0 (stop)"],
	);
});

test("recursive derivations use numbered subsection headings", () => {
	for (const [index, count] of [[5, 4], [7, 3]]) {
		const steps = [...examples[index].querySelectorAll(".example-derivation h5")];
		assert.equal(steps.length, count);
		steps.forEach((step, stepIndex) => assert.match(step.textContent!, new RegExp(`^${stepIndex + 1}\\. `)));
	}
});
