import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { extname } from "node:path";

export interface NoteFile {
	id: string;
	frontmatter: string;
}

/**
 * Walk `notes/` and return each note's published id, matching Astro's glob
 * loader: an explicit frontmatter `slug:` wins, otherwise the path relative to
 * `notes/` without its extension. Notes filed into topic folders pin their
 * original root-level id with `slug:` so URLs and saved highlights survive.
 */
export function noteFiles(directory: URL, prefix = ""): NoteFile[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		if (entry.name === "README.md") return [];
		if (entry.isDirectory()) return noteFiles(new URL(`${entry.name}/`, directory), prefix ? `${prefix}/${entry.name}` : entry.name);
		const extension = extname(entry.name);
		if (extension !== ".md" && extension !== ".mdx") return [];
		const pathId = `${prefix ? `${prefix}/` : ""}${entry.name.slice(0, -extension.length)}`;
		const text = readFileSync(new URL(entry.name, directory), "utf8");
		const fence = text.match(/^---\n([\s\S]*?)\n---/);
		assert.ok(fence, `${pathId} is missing frontmatter`);
		const slug = fence[1].match(/^slug:\s*(.+?)\s*$/m)?.[1].replace(/^["']|["']$/g, "");
		return [{ id: slug ?? pathId, frontmatter: fence[1] }];
	});
}
