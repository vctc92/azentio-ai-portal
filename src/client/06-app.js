/* =====================================================================
   ui3.js - render pipeline, actions, access log, walkthrough, boot
   ===================================================================== */
function renderPage() {
  const u = api.me(); let html;
  if (!PUBLIC.includes(UI.route) && !u) html = needSignIn();
  else { try { html = (P[UI.route] || P.home)(u); } catch (e) { console.error(e); html = `<div class="deny"><h4>Something went wrong</h4><p>${esc(e.message)}</p></div>`; } }
  const app = isApp(u), page = $('#page');
  page.className = app ? 'app-main' : 'site-main';
  if (!app && !['home', 'signin'].includes(UI.route)) html = `<div class="wrap pad">${html}</div>`;
  page.innerHTML = html; afterRender(page); fxInit();
}
function render(enter) {
  const u = api.me(); renderTop(u); renderPage(); placePills(true);
  if (enter) { if (isApp(u) || UI.route !== 'home') rise(); else heroIn(); }
}
function go(r, tab) {
  UI.route = r; if (tab) UI.tab.learn = tab; try { history.replaceState(null, '', '#' + r); } catch (e) { }
  document.body.classList.remove('nav-open'); closeDrawers(true); if (UI.modalOpen) closeModal(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); render(true);
}
function badge() {
  const b = $('[data-act="inspector"]'); if (!b) return; const n = LOG.filter(l => !l.allow).length - UI.seenLog; let d = $('.dot', b);
  if (n > 0) { if (!d) { d = document.createElement('span'); d.className = 'dot'; b.appendChild(d); anim(d, { scale: [0, 1.25, 1] }, { duration: .4 }); } d.textContent = n; } else if (d) d.remove();
}
listeners.push(rec => { badge(); if (UI.drawer === 'inspector') $('#inspector').innerHTML = inspectorHtml(); });

/* ------------------------------ access log + security lab ------------------------------ */
function inspectorHtml() {
  const last = IDX.purges[0];
  return `<div class="row between"><h3>Access log</h3><button class="ibtn" data-act="close" aria-label="Close">${ic('x')}</button></div>
  <p class="small muted" style="margin:6px 0 12px">Developer view. Each row is one request the server decided, with the checks it ran. Menus and links never decide anything.</p>
  <div class="card soft tight"><h4>Retrieval index (derived copies)</h4><div class="row small" style="margin-top:8px">${chip('Search entries: ' + IDX.search.size, 'ok')}${chip('AIRA corpus: ' + IDX.aira.size, 'ok')}${chip('Cache keys: ' + IDX.cache.size)}</div>${last ? `<p class="small muted" style="margin-top:8px">Last purge: ${esc(last.sid)} cleared in ${last.ms.toFixed(1)} ms (judging limit ${CFG.slaSeconds} s).</p>` : ''}</div>
  <div class="card tight" style="margin-top:12px"><h4>Security lab</h4><p class="small muted" style="margin:4px 0 10px">Try to get around the rules as the current user. Every attempt hits the same API as the app.</p><div class="col" style="gap:8px">
  <button class="btn sm ghost" data-act="probe" data-p="media">Open an employee recording by its ID</button>
  <button class="btn sm ghost" data-act="probe" data-p="draft">Fetch another tenant’s private draft by ID</button>
  <button class="btn sm ghost" data-act="probe" data-p="anon">Call the shared feed without signing in</button>
  <button class="btn sm ghost" data-act="probe" data-p="escalate">Invite myself in as a portal administrator</button>
  <button class="btn sm ghost" data-act="probe" data-p="local">Set a role flag in browser storage, then change config</button></div></div>
  ${LOG.slice(0, 24).map(l => `<div class="log ${l.allow ? 'allow' : 'deny'}"><div class="row between">${chip(l.allow ? 'Allowed' : 'Denied', l.allow ? 'ok' : 'no')}<span class="tiny muted">${new Date(l.t).toLocaleTimeString('en-GB')}</span></div><div class="b" style="margin-top:6px">${esc(l.action)}</div><div class="small muted">${esc(l.actor)} on ${esc(l.resource)}</div>${l.allow ? '' : `<div class="small" style="color:var(--no);margin-top:4px">${esc(l.reason)}</div>`}${l.checks.map(c => `<div class="chk"><span style="color:${c.pass ? 'var(--ok)' : 'var(--no)'}">${c.pass ? '&#10003;' : '&#215;'}</span><span>${esc(c.label)}</span></div>`).join('')}</div>`).join('') || '<p class="muted small" style="margin-top:12px">No requests yet. Click around, or run an attempt above.</p>'}`;
}
const PROBES = {
  media: () => api.media('v-emp-1'), draft: () => api.obs.get('obs-hb-draft'), anon: () => api.probe('shared'),
  escalate: () => api.org.invite('me@northwind.example', 'portal_admin'),
  local: () => { try { localStorage.setItem('role', 'portal_admin'); } catch (e) { } return api.admin.setThreshold(3); }
};

/* ------------------------------ walkthrough ------------------------------ */
const TOUR = [
  { who: null, r: 'media', t: 'Start as a visitor', d: 'Press Watch on any public video. Then open the access log and try “Open an employee recording by its ID”. The server refuses it.' },
  { who: 'u-ana', r: 'observations', t: 'A client contributes', d: 'Ana (Northwind) has one submission waiting and one returned with a question. Her private draft stays private.' },
  { who: 'u-maya', r: 'moderation', t: 'A moderator redacts and publishes', d: 'Open the Northwind submission. Publishing is blocked until names and account numbers are removed. Publishing makes the third organisation.' },
  { who: 'u-lena', r: 'learning', t: 'Another client sees only the safe version', d: 'Themes: “Seasonality context” now shows 3 organisations and a small-sample warning. “Document quality” stays hidden at 2.' },
  { who: 'u-priya', r: 'ideas', t: 'A product owner closes the loop', d: 'Create an idea linked to the approved evidence, set it to Under review and share the status with clients.' },
  { who: 'u-ana', r: 'observations', t: 'The contributor withdraws', d: 'Open the published contribution and withdraw it. Search, cache and AIRA clear at once, and the theme drops back below the threshold.' },
  { who: 'u-ravi', r: 'admin', t: 'An admin can’t read private content', d: 'Try opening a private record. It is refused. Authorise support access with a reason and the author is notified.' }
];
function tourHtml() {
  return `<div class="row between"><h3>Judge walkthrough</h3><button class="ibtn" data-act="close" aria-label="Close">${ic('x')}</button></div><p class="small muted" style="margin:6px 0 10px">The brief’s end-to-end scenario in seven steps. Each button switches person and opens the right page. Order matters from step 3 onward.</p>
  ${TOUR.map((s, i) => `<div class="tour-step"><b>${i + 1}</b><div><div class="b">${esc(s.t)}</div><div class="small muted" style="margin:3px 0 8px">${esc(s.d)}</div><button class="btn sm ghost" data-act="tourgo" data-i="${i}">Go as ${s.who ? esc(DB.users.find(u => u.id === s.who).name) : 'a visitor'}</button></div></div>`).join('')}
  <div class="note warn" style="margin-top:14px"><span>The walkthrough uses the judge shortcut, which skips only the email code. Sign in normally from the Sign in page to see the real flow.</span></div>`;
}

/* ------------------------------ actions ------------------------------ */
const ACT = {};
const formOf = el => el.closest('[data-form]');
const firstErr = r => (r.errors && Object.values(r.errors)[0]) || r.reason;
function refreshFeed() { const b = $('#feedBody'); if (b) { b.innerHTML = feedBody(); anim($$('#feedBody .card'), { opacity: [0, 1], y: [10, 0] }, { duration: .4, delay: stag(.04), ease: EASE }); } }
const purgeView = (p, title) => `<h3>Withdrawn</h3><p class="muted" style="margin:6px 0 14px">“${esc(title)}” is no longer shared. Here is what the server cleared.</p><div class="col" id="purgeList">${[['Search index entry removed', p.search], ['AIRA retrieval entry removed', p.aira], ['Cached results cleared (' + p.cacheEntries + ' keys)', true], ['Finished in ' + p.ms.toFixed(1) + ' ms. Judging limit: ' + CFG.slaSeconds + ' seconds', true]].map(([t, ok]) => `<div class="row" data-purge style="flex-wrap:nowrap"><span class="chip ${ok ? 'ok' : ''}">${ok ? '&#10003;' : '-'}</span><span>${esc(t)}</span></div>`).join('')}</div><div class="note warn" style="margin-top:14px"><span>Production target: 60 seconds for search and AIRA, 15 minutes for edge caches. Already-viewed material and copies others made can’t be recalled automatically.</span></div><div class="row" style="margin-top:14px"><button class="btn" data-act="close">Done</button></div>`;

Object.assign(ACT, {
  noop() { }, close() { closeModal(); }, menu() { document.body.classList.toggle('nav-open'); },
  go(el) { go(el.dataset.r, el.dataset.tab); },
  theme() { const d = document.documentElement; const dark = d.dataset.theme === 'dark' || (!d.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches); d.dataset.theme = dark ? 'light' : 'dark'; renderTop(api.me()); placePills(false); },
  inspector() { UI.seenLog = LOG.filter(l => !l.allow).length; badge(); openDrawer('inspector', inspectorHtml()); },
  notifs() { const n = api.notifs.list().data; const q = DB.outbox.filter(o => api.me() && o.to === api.me().email).length; openDrawer('notifs', `<div class="row between"><h3>Notifications</h3><button class="ibtn" data-act="close" aria-label="Close">${ic('x')}</button></div><p class="small muted" style="margin:6px 0 10px">In-app notifications are stored the moment something changes.</p>${n.map(x => `<div class="log ${x.read ? '' : 'allow'}"><div class="row between">${chip('In-app, stored', 'ok')}<span class="tiny muted">${fd(x.t)}</span></div><p style="margin-top:6px">${esc(x.text)}</p></div>`).join('') || empty('All caught up', 'Status changes on your contributions appear here.')}<div class="note" style="margin-top:14px"><span>Email is a P1 feature. ${q} message${q === 1 ? ' is' : 's are'} queued for you, and none is marked delivered because no email provider is connected.</span></div>`); api.notifs.readAll(); renderTop(api.me()); placePills(false); },
  persona() {
    const u = api.me(); openModal(`<div class="row between"><h3>${esc(u.name)}</h3><button class="ibtn" data-act="close" aria-label="Close">${ic('x')}</button></div><p class="muted small">${esc(u.email)}. ${u.kind === 'employee' ? 'Employee' : 'Client'}${u.grants.length ? ', ' + u.grants.map(cap).join(', ') : ''}</p>
    ${u.memberships.length > 1 ? `<h4 style="margin:16px 0 8px">Workspace</h4><div class="row">${u.memberships.map(m => `<button class="btn sm ${m.org === u.activeOrg ? '' : 'ghost'}" data-act="setws" data-org="${m.org}">${esc(m.orgName)}</button>`).join('')}</div>` : ''}
    <h4 style="margin:16px 0 4px">Judge shortcut: switch person</h4><p class="small muted" style="margin-bottom:8px">Skips the email code only. All access rules still apply.</p><div class="row">${DB.users.filter(x => x.id !== u.id && !x.id.startsWith('u-2')).slice(0, 10).map(x => `<button class="btn sm ghost" data-act="as" data-id="${x.id}">${esc(x.name)}</button>`).join('')}</div>
    <div class="row" style="margin-top:18px"><button class="btn warn" data-act="signout">Sign out</button></div>`);
  },
  ws() { ACT.persona(); },
  setws(el) { const r = api.auth.switchOrg(el.dataset.org); if (res(r)) { toast('Workspace switched'); if (UI.modalOpen) closeModal(); render(false); } },
  as(el) { api.auth.judgeShortcut(el.dataset.id); const u = api.me(); toast('Signed in as ' + u.name + ' (judge shortcut)'); UI.sb = {}; UI.fed = null; go('dashboard'); },
  signout() { api.auth.signOut(); UI.auth = { step: 'email' }; UI.sb = {}; toast('Signed out'); go('home'); },
  hero(el) {
    UI.heroPersona = el.dataset.id || null; const card = $('#whoCard'); card.innerHTML = heroCard();
    anim($$('.ver', card), { opacity: [.3, 1], scale: [.94, 1], x: [-14, 0] }, { type: 'spring', stiffness: 420, damping: 24, delay: stag(.07) });
  },
  demofor(el) { UI.demoOffering = el.dataset.id; go('demo'); },
  tab(el) { if (el.dataset.name === 'fround') { UI.fed.round = +el.dataset.val; } else UI.tab[el.dataset.name] = el.dataset.val; render(false); anim($('#page'), { opacity: [.45, 1], y: [10, 0] }, { type: 'spring', stiffness: 220, damping: 24 }); },

  /* public forms */
  submitDemo(el) { const root = formOf(el), r = api.lead.demo(fv(root)); if (!r.ok) { showErrors(root, r.errors); toast(r.reason, 'no'); return; } root.innerHTML = `<h3>Thanks, we’ve got it</h3><p class="muted" style="margin-top:8px">Your request is recorded. We’ll reply within two working days. This is a stored enquiry, not a sent email.</p>`; anim(root, { scale: [.97, 1], opacity: [.5, 1] }, SPRING); },
  submitHack(el) { const root = formOf(el), r = api.lead.hackathon(fv(root)); if (!r.ok) { showErrors(root, r.errors); toast(r.reason, 'no'); return; } root.innerHTML = `<h3>Team registered</h3><p class="muted" style="margin-top:8px">See you at demo day. Registration is stored in the portal.</p>`; anim(root, { scale: [.97, 1], opacity: [.5, 1] }, SPRING); },
  play(el) {
    const r = api.media(el.dataset.id);
    if (!r.ok) { openModal(denied(r.reason, 'The stream request was refused before any media was sent.') + `<div class="row" style="margin-top:14px"><button class="btn" data-act="close">Close</button></div>`); return; }
    const v = r.data; openModal(`<div class="media"><span class="tag">${chip(v.kind, v.kind === 'Live' ? 'no' : 'ai')}</span><div class="wave">${'<i></i>'.repeat(30)}</div></div><h3 style="margin-top:14px">${esc(v.title)}</h3><p class="muted small" style="margin:6px 0 10px">${esc(v.blurb)}</p><div class="note"><span>Stream authorised for you. Simulated player: a signed link valid for ${v.expiresIn} seconds would be issued here.</span></div><div class="row" style="margin-top:14px"><button class="btn" data-act="close">Close</button></div>`);
  },

  /* sign in */
  sampleInvite() { UI.auth = { step: 'email', email: 'nina.cole@northwind.example', token: 'NW-7Q2K-91XA' }; render(false); toast('Sample invitation filled in'); },
  sendCode(el) { const f = fv(formOf(el)), r = api.auth.requestCode(f.email); if (!res(r)) return; UI.auth = { step: 'code', email: f.email.trim().toLowerCase(), token: (f.token || '').trim(), mailbox: r.data.simulatedMailbox }; render(false); },
  authback() { UI.auth = { step: 'email' }; render(false); },
  verify(el) {
    const f = fv(formOf(el)), r = api.auth.verify(UI.auth.email, f.code, UI.auth.token); if (!res(r)) return;
    if (r.data.needsTerms) { UI.auth.step = 'terms'; UI.auth.orgName = r.data.orgName; UI.auth.role = r.data.role; render(false); return; }
    UI.auth = { step: 'email' }; toast('Signed in'); go('dashboard');
  },
  acceptInvite(el) { const f = fv(formOf(el)); if (!f.ack) { toast('Tick the box to confirm you’ve read the terms.', 'no'); return; } if (!res(api.auth.acceptInvite(UI.auth.email))) return; UI.auth = { step: 'email' }; toast('Welcome. Your workspace is ready.'); go('dashboard'); },

  /* sandbox */
  sbp(el) { UI.sb = { product: el.dataset.id, ai: UI.sb.ai }; render(false); }, sbs(el) { UI.sb.scenario = el.dataset.id; UI.sb.run = null; render(false); },
  sbai(el) { UI.sb.ai = el.checked; },
  sbrun() { const r = api.sandbox.run(UI.sb.product, UI.sb.scenario, UI.sb.ai); if (!res(r)) return; UI.sb.run = r.data; render(false); anim($('#sbout'), { scale: [.98, 1], opacity: [.6, 1] }, SPRING); },
  sbfb(el) { if (res(api.sandbox.feedback(UI.sb.run.id, el.dataset.v, ''), 'Thanks. Feedback saved.')) { } },

  /* observations */
  newObs() { openModal(obsForm(null), true); },
  openObs(el) { const r = api.obs.get(el.dataset.id); if (!r.ok) { toast(r.reason, 'no'); return; } r.data.mine = r.data.authorId === api.me().id; openModal(obsDetail(r.data), true); },
  editObs(el) { const r = api.obs.get(el.dataset.id); if (!res(r)) return; openModal(obsForm(r.data), true); },
  saveObs(el) {
    const root = formOf(el), r = api.obs.save(fv(root)); if (!r.ok) { showErrors(root, r.errors); toast(firstErr(r), 'no'); return; }
    if (el.dataset.submit === '1') { const s = api.obs.submit(r.data.id); if (!s.ok) { showErrors(root, s.errors); toast('Saved as a draft, but not submitted: ' + firstErr(s), 'no'); render(false); return; } toast('Submitted for review'); }
    else toast(r.data.status === 'Submitted' ? 'New version sent for renewed review' : 'Draft saved. Still private.');
    closeModal(); render(false);
  },
  submitObs(el) { const r = api.obs.submit(el.dataset.id); if (!r.ok) { toast(firstErr(r), 'no'); return; } toast('Submitted for review'); closeModal(); render(false); },
  withdraw(el) {
    const r = api.obs.get(el.dataset.id); if (!res(r)) return; const o = r.data;
    openModal(`<h3>Withdraw this contribution?</h3><p class="muted" style="margin:8px 0 12px">“${esc(o.title)}”</p>${o.live ? `<div class="note warn"><span>The shared copy will be removed from search, cache and AIRA retrieval right away. We can’t recall material people already viewed or copied.</span></div>` : `<div class="note"><span>It isn’t shared, so withdrawing just closes it.</span></div>`}<div class="row" style="margin-top:16px"><button class="btn warn" data-act="withdrawGo" data-id="${o.id}">Withdraw now</button><button class="btn ghost" data-act="close">Keep it</button></div>`);
  },
  withdrawGo(el) {
    const r = api.obs.withdraw(el.dataset.id); if (!res(r)) return; const t = r.data.obs.title;
    if (r.data.purge) { $('#modal').innerHTML = purgeView(r.data.purge, t); anim($$('[data-purge]'), { opacity: [0, 1], x: [-16, 0] }, { delay: stag(.28), duration: .5, ease: EASE }); } else { toast('Withdrawn'); closeModal(); }
    render(false);
  },

  /* shared learning */
  bm(el) { if (res(api.shared.bookmark(el.dataset.id))) refreshFeed(); },
  comments(el) { UI.openC[el.dataset.id] = !UI.openC[el.dataset.id]; refreshFeed(); },
  addc(el) { const root = formOf(el), r = api.shared.addComment(el.dataset.id, fv(root).t); if (res(r, 'Comment posted')) refreshFeed(); },
  repc(el) { res(api.shared.reportComment(el.dataset.id), 'Reported. A moderator will review it.'); },
  report(el) { openModal(`<div data-form="rpt"><h3>Report this contribution</h3><p class="muted small" style="margin:6px 0 12px">Tell us what looks misleading, confidential or inappropriate. You don’t need to say which organisation wrote it.</p><textarea class="in" data-f="reason"></textarea><div class="row" style="margin-top:14px"><button class="btn" data-act="sendReport" data-id="${el.dataset.id}">Send report</button><button class="btn ghost" data-act="close">Cancel</button></div></div>`); },
  sendReport(el) { const root = formOf(el), r = api.shared.report(el.dataset.id, fv(root).reason); if (!r.ok) { toast(r.reason, 'no'); return; } toast('Report sent'); closeModal(); },
  savesearch() { res(api.shared.saveSearch(Object.assign({}, UI.feed)), 'Search saved'); },
  export() { const r = api.shared.exportCsv(UI.feed); if (!res(r)) return; openModal(`<h3>Export preview</h3><p class="muted small" style="margin:6px 0 10px">The export applies the same visibility rules as the feed, so it contains approved, de-identified fields only.</p><textarea class="in" readonly style="min-height:200px;font-size:.85rem">${esc(r.data)}</textarea><div class="row" style="margin-top:12px"><button class="btn" data-act="close">Close</button></div>`); },
  aira(el) {
    const r = api.aira.ask(fv(formOf(el)).q); const out = $('#airaOut'); if (!r.ok) { toast(r.reason, 'no'); return; }
    out.innerHTML = `<div class="note ok"><span>${chip('AIRA, from approved contributions only', 'ai')}<br><br>${esc(r.data.answer)}</span></div>${r.data.cites.length ? `<div class="row" style="margin-top:10px"><span class="small b">Sources:</span>${r.data.cites.map(c => chip(c.title)).join('')}</div>` : ''}`; anim(out, { opacity: [0, 1], y: [10, 0] }, { duration: .5, ease: EASE });
  },

  /* moderation */
  review(el) { const c = api.review.claim(el.dataset.id); if (!res(c)) return; const r = api.obs.get(el.dataset.id); if (!res(r)) return; openModal(reviewWorkspace(r.data), true); render(false); },
  pub(el) { const root = formOf(el), f = fv(root); const r = api.review.publish(f.id, { title: f.title, summary: f.summary, industry: f.industry, region: f.region, period: f.period, theme: f.theme, quality: f.quality, attribution: f.attribution }); if (!r.ok) { showErrors(root, r.errors); toast(r.reason, 'no'); return; } toast('Published. Shared copy is now searchable.'); closeModal(); render(false); },
  clar(el) { const f = fv(formOf(el)); if (res(api.review.clarify(f.id, f.reason), 'Returned to the author')) { closeModal(); render(false); } },
  rej(el) { const f = fv(formOf(el)); if (res(api.review.reject(f.id, f.rcode, f.reason), 'Rejected. The author was told why.')) { closeModal(); render(false); } },
  unpub(el) { const r = api.review.unpublish(el.dataset.id, 'Report review'); if (res(r, 'Unpublished. Cleared from search and AIRA immediately.')) render(false); },
  resrep(el) { if (res(api.review.resolveReport(el.dataset.id, el.dataset.o), 'Decision recorded')) render(false); },

  /* ideas */
  newIdea() { openModal(ideaForm(), true); },
  createIdea(el) { const root = formOf(el), r = api.ideas.create(fv(root)); if (!r.ok) { showErrors(root, r.errors); toast(r.reason, 'no'); return; } toast('Idea created as Proposed'); closeModal(); render(false); },
  setStatus(el) { const f = fv(formOf(el)); if (res(api.ideas.setStatus(el.dataset.id, f.status, f.vis, f.update), 'Status saved and audited')) render(false); },

  /* lab */
  vote(el) { if (res(api.lab.vote(el.dataset.id))) render(false); },
  submitExp(el) { if (res(api.lab.submit(fv(formOf(el)).title), 'Experiment submitted')) render(false); },
  libfb(el) { if (res(api.lab.feedback(el.dataset.id, el.dataset.v === '1'), 'Thanks. The owner sees this.')) render(false); },

  /* publisher, admin */
  banner(el) { if (res(api.content.setBanner(fv(formOf(el)).text), 'Banner published')) render(false); },
  aud(el) { const f = fv(formOf(el)); if (res(api.content.setAudience(el.dataset.id, f.aud, f.orgs), 'Audience saved and audited')) render(false); },
  setk(el) { if (res(api.admin.setThreshold(fv(formOf(el)).k), 'Threshold updated')) render(false); },
  grant(el) { const r = api.admin.setGrant(el.dataset.u, el.dataset.g, el.checked); if (!r.ok) { el.checked = !el.checked; toast(r.reason, 'no'); } else toast('Grant updated and audited'); },
  support(el) { const f = fv(formOf(el)); if (res(api.admin.supportAuthorise(f.obs, f.reason), 'Support access authorised for 15 minutes. The author was notified.')) render(false); },
  trypeek(el) { const f = fv(formOf(el)), r = api.obs.get(f.obs); if (r.ok) openModal(`<h3>Support view</h3><p class="note warn" style="margin:10px 0"><span>Opened under a time-boxed support authorisation. This read is audited.</span></p><p class="b">${esc(r.data.title)}</p><p style="margin-top:8px">${esc(r.data.body)}</p><div class="row" style="margin-top:14px"><button class="btn" data-act="close">Close</button></div>`); else openModal(denied(r.reason) + `<div class="row" style="margin-top:14px"><button class="btn" data-act="close">Close</button></div>`); },

  /* team */
  role(el) { if (res(api.org.setRole(el.dataset.u, el.value), 'Role updated')) render(false); else render(false); },
  invite(el) { const f = fv(formOf(el)), r = api.org.invite(f.email, f.role); if (!r.ok) { toast(r.reason, 'no'); return; } toast('Invitation created. Code: ' + r.data.token); render(false); },
  escalate() { const r = api.org.invite('someone@northwind.example', 'portal_admin'); toast(r.ok ? 'Unexpected: allowed' : r.reason, r.ok ? '' : 'no'); },
  revoke(el) { if (res(api.org.revoke(el.dataset.id), 'Invitation revoked')) render(false); },
  ticket(el) { const f = fv(formOf(el)), r = api.org.tickets.create(f.subject, f.body); if (res(r, 'Ticket ' + (r.data && r.data.id) + ' sent to the support desk')) render(false); },

  /* federated */
  fopt(el) { UI.fed[el.dataset.k] = el.checked; },
  fclip(el) { UI.fed.clip = parseFloat(el.value); const c = $('#clipv'); if (c) c.textContent = el.value; },
  fedrun() { const f = UI.fed, r = api.fed.run({ dropout: f.dropout, poison: f.poison, clip: f.clip, withdrawn: f.withC ? ['Client C'] : [] }); if (!res(r)) return; f.run = r.data; f.round = 1; render(false); toast('Five rounds complete'); },
  fedreg(el) { const r = api.fed.register(el.dataset.id); if (res(r, 'Registered as a candidate. Not deployed.')) { UI.fed.run = r.data; render(false); } },
  feddec(el) { const r = api.fed.decide(el.dataset.id, el.dataset.d); if (res(r, 'Decision recorded')) { UI.fed.run = r.data; render(false); } },

  /* walkthrough + probes */
  tour() { openDrawer('tour', tourHtml()); },
  tourgo(el) { const s = TOUR[+el.dataset.i]; if (s.who) api.auth.judgeShortcut(s.who); else api.auth.signOut(); UI.sb = {}; if (s.r === 'learning') UI.tab.learn = 'themes'; closeDrawers(true); go(s.r); toast(s.t); },
  probe(el) { const r = PROBES[el.dataset.p](); toast(r.ok ? 'Allowed for this user (see the log for the checks)' : r.reason, r.ok ? '' : 'no'); }
});

document.addEventListener('click', e => {
  if (e.target.id === 'navscrim') { document.body.classList.remove('nav-open'); return; }
  const el = e.target.closest('[data-act]'); if (!el) { if (e.target.id === 'scrim') closeModal(); return; }
  if (el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'range') return;
  const fn = ACT[el.dataset.act]; if (fn) { e.preventDefault(); fn(el, e); }
});
document.addEventListener('change', e => {
  const el = e.target; if (el.dataset && el.dataset.feed) { UI.feed[el.dataset.feed] = el.value; refreshFeed(); return; }
  if (el.dataset && el.dataset.act && (el.tagName === 'SELECT' || el.type === 'checkbox')) { const fn = ACT[el.dataset.act]; if (fn) fn(el, e); }
});
let ft; document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset && el.dataset.feed) { UI.feed[el.dataset.feed] = el.value; clearTimeout(ft); ft = setTimeout(refreshFeed, 160); }
  if (el.dataset && el.dataset.liveScan !== undefined) { const fl = scan(el.value), out = $('#scanOut'); if (out) out.innerHTML = fl.length ? `<div class="note warn"><span><b>Heads up:</b> this looks like it may contain ${fl.map(f => `<span class="flag">${esc(f.match)}</span>`).join(' ')}. Remove identifying details. A moderator will check too.</span></div>` : ''; }
  if (el.dataset && el.dataset.act === 'fclip') ACT.fclip(el);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
window.addEventListener('resize', () => placePills(false));
window.addEventListener('scroll', () => { const h = $('.mh'); if (h) h.classList.toggle('scrolled', window.scrollY > 8); }, { passive: true });
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h && h !== UI.route && (P[h])) { UI.route = h; render(true); } });

/* boot */
(function init() {
  const h = (location.hash || '').slice(1); if (h && P[h]) UI.route = h;
  fxMode(); initScroll();
  render(true);
})();
