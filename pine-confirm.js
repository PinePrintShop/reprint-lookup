/* pine-confirm.js — one Pine "are you sure?" box for every app (2026-10-19)
   Replaces the browser's confirm() pop-up, which is grey, tiny on an iPad, and can't say
   which button is the dangerous one.

   Use, in each app version (one line, before the app's own script):
     <script src="pine-confirm.js"></script>
   Then, instead of  if(!confirm('Delete this line?')) return;
     if(!await PineConfirm.ask({title:'Delete this line?', body:'It can't be undone.', ok:'Delete', danger:true})) return;
   Options (all optional except title):
     title   the question, short ("Delete 3 lines?")
     body    one plain sentence of what happens next (text, not HTML)
     ok      the yes button's words (default "OK"). Say the action: "Delete", "Send", "Mark done".
     cancel  the no button's words (default "Cancel")
     danger  true -> the yes button is red (only for real deletes/irreversible sends)
   Returns a Promise: true for yes, false for no / Esc / tapping outside.
   PineConfirm.ask('Text only?') also works (title = the text).
   Keys: Enter = yes, Esc = no. Buttons are 56px tall (finger-sized on the iPads). */
(function(){
  var open=null;
  function el(tag,css,text){ var e=document.createElement(tag); if(css) e.setAttribute('style',css); if(text!=null) e.textContent=text; return e; }
  function ask(o){
    if(typeof o==='string') o={title:o};
    o=o||{};
    if(open) open(false);
    return new Promise(function(resolve){
      var prevFocus=document.activeElement;
      var scrim=el('div','position:fixed;inset:0;z-index:2147482000;background:rgba(20,20,18,.55);display:flex;align-items:center;justify-content:center;padding:16px');
      scrim.setAttribute('role','presentation');
      var box=el('div','background:#fff;color:#141412;border-radius:16px;width:min(440px,100%);box-shadow:0 20px 60px rgba(0,0,0,.35);overflow:hidden;font:400 16px Helvetica,Arial,sans-serif');
      box.setAttribute('role','alertdialog'); box.setAttribute('aria-modal','true');
      var head=el('div','padding:20px 20px '+(o.body?'8px':'20px'));
      var h=el('div','font:800 20px Poppins,Helvetica,Arial,sans-serif;line-height:1.25',o.title||'Are you sure?');
      head.appendChild(h); box.appendChild(head);
      if(o.body){ box.appendChild(el('div','padding:0 20px 20px;font-size:16px;line-height:1.4;white-space:pre-line',o.body)); }
      var foot=el('div','display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;padding:12px 20px;border-top:1px solid rgba(20,20,18,.14);background:#F7F0E4');
      var btn='min-height:56px;padding:0 22px;border-radius:12px;font:800 16px Helvetica,Arial,sans-serif;cursor:pointer;flex:1 1 auto;max-width:220px;';
      var no=el('button',btn+'background:#fff;color:#141412;border:2px solid #141412',o.cancel||'Cancel');
      var yes=el('button',btn+(o.danger?'background:#C62828;color:#fff;border:2px solid #C62828':'background:#FBE122;color:#141412;border:2px solid #FBE122'),o.ok||'OK');
      no.type=yes.type='button';
      foot.appendChild(no); foot.appendChild(yes); box.appendChild(foot); scrim.appendChild(box);
      function done(v){
        if(!scrim.parentNode) return;
        open=null; document.removeEventListener('keydown',key,true); scrim.remove();
        try{ if(prevFocus&&prevFocus.focus) prevFocus.focus(); }catch(e){}
        resolve(v);
      }
      function key(e){
        if(e.key==='Escape'){ e.preventDefault(); e.stopPropagation(); done(false); }
        else if(e.key==='Enter'){ e.preventDefault(); e.stopPropagation(); done(document.activeElement!==no); }
      }
      no.onclick=function(){done(false);}; yes.onclick=function(){done(true);};
      scrim.addEventListener('click',function(e){ if(e.target===scrim) done(false); });
      document.addEventListener('keydown',key,true);
      open=done;
      document.body.appendChild(scrim);
      (o.danger?no:yes).focus();
    });
  }
  window.PineConfirm={ask:ask};
})();
