import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Leader, MinistryEvent, Parent, SmallGroup, Student, Task } from '../types';
import { supabase, WORKSPACE_TABLE } from './supabase';
import { KEYS } from './storage';

export interface Collections {
  events: MinistryEvent[];
  tasks: Task[];
  students: Student[];
  parents: Parent[];
  leaders: Leader[];
  groups: SmallGroup[];
}

const COLLECTION_KEYS = ['events', 'tasks', 'students', 'parents', 'leaders', 'groups'] as const;

const EMPTY: Collections = { events: [], tasks: [], students: [], parents: [], leaders: [], groups: [] };

export type SyncState = 'loading' | 'synced' | 'saving' | 'offline';

// ---- localStorage mirror (offline cache + instant first paint) ----

function readCache(): Collections {
  const out: Collections = { ...EMPTY };
  for (const k of COLLECTION_KEYS) {
    try {
      const raw = localStorage.getItem(KEYS[k]);
      if (raw) out[k] = JSON.parse(raw);
    } catch {
      // corrupted entry — leave empty
    }
  }
  return out;
}

function writeCache(data: Collections) {
  for (const k of COLLECTION_KEYS) {
    try {
      localStorage.setItem(KEYS[k], JSON.stringify(data[k]));
    } catch {
      // storage full / unavailable — cloud is still the source of truth
    }
  }
}

export function clearWorkspaceCache() {
  for (const k of COLLECTION_KEYS) {
    try {
      localStorage.removeItem(KEYS[k]);
    } catch {
      // ignore
    }
  }
}

function pick(row: Record<string, unknown>): Collections {
  const out: Collections = { ...EMPTY };
  for (const k of COLLECTION_KEYS) {
    const v = row[k];
    if (Array.isArray(v)) out[k] = v as never;
  }
  return out;
}

function isEmpty(d: Collections): boolean {
  return COLLECTION_KEYS.every((k) => d[k].length === 0);
}

/**
 * Cloud-synced workspace for one signed-in user.
 *
 * - Seeds instantly from the localStorage mirror (no loading wall).
 * - On sign-in: adopts the cloud row as the source of truth, OR — if the cloud is
 *   empty and this device has local data — pushes that local data up (first-run
 *   migration), so existing events/people move to the cloud automatically.
 * - Every change writes the mirror immediately and debounce-upserts to the cloud.
 * - A realtime subscription applies edits made on other devices live.
 */
export function useCloudWorkspace(userId: string) {
  const [data, setData] = useState<Collections>(() => readCache());
  const [sync, setSync] = useState<SyncState>('loading');

  // Skip the cloud-write that the initial load / remote-apply would otherwise trigger.
  const skipSave = useRef(true);
  // The updated_at we last wrote, so we can ignore our own realtime echo.
  const myStamp = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyRemote = useCallback((next: Collections) => {
    skipSave.current = true;
    writeCache(next);
    setData(next);
  }, []);

  // Initial load + migration.
  useEffect(() => {
    let cancelled = false;
    setSync('loading');
    skipSave.current = true;

    (async () => {
      const { data: row, error } = await supabase
        .from(WORKSPACE_TABLE)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setSync('offline');
        return;
      }

      const local = readCache();
      const stamp = new Date().toISOString();

      if (!row) {
        // No cloud row yet → create one seeded from whatever is local (migration).
        const { data: created, error: upErr } = await supabase
          .from(WORKSPACE_TABLE)
          .upsert({ user_id: userId, ...local, updated_at: stamp })
          .select()
          .single();
        if (cancelled) return;
        if (upErr || !created) {
          setSync('offline');
          return;
        }
        myStamp.current = created.updated_at as string;
        applyRemote(local);
        setSync('synced');
        return;
      }

      const cloud = pick(row);

      if (isEmpty(cloud) && !isEmpty(local)) {
        // Cloud is empty but this device has data → push local up.
        const { data: updated } = await supabase
          .from(WORKSPACE_TABLE)
          .update({ ...local, updated_at: stamp })
          .eq('user_id', userId)
          .select()
          .single();
        if (cancelled) return;
        myStamp.current = (updated?.updated_at as string) ?? stamp;
        applyRemote(local);
        setSync('synced');
      } else {
        // Cloud is the source of truth across devices.
        myStamp.current = row.updated_at as string;
        applyRemote(cloud);
        setSync('synced');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, applyRemote]);

  // Live updates from other devices.
  useEffect(() => {
    const channel = supabase
      .channel(`youthos-ws-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: WORKSPACE_TABLE, filter: `user_id=eq.${userId}` },
        (payload) => {
          const row = payload.new as Record<string, unknown> | undefined;
          if (!row || !row.updated_at) return;
          if (row.updated_at === myStamp.current) return; // our own echo
          myStamp.current = row.updated_at as string;
          applyRemote(pick(row));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, applyRemote]);

  // Persist on change: mirror immediately, debounce-upsert to the cloud.
  useEffect(() => {
    writeCache(data);

    if (skipSave.current) {
      skipSave.current = false;
      return;
    }

    setSync((s) => (s === 'offline' ? 'offline' : 'saving'));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const stamp = new Date().toISOString();
      const { data: saved, error } = await supabase
        .from(WORKSPACE_TABLE)
        .upsert({ user_id: userId, ...data, updated_at: stamp })
        .select()
        .single();
      if (error) {
        setSync('offline');
        return;
      }
      myStamp.current = (saved?.updated_at as string) ?? stamp;
      setSync('synced');
    }, 700);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [data, userId]);

  const makeSetter = useCallback(
    <K extends keyof Collections>(key: K): Dispatch<SetStateAction<Collections[K]>> =>
      (update) =>
        setData((prev) => {
          const nextVal =
            typeof update === 'function'
              ? (update as (p: Collections[K]) => Collections[K])(prev[key])
              : update;
          if (nextVal === prev[key]) return prev;
          return { ...prev, [key]: nextVal };
        }),
    [],
  );

  const setEvents = useMemo(() => makeSetter('events'), [makeSetter]);
  const setTasks = useMemo(() => makeSetter('tasks'), [makeSetter]);
  const setStudents = useMemo(() => makeSetter('students'), [makeSetter]);
  const setParents = useMemo(() => makeSetter('parents'), [makeSetter]);
  const setLeaders = useMemo(() => makeSetter('leaders'), [makeSetter]);
  const setGroups = useMemo(() => makeSetter('groups'), [makeSetter]);

  /** Replace several collections at once (import / reset). */
  const setAll = useCallback((next: Partial<Collections>) => {
    setData((prev) => ({ ...prev, ...next }));
  }, []);

  return {
    sync,
    events: data.events,
    tasks: data.tasks,
    students: data.students,
    parents: data.parents,
    leaders: data.leaders,
    groups: data.groups,
    setEvents,
    setTasks,
    setStudents,
    setParents,
    setLeaders,
    setGroups,
    setAll,
  };
}
