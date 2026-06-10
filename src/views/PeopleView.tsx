import { useState } from 'react';
import { LEADERS, PARENTS, SMALL_GROUPS, STUDENTS } from '../lib/data';
import { Avatar, Badge, Card, Chip, EmptyState, SectionTitle } from '../components/ui';

type Section = 'students' | 'parents' | 'leaders' | 'new' | 'follow-up' | 'groups';

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'students', label: 'Students' },
  { id: 'parents', label: 'Parents' },
  { id: 'leaders', label: 'Leaders' },
  { id: 'new', label: 'New Students' },
  { id: 'follow-up', label: 'Follow-up Needed' },
  { id: 'groups', label: 'Small Groups' },
];

const BG_CHECK_TONE = {
  clear: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  expired: 'bg-rose-100 text-rose-700',
} as const;

const ENGAGEMENT_TONE = {
  high: 'bg-emerald-100 text-emerald-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-rose-100 text-rose-700',
} as const;

function studentName(id: string): string {
  return STUDENTS.find((s) => s.id === id)?.name ?? id;
}

function StudentList({ filter }: { filter: 'all' | 'new' | 'follow-up' }) {
  const list = STUDENTS.filter((s) => {
    if (filter === 'new') return s.isNew;
    if (filter === 'follow-up') return s.needsFollowUp;
    return true;
  });
  if (list.length === 0) {
    return <EmptyState title="No students here" hint="That's either great news or a data problem." />;
  }
  return (
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
      {list.map((s) => {
        const group = SMALL_GROUPS.find((g) => g.id === s.smallGroupId);
        return (
          <Card key={s.id} className="!p-3">
            <div className="flex items-center gap-3">
              <Avatar name={s.name} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm font-bold">
                  <span className="truncate">{s.name}</span>
                  {s.isNew && <Badge tone="bg-brand-100 text-brand-700">New</Badge>}
                </p>
                <p className="truncate text-xs text-stone-500">
                  {s.grade} · {s.school}
                </p>
              </div>
              {group ? (
                <Badge tone="bg-stone-100 text-stone-600">{group.name.split(' — ')[0]}</Badge>
              ) : (
                <Badge tone="bg-amber-100 text-amber-800">No group</Badge>
              )}
            </div>
            {s.needsFollowUp && (
              <p className="mt-2 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700">
                {s.followUpReason}
              </p>
            )}
          </Card>
        );
      })}
    </div>
  );
}

export default function PeopleView() {
  const [section, setSection] = useState<Section>('students');

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold tracking-tight">People</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {SECTIONS.map((s) => (
          <Chip key={s.id} active={section === s.id} onClick={() => setSection(s.id)}>
            {s.label}
          </Chip>
        ))}
      </div>

      {section === 'students' && <StudentList filter="all" />}
      {section === 'new' && <StudentList filter="new" />}
      {section === 'follow-up' && <StudentList filter="follow-up" />}

      {section === 'parents' && (
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {PARENTS.map((p) => (
            <Card key={p.id} className="!p-3">
              <div className="flex items-center gap-3">
                <Avatar name={p.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{p.name}</p>
                  <p className="truncate text-xs text-stone-500">
                    Parent of {p.studentIds.map(studentName).join(', ')}
                  </p>
                </div>
                <Badge tone={ENGAGEMENT_TONE[p.engagement]}>{p.engagement}</Badge>
              </div>
              <p className="mt-2 text-xs font-medium text-stone-500">
                {p.phone} · {p.email}
              </p>
            </Card>
          ))}
        </div>
      )}

      {section === 'leaders' && (
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {LEADERS.map((l) => (
            <Card key={l.id} className="!p-3">
              <div className="flex items-center gap-3">
                <Avatar name={l.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{l.name}</p>
                  <p className="truncate text-xs text-stone-500">{l.role}</p>
                </div>
                <Badge tone={BG_CHECK_TONE[l.backgroundCheck]}>
                  {l.backgroundCheck === 'clear' ? 'BG check clear' : `BG check ${l.backgroundCheck}`}
                </Badge>
              </div>
              {l.assignments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {l.assignments.map((a) => (
                    <Badge key={a} tone="bg-stone-100 text-stone-600">
                      {a}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {section === 'groups' && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {SMALL_GROUPS.map((g) => {
            const leader = LEADERS.find((l) => l.id === g.leaderId);
            return (
              <Card key={g.id}>
                <SectionTitle action={<Badge tone="bg-stone-100 text-stone-600">{g.meetingNight}s</Badge>}>
                  {g.name}
                </SectionTitle>
                <p className="text-xs font-semibold text-stone-500">Led by {leader?.name ?? '—'}</p>
                <div className="mt-3 space-y-1.5">
                  {g.studentIds.length === 0 ? (
                    <EmptyState title="No students assigned yet" />
                  ) : (
                    g.studentIds.map((id) => {
                      const s = STUDENTS.find((st) => st.id === id);
                      if (!s) return null;
                      return (
                        <div key={id} className="flex items-center gap-2.5">
                          <Avatar name={s.name} sub />
                          <span className="text-sm font-semibold">{s.name}</span>
                          <span className="text-xs text-stone-400">{s.grade}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
