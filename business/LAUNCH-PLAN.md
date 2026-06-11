# YouthOS — Pricing & Launch Plan

*Drafted June 10, 2026. Companion to `ROADMAP.md` — the pricing switch flips at the v1.0 backend
release. Competitor prices below are ballparks from memory; verify current pricing before
publishing any comparison.*

---

## 1. The market in one paragraph

Youth pastors run the most logistics-heavy ministry in the church — camps, trips, weekly
programming, fundraisers, 50 parents asking "what time is pick-up?" — and nobody builds for them.
Church management systems (Planning Center ~$14+/mo per module, Breeze ~$72/mo flat, ChurchTrac,
Tithe.ly) manage the *whole church's* database and treat youth as a checkbox. Youth-specific
companies (Download Youth Ministry, YM360, Grow) sell **curriculum and games**, not operations.
The actual youth ministry ops stack today is: a spreadsheet, a group text, a Google Doc packing
list, and the youth pastor's memory. That's the competition — and it's beatable.

**Positioning:** YouthOS is not a ChMS and not curriculum. It's the *operations layer* for one
ministry: **"Plan the year. Run the week. Care for the one."**

**The marketing hook is the Parent Clarity Score.** Every youth pastor feels this pain weekly,
and no other product has named it. The pitch writes itself: *"Parents aren't frustrated because
you do too much or too little. They're frustrated because they find out too late. YouthOS scores
every event on the ten things a parent needs to know — and writes the email for you."*

## 2. Pricing

### Principles

1. **Cheap enough to skip the board meeting.** Youth pastors have small discretionary budgets
   (often a card with a ~$50–100/mo leash). Price where they can say yes alone.
2. **Charge for sync and collaboration, not for care.** Student follow-up features are never
   paywalled — that's both the mission and the goodwill engine.
3. **Annual-first.** Churches budget annually and love invoices. Push the yearly price everywhere.
4. **Don't charge until it syncs.** Today's localStorage app is a great free product and a bad
   paid one. Money flips on at v1.0 (accounts + cloud sync).

### Tiers

| | **Solo** | **Pro** | **Team** |
|---|---|---|---|
| Price | **Free forever** | **$12/mo billed yearly ($144)** or $15 monthly | **$24/mo billed yearly ($288)** or $29 monthly |
| For | Trying it / tiny ministries | The solo youth pastor | Youth pastor + leader team |
| Everything in the app (events, clarity, people, tasks, templates, generators) | ✅ | ✅ | ✅ |
| Devices / storage | One browser, manual JSON backup | Cloud sync, all devices, automatic backups | Everything in Pro |
| Leader access | — | 3 leader logins (view + check off) | Unlimited leaders + roles |
| Ministries | 1 | 1 | Multiple (MS/HS/college split views) |
| Parent-facing event page (later) | — | ✅ | ✅ |
| Support | Community | Email | Priority + onboarding call |

**Founding Members:** first 25 churches get Pro at **$99/yr locked for life**, a direct line to
Jordan, and their fingerprints on the roadmap. Scarcity is real (support capacity), the discount
is meaningful, and 25 paying churches = the strongest possible launch proof.

### Revenue math (sober version)

| Milestone | Mix | MRR |
|---|---|---|
| Founding cohort full | 25 × $99/yr | ~$206 |
| End of year 1 (realistic) | 60 Pro + 10 Team | ~$960 |
| End of year 2 (good execution) | 200 Pro + 40 Team | ~$3,360 |

This is a calm, compounding side business that also feeds Apollos Systems leads — not a rocket.
Costs stay near zero until scale (Vercel + Supabase free/low tiers, Stripe takes ~3%). The
realistic year-1 win condition: **100 churches using it weekly, 70 paying, near-zero churn.**

## 3. Marketing plan

### Phase 0 — Dogfood & foundation (now → ~30 days)

- **Use it at TFAB every week.** Every screenshot, parent email, and run sheet is future content.
  Fix what annoys you — you are the ICP (ideal customer profile).
- **Buy the domain** (try youthos.app, getyouthos.com, youthos.church) and put up a one-page site:
  hook, 3 screenshots, demo link (the live Vercel app with sample data IS the demo), email
  waitlist. Formspree/ConvertKit free tier.
- Start a swipe file: every time a parent asks a question the app would have answered, write it down.

### Phase 1 — Founding 25 (days 30–120, gated on v1.0 backend)

- Recruit by hand, warm first: Central Oregon youth pastor network, denominational contacts,
  camp networks (you'll meet 30 youth pastors at Camp Tadmor week), seminary friends.
- The ask is specific: *"$99/yr, locked forever, and you get me on text. Help me build the thing
  we all needed."*
- Monthly 30-minute "office hours" Zoom with the cohort. Ship what they ask for. Collect
  testimonials and screenshots with permission.

### Phase 2 — Content engine (days 90–270)

Youth pastors trust peers and free stuff, not ads. Lead with generosity:

- **Lead magnets from what already exists:** the 12 event templates become free PDF checklists
  ("The Complete Camp Planning Checklist"), the clarity fields become "The 10 Things Every Parent
  Email Needs" one-pager. Gate behind email.
- **Short-form video:** 30–60s screen recordings — "watch YouthOS write my Lake Day parent email."
  The Parent Clarity Score going from 40% red to 100% green is inherently satisfying footage.
- **Where they gather:** youth ministry Facebook groups, r/youthministry, the DYM community,
  denominational youth networks. Be helpful first, link second.
- **Podcast guesting:** youth ministry podcasts are small, friendly, and always need guests. The
  story ("youth pastor builds the tool he needed") is a natural episode.

### Phase 3 — Scale channels (270+ days)

- **Referral program:** give 2 months / get 2 months. Youth pastors travel in packs (networks,
  camps, conferences).
- **Conferences:** attend NYWC (National Youth Workers Convention) year one; booth year two if
  the math supports it.
- **Partnership exploration:** DYM marketplace, camps (Tadmor-style camps could bundle YouthOS for
  their partner churches), denominational youth offices.
- **The Apollos flywheel:** every YouthOS church is a warm lead for Apollos Systems custom
  automation (and vice versa). Bigger churches that outgrow YouthOS become Apollos clients.

### Messaging cheat-sheet

- Tagline: **Plan the year. Run the week. Care for the one.**
- Hook: *"Your parents aren't frustrated. They're uninformed. Fix it in one tap."*
- Differentiator: built BY a youth pastor — not a church database with a youth tab.
- Never say: platform, ecosystem, leverage, solution. Say: youth group, parents, camp, week.

### Metrics that matter (in order)

1. Weekly active churches (a church that opens it weekly will pay)
2. Parent updates generated per week (the killer-feature pulse)
3. Free → paid conversion after v1.0
4. Churn (church software churn is famously low — keep it that way)
5. MRR

## 4. Pre-launch checklist

- [ ] v1.0 backend: Supabase auth + sync, RLS security pass (student data = minors — see
      PROJECT_SPEC privacy note), Stripe billing
- [ ] Domain + landing page + waitlist
- [ ] Privacy policy & terms (plain-English; "church data stays church data")
- [ ] 3 testimonials from founding cohort
- [ ] Demo video (2 min) + 5 short clips
- [ ] Onboarding: sample data → "add your real ministry" flow
- [ ] Business plumbing: LLC (Apollos Systems umbrella), Stripe account, simple bookkeeping
