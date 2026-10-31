/* =====================================================================
   ui2b.js - marketing site: illustrations, landing, offerings, sign-in
   ===================================================================== */
const T = (x, y, t, o = '') => `<text x="${x}" y="${y}" ${o}>${t}</text>`;
function thumbFai() {
  const rev = [18, 20, 48, 92, 120, 96, 70, 60, 44, 30, 22, 18]; let b = '';
  rev.forEach((r, i) => { const h = r / 120 * 96, x = 20 + i * 24, low = r < 38; b += `<rect x="${x}" y="${136 - h}" width="17" height="${h}" rx="3" fill="${low ? 'var(--no)' : 'var(--primary)'}" opacity="${low ? .85 : .9}"/>`; });
  return `<svg viewBox="0 0 320 170" aria-hidden="true">${b}<line x1="14" x2="306" y1="105" y2="105" stroke="var(--ink)" stroke-width="1.2" stroke-dasharray="4 4" opacity=".55"/>
  <rect x="128" y="12" width="182" height="38" rx="8" fill="var(--surface)" stroke="var(--line2)"/>${T(138, 28, 'Quietest quarter', 'font-size="9.5" fill="var(--t3)"')}${T(138, 42, 'Cover 0.63x, reserve £35k', 'font-size="10.5" font-weight="600" fill="var(--no)"')}
  ${T(20, 156, 'J', 'font-size="9" fill="var(--t3)"')}${T(150, 156, 'Annual average hides it', 'font-size="9" fill="var(--t3)"')}</svg>`;
}
function thumbCda() {
  const rows = [['Trading history 3+ years', 1], ['Debt service cover 1.25x', 1], ['Collateral cover 100%', 0]];
  return `<svg viewBox="0 0 320 170" aria-hidden="true">${rows.map((r, i) => `<g transform="translate(22 ${20 + i * 38})"><rect width="196" height="30" rx="8" fill="var(--surface)" stroke="var(--line2)"/><circle cx="16" cy="15" r="8" fill="${r[1] ? 'var(--ok-bg)' : 'var(--no-bg)'}"/><path d="${r[1] ? 'M12 15l3 3 5-6' : 'M12.5 11.5l7 7M19.5 11.5l-7 7'}" stroke="${r[1] ? 'var(--ok)' : 'var(--no)'}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>${T(32, 19, r[0], 'font-size="10.5" fill="var(--ink)" font-weight="500"')}</g>`).join('')}
  <g transform="translate(262 84)"><path d="M-34 0a34 34 0 0168 0" fill="none" stroke="var(--line2)" stroke-width="9" stroke-linecap="round"/><path d="M-34 0a34 34 0 0148 -24" fill="none" stroke="var(--primary)" stroke-width="9" stroke-linecap="round"/>${T(-13, -4, '71', 'font-size="20" font-weight="600" fill="var(--ink)"')}${T(-24, 16, 'Refer', 'font-size="10" fill="var(--t3)"')}</g></svg>`;
}
function thumbDoc() {
  return `<svg viewBox="0 0 320 170" aria-hidden="true"><g transform="translate(26 14)"><rect width="150" height="142" rx="8" fill="var(--surface)" stroke="var(--line2)"/><rect x="14" y="14" width="64" height="7" rx="3" fill="var(--line2)"/>${[34, 50, 66, 98, 114].map((y, i) => `<rect x="14" y="${y}" width="${[120, 100, 112, 90, 108][i]}" height="6" rx="3" fill="var(--line)"/>`).join('')}<rect x="14" y="80" width="122" height="12" rx="3" fill="var(--wait-bg)" stroke="var(--wait)" stroke-opacity=".5"/></g>
  <g transform="translate(192 22)">${[['Opening balance', '0.91', 1], ['Closing balance', '0.62', 0], ['Total credits', '0.58', 0], ['Account holder', '0.95', 1]].map((f, i) => `<g transform="translate(0 ${i * 31})"><rect width="108" height="25" rx="7" fill="var(--surface)" stroke="var(--line2)"/>${T(8, 16, f[0], 'font-size="8.5" fill="var(--ink)" font-weight="500"')}<rect x="82" y="5" width="20" height="15" rx="4" fill="${f[2] ? 'var(--ok-bg)' : 'var(--wait-bg)'}"/>${T(85, 16, f[1], `font-size="8" font-weight="600" fill="${f[2] ? 'var(--ok)' : 'var(--wait)'}"`)}</g>`).join('')}</g></svg>`;
}
const THUMBS = { fai: thumbFai(), cda: thumbCda(), doc: thumbDoc() };

const SVG_ACCESS = `<svg viewBox="0 0 640 360" role="img" aria-label="Requests from a visitor, a client and an employee pass through a policy engine before reaching resources. Allowed paths continue; a visitor request for private drafts is blocked.">
 <g class="draw">
  <path class="flowline" d="M140 70C200 70 210 108 262 108" fill="none" stroke="var(--line2)" stroke-width="2"/>
  <path class="flowline" d="M140 180H262" fill="none" stroke="var(--line2)" stroke-width="2"/>
  <path class="flowline" d="M140 290C200 290 210 252 262 252" fill="none" stroke="var(--line2)" stroke-width="2"/>
  <path class="flowline" d="M378 104C440 104 440 52 500 52" fill="none" stroke="var(--ok)" stroke-width="2"/>
  <path class="flowline" d="M378 168C440 168 440 132 500 132" fill="none" stroke="var(--ok)" stroke-width="2"/>
  <path class="flowline" d="M378 192C440 192 440 212 500 212" fill="none" stroke="var(--ok)" stroke-width="2"/>
  <path d="M378 244C440 244 450 292 486 292" fill="none" stroke="var(--no)" stroke-width="2" stroke-dasharray="3 5"/>
 </g>
 <circle cx="494" cy="292" r="9" fill="var(--no-bg)" stroke="var(--no)"/><path d="M490.5 288.5l7 7M497.5 288.5l-7 7" stroke="var(--no)" stroke-width="1.8" stroke-linecap="round"/>
 ${[['Visitor', 70, '#64748B'], ['Client member', 180, '#2F4BFF'], ['Employee', 290, '#6B4CE6']].map(([n, y, c]) => `<g><rect x="16" y="${y - 22}" width="124" height="44" rx="11" fill="var(--surface)" stroke="var(--line2)"/><circle cx="40" cy="${y}" r="11" fill="${c}"/>${T(60, y + 4.5, n, 'font-size="12.5" font-weight="550" fill="var(--ink)"')}</g>`).join('')}
 <circle class="pulse" cx="320" cy="180" r="70" fill="var(--primary)" opacity=".18"/>
 <rect x="262" y="30" width="116" height="300" rx="20" fill="var(--primary-soft)" stroke="var(--primary)" stroke-width="1.5"/>
 <g transform="translate(300 118) scale(1.7)" fill="none" stroke="var(--primary)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/></g>
 ${T(320, 196, 'Policy engine', 'font-size="13" font-weight="650" fill="var(--ink)" text-anchor="middle"')}
 ${['Role', 'Tenant', 'Audience', 'Entitlement'].map((t, i) => `<g><circle cx="288" cy="${222 + i * 22}" r="5" fill="var(--ok-bg)" stroke="var(--ok)"/>${T(300, 226 + i * 22, t, 'font-size="11.5" fill="var(--t2)"')}</g>`).join('')}
 ${[['Public media', 52, 'var(--ok)'], ['Org workspace', 132, 'var(--ok)'], ['Shared learning', 212, 'var(--ok)'], ['Private drafts', 292, 'var(--no)']].map(([n, y, c]) => `<g><rect x="500" y="${y - 22}" width="128" height="44" rx="11" fill="var(--surface)" stroke="var(--line2)"/><circle cx="518" cy="${y}" r="4.5" fill="${c}"/>${T(530, y + 4, n, 'font-size="11" font-weight="550" fill="var(--ink)"')}</g>`).join('')}
</svg>`;

const SVG_FED = `<svg viewBox="0 0 640 310" role="img" aria-label="Three client environments train locally and send clipped updates to an aggregator, which produces a candidate model that waits for human approval. Raw records never leave the clients.">
 <g class="draw">
  <path class="flowline" d="M190 58C270 58 290 140 328 148" fill="none" stroke="var(--primary)" stroke-width="2"/>
  <path class="flowline" d="M190 154H328" fill="none" stroke="var(--primary)" stroke-width="2"/>
  <path class="flowline" d="M190 250C270 250 290 168 328 160" fill="none" stroke="var(--primary)" stroke-width="2"/>
  <path class="flowline" d="M436 154H496" fill="none" stroke="var(--primary)" stroke-width="2"/>
 </g>
 ${['Client A', 'Client B', 'Client C'].map((n, i) => { const y = 24 + i * 96; return `<g transform="translate(16 ${y})"><rect width="174" height="68" rx="13" fill="var(--surface)" stroke="var(--line2)"/><g transform="translate(16 18)"><ellipse cx="14" cy="6" rx="14" ry="5.5" fill="var(--sunken)" stroke="var(--t3)"/><path d="M0 6v18c0 3 6.3 5.5 14 5.5S28 27 28 24V6" fill="var(--sunken)" stroke="var(--t3)"/></g>${T(58, 28, n, 'font-size="13" font-weight="600" fill="var(--ink)"')}<g transform="translate(58 36)" fill="none" stroke="var(--ok)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="0" y="5" width="10" height="8" rx="2"/><path d="M2 5V3.5a3 3 0 016 0V5"/></g>${T(74, 46, 'Records stay local', 'font-size="10.5" fill="var(--t2)"')}</g>`; }).join('')}
 ${T(258, 104, 'clipped updates', 'font-size="10.5" fill="var(--primary)" font-weight="600" text-anchor="middle" transform="rotate(8 258 104)"')}
 <circle class="pulse" cx="382" cy="154" r="56" fill="var(--primary)" opacity=".2"/>
 <circle cx="382" cy="154" r="54" fill="var(--primary-soft)" stroke="var(--primary)" stroke-width="1.5"/>${T(382, 150, 'Aggregate', 'font-size="13" font-weight="650" fill="var(--ink)" text-anchor="middle"')}${T(382, 166, 'weighted average', 'font-size="9.5" fill="var(--t2)" text-anchor="middle"')}
 <g transform="translate(496 108)"><rect width="132" height="92" rx="13" fill="var(--surface)" stroke="var(--line2)"/>${T(14, 26, 'Candidate model', 'font-size="12" font-weight="650" fill="var(--ink)"')}${T(14, 42, 'v0.1.0, not deployed', 'font-size="10" fill="var(--t2)"')}<rect x="14" y="54" width="104" height="24" rx="7" fill="var(--wait-bg)"/>${T(24, 70, 'Human approval', 'font-size="9.5" font-weight="600" fill="var(--wait)"')}</g>
 ${T(320, 296, 'Raw client records never reach the coordinator.', 'font-size="11.5" fill="var(--t3)" text-anchor="middle"')}
</svg>`;

const SVG_THRESH = `<svg viewBox="0 0 380 220" role="img" aria-label="Seasonality context has three contributing organisations and is shown. Document quality has two and stays hidden below the minimum of three.">
 <defs><pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="7" fill="var(--line2)"/></pattern></defs>
 <line x1="24" x2="360" y1="180" y2="180" stroke="var(--line2)"/>
 <rect x="62" y="84" width="96" height="96" rx="8" fill="var(--primary)"/><rect x="214" y="116" width="96" height="64" rx="8" fill="url(#hatch)" stroke="var(--line2)"/>
 <line x1="24" x2="360" y1="84" y2="84" stroke="var(--ink)" stroke-dasharray="5 5" stroke-width="1.3" opacity=".6"/>${T(360, 74, 'Minimum 3 organisations', 'font-size="10.5" fill="var(--t2)" text-anchor="end" font-weight="550"')}
 ${T(110, 134, '3', 'font-size="30" font-weight="600" fill="#fff" text-anchor="middle"')}${T(262, 154, '2', 'font-size="26" font-weight="600" fill="var(--t3)" text-anchor="middle"')}
 ${T(110, 200, 'Seasonality context', 'font-size="11" fill="var(--ink)" text-anchor="middle" font-weight="550"')}${T(262, 200, 'Document quality', 'font-size="11" fill="var(--ink)" text-anchor="middle" font-weight="550"')}
 <rect x="62" y="32" width="96" height="22" rx="6" fill="var(--ok-bg)"/>${T(110, 47, 'Shown', 'font-size="10.5" font-weight="600" fill="var(--ok)" text-anchor="middle"')}
 <rect x="214" y="32" width="96" height="22" rx="6" fill="var(--wait-bg)"/>${T(262, 47, 'Hidden for privacy', 'font-size="10.5" font-weight="600" fill="var(--wait)" text-anchor="middle"')}</svg>`;

const HERO_MOCK = `<div class="mock" aria-hidden="true">
 <div class="win"><div class="win-bar"><i></i><i></i><i></i><span>Moderation, Northwind submission</span><span class="chip wait">In review</span></div>
  <div class="win-body"><div><div class="cap">Author’s text</div><p>At <span class="rd">Northwind Credit</span>’s <span class="rd">Leeds</span> branch we reviewed 14 garden-centre loans (<span class="rd">ACC 48213377</span>). Spring revenue is about five times winter revenue.</p></div>
  <div><div class="cap">Shared copy</div><p class="sc">At a lender’s regional branch we reviewed 14 garden-centre loans. Spring revenue is about five times winter revenue.</p><div class="sk"></div><div class="sk"></div><div class="sk"></div>
  <div class="pubwrap"><div class="pubbtn a">Publish approved version</div><div class="pubbtn b">${ic('check').replace('class="ic"', 'class="ic" style="width:14px;height:14px;margin-right:6px"')}Published</div></div></div></div></div>
 <div class="float f1"><div class="row between" style="flex-wrap:nowrap"><h4>Seasonality context</h4><span class="tiny faint">Q3 2026</span></div>
  <div class="orgs"><span class="av" style="background:#2F4BFF">N</span><span class="av" style="background:#6B4CE6">H</span><span class="av d3" style="background:#0B7F70">A</span></div>
  <div class="swap"><span class="sA chip wait">Hidden, 2 of 3 organisations</span><span class="sB chip ok">Shown, 3 organisations</span></div></div>
 <div class="float f2"><div class="row" style="gap:8px"><span class="chip no">Blocked</span><span class="small b">Fetch another tenant’s draft</span></div>
  <div class="x"><svg class="ic" viewBox="0 0 24 24" style="stroke:var(--ok)"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>Signed in as Ana, Northwind</div><div class="x"><svg class="ic" viewBox="0 0 24 24" style="stroke:var(--no)"><path d="M6 6l12 12M18 6L6 18"/></svg>Record belongs to Harbor SME Bank</div></div></div>`;

const tick = t => `<li>${ic('check')}<span>${t}</span></li>`;
P.offerings = u => {
  const cat = api.catalogue().data;
  return `${head('Offerings', 'What each product does and what you can safely try. Every demo uses synthetic data and labels simulated output.')}<div class="grid g3">${cat.map(p => `<div class="card prod"><div class="thumb">${THUMBS[p.id]}</div><div class="row between"><h3>${esc(p.name)}</h3></div><p class="tag">${esc(p.tag)}</p><p class="muted" style="margin-top:10px">${esc(p.desc)}</p><div class="note" style="margin-top:14px">${ic('shield')}<span>The sandbox shows a guided scenario. It doesn’t make credit or business decisions.</span></div><div class="row" style="margin-top:16px"><button class="btn sm" data-act="demofor" data-id="${p.id}">Request a demo</button>${u ? `<button class="btn sm ghost" data-act="go" data-r="${u.kind === 'employee' ? 'playground' : 'sandbox'}">Open sandbox</button>` : ''}</div></div>`).join('')}</div>`;
};
P.signin = u => {
  const a = UI.auth;
  if (u) return `<div class="card" style="max-width:520px;margin:30px auto;text-align:center"><h2>You’re signed in as ${esc(u.name)}</h2><div class="row" style="justify-content:center;margin-top:16px"><button class="btn" data-act="go" data-r="dashboard">Open portal</button><button class="btn ghost" data-act="signout">Sign out</button></div></div>`;
  let left;
  if (a.step === 'email') left = `<h2 style="font-size:1.9rem">Sign in to azentio.ai</h2><p class="muted" style="margin:8px 0 22px">Employees use their @azentio.com address. Clients use the address on their invitation. We send a one-time code.</p><div class="col" data-form="si">${fld('email', 'Work email', inp('email', a.email || '', 'type="email" autocomplete="email"'))}${fld('token', 'Invitation code (first time only)', inp('token', a.token || '', 'placeholder="Optional"'), 'Your client administrator sends this. It works once and expires.')}<button class="btn" style="height:42px" data-act="sendCode">Send code</button></div>`;
  else if (a.step === 'code') left = `<h2 style="font-size:1.9rem">Enter your code</h2><p class="muted" style="margin:8px 0 16px">We sent a 6-digit code to ${esc(a.email)}. It expires in 5 minutes.</p><div class="note" style="margin-bottom:16px">${ic('file')}<span><b>Simulated mailbox.</b> In production this arrives by email or Entra ID. Your code: <b id="mailcode">${esc(a.mailbox)}</b></span></div><div class="col" data-form="si">${fld('code', 'Code', inp('code', '', 'inputmode="numeric" autocomplete="one-time-code" maxlength="6"'))}<div class="row"><button class="btn" data-act="verify">Verify and continue</button><button class="btn ghost" data-act="authback">Use a different email</button></div></div>`;
  else left = `<h2 style="font-size:1.9rem">Welcome to ${esc(a.orgName)}</h2><p class="muted" style="margin:8px 0 16px">You’re joining as ${esc(cap(a.role))}. Read this before you enter.</p><div class="col" data-form="si"><div class="note ok"><span><b>Workspace terms.</b> You can use entitled demos and your organisation’s content. Others in ${esc(a.orgName)} see what you share with the organisation.</span></div><div class="note warn"><span><b>Joining isn’t consent to share.</b> Four separate permissions exist: storing a contribution, publishing a reviewed copy, naming your organisation, and any future training. All start off, and you choose each one per contribution.</span></div><label class="check"><input type="checkbox" data-f="ack"><span>I’ve read the terms and I understand that joining doesn’t share or train on my organisation’s data.</span></label><button class="btn" style="height:42px" data-act="acceptInvite">Enter workspace</button></div>`;
  const side = `<div class="card soft" style="margin-top:26px"><h4>Judge shortcut</h4><p class="small muted" style="margin:4px 0 10px">Skips the email code only. Every request still goes through the server-side policy.</p><div class="row" style="gap:6px">${[['u-ana', 'Ana, client'], ['u-omar', 'Omar, client admin'], ['u-tess', 'Tess, two orgs'], ['u-maya', 'Maya, moderator'], ['u-priya', 'Priya, product owner'], ['u-dev', 'Dev, publisher'], ['u-ravi', 'Ravi, admin'], ['u-eli', 'Eli, employee']].map(([id, n]) => `<button class="btn sm ghost" data-act="as" data-id="${id}">${n}</button>`).join('')}</div><button class="link small" style="margin-top:12px" data-act="sampleInvite">Fill in the sample client invitation</button></div>`;
  return `<div class="auth"><div class="auth-l"><div>${left}${a.step === 'email' ? side : ''}</div></div><div class="auth-r"><h2>The portal where clients teach the product, safely.</h2><p>Private by default. Reviewed by a person. Withdrawable any time.</p><div class="glass"><div class="row between" style="flex-wrap:nowrap"><b>Seasonality context</b><span class="chip ok">Shown, 3 organisations</span></div><p class="small" style="margin-top:8px">Quiet months of seasonal businesses look like decline when compared with the same month last year.</p></div><div class="glass"><b>Blocked</b><p class="small" style="margin-top:4px">A client asked for another organisation’s draft. The server refused.</p></div></div></div>`;
};
