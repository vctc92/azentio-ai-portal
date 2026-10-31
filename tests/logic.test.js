// Server-layer tests: policy engine, tenant isolation, lifecycle, cohort rules, withdrawal purge, federated simulation.
const c=require('../src/server/core.js'); const {api,S}=c; let pass=0,fail=0;
const t=(n,v)=>{ if(v){pass++}else{fail++;console.log('FAIL',n)} };
const as=id=>api.auth.judgeShortcut(id);
// anonymous
S.uid=null;
t('anon shared denied',!api.shared.search({}).ok);
t('anon public video ok',api.media('v-pub-1').ok);
t('anon employee video denied',!api.media('v-emp-1').ok);
t('anon config denied',!api.admin.overview().ok);
// client
as('u-ana');
t('ana employee video denied',!api.media('v-emp-1').ok);
t('ana entitled video ok',api.media('v-cli-1').ok);
t('ana not-invited webinar? (nw invited)',api.media('v-cli-2').ok);
t('ana other tenant draft denied',!api.obs.get('obs-hb-draft').ok);
t('ana own draft ok',api.obs.get('obs-nw-draft').ok);
t('ana xp denied',!api.sandbox.run('xp-seas','garden').ok);
t('ana fai ok',api.sandbox.run('fai','garden',true).ok);
t('ana invite denied (not admin)',!api.org.invite('x@northwind.example','client_member').ok);
let th=api.shared.themes().data; t('seasonality suppressed (2 orgs)',th.find(x=>x.id==='seasonality').suppressed);
t('shared payload has no tenant', !JSON.stringify(api.shared.search({}).data).includes('o-hb'));
// omar admin escalation
as('u-omar');
t('omar escalate blocked',!api.org.invite('z@northwind.example','moderator').ok);
t('omar bad domain blocked',!api.org.invite('z@gmail.com','client_member').ok);
t('omar invite ok',api.org.invite('z@northwind.example','client_member').ok);
t('omar cannot read ana private',!api.obs.get('obs-nw-draft').ok);
// moderator
as('u-maya');
t('maya queue',api.review.queue().data.length>=3);
t('maya cannot open draft',!api.obs.get('obs-nw-draft').ok);
t('maya opens submitted',api.obs.get('obs-nw-1').ok);
api.review.claim('obs-nw-1');
let bad=api.review.publish('obs-nw-1',{title:'Seasonal cash flow in Northwind Leeds',summary:'Spring revenue is about five times winter revenue at Northwind, ACC 48213377.',industry:'Retail SME',region:'UK & Ireland',period:'Q3 2026',theme:'seasonality'});
t('publish blocked while identifiers remain',!bad.ok);
let ok=api.review.publish('obs-nw-1',{title:'Seasonal cash flow looks like decline in quiet months',summary:'Templates that only compare against the same month last year make the quiet months of seasonal businesses look like a deterioration. Spring revenue can be several times winter revenue.',industry:'Retail SME',region:'Northern Europe',period:'Q3 2026',theme:'seasonality',quality:'Good'});
t('publish ok',ok.ok);
as('u-lena');
th=api.shared.themes().data; t('seasonality now 3 orgs',!th.find(x=>x.id==='seasonality').suppressed && th.find(x=>x.id==='seasonality').orgCount===3);
t('docquality still suppressed',th.find(x=>x.id==='doc-quality').suppressed);
// idea
as('u-priya');
let sid='s-obs-nw-1';
t('idea create',api.ideas.create({title:'Seasonality-aware comparison explanation',problem:'Quiet months look like deterioration when compared against the same month last year.',offering:'fai',outcome:'Explain seasonal troughs next to ratios.',owner:'FAI squad',priority:'Medium',refs:[sid]}).ok);
as('u-eli'); t('eli cannot create idea',!api.ideas.create({}).ok);
as('u-priya'); const id=api.ideas.list().data[0].id; t('status',api.ideas.setStatus(id,'Under review',true,'We’re reviewing a seasonality-aware comparison explanation.').ok);
as('u-ana'); const il=api.ideas.list().data; t('client sees idea sans internal',il.some(i=>i.status==='Under review')&&!JSON.stringify(il).includes('Do not share')&&!JSON.stringify(il).includes('priority'));
// withdraw purge
as('u-ana'); const w=api.obs.withdraw('obs-nw-1'); t('withdraw ok',w.ok&&w.data.purge.search);
th=api.shared.themes().data; t('theme suppressed again after withdraw',th.find(x=>x.id==='seasonality').suppressed);
t('aira no longer cites',!JSON.stringify(api.aira.ask('seasonal quiet months comparison').data).includes('s-obs-nw-1'));
// admin
as('u-ravi'); t('admin cannot read private',!api.obs.get('obs-hb-draft').ok);
t('support auth',api.admin.supportAuthorise('obs-hb-draft','Investigating a report from the client ticket').ok);
t('admin reads after auth',api.obs.get('obs-hb-draft').ok);
t('admin cannot remove own grant',!api.admin.setGrant('u-ravi','portal_admin',false).ok);
as('u-dev'); t('publisher banner',api.content.setBanner('Demo day moved to 14 November. Register now.').ok);
as('u-eli'); t('eli banner denied',!api.content.setBanner('Hello world this is a banner').ok);
// auth
t('external email no membership',(()=>{const r=api.auth.requestCode('rando@gmail.com');return !api.auth.verify('rando@gmail.com',r.data.simulatedMailbox).ok})());
t('unprovisioned azentio',(()=>{const r=api.auth.requestCode('new@azentio.com');return !api.auth.verify('new@azentio.com',r.data.simulatedMailbox).ok})());
t('invite flow',(()=>{const e='nina.cole@northwind.example';const r=api.auth.requestCode(e);const v=api.auth.verify(e,r.data.simulatedMailbox,'NW-7Q2K-91XA');return v.ok&&v.data.needsTerms&&api.auth.acceptInvite(e).ok&&api.me().memberships[0].org==='o-nw'})());
// multi-membership
as('u-tess'); t('tess needs workspace',api.me().needsWorkspace && !api.obs.list('mine').ok);
api.auth.switchOrg('o-hb'); t('tess hb ok',api.obs.list('mine').ok);
t('tess cannot switch to alder',!api.auth.switchOrg('o-al').ok);
// lifecycle: save->submit
as('u-ana');
const s=api.obs.save({title:'Test observation title',body:'A'.repeat(60),type:'Product gap',offering:'fai',industry:'Retail SME',region:'Global',period:'Q3 2026',evidence:'Anecdotal',confidence:'Low',sharing:'community',consent:{store:true,publish:true}});
t('save draft',s.ok&&s.data.status==='Draft'&&s.data.visibility==='private');
t('submit',api.obs.submit(s.data.id).ok);
t('edit locked while submitted',!api.obs.save({id:s.data.id,title:'New title here'}).ok);
// federated
as('u-eli'); const f=api.fed.run({}).data; console.log('fed acc',f.finalAcc.toFixed(2),'majority',f.baseline.majority.toFixed(2),'localA',f.baseline.localOnly.toFixed(2));
const fp=api.fed.run({poison:true}).data; console.log('poison',fp.rounds[0].rows.map(r=>r.id+':'+r.status).join(' | '),fp.finalAcc.toFixed(2));
const fd=api.fed.run({dropout:true}).data; console.log('dropout r2',fd.rounds[1].skipped,fd.rounds[1].rows.map(r=>r.status).join(','));
t('fed not accessible to client',(()=>{as('u-ana');return !api.fed.run({}).ok})());
console.log(`logic tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
