import assert from "node:assert/strict";
import test from "node:test";

import {
  activityCount,
  needsBackup,
  readBackupSnapshot,
} from "../src/scripts/backup-status.ts";

test("backup reminders start with the first local activity", () => {
  assert.equal(needsBackup(0, undefined), false);
  assert.equal(needsBackup(1, undefined), true);
});

test("a backup remains quiet until it becomes stale and new activity exists", () => {
  const snapshot = { exportedAt: "2026-08-01T12:00:00.000Z", activityCount: 3 };
  assert.equal(
    needsBackup(4, snapshot, new Date("2026-08-12T11:59:59.000Z")),
    false
  );
  assert.equal(
    needsBackup(4, snapshot, new Date("2026-08-15T12:00:00.000Z")),
    true
  );
  assert.equal(
    needsBackup(3, snapshot, new Date("2026-09-01T12:00:00.000Z")),
    false
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
  assert.equal(activityCount(4, 2, 1, 3), 10);
});
