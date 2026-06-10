import { FormEvent, useState } from 'react';
import { MinistryEvent, Task, TaskCategory } from '../types';
import { ALL_TASK_CATEGORIES, TASK_CATEGORY_META, isPast, todayKey } from '../lib/helpers';
import { Field, inputCls } from './ui';

interface Props {
  events: MinistryEvent[];
  onSave: (t: Task) => void;
  onClose: () => void;
}

export default function TaskForm({ events, onSave, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('event-prep');
  const [due, setDue] = useState(todayKey());
  const [priority, setPriority] = useState<Task['priority']>('normal');
  const [eventId, setEventId] = useState('');
  const [notes, setNotes] = useState('');

  const linkable = events
    .filter((e) => !isPast(e.start))
    .sort((a, b) => a.start.localeCompare(b.start));

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!title.trim() || !due) return;
    onSave({
      id: `task-${Date.now()}`,
      title: title.trim(),
      category,
      due: `${due}T12:00`,
      done: false,
      priority,
      eventId: eventId || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Task">
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder="e.g. Text drivers the meet time" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Category">
          <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as TaskCategory)}>
            {ALL_TASK_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {TASK_CATEGORY_META[c].label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Due">
          <input type="date" className={inputCls} value={due} onChange={(e) => setDue(e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Priority">
          <select className={inputCls} value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])}>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </Field>
        <Field label="Linked event (optional)">
          <select className={inputCls} value={eventId} onChange={(e) => setEventId(e.target.value)}>
            <option value="">None</option>
            {linkable.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Notes (optional)">
        <textarea className={`${inputCls} min-h-14 resize-y`} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>

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
          disabled={!title.trim() || !due}
          className="rounded-full bg-stone-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-stone-700 disabled:opacity-40"
        >
          Add task
        </button>
      </div>
    </form>
  );
}
