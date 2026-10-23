import type { Highlight } from "./highlight-types";
import {
  DB_NAME,
  DB_VERSION,
  ensureDatabaseStores,
  HIGHLIGHTS_STORE,
} from "./db-schema.ts";

/**
 * Opens the shared Mental Gym database. Any feature may trigger the upgrade,
 * so the shared schema initializer creates every store the app expects.
 */
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
