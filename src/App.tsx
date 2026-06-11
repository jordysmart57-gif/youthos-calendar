import { ReactNode, useState } from 'react';
import { EventTemplate, Leader, MinistryEvent, Parent, SmallGroup, Student, Task } from './types';
import { EVENTS, LEADERS, PARENTS, SMALL_GROUPS, STUDENTS, TASKS } from './lib/data';
import { usePersistentState } from './lib/usePersistentState';
import { KEYS, downloadJson, migratedV1 } from './lib/storage';
import { keyOf } from './lib/helpers';
import { Modal } from './components/ui';
import EventForm from './components/EventForm';
import TaskForm from './components/TaskForm';
import SettingsModal from './components/SettingsModal';
import Dashboard from './views/Dashboard';
import CalendarView from './views/CalendarView';
import EventsView from './views/EventsView';
import PeopleView from './views/PeopleView';
import TasksView from './views/TasksView';
import TemplatesView from './views/TemplatesView';

type Tab = 'dashboard' | 'calendar' | 'events' | 'people' | 'tasks' | 'templates';

interface EventModalState {
  template?: EventTemplate;
  editId?: string;
  date?: string;
}

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

const SETTINGS_ICON = 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6';

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
  const [events, setEvents] = usePersistentState<MinistryEvent[]>(
    KEYS.events,
    () => migratedV1<MinistryEvent[]>('events') ?? EVENTS,
  );
  const [tasks, setTasks] = usePersistentState<Task[]>(
    KEYS.tasks,
    () => migratedV1<Task[]>('tasks') ?? TASKS,
  );
  const [students, setStudents] = usePersistentState<Student[]>(KEYS.students, STUDENTS);
  const [parents, setParents] = usePersistentState<Parent[]>(KEYS.parents, PARENTS);
  const [leaders, setLeaders] = usePersistentState<Leader[]>(KEYS.leaders, LEADERS);
  const [groups, setGroups] = usePersistentState<SmallGroup[]>(KEYS.groups, SMALL_GROUPS);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventModal, setEventModal] = useState<EventModalState | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const updateEvent = (id: string, fn: (e: MinistryEvent) => MinistryEvent) =>
    setEvents((es) => es.map((e) => (e.id === id ? fn(e) : e)));

  const deleteEvent = (id: string) => {
    setEvents((es) => es.filter((e) => e.id !== id));
    setTasks((ts) => ts.map((t) => (t.eventId === id ? { ...t, eventId: undefined } : t)));
    setSelectedEventId(null);
  };

  const saveEvent = (e: MinistryEvent) => {
    if (eventModal?.editId) {
      updateEvent(e.id, () => e);
    } else {
      setEvents((es) => [...es, e]);
      setSelectedEventId(e.id);
      setTab('events');
    }
    setEventModal(null);
  };

  const toggleTask = (id: string) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTask = (id: string) => setTasks((ts) => ts.filter((t) => t.id !== id));

  const saveTask = (t: Task) => {
    setTasks((ts) => [...ts, t]);
    setTaskModalOpen(false);
  };

  const clearFollowUp = (id: string) =>
    setStudents((ss) =>
      ss.map((s) => (s.id === id ? { ...s, needsFollowUp: false, followUpReason: undefined } : s)),
    );

  const openEvent = (id: string) => {
    setSelectedEventId(id);
    setTab('events');
  };

  // ----- backup / restore / reset -----

  const exportData = () =>
    downloadJson(`youthos-backup-${keyOf(new Date())}.json`, {
      app: 'youthos',
      schema: 2,
      exportedAt: new Date().toISOString(),
      data: { events, tasks, students, parents, leaders, groups },
    });

  const importData = (raw: unknown): string | null => {
    if (typeof raw !== 'object' || raw === null) return "That file isn't a YouthOS backup.";
    const data = ((raw as Record<string, unknown>).data ?? raw) as Record<string, unknown>;
    let applied = 0;
    if (Array.isArray(data.events)) { setEvents(data.events as MinistryEvent[]); applied++; }
    if (Array.isArray(data.tasks)) { setTasks(data.tasks as Task[]); applied++; }
    if (Array.isArray(data.students)) { setStudents(data.students as Student[]); applied++; }
    if (Array.isArray(data.parents)) { setParents(data.parents as Parent[]); applied++; }
    if (Array.isArray(data.leaders)) { setLeaders(data.leaders as Leader[]); applied++; }
    if (Array.isArray(data.groups)) { setGroups(data.groups as SmallGroup[]); applied++; }
    if (applied === 0) return 'No YouthOS data found in that file.';
    setSelectedEventId(null);
    return null;
  };

  const resetData = () => {
    if (!window.confirm("Clear all data? Every event, task, and person will be removed. This can't be undone.")) return;
    setEvents([]);
    setTasks([]);
    setStudents([]);
    setParents([]);
    setLeaders([]);
    setGroups([]);
    setSelectedEventId(null);
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
          <button
            onClick={() => setTaskModalOpen(true)}
            className="mt-3 flex items-center gap-3 rounded-xl border border-dashed border-stone-300 px-3 py-2.5 text-sm font-bold text-stone-500 transition hover:border-brand-500 hover:text-brand-700"
          >
            <span className="flex h-5 w-5 items-center justify-center text-lg leading-none">+</span>
            New task
          </button>
        </nav>
        <div className="px-3 pb-3">
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-stone-500 transition hover:bg-stone-200/60"
          >
            <Icon d={SETTINGS_ICON} />
            Data & settings
          </button>
        </div>
        <p className="px-5 pb-5 text-[11px] font-semibold leading-relaxed text-stone-400">
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
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Data & settings"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-200/60 md:ml-1"
          >
            <Icon d={SETTINGS_ICON} />
          </button>
        </div>
      </header>

      <div className="lg:pl-60">
        <main className="mx-auto max-w-7xl px-4 py-6 pb-24 md:pb-12 lg:px-8 lg:py-8">
          {tab === 'dashboard' && (
            <Dashboard
              events={events}
              tasks={tasks}
              students={students}
              onToggleTask={toggleTask}
              onOpenEvent={openEvent}
              onClearFollowUp={clearFollowUp}
            />
          )}
          {tab === 'calendar' && (
            <CalendarView
              events={events}
              onOpenEvent={openEvent}
              onNewEvent={(date) => setEventModal({ date })}
            />
          )}
          {tab === 'events' && (
            <EventsView
              events={events}
              selectedId={selectedEventId}
              onSelect={setSelectedEventId}
              onUpdate={updateEvent}
              onDelete={deleteEvent}
              onEdit={(id) => setEventModal({ editId: id })}
              onNew={() => setEventModal({})}
            />
          )}
          {tab === 'people' && (
            <PeopleView
              students={students}
              parents={parents}
              leaders={leaders}
              groups={groups}
              setStudents={setStudents}
              setParents={setParents}
              setLeaders={setLeaders}
              setGroups={setGroups}
            />
          )}
          {tab === 'tasks' && (
            <TasksView
              tasks={tasks}
              events={events}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onNewTask={() => setTaskModalOpen(true)}
            />
          )}
          {tab === 'templates' && <TemplatesView onUseTemplate={(t) => setEventModal({ template: t })} />}
        </main>
      </div>

      {/* Mobile quick-add task */}
      <button
        onClick={() => setTaskModalOpen(true)}
        aria-label="New task"
        className="fixed bottom-20 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white shadow-lg transition hover:bg-brand-700 md:hidden"
      >
        +
      </button>

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

      {eventModal && (
        <Modal
          title={
            eventModal.editId
              ? 'Edit event'
              : eventModal.template
                ? `New ${eventModal.template.name}`
                : 'New event'
          }
          onClose={() => setEventModal(null)}
        >
          <EventForm
            initial={eventModal.editId ? events.find((e) => e.id === eventModal.editId) : undefined}
            template={eventModal.template}
            initialDate={eventModal.date}
            onSave={saveEvent}
            onClose={() => setEventModal(null)}
          />
        </Modal>
      )}

      {taskModalOpen && (
        <Modal title="New task" onClose={() => setTaskModalOpen(false)}>
          <TaskForm events={events} onSave={saveTask} onClose={() => setTaskModalOpen(false)} />
        </Modal>
      )}

      {settingsOpen && (
        <SettingsModal
          onExport={exportData}
          onImport={importData}
          onReset={resetData}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
