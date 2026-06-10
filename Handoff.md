# YouthOS — Handoff

> The living state of this project. Read first, update after every completed task.

## Last updated

**June 10, 2026, ~2:45 PM** — Session 003 (v0.2: editable + persistent)

## Current project status

🟢 **v0.2.0 live in production: https://youthos-calendar.vercel.app**

The app is now a real tool, not just a demo: events can be created from templates (or scratch),
edited, and deleted; tasks can be quick-added from anywhere and deleted; checklists, clarity
fields, ops tracks, volunteer counts, and registration are all editable in place; and everything
persists in localStorage between sessions. Browser-verified end-to-end (template → event →
clarity toggle → task add → hard reload), zero console errors.

📦 **Project location: `/Users/jordansmart/youthos-calendar`** — moved out of the Apollos Systems
vault (June 10, 2026) to live as its own top-level project folder alongside Jordan's other
projects. It now has its own `.claude/launch.json` (dev server `youthos` on port 5179), and its
`CLAUDE.md` no longer defers to the vault. Git repo and Vercel link (`.vercel/project.json`)
moved intact — deploys and (future) pushes work unchanged from the new path.

The app now has a true desktop experience (sidebar navigation, three-column dashboard, calendar
cells with titled event chips) alongside the original mobile layout. Build passes clean, verified
in browser at 375px and 1440px. Deployed to Vercel production and confirmed serving (HTTP 200).

✅ **On GitHub: `github.com/jordysmart57-gif/youthos-calendar`** — Jordan created the repo and
`main` was pushed (June 10, 2026, afternoon). `origin` tracks over SSH. Note: no GitHub API
credential exists locally (no `gh` CLI/token) — plain git push/pull works, but repo-level
operations (PRs, settings) need the github.com UI or a future `gh auth login`.

## What changed

### Session 003 — June 10, 2026 (v0.2)

**New capability — create event from template:** "Use this template →" on any template card opens
a prefilled form (date defaults to today + the template's lead time). `buildEvent()` in
`helpers.ts` seeds the checklist, parses volunteer roles from the template strings ("Drivers
(6–10)" → 6 needed), and derives clarity: date/time start true (just chosen), the template's
required fields start false, everything else counts as covered per the n/a rule. Ops tracks
(forms/payments/transportation/parent comms) default to not-started or n/a based on what the
template asks parents for.

**Everything is editable now:**
- Events: create blank ("+ New event"), edit basics (Edit button → same form), delete (confirm).
- Event detail: tap clarity fields to toggle, tap ops-track pills to cycle status, +/− steppers
  on registration and volunteer confirmations, add/remove volunteer roles, add/remove/toggle
  checklist items.
- Tasks: quick-add from the sidebar (desktop) or floating + button (mobile) or Tasks view;
  delete via ✕ on any row. Deleting an event unlinks its tasks rather than deleting them.

**Persistence:** `usePersistentState` hook (new `src/lib/usePersistentState.ts`) backs events and
tasks with localStorage (`youthos:v1:events` / `youthos:v1:tasks`), falling back gracefully when
storage is unavailable. **Tradeoff:** once persisted, sample data keeps its absolute dates and
will drift from "today" — the sidebar's "Reset sample data" button restores a fresh relative-dated
dataset. Documented in README.

**New/changed files:** `components/EventForm.tsx` + `TaskForm.tsx` (new), `lib/usePersistentState.ts`
(new), `Modal`/`Field`/`inputCls` added to `components/ui.tsx`, `buildEvent`/`volunteersFromTemplate`/
`nextTrackStatus` added to `lib/helpers.ts`, `parentFacing` added to templates (types + data),
App.tsx rewired (persistence, modals, quick-add, reset), EventsView rewritten (interactive detail),
TasksView (delete + new-task button), TemplatesView (use-template button). Version bumped to 0.2.0;
README + ROADMAP updated.

**Commands run:** `npm run build` (passes), browser verification via dev server on :5179,
`vercel deploy --prod`, git commit + push.

### Session 002 — June 10, 2026 (afternoon)

**Desktop version:**
- `src/App.tsx` — new responsive shell: fixed left sidebar (logo, vertical nav, tagline) at
  `lg+`; sticky top header with nav pills on tablet; bottom tab bar on mobile unchanged. Content
  area widened to `max-w-7xl` with sidebar offset.
- `src/views/Dashboard.tsx` — three-column layout at `xl` (events / tasks+gaps / clarity+care),
  two columns at `lg`, single column mobile.
- `src/views/CalendarView.tsx` — desktop day cells are taller (`lg:min-h-24`) and show up to 3
  **titled event chips** in category colors with a "+n more" overflow; mobile keeps the dots.
  Day events now sorted by time.
- `src/views/EventsView.tsx`, `PeopleView.tsx`, `TemplatesView.tsx` — card grids go 3-up at `xl`.
- `src/views/TasksView.tsx` — capped at `max-w-4xl` so rows don't stretch on wide screens.

**Deployment:**
- Deployed to **Vercel production** via `vercel deploy --prod --yes` (CLI was already
  authenticated as `jordysmart57-gif`). Project `youthos-calendar` auto-created, Vite detected,
  11s build. Production alias: **https://youthos-calendar.vercel.app** — verified HTTP 200 with
  correct title. `.vercel/` added to `.gitignore` (by the CLI).
- Git repo initialized (`main`), initial commit includes the desktop version; `origin` remote set
  (push pending repo creation, see status above).

### Session 001 — June 10, 2026 (morning) — project founded

Full v0.1 built from scratch: Vite + React 19 + TS strict + Tailwind v4 scaffold; domain model
(`types.ts`); relative-dated mock data (14 events, 16 tasks, 12 students, 8 parents, 7 leaders,
4 small groups, 12 templates); clarity/gap/checklist logic (`helpers.ts`); six views (Dashboard,
Calendar, Events, People, Tasks, Templates); all docs (README, PROJECT_SPEC, ROADMAP, Cloud,
CLAUDE, Handoff). Verified desktop + mobile in browser preview, zero console errors.

Key decisions (full rationale in PROJECT_SPEC.md): `parentFacing` flag excludes internal events
from clarity scoring; clarity measures *communication* not logistics; local-naive datetime strings
(never `toISOString()`); deadlines/promo tasks are first-class calendar events; no router.

## Files changed (session 002)

- `src/App.tsx` (rewritten — sidebar shell)
- `src/views/Dashboard.tsx` (rewritten — 3-column layout)
- `src/views/CalendarView.tsx`, `EventsView.tsx`, `PeopleView.tsx`, `TasksView.tsx`,
  `TemplatesView.tsx` (grid/layout edits)
- `.gitignore` (+`.vercel`), `.vercel/project.json` (new, untracked)
- `Handoff.md` (this update)
- Vault-level: `../.claude/launch.json` unchanged this session (dev server still `youthos` @ 5179)

## Commands run

```bash
npm run build                          # passes — 252 kB JS / 75 kB gzip
git init -b main && git add -A && git commit   # initial commit
git remote add origin git@github.com:jordysmart57-gif/youthos-calendar.git
git push -u origin main                # FAILED: repository not found (needs creation)
npx vercel@latest whoami               # jordysmart57-gif (already authenticated)
npx vercel@latest deploy --prod --yes  # → Ready, production
curl https://youthos-calendar.vercel.app   # 200, correct <title>
```

## Known issues

- **Sample-data drift after first persist** — by design; "Reset sample data" (sidebar) restores a
  relative-dated demo set. Real user-created events are unaffected.
- Volunteer "needed" counts aren't editable after creation (only confirmed) — remove + re-add the
  role as a workaround; proper edit is a v0.4 nicety.
- People layer is still read-only mock data (students/parents/leaders editing isn't scoped until
  v0.4 attendance work).
- Live site is on Vercel's default URL; custom domain undecided.

## Next recommended steps

1. **v0.3 — the parent update generator**: compose a parent email/text draft straight from an
   event's clarity fields (the missing-field list becomes the editing checklist). This is the
   feature that makes the Parent Clarity Score earn its keep, and all the data is now in place.
2. The v0.3 **leader briefing generator** (one-page run sheet per event) pairs naturally with it.
3. Housekeeping: connect the GitHub repo to the Vercel project for auto-deploys
   (dashboard → Settings → Git); until then `npx vercel deploy --prod --yes` after pushes.
