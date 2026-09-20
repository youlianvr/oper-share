import*as u from"react";var v=Object.freeze(["hero","editorial","split","comparison","process","matrix","metric-spotlight","timeline","chart-led"]),N=Object.freeze({frame:"neutral",surface:"cards",titleClass:"title",titleScale:null,listMode:"stack",quoteMode:"card",metricMode:"card",chartMode:"card"});function x(e){let t=Object.fromEntries(v.map(n=>[n,Object.freeze({...N,...e.familyRecipes?.[n]||{}})]));return Object.freeze({...e,familyRecipes:Object.freeze(t),sourcePrimitives:Object.freeze({...e.sourcePrimitives||{}}),rootVars:Object.freeze({...e.rootVars||{}}),base:Object.freeze(e.base),backgrounds:Object.freeze(Object.fromEntries(Object.entries(e.backgrounds).map(([n,i])=>[n,Object.freeze(i)])))})}function k(e,{fallbackKey:t="theme01"}={}){let n=Object.entries(e||{}).filter(([,a])=>a);if(!n.length)throw new Error("createBespokeThemeProfileRegistry: no theme adapters.");let i=Object.freeze(Object.fromEntries(n)),o=Object.hasOwn(i,t)?t:n[0][0],l=Object.freeze(Object.fromEntries(n.map(([a,d])=>[a,h(a,d,"default")]))),p=new Map;function j(a,d="default"){let c=Object.hasOwn(i,a)?a:o,m=i[c].backgrounds[d]?d:"default";if(m==="default")return l[c];let f=`${c}:${m}`;return p.has(f)||p.set(f,h(c,i[c],m)),p.get(f)}return Object.freeze({profiles:l,getBespokeThemeProfile:j})}function h(e,t,n){let i=t.backgrounds[n]||t.backgrounds.default,o=t.base,l={...o,...i,themeKey:e,semanticBackground:n,sourceTokens:t.sourceTokens,sourcePath:t.sourcePath,sourcePrimitives:t.sourcePrimitives,cssText:t.cssText||"",Runtime:t.Runtime||null,rootClass:i.rootClass||t.rootClass||"",rootVars:Object.freeze({...t.rootVars,...i.rootVars||{}}),familyRecipes:t.familyRecipes,frame:Object.freeze({...o.frame||{},...i.frame||{}}),textTreatment:Object.freeze({...o.textTreatment||{},...i.textTreatment||{}}),cardTreatment:Object.freeze({...o.cardTreatment,...i.cardTreatment||{}}),typeScale:Object.freeze({...o.typeScale,...i.typeScale||{}}),mediaTreatment:Object.freeze({...o.mediaTreatment,...i.mediaTreatment||{}}),chartTreatment:Object.freeze({...o.chartTreatment,...i.chartTreatment||{},series:Object.freeze([...i.chartTreatment?.series||o.chartTreatment.series||[]])}),shapeTreatment:Object.freeze({...o.shapeTreatment,...i.shapeTreatment||{}})};return Object.freeze(l)}import R from"react";import{Fragment as I,jsx as s,jsxs as $}from"react/jsx-runtime";var y=!1,D=R.createContext(null);function P(){if(y||typeof document>"u")return;y=!0;let e=document.createElement("style");e.id="ign-base-css",e.textContent=F,document.head.appendChild(e)}function g(e="ink"){let t={a:"#FFC07A",b:"#FF6E2E",c:"#E22A0C"},n=`linear-gradient(110deg, ${t.a} 0%, ${t.b} 46%, ${t.c} 100%)`,i={"--ign-a":t.a,"--ign-b":t.b,"--ign-c":t.c,"--ign-ember":n};return e==="paper"?{surface:e,...i,"--ign-bg":"#ECE7DF","--ign-ink":"#191310","--ign-ink2":"rgba(25,19,16,0.62)","--ign-ink3":"rgba(25,19,16,0.40)","--ign-ink4":"rgba(25,19,16,0.16)","--ign-hair":"rgba(25,19,16,0.13)","--ign-hair2":"rgba(25,19,16,0.24)","--ign-panel":"rgba(25,19,16,0.035)","--ign-ghost":"rgba(25,19,16,0.05)","--ign-glow":"0.42","--ign-grain":"0.32","--ign-edge":"0"}:e==="ember"?{surface:e,...i,"--ign-bg":"#170A05","--ign-ink":"#F8ECE2","--ign-ink2":"rgba(248,236,226,0.62)","--ign-ink3":"rgba(248,236,226,0.34)","--ign-ink4":"rgba(248,236,226,0.17)","--ign-hair":"rgba(248,236,226,0.13)","--ign-hair2":"rgba(248,236,226,0.24)","--ign-panel":"rgba(255,244,236,0.03)","--ign-ghost":"rgba(255,255,255,0.03)","--ign-glow":"1","--ign-grain":"0.5","--ign-edge":"0.62"}:{surface:e,...i,"--ign-bg":"#0B0908","--ign-ink":"#F4EEE6","--ign-ink2":"rgba(244,238,230,0.60)","--ign-ink3":"rgba(244,238,230,0.32)","--ign-ink4":"rgba(244,238,230,0.16)","--ign-hair":"rgba(244,238,230,0.12)","--ign-hair2":"rgba(244,238,230,0.22)","--ign-panel":"rgba(255,244,236,0.026)","--ign-ghost":"rgba(255,255,255,0.028)","--ign-glow":"0.92","--ign-grain":"0.5","--ign-edge":"0.56"}}function S({surface:e="ink",className:t="",style:n,children:i}){P();let o=g(e);return s("div",{className:`ign-slide ${t}`,"data-surface":e,style:{...o,...n},children:i})}function w(){return s("div",{className:"ign-grain"})}function E(){return s("div",{className:"ign-edge"})}function C(){return $(I,{children:[s("span",{className:"ign-corner tl"}),s("span",{className:"ign-corner tr"}),s("span",{className:"ign-corner bl"}),s("span",{className:"ign-corner br"})]})}var F=`
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
`;var r=g("ink"),T=g("paper"),M=g("ember");function b(e){return{rootVars:e,bg:e["--ign-bg"],surface:e["--ign-panel"],ink:e["--ign-ink"],muted:e["--ign-ink2"],line:e["--ign-hair"],chartTreatment:{grid:e["--ign-hair"],label:e["--ign-ink2"]}}}var z=x({sourceTokens:r,sourcePath:"theme11/source/ignBase.jsx",rootVars:r,sourcePrimitives:{Slide:S,Grain:w,Edge:E,Corners:C},rootClass:"ign-slide",base:{bg:r["--ign-bg"],surface:r["--ign-panel"],ink:r["--ign-ink"],muted:r["--ign-ink2"],accent:r["--ign-b"],accent2:r["--ign-a"],line:r["--ign-hair"],fontDisplay:"'Space Grotesk','Noto Sans SC',sans-serif",fontBody:"'Noto Sans SC',sans-serif",fontMono:"'Space Grotesk','Noto Sans SC',sans-serif",typeScale:{kicker:24,title:68,subtitle:40,body:27,label:24,caption:24,metric:116},pad:128,gap:26,radius:4,shadow:"none",cardTreatment:{padding:30,borderWidth:1,borderStyle:"solid",backdropFilter:"none"},mediaTreatment:{radius:4,filter:"none",overlay:"none",border:`1px solid ${r["--ign-hair"]}`},chartTreatment:{grid:r["--ign-hair"],label:r["--ign-ink2"],series:[r["--ign-a"],r["--ign-b"],r["--ign-c"]],barRadius:2,strokeWidth:5},shapeTreatment:{lineWidth:2,panelRadius:4,panelBorderWidth:1},decoration:"theme11-ignis"},backgrounds:{default:{},surface:b(T),muted:{bg:r["--ign-panel"]},accent:b(M),dark:{},light:b(T)}});var O=k({theme11:z},{fallbackKey:"theme11"}),Q=O.profiles,X=O.getBespokeThemeProfile;export{v as BESPOKE_FAMILIES,Q as BESPOKE_THEME_PROFILES,X as getBespokeThemeProfile};
