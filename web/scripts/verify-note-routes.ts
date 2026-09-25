/**
 * Post-build check: every note publishes at /notes/<id>/ and its highlighter is
 * keyed by that same id. Ids come from the same `noteId` that
 * `content.config.ts` passes to the glob loader, so this catches any gap
 * between what the tests model and what `astro build` actually emits.
 *
 * Run after `astro build`: `npm run verify:notes`.
 */
import { existsSync, readFileSync } from "node:fs";

import { noteFiles } from "../tests/note-files.ts";

const webRoot = new URL("../", import.meta.url);
const notes = noteFiles(new URL("../notes/", webRoot));
const failures: string[] = [];

for (const { id } of notes) {
	const page = new URL(`dist/notes/${id}/index.html`, webRoot);
	if (!existsSync(page)) {
		failures.push(`missing built page /notes/${id}/`);
		continue;
	}
	const keys = [...readFileSync(page, "utf8").matchAll(/data-note-id="([^"]*)"/g)].map((match) => match[1]);
	if (keys.length !== 1 || keys[0] !== id) {
		failures.push(`/notes/${id}/ highlight key is ${JSON.stringify(keys)}, expected ["${id}"]`);
	}
}

if (failures.length > 0) {
	console.error(`Note route check failed:\n  ${failures.join("\n  ")}`);
	process.exit(1);
}
console.log(`Verified ${notes.length} note routes and highlight keys.`);
