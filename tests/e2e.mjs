// Browser end-to-end test of the main journeys (runs against dist/index.html, no network needed).
import { launch, url, makeChecker } from './helpers.mjs';

const { ok, done } = makeChecker();
const { browser, page: pg, errors } = await launch();
await pg.goto(url); await pg.waitForTimeout(600);
const click = async s => { await pg.click(s); await pg.waitForTimeout(250); };
const txt = () => pg.innerText('#page');
const as = async id => { await pg.evaluate(`ACT.as({dataset:{id:'${id}'}})`); await pg.waitForTimeout(450); };
const toasts = () => pg.innerText('#toasts');
const modal = () => pg.innerText('#modal');

// public site
ok('home renders', (await txt()).includes('Who can open what?'));
await click('[data-act="hero"][data-id="u-lena"]');
ok('persona widget blocks other tenant', (await pg.innerText('#heroVers')).includes('Blocked'));
await click('[data-act="go"][data-r="media"]');
await click('[data-act="play"][data-id="v-pub-1"]'); ok('public video plays', (await modal()).includes('Stream authorised')); await click('#modal [data-act="close"]');
await click('[data-act="go"][data-r="demo"]'); await click('[data-act="submitDemo"]'); ok('demo form validates', (await txt()).includes('Enter your name'));

// sign-in
await click('[data-act="go"][data-r="signin"]');
await pg.fill('[data-f="email"]', 'rando@gmail.com'); await click('[data-act="sendCode"]');
let code = await pg.innerText('#mailcode'); await pg.fill('[data-f="code"]', code); await click('[data-act="verify"]');
ok('outside email refused', (await toasts()).includes('isn’t linked'));
await click('[data-act="authback"]'); await click('[data-act="sampleInvite"]'); await click('[data-act="sendCode"]');
code = await pg.innerText('#mailcode'); await pg.fill('[data-f="code"]', code); await click('[data-act="verify"]');
ok('invitation shows terms', (await txt()).includes('Welcome to Northwind'));
await click('[data-act="acceptInvite"]'); ok('terms must be ticked', (await toasts()).includes('Tick the box'));
await pg.check('[data-f="ack"]'); await click('[data-act="acceptInvite"]'); await pg.waitForTimeout(500);
ok('invitee lands in workspace', (await txt()).includes('Hello, Nina') && (await pg.innerText('#side')).includes('Northwind'));

// client
await as('u-ana'); ok('client dashboard', (await txt()).includes('Hello, Ana'));
await click('[data-act="go"][data-r="observations"]'); ok('observations list', (await txt()).includes('Seasonal cash flow at Northwind'));
await pg.click('[data-act="openObs"][data-id="obs-nw-1"]'); await pg.waitForTimeout(400); ok('detail shows audience table', (await modal()).includes('Who can see this')); await click('#modal [data-act="close"]');
await click('[data-act="newObs"]'); await click('#modal [data-act="saveObs"][data-submit="0"]'); ok('form validates server-side', (await modal()).includes('at least 3'));
await pg.fill('#modal [data-f="title"]', 'Account 12345678 from Northwind'); await pg.fill('#modal [data-f="body"]', 'Contact me at a@b.com about the contract.'); await pg.waitForTimeout(200);
ok('live sensitive-content scan', (await modal()).includes('Heads up')); await click('#modal [data-act="close"]');

// security lab
await click('[data-act="inspector"]'); await click('[data-act="probe"][data-p="draft"]');
ok('cross-tenant draft refused', (await toasts()).includes('another author or tenant'));
await click('[data-act="probe"][data-p="escalate"]'); ok('access log records checks', (await pg.innerText('#inspector')).includes('org.invite')); await click('#inspector [data-act="close"]');

// moderator publishes the third organisation
await as('u-maya'); await click('[data-act="go"][data-r="moderation"]'); ok('queue lists submission', (await txt()).includes('Seasonal cash flow at Northwind'));
await pg.click('[data-act="review"][data-id="obs-nw-1"]'); await pg.waitForTimeout(400); ok('review workspace', (await modal()).includes('Private source'));
await click('#modal [data-act="pub"]'); ok('publish blocked while identifiers remain', (await modal()).includes('still contains'));
await pg.fill('#modal [data-f="title"]', 'Seasonal cash flow looks like decline in quiet months');
await pg.fill('#modal [data-f="summary"]', 'Templates that compare only against the same month last year make quiet months of seasonal businesses look like deterioration. Spring revenue can be several times winter revenue.');
await pg.selectOption('#modal [data-f="region"]', 'Northern Europe');
await click('#modal [data-act="pub"]'); await pg.waitForTimeout(500); ok('published', (await toasts()).includes('Published'));

// another client sees the theme unlock
await as('u-lena'); await click('[data-act="go"][data-r="learning"]');
const t = await txt(); ok('theme unlocked at 3 organisations', t.includes('3 organisations') && t.includes('Hidden for privacy') && t.includes('Small sample'));
await click('[data-act="tab"][data-val="feed"]'); ok('feed lists approved items', (await txt()).includes('Annual averages hide the cash trough'));
await pg.fill('[data-feed="q"]', 'cash trough'); await pg.waitForTimeout(500); ok('search filters', (await txt()).includes('1 approved'));
await click('[data-act="tab"][data-val="aira"]'); await pg.fill('[data-f="q"]', 'seasonal businesses annual ratios'); await click('[data-act="aira"]'); ok('AIRA answers with citations', (await txt()).includes('AIRA, from approved'));

// product owner
await as('u-priya'); await click('[data-act="go"][data-r="ideas"]'); await click('[data-act="newIdea"]');
await pg.fill('#modal [data-f="title"]', 'Seasonality-aware comparison'); await pg.fill('#modal [data-f="problem"]', 'Quiet months look like deterioration against same-month comparison.');
await pg.fill('#modal [data-f="outcome"]', 'Explain seasonal troughs beside ratios.'); await pg.fill('#modal [data-f="owner"]', 'FAI squad');
await click('#modal [data-act="createIdea"]'); ok('idea needs linked evidence', (await modal()).includes('Link at least one'));
await pg.check('#modal [data-f="refs"] >> nth=0'); await click('#modal [data-act="createIdea"]'); await pg.waitForTimeout(400); ok('idea created', (await txt()).includes('Seasonality-aware comparison'));

// withdrawal
await as('u-ana'); await click('[data-act="go"][data-r="observations"]'); await pg.click('[data-act="openObs"][data-id="obs-nw-1"]'); await pg.waitForTimeout(300);
await click('#modal [data-act="withdraw"]'); await click('#modal [data-act="withdrawGo"]'); await pg.waitForTimeout(1500);
const m = await modal(); ok('withdrawal purge screen', m.includes('Search index entry removed') && m.includes('ms')); await click('#modal [data-act="close"]');

// admin and boundaries
await as('u-ravi'); await click('[data-act="go"][data-r="admin"]'); const a = await txt(); ok('admin sees grants and purge log', a.includes('Role grants') && a.includes('cleared in'));
await pg.evaluate("ACT.as({dataset:{id:'u-ana'}}); go('admin')"); await pg.waitForTimeout(500); ok('client denied admin page by the server', (await txt()).includes('Access denied by the server'));
await pg.evaluate("ACT.as({dataset:{id:'u-eli'}}); go('federated')"); await pg.waitForTimeout(400); await click('[data-act="fedrun"]'); await pg.waitForTimeout(400); ok('federated run', (await txt()).includes('Global accuracy'));
await click('[data-act="fedreg"]'); await click('[data-act="feddec"][data-d="approve"]'); ok('only product owners approve deployment', (await toasts()).includes('Only product owners'));
await pg.evaluate("ACT.as({dataset:{id:'u-priya'}}); go('playground')"); await pg.waitForTimeout(400); await click('[data-act="sbrun"]'); ok('sandbox labels simulated output', (await txt()).includes('Synthetic data. Simulated output.'));
await pg.evaluate("ACT.as({dataset:{id:'u-omar'}}); go('team')"); await pg.waitForTimeout(300); await click('[data-act="escalate"]'); ok('platform-role escalation blocked', (await toasts()).includes('platform role'));
await pg.evaluate("ACT.as({dataset:{id:'u-tess'}}); go('dashboard')"); await pg.waitForTimeout(300); ok('multi-membership needs explicit workspace', (await txt()).includes('Choose a workspace'));

// layout: no sideways scrolling on phones
await pg.evaluate('ACT.signout()'); await pg.waitForTimeout(300);
for (const w of [1280, 390]) {
  await pg.setViewportSize({ width: w, height: 860 }); await pg.evaluate("go('home')"); await pg.waitForTimeout(600);
  ok(`no horizontal scroll at ${w}px`, !(await pg.evaluate('(()=>{scrollTo(400,0);return scrollX>0})()')));
}
await browser.close();
done('e2e tests', errors);
