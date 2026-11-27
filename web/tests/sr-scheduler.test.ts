import assert from "node:assert/strict";
import test from "node:test";

import {
  addDaysISO,
  createNewRecord,
  daysUntilDue,
  diffDaysISO,
  fuzzInterval,
  isWeakSpot,
  localDateISO,
  schedule,
  selectDailySession,
  sortReviewQueue,
  spreadOverdue,
  withPersonalNote,
} from "../src/scripts/sr-scheduler.ts";
import type { ReviewRecord } from "../src/scripts/sr-types.ts";

const NOW = new Date(2026, 10, 27, 10, 0, 0); // 2026-11-27 local
const TODAY = localDateISO(NOW);

function makeRecord(overrides: Partial<ReviewRecord> = {}): ReviewRecord {
  return {
    ...createNewRecord(
      "algorithms",
      "1-two-sum",
      "Two Sum",
      "Easy",
      "Arrays & Hashing"
    ),
    dueDate: TODAY,
    ...overrides,
  };
}

test("Again resets repetitions, increments lapses, sets same-day due, and clamps easeFactor at 1.3", () => {
  const initial = makeRecord({
    repetitions: 3,
    interval: 10,
    easeFactor: 1.4,
    lastReviewDate: "2026-11-17",
    lapses: 1,
  });

  const updated = schedule(initial, 0, { now: NOW, fuzz: false });
  assert.equal(updated.repetitions, 0);
  assert.equal(updated.lapses, 2);
  assert.equal(updated.interval, 0);
  assert.equal(updated.dueDate, TODAY);
  assert.equal(updated.easeFactor, 1.3);
  assert.equal(updated.lastReviewDate, TODAY);
  assert.equal(updated.lastRating, 0);
});

test("Hard promotes rep 0 to rep 1 and scales established intervals without resetting streak", () => {
  const fresh = makeRecord();
  const afterFirstHard = schedule(fresh, 1, { now: NOW, fuzz: false });
  assert.equal(afterFirstHard.repetitions, 1);
  assert.equal(afterFirstHard.interval, 1);
  assert.equal(afterFirstHard.dueDate, addDaysISO(TODAY, 1));
  assert.equal(afterFirstHard.easeFactor, 2.35);

  const established = makeRecord({
    repetitions: 3,
    interval: 10,
    easeFactor: 2.5,
    lastReviewDate: "2026-11-17",
  });
  const afterHard = schedule(established, 1, { now: NOW, fuzz: false });
  assert.equal(afterHard.repetitions, 3);
  assert.equal(afterHard.interval, 12);
  assert.equal(afterHard.dueDate, addDaysISO(TODAY, 12));
  assert.equal(afterHard.easeFactor, 2.35);
});

test("Good progresses 1 -> 3 -> round(interval * ease) and preserves easeFactor", () => {
  const r0 = makeRecord();
  const r1 = schedule(r0, 2, { now: NOW, fuzz: false });
  assert.equal(r1.repetitions, 1);
  assert.equal(r1.interval, 1);
  assert.equal(r1.easeFactor, 2.5);

  const d1 = new Date(2026, 10, 28, 10, 0, 0);
  const r2 = schedule(r1, 2, { now: d1, fuzz: false });
  assert.equal(r2.repetitions, 2);
  assert.equal(r2.interval, 3);
  assert.equal(r2.easeFactor, 2.5);

  const d2 = new Date(2026, 11, 1, 10, 0, 0);
  const r3 = schedule(r2, 2, { now: d2, fuzz: false });
  assert.equal(r3.repetitions, 3);
  assert.equal(r3.interval, 8);
  assert.equal(r3.easeFactor, 2.5);
});

test("Easy progresses 4 -> 6 -> round(interval * ease * 1.3) and raises easeFactor", () => {
  const r0 = makeRecord();
  const r1 = schedule(r0, 3, { now: NOW, fuzz: false });
  assert.equal(r1.repetitions, 1);
  assert.equal(r1.interval, 4);
  assert.equal(r1.easeFactor, 2.65);

  const d1 = new Date(2026, 11, 1, 10, 0, 0);
  const r2 = schedule(r1, 3, { now: d1, fuzz: false });
  assert.equal(r2.repetitions, 2);
  assert.equal(r2.interval, 6);
  assert.equal(r2.easeFactor, 2.8);

  const d2 = new Date(2026, 11, 7, 10, 0, 0);
  const r3 = schedule(r2, 3, { now: d2, fuzz: false });
  assert.equal(r3.repetitions, 3);
  assert.equal(r3.interval, 22); // round(6 * 2.8 * 1.3) = 22
  assert.equal(r3.easeFactor, 2.95);
});

test("overdue survival time credits Hard (1/4), Good (1/2), and Easy (full)", () => {
  const base = makeRecord({
    repetitions: 2,
    interval: 4,
    easeFactor: 2.5,
    dueDate: "2026-11-19", // 8 days overdue on 2026-11-27
    lastReviewDate: "2026-11-15",
  });

  const hard = schedule(base, 1, { now: NOW, fuzz: false });
  assert.equal(hard.interval, 7); // round((4 + floor(8/4)) * 1.2) = round(6 * 1.2) = 7

  const good = schedule(base, 2, { now: NOW, fuzz: false });
  assert.equal(good.interval, 20); // round((4 + floor(8/2)) * 2.5) = round(8 * 2.5) = 20

  const easy = schedule(base, 3, { now: NOW, fuzz: false });
  assert.equal(easy.interval, 39); // round((4 + 8) * 2.5 * 1.3) = 39

  // Never reviewed cards do not receive overdue credit
  const unreviewed = makeRecord({
    dueDate: "2026-11-01",
    lastReviewDate: null,
  });
  const firstGood = schedule(unreviewed, 2, { now: NOW, fuzz: false });
  assert.equal(firstGood.interval, 1);
});

test("fuzzInterval leaves intervals < 4 unchanged and stays within +/-15% deterministically", () => {
  assert.equal(fuzzInterval(0, () => 0), 0);
  assert.equal(fuzzInterval(1, () => 0.999999), 1);
  assert.equal(fuzzInterval(3, () => 0), 3);

  // interval = 20 -> delta = 3 -> [17, 23]
  assert.equal(fuzzInterval(20, () => 0), 17);
  assert.equal(fuzzInterval(20, () => 0.5), 20);
  assert.equal(fuzzInterval(20, () => 0.999999), 23);

  // schedule applies fuzz when fuzz !== false and quality !== 0
  const due = makeRecord({
    repetitions: 2,
    interval: 8,
    easeFactor: 2.5,
    lastReviewDate: "2026-11-19",
  });
  const minFuzz = schedule(due, 2, { now: NOW, random: () => 0 });
  const maxFuzz = schedule(due, 2, { now: NOW, random: () => 0.999999 });
  assert.equal(minFuzz.interval, 17); // 20 - 3
  assert.equal(maxFuzz.interval, 23); // 20 + 3
});

test("DST-safe date helpers handle day math and daysUntilDue accurately", () => {
  assert.equal(addDaysISO("2026-03-07", 3), "2026-03-10");
  assert.equal(diffDaysISO("2026-03-07", "2026-03-10"), 3);
  assert.equal(diffDaysISO("2026-11-27", "2026-11-25"), -2);
  assert.equal(
    daysUntilDue(makeRecord({ dueDate: "2026-11-25" }), "2026-11-27"),
    -2
  );
});

test("sortReviewQueue orders by shortest interval, higher lapses, earlier dueDate, then title", () => {
  const input: ReviewRecord[] = [
    makeRecord({
      problemKey: "algorithms:a",
      title: "Zeta",
      interval: 10,
      lapses: 3,
      dueDate: "2026-11-20",
    }),
    makeRecord({
      problemKey: "algorithms:b",
      title: "Beta",
      interval: 3,
      lapses: 1,
      dueDate: "2026-11-25",
    }),
    makeRecord({
      problemKey: "algorithms:c",
      title: "Gamma",
      interval: 3,
      lapses: 2,
      dueDate: "2026-11-26",
    }),
    makeRecord({
      problemKey: "algorithms:d",
      title: "Alpha",
      interval: 3,
      lapses: 2,
      dueDate: "2026-11-24",
    }),
    makeRecord({
      problemKey: "algorithms:e",
      title: "Aardvark",
      interval: 3,
      lapses: 2,
      dueDate: "2026-11-24",
    }),
  ];
  const snapshot = input.map((r) => r.problemKey);
  const sorted = sortReviewQueue(input);

  assert.deepEqual(
    sorted.map((r) => r.problemKey),
    ["algorithms:e", "algorithms:d", "algorithms:c", "algorithms:b", "algorithms:a"]
  );
  // Does not mutate input array
  assert.deepEqual(
    input.map((r) => r.problemKey),
    snapshot
  );
});

test("selectDailySession filters unreviewed/upcoming cards, caps session, and reports backlog", () => {
  const records: ReviewRecord[] = [
    makeRecord({
      problemKey: "algorithms:new",
      title: "New",
      lastReviewDate: null,
      dueDate: "2026-11-20",
    }),
    makeRecord({
      problemKey: "algorithms:future",
      title: "Future",
      lastReviewDate: "2026-11-25",
      dueDate: "2026-11-28",
      interval: 3,
    }),
    makeRecord({
      problemKey: "algorithms:due1",
      title: "Due 1",
      lastReviewDate: "2026-11-26",
      dueDate: TODAY,
      interval: 1,
    }),
    makeRecord({
      problemKey: "algorithms:due2",
      title: "Due 2",
      lastReviewDate: "2026-11-24",
      dueDate: "2026-11-26",
      interval: 2,
    }),
    makeRecord({
      problemKey: "algorithms:due3",
      title: "Due 3",
      lastReviewDate: "2026-11-10",
      dueDate: "2026-11-20",
      interval: 10,
    }),
  ];

  const { session, backlogCount } = selectDailySession(records, {
    today: TODAY,
    cap: 2,
  });
  assert.deepEqual(
    session.map((r) => r.problemKey),
    ["algorithms:due1", "algorithms:due2"]
  );
  assert.equal(backlogCount, 1);
});

test("spreadOverdue distributes overdue cards across N days without altering interval or ease", () => {
  const records: ReviewRecord[] = [
    makeRecord({
      problemKey: "algorithms:due-today",
      title: "Due Today",
      lastReviewDate: "2026-11-26",
      dueDate: TODAY,
      interval: 1,
    }),
    makeRecord({
      problemKey: "algorithms:unreviewed",
      title: "Unreviewed",
      lastReviewDate: null,
      dueDate: "2026-11-20",
      interval: 0,
    }),
    ...Array.from({ length: 5 }, (_, i) =>
      makeRecord({
        problemKey: `algorithms:od-${i}`,
        title: `Overdue ${i}`,
        lastReviewDate: "2026-11-10",
        dueDate: "2026-11-20",
        interval: i + 1,
        easeFactor: 2.3,
        repetitions: 2,
        lapses: 1,
        note: `Trap ${i}`,
      })
    ),
  ];

  const updated = spreadOverdue(records, { today: TODAY, days: 5 });
  assert.equal(updated.length, 5);
  assert.deepEqual(
    updated.map((r) => [r.problemKey, r.dueDate]),
    [
      ["algorithms:od-0", "2026-11-27"],
      ["algorithms:od-1", "2026-11-28"],
      ["algorithms:od-2", "2026-11-29"],
      ["algorithms:od-3", "2026-11-30"],
      ["algorithms:od-4", "2026-12-01"],
    ]
  );
  for (const r of updated) {
    assert.equal(r.easeFactor, 2.3);
    assert.equal(r.repetitions, 2);
    assert.equal(r.lapses, 1);
    assert.ok(r.note?.startsWith("Trap "));
  }
  assert.deepEqual(spreadOverdue([records[0], records[1]], { today: TODAY }), []);
});

test("withPersonalNote trims and omits blank notes, and isWeakSpot checks lapse threshold", () => {
  const base = makeRecord({ lapses: 1 });
  const noted = withPersonalNote(base, "  Check num - 1 not in set  ");
  assert.equal(noted.note, "Check num - 1 not in set");

  const cleared = withPersonalNote(noted, "   \n  ");
  assert.equal("note" in cleared, false);

  assert.equal(isWeakSpot(base), false);
  assert.equal(isWeakSpot({ ...base, lapses: 2 }), true);
  assert.equal(isWeakSpot(base, 1), true);
  assert.equal(isWeakSpot(makeRecord({ lapses: undefined })), false);
});

test("cross-rating transitions never shrink interval below the prior interval or minimum step", () => {
  // Easy (4d) followed by Good should grow, not shrink back to 3d
  const afterEasy = schedule(makeRecord(), 3, { now: NOW, fuzz: false });
  const easyDue = new Date(2026, 11, 1, 10, 0, 0);
  const afterEasyThenGood = schedule(afterEasy, 2, {
    now: easyDue,
    fuzz: false,
  });
  assert.equal(afterEasyThenGood.repetitions, 2);
  assert.equal(afterEasyThenGood.interval, 11); // round(4 * 2.65) = 11

  // Hard growth at rep 1 followed by Easy should not shrink back to 6d
  const grownViaHard = makeRecord({
    repetitions: 1,
    interval: 7,
    easeFactor: 2.0,
    lastReviewDate: "2026-11-20",
  });
  const afterHardThenEasy = schedule(grownViaHard, 3, {
    now: NOW,
    fuzz: false,
  });
  assert.equal(afterHardThenEasy.repetitions, 2);
  assert.ok(afterHardThenEasy.interval >= 9);

  // Low-ease Good at rep 3+ never fuzzes down to or below previous interval
  const lowEase = makeRecord({
    repetitions: 2,
    interval: 3,
    easeFactor: 1.3,
    lastReviewDate: "2026-11-24",
  });
  const lowEaseGood = schedule(lowEase, 2, { now: NOW, random: () => 0 });
  assert.equal(lowEaseGood.interval, 4);
});

test("date parsing and numeric options reject overflow dates and handle NaN safely", () => {
  assert.throws(() => addDaysISO("2026-02-31", 1), /Invalid ISO date/);
  assert.throws(() => diffDaysISO("2026-13-01", TODAY), /Invalid ISO date/);

  const due = makeRecord({
    repetitions: 2,
    interval: 8,
    easeFactor: 2.5,
    lastReviewDate: "2026-11-19",
  });
  const scheduledWithNaNRandom = schedule(due, 2, {
    now: NOW,
    random: () => Number.NaN,
  });
  assert.equal(scheduledWithNaNRandom.interval, 20);
  assert.equal(scheduledWithNaNRandom.dueDate, addDaysISO(TODAY, 20));

  const { session, backlogCount } = selectDailySession([due], {
    today: TODAY,
    cap: Number.NaN,
  });
  assert.equal(session.length, 1);
  assert.equal(backlogCount, 0);

  const overdue = makeRecord({
    lastReviewDate: "2026-11-10",
    dueDate: "2026-11-20",
    interval: 2,
  });
  const spreadWithNaNDays = spreadOverdue([overdue], {
    today: TODAY,
    days: Number.NaN,
  });
  assert.equal(spreadWithNaNDays[0].dueDate, TODAY);
});

test("first-review Easy fuzzed upward still uses the 6-day second learning step", () => {
  const firstEasy = schedule(makeRecord(), 3, {
    now: NOW,
    random: () => 0.999999,
  });
  assert.equal(firstEasy.repetitions, 1);
  assert.equal(firstEasy.interval, 5);

  const dueDate = new Date(2026, 11, 2, 10, 0, 0);
  const secondEasyMin = schedule(firstEasy, 3, {
    now: dueDate,
    random: () => 0,
  });
  assert.equal(secondEasyMin.repetitions, 2);
  assert.equal(secondEasyMin.interval, 6);

  const secondEasyMax = schedule(firstEasy, 3, {
    now: dueDate,
    random: () => 0.999999,
  });
  assert.equal(secondEasyMax.repetitions, 2);
  assert.equal(secondEasyMax.interval, 7);
});
