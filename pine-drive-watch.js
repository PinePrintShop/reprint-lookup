/* pine-drive-watch.js — the Drive folders on screen stay current without a page reload (2026-10-27)
   Stephen: "yes let's add those update timers for the mockup maker and sep maker" — Seps v50's auto-refresh, shared.
   ("sometimes the art dept will manually drop something in the google drive and they would like it to show up in the
   app quicker without having to refresh the whole page and start over again")

   Use (one line near the end of <body>, like pine-update.js):  <script src="pine-drive-watch.js"></script>
   Then in the app:
     const W=PineDriveWatch.create({
       every:25,                      // seconds between checks (?poll=<s> overrides, for tests)
       targets:()=>[folder ids],      // only what's on screen; [] = nothing to check
       list:fid=>Promise<files>,      // optional: the app's own read. Default: the worker's /drive/list, never cached
       proxy, token:()=>TOKEN,        // for the default list
       paused:()=>bool,               // a dialog / menu / viewer open: no checks (default: any open dialog or pop-up)
       hold:()=>bool,                 // mid-task (saving, uploading, dragging, typing): checks run, paints wait
       skip:f=>bool,                  // optional: files the app never shows (never "New")
       extra:()=>Promise|null,        // optional: one more job with a check (e.g. look again for a missing order folder)
       paint:changedFids=>{}          // called only on a real change (file ids + modified times), when not on hold
     });
     W.apply(fid,files)  the app read a folder itself → true if it changed (the first read is only the baseline for "New")
     W.files(fid)        the newest listing of a folder (what paint should show)
     W.fresh(id)         'new' | 'upd' | null  (marks fade after 30 min)    W.tag(id) → the pill's HTML ('' if none)
     W.newIn(fids)       how many new / updated files in those folders     W.seen(fids) the tags shown there are done
     W.mine(ids)         the app's own uploads / copies / moves: never "New" (and a trashed one may come back)
     W.forget(fid,ids)   after trash / move: drop reads already in flight; those ids stay out of that folder
     W.now()  check now (the stamp, Refresh)       W.stale()  everything counts as old (Refresh)
     W.stamp(el,fid)     "↻ Updated just now" · "N min ago" · "Checking Drive…" · "Drive didn't answer" (tap = check now)
   Behaviour: hidden tab → no checks, back to the tab / window → check at once. Errors back off (×2, up to 5 min).
   Idle 20 min (no pointer, keys or scroll; ?idle=<s> overrides) → a check every 5 min; the next touch checks at once.
   Reads go 3 at a time. A folder read less than ~0.8 of the beat ago isn't read again. Test hook: window.__pdw. */
(function(){
  if(window.PineDriveWatch) return;
  var qs=function(k){ var m=location.search.match(new RegExp('[?&]'+k+'=(\\d+(?:\\.\\d+)?)')); return m?+m[1]:null; };
  var FRESH_MS=30*60e3, MINE_MS=5*60e3, IDLE_EVERY=5*60e3, MAX_BACK=5*60e3;
  // the yellow "New" pill (Pine style v2: yellow = needs a look; nothing under 12px) and the small stamp button
  var css='.p-new{display:inline-flex;align-items:center;height:20px;padding:0 6px;border-radius:4px;background:var(--p-yellow,#FBE122);color:var(--p-black,#141412);border:1.5px solid var(--p-black,#141412);font:800 12px/1 var(--p-sans,Helvetica,Arial,sans-serif);letter-spacing:.02em;white-space:nowrap;vertical-align:middle}'+
    '.p-dwstamp{border:0;background:none;font:400 12px/1.2 var(--p-sans,Helvetica,Arial,sans-serif);color:var(--p-ink-2,#6b6457);cursor:pointer;min-height:32px;padding:0 6px;border-radius:var(--p-r,6px);white-space:nowrap}'+
    '.p-dwstamp:hover{background:var(--p-cream,#EFE2CD);color:var(--p-black,#141412)}.p-dwstamp.is-busy{opacity:.7;cursor:progress}';
  function addCss(){ if(document.getElementById('pdwCss')) return; var s=document.createElement('style'); s.id='pdwCss'; s.textContent=css; (document.head||document.documentElement).appendChild(s); }
  var isDir=function(f){ return /folder$/.test(f.mimeType||''); };
  function sigOf(files){ return files.map(function(f){ return f.id+'|'+(f.modifiedTime||'')+'|'+(f.size||'')+'|'+(f.name||''); }).sort().join('\n'); }
  function ago(t){ var s=(Date.now()-t)/1000; return s<45?'just now':s<90?'1 min ago':s<3600?Math.round(s/60)+' min ago':'over an hour ago'; }
  // any open dialog, pop-up, scrim or the Drive ⋯ menu (visible ones only)
  function dialogOpen(extra){
    var q='dialog[open],.p-scrim:not([hidden]),[role=dialog]:not([hidden]),.mk-dmenu'+(extra?','+extra:'');
    return Array.prototype.some.call(document.querySelectorAll(q),function(e){ return e.getClientRects().length>0; });
  }
  function create(o){
    addCss();
    var every=Math.max(1,qs('poll')||o.every||25)*1000, idleMs=Math.max(1,qs('idle')||o.idle||1200)*1000;
    var W={ every:every, idleMs:idleMs, checks:0, reads:0, paints:0, errs:0, busy:false, idle:false };
    var at={}, sig={}, known={}, lists={}, fresh={}, mineAt={}, gone={}, seq={}, pend={}, old=0, timer=0, again=false, lastStart=0, act=Date.now(), down=0, key=0, stamps=[], holdT=0;
    var list=o.list||function(fid){
      return fetch(o.proxy+'/drive/list?folder='+encodeURIComponent(fid),{headers:{Authorization:'Bearer '+(o.token?o.token():'')},cache:'no-store'})
        .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ if(!r.ok||!j||j.ok===false) throw new Error((j&&j.error)||('Drive '+r.status)); return j.files||[]; }); });
    };
    // 3 reads at a time
    var Q=[], QN=0;
    function get(fid){ return new Promise(function(res,rej){ Q.push([fid,res,rej]); pump(); }); }
    function pump(){ while(QN<3&&Q.length){ var x=Q.shift(); QN++; W.reads++; Promise.resolve().then(function(){ return list(x[0]); }).then(x[1],x[2]).then(done,done); } }
    function done(){ QN--; pump(); }
    var hidden=function(){ return document.visibilityState==='hidden'; };
    var paused=function(){ try{ return o.paused?!!o.paused():dialogOpen(); }catch(e){ return false; } };
    var hold=function(){ try{ return (down&&Date.now()-down<10000)||Date.now()-key<1500||!!(o.hold&&o.hold()); }catch(e){ return false; } };
    var isIdle=function(){ return Date.now()-act>=idleMs; };
    // A folder's listing: marks what appeared / changed since the last read. true = it changed.
    W.apply=function(fid,files){
      files=(files||[]).filter(function(f){ return !gone[fid+'|'+f.id]; });
      var now=Date.now(), s=sigOf(files); at[fid]=now; lists[fid]=files;
      if(sig[fid]===s) return false;
      var before=known[fid], first=sig[fid]==null;
      if(before) files.forEach(function(f){
        if(now-(mineAt[f.id]||0)<MINE_MS||(o.skip&&o.skip(f))) return;   // the app's own upload / copy / move; files it hides
        if(!(f.id in before)) fresh[f.id]={kind:'new',at:now,folder:fid};
        else if(!isDir(f)&&before[f.id]!==(f.modifiedTime||'')) fresh[f.id]={kind:'upd',at:now,folder:fid};
      });
      var k={}; files.forEach(function(f){ k[f.id]=f.modifiedTime||''; }); known[fid]=k; sig[fid]=s;
      return !first;   // a folder's first read is only its baseline
    };
    W.files=function(fid){ return lists[fid]||null; };
    W.fresh=function(id){ var x=fresh[id]; if(!x) return null; if(Date.now()-x.at>FRESH_MS){ delete fresh[id]; return null; } return x.kind; };
    W.tag=function(id){ var k=W.fresh(id); if(!k) return ''; fresh[id].shown=true; return '<span class="p-new">'+(k==='upd'?'Updated':'New')+'</span>'; };
    W.newIn=function(fids){ var n=0; Object.keys(fresh).forEach(function(id){ if(W.fresh(id)&&fids.indexOf(fresh[id].folder)>=0) n++; }); return n; };
    W.seen=function(fids){ Object.keys(fresh).forEach(function(id){ var x=fresh[id]; if(x.shown&&(!fids||fids.indexOf(x.folder)>=0)) delete fresh[id]; }); };
    W.mine=function(ids){ var now=Date.now(); [].concat(ids||[]).filter(Boolean).forEach(function(id){ mineAt[id]=now; delete fresh[id]; Object.keys(gone).forEach(function(g){ if(g.slice(-id.length-1)==='|'+id) delete gone[g]; }); }); };
    W.forget=function(fid,ids){ if(!fid) return; seq[fid]=(seq[fid]||0)+1;
      [].concat(ids||[]).filter(Boolean).forEach(function(id){ gone[fid+'|'+id]=1; delete fresh[id]; if(known[fid]) delete known[fid][id]; });
      if(lists[fid]) lists[fid]=lists[fid].filter(function(f){ return !gone[fid+'|'+f.id]; }); };
    W.stale=function(){ old=Date.now(); };
    W.state=function(){ return { every:every, idleMs:idleMs, idle:isIdle(), interval:interval(), checks:W.checks, reads:W.reads, paints:W.paints, errs:W.errs, busy:W.busy, pending:Object.keys(pend), last:W.last||0 }; };
    function interval(){ var b=Math.min(every*Math.pow(2,W.errs),Math.max(every,MAX_BACK)); return isIdle()?Math.max(b,IDLE_EVERY):b; }
    function schedule(ms){ clearTimeout(timer); timer=0; if(hidden()) return; timer=setTimeout(function(){ poll(); },ms==null?interval():ms); }
    // minAge: read only what's older than this (default 0.8 of the beat; 0 = everything on screen, now)
    function poll(minAge,force){
      if(minAge==null) minAge=every*0.8;
      if(W.busy){ if(force) again=true; return; }
      clearTimeout(timer); timer=0;
      if(hidden()) return;
      if(!force&&isIdle()&&Date.now()-lastStart<IDLE_EVERY*0.95){ schedule(IDLE_EVERY-(Date.now()-lastStart)); return; }   // idle: every 5 min
      if(paused()){ schedule(); return; }
      var T=[]; try{ T=(o.targets()||[]).filter(function(f,i,a){ return f&&a.indexOf(f)===i; }); }catch(e){}
      var now=Date.now(), due=T.filter(function(fid){ var t=at[fid]||0; return t<old||now-t>=minAge; });
      var extra=null; try{ extra=o.extra?o.extra():null; }catch(e){}
      if(!due.length&&!extra){ schedule(); return; }
      W.busy=true; W.checks++; lastStart=now; paintStamps();
      var jobs=due.map(function(fid){ var s=seq[fid]||0;
        return get(fid).then(function(files){ if((seq[fid]||0)!==s) return;   // trashed / moved meanwhile: this read is old
          if(W.apply(fid,files)) pend[fid]=1; });
      });
      if(extra) jobs.push(Promise.resolve(extra));
      Promise.all(jobs.map(function(p){ return p.then(function(){ return true; },function(){ return false; }); })).then(function(r){
        var bad=r.filter(function(x){ return !x; }).length;
        W.errs=bad?Math.min(W.errs+1,4):0; if(bad<r.length||!r.length) W.last=Date.now();
        W.busy=false; flush(); paintStamps();
        if(again){ again=false; poll(0,true); return; }
        schedule();
      });
    }
    // paint what changed, once nobody is mid-task (then it waits and tries again)
    function flush(){
      var f=Object.keys(pend); if(!f.length) return;
      if(hold()){ clearTimeout(holdT); holdT=setTimeout(flush,800); return; }
      pend={}; W.paints++; try{ o.paint(f); }catch(e){ if(window.console) console.error(e); }
    }
    W.flush=flush;
    W.now=function(){ act=Date.now(); poll(0,true); };
    W.wake=function(){ if(!hidden()){ act=Date.now(); poll(3000,true); } };
    // the "↻ Updated …" stamp (tap = check now); repainted every 10 s and around each check
    W.stamp=function(el,fid){ if(!el) return;
      stamps=stamps.filter(function(s){ return s.el!==el&&s.el.isConnected; }); stamps.push({el:el,fid:fid});
      if(!el._pdw){ el._pdw=1; el.addEventListener('click',function(){ W.now(); }); if(!el.title) el.title='Check Drive now'; }
      paintStamp(stamps[stamps.length-1]);
    };
    function paintStamp(s){ var t=at[s.fid];
      s.el.classList.toggle('is-busy',W.busy); s.el.hidden=!s.fid;
      s.el.textContent='↻ '+(W.busy?'Checking Drive…':W.errs?'Drive didn’t answer · trying again':t?'Updated '+ago(t):'Check now'); }
    function paintStamps(){ stamps=stamps.filter(function(s){ return s.el.isConnected; }); stamps.forEach(paintStamp); }
    setInterval(function(){ if(!hidden()) paintStamps(); },10000);
    // activity: wakes from idle with a check at once
    function active(){ var was=isIdle(); act=Date.now(); if(was&&!hidden()) poll(0,true); }
    ['pointermove','wheel','touchstart'].forEach(function(e){ window.addEventListener(e,active,{passive:true,capture:true}); });
    document.addEventListener('scroll',active,{passive:true,capture:true});
    document.addEventListener('keydown',function(){ key=Date.now(); active(); },true);
    document.addEventListener('pointerdown',function(){ down=Date.now(); active(); },true);
    var up=function(){ down=0; if(Object.keys(pend).length) setTimeout(flush,200); };
    document.addEventListener('pointerup',up,true); document.addEventListener('pointercancel',up,true);
    document.addEventListener('visibilitychange',function(){ if(hidden()){ clearTimeout(timer); timer=0; } else W.wake(); });
    window.addEventListener('focus',W.wake);
    (window.__pdw=window.__pdw||[]).push(W);
    schedule();
    return W;
  }
  window.PineDriveWatch={create:create,dialogOpen:dialogOpen,sig:sigOf};
})();
