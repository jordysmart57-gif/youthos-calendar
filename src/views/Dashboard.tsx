import { MinistryEvent, Student, Task } from '../types';
import {
  CATEGORY_META,
  TASK_CATEGORY_META,
  clarityScore,
  clarityTone,
  missingClarity,
  volunteerGap,
  fmtTime,
  isThisWeek,
  isPast,
  dueLabel,
  dateKey,
  todayKey,
} from '../lib/helpers';
import { Avatar, Badge, Card, EmptyState, SectionTitle } from '../components/ui';

interface Props {
  events: MinistryEvent[];
  tasks: Task[];
  students: Student[];
  onToggleTask: (id: string) => void;
  onOpenEvent: (id: string) => void;
  onClearFollowUp: (id: string) => void;
}

function EventRow({ e, onOpen }: { e: MinistryEvent; onOpen: (id: string) => void }) {
  const cat = CATEGORY_META[e.category];
  const gap = volunteerGap(e);
  const d = new Date(e.start);
  return (
    <button
      onClick={() => onOpen(e.id)}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-stone-50"
    >
      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-stone-100">
        <span className="text-[10px] font-bold uppercase leading-none text-stone-400">
          {d.toLocaleDateString('en-US', { weekday: 'short' })}
        </span>
        <span className="mt-0.5 text-sm font-extrabold leading-none">{d.getDate()}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{e.title}</p>
        <p className="truncate text-xs text-stone-500">
          {fmtTime(e.start)} · {e.location}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {gap > 0 && <Badge tone="bg-amber-100 text-amber-800">{gap} needed</Badge>}
        <span className={`hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cat.chip}`}>
          {cat.label}
        </span>
        <span className={`h-2 w-2 rounded-full sm:hidden ${cat.dot}`} />
      </div>
    </button>
  );
}

export default function Dashboard({ events, tasks, students, onToggleTask, onOpenEvent, onClearFollowUp }: Props) {
  const upcoming = events
    .filter((e) => !isPast(e.start) && e.status !== 'complete')
    .sort((a, b) => a.start.localeCompare(b.start));
  const thisWeek = upcoming.filter((e) => isThisWeek(e.start));
  const later = upcoming.filter((e) => !isThisWeek(e.start)).slice(0, 5);

  const openTasks = tasks.filter((t) => !t.done);
  const urgentTasks = openTasks
    .filter((t) => t.priority === 'urgent' || dateKey(t.due) <= todayKey())
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 6);

  const gapEvents = upcoming.filter((e) => volunteerGap(e) > 0).slice(0, 5);
  const totalGaps = upcoming.reduce((s, e) => s + volunteerGap(e), 0);

  const parentFacing = upcoming.filter((e) => e.parentFacing);
  const clarityIssues = parentFacing.filter((e) => clarityScore(e) < 80).slice(0, 5);
  const avgClarity =
    parentFacing.length === 0
      ? 100
      : Math.round(parentFacing.reduce((s, e) => s + clarityScore(e), 0) / parentFacing.length);

  const careList = students.filter((s) => s.needsFollowUp);

  const todayLong = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const stats = [
    { label: 'Events this week', value: String(thisWeek.length) },
    { label: 'Open tasks', value: String(openTasks.length) },
    { label: 'Volunteer gaps', value: String(totalGaps) },
    { label: 'Avg parent clarity', value: `${avgClarity}%` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">{todayLong}</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">This Week in Youth Ministry</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="!p-3 lg:!p-4">
            <p className="text-2xl font-extrabold tracking-tight">{s.value}</p>
            <p className="mt-0.5 text-xs font-semibold text-stone-500">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-6">
          <section>
            <SectionTitle>This Week</SectionTitle>
            <Card className="!p-2">
              {thisWeek.length === 0 ? (
                <EmptyState title="Nothing on the calendar this week" hint="A quiet week — plan ahead or take a breath." />
              ) : (
                thisWeek.map((e) => <EventRow key={e.id} e={e} onOpen={onOpenEvent} />)
              )}
            </Card>
          </section>

          <section>
            <SectionTitle>Coming Up</SectionTitle>
            <Card className="!p-2">
              {later.length === 0 ? (
                <EmptyState title="Nothing scheduled beyond this week" hint="Pull up a template and plan the next big thing." />
              ) : (
                later.map((e) => <EventRow key={e.id} e={e} onOpen={onOpenEvent} />)
              )}
            </Card>
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <SectionTitle>Urgent Tasks</SectionTitle>
            <Card className="!p-2">
              {urgentTasks.length === 0 ? (
                <EmptyState title="Nothing urgent" hint="Inbox zero, youth ministry edition." />
              ) : (
                urgentTasks.map((t) => {
                  const overdue = dateKey(t.due) < todayKey();
                  return (
                    <label
                      key={t.id}
                      className="flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2 transition hover:bg-stone-50"
                    >
                      <input
                        type="checkbox"
                        checked={t.done}
                        onChange={() => onToggleTask(t.id)}
                        className="mt-0.5 h-4 w-4 accent-brand-600"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold leading-snug">{t.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Badge tone={overdue ? 'bg-rose-100 text-rose-700' : 'bg-stone-100 text-stone-600'}>
                            {overdue ? `Overdue · ${dueLabel(t.due)}` : dueLabel(t.due)}
                          </Badge>
                          <Badge tone={TASK_CATEGORY_META[t.category].chip}>
                            {TASK_CATEGORY_META[t.category].label}
                          </Badge>
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </Card>
          </section>

          <section>
            <SectionTitle>Volunteer Gaps</SectionTitle>
            <Card className="!p-2">
              {gapEvents.length === 0 ? (
                <EmptyState title="Every role is covered" hint="Tell your leaders thank you this week." />
              ) : (
                gapEvents.map((e) => {
                  const roles = e.volunteers
                    .filter((v) => v.confirmed < v.needed)
                    .map((v) => `${v.needed - v.confirmed} ${v.role}`)
                    .join(', ');
                  return (
                    <button
                      key={e.id}
                      onClick={() => onOpenEvent(e.id)}
                      className="block w-full rounded-xl px-2 py-2 text-left transition hover:bg-stone-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-bold">{e.title}</p>
                        <Badge tone="bg-amber-100 text-amber-800">{volunteerGap(e)} open</Badge>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-stone-500">Need: {roles}</p>
                    </button>
                  );
                })
              )}
            </Card>
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <SectionTitle>Parent Clarity Issues</SectionTitle>
            <Card className="!p-2">
              {clarityIssues.length === 0 ? (
                <EmptyState title="Parents have what they need" hint="Every parent-facing event scores 80%+." />
              ) : (
                clarityIssues.map((e) => {
                  const score = clarityScore(e);
                  const missing = missingClarity(e);
                  return (
                    <button
                      key={e.id}
                      onClick={() => onOpenEvent(e.id)}
                      className="block w-full rounded-xl px-2 py-2 text-left transition hover:bg-stone-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-bold">{e.title}</p>
                        <Badge tone={clarityTone(score).chip}>{score}%</Badge>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-stone-500">
                        Missing: {missing.slice(0, 3).join(', ')}
                        {missing.length > 3 ? ` +${missing.length - 3} more` : ''}
                      </p>
                    </button>
                  );
                })
              )}
            </Card>
          </section>

          <section>
            <SectionTitle>Student Care</SectionTitle>
            <Card className="!p-2">
              {careList.length === 0 ? (
                <EmptyState title="No follow-ups flagged" hint="Every student accounted for." />
              ) : (
                careList.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl px-2 py-2">
                    <Avatar name={s.name} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-sm font-bold">
                        <span className="truncate">{s.name}</span>
                        {s.isNew && <Badge tone="bg-brand-100 text-brand-700">New</Badge>}
                      </p>
                      <p className="truncate text-xs text-stone-500">{s.followUpReason}</p>
                    </div>
                    <span className="text-xs font-semibold text-stone-400">{s.grade}</span>
                    <button
                      onClick={() => onClearFollowUp(s.id)}
                      title="Mark cared for"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-stone-300 transition hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      ✓
                    </button>
                  </div>
                ))
              )}
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
