# azentio.ai: website and intelligent collaboration portal

**Built by Victor Rajkumar** · [victorrajkumar1@gmail.com](mailto:victorrajkumar1@gmail.com) · [+91 95662 62277](tel:+919566262277) · [LinkedIn](https://www.linkedin.com/in/vctc92/)

An enterprise AI website and secure collaboration portal built for the azentio.ai hackathon. It showcases the offerings, gives employees and clients separate experiences, and turns client market observations into **governed collective learning** that improves the products, without exposing any client's private data.

> **Everything is synthetic.** Identity, email delivery, media streams and the federated model are simulated and labelled as such. The access rules, lifecycle, retrieval-index purge and cohort rules are real logic that run on every API call (see [What is real and what is simulated](#what-is-real-and-what-is-simulated)).

## Quick start

```bash
npm install          # only needed to run the browser tests
npm run build        # writes dist/index.html (a single self-contained file)
npm run serve        # build and serve dist/ locally
```

You can also just open `dist/index.html` in a browser. State lives in memory, so a refresh resets the demo.

Requirements: Node 18 or later. Fonts (Geist, Inter) and the Motion animation library load from public CDNs; the app still works without them.

## Try it

Use the **Judge walkthrough** button (bottom left) to follow the brief's end-to-end scenario in seven steps, or sign in with the **judge shortcut** on the sign-in page. The real email-code flow also works: the code is shown on screen as a simulated mailbox.

| Person | Role | What to try |
| --- | --- | --- |
| Ana Reyes (Northwind) | Client member | Private draft, returned submission, four separate permissions, withdrawal |
| Omar Haddad (Northwind) | Client administrator | Invite members, try granting a platform role (blocked) |
| Lena Fischer (Harbor) | Client member | Another tenant: sees only approved, de-identified learning |
| Sam Okoye (Alder) | Client member | Third organisation; has a submission with confidential pricing |
| Tess Marlow | Client, two organisations | Must pick an explicit active workspace |
| Maya Chen | Learning moderator | Redact and publish, request clarification, reject, handle reports |
| Priya Nair | Product owner | Create ideas from approved evidence, share a status with clients |
| Dev Patel | Content publisher | Homepage banner, video audiences |
| Ravi Menon | Portal administrator | Role grants, cohort threshold, support authorisation, audit log |
| Eli Brandt | Employee, no extra grants | Playground, lab, federated lab |

Sample invitation: `nina.cole@northwind.example` with code `NW-7Q2K-91XA` (the sign-in page has a button that fills it in).

The shield icon opens the **access log** and a **security lab** where you can try to bypass the rules (fetch another tenant's draft by ID, call the feed without signing in, set a role flag in browser storage, and so on). Every attempt goes through the same API as the app.

## What is in the box

- **Public site:** landing page with animated product mock-ups, offerings, media, insights, about and data policy, demo enquiry, hackathon registration.
- **Sign-in and onboarding:** email-code identity flow, single-use expiring invitations, terms and learning-sharing explanation, workspace switcher.
- **Employee portal:** dashboard, guided Playground on synthetic scenarios (including an employee-only experiment), internal live sessions, experiments, team spaces, release notes, knowledge library with owners and review dates, improvement ideas.
- **Client portal:** entitled sandbox, My observations and Our organisation's observations, shared learning feed with filters, saved searches, bookmarks, comments, reports, export preview, notifications, support tickets, client administration.
- **Collective learning workflow:** private draft, submit, review, publish, return, reject, withdraw, report; versioning on edit; consent history; audit events.
- **Insights loop:** theme dashboard with a minimum-organisations rule, AIRA retrieval that cites approved contributions, improvement ideas with audited status changes.
- **Federated lab (P2, optional):** four isolated synthetic clients, local training, clipped and weighted aggregation, poisoning checks, dropout and withdrawal scenarios, candidate registry with human review and rollback.

A requirement-by-requirement mapping is in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). Pitch material and a demo script are in [`docs/PITCH.md`](docs/PITCH.md).

## Project structure

```
src/
  server/core.js        Simulated server: data, policy engine (gate/POL), API, retrieval index, federated simulation
  client/
    01-helpers.js       Helpers, motion primitives, shells (marketing header, app sidebar), overlays
    02-pages.js         App and public pages
    03-site.js          Marketing illustrations, offerings, sign-in
    04-landing.js       Landing page, diagrams, animated mock-ups, spot illustrations
    05-motion.js        Motion (Framer Motion engine) effects and demo loops
    06-app.js           Render pipeline, actions, access log, walkthrough, boot
  styles/main.css       Design system (light and dark)
  template.html         HTML shell with style/script placeholders
scripts/build.mjs       Inlines everything into dist/index.html
tests/                  Logic, browser end-to-end, motion-path and contrast tests
docs/                   Architecture and traceability, pitch
.github/workflows/      CI and GitHub Pages deployment
dist/index.html         Built output (committed so the app opens immediately)
```

## Architecture in one paragraph

The UI never touches data directly. Every read and write goes through `api.*`, and each call runs through one policy function (`gate`) that evaluates role grants, tenant membership, the resource's audience and product entitlements together, denies by default, and records the checks it ran. Private source records and published shared copies are separate objects; search, cache and AIRA retrieval read a derived index that contains only reviewed fields and is purged on withdrawal. Themes appear only when enough distinct organisations support them. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Tests

```bash
npm test                      # 48 logic checks on the server layer (no browser needed)
npx playwright install chromium
npm run test:e2e              # build, then 35 browser journeys and 9 motion-path checks
node tests/contrast.mjs       # WCAG contrast audit of every screen in light and dark
```

The logic tests cover tenant isolation, escalation blocking, cohort suppression, withdrawal purge, support authorisation and the federated simulation. The motion test runs the animation code against a stand-in implementation of the Motion API, so it checks control flow, not the real library.

## Deploying to GitHub Pages

Push to `main`. The workflow in `.github/workflows/pages.yml` builds and publishes `dist/`. In the repository settings, set **Pages > Source** to **GitHub Actions**.

## What is real and what is simulated

**Real in this build:** the policy engine on every API call, tenant isolation, the lifecycle with audited transitions, the separate shared representation, the derived index and its purge, minimum-cohort rules, invitation and escalation rules, persisted in-app notifications with idempotent keys, and validation on the "server" side.

**Simulated:** the identity provider (the code is displayed), email delivery (messages are queued and never labelled delivered), media streams, and the federated model. The federated demo uses sample-weighted averaging with clipping and simple poisoning checks. It does **not** implement secure aggregation or differential privacy, and does not claim to.

**Production mapping:** Entra ID with OIDC for employees, a NestJS policy layer over a database with tenant checks, private blob storage, a managed search index with an outbox-driven purge, a real mail provider, signed media URLs, and a proper federated stack with secure aggregation.

## Known limits

- State is in memory only and resets on refresh.
- Attachments are not supported; the brief allows links instead for the first priority tier.
- No semantic clustering, duplicate detection, trend digests or assisted prioritisation (extras beyond the minimum).
- Client-side validation is limited to input limits and a live sensitive-content hint. The authoritative validation is in the API layer.
- Withdrawal cannot recall material that was already viewed or copied, and does not "untrain" any model.

## Credits

Typography: Geist and Inter (SIL OFL). Animation: [Motion](https://motion.dev) (the engine behind Framer Motion). All client names, people and data are fictional.

## Licence

MIT. See [LICENSE](LICENSE).
