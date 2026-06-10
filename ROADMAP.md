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

## ✅ v0.2 — Make It Editable (current)

The jump from demo to tool.

- ✅ **Create event from template** — pick a template, get a prefilled form (date defaults to the
  template's lead time), checklist + volunteer roles + clarity requirements seeded automatically
- ✅ Add/edit/delete events; add/delete tasks; add/remove/toggle checklist items
- ✅ Edit clarity fields per event (tap a field to mark it communicated) and tap-to-cycle the four
  ops tracks; steppers for registration count and volunteer confirmations; add/remove volunteer roles
- ✅ **localStorage persistence** (`youthos:v1:*` keys) with a "Reset sample data" escape hatch
- ✅ Quick-add task from anywhere (sidebar button on desktop, floating button on mobile)

## v0.3 — Communicate

Turn clarity data into actual parent communication.

- **Parent update generator**: compose a parent email/text draft from an event's clarity fields —
  the missing-field list becomes the editing checklist
- **Leader briefing generator**: one-page run sheet per event (schedule, volunteers, supplies, notes)
- Week-ahead summary view ("what I tell my leaders on Sunday")
- Export/print friendly views

## v0.4 — Volunteers & Care

- Volunteer scheduling grid by week (who serves where, gaps highlighted)
- Background-check expiry warnings on the dashboard
- Student care log: follow-up history per student, not just a flag
- Attendance quick-entry for weekly gatherings (powers the "missed 3 weeks" flag for real)

## v1.0 — Real Data, Real Church

- Backend + database (Supabase is the natural fit) with auth
- Multi-leader access with roles (pastor edits, leaders view/check off)
- Form + payment *status* tracking against real rosters (still not processing payments)
- Planning Center import/sync exploration (people + registrations)

## Later / ideas parking lot

- Recurring events done properly
- Parent-facing public event page generated from clarity fields
- SMS/email sending integrations
- Year-at-a-glance planning view with template lead-time back-scheduling
- AI assists: draft parent updates, suggest checklists, flag at-risk students
- Multi-church (this is where it becomes an Apollos Systems product)

## Non-goals (firm)

- Payment processing
- Replacing the church management system / check-in system
- Social features for students
