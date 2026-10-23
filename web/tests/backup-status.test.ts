import assert from "node:assert/strict";
import test from "node:test";

import {
  activityCount,
  needsBackup,
  progressRevision,
  readBackupSnapshot,
} from "../src/scripts/backup-status.ts";

test("backup reminders start with the first local activity", () => {
  assert.equal(needsBackup({ activityCount: 0, dataRevision: "empty" }, undefined), false);
  assert.equal(needsBackup({ activityCount: 1, dataRevision: "a" }, undefined), true);
});

test("a backup remains quiet until it becomes stale and new activity exists", () => {
  const snapshot = {
    exportedAt: "2026-08-01T12:00:00.000Z",
    activityCount: 3,
    dataRevision: "before",
  };
  assert.equal(
    needsBackup(
      { activityCount: 4, dataRevision: "after" },
      snapshot,
      new Date("2026-08-12T11:59:59.000Z")
    ),
    false
  );
  assert.equal(
    needsBackup(
      { activityCount: 4, dataRevision: "after" },
      snapshot,
      new Date("2026-08-15T12:00:00.000Z")
    ),
    true
  );
  assert.equal(
    needsBackup(
      { activityCount: 3, dataRevision: "before" },
      snapshot,
      new Date("2026-09-01T12:00:00.000Z")
    ),
    false
  );
});

test("content revisions detect edits and deletions even when counts do not increase", () => {
  const original = progressRevision([{ id: "h1", color: "yellow" }]);
  const edited = progressRevision([{ id: "h1", color: "blue" }]);
  const deleted = progressRevision([]);

  assert.notEqual(original, edited);
  assert.notEqual(original, deleted);

  const snapshot = {
    exportedAt: "2026-08-01T12:00:00.000Z",
    activityCount: 1,
    dataRevision: original,
  };
  assert.equal(
    needsBackup(
      { activityCount: 1, dataRevision: edited },
      snapshot,
      new Date("2026-08-15T12:00:00.000Z")
    ),
    true
  );
});

test("backup snapshot parsing rejects malformed values", () => {
  assert.equal(readBackupSnapshot(null), undefined);
  assert.equal(readBackupSnapshot("not json"), undefined);
  assert.equal(readBackupSnapshot('{"exportedAt":"bad","activityCount":1}'), undefined);
  assert.deepEqual(
    readBackupSnapshot('{"exportedAt":"2026-08-01T12:00:00.000Z","activityCount":4}'),
    { exportedAt: "2026-08-01T12:00:00.000Z", activityCount: 4 }
  );
  assert.deepEqual(
    readBackupSnapshot('{"exportedAt":"2026-08-01T12:00:00.000Z","activityCount":4,"dataRevision":"abc"}'),
    { exportedAt: "2026-08-01T12:00:00.000Z", activityCount: 4, dataRevision: "abc" }
  );
  assert.equal(activityCount(4, 2, 1, 3), 10);
});
