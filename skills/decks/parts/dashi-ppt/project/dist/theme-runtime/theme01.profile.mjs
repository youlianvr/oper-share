import*as f from"react";var h='"Noto Sans SC","PingFang SC","Microsoft YaHei",system-ui,sans-serif',y=Object.freeze(["hero","editorial","split","comparison","process","matrix","metric-spotlight","timeline","chart-led"]),w=Object.freeze({frame:"neutral",surface:"cards",titleClass:"title",titleScale:null,listMode:"stack",quoteMode:"card",metricMode:"card",chartMode:"card"});function T(r){let e=Object.fromEntries(y.map(t=>[t,Object.freeze({...w,...r.familyRecipes?.[t]||{}})]));return Object.freeze({...r,familyRecipes:Object.freeze(e),sourcePrimitives:Object.freeze({...r.sourcePrimitives||{}}),rootVars:Object.freeze({...r.rootVars||{}}),base:Object.freeze(r.base),backgrounds:Object.freeze(Object.fromEntries(Object.entries(r.backgrounds).map(([t,a])=>[t,Object.freeze(a)])))})}function v(r,{fallbackKey:e="theme01"}={}){let t=Object.entries(r||{}).filter(([,s])=>s);if(!t.length)throw new Error("createBespokeThemeProfileRegistry: no theme adapters.");let a=Object.freeze(Object.fromEntries(t)),i=Object.hasOwn(a,e)?e:t[0][0],p=Object.freeze(Object.fromEntries(t.map(([s,b])=>[s,k(s,b,"default")]))),c=new Map;function j(s,b="default"){let d=Object.hasOwn(a,s)?s:i,m=a[d].backgrounds[b]?b:"default";if(m==="default")return p[d];let g=`${d}:${m}`;return c.has(g)||c.set(g,k(d,a[d],m)),c.get(g)}return Object.freeze({profiles:p,getBespokeThemeProfile:j})}function k(r,e,t){let a=e.backgrounds[t]||e.backgrounds.default,i=e.base,p={...i,...a,themeKey:r,semanticBackground:t,sourceTokens:e.sourceTokens,sourcePath:e.sourcePath,sourcePrimitives:e.sourcePrimitives,cssText:e.cssText||"",Runtime:e.Runtime||null,rootClass:a.rootClass||e.rootClass||"",rootVars:Object.freeze({...e.rootVars,...a.rootVars||{}}),familyRecipes:e.familyRecipes,frame:Object.freeze({...i.frame||{},...a.frame||{}}),textTreatment:Object.freeze({...i.textTreatment||{},...a.textTreatment||{}}),cardTreatment:Object.freeze({...i.cardTreatment,...a.cardTreatment||{}}),typeScale:Object.freeze({...i.typeScale,...a.typeScale||{}}),mediaTreatment:Object.freeze({...i.mediaTreatment,...a.mediaTreatment||{}}),chartTreatment:Object.freeze({...i.chartTreatment,...a.chartTreatment||{},series:Object.freeze([...a.chartTreatment?.series||i.chartTreatment.series||[]])}),shapeTreatment:Object.freeze({...i.shapeTreatment,...a.shapeTreatment||{}})};return Object.freeze(p)}function u(r,e,t){return{bg:r,surface:"rgba(0,0,0,.12)",ink:e,muted:e==="#ffffff"?"rgba(255,255,255,.74)":"rgba(0,0,0,.64)",line:e==="#ffffff"?"rgba(255,255,255,.24)":"rgba(0,0,0,.2)",accent2:t}}function P(r){let e={};for(let t of String(r).matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi))e[t[1]]=t[2].trim();return Object.freeze(e)}function x(r,e){let t=P(r)[e],a=Number.parseFloat(t);if(!Number.isFinite(a))throw new Error(`Missing numeric theme token ${e}`);return a}function l(r,e,t){let a=e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),i=String(r).match(new RegExp(`${a}\\s*\\{([\\s\\S]*?)\\}`))?.[1]||"",p=t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),c=i.match(new RegExp(`(?:^|;)\\s*${p}\\s*:\\s*([\\s\\S]*?)(?=;|$)`))?.[1]?.trim();if(!c)throw new Error(`Missing ${e} ${t} in canonical theme CSS`);return c.replace(/\s+/g," ")}var n={ink:"#2b2b30",ink2:"#56565c",ink3:"#9a9ba4",red:"#e8503a",blue:"#5b8def",green:"#46b083",amber:"#e0a23a",violet:"#7a5ae0",series:["#5b8def","#46b083","#e0a23a","#e8503a","#7a5ae0"]};var o=`
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
`;var S=l(o,".aip-bg-a","background"),M=l(o,".aip-bg-b","background"),O=l(o,".aip-glass","background"),C=l(o,".aip-glass","box-shadow"),R=x(o,"--aip-pad-x"),$=x(o,"--aip-gap"),z=T({sourceTokens:n,sourcePath:"theme01/source/slides/theme.js",cssText:o,rootClass:"aip-root",base:{bg:S,surface:O,ink:n.ink,muted:n.ink2,accent:n.red,accent2:n.blue,line:"rgba(43,43,48,.14)",fontDisplay:h,fontBody:h,fontMono:"'Space Mono',monospace",typeScale:{kicker:24,title:78,subtitle:42,body:30,label:24,caption:24,metric:128},pad:R,gap:$,radius:24,shadow:C,cardTreatment:{padding:30,borderWidth:1,borderStyle:"solid",backdropFilter:"blur(28px) saturate(140%)"},mediaTreatment:{radius:20,filter:"none",overlay:"linear-gradient(180deg,transparent 62%,rgba(43,43,48,.18))",border:"1px solid rgba(255,255,255,.7)"},chartTreatment:{grid:"rgba(43,43,48,.14)",label:n.ink2,series:n.series,barRadius:9,strokeWidth:6},shapeTreatment:{lineWidth:3,panelRadius:24,panelBorderWidth:1},decoration:"theme01-bokeh"},backgrounds:{default:{},surface:{bg:O},muted:{bg:M},accent:u(n.red,"#ffffff",n.blue),dark:u(n.ink,"#ffffff",n.red),light:{bg:S}}});var E=v({theme01:z},{fallbackKey:"theme01"}),D=E.profiles,Y=E.getBespokeThemeProfile;export{y as BESPOKE_FAMILIES,D as BESPOKE_THEME_PROFILES,Y as getBespokeThemeProfile};
