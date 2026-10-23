export const BACKUP_REMINDER_DAYS = 14;

export interface BackupSnapshot {
  exportedAt: string;
  activityCount: number;
  dataRevision?: string;
}

export interface BackupState {
  activityCount: number;
  dataRevision: string;
}

export function activityCount(
  records: number,
  reviewEvents: number,
  highlights: number,
  attempts: number
): number {
  return records + reviewEvents + highlights + attempts;
}

/** Compactly fingerprints all portable progress, including edits and deletions. */
export function progressRevision(...collections: readonly unknown[][]): string {
  const serialized = JSON.stringify(collections);
  let hash = 0xcbf29ce484222325n;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= BigInt(serialized.charCodeAt(index));
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return hash.toString(16).padStart(16, "0");
}

export function readBackupSnapshot(value: string | null): BackupSnapshot | undefined {
  if (!value) return undefined;
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as BackupSnapshot).exportedAt === "string" &&
      typeof (parsed as BackupSnapshot).activityCount === "number" &&
      Number.isInteger((parsed as BackupSnapshot).activityCount) &&
      (parsed as BackupSnapshot).activityCount >= 0 &&
      ((parsed as BackupSnapshot).dataRevision === undefined ||
        typeof (parsed as BackupSnapshot).dataRevision === "string") &&
      !Number.isNaN(Date.parse((parsed as BackupSnapshot).exportedAt))
    ) {
      return parsed as BackupSnapshot;
    }
  } catch {
    // A broken local preference should never block progress tracking.
  }
  return undefined;
}

export function needsBackup(
  current: BackupState,
  snapshot: BackupSnapshot | undefined,
  now = new Date()
): boolean {
  if (current.activityCount === 0) return false;
  if (!snapshot) return true;
  if (snapshot.dataRevision === current.dataRevision) return false;

  const elapsedMs = now.getTime() - new Date(snapshot.exportedAt).getTime();
  return elapsedMs >= BACKUP_REMINDER_DAYS * 86_400_000;
}
