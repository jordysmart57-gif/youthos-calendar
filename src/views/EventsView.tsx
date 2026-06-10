import { useState } from 'react';
import { EventCategory, MinistryEvent, TrackStatus } from '../types';
import {
  ALL_CATEGORIES,
  CATEGORY_META,
  CLARITY_FIELDS,
  STATUS_META,
  TRACK_META,
  checklistPct,
  clarityScore,
  clarityTone,
  fmtDate,
  fmtDateLong,
  fmtTime,
  isPast,
  volunteerGap,
} from '../lib/helpers';
import { Badge, Card, Chip, EmptyState, ProgressBar, SectionTitle } from '../components/ui';

interface Props {
  events: MinistryEvent[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onToggleChecklist: (eventId: string, itemId: string) => void;
}

const TRACKS: { key: 'forms' | 'payments' | 'transportation' | 'parentComm'; label: string }[] = [
  { key: 'forms', label: 'Forms' },
  { key: 'payments', label: 'Payments' },
  { key: 'transportation', label: 'Transportation' },
  { key: 'parentComm', label: 'Parent Comms' },
];

function TrackPill({ label, status }: { label: string; status: TrackStatus }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-stone-50 px-2.5 py-1.5">
      <span className="text-xs font-semibold text-stone-600">{label}</span>
      <Badge tone={TRACK_META[status].chip}>{TRACK_META[status].label}</Badge>
    </div>
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
              {fmtDate(e.start)} · {fmtTime(e.start)} · {e.location}
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
  onToggleChecklist,
}: {
  e: MinistryEvent;
  onBack: () => void;
  onToggleChecklist: (eventId: string, itemId: string) => void;
}) {
  const cat = CATEGORY_META[e.category];
  const score = clarityScore(e);
  const tone = clarityTone(score);
  const pct = checklistPct(e);
  const doneCount = e.checklist.filter((c) => c.done).length;

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="text-sm font-bold text-brand-700 hover:underline">
        ← All events
      </button>

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
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-stone-500">Location</dt>
                <dd className="text-right font-bold">{e.location}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-stone-500">Target group</dt>
                <dd className="text-right font-bold">{e.targetGroup}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-stone-500">Registration</dt>
                <dd className="text-right font-bold">
                  {e.capacity ? `${e.registered} of ${e.capacity}` : e.registered > 0 ? `${e.registered} expected` : '—'}
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
                <TrackPill key={t.key} label={t.label} status={e[t.key]} />
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle>Volunteers</SectionTitle>
            {e.volunteers.length === 0 ? (
              <EmptyState title="No volunteer roles for this event" />
            ) : (
              <div className="space-y-3">
                {e.volunteers.map((v) => {
                  const open = Math.max(0, v.needed - v.confirmed);
                  return (
                    <div key={v.role}>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="font-bold">{v.role}</span>
                        <span className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-stone-500">
                            {v.confirmed}/{v.needed} confirmed
                          </span>
                          {open > 0 && <Badge tone="bg-amber-100 text-amber-800">{open} open</Badge>}
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
                    <li key={f.key} className="flex items-center gap-1.5 text-xs">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                          e.clarity[f.key] ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'
                        }`}
                      >
                        {e.clarity[f.key] ? '✓' : '✗'}
                      </span>
                      <span className={e.clarity[f.key] ? 'font-semibold' : 'font-semibold text-stone-400'}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>
                {score < 100 && (
                  <p className="mt-3 text-[11px] font-medium text-stone-500">
                    A parent should be able to say yes without texting you a question. Fill the gaps above
                    before the next parent email.
                  </p>
                )}
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
            {e.checklist.length === 0 ? (
              <EmptyState title="No checklist yet" hint="Start from a template to get a head start." />
            ) : (
              <>
                <ProgressBar value={pct} className="mb-3" />
                <div className="space-y-1">
                  {e.checklist.map((c) => (
                    <label
                      key={c.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-stone-50"
                    >
                      <input
                        type="checkbox"
                        checked={c.done}
                        onChange={() => onToggleChecklist(e.id, c.id)}
                        className="h-4 w-4 accent-brand-600"
                      />
                      <span className={`text-sm font-semibold ${c.done ? 'text-stone-400 line-through' : ''}`}>
                        {c.label}
                      </span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function EventsView({ events, selectedId, onSelect, onToggleChecklist }: Props) {
  const [catFilter, setCatFilter] = useState<EventCategory | 'all'>('all');

  const selected = events.find((e) => e.id === selectedId);
  if (selected) {
    return <EventDetail e={selected} onBack={() => onSelect(null)} onToggleChecklist={onToggleChecklist} />;
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
      <h1 className="text-2xl font-extrabold tracking-tight">Event Command Center</h1>

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
