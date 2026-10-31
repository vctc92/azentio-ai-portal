// Exercises the Motion code paths (reveals, demo loops) with a stand-in that implements the same API surface.
import { launch, url, makeChecker } from './helpers.mjs';

const { ok, done } = makeChecker();
const { browser, page: pg, errors } = await launch({ motion: true });
await pg.goto(url); await pg.waitForTimeout(900);
ok('motion mode enabled', await pg.evaluate("document.documentElement.classList.contains('fx-motion')"));
ok('animations were started', (await pg.evaluate('__anims')) > 10);

const H = await pg.evaluate('document.documentElement.scrollHeight');
for (let y = 0; y < H; y += 500) { await pg.evaluate(`scrollTo(0,${y})`); await pg.waitForTimeout(250); }
ok('all scroll reveals fire', await pg.evaluate("[...document.querySelectorAll('.reveal')].every(e=>e.classList.contains('shown'))"));

await pg.evaluate("document.querySelector('.aira-demo').scrollIntoView({block:'center'})"); await pg.waitForTimeout(5200);
ok('AIRA answer streams in', (await pg.innerText('.aira-demo .ans')).length > 100);
await pg.waitForTimeout(5500);
ok('AIRA shrinks after withdrawal', (await pg.innerText('.aira-demo .cnt')) === '2 sources' && (await pg.innerText('.aira-demo .ans')).includes('below the threshold'));
await pg.evaluate("document.querySelector('.board-demo').scrollIntoView({block:'center'})"); await pg.waitForTimeout(4500);
ok('idea card moves to Under review', (await pg.evaluate("document.querySelector('.board-demo .mv').parentElement.dataset.c")) === '1');
await pg.evaluate("document.querySelector('.consent-demo').scrollIntoView({block:'center'})"); await pg.waitForTimeout(5200);
ok('consent toggles switch on', (await pg.evaluate("document.querySelectorAll('.consent-demo .tg.on').length")) >= 1);

await pg.evaluate("ACT.as({dataset:{id:'u-ana'}})"); await pg.waitForTimeout(600);
ok('dashboard banner', (await pg.innerText('#page')).includes('Share what you see'));
await pg.evaluate("go('observations')"); await pg.waitForTimeout(400);
await pg.evaluate("ACT.tab({dataset:{name:'obs',val:'org'}})"); await pg.waitForTimeout(300);
ok('tab change keeps content', (await pg.innerText('#page')).includes('cheat-sheet'));
await browser.close();
done('motion tests', errors);
