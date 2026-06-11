// localStorage keys and backup/restore helpers.
// v2 added people collections and clarity details; v1 events/tasks migrate cleanly
// (the new `details` field is optional).

export const KEYS = {
  events: 'youthos:v2:events',
  tasks: 'youthos:v2:tasks',
  students: 'youthos:v2:students',
  parents: 'youthos:v2:parents',
  leaders: 'youthos:v2:leaders',
  groups: 'youthos:v2:groups',
} as const;

const V1_KEYS: Partial<Record<keyof typeof KEYS, string>> = {
  events: 'youthos:v1:events',
  tasks: 'youthos:v1:tasks',
};

/** Read a previous-version value for first-run migration, or null. */
export function migratedV1<T>(slot: keyof typeof KEYS): T | null {
  const v1Key = V1_KEYS[slot];
  if (!v1Key) return null;
  try {
    const raw = localStorage.getItem(v1Key);
    if (raw !== null) return JSON.parse(raw) as T;
  } catch {
    // corrupted v1 data — start fresh
  }
  return null;
}

export interface BackupFile {
  app: string;
  schema: number;
  exportedAt: string;
  data: Record<string, unknown>;
}

export function downloadJson(filename: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
