/**
 * Anchoring: converting between live DOM Ranges and offsets we can persist.
 *
 * A Range points at live DOM nodes, so it cannot be stored. Instead we flatten
 * the note into a single "highlightable text-space" — every text node inside
 * the root, in document order, minus the zones listed in EXCLUDED_SELECTOR —
 * and store character offsets into that space. Because notes are statically
 * rendered markdown, the same note content always produces the same text-space,
 * which makes plain offsets a reliable anchor.
 */

/**
 * Regions users must not highlight into: rendered math and code would have
 * their DOM corrupted by wrapping <mark> elements, and the interactive viz
 * components manage their own subtree.
 */
const EXCLUDED_SELECTOR = ".katex, pre, code, algo-player, [data-no-highlight]";

function isExcluded(node: Node, root: HTMLElement): boolean {
  const element =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as HTMLElement)
      : node.parentElement;
  if (!element) return true;
  const match = element.closest(EXCLUDED_SELECTOR);
  return match !== null && root.contains(match);
}

/**
 * The outermost excluded element containing `node`, e.g. the <code> itself
 * for text buried inside it. Null if `node` isn't inside an excluded zone
 * under `root`.
 */
function excludedSubtreeRoot(node: Node, root: HTMLElement): Element | null {
  const element =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node.parentElement;
  if (!element) return null;
  const match = element.closest(EXCLUDED_SELECTOR);
  return match && root.contains(match) ? match : null;
}

/** Text nodes of `root` in document order, skipping excluded zones. */
export function highlightableTextNodes(root: HTMLElement): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
      return isExcluded(node, root)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }
  return nodes;
}

/** Full highlightable text of the note, matching the offsets we persist. */
export function highlightableText(root: HTMLElement): string {
  return highlightableTextNodes(root)
    .map((node) => node.nodeValue ?? "")
    .join("");
}

interface NodeSpan {
  node: Text;
  start: number; // offset of this node's first character in text-space
  end: number; // offset just past this node's last character
}

function nodeSpans(root: HTMLElement): NodeSpan[] {
  const spans: NodeSpan[] = [];
  let cursor = 0;
  for (const node of highlightableTextNodes(root)) {
    const length = (node.nodeValue ?? "").length;
    spans.push({ node, start: cursor, end: cursor + length });
    cursor += length;
  }
  return spans;
}

/**
 * Text-space offset of a (node, offset) DOM position. Null if not highlightable.
 * `edge` disambiguates boundaries that land on an element rather than text.
 * `root` and `excludedAncestor` let a boundary that lands inside an excluded
 * zone (e.g. a drag that ends mid-way through inline code) clamp to that
 * zone's nearest edge instead of rejecting the whole selection.
 */
function positionToOffset(
  spans: NodeSpan[],
  node: Node,
  offset: number,
  edge: "start" | "end",
  root: HTMLElement
): number | null {
  // On a text node inside an excluded zone, there is no span for it — treat
  // the boundary as landing just outside the excluded subtree, at whichever
  // edge is on the "keep" side of the drag.
  if (node.nodeType === Node.TEXT_NODE) {
    const span = spans.find((s) => s.node === node);
    if (span) {
      return span.start + Math.min(offset, span.end - span.start);
    }
    const excludedRoot = excludedSubtreeRoot(node, root);
    if (!excludedRoot || !excludedRoot.parentNode) return null;
    const siblings = Array.from(excludedRoot.parentNode.childNodes);
    const indexInParent = siblings.indexOf(excludedRoot as ChildNode);
    return positionToOffset(
      spans,
      excludedRoot.parentNode,
      edge === "start" ? indexInParent + 1 : indexInParent,
      edge,
      root
    );
  }

  // On an element, `offset` is a *child index*, not a character offset. The
  // boundary sits between children[offset - 1] and children[offset], so a
  // start boundary resolves forward to the next text we know about, and an
  // end boundary resolves backward to the end of the previous one. Collapsing
  // both to "start of subtree" (as a naive lookup does) silently extends the
  // selection across whatever follows.
  const children = Array.from(node.childNodes);

  if (edge === "start") {
    for (let i = offset; i < children.length; i += 1) {
      const span = spans.find(
        (s) => s.node === children[i] || children[i].contains(s.node)
      );
      if (span) return span.start;
    }
    // Nothing highlightable after the boundary: fall back to the end of the
    // last known text before it.
    for (let i = offset - 1; i >= 0; i -= 1) {
      const candidates = spans.filter(
        (s) => s.node === children[i] || children[i].contains(s.node)
      );
      if (candidates.length > 0) {
        return candidates[candidates.length - 1].end;
      }
    }
    return null;
  }

  for (let i = offset - 1; i >= 0; i -= 1) {
    const candidates = spans.filter(
      (s) => s.node === children[i] || children[i].contains(s.node)
    );
    if (candidates.length > 0) {
      return candidates[candidates.length - 1].end;
    }
  }
  for (let i = offset; i < children.length; i += 1) {
    const span = spans.find(
      (s) => s.node === children[i] || children[i].contains(s.node)
    );
    if (span) return span.start;
  }
  return null;
}

export interface SerializedRange {
  startOffset: number;
  endOffset: number;
  textSnippet: string;
}

/**
 * Convert a live selection Range into persistable offsets. A boundary that
 * lands inside an excluded zone (math, code, a viz component) clamps to that
 * zone's nearest edge rather than rejecting the whole selection, so a drag
 * that merely ends a character too far into inline code still highlights the
 * ordinary prose before it. Returns null when the selection is empty or both
 * boundaries collapse into the same excluded zone with nothing keepable
 * between them.
 */
export function serializeRange(
  root: HTMLElement,
  range: Range
): SerializedRange | null {
  const spans = nodeSpans(root);
  if (spans.length === 0) return null;

  const start = positionToOffset(
    spans,
    range.startContainer,
    range.startOffset,
    "start",
    root
  );
  const end = positionToOffset(
    spans,
    range.endContainer,
    range.endOffset,
    "end",
    root
  );
  if (start === null || end === null) return null;

  const startOffset = Math.min(start, end);
  const endOffset = Math.max(start, end);
  if (endOffset <= startOffset) return null;

  const textSnippet = highlightableText(root).slice(startOffset, endOffset);
  if (textSnippet.trim().length === 0) return null;

  return { startOffset, endOffset, textSnippet };
}

/**
 * The per-text-node pieces a highlight covers. A highlight spanning several
 * paragraphs yields one piece per text node, because a single <mark> cannot
 * wrap across element boundaries without breaking HTML nesting.
 */
export interface RangePiece {
  node: Text;
  startOffset: number; // offset within this text node
  endOffset: number;
}

export function rangePieces(
  root: HTMLElement,
  startOffset: number,
  endOffset: number
): RangePiece[] {
  const pieces: RangePiece[] = [];
  for (const span of nodeSpans(root)) {
    if (span.end <= startOffset || span.start >= endOffset) continue;
    const from = Math.max(startOffset - span.start, 0);
    const to = Math.min(endOffset - span.start, span.end - span.start);
    if (to > from) {
      pieces.push({ node: span.node, startOffset: from, endOffset: to });
    }
  }
  return pieces;
}

/**
 * Whether stored offsets still point at the text they were created from.
 * Guards against silently painting the wrong words after a note is edited.
 */
export function isAnchorValid(
  root: HTMLElement,
  startOffset: number,
  endOffset: number,
  textSnippet: string
): boolean {
  const text = highlightableText(root);
  if (endOffset > text.length) return false;
  return text.slice(startOffset, endOffset) === textSnippet;
}

/**
 * Best-effort recovery for a highlight whose offsets have drifted: if the exact
 * snippet still occurs exactly once in the note, re-anchor to that occurrence.
 * Ambiguous or missing snippets return null so the caller can mark it orphaned.
 */
export function recoverAnchor(
  root: HTMLElement,
  textSnippet: string
): { startOffset: number; endOffset: number } | null {
  if (textSnippet.length === 0) return null;
  const text = highlightableText(root);
  const first = text.indexOf(textSnippet);
  if (first === -1) return null;
  if (text.indexOf(textSnippet, first + 1) !== -1) return null; // ambiguous
  return { startOffset: first, endOffset: first + textSnippet.length };
}
