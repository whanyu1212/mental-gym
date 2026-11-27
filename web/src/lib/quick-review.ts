import type { AlgorithmGuide, TestCase } from "../data/algorithmGuides";
import type { Difficulty, Problem } from "../data/problems";

export interface QuickReviewItem {
  problemKey: string;
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  group: string;
  topics: string[];
  pattern: string;
  trigger: string;
  invariant: string;
  timeComplexity: string;
  spaceComplexity: string;
  topTrap: string;
  trapCase: TestCase | null;
}

/** Project a problem + optional teaching guide into a compact quick-review card payload. */
export function buildQuickReviewItem(
  problem: Problem,
  guide: AlgorithmGuide | undefined
): QuickReviewItem {
  return {
    problemKey: `algorithms:${problem.slug}`,
    id: problem.id,
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty,
    group: problem.group,
    topics: problem.topics,
    pattern: guide?.pattern ?? problem.group,
    trigger: guide?.recognitionSignals[0] ?? "",
    invariant: guide?.invariant ?? "",
    timeComplexity: guide?.complexity.time ?? "",
    spaceComplexity: guide?.complexity.space ?? "",
    topTrap: guide?.pitfalls[0] ?? "",
    trapCase: guide?.testCases.find((tc) => tc.kind === "trap") ?? null,
  };
}
