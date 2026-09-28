---
title: TypeScript — Start Here
slug: typescript-start-here
description: Install Bun, use Mental Gym's root TypeScript project, and run and strictly type-check a small tested program.
category: Languages
order: -4
status: stable
kind: concept
tags:
  - typescript
  - foundations
---

# TypeScript — Start Here

TypeScript adds a static type checker to JavaScript. The types help before the program runs; JavaScript values still decide what happens at runtime.

This repository already has a Bun package at its root. Use that package for the compiler and Bun types, but keep this first exercise in a temporary scratch directory so it does not become site or solution code.

## Install the tools

Install Bun using the [official Bun installation guide](https://bun.sh/docs/installation). The repository declares TypeScript as a development dependency, so you do not need a separate global TypeScript install. The [TypeScript download page](https://www.typescriptlang.org/download/) explains the project-local installation model.

Open a terminal at the Mental Gym repository root, then install and verify the declared tools:

```sh
cd /path/to/mental-gym
bun install
bun --version
./node_modules/.bin/tsc --version
```

The root is the directory containing `package.json` and `tsconfig.json`. These examples were checked with Bun 1.3.11 and the repository's local TypeScript 7.0.2; your installed Bun version may differ.

## Create a scratch program

The commands below use `/tmp`, which is outside the clone on macOS and Linux. On Windows, choose a temporary directory outside the clone instead.

```sh
mkdir -p /tmp/mental-gym-typescript-start
```

Create `/tmp/mental-gym-typescript-start/greeting.ts`:

```ts
export type Student = {
  name: string;
  scores: number[];
};

export function scoreSummary(student: Student): string {
  const highest = [...student.scores].sort((a, b) => b - a)[0];
  return highest === undefined
    ? `${student.name}: no scores`
    : `${student.name}: ${highest}`;
}

if (import.meta.main) {
  console.log(scoreSummary({ name: "Mina", scores: [7, 12, 10] }));
}
```

Create `/tmp/mental-gym-typescript-start/greeting.test.ts`:

```ts
import { expect, test } from "bun:test";

import { scoreSummary } from "./greeting.ts";

test("chooses the highest numeric score", () => {
  expect(scoreSummary({ name: "Mina", scores: [7, 12, 10] })).toBe("Mina: 12");
});

test("handles an empty score list", () => {
  expect(scoreSummary({ name: "Mina", scores: [] })).toBe("Mina: no scores");
});
```

Run the program and its focused test from the **repository root**:

```sh
bun run /tmp/mental-gym-typescript-start/greeting.ts
bun test /tmp/mental-gym-typescript-start/greeting.test.ts
```

Expected program output:

```text
Mina: 12
```

The test command should report `2 pass` and `0 fail`. Bun's [test runner documentation](https://bun.sh/docs/test) describes the `bun:test` API and filename discovery rules.

## Type-check the scratch files

Bun can execute `.ts` files by transpiling away their type syntax. A successful `bun run` or `bun test` does **not** prove that the TypeScript checker accepted the code. Run the local compiler separately:

```sh
./node_modules/.bin/tsc \
  --ignoreConfig \
  --strict \
  --noEmit \
  --target ES2022 \
  --lib ES2022 \
  --module ESNext \
  --moduleResolution bundler \
  --allowImportingTsExtensions \
  --types bun \
  --typeRoots ./node_modules/@types \
  --skipLibCheck \
  /tmp/mental-gym-typescript-start/greeting.ts \
  /tmp/mental-gym-typescript-start/greeting.test.ts
```

No output and exit status `0` means both scratch files passed strict checking. `--ignoreConfig` tells TypeScript 7 that the explicit options and file list intentionally replace the nearby root configuration. That file list matters: the root `tsconfig.json` includes only `src/leetcode/**/*.ts`, so `bun run typecheck` does not check files in `/tmp` or another scratch directory. The root typecheck can also report unrelated errors in existing LeetCode files; use the focused command above to judge this exercise.

The flags mirror the repository's important choices while adding the scratch files directly. The [TypeScript compiler options reference](https://www.typescriptlang.org/docs/handbook/compiler-options.html) documents `strict`, `noEmit`, and the module settings. Bun's [TypeScript guide](https://bun.sh/docs/typescript) explains the Bun type definitions and recommended compiler configuration.

## What the program already teaches

- `type Student = ...` describes the required object shape.
- `number[]` is a mutable array of numbers.
- `[...student.scores]` makes a shallow copy because `sort` mutates its array.
- Numeric sort needs `(a, b) => b - a`; default JavaScript sort compares strings.
- Index `0` can produce `undefined` at runtime, so the function handles an empty array.
- `export` and `import` let the test call the same function as the program.
- `import.meta.main` is true only when Bun runs this file as the entry point, not when the test imports it.

## Troubleshooting

**`bun: command not found`** — Finish the official install, open a new terminal, and run `bun --version`. Bun's installer normally adds its binary directory to `PATH`.

**`./node_modules/.bin/tsc: no such file or directory`** — You are either outside the repository root or have not run `bun install` there. Check that `package.json` is in the current directory.

**`Cannot find type definition file for 'bun'`** — Run `bun install` at the root. The package declares `@types/bun`; the standalone command points at the root's `node_modules/@types` explicitly.

**`No inputs were found` after `bun run typecheck`** — That script uses the root `tsconfig.json`, whose include pattern is only the LeetCode source tree. Use the explicit standalone command for the scratch files.

**The program runs despite a type error** — That is expected runtime behavior. Bun's [runtime documentation](https://bun.sh/docs/runtime) says it transpiles TypeScript before execution; keep `tsc --noEmit` as a separate check.

## Continue

Next, read [TypeScript Essentials](../typescript-essentials/) for the type and JavaScript runtime rules behind everyday code. Return to the [TypeScript learning track](../../learn/typescript/) at any time, or keep the [TypeScript DSA toolkit](../typescript-dsa-toolkit/) nearby once you begin problems.
