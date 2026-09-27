import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const component = readFileSync(new URL("../src/components/LiveLearningLoop.astro", import.meta.url), "utf8");
const css = component.slice(component.indexOf("<style>"));

/** Bodies of every `@media <query> { ... }` block, found by brace matching. */
function mediaBlocks(query: string): string[] {
	const blocks: string[] = [];
	let from = 0;
	for (;;) {
		const start = css.indexOf(`@media ${query}`, from);
		if (start === -1) return blocks;
		const open = css.indexOf("{", start);
		let depth = 0;
		let end = open;
		for (; end < css.length; end++) {
			if (css[end] === "{") depth++;
			if (css[end] === "}" && --depth === 0) break;
		}
		blocks.push(css.slice(open + 1, end));
		from = end;
	}
}

/** Declarations of the rule whose selector list contains `selector`, inside `source`. */
function declarations(source: string, selector: string): string {
	// The lookahead stops `.stage-caption` from also matching `.stage-captions`.
	const match = source.match(new RegExp(`([^{}]*\\${selector}(?![\\w-])[^{}]*)\\{([^{}]*)\\}`));
	return match?.[2] ?? "";
}

test("every loop stage has a caption", () => {
	assert.equal(component.match(/\bsummary: "/g)?.length, 5);
	assert.match(component, /class:list=\{\["stage-caption"/);
});

test("reduced motion lists every stage caption instead of hiding them", () => {
	const [reduced] = mediaBlocks("(prefers-reduced-motion: reduce)");
	assert.ok(reduced, "missing a reduced-motion block");

	const caption = declarations(reduced, ".stage-caption");
	assert.match(caption, /animation:\s*none/);
	assert.match(caption, /opacity:\s*1/, "captions must be visible without animation or hover");
	assert.match(declarations(reduced, ".marker"), /display:\s*none/, "the marker only makes sense while it moves");
});

test("hover pinning only applies while captions cycle", () => {
	const outside = css.replace(/@media \(prefers-reduced-motion: no-preference\)\s*\{[\s\S]*?\n\t\}/g, "");
	assert.doesNotMatch(outside, /:has\(/, "a :has() hover rule would hide the reduced-motion list");
	const motion = mediaBlocks("(prefers-reduced-motion: no-preference)").join("\n");
	assert.match(motion, /:has\(\[data-stage="retain"\] \.stage-word/);
});

test("only hovering a stage link pins a caption", () => {
	// A stage's row also holds its hidden caption, so a hover target of the row
	// itself would pin a caption when the pointer is over empty caption space.
	for (const match of css.matchAll(/:has\(([^)]*)\)/g)) {
		if (match[1].includes("data-stage") || match[1].includes(":hover")) {
			assert.match(match[1], /\.stage-word/, `hover target is not a stage link: ${match[1]}`);
		}
	}
	assert.match(declarations(css, ".stage-caption"), /pointer-events:\s*none/, "hidden captions must not catch the pointer");
});
