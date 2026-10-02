import assert from "node:assert/strict";
import test from "node:test";

import { JSDOM } from "jsdom";

import remarkCodeTabs from "../src/lib/remark-code-tabs.ts";
import { CODE_LANGUAGE_STORAGE_KEY, initCodeTabs } from "../src/scripts/code-tabs.ts";

type Node = { type: string; lang?: string; value?: string; children?: Node[]; data?: any };

const code = (lang: string): Node => ({ type: "code", lang, value: `${lang} source` });
const paragraph = (text: string): Node => ({ type: "paragraph", children: [{ type: "text", value: text }] });

function transform(children: Node[]): Node[] {
	const tree: Node = { type: "root", children };
	remarkCodeTabs()(tree);
	return tree.children!;
}

const panelLangs = (group: Node) => group.children!.slice(1).map((panel) => panel.children![0].lang);

test("adjacent fences in different languages become one tab group", () => {
	const [group] = transform([code("python"), code("julia"), code("ts"), code("rust")]);

	assert.equal(group.type, "codeTabs");
	assert.equal(group.data.hName, "div");
	assert.deepEqual(panelLangs(group), ["python", "julia", "ts", "rust"]);

	const tabs = group.children![0].children!;
	assert.deepEqual(tabs.map((tab) => tab.children![0].value), ["Python", "Julia", "TypeScript", "Rust"]);
	assert.deepEqual(tabs.map((tab) => tab.data.hProperties.dataLang), ["python", "julia", "typescript", "rust"]);
	assert.deepEqual(tabs.map((tab) => tab.data.hProperties.ariaSelected), ["true", "false", "false", "false"]);
	// Each tab points at its own panel and the panel points back.
	const panels = group.children!.slice(1);
	tabs.forEach((tab, index) => {
		assert.equal(tab.data.hProperties.ariaControls, panels[index].data.hProperties.id);
		assert.equal(panels[index].data.hProperties.ariaLabelledBy, tab.data.hProperties.id);
	});
});

test("a lone fence, unsupported languages, and separated fences are left alone", () => {
	const lone = transform([code("python")]);
	assert.equal(lone[0].type, "code");

	const unsupported = transform([code("python"), code("text"), code("bash")]);
	assert.deepEqual(unsupported.map((node) => node.type), ["code", "code", "code"]);

	const separated = transform([code("python"), paragraph("between"), code("rust")]);
	assert.deepEqual(separated.map((node) => node.type), ["code", "paragraph", "code"]);
});

test("a repeated language starts a new group instead of merging", () => {
	const nodes = transform([code("python"), code("rust"), code("python"), code("rust"), code("python")]);

	assert.deepEqual(nodes.map((node) => node.type), ["codeTabs", "codeTabs", "code"]);
	assert.deepEqual(panelLangs(nodes[0]), ["python", "rust"]);
	const firstTabId = nodes[0].children![0].children![0].data.hProperties.id;
	const secondTabId = nodes[1].children![0].children![0].data.hProperties.id;
	assert.notEqual(firstTabId, secondTabId);
});

test("fences nested inside other blocks are grouped too", () => {
	const [quote] = transform([{ type: "blockquote", children: [code("python"), code("julia")] }]);
	assert.equal(quote.children![0].type, "codeTabs");
});

// --- Client behaviour -------------------------------------------------------

function group(id: number, langs: string[]): string {
	const tabs = langs
		.map((lang, i) => `<button role="tab" data-lang="${lang}" aria-selected="${i === 0}" id="g${id}-tab-${lang}">${lang}</button>`)
		.join("");
	const panels = langs
		.map((lang) => `<div role="tabpanel" data-lang="${lang}" id="g${id}-panel-${lang}"><pre>${lang}</pre></div>`)
		.join("");
	return `<div data-code-tabs><div role="tablist">${tabs}</div>${panels}</div>`;
}

function page(storage = new Map<string, string>()) {
	const dom = new JSDOM(
		`<article>${group(1, ["python", "julia", "typescript", "rust"])}${group(2, ["python", "rust"])}</article>`,
	);
	const store = {
		getItem: (key: string) => storage.get(key) ?? null,
		setItem: (key: string, value: string) => void storage.set(key, value),
	};
	initCodeTabs(dom.window.document, store);
	const doc = dom.window.document;
	const groups = Array.from(doc.querySelectorAll<HTMLElement>("[data-code-tabs]"));
	const visible = (g: HTMLElement) =>
		Array.from(g.querySelectorAll<HTMLElement>('[role="tabpanel"]')).filter((p) => !p.hidden).map((p) => p.dataset.lang);
	return { dom, doc, groups, visible, storage };
}

test("initialises every group on its first tab and marks it enhanced", () => {
	const { groups, visible } = page();
	assert.deepEqual(groups.map(visible), [["python"], ["python"]]);
	assert.ok(groups.every((g) => g.dataset.enhanced === "true"));
});

test("clicking a tab switches every group that has the language and remembers it", () => {
	const { doc, groups, visible, storage } = page();

	doc.querySelector<HTMLElement>("#g1-tab-rust")!.click();
	assert.deepEqual(groups.map(visible), [["rust"], ["rust"]]);
	assert.equal(storage.get(CODE_LANGUAGE_STORAGE_KEY), "rust");
	assert.equal(doc.querySelector("#g2-tab-rust")!.getAttribute("aria-selected"), "true");
	assert.equal(doc.querySelector("#g2-tab-python")!.getAttribute("aria-selected"), "false");

	// Group 2 has no Julia tab, so it keeps showing Rust.
	doc.querySelector<HTMLElement>("#g1-tab-julia")!.click();
	assert.deepEqual(groups.map(visible), [["julia"], ["rust"]]);
});

test("a stored preference is applied where available", () => {
	const { groups, visible } = page(new Map([[CODE_LANGUAGE_STORAGE_KEY, "julia"]]));
	assert.deepEqual(groups.map(visible), [["julia"], ["python"]]);
});

test("arrow keys move between tabs and wrap around", () => {
	const { dom, doc, groups, visible } = page();
	const python = doc.querySelector<HTMLElement>("#g1-tab-python")!;

	python.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "ArrowLeft" }));
	assert.deepEqual(visible(groups[0]), ["rust"]);
	assert.equal(doc.activeElement?.id, "g1-tab-rust");

	doc.querySelector<HTMLElement>("#g1-tab-rust")!.dispatchEvent(
		new dom.window.KeyboardEvent("keydown", { key: "ArrowRight" }),
	);
	assert.deepEqual(visible(groups[0]), ["python"]);
});

test("storage failures do not break the tabs", () => {
	const dom = new JSDOM(`<article>${group(1, ["python", "rust"])}</article>`);
	const throwing = {
		getItem: () => {
			throw new Error("denied");
		},
		setItem: () => {
			throw new Error("denied");
		},
	};
	initCodeTabs(dom.window.document, throwing);
	dom.window.document.querySelector<HTMLElement>("#g1-tab-rust")!.click();
	const shown = Array.from(dom.window.document.querySelectorAll<HTMLElement>('[role="tabpanel"]'))
		.filter((p) => !p.hidden)
		.map((p) => p.dataset.lang);
	assert.deepEqual(shown, ["rust"]);
});
