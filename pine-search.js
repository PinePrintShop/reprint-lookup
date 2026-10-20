/* pine-search.js — forgiving search for every Pine app (2026-10-20)
   Stephen: "can we make the search logic really find anything we are typing vs having to type it very exactly".

   Use, in each app version (one line, before the app's own script):
     <script src="pine-search.js"></script>
   Then:
     PineSearch.match(query, text)        -> true / false
     PineSearch.score(query, text)        -> 0 = no match, higher = better (use to sort results)
     PineSearch.filter(query, items, fn)  -> items that match, best first; fn(item) returns the text to search
                                             (join every field you want searchable: name, order #, customer, colour…)
   What counts as a match (case, accents, punctuation and word order never matter; every typed word must match):
     - part of a word anywhere            "deaf"   -> "Deaf Co",  "3501" -> "BC-3501CVC"
     - numbers ignore dashes and spaces   "11040a" -> "11040-A",  "1807c" -> "PANTONE 1807 C"
     - letters in order inside one word   "blk"    -> "Black",    "htr"   -> "Heather"
     - shop words                         "pms 185" -> "PANTONE 185 C"
     - first letters of words             "dtf"    -> "Direct-to-fabric", "wg3" -> "Warm Grey 3"
     - one typo in words of 4+ letters    "blakc"  -> "Black",    "navey" -> "Navy"   (never in numbers)
   Exact words rank above starts-of-words, above parts, above letters-in-order, above typos. */
(function(){
  function norm(s){
    return String(s==null?'':s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()
      .replace(/&/g,' and ').replace(/[^a-z0-9%#]+/g,' ').trim();
  }
  function words(s){ var n=norm(s); return n?n.split(' '):[]; }
  // letters of q appear in order inside w, starting with the same first letter
  function inOrder(q,w){ if(!q||!w||q[0]!==w[0]) return false; var i=0; for(var j=0;j<w.length&&i<q.length;j++) if(w[j]===q[i]) i++; return i===q.length; }
  // at most one edit (insert, delete, change, or swap of two neighbours)
  function oneEdit(a,b){
    if(a===b) return true; var la=a.length, lb=b.length; if(Math.abs(la-lb)>1) return false;
    var i=0; while(i<la&&i<lb&&a[i]===b[i]) i++;
    if(la===lb){ if(a.slice(i+1)===b.slice(i+1)) return true; return a[i]===b[i+1]&&a[i+1]===b[i]&&a.slice(i+2)===b.slice(i+2); }
    return la>lb ? a.slice(i+1)===b.slice(i) : a.slice(i)===b.slice(i+1);
  }
  // best score for one typed word against the text
  function tokScore(t, ws, joined, squashed){
    var best=0, digits=/\d/.test(t);
    for(var k=0;k<ws.length;k++){
      var w=ws[k], s=0;
      if(w===t) s=100;
      else if(w.indexOf(t)===0) s=80;
      else if(w.indexOf(t)>0) s=60;
      else if(t.length>=2&&!digits&&inOrder(t,w)) s=40;
      else if(!digits&&t.length>=4&&w.length>=3&&oneEdit(t,w)) s=30;
      else if(!digits&&t.length>=5&&w.length>t.length&&oneEdit(t,w.slice(0,t.length))) s=25;   // typo in the start of a longer word
      if(s>best) best=s; if(best===100) break;
    }
    if(!best && joined.indexOf(t)>=0) best=55;                 // spans words, e.g. "warm grey" typed as one
    if(!best && digits && squashed.indexOf(t)>=0) best=50;     // "11040a" in "11040 a"
    if(!best && t.length>=2){                                  // first letters of words in a row: "dtf", "wg3"
      for(var a=0;a<ws.length&&!best;a++){ var ini=''; for(var b=a;b<ws.length&&ini.length<t.length;b++) ini+=/^\d+$/.test(ws[b])?ws[b]:ws[b][0]; if(ini===t) best=45; }
    }
    return best;
  }
  var ALIAS={pms:'pantone'};
  function score(query, text){
    var qs=words(query).map(function(q){return ALIAS[q]||q;}); if(!qs.length) return 1;
    var ws=words(text), joined=ws.join(' '), squashed=ws.join(''), total=0;
    for(var i=0;i<qs.length;i++){ var s=tokScore(qs[i],ws,joined,squashed); if(!s) return 0; total+=s; }
    return total/qs.length;
  }
  function match(query, text){ return score(query,text)>0; }
  function filter(query, items, fn){
    fn=fn||function(x){return x;};
    if(!words(query).length) return items.slice();
    return items.map(function(it,i){return {it:it,i:i,s:score(query,fn(it))};})
      .filter(function(x){return x.s>0;})
      .sort(function(a,b){return b.s-a.s||a.i-b.i;})
      .map(function(x){return x.it;});
  }
  window.PineSearch={match:match,score:score,filter:filter,norm:norm};
})();
