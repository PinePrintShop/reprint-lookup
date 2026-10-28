/* Pine: pick the part of an Illustrator file / PDF to open (2026-10-28, Stephen: "in an .ai file that was uploaded it
   also had the front text you helped me build... can you find a way for us to open this and be able to pull out other
   layers as well").
   An .ai saved with "Create PDF Compatible File" holds every artboard as a page and its layers as optional content.
   PineAiParts.choose(doc, {name}) shows them (only when there's more than one artboard or layer):
     - a tile per artboard, cropped to its art, with the art's size
     - a tick box per layer (all on to start)
     - a big preview of the artboard with those layers
   and resolves to {page, occ, label} (occ: the pdf.js OptionalContentConfig to render with, or null) or to null when
   the person cancels. Read only; uses the page's pdf.js and the Pine style classes (p-scrim, p-modal, p-btn). */
(function(){
  const PX=1/72;   // inches per PDF point
  let css=false;
  function style(){ if(css) return; css=true; const s=document.createElement('style'); s.textContent=`
.pap-modal{width:min(980px,96vw);max-height:92vh}
.pap-body{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:16px;align-items:start}
@media (max-width:760px){ .pap-body{grid-template-columns:1fr} }
.pap-lbl{display:block;font:700 12px/1.3 Helvetica,Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;margin:0 0 6px}
.pap-tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:8px;margin-bottom:14px}
.pap-tile{display:flex;flex-direction:column;gap:4px;padding:6px;border:2px solid #d9d4c7;border-radius:8px;background:#fff;cursor:pointer;text-align:left;font:400 12px/1.3 Helvetica,Arial,sans-serif;color:#141412;min-height:44px}
.pap-tile.is-on{border-color:#141412;box-shadow:0 0 0 1px #141412}
.pap-tile b{font-size:13px}
.pap-th{display:grid;place-items:center;height:96px;background:repeating-conic-gradient(#e6e1d4 0 25%,#f4f0e6 0 50%) 0 0/14px 14px;border-radius:4px;overflow:hidden}
.pap-th canvas{max-width:100%;max-height:96px;display:block}
.pap-layers{display:flex;flex-direction:column;gap:2px;margin-bottom:8px}
.pap-layers label{display:flex;align-items:center;gap:10px;min-height:40px;font:700 14px/1.3 Helvetica,Arial,sans-serif;cursor:pointer}
.pap-layers input{width:22px;height:22px;accent-color:#141412}
.pap-pv{display:grid;place-items:center;min-height:260px;max-height:58vh;background:repeating-conic-gradient(#e6e1d4 0 25%,#f4f0e6 0 50%) 0 0/20px 20px;border-radius:8px;overflow:hidden}
.pap-pv canvas{max-width:100%;max-height:58vh;display:block}
.pap-hint{font:400 13px/1.4 Helvetica,Arial,sans-serif;color:#5b574f;margin:6px 0 0}`; document.head.appendChild(s); }

  // render a page at scale, with layers; then the box the ink covers (alpha), in canvas pixels
  async function draw(page,scale,occ){
    const vp=page.getViewport({scale}), c=document.createElement('canvas'); c.width=Math.max(1,Math.round(vp.width)); c.height=Math.max(1,Math.round(vp.height));
    const o={canvasContext:c.getContext('2d',{willReadFrequently:true}),viewport:vp,background:'rgba(0,0,0,0)'}; if(occ) o.optionalContentConfigPromise=Promise.resolve(occ);
    await page.render(o).promise; return c; }
  function inkBox(c){ const W=c.width,H=c.height, d=c.getContext('2d').getImageData(0,0,W,H).data; let x0=W,y0=H,x1=-1,y1=-1;
    for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(d[(y*W+x)*4+3]>8){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
    return x1<0?null:{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1}; }
  function crop(c,b,pad){ if(!b) return c; const p=pad||0, x=Math.max(0,b.x-p), y=Math.max(0,b.y-p), w=Math.min(c.width-x,b.w+2*p), h=Math.min(c.height-y,b.h+2*p);
    const o=document.createElement('canvas'); o.width=w; o.height=h; o.getContext('2d').drawImage(c,x,y,w,h,0,0,w,h); return o; }
  const fmt=v=>(Math.round(v*10)/10).toString();
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  async function layersOf(doc){ try{ const occ=await doc.getOptionalContentConfig(); const g=occ&&occ.getGroups&&occ.getGroups(); if(!g) return {occ:null,list:[]};
      return {occ,list:Object.keys(g).map(id=>({id,name:String(g[id].name||'Layer')}))}; }catch(e){ return {occ:null,list:[]}; } }

  async function choose(doc,opt){
    opt=opt||{}; const n=doc.numPages, L=await layersOf(doc);
    if(n<2&&L.list.length<2) return {page:1,occ:null,label:''};
    style();
    const st={page:1,on:Object.fromEntries(L.list.map(l=>[l.id,true]))};
    const sc=document.createElement('div'); sc.className='p-scrim'; sc.id='papModal';
    sc.innerHTML=`<div class="p-modal pap-modal" role="dialog" aria-modal="true" aria-labelledby="papT">
      <div class="p-modal-h"><h2 class="p-h2" id="papT" style="word-break:break-word">${esc(opt.name||'This file')}</h2><button class="p-modal-x" type="button" data-x aria-label="Close">×</button></div>
      <div class="p-modal-b"><div class="pap-body"><div>
        ${n>1?`<span class="pap-lbl">${n} artboards</span><div class="pap-tiles" data-tiles></div>`:''}
        ${L.list.length>1?`<span class="pap-lbl">Layers</span><div class="pap-layers" data-layers>${L.list.map(l=>`<label><input type="checkbox" checked data-l="${esc(l.id)}">${esc(l.name)}</label>`).join('')}</div>`:''}
        <p class="pap-hint">${n>1?'Each artboard is its own design. ':''}${L.list.length>1?'Untick a layer to leave it out. ':''}It opens cropped to the art, at its real size.</p>
      </div><div><div class="pap-pv" data-pv><span class="pap-hint">Loading…</span></div><p class="pap-hint" data-sz></p></div></div></div>
      <div class="p-modal-f"><button class="p-btn" type="button" data-x>Cancel</button><button class="p-btn p-btn-main" type="button" data-go>Open this</button></div></div>`;
    document.body.appendChild(sc);
    const $=s=>sc.querySelector(s), occOf=()=>{ if(!L.occ) return null; for(const l of L.list) L.occ.setVisibility(l.id,!!st.on[l.id]); return L.occ; };
    let tok=0;
    async function preview(){ const me=++tok, page=await doc.getPage(st.page), v=page.getViewport({scale:1}), s=Math.min(3,900/Math.max(v.width,v.height));
      const c=await draw(page,s,occOf()); if(me!==tok) return; const b=inkBox(c), pv=$('[data-pv]'); pv.innerHTML='';
      if(!b){ pv.innerHTML='<span class="pap-hint">Nothing on this artboard with these layers.</span>'; $('[data-sz]').textContent=''; $('[data-go]').disabled=true; return; }
      pv.appendChild(crop(c,b,4)); $('[data-go]').disabled=false;
      $('[data-sz]').textContent=`Art ${fmt(b.w/s*PX)} × ${fmt(b.h/s*PX)}″${n>1?` · artboard ${st.page} of ${n}`:''}`; }
    if(n>1){ const box=$('[data-tiles]');
      for(let p=1;p<=n;p++){ const t=document.createElement('button'); t.type='button'; t.className='pap-tile'+(p===1?' is-on':''); t.dataset.p=p;
        t.innerHTML=`<span class="pap-th"></span><b>Artboard ${p}</b><span data-s>…</span>`; box.appendChild(t);
        t.onclick=()=>{ st.page=p; box.querySelectorAll('.pap-tile').forEach(x=>x.classList.toggle('is-on',+x.dataset.p===p)); preview(); }; }
      (async()=>{ for(let p=1;p<=n;p++){ try{ const page=await doc.getPage(p), v=page.getViewport({scale:1}), s=Math.min(1,260/Math.max(v.width,v.height)), c=await draw(page,s,null), b=inkBox(c), t=box.querySelector(`[data-p="${p}"]`);
          if(!t) return; t.querySelector('.pap-th').appendChild(crop(c,b,2)); t.querySelector('[data-s]').textContent=b?`${fmt(b.w/s*PX)} × ${fmt(b.h/s*PX)}″ of art`:'Empty'; }catch(e){} } })(); }
    sc.querySelectorAll('[data-l]').forEach(i=>i.onchange=()=>{ st.on[i.dataset.l]=i.checked; preview(); });
    preview();
    return new Promise(res=>{
      const done=v=>{ document.removeEventListener('keydown',key); sc.remove(); res(v); };
      const key=e=>{ if(e.key==='Escape') done(null); };
      document.addEventListener('keydown',key);
      sc.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>done(null));
      $('[data-go]').onclick=()=>{ const off=L.list.filter(l=>!st.on[l.id]).map(l=>l.name);
        done({page:st.page,occ:off.length?occOf():null,label:[n>1?'artboard '+st.page:'',off.length?'without '+off.join(', '):''].filter(Boolean).join(' · ')}); };
      setTimeout(()=>$('[data-go]').focus(),0);
    });
  }
  window.PineAiParts={choose,draw,inkBox};
})();
