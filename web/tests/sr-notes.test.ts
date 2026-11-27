import assert from "node:assert/strict";
import test from "node:test";
import "fake-indexeddb/auto";

import { getRecord, putRecord, resetDatabase } from "../src/scripts/sr-db.ts";
import { formatCardStatus, savePersonalNote } from "../src/scripts/sr-notes.ts";
import { createNewRecord, schedule } from "../src/scripts/sr-scheduler.ts";

const SEED = {
  domain: "algorithms" as const,
  slug: "1-two-sum",
  title: "Two Sum",
  difficulty: "Easy",
  group: "Arrays & Hashing",
};

const TODAY = "2026-11-27";

test("savePersonalNote ignores blank notes when no record exists", async () => {
  await resetDatabase();
  const returned = await savePersonalNote(SEED, "   \n  ");
  assert.equal(returned.lastReviewDate, null);
  assert.equal("note" in returned, false);
  assert.equal(await getRecord("algorithms:1-two-sum"), undefined);
});

test("savePersonalNote creates an unreviewed record for first note and preserves SR state on updates", async () => {
  await resetDatabase();

  // First note on an unreviewed problem saves as unreviewed (lastReviewDate: null)
  const first = await savePersonalNote(SEED, "  Check complement before inserting  ");
  assert.equal(first.lastReviewDate, null);
  assert.equal(first.note, "Check complement before inserting");

  // Clearing a note on an unreviewed problem removes the empty record
  const removed = await savePersonalNote(SEED, "   ");
  assert.equal("note" in removed, false);
  assert.equal(await getRecord("algorithms:1-two-sum"), undefined);

  // Re-save note, complete a review, then update/clear while preserving SR state
  const withNote = await savePersonalNote(SEED, "Check complement before inserting");
  const reviewed = schedule(withNote, 2, {
    now: new Date(2026, 10, 27, 10, 0, 0),
    fuzz: false,
  });
  await putRecord({ ...reviewed, lapses: 2 });

  const updated = await savePersonalNote(SEED, "Map value -> index, not index -> value");
  assert.equal(updated.note, "Map value -> index, not index -> value");
  assert.equal(updated.repetitions, reviewed.repetitions);
  assert.equal(updated.interval, reviewed.interval);
  assert.equal(updated.easeFactor, reviewed.easeFactor);
  assert.equal(updated.lapses, 2);

  const cleared = await savePersonalNote(SEED, "   ");
  assert.equal("note" in cleared, false);
  assert.equal(cleared.repetitions, reviewed.repetitions);
  assert.equal(cleared.lapses, 2);
  await resetDatabase();
});

test("formatCardStatus handles unreviewed, due, overdue, upcoming, and weak-spot states", () => {
  assert.deepEqual(formatCardStatus(undefined, TODAY), {
    text: "",
    kind: "new",
    weakSpot: false,
  });

  const unreviewed = createNewRecord(
    SEED.domain,
    SEED.slug,
    SEED.title,
    SEED.difficulty,
    SEED.group
  );
  assert.deepEqual(formatCardStatus(unreviewed, TODAY), {
    text: "",
    kind: "new",
    weakSpot: false,
  });

  const due = {
    ...unreviewed,
    lastReviewDate: "2026-11-26",
    dueDate: TODAY,
    repetitions: 1,
    interval: 1,
    lapses: 2,
  };
  assert.deepEqual(formatCardStatus(due, TODAY), {
    text: "Due today",
    kind: "due",
    weakSpot: true,
  });

  const overdue = {
    ...due,
    dueDate: "2026-11-24",
    lapses: 1,
  };
  assert.deepEqual(formatCardStatus(overdue, TODAY), {
    text: "3d overdue",
    kind: "overdue",
    weakSpot: false,
  });

  const upcoming = {
    ...due,
    dueDate: "2026-12-03",
    repetitions: 3,
    interval: 6,
    lapses: 0,
  };
  assert.deepEqual(formatCardStatus(upcoming, TODAY), {
    text: "3× · 6d",
    kind: "upcoming",
    weakSpot: false,
  });
});
