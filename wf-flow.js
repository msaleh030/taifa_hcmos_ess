// F-slice spec · C2 Workforce Overview — flow logic (reuses the kit). Spec + visual-acceptance authority for the F-slice track.
function t(k){return window.T[cur.lang][k];}
const ic={
 chart:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3v18h18M8 16v-5M13 16V8M18 16v-9"/></svg>',
 users:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
 check:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg>',
 clock:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
 cal:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
 plus:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 5v14M5 12h14"/></svg>',
 inbox:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.5 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.5A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.5z"/></svg>',
 user:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/></svg>',
 cap:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m22 10-10-5L2 10l10 5 10-5z"/><path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5"/></svg>',
 shield:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
 money:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></svg>',
 pin:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="2.5"/></svg>',
 up:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M7 14l5-5 5 5"/></svg>',
 down:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M7 10l5 5 5-5"/></svg>',
 chev:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m9 6 6 6-6 6"/></svg>',
 wifi:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01"/></svg>',
 off:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 1l22 22M16.7 11.1A6 6 0 0 0 5 12M8.5 8.5A6 6 0 0 0 5 12M12 20h.01"/></svg>',
 warn:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
 lock:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
 phone:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.6 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 2z"/></svg>',
 refresh:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 2v6h-6M3 22v-6h6"/><path d="M21 8a9 9 0 0 0-15-3L3 8m0 8a9 9 0 0 0 15 3l3-3"/></svg>'};

let cur={screen:'overview',state:'populated',role:'R07',theme:'light',surface:'desktop',lang:'en'};

// role scope: site-scoped roles see only their site; R13 (field) has no console landing
const SITE_SCOPED=['R03','R06'];
function scoped(){return SITE_SCOPED.includes(cur.role);}

// figures per scope
function figures(){
 return scoped()
  ? {hc:'612',active:'590',onshift:'448',onleave:'14',neu:'+7',appr:'4',
     sites:[['sMwadui',612,'g']], cats:[['cPerm',505,505],['cContract',92,505],['cExpat',15,505]], scaleN:'Mwadui · 612 staff'}
  : {hc:'1,246',active:'1,198',onshift:'842',onleave:'37',neu:'+18',appr:cur.role==='R09'?'6':(cur.role==='R11'?'9':'14'),
     sites:[['sMwadui',612,'g'],['sNyanzaga',428,'b'],['sDar',138,'g'],['sHead',68,'y']],
     cats:[['cPerm',1012,1012],['cContract',189,1012],['cExpat',45,1012]], scaleN:t('scaleNote')};
}

function netChip(off){return off?`<span class="net off">${ic.off}${t('offline')}</span>`:`<span class="net">${ic.wifi}${t('online')}</span>`;}
function app(off,body){
 const isExec=cur.role==='R14';
 const scopeLbl=(scoped()?t('siteScope'):t('orgWide'))+(isExec?' · '+t('execRO'):'');
 return `<div class="app"><div class="topbar">${ic.chart}<div><div class="tt">${t('title')}</div>
  <div class="ts">${t('org')} · ${t(cur.role)} · ${scopeLbl}</div></div>${netChip(off)}</div>
  <div class="body">${body}</div></div>`;}
function center(icCls,icon,title,body,extra){return `<div class="center"><span class="ic ${icCls||''}">${icon}</span><h3>${title}</h3><p>${body}</p>${extra||''}</div>`;}

// Executive (R14): org-wide aggregates only — NO action card, NO individual pay/bank. LI-3 (not site-scoped) / LI-6 (read-only).
function statBandExec(F){
 const cards=[
  [ic.users,'headcount',F.hc,'accent',''],
  [ic.check,'active',F.active,'',''],
  [ic.money,'wageBill',t('wageBillVal'),'',''],
  [ic.clock,'liability',t('liabilityVal'),'',''],
  [ic.cal,'onleave',F.onleave,'',''],
  [ic.plus,'newMonth',F.neu,'','up']];
 return `<div class="mgrid">${cards.map(([i,k,v])=>`<div class="mcard"><div class="ml">${i} ${t(k)}</div><div class="mv">${v}</div>${
   k==='wageBill'||k==='liability'?`<div class="md">${t('aggOnly')}</div>`:k==='newMonth'?`<div class="md up">${ic.up} ${t('vsLast')}</div>`:k==='active'?`<div class="md">96% ${t('ofHc')}</div>`:'<div class="md">&nbsp;</div>'}</div>`).join('')}</div>`;
}
function execReports(off){
 const rows=[[ic.users,'rHeadcount'],[ic.money,'rWage'],[ic.trend||ic.chart,'rTurnover'],[ic.shield,'rSafety']];
 return `<div class="panel"><div class="ph">${ic.chart} ${t('execReports')}<span class="cnt">${t('readonlyTag')}</span></div>
  <div class="pb">${rows.map(([i,k])=>`<div class="alertrow ${off?'cleared':'due'}"><span class="ai">${i}</span>
    <div style="flex:1"><div class="at">${t(k)}</div><div class="am">${t('aggOnly')}</div></div>
    ${off?`<span class="aw">${t('offline')}</span>`:`<span style="color:var(--faint);flex-shrink:0">${ic.chev}</span>`}</div>`).join('')}
   <div class="note">${ic.lock}<span>${t('execExport')}</span></div></div></div>`;
}
function execNote(){return `<div class="note">${ic.shield}<span>${t('execNote')}</span></div>`;}

function statBand(F){
 const cards=[
  [ic.users,'headcount',F.hc,'accent',''],
  [ic.check,'active',F.active,'',`${t('ofHc')}`],
  [ic.clock,'onshift',F.onshift,'',''],
  [ic.cal,'onleave',F.onleave,'',''],
  [ic.plus,'newMonth',F.neu,'','up'],
  [ic.inbox,'approvals',F.appr,'accent','']];
 return `<div class="mgrid">${cards.map(([i,k,v,ac,d])=>`<div class="mcard ${ac}"><div class="ml">${i} ${t(k)}</div><div class="mv">${v}</div>${
   k==='newMonth'?`<div class="md up">${ic.up} ${t('vsLast')}</div>`:k==='active'?`<div class="md">96% ${t('ofHc')}</div>`:k==='approvals'?`<div class="md">${t('apRoute')}</div>`:'<div class="md">&nbsp;</div>'}</div>`).join('')}</div>`;
}
function compBlocks(F){
 const bar=(rows)=>rows.map(([k,n,base,tone])=>`<div class="crow"><span class="cl">${t(k)}</span><span class="cbar"><i class="${tone||''}" style="width:${Math.round(n/base*100)}%"></i></span><span class="cn">${n.toLocaleString('en-US')}</span></div>`).join('');
 const maxSite=F.sites[0][1];
 const site=`<div class="comp"><div class="shead">${ic.pin} ${t('compBySite')}</div>${bar(F.sites.map(([k,n,tone])=>[k,n,maxSite,tone]))}</div>`;
 const cat=`<div class="comp"><div class="shead">${ic.users} ${t('compByCat')}</div>${bar(F.cats.map(([k,n,base])=>[k,n,base,'b']))}</div>`;
 return `<div class="twocol">${site}${cat}</div>`;
}
function kpiStrip(){
 const pills=[['kRetention','92.4%','g'],['kTurnover','0.8%','g'],['kEss','71%','a'],['kRecords','98%','g'],['kAbsent','2.1%','a']];
 return `<div><div class="shead" style="justify-content:space-between">${ic.chart} ${t('kpiStrip')}<span class="scope" style="text-transform:none;letter-spacing:0">${t('viewScorecard')} ${ic.chev}</span></div>
  <div class="ragbar" style="margin-top:6px">${pills.map(([k,v,tone])=>`<span class="ragpill ${tone}"><span class="ragdot ${tone}"></span>${t(k)} <span class="n">${v}</span></span>`).join('')}</div></div>`;
}
function approvalsPanel(F,off){
 const rows=[[ic.cal,'apLeave',F===''?0:(scoped()?2:7)],[ic.user,'apProfile',scoped()?1:3],[ic.cap,'apTraining',scoped()?1:4]];
 return `<div class="panel"><div class="ph">${ic.inbox} ${t('approvalsPanel')}<span class="cnt">${F.appr}</span></div>
  <div class="pb">${rows.map(([i,k,n])=>`<div class="alertrow ${off?'cleared':'due'}"><span class="ai">${i}</span>
    <div style="flex:1"><div class="at">${t(k)}</div><div class="am">${t('apRoute')}</div></div>
    ${off?`<span class="aw">${t('offline')}</span>`:`<span class="aw">${n}</span>`}${off?'':`<span style="color:var(--faint);flex-shrink:0">${ic.chev}</span>`}</div>`).join('')}
   ${off?`<div class="note">${ic.off}<span>${t('apReadonly')}</span></div>`:''}</div></div>`;
}
function activityPanel(many){
 const base=[['in',ic.shield,'aDisc','aDiscW','#a1f0','14:02'],['in',ic.cal,'aLeave','aLeaveW','#7c2e','13:40'],['out',ic.user,'aJoiner','aJoinerW','#3b9d','11:18'],['out',ic.pin,'aTransfer','aTransferW','#e57a','09:55']];
 const list=many?[...base,...base,...base]:base;
 const rows=list.map(([tone,i,k,w,h,tm])=>`<div class="pitem"><span class="pi ${tone}">${i}</span>
   <div style="flex:1"><div class="pt">${t(k)}</div><div class="pd">${t(w)}</div></div>
   <div style="text-align:right;flex-shrink:0"><div class="ptime">${tm}</div><div class="pd" style="font-family:var(--mono);color:var(--blue)">${h}</div></div></div>`).join('');
 return `<div class="panel"><div class="ph">${ic.clock} ${t('activityPanel')}<span class="cnt">${t('audit')}</span></div>
  <div class="pb" style="gap:7px">${rows}${many?`<div class="vhint">${t('vhint')}</div>`:''}</div></div>`;
}
function scopeNote(){return `<div class="note">${ic.shield}<span>${t('scopeNote')}</span></div>`;}

function overview(){
 // R13 field employees have no console landing
 if(cur.role==='R13') return app(false,center('warn',ic.lock,t('noPermT'),t('noPermB'),`<button class="btn g">${ic.phone} ${t('goEss')}</button>`));
 if(cur.state==='loading'){
  return app(false,`<div class="mgrid">${'<div class="skelrow" style="height:78px;border-radius:13px"></div>'.repeat(6)}</div>
   <div class="skelrow" style="height:120px;border-radius:13px;margin-top:4px"></div>
   <div class="twocol" style="margin-top:2px"><div class="skelrow" style="height:150px;border-radius:13px"></div><div class="skelrow" style="height:150px;border-radius:13px"></div></div>`);
 }
 if(cur.state==='error') return app(false,center('err',ic.warn,t('errT'),t('errB'),`<button class="btn p" style="background:var(--red)">${ic.refresh} ${t('retry')}</button>`));
 if(cur.state==='no-permission') return app(false,center('warn',ic.lock,t('noPermT'),t('noPermB'),`<button class="btn g">${ic.phone} ${t('goEss')}</button>`));
 if(cur.state==='empty') return app(false,center('',ic.users,t('emptyT'),t('emptyB'),`<button class="btn p">${ic.plus} ${cur.lang==='en'?'Onboard employees':'Sajili wafanyakazi'}</button>`));

 const off=cur.state==='offline', many=cur.state==='large-data', F=figures();
 const top=off?`<div class="banner off">${ic.off}<div>${t('offSnap')}</div></div>`
   :cur.state==='success'?`<div class="banner ok">${ic.check}<div>${t('refreshed')}</div></div>`
   :many?`<div class="banner info">${ic.users}<div>${F.scaleN}</div></div>`:'';
 // R14 CEO/Executive: read-only, org-wide aggregates only — no approvals action surface, no individual pay/bank.
 if(cur.role==='R14') return app(off,`<div class="banner info">${ic.shield}<div>${t('execBanner')}</div></div>${top}${statBandExec(F)}${kpiStrip()}${compBlocks(F)}
   <div class="twocol">${execReports(off)}${activityPanel(many)}</div>${execNote()}`);
 return app(off,`${top}${statBand(F)}${kpiStrip()}${compBlocks(F)}
   <div class="twocol">${approvalsPanel(F,off)}${activityPanel(many)}</div>${scopeNote()}`);
}

function render(){document.querySelector('.stage').innerHTML=`<div class="frame">${overview()}</div>`;}

// ── switcher bar ──
function seg(id,items,key){const el=document.getElementById(id);el.innerHTML=items.map(it=>{const v=Array.isArray(it)?it[0]:it,l=Array.isArray(it)?it[1]:it;return `<button data-v="${v}">${l}</button>`;}).join('');el.querySelectorAll('button').forEach(b=>b.onclick=()=>{cur[key]=b.getAttribute('data-v');sync();});}
function sync(){
 document.documentElement.setAttribute('data-theme',cur.theme);
 document.documentElement.setAttribute('data-surface',cur.surface);
 [['screens','screen'],['states','state'],['roles','role'],['themes','theme'],['surfaces','surface'],['langs','lang']].forEach(([id,k])=>document.querySelectorAll('#'+id+' button').forEach(b=>b.classList.toggle('on',b.getAttribute('data-v')===cur[k])));
 document.getElementById('acline').innerHTML=`Covers <b>AUTH-06 role landing · UNI-01 · KPI-ref</b> · ${cur.theme}/${cur.surface} · viewer ${cur.role} · ${t('reg')}`;
 render();
}
seg('screens',[['overview','Overview']],'screen');
seg('states',[['empty','empty'],['loading','loading'],['populated','populated'],['large-data','large-data'],['error','error'],['no-permission','no-perm'],['offline','offline'],['success','success']],'state');
seg('roles',['R02','R03','R06','R07','R09','R11','R13','R14'].map(r=>[r,r]),'role');
seg('themes',[['light','Light'],['dark','Dark'],['glass','Glass'],['reduced','Reduced']],'theme');
seg('surfaces',[['desktop','Desk'],['tablet','Tablet'],['mobile','Mobile'],['kiosk','Kiosk']],'surface');
seg('langs',[['en','EN'],['sw','SW']],'lang');
sync();
