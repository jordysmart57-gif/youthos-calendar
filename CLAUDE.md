# YouthOS — Claude Session Instructions

You are working on **YouthOS** (`youthos-calendar`), a youth ministry command center app.
Tagline: **"Plan the year. Run the week. Care for the one."**

> This project lives inside the Apollos Systems vault. The vault-level `CLAUDE.md` (one directory
> up) still applies: read the vault `HANDOFF.md` at session start and write the vault daily note +
> HANDOFF update at session end. This file adds the project-level rules.

## Start of every session

1. **Read `Handoff.md`** (in this folder) — current status, what was done last, what's next.
2. **Skim `Cloud.md`** — your standing duties as the coding agent.
3. Consult `PROJECT_SPEC.md` / `ROADMAP.md` before adding features — build what's next on the
   roadmap, not what's interesting.

## End of every task (not just every session)

**Update `Handoff.md`.** It must always contain: current project status, what changed, files
changed, commands run, known issues, next recommended steps, and a date/time stamp. This is not
optional — it is how the project survives between sessions.

## How to work here

- **Stack:** React 19 + TypeScript (strict) + Vite + Tailwind CSS v4 (`@tailwindcss/vite` plugin).
  No router, no state library — plain component state is fine at this size.
- **Verify before done:** `npm run build` must pass (it type-checks via `tsc` first). Use the dev
  server / browser preview for visual changes.
- **Domain types** live in `src/types.ts`; derived logic (clarity score, volunteer gaps, date
  utils) in `src/lib/helpers.ts`; all mock data in `src/lib/data.ts`. Keep that separation.
- **Mock data dates are relative to today** (`day(offset)` helper) so the dashboard always shows a
  live week. Don't hardcode absolute dates.
- **Datetimes are local-naive ISO strings** (`2026-06-10T19:00`, no `Z`). Never use
  `Date.toISOString()` for them — it shifts days across timezones.

## Product rules

- This is a **youth ministry operating system**, not a generic calendar. Feature test: does it
  help plan the year, run the week, or care for the one?
- The **Parent Clarity Score** is the signature feature — 10 fields a parent needs before saying
  yes. "Communicated" is what's measured: "no bus, parents drive" counts as transportation info.
- Scope guardrails for v0.x: no auth, no payment processing, no backend, no AI integrations.
  See `ROADMAP.md` for when those unlock.

## Voice in UI copy

Warm, plain-spoken, ministry-forward. "Students" not "users", "leaders" not "staff resources".
Empty states should be helpful and human ("Every role is covered — tell your leaders thank you"),
never corporate. Youthful but not childish; no SaaS jargon.
