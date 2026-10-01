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
const example = document.querySelector(".halving-example");

test("asymptotic note uses the shared page container", () => {
	assert.ok(document.querySelector("main.container > article.asymptotic-note"));
	assert.equal(document.querySelector(".container-wide"), null);
});

test("halving prototype has an accessible title and contains only Example 3", () => {
	assert.ok(example);
	const label = example.getAttribute("aria-labelledby");
	assert.equal(label, "example-3--logarithmic-while-loop");
	assert.equal(document.getElementById(label), example.querySelector("h3"));
	assert.equal(example.querySelectorAll("h3").length, 1);
	assert.ok(example.querySelector("pre code")?.textContent?.includes("i = i // 2"));
	assert.ok(example.querySelector(".example-result .katex"));
	assert.equal(example.querySelectorAll(".calculation-step h5").length, 6);
	assert.equal(example.querySelectorAll("details").length, 0);
	assert.equal(example.querySelectorAll(".katex-error").length, 0);
});

test("vertical trace retains the iteration count and stopping value", () => {
	const table = example?.querySelector(".calculation-step table");
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

test("other worked examples remain outside the prototype", () => {
	const titles = [...document.querySelectorAll("h3")].filter(
		(heading) => /^Example \d/.test(heading.textContent ?? ""),
	);
	assert.equal(titles.length, 8);
	assert.equal(titles.filter((heading) => example?.contains(heading)).length, 1);
});
