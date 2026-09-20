import*as b from"react";var u=Object.freeze(["hero","editorial","split","comparison","process","matrix","metric-spotlight","timeline","chart-led"]),w=Object.freeze({frame:"neutral",surface:"cards",titleClass:"title",titleScale:null,listMode:"stack",quoteMode:"card",metricMode:"card",chartMode:"card"});function k(e){let r=Object.fromEntries(u.map(a=>[a,Object.freeze({...w,...e.familyRecipes?.[a]||{}})]));return Object.freeze({...e,familyRecipes:Object.freeze(r),sourcePrimitives:Object.freeze({...e.sourcePrimitives||{}}),rootVars:Object.freeze({...e.rootVars||{}}),base:Object.freeze(e.base),backgrounds:Object.freeze(Object.fromEntries(Object.entries(e.backgrounds).map(([a,n])=>[a,Object.freeze(n)])))})}function g(e,{fallbackKey:r="theme01"}={}){let a=Object.entries(e||{}).filter(([,i])=>i);if(!a.length)throw new Error("createBespokeThemeProfileRegistry: no theme adapters.");let n=Object.freeze(Object.fromEntries(a)),o=Object.hasOwn(n,r)?r:a[0][0],c=Object.freeze(Object.fromEntries(a.map(([i,d])=>[i,m(i,d,"default")]))),l=new Map;function $(i,d="default"){let s=Object.hasOwn(n,i)?i:o,f=n[s].backgrounds[d]?d:"default";if(f==="default")return c[s];let p=`${s}:${f}`;return l.has(p)||l.set(p,m(s,n[s],f)),l.get(p)}return Object.freeze({profiles:c,getBespokeThemeProfile:$})}function m(e,r,a){let n=r.backgrounds[a]||r.backgrounds.default,o=r.base,c={...o,...n,themeKey:e,semanticBackground:a,sourceTokens:r.sourceTokens,sourcePath:r.sourcePath,sourcePrimitives:r.sourcePrimitives,cssText:r.cssText||"",Runtime:r.Runtime||null,rootClass:n.rootClass||r.rootClass||"",rootVars:Object.freeze({...r.rootVars,...n.rootVars||{}}),familyRecipes:r.familyRecipes,frame:Object.freeze({...o.frame||{},...n.frame||{}}),textTreatment:Object.freeze({...o.textTreatment||{},...n.textTreatment||{}}),cardTreatment:Object.freeze({...o.cardTreatment,...n.cardTreatment||{}}),typeScale:Object.freeze({...o.typeScale,...n.typeScale||{}}),mediaTreatment:Object.freeze({...o.mediaTreatment,...n.mediaTreatment||{}}),chartTreatment:Object.freeze({...o.chartTreatment,...n.chartTreatment||{},series:Object.freeze([...n.chartTreatment?.series||o.chartTreatment.series||[]])}),shapeTreatment:Object.freeze({...o.shapeTreatment,...n.shapeTreatment||{}})};return Object.freeze(c)}function y(e,r,a){return{bg:e,surface:"rgba(0,0,0,.12)",ink:r,muted:r==="#ffffff"?"rgba(255,255,255,.74)":"rgba(0,0,0,.64)",line:r==="#ffffff"?"rgba(255,255,255,.24)":"rgba(0,0,0,.2)",accent2:a}}import h from"react";import{jsx as L,jsxs as F}from"react/jsx-runtime";var t={fontDisplay:"'Archivo','Noto Sans SC',sans-serif",fontCN:"'Noto Sans SC','Archivo',sans-serif",fontMono:"'Space Mono',monospace",fontScript:"'Caveat',cursive",ink:"#ffffff",inkDim:"rgba(255,255,255,.66)",inkFaint:"rgba(255,255,255,.40)",accent:"#46e3c6",blue:"#4a86ff",blueDeep:"#1d49d6",blueElectric:"#2f6bff",violet:"#9f7bff",warn:"#ffb27a",navyCard:"#0a1230",navy900:"#050b22",glassLine:"rgba(255,255,255,.22)",radius:26,type:{mega:300,title:88,h2:64,sub:40,body:30,small:26,tiny:24},pad:{x:110,y:90}};function E(e){let r=e||{};return{...t,...r,type:{...t.type,...r.type||{}},pad:{...t.pad,...r.pad||{}}}}function O(e){return`
  .dk-scope{
    --type-mega:${e.type.mega}px; --type-title:${e.type.title}px; --type-h2:${e.type.h2}px;
    --type-sub:${e.type.sub}px; --type-body:${e.type.body}px; --type-small:${e.type.small}px; --type-tiny:${e.type.tiny}px;
    --pad-x:${e.pad.x}px; --pad-y:${e.pad.y}px;
    --dk-accent:${e.accent}; --mint:${e.accent};
    --dk-blue:${e.blue}; --blue-bright:${e.blue}; --blue-deep:${e.blueDeep}; --blue-electric:${e.blueElectric}; --dk-violet:${e.violet}; --dk-warn:${e.warn};
    --ink:${e.ink}; --ink-dim:${e.inkDim}; --ink-faint:${e.inkFaint};
    --navy-card:${e.navyCard}; --navy-900:${e.navy900}; --glass-line:${e.glassLine}; --dk-radius:${e.radius}px;
    --font-display:${e.fontDisplay}; --font-cn:${e.fontCN}; --font-mono:${e.fontMono}; --font-script:${e.fontScript};
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
  }`}function x(e){if(typeof document>"u")return;let r=O(e||t),a=document.getElementById("deckkit-base");a||(a=document.createElement("style"),a.id="deckkit-base",document.head.appendChild(a)),a.textContent!==r&&(a.textContent=r)}function v(e){let r=h.useMemo(()=>e?E(e):t,[e]);return h.useLayoutEffect(()=>{x(r)},[r]),typeof document<"u"&&!document.getElementById("deckkit-base")&&x(r),r}function C(){return typeof document>"u"?null:j()}function j(){return v(),null}var S=k({sourceTokens:t,sourcePath:"theme09/source/slides/DeckKit.jsx",Runtime:C,rootClass:"dk-scope bg-deep",base:{bg:t.navy900,surface:"linear-gradient(150deg,rgba(255,255,255,.14),rgba(255,255,255,.05))",ink:t.ink,muted:t.inkDim,accent:t.accent,accent2:t.blue,line:t.glassLine,fontDisplay:t.fontDisplay,fontBody:t.fontCN,fontMono:t.fontMono,typeScale:{kicker:t.type.small,title:t.type.title,subtitle:t.type.sub,body:t.type.body,label:t.type.tiny,caption:t.type.small,metric:132},pad:t.pad.x,gap:28,radius:t.radius,shadow:"0 24px 60px rgba(3,8,30,.4),inset 0 1px 0 rgba(255,255,255,.25)",cardTreatment:{padding:30,borderWidth:1,borderStyle:"solid",backdropFilter:"blur(14px)"},mediaTreatment:{radius:20,filter:"none",overlay:"linear-gradient(180deg,transparent 58%,rgba(3,8,30,.42))",border:`1px solid ${t.glassLine}`},chartTreatment:{grid:"rgba(255,255,255,.10)",label:t.inkDim,series:[t.blue,t.accent,t.violet,t.warn],barRadius:16,strokeWidth:5},shapeTreatment:{lineWidth:3,panelRadius:t.radius,panelBorderWidth:1},decoration:"theme09-orbs"},backgrounds:{default:{},surface:{rootClass:"dk-scope bg-blue",bg:t.navyCard},muted:{rootClass:"dk-scope bg-night",bg:t.navy900},accent:{rootClass:"dk-scope bg-electric",...y(t.blueElectric,"#ffffff",t.accent)},dark:{rootClass:"dk-scope bg-night",bg:t.navy900},light:{rootClass:"dk-scope bg-blue",bg:t.blueDeep}}});var T=g({theme09:S},{fallbackKey:"theme09"}),V=T.profiles,Y=T.getBespokeThemeProfile;export{u as BESPOKE_FAMILIES,V as BESPOKE_THEME_PROFILES,Y as getBespokeThemeProfile};
