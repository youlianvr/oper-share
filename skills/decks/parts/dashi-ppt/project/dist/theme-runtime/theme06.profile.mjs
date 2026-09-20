import*as k from"react";var f=Object.freeze(["hero","editorial","split","comparison","process","matrix","metric-spotlight","timeline","chart-led"]),j=Object.freeze({frame:"neutral",surface:"cards",titleClass:"title",titleScale:null,listMode:"stack",quoteMode:"card",metricMode:"card",chartMode:"card"});function u(r){let t=Object.fromEntries(f.map(o=>[o,Object.freeze({...j,...r.familyRecipes?.[o]||{}})]));return Object.freeze({...r,familyRecipes:Object.freeze(t),sourcePrimitives:Object.freeze({...r.sourcePrimitives||{}}),rootVars:Object.freeze({...r.rootVars||{}}),base:Object.freeze(r.base),backgrounds:Object.freeze(Object.fromEntries(Object.entries(r.backgrounds).map(([o,a])=>[o,Object.freeze(a)])))})}function g(r,{fallbackKey:t="theme01"}={}){let o=Object.entries(r||{}).filter(([,i])=>i);if(!o.length)throw new Error("createBespokeThemeProfileRegistry: no theme adapters.");let a=Object.freeze(Object.fromEntries(o)),n=Object.hasOwn(a,t)?t:o[0][0],c=Object.freeze(Object.fromEntries(o.map(([i,l])=>[i,m(i,l,"default")]))),d=new Map;function O(i,l="default"){let s=Object.hasOwn(a,i)?i:n,x=a[s].backgrounds[l]?l:"default";if(x==="default")return c[s];let p=`${s}:${x}`;return d.has(p)||d.set(p,m(s,a[s],x)),d.get(p)}return Object.freeze({profiles:c,getBespokeThemeProfile:O})}function m(r,t,o){let a=t.backgrounds[o]||t.backgrounds.default,n=t.base,c={...n,...a,themeKey:r,semanticBackground:o,sourceTokens:t.sourceTokens,sourcePath:t.sourcePath,sourcePrimitives:t.sourcePrimitives,cssText:t.cssText||"",Runtime:t.Runtime||null,rootClass:a.rootClass||t.rootClass||"",rootVars:Object.freeze({...t.rootVars,...a.rootVars||{}}),familyRecipes:t.familyRecipes,frame:Object.freeze({...n.frame||{},...a.frame||{}}),textTreatment:Object.freeze({...n.textTreatment||{},...a.textTreatment||{}}),cardTreatment:Object.freeze({...n.cardTreatment,...a.cardTreatment||{}}),typeScale:Object.freeze({...n.typeScale,...a.typeScale||{}}),mediaTreatment:Object.freeze({...n.mediaTreatment,...a.mediaTreatment||{}}),chartTreatment:Object.freeze({...n.chartTreatment,...a.chartTreatment||{},series:Object.freeze([...a.chartTreatment?.series||n.chartTreatment.series||[]])}),shapeTreatment:Object.freeze({...n.shapeTreatment,...a.shapeTreatment||{}})};return Object.freeze(c)}function b(r,t,o){return{bg:r,surface:"rgba(0,0,0,.12)",ink:t,muted:t==="#ffffff"?"rgba(255,255,255,.74)":"rgba(0,0,0,.64)",line:t==="#ffffff"?"rgba(255,255,255,.24)":"rgba(0,0,0,.2)",accent2:o}}function e(r,t){return`var(${r},${t})`}import v from"react";import{jsx as R}from"react/jsx-runtime";var E=v.createContext(null);var M=`
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
`;if(typeof document<"u"&&!document.getElementById("kx-kit-css")){let r=document.createElement("style");r.id="kx-kit-css",r.textContent=M,document.head.appendChild(r)}var h=v.createElement;function y({cols:r=6}){return h("div",{className:"kx-grid",style:{gridTemplateColumns:`repeat(${r},1fr)`}},Array.from({length:r},(t,o)=>h("span",{key:o})))}var w=u({sourceTokens:Object.freeze({rootClass:"kx-slide",darkClass:"kx-dark",lightClass:"kx-light"}),sourcePath:"theme06/source/slides/kit.jsx",sourcePrimitives:{Grid:y},rootClass:"kx-slide kx-dark",base:{bg:e("--kx-ink","#0c0c0c"),surface:e("--kx-ink-2","#141414"),ink:e("--kx-cream","#f0efe6"),muted:e("--kx-mute-2","#9a9a92"),accent:e("--kx-accent","#c8f135"),accent2:e("--kx-mute","#c8c8c0"),line:e("--kx-line","rgba(255,255,255,.10)"),fontDisplay:"'Archivo','Noto Sans SC',system-ui,sans-serif",fontBody:"'Archivo','Noto Sans SC',system-ui,sans-serif",fontMono:"'Space Mono','Noto Sans SC',monospace",typeScale:{kicker:24,title:72,subtitle:42,body:27,label:24,caption:24,metric:92},pad:96,gap:24,radius:0,shadow:"none",cardTreatment:{padding:28,borderWidth:1,borderStyle:"solid",backdropFilter:"none"},mediaTreatment:{radius:0,filter:"none",overlay:"none",border:`1px solid ${e("--kx-line","rgba(255,255,255,.10)")}`},chartTreatment:{grid:e("--kx-line","rgba(255,255,255,.10)"),label:e("--kx-mute-2","#9a9a92"),series:[e("--kx-accent","#c8f135"),e("--kx-cream","#f0efe6"),e("--kx-mute","#c8c8c0")],barRadius:0,strokeWidth:5},shapeTreatment:{lineWidth:2,panelRadius:0,panelBorderWidth:1},decoration:"theme06-grid"},backgrounds:{default:{},surface:{bg:e("--kx-ink-2","#141414")},muted:{bg:e("--kx-ink-3","#1c1c1c")},accent:b(e("--kx-accent","#c8f135"),e("--kx-ink","#0c0c0c"),e("--kx-cream","#f0efe6")),dark:{},light:{rootClass:"kx-slide kx-light",bg:e("--kx-cream","#f0efe6"),surface:e("--kx-cream-2","#e6e4d8"),ink:e("--kx-ink","#0c0c0c"),muted:e("--kx-mute-2","#9a9a92"),line:e("--kx-line-d","rgba(0,0,0,.14)")}}});var S=g({theme06:w},{fallbackKey:"theme06"}),_=S.profiles,G=S.getBespokeThemeProfile;export{f as BESPOKE_FAMILIES,_ as BESPOKE_THEME_PROFILES,G as getBespokeThemeProfile};
