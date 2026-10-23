import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";
import { COMPLEXITY_CURVES } from "../src/lib/complexity-curves.ts";

const document = new JSDOM(readFileSync(new URL("../dist/notes/asymptotic-analysis/index.html", import.meta.url), "utf8")).window.document;

test("reading map has a visible label, section previews, and working section links", () => {
	const nav = document.querySelector("nav.note-toc")!;
	assert.ok(nav);
	const label = document.getElementById(nav.getAttribute("aria-labelledby")!);
	assert.ok(label && nav.contains(label));
	assert.equal(label.textContent, "Contents");
	assert.equal(nav.querySelector(".note-toc-count")?.textContent, "10 sections");
	assert.equal(nav.querySelector("svg")?.getAttribute("aria-hidden"), "true");
	assert.ok(nav.querySelector("ol[role='list']"));
	const links = [...nav.querySelectorAll("ol > li > a")];
	assert.equal(links.length, 10);
	for (const link of links) {
		assert.ok(link.querySelector(".note-toc-copy > strong")?.textContent?.trim());
		assert.ok(link.querySelector(".note-toc-copy > span")?.textContent?.trim());
		const target = document.getElementById(link.getAttribute("href")!.slice(1));
		assert.ok(target, link.textContent!);
		assert.equal(target.tagName, "H2");
	}
});

test("cost model is a labelled callout with its assumptions and rendered math", () => {
	const callout = document.querySelector("aside.note-callout")!;
	assert.ok(callout);
	const label = document.getElementById(callout.getAttribute("aria-labelledby")!);
	assert.equal(label?.textContent, "Cost model for this note");
	assert.ok(label && callout.contains(label));
	assert.ok(callout.querySelector(".katex"));
	assert.match(callout.textContent!, /including allocated results unless stated otherwise/);
	assert.match(callout.textContent!, /arbitrary-precision integers or long strings/);
});

test("the three main notation definitions keep their headings and equations together", () => {
	const definitions = [...document.querySelectorAll("section.notation-definition")];
	assert.equal(definitions.length, 3);
	for (const definition of definitions) {
		assert.equal(document.getElementById(definition.getAttribute("aria-labelledby")!), definition.querySelector(":scope > h3"));
		assert.equal(definition.querySelectorAll(".katex-display").length, 1);
		assert.ok(definition.querySelector(".katex-display annotation")?.textContent?.includes("\\iff"));
		assert.ok(definition.querySelector(":scope > h3 + p"));
	}
});

test("reference tables sit in labelled, keyboard-focusable scroll regions", () => {
	const regions = [...document.querySelectorAll(".note-table")];
	assert.equal(regions.length, 10);
	assert.equal(document.querySelectorAll("article.asymptotic-note > table").length, 0);
	for (const region of regions) {
		assert.equal(region.getAttribute("role"), "region");
		assert.equal(region.getAttribute("tabindex"), "0");
		const labelId = region.getAttribute("aria-labelledby");
		assert.ok(labelId ? document.getElementById(labelId)?.textContent : region.getAttribute("aria-label"));
		assert.equal(region.querySelectorAll(":scope > table").length, 1);
		assert.ok(region.querySelector("thead th"));
		assert.ok(region.querySelector("tbody td"));
	}
});

test("growth chart is beside the complexity classes, not appended after the note", () => {
	const chart = document.querySelector(".complexity-chart")!;
	assert.ok(chart.closest("article.asymptotic-note"));
	assert.ok(document.getElementById("common-complexity-classes")!.compareDocumentPosition(chart) & 4);
	assert.ok(chart.compareDocumentPosition(document.getElementById("analysing-recursive-algorithms")!) & 4);
	assert.equal(document.querySelectorAll("#complexity-chart").length, 1);
	assert.equal(document.querySelectorAll("#growth-rate-visualised").length, 1);
});

test("legend is server-rendered with scoped line styles and all nine growth classes", () => {
	const figure = document.querySelector(".complexity-chart")!;
	const scope = figure.getAttributeNames().find((name) => name.startsWith("data-astro-cid-"));
	assert.ok(scope);
	const items = [...figure.querySelectorAll(".chart-legend li")];
	assert.deepEqual(items.map((item) => item.getAttribute("data-curve")), COMPLEXITY_CURVES.map((curve) => curve.id));
	for (const item of items) {
		const line = item.querySelector(".legend-line")!;
		assert.ok(line.hasAttribute(scope));
		assert.match(line.getAttribute("style")!, /--curve-color:var\(--curve-/);
		assert.ok(item.querySelector("strong")!.textContent);
	}
	const caption = figure.querySelector("figcaption")!.textContent!;
	assert.match(caption, /Both axes use logarithmic scales/);
	assert.match(caption, /above 1 billion are omitted/);
	const table = figure.querySelector(".chart-values table")!;
	assert.equal(table.getAttribute("tabindex"), "0");
	assert.match(table.getAttribute("aria-label")!, /scroll horizontally/);
	const factorial = figure.querySelector(".chart-values tbody tr:last-child")!;
	assert.equal(factorial.querySelector("td")?.textContent, "24");
	assert.equal(factorial.querySelectorAll("td")[2].textContent, "> 1 billion");
});

test("MDX preserves the note's Markdown tables, including the Master Theorem conditions", () => {
	const tables = [...document.querySelectorAll("article table")];
	assert.ok(tables.length >= 10);
	const master = tables.find((table) => table.textContent?.includes("Case 3"));
	assert.ok(master);
	assert.ok(master.querySelectorAll("annotation").length > 0);
	assert.ok([...master.querySelectorAll("annotation")].some((node) => node.textContent?.includes("a f(n/b)")));
	assert.ok([...master.querySelectorAll("annotation")].some((node) => node.textContent?.includes("\\rho < 1")));
	assert.ok(![...document.querySelectorAll("article p")].some((p) => p.textContent?.includes("|---")));
});

test("all ten review answers are native, closed disclosures with rendered math", () => {
	const answers = [...document.querySelectorAll("details.review-answer")];
	assert.equal(answers.length, 10);
	assert.equal(document.querySelectorAll("section.review-question").length, 10);
	for (const answer of answers) {
		const question = answer.closest("section.review-question")!;
		assert.ok(question);
		assert.equal(document.getElementById(question.getAttribute("aria-labelledby")!), question.querySelector(":scope > h3"));
		assert.ok(question.querySelector(":scope > h3 + p"));
		assert.equal(question.querySelectorAll("details").length, 1);
		assert.equal(answer.hasAttribute("open"), false);
		assert.equal(answer.querySelector(":scope > summary")?.textContent, "Show answer");
		assert.ok(answer.querySelector("p"));
	}
	assert.ok(answers[0].querySelector(".katex"));
	assert.match(answers[0].textContent!, /Binary search/);
	assert.match(answers[0].textContent!, /Keep the case fixed/);
	assert.equal(document.querySelectorAll(".katex-error").length, 0);
});
