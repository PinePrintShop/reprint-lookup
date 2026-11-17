/* pine-signed.js (2026-10-28; 2026-11-16) — signed PandaDoc packets → each line's signed mockup, and a check before screens.
   Stephen: "how can we make sure the signed PandaDoc mockup gets back into Airtable so we can use the actual signed
   mockups?" … "Client puts in a reorder … client changes back print. Sales forgets to update imprint id but an update
   is made to the PandaDoc mockup … we still have the old reference in Airtable so screens burns the reorder screens".

   1. The order's Signed Packet comes from the worker (v53): every 15 minutes it attaches the rep's signed PDF from their
      Pipedrive Drive folder ("<n> signed (drive).pdf"). This script no longer asks for a sweep (SWEEP_PAUSED).
   2. For orders with a Drive packet whose lines have no Signed Proof yet:
      - finds each line's page(s): from the order's PandaDoc Pages (Line Item Review writes it when it sends); else
        (2026-11-16, Stephen: "sort by imprint ID, similar to how we scan it in the mockup creator") by the imprint IDs
        typed on the signed pages ("FRONT - 11106-A"), narrowed by the garment colour on the page when the same ID is on
        several pages; else by matching the signed pages against the line's proof in Airtable (picture). A picture match
        whose page shows another imprint ID of this order is not saved: Signed Check "CHECK · … shows 11106-B, line has
        11106-A …" (the reorder case: the line's imprint ID wasn't updated);
      - saves the page(s) as the line's Signed Proof (only when Signed Proof is empty: never overwritten);
      - initials (2026-11-16, Stephen: proof initials aren't required in PandaDoc, so customers can skip them): looks in
        the page's APPROVED box (where LIR put the initials field, from PandaDoc Pages; or found by its "APPROVED" text)
        for ink that isn't on the proof in Airtable. None = Signed Check "NOT INITIALED · page N · …" (only when Signed
        Check is empty). Initialed = nothing written. No APPROVED box found = nothing written (no guessing).
      - the full comparison with the proof in Airtable (OK / CHECK + reorder note) is still paused (CHECK_PAUSED): the
        first real runs (PandaDoc downloads) false-flagged, and it hasn't been tried on the Drive copies yet.
   Use: <script src="pine-signed.js"></script>, then PineSigned.sync({token, practice}) (returns a summary).
   Needs pdf.js + pdf-lib (loaded from cdnjs if the page doesn't have them). Practice: nothing is written. */
(function(){
  const BASE='appJkaLk8DykjsgHR', T_ORD='tbl8Tf0AeS9gnHOOS', T_LI='tblJx5UlwO7oMSk5H', T_IMP='tbln9oAGvz2PNBZLV';
  const WORKER='https://pine-workers.stephen-dab.workers.dev/proxy';
  const O={num:'fld4S3B5yJANKlE7l',status:'fldhS4z28CdGmS1j5',lines:'fldU6fgrz6sU3wyIZ',packet:'fldSwLl9yIMSXcT0Y',pdId:'fldfQJ8QwtNXxGPE5',signedAt:'fld2h7L1aqDHPfcQM',pages:'fldlumFLBJi3WrfUS'};
  const L={proof:'flddhvdkKI31tFTdX',signed:'fldYeu8XZgBNSQ3N6',check:'fldzHcS22EcdZ3xwN',imps:'fldTFz4ZzfOthqkg6',
    impIds:'fldmGRcdXyvheWjmv',colour:'fldoXTRyLP4SshFZ0',garment:'fldKhz9uZgXwfeIto'};   // 2026-11-16, read-only: Imprint ID Lookup, Colorway (lookup), garment text (formula)
  const I={id:'fldDFfwFQ9B20n2kT',repeat:'flda9L7041ahNZT0b',prev:'fldAEQvMAAZX9gnhl'};
  const DONE=['Shipped','Completed','Cancelled / Voided','Partially Completed'];
  const LIB={pdflib:'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js',pdfjs:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',pdfjsWorker:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'};
  // 2026-10-28: the comparison is paused (PandaDoc's downloads had a demo watermark and no initials, so every page read as
  // "changed"). 2026-11-16: still paused until it's been tried on the Drive copies; the pages and the initials run without it.
  const CHECK_PAUSED=true;
  // 2026-10-28: the PandaDoc sweep is paused for good. Since worker v53 the cron attaches the reps' Drive PDFs itself.
  const SWEEP_PAUSED=true;
  // 2026-11-16: only packets the worker took from Drive ("… signed (drive).pdf"). The PandaDoc sweep's "(completed)" copies
  // may be the unsigned download (no initials), which would read as NOT INITIALED everywhere.
  const DRIVE_ONLY=true;
  const SWEEP_MS=10*60*1000, MAX_ORDERS=4, MATCH=0.025;   // MATCH: how much of any one patch of the page may differ and it is still the same mockup (2.5%)
  const RETRY_MS=12*3600*1000;   // an order whose lines couldn't all be done waits 12 hours on this computer before it's tried again
  const INK_MIN=0.003;   // initials: average darkness added inside the APPROVED box (0–1). A thin light-grey pen adds ~0.01, black initials 0.05+
  // where the customer initials: the APPROVED box, bottom left on Pine's proof template (left/top/right/bottom, 0–1 of the page)
  const APPROVED_BOX=[[0,0.8,0.36,1],[0,0.97,1,1]];   // + a footer strip (a signing stamp)

  const loadScript=src=>new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=()=>rej(new Error('Could not load '+src)); document.head.appendChild(s); });
  async function libs(){ if(!window.PDFLib) await loadScript(LIB.pdflib); if(!window.pdfjsLib){ await loadScript(LIB.pdfjs); pdfjsLib.GlobalWorkerOptions.workerSrc=LIB.pdfjsWorker; } }
  const day=s=>{ const d=new Date(s); return isNaN(d)?'':(d.getMonth()+1)+'/'+d.getDate(); };
  const lsGet=k=>{ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } };
  const lsSet=(k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} };

  function mk(token){
    const at=async(path,opt)=>{ const r=await fetch(/^https:/.test(path)?path:`https://api.airtable.com/v0/${BASE}/${path}`,Object.assign({},opt,{headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'}}));
      const j=await r.json().catch(()=>({})); if(!r.ok) throw new Error((j.error&&(j.error.message||j.error.type))||('Airtable '+r.status)); return j; };
    const all=async(table,q)=>{ let out=[], off=''; do{ const j=await at(`${table}?returnFieldsByFieldId=true&pageSize=100&${q}${off?'&offset='+off:''}`); out=out.concat(j.records||[]); off=j.offset||''; }while(off); return out; };
    const flds=ids=>ids.map(f=>'fields%5B%5D='+f).join('&');
    const byIds=async(table,ids,fields)=>{ let out=[]; for(let i=0;i<ids.length;i+=40){ const f=`OR(${ids.slice(i,i+40).map(id=>`RECORD_ID()='${id}'`).join(',')})`; out=out.concat(await all(table,`${flds(fields)}&filterByFormula=${encodeURIComponent(f)}`)); } return out; };
    async function bytes(url){
      try{ const r=await fetch(url); if(r.ok) return new Uint8Array(await r.arrayBuffer()); }catch(e){}
      const r=await fetch(`${WORKER}/pandadoc/file?url=${encodeURIComponent(url)}`,{headers:{Authorization:'Bearer '+token}});   // Airtable attachments block cross-origin reads
      if(!r.ok) throw new Error('Could not download '+String(url).split('/').pop().split('?')[0]+' ('+r.status+')'); return new Uint8Array(await r.arrayBuffer()); }
    return {at,all,byIds,bytes,flds};
  }

  // a page (or picture) as a small blurred grey grid, so two renders of the same mockup compare as the same.
  // hi: the full render's lightness (0–255), for the initials (a thin pen line is lost in the small grid)
  const GW=240;
  function grid(canvas){ const w=GW, h=Math.max(8,Math.round(GW*canvas.height/canvas.width)), c=document.createElement('canvas'); c.width=w; c.height=h;
    const x=c.getContext('2d'); x.filter='blur(0.6px)'; x.fillStyle='#fff'; x.fillRect(0,0,w,h); x.drawImage(canvas,0,0,w,h);
    const d=x.getImageData(0,0,w,h).data, g=new Float32Array(w*h); for(let i=0;i<w*h;i++) g[i]=(0.299*d[i*4]+0.587*d[i*4+1]+0.114*d[i*4+2])/255;
    const D=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data, hl=new Uint8ClampedArray(canvas.width*canvas.height);
    for(let i=0;i<hl.length;i++) hl[i]=0.299*D[i*4]+0.587*D[i*4+1]+0.114*D[i*4+2];
    return {w,h,g,asp:canvas.width/canvas.height,hi:{W:canvas.width,H:canvas.height,L:hl}}; }
  // how different two pages are, outside where the customer signs. all: the share of the page that changed (to find a
  // line's page among the signed ones). block: the most-changed 16×16 patch, so a changed word or print counts in full
  // instead of being averaged away over the whole page (MATCH is on this).
  function cmp(a,b,mask){ if(!a||!b||Math.abs(a.asp-b.asp)>0.08*a.asp||a.h!==b.h) return {all:1,block:1};
    const ms=mask?(Array.isArray(mask[0])?mask:[mask]):APPROVED_BOX, B=16, bw=Math.ceil(a.w/B), bn=new Float32Array(bw*Math.ceil(a.h/B)), bt=new Float32Array(bn.length); let n=0, tot=0;
    for(let y=0;y<a.h;y++) for(let x=0;x<a.w;x++){ const fx=(x+0.5)/a.w, fy=(y+0.5)/a.h; if(ms.some(m=>fx>=m[0]&&fx<=m[2]&&fy>=m[1]&&fy<=m[3])) continue;
      const k=((y/B)|0)*bw+((x/B)|0); tot++; bt[k]++; if(Math.abs(a.g[y*a.w+x]-b.g[y*a.w+x])>0.1){ n++; bn[k]++; } }
    let mx=0; for(let k=0;k<bn.length;k++) if(bt[k]>B*B/3) mx=Math.max(mx,bn[k]/bt[k]);
    return {all:tot?n/tot:1,block:mx}; }
  const diff=(a,b,mask)=>cmp(a,b,mask).block;

  // ---- imprint IDs typed on the signed pages (2026-11-16) ----
  // Pine's proofs carry the imprint IDs as real text ("FRONT - 11106-A", "EMBROIDERY · LEFT CHEST - 11094-A"); read the
  // way Mockup Maker's Edit PDF reads them (pdf.js getTextContent). Pieces that touch on the same line are joined without
  // a space, so an ID drawn in two pieces ("11106-" + "A") still reads as one.
  function pageText(items){ let s='', prev=null;
    for(const it of items||[]){ const str=String(it.str||''), t=it.transform||[1,0,0,1,0,0], fs=Math.hypot(t[2],t[3])||it.height||10;
      if(str){ if(prev) s+=(Math.abs(t[5]-prev.y)<fs*0.3&&t[4]>=prev.end-fs*0.5&&t[4]-prev.end<fs*0.2)?'':' ';
        s+=str; prev={y:t[5],end:t[4]+(it.width||0)}; }
      if(it.hasEOL){ s+=' '; prev=null; } }
    return s.replace(/[‐-―−]/g,'-').replace(/\s+/g,' ').trim(); }
  // the IDs on a page. Accepted: "11106-A" / "11106-AB" (any 1xxxx number; an en or em dash counts as "-"). For this
  // order's number only, and only when the result is one of the order's imprint IDs (so "11106 - A tee" can't make an ID):
  // "11106 - A" (spaces round the dash) and "11106A" (no dash). Lower case ("11106-a") is not read.
  function idsIn(text,num,known){ const out=new Set(), t=String(text||'').replace(/[\u2010-\u2015\u2212]/g,'-');
    for(const m of t.matchAll(/\b(1\d{4})-([A-Z]{1,2})\b/g)) out.add(m[1]+'-'+m[2]);
    if(num&&known&&/^\d+$/.test(String(num))) for(const m of t.matchAll(new RegExp(`\\b${num}(?:\\s*-\\s*)?([A-Z]{1,2})\\b`,'g'))){ const id=num+'-'+m[1]; if(known.has(id)) out.add(id); }
    return out; }
  // a line's imprint IDs (Line Items › Imprint ID Lookup)
  const idsOf=ln=>{ const v=ln.fields[L.impIds];
    return new Set((Array.isArray(v)?v:[v]).flatMap(x=>String(x==null?'':x).split(/[,\s]+/)).map(x=>x.trim().toUpperCase().replace(/[‐-―−]/g,'-')).filter(x=>/^\d{4,6}-[A-Z]{1,2}$/.test(x))); };
  // the packet's Terms and invoice pages (the invoice lists the imprints too): never a line's page by ID
  const notProof=s=>!s.appr.length&&/\b(invoice|subtotal|balance due|terms of service|terms and conditions)\b/i.test(s.text);
  // how well a page's text fits a line's garment: its colour (more when it follows the proof's "Colorway" / "Garment:"
  // label — "Colorway Black", "Garment: Brown · …" — since the colour can also be an ink), and the style number(s) in the
  // line's garment text
  const reEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  function fitScore(text,ln){ const t=' '+String(text||'').toLowerCase()+' '; let sc=0;
    const cw=ln.fields[L.colour], cols=(Array.isArray(cw)?cw:[cw]).map(x=>String(x==null?'':x).trim().toLowerCase()).filter(x=>x.length>=3);
    for(const c of cols){ const re=new RegExp(`(?<![a-z0-9])${reEsc(c)}(?![a-z0-9])`,'g'); let m, best=0;
      while((m=re.exec(t))){ best=Math.max(best,/(colou?rway|garment\s*:)[^a-z0-9]*$/.test(t.slice(Math.max(0,m.index-30),m.index))?4:2); }
      sc+=best; }
    const tokens=String(ln.fields[L.garment]||'').toLowerCase().split(/[^a-z0-9]+/).filter(x=>x.length>=3&&/\d/.test(x));
    tokens.forEach(k=>{ if(new RegExp(`(?<![a-z0-9])${reEsc(k)}(?![a-z0-9])`).test(t)) sc+=1; });
    return sc; }
  // a line's page(s) by its imprint IDs: for each ID, the pages showing it; several → the line's garment colour on the page,
  // then the line's proof picture among those. by: {page: 'id' | 'id+colour' | 'id+picture' | 'id+colour+picture'}.
  // odd: IDs on several pages that are on several lines too, and nothing told the pages apart (nothing assigned for those).
  function byImprint(ln,own,signed,pg,shared){ const by={}, odd=[];
    for(const id of own){ let cand=signed.map((s,i)=>s.ids.has(id)&&!s.notProof?i+1:0).filter(Boolean), how='id';
      if(!cand.length) continue;
      if(cand.length>1){ const sc=cand.map(p=>fitScore(signed[p-1].text,ln)), mx=Math.max(...sc), top=cand.filter((p,k)=>sc[k]===mx);
        if(mx>0&&top.length<cand.length){ cand=top; how='id+colour'; } }
      if(cand.length>1&&pg.length){ const pick=new Set();
        pg.forEach(x=>{ let bp=0, bd=1; cand.forEach(p=>{ const d=cmp(signed[p-1],x.grid).all; if(d<bd){ bd=d; bp=p; } }); if(bp&&bd<0.15) pick.add(bp); });
        if(pick.size&&pick.size<cand.length){ cand=[...pick]; how+='+picture'; } }
      if(cand.length>1&&(shared.get(id)||0)>1){ odd.push(id); continue; }
      cand.forEach(p=>{ if(!by[p]) by[p]=how; });
      // 2026-11-17: a proof's close-up pages follow its first page and don't name the colour (some have no text at all), so
      // the colour picked only page 1 (11214, 11184). Each picked page takes the pages right after it, up to the line's own
      // proof page count, while they aren't another proof's first page ("Colorway" / "Garment:"), the Terms or the invoice,
      // and show none of this order's other imprint IDs.
      const lead=q=>/colou?rway|garment\s*:/i.test(signed[q-1].text||''), max=Math.max(1,pg.length);
      cand.slice().forEach(p=>{ let n=1; for(let q=p+1;q<=signed.length&&n<max;q++,n++){ const s2=signed[q-1];
        if(s2.notProof||lead(q)||[...s2.ids].some(i=>!own.has(i))) break; if(!by[q]) by[q]=how+'+next'; } }); }
    return {by,odd}; }
  // every page: its grid, its size in points, and the white box next to each "APPROVED" (art's proof template; measured
  // in Line Item Review: x1+0.79fs … x1+3.0fs, baseline−0.61fs … baseline+1.39fs, 2.5 pt inside), as 0–1 of the page
  async function pdfGrids(data,withBoxes){ const doc=await pdfjsLib.getDocument({data:data.slice(0),isEvalSupported:false}).promise, out=[];
    for(let i=1;i<=doc.numPages;i++){ const pg=await doc.getPage(i), v=pg.getViewport({scale:1}), sc=720/Math.max(v.width,v.height), vp=pg.getViewport({scale:sc});
      const c=document.createElement('canvas'); c.width=Math.round(vp.width); c.height=Math.round(vp.height); const x=c.getContext('2d',{willReadFrequently:true}); x.fillStyle='#fff'; x.fillRect(0,0,c.width,c.height);
      await pg.render({canvasContext:x,viewport:vp}).promise; const gr=grid(c); gr.pw=v.width; gr.ph=v.height; gr.appr=[]; gr.text='';
      if(withBoxes) try{ const tc=await pg.getTextContent(); gr.text=pageText(tc.items);
        for(const it of tc.items){ if(String(it.str).trim()!=='APPROVED') continue; const t=it.transform, fs=Math.hypot(t[2],t[3])||it.height, x1=t[4]+it.width, b=t[5];
          const p0=v.convertToViewportPoint(x1+0.79*fs+2.5,b+1.39*fs-2.5), p1=v.convertToViewportPoint(x1+3.0*fs-2.5,b-0.61*fs+2.5);
          gr.appr.push([Math.min(p0[0],p1[0])/v.width,Math.min(p0[1],p1[1])/v.height,Math.max(p0[0],p1[0])/v.width,Math.max(p0[1],p1[1])/v.height]); } }catch(e){}
      out.push(gr); }
    return out; }
  async function imgGrid(data,type){ const url=URL.createObjectURL(new Blob([data],{type:type||'image/png'}));
    try{ const im=await new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=url; });
      // Line Item Review puts a picture proof on a letter page (fitted into 744×520 pt, 72 pt from the bottom): do the same
      const c=document.createElement('canvas'); c.width=720; c.height=556; const x=c.getContext('2d',{willReadFrequently:true}), k=720/792; x.fillStyle='#fff'; x.fillRect(0,0,c.width,c.height);
      const sc=Math.min(744/im.width,520/im.height); x.drawImage(im,(792-im.width*sc)/2*k,(612-72-im.height*sc-(520-im.height*sc)/2)*k,im.width*sc*k,im.height*sc*k);
      const gr=grid(c); gr.pw=792; gr.ph=612; gr.appr=[]; return gr; }
    finally{ URL.revokeObjectURL(url); } }
  // a line's proof in Airtable: [{file, fp, grid}] for every page of every proof file
  async function proofGrids(api,line,cache){ const out=[];
    for(const a of line.fields[L.proof]||[]){ const key=(a.filename||'')+'|'+(a.size||'');
      if(!cache[key]){ try{ const b=await api.bytes(a.url); cache[key]=(/pdf/i.test(a.type||'')||/\.pdf$/i.test(a.filename||''))?await pdfGrids(b):[await imgGrid(b,a.type)]; }catch(e){ cache[key]=[]; } }
      cache[key].forEach((g,fp)=>out.push({file:a.filename||'',size:a.size||'',fp,grid:g})); }
    return out; }

  // initials. The box from PandaDoc Pages: LIR's mask is the white box (2.5 pt inside) + 8 pt; for a stamp LIR added itself
  // (a proof without art's APPROVED), the whole 170 pt stamp + 8 pt, whose white part is the right 52 pt.
  function maskBox(m,pw,ph){ if(!Array.isArray(m)||m.length<4||!pw||!ph) return null;
    let [l,t,r,b]=[m[0]+8/pw,m[1]+8/ph,m[2]-8/pw,m[3]-8/ph], own=false;
    if((r-l)*pw>100){ own=true; l=r-49.5/pw; r=r-2.5/pw; t+=2.5/ph; b-=2.5/ph; }
    const e=1.5; l+=e/pw; r-=e/pw; t+=e/ph; b-=e/ph;   // off the box's own edge lines
    return r>l&&b>t?{box:[l,t,r,b],own}:null; }
  function edge(box,pw,ph){ const e=1.5; return [box[0]+e/pw,box[1]+e/ph,box[2]-e/pw,box[3]-e/ph]; }
  // average darkness inside a box (0 = white). Faint anti-aliasing and paper noise under 3% are ignored.
  function ink(gr,box){ if(!gr||!gr.hi) return 0; const {W,H,L:px}=gr.hi;
    const x0=Math.max(0,Math.floor(box[0]*W)), x1=Math.min(W,Math.ceil(box[2]*W)), y0=Math.max(0,Math.floor(box[1]*H)), y1=Math.min(H,Math.ceil(box[3]*H)); let s=0, n=0;
    for(let y=y0;y<y1;y++) for(let x=x0;x<x1;x++){ const v=px[y*W+x]/255; n++; if(v<0.97) s+=1-v; }
    return n?s/n:0; }
  // one signed page: true (initialed), false (an empty APPROVED box), null (no box found: say nothing)
  function initialed(sg,boxes,base){ if(!sg||!boxes.length) return null;
    return boxes.some(x=>ink(sg,x.box)-(x.own||!base||Math.abs(base.asp-sg.asp)>0.02*sg.asp?0:ink(base,x.box))>INK_MIN); }

  async function checkOrder(api,o,lines,imps,opt,ctx){
    const f=o.fields, num=f[O.num], att=(f[O.packet]||[])[0], doc=f[O.pdId]||'', key=docKey(o), when=day(f[O.signedAt]);
    const packet=await api.bytes(att.url), signed=await pdfGrids(packet,true), cache={};
    ctx=ctx||{}; const known=ctx.known||new Set(lines.flatMap(l=>[...idsOf(l)])), shared=ctx.shared||new Map();
    signed.forEach(s=>{ s.ids=idsIn(s.text,num,known); s.notProof=notProof(s); });
    const mineOrd=id=>id.startsWith(String(num)+'-');   // an imprint ID of this order
    let map=null; try{ const j=JSON.parse(f[O.pages]||'null'); if(j&&Array.isArray(j.pages)&&(!j.doc||!doc||j.doc===doc)) map=j; }catch(e){}
    const res=[];
    for(const ln of lines){
      const pg=await proofGrids(api,ln,cache), own=idsOf(ln); let pages=[], best=1, how='', ini=[], by={}, odd=[], wrongId=[];
      if(map){ const mine=map.pages.filter(p=>(p.lines||[]).includes(ln.id)&&p.p>=1&&p.p<=signed.length);
        pages=mine.map(p=>p.p); pages.forEach(p=>by[p]='map');
        // each listed page against the same page of the same file in Airtable now (gone from Airtable = a newer proof went in)
        const ds=mine.map(p=>{ const g=pg.find(x=>x.file===p.file&&x.fp===(p.fp||0)); const pm=p.mask?(Array.isArray(p.mask[0])?p.mask:[p.mask]):null; return g&&signed[p.p-1]?diff(signed[p.p-1],g.grid,pm?pm.concat([[0,0.97,1,1]]):null):null; });
        if(ds.length&&ds.every(d=>d!==null)) best=Math.max(...ds); else if(ds.length&&pg.length) how='newer';
        ini=mine.map(p=>{ const sg=signed[p.p-1], mm=p.mask?(Array.isArray(p.mask[0])?p.mask[0]:p.mask):null, bx=maskBox(mm,sg.pw,sg.ph), g=pg.find(x=>x.file===p.file&&x.fp===(p.fp||0));
          return {p:p.p,ok:bx?initialed(sg,[bx],g&&g.grid):null}; });
      } else {
        // no page list (a packet built by hand). 1: the pages showing the line's imprint ID(s)
        const pair={}; if(own.size){ const r=byImprint(ln,own,signed,pg,shared); by=r.by; odd=r.odd; pages=Object.keys(by).map(Number); }
        pages.forEach(p=>{ let bd=1; pg.forEach(x=>{ const d=cmp(signed[p-1],x.grid).all; if(d<bd){ bd=d; pair[p]=x.grid; } }); });   // its proof page, for the initials
        // 2: none → the signed page(s) closest to this line's proof pages (picture)
        if(!pages.length&&pg.length){
          pg.forEach(x=>{ let bi=-1, bd=1; signed.forEach((s,i)=>{ const d=cmp(s,x.grid).all; if(d<bd){ bd=d; bi=i; } }); if(bi>=0&&bd<0.15&&!pages.includes(bi+1)){ pages.push(bi+1); pair[bi+1]=x.grid; by[bi+1]='picture'; } });
          // the reorder case: the picture matches, but the page shows another imprint ID of this order (and none of the
          // line's) — the line's imprint ID wasn't updated, or it's another line's mockup. Not saved; Signed Check says so.
          pages=pages.filter(p=>{ const other=[...signed[p-1].ids].filter(id=>mineOrd(id)&&!own.has(id));
            if(other.length&&![...signed[p-1].ids].some(id=>own.has(id))){ wrongId.push({p,ids:other}); delete by[p]; return false; } return true; });
        }
        if(pages.length&&pg.length) best=Math.max(...pg.map(x=>Math.min(...pages.map(p=>diff(signed[p-1],x.grid)))));
        ini=pages.map(p=>{ const sg=signed[p-1]; return {p,ok:initialed(sg,sg.appr.map(b=>({box:edge(b,sg.pw,sg.ph),own:false})),pair[p])}; });   // "APPROVED" found on the page, or nothing said
      }
      pages.sort((a,b)=>a-b);
      const missing=ini.filter(x=>x.ok===false).map(x=>x.p).sort((a,b)=>a-b), initials=missing.length?false:ini.some(x=>x.ok===true)?true:null;
      const notIni=missing.length?`NOT INITIALED · page ${missing.join(', ')} · `:'';
      let ok=true, check='';
      if(!CHECK_PAUSED){
        const im=(ln.fields[L.imps]||[]).map(id=>imps[id]).filter(Boolean), re=im.filter(x=>x.fields[I.repeat]&&(x.fields[I.prev]||[]).length);
        const reTxt=re.length?` Reorder of ${re.map(x=>x.prevName||'a previous imprint').join(', ')}: compare the signed mockup with the previous run before reusing its screens.`:'';
        let msg;
        if(!pg.length){ ok=false; msg=`no proof on this line in Airtable to compare with${pages.length?'':' — find its page in the signed packet'}.`; }
        else if(!pages.length){ ok=false; msg=`none of the signed pages matches this line's proof in Airtable — the mockup was probably changed in PandaDoc. Check the imprint IDs and the proof before screens.`; }
        else if(best<=MATCH){ ok=true; msg=`matches the proof in Airtable.`; }
        else { ok=false; msg=how==='newer'?`a different proof is in Airtable now than the one that was signed. Check which one is right (and the imprint IDs) before screens.`
          :`the signed mockup is different from the proof in Airtable — it was probably changed in PandaDoc. Update the proof and check the imprint IDs before screens.`; }
        check=`${notIni}${ok?'OK':'CHECK'} · ${num} signed ${when}${pages.length?' · page '+pages.join(', '):''} · ${msg}${reTxt} [doc ${key}]`;
      } else if(notIni) check=`${notIni}${num} signed ${when} · the customer skipped the APPROVED initials on this mockup [doc ${key}]`;
      // the imprint ID guard (separate from CHECK_PAUSED: it's text, not a picture comparison, so it may write)
      if(wrongId.length){ ok=false; const has=own.size?[...own].join(', '):'no imprint ID';
        check=`${notIni}CHECK · ${num} signed ${when} · page ${wrongId.map(w=>w.p).join(', ')} · ${wrongId.map(w=>`signed page ${w.p} shows ${w.ids.join(', ')}, line has ${has}`).join('; ')} — the picture matches this line's proof but the imprint ID doesn't, so the page wasn't saved. Fix the line's imprint ID (a reorder?) or the mockup before screens. [doc ${key}]`; }
      res.push({line:ln.id,pages,by,odd,wrongId,diff:CHECK_PAUSED?null:Math.round(best*1000)/1000,ok,initialed:initials,check,
        hasProof:!!(ln.fields[L.signed]||[]).length,hasCheck:!!String(ln.fields[L.check]||'').trim(),wrote:{proof:false,check:false}});
    }
    // write: the line's pages as its Signed Proof, then the check. Only into empty fields: nothing is ever overwritten.
    if(!opt.practice){
      const src=await PDFLib.PDFDocument.load(packet,{ignoreEncryption:true});
      for(const r of res){
        if(r.pages.length&&!r.hasProof){ const out=await PDFLib.PDFDocument.create(); (await out.copyPages(src,r.pages.map(p=>p-1))).forEach(p=>out.addPage(p));
          const b=await out.save();
          if(b.length<4.9e6){ let s=''; for(let i=0;i<b.length;i+=0x8000) s+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000));
            await api.at(`https://content.airtable.com/v0/${BASE}/${r.line}/${L.signed}/uploadAttachment`,{method:'POST',body:JSON.stringify({contentType:'application/pdf',file:btoa(s),filename:`${num} signed ${r.pages.length>1?'pages '+r.pages.join('-'):'page '+r.pages[0]}.pdf`})}); r.wrote.proof=true; }
          else if(r.check) r.check+=' (page too big to save on the line — open the Signed Packet on the order)'; }
        if(r.check&&!r.hasCheck){ await api.at(`${T_LI}/${r.line}`,{method:'PATCH',body:JSON.stringify({fields:{[L.check]:r.check}})}); r.wrote.check=true; }
      }
    }
    return {order:num,doc:key,mapped:!!map,lines:res};
  }
  // what a packet is known by: the PandaDoc ID when there is one, else the packet file in Airtable
  const docKey=o=>o.fields[O.pdId]||(((o.fields[O.packet]||[])[0]||{}).id)||'';
  const isDrive=o=>/\(drive\)/.test((((o.fields[O.packet]||[])[0])||{}).filename||'');

  async function sync(opt){ opt=opt||{}; const token=opt.token, log=opt.log||(()=>{}); if(!token) return {ok:false,error:'no token'};
    const api=mk(token), out={ok:true,swept:null,orders:[]};
    // 1. (paused for good) new signed packets onto their orders — worker v53's cron does this from the reps' Drive folders
    let last=0; try{ last=+localStorage.getItem('pine_signed_sweep')||0; }catch(e){}
    if(!SWEEP_PAUSED&&(opt.force||Date.now()-last>SWEEP_MS)){ try{ const r=await fetch(`${WORKER}/pandadoc/sweep${opt.practice?'?dry=1':''}`,{headers:{Authorization:'Bearer '+token}}); out.swept=await r.json();
        if(r.ok) try{ localStorage.setItem('pine_signed_sweep',String(Date.now())); }catch(e){} }catch(e){ out.swept={ok:false,error:e.message}; } }
    // 2. orders with a signed packet whose lines have no Signed Proof yet (or, with the comparison on, no Signed Check)
    const f=`AND({Signed Packet}!='',NOT(OR(${DONE.map(x=>`{Order Status}='${x}'`).join(',')})))`;
    const ords=(await api.all(T_ORD,`${api.flds(Object.values(O))}&filterByFormula=${encodeURIComponent(f)}`)).filter(o=>!DRIVE_ONLY||isDrive(o));
    const lineIds=[...new Set(ords.flatMap(o=>o.fields[O.lines]||[]))];
    const lines=lineIds.length?await api.byIds(T_LI,lineIds,[L.proof,L.check,L.imps,L.signed,L.impIds,L.colour,L.garment]):[], byId={}; lines.forEach(l=>byId[l.id]=l);
    const tried=lsGet('pine_signed_tried')||{}, now=Date.now(); Object.keys(tried).forEach(k=>{ if(now-tried[k]>RETRY_MS) delete tried[k]; });
    const listed=o=>{ try{ const j=JSON.parse(o.fields[O.pages]||'null'); return new Set((j&&j.pages||[]).flatMap(p=>p.lines||[])); }catch(e){ return new Set(); } };
    const todo=ords.filter(o=>opt.force||!tried[docKey(o)]).map(o=>{ const ls=listed(o);
        return {o,ls:(o.fields[O.lines]||[]).map(id=>byId[id]).filter(l=>l&&((l.fields[L.proof]||[]).length||ls.has(l.id)||(!ls.size&&idsOf(l).size))   // no page list: a line with an imprint ID can be found by it
          &&(!(l.fields[L.signed]||[]).length||(!CHECK_PAUSED&&!String(l.fields[L.check]||'').trim())))}; })
      .filter(x=>x.ls.length).sort((a,b)=>String(b.o.fields[O.signedAt]||'').localeCompare(String(a.o.fields[O.signedAt]||''))).slice(0,MAX_ORDERS);
    if(!todo.length) return out;
    await libs();
    const imps={};
    if(!CHECK_PAUSED){ const impIds=[...new Set(todo.flatMap(x=>x.ls.flatMap(l=>l.fields[L.imps]||[])))];
      if(impIds.length){ (await api.byIds(T_IMP,impIds,[I.id,I.repeat,I.prev])).forEach(r=>imps[r.id]=r);
        const prevIds=[...new Set(Object.values(imps).flatMap(r=>r.fields[I.repeat]?(r.fields[I.prev]||[]):[]))];
        if(prevIds.length){ const pv={}; (await api.byIds(T_IMP,prevIds,[I.id])).forEach(r=>pv[r.id]=r.fields[I.id]||'');
          Object.values(imps).forEach(r=>{ r.prevName=(r.fields[I.prev]||[]).map(id=>pv[id]).filter(Boolean).join(' / '); }); } } }
    for(const x of todo){ try{ log('Signed packet '+x.o.fields[O.num]+'…'); const all=(x.o.fields[O.lines]||[]).map(id=>byId[id]).filter(Boolean), shared=new Map();
        all.forEach(l=>idsOf(l).forEach(id=>shared.set(id,(shared.get(id)||0)+1)));
        const r=await checkOrder(api,x.o,x.ls,imps,opt,{known:new Set(shared.keys()),shared}); out.orders.push(r);
        r.lines.forEach(l=>log(`  ${r.order} ${l.line}: ${l.pages.length?l.pages.map(p=>'page '+p+' ('+(l.by[p]||'?')+')').join(', '):'no page'}${l.wrongId.length?' · not saved: '+l.wrongId.map(w=>'page '+w.p+' shows '+w.ids.join('/')).join(', '):''}${l.odd.length?' · '+l.odd.join('/')+' on several pages and lines':''}`));
        if(r.lines.some(l=>!l.pages.length)) tried[docKey(x.o)]=now; }   // a line with no page found: not again for 12 hours
      catch(e){ out.orders.push({order:x.o.fields[O.num],error:e.message}); tried[docKey(x.o)]=now; } }
    lsSet('pine_signed_tried',tried);
    return out; }

  window.PineSigned={sync,FIELDS:{O,L,I},_t:{grid,diff,cmp,pdfGrids,MATCH,ink,maskBox,initialed,INK_MIN,pageText,idsIn,idsOf,fitScore}};
})();
