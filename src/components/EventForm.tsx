import { FormEvent, useState } from 'react';
import { EventCategory, EventStatus, EventTemplate, MinistryEvent } from '../types';
import { ALL_CATEGORIES, CATEGORY_META, STATUS_META, buildEvent, keyOf } from '../lib/helpers';
import { Field, inputCls } from './ui';

interface Props {
  /** Present in edit mode — basics are updated, checklist/volunteers/clarity kept. */
  initial?: MinistryEvent;
  /** Present when creating from a template — seeds checklist, volunteers, clarity. */
  template?: EventTemplate;
  onSave: (e: MinistryEvent) => void;
  onClose: () => void;
}

const STATUS_OPTIONS = Object.keys(STATUS_META) as EventStatus[];

export default function EventForm({ initial, template, onSave, onClose }: Props) {
  const defaultDate = () => {
    if (initial) return initial.start.slice(0, 10);
    const d = new Date();
    d.setDate(d.getDate() + (template ? template.leadTimeWeeks * 7 : 7));
    return keyOf(d);
  };

  const [title, setTitle] = useState(initial?.title ?? template?.name ?? '');
  const [category, setCategory] = useState<EventCategory>(
    initial?.category ?? template?.category ?? 'high-school',
  );
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(initial ? initial.start.slice(11, 16) : '19:00');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [targetGroup, setTargetGroup] = useState(initial?.targetGroup ?? '');
  const [status, setStatus] = useState<EventStatus>(initial?.status ?? 'planning');
  const [capacity, setCapacity] = useState(initial?.capacity ? String(initial.capacity) : '');
  const [parentFacing, setParentFacing] = useState(
    initial?.parentFacing ?? template?.parentFacing ?? true,
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!title.trim() || !date) return;
    const parsedCap = parseInt(capacity, 10);
    const base = {
      id: initial?.id ?? `evt-${Date.now()}`,
      title: title.trim(),
      category,
      start: `${date}T${time || '19:00'}`,
      location: location.trim() || 'TBD',
      targetGroup: targetGroup.trim() || 'All students',
      status,
      parentFacing,
      capacity: capacity.trim() && parsedCap > 0 ? parsedCap : undefined,
      notes: notes.trim() || undefined,
    };
    onSave(initial ? { ...initial, ...base } : buildEvent(base, template));
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      {template && !initial && (
        <p className="rounded-xl bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700">
          Starting from the {template.name} template — {template.defaultChecklist.length} checklist
          items and {template.typicalVolunteers.length || 'no'} volunteer roles come with it.
        </p>
      )}

      <Field label="Event title">
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder="e.g. Fall Retreat" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date">
          <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Time">
          <input type="time" className={inputCls} value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Category">
          <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as EventCategory)}>
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_META[c].label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as EventStatus)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Location">
        <input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. The Barn" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Target group">
          <input className={inputCls} value={targetGroup} onChange={(e) => setTargetGroup(e.target.value)} placeholder="e.g. MS + HS students" />
        </Field>
        <Field label="Capacity (optional)">
          <input type="number" min="1" className={inputCls} value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="—" />
        </Field>
      </div>

      <Field label="Notes (optional)">
        <textarea className={`${inputCls} min-h-16 resize-y`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything future-you should know" />
      </Field>

      <label className="flex cursor-pointer items-center gap-2.5 rounded-xl bg-stone-50 px-3 py-2.5">
        <input
          type="checkbox"
          checked={parentFacing}
          onChange={(e) => setParentFacing(e.target.checked)}
          className="h-4 w-4 accent-brand-600"
        />
        <span className="text-sm font-semibold">
          Parents need info about this event
          <span className="block text-xs font-medium text-stone-500">Tracks the Parent Clarity Score</span>
        </span>
      </label>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-4 py-2 text-sm font-bold text-stone-500 transition hover:bg-stone-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim() || !date}
          className="rounded-full bg-stone-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-stone-700 disabled:opacity-40"
        >
          {initial ? 'Save changes' : 'Create event'}
        </button>
      </div>
    </form>
  );
}
