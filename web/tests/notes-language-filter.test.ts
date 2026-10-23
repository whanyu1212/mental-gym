import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { JSDOM } from "jsdom";
import ts from "typescript";

const pageSource = readFileSync(new URL("../src/pages/notes/index.astro", import.meta.url), "utf8");
const clientScript = /<script>\s*([\s\S]*?)<\/script>/.exec(pageSource)?.[1];
assert.ok(clientScript, "notes page should include a client-side filter script");

const runnableScript = ts.transpileModule(clientScript, {
	compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
}).outputText;

const fixture = `
<main data-notes-library>
  <fieldset data-language-filter hidden>
    <input type="radio" name="notes-language" value="all" checked>
    <input type="radio" name="notes-language" value="python" data-language-name="Python" data-learn-href="/mental-gym/learn/python/">
    <input type="radio" name="notes-language" value="julia" data-language-name="Julia" data-learn-href="/mental-gym/learn/julia/">
    <input type="radio" name="notes-language" value="typescript" data-language-name="TypeScript" data-learn-href="/mental-gym/learn/typescript/">
    <input type="radio" name="notes-language" value="rust" data-language-name="Rust" data-learn-href="/mental-gym/learn/rust/">
    <p data-filter-summary></p>
  </fieldset>
  <section data-unfiltered-only data-course-overview></section>
  <section data-note-category data-category="toolkits">
    <span data-category-count>2</span>
    <a data-note-card data-note="python" data-languages="python"></a>
    <a data-note-card data-note="typescript" data-languages="typescript"></a>
  </section>
  <section data-note-category data-category="other">
    <span data-category-count>2</span>
    <a data-note-card data-note="rust" data-languages="rust"></a>
    <a data-note-card data-note="general" data-languages=""></a>
  </section>
  <section data-language-empty hidden>
    <h2 data-empty-title></h2>
    <p data-empty-copy></p>
    <a data-empty-link href="/mental-gym/learn/julia/"></a>
    <button type="button" data-reset-language>Show all notes</button>
  </section>
  <section data-unfiltered-only data-templates></section>
</main>`;

function loadPage(url: string): JSDOM {
	const dom = new JSDOM(fixture, { url, runScripts: "outside-only" });
	dom.window.eval(runnableScript);
	return dom;
}

function input(dom: JSDOM, value: string): HTMLInputElement {
	const element = dom.window.document.querySelector<HTMLInputElement>(`input[value="${value}"]`);
	assert.ok(element, `missing ${value} filter input`);
	return element;
}

function select(dom: JSDOM, value: string): void {
	const element = input(dom, value);
	element.checked = true;
	element.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
}

function note(dom: JSDOM, name: string): HTMLElement {
	const element = dom.window.document.querySelector<HTMLElement>(`[data-note="${name}"]`);
	assert.ok(element, `missing ${name} note`);
	return element;
}

function waitForPopstate(dom: JSDOM, navigate: () => void): Promise<void> {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error("popstate did not fire")), 1_000);
		dom.window.addEventListener("popstate", () => {
			clearTimeout(timer);
			resolve();
		}, { once: true });
		navigate();
	});
}

test("language filter handles query selection, history, empty state, and reset", async () => {
	const dom = loadPage("https://example.test/mental-gym/notes/?view=cards&language=python#library");
	const document = dom.window.document;

	assert.equal(document.querySelector<HTMLElement>("[data-language-filter]")?.hidden, false);
	assert.equal(input(dom, "python").checked, true);
	assert.equal(note(dom, "python").hidden, false);
	assert.equal(note(dom, "typescript").hidden, true);
	assert.equal(document.querySelector("[data-filter-summary]")?.textContent, "1 Python note");
	assert.equal(document.querySelector<HTMLElement>('[data-category="other"]')?.hidden, true);
	assert.equal(document.querySelector("[data-unfiltered-only]")?.hasAttribute("hidden"), true);

	select(dom, "typescript");
	assert.equal(dom.window.location.search, "?view=cards&language=typescript");
	assert.equal(dom.window.location.hash, "#library");
	assert.equal(note(dom, "python").hidden, true);
	assert.equal(note(dom, "typescript").hidden, false);

	await waitForPopstate(dom, () => dom.window.history.back());
	assert.equal(input(dom, "python").checked, true, "back restores the query-selected filter");
	assert.equal(note(dom, "python").hidden, false);
	await waitForPopstate(dom, () => dom.window.history.forward());
	assert.equal(input(dom, "typescript").checked, true, "forward reapplies the newer filter");

	select(dom, "julia");
	const empty = document.querySelector<HTMLElement>("[data-language-empty]");
	assert.equal(empty?.hidden, false);
	assert.match(empty?.querySelector("[data-empty-copy]")?.textContent ?? "", /Explore the Julia learning track/);
	assert.equal(empty?.querySelector<HTMLAnchorElement>("[data-empty-link]")?.pathname, "/mental-gym/learn/julia/");
	assert.ok([...document.querySelectorAll<HTMLElement>("[data-note-category]")].every((category) => category.hidden));

	document.querySelector<HTMLButtonElement>("[data-reset-language]")?.click();
	assert.equal(dom.window.location.search, "?view=cards");
	assert.equal(input(dom, "all").checked, true);
	assert.ok([...document.querySelectorAll<HTMLElement>("[data-note-card]")].every((card) => !card.hidden));
	assert.ok([...document.querySelectorAll<HTMLElement>("[data-unfiltered-only]")].every((section) => !section.hidden));
	assert.equal(empty?.hidden, true);
});

test("invalid language queries fall back to the full no-JS library", () => {
	const dom = loadPage("https://example.test/mental-gym/notes/?language=go");
	assert.equal(input(dom, "all").checked, true);
	assert.ok([...dom.window.document.querySelectorAll<HTMLElement>("[data-note-card]")].every((card) => !card.hidden));
	assert.match(pageSource, /data-language-filter hidden/, "controls stay hidden until their script runs");
	assert.doesNotMatch(pageSource, /data-note-card[^>]*\shidden(?:\s|>)/, "server-rendered notes stay visible without JavaScript");
});
