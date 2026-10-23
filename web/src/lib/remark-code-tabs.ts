/**
 * Remark plugin: group back-to-back fenced code blocks in different languages
 * into one tabbed block.
 *
 *   ```python      ┐
 *   ...            │
 *   ```            │  → one <div data-code-tabs> with a
 *   ```julia       │    Python | Julia | TypeScript | Rust tab bar
 *   ...            │
 *   ```            ┘
 *
 * Only fences that sit directly next to each other are grouped, and a group
 * ends as soon as a language repeats, so two adjacent Python blocks stay two
 * separate blocks. The markdown itself stays plain fenced code, which still
 * reads fine on GitHub and in an editor.
 *
 * The tab markup is generated at build time and every panel is visible by
 * default; `src/scripts/code-tabs.ts` hides the inactive panels once it runs,
 * so the page degrades to stacked blocks without JavaScript.
 */

const LANGUAGES: Record<string, { id: string; label: string }> = {
	python: { id: "python", label: "Python" },
	py: { id: "python", label: "Python" },
	julia: { id: "julia", label: "Julia" },
	jl: { id: "julia", label: "Julia" },
	typescript: { id: "typescript", label: "TypeScript" },
	ts: { id: "typescript", label: "TypeScript" },
	rust: { id: "rust", label: "Rust" },
	rs: { id: "rust", label: "Rust" },
};

interface MdNode {
	type: string;
	lang?: string | null;
	value?: string;
	children?: MdNode[];
	data?: { hName?: string; hProperties?: Record<string, unknown> };
}

export function tabLanguage(node: MdNode): { id: string; label: string } | undefined {
	if (node.type !== "code" || !node.lang) return undefined;
	return LANGUAGES[node.lang.toLowerCase()];
}

/** Length of the run of distinct-language code fences starting at `start`. */
function runLength(children: MdNode[], start: number): number {
	const seen = new Set<string>();
	let end = start;
	while (end < children.length) {
		const language = tabLanguage(children[end]);
		if (!language || seen.has(language.id)) break;
		seen.add(language.id);
		end += 1;
	}
	return end - start;
}

function element(type: string, hName: string, hProperties: Record<string, unknown>, children: MdNode[]): MdNode {
	return { type, data: { hName, hProperties }, children };
}

function buildGroup(blocks: MdNode[], groupId: string): MdNode {
	const tabs: MdNode[] = [];
	const panels: MdNode[] = [];

	blocks.forEach((block, index) => {
		const language = tabLanguage(block)!;
		const tabId = `${groupId}-tab-${language.id}`;
		const panelId = `${groupId}-panel-${language.id}`;
		const selected = index === 0;

		tabs.push(
			element(
				"codeTabsTab",
				"button",
				{
					type: "button",
					role: "tab",
					id: tabId,
					className: ["code-tabs__tab"],
					ariaControls: panelId,
					ariaSelected: selected ? "true" : "false",
					tabIndex: selected ? 0 : -1,
					dataLang: language.id,
				},
				[{ type: "text", value: language.label }],
			),
		);
		panels.push(
			element(
				"codeTabsPanel",
				"div",
				{
					role: "tabpanel",
					id: panelId,
					className: ["code-tabs__panel"],
					ariaLabelledBy: tabId,
					dataLang: language.id,
					dataLabel: language.label,
				},
				[block],
			),
		);
	});

	return element("codeTabs", "div", { className: ["code-tabs"], dataCodeTabs: "" }, [
		element(
			"codeTabsList",
			"div",
			{ role: "tablist", ariaLabel: "Code language", className: ["code-tabs__list"] },
			tabs,
		),
		...panels,
	]);
}

export default function remarkCodeTabs() {
	return (tree: MdNode) => {
		// Per-document counter keeps ids unique within one rendered note.
		let groupCount = 0;

		const walk = (parent: MdNode) => {
			if (!parent.children) return;
			const next: MdNode[] = [];
			let index = 0;
			while (index < parent.children.length) {
				const length = runLength(parent.children, index);
				if (length >= 2) {
					groupCount += 1;
					next.push(buildGroup(parent.children.slice(index, index + length), `code-tabs-${groupCount}`));
					index += length;
				} else {
					walk(parent.children[index]);
					next.push(parent.children[index]);
					index += 1;
				}
			}
			parent.children = next;
		};

		walk(tree);
	};
}
