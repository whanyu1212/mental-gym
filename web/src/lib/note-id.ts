import { slug as githubSlug } from "github-slugger";

/**
 * The published id of a note: its `/notes/<id>/` URL segment and the key its
 * saved highlights live under in IndexedDB.
 *
 * A frontmatter `slug:` wins. Otherwise the id is the path under `notes/`
 * without its extension, each segment slugged the way Astro's glob loader does
 * (for example `recommendation-system/metrics`). Notes filed into topic folders
 * after publication pin their original id with `slug:` so existing URLs and
 * highlights survive the move.
 *
 * Shared by `content.config.ts` and the web tests so both agree on every id.
 */
export function noteId(entry: string, data: Record<string, unknown>): string {
	if (typeof data.slug === "string" && data.slug.length > 0) return data.slug;
	return entry
		.replace(/\.mdx?$/, "")
		.split("/")
		.map((segment) => githubSlug(segment))
		.join("/")
		.replace(/\/index$/, "");
}
