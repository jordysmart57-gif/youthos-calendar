# YouthOS — Roadmap

Each version must leave the app runnable and demoable. Ship small, keep it working.

## ✅ v0.1 — The Command Center

Mock-data dashboard that feels like a real youth ministry operating system.

- Home dashboard: this week, upcoming, urgent tasks, volunteer gaps, parent clarity issues, student care
- Month calendar with 8 category filters
- Event Command Center: status, registration, volunteers, 4 ops tracks, checklists, clarity score
- People layer: students / parents / leaders / new / follow-up / small groups
- Tasks across 6 ministry categories
- 12 event templates with checklists + lead times
- Relative-dated mock data so the demo never goes stale

## ✅ v0.2 — Make It Editable

The jump from demo to tool.

- ✅ **Create event from template** — pick a template, get a prefilled form (date defaults to the
  template's lead time), checklist + volunteer roles + clarity requirements seeded automatically
- ✅ Add/edit/delete events; add/delete tasks; add/remove/toggle checklist items
- ✅ Edit clarity fields per event (tap a field to mark it communicated) and tap-to-cycle the four
  ops tracks; steppers for registration count and volunteer confirmations; add/remove volunteer roles
- ✅ **localStorage persistence** (`youthos:v1:*` keys) with a "Reset sample data" escape hatch
- ✅ Quick-add task from anywhere (sidebar button on desktop, floating button on mobile)

## ✅ v0.9 — Release Candidate (current)

Everything a solo youth pastor needs to run the ministry from one place, on one device.

- ✅ **Clarity fields hold the actual info** ("Pick-up: 4:30 PM at the main lot"), not just checkmarks
- ✅ **Parent update generator** — a ready-to-send email draft built from the event's details;
  anything missing becomes a [TODO] line
- ✅ **Leader run sheet generator** — one-page briefing: team, outstanding checklist, key info, notes
- ✅ **People layer fully editable** — add/edit/delete students, parents, leaders, and small groups,
  with two-way links (student↔group, student↔parent) kept in sync and cascade-safe deletes
- ✅ Follow-up workflow: flag with a reason, clear from the dashboard or People view ("Done ✓")
- ✅ Volunteer "needed" counts editable; add event directly on a calendar day
- ✅ **Backup & restore** — download/import a JSON backup from Data & settings; reset sample data

## v1.0 — Real Data, Real Church (the backend release)

This is the release that unlocks charging money — see `business/LAUNCH-PLAN.md`.

- Backend + database (Supabase is the natural fit): auth, cloud sync, automatic backups
- Multi-leader access with roles (pastor edits, leaders view/check off)
- Security pass: RLS policies, minor-data privacy review (student data is sensitive), data export/delete
- Stripe billing (Pro/Team plans per the launch plan)
- Landing page + onboarding flow

## Later / ideas parking lot

- Attendance quick-entry (powers the "missed 3 weeks" flag for real) + student care log history
- Volunteer scheduling grid by week; background-check expiry warnings on the dashboard
- Week-ahead summary view; print/export-friendly views
- Recurring events done properly
- Parent-facing public event page generated from clarity details
- SMS/email sending integrations
- Year-at-a-glance planning view with template lead-time back-scheduling
- Planning Center import/sync (people + registrations)
- AI assists: draft parent updates in your voice, suggest checklists, flag at-risk students
- Multi-church admin (the Apollos Systems product play)

## Non-goals (firm)

- Payment processing
- Replacing the church management system / check-in system
- Social features for students
