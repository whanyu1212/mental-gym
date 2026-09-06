# Agent instructions

Mental Gym is a practice site for algorithms, ML implementations, SQL, and system design. Most of the product is teaching content, not a runtime library.

## Catalog drills (`web/src/data/mlProblemCatalog.ts`)

These are independently authored teaching briefs keyed to joinai.com titles. They are not production APIs and have no runtime. Entries are `status: Placeholder` until a student-facing solution exists.

In review, flag a catalog prompt only if it is:

- internally contradictory, or
- missing an input the algorithm cannot run without
  (for example, “fixed number of steps” with no `steps` argument).

Do not flag missing validation for empty, negative, or fractional inputs, tie-breaks, sentinel conventions, or other unspecified edges unless the prompt already claims a rule it then violates.

Do not request exhaustive contracts on Placeholder drills. Do not treat coaching copy as a library API.

## Tests

`web/tests/ml-problems.test.ts` already checks unique ids/slugs, non-empty coaching fields, and difficulty/status. Do not add per-prompt regex assertions for unspecified numeric edges.
