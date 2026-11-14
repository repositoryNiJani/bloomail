import * as THREE from 'three';
import QRCode from 'qrcode';

(()=>{
'use strict';
if(typeof THREE==='undefined'){document.body.innerHTML='<p class="engine-error">bloomail needs an internet connection to load its 3D engine. Please reconnect and refresh.</p>';return;}

/* ============ helpers & data ============ */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const MIX='mix';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- icons (inline SVG, no emoji) ---------- */
const svg=inner=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+inner+'</svg>';
const IC={
 sparkle:svg('<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z"/>'),
 pen:svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>'),
 send:svg('<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>'),
 dice:svg('<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="8.5" cy="15.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor" stroke="none"/>'),
 replay:svg('<path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/><path d="M3 3v5h5"/>'),
 mail:svg('<rect x="2" y="4" width="20" height="16" rx="3"/><path d="M22 7l-10 6L2 7"/>'),
 camera:svg('<path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>'),
 vol:svg('<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 010 7"/><path d="M19 5a10 10 0 010 14"/>'),
 mute:svg('<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M23 9l-6 6"/><path d="M17 9l6 6"/>'),
 music:svg('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'),
 copy:svg('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>'),
 share:svg('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4"/><path d="M15.4 6.5l-6.8 4"/>'),
 eye:svg('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),
 x:svg('<path d="M18 6L6 18"/><path d="M6 6l12 12"/>'),
 back:svg('<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>'),
 plus:svg('<path d="M12 5v14"/><path d="M5 12h14"/>'),
 note:svg('<circle cx="7" cy="17" r="3.2"/><path d="M10.2 17V3l7 3.5"/>'),
 heart:svg('<path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 00-7.8 7.8l1.1 1.1L12 21.2l7.7-7.7 1.1-1.1a5.5 5.5 0 000-7.8z"/>'),
 down:svg('<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>'),
 cake:svg('<path d="M3 21h18"/><path d="M5 21v-7a2 2 0 012-2h10a2 2 0 012 2v7"/><path d="M5 17c2 1.5 3.5 1.5 5 0s3-1.5 5 0 3 1.5 4 0"/><path d="M12 12V8"/><path d="M12 3c1 1.2 1 2.2 0 3-1-.8-1-1.8 0-3z"/>'),
 rings:svg('<circle cx="9" cy="15" r="5"/><circle cx="15" cy="15" r="5"/><path d="M12 3.5l2 2.5-2 2.5L10 6z"/>'),
 sad:svg('<circle cx="12" cy="12" r="9"/><path d="M8 16s1.5-2 4-2 4 2 4 2"/><path d="M9 9.5v.01"/><path d="M15 9.5v.01"/>'),
 star:svg('<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>'),
 sun:svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.9 4.9l1.4 1.4"/><path d="M17.7 17.7l1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.9 19.1l1.4-1.4"/><path d="M17.7 6.3l1.4-1.4"/>'),
 sunrise:svg('<path d="M17 18a5 5 0 00-10 0"/><path d="M12 9V2"/><path d="M4.2 10.2l1.4 1.4"/><path d="M1 18h2"/><path d="M21 18h2"/><path d="M18.4 11.6l1.4-1.4"/><path d="M23 22H1"/><path d="M8 6l4-4 4 4"/>'),
 moon:svg('<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>'),
 one:svg('<path d="M12 22V11"/><circle cx="12" cy="7" r="4"/><path d="M12 18c-3 0-5-1.4-5-3.6 3 0 5 1.2 5 3.6z"/><path d="M12 16c3 0 5-1.4 5-3.6-3 0-5 1.2-5 3.6z"/>'),
 bouquet:svg('<path d="M7 12l5 10 5-10"/><circle cx="12" cy="6" r="3"/><circle cx="7.5" cy="9" r="2.5"/><circle cx="16.5" cy="9" r="2.5"/>'),
 garden:svg('<path d="M5 21V13"/><path d="M12 21V9"/><path d="M19 21V14"/><path d="M2 21h20"/><circle cx="5" cy="11" r="2"/><circle cx="12" cy="6.5" r="2.5"/><circle cx="19" cy="12" r="2"/>')
};
const ic=n=>'<span class="ic">'+(IC[n]||'')+'</span>';

/* flower icons: little colored silhouettes, one per type */
function fIcon(type){
  const E=(n,rx,ry,cy,fill,r0)=>{let s='';for(let i=0;i<n;i++)s+='<ellipse cx="0" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="'+fill+'" transform="rotate('+((r0||0)+i*360/n).toFixed(1)+')"/>';return s;};
  const C=(r,fill,x,y)=>'<circle cx="'+(x||0)+'" cy="'+(y||0)+'" r="'+r+'" fill="'+fill+'"/>';
  const L=(d,col,w)=>'<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="'+(w||1.8)+'" stroke-linecap="round"/>';
  let b='';
  switch(type){
    case 'rose': b=E(7,4.4,6.8,-6.6,'#e8505b',0)+E(5,3.4,5,-4.4,'#c73a46',25)+C(2.2,'#8a1c2b'); break;
    case 'tulip': b='<path d="M0 14Q-6 10 -7 5Q-1 7 0 14Z" fill="#6cc46a"/>'+L('M0 8V15','#43a24d',2)+'<path d="M-8 -9Q-9 3 0 8Q9 3 8 -9L4 -3L0 -11L-4 -3Z" fill="#ff7fa8"/>'; break;
    case 'sunflower': b=E(16,1.9,6,-9.6,'#ffc83d',0)+E(14,1.8,5.2,-8.6,'#f4a712',11)+C(5.2,'#6b3f1c')+C(3,'#3d2310'); break;
    case 'daisy': b=E(12,2.2,6.4,-9.2,'#ffffff',0)+C(3.4,'#ffc21a'); break;
    case 'sakura': b=E(5,4.6,6.2,-6.4,'#ffb3c8',0)+C(1.8,'#ff7fa8')+C(.8,'#ffdf70',2.5,-2)+C(.8,'#ffdf70',-2.5,-2)+C(.8,'#ffdf70',0,2.8); break;
    case 'sampaguita': b=E(8,2.6,6,-6.8,'#ffffff',0)+E(7,2.2,5,-5.6,'#fffaf0',20)+C(1.8,'#ffe58a'); break;
    case 'lily': b=E(3,3.2,7.5,-7.5,'#ffb08f',0)+E(3,2.8,6.5,-6.5,'#ff8e68',60)+L('M0 0L-3 -6','#8a4a1c',1)+L('M0 0L3 -6','#8a4a1c',1)+L('M0 0V-7','#8a4a1c',1)+C(1.2,'#7a3b12',0,-7)+C(1.2,'#7a3b12',-3,-6)+C(1.2,'#7a3b12',3,-6); break;
    case 'hibiscus': b=E(5,5.6,6.5,-6,'#ff4d6d',0)+C(2.4,'#9d0208')+L('M0 0L3 -10','#ffd166',2)+C(1.8,'#ffd166',3,-10)+C(1,'#ff9e00',4.6,-11.2)+C(1,'#ff9e00',1.6,-11.6); break;
    default: { b=L('M0 15V-13','#43a24d',1.6); for(let i=0;i<6;i++){const y=-9+i*4.2; b+='<ellipse cx="-2.6" cy="'+y+'" rx="2.5" ry="1.7" fill="#a98bff" transform="rotate(-30 -2.6 '+y+')"/><ellipse cx="2.6" cy="'+y+'" rx="2.5" ry="1.7" fill="#b89dff" transform="rotate(30 2.6 '+y+')"/>';} b+=C(1.8,'#a98bff',0,-12.5); }
  }
  return '<svg viewBox="-16 -16 32 32" stroke="rgba(45,34,51,.28)" stroke-width=".7" aria-hidden="true">'+b+'</svg>';
}

const FLOWERS=[
 {id:'rose',name:'Rose'},{id:'tulip',name:'Tulip'},{id:'sunflower',name:'Sunflower'},
 {id:'daisy',name:'Daisy'},{id:'sakura',name:'Sakura'},{id:'sampaguita',name:'Sampaguita'},
 {id:'lily',name:'Lily'},{id:'hibiscus',name:'Hibiscus'},{id:'lavender',name:'Lavender'}];
const COLORS=[
 {id:'red',name:'Rose red',hex:'#e63946'},{id:'pink',name:'Pink',hex:'#ff7fa8'},{id:'sun',name:'Sunny',hex:'#ffc83d'},
 {id:'peach',name:'Peach',hex:'#ff9e7a'},{id:'lav',name:'Lavender',hex:'#a98bff'},{id:'sky',name:'Sky',hex:'#6cc0ff'},{id:'white',name:'White',hex:'#fffaf5'}];
const WRAPS=[
 {id:'kraft',name:'Kraft',hex:'#e6c295'},{id:'blush',name:'Blush',hex:'#ffc9d8'},{id:'cream',name:'Cream',hex:'#fff1de'},
 {id:'lav',name:'Lilac',hex:'#cdbcff'},{id:'mint',name:'Mint',hex:'#bdecd2'},{id:'sky',name:'Sky',hex:'#bfe2ff'},{id:'ink',name:'Charcoal',hex:'#3b3341'}];
const RIBBONS=[
 {id:'red',name:'Red',hex:'#e8323f'},{id:'pink',name:'Pink',hex:'#ff7fa8'},{id:'gold',name:'Gold',hex:'#e8b84a'},
 {id:'lav',name:'Violet',hex:'#a98bff'},{id:'sky',name:'Sky',hex:'#6cc0ff'},{id:'white',name:'White',hex:'#fffaf5'},{id:'ink',name:'Black',hex:'#3b3341'}];
const RSTYLES=[{id:'bow',label:'Bow'},{id:'band',label:'Band'},{id:'streamers',label:'Curls'},{id:'none',label:'None'}];
const MODES=[{id:'single',label:'One',icon:'one'},{id:'bouquet',label:'Bouquet',icon:'bouquet'}];
const BOUQUET_LAYOUTS=[
 {id:'round',label:'Round',note:'Timeless & elegant',preview:[[24,6],[15,11],[24,11],[33,11],[15,20],[24,20],[33,20],[24,27]]},
 {id:'pageant',label:'Pageant',note:'Sleek & modern',preview:[[22,4],[31,8],[15,12],[26,12],[37,12],[18,18],[27,18],[35,18],[24,25]]},
 {id:'pomander',label:'Pomander',note:'Round & classic',preview:[[24,8],[17,15],[26,15],[35,15],[24,22],[18,24],[31,24],[24,30]]},
 {id:'posy',label:'Posy',note:'Sweet & sophisticated',preview:[[21,6],[29,7],[15,13],[24,12],[33,13],[18,20],[28,20],[24,25]]}
];
const GARDEN_LAYOUTS=[
 {id:'wild',label:'Wild meadow',note:'Natural scatter',preview:[[10,8],[23,5],[36,9],[16,18],[29,15],[39,23]]},
 {id:'rows',label:'Neat rows',note:'A tidy little plot',preview:[[11,7],[24,7],[37,7],[11,17],[24,17],[37,17],[11,27],[24,27],[37,27]]},
 {id:'border',label:'Circular border',note:'A ring of blooms',preview:[[24,4],[33,7],[39,15],[36,24],[26,28],[15,25],[9,16],[14,7],[24,16]]}
];
const EXTRAS=[{k:'bf',label:'Butterflies'},{k:'sp',label:'Sparkles'}];
const OCCASIONS=[
 {i:'cake',n:'Birthday',msg:'Happy birthday! I wanted to give you something that blooms, just like you do. I hope this year is soft, bright, and full of everything you wish for.'},
 {i:'rings',n:'Anniversary',msg:'Every day with you feels like a garden I get to walk through. Thank you for growing with me. Happy anniversary.'},
 {i:'sad',n:'Sorry',msg:"I'm really sorry. I didn't have the right words, so I picked a flower instead. I'd love the chance to make it right."},
 {i:'star',n:'Thank you',msg:'Thank you for everything you did. It meant more than you know, so here is a little flower to say it.'},
 {i:'sun',n:'Just because',msg:'No reason at all. I just thought of you and wanted you to smile today.'}];
/* original little melodies (MIDI notes, null = rest) so there are no copyright worries */
const TRACKS={
 musicbox:{name:'Music box',icon:'music',bpm:100,wave:'triangle',notes:[72,76,79,84,79,76,74,77,81,86,81,77,71,74,79,83,79,74,72,76,79,84,null,null]},
 sunrise:{name:'Sunrise',icon:'sunrise',bpm:80,wave:'sine',notes:[67,null,71,74,76,null,74,71,69,null,72,76,79,null,76,72,65,null,69,72,74,null,72,69,67,71,74,79,74,71,67,null]},
 moonlight:{name:'Moonlight',icon:'moon',bpm:60,wave:'triangle',notes:[57,64,69,72,76,72,69,64,55,62,67,71,74,71,67,62,53,60,65,69,72,69,65,60,52,59,64,68,71,68,64,null]}};

const DEFAULT={t:'rose',c:'red',c2:'',m:'single',bt:'round',gt:'wild',wc:'kraft',rc:'red',rs:'bow',bf:1,sp:1,bc:['#ffd166','#9be3ff','#ffa8d1','#c7a8ff'],oc:'',to:'',fr:'',msg:'',mu:'musicbox',ml:''};
let state={...DEFAULT,bc:DEFAULT.bc.slice()};
let receiving=false, preview=false, customOpen=false;

const hexOf=()=>(COLORS.find(c=>c.id===state.c)||COLORS[0]).hex;
const hex2Of=()=>{const c=COLORS.find(c=>c.id===state.c2); return c&&c.id!==state.c?c.hex:null;};
const accentOf=()=>state.c==='white'?'#ff9fb7':hexOf();
const wrapHex=()=>(WRAPS.find(w=>w.id===state.wc)||WRAPS[0]).hex;
const ribHex=()=>(RIBBONS.find(r=>r.id===state.rc)||RIBBONS[0]).hex;
const lighten=(hex,a)=>{const c=new THREE.Color(hex);c.lerp(new THREE.Color('#ffffff'),a);return '#'+c.getHexString();};
const darken=(hex,a)=>{const c=new THREE.Color(hex);c.lerp(new THREE.Color('#3a1020'),a);return '#'+c.getHexString();};
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

function sanitize(o){
  const s={...DEFAULT,bc:DEFAULT.bc.slice()}; if(!o||typeof o!=='object') return s;
  if(FLOWERS.some(f=>f.id===o.t)) s.t=o.t;
  if(COLORS.some(c=>c.id===o.c)) s.c=o.c;
  if(o.c===MIX) s.c2='sky'; /* older links used a rainbow mix */
  if(COLORS.some(c=>c.id===o.c2)) s.c2=o.c2;
  if(MODES.some(m=>m.id===o.m)) s.m=o.m;
  if(BOUQUET_LAYOUTS.some(layout=>layout.id===o.bt)) s.bt=o.bt;
  if(GARDEN_LAYOUTS.some(layout=>layout.id===o.gt)) s.gt=o.gt;
  if(Array.isArray(o.bc)) s.bc=DEFAULT.bc.map((color,i)=>/^#[0-9a-f]{6}$/i.test(o.bc[i]||'')?o.bc[i]:color);
  if(WRAPS.some(w=>w.id===o.wc)) s.wc=o.wc;
  if(RIBBONS.some(r=>r.id===o.rc)) s.rc=o.rc;
  if(RSTYLES.some(r=>r.id===o.rs)) s.rs=o.rs;
  ['bf','sp'].forEach(k=>{s[k]=o[k]===0?0:1;});
  s.to=String(o.to||'').slice(0,40); s.fr=String(o.fr||'').slice(0,40); s.msg=String(o.msg||'').slice(0,500); s.oc=String(o.oc||'').slice(0,30);
  s.mu=(o.mu==='none'||TRACKS[o.mu])?o.mu:'musicbox'; s.ml=String(o.ml||'').slice(0,200);
  return s;
}
/* the whole card lives inside the link, so no server or account is needed */
const enc=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const dec=h=>{try{h=h.replace(/-/g,'+').replace(/_/g,'/');while(h.length%4)h+='=';return JSON.parse(decodeURIComponent(escape(atob(h))));}catch(e){return null;}};
const makeLink=()=>location.href.split('#')[0]+'#c='+enc(state);
function embedFor(url){
  url=(url||'').trim(); if(!url) return null; let m;
  if((m=url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]{10,30})/))) return {uri:'spotify:'+m[1]+':'+m[2],src:'https://open.spotify.com/embed/'+m[1]+'/'+m[2],h:152};
  return null;
}
let spotifyApiPromise=null, spotifyController=null, spotifyEmbedReady=false, spotifyPlayRequested=false;
function loadSpotifyIframeApi(){
  if(!spotifyApiPromise) spotifyApiPromise=new Promise((resolve,reject)=>{
    window.onSpotifyIframeApiReady=resolve;
    const script=document.createElement('script');
    script.src='https://open.spotify.com/embed/iframe-api/v1';
    script.async=true;
    script.onerror=()=>reject(new Error('Spotify Embed API failed to load.'));
    document.head.appendChild(script);
  });
  return spotifyApiPromise;
}
function requestSpotifyPlayback(){
  spotifyPlayRequested=true;
  if(!spotifyController||!spotifyEmbedReady) return;
  try{spotifyController.play();}
  catch(error){console.error('Spotify playback could not be started.',error);}
}
function mountSpotifyEmbed(box,embed){
  const target=document.createElement('div'); box.appendChild(target);
  loadSpotifyIframeApi().then(api=>{
    if(!target.isConnected) return;
    api.createController(target,{uri:embed.uri,width:'100%',height:embed.h},controller=>{
      if(!target.isConnected){controller.destroy();return;}
      spotifyController=controller;
      controller.addListener('ready',()=>{
        spotifyEmbedReady=true;
        if(spotifyPlayRequested) requestSpotifyPlayback();
      });
    });
  }).catch(error=>{
    console.error('Spotify Embed API failed to initialize.',error);
    if(!target.isConnected) return;
    const frame=document.createElement('iframe');
    frame.src=embed.src; frame.height=embed.h; frame.allow='autoplay; encrypted-media; clipboard-write';
    frame.loading='lazy'; frame.referrerPolicy='strict-origin-when-cross-origin';
    target.replaceWith(frame);
  });
}
const save=()=>{try{localStorage.setItem('petalpost-draft',JSON.stringify(state));}catch(e){}};
let toastT; function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2200);}

/* ============ audio (tiny synth) ============ */
const audio={ctx:null,master:null,timer:null,step:0,track:null,muted:false};
const midi=n=>440*Math.pow(2,(n-69)/12);
function ensureAudio(){
  if(audio.ctx) return audio.ctx;
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return null;
  const ctx=new AC(), master=ctx.createGain(); master.gain.value=0;
  const delay=ctx.createDelay(1); delay.delayTime.value=.32;
  const fb=ctx.createGain(); fb.gain.value=.34; const wet=ctx.createGain(); wet.gain.value=.45;
  master.connect(ctx.destination); master.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(ctx.destination);
  audio.ctx=ctx; audio.master=master; return ctx;
}
function playNote(note,vel){
  const ctx=audio.ctx, now=ctx.currentTime, f=midi(note);
  const o1=ctx.createOscillator(), o2=ctx.createOscillator(), g=ctx.createGain(), g2=ctx.createGain();
  o1.type=audio.track.wave; o2.type='sine'; o1.frequency.value=f; o2.frequency.value=f*2; g2.gain.value=.25;
  g.gain.setValueAtTime(0,now); g.gain.linearRampToValueAtTime(.22*vel,now+.012); g.gain.exponentialRampToValueAtTime(.0008,now+1.8);
  o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(audio.master);
  o1.start(now); o2.start(now); o1.stop(now+1.9); o2.stop(now+1.9);
}
function startMusic(id){
  stopMusic(true); const tr=TRACKS[id]; if(!tr) return;
  const ctx=ensureAudio(); if(!ctx) return; if(ctx.state==='suspended') ctx.resume();
  audio.track=tr; audio.step=0;
  audio.master.gain.cancelScheduledValues(ctx.currentTime); audio.master.gain.setTargetAtTime(audio.muted?0:.9,ctx.currentTime,.3);
  const tick=()=>{const n=tr.notes[audio.step%tr.notes.length]; if(n){playNote(n,audio.step%4===0?1:.75); if(audio.step%3===0) emitNote();} audio.step++;};
  tick(); audio.timer=setInterval(tick,60000/tr.bpm/2); setNowPlaying(tr.name);
}
/* floating music notes + "now playing" pill while a built-in tune plays */
function emitNote(){
  if(reduce||audio.muted) return;
  const n=document.createElement('span'); n.className='note'; n.innerHTML=IC[Math.random()<.5?'music':'note'];
  const w=stage.clientWidth, h=stage.clientHeight;
  n.style.left=(w*.5+(Math.random()-.5)*w*.34)+'px'; n.style.top=(h*.42+(Math.random()-.5)*h*.12)+'px';
  n.style.setProperty('--dx',((Math.random()-.5)*90)+'px'); n.style.setProperty('--rot',((Math.random()-.5)*50)+'deg');
  $('#notes').appendChild(n); n.addEventListener('animationend',()=>n.remove());
}
function setNowPlaying(name){const p=$('#nowp'); p.classList.toggle('show',!!name); if(name) $('#nowpName').textContent=name;}
function stopMusic(quick){
  setNowPlaying('');
  if(audio.timer){clearInterval(audio.timer);audio.timer=null;}
  if(audio.ctx&&audio.master) audio.master.gain.setTargetAtTime(0,audio.ctx.currentTime,quick?.02:.25);
}
function setMuted(m){audio.muted=m; if(audio.ctx&&audio.timer) audio.master.gain.setTargetAtTime(m?0:.9,audio.ctx.currentTime,.1);}

/* ============ 3D scene ============ */
const stage=$('#stage'), canvas=$('#gl');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(38,1,.1,100);
scene.add(new THREE.HemisphereLight(0xffffff,0xffd9e3,.62));
const sun=new THREE.DirectionalLight(0xffffff,.62); sun.position.set(3,6,5); scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff,.2));
const world=new THREE.Group(); scene.add(world);

const matCache=new Map();
function mat(hex,opts){
  opts=opts||{}; const k=hex+JSON.stringify(opts); let m=matCache.get(k);
  if(!m){m=new THREE.MeshStandardMaterial(Object.assign({color:new THREE.Color(hex),emissive:new THREE.Color(hex),emissiveIntensity:.14,roughness:.55,metalness:0,side:THREE.DoubleSide},opts));matCache.set(k,m);}
  return m;
}
const geoCache=new Map();
function petalGeo(len,wid,th,taper,seg){
  const key=[len,wid,th,taper,seg].join('|'); let g=geoCache.get(key); if(g) return g;
  g=new THREE.SphereGeometry(1,seg,Math.max(6,seg-2)); g.scale(wid,len/2,th); g.translate(0,len/2,0);
  if(taper){const p=g.attributes.position; for(let i=0;i<p.count;i++){const t=p.getY(i)/len; p.setX(i,p.getX(i)*(1-taper*Math.max(0,t)));} p.needsUpdate=true; g.computeVertexNormals();}
  geoCache.set(key,g); return g;
}
const leafGeo=(()=>{const g=new THREE.SphereGeometry(1,10,6); g.scale(.34,.035,.13); g.translate(.34,0,0); return g;})();
const unitSphere=new THREE.SphereGeometry(1,8,6);
const own=m=>{m.userData.own=true;return m;};

function makeHead(type,hex,lod,hex2){
  const head=new THREE.Group(), petals=[], seg=lod?8:14; let bl=null, ri=0;
  const add=(angle,len,wid,th,taper,open,closed,color,yOff)=>{
    const pivot=new THREE.Group(); pivot.rotation.y=angle; pivot.position.y=yOff||0;
    const m=new THREE.Mesh(petalGeo(len,wid,th,taper,seg),mat(color)); m.rotation.z=-closed;
    pivot.add(m); head.add(pivot); petals.push({m,open,closed});
  };
  const ring=(n,len,wid,th,taper,open,closed,color,off,yOff,fixed)=>{
    const idx=ri++; if(hex2&&!fixed&&idx%2===1) color=lighten(hex2,idx>2?.08:0); /* every other petal layer takes the second color */
    n=lod?Math.max(3,Math.round(n*.65)):n;
    for(let i=0;i<n;i++) add(i/n*Math.PI*2+(off||0),len,wid,th,taper,open,closed,color,yOff);
  };
  const ball=(r,color,sy,x,y,z)=>{const s=own(new THREE.Mesh(new THREE.SphereGeometry(r,seg,seg),mat(color))); s.scale.y=sy||1; s.position.set(x||0,y||0,z||0); head.add(s); return s;};
  if(type!=='lavender') ball(.13,'#3f9a48',.7,0,-.03,0); /* green calyx under the flower */
  switch(type){
    case 'rose':
      ring(5,.44,.30,.07,0,.18,.02,darken(hex,.18),0);
      ring(6,.56,.34,.07,0,.42,.08,darken(hex,.08),.5);
      ring(7,.68,.38,.07,0,.72,.16,hex,.2);
      ring(8,.78,.42,.065,0,1.0,.24,lighten(hex,.08),.1,-.02); break;
    case 'tulip':
      ring(3,.85,.32,.09,0,.28,.02,hex,0);
      ring(3,.85,.32,.09,0,.38,.03,lighten(hex,.08),Math.PI/3); break;
    case 'sunflower':
      ring(22,.6,.12,.025,.55,1.4,.15,hex,0);
      ring(22,.55,.11,.025,.55,1.28,.1,darken(hex,.1),.14,-.01);
      ball(.34,'#4a2c12',.45,0,.03); ball(.22,'#2b170a',.5,0,.07); break;
    case 'daisy':
      ring(18,.62,.09,.025,.35,1.42,.1,hex,0);
      ring(14,.55,.09,.025,.35,1.3,.1,lighten(hex,.1),.2);
      ball(.17,'#ffc21a',.7,0,.04); break;
    case 'sakura':
      ring(5,.62,.3,.03,0,1.15,.15,hex,0);
      ring(5,.5,.26,.03,0,.95,.12,lighten(hex,.12),Math.PI/5);
      ball(.07,'#ffd0dc',1,0,.02);
      for(let i=0;i<8;i++){const a=i/8*Math.PI*2; ball(.024,'#ffdf70',1,Math.cos(a)*.13,.1,Math.sin(a)*.13);} break;
    case 'sampaguita':
      ring(8,.45,.1,.03,.3,1.1,.12,hex,0);
      ring(7,.4,.1,.03,.3,.95,.1,lighten(hex,.05),.2);
      ball(.06,'#fff3b0',1,0,.03); break;
    case 'lily': {
      ring(3,.95,.27,.05,.75,1.12,.12,hex,0);
      ring(3,.9,.26,.05,.75,1.0,.1,lighten(hex,.12),Math.PI/3,-.01);
      ball(.09,darken(hex,.35),.8,0,.03);
      const ns=lod?3:6;
      for(let i=0;i<ns;i++){
        const a=i/ns*Math.PI*2, pv=new THREE.Group(); pv.rotation.y=a;
        const sg=new THREE.CylinderGeometry(.012,.012,.55,5); sg.translate(0,.275,0);
        const st=own(new THREE.Mesh(sg,mat('#e9d9a0'))); st.rotation.z=-.22; pv.add(st);
        const an=own(new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),mat('#8a3f12'))); an.scale.set(1,1.5,1);
        an.position.set(Math.sin(.22)*.55,Math.cos(.22)*.55,0); pv.add(an); head.add(pv);
      }
      break; }
    case 'hibiscus': {
      ring(5,.8,.5,.035,.1,1.3,.1,hex,0);
      ring(5,.42,.24,.03,0,1.34,.1,darken(hex2||hex,hex2?.25:.4),Math.PI/5,.012,true);
      const cg=new THREE.CylinderGeometry(.022,.022,.9,6); cg.translate(0,.45,0);
      const col=own(new THREE.Mesh(cg,mat('#ffd166'))); col.rotation.z=-.3; head.add(col);
      const tx=Math.sin(.3)*.9, ty=Math.cos(.3)*.9;
      for(let i=0;i<6;i++){
        const a=i/6*Math.PI*2, b=own(new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),mat(i%2?'#ffb703':'#ffd166')));
        b.position.set(tx+Math.cos(a)*.07,ty-.04-Math.abs(Math.sin(a))*.05,Math.sin(a)*.07); head.add(b);
      }
      const stg=own(new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),mat('#d00000'))); stg.position.set(tx,ty+.06,0); head.add(stg);
      break; }
    default: { /* lavender: a spike of tiny florets */
      const rg=new THREE.CylinderGeometry(.012,.02,1.0,5); rg.translate(0,.5,0);
      head.add(own(new THREE.Mesh(rg,mat('#5e8f55'))));
      const N=lod?20:34, fl=[];
      for(let i=0;i<N;i++){
        const t=i/(N-1), a=i*2.4, r=.045+.05*(1-t), s0=.07*(1-.3*t);
        const pv=new THREE.Group(); pv.position.y=.06+t*.9; pv.rotation.y=a;
        const m=new THREE.Mesh(unitSphere,mat(hex2?(i%2?hex:hex2):(i%3===0?lighten(hex,.22):hex))); m.position.x=r; m.rotation.z=-.5;
        const sx=s0*.62, sy=s0*1.35; m.scale.set(sx,sy,sx); pv.add(m); head.add(pv); fl.push({m,t,sx,sy});
      }
      bl=e=>{for(const f of fl){const k=clamp((e*1.5-f.t*.6)/.9); f.m.scale.set(f.sx*k,f.sy*k,f.sx*k);}};
    }
  }
  return {head,petals,bl};
}

const flowers=[], fliers=[]; let sparkles=null;
function clearWorld(){
  flowers.length=0; fliers.length=0; sparkles=null;
  for(let i=world.children.length-1;i>=0;i--){const ch=world.children[i]; world.remove(ch); ch.traverse(o=>{if(o.userData&&o.userData.own&&o.geometry) o.geometry.dispose();});}
}
function stemBetween(a,b,r,color){
  const d=b.clone().sub(a), len=d.length();
  const m=own(new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,4),mat(color,{emissiveIntensity:.05})));
  m.position.copy(a).add(b).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()); return m;
}
function addFlower(o){
  const g=new THREE.Group(); g.position.copy(o.base);
  const local=o.tip.clone().sub(o.base), len=local.length();
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),local.clone().normalize());
  const stem=own(new THREE.Mesh(new THREE.CylinderGeometry(.03,.045,len,6),mat('#43a24d')));
  stem.position.copy(local).multiplyScalar(.5); stem.quaternion.copy(q); g.add(stem);
  const {head,petals,bl}=makeHead(o.type,o.hex,o.lod,o.hex2);
  head.position.copy(local); head.quaternion.copy(q);
  if(o.yaw) head.rotateY(o.yaw); if(o.tilt&&o.type!=='lavender') head.rotateX(o.tilt);
  g.add(head);
  if(o.leaves){
    [[.28,1],[.5,-1]].forEach(([f,side])=>{
      const piv=new THREE.Group(); piv.position.copy(local).multiplyScalar(f); piv.quaternion.copy(q);
      const lf=new THREE.Mesh(leafGeo,mat('#4aab55')); lf.rotation.set(0,side>0?0:Math.PI,.65); lf.scale.setScalar(1.3);
      piv.add(lf); g.add(piv);
    });
  }
  world.add(g); flowers.push({g,head,petals,bl,size:o.size||1,delay:o.delay||0,phase:Math.random()*6.28});
  return g;
}
/* ribbon: optional band + bow or curly streamers, hanging toward -y from the knot */
function makeRibbon(style,color,o){
  const g=new THREE.Group(); if(style==='none') return g;
  const m=mat(color,{roughness:.35,emissiveIntensity:.1});
  if(o.band){const b=o.band; g.add(own(new THREE.Mesh(new THREE.CylinderGeometry(b[0],b[1],b[2],48,1,true),m)));}
  if(style==='band') return g;
  const bow=new THREE.Group(); bow.position.set(0,0,o.z); bow.scale.setScalar(o.scale); bow.rotation.x=o.lean||.15;
  bow.add(own(new THREE.Mesh(new THREE.SphereGeometry(.075,14,10),m)));
  if(style==='bow'){
    [-1,1].forEach(s=>{
      const lp=own(new THREE.Mesh(new THREE.TorusGeometry(.13,.04,8,22),m)); lp.position.set(s*.17,.035,0); lp.rotation.z=s*.35; lp.scale.set(1.25,.85,1); bow.add(lp);
      const tg=new THREE.BoxGeometry(.085,.46,.014); tg.translate(0,-.23,0);
      const tl=own(new THREE.Mesh(tg,m)); tl.position.set(s*.03,-.03,.01); tl.rotation.z=s*.3; bow.add(tl);
    });
  } else {
    for(let k=0;k<3;k++){
      const dir=k-1, pts=[];
      for(let i=0;i<9;i++) pts.push(new THREE.Vector3(dir*(.02+i*.05)+Math.sin(i*1.2+k*2)*.06,-i*.1,Math.sin(i*.9+k)*.05));
      bow.add(own(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),28,.016,5,false),m)));
    }
  }
  g.add(bow); return g;
}
function makeButterfly(color){
  const g=new THREE.Group(), upper=mat(color,{emissiveIntensity:.25}).clone(), lower=mat(lighten(color,.16),{emissiveIntensity:.25}).clone();
  const wingShape=isLower=>{
    const shape=new THREE.Shape();
    shape.moveTo(0,0);
    if(isLower){
      shape.bezierCurveTo(.04,-.07,.1,-.19,.21,-.19);
      shape.bezierCurveTo(.31,-.18,.31,-.08,.24,-.025);
      shape.bezierCurveTo(.16,.015,.08,.015,0,0);
    }else{
      shape.bezierCurveTo(.04,.15,.13,.34,.29,.31);
      shape.bezierCurveTo(.4,.28,.39,.12,.27,.045);
      shape.bezierCurveTo(.18,-.005,.08,-.025,0,0);
    }
    return new THREE.ShapeGeometry(shape,12);
  };
  const wing=dir=>{
    const pivot=new THREE.Group();
    [false,true].forEach(isLower=>{
      const geo=wingShape(isLower); geo.scale(dir,1,1);
      pivot.add(own(new THREE.Mesh(geo,isLower?lower:upper)));
    });
    g.add(pivot); return pivot;
  };
  const body=own(new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.2,6),mat('#3a2a3a'))); g.add(body);
  g.userData.colorMats=[upper,lower];
  g.userData.colorTween=null;
  g.userData.l=wing(-1); g.userData.r=wing(1); return g;
}
function transitionButterflyColor(index,color){
  const butterfly=fliers[index]&&fliers[index].g;
  if(!butterfly) return;
  const colors=butterfly.userData.colorMats;
  butterfly.userData.colorTween={
    from:colors.map(m=>({color:m.color.clone(),emissive:m.emissive.clone()})),
    to:[color,lighten(color,.16)].map(hex=>({color:new THREE.Color(hex),emissive:new THREE.Color(hex)})),
    start:performance.now()
  };
}
function build(){
  clearWorld();
  const R=rng(11), type=state.t, mode=state.m, V=(x,y,z)=>new THREE.Vector3(x,y,z);
  const c1=hexOf(), c2=hex2Of(), colorAt=i=>c2?(i%2?c2:c1):c1; /* bouquet and garden alternate colors flower by flower */
  if(mode==='single'){
    const sh=own(new THREE.Mesh(new THREE.CircleGeometry(1.1,32),new THREE.MeshBasicMaterial({color:'#a05070',transparent:true,opacity:.1})));
    sh.rotation.x=-Math.PI/2; sh.position.y=-1.34; world.add(sh);
    addFlower({type,hex:c1,hex2:c2,base:V(0,-1.35,0),tip:V(0,.85,0),size:1,leaves:true,tilt:.4}); /* a single flower is two-tone */
    const rb=makeRibbon(state.rs,ribHex(),{band:[.062,.062,.13],z:.06,scale:.7,lean:.1});
    rb.position.set(0,.95,0); flowers[flowers.length-1].g.add(rb);
  } else if(mode==='bouquet'){
    const B=V(0,-1.5,0), heads=[];
    const bouquetStyle = (() => {
      switch (state.bt) {
        case 'round':
          return {counts:[1,6,8], radii:[0,.65,1.1], heights:[1.12,.84,.5], drift:.15, offset:0};
        case 'hand-tied':
          return {counts:[1,6,8], radii:[0,.7,1.2], heights:[1.08,.86,.52], drift:.8, offset:.3};
        case 'cascade':
          return {counts:[1,6,7], radii:[0,.5,1.15], heights:[1.4,.94,.42], drift:.3, offset:.15};
        case 'oversized':
          return {counts:[1,8,10], radii:[0,.75,1.3], heights:[1.2,.9,.54], drift:.2, offset:.12};
        case 'pageant':
          return {counts:[1,6,8], radii:[0,.42,1.08], heights:[1.55,.96,.46], drift:.3, offset:.18};
        case 'pomander':
          return {counts:[1,8,8], radii:[0,.82,1.0], heights:[.96,.82,.58], drift:.7, offset:.22};
        case 'posy':
          return {counts:[1,6,6], radii:[0,.52,.95], heights:[1.0,.74,.4], drift:.15, offset:.1};
        case 'nosegay':
        default:
          return {counts:[1,7,7], radii:[0,.55,.96], heights:[1.04,.78,.42], drift:.12, offset:.12};
      }
    })();

    bouquetStyle.counts.forEach((count,layer)=>{
      for(let k=0;k<count;k++){
        const a = count===1 ? 0 : k/count*Math.PI*2 + bouquetStyle.offset + (state.bt==='hand-tied'||state.bt==='pomander' ? R()*.8 : 0);
        const radius = bouquetStyle.radii[layer] + ((state.bt==='hand-tied'||state.bt==='pomander') && layer ? R()*.25 : 0);
        const shiftX = state.bt==='cascade' && layer>0 ? Math.cos(a)*.8 : 0;
        const shiftZ = state.bt==='cascade' && layer>0 ? Math.sin(a)*.65 : 0;
        heads.push([
          Math.cos(a)*radius + shiftX,
          bouquetStyle.heights[layer] + (state.bt==='hand-tied'||state.bt==='pomander' ? (R()-.5)*.2 : 0),
          Math.sin(a)*radius + shiftZ,
          layer===0 ? .85 : layer===1 ? .7 : .62
        ]);
      }
    });
    heads.forEach((h,i)=>addFlower({type,hex:colorAt(i),base:B,tip:V(h[0],h[1],h[2]),size:h[3],yaw:R()*6.28,delay:i*.034}));
    const wh=wrapHex(), cg=new THREE.ConeGeometry(1.15,1.9,40,1,true);
    const outer=own(new THREE.Mesh(cg,mat(wh,{side:THREE.FrontSide,roughness:.9,emissiveIntensity:.05})));
    const inner=new THREE.Mesh(cg,mat(lighten(wh,.35),{side:THREE.BackSide,roughness:.9,emissiveIntensity:.08}));
    [outer,inner].forEach(c=>{c.rotation.x=Math.PI; c.position.set(0,-.75,0); world.add(c);});
    const rim=own(new THREE.Mesh(new THREE.TorusGeometry(1.15,.03,8,48),mat(lighten(wh,.2)))); rim.rotation.x=Math.PI/2; rim.position.y=.2; world.add(rim);
    for(let i=0;i<16;i++){const a=i/16*Math.PI*2; world.add(stemBetween(V(0,-1.7,0),V(Math.cos(a)*1.165,.2,Math.sin(a)*1.165),.009,darken(wh,.12)));}
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2+.2; const lf=new THREE.Mesh(leafGeo,mat('#4aab55')); lf.position.set(Math.cos(a)*.95,.05,Math.sin(a)*.95); lf.rotation.set(0,-a,.9); lf.scale.setScalar(1.3); world.add(lf);}
    const rb=makeRibbon(state.rs,ribHex(),{band:[.535,.438,.16],z:.5,scale:1.1,lean:.2}); rb.position.set(0,-.9,0); world.add(rb);
  } else {
    const ground=own(new THREE.Mesh(new THREE.CircleGeometry(6.2,56),mat('#8fd07a',{roughness:1,emissiveIntensity:.08})));
    ground.rotation.x=-Math.PI/2; ground.position.y=-1.35; world.add(ground);
    const gg=new THREE.ConeGeometry(.04,.5,4); gg.translate(0,.25,0);
    const grass=own(new THREE.InstancedMesh(gg,mat('#6fc06a'),380)), d=new THREE.Object3D();
    for(let i=0;i<380;i++){const a=R()*6.28, r=Math.sqrt(R())*6; d.position.set(Math.cos(a)*r,-1.35,Math.sin(a)*r); d.scale.set(1,.6+R()*1.2,1); d.rotation.set((R()-.5)*.3,R()*6,(R()-.5)*.3); d.updateMatrix(); grass.setMatrixAt(i,d.matrix);}
    world.add(grass);
    const pts=[]; let tries=0, n=0;
    if(state.gt==='wild'){
      while(n<26&&tries++<500){
        const a=R()*6.28, r=Math.sqrt(R())*4.9, x=Math.cos(a)*r, z=Math.sin(a)*r;
        if(pts.every(p=>(p.x-x)**2+(p.z-z)**2>1.0)){pts.push({x,z});n++;}
      }
    }else{
      for(;n<26;n++){
        let x,z;
        if(state.gt==='rows'){
          const cols=6, row=Math.floor(n/cols), col=n%cols, rowCount=Math.min(cols,26-row*cols);
          x=(col-(rowCount-1)/2)*1.35+(R()-.5)*.18; z=(row-2)*1.35+(R()-.5)*.18;
        }else if(state.gt==='clusters'){
          const centers=[[-2.5,-1.8],[0,-2.5],[2.5,-1.8],[-1.8,1.7],[1.8,1.7]], center=centers[n%centers.length], a=R()*6.28, r=Math.sqrt(R())*1.1;
          x=center[0]+Math.cos(a)*r; z=center[1]+Math.sin(a)*r;
        }else{
          const a=n/26*6.28+(R()-.5)*.08, r=n%2?4.3:3.55;
          x=Math.cos(a)*r; z=Math.sin(a)*r;
        }
        pts.push({x,z});
      }
    }
    pts.forEach(({x,z},i)=>{
      const h=1+R()*1.1;
      addFlower({type,hex:colorAt(i),base:V(x,-1.35,z),tip:V(x+(R()-.5)*.3,-1.35+h,z+(R()-.5)*.3),size:.5+R()*.18,lod:true,tilt:.25,yaw:R()*6.28,delay:R()*.45});
    });
  }
  if(state.bf){
    for(let i=0;i<state.bc.length;i++){
      const b=makeButterfly(state.bc[i]); world.add(b);
      fliers.push({g:b,R:1.55+i*.22,h:.45+i*.2,sp:.35+R()*.25,ph:i*Math.PI*.5+R()*.35});
    }
  }
  if(state.sp){
    const sp=new THREE.BufferGeometry(), N=70, arr=new Float32Array(N*3);
    for(let i=0;i<N;i++){arr[i*3]=(R()-.5)*(mode==='garden'?11:5); arr[i*3+1]=-1+R()*4; arr[i*3+2]=(R()-.5)*(mode==='garden'?11:5);}
    sp.setAttribute('position',new THREE.BufferAttribute(arr,3));
    sparkles=own(new THREE.Points(sp,new THREE.PointsMaterial({size:.08,color:'#ffcf5a',transparent:true,opacity:.85,depthWrite:false})));
    world.add(sparkles);
  }
}

const easeOutBack=x=>{const c1=1.3,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2);};
function setBloom(t){
  for(const f of flowers){
    const lt=clamp((t-f.delay)/.55), e=easeOutBack(lt);
    f.head.scale.setScalar(Math.max(.001,(.2+.8*clamp(e,0,1.05))*f.size));
    for(const p of f.petals) p.m.rotation.z=-(p.closed+(p.open-p.closed)*e);
    if(f.bl) f.bl(e);
  }
}
let animating=false, animStart=0, animDur=1, onBloom=null;
function playBloom(dur,cb){animStart=performance.now();animDur=reduce?1:dur;animating=true;onBloom=cb||null;setBloom(0);}
function rebuild(quiet){build(); if(quiet){animating=false;setBloom(1);} else playBloom(850);}

/* camera + interaction */
const PRESETS={single:{p:[0,.7,6.2],l:[0,-.2,0]},bouquet:{p:[0,1.1,7.8],l:[0,-.35,0]},garden:{p:[0,4.6,10.8],l:[0,-.2,0]}};
const camPos=new THREE.Vector3(0,.7,6.2), camLook=new THREE.Vector3(0,-.2,0), goalPos=new THREE.Vector3(), goalLook=new THREE.Vector3();
let rotY=0, zoom=1, dragging=false, lastX=0, downX=0, downY=0;
function setGoal(){
  const pr=PRESETS[state.m], l=new THREE.Vector3(...pr.l), off=new THREE.Vector3(...pr.p).sub(l), a=camera.aspect;
  const mobileScale=innerWidth<=900?1.25:1;
  off.multiplyScalar((a<1?1+(1-a)*.9:1)*mobileScale*zoom); goalLook.copy(l); goalPos.copy(l).add(off);
}
function resize(){
  const w=stage.clientWidth,h=stage.clientHeight; if(!w||!h) return;
  renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);
canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=downX=e.clientX;downY=e.clientY;canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';});
canvas.addEventListener('pointermove',e=>{if(!dragging)return;rotY+=(e.clientX-lastX)*.01;lastX=e.clientX;});
const endDrag=e=>{ if(dragging&&Math.hypot(e.clientX-downX,e.clientY-downY)<5) burst(e.clientX,e.clientY,16);
  dragging=false;canvas.style.cursor='grab';};
canvas.addEventListener('pointerup',endDrag); canvas.addEventListener('pointercancel',()=>{dragging=false;});
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=clamp(zoom*(1+e.deltaY*.0012),.6,1.5);},{passive:false});

const clock=new THREE.Clock();
function tick(){
  requestAnimationFrame(tick);
  const dt=Math.min(clock.getDelta(),.05), t=clock.elapsedTime;
  if(animating){const p=clamp((performance.now()-animStart)/animDur); setBloom(p); if(p>=1){animating=false; const cb=onBloom; onBloom=null; if(cb) cb();}}
  if(!dragging&&!reduce) rotY+=dt*(state.m==='garden'?.12:.3);
  world.rotation.y=rotY;
  setGoal(); const k=1-Math.pow(.002,dt);
  camPos.lerp(goalPos,k); camLook.lerp(goalLook,k); camera.position.copy(camPos); camera.lookAt(camLook);
  if(!reduce) for(const f of flowers){f.g.rotation.z=Math.sin(t*.9+f.phase)*.03; f.g.rotation.x=Math.cos(t*.7+f.phase)*.02;}
  for(const b of fliers){
    const a=t*b.sp+b.ph; b.g.position.set(Math.cos(a)*b.R,b.h+Math.sin(a*2)*.25,Math.sin(a)*b.R); b.g.rotation.y=-a;
    const fl=.15+(Math.sin(t*18+b.ph)*.5+.5)*.85; b.g.userData.l.rotation.y=-fl; b.g.userData.r.rotation.y=fl;
    const tween=b.g.userData.colorTween;
    if(tween){
      const p=clamp((performance.now()-tween.start)/500), eased=1-Math.pow(1-p,3);
      tween.to.forEach((target,i)=>{
        const material=b.g.userData.colorMats[i], from=tween.from[i];
        material.color.lerpColors(from.color,target.color,eased);
        material.emissive.lerpColors(from.emissive,target.emissive,eased);
      });
      if(p>=1) b.g.userData.colorTween=null;
    }
  }
  if(sparkles){sparkles.position.y=Math.sin(t*.8)*.12; sparkles.material.opacity=.6+Math.sin(t*2)*.25;}
  renderer.render(scene,camera);
}

/* ============ petal confetti ============ */
const fx=$('#fx'), fctx=fx.getContext('2d'); let parts=[], fxOn=false;
const fxResize=()=>{fx.width=innerWidth;fx.height=innerHeight;}; fxResize(); addEventListener('resize',fxResize);
function addPart(x,y,vx,vy,life,base){parts.push({x,y,vx,vy,r:Math.random()*6.28,vr:(Math.random()-.5)*.3,s:6+Math.random()*8,c:Math.random()<.5?base:lighten(base,.45),life});}
function kick(){if(!fxOn){fxOn=true;requestAnimationFrame(fxTick);}}
function burst(x,y,n){const base=accentOf(); for(let i=0;i<(n||20);i++){const a=Math.random()*6.28,s=2+Math.random()*5; addPart(x,y,Math.cos(a)*s,Math.sin(a)*s-4,1,base);} kick();}
function shower(){const base=accentOf(); for(let i=0;i<46;i++) addPart(Math.random()*innerWidth,-20-Math.random()*300,(Math.random()-.5)*1.5,1+Math.random()*2,2.6,base); kick();}
function fxTick(){
  fctx.clearRect(0,0,fx.width,fx.height); parts=parts.filter(p=>p.life>0&&p.y<fx.height+40);
  for(const p of parts){
    p.vy+=.12; p.vx*=.985; p.x+=p.vx; p.y+=p.vy; p.r+=p.vr; p.life-=.011;
    fctx.save(); fctx.globalAlpha=clamp(p.life*1.4); fctx.translate(p.x,p.y); fctx.rotate(p.r); fctx.fillStyle=p.c;
    fctx.beginPath(); fctx.ellipse(0,0,p.s*.45,p.s,0,0,6.283); fctx.fill(); fctx.restore();
  }
  if(parts.length) requestAnimationFrame(fxTick); else {fxOn=false; fctx.clearRect(0,0,fx.width,fx.height);}
}
const stageCenter=()=>{const r=stage.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];};

/* ============ builder UI ============ */
function swatch(hex,name,id){const b=document.createElement('button'); b.type='button'; b.className='sw'; b.dataset.id=id; b.style.background=hex; b.title=name||id; b.setAttribute('aria-label',name||id); return b;}
function createUI(){
  $$('[data-i]').forEach(el=>{el.innerHTML=IC[el.dataset.i]||'';});
  const tiles=$('#tiles');
  FLOWERS.forEach(f=>{const b=document.createElement('button'); b.type='button'; b.className='tile'; b.dataset.id=f.id;
    b.innerHTML='<span class="fi">'+fIcon(f.id)+'</span><span class="n">'+f.name+'</span>';
    b.onclick=()=>{state.t=f.id;save();syncUI();rebuild();}; tiles.appendChild(b);});
  const seg=$('#seg');
  MODES.forEach(m=>{const b=document.createElement('button'); b.type='button'; b.dataset.id=m.id; b.innerHTML=ic(m.icon)+m.label;
    b.onclick=()=>{state.m=m.id;save();syncUI();rebuild();}; seg.appendChild(b);});
  const previewSvg=points=>'<svg viewBox="0 0 48 32" aria-hidden="true">'+points.map(([x,y],i)=>'<circle cx="'+x+'" cy="'+y+'" r="'+(i===0?3.5:2.8)+'" fill="'+(i%2?'#ff9fb7':'#ffc83d')+'"/>').join('')+'</svg>';
  const layouts=[...BOUQUET_LAYOUTS,...GARDEN_LAYOUTS];
  layouts.forEach(layout=>{
    const b=document.createElement('button'); b.type='button'; b.className='arrangement'; b.dataset.id=layout.id;
    b.innerHTML='<span class="arrangement-preview">'+previewSvg(layout.preview)+'</span><span class="arrangement-name">'+layout.label+'</span><span class="arrangement-note">'+layout.note+'</span>';
    b.onclick=()=>{
      if(state.m==='bouquet') state.bt=layout.id; else state.gt=layout.id;
      save();syncUI();rebuild();
    };
    b.dataset.group=BOUQUET_LAYOUTS.includes(layout)?'bouquet':'garden';
    $('#arrangements').appendChild(b);
  });
  const sw=$('#sw');
  COLORS.forEach(c=>{
    const b=swatch(c.hex,c.name,c.id); b.onclick=()=>{state.c=c.id;save();syncUI();rebuild(true);}; sw.appendChild(b);
    const b2=swatch(c.hex,c.name,c.id); b2.onclick=()=>{state.c2=c.id;save();syncUI();rebuild(true);}; $('#sw2').appendChild(b2);
  });
  $('#duo').onclick=()=>{state.c2=state.c2?'':(state.c==='pink'?'sky':'pink');save();syncUI();rebuild(true);};

  WRAPS.forEach(w=>{const b=swatch(w.hex,w.name,w.id); b.onclick=()=>{state.wc=w.id;save();syncUI();rebuild(true);}; $('#swWrap').appendChild(b);});
  RIBBONS.forEach(r=>{const b=swatch(r.hex,r.name,r.id); b.onclick=()=>{state.rc=r.id;save();syncUI();rebuild(true);}; $('#swRib').appendChild(b);});
  RSTYLES.forEach(r=>{const b=document.createElement('button'); b.type='button'; b.dataset.id=r.id; b.textContent=r.label;
    b.onclick=()=>{state.rs=r.id;save();syncUI();rebuild(true);}; $('#segRib').appendChild(b);});
  EXTRAS.forEach(x=>{const b=document.createElement('button'); b.type='button'; b.className='chip'; b.dataset.k=x.k; if(x.only) b.dataset.only=x.only; b.textContent=x.label;
    b.onclick=()=>{state[x.k]=state[x.k]?0:1;save();syncUI();rebuild(true);}; $('#extras').appendChild(b);});
  DEFAULT.bc.forEach((color,i)=>{
    const label=document.createElement('label'); label.className='butterfly-color';
    const input=document.createElement('input'); input.type='color'; input.dataset.index=i; input.value=color;
    input.setAttribute('aria-label','Butterfly '+(i+1)+' color');
    input.addEventListener('input',()=>{
      state.bc[i]=input.value; save(); transitionButterflyColor(i,input.value);
    });
    label.append(input,document.createTextNode('Butterfly '+(i+1)));
    $('#butterflyColorInputs').appendChild(label);
  });

  const occ=$('#occ');
  OCCASIONS.forEach(o=>{const b=document.createElement('button'); b.type='button'; b.className='chip'; b.dataset.oc=o.n; b.innerHTML=ic(o.i)+o.n;
    b.onclick=()=>{
      if(!customOpen&&state.oc===o.n){state.oc='';save();syncUI();return;} /* tap again to unselect */
      customOpen=false; state.oc=o.n;
      const hasOwn=state.msg.trim()&&!OCCASIONS.some(x=>x.msg===state.msg);
      if(!hasOwn||confirm('Replace your message with this starter?')){state.msg=o.msg; $('#fMsg').value=o.msg; toast('Make it yours. Edit anything.');}
      save(); syncUI();
    }; occ.appendChild(b);});
  const cb=document.createElement('button'); cb.type='button'; cb.className='chip'; cb.id='ocCustom'; cb.innerHTML=ic('pen')+'Your own';
  cb.onclick=()=>{customOpen=true; state.oc=$('#fOc').value.trim().slice(0,30); save(); syncUI(); $('#fOc').focus();};
  occ.appendChild(cb);
  $('#fOc').addEventListener('input',e=>{state.oc=e.target.value.slice(0,30);save();syncUI();});
  const mu=$('#music');
  [['none','Silent','mute']].concat(Object.keys(TRACKS).map(k=>[k,TRACKS[k].name,TRACKS[k].icon])).forEach(([id,label,icon])=>{
    const b=document.createElement('button'); b.type='button'; b.className='chip'; b.dataset.id=id; b.innerHTML=ic(icon)+label;
    b.onclick=()=>{state.mu=id;save();syncUI(); if(id==='none') stopMusic(); else startMusic(id);}; mu.appendChild(b);});

  $('#fTo').addEventListener('input',e=>{state.to=e.target.value;save();syncUI();});
  $('#fFr').addEventListener('input',e=>{state.fr=e.target.value;save();syncUI();});
  $('#fMsg').addEventListener('input',e=>{state.msg=e.target.value;save();syncUI();});
  $('#fMl').addEventListener('input',e=>{state.ml=e.target.value;save();syncUI();});

  $('#surprise').onclick=()=>{
    const pick=a=>a[Math.floor(Math.random()*a.length)];
    state.t=pick(FLOWERS).id; state.c=pick(COLORS).id; state.c2=Math.random()<.35?pick(COLORS.filter(c=>c.id!==state.c)).id:''; state.m=pick(MODES).id;
    state.wc=pick(WRAPS).id; state.rc=pick(RIBBONS).id; state.rs=pick(RSTYLES.slice(0,3)).id;
    save(); syncUI(); rebuild(); const c=stageCenter(); burst(c[0],c[1],22);
  };
  $('#replay').onclick=()=>playBloom(2200);
  $$('.nav button').forEach(b=>b.onclick=()=>{
    const tab=b.dataset.tab;
    if(tab==='send'){openSheet();return;}
    $('#app').dataset.tab=tab; $$('.nav button').forEach(x=>x.classList.toggle('on',x===b));
    const p=$(tab==='design'?'#pDesign':'#pWrite'); p.classList.remove('flash'); void p.offsetWidth; p.classList.add('flash');
  });
  $('#sendBtn').onclick=openSheet;
}
function fillInputs(){customOpen=!!state.oc&&!OCCASIONS.some(o=>o.n===state.oc); $('#fOc').value=customOpen?state.oc:''; $('#fTo').value=state.to;$('#fFr').value=state.fr;$('#fMsg').value=state.msg;$('#fMl').value=state.ml;}
function syncTag(){
  const t=$('#tag'); t.textContent=''; if(!state.to) return;
  const i=document.createElement('span'); i.className='ic'; i.innerHTML=IC.heart; t.append(i,'for '+state.to);
}
function syncUI(){
  document.documentElement.style.setProperty('--accent',accentOf());
  const press=(sel,key,val)=>$$(sel).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset[key]===val)));
  press('#tiles .tile','id',state.t); press('#seg button','id',state.m); press('#sw .sw','id',state.c); press('#sw2 .sw','id',state.c2);
  $('#grpC2').hidden=!state.c2; $('#duo').innerHTML=ic(state.c2?'x':'plus')+(state.c2?'Remove second color':'Add a second color');
  $('#butterflyColors').hidden=!state.bf;
  $$('#butterflyColorInputs input').forEach((input,i)=>{input.value=state.bc[i];});
  press('#swWrap .sw','id',state.wc); press('#swRib .sw','id',state.rc); press('#segRib button','id',state.rs); press('#music .chip','id',state.mu);
  $$('#extras .chip').forEach(b=>{b.setAttribute('aria-pressed',String(!!state[b.dataset.k])); b.hidden=!!b.dataset.only&&b.dataset.only!==state.m;});
  const arrangementVisible=state.m==='bouquet'||state.m==='garden';
  $('#arrangementSection').hidden=!arrangementVisible;
  if(arrangementVisible){
    const layoutGroup=state.m==='bouquet'?'bouquet':'garden', selected=state.m==='bouquet'?state.bt:state.gt;
    $('#arrangementHeading').textContent=state.m==='bouquet'?'Bouquet design':'Garden design';
    $$('#arrangements .arrangement').forEach(b=>{
      b.hidden=b.dataset.group!==layoutGroup;
      b.setAttribute('aria-pressed',String(!b.hidden&&b.dataset.id===selected));
    });
  }
  $('#secWrap').hidden=state.m==='garden'; $('#grpWrapper').hidden=state.m!=='bouquet'; $('#grpRibColor').hidden=state.rs==='none';
  const custom=customOpen||(!!state.oc&&!OCCASIONS.some(o=>o.n===state.oc));
  $$('#occ .chip[data-oc]').forEach(b=>b.setAttribute('aria-pressed',String(!custom&&b.dataset.oc===state.oc)));
  $('#ocCustom').setAttribute('aria-pressed',String(custom)); $('#grpOc').hidden=!custom;
  syncTag();
  $('#cnt').textContent=state.msg.length+' / 500';
  const ml=state.ml.trim(), hint=$('#mlHint');
  hint.textContent=!ml?'':(embedFor(ml)?'Looks good. A Spotify player will appear in the letter.':'Please use a Spotify track, album, playlist, or episode link.');
}

/* ============ send sheet ============ */
async function copyText(t){
  try{await navigator.clipboard.writeText(t);}catch(e){const i=$('#linkOut');i.select();try{document.execCommand('copy');}catch(_){}}
  toast('Link copied');
}
function openSheet(){
  stopMusic(); const url=makeLink(); $('#linkOut').value=url;
  $('#lenWarn').textContent=url.length>1800?'This link is quite long. Some apps may cut it, so try a shorter message.':'';
  $('#sheet').classList.add('show');
}
const closeSheet=()=>$('#sheet').classList.remove('show');
$('#sheetX').onclick=closeSheet; $('#sheet').addEventListener('click',e=>{if(e.target.id==='sheet')closeSheet();});
$('#copyBtn').onclick=()=>copyText($('#linkOut').value);
$('#linkOut').addEventListener('focus',e=>e.target.select());
// $('#shareBtn').onclick=async()=>{
//   const url=makeLink();
//   if(navigator.share){try{await navigator.share({title:'A flower for you',text:state.to?'A flower for '+state.to:'A flower for you',url});}catch(e){}}
//   else copyText(url);
// };
$('#mailBtn').onclick=()=>{
 const url=makeLink(), body=(state.to?'Hi '+state.to+',\n\n':'')+'Someone made you a little flower. Open the envelope and watch it bloom:\n\n'+url+'\n\n'+(state.fr?'- '+state.fr:'');
 location.href='mailto:?subject='+encodeURIComponent('A flower for you')+'&body='+encodeURIComponent(body);
};
$('#qrBtn').onclick=async()=>{
  try{
    const dataUrl=await QRCode.toDataURL(makeLink(),{
      errorCorrectionLevel:'M',
      margin:2,
      width:640,
      color:{dark:'#2d2233',light:'#fff8f6'}
    });
    const base64=dataUrl.slice(dataUrl.indexOf(',')+1), binary=atob(base64), bytes=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
    const qrUrl=URL.createObjectURL(new Blob([bytes],{type:'image/png'}));
    const link=document.createElement('a');
    link.href=qrUrl;
    link.download='bloomail-qr-code.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(qrUrl),4000);
    toast('QR code downloaded');
  }catch(error){
    console.error('Failed to generate the share QR code.',error);
    toast('Could not download QR code. Please try again.');
  }
};
$('#prevBtn').onclick=()=>{closeSheet();enterReceiver(true);};
$('#boothBtn').onclick=()=>{closeSheet();openBooth();};

/* ============ receiver ============ */
let typeTimer=null;
function typeInto(el,text){
  clearInterval(typeTimer); el.textContent=''; if(reduce){el.textContent=text;return;} let i=0;
  typeTimer=setInterval(()=>{i+=2;el.textContent=text.slice(0,i);if(i>=text.length)clearInterval(typeTimer);},28);
}
const soundIcon=()=>{$('#rxSound').innerHTML=ic(audio.muted?'mute':'vol');};
function enterReceiver(isPreview){
  receiving=true; preview=!!isPreview; stopMusic();
  document.body.classList.add('receiving'); document.body.classList.toggle('preview',preview);
  build(); animating=false; setBloom(0);
  $('#letter').classList.remove('show','expanded','closing'); $('#letterToggle').setAttribute('aria-expanded','false'); $('#lEmbed').innerHTML='';
  $('#envFor').textContent=state.to?'A flower for '+state.to:'A flower for you';
  const env=$('#env'); env.classList.remove('open'); const w=$('#envWrap'); w.classList.remove('hide'); w.classList.add('show');
  spotifyController=null; spotifyEmbedReady=false; spotifyPlayRequested=false;
  const emb=embedFor(state.ml); $('#rxSound').hidden=!!emb||state.mu==='none'; soundIcon();
  const box=$('#lEmbed'); box.innerHTML='';
  if(emb) mountSpotifyEmbed(box,emb);
  requestAnimationFrame(resize);
}
$('#env').onclick=()=>{
  const env=$('#env'); if(env.classList.contains('open')) return; env.classList.add('open');
  if(embedFor(state.ml)) requestSpotifyPlayback();
  setTimeout(()=>{
    $('#envWrap').classList.add('hide');
    if(!embedFor(state.ml)&&state.mu!=='none') startMusic(state.mu);
    playBloom(3600); const c=stageCenter(); burst(c[0],c[1]*.9,26);
    setTimeout(showLetter,2400);
  },750);
  setTimeout(()=>$('#envWrap').classList.remove('show'),1500);
};
function showLetter(){
  const oc=$('#lOcc'); oc.textContent=''; if(state.oc){const i=document.createElement('span'); i.className='ic'; i.innerHTML=IC.sparkle; oc.append(i,state.oc);}
  $('#lTo').textContent=state.to?'Dear '+state.to+',':'Hello you,';
  $('#lFrom').textContent=state.fr?'- '+state.fr:'';
  $('#letter').classList.add('show'); typeInto($('#lMsg'),state.msg.trim()||'Someone thought of you today.');
  shower();
}
function closeLetter(){
  const letter=$('#letter');
  if(!letter.classList.contains('expanded')) return;
  letter.classList.add('closing');
  $('#letterToggle').setAttribute('aria-expanded','false');
  setTimeout(()=>letter.classList.remove('expanded','closing'),reduce?20:340);
}
$('#letterToggle').onclick=()=>{
  const letter=$('#letter');
  if(letter.classList.contains('expanded')){closeLetter();return;}
  letter.classList.remove('closing');
  letter.classList.add('expanded');
  $('#letterToggle').setAttribute('aria-expanded','true');
};
$('#letterCollapse').onclick=closeLetter;
$('#rxSound').onclick=()=>{setMuted(!audio.muted);soundIcon();};
$('#rxBooth').onclick=openBooth;
$('#rxNew').onclick=()=>{location.href=location.href.split('#')[0];};
$('#backEdit').onclick=()=>{
  stopMusic(); receiving=false; preview=false; document.body.classList.remove('receiving','preview');
  $('#envWrap').classList.remove('show'); $('#letter').classList.remove('show'); build(); setBloom(1); requestAnimationFrame(resize);
};
addEventListener('hashchange',()=>location.reload());

/* ============ photobooth ============ */
const booth={stream:null,raf:0,shots:[],busy:false}, W=960, H=720;
const bVideo=$('#bVideo'), bCanvas=$('#bCanvas'), bctx=bCanvas.getContext('2d');
const T2D={rose:{n:8,pw:.34,pl:.5,center:'#8a1c2b',cr:.2},tulip:{n:5,pw:.3,pl:.62,center:'#f7e27a',cr:.12},sunflower:{n:18,pw:.11,pl:.48,center:'#4a2c12',cr:.34},
  daisy:{n:14,pw:.12,pl:.5,center:'#ffc21a',cr:.22},sakura:{n:5,pw:.3,pl:.5,center:'#ffd7e1',cr:.14},sampaguita:{n:8,pw:.14,pl:.48,center:'#fff3b0',cr:.12},
  lily:{n:6,pw:.17,pl:.55,center:'#8a4a1c',cr:.1},hibiscus:{n:5,pw:.36,pl:.5,center:'#ffd166',cr:.12}};
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function flower2D(c,x,y,r,hex,type,rot){
  c.save(); c.translate(x,y); c.rotate(rot);
  if(type==='lavender'){
    c.strokeStyle='#5e8f55'; c.lineWidth=r*.07; c.beginPath(); c.moveTo(0,r*1.1); c.lineTo(0,-r*1.1); c.stroke();
    for(let i=0;i<8;i++){
      const yy=r*(.95-i*.26), w=r*.22*(1-i*.04); c.fillStyle=i%2?lighten(hex,.2):hex;
      c.beginPath(); c.ellipse(-w*.8,yy,w,w*.62,-.5,0,6.283); c.fill();
      c.beginPath(); c.ellipse(w*.8,yy,w,w*.62,.5,0,6.283); c.fill();
    }
    c.beginPath(); c.ellipse(0,-r*1.05,r*.12,r*.2,0,0,6.283); c.fillStyle=hex; c.fill(); c.restore(); return;
  }
  const d=T2D[type]||T2D.rose;
  (type==='rose'?[1,.7]:[1]).forEach((k,ri)=>{
    for(let i=0;i<d.n;i++){c.save(); c.rotate(i/d.n*Math.PI*2+ri*.4); c.fillStyle=ri===0?lighten(hex,.15):hex; c.strokeStyle='rgba(0,0,0,.1)'; c.lineWidth=1.5;
      c.beginPath(); c.ellipse(0,-d.pl*r*k,d.pw*r*k,d.pl*r*k,0,0,Math.PI*2); c.fill(); c.stroke(); c.restore();}
  });
  c.fillStyle=d.center; c.beginPath(); c.arc(0,0,d.cr*r,0,Math.PI*2); c.fill(); c.restore();
}
function drawBooth(c,tm){
  const vw=bVideo.videoWidth||W, vh=bVideo.videoHeight||H, s=Math.max(W/vw,H/vh), dw=vw*s, dh=vh*s;
  c.fillStyle='#2d2233'; c.fillRect(0,0,W,H);
  if(bVideo.videoWidth){c.save(); c.translate(W,0); c.scale(-1,1); c.drawImage(bVideo,(W-dw)/2,(H-dh)/2,dw,dh); c.restore();}
  const acc=hexOf(), type=state.t;
  const g=c.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.85); g.addColorStop(0,'rgba(255,255,255,0)'); g.addColorStop(1,acc+'55'); c.fillStyle=g; c.fillRect(0,0,W,H);
  c.strokeStyle=acc; c.lineWidth=28; rr(c,14,14,W-28,H-28,38); c.stroke();
  [[66,66],[W-66,66],[66,H-66],[W-66,H-66]].forEach((p,i)=>flower2D(c,p[0],p[1],58,i%2?(hex2Of()||acc):acc,type,tm*.4*(i%2?-1:1)+i));
  for(let i=0;i<14;i++){const x=(i*137)%W, y=((i*83)+tm*45)%H; c.save(); c.translate(x,y); c.rotate(i+tm*.6); c.globalAlpha=.8; c.fillStyle=i%2?lighten(acc,.4):acc; c.beginPath(); c.ellipse(0,0,7,13,0,0,6.283); c.fill(); c.restore();}
  const cap=state.to?'For '+state.to:'bloomail'; c.font='700 46px Caveat, cursive'; c.textAlign='center';
  const tw=c.measureText(cap).width+56; c.fillStyle='rgba(255,255,255,.88)'; rr(c,W/2-tw/2,H-104,tw,66,33); c.fill(); c.fillStyle='#2d2233'; c.fillText(cap,W/2,H-58);
}
function boothLoop(){booth.raf=requestAnimationFrame(boothLoop); drawBooth(bctx,performance.now()/1000);}
function resetBooth(){booth.shots=[];booth.busy=false;$('#bThumbs').innerHTML='';$('#bLive').hidden=false;$('#bResult').hidden=true;$('#bCount').textContent='';}
async function openBooth(){
  stopMusic(); $('#booth').style.setProperty('--booth-accent',hexOf()); $('#booth').classList.add('show'); resetBooth(); $('#bMsg').hidden=true;
  try{
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia) throw new Error('nocam');
    booth.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:960}},audio:false});
    bVideo.srcObject=booth.stream; await bVideo.play();
  }catch(e){
    const m=$('#bMsg'); m.hidden=false; m.textContent='The camera didn’t start. Allow camera access in your browser (the page needs to be on https), then try again.';
  }
  cancelAnimationFrame(booth.raf); boothLoop();
}
function closeBooth(){
  cancelAnimationFrame(booth.raf); if(booth.stream){booth.stream.getTracks().forEach(t=>t.stop());booth.stream=null;}
  booth.busy=false; $('#booth').classList.remove('show');
}
async function snapThree(){
  if(booth.busy||!booth.stream) return; booth.busy=true; booth.shots=[]; $('#bThumbs').innerHTML='';
  const cnt=$('#bCount'), fl=$('#bFlash');
  for(let i=0;i<3&&booth.busy;i++){
    for(let n=3;n>0&&booth.busy;n--){cnt.textContent=n; cnt.classList.remove('pop'); void cnt.offsetWidth; cnt.classList.add('pop'); await sleep(850);}
    if(!booth.busy) return; cnt.textContent=''; fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go');
    const c=document.createElement('canvas'); c.width=W; c.height=H; drawBooth(c.getContext('2d'),performance.now()/1000);
    booth.shots.push(c); $('#bThumbs').appendChild(c); await sleep(600);
  }
  booth.busy=false; makeStrip();
}
function makeStrip(){
  const shots=booth.shots, SW=520, pad=28, sw=SW-pad*2, sh=Math.round(sw*.75), gap=16, foot=140, SH=pad+shots.length*sh+(shots.length-1)*gap+foot;
  const c=$('#bStrip'); c.width=SW; c.height=SH; const x=c.getContext('2d'), acc=hexOf();
  x.fillStyle=lighten(acc,.82); x.fillRect(0,0,SW,SH); x.strokeStyle=acc; x.lineWidth=10; rr(x,5,5,SW-10,SH-10,26); x.stroke();
  shots.forEach((s,i)=>{const y=pad+i*(sh+gap); x.save(); rr(x,pad,y,sw,sh,18); x.clip(); x.drawImage(s,pad,y,sw,sh); x.restore();});
  flower2D(x,pad+6,pad+2,34,acc,state.t,.3); flower2D(x,SW-pad-6,pad+2,34,hex2Of()||acc,state.t,-.2);
  const fy=SH-foot; x.textAlign='center'; x.fillStyle='#2d2233'; x.font='700 48px Caveat, cursive'; x.fillText(state.to?'for '+state.to:'bloomail',SW/2,fy+62);
  x.font='500 22px Fredoka, sans-serif'; x.fillStyle='#85788d';
  x.fillText((state.fr?'from '+state.fr+' · ':'')+new Date().toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}),SW/2,fy+98);
  $('#bLive').hidden=true; $('#bResult').hidden=false; shower();
}
$('#bSnap').onclick=snapThree; $('#boothX').onclick=closeBooth;
$('#bRetake').onclick=resetBooth;
$('#bDl').onclick=()=>{$('#bStrip').toBlob(b=>{const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='bloomail-photobooth.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000);},'image/png');};
$('#booth').addEventListener('click',e=>{if(e.target.id==='booth')closeBooth();});
addEventListener('keydown',e=>{if(e.key==='Escape'){closeBooth();closeSheet();}});

/* ============ init ============ */
createUI();
const m=location.hash.match(/^#c=(.+)$/);
if(m){const d=dec(m[1]); if(d){state=sanitize(d);receiving=true;}}
else{try{const s=localStorage.getItem('petalpost-draft'); if(s) state=sanitize(JSON.parse(s));}catch(e){}}
fillInputs(); syncUI(); build(); resize();
if(receiving) enterReceiver(false); else playBloom(2200);
requestAnimationFrame(tick);
})();
