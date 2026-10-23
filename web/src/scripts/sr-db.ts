import {
  deduplicateImportedAttempts,
  deduplicateImportedEvents,
  deduplicateImportedHighlights,
  parseExport,
  serializeExport,
} from "./sr-export.ts";
import type { AttemptEvent } from "./attempt-types";
import type { Highlight } from "./highlight-types";
import {
  ATTEMPTS_STORE,
  DB_NAME,
  DB_VERSION,
  ensureDatabaseStores,
  EVENTS_STORE,
  HIGHLIGHTS_STORE,
  REVIEWS_STORE,
} from "./db-schema.ts";
import type {
  ImportResult,
  ReviewEvent,
  ReviewRecord,
} from "./sr-types";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    let settled = false;

    request.onupgradeneeded = () => {
      ensureDatabaseStores(request.result);
    };

    request.onblocked = () => {
      if (settled) return;
      settled = true;
      reject(
        new Error(
          "Progress storage upgrade is blocked by another Mental Gym tab. Close other tabs and reload this page."
        )
      );
    };

    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => db.close();

      if (settled) {
        db.close();
        return;
      }

      settled = true;
      resolve(db);
    };

    request.onerror = () => {
      if (settled) return;
      settled = true;
      reject(request.error ?? new Error("Could not open progress storage"));
    };
  });
}

function store(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode
): IDBObjectStore {
  return db.transaction(storeName, mode).objectStore(storeName);
}

function complete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("Database transaction aborted"));
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("Database transaction failed"));
  });
}

export async function getRecord(
  key: string
): Promise<ReviewRecord | undefined> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const request = store(db, REVIEWS_STORE, "readonly").get(key);
    request.onsuccess = () =>
      resolve(request.result as ReviewRecord | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function putRecord(record: ReviewRecord): Promise<void> {
  const db = await open();
  const transaction = db.transaction(REVIEWS_STORE, "readwrite");
  transaction.objectStore(REVIEWS_STORE).put(record);
  await complete(transaction);
}

export async function putReviewAndEvent(
  record: ReviewRecord,
  event: ReviewEvent
): Promise<void> {
  const db = await open();
  const transaction = db.transaction(
    [REVIEWS_STORE, EVENTS_STORE],
    "readwrite"
  );
  transaction.objectStore(REVIEWS_STORE).put(record);
  transaction.objectStore(EVENTS_STORE).add(event);
  await complete(transaction);
}

export async function getAllRecords(): Promise<ReviewRecord[]> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const request = store(db, REVIEWS_STORE, "readonly").getAll();
    request.onsuccess = () => resolve(request.result as ReviewRecord[]);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllReviewEvents(): Promise<ReviewEvent[]> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const request = store(db, EVENTS_STORE, "readonly").getAll();
    request.onsuccess = () => resolve(request.result as ReviewEvent[]);
    request.onerror = () => reject(request.error);
  });
}

export async function putAttemptEvent(attempt: AttemptEvent): Promise<void> {
  const db = await open();
  const transaction = db.transaction(ATTEMPTS_STORE, "readwrite");
  transaction.objectStore(ATTEMPTS_STORE).add(attempt);
  await complete(transaction);
}

export async function getAllAttemptEvents(): Promise<AttemptEvent[]> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const request = store(db, ATTEMPTS_STORE, "readonly").getAll();
    request.onsuccess = () => resolve(request.result as AttemptEvent[]);
    request.onerror = () => reject(request.error);
  });
}

export async function getAttemptsForProblem(
  problemKey: string
): Promise<AttemptEvent[]> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const index = store(db, ATTEMPTS_STORE, "readonly").index("problemKey");
    const request = index.getAll(problemKey);
    request.onsuccess = () => resolve(request.result as AttemptEvent[]);
    request.onerror = () => reject(request.error);
  });
}

export async function getDueRecords(
  todayISO: string
): Promise<ReviewRecord[]> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const range = IDBKeyRange.upperBound(todayISO);
    const index = store(db, REVIEWS_STORE, "readonly").index("dueDate");
    const request = index.getAll(range);
    request.onsuccess = () => resolve(request.result as ReviewRecord[]);
    request.onerror = () => reject(request.error);
  });
}

export function exportAll(
  records: ReviewRecord[],
  events: ReviewEvent[],
  highlights: Highlight[] = [],
  attempts: AttemptEvent[] = []
): string {
  return serializeExport(records, events, highlights, attempts);
}

export async function getAllHighlightRecords(): Promise<Highlight[]> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const request = store(db, HIGHLIGHTS_STORE, "readonly").getAll();
    request.onsuccess = () => resolve(request.result as Highlight[]);
    request.onerror = () => reject(request.error);
  });
}

export async function importAll(json: string): Promise<ImportResult> {
  const { records, events, highlights, attempts } = parseExport(json);
  const existingEvents = await getAllReviewEvents();
  const newEvents = deduplicateImportedEvents(existingEvents, events);
  const existingHighlights = await getAllHighlightRecords();
  const newHighlights = deduplicateImportedHighlights(
    existingHighlights,
    highlights
  );
  const existingAttempts = await getAllAttemptEvents();
  const newAttempts = deduplicateImportedAttempts(existingAttempts, attempts);
  const db = await open();
  const transaction = db.transaction(
    [REVIEWS_STORE, EVENTS_STORE, HIGHLIGHTS_STORE, ATTEMPTS_STORE],
    "readwrite"
  );
  const reviewsStore = transaction.objectStore(REVIEWS_STORE);
  const eventsStore = transaction.objectStore(EVENTS_STORE);
  const highlightsStore = transaction.objectStore(HIGHLIGHTS_STORE);
  const attemptsStore = transaction.objectStore(ATTEMPTS_STORE);

  for (const record of records) {
    reviewsStore.put(record);
  }
  for (const event of newEvents) {
    eventsStore.add(event);
  }
  for (const highlight of newHighlights) {
    highlightsStore.put(highlight);
  }
  for (const attempt of newAttempts) {
    attemptsStore.add(attempt);
  }

  await complete(transaction);
  return {
    recordCount: records.length,
    eventCount: newEvents.length,
    highlightCount: newHighlights.length,
    attemptCount: newAttempts.length,
  };
}

export async function resetDatabase(): Promise<void> {
  const db = await open();
  const transaction = db.transaction(
    [REVIEWS_STORE, EVENTS_STORE, HIGHLIGHTS_STORE, ATTEMPTS_STORE],
    "readwrite"
  );
  transaction.objectStore(REVIEWS_STORE).clear();
  transaction.objectStore(EVENTS_STORE).clear();
  transaction.objectStore(HIGHLIGHTS_STORE).clear();
  transaction.objectStore(ATTEMPTS_STORE).clear();
  await complete(transaction);
}
