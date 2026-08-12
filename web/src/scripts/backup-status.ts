export const BACKUP_REMINDER_DAYS = 14;

export interface BackupSnapshot {
  exportedAt: string;
  activityCount: number;
}

export function activityCount(
  records: number,
  reviewEvents: number,
  highlights: number,
  attempts: number
): number {
  return records + reviewEvents + highlights + attempts;
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
  currentActivityCount: number,
  snapshot: BackupSnapshot | undefined,
  now = new Date()
): boolean {
  if (currentActivityCount === 0) return false;
  if (!snapshot) return true;
  if (currentActivityCount <= snapshot.activityCount) return false;

  const elapsedMs = now.getTime() - new Date(snapshot.exportedAt).getTime();
  return elapsedMs >= BACKUP_REMINDER_DAYS * 86_400_000;
}
