// Slice 6 · Leave & liability (E4 · C10 · C16) — flow logic (reuses Slice-4/5 kit)
function t(k){return window.T[cur.lang][k];}

const ic={
 calendar:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
 leave:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2a1 1 0 0 0-1 .3l-.9.9 6 3.5-2.5 2.5H3.5l-1 1 3.5 2 2 3.5 1-1v-2.9l2.5-2.5 3.5 6 .9-.9a1 1 0 0 0 .3-1z"/></svg>',
 cross:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M12 11v6M9 14h6"/></svg>',
 check:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg>',
 x:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6 6 18M6 6l12 12"/></svg>',
 warn:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
 off:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 1l22 22M16.7 11.1A6 6 0 0 0 5 12M8.5 8.5A6 6 0 0 0 5 12M2 8.8A11 11 0 0 1 6 6M22 8.8a11 11 0 0 0-4.6-3.3M12 20h.01"/></svg>',
 wifi:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01"/></svg>',
 sync:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/></svg>',
 shield:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
 lock:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
 search:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
 users:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11"/></svg>',
 money:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/></svg>',
 doc:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>',
 user:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/></svg>',
 clock:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'};

const initials=n=>n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
const fmt=n=>n.toLocaleString('en-US');
const money=n=>'TZS '+fmt(n);

let cur={screen:'apply',state:'populated',role:'R13',theme:'light',surface:'mobile',lang:'en'};

const LIAB_VIEW=['R07','R08','R09','R11'];
const APPLICANT={n:'Amina Juma',no:'TMCL-MW-3341',role:'Storekeeper · Mwadui',remaining:15,req:9,after:6,range:'11–19 Aug 2026'};
const LIAB=[
 {n:'Peter Komba',role:'General Labour',monthly:2160000,days:19},
 {n:'Grace Ndaki',role:'Site Supervisor',monthly:4500000,days:12},
 {n:'Amina Juma',role:'Storekeeper',monthly:2700000,days:7},
 {n:'Joseph Mlimani',role:'Equipment Operator',monthly:3600000,days:22},
 {n:'Fatuma Chacha',role:'Storekeeper',monthly:null,days:9},
 {n:'Daniel Mwaky',role:'Driver',monthly:2400000,days:14,leaver:true}];

// ── app shell (kit) ──
function app(title,sub,netOff,bodyHTML){
 const net=netOff
  ?`<span class="net off">${ic.off}${cur.lang==='en'?'Offline':'Nje ya mtandao'}</span>`
  :`<span class="net">${ic.wifi}${cur.lang==='en'?'Online':'Mtandaoni'}</span>`;
 return `<div class="app"><div class="topbar">${ic.leave}<div><div class="tt">${title}</div><div class="ts">${sub}</div></div>${net}</div>
  <div class="body">${bodyHTML}</div></div>`;
}
function center(icCls,icon,title,body,extra){
 return `<div class="center"><span class="ic ${icCls||''}">${icon}</span><h3>${title}</h3><p>${body}</p>${extra||''}</div>`;
}
function auditRow(txt){return `<div class="audit">${ic.shield}<span>${txt}</span><span class="h">#c4e1…9a</span></div>`;}
function skel(n){return '<div class="skelrow" style="width:100%;margin:9px 0"></div>'.repeat(n);}

// ── balance tiles ──
function tiles(active){ // 'annual' | 'sick'
 const annual=`<div class="tile ${active==='annual'?'hi':''}"><div class="tl">${ic.leave} ${t('annualTitle')}</div>
   <div class="big">19<small> ${t('days')} ${t('remaining')}</small></div>
   <div class="split"><div><div class="k">${t('entitlement')}</div><div class="n">28</div></div><div><div class="k">${t('taken')}</div><div class="n">9</div></div></div>
   <div class="sub">${t('annualEntNote')}</div></div>`;
 const sick=`<div class="tile ${active==='sick'?'sick':''}"><div class="tl">${ic.cross} ${t('sickTitle')}</div>
   <div class="big">63<small> ${t('sickFull')}</small></div>
   <div class="split"><div><div class="k">${t('sickHalf')}</div><div class="n">63</div></div></div>
   <div class="sub">${t('sickCertRule')}</div></div>`;
 const carry=`<div class="tile carry"><div class="tl">${ic.clock} ${t('carryTitle')}</div>
   <div class="big">6<small> ${t('days')}</small></div>
   <div class="sub">${t('carryLapse')}</div></div>`;
 return `<div class="tiles">${annual}${sick}${carry}</div>`;
}

// ── apply form ──
function form(sick){
 return `<div class="shead">${ic.leave} ${t('leaveType')}</div>
  <div class="ltypes">
   <div class="ltype ${sick?'':'sel-a'}"><span class="li">${ic.leave}</span><div><div class="tt">${t('tAnnual')}</div><div class="td">${t('tAnnualD')}</div></div><span class="rad"></span></div>
   <div class="ltype ${sick?'sel-s':''}"><span class="li">${ic.cross}</span><div><div class="tt">${t('tSick')}</div><div class="td">${t('tSickD')}</div></div><span class="rad"></span></div></div>
  <div class="fg">
   <div class="field"><label>${t('fromDate')} <span class="req">*</span></label><input value="2026-08-11" readonly></div>
   <div class="field"><label>${t('toDate')} <span class="req">*</span></label><input value="2026-08-19" readonly></div>
   <div class="field ${sick?'':'full'}"><label>${t('reqDays')}</label><input value="9 ${t('days')}" readonly></div>
   ${sick?`<div class="field"><label>${t('cert')} <span class="req">*</span></label>
     <div style="display:flex;align-items:center;gap:8px;border:1px solid var(--border);border-radius:9px;padding:9px 11px;background:var(--field);font-size:12px"><span style="color:var(--green)">${ic.doc}</span>${t('certAttached')}</div></div>`:''}
   <div class="field full"><label>${t('reason')}</label><textarea readonly>${t('reasonVal')}</textarea></div>
  </div>`;
}
function chk(kind,title,desc){
 const i=kind==='bad'?ic.x:kind==='warn'?ic.warn:ic.check;
 return `<div class="chk ${kind}"><span class="ci">${i}</span><div><div class="ct">${title}</div><div class="cd">${desc}</div></div></div>`;
}
function checks(scenario){ // 'ok' | 'blocked' | 'sick'
 let rows;
 if(scenario==='blocked'){
  rows=chk('bad',t('chkBalance'),t('chkBalanceBad'))+chk('bad',t('chkOverlap'),t('chkOverlapBad'))+chk('warn',t('chkContinuous'),t('chkContinuousBad'));
 }else if(scenario==='sick'){
  rows=chk('ok',t('chkBalance'),`63 ${t('sickFull')} + 63 ${t('sickHalf')} ${t('remaining')}.`)+chk('ok',t('chkOverlap'),t('chkOverlapOk'))+chk('ok',t('cert'),t('sickCertRule'));
 }else{
  rows=chk('ok',t('chkBalance'),t('chkBalanceOk'))+chk('ok',t('chkOverlap'),t('chkOverlapOk'))+chk('ok',t('chkContinuous'),t('chkContinuousOk'));
 }
 const hoh=scenario==='blocked'?`<div class="hoh">${ic.warn}<div><b>${t('hohTitle')}.</b> ${t('hohBody')}</div></div>`:'';
 return `<div class="shead">${ic.shield} ${t('checksTitle')}</div><div class="checks">${rows}</div>${hoh}`;
}

// ── APPLY screen (E4) ──
function applyScreen(){
 const off=cur.state==='offline';
 const wrap=b=>app(t('apply'),t('applySub'),off,b);
 switch(cur.state){
  case 'empty': return wrap(center('',ic.calendar,t('emptyApplyTitle'),t('emptyApplyBody')));
  case 'loading': return wrap(`<div class="tiles">${'<div class="tile">'+skel(3)+'</div>'.repeat(3)}</div>${skel(5)}`);
  case 'no-permission':
   return wrap(center('warn',ic.leave,t('noEntTitle'),t('noEntBody'),`<div class="why">${t('noEntWhy')}</div>`));
  case 'success':
   return wrap(`<div class="seal"><span class="disc ok">${ic.check}</span><h3>${t('successApplyTitle')}</h3><p>${t('successApplySub')}</p></div>
    <div class="receipt"><div class="rh">${ic.leave} ${t('requestSummary')}</div>
     <div class="rr"><span class="k">${t('leaveType')}</span><span class="v">${t('tAnnual')} · 9 ${t('days')}</span></div>
     <div class="rr"><span class="k">${t('fromDate')} – ${t('toDate')}</span><span class="v">11–19 Aug 2026</span></div>
     <div class="rr"><span class="k">${t('annualTitle')}</span><span class="v">10 / 19 ${t('days')}</span></div></div>
    ${auditRow(t('overrideAudited').replace(/·.*/,'· UNI-06'))}`);
  case 'error':
   return wrap(`<div class="banner err">${ic.warn}<div><b>${t('errApplyTitle')}</b><br>${t('errApplyBody')}</div></div>
    ${form(false)}${checks('blocked')}
    <div style="display:flex;gap:9px"><button class="btn g" style="flex:1">${t('cancel')}</button><button class="btn p" style="flex:2" disabled>${t('submitApply')}</button></div>
    <button class="btn g block" disabled>${ic.shield} ${t('routeHoH')}</button>`);
  case 'offline':
   return wrap(`<div class="banner off">${ic.off}<div><b>${t('offApplyTitle')}</b><br>${t('offApplyBody')}</div></div>
    ${form(false)}${checks('ok')}
    <button class="btn w block" disabled>${ic.sync} ${t('queuedBtn')}</button>`);
  case 'sick-leave':
   return wrap(`${tiles('sick')}<div class="note">${ic.cross}<span>${t('sickCertRule')}</span></div>
    ${form(true)}${checks('sick')}
    <button class="btn b block">${ic.check} ${t('submitApply')}</button>`);
  default: // populated / large-data
   return wrap(`${tiles('annual')}<div class="note">${ic.calendar}<span>${t('basisNote')} ${t('entTiers')}</span></div>
    ${form(false)}${checks('ok')}
    <div style="display:flex;gap:9px"><button class="btn g" style="flex:1">${t('cancel')}</button><button class="btn p" style="flex:2">${ic.check} ${t('submitApply')}</button></div>`);
 }
}

// ── request card + coverage (approve) ──
function reqCard(){
 return `<div class="reqcard"><div class="rq-h"><span class="av">${initials(APPLICANT.n)}</span>
   <div style="flex:1"><div class="nm">${APPLICANT.n}</div><div class="mt">${APPLICANT.no} · ${APPLICANT.role}</div></div>
   <span class="flag" style="background:rgba(31,162,74,.12);color:var(--green);border-color:rgba(31,162,74,.3)">${ic.leave} ${t('tAnnual')} · 9 ${t('days')}</span></div>
   <div class="rq-b"><div class="receipt" style="border:none;border-radius:0;background:transparent">
    <div class="rr"><span class="k">${t('fromDate')} – ${t('toDate')}</span><span class="v">${APPLICANT.range}</span></div>
    <div class="rr"><span class="k">${t('reqDays')}</span><span class="v">9 ${t('days')}</span></div>
    <div class="rr"><span class="k">${t('balAfter')}</span><span class="v">${APPLICANT.after} / ${APPLICANT.remaining} ${t('days')}</span></div></div></div></div>`;
}
function cov(mode){ // 'ok' | 'warn'
 const warn=mode==='warn';
 return `<div class="cov ${warn?'warn':''}"><div class="cvh">${ic.users} ${t('coverage')}</div>
   <div class="cvrow"><div><div class="cvrole">${t('covRole')}</div><div class="cvsub">${t('covPresent')}</div></div>
    <div class="cvcount"><div class="n">${warn?'0':'2'} ${t('covOf')} ${warn?'1':'3'}</div><div class="k">${t('covPresent')}</div></div></div>
   <div class="cvbar"><i style="width:${warn?'6':'66'}%"></i></div>
   <div class="cvsub" style="margin-top:9px">${warn?t('covWarnBody'):t('covOkBody')}</div></div>`;
}
function ackBlock(){
 return `<div class="ack"><div class="akt">${ic.shield} ${t('ackTitle')}</div><div class="akb">${t('ackBody')}</div>
   <div class="ackchk"><span class="box on">${ic.check}</span>${t('ackChk')}</div></div>`;
}

// ── APPROVE screen (C10) ──
function approveScreen(){
 const off=cur.state==='offline';
 const wrap=b=>app(t('approve'),t('approveSub'),off,b);
 switch(cur.state){
  case 'empty': return wrap(center('',ic.calendar,t('emptyApproveTitle'),t('emptyApproveBody')));
  case 'loading': return wrap(skel(7));
  case 'no-permission':
   return wrap(center('err',ic.lock,t('selfTitle'),t('selfBody'),`<div class="why">${t('selfWhy')} ${cur.role}</div>`));
  case 'success':
   return wrap(`<div class="seal"><span class="disc ok">${ic.check}</span><h3>${t('successApproveTitle')}</h3><p>${t('successApproveSub')}</p></div>
    ${reqCard()}${auditRow(t('overrideAudited'))}
    <div class="note">${ic.shield}<span>${t('matrixNote')}</span></div>`);
  case 'error':
   return wrap(`<div class="banner err">${ic.warn}<div><b>${t('errApproveTitle')}</b><br>${t('errApproveBody')}</div></div>
    ${reqCard()}<button class="btn p block">${ic.sync} ${t('retry')}</button>`);
  case 'offline':
   return wrap(`<div class="banner off">${ic.off}<div>${t('offApproveNote')}</div></div>${reqCard()}${cov('ok')}
    <button class="btn w block" disabled>${ic.sync} ${t('queuedBtn')}</button>`);
  case 'large-data':{
   const q=LIAB.slice(0,5).map(s=>`<div class="rrow"><span class="av">${initials(s.n)}</span>
     <div style="flex:1"><div class="rn">${s.n}</div><div class="rs">${s.role}</div></div>
     <span class="rb" style="color:var(--muted)">${s.days} ${t('dayU')} · ${t('tAnnual')}</span></div>`).join('');
   return wrap(`<div class="rmeta"><span class="cnt">${t('pendingTitle')}</span><span class="cnt">${t('pendingCount')}</span></div>
    <div class="rsearch">${ic.search}<span>${cur.lang==='en'?'Search applicant or team':'Tafuta mwombaji au timu'}</span></div>
    <div class="roster">${q}<div class="vhint">${t('pendingShown')}</div></div>`);
  }
  case 'coverage-warn':
   return wrap(`${reqCard()}${cov('warn')}${ackBlock()}
    <div class="note">${ic.shield}<span>${t('matrixNote')}</span></div>
    <div style="display:flex;gap:9px"><button class="btn g" style="flex:1">${ic.x} ${t('rejectBtn')}</button><button class="btn d" style="flex:2;background:var(--red);color:#fff">${ic.check} ${t('approveOverride')}</button></div>`);
  default: // populated
   return wrap(`${reqCard()}${cov('ok')}
    <div class="note">${ic.shield}<span>${t('matrixNote')}</span></div>
    <div style="display:flex;gap:9px"><button class="btn g" style="flex:1">${ic.x} ${t('rejectBtn')}</button><button class="btn p" style="flex:2">${ic.check} ${t('approveBtn')}</button></div>`);
 }
}

// ── liability table ──
function lrow(s){
 if(s.leaver) return `<div class="lrow excl"><div class="who"><div class="nm">${s.n}</div><div class="rl">${s.role}</div></div>
   <div class="num hide">${s.days}</div><div class="num hide">${money(Math.round(s.monthly/30))}</div><div class="liab">${t('exclLeaver')}</div></div>`;
 if(s.monthly==null) return `<div class="lrow"><div class="who"><div class="nm">${s.n}</div><div class="rl">${s.role}</div></div>
   <div class="num hide">${s.days}</div><div class="num hide">${t('na')}</div><div class="liab"><span class="lna">${ic.warn} ${t('notAvail')}</span></div></div>`;
 const daily=Math.round(s.monthly/30);
 return `<div class="lrow"><div class="who"><div class="nm">${s.n}</div><div class="rl">${s.role}</div></div>
   <div class="num hide">${s.days}</div><div class="num hide">${fmt(daily)}</div><div class="liab num">${money(s.days*daily)}</div></div>`;
}
function liabTable(){
 return `<div class="ltable">
   <div class="lhead"><div>${t('colStaff')}</div><div class="hide num">${t('colDays')}</div><div class="hide num">${t('colDaily')}</div><div class="num">${t('colLiab')}</div></div>
   ${LIAB.map(lrow).join('')}</div>`;
}
function liabTotal(){
 const total=LIAB.filter(s=>!s.leaver&&s.monthly!=null).reduce((a,s)=>a+s.days*Math.round(s.monthly/30),0);
 return `<div class="ltotal"><div><div class="tk">${t('totalTitle')}</div><div class="tv">${money(total)}</div></div>
   <div class="tmeta">4 ${t('liabActive')}<br>1 ${t('liabExcl')} · 1 ${t('liabNa')}</div></div>`;
}

// ── LIABILITY screen (C16) ──
function liabilityScreen(){
 if(!LIAB_VIEW.includes(cur.role)||cur.state==='no-permission'){
  return app(t('liability'),t('liabilitySub'),false,
   center('err',ic.lock,t('noPermTitle'),t('noPermBody'),`<div class="why">${t('noPermWhy')} ${cur.role}</div>`));
 }
 const off=cur.state==='offline';
 const wrap=b=>app(t('liability'),t('liabilitySub'),off,b);
 const header=`<div class="rmeta"><span class="formula">${ic.money} ${t('dailyFormula')}</span><span class="cnt">${t('asAt')} ${t('asAtVal')}</span></div>`;
 switch(cur.state){
  case 'empty': return wrap(center('',ic.money,t('emptyLiabTitle'),t('emptyLiabBody')));
  case 'loading': return wrap(skel(8));
  case 'error':
   return wrap(`<div class="banner err">${ic.warn}<div><b>${t('errLiabTitle')}</b><br>${t('errLiabBody')}</div></div>
    <button class="btn p block">${ic.sync} ${t('retry')}</button>`);
  case 'success':
   return wrap(`<div class="seal"><span class="disc ok">${ic.check}</span><h3>${t('successLiabTitle')}</h3><p>${t('successLiabSub')}</p></div>${liabTotal()}`);
  case 'offline':
   return wrap(`<div class="banner off">${ic.off}<div>${t('offLiabNote')}</div></div>${header}${liabTotal()}${liabTable()}`);
  case 'large-data':
   return wrap(`${header}
    <div class="ltotal"><div><div class="tk">${t('registerTitle')}</div><div class="tv">TZS 284.6M</div></div>
     <div class="tmeta">4,981 ${t('liabActive')}<br>233 ${t('liabExcl')} · 12 ${t('liabNa')}</div></div>
    ${liabTable()}<div class="vhint">${t('registerShown')}</div>
    <div class="note">${ic.money}<span>${t('exBase')}</span></div>
    <div class="note">${ic.shield}<span>${t('activeOnly')} ${t('naNote')}</span></div>`);
  default: // populated
   return wrap(`${header}${liabTotal()}${liabTable()}
    <div class="note">${ic.money}<span>${t('exBase')}</span></div>
    <div class="note">${ic.users}<span>${t('activeOnly')}</span></div>
    <div class="note">${ic.warn}<span>${t('naNote')}</span></div>`);
 }
}

// ── render ──
function render(){
 let html;
 if(cur.screen==='approve') html=approveScreen();
 else if(cur.screen==='liability') html=liabilityScreen();
 else html=applyScreen();
 document.querySelector('.stage').innerHTML=`<div class="frame">${html}</div>`;
}

// ── switcher bar ──
function seg(id,items,key){const el=document.getElementById(id);el.innerHTML=items.map(it=>{const v=Array.isArray(it)?it[0]:it,l=Array.isArray(it)?it[1]:it;return `<button data-v="${v}">${l}</button>`;}).join('');el.querySelectorAll('button').forEach(b=>b.onclick=()=>{cur[key]=b.getAttribute('data-v');sync();});}
const AC={
 apply:'AC-LV-01 · LV-02 · LV-05 · LR-1/2/4/5/7',
 approve:'AC-LV-03 coverage (LR-6) · matrix/SoD unchanged · UNI-06',
 liability:'AC-LIAB-01/02/03 · PC-1 · LVR-02'};
function sync(){
 document.documentElement.setAttribute('data-theme',cur.theme);
 document.documentElement.setAttribute('data-surface',cur.surface);
 [['screens','screen'],['states','state'],['roles','role'],['themes','theme'],['surfaces','surface'],['langs','lang']].forEach(([id,k])=>document.querySelectorAll('#'+id+' button').forEach(b=>b.classList.toggle('on',b.getAttribute('data-v')===cur[k])));
 document.getElementById('acline').innerHTML=`Covers <b>${AC[cur.screen]}</b> · ${cur.theme}/${cur.surface} · viewer ${cur.role} · reg ${t('reg')}`;
 render();
}
seg('screens',[['apply','Apply · E4'],['approve','Approve · C10'],['liability','Liability · C16']],'screen');
seg('states',[['empty','empty'],['loading','loading'],['populated','populated'],['large-data','large-data'],['error','error'],['no-permission','no-perm'],['offline','offline'],['success','success'],['coverage-warn','coverage-warn'],['sick-leave','sick-leave']],'state');
seg('roles',['R01','R02','R03','R04','R05','R06','R07','R08','R09','R10','R11','R12','R13'].map(r=>[r,r]),'role');
seg('themes',[['light','Light'],['dark','Dark'],['glass','Glass'],['reduced','Reduced']],'theme');
seg('surfaces',[['desktop','Desk'],['tablet','Tablet'],['mobile','Mobile'],['kiosk','Kiosk']],'surface');
seg('langs',[['en','EN'],['sw','SW']],'lang');
sync();
