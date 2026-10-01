/**
 * Client behaviour for the tab groups built by `src/lib/remark-code-tabs.ts`.
 *
 * Picking a language switches every group on the page that has it, and the
 * choice is remembered across pages. Groups without the chosen language keep
 * their current tab.
 */

export const CODE_LANGUAGE_STORAGE_KEY = "mental-gym:code-language";

type PreferenceStore = Pick<Storage, "getItem" | "setItem">;

function browserStorage(): PreferenceStore | null {
	try {
		return window.localStorage;
	} catch {
		// Storage can throw in privacy modes; tabs still work, just unremembered.
		return null;
	}
}

function tabsOf(group: Element): HTMLElement[] {
	return Array.from(group.querySelectorAll<HTMLElement>('[role="tab"][data-lang]'));
}

function hasLanguage(group: Element, lang: string): boolean {
	return tabsOf(group).some((tab) => tab.dataset.lang === lang);
}

function activate(group: Element, lang: string): void {
	for (const tab of tabsOf(group)) {
		const selected = tab.dataset.lang === lang;
		tab.setAttribute("aria-selected", String(selected));
		tab.tabIndex = selected ? 0 : -1;
	}
	for (const panel of group.querySelectorAll<HTMLElement>('[role="tabpanel"][data-lang]')) {
		panel.hidden = panel.dataset.lang !== lang;
	}
}

export function initCodeTabs(root: Document, storage: PreferenceStore | null = browserStorage()): void {
	const groups = Array.from(root.querySelectorAll<HTMLElement>("[data-code-tabs]"));
	if (groups.length === 0) return;

	let stored: string | null = null;
	try {
		stored = storage?.getItem(CODE_LANGUAGE_STORAGE_KEY) ?? null;
	} catch {
		stored = null;
	}

	const selectEverywhere = (lang: string, anchor: HTMLElement) => {
		// Switching groups above the clicked one changes their height; keep the
		// clicked tab where it was on screen so the page doesn't jump.
		const before = anchor.getBoundingClientRect().top;
		for (const group of groups) {
			if (hasLanguage(group, lang)) activate(group, lang);
		}
		const shift = anchor.getBoundingClientRect().top - before;
		if (shift !== 0) root.defaultView?.scrollBy(0, shift);
		try {
			storage?.setItem(CODE_LANGUAGE_STORAGE_KEY, lang);
		} catch {
			// Ignore quota / privacy-mode failures.
		}
	};

	for (const group of groups) {
		const tabs = tabsOf(group);
		if (tabs.length === 0) continue;
		const initial = stored && hasLanguage(group, stored) ? stored : tabs[0].dataset.lang!;
		activate(group, initial);
		group.dataset.enhanced = "true";

		tabs.forEach((tab, index) => {
			tab.addEventListener("click", () => selectEverywhere(tab.dataset.lang!, tab));
			tab.addEventListener("keydown", (event) => {
				const target =
					event.key === "ArrowRight" ? tabs[(index + 1) % tabs.length]
					: event.key === "ArrowLeft" ? tabs[(index - 1 + tabs.length) % tabs.length]
					: event.key === "Home" ? tabs[0]
					: event.key === "End" ? tabs[tabs.length - 1]
					: undefined;
				if (!target) return;
				event.preventDefault();
				target.focus();
				selectEverywhere(target.dataset.lang!, target);
			});
		});
	}
}
