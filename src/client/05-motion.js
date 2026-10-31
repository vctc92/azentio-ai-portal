/* =====================================================================
   fx.js - motion layer. Uses the Motion library (the Framer Motion engine)
   when it loads: spring reveals, scroll progress, cursor tilt, magnetic
   buttons, layout-style card moves. Falls back to CSS when it doesn't.
   ===================================================================== */
const fx = { token: 0 };
const hasMo = () => !!Mo && !reduce;
const doneOf = a => (a && a.finished ? a.finished.catch(() => { }) : pause(60));
function fxMode() { const h = document.documentElement.classList; h.toggle('fx-motion', hasMo()); h.toggle('fx-css', !Mo && !reduce); }

function whenVisible(el, fn, amount) {
  if (Mo && Mo.inView) Mo.inView(el, () => { fn(); }, { amount: amount || .3 });
  else if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); fn(); } }, { threshold: amount || .3 }); io.observe(el); } else fn();
}
function setupReveal() {
  const els = $$('.reveal:not(.shown)'); if (!els.length) return;
  if (reduce) { els.forEach(e => e.classList.add('shown')); return; }
  if (Mo && Mo.inView) {
    els.forEach(el => {
      const grid = el.hasAttribute('data-stagger'), d = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
      Mo.inView(el, () => {
        el.classList.add('shown');
        if (grid) { const kids = [...el.children]; kids.forEach(k => k.classList.add('shown')); anim(kids, { opacity: [0, 1], y: [40, 0], scale: [.95, 1] }, { type: 'spring', stiffness: 140, damping: 20, delay: stag(.11) }); }
        else anim(el, { opacity: [0, 1], y: [36, 0] }, { type: 'spring', stiffness: 105, damping: 19, delay: d });
      }, { amount: .15 });
    });
    return;
  }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('shown'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(e => io.observe(e));
}
function heroIn() {
  anim($$('.hero2-copy > *'), { opacity: [0, 1], y: [30, 0] }, { type: 'spring', stiffness: 120, damping: 20, delay: stag(.1) });
  anim($('.win'), { opacity: [0, 1], y: [60, 0], scale: [.94, 1], rotateX: [14, 0] }, { type: 'spring', stiffness: 90, damping: 17, delay: .25 });
  anim($('.f1'), { opacity: [0, 1], y: [30, 0], scale: [.8, 1] }, { type: 'spring', stiffness: 200, damping: 15, delay: .75 });
  anim($('.f2'), { opacity: [0, 1], y: [30, 0], scale: [.8, 1] }, { type: 'spring', stiffness: 200, damping: 15, delay: .95 });
}
function initTilt() {
  const hero = $('.hero2'), win = $('.win'); if (!hero || !win || !hasMo()) return;
  const f1 = $('.f1'), f2 = $('.f2'), mock = $('.mock'); let last = 0; const cl = v => Math.max(-1, Math.min(1, v));
  hero.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return; const t = performance.now(); if (t - last < 45) return; last = t;
    const r = mock.getBoundingClientRect(), nx = cl((e.clientX - (r.left + r.width / 2)) / (innerWidth / 2)), ny = cl((e.clientY - (r.top + r.height / 2)) / (innerHeight / 2));
    anim(win, { rotateY: nx * 7, rotateX: -ny * 5 }, { type: 'spring', stiffness: 90, damping: 18 });
    anim(f1, { x: nx * 18, y: ny * 12 }, { type: 'spring', stiffness: 90, damping: 15 }); anim(f2, { x: -nx * 14, y: -ny * 9 }, { type: 'spring', stiffness: 90, damping: 15 });
  });
  hero.addEventListener('pointerleave', () => { anim(win, { rotateX: 0, rotateY: 0 }, SOFT); anim(f1, { x: 0, y: 0 }, SOFT); anim(f2, { x: 0, y: 0 }, SOFT); });
}
function initMagnet() {
  if (!hasMo()) return;
  $$('.btn.lg').forEach(b => {
    b.addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; const r = b.getBoundingClientRect(); anim(b, { x: (e.clientX - r.left - r.width / 2) * .2, y: (e.clientY - r.top - r.height / 2) * .3 }, { type: 'spring', stiffness: 300, damping: 18 }); });
    b.addEventListener('pointerleave', () => anim(b, { x: 0, y: 0 }, { type: 'spring', stiffness: 300, damping: 14 }));
  });
}
function initLift() {
  if (!hasMo()) return;
  $$('.card.lift').forEach(c => {
    c.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') anim(c, { y: -6, scale: 1.014 }, { type: 'spring', stiffness: 420, damping: 24 }); });
    c.addEventListener('pointerleave', () => anim(c, { y: 0, scale: 1 }, { type: 'spring', stiffness: 300, damping: 22 }));
  });
}
function initScroll() {
  const upd = () => { const h = document.documentElement, max = h.scrollHeight - h.clientHeight, p = max > 0 ? h.scrollTop / max : 0, bar = $('#progress'); if (bar) bar.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`; const rb = $('.ribbon'); if (rb && !reduce) rb.style.translate = `0 ${Math.min(140, h.scrollTop * .14)}px`; };
  if (Mo && Mo.scroll && !reduce) { try { Mo.scroll(() => upd()); } catch (e) { } }
  window.addEventListener('scroll', upd, { passive: true }); upd();
}

/* ---------------- animated product demos (loop while visible and mounted) ---------------- */
async function typeInto(el, text, alive) { let i = 0; while (i < text.length) { if (!alive()) return; i = Math.min(text.length, i + 3); el.textContent = text.slice(0, i); await pause(22); } }
async function airaDemo(root, tk) {
  if (root._run) return; root._run = true; const alive = () => fx.token === tk && root.isConnected;
  const A = root.dataset.a, A3 = root.dataset.a3, A2 = root.dataset.a2, ans = $('.ans', root), cites = $('.cites', root), cnt = $('.cnt', root), srcs = $$('.src', root);
  await pause(500);
  while (alive()) {
    ans.textContent = ''; cites.style.opacity = 0; cnt.textContent = '3 sources';
    srcs.forEach(s => { s.style.cssText = ''; s.style.display = ''; s.querySelector('.m').innerHTML = '<span class="chip ok">Approved</span><span class="tiny faint">Q3 2026</span>'; });
    Array.from(cites.children).forEach(c => c.style.display = '');
    anim(srcs, { opacity: [0, 1], x: [28, 0] }, { type: 'spring', stiffness: 190, damping: 19, delay: stag(.12) });
    await typeInto(ans, A + A3, alive); if (!alive()) return;
    cites.style.opacity = 1; anim(cites, { opacity: [0, 1], y: [8, 0] }, SPRING); anim($$('.chip', cites), { scale: [.4, 1] }, { type: 'spring', stiffness: 520, damping: 15, delay: stag(.09) });
    await pause(1700); if (!alive()) return;
    const last = srcs[2]; last.querySelector('.m').innerHTML = '<span class="chip no">Withdrawn by the author</span>'; anim(last, { scale: [1, 1.04, 1] }, { duration: .45 }); await pause(1000); if (!alive()) return;
    const h = last.offsetHeight; last.style.overflow = 'hidden';
    const a = anim(last, { opacity: [1, 0], x: [0, 36], height: [h + 'px', '0px'], marginTop: ['8px', '0px'], paddingTop: ['10px', '0px'], paddingBottom: ['10px', '0px'] }, { duration: .55, ease: EASE });
    await (a ? doneOf(a) : pause(100)); last.style.display = 'none';
    cnt.textContent = '2 sources'; ans.innerHTML = esc(A) + '<span class="hl">' + esc(A2) + '</span>'; anim(ans, { opacity: [.3, 1] }, { duration: .6 });
    if (cites.lastElementChild) cites.lastElementChild.style.display = 'none';
    await pause(3800);
  }
}
async function boardDemo(root, tk) {
  if (root._run) return; root._run = true; const alive = () => fx.token === tk && root.isConnected;
  const card = $('.mv', root), cols = $$('.bcol', root), note = $('.bnote', root), m = $('.m', card);
  const move = async to => { const first = card.getBoundingClientRect(); cols[to].appendChild(card); const last = card.getBoundingClientRect(); const a = anim(card, { x: [first.left - last.left, 0], y: [first.top - last.top, 0], scale: [1.05, 1] }, { type: 'spring', stiffness: 160, damping: 19 }); await (a ? doneOf(a) : pause(80)); };
  await pause(700);
  while (alive()) {
    cols[0].appendChild(card); note.textContent = 'Internal only. Clients can’t see this idea yet.'; m.innerHTML = '<span class="chip ai">Financial Analysis</span><span class="chip st">Internal</span>';
    await pause(1900); if (!alive()) return;
    await move(1); if (!alive()) return;
    m.innerHTML = '<span class="chip ai">Financial Analysis</span><span class="chip ok">Visible to clients</span>'; anim(m, { opacity: [0, 1], y: [6, 0] }, { duration: .45 });
    note.textContent = 'Under review, and the status is shared with clients. Not a delivery commitment.'; anim(note, { opacity: [.3, 1] }, { duration: .5 });
    await pause(3800); if (!alive()) return; await move(0);
  }
}
async function consentDemo(root, tk) {
  if (root._run) return; root._run = true; const alive = () => fx.token === tk && root.isConnected;
  const tgs = $$('.tg', root), sum = $('.stxt', root), chipEl = $('.mk-bar .chip', root);
  const knob = (t, on) => { const k = $('.kn', t); t.classList.toggle('on', on); const a = anim(k, { x: on ? 17 : 0 }, { type: 'spring', stiffness: 620, damping: 22 }); if (!a) k.style.transform = on ? 'translateX(17px)' : ''; };
  const say = (t, c, label) => { sum.textContent = t; anim(sum, { opacity: [0, 1], x: [-8, 0] }, { duration: .4, ease: EASE }); chipEl.className = 'chip ' + c; chipEl.textContent = label; };
  await pause(600);
  while (alive()) {
    tgs.forEach(t => knob(t, false)); say('Only you can see this.', '', 'Draft, private'); await pause(1300); if (!alive()) return;
    knob(tgs[0], true); await pause(900); if (!alive()) return;
    knob(tgs[1], true); say('A moderator reviews a de-identified copy. Nothing is shared until it is approved.', 'wait', 'Proposed for review'); await pause(2300); if (!alive()) return;
    say('Approved participants see the reviewed copy. Your organisation’s name stays hidden.', 'ok', 'Published'); await pause(1700); if (!alive()) return;
    anim($('.kn', tgs[2]), { x: [0, 6, 0] }, { duration: .5 }); say('Attribution stays off unless you choose it. Training is a separate choice again.', 'ok', 'Published'); await pause(3200);
  }
}
function initDemos(tk) { [['.aira-demo', airaDemo], ['.board-demo', boardDemo], ['.consent-demo', consentDemo]].forEach(([s, fn]) => { const el = $(s); if (el) whenVisible(el, () => fn(el, tk), .35); }); }
function fxInit() { fx.token++; fxMode(); setupReveal(); initTilt(); initMagnet(); initLift(); initDemos(fx.token); }
