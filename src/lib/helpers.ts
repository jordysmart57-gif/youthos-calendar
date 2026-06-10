import {
  ClarityInfo,
  EventCategory,
  EventStatus,
  MinistryEvent,
  TaskCategory,
  TrackStatus,
} from '../types';

// ---------- Parent Clarity Score ----------

export const CLARITY_FIELDS: { key: keyof ClarityInfo; label: string }[] = [
  { key: 'date', label: 'Date' },
  { key: 'time', label: 'Time' },
  { key: 'dropOffLocation', label: 'Drop-off location' },
  { key: 'pickUpTime', label: 'Pick-up time' },
  { key: 'cost', label: 'Cost' },
  { key: 'foodInfo', label: 'Food info' },
  { key: 'forms', label: 'Forms' },
  { key: 'contactPerson', label: 'Contact person' },
  { key: 'transportation', label: 'Transportation' },
  { key: 'packingList', label: 'Packing list' },
];

export function clarityScore(e: MinistryEvent): number {
  const filled = CLARITY_FIELDS.filter((f) => e.clarity[f.key]).length;
  return Math.round((filled / CLARITY_FIELDS.length) * 100);
}

export function missingClarity(e: MinistryEvent): string[] {
  return CLARITY_FIELDS.filter((f) => !e.clarity[f.key]).map((f) => f.label);
}

export function clarityTone(score: number): { chip: string; bar: string } {
  if (score >= 80) return { chip: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-500' };
  if (score >= 60) return { chip: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500' };
  return { chip: 'bg-rose-100 text-rose-700', bar: 'bg-rose-500' };
}

// ---------- Event derivations ----------

export function volunteerGap(e: MinistryEvent): number {
  return e.volunteers.reduce((sum, v) => sum + Math.max(0, v.needed - v.confirmed), 0);
}

export function checklistPct(e: MinistryEvent): number {
  if (e.checklist.length === 0) return 0;
  return Math.round((e.checklist.filter((c) => c.done).length / e.checklist.length) * 100);
}

// ---------- Display metadata ----------

export const CATEGORY_META: Record<EventCategory, { label: string; chip: string; dot: string }> = {
  'middle-school': { label: 'Middle School', chip: 'bg-sky-100 text-sky-800', dot: 'bg-sky-500' },
  'high-school': { label: 'High School', chip: 'bg-violet-100 text-violet-800', dot: 'bg-violet-500' },
  leaders: { label: 'Leaders', chip: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  parents: { label: 'Parents', chip: 'bg-rose-100 text-rose-800', dot: 'bg-rose-500' },
  'camps-trips': { label: 'Camps & Trips', chip: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  'bible-study': { label: 'Bible Study', chip: 'bg-teal-100 text-teal-800', dot: 'bg-teal-500' },
  deadline: { label: 'Deadline', chip: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  promo: { label: 'Promo', chip: 'bg-fuchsia-100 text-fuchsia-800', dot: 'bg-fuchsia-500' },
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_META) as EventCategory[];

export const STATUS_META: Record<EventStatus, { label: string; chip: string }> = {
  planning: { label: 'Planning', chip: 'bg-stone-200 text-stone-700' },
  promoting: { label: 'Promoting', chip: 'bg-fuchsia-100 text-fuchsia-800' },
  'registration-open': { label: 'Registration Open', chip: 'bg-emerald-100 text-emerald-800' },
  confirmed: { label: 'Confirmed', chip: 'bg-sky-100 text-sky-800' },
  complete: { label: 'Complete', chip: 'bg-stone-100 text-stone-500' },
};

export const TRACK_META: Record<TrackStatus, { label: string; chip: string }> = {
  'not-started': { label: 'Not started', chip: 'bg-rose-100 text-rose-700' },
  'in-progress': { label: 'In progress', chip: 'bg-amber-100 text-amber-800' },
  complete: { label: 'Done', chip: 'bg-emerald-100 text-emerald-800' },
  na: { label: 'N/A', chip: 'bg-stone-100 text-stone-500' },
};

export const TASK_CATEGORY_META: Record<TaskCategory, { label: string; chip: string }> = {
  'event-prep': { label: 'Event Prep', chip: 'bg-sky-100 text-sky-800' },
  communication: { label: 'Communication', chip: 'bg-violet-100 text-violet-800' },
  shopping: { label: 'Shopping', chip: 'bg-amber-100 text-amber-800' },
  'volunteer-follow-up': { label: 'Volunteer Follow-up', chip: 'bg-emerald-100 text-emerald-800' },
  'parent-follow-up': { label: 'Parent Follow-up', chip: 'bg-rose-100 text-rose-800' },
  'student-care': { label: 'Student Care', chip: 'bg-teal-100 text-teal-800' },
};

export const ALL_TASK_CATEGORIES = Object.keys(TASK_CATEGORY_META) as TaskCategory[];

// ---------- Dates ----------
// Event/task datetimes are local-naive ISO strings ("2026-06-10T19:00"),
// so slicing the first 10 chars always matches the local calendar day.

const pad = (n: number) => String(n).padStart(2, '0');

export function keyOf(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function dateKey(iso: string): string {
  return iso.slice(0, 10);
}

export function todayKey(): string {
  return keyOf(new Date());
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function fmtDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function startOfWeek(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  r.setDate(r.getDate() - r.getDay());
  return r;
}

export function isThisWeek(iso: string): boolean {
  const start = startOfWeek(new Date());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const t = new Date(iso);
  return t >= start && t < end;
}

export function isPast(iso: string): boolean {
  return dateKey(iso) < todayKey();
}

export function dueLabel(iso: string): string {
  const k = dateKey(iso);
  if (k === todayKey()) return 'Today';
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (k === keyOf(tomorrow)) return 'Tomorrow';
  return fmtDate(iso);
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
