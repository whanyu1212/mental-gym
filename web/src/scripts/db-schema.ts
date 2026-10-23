export const DB_NAME = "mental-gym-sr";
export const DB_VERSION = 4;

export const REVIEWS_STORE = "reviews";
export const EVENTS_STORE = "reviewEvents";
export const HIGHLIGHTS_STORE = "highlights";
export const ATTEMPTS_STORE = "attemptEvents";

/** Create every shared store because any feature may open the database first. */
export function ensureDatabaseStores(db: IDBDatabase): void {
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

  if (!db.objectStoreNames.contains(HIGHLIGHTS_STORE)) {
    const highlights = db.createObjectStore(HIGHLIGHTS_STORE, {
      keyPath: "id",
    });
    highlights.createIndex("noteId", "noteId", { unique: false });
    highlights.createIndex("createdAt", "createdAt", { unique: false });
  }

  if (!db.objectStoreNames.contains(ATTEMPTS_STORE)) {
    const attempts = db.createObjectStore(ATTEMPTS_STORE, {
      keyPath: "id",
      autoIncrement: true,
    });
    attempts.createIndex("attemptDate", "attemptDate", { unique: false });
    attempts.createIndex("problemKey", "problemKey", { unique: false });
    attempts.createIndex("outcome", "outcome", { unique: false });
    attempts.createIndex("group", "group", { unique: false });
  }
}
