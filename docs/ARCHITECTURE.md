# Architecture and requirements traceability

## Layers

```
Browser UI (src/client)  --api.*-->  Policy engine + API (src/server/core.js)  -->  Data, retrieval index
                                      gate() / POL: role + tenant + audience + entitlement
```

The client renders what the API returns and holds no authority. The "server" is simulated inside the page so the project is a single deployable file; in production the same boundary is an HTTP API.

### Policy model

`gate(action, resource, checks)` is the single decision point. Each call:

1. Receives an ordered list of checks, each with a label and a pass/fail result.
2. Denies on the first failure, with a human-readable reason.
3. Writes the decision and every check to the access log (shield icon in the UI).

Checks compose these facts: signed-in identity, verified `@azentio.com` identity plus approved employee provisioning, separate grants (`product_owner`, `moderator`, `publisher`, `portal_admin`), tenant membership and role, the **active workspace** (explicit when a user has several memberships), the resource's audience, and product entitlements. Tenant and workspace are never taken from user input: the active organisation is validated against memberships.

Rules worth knowing:

- Deny by default. Public resources must be explicitly marked public.
- Employee status grants nothing by itself. Publishing, moderating, inviting and administering are separate grants.
- Moderators cannot open unsubmitted drafts. Administrators cannot open private records without a reason-backed, 15-minute support authorisation that is audited and shown to the author.
- Client administrators can only grant approved client roles inside their own organisation, to approved email domains.

### Data separation

| Object | Visible to | Notes |
| --- | --- | --- |
| Private source record | Author; same organisation if shared to it; moderators once submitted; admin only with support authorisation | Holds hidden metadata, consent, internal notes |
| Shared copy | Signed-in client members and approved employees | Reviewed fields only. No tenant ID, author, attachments or reviewer notes |
| Retrieval index | Search, cache and AIRA | Derived from shared copies. Purged on withdrawal or unpublish |

### Lifecycle

`Draft -> Submitted -> In review -> Published`, with `Needs clarification`, `Rejected`, `Unpublished` and `Withdrawn` as side states. Allowed transitions are an explicit table (`TX`), every transition writes a history entry, and privileged ones write an audit event. Editing a published contribution creates a new version that goes back through review while the approved version stays live.

### Cohort rules

A theme is shown only when at least *k* distinct organisations (default 3, configurable from 3 to 8) support it. Repeat posts from one organisation count once. Filtered views that fall below *k* hide the organisation count. A minimum cohort alone is not a privacy guarantee, so production needs a documented suppression policy and stronger controls.

## Requirements traceability

Status: **Done** (implemented and tested), **Simulated** (behaviour modelled, provider stubbed), **Partial**, **Not done**.

### Access and identity

| Requirement | Status | Where / note |
| --- | --- | --- |
| IAM-01 server-side RBAC, tenant, audience, entitlement; explicit active workspace; never menus, localStorage or user-supplied tenant ID | Done | `gate`, `POL`, `orgOf`, `api.auth.switchOrg`. The security lab sets a browser-storage role flag and it has no effect |
| IAM-02 least privilege, separate grants, deny by default | Done | Grants are independent; admin cannot remove their own admin grant |
| Employee sign-in: verified work identity plus approved membership | Simulated | Email-code flow with provisioned employee list. Production: Entra ID with OIDC |
| Client invitations: single use, expiring, intended account, terms and sharing explanation, workspace switcher | Done | `api.auth`, sign-in terms step, top-bar and sidebar workspace chip |
| External email must not create a trusted membership | Done | Refused unless an invitation matches |

### Employee portal

| Requirement | Status | Where / note |
| --- | --- | --- |
| Dashboard, internal Playground, internal live, experiments, assigned ideas | Done | Dashboard, Playground, Live, Lab, Ideas |
| Guided Playground on synthetic scenarios, labelled simulated output | Done | Three offerings plus an employee-only experiment; "Synthetic data. Simulated output." |
| Internal broadcasts limited to the employee audience; publishers configure | Done | `api.media`, Publisher page |
| Product owner links approved themes, creates and updates ideas | Done | Evidence limited to approved shared contributions |
| Experiments, team spaces, release notes, knowledge library with owners and review dates | Done | Lab page |
| Employee-only content never in public or client search or AIRA | Done | Index holds shared copies only |

### Client portal

| Requirement | Status | Where / note |
| --- | --- | --- |
| Dashboard with empty states, no other tenant's data as samples | Done | Entitlement-driven; illustrated empty states |
| Entitled sandboxes, runs isolated by tenant and user, employee-only tools unreachable by URL | Done | `api.sandbox` |
| My observations and Our organisation's observations, drafts, submit, follow status, amend, withdraw | Done | Distinct tabs and indicators |
| Browse and search approved feed with offering, industry, region, period, topic filters | Done | Facets built from approved items only |
| Counts, suggestions and exports follow the same visibility | Done | Export preview uses the same search path |
| Client admin invites, revokes, grants approved roles; no escalation | Done | Team page; escalation attempt shown blocked |
| Improvement ideas with plain-language status, owner, last update, nothing private | Done | Client view strips internal notes and priority |
| Saved searches, bookmarks, notifications, comments, reports, support tickets, resources | Done | Support integration is simulated |
| Contribution acknowledgements | Partial | State-change notifications only |
| Attachments | Not done | Brief allows links instead for the first priority tier |

### Observation capture and workflow

| Requirement | Status | Where / note |
| --- | --- | --- |
| Structured form, private draft by default, save never shares | Done | Six observation types |
| Validation on client and server, draft, submit, edit-returned, withdraw | Partial | Server validation is authoritative; client side has input limits and a live sensitive-content hint |
| Prompt to exclude restricted information; flag likely sensitive content before sharing | Done | Warning, live scan, moderator highlights; publish blocked while flagged items remain |
| Explicit lifecycle, audit events, separate source and shared representation | Done | `TX`, history, `audit()` |
| Moderators redact, clarify, reject, publish; author notified in-app | Done | Moderation page |
| Material edits create a new version and need renewed review | Done | Live version unchanged until approved |
| Report action, temporary unpublish, decision recorded, reporter need not name another client | Done | Reports tab; reporter identity is not shown to moderators in the UI |
| Withdrawal clears search, index, cache and AIRA within 60 seconds | Done | Synchronous. Production target stated in About: 60 s search and AIRA, 15 min edge caches |
| Persisted notifications and outbox, idempotent, in-app P0, email P1 never labelled delivered | Done | Email shown as queued with no provider |

### Trusted collaboration

| Requirement | Status | Where / note |
| --- | --- | --- |
| Private, organisation, or proposed community sharing; broadening needs permission and moderation | Done | Form radio plus moderation |
| Separate permissions for store, publish, attribution, training | Done | Four consents; consent history in the record |
| Shared payload excludes tenant IDs, author profiles, attachments, reviewer notes | Done | Tested |
| De-identified by default; attribution opt-in and reviewed | Done | Moderator approves attribution |
| Reduce specific geography, dates and unusual details | Partial | Moderator broadens region and period; scan flags places and figures |
| No confidential pricing or secrets | Done | Scan flags and publish blocks |
| Keep raw private records out of indexes, logs and AI payloads | Done | Index holds reviewed fields; the access log records metadata only |
| Minimum distinct organisations, at least three synthetic clients, small-cohort and differencing suppression | Done | Configurable 3 to 8 |

### Insights and improvement loop

| Requirement | Status | Where / note |
| --- | --- | --- |
| Searchable feed and theme dashboard with offerings, period, org count where safe, limitations, latest update | Done | Learning page |
| Repeat posts from one organisation not counted as independent | Done | Distinct-organisation counting |
| Ideas with title, problem, offering, evidence, outcome, owner, priority, status; audited changes | Done | Ideas page |
| Close the loop without exposing private material or unapproved roadmaps | Done | Scanned client updates, contributor notifications |
| Illustrative scenario (three clients, redaction, theme, idea under review) | Done | Seeded data plus the judge walkthrough |
| Semantic clustering, duplicate detection, trend summaries, digests, assisted prioritisation | Not done | Extras beyond the minimum |
| Quality feedback, transparent moderation reasons, no leaderboards | Partial | Reviewer-assessed evidence quality and reasons; "useful / needs evidence" exists on sandbox runs only |

### P2 federated learning

| Requirement | Status | Where / note |
| --- | --- | --- |
| Separate opt-in programme, at least three isolated synthetic datasets, documented task | Done | Four clients; task described in the lab |
| Local training, aggregation round, holdout evaluation, participation, weighting, baseline | Done | Five rounds, sample-weighted, majority-class and single-client baselines |
| Log consent, participants, versions, aggregation, evaluation; no training examples in coordinator payloads | Partial | Round tables and candidate log; consent is stated for the synthetic programme |
| Update validation, dropout scenario, skewed-distribution explanation | Done | Validation, dropout and withdrawal toggles, skew table |
| Candidate registration, human review, explicit deployment decision, rollback | Done | Deployment is simulated |
| Threat model; clipping, poisoning checks, minimum cohort | Done | Shown in the lab |
| Secure aggregation, differential privacy | Not done | Described for production, not claimed |
| Withdrawal and lineage policy | Partial | Withdrawal blocks future participation; no automatic untraining promised |

## Production mapping

| Prototype | Production |
| --- | --- |
| In-page `api` and `gate` | NestJS controllers with guards, database row-level tenant checks |
| Email-code sign-in | Entra ID through OIDC; managed email-code or magic link where registration is unavailable |
| In-memory data and index | Relational database, private blob storage, managed search index |
| Synchronous purge | Outbox event that clears search, vector and cache entries, with a stated propagation SLA |
| Queued notification records | Outbox with a mail provider and delivery receipts |
| Simulated media URLs | Short-lived signed URLs after the same policy check |
| Federated simulation | Isolated training jobs, secure aggregation, differential-privacy accounting, model registry |
