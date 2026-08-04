export type HighlightColor = "yellow" | "green" | "blue" | "pink";

export const HIGHLIGHT_COLORS: HighlightColor[] = [
  "yellow",
  "green",
  "blue",
  "pink",
];

export interface Highlight {
  id: string;
  noteId: string; // note collection id, e.g. "time-complexity"
  startOffset: number; // inclusive, in highlightable text-space
  endOffset: number; // exclusive, in highlightable text-space
  textSnippet: string; // the highlighted text, used to detect note drift
  color: HighlightColor;
  note?: string; // optional annotation attached to the highlight
  createdAt: string; // ISO timestamp
}

export function isHighlightColor(value: unknown): value is HighlightColor {
  return (
    typeof value === "string" &&
    (HIGHLIGHT_COLORS as string[]).includes(value)
  );
}

export function isHighlight(value: unknown): value is Highlight {
  if (typeof value !== "object" || value === null) return false;
  const h = value as Record<string, unknown>;
  return (
    typeof h.id === "string" &&
    typeof h.noteId === "string" &&
    typeof h.startOffset === "number" &&
    typeof h.endOffset === "number" &&
    h.startOffset >= 0 &&
    h.endOffset > h.startOffset &&
    typeof h.textSnippet === "string" &&
    isHighlightColor(h.color) &&
    (h.note === undefined || typeof h.note === "string") &&
    typeof h.createdAt === "string"
  );
}
