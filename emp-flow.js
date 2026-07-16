// Slice 11 · Employee master & lifecycle (C4·C5·C6·C7·C9 · MOV-02) — flow logic (reuses kit)
function t(k){return window.T[cur.lang][k];}

const ic={
 users:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11"/></svg>',
 user:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/></svg>',
 check:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg>',
 warn:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
 off:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 1l22 22M16.7 11.1A6 6 0 0 0 5 12M8.5 8.5A6 6 0 0 0 5 12M2 8.8A11 11 0 0 1 6 6M22 8.8a11 11 0 0 0-4.6-3.3M12 20h.01"/></svg>',
 wifi:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01"/></svg>',
 sync:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/></svg>',
 lock:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
 search:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
 pin:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="2.5"/></svg>',
 swap:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 10 3 6l4-4M3 6h13M17 14l4 4-4 4M21 18H8"/></svg>',
 redo:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/></svg>',
 card:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></svg>',
 shield:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
 locksm:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'};

const initials=n=>n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
let cur={screen:'directory',state:'populated',role:'R07',theme:'light',surface:'desktop',lang:'en'};
const MASTER_VIEW=['R02','R03','R04','R05','R06','R07'];
const SITE_SCOPED={R03:'Mwadui',R06:'Mwadui'}; // EMP-02: these roles see only their assigned site (illustrative scope)
const PAY_VIEW=['R07']; // within master-data viewers, confidential pay/bank (A3)
const stColor=st=>st==='terminated'?'var(--red)':st==='suspended'?'var(--yellow)':st==='rehire'?'var(--blue)':'var(--green)';
const DIR=[
 {n:'Peter Komba',no:'TMCL-MW-2210',role:'General Labour',site:'Mwadui',st:'active'},
 {n:'Grace Ndaki',no:'TMCL-MW-3190',role:'Site Supervisor',site:'Mwadui',st:'active'},
 {n:'Amina Juma',no:'TMCL-MW-3341',role:'Storekeeper',site:'Mwadui',st:'suspended'},
 {n:'Fatuma Chacha',no:'TMCL-NZ-4110',role:'Storekeeper',site:'Nyanzaga',st:'active'},
 {n:'Joseph Mlimani',no:'TMCL-MW-4821',role:'Equipment Operator',site:'Mwadui',st:'active'},
 {n:'Daniel Mwaky',no:'TMCL-DY-1188',role:'Driver',site:'Dar Yard',st:'terminated'}];

function app(title,sub,netOff,bodyHTML){
 const net=netOff?`<span class="net off">${ic.off}${cur.lang==='en'?'Offline':'Nje ya mtandao'}</span>`
  :`<span class="net">${ic.wifi}${cur.lang==='en'?'Online':'Mtandaoni'}</span>`;
 return `<div class="app"><div class="topbar">${ic.users}<div><div class="tt">${title}</div><div class="ts">${sub}</div></div>${net}</div>
  <div class="body">${bodyHTML}</div></div>`;
}
function center(icCls,icon,title,body,extra){return `<div class="center"><span class="ic ${icCls||''}">${icon}</span><h3>${title}</h3><p>${body}</p>${extra||''}</div>`;}
function skel(n){return '<div class="skelrow" style="width:100%;margin:9px 0"></div>'.repeat(n);}
function badge(st){const l={active:t('stActive'),suspended:t('stSuspended'),terminated:t('stTerminated'),rehire:t('stRehire')}[st];return `<span class="badge ${st}"><span class="dot"></span>${l}</span>`;}
function rrow(k,v,conf){return `<div class="rr"><span class="k">${conf?ic.locksm+' ':''}${k}</span><span class="v">${v}</span></div>`;}
function receipt(rows){return `<div class="receipt">${rows}</div>`;}
// generic state wrapper; pop() renders populated + large-data
function withStates(title,sub,cfg){
 const off=cur.state==='offline';
 let body;
 switch(cur.state){
  case 'empty': body=center('',ic.users,cfg.emptyT,cfg.emptyB); break;
  case 'loading': body=skel(7); break;
  case 'error': body=`<div class="banner err">${ic.warn}<div><b>${t('errTitle')}</b><br>${t('errBody')}</div></div><button class="btn p block">${ic.sync} ${t('retry')}</button>`; break;
  case 'success': body=`<div class="seal"><span class="disc ok">${ic.check}</span><h3>${cfg.succT}</h3><p>${cfg.succS}</p></div>${cfg.succX||''}`; break;
  case 'offline': body=`<div class="banner off">${ic.off}<div>${t('offNote')}</div></div>${cfg.pop()}`; break;
  default: body=cfg.pop();
 }
 return app(title,sub,off,body);
}

// ── C4 directory ──
function dirRow(e){return `<div class="drow"><div class="who2"><span class="av2" style="background:${stColor(e.st)}${e.st==='suspended'?';color:#5a3d00':''}">${initials(e.n)}</span>
  <div><div class="nm2">${e.n}</div><div class="no2">${e.no}</div></div></div>
  <div class="hide" style="color:var(--muted)">${e.role}</div><div class="hide" style="color:var(--muted)">${e.site}</div>${badge(e.st)}</div>`;}
function directoryPop(){
 const big=cur.state==='large-data';
 const scopeSite=SITE_SCOPED[cur.role];
 const rows=scopeSite?DIR.filter(e=>e.site===scopeSite):DIR;
 const pill=scopeSite?t('dirCountScoped'):t('dirCount');
 const shown=scopeSite?t('dirShownScoped'):t('dirShown');
 const note=scopeSite?t('dirScope'):t('dirScopeOrg');
 return `<div class="rmeta"><span class="scope">${ic.users} ${pill}</span>${big?`<span class="cnt">${shown}</span>`:''}</div>
  <div class="rsearch">${ic.search}<span>${t('search')}</span></div>
  <div class="dirtable"><div class="dhead"><div>${t('colName')}</div><div class="hide">${t('colRole')}</div><div class="hide">${t('colSite')}</div><div style="justify-self:end">${t('colStatus')}</div></div>
   ${rows.map(dirRow).join('')}${big?`<div class="vhint">${shown}</div>`:''}</div>
  <div class="note">${ic.pin}<span>${note}</span></div>`;
}

// ── C5 profile ──
function profilePop(){
 const canPay=PAY_VIEW.includes(cur.role);
 const e=DIR[0];
 const conf=canPay
  ? `<div class="note" style="color:var(--green)">${ic.check}<span>${t('confShown')}</span></div>${receipt(rrow(t('fPay'),'TZS 980,000',true)+rrow(t('fBank'),'NBC ••• 4821',true)+rrow(t('fMedical'),'On file',true)+rrow(t('fPermit'),'N/A · citizen',true))}`
  : `<div class="confabs">${ic.locksm}<span>${t('confAbsent')}</span></div>`;
 return `<div class="profhd"><span class="pav" style="background:${stColor(e.st)}">${initials(e.n)}</span>
   <div style="flex:1"><h3>${e.n}</h3><div class="pmeta">${e.no} · ${e.role} · ${e.site}</div></div>${badge(e.st)}</div>
  <div class="proftabs"><span class="ptab on">${t('tabOverview')}</span><span class="ptab">${t('tabEmployment')}</span><span class="ptab">${t('tabConfidential')}</span><span class="ptab">${t('tabDocuments')}</span></div>
  ${receipt(rrow(t('fLegalName'),e.n)+rrow(t('fNumber'),e.no)+rrow(t('fRole'),e.role)+rrow(t('fSite'),e.site)+rrow(t('fStart'),'14 Jan 2019')+rrow(t('fContract'),t('fContractVal'))+rrow(t('fManager'),'Grace Ndaki'))}
  ${conf}
  <div class="note">${ic.shield}<span>${t('editReq')}</span></div>`;
}

// ── C6 joiner ──
function joinerPop(){
 return `<div class="shead">${ic.user} ${t('joinTitle')}</div>
  <div class="fg"><div class="field"><label>${t('fLegalName')} <span class="req">*</span></label><input value="Halima Bakari" readonly></div>
   <div class="field"><label>${t('fRole')} <span class="req">*</span></label><input value="General Labour" readonly></div>
   <div class="field"><label>${t('locLbl')} <span class="req">*</span></label><input value="${t('locVal')}" readonly></div>
   <div class="field"><label>${t('fStart')} <span class="req">*</span></label><input value="2026-07-01" readonly></div></div>
  <div class="idmint"><span class="im">${ic.card}</span><div><div class="il">${t('numberGen')} · ${t('numberGenNote')}</div><div class="iv">${t('numberGenVal')}</div></div></div>
  <div class="note">${ic.shield}<span>${t('joinNote')}</span></div>
  <div class="note">${ic.warn}<span><span class="flag"><span class="dot"></span>${t('rolloverFlag')}</span> · ${t('seqNote')}</span></div>
  <button class="btn p block">${ic.check} ${t('createBtn')}</button>`;
}

// ── C7 transfer ──
function transferPop(){
 const e=DIR[0];
 return `<div class="shead">${ic.swap} ${t('transferTitle')}</div>
  <div class="profhd"><span class="pav" style="background:${stColor('active')}">${initials(e.n)}</span><div style="flex:1"><h3>${e.n}</h3><div class="pmeta">${e.no}</div></div>${badge('active')}</div>
  <div class="seedgrid"><div class="seedtile"><span class="si">${ic.pin}</span><div style="flex:1"><div class="sl">${t('fromSite')}</div><div class="sc" style="font-size:13px">${t('fromVal')}</div></div></div>
   <div class="seedtile"><span class="si">${ic.pin}</span><div style="flex:1"><div class="sl">${t('toSite')}</div><div class="sc" style="font-size:13px">${t('toVal')}</div></div></div></div>
  ${receipt(rrow(t('numberKeep')+' · '+t('numberKeepNote'),e.no))}
  <div class="note">${ic.shield}<span>${t('transferNote')}</span></div>
  <button class="btn p block">${ic.swap} ${t('transferBtn')}</button>`;
}

// ── Rehire (MOV-02) ──
function rehirePop(){
 return `<div class="shead">${ic.redo} ${t('rehireTitle')}</div>
  <div class="banner ok" style="background:rgba(0,148,212,.08);color:var(--blue);border-color:rgba(0,148,212,.28)">${ic.check}<div><b>${t('matched')}.</b> ${t('matchedSub')}</div></div>
  <div class="idmint" style="background:rgba(0,148,212,.07);border-color:rgba(0,148,212,.3)"><span class="im" style="background:rgba(0,148,212,.15);color:var(--blue)">${ic.card}</span>
   <div><div class="il">${t('priorNo')} · ${t('priorNoNote')}</div><div class="iv">${t('priorNoVal')}</div></div></div>
  ${receipt(rrow(t('priorSpell'),t('priorSpellVal'))+rrow(t('statusFlip'),t('statusFlipVal')))}
  <div class="note">${ic.shield}<span>${t('rehireNote')}</span></div>
  <button class="btn b block">${ic.redo} ${t('rehireBtn')}</button>`;
}

// ── C9 ID card ──
function idcardPop(){
 const e=DIR[0];
 return `<div class="idcard" data-om-raster><div class="ic-h"><span class="ic-logo">TM</span><div><div class="ic-co">TAIFA MINING</div><div class="ic-sub">Employee Identity</div></div></div>
   <div class="ic-b"><div class="ic-photo">${t('idPhoto').replace(/\n/g,'<br>')}</div>
    <div style="flex:1"><div class="ic-nm">${e.n}</div><div class="ic-rl">${e.role}</div>
     <div class="ic-f">${t('idNo')}</div><div class="ic-v">${e.no}</div>
     <div class="ic-f">${t('idSite2')}</div><div class="ic-v">${e.site}</div>
     <div class="ic-f">${t('idBlood')} · ${t('idEmergency')}</div><div class="ic-v">O+ · +255 7•• ••• •••</div></div></div>
   <div class="ic-strip"><span>${t('idIssued')}</span><span>${t('idValid')}</span></div></div>
  <div class="note" style="margin-top:12px">${ic.locksm}<span>${t('idNote')}</span></div>
  <button class="btn g block">${ic.card} ${t('print')}</button>`;
}

// ── render ──
const SCREENS={
 directory:{title:'directory',sub:'directorySub',pop:directoryPop,emptyT:'emptyDirTitle',emptyB:'emptyDirBody',succT:'successGeneric',succS:'successGenericSub'},
 profile:{title:'profile',sub:'profileSub',pop:profilePop,emptyT:'emptyGeneric',emptyB:'emptyGenericBody',succT:'successGeneric',succS:'successGenericSub'},
 joiner:{title:'joiner',sub:'joinerSub',pop:joinerPop,emptyT:'emptyGeneric',emptyB:'emptyGenericBody',succT:'successJoinTitle',succS:'successJoinSub'},
 transfer:{title:'transfer',sub:'transferSub',pop:transferPop,emptyT:'emptyGeneric',emptyB:'emptyGenericBody',succT:'successTransferTitle',succS:'successTransferSub'},
 rehire:{title:'rehire',sub:'rehireSub',pop:rehirePop,emptyT:'emptyGeneric',emptyB:'emptyGenericBody',succT:'successRehireTitle',succS:'successRehireSub'},
 idcard:{title:'idcard',sub:'idcardSub',pop:idcardPop,emptyT:'emptyGeneric',emptyB:'emptyGenericBody',succT:'successGeneric',succS:'successGenericSub'}};
function render(){
 const s=SCREENS[cur.screen];
 let html;
 if(!MASTER_VIEW.includes(cur.role)||cur.state==='no-permission')
  html=app(t(s.title),t(s.sub),false,center('err',ic.lock,t('noPermTitle'),t('noPermBody'),`<div class="why">${t('noPermWhy')} ${cur.role}</div>`));
 else html=withStates(t(s.title),t(s.sub),{emptyT:t(s.emptyT),emptyB:t(s.emptyB),succT:t(s.succT),succS:t(s.succS),pop:s.pop});
 document.querySelector('.stage').innerHTML=`<div class="frame">${html}</div>`;
}
function seg(id,items,key){const el=document.getElementById(id);el.innerHTML=items.map(it=>{const v=Array.isArray(it)?it[0]:it,l=Array.isArray(it)?it[1]:it;return `<button data-v="${v}">${l}</button>`;}).join('');el.querySelectorAll('button').forEach(b=>b.onclick=()=>{cur[key]=b.getAttribute('data-v');sync();});}
const AC={directory:'EMP-02 site-scoping · UNI-02 large-data',profile:'EMP-01 confidential by role (A3) · EMP-03 · SOD-03',joiner:'JML-01/03/04 · number generated TMCL-&lt;LOC&gt;-&lt;SEQ&gt;',transfer:'MOV-01 · number unchanged',rehire:'MOV-02 · original number retained',idcard:'PRT-01 · permitted fields · print=light'};
function sync(){
 document.documentElement.setAttribute('data-theme',cur.theme);
 document.documentElement.setAttribute('data-surface',cur.surface);
 [['screens','screen'],['states','state'],['roles','role'],['themes','theme'],['surfaces','surface'],['langs','lang']].forEach(([id,k])=>document.querySelectorAll('#'+id+' button').forEach(b=>b.classList.toggle('on',b.getAttribute('data-v')===cur[k])));
 document.getElementById('acline').innerHTML=`Covers <b>${AC[cur.screen]}</b> · ${cur.theme}/${cur.surface} · viewer ${cur.role} · ${t('reg')}`;
 render();
}
seg('screens',[['directory','Directory · C4'],['profile','Profile · C5'],['joiner','Joiner · C6'],['transfer','Transfer · C7'],['rehire','Rehire · MOV-02'],['idcard','ID card · C9']],'screen');
seg('states',[['empty','empty'],['loading','loading'],['populated','populated'],['large-data','large-data'],['error','error'],['no-permission','no-perm'],['offline','offline'],['success','success']],'state');
seg('roles',['R01','R02','R03','R04','R05','R06','R07','R08','R09','R10','R11','R12','R13'].map(r=>[r,r]),'role');
seg('themes',[['light','Light'],['dark','Dark'],['glass','Glass'],['reduced','Reduced']],'theme');
seg('surfaces',[['desktop','Desk'],['tablet','Tablet'],['mobile','Mobile'],['kiosk','Kiosk']],'surface');
seg('langs',[['en','EN'],['sw','SW']],'lang');
sync();
