import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";

import {
  highlightableText,
  isAnchorValid,
  rangePieces,
  recoverAnchor,
  serializeRange,
} from "../src/scripts/highlight-anchor.ts";

/**
 * The anchoring module talks to the DOM, so each test builds a small note-like
 * document and installs its globals before exercising the pure functions.
 */
function mount(html: string): HTMLElement {
  const dom = new JSDOM(`<article class="prose">${html}</article>`);
  const g = globalThis as Record<string, unknown>;
  g.document = dom.window.document;
  g.Node = dom.window.Node;
  g.NodeFilter = dom.window.NodeFilter;
  return dom.window.document.querySelector(".prose") as HTMLElement;
}

test("text-space concatenates paragraphs in document order", () => {
  const root = mount("<p>Hello </p><p>world</p>");
  assert.equal(highlightableText(root), "Hello world");
});

test("code, math, and viz subtrees are excluded from text-space", () => {
  const root = mount(
    '<p>before </p><pre>ignored</pre><span class="katex">x^2</span>' +
      "<algo-player>steps</algo-player><p> after</p>"
  );
  assert.equal(highlightableText(root), "before  after");
});

test("a selection inside one paragraph serializes to its offsets", () => {
  const root = mount("<p>Big-O hides constants</p>");
  const textNode = root.querySelector("p")!.firstChild!;
  const range = root.ownerDocument.createRange();
  range.setStart(textNode, 6);
  range.setEnd(textNode, 11);

  assert.deepEqual(serializeRange(root, range), {
    startOffset: 6,
    endOffset: 11,
    textSnippet: "hides",
  });
});

test("an end boundary on an element does not swallow following content", () => {
  // Browsers routinely report a multi-paragraph selection as ending at
  // (parentElement, childIndex). Resolving that to the *start* of the child's
  // subtree used to extend the highlight across every later block.
  const root = mount("<p>first</p><p>second</p><h2>heading</h2><p>third</p>");
  const firstText = root.querySelectorAll("p")[0].firstChild!;
  const range = root.ownerDocument.createRange();
  range.setStart(firstText, 0);
  // End just after the second <p>: index 2 among root's children.
  range.setEnd(root, 2);

  const serialized = serializeRange(root, range);
  assert.equal(serialized?.textSnippet, "firstsecond");
});

test("a start boundary on an element resolves forward, not backward", () => {
  const root = mount("<p>alpha</p><p>beta</p><p>gamma</p>");
  const range = root.ownerDocument.createRange();
  // Start before the second <p>, end at the close of the third.
  range.setStart(root, 1);
  range.setEnd(root, 3);

  const serialized = serializeRange(root, range);
  assert.equal(serialized?.textSnippet, "betagamma");
});

test("a selection ending inside inline code clamps to the prose before it", () => {
  // A drag that starts in ordinary prose but overshoots into inline code
  // must not be rejected outright — the valid prose portion is still real.
  const root = mount("<p>before <code>inline</code> after</p>");
  const p = root.querySelector("p")!;
  const beforeText = p.firstChild!;
  const codeText = p.querySelector("code")!.firstChild!;

  const range = root.ownerDocument.createRange();
  range.setStart(beforeText, 0);
  range.setEnd(codeText, 3); // three characters into "inline"

  // Text-space is "before  after" — the space before <code> is real prose.
  assert.deepEqual(serializeRange(root, range), {
    startOffset: 0,
    endOffset: 7,
    textSnippet: "before ",
  });
});

test("a selection starting inside inline code clamps to the prose after it", () => {
  const root = mount("<p>before <code>inline</code> after</p>");
  const p = root.querySelector("p")!;
  const codeText = p.querySelector("code")!.firstChild!;
  const afterText = p.lastChild!;

  const range = root.ownerDocument.createRange();
  range.setStart(codeText, 2); // two characters into "inline"
  range.setEnd(afterText, afterText.nodeValue!.length); // through " after"

  // Text-space is "before  after" — clamps forward to the space + "after".
  assert.deepEqual(serializeRange(root, range), {
    startOffset: 7,
    endOffset: 13,
    textSnippet: " after",
  });
});

test("a selection overshooting into a nested pre>code block still clamps", () => {
  // <pre><code> is two excluded ancestors deep. closest() alone stops at the
  // inner <code>, and resolving from there lands back inside the outer
  // <pre> with nothing highlightable — so the outermost excluded ancestor
  // must be used, not just the nearest one.
  const root = mount("<p>before</p><pre><code>fenced text</code></pre><p>after</p>");
  const beforeText = root.querySelectorAll("p")[0].firstChild!;
  const codeText = root.querySelector("code")!.firstChild!;

  const range = root.ownerDocument.createRange();
  range.setStart(beforeText, 0);
  range.setEnd(codeText, 3);

  assert.deepEqual(serializeRange(root, range), {
    startOffset: 0,
    endOffset: 6,
    textSnippet: "before",
  });
});

test("a selection starting inside a nested pre>code block clamps forward", () => {
  const root = mount("<p>before</p><pre><code>fenced text</code></pre><p>after</p>");
  const codeText = root.querySelector("code")!.firstChild!;
  const afterText = root.querySelectorAll("p")[1].firstChild!;

  const range = root.ownerDocument.createRange();
  range.setStart(codeText, 2);
  range.setEnd(afterText, afterText.nodeValue!.length);

  assert.deepEqual(serializeRange(root, range), {
    startOffset: 6,
    endOffset: 11,
    textSnippet: "after",
  });
});

test("a selection entirely inside an excluded zone is still rejected", () => {
  const root = mount("<p>before <code>inline</code> after</p>");
  const codeText = root.querySelector("code")!.firstChild!;

  const range = root.ownerDocument.createRange();
  range.setStart(codeText, 0);
  range.setEnd(codeText, 6);

  assert.equal(serializeRange(root, range), null);
});

test("a whitespace-only selection is rejected", () => {
  const root = mount("<p>a   b</p>");
  const textNode = root.querySelector("p")!.firstChild!;
  const range = root.ownerDocument.createRange();
  range.setStart(textNode, 1);
  range.setEnd(textNode, 4);

  assert.equal(serializeRange(root, range), null);
});

test("a highlight spanning two paragraphs splits into one piece per node", () => {
  const root = mount("<p>alpha</p><p>beta</p>");
  // "pha" + "be" — crosses the paragraph boundary.
  const pieces = rangePieces(root, 2, 7);

  assert.equal(pieces.length, 2);
  assert.equal(pieces[0].node.nodeValue, "alpha");
  assert.deepEqual(
    [pieces[0].startOffset, pieces[0].endOffset],
    [2, 5]
  );
  assert.equal(pieces[1].node.nodeValue, "beta");
  assert.deepEqual(
    [pieces[1].startOffset, pieces[1].endOffset],
    [0, 2]
  );
});

test("pieces skip excluded zones that fall inside the span", () => {
  const root = mount("<p>keep</p><pre>DROP</pre><p>keep2</p>");
  // Text-space is "keepkeep2"; offsets 2..6 cover "ep" + "ke".
  const pieces = rangePieces(root, 2, 6);

  assert.equal(pieces.length, 2);
  assert.equal(pieces[0].node.nodeValue, "keep");
  assert.equal(pieces[1].node.nodeValue, "keep2");
});

test("link text stays highlightable", () => {
  // Notes cross-link to problem pages, so anchor text must remain selectable.
  // The click handler is what protects navigation, not an exclusion here.
  const root = mount('<p>see <a href="/x">Maximum Subarray</a> next</p>');
  assert.equal(highlightableText(root), "see Maximum Subarray next");

  const pieces = rangePieces(root, 4, 20);
  assert.equal(pieces.map((p) => p.node.nodeValue).join(""), "Maximum Subarray");
});

test("an anchor is valid while the underlying text is unchanged", () => {
  const root = mount("<p>constant factors drop out</p>");
  assert.equal(isAnchorValid(root, 0, 8, "constant"), true);
});

test("an anchor is invalid once the text shifts", () => {
  const root = mount("<p>the constant factors drop out</p>");
  assert.equal(isAnchorValid(root, 0, 8, "constant"), false);
});

test("an anchor past the end of the note is invalid", () => {
  const root = mount("<p>short</p>");
  assert.equal(isAnchorValid(root, 0, 500, "short"), false);
});

test("a drifted highlight re-anchors to a unique snippet", () => {
  const root = mount("<p>the constant factors drop out</p>");
  assert.deepEqual(recoverAnchor(root, "constant"), {
    startOffset: 4,
    endOffset: 12,
  });
});

test("an ambiguous snippet refuses to re-anchor", () => {
  const root = mount("<p>drop it and drop it again</p>");
  assert.equal(recoverAnchor(root, "drop"), null);
});

test("a snippet that no longer exists refuses to re-anchor", () => {
  const root = mount("<p>rewritten entirely</p>");
  assert.equal(recoverAnchor(root, "constant"), null);
});
