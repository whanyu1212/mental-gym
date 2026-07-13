import {
  deduplicateImportedEvents,
  parseExport,
  serializeExport,
} from "./sr-export";
import type {
  ImportResult,
  ReviewEvent,
  ReviewRecord,
} from "./sr-types";

const DB_NAME = "mental-gym-sr";
const DB_VERSION = 2;
const REVIEWS_STORE = "reviews";
const EVENTS_STORE = "reviewEvents";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    let settled = false;

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(REVIEWS_STORE)) {
        const reviews = db.createObjectStore(REVIEWS_STORE, {
          keyPath: "problemKey",
        });
        reviews.createIndex("dueDate", "dueDate", { unique: false });
        reviews.createIndex("domain", "domain", { unique: false });
      }

      if (!db.objectStoreNames.contains(EVENTS_STORE)) {
        const events = db.createObjectStore(EVENTS_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
        events.createIndex("reviewDate", "reviewDate", { unique: false });
        events.createIndex("problemKey", "problemKey", { unique: false });
        events.createIndex("domain", "domain", { unique: false });
      }
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
  events: ReviewEvent[]
): string {
  return serializeExport(records, events);
}

export async function importAll(json: string): Promise<ImportResult> {
  const { records, events } = parseExport(json);
  const existingEvents = await getAllReviewEvents();
  const newEvents = deduplicateImportedEvents(existingEvents, events);
  const db = await open();
  const transaction = db.transaction(
    [REVIEWS_STORE, EVENTS_STORE],
    "readwrite"
  );
  const reviewsStore = transaction.objectStore(REVIEWS_STORE);
  const eventsStore = transaction.objectStore(EVENTS_STORE);

  for (const record of records) {
    reviewsStore.put(record);
  }
  for (const event of newEvents) {
    eventsStore.add(event);
  }

  await complete(transaction);
  return {
    recordCount: records.length,
    eventCount: newEvents.length,
  };
}

export async function resetDatabase(): Promise<void> {
  const db = await open();
  const transaction = db.transaction(
    [REVIEWS_STORE, EVENTS_STORE],
    "readwrite"
  );
  transaction.objectStore(REVIEWS_STORE).clear();
  transaction.objectStore(EVENTS_STORE).clear();
  await complete(transaction);
}
