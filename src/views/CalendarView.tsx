import { useMemo, useState } from 'react';
import { EventCategory, MinistryEvent } from '../types';
import {
  ALL_CATEGORIES,
  CATEGORY_META,
  STATUS_META,
  dateKey,
  fmtDateLong,
  fmtTime,
  keyOf,
  startOfWeek,
  todayKey,
} from '../lib/helpers';
import { Badge, Card, Chip, EmptyState, SectionTitle } from '../components/ui';

interface Props {
  events: MinistryEvent[];
  onOpenEvent: (id: string) => void;
  onNewEvent: (date: string) => void;
}

export default function CalendarView({ events, onOpenEvent, onNewEvent }: Props) {
  const [monthDate, setMonthDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedKey, setSelectedKey] = useState(todayKey());
  const [activeCats, setActiveCats] = useState<Set<EventCategory>>(new Set(ALL_CATEGORIES));

  const cells = useMemo(() => {
    const out: Date[] = [];
    const cur = startOfWeek(monthDate);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
    while (cur < monthEnd || out.length % 7 !== 0) {
      out.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }, [monthDate]);

  const byDay = useMemo(() => {
    const map = new Map<string, MinistryEvent[]>();
    for (const e of events) {
      if (!activeCats.has(e.category)) continue;
      const k = dateKey(e.start);
      map.set(k, [...(map.get(k) ?? []), e]);
    }
    return map;
  }, [events, activeCats]);

  const toggleCat = (c: EventCategory) =>
    setActiveCats((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  const moveMonth = (delta: number) =>
    setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));

  const selectedEvents = (byDay.get(selectedKey) ?? []).sort((a, b) =>
    a.start.localeCompare(b.start),
  );
  const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">Calendar</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => moveMonth(-1)}
            className="rounded-full border border-stone-300 bg-white px-3 py-1 text-sm font-bold hover:border-stone-400"
            aria-label="Previous month"
          >
            ‹
          </button>
          <span className="min-w-36 px-2 text-center text-sm font-extrabold">{monthLabel}</span>
          <button
            onClick={() => moveMonth(1)}
            className="rounded-full border border-stone-300 bg-white px-3 py-1 text-sm font-bold hover:border-stone-400"
            aria-label="Next month"
          >
            ›
          </button>
          <button
            onClick={() => {
              const d = new Date();
              d.setDate(1);
              d.setHours(0, 0, 0, 0);
              setMonthDate(d);
              setSelectedKey(todayKey());
            }}
            className="ml-1 rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-bold text-stone-600 hover:border-stone-400"
          >
            Today
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip active={activeCats.size === ALL_CATEGORIES.length} onClick={() => setActiveCats(new Set(ALL_CATEGORIES))}>
          All
        </Chip>
        {ALL_CATEGORIES.map((c) => (
          <Chip key={c} active={activeCats.has(c)} onClick={() => toggleCat(c)}>
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${CATEGORY_META[c].dot}`} />
              {CATEGORY_META[c].label}
            </span>
          </Chip>
        ))}
      </div>

      <Card className="!p-2 sm:!p-3">
        <div className="grid grid-cols-7 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="pb-2 text-[11px] font-extrabold uppercase tracking-wide text-stone-400">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d) => {
            const k = keyOf(d);
            const inMonth = d.getMonth() === monthDate.getMonth();
            const dayEvents = (byDay.get(k) ?? []).sort((a, b) => a.start.localeCompare(b.start));
            const isToday = k === todayKey();
            const isSelected = k === selectedKey;
            return (
              <button
                key={k}
                onClick={() => setSelectedKey(k)}
                className={`flex min-h-14 flex-col items-center rounded-xl p-1.5 transition sm:min-h-16 lg:min-h-24 lg:items-stretch lg:p-2 ${
                  isSelected ? 'bg-stone-900 text-white' : 'hover:bg-stone-100'
                } ${inMonth ? '' : 'opacity-35'}`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold lg:self-start ${
                    isToday && !isSelected ? 'bg-brand-600 text-white' : ''
                  }`}
                >
                  {d.getDate()}
                </span>
                {/* Dots on small screens */}
                <span className="mt-1 flex items-center gap-0.5 lg:hidden">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${CATEGORY_META[e.category].dot}`} />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className={`text-[9px] font-bold ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                      +{dayEvents.length - 3}
                    </span>
                  )}
                </span>
                {/* Titled chips on desktop */}
                <span className="mt-1 hidden w-full flex-col gap-0.5 lg:flex">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className={`truncate rounded-md px-1.5 py-0.5 text-left text-[10px] font-bold ${
                        isSelected ? 'bg-white/15 text-white' : CATEGORY_META[e.category].chip
                      }`}
                    >
                      {e.title}
                    </span>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className={`px-1.5 text-left text-[10px] font-bold ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                      +{dayEvents.length - 3} more
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <section>
        <SectionTitle
          action={
            <button
              onClick={() => onNewEvent(selectedKey)}
              className="text-xs font-bold text-brand-700 underline-offset-2 hover:underline"
            >
              + Add event this day
            </button>
          }
        >
          {fmtDateLong(`${selectedKey}T12:00`)}
        </SectionTitle>
        {selectedEvents.length === 0 ? (
          <EmptyState title="Nothing on this day" hint="Tap another day, or go build something with a template." />
        ) : (
          <div className="space-y-2">
            {selectedEvents.map((e) => (
              <Card key={e.id} className="!p-0">
                <button
                  onClick={() => onOpenEvent(e.id)}
                  className="flex w-full items-center gap-3 p-3 text-left"
                >
                  <span className={`h-10 w-1.5 shrink-0 rounded-full ${CATEGORY_META[e.category].dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{e.title}</p>
                    <p className="truncate text-xs text-stone-500">
                      {fmtTime(e.start)}{e.location ? ` · ${e.location}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge tone={CATEGORY_META[e.category].chip}>{CATEGORY_META[e.category].label}</Badge>
                    <Badge tone={STATUS_META[e.status].chip}>{STATUS_META[e.status].label}</Badge>
                  </div>
                </button>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
