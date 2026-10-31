import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

export const url = pathToFileURL(path.resolve('dist/index.html')).href;

export async function launch({ motion = false, viewport = { width: 1360, height: 900 } } = {}) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport });
  if (motion) await page.addInitScript({ path: 'tests/helpers/mock-motion.js' });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load/.test(m.text())) errors.push(m.text()); });
  return { browser, page, errors };
}

export function makeChecker() {
  let pass = 0, fail = 0;
  return {
    ok(name, cond) { if (cond) pass++; else { fail++; console.log('FAIL', name); } },
    done(label, errors = []) {
      for (const e of errors) { fail++; console.log('PAGE ERROR', e); }
      console.log(`${label}: ${pass} passed, ${fail} failed`);
      process.exit(fail ? 1 : 0);
    }
  };
}
