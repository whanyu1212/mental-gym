import type { AlgorithmGuide, TestCase } from "../data/algorithmGuides";
import type { MLProblem } from "../data/mlProblems";
import type { Problem } from "../data/problems";
import type { SQLProblem } from "../data/sqlProblems";
import type { ReviewDomain } from "../scripts/sr-types";
import { buildQuickReviewItem } from "./quick-review.ts";

export interface ReviewDeckCard {
  problemKey: string;
  domain: ReviewDomain;
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  group: string;
  href: string;
  promptHtml?: string;
  promptText?: string;
  pattern: string;
  trigger: string;
  invariant: string;
  timeComplexity: string;
  spaceComplexity: string;
  topTrap: string;
  trapCase: TestCase | null;
  hints: string[];
}

export interface ReviewDeckSources {
  problems: Problem[];
  getGuide: (slug: string) => AlgorithmGuide | undefined;
  mlProblems: MLProblem[];
  sqlProblems: Pick<
    SQLProblem,
    "id" | "slug" | "title" | "difficulty" | "category" | "summary" | "prompt" | "hints"
  >[];
}

/** Build a lookup dictionary keyed by `domain:slug` for the blind /review deck. */
export function buildReviewDeck(
  sources: ReviewDeckSources,
  basePrefix = ""
): Record<string, ReviewDeckCard> {
  const prefix = basePrefix.replace(/\/$/, "");
  const deck: Record<string, ReviewDeckCard> = {};

  for (const problem of sources.problems) {
    const item = buildQuickReviewItem(problem, sources.getGuide(problem.slug));
    deck[item.problemKey] = {
      problemKey: item.problemKey,
      domain: "algorithms",
      id: item.id,
      slug: item.slug,
      title: item.title,
      difficulty: item.difficulty,
      group: item.group,
      href: `${prefix}/algorithms/${item.slug}/`,
      promptHtml: problem.description,
      pattern: item.pattern,
      trigger: item.trigger,
      invariant: item.invariant,
      timeComplexity: item.timeComplexity,
      spaceComplexity: item.spaceComplexity,
      topTrap: item.topTrap,
      trapCase: item.trapCase,
      hints: [],
    };
  }

  for (const ml of sources.mlProblems) {
    const key = `ml:${ml.slug}`;
    deck[key] = {
      problemKey: key,
      domain: "ml",
      id: ml.id,
      slug: ml.slug,
      title: ml.title,
      difficulty: ml.difficulty,
      group: ml.category,
      href: `${prefix}/machine-learning/${ml.slug}/`,
      promptText: ml.prompt,
      pattern: ml.category,
      trigger: ml.summary,
      invariant: ml.whyItMatters,
      timeComplexity: "",
      spaceComplexity: "",
      topTrap: ml.hints[0] ?? "",
      trapCase: null,
      hints: ml.hints,
    };
  }

  for (const sql of sources.sqlProblems) {
    const key = `sql:${sql.slug}`;
    deck[key] = {
      problemKey: key,
      domain: "sql",
      id: sql.id,
      slug: sql.slug,
      title: sql.title,
      difficulty: sql.difficulty,
      group: sql.category,
      href: `${prefix}/sql/${sql.slug}/`,
      promptText: sql.prompt,
      pattern: sql.category,
      trigger: sql.summary,
      invariant: "",
      timeComplexity: "",
      spaceComplexity: "",
      topTrap: sql.hints[0] ?? "",
      trapCase: null,
      hints: sql.hints,
    };
  }

  return deck;
}

/** Escape `<` so embedded JSON inside `<script type="application/json">` cannot close the tag. */
export function serializeReviewDeck(
  deck: Record<string, ReviewDeckCard>
): string {
  return JSON.stringify(deck).replace(/</g, "\\u003c");
}
