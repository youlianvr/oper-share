import*as m from"react";var h=Object.freeze(["hero","editorial","split","comparison","process","matrix","metric-spotlight","timeline","chart-led"]),z=Object.freeze({frame:"neutral",surface:"cards",titleClass:"title",titleScale:null,listMode:"stack",quoteMode:"card",metricMode:"card",chartMode:"card"});function v(n){let e=Object.fromEntries(h.map(a=>[a,Object.freeze({...z,...n.familyRecipes?.[a]||{}})]));return Object.freeze({...n,familyRecipes:Object.freeze(e),sourcePrimitives:Object.freeze({...n.sourcePrimitives||{}}),rootVars:Object.freeze({...n.rootVars||{}}),base:Object.freeze(n.base),backgrounds:Object.freeze(Object.fromEntries(Object.entries(n.backgrounds).map(([a,t])=>[a,Object.freeze(t)])))})}function k(n,{fallbackKey:e="theme01"}={}){let a=Object.entries(n||{}).filter(([,i])=>i);if(!a.length)throw new Error("createBespokeThemeProfileRegistry: no theme adapters.");let t=Object.freeze(Object.fromEntries(a)),o=Object.hasOwn(t,e)?e:a[0][0],g=Object.freeze(Object.fromEntries(a.map(([i,l])=>[i,u(i,l,"default")]))),d=new Map;function E(i,l="default"){let s=Object.hasOwn(t,i)?i:o,p=t[s].backgrounds[l]?l:"default";if(p==="default")return g[s];let b=`${s}:${p}`;return d.has(b)||d.set(b,u(s,t[s],p)),d.get(b)}return Object.freeze({profiles:g,getBespokeThemeProfile:E})}function u(n,e,a){let t=e.backgrounds[a]||e.backgrounds.default,o=e.base,g={...o,...t,themeKey:n,semanticBackground:a,sourceTokens:e.sourceTokens,sourcePath:e.sourcePath,sourcePrimitives:e.sourcePrimitives,cssText:e.cssText||"",Runtime:e.Runtime||null,rootClass:t.rootClass||e.rootClass||"",rootVars:Object.freeze({...e.rootVars,...t.rootVars||{}}),familyRecipes:e.familyRecipes,frame:Object.freeze({...o.frame||{},...t.frame||{}}),textTreatment:Object.freeze({...o.textTreatment||{},...t.textTreatment||{}}),cardTreatment:Object.freeze({...o.cardTreatment,...t.cardTreatment||{}}),typeScale:Object.freeze({...o.typeScale,...t.typeScale||{}}),mediaTreatment:Object.freeze({...o.mediaTreatment,...t.mediaTreatment||{}}),chartTreatment:Object.freeze({...o.chartTreatment,...t.chartTreatment||{},series:Object.freeze([...t.chartTreatment?.series||o.chartTreatment.series||[]])}),shapeTreatment:Object.freeze({...o.shapeTreatment,...t.shapeTreatment||{}})};return Object.freeze(g)}function w(n,e,a){return{bg:n,surface:"rgba(0,0,0,.12)",ink:e,muted:e==="#ffffff"?"rgba(255,255,255,.74)":"rgba(0,0,0,.64)",line:e==="#ffffff"?"rgba(255,255,255,.24)":"rgba(0,0,0,.2)",accent2:a}}import O from"react";var f="gxn-theme",x=["#2fe07f","#b9f24a","#2fe0c4","#4ea2ff","#9b7dff","#ff6fae","#ffc24a"],r={accent:"#2fe07f",accent2:"#b9f24a",accentCool:"#4ea2ff",glowRGB:"47, 224, 127",bg:"#07090b",text:"#eef3f1",textDim:"rgba(238,243,241,0.58)",textFaint:"rgba(238,243,241,0.34)",palette:x},y="gxn-theme-style",j=`
.${f}{
  /* \u2500\u2500 color \u2500\u2500 */
  --gxn-bg: #07090b;
  --gxn-accent: #2fe07f;
  --gxn-accent-2: #b9f24a;
  --gxn-accent-cool: #4ea2ff;
  --gxn-glow: 47,224,127;
  --gxn-text: #eef3f1;
  --gxn-dim: rgba(238,243,241,0.58);
  --gxn-faint: rgba(238,243,241,0.34);
  --gxn-line: rgba(255,255,255,0.09);
  --gxn-panel-a: rgba(255,255,255,0.055);
  --gxn-panel-b: rgba(255,255,255,0.012);

  /* \u2500\u2500 type \u2500\u2500 */
  --gxn-font-display: 'Space Grotesk','Noto Sans SC',-apple-system,sans-serif;
  --gxn-font-sans: 'Noto Sans SC','Space Grotesk',-apple-system,sans-serif;
  --gxn-font-mono: 'Space Mono',ui-monospace,'SFMono-Regular',monospace;
  --gxn-fs-display: 82px;
  --gxn-fs-h1: 58px;
  --gxn-fs-h2: 40px;
  --gxn-fs-h3: 32px;
  --gxn-fs-body: 28px;
  --gxn-fs-label: 24px;
  --gxn-fs-stat: 112px;

  /* \u2500\u2500 space \u2500\u2500 */
  --gxn-px: 108px;
  --gxn-py: 88px;
  --gxn-gap: 32px;
  --gxn-radius: 24px;

  font-family: var(--gxn-font-sans);
  color: var(--gxn-text);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* \u2500\u2500 slide frame \u2500\u2500 */
.${f}.gxn-slide{
  position:absolute; inset:0; width:100%; height:100%;
  box-sizing:border-box;
  background:
    radial-gradient(1200px 760px at 84% -14%, rgba(var(--gxn-glow),0.14), transparent 60%),
    radial-gradient(960px 680px at -8% 116%, rgba(78,162,255,0.10), transparent 60%),
    var(--gxn-bg);
  overflow:hidden;
}
.gxn-slide *{ box-sizing:border-box; }
/* faint dot grid texture */
.gxn-slide::before{
  content:''; position:absolute; inset:0; pointer-events:none;
  background-image: radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1.4px);
  background-size: 38px 38px;
  mask-image: radial-gradient(120% 120% at 50% 40%, #000 30%, transparent 86%);
  opacity:.7;
}
.gxn-pad{ position:absolute; inset:0; padding: var(--gxn-py) var(--gxn-px); display:flex; flex-direction:column; }

/* \u2500\u2500 header lockup (parallel across slides) \u2500\u2500 */
.gxn-kicker{
  display:inline-flex; align-items:center; gap:12px;
  font-family:var(--gxn-font-mono); font-size:var(--gxn-fs-label);
  letter-spacing:.18em; text-transform:uppercase; color:var(--gxn-accent);
  text-shadow:0 0 18px rgba(var(--gxn-glow),0.55);
  margin:0;
}
.gxn-kicker::before{
  content:''; width:34px; height:2px; border-radius:2px;
  background:linear-gradient(90deg,var(--gxn-accent),transparent);
  box-shadow:0 0 14px rgba(var(--gxn-glow),0.8);
}
.gxn-title{
  font-family:var(--gxn-font-sans); font-weight:700; font-size:var(--gxn-fs-h1);
  line-height:1.08; letter-spacing:-0.01em; margin:0; color:var(--gxn-text);
}
.gxn-title .gxn-em{ color:var(--gxn-accent); text-shadow:0 0 26px rgba(var(--gxn-glow),0.5); }
.gxn-sub{ font-size:var(--gxn-fs-h3); color:var(--gxn-dim); margin:0; font-weight:400; line-height:1.4; }

/* \u2500\u2500 panels / cards \u2500\u2500 */
/* Panels adopt the "\u70AB\u5149 / rim-glow" technique (studied from the ticket card):
   a radial wash that darkens the centre and tints the edge, an INSET rim
   bloom that hugs the rounded-rect border like backlit glass, and \u2014 on focus \u2014
   a brighter inner rim plus an outer halo. Re-tinted from the source's violet
   to the deck's green accent so it stays on-theme. */
.gxn-panel{
  position:relative; border-radius:var(--gxn-radius);
  background:
    radial-gradient(132% 132% at 50% 50%, rgba(255,255,255,0) 58%, rgba(var(--gxn-glow),0.035) 90%, rgba(var(--gxn-glow),0.085) 100%),
    linear-gradient(165deg,var(--gxn-panel-a),var(--gxn-panel-b));
  border:1px solid var(--gxn-line);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.06),
    inset 0 0 42px -16px rgba(var(--gxn-glow),0.20),
    0 26px 60px -40px rgba(0,0,0,0.9);
  transition: border-color .35s ease, box-shadow .35s ease, background .35s ease, transform .35s ease;
}
.gxn-panel.is-focus{
  border-color: transparent;
  background:
    radial-gradient(130% 130% at 50% 44%, rgba(7,9,11,0) 46%, rgba(var(--gxn-glow),0.07) 82%, rgba(var(--gxn-glow),0.16) 100%),
    linear-gradient(165deg,var(--gxn-panel-a),var(--gxn-panel-b));
  box-shadow:
    inset 0 0 0 1.5px rgba(var(--gxn-glow),0.62),     /* crisp rim line   */
    inset 0 0 30px -4px rgba(var(--gxn-glow),0.46),   /* tight inner bloom */
    inset 0 0 96px 8px rgba(var(--gxn-glow),0.14),    /* soft falloff      */
    0 0 84px -8px rgba(var(--gxn-glow),0.60),         /* outer halo        */
    0 26px 70px -42px rgba(0,0,0,0.9);
}
.gxn-panel.is-dim{ opacity:.46; filter:saturate(.7); }

.gxn-mono{ font-family:var(--gxn-font-mono); letter-spacing:.04em; }
.gxn-num{ font-family:var(--gxn-font-display); font-variant-numeric:tabular-nums lining-nums; font-feature-settings:"tnum" 1; }

/* index chip */
.gxn-index{
  font-family:var(--gxn-font-mono); font-size:var(--gxn-fs-label);
  color:var(--gxn-faint); letter-spacing:.1em;
}

/* legend */
.gxn-legend{ display:flex; flex-direction:column; gap:18px; }
.gxn-legend-row{ display:flex; align-items:center; gap:16px; transition:opacity .3s ease; }
.gxn-legend-row.is-dim{ opacity:.4; }
.gxn-dot{ width:16px; height:16px; border-radius:5px; flex:0 0 auto; box-shadow:0 0 16px -2px currentColor; }

/* image slot */
.gxn-slot{
  position:relative; overflow:hidden; border-radius:18px;
  background:
    repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 12px, rgba(255,255,255,0.015) 12px 24px);
  border:1px solid var(--gxn-line);
  display:flex; align-items:center; justify-content:center;
}
.gxn-slot.is-filled{ background:#0b0d10; border-color:rgba(var(--gxn-glow),0.3);
  box-shadow:0 0 56px -22px rgba(var(--gxn-glow),0.6); }
.gxn-slot img,.gxn-slot video{ width:100%; height:100%; object-fit:cover; display:block; }
.gxn-slot-cap{ font-family:var(--gxn-font-mono); font-size:24px; color:var(--gxn-faint);
  letter-spacing:.06em; text-align:center; padding:10px; }
.gxn-slot-btn{
  position:absolute; appearance:none; border:0; cursor:pointer; font-family:var(--gxn-font-mono);
}
.gxn-slot-add{ inset:0; width:100%; height:100%; background:transparent; color:var(--gxn-dim); }
.gxn-slot-add:hover{ background:rgba(var(--gxn-glow),0.05); color:var(--gxn-accent); }
.gxn-slot-clear{
  top:10px; right:10px; width:30px; height:30px; border-radius:50%;
  background:rgba(0,0,0,0.55); color:#fff; font-size:15px; line-height:1;
  backdrop-filter:blur(8px); display:none; align-items:center; justify-content:center;
}
.gxn-slot.is-filled:hover .gxn-slot-clear{ display:flex; }
/* focused image slot \u2014 accent ring + halo (used by gallery/showcase) */
.gxn-slot.is-focus{
  border-color: var(--gxn-accent);
  box-shadow:
    inset 0 0 0 2px rgba(var(--gxn-glow),0.55),
    0 0 64px -16px rgba(var(--gxn-glow),0.72);
}
/* caption overlay on a filled slot */
.gxn-slot-overlay{
  position:absolute; left:0; right:0; bottom:0; z-index:2;
  display:flex; align-items:center; gap:12px; padding:18px 20px;
  background:linear-gradient(to top, rgba(4,6,8,0.82), rgba(4,6,8,0.32) 62%, transparent);
  pointer-events:none;
}
.gxn-slot-overlay .gxn-cap-idx{
  font-family:var(--gxn-font-mono); font-size:24px; line-height:1; color:var(--gxn-accent);
  text-shadow:0 0 16px rgba(var(--gxn-glow),0.7);
}
.gxn-slot-overlay .gxn-cap-txt{
  font-family:var(--gxn-font-sans); font-weight:500; font-size:24px; color:#f3f6f4; letter-spacing:.01em;
}

/* entrance \u2014 visible end-state is base; animate from hidden only when active */
@media (prefers-reduced-motion: no-preference){
  [data-deck-active] .gxn-rise{ animation: gxn-rise .62s cubic-bezier(.2,.7,.25,1) both; }
  [data-deck-active] .gxn-rise-2{ animation: gxn-rise .62s cubic-bezier(.2,.7,.25,1) .08s both; }
  [data-deck-active] .gxn-rise-3{ animation: gxn-rise .62s cubic-bezier(.2,.7,.25,1) .16s both; }
  [data-deck-active] .gxn-rise-4{ animation: gxn-rise .62s cubic-bezier(.2,.7,.25,1) .24s both; }
}
@keyframes gxn-rise{ from{ opacity:0; transform:translateY(22px); } to{ opacity:1; transform:none; } }

/* \u2500\u2500 flowing neon sphere (hub orb, shared by relation slides) \u2500\u2500
   A filled accent gradient over an opaque base; .is-flow drifts the gradient
   so the orb's surface appears to flow. Scheme-aware via the accent vars. */
.gxn-sphere{
  background: linear-gradient(125deg, var(--gxn-accent) 0%, var(--gxn-accent-2) 44%, var(--gxn-accent) 100%);
  background-size: 100% 100%;
}
.gxn-sphere.is-flow{
  background-size: 240% 240%;
  animation: gxn-sphere-flow 7s ease-in-out infinite alternate;
}
@keyframes gxn-sphere-flow{ 0%{ background-position:0% 50%; } 100%{ background-position:100% 50%; } }
@media (prefers-reduced-motion: reduce){ .gxn-sphere.is-flow{ animation:none; } }
`;function S(){return O.useEffect(()=>{if(document.getElementById(y))return;let n=document.createElement("style");n.id=y,n.textContent=j,document.head.appendChild(n)},[]),null}var c={green:{label:"\u9713\u8679\u7EFF",vars:{},chart:{accent:"#2fe07f",accent2:"#b9f24a",cool:"#4ea2ff",glow:"47,224,127"},palette:x,aurora:["#2fe07f","#b9f24a","#2fe0c4","#4ea2ff","#9b7dff"],ticket:{glow:"47,224,127",accent:"#a8f6cd",text:"#eafff4",dim:"rgba(234,255,244,0.82)",faint:"rgba(234,255,244,0.56)",fillA:"#0a1d13",fillB:"#06110b",edge:"#9bf3c4"}},violet:{label:"\u70AB\u5149\u7D2B",vars:{"--gxn-bg":"#08081c","--gxn-accent":"#9b82ff","--gxn-accent-2":"#c4b3ff","--gxn-accent-cool":"#5aa0ff","--gxn-glow":"150,120,255"},chart:{accent:"#9b82ff",accent2:"#c4b3ff",cool:"#5aa0ff",glow:"150,120,255"},palette:["#9b82ff","#5ad1ff","#6f8bff","#ff8fce","#c4b3ff","#7b67ff","#ffc24a"],aurora:["#9b82ff","#5ad1ff","#c4b3ff","#ff8fce","#6f8bff"],ticket:{glow:"150,120,255",accent:"#cfc4ff",text:"#f3f1ff",dim:"rgba(239,234,255,0.82)",faint:"rgba(239,234,255,0.58)",fillA:"#17123c",fillB:"#0c0822",edge:"#c9bcff"}}};var M={hero:{frame:"gxn-orbit",surface:"open",titleClass:"display",titleScale:72,quoteMode:"pull"},editorial:{frame:"gxn-orbit",surface:"open",titleScale:62,listMode:"rail",quoteMode:"pull"},split:{frame:"gxn-split",surface:"neon-ticket",listMode:"ledger"},comparison:{frame:"gxn-comparison",surface:"neon-ticket",listMode:"comparison"},process:{frame:"gxn-process",surface:"open",listMode:"process"},matrix:{frame:"gxn-matrix",surface:"neon-ticket",quoteMode:"matrix"},"metric-spotlight":{frame:"gxn-metrics",surface:"open",metricMode:"band"},timeline:{frame:"gxn-timeline",surface:"open",listMode:"timeline"},"chart-led":{frame:"gxn-chart",surface:"open",chartMode:"plot"}},$=v({sourceTokens:r,sourcePath:"theme02/source/src/gxnTheme.js",Runtime:S,rootClass:`${f} gxn-slide`,familyRecipes:M,base:{bg:r.bg,surface:c.green.ticket.fillA,ink:r.text,muted:r.textDim,accent:r.accent,accent2:r.accent2,line:"rgba(255,255,255,.09)",fontDisplay:"'Space Grotesk','Noto Sans SC',-apple-system,sans-serif",fontBody:"'Noto Sans SC','Space Grotesk',-apple-system,sans-serif",fontMono:"'Space Mono',ui-monospace,'SFMono-Regular',monospace",typeScale:{kicker:24,title:58,subtitle:40,body:28,label:24,caption:24,metric:112},pad:108,gap:32,radius:24,shadow:"inset 0 1px 0 rgba(255,255,255,.06),inset 0 0 42px -16px rgba(47,224,127,.2),0 26px 60px -40px rgba(0,0,0,.9)",cardTreatment:{mode:"neon-ticket",padding:30,borderWidth:1,borderStyle:"solid",backdropFilter:"none"},mediaTreatment:{radius:18,filter:"none",overlay:"linear-gradient(to top,rgba(4,6,8,.52),transparent 46%)",border:"1px solid rgba(47,224,127,.3)"},chartTreatment:{grid:"rgba(255,255,255,.09)",label:r.textDim,series:x,barRadius:18,strokeWidth:7},shapeTreatment:{lineWidth:2,panelRadius:24,panelBorderWidth:1},decoration:"theme02-grid"},backgrounds:{default:{},surface:{bg:c.green.ticket.fillB},muted:{bg:c.green.ticket.fillA},accent:w(r.accent,r.bg,r.accentCool),dark:{bg:r.bg},light:{bg:c.green.ticket.fillA}}});var T=k({theme02:$},{fallbackKey:"theme02"}),D=T.profiles,K=T.getBespokeThemeProfile;export{h as BESPOKE_FAMILIES,D as BESPOKE_THEME_PROFILES,K as getBespokeThemeProfile};
