import assert from "node:assert/strict";
import test from "node:test";
import { languageTracks, learningLanguages, sharedFoundations } from "../src/data/learningTracks.ts";
import { problems } from "../src/data/problems.ts";
import { noteFiles } from "./note-files.ts";

const notes = new Map(noteFiles(new URL("../../notes/", import.meta.url)).map(note => [note.id, note]));

test("each supported language has one learning track", () => {
  assert.deepEqual(languageTracks.map(track => track.id), learningLanguages.map(language => language.id));
  assert.equal(new Set(languageTracks.map(track => track.id)).size, languageTracks.length);
});

test("learning paths resolve published notes without duplicate references", () => {
  for (const path of [...languageTracks.map(track => track.references), sharedFoundations]) {
    assert.equal(new Set(path.map(reference => reference.noteId)).size, path.length);
    for (const reference of path) {
      const note = notes.get(reference.noteId);
      assert.ok(note, `missing published note ${reference.noteId}`);
      assert.doesNotMatch(note.frontmatter, /^category: Meta$/m);
      assert.doesNotMatch(note.frontmatter, /^kind: template$/m);
    }
  }
});

test("track practice links have a solution in that language", () => {
  for (const track of languageTracks) {
    for (const exercise of track.practice) {
      const problem = problems.find(problem => problem.slug === exercise.problemSlug);
      assert.ok(problem, `missing problem ${exercise.problemSlug}`);
      const solution = problem.solutions[track.id as keyof typeof problem.solutions];
      assert.ok(solution?.trim(), `${exercise.problemSlug} has no ${track.id} solution`);
    }
  }
});
