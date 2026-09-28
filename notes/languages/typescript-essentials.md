---
title: TypeScript Essentials
slug: typescript-essentials
description: Functions, narrowing, missing values, reference identity, collections, numbers, and modules for a first TypeScript program.
category: Languages
order: -3
status: stable
kind: concept
tags:
  - typescript
  - foundations
---

# TypeScript Essentials

TypeScript checks JavaScript code before it runs. The useful habit is to ask two questions separately: **what values can this type contain?** and **what will JavaScript do with the value at runtime?**

Save the main example as `/tmp/mental-gym-typescript-essentials.ts`. Run it with `bun run /tmp/mental-gym-typescript-essentials.ts`, then strictly check it with the standalone `tsc` command from [TypeScript — Start Here](../typescript-start-here/), replacing the two greeting paths with this file.

## A complete example

```ts
type ScoreInput = string | readonly number[] | null;

type ScoreReport = {
  total: number;
  uniqueSorted: number[];
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function parseScores(input: ScoreInput): number[] {
  if (input === null) return [];

  if (typeof input === "string") {
    if (input.trim() === "") return [];
    return input.split(",").map((part) => Number(part.trim()));
  }

  return [...input];
}

function buildReport(input: ScoreInput): ScoreReport {
  const scores = parseScores(input);
  let total = 0;

  for (const score of scores) {
    if (!Number.isFinite(score)) continue;
    total += score;
  }

  const uniqueSorted = [...new Set(scores)]
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

  return { total, uniqueSorted };
}

const labels = new Map<number, string>([
  [7, "steady"],
  [10, "strong"],
]);

const report = buildReport("10, 7, 10");
assert(report.total === 27, "total should be 27");
assert(report.uniqueSorted.join(",") === "7,10", "scores should be numeric-sorted");

const maybeLabel: string | undefined = labels.get(10);
assert(maybeLabel?.toUpperCase() === "STRONG", "label should exist");

const missingLabel: string | undefined = labels.get(99);
assert(missingLabel === undefined, "missing Map keys return undefined");

console.log(report);
```

Expected output:

```text
{
  total: 27,
  uniqueSorted: [ 7, 10 ],
}
```

## Functions, types, and control flow

The remaining single-file snippets use the `assert` helper from the complete example. Append them below that example when you run them. The modules section explicitly switches to two separate files.

A parameter annotation states what callers may pass; a return annotation states what every completed path must return:

```ts
function clamp(value: number, low: number, high: number): number {
  if (value < low) return low;
  if (value > high) return high;
  return value;
}
```

Prefer a union such as `string | number[]` when a value really has multiple valid shapes. Avoid `any`: it turns off useful checking. `unknown` accepts any value but forces you to inspect it before use.

TypeScript narrows a union after checks such as `input === null`, `typeof input === "string"`, `Array.isArray(input)`, or a discriminant field. In `parseScores`, each return removes one case; the last branch can only be the array case. The [official narrowing chapter](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) develops this control-flow reasoning.

`for...of` iterates values. A classic `for (let i = 0; i < xs.length; i++)` loop gives an index. `break`, `continue`, and early `return` work as in many C-like languages.

## `undefined` and `null` are explicit cases

With strict null checking, neither missing value is silently a `string` or `number`:

- `undefined` commonly means “not present” or “not found.” `Map.get`, `Array.find`, and `pop` can return it.
- `null` is usually an explicit application-level “empty” value.
- A type may include either or both: `User | null`, `string | undefined`, or `T | null | undefined`.

Narrow before use:

```ts
function displayName(name: string | null | undefined): string {
  return name?.trim() || "Anonymous";
}

assert(displayName(null) === "Anonymous", "null should use the fallback");
```

`??` falls back only for `null` or `undefined`; `||` also falls back for `""`, `0`, `false`, and `NaN`. Choose deliberately. The [`strictNullChecks` reference](https://www.typescriptlang.org/tsconfig/strictNullChecks.html) shows why APIs expose these unions.

## Objects and arrays use reference identity

Objects, arrays, `Map`, and `Set` are reference values. `const` prevents rebinding the variable; it does not freeze the referenced object.

```ts
const player = { name: "Mina", scores: [7] };
const alias = player;
alias.scores.push(10);
assert(player.scores.length === 2, "the alias points at the same object");

const shallow = { ...player };
shallow.scores.push(12);
assert(player.scores.includes(12), "object spread kept the nested array reference");

const independent = { ...player, scores: [...player.scores] };
independent.scores.push(20);
assert(!player.scores.includes(20), "the nested array was copied too");

assert(player === alias, "same reference");
assert(player !== independent, "different references");
```

The same rule applies to keys. Two separate `{ row: 1, col: 2 }` objects are different `Map` keys even though their fields match. For coordinate keys, use a stable primitive such as `` `${row},${col}` `` unless identity is intentional.

## Arrays, `Map`, and `Set`

Use an array for an ordered sequence, `Set<T>` for membership or deduplication, and `Map<K, V>` for key-to-value lookup.

```ts
function frequencies(values: readonly number[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

const counts = frequencies([10, 2, 10]);
assert(counts.get(10) === 2, "10 appears twice");
assert(new Set([3, 3, 1]).size === 2, "Set removes duplicates");
```

Array methods differ in mutation:

- `map`, `filter`, `slice`, and spread return new arrays.
- `push`, `pop`, `sort`, `reverse`, and `splice` mutate the array.
- Default `sort()` compares string forms. Always pass `(a, b) => a - b` for ascending numbers.

```ts
const original = [10, 2, 1];
const sorted = [...original].sort((a, b) => a - b);
assert(sorted.join(",") === "1,2,10", "numeric comparator");
assert(original.join(",") === "10,2,1", "copy preserved the input");
```

## JavaScript numbers have limits

TypeScript's `number` is JavaScript's IEEE-754 double-precision value. Every integer through `Number.MAX_SAFE_INTEGER` (`2^53 - 1`) in magnitude is represented exactly; beyond that safe range, some integers are representable and others round to the same value.

```ts
const limit = Number.MAX_SAFE_INTEGER;
assert(Number.isSafeInteger(limit), "the limit is safe");
assert(!Number.isSafeInteger(limit + 1), "the next integer is unsafe");
assert(limit + 1 === limit + 2, "distinct integers can collapse");
```

Use `bigint` for integer arithmetic beyond the safe range, and do not mix `number` and `bigint` operands. Decimal arithmetic such as `0.1 + 0.2` can also round. MDN's [`Number` reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) documents the runtime limits.

## Modules connect files

Any file with a top-level `import` or `export` is a module. Export the smallest public surface and import it by name.

`math.ts`:

```ts
export function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}
```

`main.ts` in the same directory:

```ts
import { clamp } from "./math";

if (clamp(12, 0, 10) !== 10) throw new Error("clamp failed");
console.log("module check passed");
```

Run `bun run main.ts`. From the repository root, strictly check both files by passing their paths to the standalone command from the setup lesson. Use `import type { Name } from "..."` when an import is used only as a type under the repository's `verbatimModuleSyntax` setting. The [TypeScript modules guide](https://www.typescriptlang.org/docs/handbook/modules.html) explains the module model; the runtime or bundler still decides how files are found and executed.

## Practice

1. **Normalize an optional tag.** Write `normalizeTag(tag: string | null): string` that trims and lowercases a tag, returning `"untagged"` for `null` or an empty result. Check `"  TS "`, `"   "`, and `null`. **Answer guidance:** narrow `null` first, then compute one trimmed value and use an explicit empty-string check.
2. **Count words.** Write `wordCounts(words: readonly string[]): Map<string, number>`. Check repeated words and an empty list. **Answer guidance:** for each word, set `(counts.get(word) ?? 0) + 1`; do not use object property syntax on a `Map`.
3. **Preserve the caller's array.** Return ascending unique numbers without changing the input. Check both the result and the original. **Answer guidance:** combine `new Set(values)`, spread, and numeric `sort` in that order.
4. **Split a module.** Export one practice function from `practice.ts`, import it into `practice.test.ts`, and test it with `bun:test`. **Check:** run both `bun test /absolute/path/practice.test.ts` and the focused strict compiler command.

When your checks pass, compare the choices above with the [TypeScript DSA toolkit](../typescript-dsa-toolkit/), then return to the [TypeScript learning track](../../learn/typescript/).

## Official references

- [TypeScript Handbook: Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript Modules](https://www.typescriptlang.org/docs/handbook/modules.html)
- [Bun TypeScript support](https://bun.sh/docs/typescript)
- [MDN: `Array.prototype.sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
