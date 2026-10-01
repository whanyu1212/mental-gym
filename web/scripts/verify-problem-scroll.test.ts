import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

// Run after the Astro build to verify the rendered table structure.
const document = new JSDOM(readFileSync(
	new URL("../dist/problems/index.html", import.meta.url), "utf8",
)).window.document;

for (const section of ["algo-section", "ml-section", "sql-section"]) {
	test(`${section} keeps every table in a named, focusable scroll region`, () => {
		const tables = [...document.querySelectorAll(`#${section} .problem-table`)];
		assert.ok(tables.length > 0);
		for (const table of tables) {
			const region = table.parentElement!;
			assert.ok(region.classList.contains("table-scroll"));
			assert.equal(region.getAttribute("role"), "region");
			assert.equal(region.getAttribute("tabindex"), "0");
			assert.ok(region.getAttribute("aria-label")?.trim());
			assert.equal(table.querySelectorAll("thead th").length, 5);
			assert.ok(table.querySelector("tbody a[href]"));
		}
	});
}

test("all four domain controls remain available", () => {
	assert.deepEqual(
		[...document.querySelectorAll(".section-tab")].map(button => button.getAttribute("data-target")),
		["algo-section", "ml-section", "sql-section", "sd-section"],
	);
});
