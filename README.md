This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# ================================

# Starter Kit — Setup Guide

Shared engine every dealership site is built on. One deploy per dealership,
cloned from this repo. This doc explains what each piece is, why it exists,
and how to set it up.

---

## 1. Initialize a new project

```
npx create-next-app@latest [dealership-slug] --js --tailwind --eslint --app --no-src-dir
cd [dealership-slug]
```

Install the rest of the stack:

```
npm install lucide-react gsap react-hook-form zod @hookform/resolvers
npm install libphonenumber-js
npm install @sentry/nextjs
npm install @vercel/speed-insights
npm install --save-dev prettier eslint-config-prettier
npm install --save-dev vitest
```

Run the Sentry wizard (see section 6 for exact prompts/answers):

```
npx @sentry/wizard@latest -i nextjs
```

---

## 2. Folder structure — what goes where and why

```
next.config.mjs      security headers + CSP, static — DONE
ACCESSIBILITY.md      design-time checklist, not automated — DONE
PERFORMANCE.md          design-time checklist, not automated — DONE
TERMS_OF_SERVICE_TEMPLATE.md   structure only, needs real legal review — DONE
/app
  layout.jsx          root layout: GA4, metadata, structured data, Speed Insights, font loading (hand-set per project) — DONE
  page.jsx             THIS dealership's actual page — real JSX, hand-assembled (per-project, never generic)
  not-found.jsx          404 page — DONE
  error.jsx               catches errors within route segments — DONE
  global-error.jsx          catches errors in the root layout itself — DONE
  globals.css            Tailwind v4 @theme inline wiring — DONE
  sitemap.js            native Next.js sitemap.xml — DONE
  robots.js               native Next.js robots.txt — DONE
  api/lead/route.js         form submit handler — DONE
/components
  /sections            REFERENCE LIBRARY — foundations you copy & customize
    Contact.jsx            first real entry — working lead form — DONE
    Hero/About/Inventory/Location/Footer.jsx   still stubs
  /ui                    small reusable primitives shared as-is — ALL DONE
    WhatsAppButton.jsx, FloatingWhatsApp.jsx, Button.jsx, Input.jsx, TextArea.jsx
/lib
  whatsapp.js           wa.me link builders — DONE
  sheets.js               Google Sheets POST helper, shared-secret auth — DONE
  analytics.js             GA4 event wrapper — DONE
  seo.js                     builds Metadata object from config — DONE
  structuredData.js            JSON-LD AutomotiveBusiness schema — DONE
  validators.js                  Zod schemas (phone via libphonenumber-js) — DONE
/hooks
  useLeadForm.js         lead form behavior: validation, honeypot, phone, submit, redirect — DONE
  useGsapAnimation.js      deferred — build when a real design needs it, not speculatively
/config
  site.config.js          infrastructure values only — DONE
/scripts
  setup-firewall.sh        stages Vercel Firewall rules — DONE
  apps-script-template.gs   Google Apps Script counterpart for lib/sheets.js — DONE
  validate-config.mjs        pre-deploy config sanity check, now includes WCAG contrast check — DONE
/tests
  /lib                       mirrors lib/'s structure, but this is INSIDE /tests —
    whatsapp.test.js           a completely separate folder from the real /lib above
    validators.test.js           vitest unit tests for lib/ pure functions — DONE
    analytics.test.js
vitest.config.mjs      test runner config — DONE
/public
  favicons, og-image
```

**The key distinction that changes how you work in this kit:**

- `/lib`, `/hooks`, `/components/ui`, `/config` → truly shared. Copy into
  every new project unchanged (or nearly unchanged).
- `/components/sections` → a **visual reference library**, not a runtime
  component system. Pick the style that fits the dealership's brand, copy it
  into that project, and edit it directly — layout, spacing, font sizing,
  structure. If nothing fits, build a new one and add it back to the library.
- `app/page.jsx` → never generic. Hand-written real JSX per dealership,
  importing that project's own customized section components.
- `app/layout.jsx` → shared, **except the font-loading block**, which is
  hand-edited per project (see section 4).

---

## 3. `config/site.config.js` — what it is and isn't

Holds only genuinely cross-cutting, non-design values:

- Dealership identity (name, legal name, slug)
- Contact info — CTA WhatsApp number and form/sales WhatsApp number are
  tracked separately on purpose (see section 5)
- Social links
- Brand color tokens — defaults, not constraints
- SEO metadata, i18n settings, service model flag
- Analytics/monitoring IDs

**Does NOT hold:**
- Page copy — write it directly in the JSX
- Section enable/order/variant switches — decided by what you import in
  `page.jsx`
- Fonts — see section 4
- The Google Sheets endpoint AND secret — both live in `.env.local`
  (per-deploy values, not design values; see section 5 and
  `scripts/apps-script-template.gs`)

---

## 4. Fonts — hand-set per project, not config-driven

`next/font/google` requires font names/weights to be literal static values
at build time — it can't read a config variable. So font choice lives
directly in `app/layout.jsx`, edited per project:

1. Pick the actual font(s) the dealership's design needs — any Google Font,
   any weight/style it actually offers, or a custom file via
   `next/font/local`. Not limited to a display/body pair.
2. Check which weights the font actually ships on fonts.google.com before
   setting `weight: [...]` — requesting a weight it doesn't have won't
   error, it silently drops and the browser synthesizes/falls back, which
   is a worse failure mode than just checking first.
3. Keep the `variable` CSS property (`--font-display`, `--font-body`) so
   Tailwind can reference fonts consistently regardless of which actual
   font is loaded underneath.

This trades a small amount of per-project editing for zero architectural
ceiling on design — any font, any source, any weight combination.

**Tailwind v4 note:** the `variable` names used in `next/font` calls
(`--next-font-display`, `--next-font-body`) are intentionally different
from the Tailwind-facing utility names (`font-display`, `font-body`)
declared in `app/globals.css`'s `@theme inline` block. See that file's
comment for why — same pattern used for brand colors.

---

## 5. WhatsApp flow — how it's wired

Two flows, both click-to-send, no WhatsApp Business API:

1. **CTA / floating button** — `lib/whatsapp.js` → `buildCtaLink(config)`
   builds a `wa.me` link from `contact.whatsapp.ctaNumber` +
   `ctaDefaultMessage`. The button component fires an analytics event
   (`ANALYTICS_EVENTS.WHATSAPP_CTA_CLICK`) via `onClick`, then lets the
   browser's native `<a href>` navigation proceed — no `preventDefault()`.
2. **Contact form** (`hooks/useLeadForm.js` + `components/sections/Contact.jsx`)
   — client-side: React Hook Form + Zod (`leadFormSchema`) validate every
   field except phone, which is handled separately via `libphonenumber-js`
   (a country dropdown + local number, combined via
   `parsePhoneNumberFromString()` into a correct E.164 number — this
   properly strips country-specific quirks like a leading trunk `0`,
   which a naive string concatenation would get wrong). On submit →
   POST `/api/lead`:
   - Rejects oversized payloads before parsing (`MAX_BODY_BYTES` guard)
   - Re-validates server-side with the same Zod schema (phone validated
     via `libphonenumber-js/min`'s `isValidPhoneNumber`, expects the
     full E.164 string with leading `+`)
   - Rejects requests whose Origin/Referer clearly points to another site
     (doesn't block requests with both headers simply absent — some
     privacy browsers strip them even for legitimate submissions)
   - Checks the honeypot field (see below)
   - Submits to Google Sheets (`lib/sheets.js`) — authenticated via a
     shared secret sent in the JSON body (Apps Script can't read custom
     HTTP headers, see `scripts/apps-script-template.gs`). Retries
     twice, and if it still fails, logs to Sentry and **does not block
     the response**. Sheets is a backup record, not the primary
     conversion path, so its failure should never stop the visitor from
     reaching the dealership.
   - Builds the WhatsApp redirect link (`lib/whatsapp.js` →
     `buildFormLink`). If this fails (misconfigured number), the request
     *does* fail loudly — that's a real dead end, not a backup failure.
   - The whole handler is wrapped in a catch-all try/catch, so an
     unexpected error always returns valid JSON + logs to Sentry, never an
     unhandled crash.
   - Client receives `{ success, redirectUrl, sheetsLogged }` and performs
     the actual WhatsApp navigation itself.

**Honeypot:** the spam-trap field is named `website` in
`lib/validators.js`, not `honeypot` — a field literally called that is a
giveaway a bot can pattern-match and skip. It must stay visually hidden in
the UI (off-screen CSS, not `display: none`, `tabIndex={-1}`,
`autoComplete="off"`) — some bots specifically skip `display: none` fields
because they've learned to detect that pattern.

---

## 6. Sentry setup

**Run once, in the starter kit itself — not per dealership clone.** This
was originally documented as a per-project manual step; corrected here.
Because `initialScope` reads `siteConfig.dealership.slug` dynamically at
runtime, wiring it in once and committing it to the starter kit means
every future clone gets correct per-project tagging automatically the
moment `site.config.js` is filled in — no repeated Sentry code edits.

Run `npx @sentry/wizard@latest -i nextjs` in the starter kit and answer:

| Prompt | Choice | Why |
|---|---|---|
| Enable Tracing | Yes | Free, low overhead, catches slow pages early |
| Enable Session Replay | No | Adds bundle weight; can capture form input, not worth it for a lead-gen brochure site |
| Route through Vercel (tunnel) | Yes | Ad blockers commonly block Sentry's default endpoint — losing error visibility from those visitors defeats the point on a lead-capture site |
| Create example page/route | No | Not needed, verify manually once real code exists |
| Auto-upload source maps | Yes | Otherwise production stack traces are minified garbage |

**Decided: one shared Sentry project** across every dealership deploy —
one dashboard instead of N, Sentry's free tier caps are org-wide
regardless of project count, and — with uptime monitoring (section 7)
also living in that same project — a single dashboard shows live uptime
status for every deployed client site at once, not just shared error
tracking.

**Since every dealership funnels into one shared project, every event
needs a tag identifying which dealership it came from.** Add this once,
in the starter kit, to each `Sentry.init()` call the wizard generates
(`instrumentation-client.js`, `instrumentation.js`, and the edge config
file):

```js
import siteConfig from "@/config/site.config";

Sentry.init({
  dsn: "...", // wizard-generated, leave as-is
  // ...other wizard-generated options, leave as-is...
  initialScope: {
    tags: { dealership: siteConfig.dealership.slug },
  },
});
```

Commit this. It's now part of the starter kit's shared, unedited files —
same category as `lib/`, not something touched per project.

**What actually IS per-clone:**
- `.env.local`: `SENTRY_AUTH_TOKEN` (build-time secret, can't be committed)
  and `NEXT_PUBLIC_SENTRY_DSN` if the DSN is env-driven rather than
  hardcoded by the wizard — check which the wizard produced
- Setting up the dealership's Uptime Monitor in the Sentry dashboard
  (section 7 — this is a dashboard action, not code, so it can't be
  committed/inherited by cloning)

Do NOT add manual `Sentry.init()` calls anywhere the wizard didn't
already put one — only the `initialScope` line was added to the existing
calls.

---

## 7. Uptime monitoring — Sentry's built-in feature, not a separate tool

Decided: use Sentry's own Uptime Monitoring rather than adding a dedicated
uptime service (UptimeRobot, Better Stack, etc).

**Why:** it lives inside the same shared project as error tracking — no
new vendor, no new dashboard. It checks the dealership's homepage every 60
seconds from Sentry's own infrastructure, across multiple regions (avoids
false alarms from one bad regional network hop), and catches non-200
responses, timeouts, and DNS failures. The real advantage over a separate
tool: a downtime alert automatically links to related error traces from
the same time window, so "site is down" and "here's why" show up in one
place instead of two.

**Cost:** 1 monitor included free per Sentry plan; additional monitors are
roughly $1/month each. Each dealership site is a single page, so it's one
monitor per client — cheap at any scale.

**Setup, per dealership project:**
1. In Sentry: Crons & Uptime → Uptime → Create Uptime Monitor
2. URL: the dealership's production homepage (`seo.siteUrl` from
   `site.config.js`)
3. Leave default thresholds (3 consecutive failures to open an issue, 1
   success to resolve) unless a specific dealership needs tighter/looser
   tolerance
4. Notification target: same channel as error alerts, so downtime and
   errors surface the same way

**Known gap, and why it doesn't matter here:** dedicated uptime tools go
deeper — visual regression detection, DNS change alerts, SSL certificate
expiry tracking. Sentry's version is HTTP/DNS/timeout checking only. For a
single-page lead-gen site this gap is minor, and SSL expiry specifically
is a non-issue regardless of which tool is used, since Vercel auto-manages
and renews certificates for custom domains.

---

## 8. Bot / scraper / request-volume protection

Layered, cheapest first:

1. **The page itself is static** — Next.js pre-renders it, so scraping the
   homepage just hits Vercel's CDN cache. No compute cost. The real
   exposure is `/api/lead`, the one route that runs a function and calls
   an external service.
2. **`scripts/setup-firewall.sh`** — stages two Vercel Firewall rate-limit
   rules (lead form specifically, plus a site-wide observability rule),
   both in **log-only mode**. Never auto-publishes, never denies traffic —
   review real data first. Run once per dealership project after
   `vercel link`:
   ```
   ./scripts/setup-firewall.sh
   vercel firewall diff
   vercel firewall publish --yes
   ```
   After a few days of real traffic in Firewall Observability, tighten the
   lead-form rule's action from Log to Rate Limit (or Deny for repeat
   offenders) via the dashboard.
3. **Bot Protection + AI Bots managed rulesets** — dashboard-only, no CLI
   support found. Turn on in Log mode first, same rollout pattern, before
   switching to Challenge.
4. **Don't put Cloudflare (or any reverse proxy) in front of Vercel** — it
   degrades Bot Protection accuracy by hiding real client IPs.
5. **`app/api/lead/route.js` hardening** — payload size guard + catch-all
   error handling, so even a request that does get through can't crash the
   function unhandled. This is a backstop, not the primary defense — the
   firewall layer stopping abusive traffic before it reaches the function
   at all is strictly cheaper.
6. **Honeypot field** (`website`) — catches unsophisticated bots for free.
   Vercel BotID exists as a future option for more advanced form-spam
   protection if needed — not built yet, not urgent.
7. **Origin/Referer check on `/api/lead`** — rejects requests whose
   Origin/Referer clearly points to another site (e.g. a script on
   someone else's page posting directly to this endpoint). Doesn't block
   requests with both headers simply absent, to avoid false-positiving
   privacy-focused browsers that strip them.
8. **Google Sheets endpoint authentication** — a shared secret, set once
   per dealership and matched on both sides (`.env.local` and the Apps
   Script's Script Properties — see `scripts/apps-script-template.gs`).
   Without this, the Sheets endpoint accepted requests from anyone who
   had the URL, since Apps Script Web Apps deployed as "Anyone" have no
   built-in request authentication.

---

## 9. Security headers & Content-Security-Policy

**MERGE this into your existing `next.config.mjs`, don't replace it.**
The Sentry wizard (section 6) already generates this file with
`withSentryConfig`, your org/project slugs, `tunnelRoute`, and webpack
options — overwriting it wholesale deletes all of that, silently
breaking source map uploads and the ad-blocker tunnel workaround.
Only the `headers()` function and `poweredByHeader: false` get added
into the inner `nextConfig` object, before it's passed to
`withSentryConfig` — everything the wizard generated stays untouched.

All set statically — `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Strict-Transport-Security`, `Permissions-Policy`,
`Content-Security-Policy`, and `poweredByHeader` disabled. Genuinely
shared, shouldn't need per-project edits (the CSP already reads
`site.config.js` to conditionally include GA4's domains only when
analytics is actually enabled for that project).

**Why CSP uses `'unsafe-inline'` for scripts instead of a per-request
nonce — a deliberate trade-off, not an oversight:** a real nonce-based
CSP requires middleware generating a fresh value on every request, which
forces Next.js to treat the page as request-dependent and drop static
pre-rendering entirely — directly undoing the "static page, no compute
cost, resilient to scraping" property this project intentionally chose
(see section 8). That cost isn't justified here: there is no page
anywhere in this app that renders back untrusted or user-submitted
content (the lead form's data only ever reaches Google Sheets and a
WhatsApp message string, never back into a rendered page), and the only
inline script on the entire site is the GA4 init snippet written by us,
not influenced by any visitor input. Nonces earn their cost on sites
that render untrusted data back to users; this one structurally can't.
**If a future dealership site design changes this** — e.g. a comments
section, user-generated content, anything rendering visitor input back
into a page — this decision should be revisited, since that would
introduce the exact risk nonces exist to prevent.

`style-src` also uses `'unsafe-inline'`, for an unrelated reason:
`app/layout.jsx` sets brand colors as inline `style` CSS custom
properties on `<body>`. Inline style *attributes* don't support
nonce-based allowlisting the way `<script>` tags do, and inline style
injection is a much narrower attack surface than inline script injection
(can't execute arbitrary JS via a style attribute) — this is the
standard accepted trade-off in real-world CSP setups regardless of the
script-src decision above.

**Compensating for both `'unsafe-inline'` exceptions:** every other CSP
directive is tightened as far as this app allows — `object-src 'none'`,
`base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`,
`connect-src`/`script-src` only ever widened for GA4's specific domains
and only when analytics is genuinely on for that project.

**Other things reviewed during this audit, worth stating explicitly
rather than leaving ambiguous:**
- **CSRF:** classic CSRF relies on ambient session-cookie auth being
  hijacked cross-site — this app has no sessions/cookies at all for the
  lead form, so that specific attack doesn't apply. The realistic risk
  (a cross-site page silently triggering fake form submissions) is
  already covered by the Origin/Referer check, honeypot, and firewall
  rate limiting above.
- **Dependency vulnerability scanning:** not yet set up. Recommend
  enabling GitHub Dependabot alerts on the starter-kit template repo
  (one-time repo setting, same category as the Template Repository
  setting in section 10) so it's inherited by every clone, rather than
  configuring this per dealership project individually.
- **Reminder, easy to forget:** the Vercel Firewall rules from section 8
  are staged in log-only mode until manually reviewed and published per
  deployment. Until that review happens for a given dealership site,
  there is no active request-blocking in production for that site —
  only observability. Don't mistake "the script exists" for "protection
  is live."

---

## 10. Building a new dealership site, step by step

1. Clone the starter kit into a new repo/Vercel project (see section 11
   for why this should be a GitHub template, not a plain `git clone`)
2. Fill in `config/site.config.js` completely
3. Copy `.env.example` → `.env.local`, fill in secrets (Sentry auth
   token/DSN already wired into the starter kit itself — see section 6 —
   this is just supplying the values, not re-running the wizard)
4. Pick and set real fonts in `app/layout.jsx` (section 4)
5. Set up the Sentry Uptime Monitor for this dealership (section 7 —
   dashboard action, can't be inherited from the clone)
6. `vercel link`, then run `scripts/setup-firewall.sh` and publish once
   reviewed (section 8)
7. Look at the dealership's brand/tone, pick section styles from
   `components/sections` that fit (or note a new one is needed)
8. Copy chosen section files into the project, customize the JSX
9. Wire them into `app/page.jsx` in order
10. Run `node --env-file=.env.local scripts/validate-config.mjs` — fix
    any errors before proceeding (see section 12)
11. Deploy to Vercel under the shared Pro team account, connect the
    dealership's domain (see section 11)

---

## 11. Starting a new project from the starter kit

**Don't use a plain `git clone`.** A normal clone carries over the
starter kit's full commit history and git remote — if that remote isn't
explicitly detached, it's easy to accidentally push a dealership's actual
commits onto the shared starter-kit repo.

**Use GitHub's Template Repository feature instead:**
1. In the starter kit's GitHub repo settings, check "Template repository"
   (one-time setup, already the intended state going forward)
2. For every new dealership: click "Use this template" → creates a
   brand-new repo with the starter kit's current file state, zero shared
   history, zero shared remote
3. This also means starter-kit improvements made *after* a client site
   was created do NOT automatically flow into that already-created
   project — each clone is a snapshot at the moment it was created. This
   is an inherent trade-off of the clone-and-go model, not something
   this setup fixes. If a fix made in the starter kit later turns out to
   matter for a live client site, it has to be manually ported over.
4. Also enable GitHub Dependabot alerts on the starter kit's repo
   settings while you're there (Settings → Code security → Dependabot) —
   same one-time-setup logic as the template setting, so every clone
   inherits it rather than configuring dependency scanning per project.

**Domain/DNS setup** (not previously documented): once deployed to
Vercel, add the dealership's custom domain under Project Settings →
Domains, then point the domain's DNS to Vercel per the records Vercel
displays (typically an A record or CNAME, depending on whether it's an
apex domain or subdomain). Vercel auto-provisions and renews the SSL
certificate once DNS propagates — no separate certificate step needed.

**Privacy notice — flagged, not resolved here.** The lead form collects
name, phone, and message, and GA4 runs on every site. Egypt has its own
data protection law (Law 151/2020) that may have requirements around
this kind of collection — this isn't something to guess at or template
without proper review. Treat "does this project need a privacy notice,
and what should it say" as a checklist item requiring actual legal
guidance before a real client site goes live with the lead form active,
not something to copy-paste a generic template for.

**Terms of Service — a starting structure exists, still needs real
review.** See `TERMS_OF_SERVICE_TEMPLATE.md` — scoped correctly to what
this site actually is (informational, WhatsApp handoff, no online
transactions), with every dealership-specific value left as a
`[BRACKETED]` placeholder. Same category as the privacy notice above:
a real attorney needs to review it — and the Privacy Policy it
references doesn't exist yet either, same status.

---

## 12. Testing & pre-deploy validation

Two different kinds of checks, covering two different risks:

**`scripts/validate-config.mjs`** — run before every real deploy:
```
node --env-file=.env.local scripts/validate-config.mjs
```
Catches the failure mode that actually matters most for this project:
not "is the shared code broken" (stable, tested, shared across every
clone) but "did THIS specific dealership project get properly filled
in." Checks for leftover starter-kit placeholder values, malformed
WhatsApp numbers, invalid hex colors, a missing OG image/favicon file on
disk, and required environment variables. Exits with a non-zero code on
any hard error — safe to wire into a CI/deploy pipeline as a blocking
step. Requires Node 20.6+ for `--env-file`; the script's own header
comment has a `dotenv` fallback for older versions.

**`vitest` unit tests** — cover the pure functions in `lib/whatsapp.js`,
`lib/validators.js`, and `lib/analytics.js`:
```
npx vitest run
```
Deliberately scoped narrow: no tests for hooks, components, or API
routes (those need jsdom/React Testing Library/mocked request objects —
real setup cost for comparatively low payoff on a project this size),
and no tests for `lib/seo.js` (mostly just maps config fields into an
object shape — low risk). The three files tested are the ones where a
silent regression would actually be expensive: they're shared,
unedited, across every dealership site at once, so a bug there doesn't
just affect one project.

Neither of these currently runs automatically on every `git push` — both
are manual commands you run before deploying. Wiring either into GitHub
Actions or Vercel's build step as an automated gate is a reasonable
future addition, not done here.

**Required `package.json` additions** (merge into the real
`create-next-app`-generated file, don't replace it — confirmed by an
actual dry-run build against real Next.js 16 / Zod 4 / Vitest 4):

```json
"type": "module",
```
at the top level — every file in this project uses `import`/`export`,
never `require()`. Without this, Node has to guess the module type by
reparsing `site.config.js` at build time, which throws a
`MODULE_TYPELESS_PACKAGE_JSON` warning and adds a small performance
cost.

```json
"scripts": {
  "validate-config": "node --env-file=.env.local scripts/validate-config.mjs",
  "test": "vitest run"
}
```

```json
"engines": {
  "node": ">=20.6.0"
}
```
So an incompatible Node version fails with a clear message instead of
`--env-file` silently not being recognized.

---

## 13. Error pages, structured data, accessibility, monitoring, and versioning

**Error handling — three files, three different failure scopes:**
- `app/not-found.jsx` — 404s, fully config-driven, works unchanged
- `app/error.jsx` — catches runtime errors within a route segment,
  reports to Sentry automatically, gives a "Try Again" + WhatsApp
  fallback instead of a dead end
- `app/global-error.jsx` — catches errors in the ROOT LAYOUT itself
  (`app/layout.jsx`), which `error.jsx` structurally can't catch since
  it only wraps what's inside the layout, not the layout itself.
  Deliberately plain/inline-styled with no brand colors, fonts, or
  Tailwind classes — if this page is rendering, whatever broke may have
  been exactly those things, so it can't depend on them

**Structured data (`lib/structuredData.js`):** builds a schema.org
`AutomotiveBusiness` JSON-LD block from `site.config.js` — helps Google
surface this dealership specifically in local search/rich results. Built
entirely from fields already in config; zero per-project work. Wired
into `app/layout.jsx` as an inline `<script type="application/ld+json">`
— this is governed by CSP's `script-src`, but already covered by the
`'unsafe-inline'` already present there, no separate CSP change needed.

**Accessibility — two layers, deliberately different in kind:**
- `scripts/validate-config.mjs` now includes a real WCAG contrast ratio
  calculation (not just a hex-format check) — verifies
  `brand.colors.accent` against white text meets AA (4.5:1), warns if it
  falls short of AAA (7:1). This is genuinely the only accessibility
  property a script can reliably verify without human judgment.
- **`ACCESSIBILITY.md`** — a design-time checklist (WCAG 2.2 AA baseline,
  AAA called out where reasonable) covering everything a script can't
  check: keyboard operability, focus indicators, semantic structure, alt
  text, form labeling, motion preferences. Use this when building each
  real section component, not as an automated gate.

**Vercel Speed Insights:** `<SpeedInsights />` added to
`app/layout.jsx`. In production it loads from this deployment's own
domain (already covered by CSP's `'self'`, zero config needed there);
in local development it loads from an external Vercel domain, which
`next.config.mjs`'s CSP now allows for **development only**
(`NODE_ENV !== 'production'`) — production stays maximally strict.

**`next/image` remote domains — confirmed not needed for Model 1.**
Model 1 sites use only self-hosted assets in `/public` (a ≤10-second
hero video, up to ~5 images) — `next/image`'s `remotePatterns` config is
only relevant when pulling images from an external domain/CDN, which
doesn't apply here. Revisit only if Model 2 (inventory) ever pulls
vehicle photos from an external feed rather than manually uploaded
assets — not a current concern.

**Git tagging for the starter kit itself:** since every dealership clone
is a frozen snapshot at the moment it was created (section 11), tag
releases of the starter kit itself so it's possible to know later which
state a given client site was actually built from:
```
git tag v1.0
git push --tags
```
Bump the tag (`v1.1`, `v1.2`, ...) after any meaningful change to the
shared files — not required for every commit, just meaningful
milestones. If a client site later needs a fix that was already made in
a newer starter-kit version, the tag makes it possible to diff and
manually port the specific change over.

---

## 14. Cookie / analytics consent

GA4 no longer loads unconditionally when `analytics.ga4MeasurementId` is
set — it now waits for explicit visitor consent, via
`components/ui/CookieConsentBanner.jsx` +
`components/ui/AnalyticsLoader.jsx` + `lib/consent.js`.

**Architecture:** both components are Client Components using
`useSyncExternalStore` (not `useEffect`+`useState`) to read consent state
from `localStorage`. This is deliberate, confirmed by a real dry-run
lint failure: a naive `useEffect(() => setState(...))` version trips the
`react-hooks/set-state-in-effect` rule, and `useSyncExternalStore` also
genuinely avoids a flash-of-wrong-banner-state for returning visitors
that the `useEffect` version had — not just a lint workaround, an actual
correctness improvement. Both are pulled out into their own small client
components specifically so `app/layout.jsx` itself never needs
`"use client"` — the homepage stays statically pre-rendered, same
reasoning as the CSP nonce decision (section 9).

**Scope:** only gates GA4. This app has no other non-essential cookies —
no sessions, no ads, no third-party trackers.

**The banner's copy is a placeholder, not legal content** — same
category as the privacy notice flagged in section 10. Do not ship it to
a real client without real legal review of the wording and which
jurisdictions require showing it at all.

**Known limitation:** if a visitor grants consent (GA4 loads), then
later revokes it via a future "cookie settings" link, that stops future
tracking but doesn't retroactively undo an already-loaded gtag script or
already-set cookies within that same page load — a full reload after
revoking is what actually clears that state. Standard behavior for this
class of simple implementation.

**Not yet wired:** a persistent "Cookie Settings" link to let a visitor
change their mind after the initial choice (`lib/consent.js` already
exports `resetConsent()` for this) — belongs in `Footer.jsx`, which is
still a stub. Add this when that section gets built for a real project,
not before.

---

## 15. GA4 key events (conversions) — dashboard step, per project

`lib/analytics.js`'s `ANALYTICS_EVENTS` already fires the right events
at the right moments — but GA4 doesn't treat any event as a
"conversion" (GA4 now calls these **key events**) until it's explicitly
marked as one in the GA4 dashboard itself. This is a manual step per
dealership project, same category as the Sentry Uptime Monitor setup
(section 7) — code can't do this part.

**Mark these as key events:**
- `whatsapp_cta_click`
- `whatsapp_floating_click`
- `form_submit`

**Do NOT mark `form_submit_error` as a key event** — it's a failure
signal (used for debugging/monitoring form issues), not something that
represents a successful conversion.

**How:** in the GA4 Admin panel, under Events, toggle "Mark as key
event" for each of the three above. (GA4's exact UI/navigation shifts
periodically — if this doesn't match what's on screen, search GA4's
current documentation for "mark as key event" rather than assume the
steps above are still exactly accurate.)

Do this once real GA4 tracking is confirmed working for a project (i.e.
after a visitor has actually accepted the consent banner and triggered
at least one of these events at least once — GA4 can't mark an event
as a key event until it's seen that event fire at least once).

---

## Status

**Done:** `next.config.mjs` (security headers + static CSP + Speed
Insights dev exception), `ACCESSIBILITY.md`, `config/site.config.js`,
`lib/whatsapp.js`, `lib/sheets.js` (shared-secret auth),
`lib/validators.js`, `lib/analytics.js`, `lib/seo.js`,
`lib/structuredData.js` (JSON-LD), `app/layout.jsx` (structured data +
Speed Insights wired in), `app/globals.css` (Tailwind v4
`@theme inline` brand/font wiring), `app/api/lead/route.js` (Origin
check, payload guard, catch-all), `app/robots.js`, `app/sitemap.js`,
`app/not-found.jsx`, `app/error.jsx`, `app/global-error.jsx`,
`scripts/setup-firewall.sh`, `scripts/apps-script-template.gs`,
`scripts/validate-config.mjs` (now includes WCAG contrast check),
`vitest.config.mjs`, `tests/lib/*.test.js`, `.env.example`,
`components/ui/WhatsAppButton.jsx`, `components/ui/FloatingWhatsApp.jsx`,
`components/ui/Button.jsx`, `components/ui/Input.jsx`,
`components/ui/TextArea.jsx`, `hooks/useLeadForm.js`,
`components/sections/Contact.jsx`, `lib/consent.js`,
`components/ui/AnalyticsLoader.jsx`,
`components/ui/CookieConsentBanner.jsx` (GA4 now consent-gated),
`PERFORMANCE.md`, `TERMS_OF_SERVICE_TEMPLATE.md` (structure only, needs
real legal review)

**Not yet built:** the rest of `components/sections/*` (`Hero.jsx`,
`About.jsx`, `Inventory.jsx`, `Location.jsx`, `Footer.jsx` — still stubs,
`Footer.jsx` specifically also needs the Cookie Settings link, section
14), Sentry `initialScope` dealership tagging (manual step per clone,
section 6), Sentry Uptime Monitor setup per clone (section 7)

**Deliberately deferred:** `hooks/useGsapAnimation.js` — not built
speculatively. GSAP/ScrollTrigger scroll-reveal animations get built when
a specific dealership design actually calls for them, not ahead of time
as generic infrastructure with no real design driving its shape.

**Note:** this project uses Tailwind v4 — there is no
`tailwind.config.js` (removed; v4 uses CSS-native config). Brand colors
and fonts are wired via `app/globals.css`'s `@theme inline` block, with
real per-dealership values injected as CSS custom properties on `<body>`
in `app/layout.jsx`. Components use plain Tailwind utility classes
(`bg-accent`, `text-accent`, `font-display`, etc) — never inline `style`
for anything covered by this system.