import { solutionLanguages, type Problem, type SolutionLanguage } from "../data/problems.ts";

const labels: Record<SolutionLanguage, string> = {
	python: "Python",
	julia: "Julia",
	typescript: "TypeScript",
	rust: "Rust",
};

/** Only available implementations become tabs; the first one is the default. */
export function getProblemSolutions(solutions: Problem["solutions"]) {
	return solutionLanguages.flatMap((language) => {
		const code = solutions[language];
		return code?.trim() ? [{ language, label: labels[language], code }] : [];
	});
}
