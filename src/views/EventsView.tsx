import { FormEvent, useState } from 'react';
import { ClarityInfo, EventCategory, MinistryEvent, TrackStatus } from '../types';
import {
  ALL_CATEGORIES,
  CATEGORY_META,
  CLARITY_FIELDS,
  CLARITY_HINTS,
  STATUS_META,
  TRACK_META,
  checklistPct,
  clarityScore,
  clarityTone,
  draftLeaderBriefing,
  draftParentUpdate,
  fmtDate,
  fmtDateLong,
  fmtTime,
  isPast,
  nextTrackStatus,
  volunteerGap,
} from '../lib/helpers';
import { Badge, Card, Chip, EmptyState, Modal, ProgressBar, SectionTitle } from '../components/ui';

type ClarityKey = keyof ClarityInfo;

function DraftModal({ title, text, onClose }: { title: string; text: string; onClose: () => void }) {
  const [draft, setDraft] = useState(text);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — user can still select the text manually
    }
  };
  return (
    <Modal title={title} onClose={onClose}>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={16}
        className="w-full resize-y rounded-xl border border-stone-300 p-3 font-mono text-xs leading-relaxed focus:border-brand-500 focus:outline-none"
      />
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-stone-400">
          Lines marked "← add this before sending" need clarity info — tap the field on the event to fill them in.
        </p>
        <button
          onClick={copy}
          className="shrink-0 rounded-full bg-stone-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-stone-700"
        >
          {copied ? 'Copied ✓' : 'Copy text'}
        </button>
      </div>
    </Modal>
  );
}

interface Props {
  events: MinistryEvent[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, fn: (e: MinistryEvent) => MinistryEvent) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onNew: () => void;
}

const TRACKS: { key: 'forms' | 'payments' | 'transportation' | 'parentComm'; label: string }[] = [
  { key: 'forms', label: 'Forms' },
  { key: 'payments', label: 'Payments' },
  { key: 'transportation', label: 'Transportation' },
  { key: 'parentComm', label: 'Parent Comms' },
];

function StepperButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label === '−' ? 'decrease' : 'increase'}
      className="flex h-6 w-6 items-center justify-center rounded-full border border-stone-300 text-xs font-bold text-stone-600 transition hover:border-stone-500"
    >
      {label}
    </button>
  );
}

function TrackPill({
  label,
  status,
  onCycle,
}: {
  label: string;
  status: TrackStatus;
  onCycle: () => void;
}) {
  return (
    <button
      onClick={onCycle}
      title="Tap to change status"
      className="flex items-center justify-between gap-2 rounded-xl bg-stone-50 px-2.5 py-1.5 text-left transition hover:bg-stone-100"
    >
      <span className="text-xs font-semibold text-stone-600">{label}</span>
      <Badge tone={TRACK_META[status].chip}>{TRACK_META[status].label}</Badge>
    </button>
  );
}

function EventCard({ e, onSelect }: { e: MinistryEvent; onSelect: (id: string) => void }) {
  const cat = CATEGORY_META[e.category];
  const gap = volunteerGap(e);
  const pct = checklistPct(e);
  const score = clarityScore(e);
  return (
    <Card className="!p-0">
      <button onClick={() => onSelect(e.id)} className="block w-full p-4 text-left">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold">{e.title}</p>
            <p className="mt-0.5 text-xs text-stone-500">
              {fmtDate(e.start)} · {fmtTime(e.start)}{e.location ? ` · ${e.location}` : ''}
            </p>
          </div>
          <Badge tone={STATUS_META[e.status].chip}>{STATUS_META[e.status].label}</Badge>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge tone={cat.chip}>{cat.label}</Badge>
          {e.capacity ? (
            <Badge tone="bg-stone-100 text-stone-600">
              {e.registered}/{e.capacity} registered
            </Badge>
          ) : (
            e.registered > 0 && <Badge tone="bg-stone-100 text-stone-600">{e.registered} expected</Badge>
          )}
          {gap > 0 && <Badge tone="bg-amber-100 text-amber-800">{gap} volunteers needed</Badge>}
          {e.parentFacing && <Badge tone={clarityTone(score).chip}>Clarity {score}%</Badge>}
        </div>
        {e.checklist.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <ProgressBar value={pct} className="flex-1" />
            <span className="text-[11px] font-bold text-stone-500">{pct}%</span>
          </div>
        )}
      </button>
    </Card>
  );
}

function EventDetail({
  e,
  onBack,
  onUpdate,
  onDelete,
  onEdit,
}: {
  e: MinistryEvent;
  onBack: () => void;
  onUpdate: (id: string, fn: (ev: MinistryEvent) => MinistryEvent) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const [newItem, setNewItem] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newRoleNeeded, setNewRoleNeeded] = useState('2');
  const [editingClarity, setEditingClarity] = useState<ClarityKey | null>(null);
  const [clarityDraft, setClarityDraft] = useState('');
  const [generator, setGenerator] = useState<'parent' | 'leader' | null>(null);

  const up = (fn: (ev: MinistryEvent) => MinistryEvent) => onUpdate(e.id, fn);

  const openClarityEditor = (key: ClarityKey) => {
    setEditingClarity(key);
    setClarityDraft(e.details?.[key] ?? '');
  };

  const saveClarityDetail = (covered: boolean) => {
    if (!editingClarity) return;
    const key = editingClarity;
    const val = clarityDraft.trim();
    up((ev) => {
      const details = { ...(ev.details ?? {}) };
      if (covered && val) details[key] = val;
      else delete details[key];
      return { ...ev, details, clarity: { ...ev.clarity, [key]: covered } };
    });
    setEditingClarity(null);
  };

  const cat = CATEGORY_META[e.category];
  const score = clarityScore(e);
  const tone = clarityTone(score);
  const pct = checklistPct(e);
  const doneCount = e.checklist.filter((c) => c.done).length;

  const addChecklistItem = (evt: FormEvent) => {
    evt.preventDefault();
    const label = newItem.trim();
    if (!label) return;
    up((ev) => ({
      ...ev,
      checklist: [...ev.checklist, { id: `${ev.id}-c${Date.now()}`, label, done: false }],
    }));
    setNewItem('');
  };

  const addRole = (evt: FormEvent) => {
    evt.preventDefault();
    const role = newRole.trim();
    const needed = Math.max(1, parseInt(newRoleNeeded, 10) || 1);
    if (!role) return;
    up((ev) => ({ ...ev, volunteers: [...ev.volunteers, { role, needed, confirmed: 0 }] }));
    setNewRole('');
    setNewRoleNeeded('2');
  };

  const bumpConfirmed = (role: string, delta: number) =>
    up((ev) => ({
      ...ev,
      volunteers: ev.volunteers.map((v) =>
        v.role === role ? { ...v, confirmed: Math.max(0, v.confirmed + delta) } : v,
      ),
    }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <button onClick={onBack} className="text-sm font-bold text-brand-700 hover:underline">
          ← All events
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(e.id)}
            className="rounded-full border border-stone-300 bg-white px-4 py-1.5 text-xs font-bold text-stone-700 transition hover:border-stone-500"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete "${e.title}"? This can't be undone.`)) onDelete(e.id);
            }}
            className="rounded-full border border-rose-200 bg-white px-4 py-1.5 text-xs font-bold text-rose-600 transition hover:border-rose-400"
          >
            Delete
          </button>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight">{e.title}</h1>
          <Badge tone={STATUS_META[e.status].chip}>{STATUS_META[e.status].label}</Badge>
          <Badge tone={cat.chip}>{cat.label}</Badge>
        </div>
        <p className="mt-1 text-sm text-stone-600">
          {fmtDateLong(e.start)} · {fmtTime(e.start)}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <SectionTitle>Details</SectionTitle>
            <dl className="space-y-2 text-sm">
              {e.location && (
                <div className="flex justify-between gap-4">
                  <dt className="font-semibold text-stone-500">Location</dt>
                  <dd className="text-right font-bold">{e.location}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-stone-500">Target group</dt>
                <dd className="text-right font-bold">{e.targetGroup}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="font-semibold text-stone-500">Registration</dt>
                <dd className="flex items-center gap-2">
                  <StepperButton label="−" onClick={() => up((ev) => ({ ...ev, registered: Math.max(0, ev.registered - 1) }))} />
                  <span className="min-w-12 text-center font-bold">
                    {e.capacity ? `${e.registered} / ${e.capacity}` : e.registered}
                  </span>
                  <StepperButton label="+" onClick={() => up((ev) => ({ ...ev, registered: ev.registered + 1 }))} />
                </dd>
              </div>
            </dl>
            {e.capacity ? (
              <ProgressBar value={(e.registered / e.capacity) * 100} className="mt-3" />
            ) : null}
            {e.notes && (
              <p className="mt-3 rounded-xl bg-brand-50 p-3 text-xs font-medium leading-relaxed text-stone-700">
                {e.notes}
              </p>
            )}
          </Card>

          <Card>
            <SectionTitle>Operations</SectionTitle>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {TRACKS.map((t) => (
                <TrackPill
                  key={t.key}
                  label={t.label}
                  status={e[t.key]}
                  onCycle={() => up((ev) => ({ ...ev, [t.key]: nextTrackStatus(ev[t.key]) }))}
                />
              ))}
            </div>
            <p className="mt-2 text-[11px] font-medium text-stone-400">Tap a status to update it.</p>
          </Card>

          <Card>
            <SectionTitle>Communicate</SectionTitle>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                onClick={() => setGenerator('parent')}
                className="rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
              >
                ✉️ Draft parent update
              </button>
              <button
                onClick={() => setGenerator('leader')}
                className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm font-bold text-stone-700 transition hover:border-stone-500"
              >
                📋 Leader run sheet
              </button>
            </div>
            <p className="mt-2 text-[11px] font-medium text-stone-400">
              Drafts are built from this event's details — copy, tweak, and send wherever you talk to
              your people.
            </p>
          </Card>

          <Card>
            <SectionTitle>Volunteers</SectionTitle>
            {e.volunteers.length === 0 ? (
              <EmptyState title="No volunteer roles yet" hint="Add the roles this event needs below." />
            ) : (
              <div className="space-y-3">
                {e.volunteers.map((v) => {
                  const open = Math.max(0, v.needed - v.confirmed);
                  return (
                    <div key={v.role}>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="min-w-0 truncate font-bold">{v.role}</span>
                        <span className="flex shrink-0 items-center gap-1.5">
                          <StepperButton label="−" onClick={() => bumpConfirmed(v.role, -1)} />
                          <span className="text-xs font-semibold text-stone-500">{v.confirmed}</span>
                          <StepperButton label="+" onClick={() => bumpConfirmed(v.role, 1)} />
                          <span className="text-xs font-semibold text-stone-400">of</span>
                          <input
                            type="number"
                            min="1"
                            value={v.needed}
                            onChange={(ev2) => {
                              const n = Math.max(1, parseInt(ev2.target.value, 10) || 1);
                              up((ev) => ({
                                ...ev,
                                volunteers: ev.volunteers.map((x) => (x.role === v.role ? { ...x, needed: n } : x)),
                              }));
                            }}
                            aria-label={`${v.role} needed`}
                            className="w-12 rounded-lg border border-stone-200 px-1 py-0.5 text-center text-xs font-semibold focus:border-brand-500 focus:outline-none"
                          />
                          {open > 0 && <Badge tone="bg-amber-100 text-amber-800">{open} open</Badge>}
                          <button
                            onClick={() =>
                              up((ev) => ({ ...ev, volunteers: ev.volunteers.filter((x) => x.role !== v.role) }))
                            }
                            aria-label={`Remove ${v.role}`}
                            className="ml-1 text-stone-300 transition hover:text-rose-500"
                          >
                            ✕
                          </button>
                        </span>
                      </div>
                      <ProgressBar
                        value={(v.confirmed / v.needed) * 100}
                        tone={open > 0 ? 'bg-amber-500' : 'bg-emerald-500'}
                        className="mt-1.5"
                      />
                    </div>
                  );
                })}
              </div>
            )}
            <form onSubmit={addRole} className="mt-3 flex gap-2">
              <input
                value={newRole}
                onChange={(ev) => setNewRole(ev.target.value)}
                placeholder="Add a role (e.g. Drivers)"
                className="min-w-0 flex-1 rounded-xl border border-stone-300 px-3 py-1.5 text-sm font-semibold placeholder:font-medium placeholder:text-stone-400 focus:border-brand-500 focus:outline-none"
              />
              <input
                type="number"
                min="1"
                value={newRoleNeeded}
                onChange={(ev) => setNewRoleNeeded(ev.target.value)}
                aria-label="How many needed"
                className="w-16 rounded-xl border border-stone-300 px-2 py-1.5 text-center text-sm font-semibold focus:border-brand-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newRole.trim()}
                className="rounded-xl bg-stone-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-stone-700 disabled:opacity-40"
              >
                Add
              </button>
            </form>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <SectionTitle
              action={e.parentFacing ? <Badge tone={tone.chip}>{score}%</Badge> : undefined}
            >
              Parent Clarity Score
            </SectionTitle>
            {e.parentFacing ? (
              <>
                <div className="flex gap-1">
                  {CLARITY_FIELDS.map((f) => (
                    <div
                      key={f.key}
                      title={f.label}
                      className={`h-2 flex-1 rounded-full ${e.clarity[f.key] ? tone.bar : 'bg-stone-200'}`}
                    />
                  ))}
                </div>
                <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {CLARITY_FIELDS.map((f) => (
                    <li key={f.key}>
                      <button
                        onClick={() => openClarityEditor(f.key)}
                        title="Tap to add the info"
                        className={`w-full rounded-lg px-1 py-0.5 text-left text-xs transition hover:bg-stone-50 ${
                          editingClarity === f.key ? 'bg-stone-100' : ''
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                              e.clarity[f.key] ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'
                            }`}
                          >
                            {e.clarity[f.key] ? '✓' : '✗'}
                          </span>
                          <span className={e.clarity[f.key] ? 'font-semibold' : 'font-semibold text-stone-400'}>
                            {f.label}
                          </span>
                        </span>
                        {e.details?.[f.key] && (
                          <span className="mt-0.5 block truncate pl-[22px] text-[10px] font-medium text-stone-400">
                            {e.details[f.key]}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
                {editingClarity && (
                  <div className="mt-3 rounded-xl bg-stone-50 p-3">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-stone-500">
                      {CLARITY_FIELDS.find((f) => f.key === editingClarity)?.label}
                    </p>
                    <input
                      autoFocus
                      value={clarityDraft}
                      onChange={(ev2) => setClarityDraft(ev2.target.value)}
                      onKeyDown={(ev2) => {
                        if (ev2.key === 'Enter') saveClarityDetail(true);
                        if (ev2.key === 'Escape') setEditingClarity(null);
                      }}
                      placeholder={CLARITY_HINTS[editingClarity]}
                      className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-semibold placeholder:font-medium placeholder:text-stone-400 focus:border-brand-500 focus:outline-none"
                    />
                    <div className="mt-2 flex flex-wrap justify-end gap-2">
                      <button
                        onClick={() => setEditingClarity(null)}
                        className="rounded-full px-3 py-1.5 text-xs font-bold text-stone-500 transition hover:bg-stone-200/60"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveClarityDetail(false)}
                        className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:border-rose-400"
                      >
                        Not covered
                      </button>
                      <button
                        onClick={() => saveClarityDetail(true)}
                        className="rounded-full bg-stone-900 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-stone-700"
                      >
                        Save as covered
                      </button>
                    </div>
                  </div>
                )}
                <p className="mt-3 text-[11px] font-medium text-stone-500">
                  Tap a field to record the actual info — it feeds the parent update draft. "No bus —
                  parents drive" counts as transportation info.
                </p>
              </>
            ) : (
              <EmptyState title="Internal event" hint="Parent clarity isn't tracked for leader-only and internal items." />
            )}
          </Card>

          <Card>
            <SectionTitle
              action={
                e.checklist.length > 0 ? (
                  <span className="text-xs font-bold text-stone-500">
                    {doneCount}/{e.checklist.length}
                  </span>
                ) : undefined
              }
            >
              Checklist
            </SectionTitle>
            {e.checklist.length > 0 && <ProgressBar value={pct} className="mb-3" />}
            <div className="space-y-1">
              {e.checklist.map((c) => (
                <div
                  key={c.id}
                  className="group flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-stone-50"
                >
                  <input
                    type="checkbox"
                    checked={c.done}
                    onChange={() =>
                      up((ev) => ({
                        ...ev,
                        checklist: ev.checklist.map((x) => (x.id === c.id ? { ...x, done: !x.done } : x)),
                      }))
                    }
                    className="h-4 w-4 accent-brand-600"
                  />
                  <span className={`flex-1 text-sm font-semibold ${c.done ? 'text-stone-400 line-through' : ''}`}>
                    {c.label}
                  </span>
                  <button
                    onClick={() =>
                      up((ev) => ({ ...ev, checklist: ev.checklist.filter((x) => x.id !== c.id) }))
                    }
                    aria-label={`Remove ${c.label}`}
                    className="text-stone-300 transition hover:text-rose-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={addChecklistItem} className="mt-3 flex gap-2">
              <input
                value={newItem}
                onChange={(ev) => setNewItem(ev.target.value)}
                placeholder="Add checklist item"
                className="min-w-0 flex-1 rounded-xl border border-stone-300 px-3 py-1.5 text-sm font-semibold placeholder:font-medium placeholder:text-stone-400 focus:border-brand-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newItem.trim()}
                className="rounded-xl bg-stone-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-stone-700 disabled:opacity-40"
              >
                Add
              </button>
            </form>
          </Card>
        </div>
      </div>

      {generator && (
        <DraftModal
          title={generator === 'parent' ? 'Parent update draft' : 'Leader run sheet'}
          text={generator === 'parent' ? draftParentUpdate(e) : draftLeaderBriefing(e)}
          onClose={() => setGenerator(null)}
        />
      )}
    </div>
  );
}

export default function EventsView({ events, selectedId, onSelect, onUpdate, onDelete, onEdit, onNew }: Props) {
  const [catFilter, setCatFilter] = useState<EventCategory | 'all'>('all');

  const selected = events.find((e) => e.id === selectedId);
  if (selected) {
    return (
      <EventDetail
        e={selected}
        onBack={() => onSelect(null)}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    );
  }

  const filtered = events
    .filter((e) => catFilter === 'all' || e.category === catFilter)
    .sort((a, b) => {
      const aPast = isPast(a.start) ? 1 : 0;
      const bPast = isPast(b.start) ? 1 : 0;
      if (aPast !== bPast) return aPast - bPast;
      return a.start.localeCompare(b.start);
    });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">Event Command Center</h1>
        <button
          onClick={onNew}
          className="rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-stone-700"
        >
          + New event
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip active={catFilter === 'all'} onClick={() => setCatFilter('all')}>
          All
        </Chip>
        {ALL_CATEGORIES.map((c) => (
          <Chip key={c} active={catFilter === c} onClick={() => setCatFilter(c)}>
            {CATEGORY_META[c].label}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No events in this category" hint="Try another filter, or start one from a template." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e) => (
            <EventCard key={e.id} e={e} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
