import type { Highlight } from "./highlight-types";

const DB_NAME = "mental-gym-sr";
const DB_VERSION = 3;
const HIGHLIGHTS_STORE = "highlights";

/**
 * Opens the shared Mental Gym database. This mirrors the store creation in
 * sr-db.ts because either module may be the first to trigger an upgrade —
 * onupgradeneeded must create every store the app expects, whichever page
 * opened the connection first.
 */
function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    let settled = false;

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains("reviews")) {
        const reviews = db.createObjectStore("reviews", {
          keyPath: "problemKey",
        });
        reviews.createIndex("dueDate", "dueDate", { unique: false });
        reviews.createIndex("domain", "domain", { unique: false });
      }

      if (!db.objectStoreNames.contains("reviewEvents")) {
        const events = db.createObjectStore("reviewEvents", {
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
    };

    request.onblocked = () => {
      if (settled) return;
      settled = true;
      reject(
        new Error(
          "Highlight storage upgrade is blocked by another Mental Gym tab. Close other tabs and reload this page."
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
      reject(request.error ?? new Error("Could not open highlight storage"));
    };
  });
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

export async function getHighlightsForNote(
  noteId: string
): Promise<Highlight[]> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const index = db
      .transaction(HIGHLIGHTS_STORE, "readonly")
      .objectStore(HIGHLIGHTS_STORE)
      .index("noteId");
    const request = index.getAll(noteId);
    request.onsuccess = () => {
      const highlights = request.result as Highlight[];
      highlights.sort((a, b) => a.startOffset - b.startOffset);
      resolve(highlights);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getAllHighlights(): Promise<Highlight[]> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const request = db
      .transaction(HIGHLIGHTS_STORE, "readonly")
      .objectStore(HIGHLIGHTS_STORE)
      .getAll();
    request.onsuccess = () => resolve(request.result as Highlight[]);
    request.onerror = () => reject(request.error);
  });
}

export async function putHighlight(highlight: Highlight): Promise<void> {
  const db = await open();
  const transaction = db.transaction(HIGHLIGHTS_STORE, "readwrite");
  transaction.objectStore(HIGHLIGHTS_STORE).put(highlight);
  await complete(transaction);
}

export async function deleteHighlight(id: string): Promise<void> {
  const db = await open();
  const transaction = db.transaction(HIGHLIGHTS_STORE, "readwrite");
  transaction.objectStore(HIGHLIGHTS_STORE).delete(id);
  await complete(transaction);
}

export async function putHighlights(highlights: Highlight[]): Promise<void> {
  if (highlights.length === 0) return;
  const db = await open();
  const transaction = db.transaction(HIGHLIGHTS_STORE, "readwrite");
  const store = transaction.objectStore(HIGHLIGHTS_STORE);
  for (const highlight of highlights) {
    store.put(highlight);
  }
  await complete(transaction);
}

export async function clearHighlights(): Promise<void> {
  const db = await open();
  const transaction = db.transaction(HIGHLIGHTS_STORE, "readwrite");
  transaction.objectStore(HIGHLIGHTS_STORE).clear();
  await complete(transaction);
}
