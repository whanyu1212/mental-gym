import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { extname } from "node:path";

import { noteId } from "../src/lib/note-id.ts";

export interface NoteFile {
	id: string;
	frontmatter: string;
}

/**
 * Walk `notes/` and return each note's published id, using the same `noteId`
 * the notes collection passes to Astro's glob loader as `generateId`.
 */
export function noteFiles(directory: URL, prefix = ""): NoteFile[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		if (entry.name === "README.md") return [];
		if (entry.isDirectory()) return noteFiles(new URL(`${entry.name}/`, directory), prefix ? `${prefix}/${entry.name}` : entry.name);
		const extension = extname(entry.name);
		if (extension !== ".md" && extension !== ".mdx") return [];
		const path = `${prefix ? `${prefix}/` : ""}${entry.name}`;
		const text = readFileSync(new URL(entry.name, directory), "utf8");
		const fence = text.match(/^---\n([\s\S]*?)\n---/);
		assert.ok(fence, `${path} is missing frontmatter`);
		const slug = fence[1].match(/^slug:\s*(.+?)\s*$/m)?.[1].replace(/^["']|["']$/g, "");
		return [{ id: noteId(path, slug ? { slug } : {}), frontmatter: fence[1] }];
	});
}
