'use strict';
/* =====================================================================
   core.js  -  Simulated server layer.
   Everything the UI can read or change goes through `api.*`, and every
   api call runs through the policy engine (gate). The UI never touches DB.
   In production this is NestJS guards + Postgres row-level checks.
   ===================================================================== */
const CFG = { k: 3, slaSeconds: 60, banner: 'Hackathon demo day is 12 November. Register your team before places run out.' };
const T0 = Date.UTC(2026, 9, 31, 9, 0);
const ago = (d, h = 0) => new Date(T0 - d * 864e5 - h * 36e5).toISOString();
let _n = 200;
const uid = p => p + '-' + (++_n).toString(36);

const TYPES = ['Market observation', 'Emerging trend', 'Product gap', 'Operational challenge', 'Successful practice', 'Improvement suggestion'];
const INDUSTRIES = ['Retail SME', 'Agriculture & food', 'Hospitality & leisure', 'Manufacturing', 'Professional services', 'Construction', 'Cross-sector'];
const REGIONS = ['UK & Ireland', 'Northern Europe', 'Southern Europe', 'Middle East', 'South Asia', 'North America', 'Global'];
const EVIDENCE = ['Portfolio pattern', 'Customer conversations', 'Internal analysis', 'Industry report', 'Anecdotal'];
const CONFIDENCE = ['Low', 'Medium', 'High'];
const PERIODS = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'];
const GRANTS = ['product_owner', 'moderator', 'publisher', 'portal_admin'];
const CLIENT_ROLES = ['client_member', 'client_admin'];
const IDEA_STATUS = ['Proposed', 'Under review', 'Planned', 'In progress', 'Released', 'Not proceeding'];
const PLAIN = {
  'Proposed': 'We’re looking at this',
  'Under review': 'Being reviewed. Not a delivery commitment',
  'Planned': 'Planned',
  'In progress': 'Being built',
  'Released': 'Released',
  'Not proceeding': 'We’ve decided not to proceed'
};
const THEME = {
  seasonality: { name: 'Seasonality context', offerings: ['fai'] },
  'doc-quality': { name: 'Document quality variance', offerings: ['doc'] },
  'other': { name: 'Other', offerings: [] }
};

const LAB = {
  teams: [{ name: 'Team Lagoon', members: ['Eli Brandt', 'Priya Nair'], track: 'P0 Core portal', status: 'Wiring role checks into every API route' }, { name: 'Team Kestrel', members: ['Dev Patel', 'Maya Chen'], track: 'P1 Extended', status: 'Semantic clustering and duplicate detection' }, { name: 'Team Meridian', members: ['Ravi Menon'], track: 'P2 Federated track', status: 'Aggregation round and poisoning checks' }],
  notes: [{ v: 'Portal 0.9', text: 'Moderation queue, report flow and withdrawal purge.', date: '29 Oct' }, { v: 'Portal 0.8', text: 'Invitation onboarding with single-use codes.', date: '27 Oct' }, { v: 'Portal 0.7', text: 'Sandbox with synthetic scenarios and saved runs.', date: '24 Oct' }],
  library: [{ id: 'k1', title: 'Moderation redaction guide', owner: 'Maya Chen', review: '30 Nov 2026', up: 5, down: 1 }, { id: 'k2', title: 'Synthetic data rules for demos', owner: 'Priya Nair', review: '15 Dec 2026', up: 8, down: 0 }, { id: 'k3', title: 'Cohort threshold policy (draft)', owner: 'Ravi Menon', review: '20 Nov 2026', up: 3, down: 2 }]
};
/* ---------------------------- seed data ---------------------------- */
const DB = {
  products: [
    { id: 'fai', name: 'Financial Analysis Intelligence', tag: 'Spreading, ratios and peer comparison', desc: 'Turns financial statements into consistent analysis, with explanations an analyst can defend.', internalOnly: false },
    { id: 'cda', name: 'Credit Decision Intelligence', tag: 'Policy-aware credit assessment', desc: 'Applies lending policy to a case and shows which rules drove each recommendation.', internalOnly: false },
    { id: 'doc', name: 'Document Intelligence', tag: 'Extraction and validation', desc: 'Reads statements, certificates and contracts, then flags what needs a human look.', internalOnly: false },
    { id: 'xp-seas', name: 'Seasonality-aware comparison (prototype)', tag: 'Internal experiment', desc: 'Prototype explanation layer for seasonal businesses. Employees only.', internalOnly: true }
  ],
  orgs: [
    { id: 'o-nw', name: 'Northwind Credit', entitlements: ['fai', 'cda', 'doc'], domains: ['northwind.example'] },
    { id: 'o-hb', name: 'Harbor SME Bank', entitlements: ['fai', 'cda'], domains: ['harborbank.example'] },
    { id: 'o-al', name: 'Alder Finance', entitlements: ['fai', 'doc'], domains: ['alder.example'] }
  ],
  users: [
    { id: 'u-ana', name: 'Ana Reyes', email: 'ana.reyes@northwind.example', memberships: [{ org: 'o-nw', role: 'client_member' }] },
    { id: 'u-omar', name: 'Omar Haddad', email: 'omar.haddad@northwind.example', memberships: [{ org: 'o-nw', role: 'client_admin' }] },
    { id: 'u-lena', name: 'Lena Fischer', email: 'lena.fischer@harborbank.example', memberships: [{ org: 'o-hb', role: 'client_member' }] },
    { id: 'u-sam', name: 'Sam Okoye', email: 'sam.okoye@alder.example', memberships: [{ org: 'o-al', role: 'client_member' }] },
    { id: 'u-tess', name: 'Tess Marlow', email: 'tess.marlow@advisory.example', memberships: [{ org: 'o-nw', role: 'client_member' }, { org: 'o-hb', role: 'client_member' }] },
    { id: 'u-priya', name: 'Priya Nair', email: 'priya.nair@azentio.com', employee: true, grants: ['product_owner'] },
    { id: 'u-maya', name: 'Maya Chen', email: 'maya.chen@azentio.com', employee: true, grants: ['moderator'] },
    { id: 'u-dev', name: 'Dev Patel', email: 'dev.patel@azentio.com', employee: true, grants: ['publisher'] },
    { id: 'u-ravi', name: 'Ravi Menon', email: 'ravi.menon@azentio.com', employee: true, grants: ['portal_admin'] },
    { id: 'u-eli', name: 'Eli Brandt', email: 'eli.brandt@azentio.com', employee: true, grants: [] }
  ],
  invites: [
    { id: 'inv-1', org: 'o-nw', email: 'nina.cole@northwind.example', role: 'client_member', token: 'NW-7Q2K-91XA', state: 'Pending', by: 'u-omar', exp: ago(-6) }
  ],
  videos: [
    { id: 'v-pub-1', title: 'azentio.ai in four minutes', audience: 'public', orgs: [], len: '4:12', kind: 'Recording', blurb: 'A short tour of the offerings and the collective learning loop.' },
    { id: 'v-pub-2', title: 'Financial Analysis Intelligence demo', audience: 'public', orgs: [], len: '6:40', kind: 'Recording', blurb: 'Spreading a set of accounts and reading the explanation.' },
    { id: 'v-emp-1', title: 'Playground roadmap sync', audience: 'employee', orgs: [], len: '38:05', kind: 'Recording', blurb: 'Internal prototype notes and next experiments.' },
    { id: 'v-emp-live', title: 'Hackathon demo day rehearsal', audience: 'employee', orgs: [], len: 'Live at 15:00', kind: 'Live', blurb: 'Internal live broadcast for the hackathon teams.' },
    { id: 'v-cli-1', title: 'Client briefing: Q4 release', audience: 'clients', orgs: ['o-nw', 'o-hb'], len: '22:30', kind: 'Recording', blurb: 'What is shipping this quarter and what is still under review.' },
    { id: 'v-cli-2', title: 'Webinar: seasonal SME lending', audience: 'clients', orgs: ['o-al', 'o-nw'], len: 'Thu 5 Nov, 14:00', kind: 'Live', blurb: 'Invitation-only session on seasonal cash flow in credit analysis.' }
  ],
  obs: [], ideas: [], notifs: [], outbox: [], audit: [], leads: [], reports: [], comments: [], runs: [], feedback: [],
  bookmarks: {}, saved: {}, support: [], tickets: [], fed: [], experiments: [
    { id: 'x1', title: 'Trough-coverage badge on spreading output', owner: 'Priya Nair', state: 'Prototype', votes: 7 },
    { id: 'x2', title: 'Duplicate detection for submitted observations', owner: 'Eli Brandt', state: 'Idea', votes: 4 }
  ]
};
const mkObs = (o) => Object.assign({
  type: TYPES[0], offering: 'fai', industry: 'Retail SME', region: 'UK & Ireland', period: 'Q3 2026', evidence: EVIDENCE[0], confidence: 'Medium',
  sharing: 'private', visibility: 'private', propose: false, status: 'Draft', consent: { store: true, publish: false, attribution: false, training: false },
  version: 1, notes: [], flags: [], shared: null, returnedReason: null, history: [{ t: ago(5), who: 'Author', text: 'Draft created' }], updated: ago(3)
}, o);
const sharedFrom = (o, s) => Object.assign({ id: 's-' + o.id, version: 1, topic: o.type, evidence: o.evidence, confidence: o.confidence, attribution: null, quality: 'Reviewer assessed: good', publishedAt: ago(4) }, s);

function seed() {
  const A = mkObs({ id: 'obs-hb-1', orgId: 'o-hb', authorId: 'u-lena', title: 'Seasonal SME turnover is treated inconsistently across analysts', type: 'Operational challenge', body: 'Our analysts apply different smoothing rules when a borrower’s revenue peaks in a few months. The same leisure business can look comfortable or stretched depending on who spreads the accounts.', sharing: 'community', propose: true, status: 'Published', consent: { store: true, publish: true, attribution: false, training: false }, updated: ago(4) });
  A.shared = sharedFrom(A, { title: 'Seasonal turnover is assessed inconsistently across analysts', summary: 'Analysts handle highly seasonal SME revenue in different ways, so identical businesses can be assessed differently. A shared explanation of seasonal troughs would help credit teams stay consistent.', offering: 'fai', industry: 'Hospitality & leisure', region: 'Northern Europe', period: 'Q3 2026', theme: 'seasonality' });
  const B = mkObs({ id: 'obs-al-1', orgId: 'o-al', authorId: 'u-sam', title: 'Annual averages hide the cash trough', type: 'Product gap', body: 'Annual-average coverage ratios make seasonal businesses look healthier than their quietest quarter suggests. We would like trough coverage next to the headline ratio.', sharing: 'community', propose: true, status: 'Published', consent: { store: true, publish: true, attribution: false, training: false }, updated: ago(3) });
  B.shared = sharedFrom(B, { title: 'Annual averages hide the cash trough', summary: 'Annual-average coverage makes seasonal businesses look healthier than their quietest quarter suggests. Credit teams want trough coverage and a reserve estimate shown beside the headline ratio.', offering: 'fai', industry: 'Agriculture & food', region: 'Global', period: 'Q3 2026', theme: 'seasonality', publishedAt: ago(3) });
  const C = mkObs({ id: 'obs-hb-2', orgId: 'o-hb', authorId: 'u-lena', title: 'Scanned statements vary widely in extraction quality', type: 'Operational challenge', body: 'Low-resolution scans of bank statements lose columns during extraction and need manual rework.', sharing: 'community', propose: true, status: 'Published', consent: { store: true, publish: true, attribution: false, training: false } });
  C.shared = sharedFrom(C, { title: 'Low-resolution scans lose columns during extraction', summary: 'Scanned statements of uneven quality lose table columns during extraction, creating manual rework. A visible quality score at upload would help teams decide early.', offering: 'doc', industry: 'Cross-sector', region: 'Global', period: 'Q2 2026', theme: 'doc-quality', publishedAt: ago(6) });
  const D = mkObs({ id: 'obs-al-2', orgId: 'o-al', authorId: 'u-sam', title: 'Handwritten annotations break table extraction', type: 'Product gap', body: 'Annotated statements confuse the table reader and produce wrong totals.', sharing: 'community', propose: true, status: 'Published', consent: { store: true, publish: true, attribution: false, training: false } });
  D.shared = sharedFrom(D, { title: 'Handwritten annotations break table extraction', summary: 'Margin notes on statements confuse table readers and can produce wrong totals. Teams want annotated pages flagged for review rather than silently extracted.', offering: 'doc', industry: 'Cross-sector', region: 'Global', period: 'Q3 2026', theme: 'doc-quality', publishedAt: ago(5) });
  const E = mkObs({ id: 'obs-nw-1', orgId: 'o-nw', authorId: 'u-ana', title: 'Seasonal cash flow at Northwind’s Leeds garden centre clients', type: 'Market observation', body: 'At Northwind Credit’s Leeds branch we reviewed 14 garden-centre loans (for example ACC 48213377). Spring revenue is about five times winter revenue, yet our template only compares against the same month last year, so the quiet months look like a deterioration.', sharing: 'community', propose: true, status: 'Submitted', evidence: 'Portfolio pattern', confidence: 'Medium', consent: { store: true, publish: true, attribution: false, training: false }, history: [{ t: ago(1), who: 'Ana Reyes', text: 'Submitted for review' }], updated: ago(1) });
  E.flags = scan(E.title + ' ' + E.body);
  const F = mkObs({ id: 'obs-al-3', orgId: 'o-al', authorId: 'u-sam', title: 'Pricing we pay for covenant monitoring', type: 'Market observation', industry: 'Cross-sector', body: 'We pay £18,000 per year under a confidential contract for covenant monitoring and think the vendor’s pricing is out of line with peers.', sharing: 'community', propose: true, status: 'Submitted', consent: { store: true, publish: true, attribution: true, training: false }, history: [{ t: ago(0, 6), who: 'Sam Okoye', text: 'Submitted for review' }], updated: ago(0, 6) });
  F.flags = scan(F.title + ' ' + F.body);
  const G = mkObs({ id: 'obs-nw-draft', orgId: 'o-nw', authorId: 'u-ana', title: 'Covenant headroom alerts arrive too late', type: 'Product gap', offering: 'cda', body: 'Alerts for covenant headroom fire after month-end close. We want an early warning when headroom narrows.', sharing: 'community' });
  const H = mkObs({ id: 'obs-hb-draft', orgId: 'o-hb', authorId: 'u-lena', title: 'Private note: segment churn pattern', body: 'Draft notes on a customer segment that should stay inside Harbor SME Bank.', sharing: 'private' });
  const I = mkObs({ id: 'obs-nw-org', orgId: 'o-nw', authorId: 'u-omar', title: 'Workaround: analysts keep a seasonal cheat-sheet', type: 'Successful practice', body: 'Our analysts keep a one-page sheet listing each seasonal sector’s expected peak months. It is shared inside the team only.', sharing: 'org', visibility: 'org' });
  const J = mkObs({ id: 'obs-nw-ret', orgId: 'o-nw', authorId: 'u-ana', title: 'Regional rate differences in the SME portfolio', type: 'Emerging trend', body: 'Rates for similar SME loans differ by branch region and customers are starting to notice.', sharing: 'community', propose: true, status: 'Needs clarification', evidence: 'Anecdotal', returnedReason: 'Please add the observation period, say whether this comes from portfolio data or conversations, and remove the branch name before we can review it.', history: [{ t: ago(2), who: 'Ana Reyes', text: 'Submitted for review' }, { t: ago(1), who: 'Moderator', text: 'Returned with a question' }], updated: ago(1) });
  DB.obs.push(A, B, C, D, E, F, G, H, I, J);
  DB.obs.filter(o => o.shared).forEach(indexPublish);
  DB.ideas.push({ id: 'idea-1', title: 'Bulk upload for statement packs', problem: 'Teams upload statement packs one file at a time, which slows onboarding of new borrowers.', offering: 'doc', outcome: 'Upload a whole pack in one step.', refs: [], owner: 'Document Intelligence squad', priority: 'Medium', status: 'Released', updated: ago(9), clientVisible: true, clientUpdate: 'Bulk upload is now available in Document Intelligence.', internalNotes: 'Prioritised over OCR retraining in the Sept planning review. Do not share.', audit: [{ t: ago(30), who: 'Priya Nair', text: 'Created as Proposed' }, { t: ago(9), who: 'Priya Nair', text: 'Status changed to Released' }] });
  DB.notifs.push({ id: 'n-1', userId: 'u-ana', text: 'Your submission “Regional rate differences in the SME portfolio” was returned with a question.', t: ago(1), read: false, key: 'seed-1', channel: 'in-app', state: 'Stored' });
  DB.audit.push({ t: ago(1), actor: 'Maya Chen', action: 'obs.clarify', target: 'obs-nw-ret', detail: 'Requested observation period and evidence type' });
}

/* ------------------- sensitive content scan (advisory) ------------------- */
function scan(t) {
  const f = [], seen = new Set();
  const add = (type, m, why) => { const k = type + m.toLowerCase(); if (!seen.has(k)) { seen.add(k); f.push({ type, match: m, why }); } };
  (t.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || []).forEach(m => add('identity', m, 'Email address'));
  (t.match(/\bACC\s?\d+/gi) || []).forEach(m => add('identity', m, 'Looks like an account reference'));
  (t.match(/\b\d{7,}\b/g) || []).forEach(m => add('identity', m, 'Long number that may identify an account'));
  DB.orgs.forEach(o => { const w = o.name.split(' ')[0]; if (new RegExp('\\b' + w + '\\b', 'i').test(t)) add('identity', w, 'Organisation name'); });
  (t.match(/\b(confidential|contractual|contract|NDA|password|secret|api key|credentials?)\b/gi) || []).forEach(m => add('restricted', m, 'Restricted topic'));
  (t.match(/[£$€]\s?\d[\d,.]*k?/g) || []).forEach(m => add('pricing', m, 'Monetary figure'));
  (t.match(/\b(Leeds|Manchester|Glasgow|Cork|Bristol)\b/g) || []).forEach(m => add('geo', m, 'Specific location'));
  return f;
}

/* ----------------------- retrieval index (derived) ----------------------- */
const IDX = { search: new Map(), meta: new Map(), aira: new Map(), cache: new Map(), purges: [] };
function indexPublish(o) {
  const s = o.shared;
  IDX.search.set(s.id, Object.assign({}, s));
  IDX.meta.set(s.id, { orgId: o.orgId, obsId: o.id });
  IDX.aira.set(s.id, { id: s.id, text: s.title + '. ' + s.summary, theme: s.theme });
  IDX.cache.clear();
}
function indexPurge(sid) {
  const t0 = performance.now();
  const r = { sid, search: IDX.search.delete(sid), aira: IDX.aira.delete(sid), cacheEntries: IDX.cache.size, t: Date.now() };
  IDX.meta.delete(sid); IDX.cache.clear();
  r.ms = Math.max(0.1, performance.now() - t0);
  IDX.purges.unshift(r);
  return r;
}

/* ------------------------------ session ------------------------------ */
const S = { uid: null, org: null };
const LOG = [];
const listeners = [];
const me = () => S.uid ? DB.users.find(u => u.id === S.uid) : null;
const isEmp = u => !!(u && u.employee && u.email.endsWith('@azentio.com'));
const hasG = (u, g) => isEmp(u) && u.grants.includes(g);
const memOf = (u, org) => u && u.memberships && u.memberships.find(m => m.org === org);
function orgOf(u, sel) {
  if (!u || !u.memberships || !u.memberships.length) return null;
  if (u.memberships.length === 1) return u.memberships[0].org;
  return u.memberships.some(m => m.org === sel) ? sel : null;
}
const myOrg = () => orgOf(me(), S.org);
const orgName = id => (DB.orgs.find(o => o.id === id) || {}).name || 'Unknown';
const isClientAdmin = (u, org) => !!(org && memOf(u, org) && memOf(u, org).role === 'client_admin');
const supportActive = (u, obsId) => DB.support.some(s => s.adminId === u.id && s.obsId === obsId && new Date(s.until).getTime() > Date.now());

function gate(action, resource, checks) {
  const u = me();
  const bad = checks.find(c => !c[1]);
  const rec = { t: Date.now(), actor: u ? u.name : 'Anonymous visitor', action, resource, allow: !bad, reason: bad ? (bad[2] || 'Requires: ' + bad[0]) : 'All checks passed', checks: checks.map(c => ({ label: c[0], pass: !!c[1] })) };
  LOG.unshift(rec); if (LOG.length > 80) LOG.pop();
  listeners.forEach(f => f(rec));
  return bad ? { ok: false, reason: rec.reason } : { ok: true };
}
function audit(action, target, detail) { const u = me(); DB.audit.unshift({ t: new Date().toISOString(), actor: u ? u.name : 'System', action, target, detail: detail || '' }); }
function notify(userId, text, key) {
  key = key || (userId + text);
  if (DB.notifs.some(n => n.key === key && n.userId === userId)) return;
  DB.notifs.unshift({ id: uid('n'), userId, text, t: new Date().toISOString(), read: false, key, channel: 'in-app', state: 'Stored' });
  const u = DB.users.find(x => x.id === userId);
  if (u) DB.outbox.unshift({ id: uid('ob'), to: u.email, text, state: 'Queued', note: 'Email provider not connected (P1). Queued, not delivered.', t: new Date().toISOString() });
}
const notifyGrant = (g, text, key) => DB.users.filter(u => hasG(u, g)).forEach(u => notify(u.id, text, key + u.id));

/* -------------------------- policy (pure) -------------------------- */
const POL = {
  obsRead(u, org, o) {
    const signed = !!u, author = signed && o.authorId === u.id;
    const orgShared = !!org && org === o.orgId && o.visibility === 'org';
    const mod = hasG(u, 'moderator') && o.propose && o.status !== 'Draft';
    const sup = hasG(u, 'portal_admin') && supportActive(u, o.id);
    const ok = author || orgShared || mod || sup; let why;
    if (!ok) {
      if (!signed) why = 'Sign in required';
      else if (hasG(u, 'moderator') && o.status === 'Draft') why = 'Moderators can’t open unsubmitted client drafts';
      else if (hasG(u, 'portal_admin')) why = 'Portal administrators need an explicit, time-boxed support authorisation';
      else if (isEmp(u)) why = 'Employee status doesn’t grant access to client-private records';
      else if (u.memberships && u.memberships.length > 1 && !org) why = 'Choose an active workspace first';
      else why = 'This record belongs to another author or tenant';
    }
    return [['Signed in', signed, 'Sign in required'], ['Author, same-organisation audience, moderator on a submitted record, or authorised support access', ok, why]];
  },
  shared(u, org) {
    const ok = !!u && (!!org || isEmp(u)); let why;
    if (!u) why = 'Cross-client learning is for signed-in participants only';
    else if (!ok) why = 'Choose an active client workspace first';
    return [['Signed in', !!u, 'Cross-client learning is for signed-in participants only'], ['Client member with an active workspace, or approved employee', ok, why]];
  }
};

/* ---------------------------- validation ---------------------------- */
function vObs(f, full) {
  const e = {};
  const len = (k, a, b, l) => { const v = (f[k] || '').trim(); if (v.length < a) e[k] = l + ' needs at least ' + a + ' characters.'; else if (v.length > b) e[k] = l + ' can be at most ' + b + ' characters.'; };
  len('title', full ? 8 : 3, 120, 'Title'); len('body', full ? 40 : 0, 2000, 'Description');
  if (full) {
    if (!TYPES.includes(f.type)) e.type = 'Choose a type.';
    if (!DB.products.some(p => p.id === f.offering && !p.internalOnly)) e.offering = 'Choose an offering.';
    if (!INDUSTRIES.includes(f.industry)) e.industry = 'Choose an industry.';
    if (!REGIONS.includes(f.region)) e.region = 'Choose a region.';
    if (!PERIODS.includes(f.period)) e.period = 'Choose the observation period.';
    if (!EVIDENCE.includes(f.evidence)) e.evidence = 'Choose the evidence type.';
    if (!CONFIDENCE.includes(f.confidence)) e.confidence = 'Choose a confidence level.';
  }
  return e;
}
const emailOk = s => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s || '');
const fail = (reason, errors) => ({ ok: false, reason, errors });
const nf = () => fail('Not found, or you don’t have access.');

/* ----------------------------- lifecycle ----------------------------- */
const TX = { 'Draft': ['Submitted', 'Withdrawn'], 'Submitted': ['In review', 'Withdrawn'], 'In review': ['Needs clarification', 'Rejected', 'Published', 'Withdrawn'], 'Needs clarification': ['Submitted', 'Withdrawn'], 'Published': ['Unpublished', 'Withdrawn', 'Submitted'], 'Unpublished': ['Published', 'Withdrawn', 'Rejected'], 'Rejected': [], 'Withdrawn': [] };
function move(o, to, who, text) {
  if (!TX[o.status].includes(to)) throw new Error('Transition ' + o.status + ' to ' + to + ' is not allowed');
  o.status = to; o.updated = new Date().toISOString(); o.history.push({ t: o.updated, who, text: text || ('Status changed to ' + to) });
}
const pubView = s => Object.assign({}, s);
function viewObs(o, u) {
  const c = JSON.parse(JSON.stringify(o));
  if (!hasG(u, 'moderator')) delete c.notes;
  c.live = !!o.shared; c.orgName = orgName(o.orgId);
  return c;
}

/* ================================== API ================================== */
const api = {
  me() {
    const u = me(); if (!u) return null;
    const org = myOrg();
    return { id: u.id, name: u.name, email: u.email, kind: isEmp(u) ? 'employee' : 'client', grants: u.grants || [], memberships: (u.memberships || []).map(m => ({ org: m.org, orgName: orgName(m.org), role: m.role })), activeOrg: org, activeOrgName: org ? orgName(org) : null, needsWorkspace: !!(u.memberships && u.memberships.length > 1 && !org), role: org ? memOf(u, org).role : null };
  },
  auth: {
    requestCode(email) {
      email = (email || '').trim().toLowerCase();
      if (!emailOk(email)) return fail('Enter a valid work email address.');
      const code = String(100000 + Math.floor(Math.random() * 900000));
      api._codes[email] = { code, exp: Date.now() + 5 * 60e3, tries: 0 };
      return { ok: true, data: { notice: 'If this address can sign in, a code is on its way.', simulatedMailbox: code } };
    },
    verify(email, code, token) {
      email = (email || '').trim().toLowerCase();
      const c = api._codes[email];
      if (!c || c.exp < Date.now() || c.tries >= 5) return fail('That code has expired. Request a new one.');
      c.tries++;
      if (c.code !== String(code || '').trim()) return fail('That code doesn’t match. Check the digits and try again.');
      delete api._codes[email];
      if (token) {
        const inv = DB.invites.find(i => i.token === token);
        if (!inv || inv.state !== 'Pending' || new Date(inv.exp) < new Date() || inv.email !== email) return fail('This invitation is invalid, expired, or meant for a different account.');
        api._pending[email] = inv.id;
        return { ok: true, data: { needsTerms: true, orgName: orgName(inv.org), role: inv.role } };
      }
      const u = DB.users.find(x => x.email === email);
      if (email.endsWith('@azentio.com')) {
        if (!u || !u.employee) return fail('Your @azentio.com identity is verified, but you haven’t been approved for the portal yet. Ask the hackathon organisers to provision you.');
        S.uid = u.id; S.org = null; audit('auth.signin', u.id, 'Employee sign-in'); return { ok: true, data: { signedIn: true } };
      }
      if (u && u.memberships && u.memberships.length) { S.uid = u.id; S.org = null; audit('auth.signin', u.id, 'Client sign-in'); return { ok: true, data: { signedIn: true } }; }
      return fail('This email isn’t linked to a client organisation. Ask your client administrator for an invitation.');
    },
    acceptInvite(email) {
      const id = api._pending[email]; const inv = DB.invites.find(i => i.id === id);
      if (!inv || inv.state !== 'Pending') return fail('No invitation to accept.');
      let u = DB.users.find(x => x.email === email);
      if (!u) { u = { id: uid('u'), name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()), email, memberships: [] }; DB.users.push(u); }
      u.memberships.push({ org: inv.org, role: inv.role });
      inv.state = 'Accepted'; delete api._pending[email];
      S.uid = u.id; S.org = null;
      DB.audit.unshift({ t: new Date().toISOString(), actor: u.name, action: 'invite.accept', target: inv.id, detail: 'Joined ' + orgName(inv.org) + '. Terms and sharing explanation acknowledged. No sharing or training consent given.' });
      return { ok: true };
    },
    judgeShortcut(id) { const u = DB.users.find(x => x.id === id); S.uid = u ? u.id : null; S.org = null; if (u) audit('auth.shortcut', u.id, 'Judge shortcut: skipped the email code only'); return { ok: true }; },
    signOut() { S.uid = null; S.org = null; return { ok: true }; },
    switchOrg(org) {
      const u = me(); const g = gate('workspace.switch', orgName(org), [['Signed in', !!u], ['Active membership in that organisation', !!memOf(u, org), 'You aren’t a member of that organisation']]);
      if (!g.ok) return g; S.org = org; return { ok: true };
    }
  },
  _codes: {}, _pending: {},

  /* ---- public ---- */
  catalogue() { return { ok: true, data: DB.products.filter(p => !p.internalOnly) }; },
  banner() { return { ok: true, data: CFG.banner }; },
  videos() {
    const u = me(), org = myOrg();
    const list = DB.videos.filter(v => v.audience === 'public' || (u && v.audience === 'employee' && isEmp(u)) || (u && v.audience === 'clients' && org && v.orgs.includes(org)));
    return { ok: true, data: list };
  },
  media(id) {
    const v = DB.videos.find(x => x.id === id); if (!v) return nf();
    const u = me(), org = myOrg(); let c;
    if (v.audience === 'public') c = [['Resource explicitly marked public', true]];
    else if (v.audience === 'employee') c = [['Signed in', !!u, 'Sign in required'], ['Verified @azentio.com employee with approved membership', isEmp(u), 'This recording is limited to employees']];
    else c = [['Signed in', !!u, 'Sign in required'], ['Active client workspace', !!org, 'Choose an active client workspace'], ['Workspace is on this session’s audience list', !!org && v.orgs.includes(org), 'Your organisation isn’t invited to this session']];
    const g = gate('media.stream', 'Media: ' + v.title, c); if (!g.ok) return g;
    return { ok: true, data: Object.assign({}, v, { signedUrl: 'https://media.azentio.ai/' + v.id + '?sig=' + Math.random().toString(36).slice(2, 10), expiresIn: 60 }) };
  },
  lead: {
    demo(f) {
      const e = {}; if ((f.name || '').trim().length < 2) e.name = 'Enter your name.'; if (!emailOk(f.email)) e.email = 'Enter a valid work email.';
      if ((f.company || '').trim().length < 2) e.company = 'Enter your organisation.'; if (!DB.products.some(p => p.id === f.offering && !p.internalOnly)) e.offering = 'Choose an offering.'; if ((f.message || '').length > 500) e.message = 'Keep it under 500 characters.';
      if (Object.keys(e).length) return fail('Fix the highlighted fields.', e);
      DB.leads.unshift({ id: uid('L'), kind: 'Demo request', t: new Date().toISOString(), f }); return { ok: true };
    },
    hackathon(f) {
      const e = {}; if ((f.name || '').trim().length < 2) e.name = 'Enter your name.'; if (!emailOk(f.email)) e.email = 'Enter a valid email.';
      if ((f.team || '').trim().length < 2) e.team = 'Name your team.'; if (!['P0 Core portal', 'P1 Extended', 'P2 Federated track'].includes(f.track)) e.track = 'Choose a track.';
      if (Object.keys(e).length) return fail('Fix the highlighted fields.', e);
      DB.leads.unshift({ id: uid('L'), kind: 'Hackathon registration', t: new Date().toISOString(), f }); return { ok: true };
    }
  },

  /* ---- sandbox ---- */
  sandbox: {
    products() {
      const u = me(), org = myOrg();
      const g = gate('sandbox.list', 'Sandbox catalogue', [['Signed in', !!u], ['Employee or client with an active workspace', isEmp(u) || !!org, 'Choose an active workspace']]); if (!g.ok) return g;
      const o = DB.orgs.find(x => x.id === org);
      return { ok: true, data: DB.products.filter(p => isEmp(u) ? true : (!p.internalOnly && o && o.entitlements.includes(p.id))).map(p => ({ id: p.id, name: p.name, tag: p.tag, internalOnly: p.internalOnly })) };
    },
    run(pid, sid, ai) {
      const u = me(), org = myOrg(), p = DB.products.find(x => x.id === pid); if (!p) return nf();
      const o = DB.orgs.find(x => x.id === org);
      const ent = isEmp(u) || (!!o && !p.internalOnly && o.entitlements.includes(pid));
      const g = gate('sandbox.run', 'Sandbox: ' + p.name, [['Signed in', !!u], ['Product is not employee-only for this audience', !p.internalOnly || isEmp(u), 'This experiment is employee-only'], ['Workspace is entitled to this product', ent, 'Your workspace isn’t entitled to this product']]);
      if (!g.ok) return g;
      const r = runScenario(pid, sid, ai);
      const run = { id: uid('run'), userId: u.id, scope: isEmp(u) ? 'internal' : org, product: pid, scenario: sid, result: r, t: new Date().toISOString() };
      DB.runs.unshift(run); return { ok: true, data: run };
    },
    runs() {
      const u = me(), org = myOrg(); const g = gate('sandbox.runs', 'Saved scenarios', [['Signed in', !!u]]); if (!g.ok) return g;
      const admin = isClientAdmin(u, org);
      return { ok: true, data: DB.runs.filter(r => r.userId === u.id || (admin && r.scope === org)).slice(0, 8) };
    },
    feedback(runId, rating, comment) {
      const u = me(); const r = DB.runs.find(x => x.id === runId);
      const g = gate('sandbox.feedback', 'Run feedback', [['Signed in', !!u], ['Own run', !!r && r.userId === u.id, 'You can only rate your own runs']]); if (!g.ok) return g;
      if (!['Useful', 'Needs evidence'].includes(rating)) return fail('Choose a rating.');
      if ((comment || '').length > 400) return fail('Keep feedback under 400 characters.');
      DB.feedback.push({ runId, rating, comment: comment || '', by: u.id, t: new Date().toISOString() }); return { ok: true };
    }
  },

  /* ---- observations (author side) ---- */
  obs: {
    list(scope) {
      const u = me(), org = myOrg();
      const g = gate('obs.list', scope === 'org' ? 'Our organisation’s observations' : 'My observations', [['Signed in', !!u], ['Active client workspace', !!org, 'Choose an active workspace'], ['Client member', !!u && !isEmp(u), 'Employees don’t have client workspaces']]);
      if (!g.ok) return g;
      const rows = DB.obs.filter(o => o.orgId === org && (scope === 'org' ? o.visibility === 'org' : o.authorId === u.id));
      return { ok: true, data: rows.map(o => viewObs(o, u)).sort((a, b) => b.updated.localeCompare(a.updated)) };
    },
    get(id) {
      const u = me(), org = myOrg(), o = DB.obs.find(x => x.id === id);
      if (!o) return nf();
      const g = gate('obs.read', 'Observation ' + id, POL.obsRead(u, org, o)); if (!g.ok) return g;
      if (hasG(u, 'portal_admin') && o.authorId !== u.id) { audit('support.read', id, 'Private record opened under support authorisation'); }
      return { ok: true, data: viewObs(o, u) };
    },
    save(f) {
      const u = me(), org = myOrg(); let o = f.id ? DB.obs.find(x => x.id === f.id) : null;
      if (f.id && !o) return nf();
      const g = gate(o ? 'obs.edit' : 'obs.create', o ? 'Observation ' + f.id : 'New observation', o ? [['Signed in', !!u], ['Author of this record', o.authorId === u.id, 'Only the author can edit'], ['Editable state', ['Draft', 'Needs clarification', 'Published'].includes(o.status), 'This record is locked while under review']] : [['Signed in', !!u], ['Active client workspace', !!org, 'Choose an active workspace'], ['Client member', !!u && !isEmp(u)]]);
      if (!g.ok) return g;
      const e = vObs(f, false); if (Object.keys(e).length) return fail('Fix the highlighted fields.', e);
      const sharing = ['private', 'org', 'community'].includes(f.sharing) ? f.sharing : 'private';
      const consent = { store: !!(f.consent && f.consent.store), publish: !!(f.consent && f.consent.publish), attribution: !!(f.consent && f.consent.attribution), training: !!(f.consent && f.consent.training) };
      if (!consent.store) return fail('Storing and processing consent is needed to save a contribution.', { 'consent.store': 'Tick this to save your draft.' });
      const fields = ['title', 'body', 'type', 'offering', 'industry', 'region', 'period', 'evidence', 'confidence'];
      if (!o) {
        o = mkObs({ id: uid('obs'), orgId: org, authorId: u.id, history: [{ t: new Date().toISOString(), who: u.name, text: 'Draft created (private)' }] });
        DB.obs.unshift(o);
      } else if (o.status === 'Published') {
        // material edit of a published record: new version, renewed review, live copy unchanged until approved
        o.version += 1; o.status = 'Submitted'; o.history.push({ t: new Date().toISOString(), who: u.name, text: 'Edited. Version ' + o.version + ' sent for renewed review. Published version ' + o.shared.version + ' stays live until approved.' });
        o.status = 'Submitted';
      }
      fields.forEach(k => { if (f[k] !== undefined) o[k] = f[k]; });
      o.sharing = sharing; o.consent = consent;
      o.visibility = o.shared ? o.visibility : (sharing === 'org' ? 'org' : 'private');
      o.updated = new Date().toISOString(); o.flags = scan(o.title + ' ' + o.body);
      if (o.status === 'Submitted') { o.flags = scan(o.title + ' ' + o.body); notifyGrant('moderator', 'A new version of a published contribution is awaiting renewed review.', 'rereview-' + o.id + o.version); }
      return { ok: true, data: viewObs(o, u) };
    },
    submit(id) {
      const u = me(), o = DB.obs.find(x => x.id === id); if (!o) return nf();
      const g = gate('obs.submit', 'Observation ' + id, [['Signed in', !!u], ['Author of this record', !!u && o.authorId === u.id, 'Only the author can submit'], ['Draft or returned', ['Draft', 'Needs clarification'].includes(o.status), 'Already submitted or closed']]);
      if (!g.ok) return g;
      const e = vObs(o, true);
      if (o.sharing !== 'community') e.sharing = 'Choose “propose to the learning community” to submit for review.';
      if (!o.consent.publish) e['consent.publish'] = 'Publishing consent is needed to propose sharing.';
      if (Object.keys(e).length) return fail('Complete the highlighted fields before submitting.', e);
      o.propose = true; o.flags = scan(o.title + ' ' + o.body); o.returnedReason = null;
      move(o, 'Submitted', u.name, 'Submitted for review' + (o.flags.length ? ' (' + o.flags.length + ' possible sensitive items flagged)' : ''));
      notifyGrant('moderator', 'New contribution awaiting review: “' + o.title + '”.', 'sub-' + o.id + o.version);
      return { ok: true, data: viewObs(o, u) };
    },
    withdraw(id) {
      const u = me(), o = DB.obs.find(x => x.id === id); if (!o) return nf();
      const g = gate('obs.withdraw', 'Observation ' + id, [['Signed in', !!u], ['Author of this record', !!u && o.authorId === u.id, 'Only the author can withdraw'], ['Not already closed', !['Withdrawn', 'Rejected'].includes(o.status), 'Already closed']]);
      if (!g.ok) return g;
      let purge = null;
      if (o.shared) { purge = indexPurge(o.shared.id); o.shared = null; if (o.visibility !== 'org') o.visibility = 'private'; }
      move(o, 'Withdrawn', u.name, 'Withdrawn by author' + (purge ? '. Removed from search, cache and AIRA retrieval.' : ''));
      audit('obs.withdraw', id, purge ? 'Index purge ' + purge.ms.toFixed(1) + ' ms' : 'No shared copy');
      return { ok: true, data: { obs: viewObs(o, u), purge } };
    }
  },

  /* ---- moderation ---- */
  review: {
    queue() {
      const u = me(); const g = gate('review.queue', 'Moderation queue', [['Signed in', !!u], ['Moderator grant', hasG(u, 'moderator'), 'You need the moderator grant']]); if (!g.ok) return g;
      const rows = DB.obs.filter(o => o.propose && ['Submitted', 'In review', 'Needs clarification'].includes(o.status)).map(o => ({ id: o.id, title: o.title, status: o.status, offering: o.offering, flags: o.flags.length, updated: o.updated, version: o.version }));
      return { ok: true, data: rows };
    },
    claim(id) {
      const u = me(), o = DB.obs.find(x => x.id === id); if (!o) return nf();
      const g = gate('review.claim', 'Observation ' + id, [['Moderator grant', hasG(u, 'moderator')], ['Submitted by author', o.propose && o.status !== 'Draft', 'Unsubmitted drafts are private']]); if (!g.ok) return g;
      if (o.status === 'Submitted') { move(o, 'In review', u.name, 'Review started'); audit('review.claim', id); }
      return { ok: true };
    },
    clarify(id, reason) {
      const u = me(), o = DB.obs.find(x => x.id === id); if (!o) return nf();
      const g = gate('review.clarify', 'Observation ' + id, [['Moderator grant', hasG(u, 'moderator')], ['In review', o.status === 'In review', 'Start the review first']]); if (!g.ok) return g;
      if ((reason || '').trim().length < 10) return fail('Explain what the author needs to add (at least 10 characters).');
      o.returnedReason = reason.trim(); move(o, 'Needs clarification', 'Moderator', 'Returned with a question'); audit('review.clarify', id, reason);
      notify(o.authorId, 'Your submission “' + o.title + '” was returned with a question.', 'clar-' + id + o.history.length); return { ok: true };
    },
    reject(id, code, reason) {
      const u = me(), o = DB.obs.find(x => x.id === id); if (!o) return nf();
      const g = gate('review.reject', 'Observation ' + id, [['Moderator grant', hasG(u, 'moderator')], ['In review', o.status === 'In review', 'Start the review first']]); if (!g.ok) return g;
      if (!['Duplicate', 'Unsafe or confidential', 'Out of scope'].includes(code)) return fail('Choose a reason.');
      if ((reason || '').trim().length < 10) return fail('Add a short explanation the author will see.');
      const keep = !!o.shared;
      move(o, keep ? 'Published' : 'Rejected', 'Moderator', (keep ? 'New version not approved: ' : 'Rejected: ') + code);
      audit('review.reject', id, code + ': ' + reason);
      notify(o.authorId, (keep ? 'The new version of “' : 'Your submission “') + o.title + (keep ? '” wasn’t approved. The published version stays live.' : '” wasn’t published: ' + code.toLowerCase() + '. ' + reason.trim()), 'rej-' + id + o.history.length);
      return { ok: true };
    },
    publish(id, sf) {
      const u = me(), o = DB.obs.find(x => x.id === id); if (!o) return nf();
      const g = gate('review.publish', 'Observation ' + id, [['Moderator grant', hasG(u, 'moderator')], ['In review', o.status === 'In review', 'Start the review first'], ['Author gave publishing consent', o.consent.publish, 'No publishing consent on record']]); if (!g.ok) return g;
      const e = {};
      if ((sf.title || '').trim().length < 8 || sf.title.length > 120) e.title = 'Shared title needs 8 to 120 characters.';
      if ((sf.summary || '').trim().length < 40 || sf.summary.length > 600) e.summary = 'Shared summary needs 40 to 600 characters.';
      if (!INDUSTRIES.includes(sf.industry)) e.industry = 'Choose an industry.'; if (!REGIONS.includes(sf.region)) e.region = 'Choose a region.'; if (!PERIODS.includes(sf.period)) e.period = 'Choose a period.';
      if (!THEME[sf.theme] || sf.theme === 'other' && false) e.theme = 'Choose a theme.';
      const left = scan((sf.title || '') + ' ' + (sf.summary || ''));
      if (left.length) e.summary = 'The shared copy still contains: ' + left.map(x => x.match).join(', ') + '. Redact before publishing.';
      if (Object.keys(e).length) return fail('The shared copy can’t be published yet.', e);
      const attr = !!(sf.attribution && o.consent.attribution);
      o.shared = sharedFrom(o, { id: 's-' + o.id, version: o.version, title: sf.title.trim(), summary: sf.summary.trim(), offering: o.offering, industry: sf.industry, region: sf.region, period: sf.period, theme: sf.theme, topic: o.type, evidence: o.evidence, confidence: o.confidence, attribution: attr ? orgName(o.orgId) : null, quality: 'Reviewer assessed: ' + (sf.quality || 'good').toLowerCase(), publishedAt: new Date().toISOString() });
      move(o, 'Published', u.name, 'Published shared version ' + o.version + ' (reviewed fields only)');
      indexPublish(o); audit('review.publish', id, 'Shared version ' + o.version + ', theme ' + sf.theme);
      notify(o.authorId, 'Your contribution “' + o.title + '” was published to the learning community in de-identified form.', 'pub-' + id + o.version);
      return { ok: true };
    },
    reports() {
      const u = me(); const g = gate('review.reports', 'Reports', [['Signed in', !!u], ['Moderator grant', hasG(u, 'moderator'), 'You need the moderator grant']]); if (!g.ok) return g;
      return { ok: true, data: DB.reports.filter(r => r.state !== 'Closed').map(r => { const s = IDX.search.get(r.sid) || null; const o = DB.obs.find(x => x.shared && x.shared.id === r.sid || x.id === r.obsId); return { id: r.id, kind: r.kind, reason: r.reason, state: r.state, sid: r.sid, title: r.kind === 'Comment' ? (DB.comments.find(c => c.id === r.cid) || {}).text : (s ? s.title : (o ? o.title : '')), obsId: o ? o.id : null, status: o ? o.status : '' }; }) };
    },
    unpublish(rid, reason) {
      const u = me(), r = DB.reports.find(x => x.id === rid); if (!r) return nf();
      const g = gate('review.unpublish', 'Report ' + rid, [['Moderator grant', hasG(u, 'moderator')]]); if (!g.ok) return g;
      if (r.kind === 'Comment') { DB.comments = DB.comments.filter(c => c.id !== r.cid); r.state = 'Closed'; audit('comment.remove', r.cid, reason || ''); return { ok: true }; }
      const o = DB.obs.find(x => x.id === r.obsId); if (!o || !o.shared) return fail('Nothing is published for this report.');
      const purge = indexPurge(o.shared.id); r.state = 'Under review'; r.unpublished = o.shared; o.shared = null;
      move(o, 'Unpublished', 'Moderator', 'Temporarily unpublished while a report is reviewed'); audit('review.unpublish', o.id, reason || 'Report ' + rid);
      notify(o.authorId, 'Your published contribution “' + o.title + '” was temporarily unpublished while a report is reviewed.', 'unpub-' + rid);
      return { ok: true, data: { purge } };
    },
    resolveReport(rid, outcome) {
      const u = me(), r = DB.reports.find(x => x.id === rid); if (!r) return nf();
      const g = gate('review.resolve', 'Report ' + rid, [['Moderator grant', hasG(u, 'moderator')]]); if (!g.ok) return g;
      const o = DB.obs.find(x => x.id === r.obsId);
      if (o && o.status === 'Unpublished') {
        if (outcome === 'restore') { o.shared = r.unpublished; move(o, 'Published', 'Moderator', 'Report dismissed. Restored to published.'); indexPublish(o); notify(o.authorId, 'Your contribution “' + o.title + '” was reviewed and restored.', 'rest-' + rid); }
        else { move(o, 'Rejected', 'Moderator', 'Report upheld. Contribution closed.'); notify(o.authorId, 'Your contribution “' + o.title + '” was closed after a report review.', 'close-' + rid); }
      }
      r.state = 'Closed'; audit('review.resolve', rid, outcome); return { ok: true };
    }
  },

  /* ---- shared learning ---- */
  shared: {
    search(f) {
      f = f || {}; const u = me(), org = myOrg();
      const g = gate('shared.search', 'Approved shared feed', POL.shared(u, org)); if (!g.ok) return g;
      const key = JSON.stringify(f); let ids = IDX.cache.get(key);
      if (!ids) {
        const q = (f.q || '').toLowerCase().split(/\s+/).filter(Boolean);
        ids = [...IDX.search.values()].filter(s => (!f.offering || s.offering === f.offering) && (!f.industry || s.industry === f.industry) && (!f.region || s.region === f.region) && (!f.period || s.period === f.period) && (!f.topic || s.topic === f.topic) && q.every(w => (s.title + ' ' + s.summary + ' ' + THEME[s.theme].name).toLowerCase().includes(w))).map(s => s.id);
        IDX.cache.set(key, ids);
      }
      const items = ids.map(i => IDX.search.get(i)).filter(Boolean);
      const orgs = new Set(items.map(s => IDX.meta.get(s.id).orgId));
      const all = [...IDX.search.values()];
      const facets = { offering: [...new Set(all.map(s => s.offering))], industry: [...new Set(all.map(s => s.industry))], region: [...new Set(all.map(s => s.region))], period: [...new Set(all.map(s => s.period))], topic: [...new Set(all.map(s => s.topic))] };
      return { ok: true, data: { items: items.map(pubView), cohort: orgs.size >= CFG.k ? orgs.size : null, suppressed: items.length > 0 && orgs.size < CFG.k, k: CFG.k, facets, bookmarks: DB.bookmarks[u.id] || [] } };
    },
    themes() {
      const u = me(), org = myOrg(); const g = gate('shared.themes', 'Theme dashboard', POL.shared(u, org)); if (!g.ok) return g;
      const by = {};
      IDX.search.forEach((s, id) => { const b = by[s.theme] = by[s.theme] || { items: [], orgs: new Set() }; b.items.push(s); b.orgs.add(IDX.meta.get(id).orgId); });
      const out = Object.keys(by).map(t => {
        const b = by[t], n = b.orgs.size, ok = n >= CFG.k;
        const periods = [...new Set(b.items.map(s => s.period))].sort();
        return { id: t, name: THEME[t].name, offerings: THEME[t].offerings, suppressed: !ok, orgCount: ok ? n : null, k: CFG.k, period: periods[0] + (periods.length > 1 ? ' to ' + periods[periods.length - 1] : ''), latest: b.items.map(s => s.publishedAt).sort().pop(), limits: ok ? (n <= 4 ? 'Small sample (' + n + ' organisations). Treat it as an early signal, not market prevalence or proof of cause.' : 'Based on ' + n + ' organisations. Popularity is not prevalence.') : '', items: ok ? b.items.map(s => ({ id: s.id, title: s.title, confidence: s.confidence, evidence: s.evidence })) : [], ideas: DB.ideas.filter(i => i.clientVisible || isEmp(u)).filter(i => i.refs.some(r => b.items.some(s => s.id === r))).map(i => ({ id: i.id, title: i.title, status: i.status })) };
      });
      return { ok: true, data: out };
    },
    report(sid, reason) {
      const u = me(), org = myOrg(); const g = gate('shared.report', 'Shared item ' + sid, [...POL.shared(u, org), ['Item is currently published', IDX.search.has(sid), 'This item is no longer available']]); if (!g.ok) return g;
      if ((reason || '').trim().length < 10) return fail('Tell us briefly what looks wrong (at least 10 characters).');
      const meta = IDX.meta.get(sid);
      DB.reports.unshift({ id: uid('rep'), kind: 'Contribution', sid, obsId: meta.obsId, reason: reason.trim(), state: 'Open', reporter: u.id });
      notifyGrant('moderator', 'A published contribution was reported.', 'rep-' + sid + DB.reports.length); return { ok: true };
    },
    bookmark(sid) {
      const u = me(); const g = gate('shared.bookmark', sid, [['Signed in', !!u]]); if (!g.ok) return g;
      const b = DB.bookmarks[u.id] = DB.bookmarks[u.id] || []; const i = b.indexOf(sid); if (i >= 0) b.splice(i, 1); else b.push(sid); return { ok: true, data: b.slice() };
    },
    saveSearch(f) { const u = me(); const g = gate('shared.savesearch', 'Saved search', [['Signed in', !!u]]); if (!g.ok) return g; (DB.saved[u.id] = DB.saved[u.id] || []).push({ id: uid('ss'), f }); return { ok: true }; },
    saved() { const u = me(); return { ok: true, data: u ? (DB.saved[u.id] || []) : [] }; },
    exportCsv(f) {
      const r = api.shared.search(f); if (!r.ok) return r;
      const rows = [['title', 'offering', 'industry', 'region', 'period', 'confidence'], ...r.data.items.map(s => [s.title, s.offering, s.industry, s.region, s.period, s.confidence])];
      return { ok: true, data: rows.map(x => x.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n') };
    },
    comments(sid) {
      const u = me(), org = myOrg(); const g = gate('comments.read', 'Comments on ' + sid, [...POL.shared(u, org), ['Parent is published', IDX.search.has(sid), 'Parent item is no longer available']]); if (!g.ok) return g;
      return { ok: true, data: DB.comments.filter(c => c.sid === sid).map(c => ({ id: c.id, text: c.text, t: c.t, who: c.userId === u.id ? 'You' : (isEmp(DB.users.find(x => x.id === c.userId)) ? 'Azentio team' : (c.orgId === org ? 'Your organisation' : 'Another client member')) })) };
    },
    addComment(sid, text) {
      const u = me(), org = myOrg(); const g = gate('comments.write', 'Comment on ' + sid, [...POL.shared(u, org), ['Parent is published', IDX.search.has(sid), 'Parent item is no longer available']]); if (!g.ok) return g;
      text = (text || '').trim(); if (text.length < 3 || text.length > 400) return fail('Comments need 3 to 400 characters.');
      if (scan(text).some(x => x.type === 'identity')) return fail('Remove names, emails or account numbers from your comment.');
      DB.comments.push({ id: uid('c'), sid, userId: u.id, orgId: org, text, t: new Date().toISOString() }); return { ok: true };
    },
    reportComment(cid) {
      const u = me(); const g = gate('comments.report', 'Comment ' + cid, [['Signed in', !!u]]); if (!g.ok) return g;
      const c = DB.comments.find(x => x.id === cid); if (!c) return nf();
      DB.reports.unshift({ id: uid('rep'), kind: 'Comment', cid, sid: c.sid, reason: 'Reported comment', state: 'Open', reporter: u.id }); notifyGrant('moderator', 'A comment was reported.', 'repc-' + cid); return { ok: true };
    }
  },
  aira: {
    ask(q) {
      const u = me(), org = myOrg(); const g = gate('aira.ask', 'AIRA retrieval', POL.shared(u, org)); if (!g.ok) return g;
      const w = (q || '').toLowerCase().split(/\W+/).filter(x => x.length > 3);
      if (!w.length) return fail('Ask a question with a few more words.');
      const hits = [...IDX.aira.values()].map(d => ({ d, s: w.filter(x => d.text.toLowerCase().includes(x)).length })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 3);
      if (!hits.length) return { ok: true, data: { answer: 'No approved contributions match that question. AIRA only answers from approved shared learning, so it can’t help with this one.', cites: [] } };
      const orgs = new Set(hits.map(h => IDX.meta.get(h.d.id).orgId));
      const answer = 'Approved contributions point to this: ' + hits.map(h => IDX.search.get(h.d.id).summary.split('. ')[0].replace(/\.$/, '')).join('. ') + '.' + (orgs.size < CFG.k ? ' Only ' + orgs.size + ' contributing organisation' + (orgs.size === 1 ? '' : 's') + ' support this, which is below the ' + CFG.k + '-organisation threshold, so treat it as anecdote.' : ' This draws on ' + orgs.size + ' organisations; it is a pattern in contributions, not a measure of market prevalence.');
      return { ok: true, data: { answer, cites: hits.map(h => ({ sid: h.d.id, title: IDX.search.get(h.d.id).title })) } };
    }
  },

  /* ---- ideas ---- */
  ideas: {
    list() {
      const u = me(); const g = gate('ideas.list', 'Improvement ideas', [['Signed in', !!u], ['Participant with learning access', isEmp(u) || !!myOrg(), 'Choose an active workspace']]); if (!g.ok) return g;
      if (isEmp(u)) return { ok: true, data: DB.ideas.map(i => Object.assign({}, i, { refTitles: i.refs.map(r => (IDX.search.get(r) || {}).title).filter(Boolean), canEdit: hasG(u, 'product_owner') })) };
      return { ok: true, data: DB.ideas.filter(i => i.clientVisible).map(i => ({ id: i.id, title: i.title, offering: i.offering, status: i.status, plain: PLAIN[i.status], owner: i.owner, updated: i.updated, clientUpdate: i.clientUpdate, refTitles: i.refs.map(r => (IDX.search.get(r) || {}).title).filter(Boolean) })) };
    },
    create(f) {
      const u = me(); const g = gate('ideas.create', 'New idea', [['Signed in', !!u], ['Product owner grant', hasG(u, 'product_owner'), 'Only product owners can create ideas']]); if (!g.ok) return g;
      const e = {};
      if ((f.title || '').trim().length < 6 || f.title.length > 100) e.title = 'Title needs 6 to 100 characters.';
      if ((f.problem || '').trim().length < 20 || f.problem.length > 600) e.problem = 'Problem statement needs 20 to 600 characters.';
      if (!DB.products.some(p => p.id === f.offering && !p.internalOnly)) e.offering = 'Choose an offering.';
      if ((f.outcome || '').trim().length < 10 || f.outcome.length > 300) e.outcome = 'Proposed outcome needs 10 to 300 characters.';
      if ((f.owner || '').trim().length < 3) e.owner = 'Name an owner or team.'; if (!['Low', 'Medium', 'High'].includes(f.priority)) e.priority = 'Choose a priority.';
      const refs = (f.refs || []).filter(r => IDX.search.has(r)); if (!refs.length) e.refs = 'Link at least one approved contribution.';
      if (Object.keys(e).length) return fail('Fix the highlighted fields.', e);
      const idea = { id: uid('idea'), title: f.title.trim(), problem: f.problem.trim(), offering: f.offering, outcome: f.outcome.trim(), refs, owner: f.owner.trim(), priority: f.priority, status: 'Proposed', updated: new Date().toISOString(), clientVisible: false, clientUpdate: '', internalNotes: '', audit: [{ t: new Date().toISOString(), who: u.name, text: 'Created as Proposed' }] };
      DB.ideas.unshift(idea); audit('ideas.create', idea.id, idea.title); return { ok: true, data: idea };
    },
    setStatus(id, status, clientVisible, update) {
      const u = me(), i = DB.ideas.find(x => x.id === id); if (!i) return nf();
      const g = gate('ideas.status', 'Idea ' + id, [['Product owner grant', hasG(u, 'product_owner')]]); if (!g.ok) return g;
      if (!IDEA_STATUS.includes(status)) return fail('Choose a status.');
      update = (update || '').trim(); if (update.length > 300) return fail('Keep the client update under 300 characters.');
      if (clientVisible && update && scan(update).some(x => x.type === 'identity' || x.type === 'pricing')) return fail('The client update mentions names, numbers or amounts. Keep it to the theme and the decision.');
      const old = i.status; i.status = status; i.updated = new Date().toISOString(); i.clientVisible = !!clientVisible; if (update) i.clientUpdate = update;
      i.audit.push({ t: i.updated, who: u.name, text: 'Status ' + old + ' to ' + status + (clientVisible ? ' (visible to clients)' : ' (internal)') }); audit('ideas.status', id, old + ' to ' + status);
      if (clientVisible) i.refs.forEach(r => { const m = IDX.meta.get(r); const o = m && DB.obs.find(x => x.id === m.obsId); if (o) notify(o.authorId, 'Update on a theme you contributed to: “' + i.title + '” is now ' + status.toLowerCase() + '. This is not a delivery commitment.', 'idea-' + id + status + o.authorId); });
      return { ok: true };
    }
  },

  /* ---- client organisation ---- */
  org: {
    team() {
      const u = me(), org = myOrg(); const g = gate('org.team', 'Organisation members', [['Signed in', !!u], ['Active client workspace', !!org], ['Client administrator of this organisation', isClientAdmin(u, org), 'Only client administrators manage members']]); if (!g.ok) return g;
      return { ok: true, data: { orgName: orgName(org), domains: DB.orgs.find(o => o.id === org).domains, members: DB.users.filter(x => memOf(x, org)).map(x => ({ id: x.id, name: x.name, email: x.email, role: memOf(x, org).role })), invites: DB.invites.filter(i => i.org === org) } };
    },
    invite(email, role) {
      const u = me(), org = myOrg(); email = (email || '').trim().toLowerCase();
      const o = DB.orgs.find(x => x.id === org);
      const g = gate('org.invite', 'Invite to ' + (o ? o.name : 'workspace'), [['Client administrator of this organisation', isClientAdmin(u, org), 'Only client administrators can invite'], ['Role is an approved client role', CLIENT_ROLES.includes(role), 'Blocked: “' + role + '” is a platform role. Client administrators can’t grant it'], ['Email domain is approved for this organisation', !!o && emailOk(email) && o.domains.includes(email.split('@')[1]), 'Invitees must use an approved organisation domain']]);
      if (!g.ok) { audit('org.invite.denied', org || '-', role + ' ' + email); return g; }
      const inv = { id: uid('inv'), org, email, role, token: 'NW-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(), state: 'Pending', by: u.id, exp: new Date(Date.now() + 7 * 864e5).toISOString() };
      DB.invites.unshift(inv); audit('org.invite', inv.id, email + ' as ' + role); return { ok: true, data: inv };
    },
    revoke(id) {
      const u = me(), org = myOrg(), inv = DB.invites.find(i => i.id === id);
      const g = gate('org.revoke', 'Invitation ' + id, [['Client administrator of this organisation', isClientAdmin(u, org)], ['Invitation belongs to this organisation', !!inv && inv.org === org, 'Not your organisation’s invitation']]); if (!g.ok) return g;
      if (inv.state === 'Pending') { inv.state = 'Revoked'; audit('org.revoke', id); } return { ok: true };
    },
    setRole(userId, role) {
      const u = me(), org = myOrg(), t = DB.users.find(x => x.id === userId);
      const g = gate('org.role', 'Role change', [['Client administrator of this organisation', isClientAdmin(u, org)], ['Role is an approved client role', CLIENT_ROLES.includes(role), 'Blocked: that role can’t be granted by a client administrator'], ['Target is a member of this organisation', !!t && !!memOf(t, org), 'Not a member of your organisation'], ['Not changing your own role', userId !== u.id, 'Ask another administrator']]); if (!g.ok) return g;
      memOf(t, org).role = role; audit('org.role', userId, role); return { ok: true };
    },
    tickets: {
      create(subject, body) {
        const u = me(), org = myOrg(); const g = gate('ticket.create', 'Support ticket', [['Signed in', !!u], ['Active client workspace', !!org]]); if (!g.ok) return g;
        if ((subject || '').trim().length < 5 || (body || '').trim().length < 10) return fail('Add a subject (5+ characters) and a description (10+ characters).');
        const t = { id: 'TCK-' + (4100 + DB.tickets.length), org, by: u.id, subject: subject.trim(), body: body.trim(), state: 'Sent to support desk', t: new Date().toISOString() }; DB.tickets.unshift(t); return { ok: true, data: t };
      },
      list() { const u = me(), org = myOrg(); const g = gate('ticket.list', 'Support tickets', [['Signed in', !!u], ['Active client workspace', !!org]]); if (!g.ok) return g; return { ok: true, data: DB.tickets.filter(t => t.org === org) }; }
    }
  },

  /* ---- notifications ---- */
  notifs: {
    list() { const u = me(); if (!u) return { ok: true, data: [] }; return { ok: true, data: DB.notifs.filter(n => n.userId === u.id) }; },
    readAll() { const u = me(); DB.notifs.forEach(n => { if (u && n.userId === u.id) n.read = true; }); return { ok: true }; }
  },

  /* ---- publisher ---- */
  content: {
    setBanner(text) {
      const u = me(); const g = gate('content.banner', 'Homepage banner', [['Signed in', !!u], ['Publisher grant', hasG(u, 'publisher'), 'Employees without the publisher grant can’t change homepage content']]); if (!g.ok) return g;
      text = (text || '').trim(); if (text.length < 10 || text.length > 140) return fail('Banner text needs 10 to 140 characters.');
      CFG.banner = text; audit('content.banner', 'home', text); return { ok: true };
    },
    allVideos() { const u = me(); const g = gate('content.videos', 'Media library', [['Publisher grant', hasG(u, 'publisher'), 'Publisher grant needed']]); if (!g.ok) return g; return { ok: true, data: DB.videos.map(v => Object.assign({}, v)) }; },
    setAudience(id, audience, orgs) {
      const u = me(), v = DB.videos.find(x => x.id === id); if (!v) return nf();
      const g = gate('content.audience', 'Video audience', [['Publisher grant', hasG(u, 'publisher'), 'Publisher grant needed']]); if (!g.ok) return g;
      if (!['public', 'employee', 'clients'].includes(audience)) return fail('Choose an audience.');
      if (audience === 'clients' && !(orgs && orgs.length)) return fail('Pick at least one client organisation. Empty client audiences aren’t treated as public.');
      v.audience = audience; v.orgs = audience === 'clients' ? orgs.filter(o => DB.orgs.some(x => x.id === o)) : []; audit('content.audience', id, audience + ' ' + v.orgs.join(',')); return { ok: true };
    }
  },

  /* ---- admin ---- */
  admin: {
    overview() {
      const u = me(); const g = gate('admin.overview', 'Administration', [['Signed in', !!u], ['Portal administrator grant', hasG(u, 'portal_admin'), 'Portal administrator grant needed']]); if (!g.ok) return g;
      return { ok: true, data: { orgs: DB.orgs.map(o => ({ id: o.id, name: o.name, entitlements: o.entitlements, members: DB.users.filter(x => memOf(x, o.id)).length })), employees: DB.users.filter(x => x.employee).map(x => ({ id: x.id, name: x.name, email: x.email, grants: x.grants.slice() })), cfg: { k: CFG.k, sla: CFG.slaSeconds }, audit: DB.audit.slice(0, 40), outbox: DB.outbox.slice(0, 10), leads: DB.leads.slice(0, 10).map(l => ({ id: l.id, kind: l.kind, t: l.t, who: l.f.name + ' (' + l.f.email + ')' })), purges: IDX.purges.slice(0, 5), support: DB.support.filter(s => s.adminId === u.id) } };
    },
    setGrant(userId, grant, on) {
      const u = me(), t = DB.users.find(x => x.id === userId); const g = gate('admin.grant', 'Role grant', [['Portal administrator grant', hasG(u, 'portal_admin')], ['Known grant', GRANTS.includes(grant)], ['Target is an approved employee', !!t && !!t.employee], ['Not removing your own admin grant', !(userId === u.id && grant === 'portal_admin' && !on), 'You can’t remove your own administrator grant']]); if (!g.ok) return g;
      const i = t.grants.indexOf(grant); if (on && i < 0) t.grants.push(grant); if (!on && i >= 0) t.grants.splice(i, 1); audit('admin.grant', userId, (on ? 'Granted ' : 'Revoked ') + grant); return { ok: true };
    },
    setThreshold(k) {
      const u = me(); const g = gate('admin.config', 'Cohort threshold', [['Portal administrator grant', hasG(u, 'portal_admin')]]); if (!g.ok) return g;
      k = parseInt(k, 10); if (!(k >= 3 && k <= 8)) return fail('The threshold must be between 3 and 8 organisations.');
      CFG.k = k; audit('admin.config', 'k', 'Minimum distinct organisations set to ' + k); return { ok: true };
    },
    supportAuthorise(obsId, reason) {
      const u = me(); const o = DB.obs.find(x => x.id === obsId);
      const g = gate('support.authorise', 'Support access to ' + obsId, [['Portal administrator grant', hasG(u, 'portal_admin')]]); if (!g.ok) return g;
      if (!o) return nf(); if ((reason || '').trim().length < 15) return fail('Give a reason of at least 15 characters. It is shown to the author and audited.');
      DB.support.push({ id: uid('sup'), adminId: u.id, obsId, reason: reason.trim(), until: new Date(Date.now() + 15 * 60e3).toISOString() });
      audit('support.authorise', obsId, reason.trim() + ' (15 minutes)'); notify(o.authorId, 'Azentio support was authorised to view your record “' + o.title + '” for 15 minutes. Reason: ' + reason.trim(), 'sup-' + obsId + DB.support.length); return { ok: true };
    },
    listAllObs() { const u = me(); const g = gate('admin.obsindex', 'Record index (metadata only)', [['Portal administrator grant', hasG(u, 'portal_admin')]]); if (!g.ok) return g; return { ok: true, data: DB.obs.map(o => ({ id: o.id, org: orgName(o.orgId), status: o.status })) }; }
  },

  /* ---- employee lab ---- */
  lab: {
    list() {
      const u = me(); const g = gate('lab.list', 'Employee lab', [['Signed in', !!u], ['Approved employee', isEmp(u), 'The lab is employee-only']]); if (!g.ok) return g;
      return { ok: true, data: { experiments: DB.experiments.slice(), teams: LAB.teams, notes: LAB.notes, library: LAB.library } };
    },
    submit(title) {
      const u = me(); const g = gate('lab.submit', 'Experiment', [['Approved employee', isEmp(u), 'Employees only']]); if (!g.ok) return g;
      title = (title || '').trim(); if (title.length < 5 || title.length > 100) return fail('Give the experiment a title of 5 to 100 characters.');
      DB.experiments.unshift({ id: uid('x'), title, owner: u.name, state: 'Idea', votes: 0 }); return { ok: true };
    },
    vote(id) { const u = me(); const g = gate('lab.vote', 'Experiment', [['Approved employee', isEmp(u)]]); if (!g.ok) return g; const x = DB.experiments.find(e => e.id === id); if (x) x.votes++; return { ok: true }; },
    feedback(id, up) { const u = me(); const g = gate('lab.feedback', 'Library article', [['Approved employee', isEmp(u)]]); if (!g.ok) return g; const x = LAB.library.find(e => e.id === id); if (x) { if (up) x.up++; else x.down++; } return { ok: true }; }
  },
  /* run a request as an anonymous visitor without changing the session (for the security lab) */
  probe(kind) {
    const save = { uid: S.uid, org: S.org }; S.uid = null; S.org = null; let r;
    try { r = kind === 'shared' ? api.shared.search({}) : kind === 'obs' ? api.obs.get('obs-hb-draft') : api.media('v-emp-1'); } finally { S.uid = save.uid; S.org = save.org; }
    return r;
  },

  /* ---- federated lab (P2) ---- */
  fed: {
    run(opts) {
      const u = me(); const g = gate('fed.run', 'Federated programme', [['Signed in', !!u], ['Approved employee', isEmp(u), 'The federated lab is employee-only']]); if (!g.ok) return g;
      const r = fedRun(opts || {}); r.id = uid('fr'); DB.fed.unshift(r); return { ok: true, data: r };
    },
    registry() { const u = me(); const g = gate('fed.registry', 'Candidate registry', [['Approved employee', isEmp(u)]]); if (!g.ok) return g; return { ok: true, data: DB.fed.filter(x => x.candidate) }; },
    register(id) {
      const u = me(), r = DB.fed.find(x => x.id === id); const g = gate('fed.register', 'Candidate model', [['Approved employee', isEmp(u)]]); if (!g.ok) return g; if (!r) return nf();
      r.candidate = { version: '0.' + (DB.fed.filter(x => x.candidate).length + 1) + '.0', state: 'Candidate', log: [{ t: new Date().toISOString(), who: u.name, text: 'Registered as candidate. Not deployed.' }] }; audit('fed.register', id, r.candidate.version); return { ok: true, data: r };
    },
    decide(id, d) {
      const u = me(), r = DB.fed.find(x => x.id === id); const g = gate('fed.decide', 'Deployment decision', [['Approved employee', isEmp(u)], ['Product owner grant for deployment decisions', hasG(u, 'product_owner') || d === 'review', 'Only product owners can approve or roll back']]); if (!g.ok) return g;
      if (!r || !r.candidate) return nf(); const c = r.candidate;
      const next = { review: 'In human review', approve: 'Approved (simulated deployment)', rollback: 'Rolled back' }[d]; if (!next) return fail('Unknown decision.');
      if (d === 'approve' && c.state !== 'In human review') return fail('Request human review first.'); if (d === 'rollback' && !c.state.startsWith('Approved')) return fail('Only a deployed candidate can be rolled back.');
      c.state = next; c.log.push({ t: new Date().toISOString(), who: u.name, text: next }); audit('fed.decide', id, next); return { ok: true, data: r };
    }
  }
};

/* ---------------------- sandbox scenarios (synthetic) ---------------------- */
const SCEN = {
  fai: [
    { id: 'garden', name: 'Seasonal garden centre', rev: [18, 20, 48, 92, 120, 96, 70, 60, 44, 30, 22, 18], margin: 0.42, fixed: 11, debt: 5 },
    { id: 'steady', name: 'Steady B2B services', rev: [48, 50, 49, 51, 50, 52, 50, 49, 51, 50, 52, 48], margin: 0.35, fixed: 9, debt: 4 },
    { id: 'ski', name: 'Ski-resort operator', rev: [95, 90, 70, 30, 18, 15, 14, 16, 22, 40, 75, 100], margin: 0.5, fixed: 14, debt: 8 }
  ],
  cda: [
    { id: 'c1', name: 'Established retailer, thin margin', inputs: { 'Years trading': 9, 'Debt service cover': 1.3, 'Sector risk': 'Medium', 'Collateral cover': '85%' } },
    { id: 'c2', name: 'New-to-bank manufacturer', inputs: { 'Years trading': 2, 'Debt service cover': 1.8, 'Sector risk': 'Low', 'Collateral cover': '120%' } }
  ],
  doc: [
    { id: 'd1', name: 'Clean statement pack', fields: [['Opening balance', 0.99], ['Closing balance', 0.98], ['Total credits', 0.97], ['Account holder', 0.99]] },
    { id: 'd2', name: 'Scanned, annotated pack', fields: [['Opening balance', 0.91], ['Closing balance', 0.62], ['Total credits', 0.58], ['Account holder', 0.95]] }
  ]
};
SCEN['xp-seas'] = SCEN.fai;
function runScenario(pid, sid, ai) {
  const list = SCEN[pid] || []; const s = list.find(x => x.id === sid) || list[0];
  if (pid === 'fai' || pid === 'xp-seas') {
    const op = s.rev.map(r => r * s.margin - s.fixed), cov = op.map(o => o / s.debt);
    const avg = s.rev.reduce((a, b) => a + b, 0) / 12, naive = (avg * s.margin - s.fixed) / s.debt;
    const roll = cov.map((_, i) => (cov[i] + cov[(i + 1) % 12] + cov[(i + 2) % 12]) / 3), trough = Math.min(...roll);
    const reserve = op.reduce((a, o) => a + Math.max(0, s.debt - o), 0), deficit = op.filter(o => o < s.debt).length;
    const verdict = trough >= 1.2 ? 'Comfortable in every quarter' : trough >= 1 ? 'Thin in the quietest quarter' : 'Quietest quarter does not cover debt service';
    return { kind: 'fai', scenario: s.name, series: s.rev, op, debt: s.debt, naive, trough, reserve, deficit, verdict, internal: pid === 'xp-seas', narrative: ai ? 'the annual average shows ' + naive.toFixed(2) + 'x cover, but the quietest three months run at ' + trough.toFixed(2) + 'x. ' + deficit + ' month' + (deficit === 1 ? '' : 's') + ' fall short of debt service, so a reserve of about £' + reserve.toFixed(0) + 'k would bridge them.' : null };
  }
  if (pid === 'cda') {
    const i = s.inputs; let score = 50 + Math.min(i['Years trading'], 10) * 2 + (i['Debt service cover'] - 1) * 20 + (i['Sector risk'] === 'Low' ? 8 : i['Sector risk'] === 'Medium' ? 0 : -8) + (parseInt(i['Collateral cover'], 10) - 100) / 4;
    score = Math.round(score); const rules = [['Trading history of 3+ years', i['Years trading'] >= 3], ['Debt service cover of 1.25x or more', i['Debt service cover'] >= 1.25], ['Collateral cover of 100% or more', parseInt(i['Collateral cover'], 10) >= 100]];
    return { kind: 'cda', scenario: s.name, inputs: i, score, rules, verdict: rules.every(r => r[1]) ? 'Sandbox suggestion: proceed to analyst review' : 'Sandbox suggestion: refer for closer review', narrative: ai ? '' + rules.filter(r => !r[1]).length + ' of 3 policy rules were not met. A human analyst makes the decision.' : null };
  }
  const low = s.fields.filter(f => f[1] < 0.8);
  return { kind: 'doc', scenario: s.name, fields: s.fields, verdict: low.length ? low.length + ' field' + (low.length > 1 ? 's' : '') + ' flagged for human review' : 'All fields above the confidence threshold', narrative: ai ? 'fields under 0.80 confidence are routed to a reviewer instead of being accepted silently.' : null };
}

/* ------------------------ federated simulation ------------------------ */
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const TRUEW = [1.5, -1.3, 1.0, 0.8];
function gauss(r) { let u = 0; while (!u) u = r(); const v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function genData(seed, n, shift) { const r = rng(seed), X = [], Y = []; for (let i = 0; i < n; i++) { const x = TRUEW.map((_, j) => gauss(r) + shift[j]); const z = x.reduce((a, v, j) => a + v * TRUEW[j], 0) + 0.4 * gauss(r); X.push(x.concat(1)); Y.push(z > 0 ? 1 : 0); } return { X, Y }; }
const sig = z => 1 / (1 + Math.exp(-z));
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const norm = v => Math.sqrt(dot(v, v));
function trainLocal(w, D, epochs, lr, flip) {
  let a = w.slice();
  for (let e = 0; e < epochs; e++) { const g = [0, 0, 0, 0, 0]; D.X.forEach((x, i) => { const y = flip ? 1 - D.Y[i] : D.Y[i]; const p = sig(dot(a, x)); x.forEach((xv, j) => g[j] += (p - y) * xv); }); a = a.map((v, j) => v - lr * g[j] / D.X.length); }
  return a;
}
const acc = (w, D) => D.X.filter((x, i) => (sig(dot(w, x)) > 0.5 ? 1 : 0) === D.Y[i]).length / D.X.length;
const cosine = (a, b) => dot(a, b) / ((norm(a) * norm(b)) || 1);
const FED_CLIENTS = [
  { id: 'Client A', n: 300, shift: [0, 0, 0, 0], seed: 11 }, { id: 'Client B', n: 220, shift: [0.9, -0.9, 0.6, 0.5], seed: 22 },
  { id: 'Client C', n: 90, shift: [-0.5, 0.4, -0.3, -0.2], seed: 33 }, { id: 'Client D', n: 160, shift: [0.1, 0, 0.1, 0], seed: 44 }
];
function fedRun(o) {
  const rounds = 5, clip = o.clip || 1, minCohort = 3, withdrawn = new Set(o.withdrawn || []);
  const clients = FED_CLIENTS.map(c => Object.assign({}, c, { data: genData(c.seed, c.n, c.shift) }));
  if (o.poison) clients.push({ id: 'Client X', n: 200, shift: [0, 0, 0, 0], seed: 55, data: genData(55, 200, [0, 0, 0, 0]), bad: true });
  const hold = genData(999, 400, [0, 0, 0, 0]); let w = [0, 0, 0, 0, 0]; const log = [], curve = [{ r: 0, acc: acc(w, hold) }];
  for (let r = 1; r <= rounds; r++) {
    const rows = []; const ups = [];
    clients.forEach(c => {
      if (withdrawn.has(c.id)) { rows.push({ id: c.id, n: c.n, status: 'Withdrew from programme', norm: null, cos: null, weight: 0 }); return; }
      if (o.dropout && c.id === 'Client D' && r >= 2 && r <= 3) { rows.push({ id: c.id, n: c.n, status: 'Dropped out', norm: null, cos: null, weight: 0 }); return; }
      let wl = trainLocal(w, c.data, 5, 1.0, c.bad); let d = wl.map((v, j) => v - w[j]); if (c.bad) d = d.map(v => -4 * v);
      ups.push({ c, d });
    });
    const meanD = ups.length ? ups[0].d.map((_, j) => ups.reduce((s, u) => s + u.d[j], 0) / ups.length) : [0, 0, 0, 0, 0];
    const norms = ups.map(u => norm(u.d)).sort((a, b) => a - b), med = norms.length ? norms[Math.floor(norms.length / 2)] : 0;
    const good = [];
    ups.forEach(u => {
      const others = ups.filter(x => x !== u); const mo = others.length ? others[0].d.map((_, j) => others.reduce((s, x) => s + x.d[j], 0) / others.length) : meanD;
      const cs = cosine(u.d, mo), nm = norm(u.d), finite = u.d.every(Number.isFinite);
      let status = 'Accepted'; if (!finite) status = 'Rejected: invalid update'; else if (nm > 3 * med + 1e-9 && ups.length > 2) status = 'Rejected: norm outlier'; else if (cs < -0.2) status = 'Rejected: points against the others';
      rows.push({ id: u.c.id, n: u.c.n, status, norm: nm, cos: cs, weight: 0, d: u.d }); if (status === 'Accepted') good.push(u);
    });
    let skipped = false;
    if (good.length < minCohort) { skipped = true; rows.forEach(x => { if (x.status === 'Accepted') x.status = 'Not used: below minimum cohort'; }); }
    else {
      const tot = good.reduce((s, u) => s + u.c.n, 0); const agg = [0, 0, 0, 0, 0];
      good.forEach(u => { const sc = Math.min(1, clip / (norm(u.d) || 1)); const wt = u.c.n / tot; rows.find(x => x.id === u.c.id).weight = wt; u.d.forEach((v, j) => agg[j] += v * sc * wt); });
      w = w.map((v, j) => v + agg[j]);
    }
    rows.forEach(x => delete x.d);
    curve.push({ r, acc: acc(w, hold) }); log.push({ r, rows, skipped });
  }
  const majority = Math.max(hold.Y.filter(y => y).length, hold.Y.filter(y => !y).length) / hold.Y.length;
  const localOnly = acc(trainLocal([0, 0, 0, 0, 0], clients[0].data, 25, 1.0), hold);
  const per = clients.filter(c => !c.bad).map(c => ({ id: c.id, n: c.n, pos: c.data.Y.filter(y => y).length / c.n, localAcc: acc(trainLocal([0, 0, 0, 0, 0], c.data, 25, 1.0), hold) }));
  return { opts: { dropout: !!o.dropout, poison: !!o.poison, clip, withdrawn: [...withdrawn] }, rounds: log, curve, baseline: { majority, localOnly }, finalAcc: curve[curve.length - 1].acc, per, method: 'Sample-weighted averaging (FedAvg) with L2 update clipping at ' + clip + ', norm and cosine poisoning checks, minimum cohort of ' + minCohort + '. Not secure aggregation. No differential privacy.' };
}

/* ------------------- dry-run access evaluation (hero) ------------------- */
function evalAccess(userId, kind) {
  const u = userId ? DB.users.find(x => x.id === userId) : null, org = orgOf(u, null);
  let c;
  if (kind === 'private') c = POL.obsRead(u, org, DB.obs.find(o => o.id === 'obs-nw-draft'));
  else if (kind === 'org') c = POL.obsRead(u, org, DB.obs.find(o => o.id === 'obs-nw-org'));
  else c = POL.shared(u, org);
  const bad = c.find(x => !x[1]); return { ok: !bad, reason: bad ? (bad[2] || bad[0]) : 'Audience and tenant checks passed' };
}
seed();
if (typeof module !== 'undefined') module.exports = { api, DB, IDX, CFG, S, LOG, scan, evalAccess, fedRun };
