/**
 * Estimate reading time (in whole minutes) from a note's raw markdown body.
 *
 * Computed at build time from the glob-loader `body` string, so it costs nothing
 * at runtime. We strip the parts that aren't prose reading — frontmatter, fenced
 * code blocks, and MDX import/JSX lines — so `.mdx` notes (which embed component
 * imports and tags) aren't inflated past their actual reading weight. Words are
 * then divided by an average reading speed and rounded up to at least 1 minute.
 */
const WORDS_PER_MINUTE = 200;

export function readingTimeMinutes(body: string | undefined): number {
	if (!body) return 1;

	const prose = body
		.replace(/^---\n[\s\S]*?\n---/, "") // YAML frontmatter
		.replace(/```[\s\S]*?```/g, "") // fenced code blocks
		.replace(/^import .*$/gm, "") // MDX imports
		.replace(/<\/?[A-Za-z][^>]*>/g, ""); // component / HTML tags

	const words = prose.split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
