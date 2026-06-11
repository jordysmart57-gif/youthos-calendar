# YouthOS — Handoff

> The living state of this project. Read first, update after every completed task.

## Last updated

**June 11, 2026** — Session 005 (mobile optimization + design elevation)

### Session 005 — June 11, 2026 (design + mobile)

A full visual-design and mobile-optimization pass, plus two cleanups requested
along the way. Deployed to production.

- **Design direction — "warm editorial ministry."** Introduced **Fraunces**
  (optical display serif) for headings, the wordmark, and the dashboard stat
  numbers, paired with Plus Jakarta Sans for UI/body. New `PageTitle` and
  `font-display` utility. This is the signature move — warm, human, editorial,
  on-brand for "care for the one" and explicitly *not* dark-mode SaaS.
- **Atmosphere + depth** (`index.css`): layered warm background (soft gold
  light + gradient, fixed `body::before`) instead of flat cream; brown-tinted
  elevation tokens (`--shadow-soft/-lift/-glow`) so white cards lift; gold
  focus rings; gradient brand mark + avatars with rings. Entrance motion
  (`fade-up` per view via a `key={tab}` wrapper, staggered stat `pop`), all
  behind `prefers-reduced-motion`.
- **Mobile optimization** (the core ask):
  - `viewport-fit=cover` + `env(safe-area-inset-*)` on the header, bottom tab
    bar, FAB, modal, and main padding — clears notch + home indicator. Helper
    classes `.safe-top/.safe-bottom/.safe-x`.
  - **16px inputs on phones** (`inputCls` + a global `@media (max-width:640px)`
    rule) to stop iOS Safari's focus zoom-jump. **Verified 16px in-browser.**
  - Native-feeling **frosted bottom tab bar** with a gold active-indicator pill
    + icon scale; **bottom-sheet modal** with drag handle and safe-area padding;
    bigger touch targets (FAB 56px, nav/header 40px); `:active` press feedback
    throughout; momentum scroll (`.scroll-rail`) + tap-highlight removal.
  - PWA meta (apple-mobile-web-app-capable, title, theme color).
- **Touched:** `index.html`, `src/index.css`, `src/components/ui.tsx`
  (Card gains `style`; new `PageTitle`; Modal/Chip/Avatar/inputCls refined),
  `src/App.tsx` (shell, tab bar, FAB, brand, view transition), and all six
  views (display-serif titles; Dashboard stat cards + eyebrow).
- **Verified** in browser at 375px and 1280px: hero, stat cards, calendar,
  events list, and the task bottom-sheet render clean; input font-size 16px
  confirmed via inspect. `npm run build` passes. Pushed + deployed to Vercel
  prod (live at https://youthos-calendar.vercel.app).
- Earlier in the session: removed remaining placeholder strings (`TBD` default,
  `[your name + number]`/`[TODO]` in drafts) and **emptied all sample data**
  (events/tasks/people) so the app ships blank — templates kept. Added a ✕
  delete button on every event card; "Reset to sample data" → "Clear all data".

## Current project status

🟢 **v0.9.0 — release candidate — live in production: https://youthos-calendar.vercel.app**

Feature-complete for a solo youth pastor on one device. Everything is editable and persistent;
no read-only filler remains. The two headline additions: **clarity fields now store the actual
info** (not just checkmarks), and two **generators** turn an event into communication — a
ready-to-send parent email draft and a leader run sheet. The People layer is full CRUD with
linked records kept in sync. Backup/restore shipped. What stands between this and charging money
is the v1.0 backend (auth + sync + billing) — the business case for that is now written in
`business/LAUNCH-PLAN.md`.

### Session 004 — June 10, 2026 (v0.9)

- **Clarity details** (`details` on MinistryEvent, `ClarityDetails` type): tapping a clarity field
  opens an inline editor — save the actual info ("4:30 PM at the main lot"), mark covered without
  a note, or mark not covered. Values show under each field and feed the generators.
- **Parent update generator** (`draftParentUpdate` in helpers): emoji-lined email draft from the
  event's details; needed-but-missing fields become `[TODO — fill in before sending]` lines.
  **Leader run sheet** (`draftLeaderBriefing`): team roster w/ gaps, outstanding checklist, key
  info, notes. Both open in an editable textarea modal with copy-to-clipboard ("Communicate" card
  on event detail).
- **People layer is real now**: PeopleView rewritten with add/edit/delete for students, parents,
  leaders, and groups (`components/PeopleForms.tsx`). Student↔group and student↔parent links sync
  both directions on every save; deletes cascade safely. Follow-up flags clear with one tap from
  the dashboard ("✓") or People view ("Done ✓"). People persist (`youthos:v2:*` keys).
- **Backup & restore** (`components/SettingsModal.tsx`, `lib/storage.ts`): download a JSON backup,
  restore from file, reset sample data — from "Data & settings" (sidebar + mobile header gear).
- Smaller: volunteer "needed" editable inline; "+ Add event this day" on the calendar; storage
  schema v2 with silent v1 migration; version → 0.9.0.
- **`business/LAUNCH-PLAN.md` (new):** pricing (free Solo / $12-mo-annual Pro / $24-mo-annual Team,
  $99/yr × 25 founding members), sober revenue math, 4-phase marketing plan hooked on the Parent
  Clarity Score, metrics, and a pre-launch checklist.
- Verified in browser end-to-end on a cleared profile: clarity detail save (score 70→80%, value
  persisted), parent draft contained the saved detail + TODOs, student add persisted + rendered,
  zero console errors. `npm run build` passes.

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

- **Sample-data drift after first persist** — by design; "Reset sample data" (Data & settings)
  restores a relative-dated demo set. Real user data is unaffected.
- Single-device by nature (localStorage) until the v1.0 backend — mitigated by backup/restore.
- Contact-person clarity defaults to true in some sample events, so the parent draft can show
  "[your name + number]" even at high clarity — fill the detail once per event.
- Live site is on Vercel's default URL; custom domain undecided (ideas in LAUNCH-PLAN).

## Next recommended steps

1. **v1.0 backend** (the money gate, per `business/LAUNCH-PLAN.md`): Supabase auth + cloud sync +
   RLS security pass (student data = minors), then Stripe billing. Suggested path: a `backend`
   branch, incremental — auth → sync events/tasks → sync people → billing.
2. **Domain + landing page + waitlist** can start immediately — doesn't depend on the backend.
3. Housekeeping: connect the GitHub repo to the Vercel project for auto-deploys
   (dashboard → Settings → Git); until then `npx vercel deploy --prod --yes` after pushes.
