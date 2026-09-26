import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

/**
 * An Astro component's frontmatter runs at build time and its <script> runs in
 * the browser, so a name declared in the frontmatter does not exist in the
 * script. Using one throws a ReferenceError in the browser, which is how five
 * animations broke (maxH, maxPrice, allKeys, list1/list2). This test catches
 * that: any frontmatter `const` read inside the client script must be declared
 * there too (typically parsed from a data- attribute).
 */

const componentsDir = new URL("../src/components/", import.meta.url);

function componentFiles(dir: URL): URL[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		if (entry.isDirectory()) return componentFiles(new URL(`${entry.name}/`, dir));
		return entry.name.endsWith(".astro") ? [new URL(entry.name, dir)] : [];
	});
}

/**
 * Strip comments and string literals so names inside them do not count. The
 * `${...}` parts of template literals are real code (that is exactly where
 * `${(s.min / maxPrice) * 100}%` hid), so keep them and drop only the text.
 */
function codeOnly(source: string): string {
	return source
		.replace(/\/\*[\s\S]*?\*\//g, " ")
		.replace(/(^|[^:\\])\/\/[^\n]*/g, "$1 ")
		.replace(/`(?:\\[\s\S]|\$\{[^}]*\}|[^`\\])*`/g, (literal) =>
			[...literal.matchAll(/\$\{([^}]*)\}/g)].map((m) => ` ${m[1]} `).join(""),
		)
		.replace(/"(?:\\.|[^"\\\n])*"/g, '""')
		.replace(/'(?:\\.|[^'\\\n])*'/g, "''");
}

test("client scripts do not read build-time frontmatter constants", () => {
	const problems: string[] = [];
	for (const file of componentFiles(componentsDir)) {
		const source = readFileSync(file, "utf8");
		const frontmatter = /^---\n([\s\S]*?)\n---/.exec(source)?.[1];
		if (!frontmatter) continue;
		const buildNames = [...frontmatter.matchAll(/^(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*[:=]/gm)].map((m) => m[1]);
		for (const script of source.matchAll(/<script(?![^>]*is:inline)[^>]*>([\s\S]*?)<\/script>/g)) {
			const code = codeOnly(script[1]);
			for (const name of buildNames) {
				// Declared in the script itself: const/let/var/function/class, a
				// parameter or destructured binding (`(k`, `[k,`, `{k}`), or a
				// class field (`name!:` / `name:` at the start of a line).
				const declared = new RegExp(
					`(?:\\b(?:const|let|var|function|class)\\s+|[({[,]\\s*)${name}\\b|^\\s*${name}\\s*!?\\s*:`,
					"m",
				).test(code);
				// Read as a bare identifier, not as a property (`.name`) or object key (`name:`).
				const used = new RegExp(`(?<![\\w$.])${name}(?![\\w$])(?!\\s*:)`).test(code);
				if (used && !declared) problems.push(`${file.pathname.split("/src/")[1]}: '${name}' is a frontmatter const used in the client script`);
			}
		}
	}
	assert.deepEqual(problems, []);
});
