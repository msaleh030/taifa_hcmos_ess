// Slice 8 · Exact (C18) · Asset (C22) · Payslip (E6) — flow logic (reuses kit)
function t(k){return window.T[cur.lang][k];}

const ic={
 upload:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>',
 doc:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>',
 check:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg>',
 x:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6 6 18M6 6l12 12"/></svg>',
 warn:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
 off:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 1l22 22M16.7 11.1A6 6 0 0 0 5 12M8.5 8.5A6 6 0 0 0 5 12M2 8.8A11 11 0 0 1 6 6M22 8.8a11 11 0 0 0-4.6-3.3M12 20h.01"/></svg>',
 wifi:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01"/></svg>',
 sync:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/></svg>',
 shield:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
 lock:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
 users:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11"/></svg>',
 box:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"/></svg>',
 money:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/></svg>',
 swap:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 10 3 6l4-4M3 6h13M17 14l4 4-4 4M21 18H8"/></svg>',
 search:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
 bell:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
 clock:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'};

const initials=n=>n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
const fmt=n=>'TZS '+n.toLocaleString('en-US');
let cur={screen:'exact',state:'populated',role:'R07',theme:'light',surface:'desktop',lang:'en'};
const EX_VIEW=['R07','R08','R09','R12'], ASSET_VIEW=['R07','R12'];

function app(title,sub,netOff,bodyHTML){
 const net=netOff?`<span class="net off">${ic.off}${cur.lang==='en'?'Offline':'Nje ya mtandao'}</span>`
  :`<span class="net">${ic.wifi}${cur.lang==='en'?'Online':'Mtandaoni'}</span>`;
 return `<div class="app"><div class="topbar">${ic.swap}<div><div class="tt">${title}</div><div class="ts">${sub}</div></div>${net}</div>
  <div class="body">${bodyHTML}</div></div>`;
}
function center(icCls,icon,title,body,extra){return `<div class="center"><span class="ic ${icCls||''}">${icon}</span><h3>${title}</h3><p>${body}</p>${extra||''}</div>`;}
function skel(n){return '<div class="skelrow" style="width:100%;margin:9px 0"></div>'.repeat(n);}
function auditRow(txt){return `<div class="audit">${ic.shield}<span>${txt}</span><span class="h">#e7a2…5c</span></div>`;}

// ── Exact pipeline ──
const STAGES={
 empty:['active','queued','queued','queued','queued'],
 loading:['done','active','queued','queued','queued'],
 'validation-failed':['done','fail','queued','queued','queued'],
 populated:['done','done','active','queued','queued'],
 'large-data':['done','done','active','queued','queued'],
 'totals-mismatch':['done','done','done','fail','queued'],
 error:['done','done','done','done','fail'],
 offline:['done','done','done','done','active'],
 'partial-publish':['done','done','done','done','partial'],
 success:['done','done','done','done','done']};
function pipeline(){
 const labels=[t('pUpload'),t('pSchema'),t('pReconcile'),t('pTotals'),t('pPublish')];
 const st=STAGES[cur.state]||STAGES.populated;
 return `<div class="pipe">${labels.map((l,i)=>{const s=st[i];const node=s==='done'?ic.check:s==='fail'?ic.x:s==='partial'?ic.warn:`${i+1}`;
  return `<div class="pstep ${s}"><span class="pnode">${node}</span><span class="plbl">${l}</span></div>`;}).join('')}</div>`;
}
function matchKey(){
 return `<div class="mkey">${ic.swap}<span class="kk">${t('matchKey')}:</span><span class="kv">${t('matchKeyVal')}</span>
  <span class="flag"><span class="dot"></span>${t('matchKeyTag')}</span><span class="scope">${t('matchKeyTbc')}</span></div>`;
}
function ctotTable(rows,ok){
 const head=`<div class="cthead"><div>${t('colMetric')}</div><div class="num" style="text-align:right">${t('colFile')}</div><div class="num" style="text-align:right">${t('colComputed')}</div><div class="num" style="text-align:right">${t('colDelta')}</div></div>`;
 const body=rows.map(r=>`<div class="ctrow ${r.d?'bad':''}"><div>${r.k}</div><div class="num">${r.file}</div><div class="num">${r.comp}</div>${r.d?`<div class="dx">${r.d}</div>`:`<div class="d0">${t('balanced')}</div>`}</div>`).join('');
 return `<div class="ctot">${head}${body}</div>`;
}
const CT_OK=()=>[{k:t('ctRecords'),file:'1,077',comp:'1,077',d:0},{k:t('ctTotalPay'),file:fmt(1548200000),comp:fmt(1548200000),d:0},{k:t('ctTotalDed'),file:fmt(347900000),comp:fmt(347900000),d:0},{k:t('ctNetPay'),file:fmt(1200300000),comp:fmt(1200300000),d:0}];
const CT_BAD=()=>[{k:t('ctRecords'),file:'1,077',comp:'1,077',d:0},{k:t('ctTotalPay'),file:fmt(1548200000),comp:fmt(1548200000),d:0},{k:t('ctTotalDed'),file:fmt(347900000),comp:fmt(348350000),d:'+'+(450000).toLocaleString('en-US')},{k:t('ctNetPay'),file:fmt(1200300000),comp:fmt(1199850000),d:'+'+(450000).toLocaleString('en-US')}];

function reconBuckets(){
 return `<div class="recon">
  <div class="rbucket unknown"><span class="rbi">${ic.x}</span><div style="flex:1"><div class="rt">${t('reconUnknown')}</div><div class="rd">${t('reconUnknownD')}</div></div><span class="rn">3</span></div>
  <div class="rbucket missing"><span class="rbi">${ic.warn}</span><div style="flex:1"><div class="rt">${t('reconMissing')}</div><div class="rd">${t('reconMissingD')}</div></div><span class="rn">2</span></div>
  <div class="rbucket leaver"><span class="rbi">${ic.users}</span><div style="flex:1"><div class="rt">${t('reconLeaver')}</div><div class="rd">${t('reconLeaverD')}</div></div><span class="rn">1</span></div>
 </div>`;
}
const VROWS=[['42','TIN','TIN required — blank'],['118','Pay period','Invalid format (2026/6 vs YYYY-MM)'],['205','BonusX','Unknown column — not in agreed mapping'],['390','Net Pay','Negative value not allowed']];

function exactScreen(){
 if(!EX_VIEW.includes(cur.role)||cur.state==='no-permission'){
  return app(t('exact'),t('exactSub'),false,center('err',ic.lock,t('noPermExactTitle'),t('noPermExactBody'),`<div class="why">${t('noPermExactWhy')} ${cur.role}</div>`));
 }
 const off=cur.state==='offline';
 const wrap=b=>app(t('exact'),t('exactSub'),off,`${pipeline()}${b}`);
 switch(cur.state){
  case 'empty': return wrap(`${matchKey()}<div class="drop"><span class="di">${ic.upload}</span><h3>${t('dropTitle')}</h3><p>${t('dropBody')}</p><button class="btn b">${ic.upload} ${t('dropCta')}</button></div>`);
  case 'loading': return wrap(`${matchKey()}<div class="banner info">${ic.sync}<div><b>${t('loadingTitle')}</b><br>${t('loadingBody')}</div></div>${skel(4)}`);
  case 'validation-failed':
   return wrap(`<div class="banner err">${ic.warn}<div><b>${t('schemaFailTitle')}</b><br>${t('schemaFailBody')}</div></div>
    <div class="shead">${ic.x} ${t('offendTitle')}</div>
    <div class="vlist"><div class="vhead"><div>${t('colRow')}</div><div>${t('colField')}</div><div>${t('colMsg')}</div></div>
     ${VROWS.map(([r,f,m])=>`<div class="vrow"><div class="vr">#${r}</div><div class="vf">${f}</div><div class="vm">${m}</div></div>`).join('')}</div>
    <button class="btn p block" style="background:var(--red)">${ic.upload} ${t('fixFile')}</button>`);
  case 'totals-mismatch':
   return wrap(`<div class="banner err">${ic.warn}<div><b>${t('ctotFailTitle')}</b><br>${t('ctotFailBody')}</div></div>
    <div class="shead">${ic.money} ${t('ctotTitle')}</div>${ctotTable(CT_BAD())}
    <div class="note">${ic.shield}<span>${t('netDefn')}. ${t('reconNote')}</span></div>
    <div style="display:flex;gap:9px"><button class="btn g" style="flex:1">${t('reviewUnmatched')}</button><button class="btn p" style="flex:1;background:var(--red)">${ic.upload} ${t('fixFile')}</button></div>`);
  case 'large-data':
   return wrap(`<div class="rmeta"><span class="scope">${ic.doc} ${t('largeExact')}</span><span class="cnt">${t('largeExactMeta')}</span></div>
    ${matchKey()}<div class="shead">${ic.money} ${t('ctotTitle')} — ${t('ctotOk')}</div>${ctotTable(CT_OK())}
    ${reconBuckets()}<div class="vhint">${t('reconMatched')}</div>`);
  case 'error':
   return wrap(`<div class="banner err">${ic.warn}<div><b>${t('errExactTitle')}</b><br>${t('errExactBody')}</div></div>
    <button class="btn p block">${ic.sync} ${t('retry')}</button>`);
  case 'offline':
   return wrap(`<div class="banner off">${ic.off}<div><b>${t('offExactTitle')}</b><br>${t('offExactBody')}</div></div>
    <div class="shead">${ic.money} ${t('ctotTitle')} — ${t('ctotOk')}</div>${ctotTable(CT_OK())}
    <button class="btn w block" disabled>${ic.sync} ${t('publishBtn')}</button>`);
  case 'success':
   return wrap(`<div class="seal"><span class="disc ok">${ic.check}</span><h3>${t('successExactTitle')}</h3><p>${t('successExactSub')}</p></div>
    <div class="pub"><div class="pubrow"><span class="pi">${ic.check}</span>${t('pubPosted')}</div>
     <div class="pubrow"><span class="pi">${ic.check}</span>${t('pubEss')}</div></div>
    ${ctotTable(CT_OK())}<div class="note">${ic.money}<span>${t('netDefn')}.</span></div>${auditRow(t('pubAudit'))}`);
  case 'partial-publish':
   return wrap(`<div class="banner warn">${ic.warn}<div><b>${t('partialTitle')}</b><br>${t('partialBody')}</div></div>
    <div class="pub">
     <div class="pubrow ok"><span class="pi">${ic.check}</span><div class="leg"><div class="lt">${t('legGl')}</div><div class="ld">${t('legGlOk')}</div></div><span class="lst ok">${t('stPosted')}</span></div>
     <div class="pubrow fail"><span class="pi">${ic.x}</span><div class="leg"><div class="lt">${t('legEss')}</div><div class="ld">${t('legEssFail')}</div></div><span class="lst fail">${t('stFailed')}</span></div></div>
    <div class="hoh">${ic.warn}<span><b>${t('noRepublishB')}</b> ${t('noRepublish')}</span></div>
    <button class="btn b block">${ic.sync} ${t('rePushEss')}</button>
    <div class="note">${ic.shield}<span>${t('partialAudit')}</span></div>`);
  default: // populated — reconciliation report
   return wrap(`${matchKey()}<div class="shead">${ic.swap} ${t('reconTitle')}</div>
    <div class="note" style="color:var(--green)">${ic.check}<span>${t('reconMatched')}</span></div>
    ${reconBuckets()}<div class="note">${ic.shield}<span>${t('reconNote')} ${t('reconLeaver')} — LVR-02.</span></div>
    <div style="display:flex;gap:9px"><button class="btn g" style="flex:1">${t('reviewUnmatched')}</button><button class="btn p" style="flex:1">${ic.check} ${t('proceed')}</button></div>`);
 }
}

// ── Asset ──
const ASSETS=[
 {n:'Toughbook laptop',tag:'AST-IT-0142',cat:'IT · Laptop',st:'assigned',holder:'Grace Ndaki',since:'12 Mar 2026'},
 {n:'Two-way radio',tag:'AST-COM-0391',cat:'Comms',st:'clearance',holder:'Peter Komba',since:'04 Feb 2026'},
 {n:'Safety harness',tag:'AST-PPE-1120',cat:'PPE',st:'available',holder:'—',since:'—'},
 {n:'Site vehicle key',tag:'AST-VEH-0075',cat:'Vehicle',st:'assigned',holder:'Daniel Mwaky',since:'20 Jan 2026'},
 {n:'Kiosk tablet',tag:'AST-IT-0208',cat:'IT · Tablet',st:'returned',holder:'—',since:'28 Jun 2026'}];
function astatus(st){const l={assigned:t('stAssigned'),available:t('stAvailable'),returned:t('stReturned'),clearance:t('stClearance')}[st];return `<span class="astat ${st}"><span class="dot"></span>${l}</span>`;}
function arow(a){
 const act=a.st==='available'?`<span class="ab">${t('assignCta')}</span>`:a.st==='assigned'?`<span class="ab">${t('returnCta')}</span>`:'';
 return `<div class="arow"><div class="who"><div class="an">${a.n}</div><div class="ac">${a.tag}</div></div>
  <div class="hide ac" style="font-size:11px;color:var(--muted)">${a.cat}</div><div>${astatus(a.st)}</div>
  <div class="hide" style="font-size:11.5px">${a.holder}${a.since!=='—'?`<div class="ac">${a.since}</div>`:''}</div></div>`;
}
function assetTable(list){
 return `<div class="atable"><div class="ahead"><div>${t('colAsset')}</div><div class="hide">${t('colCat')}</div><div>${t('colStatus')}</div><div class="hide">${t('colHolder')}</div></div>
  ${list.map(arow).join('')}</div>`;
}
function custody(){
 const ev=[['Assigned to Grace Ndaki','12 Mar 2026 · by Ali Mbaruk (HR)',false],['Returned by Yusuph Kabweza','10 Mar 2026 · condition OK',true],['Assigned to Yusuph Kabweza','05 Jan 2026 · by IT',false]];
 return `<div class="reqcard"><div class="rq-h"><span class="av" style="background:var(--blue);width:34px;height:34px;border-radius:9px">${ic.box}</span>
   <div style="flex:1"><div class="nm">Toughbook laptop</div><div class="mt">AST-IT-0142 · ${t('assignedTo')} Grace Ndaki</div></div>${astatus('assigned')}</div>
  <div class="rq-b" style="padding:12px 14px"><div class="shead">${ic.clock} ${t('custodyTitle')}</div>
   <div class="custody">${ev.map(([e,m,r])=>`<div class="cevent ${r?'ret':''}"><div class="ce">${e}</div><div class="cm">${m}</div></div>`).join('')}</div></div></div>`;
}
function assetScreen(){
 if(!ASSET_VIEW.includes(cur.role)||cur.state==='no-permission'){
  return app(t('asset'),t('assetSub'),false,center('err',ic.lock,t('noPermAssetTitle'),t('noPermAssetBody'),`<div class="why">${t('noPermAssetWhy')} ${cur.role}</div>`));
 }
 const off=cur.state==='offline';
 const scope=`<div class="banner info">${ic.shield}<div><b>${t('aScope')}</b> ${t('aScopeNo')}</div></div>`;
 const wrap=b=>app(t('asset'),t('assetSub'),off,b);
 switch(cur.state){
  case 'empty': return wrap(center('',ic.box,t('emptyAssetTitle'),t('emptyAssetBody'),`<button class="btn b">${ic.box} ${t('registerCta')}</button>`));
  case 'loading': return wrap(skel(7));
  case 'error': return wrap(`<div class="banner err">${ic.warn}<div><b>${t('errAssetTitle')}</b><br>${t('errAssetBody')}</div></div><button class="btn p block">${ic.sync} ${t('retry')}</button>`);
  case 'success': return wrap(`<div class="seal"><span class="disc ok">${ic.check}</span><h3>${t('successAssetTitle')}</h3><p>${t('successAssetSub')}</p></div>${custody()}`);
  case 'large-data':
   return wrap(`${scope}<div class="rmeta"><span class="scope">${ic.box} ${t('asset')}</span><span class="cnt">${t('largeAssetMeta')}</span></div>
    ${assetTable(ASSETS)}<div class="vhint">${t('assetShown')}</div>`);
  case 'offline':
   return wrap(`<div class="banner off">${ic.off}<div>${t('offAssetNote')}</div></div>${scope}${assetTable(ASSETS)}`);
  default: // populated
   return wrap(`${scope}${assetTable(ASSETS)}
    <div class="banner err">${ic.warn}<div><b>${t('clearanceTitle')}.</b> ${t('clearanceBody')}</div></div>
    ${custody()}`);
 }
}

// ── Payslip (E6) ──
const EARN=[['pBasic',980000],['pHousing',240000],['pTransport',120000],['pOvertime',96000]];
const DED=[['pPaye',188000],['pNssf',134000],['pSdl',0],['pAdvances',0]];
function payCard(){
 const totalPay=EARN.reduce((a,[,v])=>a+v,0), totalDed=DED.reduce((a,[,v])=>a+v,0), net=totalPay-totalDed;
 const sec=(title,rows)=>`<div class="psec"><div class="psh">${title}</div>${rows.map(([k,v])=>`<div class="payr"><span class="pk">${t(k)}</span><span class="pv">${fmt(v)}</span></div>`).join('')}</div>`;
 return `<div class="pay">
  <div class="ph">${ic.money}<div style="flex:1"><div class="pt">June 2026</div><div class="pm">${ESS?ESS.no:''} · ${t('payStatus')}</div></div>
   <span class="flag" style="background:rgba(31,162,74,.14);color:var(--green);border-color:rgba(31,162,74,.3)">${ic.check} ${t('payStatus')}</span></div>
  ${sec(t('payTitle'),EARN)}<div class="paytot"><span>${t('totalPay')}</span><span class="pv">${fmt(totalPay)}</span></div>
  ${sec(t('dedTitle'),DED)}<div class="paytot"><span>${t('totalDed')}</span><span class="pv">${fmt(totalDed)}</span></div>
  <div class="paynet"><div class="nrow"><span class="nk">${t('netPay')}</span><span class="nv">${fmt(net)}</span></div>
   <div class="nd">${t('netPay')} = ${t('netPayDefn')}</div></div></div>
  <div class="note">${ic.lock}<span>${t('paySecure')}</span></div>`;
}
const ESS={n:'Joseph Mlimani',no:'TMC-04821'};
function payslipScreen(){
 if(cur.state==='no-permission'){
  return app(t('payslip'),t('payslipSub'),false,center('err',ic.lock,t('noPermPayTitle'),t('noPermPayBody'),`<div class="why">${t('noPermPayWhy')} ${cur.role}</div>`));
 }
 const off=cur.state==='offline';
 const wrap=b=>app(t('payslip'),t('payslipSub'),off,b);
 switch(cur.state){
  case 'empty': return wrap(center('',ic.money,t('emptyPayTitle'),t('emptyPayBody')));
  case 'loading': return wrap(skel(7));
  case 'error': return wrap(`<div class="banner err">${ic.warn}<div><b>${t('emptyPayTitle')}</b><br>${t('emptyPayBody')}</div></div><button class="btn p block">${ic.sync} ${t('retry')}</button>`);
  case 'success': return wrap(`<div class="seal"><span class="disc ok">${ic.check}</span><h3>${t('successPayTitle')}</h3><p>${t('successPaySub')}</p></div>${payCard()}`);
  case 'offline': return wrap(`<div class="banner off">${ic.off}<div>${t('offPayNote')}</div></div>${payCard()}`);
  default: return wrap(payCard());
 }
}

// ── render ──
function render(){
 const html=cur.screen==='asset'?assetScreen():cur.screen==='payslip'?payslipScreen():exactScreen();
 document.querySelector('.stage').innerHTML=`<div class="frame">${html}</div>`;
}
function seg(id,items,key){const el=document.getElementById(id);el.innerHTML=items.map(it=>{const v=Array.isArray(it)?it[0]:it,l=Array.isArray(it)?it[1]:it;return `<button data-v="${v}">${l}</button>`;}).join('');el.querySelectorAll('button').forEach(b=>b.onclick=()=>{cur[key]=b.getAttribute('data-v');sync();});}
const AC={exact:'AC-EXACT-01..10 · schema · reconcile · control-totals safety net',asset:'AC-ASSET-01..07 · register/assign/track/record only',payslip:'PRT-02 · Total Pay · Net Pay (Total Pay − Total Deduction)'};
function sync(){
 document.documentElement.setAttribute('data-theme',cur.theme);
 document.documentElement.setAttribute('data-surface',cur.surface);
 [['screens','screen'],['states','state'],['roles','role'],['themes','theme'],['surfaces','surface'],['langs','lang']].forEach(([id,k])=>document.querySelectorAll('#'+id+' button').forEach(b=>b.classList.toggle('on',b.getAttribute('data-v')===cur[k])));
 document.getElementById('acline').innerHTML=`Covers <b>${AC[cur.screen]}</b> · ${cur.theme}/${cur.surface} · viewer ${cur.role} · ${t('reg')}`;
 render();
}
seg('screens',[['exact','Exact · C18'],['asset','Asset · C22'],['payslip','Payslip · E6']],'screen');
seg('states',[['empty','empty'],['loading','loading'],['populated','populated'],['large-data','large-data'],['error','error'],['no-permission','no-perm'],['offline','offline'],['success','success'],['validation-failed','validation-failed'],['totals-mismatch','totals-mismatch'],['partial-publish','partial-publish']],'state');
seg('roles',['R01','R02','R03','R04','R05','R06','R07','R08','R09','R10','R11','R12','R13'].map(r=>[r,r]),'role');
seg('themes',[['light','Light'],['dark','Dark'],['glass','Glass'],['reduced','Reduced']],'theme');
seg('surfaces',[['desktop','Desk'],['tablet','Tablet'],['mobile','Mobile'],['kiosk','Kiosk']],'surface');
seg('langs',[['en','EN'],['sw','SW']],'lang');
sync();
