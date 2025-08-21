/* Colorinka UPGRADE (fallback) */
import { $, clamp } from './utils.js';
import { musicStart, musicStop, sfxClick } from './audio.js';
import { setInGame } from './stats.js';
import { getDuration } from './settings.js';
/* Colorinka UPGRADE: round seconds removed */ /* Colorinka UPGRADE */
const barFill = document.querySelector('.timer-bar__fill');
const popup = document.getElementById('endPopup');
const popupTitle = document.getElementById('endPopupTitle');
const popupSubtitle = document.getElementById('endPopupSubtitle');
let score=0, roundActive=false, startTs=0, rafId=null;
/* Colorinka UPGRADE: progress bar removed */
/* Colorinka UPGRADE: timer loop removed */
export function addScore(d=1){ if(!roundActive) return; score+=d; }
export function startRound(){
  ROUND_SECONDS = (typeof getDuration==='function' ? getDuration() : 60);
 if(roundActive) return; ROUND_SECONDS=getDuration(); score=0; roundActive=true; setInGame(true); startTs=performance.now(); /* Colorinka UPGRADE: cancel RAF removed */ musicStart(); /* Colorinka UPGRADE: RAF removed */   startTs = performance.now();
  try{ cancelAnimationFrame(rafId);}catch{}
  setCircleProgress(ROUND_SECONDS);
  rafId = requestAnimationFrame(loop);
}
function endRound(){
  /* Colorinka UPGRADE: stop circle timer */
  try{ cancelAnimationFrame(rafId);}catch{};
 if(!roundActive) return; roundActive=false; setInGame(false); /* Colorinka UPGRADE: cancel RAF removed */ musicStop(); const passed=score>=10; if(popup){ popupTitle.textContent=passed?'Mission Passed':'Game Over'; popupSubtitle.textContent=`Score: ${score}`; popup.classList.remove('hidden'); } }
function closeEndPopup(){ popup?.classList.add('hidden'); }
document.addEventListener('DOMContentLoaded',()=>{ const btnStart=document.getElementById('btnStart'); const btnEndClose=document.getElementById('endPopupClose'); btnStart?.addEventListener('click',(e)=>{e.preventDefault(); sfxClick(); closeEndPopup(); startRound();}); btnEndClose?.addEventListener('click',(e)=>{e.preventDefault(); closeEndPopup();}); });

/* Colorinka UPGRADE: circle timer helpers */
function setCircleProgress(remaining){
  const total = ROUND_SECONDS || 60;
  const pct = Math.max(0, Math.min(1, remaining / total));
  const CIRC = 339.292;
  const offset = CIRC * (1 - pct);
  if (circleFg){ 
    circleFg.style.strokeDashoffset = String(offset);
    circleFg.classList.remove('ok','warn','crit');
    if (pct <= 0.20) circleFg.classList.add('crit');
    else if (pct <= 0.50) circleFg.classList.add('warn');
    else circleFg.classList.add('ok');
  }
  if (timerLabel){ timerLabel.textContent = String(Math.ceil(remaining)); }
}
function loop(now){
  const elapsed = (now - startTs)/1000;
  const rem = Math.max(0, ROUND_SECONDS - elapsed);
  setCircleProgress(rem);
  if (rem <= 0){ try{ cancelAnimationFrame(rafId); }catch{}; endRound(); return; }
  rafId = requestAnimationFrame(loop);
}

/* Colorinka UPGRADE: FX helper */
window.kpFX = (function(){
  function addOnce(el, cls, ms=400){
    if(!el) return;
    el.classList.add(cls);
    setTimeout(()=>el.classList.remove(cls), ms);
  }
  function confettiFrom(el, count=16){
    try{
      const rect = el.getBoundingClientRect();
      let layer = document.querySelector('.kp-confetti-layer');
      if(!layer){
        layer = document.createElement('div');
        layer.className = 'kp-confetti-layer';
        document.body.appendChild(layer);
      }
      for(let i=0;i<count;i++){
        const p = document.createElement('div');
        p.className='kp-confetti';
        const colors=['#FFD54F','#4587FF','#2ED5A2','#FFFFFF'];
        p.style.background = colors[i%colors.length];
        p.style.left = (rect.left + rect.width/2) + 'px';
        p.style.top  = (rect.top + rect.height/2) + 'px';
        layer.appendChild(p);
        const dx = (Math.random()*2-1)*80;
        const dy = - (40 + Math.random()*80);
        const rot= (Math.random()*360);
        const dur= 600 + Math.random()*500;
        p.animate([
          { transform:`translate(0,0) rotate(0deg)`, opacity:1 },
          { transform:`translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity:0 }
        ], { duration: dur, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }).onfinish = ()=> p.remove();
      }
      setTimeout(()=>{ if(layer && !layer.children.length) layer.remove(); }, 1400);
    }catch(e){}
  }
  return {
    correct(el){ addOnce(el,'kp-correct',280); confettiFrom(el,16); },
    wrong(el){ addOnce(el,'kp-wrong',380); }
  };
})();

/* COLORINKA UPGRADE: mascot fx helper */
window.mascotFX = (function(){
  function addOnce(el,cls,ms){if(!el)return;el.classList.add(cls);setTimeout(()=>el.classList.remove(cls),ms);}
  function confettiFrom(el,count=12){
    try{
      const rect = el.getBoundingClientRect();
      let layer=document.querySelector('.confetti-layer');
      if(!layer){layer=document.createElement('div');layer.className='confetti-layer';document.body.appendChild(layer);}
      for(let i=0;i<count;i++){
        const p=document.createElement('div');
        p.className='confetti-piece';
        const colors=['#FFD54F','#FF6B6B','#42A5F5','#66BB6A'];
        p.style.background=colors[i%colors.length];
        p.style.left=(rect.left+rect.width/2)+'px';
        p.style.top=(rect.top+rect.height/2)+'px';
        layer.appendChild(p);
        const dx=(Math.random()*2-1)*80;
        const dy=-(40+Math.random()*80);
        const rot=(Math.random()*360);
        const dur=600+Math.random()*500;
        p.animate([{transform:"translate(0,0) rotate(0deg)",opacity:1},{transform:`translate(${dx}px,${dy}px) rotate(${rot}deg)`,opacity:0}],{duration:dur,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'}).onfinish=()=>p.remove();
      }
      setTimeout(()=>{if(layer&&!layer.children.length)layer.remove();},1500);
    }catch(e){}
  }
  return {
    correct(el){addOnce(el,'mascot-correct',300);confettiFrom(el,14);},
    wrong(el){addOnce(el,'mascot-wrong',400);}
  };
})();

/* COLORINKA UPGRADE: mascot sfx */
function playMascotSfx(type){
  try{
    if(window.gameSettings && window.gameSettings.sfx===false) return;
    let src = '';
    if(type==='correct') src='assets/sfx/sfx-correct.mp3';
    if(type==='wrong') src='assets/sfx/sfx-wrong.mp3';
    if(src){
      const a=new Audio(src);
      a.volume=0.6;
      a.play().catch(()=>{});
    }
  }catch(e){}
}
const oldMascotFX=window.mascotFX;
if(oldMascotFX){
  window.mascotFX={
    correct(el){ oldMascotFX.correct(el); playMascotSfx('correct'); },
    wrong(el){ oldMascotFX.wrong(el); playMascotSfx('wrong'); }
  };
}

/* COLORINKA UPGRADE: Mascot FX bridge */
(function(){
  // ensure mascotFX exists
  if(!window.mascotFX){
    window.mascotFX = {
      correct(el){ try{ el&&el.classList.add('mascot-correct'); setTimeout(()=>el&&el.classList.remove('mascot-correct'),300);}catch(e){} },
      wrong(el){ try{ el&&el.classList.add('mascot-wrong'); setTimeout(()=>el&&el.classList.remove('mascot-wrong'),400);}catch(e){} }
    };
  }
  // Allow game code to trigger via events
  window.addEventListener('mascot:correct', e=> window.mascotFX.correct(e.detail?.el||e.target));
  window.addEventListener('mascot:wrong',   e=> window.mascotFX.wrong(e.detail?.el||e.target));

  // Auto-detect clicks on mascot options that carry data-correct
  document.addEventListener('click', (ev)=>{
    const el = ev.target.closest('[data-mascot],[data-role="mascot"],.mascot-card,.mascot-option');
    if(!el) return;
    const flag = (el.getAttribute('data-correct')||'').toString().toLowerCase();
    if(flag==='true' || flag==='1' || flag==='yes'){ 
      try{ window.mascotFX.correct(el); }catch(e){}
    }else if(flag==='false' || flag==='0' || flag==='no'){
      try{ window.mascotFX.wrong(el); }catch(e){}
    }
  }, true);
})();

/* COLORINKA UPGRADE: background music */
(function(){
  let bg;
  function ensureSettings(){
    if(!window.gameSettings) window.gameSettings = {};
    if(typeof window.gameSettings.music === 'undefined'){
      // read from session if present
      try{
        const v = sessionStorage.getItem('colorinka_music');
        window.gameSettings.music = (v===null)? true : (v==='true');
      }catch(e){ window.gameSettings.music = true; }
    }
    if(typeof window.gameSettings.sfx === 'undefined'){
      try{
        const v = sessionStorage.getItem('colorinka_sfx');
        window.gameSettings.sfx = (v===null)? true : (v==='true');
      }catch(e){ window.gameSettings.sfx = true; }
    }
  }
  function saveSettings(){
    try{
      sessionStorage.setItem('colorinka_music', String(!!window.gameSettings.music));
      sessionStorage.setItem('colorinka_sfx', String(!!window.gameSettings.sfx));
    }catch(e){}
  }
  function createBG(){
    if(bg) return bg;
    bg = new Audio('assets/music/bg.mp3');
    bg.loop = true;
    bg.volume = 0.35;
    return bg;
  }
  function tryPlay(){
    ensureSettings();
    if(window.gameSettings.music === false) return;
    const a = createBG();
    a.play().catch(()=>{});
  }
  // start on first user interaction for autoplay policy
  ['click','touchstart','keydown'].forEach(ev=>{
    window.addEventListener(ev, function once(){
      window.removeEventListener(ev, once, {capture:false});
      tryPlay();
    }, {once:true});
  });
  // Listen to custom settings events (emit these from your settings UI)
  window.addEventListener('music:on', ()=>{ ensureSettings(); window.gameSettings.music=true; saveSettings(); tryPlay(); });
  window.addEventListener('music:off',()=>{ ensureSettings(); window.gameSettings.music=false; saveSettings(); if(bg){ try{bg.pause();}catch(e){} } });
  window.addEventListener('sfx:on',   ()=>{ ensureSettings(); window.gameSettings.sfx=true; saveSettings(); });
  window.addEventListener('sfx:off',  ()=>{ ensureSettings(); window.gameSettings.sfx=false; saveSettings(); });
})();

/* COLORINKA UPGRADE: MASCOT FX ROBUST BRIDGE */
(function(){
  // Safe FX helpers
  function _ok(){ return typeof window.mascotFX==='object' && window.mascotFX; }
  function _el(target){ try{ return (target && target.nodeType===1)? target : (target?.currentTarget || target?.target) }catch(e){ return null } }
  // Public API so game code can call explicitly if desired
  window.mascotApply = function(correct, target){
    const el = _el(target);
    if(_ok()){
      if(!!correct){ window.mascotFX.correct(el); } else { window.mascotFX.wrong(el); }
    }
  };
  // Event hooks (fire these anywhere in your game code if needed)
  window.addEventListener('mascot:result', (e)=> {
    const el = e.detail?.el || e.target; 
    window.mascotApply(!!e.detail?.correct, el);
  });

  // Auto: delegation by data attributes inside Mascot screen
  document.addEventListener('click', (ev)=>{
    const scope = document.querySelector('#mascot-match, .mascot-screen') || document;
    if(!scope.contains(ev.target)) return;
    const el = ev.target.closest('[data-correct], .mascot-option, .mascot-card');
    if(!el) return;
    const v = (el.getAttribute('data-correct')||'').toLowerCase();
    if(v==='true'||v==='1'||v==='yes'){ window.mascotApply(true, el); }
    else if(v==='false'||v==='0'||v==='no'){ window.mascotApply(false, el); }
  }, true);

  // Auto: watch for class changes 'correct' / 'wrong' to trigger FX
  const target = document.querySelector('#mascot-match, .mascot-screen') || document.body;
  try{
    const mo = new MutationObserver((list)=>{
      for(const m of list){
        if(m.type === 'attributes' && m.attributeName === 'class'){
          const el = m.target;
          const cls = el.className || '';
          if(/(^|\s)correct(\s|$)/i.test(cls)) { window.mascotApply(true, el); }
          else if(/(^|\s)wrong(\s|$)/i.test(cls)) { window.mascotApply(false, el); }
        }
        if(m.type === 'childList' && m.addedNodes){
          m.addedNodes.forEach(n=>{
            if(n.nodeType===1){
              const cls = n.className || '';
              if(/(^|\s)correct(\s|$)/i.test(cls)) { window.mascotApply(true, n); }
              else if(/(^|\s)wrong(\s|$)/i.test(cls)) { window.mascotApply(false, n); }
            }
          });
        }
      }
    });
    mo.observe(target, { attributes:true, attributeFilter:['class'], subtree:true, childList:true });
  }catch(e){}
})();