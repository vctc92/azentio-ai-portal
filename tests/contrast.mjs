// WCAG contrast audit across every screen in light and dark themes (HTML text on solid backgrounds).
import { launch, url } from './helpers.mjs';

const AUDIT = `() => {
 const parse=s=>{ if(!s||s==='transparent') return [0,0,0,0]; let m=s.match(/^rgba?\\(([^)]+)\\)/); if(m){const p=m[1].split(/[ ,\\/]+/).filter(Boolean).map(Number);return [p[0],p[1],p[2],p.length>3?p[3]:1]}
   m=s.match(/^color\\((?:srgb|display-p3) ([^)]+)\\)/); if(m){const p=m[1].split(/[ \\/]+/).filter(Boolean).map(Number);return [p[0]*255,p[1]*255,p[2]*255,p.length>3?p[3]:1]} return [0,0,0,0]};
 const blend=(f,b)=>{const a=f[3];return [f[0]*a+b[0]*(1-a),f[1]*a+b[1]*(1-a),f[2]*a+b[2]*(1-a),1]};
 const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};
 const cr=(a,b)=>{const l1=lum(a),l2=lum(b);return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)};
 const rb=parse(getComputedStyle(document.body).backgroundColor); const base=rb[3]?rb:[255,255,255,1];
 const bgOf=el=>{const st=[];let n=el,grad=false;while(n&&n.nodeType===1){const cs=getComputedStyle(n);
   if(/gradient/.test(cs.backgroundImage||'')&&!/diagram|thumb|hero2/.test(n.className&&n.className.baseVal===undefined?n.className:''))grad=true;
   const c=parse(cs.backgroundColor);if(c[3]>0)st.push(c);if(c[3]>=1)break;n=n.parentElement}
   let b=base;for(let i=st.length-1;i>=0;i--)b=blend(st[i],b);return {b,grad}};
 const out=[],seen=new Set();
 for(const el of document.querySelectorAll('body *')){
   if(el.closest('script,style,#toasts,.mock,svg')) continue;
   const cs=getComputedStyle(el); if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0) continue;
   let txt=''; for(const n of el.childNodes) if(n.nodeType===3) txt+=n.textContent; txt=txt.trim(); if(!txt) continue;
   const r=el.getBoundingClientRect(); if(!r.width||!r.height) continue;
   const {b,grad}=bgOf(el); if(grad) continue;
   const fg=parse(cs.color), f=blend(fg,b), ratio=cr(f,b), size=parseFloat(cs.fontSize), bold=+cs.fontWeight>=600;
   const need=(size>=24||(size>=18.66&&bold))?3:4.5;
   if(ratio<need){const k=el.className+'|'+txt.slice(0,24); if(seen.has(k)) continue; seen.add(k); out.push({ratio:+ratio.toFixed(2),need,sel:el.tagName.toLowerCase()+'.'+el.className,text:txt.slice(0,40)});}
 }
 return out;
}`;

const routes = [['home', null], ['signin', null], ['offerings', null], ['media', null], ['about', null], ['demo', null], ['hackathon', null],
  ['dashboard', 'u-ana'], ['sandbox', 'u-ana'], ['observations', 'u-ana'], ['learning', 'u-lena'], ['resources', 'u-ana'], ['team', 'u-omar'],
  ['moderation', 'u-maya'], ['ideas', 'u-priya'], ['admin', 'u-ravi'], ['lab', 'u-eli'], ['federated', 'u-eli'], ['playground', 'u-priya'], ['publisher', 'u-dev'], ['live', 'u-eli']];

const { browser, page } = await launch();
await page.goto(url); await page.waitForTimeout(500);
let total = 0;
for (const theme of ['light', 'dark']) {
  await page.evaluate(`document.documentElement.dataset.theme='${theme}'`);
  for (const [route, who] of routes) {
    await page.evaluate(`(()=>{ ${who ? `ACT.as({dataset:{id:'${who}'}});` : 'ACT.signout();'} UI.tab={}; go('${route}'); })()`);
    await page.waitForTimeout(350);
    if (route === 'learning') { await page.evaluate("ACT.tab({dataset:{name:'learn',val:'feed'}})"); await page.waitForTimeout(200); }
    if (route === 'sandbox' || route === 'playground') await page.evaluate('ACT.sbrun()');
    if (route === 'federated') await page.evaluate('ACT.fedrun()');
    if (route === 'home') { const H = await page.evaluate('document.documentElement.scrollHeight'); for (let y = 0; y < H; y += 600) { await page.evaluate(`scrollTo(0,${y})`); await page.waitForTimeout(120); } await page.waitForTimeout(1500); }
    await page.waitForTimeout(250);
    const fails = await page.evaluate(`(${AUDIT})()`);
    if (fails.length) { total += fails.length; console.log(`${theme}/${route}: ${fails.length}`); fails.slice(0, 6).forEach(f => console.log(`   ${f.ratio} < ${f.need}  ${f.sel.slice(0, 50)}  "${f.text}"`)); }
  }
}
await browser.close();
console.log(total ? `contrast audit: ${total} issue(s)` : 'contrast audit: no issues');
process.exit(total ? 1 : 0);
