import*as h from"react";var v=Object.freeze(["hero","editorial","split","comparison","process","matrix","metric-spotlight","timeline","chart-led"]),E=Object.freeze({frame:"neutral",surface:"cards",titleClass:"title",titleScale:null,listMode:"stack",quoteMode:"card",metricMode:"card",chartMode:"card"});function y(r){let e=Object.fromEntries(v.map(o=>[o,Object.freeze({...E,...r.familyRecipes?.[o]||{}})]));return Object.freeze({...r,familyRecipes:Object.freeze(e),sourcePrimitives:Object.freeze({...r.sourcePrimitives||{}}),rootVars:Object.freeze({...r.rootVars||{}}),base:Object.freeze(r.base),backgrounds:Object.freeze(Object.fromEntries(Object.entries(r.backgrounds).map(([o,a])=>[o,Object.freeze(a)])))})}function x(r,{fallbackKey:e="theme01"}={}){let o=Object.entries(r||{}).filter(([,c])=>c);if(!o.length)throw new Error("createBespokeThemeProfileRegistry: no theme adapters.");let a=Object.freeze(Object.fromEntries(o)),n=Object.hasOwn(a,e)?e:o[0][0],d=Object.freeze(Object.fromEntries(o.map(([c,l])=>[c,k(c,l,"default")]))),p=new Map;function u(c,l="default"){let i=Object.hasOwn(a,c)?c:n,f=a[i].backgrounds[l]?l:"default";if(f==="default")return d[i];let m=`${i}:${f}`;return p.has(m)||p.set(m,k(i,a[i],f)),p.get(m)}return Object.freeze({profiles:d,getBespokeThemeProfile:u})}function k(r,e,o){let a=e.backgrounds[o]||e.backgrounds.default,n=e.base,d={...n,...a,themeKey:r,semanticBackground:o,sourceTokens:e.sourceTokens,sourcePath:e.sourcePath,sourcePrimitives:e.sourcePrimitives,cssText:e.cssText||"",Runtime:e.Runtime||null,rootClass:a.rootClass||e.rootClass||"",rootVars:Object.freeze({...e.rootVars,...a.rootVars||{}}),familyRecipes:e.familyRecipes,frame:Object.freeze({...n.frame||{},...a.frame||{}}),textTreatment:Object.freeze({...n.textTreatment||{},...a.textTreatment||{}}),cardTreatment:Object.freeze({...n.cardTreatment,...a.cardTreatment||{}}),typeScale:Object.freeze({...n.typeScale,...a.typeScale||{}}),mediaTreatment:Object.freeze({...n.mediaTreatment,...a.mediaTreatment||{}}),chartTreatment:Object.freeze({...n.chartTreatment,...a.chartTreatment||{},series:Object.freeze([...a.chartTreatment?.series||n.chartTreatment.series||[]])}),shapeTreatment:Object.freeze({...n.shapeTreatment,...a.shapeTreatment||{}})};return Object.freeze(d)}function w(r,e,o){return{bg:r,surface:"rgba(0,0,0,.12)",ink:e,muted:e==="#ffffff"?"rgba(255,255,255,.74)":"rgba(0,0,0,.64)",line:e==="#ffffff"?"rgba(255,255,255,.24)":"rgba(0,0,0,.2)",accent2:o}}function S(r){let e={};for(let o of String(r).matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi))e[o[1]]=o[2].trim();return Object.freeze(e)}import j from"react";import{jsx as s,jsxs as b}from"react/jsx-runtime";var N=j.createContext(null),g=`
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
`;function _(){return s("style",{children:`
      .acl-root{ ${g} }
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
    `})}function C({kind:r="spark",size:e=54,color:o,fill:a="currentColor",stroke:n,strokeWidth:d=4,rotate:p=0,style:u={},className:c=""}){let l={fill:"none",stroke:"currentColor",strokeWidth:3,strokeLinecap:"round",strokeLinejoin:"round"},i={fill:a,stroke:n||"none",strokeWidth:n?d:0,strokeLinejoin:"round"},f={arrow:b("g",{...l,children:[s("path",{d:"M6 18 Q40 6 73 37"}),s("path",{d:"M57 32 L73 37 L67 21"})]}),arrowS:b("g",{...l,children:[s("path",{d:"M7 15 Q37 17 72 41"}),s("path",{d:"M56 37 L72 41 L66 24"})]}),loop:b("g",{...l,children:[s("path",{d:"M58 18 C48 8, 24 10, 20 28 C17 44, 40 52, 56 42"}),s("path",{d:"M49 53 L56 42 L43 43"})]}),spark:s("g",{...i,children:s("path",{d:"M27 2 C29 18, 32 21, 52 27 C32 33, 29 36, 27 52 C25 36, 22 33, 2 27 C22 21, 25 18, 27 2 Z"})}),star:s("g",{...i,children:s("path",{d:"M27 3 L34 20 L52 21 L38 33 L43 51 L27 40 L11 51 L16 33 L2 21 L20 20 Z"})}),heart:s("g",{...i,children:s("path",{d:"M27 49 C7 35, 7 15, 21 15 C26 15, 27 21, 27 24 C27 21, 28 15, 33 15 C47 15, 47 35, 27 49 Z"})})};return s("svg",{className:`acl-doodle ${r==="spark"||r==="star"||r==="heart"?"acl-doodle--spark":""} ${c}`,viewBox:"0 0 84 60",width:e,height:e*60/84,"aria-hidden":"true",style:{"--r":`${p}deg`,color:o,...u},children:f[r]})}var t=S(g),T=y({sourceTokens:g,sourcePath:"theme08/source/components/AclPrimitives.jsx",Runtime:_,sourcePrimitives:{Doodle:C},rootClass:"acl-root",base:{bg:t["--acl-yellow"],surface:t["--acl-paper"],ink:t["--acl-ink"],muted:"rgba(22,21,15,.62)",accent:t["--acl-pink"],accent2:t["--acl-blue"],line:t["--acl-ink"],fontDisplay:t["--acl-font-num"],fontBody:t["--acl-font-cn"],fontMono:t["--acl-font-mono"],typeScale:{kicker:20,title:72,subtitle:40,body:27,label:19,caption:21,metric:120},pad:100,gap:24,radius:0,shadow:"6px 8px 0 rgba(22,21,15,.18)",cardTreatment:{padding:28,borderWidth:3,borderStyle:"solid",backdropFilter:"none"},mediaTreatment:{radius:0,filter:"none",overlay:"none",border:`8px solid ${t["--acl-paper"]}`},chartTreatment:{grid:"rgba(22,21,15,.18)",label:"rgba(22,21,15,.62)",series:[t["--acl-ink"],t["--acl-pink"],t["--acl-blue"],t["--acl-red"],t["--acl-lilac"]],barRadius:0,strokeWidth:4},shapeTreatment:{lineWidth:5,panelRadius:0,panelBorderWidth:3},decoration:"theme08-doodle"},backgrounds:{default:{},surface:{bg:t["--acl-paper"]},muted:{bg:t["--acl-lilac"]},accent:w(t["--acl-pink"],t["--acl-paper"],t["--acl-yellow"]),dark:{bg:t["--acl-ink"],surface:"rgba(251,250,244,.08)",ink:t["--acl-paper"],muted:t["--acl-lilac"],line:t["--acl-yellow"],accent:t["--acl-yellow"]},light:{bg:t["--acl-paper"]}}});var O=x({theme08:T},{fallbackKey:"theme08"}),K=O.profiles,H=O.getBespokeThemeProfile;export{v as BESPOKE_FAMILIES,K as BESPOKE_THEME_PROFILES,H as getBespokeThemeProfile};
