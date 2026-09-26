import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

import { freeIdentifiers, topLevelBindings } from "./free-identifiers.ts";

/**
 * An Astro component's frontmatter runs at build time and its <script> runs in
 * the browser, so a name declared in the frontmatter does not exist in the
 * script. Using one throws a ReferenceError in the browser, which is how five
 * animations broke (maxH, maxPrice, allKeys, list1/list2). This test catches
 * that: a frontmatter `const` must not be a free (unbound) identifier in any
 * client script. The script is parsed with the TypeScript parser, so a read
 * like `draw(maxH)` is told apart from a binding like `(maxH) => ...`.
 */

// Pages and layouts have the same frontmatter/script split as components.
const srcDir = new URL("../src/", import.meta.url);

function astroFiles(dir: URL): URL[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		if (entry.isDirectory()) return astroFiles(new URL(`${entry.name}/`, dir));
		return entry.name.endsWith(".astro") ? [new URL(entry.name, dir)] : [];
	});
}

/**
 * Names a `<script define:vars={{ a, b: expr }}>` tag injects into its body.
 * Astro serialises exactly these into the script, so they are bound there.
 */
export function defineVarsNames(attrs: string): Set<string> {
	const names = new Set<string>();
	const body = /define:vars=\{\{([\s\S]*?)\}\}/.exec(attrs)?.[1];
	if (!body) return names;
	for (const part of body.split(",")) {
		const key = /^\s*(?:["']([^"']+)["']|([A-Za-z_$][\w$]*))\s*(?::|$)/.exec(part);
		if (key) names.add(key[1] ?? key[2]);
	}
	return names;
}

/**
 * Every client script in an .astro file. Bundled (processed) scripts and
 * `is:inline` scripts both run in the browser without the frontmatter's
 * bindings; the only names an inline script is given are its `define:vars`.
 */
export function clientScripts(source: string): { body: string; provided: Set<string> }[] {
	return [...source.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)]
		.filter((m) => !/\btype=["'](?!module|text\/javascript)/.test(m[1] ?? "")) // skip JSON/ld+json etc.
		.map((m) => ({ body: m[2], provided: defineVarsNames(m[1] ?? "") }));
}

test("client scripts do not read build-time frontmatter constants", () => {
	const problems: string[] = [];
	for (const file of astroFiles(srcDir)) {
		const source = readFileSync(file, "utf8");
		const frontmatter = /^---\n([\s\S]*?)\n---/.exec(source)?.[1];
		if (!frontmatter) continue;
		// Every top-level binding, parsed rather than pattern-matched, so
		// `const a = 1, maxH = 2` and `const { maxH } = config` are included.
		const buildNames = topLevelBindings(frontmatter);
		for (const { body, provided } of clientScripts(source)) {
			const free = freeIdentifiers(body);
			for (const name of buildNames) {
				if (free.has(name) && !provided.has(name)) {
					problems.push(`${file.pathname.split("/src/")[1]}: '${name}' is a frontmatter const used in a client script`);
				}
			}
		}
	}
	assert.deepEqual(problems, []);
});

test("inline scripts are checked, and define:vars names count as provided", () => {
	const scripts = clientScripts(`
<script>draw(a);</script>
<script is:inline>draw(b);</script>
<script is:inline define:vars={{ maxH, "list1": first, total: n + 1 }}>draw(maxH, list1, total);</script>
<script type="application/ld+json">{"maxH": 1}</script>
`);
	assert.equal(scripts.length, 3, "processed and inline scripts are included; JSON data scripts are not");
	assert.ok(freeIdentifiers(scripts[1].body).has("b"), "an is:inline body is analysed like any other");
	assert.deepEqual([...scripts[2].provided].sort(), ["list1", "maxH", "total"]);
	assert.equal(scripts[0].provided.size, 0);
});

test("topLevelBindings finds every frontmatter binding", () => {
	const names = topLevelBindings(`
import Player from "./Player.astro";
import type { Step } from "./types";
import { a, type B } from "./x";
const first = 1, maxH = 2;
const { maxPrice, nested: { allKeys } } = config;
const [list1, , list2] = pair;
let mutable = 0;
function helper() {}
class Model {}
`);
	for (const name of ["Player", "a", "first", "maxH", "maxPrice", "allKeys", "list1", "list2", "mutable", "helper", "Model"]) {
		assert.ok(names.has(name), `missing ${name}`);
	}
	// Type-only imports, destructured property keys and the skipped hole are not bindings.
	for (const name of ["Step", "B", "nested", "config", "pair"]) {
		assert.ok(!names.has(name), `unexpected ${name}`);
	}
});

test("freeIdentifiers tells reads from bindings", () => {
	const flags = (code: string) => freeIdentifiers(code).has("maxH");
	// Reads with nothing binding them: must be flagged. Several of these slipped
	// past the earlier regex-based check.
	for (const code of [
		"draw(maxH);",
		"const a = [maxH];",
		"f(a, maxH);",
		"const o = { v: maxH };",
		"const x = (maxH / 2);",
		"const s = `${(n / maxH) * 100}%`;",
		"const o = { maxH };",
		"class A extends HTMLElement { go() { return 1 / maxH; } }",
		"function f(a = maxH) { return a; }",
	]) {
		assert.ok(flags(code), `should flag: ${code}`);
	}
	// Bindings, properties, keys, types, strings and comments: must not be flagged.
	for (const code of [
		"const maxH = 3; use(maxH);",
		"const f = (maxH) => maxH * 2;",
		"const f = maxH => maxH;",
		"function f(a, maxH) { return maxH; }",
		"const { maxH } = cfg; use(maxH);",
		"const [maxH, b] = pair; use(maxH);",
		"for (const maxH of xs) use(maxH);",
		"try {} catch (maxH) { log(maxH); }",
		"this.maxH = 1; use(this.maxH);",
		"const o = { maxH: 1 };",
		"class A {\n  maxH!: number;\n  go() { return this.maxH; }\n}",
		"let a: maxH;",
		"// maxH\nconst s = 'maxH';",
		"use(maxH); function maxH() {}",
	]) {
		assert.ok(!flags(code), `should not flag: ${code}`);
	}
});
