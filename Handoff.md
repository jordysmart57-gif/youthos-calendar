# YouthOS — Handoff

> The living state of this project. Read first, update after every completed task.

## Last updated

**June 10, 2026, ~12:30 PM** — Session 001 (project founding)

## Current project status

🟢 **v0.1 complete and verified.** The full youth ministry command center is built, type-checks
clean under strict TypeScript, builds successfully, and was verified running in the browser at
desktop and mobile widths with zero console errors. All seven modules from the spec are live with
mock data: Dashboard, Calendar, Event Command Center, People, Tasks, Parent Clarity Score, and
Event Templates. State is in-memory only (by design for v0.1).

## What changed (this session)

Founded the entire project from scratch:

- **Scaffold:** Vite + React 19 + TypeScript (strict) + Tailwind CSS v4 (`@tailwindcss/vite`
  plugin). No router or state library — plain component state, deliberately.
- **Domain model** (`src/types.ts`): events with 8 categories, 5 lifecycle statuses, 4 operational
  tracks (forms/payments/transportation/parent comms), volunteer needs, checklists, and the
  10-field `ClarityInfo`; tasks in 6 ministry categories; students/parents/leaders/small groups;
  event templates.
- **Mock data** (`src/lib/data.ts`): 14 events (incl. all 10 requested samples plus 2 deadlines +
  2 promo tasks), 16 tasks, 12 students, 8 parents, 7 leaders, 4 small groups, 12 templates.
  **All dates are relative to today** via a `day(offset, hour)` helper so the demo never goes stale.
- **Derived logic** (`src/lib/helpers.ts`): Parent Clarity Score (filled/10), volunteer gap and
  checklist % computation, date utilities, and all category/status/track display metadata.
- **Six views** (`src/views/`): Dashboard (stats, this week, coming up, urgent tasks, volunteer
  gaps, clarity issues, student care), CalendarView (month grid + category filter chips + day
  agenda), EventsView (card list + full command-center detail with interactive checklist),
  PeopleView (6 sections), TasksView (6 categories, interactive checkboxes, overdue flags),
  TemplatesView (12 expandable blueprints).
- **App shell** (`src/App.tsx`): top nav pills on desktop, fixed bottom tab bar on mobile; owns
  events/tasks state so checkbox toggles persist across tab switches; cross-view "open event"
  navigation from dashboard and calendar.
- **Docs:** README.md, PROJECT_SPEC.md, ROADMAP.md, Cloud.md, CLAUDE.md, this file.

### Decisions made

1. **`parentFacing` flag on events** — leader meetings, deadlines, and promo tasks are excluded
   from clarity scoring so internal items don't drag the dashboard average down.
2. **Clarity measures communication, not logistics** — "no bus, parents drive" counts as
   transportation info. Documented in PROJECT_SPEC.md.
3. **Local-naive datetime strings** (`2026-06-10T19:00`, no `Z`) — avoids UTC day-shift bugs when
   slicing date keys. `Date.toISOString()` is banned for event dates (noted in CLAUDE.md).
4. **Deadlines and promo tasks are calendar events**, not just tasks — youth pastors plan
   backwards from events, so they belong on the month grid with their own colors.
5. **No router** — six tabs on one state variable keeps v0.1 simple; revisit if deep-linking is
   ever needed.

## Files changed

```
youthos-calendar/                 (all new)
├── package.json, tsconfig.json, vite.config.ts, index.html, .gitignore
├── public/youthos.svg
├── README.md, Handoff.md, Cloud.md, CLAUDE.md, PROJECT_SPEC.md, ROADMAP.md
└── src/
    ├── main.tsx, App.tsx, index.css, types.ts
    ├── lib/data.ts, lib/helpers.ts
    ├── components/ui.tsx
    └── views/{Dashboard,CalendarView,EventsView,PeopleView,TasksView,TemplatesView}.tsx
```

Also: `../.claude/launch.json` (vault level) — added a `youthos` dev-server config on port 5179
(5173 was occupied by another process).

## Commands run

```bash
npm install        # clean install, exit 0
npm run build      # tsc strict + vite build — passed first try, 250 kB JS / 75 kB gzip
# dev server via preview harness: npm --prefix youthos-calendar run dev -- --port 5179
```

Verified in browser preview: dashboard (desktop), Lake Day event detail (desktop), calendar +
bottom nav (375px mobile). Zero console errors/warnings.

## Known issues

- **No persistence** — checkbox toggles reset on refresh (in-memory state; localStorage is v0.2).
- **Templates are display-only** — "create event from template" intentionally deferred to v0.2;
  the template cards say so.
- Calendar day cells cap at 3 dots + a "+n" overflow count; fine at current data volume.
- Dev server port is pinned to 5179 in `.claude/launch.json`; if that port gets taken, bump it.

## Next recommended steps

1. **Create event from template** — the single best next feature. Templates already carry
   checklist, volunteer roles, and clarity requirements; a "Use template" flow (pick date →
   pre-filled event) turns the app from a demo into a tool overnight.
2. **localStorage persistence** alongside it, so created events and checked boxes survive refresh
   (both are v0.2 in ROADMAP.md and belong in the same session).
3. After that: the v0.3 **parent update generator** — composing a parent email from an event's
   clarity fields is the feature that makes the Parent Clarity Score earn its keep.
