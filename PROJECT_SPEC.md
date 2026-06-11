# YouthOS — Project Spec

**Tagline:** Plan the year. Run the week. Care for the one.

## Vision

Youth pastors run a surprisingly complex operation — a year-long calendar of camps, trips, weekly
gatherings, fundraisers, and parent meetings — usually out of a spreadsheet, a group text, and
their own memory. Generic calendars track *when* things happen. YouthOS tracks *whether the
ministry is ready*: are the forms in, is the bus booked, do parents actually know the pick-up
time, who's covering check-in, and which student quietly stopped showing up three weeks ago.

The three jobs in the tagline:

1. **Plan the year** — the annual calendar, event templates with realistic lead times, deadlines.
2. **Run the week** — this week's gatherings, urgent tasks, volunteer gaps, shopping runs.
3. **Care for the one** — new students, follow-ups, the kid whose parents are separating.

## Primary user

A youth pastor or youth director (often part-time, often also the bus driver). Secondary users
later: volunteer leaders (read-mostly), admins. v0.x is single-user with no auth.

## Modules

### 1. Home Dashboard
The morning briefing. Shows: this week's events, upcoming events, urgent tasks (urgent priority or
due/overdue), volunteer gaps across upcoming events, parent clarity issues (parent-facing events
scoring < 80%), and the student care list. Four stat cards: events this week, open tasks,
volunteer gaps, average parent clarity.

### 2. Calendar
Month grid, category-filterable. Eight categories with fixed colors: Middle School (sky),
High School (violet), Leaders (emerald), Parents (rose), Camps/Trips (amber), Bible Studies
(teal), Deadlines (red), Promo Tasks (fuchsia). Deadlines and promo tasks are first-class calendar
items because that's how youth pastors actually plan backwards from an event. Tapping a day shows
its agenda.

### 3. Event Command Center
The heart of the app. Every event carries:
title, date/time, location, target group, lifecycle status
(planning → promoting → registration-open → confirmed → complete), registration count (+ optional
capacity), volunteer needs (role / needed / confirmed), four operational tracks — **forms,
payments, transportation, parent communication** — each not-started / in-progress / complete / n.a.,
a checklist with progress, free-form notes, and the Parent Clarity Score.

### 4. People Layer
Students (grade, school, small group, new-student flag, follow-up flag + reason), parents (linked
students, contact, engagement level), leaders (role, assignments, background-check status —
expired checks get flagged), small groups (leader, night, roster). Views: Students / Parents /
Leaders / New Students / Follow-up Needed / Small Groups.

### 5. Tasks
Six categories matching real youth ministry work: Event Prep, Communication, Shopping, Volunteer
Follow-up, Parent Follow-up, Student Care. Tasks have due dates, priorities (urgent/high/normal),
and optional event links. Urgent + overdue tasks surface on the dashboard.

### 6. Parent Clarity Score
Each parent-facing event is scored on ten boolean fields — equal weight, score = filled/10:

Date · Time · Drop-off location · Pick-up time · Cost · Food info · Forms · Contact person ·
Transportation · Packing list

**Scoring rule:** a field is true when the information has been *communicated to parents*, not
when logistics are solved. "No bus — parents drive both ways" = transportation ✓. Internal events
(leader meetings, deadlines, promo tasks) are `parentFacing: false` and excluded from scoring and
dashboard clarity alerts. Bands: ≥80% green, 60–79% amber, <60% red.

### 7. Event Templates
Twelve blueprints: Weekly Youth Group, Camp, Retreat, Lake Day, Parent Meeting, Leader Meeting,
Service Project, Fundraiser, Tribe Night, Bible Study, Mission Trip, Graduation Night. Each has a
description, lead time in weeks, default checklist, typical volunteer roles, and which clarity
fields parents will need. v0.1 displays them; v0.2 creates events from them.

## Data model

See `src/types.ts` — it is the spec for data. Key conventions:

- Datetimes are **local-naive ISO strings** (`2026-06-10T19:00`). No timezone math in v0.x.
- Mock data (`src/lib/data.ts`) is **relative-dated** from today so the demo always shows a live week.
- All derived values (clarity score, volunteer gap, checklist %) are computed in
  `src/lib/helpers.ts`, never stored.

## Design direction

Clean, warm, youthful-but-not-childish, ministry-forward, mobile-first, fast. Card-based
dashboard; clear labels; status badges; progress bars; helpful, human empty states. Not corporate,
not a church database, not a social app.

- Type: Plus Jakarta Sans, heavy weights for headings.
- Surface: warm cream background (`#faf6f0`), white cards, warm ink (`#2b2018`).
- Brand accent: warm gold-orange (`brand-600 #c97615`) — used sparingly; category colors do the
  wayfinding.
- Mobile: bottom tab bar; desktop: top nav pills. Single column stacks first, two columns at `lg`.

## Current scope (v0.9 — release candidate)

In: all seven modules fully editable and persistent (localStorage, `youthos:v2:*` keys).
Clarity fields carry the **actual info** (`details` on the event), and two generators turn an
event into communication: a parent update email draft (missing info becomes [TODO] lines) and a
leader run sheet. The People layer is real CRUD with two-way links (student↔group,
student↔parent) kept in sync and cascade-safe deletes. Backup/restore via JSON download/import
in Data & settings.

Out (deliberately, until v1.0): auth, cloud sync/backend, billing, notifications, sending email/
SMS directly, AI. The product gate for charging money is the backend release — see `ROADMAP.md`
and `business/LAUNCH-PLAN.md`.

**Privacy note for v1.0:** student records are data about minors. When the backend lands, this
spec requires row-level security, minimal collection (no birthdays/addresses unless needed),
export + delete-everything controls, and a plain-English privacy promise. "Church data stays
church data."
