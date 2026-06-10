import { ReactNode, useState } from 'react';
import { MinistryEvent, Task } from './types';
import { EVENTS, TASKS } from './lib/data';
import Dashboard from './views/Dashboard';
import CalendarView from './views/CalendarView';
import EventsView from './views/EventsView';
import PeopleView from './views/PeopleView';
import TasksView from './views/TasksView';
import TemplatesView from './views/TemplatesView';

type Tab = 'dashboard' | 'calendar' | 'events' | 'people' | 'tasks' | 'templates';

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
    >
      <path d={d} />
    </svg>
  );
}

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: 'dashboard', label: 'Home', icon: <Icon d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" /> },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: <Icon d="M7 3v4M17 3v4M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />,
  },
  { id: 'events', label: 'Events', icon: <Icon d="M5 21V4m0 1h12l-2.5 4L17 13H5" /> },
  {
    id: 'people',
    label: 'People',
    icon: (
      <Icon d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8m12 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    ),
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: <Icon d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />,
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: <Icon d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" />,
  },
];

function Brand() {
  return (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-base font-extrabold text-white shadow-sm">
        Y
      </div>
      <div className="min-w-0">
        <h1 className="text-base font-extrabold leading-tight tracking-tight">YouthOS</h1>
        <p className="truncate text-[11px] font-medium leading-tight text-stone-500">
          Youth ministry command center
        </p>
      </div>
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [events, setEvents] = useState<MinistryEvent[]>(EVENTS);
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const toggleTask = (id: string) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const toggleChecklist = (eventId: string, itemId: string) =>
    setEvents((es) =>
      es.map((e) =>
        e.id === eventId
          ? {
              ...e,
              checklist: e.checklist.map((c) => (c.id === itemId ? { ...c, done: !c.done } : c)),
            }
          : e,
      ),
    );

  const openEvent = (id: string) => {
    setSelectedEventId(id);
    setTab('events');
  };

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-stone-200/80 bg-white/70 backdrop-blur lg:flex">
        <div className="flex items-center gap-3 px-5 pb-4 pt-6">
          <Brand />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 pt-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                tab === t.id ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>
        <p className="px-5 py-5 text-[11px] font-semibold leading-relaxed text-stone-400">
          Plan the year.
          <br />
          Run the week.
          <br />
          Care for the one.
        </p>
      </aside>

      {/* Mobile / tablet header */}
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-cream/90 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Brand />
          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  tab === t.id ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-200/60'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="lg:pl-60">
        <main className="mx-auto max-w-7xl px-4 py-6 pb-24 md:pb-12 lg:px-8 lg:py-8">
          {tab === 'dashboard' && (
            <Dashboard events={events} tasks={tasks} onToggleTask={toggleTask} onOpenEvent={openEvent} />
          )}
          {tab === 'calendar' && <CalendarView events={events} onOpenEvent={openEvent} />}
          {tab === 'events' && (
            <EventsView
              events={events}
              selectedId={selectedEventId}
              onSelect={setSelectedEventId}
              onToggleChecklist={toggleChecklist}
            />
          )}
          {tab === 'people' && <PeopleView />}
          {tab === 'tasks' && <TasksView tasks={tasks} events={events} onToggleTask={toggleTask} />}
          {tab === 'templates' && <TemplatesView />}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-stone-200 bg-white/95 backdrop-blur md:hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold ${
              tab === t.id ? 'text-brand-700' : 'text-stone-400'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
