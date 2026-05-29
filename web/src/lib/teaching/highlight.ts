import type { HighlightKind, HighlightSpec } from "./types";

const HIGHLIGHT_CLASS_BY_KIND: Record<HighlightKind, string> = {
  focus: "teach-focus",
  compare: "teach-compare",
  candidate: "teach-compare",
  write: "teach-write",
  discard: "teach-discard",
  match: "teach-match",
  "region-add": "teach-region-add",
  "region-subtract": "teach-region-subtract",
  confirmed: "teach-confirmed",
};

const ALL_HIGHLIGHT_CLASSES = Array.from(new Set(Object.values(HIGHLIGHT_CLASS_BY_KIND)));

export function clearTeachingHighlights(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>("[data-teach-target]").forEach((element) => {
    element.classList.remove(...ALL_HIGHLIGHT_CLASSES);
    element.removeAttribute("data-teach-label");
  });
}

export function applyTeachingHighlights(
  root: ParentNode,
  highlights: HighlightSpec[] = [],
): void {
  clearTeachingHighlights(root);

  highlights.forEach((highlight) => {
    const className = HIGHLIGHT_CLASS_BY_KIND[highlight.kind];
    if (!className) return;

    root
      .querySelectorAll<HTMLElement>(`[data-teach-target="${highlight.target}"]`)
      .forEach((element) => {
        element.classList.add(className);

        if (highlight.label) {
          element.setAttribute("data-teach-label", highlight.label);
        }
      });
  });
}
