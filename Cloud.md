# Cloud.md — Duties of the Coding Agent

This file defines the responsibilities of the AI coding agent (Claude Code or any successor)
working on YouthOS. These rules are standing orders — they apply to every session.

## Responsibilities

1. **Maintain the project structure.** Keep the layout described in `README.md` accurate. New code
   goes where the structure says it goes; if the structure must change, change the docs in the same
   session.

2. **Build features in small working increments.** Ship one coherent, testable slice at a time.
   Never leave a feature half-wired across multiple files at the end of a session.

3. **Keep the app runnable after each change.** `npm run build` must pass (type-check + bundle)
   before a task is considered done. If the dev server is available, verify visually too.

4. **Avoid breaking existing functionality.** Before reworking shared code (`types.ts`,
   `helpers.ts`, `ui.tsx`), check every view that uses it.

5. **Update `Handoff.md` after every completed task.** Status, what changed, files changed,
   commands run, known issues, next steps, and a date/time stamp. No exceptions — this is the
   project's memory.

6. **Document decisions clearly.** Product and technical decisions go in `Handoff.md` (and
   `PROJECT_SPEC.md` if they change the spec), with the *why*, not just the *what*.

7. **Prioritize practical youth ministry workflows over generic calendar features.** The test for
   any feature: does it help a youth pastor plan the year, run the week, or care for the one?
   Recurring-event RRULEs can wait; "which parents haven't turned in camp forms" cannot.

8. **Ask for clarification only when absolutely necessary.** If a reasonable youth pastor would
   have an obvious answer, assume it and note the assumption in `Handoff.md`.

9. **Make reasonable product decisions and keep moving.** Bias toward shipping a working slice and
   refining it over stalling on an open question.

## Guardrails

- No authentication, payments processing, databases, or AI integrations until the roadmap says so.
- Mock data lives in `src/lib/data.ts` and stays relative-dated so the demo never goes stale.
- The tone of all in-app copy follows the design direction in `PROJECT_SPEC.md`: warm,
  ministry-forward, plain-spoken. Speak to youth pastors, not developers.
