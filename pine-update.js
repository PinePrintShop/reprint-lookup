/* pine-update.js — keeps a Pine app current on the iPads (2026-10-14)
   Home-screen apps can stay open for days, so they miss new versions. This checks the app's
   permanent link (e.g. pine-operator.html), reads which version it points to, and moves up.

   Use, in each app version (one line, near the end of <body>):
     <script src="pine-update.js" data-link="pine-operator.html"></script>
   Optional, in the app:
     window.pineBusy = () => true while someone is mid-task (a form open, an upload running…).
       Not busy -> the app reloads into the new version by itself.
       Busy, or no pineBusy defined -> a black "New version · Update now" bar shows instead.
     PineUpdate.check()  call from the app's Refresh button (also checks right away).
     PineUpdate.ver      this file's version number, e.g. 125 (show it on screen: "v125").
   Checks: on load (after 20 s), whenever the app comes back to the front, and every 15 min.
   Practice and other ?params are kept. The fetch skips the browser/GitHub cache. */
(function(){
  var me=document.currentScript, link=me&&me.getAttribute('data-link');
  var m=location.pathname.match(/-v(\d+)\.html$/), ver=m?+m[1]:0;
  var api=window.PineUpdate={ver:ver,check:check,link:link};
  if(!link||!ver) return;
  var shown=false;
  function check(){
    return fetch(link+'?v='+Date.now(),{cache:'no-store'}).then(function(r){return r.ok?r.text():'';}).then(function(t){
      var mm=String(t).match(/location\.replace\('([^']*-v(\d+)\.html)'/); if(!mm) return false;
      var nv=+mm[2]; if(!(nv>ver)) return false;
      var url=mm[1]+location.search+location.hash;
      var busy=typeof window.pineBusy==='function'?!!window.pineBusy():true;
      if(!busy){ location.replace(url); return true; }
      bar(nv,url); return true;
    }).catch(function(){return false;});
  }
  function bar(nv,url){
    if(shown) return; shown=true;
    var b=document.createElement('div');
    b.setAttribute('style','position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483000;background:#141412;color:#fff;border-radius:12px;padding:10px 12px 10px 16px;display:flex;gap:12px;align-items:center;font:700 14px Helvetica,Arial,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.35)');
    b.innerHTML='<span>New version ready (v'+nv+')</span>';
    var go=document.createElement('button'); go.textContent='Update now';
    go.setAttribute('style','background:#FBE122;color:#141412;border:0;border-radius:8px;font:800 15px Helvetica,Arial,sans-serif;padding:12px 16px;min-height:44px;cursor:pointer');
    go.onclick=function(){ location.replace(url); }; b.appendChild(go); document.body.appendChild(b);
  }
  setTimeout(check,20000);
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) check(); });
  setInterval(function(){ if(!document.hidden) check(); },15*60*1000);
})();
