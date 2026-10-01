import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path: string) =>
	readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");

test("header and main share the 1280px container without a page-specific opt-in", () => {
	const layout = source("layouts/Layout.astro");
	assert.match(layout, /<div class="container">/);
	assert.match(layout, /<main class="container page-content">/);
	assert.match(layout, /\.container\s*\{[^}]*max-width:\s*1280px;/);
	assert.doesNotMatch(layout, /container-wide|wide\?:/);
});

test("reading measure widens only at the desktop breakpoint", () => {
	const tokens = source("styles/tokens.css");
	assert.match(tokens, /--measure:\s*68ch;/);
	assert.match(tokens, /@media\s*\(min-width:\s*1000px\)\s*\{\s*:root\s*\{\s*--measure:\s*80ch;/);
	assert.doesNotMatch(source("pages/notes/[...slug].astro"), /--measure:|wide=/);
});

test("notes index does not retain a narrower page container", () => {
	assert.match(
		source("pages/notes/index.astro"),
		/\.notes-container\s*\{[^}]*max-width:\s*100%;/,
	);
});
