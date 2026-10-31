(function(){
  const comp=(o)=>{const t=[];if(o.x!=null||o.y!=null)t.push(`translate(${o.x||0}px,${o.y||0}px)`);if(o.scale!=null)t.push(`scale(${o.scale})`);if(o.rotateX!=null)t.push(`rotateX(${o.rotateX}deg)`);if(o.rotateY!=null)t.push(`rotateY(${o.rotateY}deg)`);return t.join(' ')};
  const last=v=>Array.isArray(v)?v[v.length-1]:v;
  window.__anims=0;
  window.Motion={
    animate(t,kf,opt){ window.__anims++;
      if(typeof t==='number'){ const to=kf; const u=opt&&opt.onUpdate; if(u){u(t);setTimeout(()=>u(to),30);} return {finished:Promise.resolve()}; }
      const els=typeof t==='string'?[...document.querySelectorAll(t)]:(t instanceof Element?[t]:[...t]);
      els.forEach(el=>{const o={};for(const k in kf)o[k]=last(kf[k]); if('opacity' in o) el.style.opacity=o.opacity; const tr=comp(o); if(tr) el.style.transform=tr; ['height','marginTop','paddingTop','paddingBottom'].forEach(k=>{if(k in o)el.style[k]=o[k]});});
      return {finished:new Promise(r=>setTimeout(r,40))};
    },
    stagger:s=>s, inView(el,cb){ setTimeout(()=>cb(),30); return ()=>{} }, scroll(cb){ return ()=>{} }
  };
})();
