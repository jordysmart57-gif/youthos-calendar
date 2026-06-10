# YouthOS

> **Plan the year. Run the week. Care for the one.**

YouthOS is a youth ministry command center — not a generic calendar. It's built around how a youth
pastor actually works: planning the ministry year, running weekly youth group, building events,
communicating with parents, scheduling volunteers, and following up with students one at a time.

## What's inside

| View | What it does |
|------|--------------|
| **Home Dashboard** | This week in youth ministry, upcoming events, urgent tasks, volunteer gaps, parent clarity issues, student care list |
| **Calendar** | Month view with category filters: Middle School, High School, Leaders, Parents, Camps/Trips, Bible Studies, Deadlines, Promo Tasks |
| **Event Command Center** | Every event with status, registration, volunteer needs, forms / payments / transportation / parent-comms tracking, checklist progress, and a Parent Clarity Score |
| **People** | Students, parents, leaders, new students, follow-up-needed list, small groups |
| **Tasks** | Event prep, communication, shopping, volunteer follow-up, parent follow-up, student care |
| **Templates** | 12 ready-to-run event blueprints (Camp, Lake Day, Tribe Night, Mission Trip, …) with default checklists and lead times |

### The Parent Clarity Score

The signature idea. Every parent-facing event is scored 0–100% on whether it answers the ten
questions a parent needs answered before saying yes: date, time, drop-off location, pick-up time,
cost, food info, forms, contact person, transportation, and packing list. "No bus — parents drive"
counts as transportation info; the score measures *communication*, not logistics.

## Stack

- **React 19 + TypeScript** — strict mode
- **Vite** — dev server and build
- **Tailwind CSS v4** — via the `@tailwindcss/vite` plugin
- **Local mock data** — no backend, no auth, no database (yet, by design — see `ROADMAP.md`)

Mock data is dated *relative to today*, so the dashboard always shows a live, realistic week.

## Getting started

```bash
npm install
npm run dev       # → http://localhost:5173
npm run build     # type-check + production build
```

## Project documents

- `PROJECT_SPEC.md` — full product spec: vision, modules, data model, scoring rules
- `ROADMAP.md` — versioned plan from this mock v0.1 to a real multi-church product
- `Handoff.md` — **the living state of the project.** Read it first, update it after every work session
- `Cloud.md` — the coding agent's duties and operating rules
- `CLAUDE.md` — session instructions for AI coding sessions in this repo

## Project structure

```
youthos-calendar/
├── index.html
├── public/youthos.svg
└── src/
    ├── main.tsx, App.tsx, index.css
    ├── types.ts              ← all domain types
    ├── lib/
    │   ├── data.ts           ← mock events, people, tasks, templates
    │   └── helpers.ts        ← clarity scoring, date utils, display metadata
    ├── components/ui.tsx     ← Badge, Card, ProgressBar, Chip, Avatar, EmptyState
    └── views/                ← Dashboard, Calendar, Events, People, Tasks, Templates
```
