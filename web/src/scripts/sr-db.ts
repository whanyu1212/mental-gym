import type { ReviewRecord, SRExport } from "./sr-types";

const DB_NAME = "mental-gym-sr";
const DB_VERSION = 1;
const STORE = "reviews";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "problemKey" });
        store.createIndex("dueDate", "dueDate", { unique: false });
        store.createIndex("domain", "domain", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(
  db: IDBDatabase,
  mode: IDBTransactionMode
): IDBObjectStore {
  return db.transaction(STORE, mode).objectStore(STORE);
}

export async function getRecord(
  key: string
): Promise<ReviewRecord | undefined> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = tx(db, "readonly").get(key);
    req.onsuccess = () => resolve(req.result as ReviewRecord | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function putRecord(record: ReviewRecord): Promise<void> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = tx(db, "readwrite").put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAllRecords(): Promise<ReviewRecord[]> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = tx(db, "readonly").getAll();
    req.onsuccess = () => resolve(req.result as ReviewRecord[]);
    req.onerror = () => reject(req.error);
  });
}

export async function getDueRecords(
  todayISO: string
): Promise<ReviewRecord[]> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const range = IDBKeyRange.upperBound(todayISO);
    const idx = tx(db, "readonly").index("dueDate");
    const req = idx.getAll(range);
    req.onsuccess = () => resolve(req.result as ReviewRecord[]);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteAllRecords(): Promise<void> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = tx(db, "readwrite").clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function exportAll(records: ReviewRecord[]): string {
  const data: SRExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    records,
  };
  return JSON.stringify(data, null, 2);
}

export async function importAll(json: string): Promise<number> {
  const data: SRExport = JSON.parse(json);
  if (data.version !== 1 || !Array.isArray(data.records)) {
    throw new Error("Invalid SR export file");
  }
  const db = await open();
  const store = tx(db, "readwrite");
  let count = 0;
  for (const record of data.records) {
    store.put(record);
    count++;
  }
  return new Promise((resolve, reject) => {
    store.transaction.oncomplete = () => resolve(count);
    store.transaction.onerror = () => reject(store.transaction.error);
  });
}

export async function resetDatabase(): Promise<void> {
  await deleteAllRecords();
}
