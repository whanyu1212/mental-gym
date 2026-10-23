import assert from "node:assert/strict";
import test from "node:test";
import "fake-indexeddb/auto";

import type { AttemptEvent } from "../src/scripts/attempt-types.ts";
import { getAllHighlights } from "../src/scripts/highlight-db.ts";
import {
  exportAll,
  getAllAttemptEvents,
  getAllRecords,
  importAll,
  putAttemptEvent,
  resetDatabase,
} from "../src/scripts/sr-db.ts";
import type { ReviewRecord } from "../src/scripts/sr-types.ts";

const record: ReviewRecord = {
  problemKey: "algorithms:1-two-sum",
  domain: "algorithms",
  slug: "1-two-sum",
  title: "Two Sum",
  difficulty: "Easy",
  group: "Arrays & Hashing",
  easeFactor: 2.5,
  interval: 1,
  repetitions: 1,
  dueDate: "2026-08-13",
  lastReviewDate: "2026-08-12",
  lastRating: 2,
};

const attempt: AttemptEvent = {
  attemptedAt: "2026-08-12T10:00:00.000Z",
  attemptDate: "2026-08-12",
  problemKey: record.problemKey,
  domain: record.domain,
  slug: record.slug,
  title: record.title,
  difficulty: record.difficulty,
  group: record.group,
  durationSeconds: 300,
  outcome: "solved",
  supportUsed: "none",
  confidence: 3,
  difficultyArea: "none",
};

function complete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error);
    transaction.onerror = () => reject(transaction.error);
  });
}

function deleteDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase("mental-gym-sr");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Database deletion was blocked"));
  });
}

async function createLegacyV3Database(): Promise<void> {
  const request = indexedDB.open("mental-gym-sr", 3);
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    request.onupgradeneeded = () => {
      const db = request.result;
      const reviews = db.createObjectStore("reviews", { keyPath: "problemKey" });
      reviews.createIndex("dueDate", "dueDate", { unique: false });
      reviews.createIndex("domain", "domain", { unique: false });
      const events = db.createObjectStore("reviewEvents", { keyPath: "id", autoIncrement: true });
      events.createIndex("reviewDate", "reviewDate", { unique: false });
      events.createIndex("problemKey", "problemKey", { unique: false });
      events.createIndex("domain", "domain", { unique: false });
      const highlights = db.createObjectStore("highlights", { keyPath: "id" });
      highlights.createIndex("noteId", "noteId", { unique: false });
      highlights.createIndex("createdAt", "createdAt", { unique: false });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const transaction = database.transaction("reviews", "readwrite");
  transaction.objectStore("reviews").put(record);
  await complete(transaction);
  database.close();
}

test("highlight storage can initialize the shared v4 schema first", async () => {
  assert.deepEqual(await getAllHighlights(), []);
  assert.deepEqual(await getAllAttemptEvents(), []);
  await deleteDatabase();
});

test("v3 progress upgrades to v4 without losing reviews and includes attempts in import/reset", async () => {
  await createLegacyV3Database();

  assert.deepEqual(await getAllRecords(), [record]);
  assert.deepEqual(await getAllAttemptEvents(), []);

  await putAttemptEvent(attempt);
  assert.deepEqual(
    (await getAllAttemptEvents()).map(({ id: _id, ...event }) => event),
    [attempt]
  );

  await resetDatabase();
  const backup = exportAll([record], [], [], [attempt]);
  assert.deepEqual(await importAll(backup), {
    recordCount: 1,
    eventCount: 0,
    highlightCount: 0,
    attemptCount: 1,
  });
  assert.deepEqual(await getAllRecords(), [record]);
  assert.deepEqual(
    (await getAllAttemptEvents()).map(({ id: _id, ...event }) => event),
    [attempt]
  );

  assert.equal((await importAll(backup)).attemptCount, 0);
  await resetDatabase();
  assert.deepEqual(await getAllRecords(), []);
  assert.deepEqual(await getAllAttemptEvents(), []);
});
