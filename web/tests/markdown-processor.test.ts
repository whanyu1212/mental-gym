import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

import { JSDOM } from "jsdom";

import config from "../astro.config.mjs";

test("the configured Markdown processor preserves tables, math and code tabs", async () => {
	const processor = config.markdown!.processor!;
	assert.equal(processor.name, "unified");
	const renderer = await processor.createRenderer({
		...config.markdown,
		syntaxHighlight: false,
	});
	const markdown = [
		"| Language | Value |",
		"| --- | --- |",
		"| Rust | 42 |",
		"",
		"$x^2$",
		"",
		"```python",
		"print(42)",
		"```",
		"",
		"```rust",
		'println!("42");',
		"```",
	].join("\n");
	const { code } = await renderer.render(markdown);
	const { document } = new JSDOM(code).window;

	assert.equal(document.querySelector("table tbody td")?.textContent, "Rust");
	assert.ok(document.querySelector(".katex"), "math must render through rehype-katex");
	assert.equal(document.querySelectorAll("[data-code-tabs] [role=tab]").length, 2);
});

test("KaTeX styles and the rehype renderer use the same installed version", () => {
	const require = createRequire(import.meta.url);
	const rendererRequire = createRequire(require.resolve("rehype-katex"));
	assert.equal(
		require("katex/package.json").version,
		rendererRequire("katex/package.json").version,
	);
});
