import { FormEvent, ReactNode, useState } from 'react';
import { Leader, Parent, SmallGroup, Student } from '../types';
import { Field, inputCls } from './ui';

const GRADES = ['6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const NIGHTS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function FormButtons({ onClose, label, disabled }: { onClose: () => void; label: string; disabled: boolean }) {
  return (
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
        disabled={disabled}
        className="rounded-full bg-stone-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-stone-700 disabled:opacity-40"
      >
        {label}
      </button>
    </div>
  );
}

function CheckboxList({
  options,
  selected,
  onToggle,
  emptyHint,
}: {
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  emptyHint: string;
}) {
  if (options.length === 0) {
    return <p className="rounded-xl border border-dashed border-stone-300 px-3 py-2 text-xs font-medium text-stone-400">{emptyHint}</p>;
  }
  return (
    <div className="max-h-36 space-y-1 overflow-y-auto rounded-xl border border-stone-200 p-2">
      {options.map((o) => (
        <label key={o.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-1 py-0.5 text-sm font-semibold hover:bg-stone-50">
          <input
            type="checkbox"
            checked={selected.includes(o.id)}
            onChange={() => onToggle(o.id)}
            className="h-4 w-4 accent-brand-600"
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}

function useToggleList(initial: string[]): [string[], (id: string) => void] {
  const [list, setList] = useState(initial);
  const toggle = (id: string) =>
    setList((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  return [list, toggle];
}

function FormShell({ onSubmit, children }: { onSubmit: (e: FormEvent) => void; children: ReactNode }) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {children}
    </form>
  );
}

// ---------- Student ----------

export function StudentForm({
  initial,
  groups,
  parents,
  onSave,
  onClose,
}: {
  initial?: Student;
  groups: SmallGroup[];
  parents: Parent[];
  onSave: (s: Student) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [grade, setGrade] = useState(initial?.grade ?? '9th');
  const [school, setSchool] = useState(initial?.school ?? '');
  const [smallGroupId, setSmallGroupId] = useState(initial?.smallGroupId ?? '');
  const [isNew, setIsNew] = useState(initial?.isNew ?? false);
  const [needsFollowUp, setNeedsFollowUp] = useState(initial?.needsFollowUp ?? false);
  const [reason, setReason] = useState(initial?.followUpReason ?? '');
  const [parentIds, toggleParent] = useToggleList(initial?.parentIds ?? []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: initial?.id ?? `s-${Date.now()}`,
      name: name.trim(),
      grade,
      group: ['6th', '7th', '8th'].includes(grade) ? 'middle' : 'high',
      school: school.trim() || '—',
      smallGroupId: smallGroupId || undefined,
      isNew,
      needsFollowUp,
      followUpReason: needsFollowUp ? reason.trim() || undefined : undefined,
      parentIds,
    });
  };

  return (
    <FormShell onSubmit={submit}>
      <Field label="Name">
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Grade">
          <select className={inputCls} value={grade} onChange={(e) => setGrade(e.target.value)}>
            {GRADES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </Field>
        <Field label="School">
          <input className={inputCls} value={school} onChange={(e) => setSchool(e.target.value)} />
        </Field>
      </div>
      <Field label="Small group">
        <select className={inputCls} value={smallGroupId} onChange={(e) => setSmallGroupId(e.target.value)}>
          <option value="">No group yet</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Parents">
        <CheckboxList
          options={parents.map((p) => ({ id: p.id, label: p.name }))}
          selected={parentIds}
          onToggle={toggleParent}
          emptyHint="No parents added yet — you can link them later."
        />
      </Field>
      <div className="flex flex-wrap gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} className="h-4 w-4 accent-brand-600" />
          New student
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={needsFollowUp} onChange={(e) => setNeedsFollowUp(e.target.checked)} className="h-4 w-4 accent-brand-600" />
          Needs follow-up
        </label>
      </div>
      {needsFollowUp && (
        <Field label="Follow-up reason">
          <input className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Missed 3 weeks in a row" />
        </Field>
      )}
      <FormButtons onClose={onClose} label={initial ? 'Save changes' : 'Add student'} disabled={!name.trim()} />
    </FormShell>
  );
}

// ---------- Parent ----------

export function ParentForm({
  initial,
  students,
  onSave,
  onClose,
}: {
  initial?: Parent;
  students: Student[];
  onSave: (p: Parent) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [engagement, setEngagement] = useState<Parent['engagement']>(initial?.engagement ?? 'medium');
  const [studentIds, toggleStudent] = useToggleList(initial?.studentIds ?? []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: initial?.id ?? `p-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      engagement,
      studentIds,
    });
  };

  return (
    <FormShell onSubmit={submit}>
      <Field label="Name">
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone">
          <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label="Email">
          <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
      </div>
      <Field label="Engagement">
        <select className={inputCls} value={engagement} onChange={(e) => setEngagement(e.target.value as Parent['engagement'])}>
          <option value="high">High — reads everything, volunteers</option>
          <option value="medium">Medium — responsive when asked</option>
          <option value="low">Low — hard to reach</option>
        </select>
      </Field>
      <Field label="Students">
        <CheckboxList
          options={students.map((s) => ({ id: s.id, label: `${s.name} (${s.grade})` }))}
          selected={studentIds}
          onToggle={toggleStudent}
          emptyHint="No students yet."
        />
      </Field>
      <FormButtons onClose={onClose} label={initial ? 'Save changes' : 'Add parent'} disabled={!name.trim()} />
    </FormShell>
  );
}

// ---------- Leader ----------

export function LeaderForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: Leader;
  onSave: (l: Leader) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [role, setRole] = useState(initial?.role ?? '');
  const [backgroundCheck, setBackgroundCheck] = useState<Leader['backgroundCheck']>(
    initial?.backgroundCheck ?? 'pending',
  );
  const [assignments, setAssignments] = useState((initial?.assignments ?? []).join('\n'));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: initial?.id ?? `l-${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Volunteer',
      backgroundCheck,
      assignments: assignments
        .split('\n')
        .map((a) => a.trim())
        .filter(Boolean),
    });
  };

  return (
    <FormShell onSubmit={submit}>
      <Field label="Name">
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Role">
          <input className={inputCls} value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. HS small group leader" />
        </Field>
        <Field label="Background check">
          <select
            className={inputCls}
            value={backgroundCheck}
            onChange={(e) => setBackgroundCheck(e.target.value as Leader['backgroundCheck'])}
          >
            <option value="clear">Clear</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
          </select>
        </Field>
      </div>
      <Field label="Assignments (one per line)">
        <textarea
          className={`${inputCls} min-h-16 resize-y`}
          value={assignments}
          onChange={(e) => setAssignments(e.target.value)}
          placeholder={'HS Guys group\nCamp counselor'}
        />
      </Field>
      <FormButtons onClose={onClose} label={initial ? 'Save changes' : 'Add leader'} disabled={!name.trim()} />
    </FormShell>
  );
}

// ---------- Small group ----------

export function GroupForm({
  initial,
  leaders,
  students,
  onSave,
  onClose,
}: {
  initial?: SmallGroup;
  leaders: Leader[];
  students: Student[];
  onSave: (g: SmallGroup) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [leaderId, setLeaderId] = useState(initial?.leaderId ?? '');
  const [meetingNight, setMeetingNight] = useState(initial?.meetingNight ?? 'Wednesday');
  const [studentIds, toggleStudent] = useToggleList(initial?.studentIds ?? []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: initial?.id ?? `g-${Date.now()}`,
      name: name.trim(),
      leaderId,
      meetingNight,
      studentIds,
    });
  };

  return (
    <FormShell onSubmit={submit}>
      <Field label="Group name">
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="e.g. HS Guys — Lee" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Leader">
          <select className={inputCls} value={leaderId} onChange={(e) => setLeaderId(e.target.value)}>
            <option value="">Unassigned</option>
            {leaders.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Meeting night">
          <select className={inputCls} value={meetingNight} onChange={(e) => setMeetingNight(e.target.value)}>
            {NIGHTS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Students">
        <CheckboxList
          options={students.map((s) => ({ id: s.id, label: `${s.name} (${s.grade})` }))}
          selected={studentIds}
          onToggle={toggleStudent}
          emptyHint="No students yet — add them in the Students tab first."
        />
      </Field>
      <FormButtons onClose={onClose} label={initial ? 'Save changes' : 'Create group'} disabled={!name.trim()} />
    </FormShell>
  );
}
