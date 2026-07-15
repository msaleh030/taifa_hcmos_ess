// Slice 10 · Tenant provisioning wizard (C21) — flow logic (reuses kit)
function t(k){return window.T[cur.lang][k];}

const ic={
 building:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/></svg>',
 users:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11"/></svg>',
 grid:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
 pin:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="2.5"/></svg>',
 calendar:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
 doc:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>',
 chart:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3v18h18M8 17V9M13 17V5M18 17v-6"/></svg>',
 shield:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
 money:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/></svg>',
 check:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg>',
 x:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6 6 18M6 6l12 12"/></svg>',
 warn:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
 off:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 1l22 22M16.7 11.1A6 6 0 0 0 5 12M8.5 8.5A6 6 0 0 0 5 12M2 8.8A11 11 0 0 1 6 6M22 8.8a11 11 0 0 0-4.6-3.3M12 20h.01"/></svg>',
 wifi:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01"/></svg>',
 sync:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/></svg>',
 lock:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
 db:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg>'};

let cur={screen:'identity',state:'populated',role:'R12',theme:'light',surface:'desktop',lang:'en'};
const PROV_VIEW=['R07','R11','R12'];
const STEPS=['identity','roles','sites','leave','docs','kpi','statutory','review'];

function app(title,sub,netOff,bodyHTML){
 const net=netOff?`<span class="net off">${ic.off}${cur.lang==='en'?'Offline':'Nje ya mtandao'}</span>`
  :`<span class="net">${ic.wifi}${cur.lang==='en'?'Online':'Mtandaoni'}</span>`;
 return `<div class="app"><div class="topbar">${ic.building}<div><div class="tt">${title}</div><div class="ts">${sub}</div></div>${net}</div>
  <div class="body">${bodyHTML}</div></div>`;
}
function center(icCls,icon,title,body,extra){return `<div class="center"><span class="ic ${icCls||''}">${icon}</span><h3>${title}</h3><p>${body}</p>${extra||''}</div>`;}
function skel(n){return '<div class="skelrow" style="width:100%;margin:9px 0"></div>'.repeat(n);}
function auditRow(txt){return `<div class="audit">${ic.shield}<span>${txt}</span><span class="h">#tenant…01</span></div>`;}
const regchip=()=>`<span class="regchip">${ic.db} ${t('noManual')}</span>`;

const STEP_LBL={identity:'s_identity',roles:'s_roles',sites:'s_sites',leave:'s_leave',docs:'s_docs',kpi:'s_kpi',statutory:'s_statutory',review:'s_review'};
function wrail(mode){
 const idx=STEPS.indexOf(cur.screen);
 return `<div class="wrail">${STEPS.map((s,i)=>{
  const cls=mode==='done'?'done':i<idx?'done':i===idx?'active':'';
  const node=(cls==='done')?ic.check:`${i+1}`;
  return `<span class="wstep ${cls}"><span class="wn">${node}</span>${t(STEP_LBL[s])}</span>`;}).join('')}</div>`;
}
function rrow(k,v){return `<div class="rr"><span class="k">${k}</span><span class="v">${v}</span></div>`;}
function receipt(rows){return `<div class="receipt">${rows}</div>`;}
function seedtile(icon,label,count,rb){return `<div class="seedtile ${rb?'rb':''}"><span class="si">${icon}</span><div style="flex:1"><div class="sl">${label}</div><div class="sc">${count}</div></div><span class="sok">${rb?ic.x:ic.check}</span></div>`;}
const TILES=[[()=>ic.building,'tIdentity','1'],[()=>ic.users,'tRoles','13'],[()=>ic.grid,'tMatrix','13×42'],[()=>ic.pin,'tSites','4'],[()=>ic.calendar,'tLeave','4'],[()=>ic.doc,'tDocs','4'],[()=>ic.chart,'tKpi','30'],[()=>ic.money,'tStat','6']];
function seedSummary(rb){return `<div class="seedgrid">${TILES.map(([i,l,c])=>seedtile(i(),t(l),c,rb)).join('')}</div>`;}

// ── per-step seed previews ──
function stepBody(step){
 switch(step){
  case 'identity': return `<div class="shead">${ic.building} ${t('idTitle')} ${regchip()}</div>
   <div class="idmint">${ic.check.replace('svg','svg')?'':''}<span class="im">${ic.db}</span><div><div class="il">${t('idMintLbl')}</div><div class="iv">${t('idMintVal')}</div></div></div>
   ${receipt(rrow(t('idTenant'),t('idTenantVal'))+rrow(t('idCode'),t('idCodeVal'))+rrow(t('idCountry'),t('idCountryVal'))+rrow(t('idCurrency'),t('idCurrencyVal'))+rrow(t('idTz'),t('idTzVal')))}
   <div class="note">${ic.shield}<span>${t('idNote')}</span></div>`;
  case 'roles':{
   const chips=['R01','R02','R03','R04','R05','R06','R07','R08','R09','R10','R11','R12','R13'].map(r=>`<span class="lead">${r}</span>`).join('');
   return `<div class="shead">${ic.users} ${t('rolesTitle')} ${regchip()}</div>
    <div class="seedgrid">${seedtile(ic.users,t('rolesSeed'),'13')}${seedtile(ic.grid,t('matrixSeed'),'13×42')}</div>
    <div class="leadset" style="margin-top:2px">${chips}</div>
    <div class="note">${ic.shield}<span>${t('matrixNote')}</span></div>`;
  }
  case 'sites':{
   const S=[['Head Office','HO'],['Mwadui','MW'],['Nyanzaga','NZ'],['Buckreef','NM']];
   return `<div class="shead">${ic.pin} ${t('sitesTitle')} ${regchip()}</div>
    ${receipt(rrow(t('numberFmt'),t('numberFmtVal')))}
    <div class="roster">${S.map(([n,c])=>`<div class="rrow"><span class="av">${ic.pin}</span><div style="flex:1"><div class="rn">${n}</div></div><span class="astat available"><span class="dot"></span>${c}</span></div>`).join('')}</div>`;
  }
  case 'leave':{
   const L=[['Annual','7×7×7=28 · 8-2=14 · 9-3=0'],['Sick','63 full + 63 half · cert day one'],['Compassionate','per policy'],['Maternity','per statute']];
   return `<div class="shead">${ic.calendar} ${t('leaveTitle')} ${regchip()}</div>
    ${receipt(L.map(([k,v])=>rrow(k,v)).join(''))}
    <div class="note">${ic.calendar}<span>${t('leaveNote')}</span></div>`;
  }
  case 'docs':{
   const D=[['Contract','expiry tracked'],['Work permit','90/60/30/7 lead'],['Medical certificate','annual'],['Competency certificate','per matrix']];
   return `<div class="shead">${ic.doc} ${t('docsTitle')} ${regchip()}</div>
    ${receipt(D.map(([k,v])=>rrow(k,v)).join(''))}
    <div class="note">${ic.warn}<span>${t('docsNote')}</span></div>`;
  }
  case 'kpi': return `<div class="shead">${ic.chart} ${t('kpiTitle')} ${regchip()}</div>
    <div class="seedgrid">${seedtile(ic.chart,t('kpiSeed'),'30')}${seedtile(ic.grid,t('kpiCats'),'11')}</div>
    <div class="note">${ic.chart}<span>${t('kpiNote')}</span></div>`;
  case 'statutory':{
   const ST=[['NSSF','10% + 10% employer'],['PAYE','progressive bands'],['SDL','3.5%'],['WCF','0.5%'],['Pay divisor (PC-1)','30'],['Leave-pay base (EX-2)','excl. rotation · night-shift · overtime']];
   return `<div class="shead">${ic.money} ${t('statTitle')} ${regchip()}</div>
    ${receipt(ST.map(([k,v])=>rrow(k,v)).join(''))}
    <div class="note">${ic.money}<span>${t('statNote')}</span></div>`;
  }
  default: // review
   return `<div class="shead">${ic.check} ${t('reviewTitle')} ${regchip()}</div>
    ${seedSummary(false)}
    <div class="note">${ic.shield}<span>${t('reviewNote')}</span></div>`;
 }
}
function stepNav(){
 const idx=STEPS.indexOf(cur.screen);
 if(cur.screen==='review') return `<button class="btn p block" onclick="cur.state='success';sync()">${ic.check} ${t('provisionBtn')}</button>`;
 const back=idx>0?`<button class="btn g" onclick="cur.screen='${STEPS[idx-1]}';sync()">${t('back')}</button>`:'';
 return `<div style="display:flex;gap:9px">${back}<button class="btn p" style="flex:1" onclick="cur.screen='${STEPS[idx+1]}';sync()">${t('next')} →</button></div>`;
}

function provScreen(){
 if(!PROV_VIEW.includes(cur.role)||cur.state==='no-permission')
  return app(t('wizard'),t('wizardSub'),false,center('err',ic.lock,t('noPermTitle'),t('noPermBody'),`<div class="why">${t('noPermWhy')} ${cur.role}</div>`));
 const off=cur.state==='offline';
 const wrap=b=>app(t('wizard'),t('wizardSub'),off,b);
 switch(cur.state){
  case 'loading': return wrap(`${wrail('progress')}<div class="banner info">${ic.sync}<div><b>${t('loadingTitle')}</b><br>${t('loadingBody')}</div></div>${skel(5)}`);
  case 'success': return wrap(`${wrail('done')}<div class="seal"><span class="disc ok">${ic.check}</span><h3>${t('provisionedTitle')}</h3><p>${t('provisionedSub')}</p></div>${seedSummary(false)}${auditRow(t('repeatNote'))}`);
  case 'error': return wrap(`${wrail('progress')}<div class="banner err">${ic.warn}<div><b>${t('rollbackTitle')}</b><br>${t('rollbackBody')}</div></div>${seedSummary(true)}<button class="btn p block" style="background:var(--red)">${ic.sync} ${t('retry')}</button>`);
  case 'offline': return wrap(`${wrail('progress')}<div class="banner off">${ic.off}<div>${t('offNote')}</div></div>${stepBody(cur.screen)}`);
  case 'large-data': return wrap(`${wrail('progress')}<div class="rmeta"><span class="scope">${ic.db} ${t('largeTitle')}</span><span class="cnt">${t('largeMeta')}</span></div>${seedSummary(false)}<div class="note">${ic.db}<span>${t('repeatNote')}</span></div>`);
  case 'empty': return wrap(`${wrail('progress')}${center('',ic.db,t('emptyTitle'),t('emptyBody'))}`);
  default: return wrap(`${wrail('progress')}<div class="banner info">${ic.db}<div>${t('repeatNote')}</div></div>${stepBody(cur.screen)}${stepNav()}`);
 }
}

// ── render ──
function render(){document.querySelector('.stage').innerHTML=`<div class="frame">${provScreen()}</div>`;}
function seg(id,items,key){const el=document.getElementById(id);el.innerHTML=items.map(it=>{const v=Array.isArray(it)?it[0]:it,l=Array.isArray(it)?it[1]:it;return `<button data-v="${v}">${l}</button>`;}).join('');el.querySelectorAll('button').forEach(b=>b.onclick=()=>{cur[key]=b.getAttribute('data-v');sync();});}
function sync(){
 document.documentElement.setAttribute('data-theme',cur.theme);
 document.documentElement.setAttribute('data-surface',cur.surface);
 [['screens','screen'],['states','state'],['roles','role'],['themes','theme'],['surfaces','surface'],['langs','lang']].forEach(([id,k])=>document.querySelectorAll('#'+id+' button').forEach(b=>b.classList.toggle('on',b.getAttribute('data-v')===cur[k])));
 document.getElementById('acline').innerHTML=`Covers <b>AC-TEN-01/02/03 · seed from registry · atomic · no manual DB step</b> · ${cur.theme}/${cur.surface} · viewer ${cur.role} · ${t('reg')}`;
 render();
}
seg('screens',STEPS.map(s=>[s,({identity:'1 Identity',roles:'2 Roles',sites:'3 Sites',leave:'4 Leave',docs:'5 Docs',kpi:'6 KPI',statutory:'7 Statutory',review:'8 Review'})[s]]),'screen');
seg('states',[['empty','empty'],['loading','loading'],['populated','populated'],['large-data','large-data'],['error','error'],['no-permission','no-perm'],['offline','offline'],['success','success']],'state');
seg('roles',['R01','R02','R03','R04','R05','R06','R07','R08','R09','R10','R11','R12','R13'].map(r=>[r,r]),'role');
seg('themes',[['light','Light'],['dark','Dark'],['glass','Glass'],['reduced','Reduced']],'theme');
seg('surfaces',[['desktop','Desk'],['tablet','Tablet'],['mobile','Mobile'],['kiosk','Kiosk']],'surface');
seg('langs',[['en','EN'],['sw','SW']],'lang');
sync();
