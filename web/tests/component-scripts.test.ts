import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

import ts from "typescript";

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
	const start = attrs.search(/define:vars\s*=\s*\{/);
	if (start < 0) return names;
	// The attribute value is a JSX-style `{expr}`; take it by brace matching so
	// nested objects and strings containing `}` do not end it early.
	const open = attrs.indexOf("{", start);
	const close = matchingBrace(attrs, open);
	if (close < 0) return names;
	const expr = attrs.slice(open + 1, close);
	const parsed = ts.createSourceFile("vars.ts", `(${expr});`, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
	const st = parsed.statements[0];
	let value = st && ts.isExpressionStatement(st) ? st.expression : undefined;
	while (value && ts.isParenthesizedExpression(value)) value = value.expression;
	if (!value || !ts.isObjectLiteralExpression(value)) return names;
	// Only top-level properties become variables in the script.
	for (const prop of value.properties) {
		if (ts.isShorthandPropertyAssignment(prop)) names.add(prop.name.text);
		else if (ts.isPropertyAssignment(prop)) {
			const key = prop.name;
			if (ts.isIdentifier(key) || ts.isStringLiteral(key) || ts.isNoSubstitutionTemplateLiteral(key)) names.add(key.text);
		}
	}
	return names;
}

/** Index of the `}` matching the `{` at `open`, skipping string and template literals. */
function matchingBrace(text: string, open: number): number {
	let depth = 0;
	for (let i = open; i < text.length; i++) {
		const ch = text[i];
		if (ch === '"' || ch === "'" || ch === "`") {
			for (i++; i < text.length && text[i] !== ch; i++) if (text[i] === "\\") i++;
			continue;
		}
		if (ch === "{") depth++;
		else if (ch === "}" && --depth === 0) return i;
	}
	return -1;
}

/** End of an opening tag starting at `from`: the first `>` outside `{...}` and quotes. */
function openingTagEnd(text: string, from: number): number {
	for (let i = from; i < text.length; i++) {
		const ch = text[i];
		if (ch === ">") return i;
		if (ch === "{") {
			const close = matchingBrace(text, i);
			if (close < 0) return -1;
			i = close;
		} else if (ch === '"' || ch === "'") {
			for (i++; i < text.length && text[i] !== ch; i++);
		}
	}
	return -1;
}

/**
 * Every client script in an .astro file. Bundled (processed) scripts and
 * `is:inline` scripts both run in the browser without the frontmatter's
 * bindings; the only names an inline script is given are its `define:vars`.
 */
export function clientScripts(source: string): { body: string; provided: Set<string> }[] {
	const scripts: { body: string; provided: Set<string> }[] = [];
	const opener = /<script(?=[\s>])/g;
	for (let m = opener.exec(source); m; m = opener.exec(source)) {
		// Find the tag's real end: `define:vars={{ a: { b: 1 } }}` contains `>`-free
		// but brace-nested values, and a naive `[^>]*` would still be fooled by
		// a `>` inside an expression such as `{ ok: a > b }`.
		const attrsStart = m.index + m[0].length;
		const tagEnd = openingTagEnd(source, attrsStart);
		if (tagEnd < 0) break;
		const bodyEnd = source.indexOf("</script>", tagEnd);
		if (bodyEnd < 0) break;
		const attrs = source.slice(attrsStart, tagEnd);
		if (isExecutableScriptType(scriptType(attrs))) {
			scripts.push({ body: source.slice(tagEnd + 1, bodyEnd), provided: defineVarsNames(attrs) });
		}
		opener.lastIndex = bodyEnd + "</script>".length;
	}
	return scripts;
}

/** The raw `type` attribute value, or null when the attribute is absent. */
function scriptType(attrs: string): string | null {
	const at = /(?:^|\s)type\s*=\s*/i.exec(attrs);
	if (!at) return null;
	const rest = attrs.slice(at.index + at[0].length);
	// Astro also accepts an expression: `type={"module"}` or `type={kind}`.
	if (rest.startsWith("{")) {
		const close = matchingBrace(rest, 0);
		const literal = literalString(rest.slice(1, close < 0 ? rest.length : close));
		// A value we cannot resolve statically might be executable, so treat it
		// as a classic script and analyse the body rather than skip it.
		return literal ?? "";
	}
	const m = /^(?:"([^"]*)"|'([^']*)'|([^\s>]+))/.exec(rest);
	return m ? (m[1] ?? m[2] ?? m[3] ?? "") : "";
}

/** The value of a string-literal expression (`"a"`, `'a'`, `` `a` ``), or null. */
function literalString(expr: string): string | null {
	const parsed = ts.createSourceFile("t.ts", `(${expr});`, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
	const st = parsed.statements[0];
	let value = st && ts.isExpressionStatement(st) ? st.expression : undefined;
	while (value && ts.isParenthesizedExpression(value)) value = value.expression;
	return value && (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) ? value.text : null;
}

// The HTML spec's JavaScript MIME type essence matches, all run as classic
// scripts: https://html.spec.whatwg.org/multipage/scripting.html#javascript-mime-type
const JS_MIME_TYPES = new Set(
	[
		"application/ecmascript", "application/javascript", "application/x-ecmascript", "application/x-javascript",
		"text/ecmascript", "text/javascript", "text/javascript1.0", "text/javascript1.1", "text/javascript1.2",
		"text/javascript1.3", "text/javascript1.4", "text/javascript1.5", "text/jscript", "text/livescript",
		"text/x-ecmascript", "text/x-javascript",
	],
);

/**
 * Whether a browser executes a <script> with this `type`, per the HTML spec:
 * absent or empty (after trimming) runs as a classic script, `module` runs as
 * a module, and a JavaScript MIME type essence (case-insensitive, parameters
 * such as `;charset=utf-8` ignored) runs as classic. Anything else, such as
 * `application/json` or `application/ld+json`, is a data block and never runs.
 */
export function isExecutableScriptType(type: string | null): boolean {
	if (type === null) return true;
	const trimmed = type.trim().toLowerCase();
	if (trimmed === "" || trimmed === "module") return true;
	return JS_MIME_TYPES.has(trimmed.split(";")[0].trim());
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

test("define:vars counts only the object's top-level keys", () => {
	const names = (attrs: string) => [...defineVarsNames(attrs)].sort();
	// Nested keys are not injected: only `config` becomes a variable.
	assert.deepEqual(names(` is:inline define:vars={{ config: { ok: true, maxH: 1 } }}`), ["config"]);
	assert.deepEqual(names(` define:vars={{ a, "b": 1, c: [1, { d: 2 }], e: fn(x, { f: 1 }) }}`), ["a", "b", "c", "e"]);
	// Commas, braces and `>` inside strings or expressions do not confuse it.
	assert.deepEqual(names(` define:vars={{ label: "x, }, y", ok: a > b }}`), ["label", "ok"]);
	assert.deepEqual(names(" define:vars={{ t: `a,${b}` }}"), ["t"]);
	assert.deepEqual(names(` is:inline`), []);

	// End to end: the nested `maxH` is not treated as provided, so a read of it
	// in the body is still caught; a `>` in the attribute does not end the tag.
	const [script] = clientScripts(`<script is:inline define:vars={{ config: { ok: a > b, maxH: 1 } }}>draw(maxH);</script>`);
	assert.deepEqual([...script.provided], ["config"]);
	assert.equal(script.body, "draw(maxH);");
	assert.ok(freeIdentifiers(script.body).has("maxH") && !script.provided.has("maxH"));
});

test("script types follow the HTML spec's executable-type rule", () => {
	const runs: (string | null)[] = [
		null, "", "  ", "module", "MODULE",
		"text/javascript", "application/javascript", "application/x-javascript", "text/ecmascript",
		"TEXT/JavaScript", " text/javascript ", "text/javascript; charset=utf-8", "text/jscript", "text/javascript1.5",
	];
	const dataOnly = ["application/json", "application/ld+json", "text/plain", "text/html", "importmap", "speculationrules", "text/x-template"];
	for (const t of runs) assert.ok(isExecutableScriptType(t), `should run: ${JSON.stringify(t)}`);
	for (const t of dataOnly) assert.ok(!isExecutableScriptType(t), `should be data: ${t}`);

	// And end to end through the tag parser, with every quoting style.
	const bodies = clientScripts(`
<script is:inline type="application/javascript">a();</script>
<script is:inline type=''>b();</script>
<script type=module>c();</script>
<script is:inline type="application/json">{"d": 1}</script>
`).map((s) => s.body);
	assert.deepEqual(bodies, ["a();", "b();", "c();"]);

	// Astro's expression form: literal values are resolved, and a value that
	// cannot be resolved statically is analysed rather than skipped.
	const fromExpressions = clientScripts(`
<script is:inline type={"module"}>a();</script>
<script is:inline type={'text/javascript'}>b();</script>
<script is:inline type={kind}>c();</script>
<script is:inline type={"application/json"}>{"d": 1}</script>
<script is:inline data-type="application/json">e();</script>
`).map((s) => s.body);
	assert.deepEqual(fromExpressions, ["a();", "b();", "c();", "e();"], "data-type is not the type attribute");
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

	// `var` is script-scoped wherever it appears; let/const and inner functions' vars are not.
	const nested = topLevelBindings(`
if (enabled) { var a = 8; }
for (var b = 0; b < 3; b++) {}
for (var c of xs) {}
try { var d = 1; } catch { var e = 2; } finally { var f = 3; }
switch (x) { case 1: var g = 1; }
{ let blockLet = 1; const blockConst = 2; }
function inner() { var hidden = 1; }
const arrow = () => { var hidden2 = 1; };
class K { static { var hidden3 = 1; } }
`);
	for (const name of ["a", "b", "c", "d", "e", "f", "g", "inner", "arrow", "K"]) assert.ok(nested.has(name), `missing ${name}`);
	for (const name of ["blockLet", "blockConst", "hidden", "hidden2", "hidden3"]) assert.ok(!nested.has(name), `unexpected ${name}`);
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
		// Defaults and computed keys inside a destructured binding.
		"function f({ scale = maxH } = {}) { return scale; }",
		"const f = ({ a: { b = maxH } = {} }) => b;",
		"function f([a = maxH]) { return a; }",
		"const f = ({ [maxH]: v }) => v;",
		"try {} catch ({ message = maxH }) { log(message); }",
		"const { a = maxH } = cfg;",
		// Class positions evaluated at runtime.
		"class A extends maxH {}",
		"class A { [maxH]() {} }",
		"class A { x = maxH; }",
		"class A { static { use(maxH); } }",
		// ...but it never escapes its function, and let/const stay block-scoped.
		"function f() { var maxH = 1; } draw(maxH);",
		"const f = () => { var maxH = 1; }; draw(maxH);",
		"class A { static { var maxH = 1; } } draw(maxH);",
		"if (enabled) { let maxH = 1; } draw(maxH);",
		"for (let maxH = 0; maxH < 3; maxH++) {} draw(maxH);",
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
		"function f(a, { b = a } = {}) { return b; }",
		"function f(maxH, { b = maxH } = {}) { return b; }",
		"function f({ maxH: renamed }) { return renamed; }",
		"class A implements maxH {}",
		"class A { maxH() {} }",
		// `var` is function-scoped: declared in a nested block, it is bound after it.
		"if (enabled) { var maxH = 1; } draw(maxH);",
		"for (var maxH = 0; maxH < 3; maxH++) {} draw(maxH);",
		"try { var maxH = 1; } catch {} draw(maxH);",
		"switch (x) { case 1: var maxH = 1; } draw(maxH);",
		"draw(maxH); var maxH = 1;",
		"class A { m() { if (x) { var maxH = 1; } return maxH; } }",
	]) {
		assert.ok(!flags(code), `should not flag: ${code}`);
	}
});
