var tt=Object.defineProperty;var w=(t,e)=>{for(var r in e)tt(t,r,{get:e[r],enumerable:!0})};import*as z from"react";var D={};w(D,{BESPOKE_FAMILIES:()=>_,BESPOKE_THEME_PROFILES:()=>dt,getBespokeThemeProfile:()=>pt});import"react";var se='"Noto Sans SC","PingFang SC","Microsoft YaHei",system-ui,sans-serif',_=Object.freeze(["hero","editorial","split","comparison","process","matrix","metric-spotlight","timeline","chart-led"]),at=Object.freeze({frame:"neutral",surface:"cards",titleClass:"title",titleScale:null,listMode:"stack",quoteMode:"card",metricMode:"card",chartMode:"card"});function rt(t){let e=Object.fromEntries(_.map(r=>[r,Object.freeze({...at,...t.familyRecipes?.[r]||{}})]));return Object.freeze({...t,familyRecipes:Object.freeze(e),sourcePrimitives:Object.freeze({...t.sourcePrimitives||{}}),rootVars:Object.freeze({...t.rootVars||{}}),base:Object.freeze(t.base),backgrounds:Object.freeze(Object.fromEntries(Object.entries(t.backgrounds).map(([r,a])=>[r,Object.freeze(a)])))})}function it(t,{fallbackKey:e="theme01"}={}){let r=Object.entries(t||{}).filter(([,n])=>n);if(!r.length)throw new Error("createBespokeThemeProfileRegistry: no theme adapters.");let a=Object.freeze(Object.fromEntries(r)),i=Object.hasOwn(a,e)?e:r[0][0],s=Object.freeze(Object.fromEntries(r.map(([n,c])=>[n,ce(n,c,"default")]))),l=new Map;function b(n,c="default"){let o=Object.hasOwn(a,n)?n:i,f=a[o].backgrounds[c]?c:"default";if(f==="default")return s[o];let d=`${o}:${f}`;return l.has(d)||l.set(d,ce(o,a[o],f)),l.get(d)}return Object.freeze({profiles:s,getBespokeThemeProfile:b})}function ce(t,e,r){let a=e.backgrounds[r]||e.backgrounds.default,i=e.base,s={...i,...a,themeKey:t,semanticBackground:r,sourceTokens:e.sourceTokens,sourcePath:e.sourcePath,sourcePrimitives:e.sourcePrimitives,cssText:e.cssText||"",Runtime:e.Runtime||null,rootClass:a.rootClass||e.rootClass||"",rootVars:Object.freeze({...e.rootVars,...a.rootVars||{}}),familyRecipes:e.familyRecipes,frame:Object.freeze({...i.frame||{},...a.frame||{}}),textTreatment:Object.freeze({...i.textTreatment||{},...a.textTreatment||{}}),cardTreatment:Object.freeze({...i.cardTreatment,...a.cardTreatment||{}}),typeScale:Object.freeze({...i.typeScale,...a.typeScale||{}}),mediaTreatment:Object.freeze({...i.mediaTreatment,...a.mediaTreatment||{}}),chartTreatment:Object.freeze({...i.chartTreatment,...a.chartTreatment||{},series:Object.freeze([...a.chartTreatment?.series||i.chartTreatment.series||[]])}),shapeTreatment:Object.freeze({...i.shapeTreatment,...a.shapeTreatment||{}})};return Object.freeze(s)}function le(t,e,r){return{bg:t,surface:"rgba(0,0,0,.12)",ink:e,muted:e==="#ffffff"?"rgba(255,255,255,.74)":"rgba(0,0,0,.64)",line:e==="#ffffff"?"rgba(255,255,255,.24)":"rgba(0,0,0,.2)",accent2:r}}function nt(t){let e={};for(let r of String(t).matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi))e[r[1]]=r[2].trim();return Object.freeze(e)}function pe(t,e){let r=nt(t)[e],a=Number.parseFloat(r);if(!Number.isFinite(a))throw new Error(`Missing numeric theme token ${e}`);return a}function K(t,e,r){let a=e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),i=String(t).match(new RegExp(`${a}\\s*\\{([\\s\\S]*?)\\}`))?.[1]||"",s=r.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),l=i.match(new RegExp(`(?:^|;)\\s*${s}\\s*:\\s*([\\s\\S]*?)(?=;|$)`))?.[1]?.trim();if(!l)throw new Error(`Missing ${e} ${r} in canonical theme CSS`);return l.replace(/\s+/g," ")}var S={ink:"#2b2b30",ink2:"#56565c",ink3:"#9a9ba4",red:"#e8503a",blue:"#5b8def",green:"#46b083",amber:"#e0a23a",violet:"#7a5ae0",series:["#5b8def","#46b083","#e0a23a","#e8503a","#7a5ae0"]},C=`
.aip-root{
  --aip-type-display:128px; --aip-type-title:78px; --aip-type-subtitle:42px;
  --aip-type-en:28px; --aip-type-body:30px; --aip-type-small:24px; --aip-type-mono:24px;
  --aip-pad-x:108px; --aip-pad-top:92px; --aip-pad-bottom:84px; --aip-gap:40px;
  --aip-ink:#2b2b30; --aip-ink-2:#56565c; --aip-ink-3:#9a9ba4;
  --aip-red:#e8503a; --aip-blue:#5b8def; --aip-green:#46b083; --aip-amber:#e0a23a; --aip-violet:#7a5ae0;
  position:relative; width:100%; height:100%; overflow:hidden;
  font-family:'Noto Sans SC',system-ui,sans-serif; color:var(--aip-ink);
  -webkit-font-smoothing:antialiased;
}
.aip-root *{box-sizing:border-box;}

/* backgrounds */
.aip-bg{position:absolute;inset:0;}
.aip-bg-a{background:
  radial-gradient(40% 52% at 16% 20%, rgba(120,150,255,.22), transparent 70%),
  radial-gradient(34% 44% at 84% 14%, rgba(255,150,195,.18), transparent 72%),
  radial-gradient(42% 52% at 80% 84%, rgba(110,212,172,.20), transparent 72%),
  radial-gradient(36% 46% at 22% 88%, rgba(245,202,128,.16), transparent 72%),
  linear-gradient(135deg, #eef0f5, #e6e7ee);}
.aip-bg-b{background:
  radial-gradient(38% 50% at 82% 18%, rgba(245,196,150,.22), transparent 72%),
  radial-gradient(36% 46% at 14% 26%, rgba(150,170,255,.18), transparent 72%),
  radial-gradient(44% 54% at 24% 86%, rgba(255,160,190,.16), transparent 72%),
  radial-gradient(38% 48% at 84% 82%, rgba(120,210,180,.16), transparent 72%),
  linear-gradient(135deg, #f1efec, #e9e8e6);}
.aip-bg::after{content:"";position:absolute;inset:0;
  background:radial-gradient(120% 80% at 50% -10%, rgba(255,255,255,.55), transparent 55%);}

.aip-content{position:absolute;inset:0;
  padding:var(--aip-pad-top) var(--aip-pad-x) var(--aip-pad-bottom);
  display:flex;flex-direction:column;}

/* tags / pills */
.aip-tag{display:inline-block;white-space:nowrap;padding:5px 15px;border-radius:9px;color:#fff;
  font-weight:700;font-size:var(--aip-type-small);letter-spacing:.04em;line-height:1.3;}
.aip-tag-red{background:var(--aip-red);} .aip-tag-blue{background:var(--aip-blue);}
.aip-tag-green{background:var(--aip-green);} .aip-tag-amber{background:var(--aip-amber);}
.aip-tag-violet{background:var(--aip-violet);}

.aip-mono{font-family:'Space Mono',monospace;color:var(--aip-ink-3);
  font-size:var(--aip-type-mono);letter-spacing:.02em;margin-top:34px;}
.aip-en{font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:.16em;
  color:#aaabb4;font-size:var(--aip-type-en);}

/* slide head block */
.aip-head{display:flex;flex-direction:column;gap:14px;}
.aip-head .aip-kicker{align-self:flex-start;}
.aip-head h2{margin:0;font-size:var(--aip-type-title);font-weight:900;color:var(--aip-ink);
  letter-spacing:.012em;line-height:1.05;}
.aip-head .aip-sub{display:flex;align-items:baseline;gap:20px;flex-wrap:wrap;}
.aip-head .aip-sub .aip-cn{font-size:var(--aip-type-subtitle);font-weight:700;color:#7e7f8a;}

.aip-glass{background:rgba(255,255,255,.5);backdrop-filter:blur(28px) saturate(140%);
  -webkit-backdrop-filter:blur(28px) saturate(140%);
  border:1px solid rgba(255,255,255,.7);border-radius:24px;
  box-shadow:0 1px 0 rgba(255,255,255,.75) inset,0 24px 60px rgba(70,72,100,.13);}

/* entrance \u2014 transform-only so a frozen/paused timeline or print/reduced-motion
   can never hide content; the visible end-state is the base style. */
@media (prefers-reduced-motion:no-preference){
  [data-deck-active] .aip-content > *{animation:aip-rise .55s both;}
  [data-deck-active] .aip-content > *:nth-child(2){animation-delay:.05s;}
  [data-deck-active] .aip-content > *:nth-child(3){animation-delay:.1s;}
  [data-deck-active] .aip-content > *:nth-child(4){animation-delay:.15s;}
  @keyframes aip-rise{from{transform:translateY(14px);}to{transform:none;}}
}

/* Full-bleed media layers (data-aip-media-layer) sit under the typographic
   layers (z 3-4), and the entrance animation above pins every .aip-content
   child in its own stacking context \u2014 an empty slot's own z-index can never
   escape it, so under a full-page composition (mag cover) the slot is
   unclickable everywhere. While the slot is EMPTY and the deck is in edit
   mode, lift the media layer above the type so click-to-upload works
   anywhere; once media lands (or in view/present mode) the layer drops back
   under the text. Same trade-off the theme04 hero cover shipped with, gated
   tighter. */
/* !important: some layers carry an inline z-index (hero overlay pins itself
   at 0); the edit-mode lift must beat inline values too. */
body[data-mode="edit"] [data-aip-media-layer]:has([data-aip-slot-empty]){z-index:6 !important;}
`,fe=K(C,".aip-bg-a","background"),ot=K(C,".aip-bg-b","background"),de=K(C,".aip-glass","background"),st=K(C,".aip-glass","box-shadow"),ct=pe(C,"--aip-pad-x"),lt=pe(C,"--aip-gap"),ft=rt({sourceTokens:S,sourcePath:"theme01/source/slides/theme.js",cssText:C,rootClass:"aip-root",base:{bg:fe,surface:de,ink:S.ink,muted:S.ink2,accent:S.red,accent2:S.blue,line:"rgba(43,43,48,.14)",fontDisplay:se,fontBody:se,fontMono:"'Space Mono',monospace",typeScale:{kicker:24,title:78,subtitle:42,body:30,label:24,caption:24,metric:128},pad:ct,gap:lt,radius:24,shadow:st,cardTreatment:{padding:30,borderWidth:1,borderStyle:"solid",backdropFilter:"blur(28px) saturate(140%)"},mediaTreatment:{radius:20,filter:"none",overlay:"linear-gradient(180deg,transparent 62%,rgba(43,43,48,.18))",border:"1px solid rgba(255,255,255,.7)"},chartTreatment:{grid:"rgba(43,43,48,.14)",label:S.ink2,series:S.series,barRadius:9,strokeWidth:6},shapeTreatment:{lineWidth:3,panelRadius:24,panelBorderWidth:1},decoration:"theme01-bokeh"},backgrounds:{default:{},surface:{bg:de},muted:{bg:ot},accent:le(S.red,"#ffffff",S.blue),dark:le(S.ink,"#ffffff",S.red),light:{bg:fe}}}),me=it({theme01:ft},{fallbackKey:"theme01"}),dt=me.profiles,pt=me.getBespokeThemeProfile;var G={};w(G,{BESPOKE_FAMILIES:()=>ue,BESPOKE_THEME_PROFILES:()=>vt,getBespokeThemeProfile:()=>jt});import"react";import ht from"react";var ue=Object.freeze(["hero","editorial","split","comparison","process","matrix","metric-spotlight","timeline","chart-led"]),mt=Object.freeze({frame:"neutral",surface:"cards",titleClass:"title",titleScale:null,listMode:"stack",quoteMode:"card",metricMode:"card",chartMode:"card"});function gt(t){let e=Object.fromEntries(ue.map(r=>[r,Object.freeze({...mt,...t.familyRecipes?.[r]||{}})]));return Object.freeze({...t,familyRecipes:Object.freeze(e),sourcePrimitives:Object.freeze({...t.sourcePrimitives||{}}),rootVars:Object.freeze({...t.rootVars||{}}),base:Object.freeze(t.base),backgrounds:Object.freeze(Object.fromEntries(Object.entries(t.backgrounds).map(([r,a])=>[r,Object.freeze(a)])))})}function bt(t,{fallbackKey:e="theme01"}={}){let r=Object.entries(t||{}).filter(([,n])=>n);if(!r.length)throw new Error("createBespokeThemeProfileRegistry: no theme adapters.");let a=Object.freeze(Object.fromEntries(r)),i=Object.hasOwn(a,e)?e:r[0][0],s=Object.freeze(Object.fromEntries(r.map(([n,c])=>[n,ge(n,c,"default")]))),l=new Map;function b(n,c="default"){let o=Object.hasOwn(a,n)?n:i,f=a[o].backgrounds[c]?c:"default";if(f==="default")return s[o];let d=`${o}:${f}`;return l.has(d)||l.set(d,ge(o,a[o],f)),l.get(d)}return Object.freeze({profiles:s,getBespokeThemeProfile:b})}function ge(t,e,r){let a=e.backgrounds[r]||e.backgrounds.default,i=e.base,s={...i,...a,themeKey:t,semanticBackground:r,sourceTokens:e.sourceTokens,sourcePath:e.sourcePath,sourcePrimitives:e.sourcePrimitives,cssText:e.cssText||"",Runtime:e.Runtime||null,rootClass:a.rootClass||e.rootClass||"",rootVars:Object.freeze({...e.rootVars,...a.rootVars||{}}),familyRecipes:e.familyRecipes,frame:Object.freeze({...i.frame||{},...a.frame||{}}),textTreatment:Object.freeze({...i.textTreatment||{},...a.textTreatment||{}}),cardTreatment:Object.freeze({...i.cardTreatment,...a.cardTreatment||{}}),typeScale:Object.freeze({...i.typeScale,...a.typeScale||{}}),mediaTreatment:Object.freeze({...i.mediaTreatment,...a.mediaTreatment||{}}),chartTreatment:Object.freeze({...i.chartTreatment,...a.chartTreatment||{},series:Object.freeze([...a.chartTreatment?.series||i.chartTreatment.series||[]])}),shapeTreatment:Object.freeze({...i.shapeTreatment,...a.shapeTreatment||{}})};return Object.freeze(s)}function ut(t,e,r){return{bg:t,surface:"rgba(0,0,0,.12)",ink:e,muted:e==="#ffffff"?"rgba(255,255,255,.74)":"rgba(0,0,0,.64)",line:e==="#ffffff"?"rgba(255,255,255,.24)":"rgba(0,0,0,.2)",accent2:r}}var L="gxn-theme",A=["#2fe07f","#b9f24a","#2fe0c4","#4ea2ff","#9b7dff","#ff6fae","#ffc24a"],E={accent:"#2fe07f",accent2:"#b9f24a",accentCool:"#4ea2ff",glowRGB:"47, 224, 127",bg:"#07090b",text:"#eef3f1",textDim:"rgba(238,243,241,0.58)",textFaint:"rgba(238,243,241,0.34)",palette:A},be="gxn-theme-style",xt=`
.${L}{
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
.${L}.gxn-slide{
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
`;function kt(){return ht.useEffect(()=>{if(document.getElementById(be))return;let t=document.createElement("style");t.id=be,t.textContent=xt,document.head.appendChild(t)},[]),null}var V={green:{label:"\u9713\u8679\u7EFF",vars:{},chart:{accent:"#2fe07f",accent2:"#b9f24a",cool:"#4ea2ff",glow:"47,224,127"},palette:A,aurora:["#2fe07f","#b9f24a","#2fe0c4","#4ea2ff","#9b7dff"],ticket:{glow:"47,224,127",accent:"#a8f6cd",text:"#eafff4",dim:"rgba(234,255,244,0.82)",faint:"rgba(234,255,244,0.56)",fillA:"#0a1d13",fillB:"#06110b",edge:"#9bf3c4"}},violet:{label:"\u70AB\u5149\u7D2B",vars:{"--gxn-bg":"#08081c","--gxn-accent":"#9b82ff","--gxn-accent-2":"#c4b3ff","--gxn-accent-cool":"#5aa0ff","--gxn-glow":"150,120,255"},chart:{accent:"#9b82ff",accent2:"#c4b3ff",cool:"#5aa0ff",glow:"150,120,255"},palette:["#9b82ff","#5ad1ff","#6f8bff","#ff8fce","#c4b3ff","#7b67ff","#ffc24a"],aurora:["#9b82ff","#5ad1ff","#c4b3ff","#ff8fce","#6f8bff"],ticket:{glow:"150,120,255",accent:"#cfc4ff",text:"#f3f1ff",dim:"rgba(239,234,255,0.82)",faint:"rgba(239,234,255,0.58)",fillA:"#17123c",fillB:"#0c0822",edge:"#c9bcff"}}},yt={hero:{frame:"gxn-orbit",surface:"open",titleClass:"display",titleScale:72,quoteMode:"pull"},editorial:{frame:"gxn-orbit",surface:"open",titleScale:62,listMode:"rail",quoteMode:"pull"},split:{frame:"gxn-split",surface:"neon-ticket",listMode:"ledger"},comparison:{frame:"gxn-comparison",surface:"neon-ticket",listMode:"comparison"},process:{frame:"gxn-process",surface:"open",listMode:"process"},matrix:{frame:"gxn-matrix",surface:"neon-ticket",quoteMode:"matrix"},"metric-spotlight":{frame:"gxn-metrics",surface:"open",metricMode:"band"},timeline:{frame:"gxn-timeline",surface:"open",listMode:"timeline"},"chart-led":{frame:"gxn-chart",surface:"open",chartMode:"plot"}},Ot=gt({sourceTokens:E,sourcePath:"theme02/source/src/gxnTheme.js",Runtime:kt,rootClass:`${L} gxn-slide`,familyRecipes:yt,base:{bg:E.bg,surface:V.green.ticket.fillA,ink:E.text,muted:E.textDim,accent:E.accent,accent2:E.accent2,line:"rgba(255,255,255,.09)",fontDisplay:"'Space Grotesk','Noto Sans SC',-apple-system,sans-serif",fontBody:"'Noto Sans SC','Space Grotesk',-apple-system,sans-serif",fontMono:"'Space Mono',ui-monospace,'SFMono-Regular',monospace",typeScale:{kicker:24,title:58,subtitle:40,body:28,label:24,caption:24,metric:112},pad:108,gap:32,radius:24,shadow:"inset 0 1px 0 rgba(255,255,255,.06),inset 0 0 42px -16px rgba(47,224,127,.2),0 26px 60px -40px rgba(0,0,0,.9)",cardTreatment:{mode:"neon-ticket",padding:30,borderWidth:1,borderStyle:"solid",backdropFilter:"none"},mediaTreatment:{radius:18,filter:"none",overlay:"linear-gradient(to top,rgba(4,6,8,.52),transparent 46%)",border:"1px solid rgba(47,224,127,.3)"},chartTreatment:{grid:"rgba(255,255,255,.09)",label:E.textDim,series:A,barRadius:18,strokeWidth:7},shapeTreatment:{lineWidth:2,panelRadius:24,panelBorderWidth:1},decoration:"theme02-grid"},backgrounds:{default:{},surface:{bg:V.green.ticket.fillB},muted:{bg:V.green.ticket.fillA},accent:ut(E.accent,E.bg,E.accentCool),dark:{bg:E.bg},light:{bg:V.green.ticket.fillA}}}),he=bt({theme02:Ot},{fallbackKey:"theme02"}),vt=he.profiles,jt=he.getBespokeThemeProfile;var q={};w(q,{BESPOKE_FAMILIES:()=>ke,BESPOKE_THEME_PROFILES:()=>Rt,getBespokeThemeProfile:()=>Ft});import"react";import"react";var ke=Object.freeze(["hero","editorial","split","comparison","process","matrix","metric-spotlight","timeline","chart-led"]),Tt=Object.freeze({frame:"neutral",surface:"cards",titleClass:"title",titleScale:null,listMode:"stack",quoteMode:"card",metricMode:"card",chartMode:"card"});function zt(t){let e=Object.fromEntries(ke.map(r=>[r,Object.freeze({...Tt,...t.familyRecipes?.[r]||{}})]));return Object.freeze({...t,familyRecipes:Object.freeze(e),sourcePrimitives:Object.freeze({...t.sourcePrimitives||{}}),rootVars:Object.freeze({...t.rootVars||{}}),base:Object.freeze(t.base),backgrounds:Object.freeze(Object.fromEntries(Object.entries(t.backgrounds).map(([r,a])=>[r,Object.freeze(a)])))})}function wt(t,{fallbackKey:e="theme01"}={}){let r=Object.entries(t||{}).filter(([,n])=>n);if(!r.length)throw new Error("createBespokeThemeProfileRegistry: no theme adapters.");let a=Object.freeze(Object.fromEntries(r)),i=Object.hasOwn(a,e)?e:r[0][0],s=Object.freeze(Object.fromEntries(r.map(([n,c])=>[n,xe(n,c,"default")]))),l=new Map;function b(n,c="default"){let o=Object.hasOwn(a,n)?n:i,f=a[o].backgrounds[c]?c:"default";if(f==="default")return s[o];let d=`${o}:${f}`;return l.has(d)||l.set(d,xe(o,a[o],f)),l.get(d)}return Object.freeze({profiles:s,getBespokeThemeProfile:b})}function xe(t,e,r){let a=e.backgrounds[r]||e.backgrounds.default,i=e.base,s={...i,...a,themeKey:t,semanticBackground:r,sourceTokens:e.sourceTokens,sourcePath:e.sourcePath,sourcePrimitives:e.sourcePrimitives,cssText:e.cssText||"",Runtime:e.Runtime||null,rootClass:a.rootClass||e.rootClass||"",rootVars:Object.freeze({...e.rootVars,...a.rootVars||{}}),familyRecipes:e.familyRecipes,frame:Object.freeze({...i.frame||{},...a.frame||{}}),textTreatment:Object.freeze({...i.textTreatment||{},...a.textTreatment||{}}),cardTreatment:Object.freeze({...i.cardTreatment,...a.cardTreatment||{}}),typeScale:Object.freeze({...i.typeScale,...a.typeScale||{}}),mediaTreatment:Object.freeze({...i.mediaTreatment,...a.mediaTreatment||{}}),chartTreatment:Object.freeze({...i.chartTreatment,...a.chartTreatment||{},series:Object.freeze([...a.chartTreatment?.series||i.chartTreatment.series||[]])}),shapeTreatment:Object.freeze({...i.shapeTreatment,...a.shapeTreatment||{}})};return Object.freeze(s)}function St(t,e,r){return{bg:t,surface:"rgba(0,0,0,.12)",ink:e,muted:e==="#ffffff"?"rgba(255,255,255,.74)":"rgba(0,0,0,.64)",line:e==="#ffffff"?"rgba(255,255,255,.24)":"rgba(0,0,0,.2)",accent2:r}}function v(t,e){return`var(${t},${e})`}var Et={bg:"#d6d6d3",ink:"#161513",ink2:"#5c5b57",ink3:"#908f8a",line:"rgba(22,21,19,0.20)",line2:"rgba(22,21,19,0.10)",blue:"#2742ec",blueInk:"#f3f5ff",lime:"#c2f53d",panel:"#1a1916",fog:"rgba(22,21,19,0.07)"},Pt=["#2b2a27","#56544f","#84827c","#a9a7a1","#c4c2bc"],P=Et,Ct=Pt,H={sans:'"Archivo","Noto Sans SC",system-ui,sans-serif',mono:'"Space Mono",ui-monospace,monospace'},Mt={hero:{frame:"rd-masthead",surface:"open",titleClass:"display",titleScale:116,quoteMode:"pull"},editorial:{frame:"rd-editorial-rail",surface:"open",titleClass:"title",titleScale:70,listMode:"rail",quoteMode:"pull"},split:{frame:"rd-split-rule",surface:"open",titleClass:"title",titleScale:64,listMode:"ledger"},comparison:{frame:"rd-comparison-axis",surface:"open",titleClass:"headline",titleScale:58,listMode:"comparison"},process:{frame:"rd-process-path",surface:"open",titleClass:"headline",titleScale:56,listMode:"process"},matrix:{frame:"rd-matrix-grid",surface:"open",titleClass:"headline",titleScale:54,quoteMode:"matrix"},"metric-spotlight":{frame:"rd-metric-band",surface:"open",titleClass:"headline",titleScale:56,metricMode:"band"},timeline:{frame:"rd-timeline-spine",surface:"open",titleClass:"headline",titleScale:54,listMode:"timeline"},"chart-led":{frame:"rd-chart-plot",surface:"open",titleClass:"headline",titleScale:52,chartMode:"plot"}},Bt=zt({sourceTokens:P,sourcePath:"theme03/source/src/theme.js + theme.css",rootClass:"rd-slide rd-dark",familyRecipes:Mt,base:{bg:v("--rd-bg","#161513"),surface:v("--rd-panel","#f3f2ee"),ink:v("--rd-ink","#f3f2ee"),muted:v("--rd-ink-2","#b8b6b0"),cardInk:"#161513",cardMuted:"#5c5b57",cardLine:"rgba(22,21,19,.2)",accent:v("--rd-blue","#6e85ff"),accent2:v("--rd-lime",P.lime),line:v("--rd-line","rgba(243,242,238,.22)"),fontDisplay:H.sans,fontBody:H.sans,fontMono:H.mono,typeScale:{kicker:24,title:62,subtitle:34,body:27,label:24,caption:24,metric:104},pad:120,gap:40,radius:0,shadow:"none",cardTreatment:{padding:28,borderWidth:1,borderStyle:"solid",backdropFilter:"none"},mediaTreatment:{radius:0,filter:"none",overlay:"none",border:`1px solid ${v("--rd-line","rgba(243,242,238,.22)")}`},chartTreatment:{grid:v("--rd-line-2","rgba(243,242,238,.10)"),label:v("--rd-ink-2","#b8b6b0"),series:[v("--rd-blue","#6e85ff"),v("--rd-lime",P.lime),...Ct],barRadius:0,strokeWidth:6},shapeTreatment:{lineWidth:2,panelRadius:0,panelBorderWidth:1},decoration:"none"},backgrounds:{default:{},surface:{bg:v("--rd-panel","#f3f2ee"),ink:"#161513",muted:"#5c5b57",line:"rgba(22,21,19,.2)"},muted:{bg:v("--rd-bg","#161513")},accent:St(v("--rd-blue","#6e85ff"),"#0d1330",v("--rd-lime",P.lime)),dark:{},light:{rootClass:"rd-slide",bg:P.bg,surface:"#ffffff",ink:P.ink,muted:P.ink2,line:P.line,accent:P.blue}}}),ye=wt({theme03:Bt},{fallbackKey:"theme03"}),Rt=ye.profiles,Ft=ye.getBespokeThemeProfile;var Y={};w(Y,{BESPOKE_FAMILIES:()=>je,BESPOKE_THEME_PROFILES:()=>It,getBespokeThemeProfile:()=>Nt});import"react";var je=Object.freeze(["hero","editorial","split","comparison","process","matrix","metric-spotlight","timeline","chart-led"]),$t=Object.freeze({frame:"neutral",surface:"cards",titleClass:"title",titleScale:null,listMode:"stack",quoteMode:"card",metricMode:"card",chartMode:"card"});function _t(t){let e=Object.fromEntries(je.map(r=>[r,Object.freeze({...$t,...t.familyRecipes?.[r]||{}})]));return Object.freeze({...t,familyRecipes:Object.freeze(e),sourcePrimitives:Object.freeze({...t.sourcePrimitives||{}}),rootVars:Object.freeze({...t.rootVars||{}}),base:Object.freeze(t.base),backgrounds:Object.freeze(Object.fromEntries(Object.entries(t.backgrounds).map(([r,a])=>[r,Object.freeze(a)])))})}function Kt(t,{fallbackKey:e="theme01"}={}){let r=Object.entries(t||{}).filter(([,n])=>n);if(!r.length)throw new Error("createBespokeThemeProfileRegistry: no theme adapters.");let a=Object.freeze(Object.fromEntries(r)),i=Object.hasOwn(a,e)?e:r[0][0],s=Object.freeze(Object.fromEntries(r.map(([n,c])=>[n,Oe(n,c,"default")]))),l=new Map;function b(n,c="default"){let o=Object.hasOwn(a,n)?n:i,f=a[o].backgrounds[c]?c:"default";if(f==="default")return s[o];let d=`${o}:${f}`;return l.has(d)||l.set(d,Oe(o,a[o],f)),l.get(d)}return Object.freeze({profiles:s,getBespokeThemeProfile:b})}function Oe(t,e,r){let a=e.backgrounds[r]||e.backgrounds.default,i=e.base,s={...i,...a,themeKey:t,semanticBackground:r,sourceTokens:e.sourceTokens,sourcePath:e.sourcePath,sourcePrimitives:e.sourcePrimitives,cssText:e.cssText||"",Runtime:e.Runtime||null,rootClass:a.rootClass||e.rootClass||"",rootVars:Object.freeze({...e.rootVars,...a.rootVars||{}}),familyRecipes:e.familyRecipes,frame:Object.freeze({...i.frame||{},...a.frame||{}}),textTreatment:Object.freeze({...i.textTreatment||{},...a.textTreatment||{}}),cardTreatment:Object.freeze({...i.cardTreatment,...a.cardTreatment||{}}),typeScale:Object.freeze({...i.typeScale,...a.typeScale||{}}),mediaTreatment:Object.freeze({...i.mediaTreatment,...a.mediaTreatment||{}}),chartTreatment:Object.freeze({...i.chartTreatment,...a.chartTreatment||{},series:Object.freeze([...a.chartTreatment?.series||i.chartTreatment.series||[]])}),shapeTreatment:Object.freeze({...i.shapeTreatment,...a.shapeTreatment||{}})};return Object.freeze(s)}function ve(t,e,r){return{bg:t,surface:"rgba(0,0,0,.12)",ink:e,muted:e==="#ffffff"?"rgba(255,255,255,.74)":"rgba(0,0,0,.64)",line:e==="#ffffff"?"rgba(255,255,255,.24)":"rgba(0,0,0,.2)",accent2:r}}var k=Object.freeze({rootClass:"xhs-base",background:Object.freeze({default:"#000000",surface:"#101010",muted:"#161616"}),ink:"#ffffff",muted:"#9a9a9a",lightInk:"#06140f",line:"rgba(255,255,255,.08)",palette:Object.freeze(["#27E021","#FFC700","#FF9FE2","#15A7F0"]),font:Object.freeze({sans:'"Noto Sans SC",-apple-system,"PingFang SC","Microsoft YaHei",sans-serif',mono:'"Space Mono",monospace'}),spacing:Object.freeze({pad:100,gap:40}),radius:22,shadow:"0 24px 60px rgba(0,0,0,.5)"}),M=k.palette,Vt=_t({sourceTokens:k,sourcePath:"theme04/source/theme-adapter.mjs",rootClass:k.rootClass,base:{bg:k.background.default,surface:"linear-gradient(180deg,#1c1c1c,#111111)",ink:k.ink,muted:k.muted,accent:M[0],accent2:M[1],line:k.line,fontDisplay:k.font.sans,fontBody:k.font.sans,fontMono:k.font.mono,typeScale:{kicker:24,title:54,subtitle:34,body:22,label:20,caption:20,metric:104},pad:k.spacing.pad,gap:k.spacing.gap,radius:k.radius,shadow:k.shadow,cardTreatment:{padding:34,borderWidth:1,borderStyle:"solid",backdropFilter:"none"},mediaTreatment:{radius:18,filter:"none",overlay:"linear-gradient(180deg,transparent 56%,rgba(0,0,0,.48))",border:"1.5px solid rgba(255,255,255,.08)"},chartTreatment:{grid:"rgba(255,255,255,.08)",label:"#bdbdbd",series:[...M,"#FF9FE2","#15A7F0"],barRadius:999,strokeWidth:4},shapeTreatment:{lineWidth:4,panelRadius:22,panelBorderWidth:1},decoration:"theme04-sparks"},backgrounds:{default:{},surface:{bg:k.background.surface},muted:{bg:k.background.muted},accent:ve(M[0],k.lightInk,M[1]),dark:{bg:k.background.default},light:ve(M[1],k.lightInk,M[0])}}),Te=Kt({theme04:Vt},{fallbackKey:"theme04"}),It=Te.profiles,Nt=Te.getBespokeThemeProfile;var X={};w(X,{BESPOKE_FAMILIES:()=>we,BESPOKE_THEME_PROFILES:()=>Ht,getBespokeThemeProfile:()=>qt});import"react";var we=Object.freeze(["hero","editorial","split","comparison","process","matrix","metric-spotlight","timeline","chart-led"]),Wt=Object.freeze({frame:"neutral",surface:"cards",titleClass:"title",titleScale:null,listMode:"stack",quoteMode:"card",metricMode:"card",chartMode:"card"});function Dt(t){let e=Object.fromEntries(we.map(r=>[r,Object.freeze({...Wt,...t.familyRecipes?.[r]||{}})]));return Object.freeze({...t,familyRecipes:Object.freeze(e),sourcePrimitives:Object.freeze({...t.sourcePrimitives||{}}),rootVars:Object.freeze({...t.rootVars||{}}),base:Object.freeze(t.base),backgrounds:Object.freeze(Object.fromEntries(Object.entries(t.backgrounds).map(([r,a])=>[r,Object.freeze(a)])))})}function Lt(t,{fallbackKey:e="theme01"}={}){let r=Object.entries(t||{}).filter(([,n])=>n);if(!r.length)throw new Error("createBespokeThemeProfileRegistry: no theme adapters.");let a=Object.freeze(Object.fromEntries(r)),i=Object.hasOwn(a,e)?e:r[0][0],s=Object.freeze(Object.fromEntries(r.map(([n,c])=>[n,ze(n,c,"default")]))),l=new Map;function b(n,c="default"){let o=Object.hasOwn(a,n)?n:i,f=a[o].backgrounds[c]?c:"default";if(f==="default")return s[o];let d=`${o}:${f}`;return l.has(d)||l.set(d,ze(o,a[o],f)),l.get(d)}return Object.freeze({profiles:s,getBespokeThemeProfile:b})}function ze(t,e,r){let a=e.backgrounds[r]||e.backgrounds.default,i=e.base,s={...i,...a,themeKey:t,semanticBackground:r,sourceTokens:e.sourceTokens,sourcePath:e.sourcePath,sourcePrimitives:e.sourcePrimitives,cssText:e.cssText||"",Runtime:e.Runtime||null,rootClass:a.rootClass||e.rootClass||"",rootVars:Object.freeze({...e.rootVars,...a.rootVars||{}}),familyRecipes:e.familyRecipes,frame:Object.freeze({...i.frame||{},...a.frame||{}}),textTreatment:Object.freeze({...i.textTreatment||{},...a.textTreatment||{}}),cardTreatment:Object.freeze({...i.cardTreatment,...a.cardTreatment||{}}),typeScale:Object.freeze({...i.typeScale,...a.typeScale||{}}),mediaTreatment:Object.freeze({...i.mediaTreatment,...a.mediaTreatment||{}}),chartTreatment:Object.freeze({...i.chartTreatment,...a.chartTreatment||{},series:Object.freeze([...a.chartTreatment?.series||i.chartTreatment.series||[]])}),shapeTreatment:Object.freeze({...i.shapeTreatment,...a.shapeTreatment||{}})};return Object.freeze(s)}function At(t,e,r){return{bg:t,surface:"rgba(0,0,0,.12)",ink:e,muted:e==="#ffffff"?"rgba(255,255,255,.74)":"rgba(0,0,0,.64)",line:e==="#ffffff"?"rgba(255,255,255,.24)":"rgba(0,0,0,.2)",accent2:r}}function y(t,e){return`var(${t},${e})`}var x=Object.freeze({paper:"#e9e4d6",paper2:"#e1dccd",ink:"#14130f",ink2:"#3d3a32",muted:"#8a8576",hair:"#c4bfae",dark:"#1a1814",dark2:"#2a2620",onDark:"#efe9da",onDarkMuted:"#9a9384",palette:Object.freeze(["#d8402e","#e2742c","#efbe2e","#3c9a52","#4da0c6","#2c44a0","#7a3c90"]),font:Object.freeze({sans:'"Arimo","Helvetica Neue",Helvetica,"Noto Sans SC","PingFang SC","Hiragino Sans GB","Microsoft YaHei",Arial,sans-serif',mono:'ui-monospace,"SF Mono","JetBrains Mono",Menlo,Consolas,monospace'}),spacing:Object.freeze({padX:72,padY:60})}),F=x.palette,Gt=Dt({sourceTokens:x,sourcePath:"theme05/source/theme-adapter.mjs",rootClass:"pulse-slide",base:{bg:y("--pulse-paper",x.paper),surface:y("--pulse-paper-2",x.paper2),ink:y("--pulse-ink",x.ink),muted:y("--pulse-mute",x.muted),accent:y("--pulse-red",F[0]),accent2:y("--pulse-blue",F[5]),line:y("--pulse-hair",x.hair),fontDisplay:x.font.sans,fontBody:x.font.sans,fontMono:x.font.mono,typeScale:{kicker:19,title:78,subtitle:36,body:27,label:19,caption:22,metric:124},pad:x.spacing.padX,gap:28,radius:0,shadow:"none",frame:{kind:"theme05-pulse",top:88,bottom:60},textTreatment:{kicker:{fontWeight:700,letterSpacing:".18em"},title:{fontWeight:800,letterSpacing:"-.01em",lineHeight:.98},subtitle:{fontWeight:600,letterSpacing:0,lineHeight:1.3},body:{fontWeight:500,letterSpacing:0,lineHeight:1.45}},metricWeight:800,listMarker:"index",cardTreatment:{mode:"rules",padding:28,borderWidth:1,borderStyle:"solid",backdropFilter:"none"},mediaTreatment:{radius:0,filter:"none",overlay:"none",border:`1px solid ${y("--pulse-hair",x.hair)}`},chartTreatment:{grid:y("--pulse-hair",x.hair),label:y("--pulse-mute",x.muted),series:F,barRadius:0,strokeWidth:3},shapeTreatment:{lineWidth:3,panelRadius:0,panelBorderWidth:1},decoration:"theme05-spectrum"},backgrounds:{default:{},surface:{bg:y("--pulse-paper-2",x.paper2)},muted:{bg:y("--pulse-paper-2",x.paper2)},accent:At(y("--pulse-red",F[0]),"#ffffff",y("--pulse-yellow",F[2])),dark:{bg:y("--pulse-dark",x.dark),surface:y("--pulse-dark-2",x.dark2),ink:y("--pulse-on-dark",x.onDark),muted:y("--pulse-on-dark-mute",x.onDarkMuted),line:"rgba(255,255,255,.14)"},light:{bg:y("--pulse-paper",x.paper)}}}),Se=Lt({theme05:Gt},{fallbackKey:"theme05"}),Ht=Se.profiles,qt=Se.getBespokeThemeProfile;var Z={};w(Z,{BESPOKE_FAMILIES:()=>Ce,BESPOKE_THEME_PROFILES:()=>ta,getBespokeThemeProfile:()=>aa});import"react";import Me from"react";import"react/jsx-runtime";var Ce=Object.freeze(["hero","editorial","split","comparison","process","matrix","metric-spotlight","timeline","chart-led"]),Yt=Object.freeze({frame:"neutral",surface:"cards",titleClass:"title",titleScale:null,listMode:"stack",quoteMode:"card",metricMode:"card",chartMode:"card"});function Xt(t){let e=Object.fromEntries(Ce.map(r=>[r,Object.freeze({...Yt,...t.familyRecipes?.[r]||{}})]));return Object.freeze({...t,familyRecipes:Object.freeze(e),sourcePrimitives:Object.freeze({...t.sourcePrimitives||{}}),rootVars:Object.freeze({...t.rootVars||{}}),base:Object.freeze(t.base),backgrounds:Object.freeze(Object.fromEntries(Object.entries(t.backgrounds).map(([r,a])=>[r,Object.freeze(a)])))})}function Zt(t,{fallbackKey:e="theme01"}={}){let r=Object.entries(t||{}).filter(([,n])=>n);if(!r.length)throw new Error("createBespokeThemeProfileRegistry: no theme adapters.");let a=Object.freeze(Object.fromEntries(r)),i=Object.hasOwn(a,e)?e:r[0][0],s=Object.freeze(Object.fromEntries(r.map(([n,c])=>[n,Ee(n,c,"default")]))),l=new Map;function b(n,c="default"){let o=Object.hasOwn(a,n)?n:i,f=a[o].backgrounds[c]?c:"default";if(f==="default")return s[o];let d=`${o}:${f}`;return l.has(d)||l.set(d,Ee(o,a[o],f)),l.get(d)}return Object.freeze({profiles:s,getBespokeThemeProfile:b})}function Ee(t,e,r){let a=e.backgrounds[r]||e.backgrounds.default,i=e.base,s={...i,...a,themeKey:t,semanticBackground:r,sourceTokens:e.sourceTokens,sourcePath:e.sourcePath,sourcePrimitives:e.sourcePrimitives,cssText:e.cssText||"",Runtime:e.Runtime||null,rootClass:a.rootClass||e.rootClass||"",rootVars:Object.freeze({...e.rootVars,...a.rootVars||{}}),familyRecipes:e.familyRecipes,frame:Object.freeze({...i.frame||{},...a.frame||{}}),textTreatment:Object.freeze({...i.textTreatment||{},...a.textTreatment||{}}),cardTreatment:Object.freeze({...i.cardTreatment,...a.cardTreatment||{}}),typeScale:Object.freeze({...i.typeScale,...a.typeScale||{}}),mediaTreatment:Object.freeze({...i.mediaTreatment,...a.mediaTreatment||{}}),chartTreatment:Object.freeze({...i.chartTreatment,...a.chartTreatment||{},series:Object.freeze([...a.chartTreatment?.series||i.chartTreatment.series||[]])}),shapeTreatment:Object.freeze({...i.shapeTreatment,...a.shapeTreatment||{}})};return Object.freeze(s)}function Qt(t,e,r){return{bg:t,surface:"rgba(0,0,0,.12)",ink:e,muted:e==="#ffffff"?"rgba(255,255,255,.74)":"rgba(0,0,0,.64)",line:e==="#ffffff"?"rgba(255,255,255,.24)":"rgba(0,0,0,.2)",accent2:r}}function u(t,e){return`var(${t},${e})`}var Cr=Me.createContext(null),Ut=`
  /* design tokens \u2014 scoped to the slide/theme container, never :root */
  .kx-slide{
    --kx-ink:#0c0c0c; --kx-ink-2:#141414; --kx-ink-3:#1c1c1c;
    --kx-cream:#f0efe6; --kx-cream-2:#e6e4d8;
    --kx-accent:#c8f135; --kx-mute:#c8c8c0; --kx-mute-2:#9a9a92;
    --kx-line:rgba(255,255,255,.10); --kx-line-d:rgba(0,0,0,.14);
    --kx-disp:'Archivo','Noto Sans SC',system-ui,sans-serif;
    --kx-mono:'Space Mono','Noto Sans SC',monospace;
    --kx-pad-x:96px; --kx-pad-y:72px;
  }
  .kx-slide{position:absolute;inset:0;font-family:var(--kx-disp);
    -webkit-font-smoothing:antialiased;overflow:hidden;}
  .kx-slide *{box-sizing:border-box;}
  .kx-dark{background:var(--kx-ink);color:var(--kx-cream);}
  .kx-light{background:var(--kx-cream);color:var(--kx-ink);}
  .kx-pad{position:absolute;inset:0;padding:var(--kx-pad-y) var(--kx-pad-x);}

  /* vertical column grid lines */
  .kx-grid{position:absolute;inset:0;pointer-events:none;display:grid;}
  .kx-grid>span{border-left:1px solid var(--kx-line);}
  .kx-light .kx-grid>span{border-left:1px solid var(--kx-line-d);}

  /* mono eyebrow  [NN] LABEL_ */
  .kx-eyebrow{font-family:var(--kx-mono);font-size:24px;letter-spacing:.04em;
    display:inline-flex;align-items:baseline;gap:.5ch;font-weight:700;white-space:nowrap;}
  .kx-eyebrow .kx-eb-id{color:inherit;opacity:.55;}
  .kx-eyebrow .kx-eb-label{color:var(--kx-accent);}
  .kx-eyebrow .kx-eb-caret{color:var(--kx-accent);
    animation:kx-blink 1.1s steps(1) infinite;}
  @keyframes kx-blink{50%{opacity:0}}

  /* display headline */
  .kx-h1{font-weight:900;text-transform:uppercase;line-height:.92;
    letter-spacing:-.01em;margin:0;}
  .kx-h2{font-weight:800;text-transform:uppercase;line-height:.96;
    letter-spacing:-.01em;margin:0;}
  .kx-cjk{font-family:var(--kx-disp);font-weight:900;letter-spacing:.01em;
    text-transform:none;line-height:1.04;}
  .kx-hl{color:var(--kx-accent);}            /* bracket highlight */
  .kx-hl::before{content:'[';}.kx-hl::after{content:']';}

  /* mono caption / meta */
  .kx-mono{font-family:var(--kx-mono);font-size:24px;letter-spacing:.02em;}
  .kx-cap{font-family:var(--kx-mono);font-size:24px;color:var(--kx-mute-2);
    letter-spacing:.03em;text-transform:uppercase;}

  /* mono chip */
  .kx-chips{display:flex;flex-wrap:wrap;gap:14px;}
  .kx-chip{font-family:var(--kx-mono);font-size:24px;font-weight:700;
    padding:9px 16px;letter-spacing:.02em;text-transform:uppercase;
    background:var(--kx-ink-3);color:var(--kx-cream);
    border:1px solid var(--kx-line);white-space:nowrap;}
  .kx-light .kx-chip{background:rgba(0,0,0,.06);color:var(--kx-ink);
    border-color:var(--kx-line-d);}
  .kx-chip.kx-on{background:var(--kx-accent);color:var(--kx-ink);border-color:var(--kx-accent);}

  /* diagonal hatch strip */
  .kx-hatch{height:18px;width:100%;
    background-image:repeating-linear-gradient(45deg,
      var(--kx-mute-2) 0 2px,transparent 2px 9px);opacity:.5;}

  /* outlined lime button */
  .kx-btn{display:inline-flex;align-items:center;justify-content:space-between;
    gap:24px;min-width:300px;padding:20px 22px;
    border:1px solid var(--kx-line);background:transparent;color:inherit;
    font-family:var(--kx-mono);font-weight:700;font-size:24px;letter-spacing:.03em;
    text-transform:uppercase;border-bottom:3px solid var(--kx-accent);}
  .kx-light .kx-btn{border-color:var(--kx-line-d);border-bottom-color:var(--kx-accent);}
  .kx-arrow{display:grid;grid-template-columns:repeat(3,7px);gap:3px;}
  .kx-arrow i{width:7px;height:7px;background:var(--kx-accent);display:block;}
  .kx-arrow i:nth-child(1){grid-column:1;}
  .kx-arrow i:nth-child(2){grid-column:2;}
  .kx-arrow i:nth-child(3){grid-column:3;}

  /* big stat number */
  .kx-stat-n{font-family:var(--kx-disp);font-weight:800;line-height:.9;
    letter-spacing:-.02em;font-size:92px;}
  .kx-stat-c{font-family:var(--kx-mono);font-size:24px;color:var(--kx-mute-2);
    text-transform:uppercase;letter-spacing:.03em;margin-top:14px;}

  /* stacked-bar data placeholder */
  .kx-bars{display:flex;flex-direction:column;gap:9px;width:100%;}
  .kx-bars i{height:11px;display:block;background:var(--kx-mute);}
  .kx-bars i.kx-bd{background:var(--kx-ink);}
  .kx-light .kx-bars i.kx-bd{background:var(--kx-ink);}
  .kx-dark .kx-bars i{background:#3a3a36;} .kx-dark .kx-bars i.kx-bd{background:var(--kx-cream);}
  .kx-bars.kx-dots{flex-direction:row;flex-wrap:wrap;gap:10px;align-content:flex-start;}
  .kx-bars.kx-dots i{width:11px;height:11px;border-radius:50%;}
  .kx-bars.kx-stack{flex-direction:row;gap:0;height:18px;}
  .kx-bars.kx-stack i{height:18px;flex:1;}

  /* watermark wordmark */
  .kx-wm{position:absolute;font-family:var(--kx-disp);font-weight:900;
    text-transform:uppercase;letter-spacing:-.02em;line-height:.8;
    color:currentColor;opacity:.05;pointer-events:none;user-select:none;white-space:nowrap;}

  /* status bar */
  .kx-statusbar{display:flex;align-items:center;justify-content:space-between;
    font-family:var(--kx-mono);font-size:24px;letter-spacing:.03em;
    text-transform:uppercase;}
  .kx-statusbar .kx-wordmark{font-family:var(--kx-disp);font-weight:900;
    font-size:30px;letter-spacing:-.01em;}
  .kx-statusbar .kx-reg{font-size:.5em;vertical-align:super;opacity:.6;}

  /* adaptive media slot */
  .kx-imgslot{position:relative;width:100%;overflow:hidden;cursor:pointer;
    background:
      repeating-linear-gradient(45deg,rgba(255,255,255,.05) 0 10px,rgba(255,255,255,.02) 10px 20px);
    border:1px solid var(--kx-line);display:flex;align-items:center;justify-content:center;}
  .kx-light .kx-imgslot{background:
      repeating-linear-gradient(45deg,rgba(0,0,0,.05) 0 10px,rgba(0,0,0,.02) 10px 20px);
    border-color:var(--kx-line-d);}
  .kx-imgslot img,.kx-imgslot video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;}
  .kx-imgslot .kx-slot-ph{font-family:var(--kx-mono);font-size:24px;color:var(--kx-mute-2);
    text-transform:uppercase;letter-spacing:.05em;text-align:center;padding:0 18px;z-index:1;}
  .kx-imgslot.kx-drag{outline:2px solid var(--kx-accent);outline-offset:-2px;}
  .kx-imgslot .kx-slot-badge{position:absolute;left:0;bottom:0;z-index:2;
    font-family:var(--kx-mono);font-size:24px;padding:6px 12px;letter-spacing:.04em;
    background:rgba(0,0,0,.6);color:var(--kx-cream);text-transform:uppercase;
    display:flex;align-items:center;gap:8px;}
  .kx-imgslot[data-media-kind="video"] .kx-slot-badge{top:0;bottom:auto;}
  .kx-imgslot .kx-slot-badge::before{content:'';width:8px;height:8px;border-radius:50%;
    background:var(--kx-accent);}
  .kx-media-col{display:flex;flex-direction:column;gap:var(--kx-media-gap,20px);
    height:100%;min-height:0;max-height:100%;justify-content:stretch;overflow:hidden;}
  .kx-media-col .kx-imgslot{flex:1 1 0;min-height:0;max-height:100%;aspect-ratio:auto;}
`;if(typeof document<"u"&&!document.getElementById("kx-kit-css")){let t=document.createElement("style");t.id="kx-kit-css",t.textContent=Ut,document.head.appendChild(t)}var Pe=Me.createElement;function Jt({cols:t=6}){return Pe("div",{className:"kx-grid",style:{gridTemplateColumns:`repeat(${t},1fr)`}},Array.from({length:t},(e,r)=>Pe("span",{key:r})))}var ea=Xt({sourceTokens:Object.freeze({rootClass:"kx-slide",darkClass:"kx-dark",lightClass:"kx-light"}),sourcePath:"theme06/source/slides/kit.jsx",sourcePrimitives:{Grid:Jt},rootClass:"kx-slide kx-dark",base:{bg:u("--kx-ink","#0c0c0c"),surface:u("--kx-ink-2","#141414"),ink:u("--kx-cream","#f0efe6"),muted:u("--kx-mute-2","#9a9a92"),accent:u("--kx-accent","#c8f135"),accent2:u("--kx-mute","#c8c8c0"),line:u("--kx-line","rgba(255,255,255,.10)"),fontDisplay:"'Archivo','Noto Sans SC',system-ui,sans-serif",fontBody:"'Archivo','Noto Sans SC',system-ui,sans-serif",fontMono:"'Space Mono','Noto Sans SC',monospace",typeScale:{kicker:24,title:72,subtitle:42,body:27,label:24,caption:24,metric:92},pad:96,gap:24,radius:0,shadow:"none",cardTreatment:{padding:28,borderWidth:1,borderStyle:"solid",backdropFilter:"none"},mediaTreatment:{radius:0,filter:"none",overlay:"none",border:`1px solid ${u("--kx-line","rgba(255,255,255,.10)")}`},chartTreatment:{grid:u("--kx-line","rgba(255,255,255,.10)"),label:u("--kx-mute-2","#9a9a92"),series:[u("--kx-accent","#c8f135"),u("--kx-cream","#f0efe6"),u("--kx-mute","#c8c8c0")],barRadius:0,strokeWidth:5},shapeTreatment:{lineWidth:2,panelRadius:0,panelBorderWidth:1},decoration:"theme06-grid"},backgrounds:{default:{},surface:{bg:u("--kx-ink-2","#141414")},muted:{bg:u("--kx-ink-3","#1c1c1c")},accent:Qt(u("--kx-accent","#c8f135"),u("--kx-ink","#0c0c0c"),u("--kx-cream","#f0efe6")),dark:{},light:{rootClass:"kx-slide kx-light",bg:u("--kx-cream","#f0efe6"),surface:u("--kx-cream-2","#e6e4d8"),ink:u("--kx-ink","#0c0c0c"),muted:u("--kx-mute-2","#9a9a92"),line:u("--kx-line-d","rgba(0,0,0,.14)")}}}),Be=Zt({theme06:ea},{fallbackKey:"theme06"}),ta=Be.profiles,aa=Be.getBespokeThemeProfile;var Q={};w(Q,{BESPOKE_FAMILIES:()=>Fe,BESPOKE_THEME_PROFILES:()=>la,getBespokeThemeProfile:()=>fa});import"react";var Fe=Object.freeze(["hero","editorial","split","comparison","process","matrix","metric-spotlight","timeline","chart-led"]),ra=Object.freeze({frame:"neutral",surface:"cards",titleClass:"title",titleScale:null,listMode:"stack",quoteMode:"card",metricMode:"card",chartMode:"card"});function ia(t){let e=Object.fromEntries(Fe.map(r=>[r,Object.freeze({...ra,...t.familyRecipes?.[r]||{}})]));return Object.freeze({...t,familyRecipes:Object.freeze(e),sourcePrimitives:Object.freeze({...t.sourcePrimitives||{}}),rootVars:Object.freeze({...t.rootVars||{}}),base:Object.freeze(t.base),backgrounds:Object.freeze(Object.fromEntries(Object.entries(t.backgrounds).map(([r,a])=>[r,Object.freeze(a)])))})}function na(t,{fallbackKey:e="theme01"}={}){let r=Object.entries(t||{}).filter(([,n])=>n);if(!r.length)throw new Error("createBespokeThemeProfileRegistry: no theme adapters.");let a=Object.freeze(Object.fromEntries(r)),i=Object.hasOwn(a,e)?e:r[0][0],s=Object.freeze(Object.fromEntries(r.map(([n,c])=>[n,Re(n,c,"default")]))),l=new Map;function b(n,c="default"){let o=Object.hasOwn(a,n)?n:i,f=a[o].backgrounds[c]?c:"default";if(f==="default")return s[o];let d=`${o}:${f}`;return l.has(d)||l.set(d,Re(o,a[o],f)),l.get(d)}return Object.freeze({profiles:s,getBespokeThemeProfile:b})}function Re(t,e,r){let a=e.backgrounds[r]||e.backgrounds.default,i=e.base,s={...i,...a,themeKey:t,semanticBackground:r,sourceTokens:e.sourceTokens,sourcePath:e.sourcePath,sourcePrimitives:e.sourcePrimitives,cssText:e.cssText||"",Runtime:e.Runtime||null,rootClass:a.rootClass||e.rootClass||"",rootVars:Object.freeze({...e.rootVars,...a.rootVars||{}}),familyRecipes:e.familyRecipes,frame:Object.freeze({...i.frame||{},...a.frame||{}}),textTreatment:Object.freeze({...i.textTreatment||{},...a.textTreatment||{}}),cardTreatment:Object.freeze({...i.cardTreatment,...a.cardTreatment||{}}),typeScale:Object.freeze({...i.typeScale,...a.typeScale||{}}),mediaTreatment:Object.freeze({...i.mediaTreatment,...a.mediaTreatment||{}}),chartTreatment:Object.freeze({...i.chartTreatment,...a.chartTreatment||{},series:Object.freeze([...a.chartTreatment?.series||i.chartTreatment.series||[]])}),shapeTreatment:Object.freeze({...i.shapeTreatment,...a.shapeTreatment||{}})};return Object.freeze(s)}function oa(t,e,r){return{bg:t,surface:"rgba(0,0,0,.12)",ink:e,muted:e==="#ffffff"?"rgba(255,255,255,.74)":"rgba(0,0,0,.64)",line:e==="#ffffff"?"rgba(255,255,255,.24)":"rgba(0,0,0,.2)",accent2:r}}var p={accent:"#86D62B",accentBright:"#AEEA46",accentDeep:"#5FA01A",accentSoft:"#E9FBC6",ink:"#0E110B",inkDim:"#3D413A",paper:"#FAFAF6",card:"#FFFFFF",muted:"#83877C",faint:"#B7BBB0",hair:"rgba(14,17,11,0.10)",hairStrong:"rgba(14,17,11,0.16)",pos:"#34B24A",neg:"#E8443B",warn:"#EFA63A",fontDisplay:"'Space Grotesk','Noto Sans SC',system-ui,sans-serif",fontText:"'Noto Sans SC','Space Grotesk',system-ui,sans-serif"};function sa(t){return{"--aic-accent":t||p.accent,"--aic-accent-bright":p.accentBright,"--aic-accent-deep":p.accentDeep,"--aic-accent-soft":p.accentSoft,"--aic-ink":p.ink,"--aic-ink-dim":p.inkDim,"--aic-paper":p.paper,"--aic-card":p.card,"--aic-muted":p.muted,"--aic-faint":p.faint,"--aic-hair":p.hair,"--aic-hair-strong":p.hairStrong,"--aic-pos":p.pos,"--aic-neg":p.neg,"--aic-warn":p.warn,"--aic-font-display":p.fontDisplay,"--aic-font-text":p.fontText}}var ca=ia({sourceTokens:p,sourcePath:"theme07/source/src/theme.js",rootVars:sa(),rootClass:"aic-bespoke",base:{bg:p.paper,surface:p.card,ink:p.ink,muted:p.muted,accent:p.accent,accent2:p.accentBright,line:p.hair,fontDisplay:p.fontDisplay,fontBody:p.fontText,fontMono:p.fontDisplay,typeScale:{kicker:22,title:72,subtitle:40,body:28,label:20,caption:22,metric:112},pad:96,gap:24,radius:20,shadow:"0 18px 52px rgba(14,17,11,.08)",cardTreatment:{padding:30,borderWidth:1.5,borderStyle:"solid",backdropFilter:"none"},mediaTreatment:{radius:26,filter:"none",overlay:"linear-gradient(180deg,transparent 66%,rgba(14,17,11,.24))",border:`1.5px solid ${p.hair}`},chartTreatment:{grid:p.hair,label:p.muted,series:[p.accent,p.ink,"#9AA08F",p.warn,p.faint],barRadius:10,strokeWidth:5},shapeTreatment:{lineWidth:3,panelRadius:20,panelBorderWidth:1.5},decoration:"theme07-lens"},backgrounds:{default:{},surface:{bg:p.card},muted:{bg:p.accentSoft},accent:oa(p.accent,p.ink,p.accentBright),dark:{bg:p.ink,surface:p.inkDim,ink:p.paper,muted:p.faint,line:"rgba(250,250,246,.16)"},light:{bg:p.paper}}}),$e=na({theme07:ca},{fallbackKey:"theme07"}),la=$e.profiles,fa=$e.getBespokeThemeProfile;var ee={};w(ee,{BESPOKE_FAMILIES:()=>Ke,BESPOKE_THEME_PROFILES:()=>ya,getBespokeThemeProfile:()=>Oa});import"react";import ua from"react";import{jsx as T,jsxs as U}from"react/jsx-runtime";var Ke=Object.freeze(["hero","editorial","split","comparison","process","matrix","metric-spotlight","timeline","chart-led"]),da=Object.freeze({frame:"neutral",surface:"cards",titleClass:"title",titleScale:null,listMode:"stack",quoteMode:"card",metricMode:"card",chartMode:"card"});function pa(t){let e=Object.fromEntries(Ke.map(r=>[r,Object.freeze({...da,...t.familyRecipes?.[r]||{}})]));return Object.freeze({...t,familyRecipes:Object.freeze(e),sourcePrimitives:Object.freeze({...t.sourcePrimitives||{}}),rootVars:Object.freeze({...t.rootVars||{}}),base:Object.freeze(t.base),backgrounds:Object.freeze(Object.fromEntries(Object.entries(t.backgrounds).map(([r,a])=>[r,Object.freeze(a)])))})}function ma(t,{fallbackKey:e="theme01"}={}){let r=Object.entries(t||{}).filter(([,n])=>n);if(!r.length)throw new Error("createBespokeThemeProfileRegistry: no theme adapters.");let a=Object.freeze(Object.fromEntries(r)),i=Object.hasOwn(a,e)?e:r[0][0],s=Object.freeze(Object.fromEntries(r.map(([n,c])=>[n,_e(n,c,"default")]))),l=new Map;function b(n,c="default"){let o=Object.hasOwn(a,n)?n:i,f=a[o].backgrounds[c]?c:"default";if(f==="default")return s[o];let d=`${o}:${f}`;return l.has(d)||l.set(d,_e(o,a[o],f)),l.get(d)}return Object.freeze({profiles:s,getBespokeThemeProfile:b})}function _e(t,e,r){let a=e.backgrounds[r]||e.backgrounds.default,i=e.base,s={...i,...a,themeKey:t,semanticBackground:r,sourceTokens:e.sourceTokens,sourcePath:e.sourcePath,sourcePrimitives:e.sourcePrimitives,cssText:e.cssText||"",Runtime:e.Runtime||null,rootClass:a.rootClass||e.rootClass||"",rootVars:Object.freeze({...e.rootVars,...a.rootVars||{}}),familyRecipes:e.familyRecipes,frame:Object.freeze({...i.frame||{},...a.frame||{}}),textTreatment:Object.freeze({...i.textTreatment||{},...a.textTreatment||{}}),cardTreatment:Object.freeze({...i.cardTreatment,...a.cardTreatment||{}}),typeScale:Object.freeze({...i.typeScale,...a.typeScale||{}}),mediaTreatment:Object.freeze({...i.mediaTreatment,...a.mediaTreatment||{}}),chartTreatment:Object.freeze({...i.chartTreatment,...a.chartTreatment||{},series:Object.freeze([...a.chartTreatment?.series||i.chartTreatment.series||[]])}),shapeTreatment:Object.freeze({...i.shapeTreatment,...a.shapeTreatment||{}})};return Object.freeze(s)}function ga(t,e,r){return{bg:t,surface:"rgba(0,0,0,.12)",ink:e,muted:e==="#ffffff"?"rgba(255,255,255,.74)":"rgba(0,0,0,.64)",line:e==="#ffffff"?"rgba(255,255,255,.24)":"rgba(0,0,0,.2)",accent2:r}}function ba(t){let e={};for(let r of String(t).matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi))e[r[1]]=r[2].trim();return Object.freeze(e)}var Kr=ua.createContext(null),J=`
  --acl-yellow:#ECEF35;
  --acl-lilac:#E7E6EE;
  --acl-ink:#16150F;
  --acl-pink:#FF3D97;
  --acl-red:#E83B22;
  --acl-blue:#8DBEEC;
  --acl-paper:#FBFAF4;
  --acl-font-cn:"Noto Sans SC",-apple-system,sans-serif;
  --acl-font-num:"Anton","Noto Sans SC",sans-serif;
  --acl-font-mono:"Noto Sans SC",-apple-system,sans-serif;
  --acl-font-hand:"Noto Sans SC",-apple-system,sans-serif;
`;function ha(){return T("style",{children:`
      .acl-root{ ${J} }
      .acl-root *{ box-sizing:border-box; }

      /* \u2500\u2500 doodles \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
      .acl-doodle{ position:absolute; pointer-events:none; color:var(--acl-ink);
        animation:acl-wiggle 6s ease-in-out infinite; transform-origin:center; }
      .acl-doodle--spark{ color:var(--acl-ink); }
      @keyframes acl-wiggle{ 0%,100%{ transform:rotate(var(--r,0deg)); }
        50%{ transform:rotate(calc(var(--r,0deg) + 2deg)); } }
      @media (prefers-reduced-motion:reduce){ .acl-doodle{ animation:none; } }

      /* \u2500\u2500 inline marker highlight \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
      .acl-hl{ background:var(--acl-blue); padding:0 .14em; white-space:nowrap;
        box-decoration-break:clone; -webkit-box-decoration-break:clone; }

      /* \u2500\u2500 sticker label (one- or two-tone) \u2500\u2500\u2500\u2500\u2500\u2500 */
      .acl-sticker{ display:inline-flex; align-items:stretch; line-height:1;
        font-family:var(--acl-font-mono); font-weight:700; white-space:nowrap;
        box-shadow:2px 3px 0 rgba(22,21,15,.18); }
      .acl-sticker b, .acl-sticker span{ padding:7px 11px 6px; display:flex;
        align-items:center; font-weight:700; }
      .acl-sticker b{ color:var(--acl-ink); }
      .acl-sticker span{ font-weight:400; }

      /* \u2500\u2500 meta tag (data chip) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
      .acl-metatag{ display:flex; flex-direction:column; gap:3px; }
      .acl-metatag .k{ font-family:var(--acl-font-mono); font-size:15px;
        letter-spacing:.08em; text-transform:uppercase; color:rgba(22,21,15,.5); }
      .acl-metatag .v{ font-family:var(--acl-font-cn); font-weight:700;
        font-size:26px; color:var(--acl-ink); }

      /* \u2500\u2500 adaptive image slot \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
      .acl-slot{ position:relative; display:inline-block; transition:width .3s,height .3s; }
      .acl-slot__frame{ position:relative; width:100%; height:100%; overflow:hidden;
        background:var(--acl-paper); border:8px solid var(--acl-paper);
        box-shadow:4px 6px 0 rgba(22,21,15,.2), 0 10px 26px rgba(22,21,15,.14); }
      .acl-slot__img{ width:100%; height:100%; object-fit:cover; display:block; }
      .acl-slot__empty{ position:absolute; inset:0; display:flex; flex-direction:column;
        align-items:center; justify-content:center; gap:6px; cursor:pointer;
        background:var(--acl-paper);
        border:1.5px dashed rgba(22,21,15,.25); }
      .acl-slot__icon{ opacity:.45; color:rgba(22,21,15,.85); }
      .acl-slot__cap{ font-family:var(--acl-font-cn); font-size:13px; font-weight:500;
        letter-spacing:.01em; color:rgba(22,21,15,.85); text-align:center; padding:0 8px;
        max-width:90%; }
      .acl-slot__sub{ font-family:var(--acl-font-cn); font-size:11px;
        color:rgba(22,21,15,.62); }
      .acl-slot__sub u{ text-underline-offset:2px; text-decoration-color:rgba(22,21,15,.25); }
      .acl-slot__empty:hover .acl-slot__sub u{ color:rgba(22,21,15,.85);
        text-decoration-color:currentColor; }
      .acl-slot--drag .acl-slot__empty{ background:var(--acl-yellow);
        border-color:var(--acl-ink); }
      .acl-slot__sticker{ position:absolute; left:50%; bottom:-14px; transform:translateX(-50%);
        z-index:3; }
      .acl-slot__hint{ position:absolute; top:7px; right:7px; z-index:3; opacity:0;
        font-family:var(--acl-font-mono); font-size:11px; letter-spacing:.04em;
        background:var(--acl-ink); color:var(--acl-paper); padding:3px 6px;
        transition:opacity .15s; }
      .acl-slot:hover .acl-slot__hint{ opacity:.9; }
    `})}function xa({kind:t="spark",size:e=54,color:r,fill:a="currentColor",stroke:i,strokeWidth:s=4,rotate:l=0,style:b={},className:n=""}){let c={fill:"none",stroke:"currentColor",strokeWidth:3,strokeLinecap:"round",strokeLinejoin:"round"},o={fill:a,stroke:i||"none",strokeWidth:i?s:0,strokeLinejoin:"round"},f={arrow:U("g",{...c,children:[T("path",{d:"M6 18 Q40 6 73 37"}),T("path",{d:"M57 32 L73 37 L67 21"})]}),arrowS:U("g",{...c,children:[T("path",{d:"M7 15 Q37 17 72 41"}),T("path",{d:"M56 37 L72 41 L66 24"})]}),loop:U("g",{...c,children:[T("path",{d:"M58 18 C48 8, 24 10, 20 28 C17 44, 40 52, 56 42"}),T("path",{d:"M49 53 L56 42 L43 43"})]}),spark:T("g",{...o,children:T("path",{d:"M27 2 C29 18, 32 21, 52 27 C32 33, 29 36, 27 52 C25 36, 22 33, 2 27 C22 21, 25 18, 27 2 Z"})}),star:T("g",{...o,children:T("path",{d:"M27 3 L34 20 L52 21 L38 33 L43 51 L27 40 L11 51 L16 33 L2 21 L20 20 Z"})}),heart:T("g",{...o,children:T("path",{d:"M27 49 C7 35, 7 15, 21 15 C26 15, 27 21, 27 24 C27 21, 28 15, 33 15 C47 15, 47 35, 27 49 Z"})})};return T("svg",{className:`acl-doodle ${t==="spark"||t==="star"||t==="heart"?"acl-doodle--spark":""} ${n}`,viewBox:"0 0 84 60",width:e,height:e*60/84,"aria-hidden":"true",style:{"--r":`${l}deg`,color:r,...b},children:f[t]})}var g=ba(J),ka=pa({sourceTokens:J,sourcePath:"theme08/source/components/AclPrimitives.jsx",Runtime:ha,sourcePrimitives:{Doodle:xa},rootClass:"acl-root",base:{bg:g["--acl-yellow"],surface:g["--acl-paper"],ink:g["--acl-ink"],muted:"rgba(22,21,15,.62)",accent:g["--acl-pink"],accent2:g["--acl-blue"],line:g["--acl-ink"],fontDisplay:g["--acl-font-num"],fontBody:g["--acl-font-cn"],fontMono:g["--acl-font-mono"],typeScale:{kicker:20,title:72,subtitle:40,body:27,label:19,caption:21,metric:120},pad:100,gap:24,radius:0,shadow:"6px 8px 0 rgba(22,21,15,.18)",cardTreatment:{padding:28,borderWidth:3,borderStyle:"solid",backdropFilter:"none"},mediaTreatment:{radius:0,filter:"none",overlay:"none",border:`8px solid ${g["--acl-paper"]}`},chartTreatment:{grid:"rgba(22,21,15,.18)",label:"rgba(22,21,15,.62)",series:[g["--acl-ink"],g["--acl-pink"],g["--acl-blue"],g["--acl-red"],g["--acl-lilac"]],barRadius:0,strokeWidth:4},shapeTreatment:{lineWidth:5,panelRadius:0,panelBorderWidth:3},decoration:"theme08-doodle"},backgrounds:{default:{},surface:{bg:g["--acl-paper"]},muted:{bg:g["--acl-lilac"]},accent:ga(g["--acl-pink"],g["--acl-paper"],g["--acl-yellow"]),dark:{bg:g["--acl-ink"],surface:"rgba(251,250,244,.08)",ink:g["--acl-paper"],muted:g["--acl-lilac"],line:g["--acl-yellow"],accent:g["--acl-yellow"]},light:{bg:g["--acl-paper"]}}}),Ve=ma({theme08:ka},{fallbackKey:"theme08"}),ya=Ve.profiles,Oa=Ve.getBespokeThemeProfile;var te={};w(te,{BESPOKE_FAMILIES:()=>De,BESPOKE_THEME_PROFILES:()=>Ba,getBespokeThemeProfile:()=>Ra});import"react";import Ne from"react";import"react/jsx-runtime";var De=Object.freeze(["hero","editorial","split","comparison","process","matrix","metric-spotlight","timeline","chart-led"]),va=Object.freeze({frame:"neutral",surface:"cards",titleClass:"title",titleScale:null,listMode:"stack",quoteMode:"card",metricMode:"card",chartMode:"card"});function ja(t){let e=Object.fromEntries(De.map(r=>[r,Object.freeze({...va,...t.familyRecipes?.[r]||{}})]));return Object.freeze({...t,familyRecipes:Object.freeze(e),sourcePrimitives:Object.freeze({...t.sourcePrimitives||{}}),rootVars:Object.freeze({...t.rootVars||{}}),base:Object.freeze(t.base),backgrounds:Object.freeze(Object.fromEntries(Object.entries(t.backgrounds).map(([r,a])=>[r,Object.freeze(a)])))})}function Ta(t,{fallbackKey:e="theme01"}={}){let r=Object.entries(t||{}).filter(([,n])=>n);if(!r.length)throw new Error("createBespokeThemeProfileRegistry: no theme adapters.");let a=Object.freeze(Object.fromEntries(r)),i=Object.hasOwn(a,e)?e:r[0][0],s=Object.freeze(Object.fromEntries(r.map(([n,c])=>[n,Ie(n,c,"default")]))),l=new Map;function b(n,c="default"){let o=Object.hasOwn(a,n)?n:i,f=a[o].backgrounds[c]?c:"default";if(f==="default")return s[o];let d=`${o}:${f}`;return l.has(d)||l.set(d,Ie(o,a[o],f)),l.get(d)}return Object.freeze({profiles:s,getBespokeThemeProfile:b})}function Ie(t,e,r){let a=e.backgrounds[r]||e.backgrounds.default,i=e.base,s={...i,...a,themeKey:t,semanticBackground:r,sourceTokens:e.sourceTokens,sourcePath:e.sourcePath,sourcePrimitives:e.sourcePrimitives,cssText:e.cssText||"",Runtime:e.Runtime||null,rootClass:a.rootClass||e.rootClass||"",rootVars:Object.freeze({...e.rootVars,...a.rootVars||{}}),familyRecipes:e.familyRecipes,frame:Object.freeze({...i.frame||{},...a.frame||{}}),textTreatment:Object.freeze({...i.textTreatment||{},...a.textTreatment||{}}),cardTreatment:Object.freeze({...i.cardTreatment,...a.cardTreatment||{}}),typeScale:Object.freeze({...i.typeScale,...a.typeScale||{}}),mediaTreatment:Object.freeze({...i.mediaTreatment,...a.mediaTreatment||{}}),chartTreatment:Object.freeze({...i.chartTreatment,...a.chartTreatment||{},series:Object.freeze([...a.chartTreatment?.series||i.chartTreatment.series||[]])}),shapeTreatment:Object.freeze({...i.shapeTreatment,...a.shapeTreatment||{}})};return Object.freeze(s)}function za(t,e,r){return{bg:t,surface:"rgba(0,0,0,.12)",ink:e,muted:e==="#ffffff"?"rgba(255,255,255,.74)":"rgba(0,0,0,.64)",line:e==="#ffffff"?"rgba(255,255,255,.24)":"rgba(0,0,0,.2)",accent2:r}}var m={fontDisplay:"'Archivo','Noto Sans SC',sans-serif",fontCN:"'Noto Sans SC','Archivo',sans-serif",fontMono:"'Space Mono',monospace",fontScript:"'Caveat',cursive",ink:"#ffffff",inkDim:"rgba(255,255,255,.66)",inkFaint:"rgba(255,255,255,.40)",accent:"#46e3c6",blue:"#4a86ff",blueDeep:"#1d49d6",blueElectric:"#2f6bff",violet:"#9f7bff",warn:"#ffb27a",navyCard:"#0a1230",navy900:"#050b22",glassLine:"rgba(255,255,255,.22)",radius:26,type:{mega:300,title:88,h2:64,sub:40,body:30,small:26,tiny:24},pad:{x:110,y:90}};function wa(t){let e=t||{};return{...m,...e,type:{...m.type,...e.type||{}},pad:{...m.pad,...e.pad||{}}}}function Sa(t){return`
  .dk-scope{
    --type-mega:${t.type.mega}px; --type-title:${t.type.title}px; --type-h2:${t.type.h2}px;
    --type-sub:${t.type.sub}px; --type-body:${t.type.body}px; --type-small:${t.type.small}px; --type-tiny:${t.type.tiny}px;
    --pad-x:${t.pad.x}px; --pad-y:${t.pad.y}px;
    --dk-accent:${t.accent}; --mint:${t.accent};
    --dk-blue:${t.blue}; --blue-bright:${t.blue}; --blue-deep:${t.blueDeep}; --blue-electric:${t.blueElectric}; --dk-violet:${t.violet}; --dk-warn:${t.warn};
    --ink:${t.ink}; --ink-dim:${t.inkDim}; --ink-faint:${t.inkFaint};
    --navy-card:${t.navyCard}; --navy-900:${t.navy900}; --glass-line:${t.glassLine}; --dk-radius:${t.radius}px;
    --font-display:${t.fontDisplay}; --font-cn:${t.fontCN}; --font-mono:${t.fontMono}; --font-script:${t.fontScript};
    font-family:var(--font-cn); color:var(--ink);
  }
  .dk-scope section{ font-family:var(--font-cn); color:var(--ink); overflow:hidden; -webkit-font-smoothing:antialiased; }
  .dk-scope .dk-glass{
    background:linear-gradient(150deg,rgba(255,255,255,.14),rgba(255,255,255,.05));
    border:1px solid var(--glass-line);
    backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px);
    box-shadow:0 24px 60px rgba(3,8,30,.4), inset 0 1px 0 rgba(255,255,255,.25);
  }
  .dk-scope .dk-glass-dark{
    background:linear-gradient(150deg,rgba(10,18,48,.72),rgba(6,12,34,.5));
    border:1px solid rgba(255,255,255,.12);
    backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px);
  }
  .dk-scope .dk-chrome{
    background:linear-gradient(176deg,#ffffff 0%,#f0f5ff 30%,#c2d2ff 52%,#8ea7f4 64%,#e9f0ff 80%,#ffffff 100%);
    -webkit-background-clip:text; background-clip:text; color:transparent; -webkit-text-fill-color:transparent;
    filter:drop-shadow(0 8px 20px rgba(4,14,60,.45));
  }
  .dk-scope .dk-ink-grad{
    background:linear-gradient(180deg,#ffffff 0%,#dfe8ff 60%,#b7c8ff 100%);
    -webkit-background-clip:text; background-clip:text; color:transparent; -webkit-text-fill-color:transparent;
  }
  .dk-scope .dk-orb{ position:absolute; border-radius:50%; filter:blur(2px); pointer-events:none; }
  .dk-scope .dk-glass-chip{
    border-radius:30%;
    background:radial-gradient(120% 120% at 30% 22%, rgba(255,255,255,.85), rgba(140,180,255,.5) 40%, rgba(40,90,230,.55) 70%, rgba(12,40,150,.7) 100%);
    box-shadow:0 20px 50px rgba(20,60,200,.55), inset 0 2px 6px rgba(255,255,255,.7), inset 0 -10px 24px rgba(10,30,120,.6);
    border:1px solid rgba(255,255,255,.4);
  }
  .dk-scope .dk-watermark{ position:absolute; inset:0; pointer-events:none; overflow:hidden; opacity:.05; z-index:0; }
  .dk-scope .dk-watermark span{ position:absolute; white-space:nowrap; font-family:var(--font-mono); font-size:34px; letter-spacing:.3em; color:#fff; transform:rotate(-30deg); }
  @media (prefers-reduced-motion: no-preference){
    .dk-scope [data-deck-active] .dk-anim{ animation:dkRise .7s cubic-bezier(.2,.7,.2,1) both; }
    .dk-scope [data-deck-active] .dk-anim.d1{ animation-delay:.06s; }
    .dk-scope [data-deck-active] .dk-anim.d2{ animation-delay:.14s; }
    .dk-scope [data-deck-active] .dk-anim.d3{ animation-delay:.22s; }
    .dk-scope [data-deck-active] .dk-anim.d4{ animation-delay:.30s; }
    .dk-scope [data-deck-active] .dk-anim.d5{ animation-delay:.38s; }
    .dk-scope [data-deck-active] .dk-anim.d6{ animation-delay:.46s; }
    @keyframes dkRise{ from{opacity:0; transform:translateY(26px);} to{opacity:1; transform:none;} }
  }`}function We(t){if(typeof document>"u")return;let e=Sa(t||m),r=document.getElementById("deckkit-base");r||(r=document.createElement("style"),r.id="deckkit-base",document.head.appendChild(r)),r.textContent!==e&&(r.textContent=e)}function Ea(t){let e=Ne.useMemo(()=>t?wa(t):m,[t]);return Ne.useLayoutEffect(()=>{We(e)},[e]),typeof document<"u"&&!document.getElementById("deckkit-base")&&We(e),e}function Pa(){return typeof document>"u"?null:Ca()}function Ca(){return Ea(),null}var Ma=ja({sourceTokens:m,sourcePath:"theme09/source/slides/DeckKit.jsx",Runtime:Pa,rootClass:"dk-scope bg-deep",base:{bg:m.navy900,surface:"linear-gradient(150deg,rgba(255,255,255,.14),rgba(255,255,255,.05))",ink:m.ink,muted:m.inkDim,accent:m.accent,accent2:m.blue,line:m.glassLine,fontDisplay:m.fontDisplay,fontBody:m.fontCN,fontMono:m.fontMono,typeScale:{kicker:m.type.small,title:m.type.title,subtitle:m.type.sub,body:m.type.body,label:m.type.tiny,caption:m.type.small,metric:132},pad:m.pad.x,gap:28,radius:m.radius,shadow:"0 24px 60px rgba(3,8,30,.4),inset 0 1px 0 rgba(255,255,255,.25)",cardTreatment:{padding:30,borderWidth:1,borderStyle:"solid",backdropFilter:"blur(14px)"},mediaTreatment:{radius:20,filter:"none",overlay:"linear-gradient(180deg,transparent 58%,rgba(3,8,30,.42))",border:`1px solid ${m.glassLine}`},chartTreatment:{grid:"rgba(255,255,255,.10)",label:m.inkDim,series:[m.blue,m.accent,m.violet,m.warn],barRadius:16,strokeWidth:5},shapeTreatment:{lineWidth:3,panelRadius:m.radius,panelBorderWidth:1},decoration:"theme09-orbs"},backgrounds:{default:{},surface:{rootClass:"dk-scope bg-blue",bg:m.navyCard},muted:{rootClass:"dk-scope bg-night",bg:m.navy900},accent:{rootClass:"dk-scope bg-electric",...za(m.blueElectric,"#ffffff",m.accent)},dark:{rootClass:"dk-scope bg-night",bg:m.navy900},light:{rootClass:"dk-scope bg-blue",bg:m.blueDeep}}}),Le=Ta({theme09:Ma},{fallbackKey:"theme09"}),Ba=Le.profiles,Ra=Le.getBespokeThemeProfile;var ae={};w(ae,{BESPOKE_FAMILIES:()=>Ge,BESPOKE_THEME_PROFILES:()=>Va,getBespokeThemeProfile:()=>Ia});import"react";import"react";import"react/jsx-runtime";var Ge=Object.freeze(["hero","editorial","split","comparison","process","matrix","metric-spotlight","timeline","chart-led"]),Fa=Object.freeze({frame:"neutral",surface:"cards",titleClass:"title",titleScale:null,listMode:"stack",quoteMode:"card",metricMode:"card",chartMode:"card"});function $a(t){let e=Object.fromEntries(Ge.map(r=>[r,Object.freeze({...Fa,...t.familyRecipes?.[r]||{}})]));return Object.freeze({...t,familyRecipes:Object.freeze(e),sourcePrimitives:Object.freeze({...t.sourcePrimitives||{}}),rootVars:Object.freeze({...t.rootVars||{}}),base:Object.freeze(t.base),backgrounds:Object.freeze(Object.fromEntries(Object.entries(t.backgrounds).map(([r,a])=>[r,Object.freeze(a)])))})}function _a(t,{fallbackKey:e="theme01"}={}){let r=Object.entries(t||{}).filter(([,n])=>n);if(!r.length)throw new Error("createBespokeThemeProfileRegistry: no theme adapters.");let a=Object.freeze(Object.fromEntries(r)),i=Object.hasOwn(a,e)?e:r[0][0],s=Object.freeze(Object.fromEntries(r.map(([n,c])=>[n,Ae(n,c,"default")]))),l=new Map;function b(n,c="default"){let o=Object.hasOwn(a,n)?n:i,f=a[o].backgrounds[c]?c:"default";if(f==="default")return s[o];let d=`${o}:${f}`;return l.has(d)||l.set(d,Ae(o,a[o],f)),l.get(d)}return Object.freeze({profiles:s,getBespokeThemeProfile:b})}function Ae(t,e,r){let a=e.backgrounds[r]||e.backgrounds.default,i=e.base,s={...i,...a,themeKey:t,semanticBackground:r,sourceTokens:e.sourceTokens,sourcePath:e.sourcePath,sourcePrimitives:e.sourcePrimitives,cssText:e.cssText||"",Runtime:e.Runtime||null,rootClass:a.rootClass||e.rootClass||"",rootVars:Object.freeze({...e.rootVars,...a.rootVars||{}}),familyRecipes:e.familyRecipes,frame:Object.freeze({...i.frame||{},...a.frame||{}}),textTreatment:Object.freeze({...i.textTreatment||{},...a.textTreatment||{}}),cardTreatment:Object.freeze({...i.cardTreatment,...a.cardTreatment||{}}),typeScale:Object.freeze({...i.typeScale,...a.typeScale||{}}),mediaTreatment:Object.freeze({...i.mediaTreatment,...a.mediaTreatment||{}}),chartTreatment:Object.freeze({...i.chartTreatment,...a.chartTreatment||{},series:Object.freeze([...a.chartTreatment?.series||i.chartTreatment.series||[]])}),shapeTreatment:Object.freeze({...i.shapeTreatment,...a.shapeTreatment||{}})};return Object.freeze(s)}var R={dusk:{bg:"linear-gradient(158deg,#0a0d11 0%,#141f2a 26%,#33434e 52%,#857f76 78%,#cdb6a0 100%)",fg:"#f4f4f2",sub:"rgba(244,244,242,.72)",foot:"rgba(22,18,14,.6)"},midnight:{bg:"radial-gradient(120% 85% at 72% 8%,#1c2533 0%,#0d1016 52%,#07080b 100%)",fg:"#f2f3f6",sub:"rgba(242,243,246,.62)",foot:"rgba(242,243,246,.42)"},graphite:{bg:"linear-gradient(165deg,#191b1f 0%,#3b3f45 48%,#9a9b9a 82%,#cdcecb 100%)",fg:"#f3f4f4",sub:"rgba(243,244,244,.68)",foot:"rgba(20,20,22,.52)"},dawn:{bg:"linear-gradient(160deg,#161320 0%,#473846 38%,#9c6f5e 72%,#dcb595 100%)",fg:"#f7f2ec",sub:"rgba(247,242,236,.74)",foot:"rgba(28,18,14,.58)"},paper:{bg:"#f1f0ec",fg:"#15161a",sub:"rgba(21,22,26,.62)",foot:"rgba(21,22,26,.5)"},vapor:{bg:"linear-gradient(180deg,#0a0e14 0%,#1c2531 32%,#3a4450 58%,#8a8c90 82%,#cdccc8 100%)",fg:"#f3f4f6",sub:"rgba(243,244,246,.78)",foot:"rgba(20,20,22,.5)"}};function $(t){let e=R[t];return{bg:e.bg,ink:e.fg,muted:e.sub,line:e.fg.startsWith("#1")?"rgba(21,22,26,.16)":"rgba(242,243,246,.13)",surface:e.fg.startsWith("#1")?"rgba(21,22,26,.045)":"rgba(255,255,255,.045)"}}var Ka=$a({sourceTokens:R,sourcePath:"theme10/source/components/DeckPrimitives.jsx",rootClass:"deck-theme",base:{bg:R.dusk.bg,surface:"rgba(255,255,255,.045)",ink:R.dusk.fg,muted:R.dusk.sub,accent:"#5479e8",accent2:"#8fa8e6",line:"rgba(242,243,246,.13)",fontDisplay:"'IBM Plex Sans','Noto Sans SC',sans-serif",fontBody:"'IBM Plex Sans','Noto Sans SC',sans-serif",fontMono:"'IBM Plex Mono',monospace",typeScale:{kicker:26,title:68,subtitle:40,body:30,label:24,caption:24,metric:116},pad:120,gap:28,radius:18,shadow:"inset 0 0 0 1px rgba(242,243,246,.13)",cardTreatment:{padding:30,borderWidth:1,borderStyle:"solid",backdropFilter:"none"},mediaTreatment:{radius:18,filter:"none",overlay:"none",border:"1px solid rgba(242,243,246,.13)"},chartTreatment:{grid:"rgba(242,243,246,.13)",label:R.dusk.sub,series:["#5479e8","#8fa8e6","#c8a77b","#8e9a91","#7a6c91","#b46f5c"],barRadius:8,strokeWidth:5},shapeTreatment:{lineWidth:2,panelRadius:18,panelBorderWidth:1},decoration:"theme10-grain"},backgrounds:{default:{},surface:$("paper"),muted:$("graphite"),accent:$("dawn"),dark:$("midnight"),light:$("paper")}}),He=_a({theme10:Ka},{fallbackKey:"theme10"}),Va=He.profiles,Ia=He.getBespokeThemeProfile;var ie={};w(ie,{BESPOKE_FAMILIES:()=>Ze,BESPOKE_THEME_PROFILES:()=>er,getBespokeThemeProfile:()=>tr});import"react";import La from"react";import{Fragment as Aa,jsx as B,jsxs as Ga}from"react/jsx-runtime";var Ze=Object.freeze(["hero","editorial","split","comparison","process","matrix","metric-spotlight","timeline","chart-led"]),Na=Object.freeze({frame:"neutral",surface:"cards",titleClass:"title",titleScale:null,listMode:"stack",quoteMode:"card",metricMode:"card",chartMode:"card"});function Wa(t){let e=Object.fromEntries(Ze.map(r=>[r,Object.freeze({...Na,...t.familyRecipes?.[r]||{}})]));return Object.freeze({...t,familyRecipes:Object.freeze(e),sourcePrimitives:Object.freeze({...t.sourcePrimitives||{}}),rootVars:Object.freeze({...t.rootVars||{}}),base:Object.freeze(t.base),backgrounds:Object.freeze(Object.fromEntries(Object.entries(t.backgrounds).map(([r,a])=>[r,Object.freeze(a)])))})}function Da(t,{fallbackKey:e="theme01"}={}){let r=Object.entries(t||{}).filter(([,n])=>n);if(!r.length)throw new Error("createBespokeThemeProfileRegistry: no theme adapters.");let a=Object.freeze(Object.fromEntries(r)),i=Object.hasOwn(a,e)?e:r[0][0],s=Object.freeze(Object.fromEntries(r.map(([n,c])=>[n,qe(n,c,"default")]))),l=new Map;function b(n,c="default"){let o=Object.hasOwn(a,n)?n:i,f=a[o].backgrounds[c]?c:"default";if(f==="default")return s[o];let d=`${o}:${f}`;return l.has(d)||l.set(d,qe(o,a[o],f)),l.get(d)}return Object.freeze({profiles:s,getBespokeThemeProfile:b})}function qe(t,e,r){let a=e.backgrounds[r]||e.backgrounds.default,i=e.base,s={...i,...a,themeKey:t,semanticBackground:r,sourceTokens:e.sourceTokens,sourcePath:e.sourcePath,sourcePrimitives:e.sourcePrimitives,cssText:e.cssText||"",Runtime:e.Runtime||null,rootClass:a.rootClass||e.rootClass||"",rootVars:Object.freeze({...e.rootVars,...a.rootVars||{}}),familyRecipes:e.familyRecipes,frame:Object.freeze({...i.frame||{},...a.frame||{}}),textTreatment:Object.freeze({...i.textTreatment||{},...a.textTreatment||{}}),cardTreatment:Object.freeze({...i.cardTreatment,...a.cardTreatment||{}}),typeScale:Object.freeze({...i.typeScale,...a.typeScale||{}}),mediaTreatment:Object.freeze({...i.mediaTreatment,...a.mediaTreatment||{}}),chartTreatment:Object.freeze({...i.chartTreatment,...a.chartTreatment||{},series:Object.freeze([...a.chartTreatment?.series||i.chartTreatment.series||[]])}),shapeTreatment:Object.freeze({...i.shapeTreatment,...a.shapeTreatment||{}})};return Object.freeze(s)}var Ye=!1,ti=La.createContext(null);function Ha(){if(Ye||typeof document>"u")return;Ye=!0;let t=document.createElement("style");t.id="ign-base-css",t.textContent=Qa,document.head.appendChild(t)}function I(t="ink"){let e={a:"#FFC07A",b:"#FF6E2E",c:"#E22A0C"},r=`linear-gradient(110deg, ${e.a} 0%, ${e.b} 46%, ${e.c} 100%)`,a={"--ign-a":e.a,"--ign-b":e.b,"--ign-c":e.c,"--ign-ember":r};return t==="paper"?{surface:t,...a,"--ign-bg":"#ECE7DF","--ign-ink":"#191310","--ign-ink2":"rgba(25,19,16,0.62)","--ign-ink3":"rgba(25,19,16,0.40)","--ign-ink4":"rgba(25,19,16,0.16)","--ign-hair":"rgba(25,19,16,0.13)","--ign-hair2":"rgba(25,19,16,0.24)","--ign-panel":"rgba(25,19,16,0.035)","--ign-ghost":"rgba(25,19,16,0.05)","--ign-glow":"0.42","--ign-grain":"0.32","--ign-edge":"0"}:t==="ember"?{surface:t,...a,"--ign-bg":"#170A05","--ign-ink":"#F8ECE2","--ign-ink2":"rgba(248,236,226,0.62)","--ign-ink3":"rgba(248,236,226,0.34)","--ign-ink4":"rgba(248,236,226,0.17)","--ign-hair":"rgba(248,236,226,0.13)","--ign-hair2":"rgba(248,236,226,0.24)","--ign-panel":"rgba(255,244,236,0.03)","--ign-ghost":"rgba(255,255,255,0.03)","--ign-glow":"1","--ign-grain":"0.5","--ign-edge":"0.62"}:{surface:t,...a,"--ign-bg":"#0B0908","--ign-ink":"#F4EEE6","--ign-ink2":"rgba(244,238,230,0.60)","--ign-ink3":"rgba(244,238,230,0.32)","--ign-ink4":"rgba(244,238,230,0.16)","--ign-hair":"rgba(244,238,230,0.12)","--ign-hair2":"rgba(244,238,230,0.22)","--ign-panel":"rgba(255,244,236,0.026)","--ign-ghost":"rgba(255,255,255,0.028)","--ign-glow":"0.92","--ign-grain":"0.5","--ign-edge":"0.56"}}function qa({surface:t="ink",className:e="",style:r,children:a}){Ha();let i=I(t);return B("div",{className:`ign-slide ${e}`,"data-surface":t,style:{...i,...r},children:a})}function Ya(){return B("div",{className:"ign-grain"})}function Xa(){return B("div",{className:"ign-edge"})}function Za(){return Ga(Aa,{children:[B("span",{className:"ign-corner tl"}),B("span",{className:"ign-corner tr"}),B("span",{className:"ign-corner bl"}),B("span",{className:"ign-corner br"})]})}var Qa=`
.ign-slide{position:absolute;inset:0;overflow:hidden;background:var(--ign-bg);color:var(--ign-ink);
  font-family:'Noto Sans SC',sans-serif;-webkit-font-smoothing:antialiased;
  font-synthesis-style:none}
.ign-slide *{box-sizing:border-box;margin:0;padding:0}
.ign-en{font-family:'Space Grotesk','Noto Sans SC',sans-serif}
.ign-serif{font-family:'Newsreader','Noto Serif SC','Songti SC','STSong','SimSun',serif;font-style:italic;font-weight:800}
.ign-ember-text{background:var(--ign-ember);-webkit-background-clip:text;background-clip:text;color:transparent}

.ign-bloom{position:absolute;pointer-events:none;z-index:0;opacity:var(--ign-glow)}
.ign-grain{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:var(--ign-grain);mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.ign-edge{position:absolute;inset:0;z-index:3;pointer-events:none;
  background:radial-gradient(135% 125% at 50% 40%,rgba(0,0,0,0) 50%,rgba(0,0,0,var(--ign-edge)) 100%)}

.ign-ghost{position:absolute;z-index:1;font-family:'Space Grotesk',sans-serif;font-weight:700;line-height:0.8;
  color:var(--ign-ghost);letter-spacing:-0.04em;pointer-events:none;user-select:none}
.ign-rail{position:absolute;left:42px;top:0;bottom:0;width:44px;z-index:4;
  display:flex;align-items:center;justify-content:center;pointer-events:none}
.ign-rail-txt{white-space:nowrap;transform:rotate(-90deg);transform-origin:center;
  font-family:'Space Grotesk',sans-serif;font-size:24px;letter-spacing:0.32em;text-transform:uppercase;color:var(--ign-ink3)}
.ign-corner{position:absolute;z-index:4;width:20px;height:20px;pointer-events:none}
.ign-corner.tl{left:52px;top:50px;border-left:1px solid var(--ign-hair2);border-top:1px solid var(--ign-hair2)}
.ign-corner.tr{right:52px;top:50px;border-right:1px solid var(--ign-hair2);border-top:1px solid var(--ign-hair2)}
.ign-corner.bl{left:52px;bottom:50px;border-left:1px solid var(--ign-hair2);border-bottom:1px solid var(--ign-hair2)}
.ign-corner.br{right:52px;bottom:50px;border-right:1px solid var(--ign-hair2);border-bottom:1px solid var(--ign-hair2)}

.ign-frame{position:absolute;inset:0;z-index:5;padding:76px 128px 66px;display:flex;flex-direction:column;pointer-events:none}
/* frame chrome is click-through in its empty gaps so a full-bleed ImageSlot
 * sitting BEHIND the frame stays click-to-upload; real content re-enables. */
.ign-frame > *{pointer-events:auto}

/* utility bar */
.ign-util{display:grid;grid-template-columns:1fr auto 1fr;align-items:center}
.ign-lock{display:flex;align-items:center;gap:14px}
.ign-wm{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:25px;letter-spacing:0.02em;white-space:nowrap}
.ign-wm em{font-family:'Newsreader','Noto Serif SC','Songti SC','STSong','SimSun',serif;font-style:italic;font-weight:800;color:var(--ign-a)}
.ign-nav{display:flex;align-items:center;gap:30px;font-family:'Space Grotesk',sans-serif;font-size:24px;letter-spacing:0.14em;white-space:nowrap}
.ign-nav span{color:var(--ign-ink3);display:flex;align-items:center;gap:10px}
.ign-nav span.on{color:var(--ign-ink)}
.ign-nav span.on::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--ign-b);box-shadow:0 0 12px var(--ign-b)}
.ign-nav i{color:var(--ign-ink4);font-style:normal}
.ign-ix{font-family:'Space Grotesk',sans-serif;font-size:24px;letter-spacing:0.24em;color:var(--ign-ink3);text-align:right;white-space:nowrap}
.ign-ix b{color:var(--ign-a);font-weight:500}

/* meta bar */
.ign-meta{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;border-top:1px solid var(--ign-hair);
  padding-top:22px;font-family:'Space Grotesk',sans-serif;font-size:24px;letter-spacing:0.16em;color:var(--ign-ink3)}
.ign-meta .r{text-align:right;white-space:nowrap}
.ign-meta .mid{font-family:'Newsreader','Noto Serif SC','Songti SC','STSong','SimSun',serif;font-style:italic;font-weight:800;color:var(--ign-ink2);letter-spacing:0.01em;white-space:nowrap}
.ign-prog{display:inline-flex;align-items:center;gap:12px;justify-content:flex-end;white-space:nowrap}
.ign-prog .track{width:120px;height:2px;background:var(--ign-hair);position:relative}
.ign-prog .fill{position:absolute;left:0;top:0;height:100%;background:linear-gradient(90deg,var(--ign-a),var(--ign-b))}

.ign-eyebrow{display:flex;align-items:center;gap:16px;font-family:'Space Grotesk',sans-serif;font-size:24px;
  letter-spacing:0.28em;text-transform:uppercase;color:var(--ign-ink2)}
.ign-eyebrow .tick{width:30px;height:1px;background:linear-gradient(90deg,var(--ign-b),transparent)}
.ign-eyebrow .no{color:var(--ign-a)}

/* image slot */
.ign-imgslot{position:relative;overflow:hidden;flex:none}
.ign-imgslot-ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  background:repeating-linear-gradient(135deg,var(--ign-panel) 0 10px,transparent 10px 20px);
  border:1px solid var(--ign-hair);border-radius:inherit}
.ign-imgslot-ph span{font-family:'Space Grotesk',sans-serif;font-size:24px;letter-spacing:0.1em;color:var(--ign-ink3)}
.ign-imgslot-up{cursor:pointer}
.ign-imgslot-hint{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;
  opacity:0;transition:opacity .2s;pointer-events:none;background:rgba(8,5,4,0.32)}
.ign-imgslot-up:hover .ign-imgslot-hint{opacity:1}
.ign-imgslot-up.ign-imgslot-drag .ign-imgslot-hint{opacity:1}
.ign-imgslot-up.ign-imgslot-drag{outline:2px dashed var(--ign-b);outline-offset:-6px}
.ign-imgslot-up.ign-imgslot-drag .ign-imgslot-hint{background:rgba(226,42,12,0.32)}
.ign-imgslot-hint span{font-family:'Space Grotesk',sans-serif;font-size:22px;letter-spacing:0.14em;text-transform:uppercase;
  color:#F8ECE2;padding:12px 22px;border:1px solid rgba(248,236,226,0.55);backdrop-filter:blur(2px)}
@media print{.ign-imgslot-hint{display:none}}

/* dim helper for focus/emphasis mode */
.ign-dim{opacity:0.34;filter:saturate(0.5);transition:opacity .25s,filter .25s}
.ign-lit{transition:opacity .25s}

/* per-slide entrance animation. Base style is the visible end-state; we animate
 * FROM hidden only while the slide is active and motion is allowed, so print,
 * PDF export and reduced-motion always show finished content. */
@keyframes ign-rise{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:no-preference){
  [data-deck-active] .ign-a1{animation:ign-rise .66s cubic-bezier(.2,.7,.2,1) both}
  [data-deck-active] .ign-a2{animation:ign-rise .66s cubic-bezier(.2,.7,.2,1) .13s both}
  [data-deck-active] .ign-a3{animation:ign-rise .66s cubic-bezier(.2,.7,.2,1) .24s both}
}
`,j=I("ink"),Xe=I("paper"),Ua=I("ember");function re(t){return{rootVars:t,bg:t["--ign-bg"],surface:t["--ign-panel"],ink:t["--ign-ink"],muted:t["--ign-ink2"],line:t["--ign-hair"],chartTreatment:{grid:t["--ign-hair"],label:t["--ign-ink2"]}}}var Ja=Wa({sourceTokens:j,sourcePath:"theme11/source/ignBase.jsx",rootVars:j,sourcePrimitives:{Slide:qa,Grain:Ya,Edge:Xa,Corners:Za},rootClass:"ign-slide",base:{bg:j["--ign-bg"],surface:j["--ign-panel"],ink:j["--ign-ink"],muted:j["--ign-ink2"],accent:j["--ign-b"],accent2:j["--ign-a"],line:j["--ign-hair"],fontDisplay:"'Space Grotesk','Noto Sans SC',sans-serif",fontBody:"'Noto Sans SC',sans-serif",fontMono:"'Space Grotesk','Noto Sans SC',sans-serif",typeScale:{kicker:24,title:68,subtitle:40,body:27,label:24,caption:24,metric:116},pad:128,gap:26,radius:4,shadow:"none",cardTreatment:{padding:30,borderWidth:1,borderStyle:"solid",backdropFilter:"none"},mediaTreatment:{radius:4,filter:"none",overlay:"none",border:`1px solid ${j["--ign-hair"]}`},chartTreatment:{grid:j["--ign-hair"],label:j["--ign-ink2"],series:[j["--ign-a"],j["--ign-b"],j["--ign-c"]],barRadius:2,strokeWidth:5},shapeTreatment:{lineWidth:2,panelRadius:4,panelBorderWidth:1},decoration:"theme11-ignis"},backgrounds:{default:{},surface:re(Xe),muted:{bg:j["--ign-panel"]},accent:re(Ua),dark:{},light:re(Xe)}}),Qe=Da({theme11:Ja},{fallbackKey:"theme11"}),er=Qe.profiles,tr=Qe.getBespokeThemeProfile;var ne={};w(ne,{BESPOKE_FAMILIES:()=>Je,BESPOKE_THEME_PROFILES:()=>lr,getBespokeThemeProfile:()=>fr});import"react";import"react";import"react";import"react/jsx-runtime";import{jsx as N}from"react/jsx-runtime";var Je=Object.freeze(["hero","editorial","split","comparison","process","matrix","metric-spotlight","timeline","chart-led"]),ar=Object.freeze({frame:"neutral",surface:"cards",titleClass:"title",titleScale:null,listMode:"stack",quoteMode:"card",metricMode:"card",chartMode:"card"});function rr(t){let e=Object.fromEntries(Je.map(r=>[r,Object.freeze({...ar,...t.familyRecipes?.[r]||{}})]));return Object.freeze({...t,familyRecipes:Object.freeze(e),sourcePrimitives:Object.freeze({...t.sourcePrimitives||{}}),rootVars:Object.freeze({...t.rootVars||{}}),base:Object.freeze(t.base),backgrounds:Object.freeze(Object.fromEntries(Object.entries(t.backgrounds).map(([r,a])=>[r,Object.freeze(a)])))})}function ir(t,{fallbackKey:e="theme01"}={}){let r=Object.entries(t||{}).filter(([,n])=>n);if(!r.length)throw new Error("createBespokeThemeProfileRegistry: no theme adapters.");let a=Object.freeze(Object.fromEntries(r)),i=Object.hasOwn(a,e)?e:r[0][0],s=Object.freeze(Object.fromEntries(r.map(([n,c])=>[n,Ue(n,c,"default")]))),l=new Map;function b(n,c="default"){let o=Object.hasOwn(a,n)?n:i,f=a[o].backgrounds[c]?c:"default";if(f==="default")return s[o];let d=`${o}:${f}`;return l.has(d)||l.set(d,Ue(o,a[o],f)),l.get(d)}return Object.freeze({profiles:s,getBespokeThemeProfile:b})}function Ue(t,e,r){let a=e.backgrounds[r]||e.backgrounds.default,i=e.base,s={...i,...a,themeKey:t,semanticBackground:r,sourceTokens:e.sourceTokens,sourcePath:e.sourcePath,sourcePrimitives:e.sourcePrimitives,cssText:e.cssText||"",Runtime:e.Runtime||null,rootClass:a.rootClass||e.rootClass||"",rootVars:Object.freeze({...e.rootVars,...a.rootVars||{}}),familyRecipes:e.familyRecipes,frame:Object.freeze({...i.frame||{},...a.frame||{}}),textTreatment:Object.freeze({...i.textTreatment||{},...a.textTreatment||{}}),cardTreatment:Object.freeze({...i.cardTreatment,...a.cardTreatment||{}}),typeScale:Object.freeze({...i.typeScale,...a.typeScale||{}}),mediaTreatment:Object.freeze({...i.mediaTreatment,...a.mediaTreatment||{}}),chartTreatment:Object.freeze({...i.chartTreatment,...a.chartTreatment||{},series:Object.freeze([...a.chartTreatment?.series||i.chartTreatment.series||[]])}),shapeTreatment:Object.freeze({...i.shapeTreatment,...a.shapeTreatment||{}})};return Object.freeze(s)}function nr(t,e,r){return{bg:t,surface:"rgba(0,0,0,.12)",ink:e,muted:e==="#ffffff"?"rgba(255,255,255,.74)":"rgba(0,0,0,.64)",line:e==="#ffffff"?"rgba(255,255,255,.24)":"rgba(0,0,0,.2)",accent2:r}}var O={color:{blush:"#f5e1e3",paper:"#ffffff",ink:"#1b1518",dark:"#1c1416",inkMut:"#7d7176",purple:"#5a138e",magenta:"#d61fb5",plum:"#f3b8ec",cyan:"#3bb6ec",navy:"#143049",green:"#1f6b2a",lime:"#baf04f",orange:"#f15a29",peach:"#fdddc6",rust:"#7a3a18",hlO:"#fbb24d",hlP:"#c44ee0",hlC:"#74d2f0",hlG:"#bcee54",line:"rgba(27,21,24,.16)",line2:"rgba(27,21,24,.30)",lineD:"rgba(245,225,227,.16)",lineD2:"rgba(245,225,227,.32)"},font:{sans:"'Noto Sans SC', system-ui, sans-serif",mono:"'Space Mono', ui-monospace, monospace"},type:{hero:124,h1:74,h2:64,h3:33,body:25,label:24},pad:{x:96,t:54,b:48},radius:30},or=["#f15a29","#3bb6ec","#baf04f","#c44ee0","#1f6b2a"],W=O.color,pi=O.font,mi={o:[W.hlO,"#3a2607"],p:[W.hlP,"#fff"],c:[W.hlC,"#0d2c44"],g:[W.hlG,"#234d12"]};function sr({kind:t="circle",size:e=80,color:r="#000",border:a=16,style:i}){let s={position:"absolute",width:e,height:e,zIndex:1,...i};return t==="ring"?N("div",{style:{...s,border:a+"px solid "+r,borderRadius:"50%"}}):t==="teardrop"?N("div",{style:{...s,background:r,borderRadius:"50% 50% 50% 0",transform:"rotate(45deg)"}}):t==="pentagon"?N("div",{style:{...s,background:r,clipPath:"polygon(50% 0,100% 38%,82% 100%,18% 100%,0 38%)"}}):N("div",{style:{...s,background:r,borderRadius:"50%"}})}var h=O.color,cr=rr({sourceTokens:O,sourcePath:"theme12/source/src/swTheme.js",sourcePrimitives:{Shape:sr},rootClass:"sw-root",base:{bg:h.blush,surface:h.paper,ink:h.ink,muted:h.inkMut,accent:h.orange,accent2:h.cyan,line:h.line,fontDisplay:O.font.sans,fontBody:O.font.sans,fontMono:O.font.mono,typeScale:{kicker:O.type.label,title:O.type.h1,subtitle:O.type.h3,body:O.type.body,label:O.type.label,caption:O.type.label,metric:O.type.hero},pad:O.pad.x,gap:24,radius:O.radius,shadow:"none",cardTreatment:{padding:30,borderWidth:1,borderStyle:"solid",backdropFilter:"none"},mediaTreatment:{radius:18,filter:"none",overlay:"none",border:`1px solid ${h.line}`},chartTreatment:{grid:h.line,label:h.inkMut,series:or,barRadius:9,strokeWidth:6},shapeTreatment:{lineWidth:4,panelRadius:O.radius,panelBorderWidth:1},decoration:"theme12-shapes"},backgrounds:{default:{},surface:{bg:h.paper},muted:{bg:h.blush,surface:h.paper},accent:nr(h.orange,"#ffffff",h.hlO),dark:{bg:h.dark,surface:"#241e20",ink:h.blush,muted:h.plum,line:h.lineD,accent:h.orange,accent2:h.cyan},light:{bg:h.blush}}}),et=ir({theme12:cr},{fallbackKey:"theme12"}),lr=et.profiles,fr=et.getBespokeThemeProfile;var oe=Object.freeze({theme01:D,theme02:G,theme03:q,theme04:Y,theme05:X,theme06:Z,theme07:Q,theme08:ee,theme09:te,theme10:ae,theme11:ie,theme12:ne}),bi=_,ui=Object.freeze(Object.fromEntries(Object.entries(oe).map(([t,e])=>[t,e.BESPOKE_THEME_PROFILES[t]])));function hi(t,e="default"){let r=Object.hasOwn(oe,t)?t:"theme01";return oe[r].getBespokeThemeProfile(r,e)}export{bi as BESPOKE_FAMILIES,ui as BESPOKE_THEME_PROFILES,hi as getBespokeThemeProfile};
