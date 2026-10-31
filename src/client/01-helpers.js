/* =====================================================================
   ui1.js - helpers, motion primitives, shell (top bar, overlays)
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const Mo = window.Motion || null;
const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const SPRING = { type: 'spring', stiffness: 380, damping: 30 };
const SOFT = { type: 'spring', stiffness: 220, damping: 24 };
const EASE = [0.22, 1, 0.36, 1];
function anim(el, kf, opt) {
  if (!el || !Mo || reduce) return null;
  try { return Mo.animate(el, kf, opt || {}); } catch (e) { return null; }
}
function stag(s) { return Mo && Mo.stagger ? Mo.stagger(s) : 0; }
function pause(ms) { return new Promise(r => setTimeout(r, ms)); }

const UI = { route: 'home', tab: {}, heroPersona: 'u-ana', auth: { step: 'email' }, sb: {}, feed: {}, openC: {}, fed: null, demoOffering: 'fai', seenLog: 0, tourOpen: false };
const PILLS = {};
const PUBLIC = ['home', 'offerings', 'media', 'insights', 'about', 'demo', 'hackathon', 'signin'];
const fd = iso => { const d = new Date(iso); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); };
const fdd = iso => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const pname = id => (DB.products.find(p => p.id === id) || { name: id }).name;
const cap = s => s.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
const COLORS = ['#2F4BFF', '#6B4CE6', '#0B7F70', '#B83A0B', '#0A6F99', '#8B2FD6', '#475569'];
const av = n => { let h = 0; for (const c of n) h = (h * 31 + c.charCodeAt(0)) % 997; return `<span class="av" style="background:${COLORS[h % COLORS.length]}">${esc(n.split(' ').map(x => x[0]).slice(0, 2).join(''))}</span>`; };
const ICONS = {
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', lock: '<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  bell: '<path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15z"/><path d="M10 21h4"/>', shield: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  play: '<path d="M8 5.5v13l11-6.5z"/>', moon: '<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', file: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0"/><path d="M16 4.5a3.5 3.5 0 010 7M18 20a5.5 5.5 0 00-2-4.2"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
  flask: '<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 001.3 2.2h12.4a1.5 1.5 0 001.3-2.2L14 9V3"/><path d="M7.5 15h9"/>', beaker: '<path d="M6 3h12M7 3v4l-3 11a2 2 0 002 3h12a2 2 0 002-3L17 7V3"/>',
  pencil: '<path d="M4 20l1-4L16.5 4.5a2 2 0 013 3L8 19z"/><path d="M14.5 6.5l3 3"/>', layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  book: '<path d="M5 4h13a1 1 0 011 1v14H6a2 2 0 00-2 2V6a2 2 0 011-2z"/><path d="M8 8h7"/>', video: '<rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="M16 10l5-3v10l-5-3z"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z"/>',
  network: '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v4M12 11.5l-5.5 5.5M12 11.5l5.5 5.5"/>',
  megaphone: '<path d="M3 11v3l12 5V6z"/><path d="M15 9a3 3 0 010 6M6 15l1.5 5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  send: '<path d="M21 3L10 14"/><path d="M21 3l-7 18-4-7-7-4z"/>', undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', swap: '<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
  scan: '<path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3"/><path d="M8 12h8"/>', chart: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>', key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>'
};
const ic = n => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
const chip = (t, k) => `<span class="chip ${k || ''}">${esc(t)}</span>`;
const STATUS_K = { Published: 'ok', Submitted: 'wait', 'In review': 'wait', 'Needs clarification': 'wait', Rejected: 'no', Withdrawn: 'no', Unpublished: 'no', Draft: '' };
const schip = o => chip(o.live && o.status !== 'Published' ? 'Published (v' + o.shared.version + ' live, v' + o.version + ' ' + o.status.toLowerCase() + ')' : o.status + (o.status === 'Published' ? ' v' + o.shared.version : ''), STATUS_K[o.status]);
const empty = (t, p, btn) => `<div class="empty"><div class="ill">${ILL[pickIll(t)]}</div><h4>${esc(t)}</h4><p>${esc(p)}</p>${btn || ''}</div>`;
const denied = (r, extra) => `<div class="deny"><div class="row">${ic('lock').replace('<svg', '<svg width="22" height="22" stroke="currentColor" fill="none" stroke-width="2"')}<h4>Access denied by the server</h4></div><p style="margin-top:8px">${esc(r)}</p><p class="small muted" style="margin-top:8px">${extra || 'This was decided by the policy engine on the request itself, not by hiding a menu item. Open the access log to see each check.'}</p></div>`;
const sel = (name, opts, val, attrs = '') => `<select class="in" data-f="${name}" ${attrs}>${opts.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${String(v) === String(val) ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`;
const fld = (name, label, inner, help) => `<div class="f"><label>${esc(label)}</label>${inner}${help ? `<span class="help">${esc(help)}</span>` : ''}</div>`;
const inp = (name, val, attrs = '') => `<input class="in" data-f="${name}" value="${esc(val || '')}" ${attrs}>`;
const hl = (text, flags) => { let t = esc(text); (flags || []).forEach(f => { const m = esc(f.match).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); t = t.replace(new RegExp(m, 'gi'), x => `<mark class="flag">${x}</mark>`); }); return t; };

/* form helpers */
function fv(root) {
  const o = {};
  $$('[data-f]', root).forEach(el => {
    let v; if (el.type === 'checkbox') v = el.checked; else if (el.type === 'radio') { if (!el.checked) return; v = el.value; } else v = el.value;
    const parts = el.dataset.f.split('.'); let t = o; parts.forEach((p, i) => { if (i === parts.length - 1) { if (el.type === 'checkbox' && el.dataset.multi) { (t[p] = t[p] || []); if (v) t[p].push(el.value); } else t[p] = v; } else t = t[p] = t[p] || {}; });
  });
  return o;
}
function showErrors(root, errors) {
  $$('.err', root).forEach(e => e.remove()); $$('.bad', root).forEach(e => e.classList.remove('bad'));
  Object.keys(errors || {}).forEach(k => {
    const el = $(`[data-f="${k}"]`, root) || $(`[data-f^="${k}"]`, root); if (!el) return;
    const host = el.closest('.check') || el; host.classList.add('bad');
    const d = document.createElement('div'); d.className = 'err'; d.setAttribute('role', 'alert'); d.textContent = errors[k]; host.insertAdjacentElement('afterend', d);
    anim(d, { opacity: [0, 1], y: [-6, 0] }, { duration: .3 });
  });
  const first = $('.bad', root); if (first && first.focus) first.focus({ preventScroll: false });
}

/* toast */
function toast(msg, kind) {
  const el = document.createElement('div'); el.className = 'toast ' + (kind || ''); el.setAttribute('role', 'status');
  el.innerHTML = `${kind === 'no' ? ic('x') : ic('check')}<span>${esc(msg)}</span>`; el.firstChild.setAttribute('width', 18); el.firstChild.setAttribute('height', 18); el.firstChild.style.cssText = 'width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2.2;flex:none';
  $('#toasts').appendChild(el);
  anim(el, { opacity: [0, 1], y: [30, 0], scale: [.92, 1] }, SPRING);
  setTimeout(() => { const a = anim(el, { opacity: 0, y: -10 }, { duration: .25 }); (a && a.finished ? a.finished : pause(10)).then(() => el.remove()).catch(() => el.remove()); if (!a) el.remove(); }, 3600);
}
const res = (r, ok) => { if (!r.ok) { toast(r.reason, 'no'); return false; } if (ok) toast(ok); return true; };

/* overlays */
function openModal(html, wide) {
  const m = $('#modal'), s = $('#scrim'); m.innerHTML = html; m.style.width = wide ? 'min(960px,calc(100vw - 28px))' : '';
  s.style.display = 'block'; m.style.display = 'block';
  anim(s, { opacity: [0, 1] }, { duration: .25 }); anim(m, { opacity: [0, 1], y: [40, 0], scale: [.96, 1] }, SPRING);
  m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); const f = $('button,input,select,textarea', m); if (f) f.focus({ preventScroll: true });
  UI.modalOpen = true; afterRender(m);
}
function closeModal() {
  const m = $('#modal'), s = $('#scrim'); if (!UI.modalOpen && !UI.drawer) return;
  const a = anim(m, { opacity: 0, y: 20, scale: .97 }, { duration: .2 }); const fin = () => { m.style.display = 'none'; m.innerHTML = ''; s.style.display = 'none'; };
  if (a && a.finished) a.finished.then(fin, fin); else fin();
  closeDrawers(true); UI.modalOpen = false;
}
function openDrawer(id, html) {
  const d = $('#' + id); d.innerHTML = html; d.style.display = 'block'; $('#scrim').style.display = 'block'; UI.drawer = id;
  anim($('#scrim'), { opacity: [0, 1] }, { duration: .25 }); anim(d, { x: [id === 'tour' ? -440 : 440, 0] }, { type: 'spring', stiffness: 300, damping: 34 });
  anim($$('.log,.tour-step', d), { opacity: [0, 1], y: [14, 0] }, { duration: .4, delay: stag(.035), ease: EASE }); afterRender(d);
}
function closeDrawers(silent) {
  ['inspector', 'notifs', 'tour'].forEach(id => { const d = $('#' + id); if (d.style.display === 'block') { const a = anim(d, { x: id === 'tour' ? -440 : 440 }, { duration: .25, ease: EASE }); const fin = () => d.style.display = 'none'; if (a && a.finished) a.finished.then(fin, fin); else fin(); } });
  UI.drawer = null; if (!silent || !UI.modalOpen) $('#scrim').style.display = UI.modalOpen && silent ? 'block' : 'none';
}

/* pills (spring-animated active indicators) */
function placePills(animateIt) {
  $$('[data-pk]').forEach(c => {
    const pill = $('.pill', c), cur = $('[aria-current="page"],[aria-selected="true"]', c);
    if (!pill || !cur) { if (pill) { pill.style.width = '0'; } return; }
    const vert = !!c.dataset.vert, k = c.dataset.pk, prev = PILLS[k];
    const pos = vert ? { a: cur.offsetTop, s: cur.offsetHeight } : { a: cur.offsetLeft, s: cur.offsetWidth };
    const set = p => { if (vert) { pill.style.transform = `translateY(${p.a}px)`; pill.style.height = p.s + 'px'; } else { pill.style.transform = `translateX(${p.a}px)`; pill.style.width = p.s + 'px'; } };
    if (prev && animateIt !== false && (prev.a !== pos.a || prev.s !== pos.s)) {
      set(prev); anim(pill, vert ? { y: [prev.a, pos.a], height: [prev.s + 'px', pos.s + 'px'] } : { x: [prev.a, pos.a], width: [prev.s + 'px', pos.s + 'px'] }, SPRING); set(pos);
    } else set(pos);
    PILLS[k] = pos;
  });
}
const seg = (name, opts, cur) => `<div class="seg" role="tablist" data-pk="seg-${name}"><span class="pill"></span>${opts.map(([v, l]) => `<button role="tab" data-act="tab" data-name="${name}" data-val="${v}" aria-selected="${v === cur}">${esc(l)}</button>`).join('')}</div>`;
const tabOf = (name, def) => UI.tab[name] || def;

/* shells */
function navFor() { return [['home', 'Home'], ['offerings', 'Offerings'], ['media', 'Media'], ['insights', 'Insights'], ['about', 'About'], ['demo', 'Request a demo'], ['hackathon', 'Hackathon']]; }
function sideGroups(u) {
  const g = [];
  if (u.kind === 'employee') {
    g.push(['Workspace', [['dashboard', 'Dashboard', 'grid'], ['playground', 'Playground', 'flask'], ['live', 'Live and recordings', 'video'], ['lab', 'Lab', 'beaker']]]);
    const l = [['learning', 'Shared learning', 'layers']]; if (u.grants.includes('product_owner')) l.push(['ideas', 'Improvement ideas', 'bulb']); l.push(['federated', 'Federated lab', 'network']); g.push(['Learning', l]);
    const gv = []; if (u.grants.includes('moderator')) gv.push(['moderation', 'Moderation', 'shield']); if (u.grants.includes('publisher')) gv.push(['publisher', 'Publisher', 'megaphone']); if (u.grants.includes('portal_admin')) gv.push(['admin', 'Administration', 'settings']); if (gv.length) g.push(['Governance', gv]);
  } else {
    g.push(['Workspace', [['dashboard', 'Dashboard', 'grid'], ['sandbox', 'Sandbox', 'flask']]]);
    g.push(['Learning', [['observations', 'Observations', 'pencil'], ['learning', 'Shared learning', 'layers']]]);
    const o = []; if (u.role === 'client_admin') o.push(['team', 'Team and invitations', 'users']); o.push(['resources', 'Resources', 'book']); g.push(['Organisation', o]);
  }
  g.push(['Azentio', [['home', 'Public site', 'globe']]]); return g;
}
const isApp = u => !!u && !PUBLIC.includes(UI.route);
function toolsHtml(u) {
  const unread = u ? api.notifs.list().data.filter(n => !n.read).length : 0, denials = LOG.filter(l => !l.allow).length - UI.seenLog;
  return `<button class="ibtn" data-act="theme" aria-label="Toggle light and dark">${ic(document.documentElement.dataset.theme === 'dark' ? 'sun' : 'moon')}</button>
  <button class="ibtn" data-act="inspector" aria-label="Open access log">${ic('shield')}${denials > 0 ? `<span class="dot">${denials}</span>` : ''}</button>
  ${u ? `<button class="ibtn" data-act="notifs" aria-label="Notifications">${ic('bell')}${unread ? `<span class="dot">${unread}</span>` : ''}</button>` : ''}`;
}
const LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2F4BFF"/><stop offset="1" stop-color="#7A5CFF"/></linearGradient></defs><rect width="32" height="32" rx="9" fill="url(#lg)"/><path d="M9 23l7-14 7 14" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="20" r="2.2" fill="#5BF0C2"/></svg>';
function renderTop(u) {
  const app = isApp(u); document.body.classList.toggle('app', app); document.body.classList.toggle('site', !app);
  if (app) {
    const groups = sideGroups(u); let title = '';
    groups.forEach(([, items]) => items.forEach(([r, l]) => { if (r === UI.route) title = l; }));
    const ws = u.kind === 'employee' ? { n: 'Azentio', s: 'Employee workspace', q: 'A' } : { n: u.activeOrgName || 'Choose a workspace', s: u.activeOrgName ? cap(u.role || '') : 'Multiple organisations', q: (u.activeOrgName || '?')[0] };
    $('#side').innerHTML = `<div class="side"><button class="logo" data-act="go" data-r="home" aria-label="azentio.ai home">${LOGO}<span>azentio.ai</span></button>
      <button class="wsb" data-act="${u.memberships.length > 1 ? 'ws' : 'noop'}" aria-label="Active workspace"><span class="sq">${esc(ws.q)}</span><span style="flex:1;min-width:0"><b>${esc(ws.n)}</b><span>${esc(ws.s)}</span></span>${u.memberships.length > 1 ? ic('swap') : ''}</button>
      <nav class="snav" data-pk="side" data-vert="1" aria-label="Primary"><span class="pill"></span>${groups.map(([n, items]) => `<div class="grp">${n}</div>${items.map(([r, l, i]) => `<button class="it" data-act="go" data-r="${r}" ${UI.route === r ? 'aria-current="page"' : ''}>${ic(i)}${esc(l)}</button>`).join('')}`).join('')}</nav>
      <button class="me" data-act="persona">${av(u.name)}<span style="min-width:0"><b>${esc(u.name)}</b><span>${esc(u.kind === 'employee' ? (u.grants.map(cap).join(', ') || 'Employee') : u.email)}</span></span></button></div>`;
    $('#top').innerHTML = `<div class="app-top"><button class="ibtn burger" data-act="menu" aria-label="Open menu">${ic('menu')}</button><div class="crumb"><span>${u.kind === 'employee' ? 'Azentio' : esc(u.activeOrgName || 'Portal')}</span><span>/</span><b>${esc(title || 'Portal')}</b></div><div style="flex:1"></div><div class="tools">${toolsHtml(u)}</div></div>`;
  } else {
    $('#side').innerHTML = '';
    const tabs = navFor().map(([r, l]) => `<button data-act="go" data-r="${r}" ${UI.route === r ? 'aria-current="page"' : ''}>${esc(l)}</button>`).join('');
    $('#top').innerHTML = `<div class="banner">${esc(api.banner().data)}</div><header class="mh"><div class="mh-in"><button class="logo" data-act="go" data-r="home" aria-label="azentio.ai home">${LOGO}<span>azentio.ai</span></button><nav class="mnav" aria-label="Primary">${tabs}</nav><div class="tools">${toolsHtml(u)}${u ? `<button class="btn sm" data-act="go" data-r="dashboard">Open portal</button>` : `<button class="btn ghost sm" data-act="go" data-r="signin">Sign in</button><button class="btn sm" data-act="go" data-r="demo">Request a demo</button>`}</div></div></header>`;
    const h = $('.mh'); if (h) h.classList.toggle('scrolled', window.scrollY > 8);
  }
}

/* lifecycle visual */
function life(status, live) {
  const idx = { Draft: 0, Submitted: 1, 'In review': 2, 'Needs clarification': 2, Published: 3, Unpublished: 3, Rejected: 3, Withdrawn: 3 }[status] ?? 0;
  const labels = ['Draft', 'Submitted', 'In review', 'Published'];
  if (status === 'Needs clarification') labels[2] = 'Needs clarification';
  const bad = ['Rejected', 'Withdrawn', 'Unpublished'].includes(status); if (bad) labels[3] = status;
  return `<div class="life" aria-label="Lifecycle: ${esc(status)}">${labels.map((l, i) => `${i ? `<div class="bar ${i <= idx ? 'on' : ''}"><i></i></div>` : ''}<div class="step ${i < idx || (i === idx && !bad && status === 'Published') ? 'done' : i === idx ? (bad ? 'bad' : 'now') : ''}"><b>${i < idx || (i === idx && status === 'Published') ? '&#10003;' : bad && i === idx ? '&#215;' : i + 1}</b>${esc(l)}</div>`).join('')}</div>`;
}
function afterRender(root) {
  root = root || document;
  $$('.bar.on i', root).forEach((i, n) => anim(i, { transform: ['scaleX(0)', 'scaleX(1)'] }, { duration: .7, delay: .15 + n * .12, ease: EASE }));
  $$('.spark i', root).forEach(() => { });
  const sp = $$('.spark', root); sp.forEach(s => anim($$('i', s), { transform: ['scaleY(0)', 'scaleY(1)'] }, { duration: .6, delay: stag(.04), ease: EASE }));
  $$('[data-count]', root).forEach(el => { const to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10), suf = el.dataset.suf || ''; const show = v => { el.textContent = v.toFixed(dec) + suf; }; if (!Mo || reduce) { show(to); return; } try { Mo.animate(0, to, { duration: 1.2, ease: [0.16, 1, 0.3, 1], onUpdate: show }); } catch (e) { show(to); } });
  $$('.wave', root).forEach(w => { const bars = $$('i', w); if (Mo && !reduce) bars.forEach((b, i) => anim(b, { height: ['8px', (12 + ((i * 37) % 28)) + 'px', '8px'] }, { duration: 1.1 + (i % 4) * .2, repeat: Infinity, delay: i * .05, ease: 'ease-in-out' })); else bars.forEach((b, i) => b.style.height = (12 + ((i * 37) % 28)) + 'px'); });
}
function rise() { const kids = $$('#page > *'); anim(kids, { opacity: [0, 1], y: [26, 0] }, { type: 'spring', stiffness: 160, damping: 22, delay: stag(.07) }); }
