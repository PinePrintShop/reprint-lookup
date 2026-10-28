/* pine-signed.js (2026-10-28) — signed PandaDoc packets → each line's signed mockup, and a check before screens.
   Stephen: "how can we make sure the signed PandaDoc mockup gets back into Airtable so we can use the actual signed
   mockups?" … "Client puts in a reorder … client changes back print. Sales forgets to update imprint id but an update
   is made to the PandaDoc mockup … we still have the old reference in Airtable so screens burns the reorder screens".

   1. Asks the worker (v33) to store new completed PandaDocs on their orders (Signed Packet, PandaDoc ID, Signed At).
   2. For orders with a Signed Packet whose lines aren't checked for that document yet:
      - finds each line's page(s): from the order's PandaDoc Pages (Line Item Review writes it when it sends), or by
        matching the signed pages against the line's proof in Airtable;
      - compares the signed page with the proof in Airtable (a picture compare, small and blurred, so the customer's
        initials don't count). Different = the mockup was changed in PandaDoc, or a new proof went into Airtable after;
      - saves the page(s) as the line's Signed Proof, and a Signed Check: "OK · …" or "CHECK · …" (+ a reorder note
        when an imprint on the line is a reorder, so the screen room compares with the previous run).
   Use: <script src="pine-signed.js"></script>, then PineSigned.sync({token, practice}) (returns a summary).
   Needs pdf.js + pdf-lib (loaded from cdnjs if the page doesn't have them). Practice: nothing is written. */
(function(){
  const BASE='appJkaLk8DykjsgHR', T_ORD='tbl8Tf0AeS9gnHOOS', T_LI='tblJx5UlwO7oMSk5H', T_IMP='tbln9oAGvz2PNBZLV';
  const WORKER='https://pine-workers.stephen-dab.workers.dev/proxy';
  const O={num:'fld4S3B5yJANKlE7l',status:'fldhS4z28CdGmS1j5',lines:'fldU6fgrz6sU3wyIZ',packet:'fldSwLl9yIMSXcT0Y',pdId:'fldfQJ8QwtNXxGPE5',signedAt:'fld2h7L1aqDHPfcQM',pages:'fldlumFLBJi3WrfUS'};
  const L={proof:'flddhvdkKI31tFTdX',signed:'fldYeu8XZgBNSQ3N6',check:'fldzHcS22EcdZ3xwN',imps:'fldTFz4ZzfOthqkg6'};
  const I={id:'fldDFfwFQ9B20n2kT',repeat:'flda9L7041ahNZT0b',prev:'fldAEQvMAAZX9gnhl'};
  const DONE=['Shipped','Completed','Cancelled / Voided','Partially Completed'];
  const LIB={pdflib:'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js',pdfjs:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',pdfjsWorker:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'};
  const CHECK_PAUSED=true;
  // 2026-10-28: the sweep is paused too. PandaDoc's downloads kept failing (too many at once), so every run emptied and
  // re-wrote Signed Packets. Back on when the worker takes signed PDFs from the Pipedrive Drive folders instead.
  const SWEEP_PAUSED=true;
  const SWEEP_MS=10*60*1000, MAX_ORDERS=4, MATCH=0.025;   // MATCH: how much of any one patch of the page may differ and it is still the same mockup (2.5%)
  // where the customer initials: the APPROVED box, bottom left on Pine's proof template (left/top/right/bottom, 0–1 of the page)
  const APPROVED_BOX=[[0,0.8,0.36,1],[0,0.97,1,1]];   // + a footer strip (a signing stamp)

  const loadScript=src=>new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=()=>rej(new Error('Could not load '+src)); document.head.appendChild(s); });
  async function libs(){ if(!window.PDFLib) await loadScript(LIB.pdflib); if(!window.pdfjsLib){ await loadScript(LIB.pdfjs); pdfjsLib.GlobalWorkerOptions.workerSrc=LIB.pdfjsWorker; } }
  const sel=v=>v&&typeof v==='object'&&!Array.isArray(v)?v.name||'':v;
  const day=s=>{ const d=new Date(s); return isNaN(d)?'':(d.getMonth()+1)+'/'+d.getDate(); };

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

  // a page (or picture) as a small blurred grey grid, so two renders of the same mockup compare as the same
  const GW=240;
  function grid(canvas){ const w=GW, h=Math.max(8,Math.round(GW*canvas.height/canvas.width)), c=document.createElement('canvas'); c.width=w; c.height=h;
    const x=c.getContext('2d'); x.filter='blur(0.6px)'; x.fillStyle='#fff'; x.fillRect(0,0,w,h); x.drawImage(canvas,0,0,w,h);
    const d=x.getImageData(0,0,w,h).data, g=new Float32Array(w*h); for(let i=0;i<w*h;i++) g[i]=(0.299*d[i*4]+0.587*d[i*4+1]+0.114*d[i*4+2])/255;
    return {w,h,g,asp:canvas.width/canvas.height}; }
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
  async function pdfGrids(data){ const doc=await pdfjsLib.getDocument({data:data.slice(0),isEvalSupported:false}).promise, out=[];
    for(let i=1;i<=doc.numPages;i++){ const pg=await doc.getPage(i), v=pg.getViewport({scale:1}), sc=720/Math.max(v.width,v.height), vp=pg.getViewport({scale:sc});
      const c=document.createElement('canvas'); c.width=Math.round(vp.width); c.height=Math.round(vp.height); const x=c.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,c.width,c.height);
      await pg.render({canvasContext:x,viewport:vp}).promise; out.push(grid(c)); }
    return out; }
  async function imgGrid(data,type){ const url=URL.createObjectURL(new Blob([data],{type:type||'image/png'}));
    try{ const im=await new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=url; });
      // Line Item Review puts a picture proof on a letter page (fitted into 744×520 pt, 72 pt from the bottom): do the same
      const c=document.createElement('canvas'); c.width=720; c.height=556; const x=c.getContext('2d'), k=720/792; x.fillStyle='#fff'; x.fillRect(0,0,c.width,c.height);
      const sc=Math.min(744/im.width,520/im.height); x.drawImage(im,(792-im.width*sc)/2*k,(612-72-im.height*sc-(520-im.height*sc)/2)*k,im.width*sc*k,im.height*sc*k); return grid(c); }
    finally{ URL.revokeObjectURL(url); } }
  // a line's proof in Airtable: [{file, fp, grid}] for every page of every proof file
  async function proofGrids(api,line,cache){ const out=[];
    for(const a of line.fields[L.proof]||[]){ const key=(a.filename||'')+'|'+(a.size||'');
      if(!cache[key]){ try{ const b=await api.bytes(a.url); cache[key]=(/pdf/i.test(a.type||'')||/\.pdf$/i.test(a.filename||''))?await pdfGrids(b):[await imgGrid(b,a.type)]; }catch(e){ cache[key]=[]; } }
      cache[key].forEach((g,fp)=>out.push({file:a.filename||'',size:a.size||'',fp,grid:g})); }
    return out; }

  async function checkOrder(api,o,lines,imps,opt){
    const f=o.fields, num=f[O.num], doc=f[O.pdId]||'', att=(f[O.packet]||[])[0], when=day(f[O.signedAt]);
    const packet=await api.bytes(att.url), signed=await pdfGrids(packet), cache={};
    let map=null; try{ const j=JSON.parse(f[O.pages]||'null'); if(j&&Array.isArray(j.pages)&&(!j.doc||!doc||j.doc===doc)) map=j; }catch(e){}
    const res=[];
    for(const ln of lines){
      const pg=await proofGrids(api,ln,cache); let pages=[], best=1, how='';
      if(map){ const mine=map.pages.filter(p=>(p.lines||[]).includes(ln.id));
        pages=mine.map(p=>p.p).filter(p=>p>=1&&p<=signed.length);
        // each listed page against the same page of the same file in Airtable now (gone from Airtable = a newer proof went in)
        const ds=mine.map(p=>{ const g=pg.find(x=>x.file===p.file&&x.fp===(p.fp||0)); const pm=p.mask?(Array.isArray(p.mask[0])?p.mask:[p.mask]):null; return g&&signed[p.p-1]?diff(signed[p.p-1],g.grid,pm?pm.concat([[0,0.97,1,1]]):null):null; });
        if(ds.length&&ds.every(d=>d!==null)) best=Math.max(...ds); else if(ds.length&&pg.length) how='newer';
      } else if(pg.length){
        // no page list (a packet built by hand): the signed page(s) closest to this line's proof pages
        pg.forEach(x=>{ let bi=-1, bd=1; signed.forEach((s,i)=>{ const d=cmp(s,x.grid).all; if(d<bd){ bd=d; bi=i; } }); if(bi>=0&&bd<0.15&&!pages.includes(bi+1)) pages.push(bi+1); });
        if(pages.length) best=Math.max(...pg.map(x=>Math.min(...pages.map(p=>diff(signed[p-1],x.grid)))));
      }
      pages.sort((a,b)=>a-b);
      const im=(ln.fields[L.imps]||[]).map(id=>imps[id]).filter(Boolean), re=im.filter(x=>x.fields[I.repeat]&&(x.fields[I.prev]||[]).length);
      const reTxt=re.length?` Reorder of ${re.map(x=>x.prevName||'a previous imprint').join(', ')}: compare the signed mockup with the previous run before reusing its screens.`:'';
      let ok, msg;
      if(!pg.length){ ok=false; msg=`no proof on this line in Airtable to compare with${pages.length?'':' — find its page in the signed packet'}.`; }
      else if(!pages.length){ ok=false; msg=`none of the signed pages matches this line's proof in Airtable — the mockup was probably changed in PandaDoc. Check the imprint IDs and the proof before screens.`; }
      else if(best<=MATCH){ ok=true; msg=`matches the proof in Airtable.`; }
      else { ok=false; msg=how==='newer'?`a different proof is in Airtable now than the one that was signed. Check which one is right (and the imprint IDs) before screens.`
        :`the signed mockup is different from the proof in Airtable — it was probably changed in PandaDoc. Update the proof and check the imprint IDs before screens.`; }
      const check=`${ok?'OK':'CHECK'} · ${num} signed ${when}${pages.length?' · page '+pages.join(', '):''} · ${msg}${reTxt} [doc ${doc}]`;
      res.push({line:ln.id,pages,diff:Math.round(best*1000)/1000,ok,reorder:re.length>0,check});
    }
    // write: the line's pages as its Signed Proof, then the check
    if(!opt.practice){
      const src=await PDFLib.PDFDocument.load(packet,{ignoreEncryption:true});
      for(const r of res){
        if(r.pages.length){ const out=await PDFLib.PDFDocument.create(); (await out.copyPages(src,r.pages.map(p=>p-1))).forEach(p=>out.addPage(p));
          const b=await out.save();
          if(b.length<4.9e6){ await api.at(`${T_LI}/${r.line}`,{method:'PATCH',body:JSON.stringify({fields:{[L.signed]:[]}})});
            let s=''; for(let i=0;i<b.length;i+=0x8000) s+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000));
            await api.at(`https://content.airtable.com/v0/${BASE}/${r.line}/${L.signed}/uploadAttachment`,{method:'POST',body:JSON.stringify({contentType:'application/pdf',file:btoa(s),filename:`${num} signed ${r.pages.length>1?'pages '+r.pages.join('-'):'page '+r.pages[0]}.pdf`})}); }
          else r.check+=' (page too big to save on the line — open the Signed Packet on the order)'; }
        await api.at(`${T_LI}/${r.line}`,{method:'PATCH',body:JSON.stringify({fields:{[L.check]:r.check}})});
      }
    }
    return {order:num,doc,mapped:!!map,lines:res};
  }

  async function sync(opt){ opt=opt||{}; const token=opt.token, log=opt.log||(()=>{}); if(!token) return {ok:false,error:'no token'};
    const api=mk(token), out={ok:true,swept:null,orders:[]};
    // 1. new signed packets onto their orders (the worker; at most every 10 minutes from this browser)
    let last=0; try{ last=+localStorage.getItem('pine_signed_sweep')||0; }catch(e){}
    if(!SWEEP_PAUSED&&(opt.force||Date.now()-last>SWEEP_MS)){ try{ const r=await fetch(`${WORKER}/pandadoc/sweep${opt.practice?'?dry=1':''}`,{headers:{Authorization:'Bearer '+token}}); out.swept=await r.json();
        if(r.ok) try{ localStorage.setItem('pine_signed_sweep',String(Date.now())); }catch(e){} }catch(e){ out.swept={ok:false,error:e.message}; } }
    // 2026-10-28: paused. The worker's PDFs came back with PandaDoc's demo watermark and without the customer's initials,
    // so every page read as "changed" (11045, 11068). Back on once the worker stores the real signed PDF.
    if(CHECK_PAUSED) return out;
    // 2. orders with a signed packet whose lines aren't checked against it yet
    const f=`AND({Signed Packet}!='',{PandaDoc ID}!='',NOT(OR(${DONE.map(x=>`{Order Status}='${x}'`).join(',')})))`;
    const ords=await api.all(T_ORD,`${api.flds(Object.values(O))}&filterByFormula=${encodeURIComponent(f)}`);
    const lineIds=[...new Set(ords.flatMap(o=>o.fields[O.lines]||[]))];
    const lines=lineIds.length?await api.byIds(T_LI,lineIds,[L.proof,L.check,L.imps,L.signed]):[], byId={}; lines.forEach(l=>byId[l.id]=l);
    const todo=ords.map(o=>({o,ls:(o.fields[O.lines]||[]).map(id=>byId[id]).filter(l=>l&&!String(l.fields[L.check]||'').includes('[doc '+o.fields[O.pdId]+']'))})).filter(x=>x.ls.length).slice(0,MAX_ORDERS);
    if(!todo.length) return out;
    await libs();
    const impIds=[...new Set(todo.flatMap(x=>x.ls.flatMap(l=>l.fields[L.imps]||[])))], imps={};
    if(impIds.length){ (await api.byIds(T_IMP,impIds,[I.id,I.repeat,I.prev])).forEach(r=>imps[r.id]=r);
      const prevIds=[...new Set(Object.values(imps).flatMap(r=>r.fields[I.repeat]?(r.fields[I.prev]||[]):[]))];
      if(prevIds.length){ const pv={}; (await api.byIds(T_IMP,prevIds,[I.id])).forEach(r=>pv[r.id]=r.fields[I.id]||'');
        Object.values(imps).forEach(r=>{ r.prevName=(r.fields[I.prev]||[]).map(id=>pv[id]).filter(Boolean).join(' / '); }); } }
    for(const x of todo){ try{ log('Signed packet '+x.o.fields[O.num]+'…'); out.orders.push(await checkOrder(api,x.o,x.ls,imps,opt)); }
      catch(e){ out.orders.push({order:x.o.fields[O.num],error:e.message}); } }
    return out; }

  window.PineSigned={sync,FIELDS:{O,L,I},_t:{grid,diff,cmp,pdfGrids,MATCH}};
})();
