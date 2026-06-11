import { useState } from 'react';
import { MinistryEvent, Task, TaskCategory } from '../types';
import {
  ALL_TASK_CATEGORIES,
  TASK_CATEGORY_META,
  dateKey,
  dueLabel,
  todayKey,
} from '../lib/helpers';
import { Badge, Card, Chip, EmptyState, PageTitle, SectionTitle } from '../components/ui';

interface Props {
  tasks: Task[];
  events: MinistryEvent[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onNewTask: () => void;
}

const PRIORITY_TONE = {
  urgent: 'bg-rose-100 text-rose-700',
  high: 'bg-amber-100 text-amber-800',
  normal: 'bg-stone-100 text-stone-600',
} as const;

function TaskRow({
  t,
  eventTitle,
  onToggle,
  onDelete,
}: {
  t: Task;
  eventTitle?: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const overdue = !t.done && dateKey(t.due) < todayKey();
  return (
    <label className="group flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2 transition hover:bg-stone-50">
      <input
        type="checkbox"
        checked={t.done}
        onChange={() => onToggle(t.id)}
        className="mt-0.5 h-4 w-4 accent-brand-600"
      />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-bold leading-snug ${t.done ? 'text-stone-400 line-through' : ''}`}>
          {t.title}
        </p>
        {t.notes && !t.done && <p className="mt-0.5 text-xs text-stone-500">{t.notes}</p>}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge tone={overdue ? 'bg-rose-100 text-rose-700' : 'bg-stone-100 text-stone-600'}>
            {overdue ? `Overdue · ${dueLabel(t.due)}` : dueLabel(t.due)}
          </Badge>
          {t.priority !== 'normal' && <Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>}
          {eventTitle && <Badge tone="bg-brand-50 text-brand-700">{eventTitle}</Badge>}
        </div>
      </div>
      <button
        type="button"
        onClick={(ev) => {
          ev.preventDefault();
          onDelete(t.id);
        }}
        aria-label={`Delete ${t.title}`}
        className="mt-0.5 text-stone-300 transition hover:text-rose-500"
      >
        ✕
      </button>
    </label>
  );
}

export default function TasksView({ tasks, events, onToggleTask, onDeleteTask, onNewTask }: Props) {
  const [catFilter, setCatFilter] = useState<TaskCategory | 'all'>('all');

  const eventTitle = (id?: string) => events.find((e) => e.id === id)?.title;

  const visibleCats = catFilter === 'all' ? ALL_TASK_CATEGORIES : [catFilter];
  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done && (catFilter === 'all' || t.category === catFilter));
  const openCount = open.filter((t) => catFilter === 'all' || t.category === catFilter).length;

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PageTitle>Tasks</PageTitle>
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-stone-500">{openCount} open</p>
          <button
            onClick={onNewTask}
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-stone-700"
          >
            + New task
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip active={catFilter === 'all'} onClick={() => setCatFilter('all')}>
          All
        </Chip>
        {ALL_TASK_CATEGORIES.map((c) => (
          <Chip key={c} active={catFilter === c} onClick={() => setCatFilter(c)}>
            {TASK_CATEGORY_META[c].label}
          </Chip>
        ))}
      </div>

      {openCount === 0 && done.length === 0 ? (
        <EmptyState title="No tasks in this category" hint="Add tasks as events get closer." />
      ) : (
        <div className="space-y-5">
          {visibleCats.map((cat) => {
            const catTasks = open
              .filter((t) => t.category === cat)
              .sort((a, b) => a.due.localeCompare(b.due));
            if (catTasks.length === 0) return null;
            return (
              <section key={cat}>
                <SectionTitle
                  action={<Badge tone={TASK_CATEGORY_META[cat].chip}>{catTasks.length}</Badge>}
                >
                  {TASK_CATEGORY_META[cat].label}
                </SectionTitle>
                <Card className="!p-2">
                  {catTasks.map((t) => (
                    <TaskRow key={t.id} t={t} eventTitle={eventTitle(t.eventId)} onToggle={onToggleTask} onDelete={onDeleteTask} />
                  ))}
                </Card>
              </section>
            );
          })}

          {done.length > 0 && (
            <section>
              <SectionTitle>Completed</SectionTitle>
              <Card className="!p-2 opacity-75">
                {done.map((t) => (
                  <TaskRow key={t.id} t={t} eventTitle={eventTitle(t.eventId)} onToggle={onToggleTask} onDelete={onDeleteTask} />
                ))}
              </Card>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
