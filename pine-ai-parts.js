/* Pine: pick the part of an Illustrator file / PDF to open (2026-10-28, Stephen: "in an .ai file that was uploaded it
   also had the front text you helped me build... can you find a way for us to open this and be able to pull out other
   layers as well").
   An .ai saved with "Create PDF Compatible File" holds every artboard as a page and its layers as optional content.
   PineAiParts.choose(doc, {name, crop}) shows them (only when there's more than one artboard or layer — or, with crop,
   when the artboard is a big sheet like a tech pack):
     - a tile per artboard, cropped to its art, with the art's size
     - a tick box per layer (all on to start)
     - a big preview of the artboard with those layers
   and resolves to {page, occ, label, crop, spec} (occ: the pdf.js OptionalContentConfig to render with, or null) or to
   null when the person cancels.
   With opt.crop (2026-10-28, Stephen with SKI_TEE_TECKPACK.ai: "let's also explore how to handle files like this"):
     - the preview outlines each separate piece on the artboard (ink with clear space round it) — tap one to open just
       that piece; or drag a box round any part; "Whole artboard" goes back
     - crop is that box in PDF points from the page's top-left (scale 1), or null for the whole artboard
     - noMarks: "Leave out the measurement marks" (on when the artboard has a size line): PineAiParts.stripMarks(canvas)
       clears the strong red and cyan the marks are drawn in, after the app renders the piece
     - spec: a tech pack's size line on that artboard ("FRONT GRAPHIC SIZE 3.75"W X 2.6"H" → {w:3.75,h:2.6,text}), shown
       in the picker; the app may use it for the print size
   Read only; uses the page's pdf.js and the Pine style classes (p-scrim, p-modal, p-btn). */
(function(){
  const PX=1/72;   // inches per PDF point
  let css=false;
  function style(){ if(css) return; css=true; const s=document.createElement('style'); s.textContent=`
.pap-modal{width:min(1040px,96vw);max-height:92vh}
.pap-body{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.35fr);gap:16px;align-items:start}
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
.pap-pv{position:relative;display:grid;place-items:center;min-height:260px;max-height:58vh;background:repeating-conic-gradient(#e6e1d4 0 25%,#f4f0e6 0 50%) 0 0/20px 20px;border-radius:8px;overflow:hidden}
.pap-pv canvas{max-width:100%;max-height:58vh;display:block}
.pap-stage{position:relative;line-height:0;touch-action:none;cursor:crosshair}
.pap-stage canvas{max-width:100%;max-height:58vh}
.pap-box{position:absolute;border:2px dashed #141412;background:rgba(251,225,34,.12);cursor:pointer;box-sizing:border-box}
.pap-box span{position:absolute;left:-2px;top:-2px;transform:translateY(-100%);background:#141412;color:#fff;font:700 12px/1 Helvetica,Arial,sans-serif;padding:3px 5px;border-radius:3px 3px 0 0}
.pap-box.is-on{border:3px solid #141412;background:rgba(251,225,34,.32)}
.pap-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px}
.pap-spec{background:#FBE122;color:#141412;font:700 13px/1.3 Helvetica,Arial,sans-serif;padding:6px 10px;border-radius:6px;margin-top:8px}
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
  // the separate pieces on a sheet: ink on a coarse grid, joined across small gaps (gap ≈ 0.25″), largest first
  function pieces(c,s){ const W=c.width,H=c.height, d=c.getContext('2d').getImageData(0,0,W,H).data, cell=Math.max(2,Math.round(0.12*72*s)), gw=Math.ceil(W/cell), gh=Math.ceil(H/cell), G=new Uint8Array(gw*gh);
    for(let y=0;y<H;y+=2) for(let x=0;x<W;x+=2) if(d[(y*W+x)*4+3]>24) G[((y/cell)|0)*gw+((x/cell)|0)]=1;
    const D=new Uint8Array(gw*gh); for(let y=0;y<gh;y++) for(let x=0;x<gw;x++) if(G[y*gw+x]) for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){ const xx=x+dx,yy=y+dy; if(xx>=0&&yy>=0&&xx<gw&&yy<gh) D[yy*gw+xx]=1; }
    const seen=new Uint8Array(gw*gh), out=[];
    for(let i=0;i<gw*gh;i++){ if(!D[i]||seen[i]) continue; let x0=1e9,y0=1e9,x1=-1,y1=-1,n=0; const st=[i]; seen[i]=1;
      while(st.length){ const p=st.pop(), px=p%gw, py=(p/gw)|0; if(G[p]){ n++; if(px<x0)x0=px; if(px>x1)x1=px; if(py<y0)y0=py; if(py>y1)y1=py; }
        for(const q of [px>0?p-1:-1,px<gw-1?p+1:-1,py>0?p-gw:-1,py<gh-1?p+gw:-1]) if(q>=0&&D[q]&&!seen[q]){ seen[q]=1; st.push(q); } }
      if(x1<0) continue; const b={x:x0*cell,y:y0*cell,w:Math.min(W,(x1+1)*cell)-x0*cell,h:Math.min(H,(y1+1)*cell)-y0*cell,n};
      if(b.w/s*PX>=0.35&&b.h/s*PX>=0.2) out.push(b); }
    out.sort((a,b)=>b.w*b.h-a.w*a.h); return out.slice(0,12); }
  // a tech pack's size line: "FRONT GRAPHIC SIZE 3.75"W X 2.6"H", "12" W x 11.2" H", "Width: 4"  Height: 0.8""
  async function specOf(page){ try{ const tc=await page.getTextContent(), t=tc.items.map(i=>i.str).join(' ').replace(/\s+/g,' ');
      let m=t.match(/(\d+(?:\.\d+)?)\s*["”″']{0,2}\s*W\s*[xX×]\s*(\d+(?:\.\d+)?)\s*["”″']{0,2}\s*H\b/i)||t.match(/W(?:idth)?\s*[:=]?\s*(\d+(?:\.\d+)?)\s*["”″]?\s*[,·x×X]?\s*H(?:eight)?\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
      if(!m) return null; const i=Math.max(0,t.search(/(front|back|sleeve|chest|graphic)[^.]{0,30}size/i)), ctx=(t.slice(i,i+60).match(/^[A-Za-z ]{0,40}SIZE/i)||[''])[0].trim();
      return {w:+m[1],h:+m[2],text:(ctx?ctx.replace(/\s+/g,' ')+' ':'')+m[1]+'″ × '+m[2]+'″'}; }catch(e){ return null; } }
  // a tech pack's measurement marks are drawn in strong red and in cyan / blue: clear those pixels (the art keeps its own
  // colours; untick "Leave out the measurement marks" when the art itself is that red)
  function stripMarks(c){ try{ const x=c.getContext('2d',{willReadFrequently:true}), id=x.getImageData(0,0,c.width,c.height), d=id.data; let n=0;
      for(let i=0;i<d.length;i+=4){ if(d[i+3]<8) continue; const r=d[i],g=d[i+1],b=d[i+2];
        if((r>170&&g<95&&b<95&&r-g>110)||(b>170&&g>110&&r<110&&b-r>90)){ d[i+3]=0; n++; } }
      if(n) x.putImageData(id,0,0); return n; }catch(e){ return 0; } }
  const fmt=v=>(Math.round(v*10)/10).toString();
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // layers start as the artist left them: a hidden layer (e.g. a white cover sheet over the art) stays off
  async function layersOf(doc){ try{ const occ=await doc.getOptionalContentConfig(); const g=occ&&occ.getGroups&&occ.getGroups(); if(!g) return {occ:null,list:[]};
      return {occ,list:Object.keys(g).map(id=>({id,name:String(g[id].name||'Layer'),on:g[id].visible!==false}))}; }catch(e){ return {occ:null,list:[]}; } }

  async function choose(doc,opt){
    opt=opt||{}; const n=doc.numPages, L=await layersOf(doc);
    let sheet=false; if(opt.crop&&n<2&&L.list.length<2){ try{ const v=(await doc.getPage(1)).getViewport({scale:1}); sheet=Math.max(v.width,v.height)*PX>26; }catch(e){} }   // one huge artboard = a sheet of pieces
    if(n<2&&L.list.length<2&&!sheet) return {page:1,occ:null,label:'',crop:null,spec:null};
    style();
    const st={page:1,on:Object.fromEntries(L.list.map(l=>[l.id,l.on])),crop:null,pick:-1,spec:null};
    const sc=document.createElement('div'); sc.className='p-scrim'; sc.id='papModal';
    sc.innerHTML=`<div class="p-modal pap-modal" role="dialog" aria-modal="true" aria-labelledby="papT">
      <div class="p-modal-h"><h2 class="p-h2" id="papT" style="word-break:break-word">${esc(opt.name||'This file')}</h2><button class="p-modal-x" type="button" data-x aria-label="Close">×</button></div>
      <div class="p-modal-b"><div class="pap-body"><div>
        ${n>1?`<span class="pap-lbl">${n} artboards</span><div class="pap-tiles" data-tiles></div>`:''}
        ${L.list.length>1?`<span class="pap-lbl">Layers</span><div class="pap-layers" data-layers>${L.list.map(l=>`<label><input type="checkbox"${l.on?' checked':''} data-l="${esc(l.id)}">${esc(l.name)}${l.on?'':' <small>(hidden in file)</small>'}</label>`).join('')}</div>`:''}
        <p class="pap-hint">${n>1?'Each artboard is its own design. ':''}${L.list.length>1?'Untick a layer to leave it out. ':''}${opt.crop?'Tap a numbered piece to open just that, or drag a box round any part. ':''}It opens cropped to the art, at its real size.</p>
      </div><div><div class="pap-pv" data-pv><span class="pap-hint">Loading…</span></div>${opt.crop?'<div class="pap-row"><button class="p-btn" type="button" data-all hidden>Whole artboard</button></div>':''}<div class="pap-spec" data-spec hidden></div><label class="pap-row" data-nm hidden style="font:700 14px/1.3 Helvetica,Arial,sans-serif;cursor:pointer;min-height:40px"><input type="checkbox" data-nmc checked style="width:22px;height:22px;accent-color:#141412"> Leave out the measurement marks (red / blue lines and labels)</label><p class="pap-hint" data-sz></p></div></div></div>
      <div class="p-modal-f"><button class="p-btn" type="button" data-x>Cancel</button><button class="p-btn p-btn-main" type="button" data-go>Open this</button></div></div>`;
    document.body.appendChild(sc);
    const $=s=>sc.querySelector(s), occOf=()=>{ if(!L.occ) return null; for(const l of L.list) L.occ.setVisibility(l.id,!!st.on[l.id]); return L.occ; };
    let tok=0, PV=null;
    const sizeText=()=>{ if(!PV) return ''; const b=st.crop?{w:st.crop.w*PV.s,h:st.crop.h*PV.s}:PV.b; return `${st.crop?'Piece':'Art'} ${fmt(b.w/PV.s*PX)} × ${fmt(b.h/PV.s*PX)}″${n>1?` · artboard ${st.page} of ${n}`:''}`; };
    function syncPick(){ if(!PV||!PV.stage) return; PV.stage.querySelectorAll('.pap-box').forEach(e=>e.classList.toggle('is-on',+e.dataset.i===st.pick)); const all=$('[data-all]'); if(all) all.hidden=!st.crop; $('[data-sz]').textContent=sizeText(); }
    async function preview(){ const me=++tok, page=await doc.getPage(st.page), v=page.getViewport({scale:1}), s=Math.min(3,1100/Math.max(v.width,v.height));
      st.crop=null; st.pick=-1;
      const c=await draw(page,s,occOf()); if(me!==tok) return; const b=inkBox(c), pv=$('[data-pv]'); pv.innerHTML='';
      if(!b){ pv.innerHTML='<span class="pap-hint" style="padding:0 24px;text-align:center">Nothing on this artboard with these layers.'+(L.list.some(l=>!st.on[l.id])?' The art is on a layer you unticked. To take out a background colour, keep it ticked, open the file, then use “drop the background” (Everywhere).':'')+'</span>'; $('[data-sz]').textContent=''; $('[data-go]').disabled=true; PV=null; return; }
      $('[data-go]').disabled=false;
      if(!opt.crop){ pv.appendChild(crop(c,b,4)); PV={s,b}; $('[data-sz]').textContent=sizeText(); return; }
      // pieces: drawn over the whole (cropped-to-ink) artboard; the boxes and drags are in the cropped picture's pixels
      const view=crop(c,b,4), ox=Math.max(0,b.x-4), oy=Math.max(0,b.y-4), stage=document.createElement('div'); stage.className='pap-stage'; stage.appendChild(view); pv.appendChild(stage);
      PV={s,b,ox,oy,stage,view};
      const ps=(opt.crop?pieces(c,s):[]).filter(p=>!(p.w>=b.w*0.97&&p.h>=b.h*0.97)), sp=await specOf(page); if(me!==tok) return;
      st.spec=sp; const sv=$('[data-spec]'); sv.hidden=!sp; if(sp) sv.textContent='From the tech pack: '+sp.text; $('[data-nm]').hidden=!sp;
      const pct=(v0,t)=>(v0/t*100)+'%';
      if(ps.length>1) ps.forEach((p,i)=>{ const e=document.createElement('div'); e.className='pap-box'; e.dataset.i=i;
        Object.assign(e.style,{left:pct(p.x-ox,view.width),top:pct(p.y-oy,view.height),width:pct(p.w,view.width),height:pct(p.h,view.height)}); e.innerHTML=`<span>${i+1}</span>`;
        e._pick=()=>{ if(st.pick===i){ st.pick=-1; st.crop=null; } else { st.pick=i; st.crop={x:p.x/s,y:p.y/s,w:p.w/s,h:p.h/s}; } syncPick(); };
        stage.appendChild(e); });
      // drag a box round any part (a tap on a numbered piece picks it; a drag works anywhere, pieces too)
      let d0=null, sel=null, tapOn=null; const at=ev=>{ const r=view.getBoundingClientRect(); return {x:Math.max(0,Math.min(1,(ev.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(ev.clientY-r.top)/r.height))}; };
      stage.onpointerdown=ev=>{ d0=at(ev); tapOn=ev.target.closest&&ev.target.closest('.pap-box[data-i]:not([data-i="-2"])'); try{ stage.setPointerCapture(ev.pointerId); }catch(e){} };
      stage.onpointermove=ev=>{ if(!d0) return; const p=at(ev); if(!sel&&Math.abs(p.x-d0.x)*view.width<6&&Math.abs(p.y-d0.y)*view.height<6) return;
        if(!sel){ PV.stage.querySelectorAll('.pap-box[data-i="-2"]').forEach(e=>e.remove()); sel=document.createElement('div'); sel.className='pap-box is-on'; sel.dataset.i='-2'; stage.appendChild(sel); }
        Object.assign(sel.style,{left:Math.min(d0.x,p.x)*100+'%',top:Math.min(d0.y,p.y)*100+'%',width:Math.abs(p.x-d0.x)*100+'%',height:Math.abs(p.y-d0.y)*100+'%'}); };
      stage.onpointerup=ev=>{ if(!d0) return; const p=at(ev), w=Math.abs(p.x-d0.x), h=Math.abs(p.y-d0.y);
        if(w*view.width<12||h*view.height<12){ if(sel){ sel.remove(); sel=null; } d0=null; if(tapOn&&tapOn._pick){ PV.stage.querySelectorAll('.pap-box[data-i="-2"]').forEach(e=>e.remove()); tapOn._pick(); } return; }
        sel=null;
        st.pick=-2; st.crop={x:(ox+Math.min(d0.x,p.x)*view.width)/s,y:(oy+Math.min(d0.y,p.y)*view.height)/s,w:w*view.width/s,h:h*view.height/s}; d0=null; syncPick(); };
      syncPick(); }
    if(n>1){ const box=$('[data-tiles]');
      for(let p=1;p<=n;p++){ const t=document.createElement('button'); t.type='button'; t.className='pap-tile'+(p===1?' is-on':''); t.dataset.p=p;
        t.innerHTML=`<span class="pap-th"></span><b>Artboard ${p}</b><span data-s>…</span>`; box.appendChild(t);
        t.onclick=()=>{ st.page=p; box.querySelectorAll('.pap-tile').forEach(x=>x.classList.toggle('is-on',+x.dataset.p===p)); preview(); }; }
      (async()=>{ for(let p=1;p<=n;p++){ try{ const page=await doc.getPage(p), v=page.getViewport({scale:1}), s=Math.min(1,260/Math.max(v.width,v.height)), c=await draw(page,s,null), b=inkBox(c), t=box.querySelector(`[data-p="${p}"]`);
          if(!t) return; t.querySelector('.pap-th').appendChild(crop(c,b,2)); t.querySelector('[data-s]').textContent=b?`${fmt(b.w/s*PX)} × ${fmt(b.h/s*PX)}″ of art`:'Empty'; }catch(e){} } })(); }
    sc.querySelectorAll('[data-l]').forEach(i=>i.onchange=()=>{ st.on[i.dataset.l]=i.checked; preview(); });
    const all=$('[data-all]'); if(all) all.onclick=()=>{ st.crop=null; st.pick=-1; const s2=PV&&PV.stage&&PV.stage.querySelector('.pap-box[data-i="-2"]'); if(s2) s2.remove(); syncPick(); };
    preview();
    return new Promise(res=>{
      const done=v=>{ document.removeEventListener('keydown',key); sc.remove(); res(v); };
      const key=e=>{ if(e.key==='Escape') done(null); };
      document.addEventListener('keydown',key);
      sc.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>done(null));
      $('[data-go]').onclick=()=>{ const off=L.list.filter(l=>!st.on[l.id]).map(l=>l.name);
        const nm=$('[data-nm]'), noMarks=!!(nm&&!nm.hidden&&st.crop&&$('[data-nmc]').checked);
        done({page:st.page,occ:off.length?occOf():null,crop:st.crop,spec:st.spec,noMarks,
          label:[n>1?'artboard '+st.page:'',st.crop?(st.pick>=0?'piece '+(st.pick+1):'the part you boxed'):'',off.length?'without '+off.join(', '):''].filter(Boolean).join(' · ')}); };
      setTimeout(()=>$('[data-go]').focus(),0);
    });
  }
  window.PineAiParts={choose,draw,inkBox,pieces,stripMarks};
})();
