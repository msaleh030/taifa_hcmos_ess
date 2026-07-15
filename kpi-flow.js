// Slice 7 · KPI scorecard (C3 console · E8 ESS) — flow logic (reuses Slice-4/5/6 kit)
function t(k){return window.T[cur.lang][k];}
const L=x=>typeof x==='string'?x:x[cur.lang];

const ic={
 users:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11"/></svg>',
 trend:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6"/></svg>',
 shield:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
 clock:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
 pin:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="2.5"/></svg>',
 award:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="6"/><path d="M8.2 13.9 7 22l5-3 5 3-1.2-8.1"/></svg>',
 flag:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>',
 check:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg>',
 alert:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
 calendar:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
 money:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/></svg>',
 cap:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 10 12 5 2 10l10 5 10-5zM6 12v5c0 1 3 3 6 3s6-2 6-3v-5"/></svg>',
 heart:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
 phone:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/></svg>',
 doc:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>',
 chart:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3v18h18M8 17V9M13 17V5M18 17v-6"/></svg>',
 warn:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
 off:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 1l22 22M16.7 11.1A6 6 0 0 0 5 12M8.5 8.5A6 6 0 0 0 5 12M2 8.8A11 11 0 0 1 6 6M22 8.8a11 11 0 0 0-4.6-3.3M12 20h.01"/></svg>',
 wifi:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01"/></svg>',
 sync:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/></svg>',
 lock:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
 power:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3v9"/><path d="M6.6 6.6a8 8 0 1 0 10.8 0"/></svg>',
 toggle:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="10" rx="5"/><circle cx="8" cy="12" r="2.6" fill="currentColor" stroke="none"/></svg>'};

// ── whole-module DISABLED panel (feature-flag off) — no cards, no RAG bar, no counts ──
function moduleOffBody(){
 return `<div class="center">
   <span class="ic moff">${ic.toggle}</span>
   <span class="modtag">${t('foTag')}</span>
   <h3>${t('foTitle')}</h3>
   <p>${t('foBody')}</p>
   <div class="prov">${ic.power}<span>${t('foProv')} <b>${t('foProvPath')}</b></span></div>
   <div class="why">${t('foWhy')}</div></div>`;
}

const initials=n=>n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
let cur={screen:'console',state:'populated',role:'R07',theme:'light',surface:'desktop',lang:'en'};
const ESS_EMP={n:'Joseph Mlimani',no:'TMCL-MW-4821',role:'Equipment Operator · Mwadui'};

// ── app shell ──
function app(title,sub,netOff,bodyHTML){
 const net=netOff?`<span class="net off">${ic.off}${cur.lang==='en'?'Offline':'Nje ya mtandao'}</span>`
  :`<span class="net">${ic.wifi}${cur.lang==='en'?'Online':'Mtandaoni'}</span>`;
 return `<div class="app"><div class="topbar">${ic.chart}<div><div class="tt">${title}</div><div class="ts">${sub}</div></div>${net}</div>
  <div class="body">${bodyHTML}</div></div>`;
}
function center(icCls,icon,title,body,extra){return `<div class="center"><span class="ic ${icCls||''}">${icon}</span><h3>${title}</h3><p>${body}</p>${extra||''}</div>`;}

const CLS={green:'g',amber:'a',red:'r',neutral:'n'};
const STLBL={green:'stOn',amber:'stWatch',red:'stOff',neutral:'stMon'};

function naSet(state,ids){
 if(state==='not-available') return ids.filter(id=>NA_INPUT[id]);
 const first=ids.find(id=>NA_INPUT[id]); return first?[first]:[];
}
function kcard(id,live,isNA){
 const k=KPIS[id], v=live[id], icon=ic[k.icon]||ic.chart, name=L(k.name);
 if(isNA){
  return `<div class="kcard na"><div class="khead"><div class="kn">${name}</div><span class="kstat na">${t('naCard')}</span></div>
   <div class="kv navb">${ic.alert} ${t('naCard')}</div>
   <div class="naband">${ic.warn} ${L(NA_INPUT[id])} — ${t('naBecause')}</div>
   <div class="kfoot"><div class="krow"><span class="kk">${t('kFormula')}</span><span class="kf">${L(k.formula)}</span></div>
    <div class="krow"><span class="kk">${t('kTarget')}</span><span class="kt">${L(k.target)}</span></div></div></div>`;
 }
 const st=kpiStatus({...k,v:v.v}), cls=CLS[st];
 return `<div class="kcard ${cls}"><div class="khead"><div class="kn">${name}</div><span class="kstat ${cls}">${t(STLBL[st])}</span></div>
  <div class="kv">${v.value}</div>${v.sub?`<div class="ksub">${v.sub}</div>`:''}
  <div class="kfoot"><div class="krow"><span class="kk">${t('kFormula')}</span><span class="kf">${L(k.formula)}</span></div>
   <div class="krow"><span class="kk">${t('kTarget')}</span><span class="kt">${L(k.target)}</span></div></div></div>`;
}
function ragbar(counts){
 const p=(cls,dot,n,lbl)=>`<span class="ragpill ${cls}"><span class="ragdot ${dot}"></span><span class="n">${n}</span> ${lbl}</span>`;
 return `<div class="ragbar">${p('g','g',counts.green,t('sumOn'))}${p('a','a',counts.amber,t('sumWatch'))}${p('r','r',counts.red,t('sumOff'))}${counts.na?p('na','na',counts.na,t('sumNa')):''}</div>`;
}
function sections(ids,naIds){
 const live=kpiValues(cur.lang);
 let html='';
 KPI_CAT_ORDER.forEach(cat=>{
  const inCat=ids.filter(id=>KPIS[id].cat===cat);
  if(!inCat.length) return;
  html+=`<div class="kcat">${t('cat_'+cat)}<span class="ln"></span></div><div class="kgrid">${inCat.map(id=>kcard(id,live,naIds.includes(id))).join('')}</div>`;
 });
 return html;
}
function counts(ids,naIds){
 const live=kpiValues(cur.lang), c={green:0,amber:0,red:0,na:naIds.length};
 ids.forEach(id=>{if(naIds.includes(id))return;const st=kpiStatus({...KPIS[id],v:live[id].v});if(st==='green')c.green++;else if(st==='amber')c.amber++;else if(st==='red')c.red++;});
 return c;
}

// ── shared scorecard body across states ──
function scoreBody(ids,scopeHTML){
 const off=cur.state==='offline';
 switch(cur.state){
  case 'empty': return center('',ic.chart,t('emptyTitle'),t('emptyBody'));
  case 'loading': return `<div class="ragbar">${'<span class="ragpill"><span class="skelrow" style="width:60px"></span></span>'.repeat(3)}</div>
   <div class="kgrid">${'<div class="kcard n">'+'<div class="skelrow" style="width:90%;margin:6px 0"></div>'.repeat(4)+'</div>'.repeat(6)}</div>`;
  case 'error': return `<div class="banner err">${ic.warn}<div><b>${t('errTitle')}</b><br>${t('errBody')}</div></div>
   <button class="btn p block">${ic.sync} ${t('retry')}</button>`;
  case 'success':{
   const c=counts(ids,naSet('populated',ids));
   return `<div class="seal"><span class="disc ok">${ic.check}</span><h3>${t('successTitle')}</h3><p>${t('successSub')}</p></div>${ragbar(c)}`;
  }
  case 'large-data':{
   const allIds=Object.keys(KPIS), naIds=naSet('not-available',allIds);
   return `${scopeHTML}<div class="rmeta"><span class="cnt">${t('fullCatTitle')}</span><span class="cnt">${t('fullCatMeta')}</span></div>
    ${ragbar(counts(allIds,naIds))}<div class="note">${ic.shield}<span>${t('consistNote')} ${t('lvrNote')}</span></div>
    ${sections(allIds,naIds)}`;
  }
  case 'not-available':{
   const naIds=naSet('not-available',ids);
   return `${scopeHTML}<div class="banner off">${ic.warn}<div><b>${t('naStateTitle')}</b><br>${t('naStateBody')}</div></div>
    ${ragbar(counts(ids,naIds))}${sections(ids,naIds)}
    <div class="note">${ic.alert}<span>${t('naRule')}</span></div>`;
  }
  default:{ // populated / offline
   const naIds=naSet('populated',ids);
   const banner=off?`<div class="banner off">${ic.off}<div>${t('offlineNote')}</div></div>`:'';
   return `${scopeHTML}${banner}${ragbar(counts(ids,naIds))}
    <div class="note">${ic.chart}<span>${t('liveNote')} ${t('lvrNote')}</span></div>
    ${sections(ids,naIds)}
    <div class="note">${ic.check}<span>${t('consistNote')}</span></div>`;
  }
 }
}

// ── console (C3) ──
function consoleScreen(){
 if(cur.state==='flag-off') return app(t('console'),t('consoleSub'),false,moduleOffBody());
 const roleKey=R2ROLE[cur.role]||'hrhead';
 if(roleKey==='employee'||cur.state==='no-permission'){
  return app(t('console'),t('consoleSub'),false,
   center('warn',ic.lock,t('noPermTitle'),t('noPermBody'),`<div class="why">${t('noPermWhy')} ${cur.role}</div>`));
 }
 const ids=ROLE_KPIS[roleKey]||[];
 const scope=`<div class="rmeta"><span class="scope">${ic.shield} ${L(ROLE_TITLE[roleKey])} · ${cur.role}</span><span class="scope">${t('scopeLbl')}: ${L(ROLE_SCOPE[roleKey])}</span></div>`;
 return app(t('console'),t('consoleSub'),cur.state==='offline',scoreBody(ids,scope));
}

// ── ESS My KPIs (E8) ──
function essScreen(){
 if(cur.state==='flag-off') return app(t('ess'),t('essSub'),false,moduleOffBody());
 const ids=ROLE_KPIS.employee;
 const head=`<div class="myhead"><span class="av">${initials(ESS_EMP.n)}</span>
   <div style="flex:1"><div class="nm">${ESS_EMP.n}</div><div class="mt">${ESS_EMP.no} · ${ESS_EMP.role}</div></div></div>`;
 const body=cur.state==='empty'||cur.state==='loading'||cur.state==='error'||cur.state==='success'
  ? scoreBody(ids,'') : head+scoreBody(ids,'');
 return app(t('ess'),t('essSub'),cur.state==='offline',body);
}

// ── render ──
function render(){
 const html=cur.screen==='ess'?essScreen():consoleScreen();
 document.querySelector('.stage').innerHTML=`<div class="frame">${html}</div>`;
}

// ── switcher bar ──
function seg(id,items,key){const el=document.getElementById(id);el.innerHTML=items.map(it=>{const v=Array.isArray(it)?it[0]:it,l=Array.isArray(it)?it[1]:it;return `<button data-v="${v}">${l}</button>`;}).join('');el.querySelectorAll('button').forEach(b=>b.onclick=()=>{cur[key]=b.getAttribute('data-v');sync();});}
const AC={console:'AC-KPI-01/02/03/04 · LIAB-03 (N/A) · LVR-02',ess:'AC-KPI-04 ESS scorecard · LIAB-03 (N/A)'};
function sync(){
 document.documentElement.setAttribute('data-theme',cur.theme);
 document.documentElement.setAttribute('data-surface',cur.surface);
 [['screens','screen'],['states','state'],['roles','role'],['themes','theme'],['surfaces','surface'],['langs','lang']].forEach(([id,k])=>document.querySelectorAll('#'+id+' button').forEach(b=>b.classList.toggle('on',b.getAttribute('data-v')===cur[k])));
 document.getElementById('acline').innerHTML=`Covers <b>${AC[cur.screen]}</b> · ${cur.theme}/${cur.surface} · viewer ${cur.role} · ${t('reg')}`;
 render();
}
seg('screens',[['console','Console · C3'],['ess','My KPIs · E8']],'screen');
seg('states',[['empty','empty'],['loading','loading'],['populated','populated'],['large-data','large-data'],['error','error'],['no-permission','no-perm'],['offline','offline'],['success','success'],['not-available','not-available'],['flag-off','flag-off']],'state');
seg('roles',['R01','R02','R03','R04','R05','R06','R07','R08','R09','R10','R11','R12','R13'].map(r=>[r,r]),'role');
seg('themes',[['light','Light'],['dark','Dark'],['glass','Glass'],['reduced','Reduced']],'theme');
seg('surfaces',[['desktop','Desk'],['tablet','Tablet'],['mobile','Mobile'],['kiosk','Kiosk']],'surface');
seg('langs',[['en','EN'],['sw','SW']],'lang');
sync();
