import { Dispatch, SetStateAction, useState } from 'react';
import { Leader, Parent, SmallGroup, Student } from '../types';
import { Avatar, Badge, Card, Chip, EmptyState, Modal, PageTitle, SectionTitle } from '../components/ui';
import { GroupForm, LeaderForm, ParentForm, StudentForm } from '../components/PeopleForms';

type Section = 'students' | 'parents' | 'leaders' | 'new' | 'follow-up' | 'groups';
type ModalState =
  | { type: 'student'; editId?: string }
  | { type: 'parent'; editId?: string }
  | { type: 'leader'; editId?: string }
  | { type: 'group'; editId?: string }
  | null;

interface Props {
  students: Student[];
  parents: Parent[];
  leaders: Leader[];
  groups: SmallGroup[];
  setStudents: Dispatch<SetStateAction<Student[]>>;
  setParents: Dispatch<SetStateAction<Parent[]>>;
  setLeaders: Dispatch<SetStateAction<Leader[]>>;
  setGroups: Dispatch<SetStateAction<SmallGroup[]>>;
}

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'students', label: 'Students' },
  { id: 'parents', label: 'Parents' },
  { id: 'leaders', label: 'Leaders' },
  { id: 'new', label: 'New Students' },
  { id: 'follow-up', label: 'Follow-up Needed' },
  { id: 'groups', label: 'Small Groups' },
];

const ADD_LABEL: Record<Section, { label: string; type: 'student' | 'parent' | 'leader' | 'group' }> = {
  students: { label: '+ Add student', type: 'student' },
  new: { label: '+ Add student', type: 'student' },
  'follow-up': { label: '+ Add student', type: 'student' },
  parents: { label: '+ Add parent', type: 'parent' },
  leaders: { label: '+ Add leader', type: 'leader' },
  groups: { label: '+ New group', type: 'group' },
};

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

function CardActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      <button
        onClick={onEdit}
        aria-label="Edit"
        className="flex h-7 w-7 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
      >
        ✎
      </button>
      <button
        onClick={onDelete}
        aria-label="Delete"
        className="flex h-7 w-7 items-center justify-center rounded-full text-stone-300 transition hover:bg-rose-50 hover:text-rose-500"
      >
        ✕
      </button>
    </span>
  );
}

export default function PeopleView({
  students,
  parents,
  leaders,
  groups,
  setStudents,
  setParents,
  setLeaders,
  setGroups,
}: Props) {
  const [section, setSection] = useState<Section>('students');
  const [modal, setModal] = useState<ModalState>(null);

  // ----- saves (keep the student↔group and student↔parent links in sync both ways) -----

  const saveStudent = (s: Student) => {
    setStudents((ss) => (ss.some((x) => x.id === s.id) ? ss.map((x) => (x.id === s.id ? s : x)) : [...ss, s]));
    setGroups((gs) =>
      gs.map((g) => {
        const has = g.studentIds.includes(s.id);
        if (g.id === s.smallGroupId && !has) return { ...g, studentIds: [...g.studentIds, s.id] };
        if (g.id !== s.smallGroupId && has) return { ...g, studentIds: g.studentIds.filter((x) => x !== s.id) };
        return g;
      }),
    );
    setParents((ps) =>
      ps.map((p) => {
        const has = p.studentIds.includes(s.id);
        const should = s.parentIds.includes(p.id);
        if (should && !has) return { ...p, studentIds: [...p.studentIds, s.id] };
        if (!should && has) return { ...p, studentIds: p.studentIds.filter((x) => x !== s.id) };
        return p;
      }),
    );
    setModal(null);
  };

  const saveParent = (p: Parent) => {
    setParents((ps) => (ps.some((x) => x.id === p.id) ? ps.map((x) => (x.id === p.id ? p : x)) : [...ps, p]));
    setStudents((ss) =>
      ss.map((s) => {
        const has = s.parentIds.includes(p.id);
        const should = p.studentIds.includes(s.id);
        if (should && !has) return { ...s, parentIds: [...s.parentIds, p.id] };
        if (!should && has) return { ...s, parentIds: s.parentIds.filter((x) => x !== p.id) };
        return s;
      }),
    );
    setModal(null);
  };

  const saveLeader = (l: Leader) => {
    setLeaders((ls) => (ls.some((x) => x.id === l.id) ? ls.map((x) => (x.id === l.id ? l : x)) : [...ls, l]));
    setModal(null);
  };

  const saveGroup = (g: SmallGroup) => {
    setGroups((gs) => (gs.some((x) => x.id === g.id) ? gs.map((x) => (x.id === g.id ? g : x)) : [...gs, g]));
    setStudents((ss) =>
      ss.map((s) => {
        if (g.studentIds.includes(s.id)) return { ...s, smallGroupId: g.id };
        if (s.smallGroupId === g.id) return { ...s, smallGroupId: undefined };
        return s;
      }),
    );
    setModal(null);
  };

  // ----- deletes (with cascade cleanup) -----

  const deleteStudent = (s: Student) => {
    if (!window.confirm(`Remove ${s.name}?`)) return;
    setStudents((ss) => ss.filter((x) => x.id !== s.id));
    setGroups((gs) => gs.map((g) => ({ ...g, studentIds: g.studentIds.filter((x) => x !== s.id) })));
    setParents((ps) => ps.map((p) => ({ ...p, studentIds: p.studentIds.filter((x) => x !== s.id) })));
  };

  const deleteParent = (p: Parent) => {
    if (!window.confirm(`Remove ${p.name}?`)) return;
    setParents((ps) => ps.filter((x) => x.id !== p.id));
    setStudents((ss) => ss.map((s) => ({ ...s, parentIds: s.parentIds.filter((x) => x !== p.id) })));
  };

  const deleteLeader = (l: Leader) => {
    if (!window.confirm(`Remove ${l.name}?`)) return;
    setLeaders((ls) => ls.filter((x) => x.id !== l.id));
    setGroups((gs) => gs.map((g) => (g.leaderId === l.id ? { ...g, leaderId: '' } : g)));
  };

  const deleteGroup = (g: SmallGroup) => {
    if (!window.confirm(`Delete the group "${g.name}"? Students stay — they just lose the group.`)) return;
    setGroups((gs) => gs.filter((x) => x.id !== g.id));
    setStudents((ss) => ss.map((s) => (s.smallGroupId === g.id ? { ...s, smallGroupId: undefined } : s)));
  };

  const clearFollowUp = (id: string) =>
    setStudents((ss) =>
      ss.map((s) => (s.id === id ? { ...s, needsFollowUp: false, followUpReason: undefined } : s)),
    );

  const studentName = (id: string) => students.find((s) => s.id === id)?.name ?? '—';

  const studentList = (filter: 'all' | 'new' | 'follow-up') => {
    const list = students.filter((s) => {
      if (filter === 'new') return s.isNew;
      if (filter === 'follow-up') return s.needsFollowUp;
      return true;
    });
    if (list.length === 0) {
      return (
        <EmptyState
          title={filter === 'all' ? 'No students yet' : filter === 'new' ? 'No new students right now' : 'No follow-ups flagged'}
          hint={filter === 'all' ? 'Add your roster to start caring for the one.' : undefined}
        />
      );
    }
    return (
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {list.map((s) => {
          const group = groups.find((g) => g.id === s.smallGroupId);
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
                    {group ? ` · ${group.name.split(' — ')[0]}` : ''}
                  </p>
                </div>
                <CardActions
                  onEdit={() => setModal({ type: 'student', editId: s.id })}
                  onDelete={() => deleteStudent(s)}
                />
              </div>
              {s.needsFollowUp && (
                <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-rose-50 px-2.5 py-1.5">
                  <p className="min-w-0 truncate text-xs font-semibold text-rose-700">
                    {s.followUpReason ?? 'Needs follow-up'}
                  </p>
                  <button
                    onClick={() => clearFollowUp(s.id)}
                    className="shrink-0 text-xs font-bold text-rose-600 underline-offset-2 hover:underline"
                  >
                    Done ✓
                  </button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  const add = ADD_LABEL[section];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle>People</PageTitle>
        <button
          onClick={() => setModal({ type: add.type })}
          className="rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-stone-700"
        >
          {add.label}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {SECTIONS.map((s) => (
          <Chip key={s.id} active={section === s.id} onClick={() => setSection(s.id)}>
            {s.label}
          </Chip>
        ))}
      </div>

      {section === 'students' && studentList('all')}
      {section === 'new' && studentList('new')}
      {section === 'follow-up' && studentList('follow-up')}

      {section === 'parents' &&
        (parents.length === 0 ? (
          <EmptyState title="No parents yet" hint="Link parents to students to power parent communication." />
        ) : (
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {parents.map((p) => (
              <Card key={p.id} className="!p-3">
                <div className="flex items-center gap-3">
                  <Avatar name={p.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{p.name}</p>
                    <p className="truncate text-xs text-stone-500">
                      {p.studentIds.length > 0 ? `Parent of ${p.studentIds.map(studentName).join(', ')}` : 'No students linked'}
                    </p>
                  </div>
                  <Badge tone={ENGAGEMENT_TONE[p.engagement]}>{p.engagement}</Badge>
                  <CardActions
                    onEdit={() => setModal({ type: 'parent', editId: p.id })}
                    onDelete={() => deleteParent(p)}
                  />
                </div>
                {(p.phone || p.email) && (
                  <p className="mt-2 truncate text-xs font-medium text-stone-500">
                    {[p.phone, p.email].filter(Boolean).join(' · ')}
                  </p>
                )}
              </Card>
            ))}
          </div>
        ))}

      {section === 'leaders' &&
        (leaders.length === 0 ? (
          <EmptyState title="No leaders yet" hint="Your volunteer team lives here — roles, assignments, background checks." />
        ) : (
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {leaders.map((l) => (
              <Card key={l.id} className="!p-3">
                <div className="flex items-center gap-3">
                  <Avatar name={l.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{l.name}</p>
                    <p className="truncate text-xs text-stone-500">{l.role}</p>
                  </div>
                  <Badge tone={BG_CHECK_TONE[l.backgroundCheck]}>
                    {l.backgroundCheck === 'clear' ? 'BG clear' : `BG ${l.backgroundCheck}`}
                  </Badge>
                  <CardActions
                    onEdit={() => setModal({ type: 'leader', editId: l.id })}
                    onDelete={() => deleteLeader(l)}
                  />
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
        ))}

      {section === 'groups' &&
        (groups.length === 0 ? (
          <EmptyState title="No small groups yet" hint="Groups are where care actually happens — start one." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((g) => {
              const leader = leaders.find((l) => l.id === g.leaderId);
              return (
                <Card key={g.id}>
                  <div className="flex items-start justify-between gap-2">
                    <SectionTitle action={<Badge tone="bg-stone-100 text-stone-600">{g.meetingNight}s</Badge>}>
                      {g.name}
                    </SectionTitle>
                    <CardActions
                      onEdit={() => setModal({ type: 'group', editId: g.id })}
                      onDelete={() => deleteGroup(g)}
                    />
                  </div>
                  <p className="text-xs font-semibold text-stone-500">Led by {leader?.name ?? '—'}</p>
                  <div className="mt-3 space-y-1.5">
                    {g.studentIds.length === 0 ? (
                      <p className="text-xs font-medium text-stone-400">No students assigned yet.</p>
                    ) : (
                      g.studentIds.map((id) => {
                        const s = students.find((st) => st.id === id);
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
        ))}

      {modal?.type === 'student' && (
        <Modal title={modal.editId ? 'Edit student' : 'Add student'} onClose={() => setModal(null)}>
          <StudentForm
            initial={modal.editId ? students.find((s) => s.id === modal.editId) : undefined}
            groups={groups}
            parents={parents}
            onSave={saveStudent}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}
      {modal?.type === 'parent' && (
        <Modal title={modal.editId ? 'Edit parent' : 'Add parent'} onClose={() => setModal(null)}>
          <ParentForm
            initial={modal.editId ? parents.find((p) => p.id === modal.editId) : undefined}
            students={students}
            onSave={saveParent}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}
      {modal?.type === 'leader' && (
        <Modal title={modal.editId ? 'Edit leader' : 'Add leader'} onClose={() => setModal(null)}>
          <LeaderForm
            initial={modal.editId ? leaders.find((l) => l.id === modal.editId) : undefined}
            onSave={saveLeader}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}
      {modal?.type === 'group' && (
        <Modal title={modal.editId ? 'Edit group' : 'New group'} onClose={() => setModal(null)}>
          <GroupForm
            initial={modal.editId ? groups.find((g) => g.id === modal.editId) : undefined}
            leaders={leaders}
            students={students}
            onSave={saveGroup}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}
