/** Ordered learning paths. Note IDs are published URLs and highlight keys: never rename them here. */
export const learningLanguages = [
  { id: "python", name: "Python" },
  { id: "julia", name: "Julia" },
  { id: "typescript", name: "TypeScript" },
  { id: "rust", name: "Rust" },
] as const;

export type LearningLanguage = (typeof learningLanguages)[number]["id"];

export interface LearningResource {
  noteId: string;
  purpose: string;
}

export interface LanguageTrack {
  id: LearningLanguage;
  name: string;
  mark: string;
  focus: string;
  description: string;
  setup: LearningResource;
  essentials: LearningResource;
  references: LearningResource[];
  practice: { problemSlug: string; guidance: string }[];
}

export const languageTracks: LanguageTrack[] = [
  {
    ...learningLanguages[0], mark: "Py", focus: "Express the idea clearly.",
    description: "Build confidence with Python's collections and idioms, then put them to work on algorithmic problems.",
    setup: { noteId: "python-start-here", purpose: "Set up Python with uv, run a small program, and write your first test with pytest." },
    essentials: { noteId: "python-essentials", purpose: "Functions, control flow, mutability, comprehensions, iterators, and handling errors." },
    references: [
      { noteId: "python-dsa-toolkit", purpose: "Choose the right collection or helper for the problem." },
      { noteId: "python_builtins_for_leetcode", purpose: "Look up how core types and standard-library APIs behave." },
      { noteId: "python-big-o-cheatsheet", purpose: "Explain the time and space costs of your implementation." },
    ],
    practice: [
      { problemSlug: "1-two-sum", guidance: "Use a dictionary to look up the missing complement. The reference solution is in Python." },
      { problemSlug: "217-contains-duplicate", guidance: "Practice membership checks with a set, then explain the cost." },
    ],
  },
  {
    ...learningLanguages[1], mark: "Jl", focus: "Think in arrays and functions.",
    description: "Build a foundation in Julia's array operations, mutation conventions, and dispatch, with existing algorithm ports to explore.",
    setup: { noteId: "julia-start-here", purpose: "Set up Julia, use the repository project, run a file, and write a small Test testset." },
    essentials: { noteId: "julia-essentials", purpose: "Indexing, arrays and views, mutation, broadcasting, functions, and multiple dispatch." },
    references: [],
    practice: [
      { problemSlug: "1-two-sum", guidance: "Open the Julia solution tab to compare dictionary lookup and indexing with Python." },
      { problemSlug: "242-valid-anagram", guidance: "Open the Julia solution tab to explore character counting and collection operations." },
    ],
  },
  {
    ...learningLanguages[2], mark: "TS", focus: "Make your assumptions explicit.",
    description: "Get comfortable with types and JavaScript collection semantics while translating familiar algorithms into TypeScript.",
    setup: { noteId: "typescript-start-here", purpose: "Use the repository's Bun project, run a TypeScript file, type-check it, and write a test." },
    essentials: { noteId: "typescript-essentials", purpose: "Types and narrowing, null and undefined, object identity, numbers, functions, and modules." },
    references: [
      { noteId: "typescript-dsa-toolkit", purpose: "Translate familiar Python idioms and choose TypeScript tools." },
      { noteId: "typescript-standard-library", purpose: "Understand Array, String, Map, Set, and the helpers you write yourself." },
      { noteId: "typescript-big-o-cheatsheet", purpose: "Recognize operation costs and expensive work hidden inside loops." },
    ],
    practice: [],
  },
  {
    ...learningLanguages[3], mark: "Rs", focus: "Understand what your code owns.",
    description: "Learn to reason about ownership and borrowing, then use Rust's collections to express and test algorithms.",
    setup: { noteId: "rust-start-here", purpose: "Set up Rust and Cargo, run a small program, and write and run a unit test." },
    essentials: { noteId: "rust-essentials", purpose: "Ownership and borrowing first; then slices, String and str, Option and Result, and iterators." },
    references: [
      { noteId: "rust-dsa-toolkit", purpose: "Choose collections and idioms for counting, traversal, heaps, and recursion." },
      { noteId: "rust-standard-library", purpose: "Look up collection, string, iterator, and error-handling APIs." },
      { noteId: "rust-big-o-cheatsheet", purpose: "Account for collection operations, allocation, moving, and cloning." },
    ],
    practice: [],
  },
];

export const sharedFoundations = [
  { noteId: "asymptotic-analysis", purpose: "Describe how time and space grow with input size." },
  { noteId: "recursion-and-iteration", purpose: "Decide between recursion and a loop, and convert one into the other." },
  { noteId: "arrays_and_hashing", purpose: "Choose arrays, maps, and sets around a clear invariant." },
  { noteId: "two_pointers", purpose: "Use relationships between positions to reduce repeated work." },
  { noteId: "sliding_window", purpose: "Maintain just enough state as a window moves." },
  { noteId: "stack", purpose: "Track unfinished work and recognize last-in, first-out patterns." },
  { noteId: "prefix_sum_pattern", purpose: "Reuse accumulated work to answer range queries." },
];
