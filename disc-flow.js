// Slice 4 · C8 Disciplinary action & fan-out — flow logic (reuses Slice-3 kit)
function t(k){return window.T[cur.lang][k];}

const ic={
 users:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11"/></svg>',
 user:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/></svg>',
 warn:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
 ban:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M5.6 5.6 18.4 18.4"/></svg>',
 lock:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
 check:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg>',
 x:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6 6 18M6 6l12 12"/></svg>',
 off:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 1l22 22M5 12a8 8 0 0 1 11-6"/></svg>',
 bell:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
 phone:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/></svg>',
 doc:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>',
 feed:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
 shield:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
 pin:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="2.5"/></svg>',
 redo:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/></svg>',
 link:'<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></svg>'};

const initials=n=>n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
function badge(st){const lbl=st==='active'?t('active'):st==='suspended'?t('suspendedS'):t('terminated');return `<span class="badge b-${st}"><span class="dot"></span>${lbl}</span>`;}

// roles permitted to ISSUE disciplinary action: HR (R05/R06/R07/R11) + line manager per A2 (R02)
const DISC_ISSUE=['R02','R05','R06','R07','R11'];
// names by viewer role (the issuer/maker resolves to the signed-in user)
const ISSUER_BY_ROLE={R02:{n:'Salum Shirima',r:'Line Manager · A2'},R05:{n:'Asha Mlimani',r:'HR Officer'},
 R06:{n:'Amina Hassan',r:'Project HR'},R07:{n:'Neema Mwakalukwa',r:'Head of HR'},R11:{n:'Joseph Kessy',r:'Project HR Lead'}};
const SUBJECT={n:'Peter Komba',no:'TMCL-MW-2210',role:'General Labour',site:'Mwadui'};
const LINE_MGR={n:'Grace Ndaki',r:'Site Supervisor · Mwadui'};   // DISC-02 resolves from subject's site
function issuer(){return ISSUER_BY_ROLE[cur.role]||{n:'Amina Hassan',r:'Project HR'};}
// approver/checker = a permitted HR role DIFFERENT from the issuer (SOD-01)
function checker(){return cur.role==='R07'?{n:'David Mlay',r:'CEO'}:{n:'Neema Mwakalukwa',r:'Head of HR'};}

let cur={screen:'warning',state:'empty',role:'R06',theme:'light',surface:'desktop',lang:'en'};

// ── directory backdrop (kit) with the suspended subject visible ──
const DIR=[
 {n:'Joseph Mlimani',no:'TMCL-MW-4821',role:'Equipment Operator',site:'Mwadui',st:'active'},
 {n:'Grace Ndaki',no:'TMCL-NZ-3190',role:'Site Supervisor',site:'Mwadui',st:'active'},
 {n:'Peter Komba',no:'TMCL-MW-2210',role:'General Labour',site:'Mwadui',st:'suspended'},
 {n:'Fatuma Chacha',no:'TMCL-NZ-4110',role:'Storekeeper',site:'Nyanzaga',st:'active'},
 {n:'Daniel Mwaky',no:'TMCL-DY-1188',role:'Driver',site:'Dar Yard',st:'terminated'}];
const stColor=st=>st==='terminated'?'var(--red)':st==='suspended'?'var(--yellow)':st==='rehire'?'var(--blue)':'var(--green)';
function dirRow(e,boxed){return `<div class="row"${boxed?' style="border:1px solid var(--border);border-radius:10px;margin-bottom:7px"':''}><div class="who"><span class="av" style="background:${stColor(e.st)}${e.st==='suspended'?';color:#5a3d00':''}">${initials(e.n)}</span><div><div class="nm">${e.n}</div><div class="sub num">${e.no}</div></div></div><div class="hide sub">${e.role}</div><div class="hide sub">${e.site}</div><div>${badge(e.st)}</div></div>`;}
function backdrop(){return `<div class="hd">${ic.users}<h2>${t('dir')}</h2><span class="scope">· Taifa Mining Co</span></div><div class="body">${DIR.map(e=>dirRow(e)).join('')}</div>`;}

// ── modal scaffold ──
function modal(iconHTML,iconCls,title,sub,bodyHTML,footHTML,foot){
 return `<div style="position:absolute;inset:0;opacity:.32;pointer-events:none">${backdrop()}</div><div class="scrim"></div>
  <div class="mwrap"><div class="modal">
   <div class="mh"><span class="ic ${iconCls||''}">${iconHTML}</span><div><h3>${title}</h3><div class="sub">${sub}</div></div></div>
   <div class="mb">${bodyHTML}</div>
   ${footHTML?`<div class="mf">${foot?`<span class="lft">${foot}</span>`:''}${footHTML}</div>`:''}
  </div></div>`;}

const isSusp=()=>cur.screen==='suspension';
function headIcon(){return isSusp()?ic.ban:ic.warn;}
function headCls(){return isSusp()?'susp':'warn';}

// ── subject plate ──
function subjPlate(){
 return `<div class="subj"><span class="av">${initials(SUBJECT.n)}</span>
  <div class="meta"><div class="nm">${SUBJECT.n}</div><div class="no">${SUBJECT.no} · ${SUBJECT.role} · ${SUBJECT.site}</div></div>
  ${badge('active')}</div>`;
}

// ── action type cards ──
function typeCards(){
 const w=!isSusp(), s=isSusp();
 return `<div class="types">
  <div class="tcard ${w?'sel-w':''}"><span class="tic">${ic.warn}</span><div><div class="tt">${t('tWarn')}</div><div class="td">${t('tWarnD')}</div></div><span class="rad"></span></div>
  <div class="tcard ${s?'sel-s':''}"><span class="tic">${ic.ban}</span><div><div class="tt">${t('tSusp')}</div><div class="td">${t('tSuspD')}</div></div><span class="rad"></span></div>
 </div>`;
}

// ── manager resolution (DISC-02) ──
function resolveChip(){
 return `<div class="resolve">${ic.pin}<div class="rt"><b>${t('resolveTitle')} ${SUBJECT.site}.</b> <b>${LINE_MGR.n}</b> ${t('resolveMid')}</div><span class="auto">${t('autoTag')}</span></div>`;
}

// ── SoD block (issuer ≠ checker ≠ subject) ──
function party(cls,roleLbl,p,clash){
 return `<div class="party ${cls}${clash?' clash':''}"><div class="rl">${roleLbl}</div><span class="av">${initials(p.n)}</span><div class="pn">${p.n}</div><div class="pr">${p.r}</div></div>`;
}
function sodBlock(clash){
 const iss=issuer(), chk=checker();
 if(clash){
  return `<div class="sod clash"><div class="sodh">${ic.shield} ${t('sodHead')}</div>
   <div class="sodgrid">
    ${party('issuer clash',t('rIssuer'),{n:SUBJECT.n,r:SUBJECT.role},true)}
    <span class="neq" style="color:var(--red)">=</span>
    ${party('subject clash',t('rSubject'),{n:SUBJECT.n,r:SUBJECT.role},true)}
    <span class="neq">≠</span>
    ${party('checker',t('rChecker'),chk)}
   </div>
   <div class="sodbad">${ic.ban}<div>${t('sodClashSelf')}</div></div></div>`;
 }
 return `<div class="sod"><div class="sodh">${ic.shield} ${t('sodHead')}</div>
  <div class="sodgrid">
   ${party('issuer',t('rIssuer'),iss)}
   <span class="neq">≠</span>
   ${party('checker',t('rChecker'),chk)}
   <span class="neq">≠</span>
   ${party('subject',t('rSubject'),{n:SUBJECT.n,r:SUBJECT.role})}
  </div>
  <div class="sodnote">${ic.check}<div>${t('sodOk')} <span class="tbc" style="background:rgba(0,148,212,.14);color:var(--blue)">${t('sodMatrix')}</span></div></div></div>`;
}

// ── form body ──
function formBody(banner){
 const filled=cur.state!=='empty';
 const val=v=>filled?v:'';
 return `${banner||''}
  <div class="shead">${ic.user} ${t('subject')}</div>
  ${subjPlate()}
  <div class="shead">${ic.warn} ${t('atype')}</div>
  ${typeCards()}
  ${resolveChip()}
  ${sodBlock(false)}
  <div class="shead">${ic.doc} ${t('details')}</div>
  <div class="fg">
   <div class="field"><label>${t('category')} <span class="req">*</span></label><select><option>${t('catAtt')}</option></select></div>
   <div class="field"><label>${t('effdate')} <span class="req">*</span></label><input value="${val('2026-06-28')}" placeholder="YYYY-MM-DD" readonly></div>
   <div class="field full"><label>${t('details')} <span class="req">*</span></label><textarea placeholder="${t('detailsPH')}" readonly>${val(t('detailsVal'))}</textarea></div>
  </div>`;
}

// ── fan-out (success) ──
function fanItem(iconHTML,title,detail,chip,cls){
 return `<div class="fanitem ${cls||''}"><span class="node">${ic.check}</span><span class="fic">${iconHTML}</span>
  <div style="flex:1"><div class="ft">${title}</div><div class="fd">${detail}</div></div><span class="fchip">${chip}</span></div>`;
}
function letterPreview(){
 return `<div class="letter" data-om-raster><div class="lh"><div class="lt">${t('letterTitle')}</div><div class="lco">${t('letterCo').replace(/\n/g,'<br>')}</div></div>
  <div style="font-weight:600;margin-bottom:5px">${t('letterRe')}</div>
  <div class="lbar m"></div><div class="lbar s"></div><div class="lbar m"></div><div class="lbar"></div><div class="lbar s"></div>
  <div class="lprint">${ic.doc}<span>${t('letterPrint')}</span></div>
  <div class="lstamp">${t('letterStamp')}</div></div>`;
}
function fanout(){
 const susp=isSusp();
 const items=[
  fanItem(ic.doc,t('fRegister'),t('fRegisterD'),'DISC-REG-2026-0042'),
  fanItem(ic.bell,t('fEss'),t('fEssD'),'ESS'),
  fanItem(ic.phone,t('fConsole'),t('fConsoleD'),'R07 · '+LINE_MGR.n.split(' ')[1]),
  fanItem(ic.doc,t('fLetter'),t('fLetterD'),'WL-2026-0042.pdf'),
  fanItem(ic.feed,t('fFeed'),t('fFeedD'),'feed'),
  fanItem(ic.shield,t('fAudit'),t('fAuditD'),'#a1f4…e2')
 ];
 if(susp) items.push(fanItem(ic.ban,t('fStatus'),t('fStatusD'),'active→suspended','flip'));
 const body=`<div class="fanhead ${susp?'s':'w'}"><span class="seal">${ic.check}</span>
   <div><div class="ht">${susp?t('fanSuspTitle'):t('fanWarnTitle')}</div><div class="hs">${susp?t('fanSuspSub'):t('fanWarnSub')}</div></div>
   <span class="atom">${t('atomTag')}</span></div>
  ${subjPlateSuccess(susp)}
  <div class="fan">${items.join('')}</div>
  ${letterPreview()}`;
 return modal(headIcon(),headCls(),susp?t('suspension'):t('warning'),susp?t('suspensionSub'):t('warningSub'),body,'');
}
function subjPlateSuccess(susp){
 return `<div class="subj" style="margin-top:11px"><span class="av" style="background:${susp?'var(--yellow)':'var(--green)'};${susp?'color:#5a3d00':''}">${initials(SUBJECT.n)}</span>
  <div class="meta"><div class="nm">${SUBJECT.n}</div><div class="no">${SUBJECT.no} · ${SUBJECT.site}</div></div>
  ${badge(susp?'suspended':'active')}</div>`;
}

// ── error: atomic rollback — show NOTHING committed ──
function errorFrame(){
 const susp=isSusp();
 const items=[
  [ic.doc,t('fRegister')],[ic.bell,t('fEss')],[ic.phone,t('fConsole')],
  [ic.doc,t('fLetter')],[ic.feed,t('fFeed')],[ic.shield,t('fAudit')]
 ];
 if(susp) items.push([ic.ban,t('fStatus')]);
 const rb=items.map(([i,nm])=>`<div class="fanitem rb"><span class="node">${ic.x}</span><span class="fic">${i}</span><div style="flex:1"><div class="ft">${nm}</div></div><span class="fchip">${t('errTitle').includes('—')?'rolled back':'rolled back'}</span></div>`).join('');
 const body=`<div class="banner err">${ic.warn}<div><b>${t('errTitle')}</b><br>${t('errBody')}</div></div>
  ${subjPlate()}
  <div class="shead">${ic.x} ${t('errTitle')}</div>
  <div class="fan rb">${rb}</div>`;
 return modal(headIcon(),headCls(),susp?t('suspension'):t('warning'),susp?t('suspensionSub'):t('warningSub'),body,
  `<button class="btn g">${t('cancel')}</button><button class="btn ${susp?'d':'w'}">${ic.redo}${t('retry')}</button>`);
}

// ── loading ──
function loadingFrame(){
 const susp=isSusp();
 return modal(headIcon(),headCls(),susp?t('suspension'):t('warning'),susp?t('suspensionSub'):t('warningSub'),
  `${subjPlate()}${'<div class="skelrow"></div>'.repeat(6)}`,
  `<button class="btn g" disabled>${t('cancel')}</button><button class="btn ${susp?'d':'w'}" disabled>${t('saving')}</button>`);
}

// ── locks ──
function forbidFrame(){
 return modal(ic.lock,'',isSusp()?t('suspension'):t('warning'),isSusp()?t('suspensionSub'):t('warningSub'),
  `<div class="lock"><span class="ic">${ic.lock}</span><h3>${t('forbid')}</h3><p>${t('forbidBody')}</p><div class="why">DISC-04 / SOD-02 · viewer ${cur.role}</div></div>`,'');
}
function selfFrame(){
 return modal(ic.ban,'susp',isSusp()?t('suspension'):t('warning'),isSusp()?t('suspensionSub'):t('warningSub'),
  `<div class="lock"><span class="ic self">${ic.ban}</span><h3>${t('selfTitle')}</h3><p>${t('selfBody')}</p>
   ${sodBlock(true)}</div>`,'');
}
function emptyFrame(){
 return modal(headIcon(),headCls(),isSusp()?t('suspension'):t('warning'),isSusp()?t('suspensionSub'):t('warningSub'),
  `<div class="empty"><span class="ic">${ic.warn}</span><h3>${t('emptyTitle')}</h3><p>${t('emptyBody')}</p></div>`,'');
}

// ── issue flow dispatch ──
function issueFlow(){
 if(cur.state==='empty') return emptyFrame();
 if(cur.state==='loading') return loadingFrame();
 if(cur.state==='success') return fanout();
 if(cur.state==='error') return errorFrame();
 const susp=isSusp();
 const banner=cur.state==='offline'?`<div class="banner off">${ic.off}<div>${t('off')}</div></div>`:'';
 const foot=cur.state==='offline'
  ?`<button class="btn g">${t('cancel')}</button><button class="btn ${susp?'d':'w'}">${ic.off}${t('queued')}</button>`
  :`<button class="btn g">${t('cancel')}</button><button class="btn ${susp?'d':'w'}">${susp?ic.ban:ic.check}${susp?t('issueSusp'):t('issueWarn')}</button>`;
 return modal(headIcon(),headCls(),susp?t('suspension'):t('warning'),susp?t('suspensionSub'):t('warningSub'),
  formBody(banner),foot,`${SUBJECT.n} · ${SUBJECT.no}`);
}

// ── SoD showcase screen ──
function sodScreen(){
 return `<div class="hd">${ic.shield}<h2>${t('sod')}</h2><span class="scope">· DISC-04 · SOD-01 · SOD-02</span></div>
  <div style="flex:1;overflow:auto;padding:18px 20px;display:flex;flex-direction:column;gap:16px">
   <div>${sodBlock(false)}</div>
   <div>${sodBlock(true)}</div>
   <div class="banner info" style="margin:0">${ic.shield}<div>${t('sodMatrix')} — the server re-checks every issuer/approver/subject combination and refuses any the matrix forbids, even when the UI offered the control.</div></div>
  </div>`;
}

// ── Suspended rendering screen (directory row + profile header) ──
function suspendedScreen(){
 const sus={n:'Peter Komba',no:'TMCL-MW-2210',role:'General Labour',site:'Mwadui',st:'suspended'};
 const term={n:'Daniel Mwaky',no:'TMCL-DY-1188',role:'Driver',site:'Dar Yard',st:'terminated'};
 const act={n:'Joseph Mlimani',no:'TMCL-MW-4821',role:'Equipment Operator',site:'Mwadui',st:'active'};
 const tabs=t('profTabs');
 return `<div class="hd">${ic.users}<h2>${t('suspended')}</h2><span class="scope">· ${t('suspendedSub')}</span></div>
  <div style="flex:1;overflow:auto">
   <div style="padding:16px 18px 4px"><div class="shead">${ic.users} ${t('dir')} — ${t('byline')}</div>
    ${dirRow(act,true)}${dirRow(sus,true)}${dirRow(term,true)}
    <div class="sub" style="font-size:11px;margin:2px 2px 10px;line-height:1.45">${ic.warn} ${t('dirNote')}</div></div>
   <div style="padding:0 0 16px">
    <div class="prof" style="border:1px solid var(--border);border-radius:14px;margin:0 18px;overflow:hidden;background:var(--card-bg)">
     <div class="profhd susp"><span class="pav" style="background:var(--yellow);color:#5a3d00">${initials(sus.n)}</span>
      <div style="flex:1"><h2>${sus.n}</h2><div class="pmeta">${sus.no} · ${sus.role} · ${sus.site}</div></div>${badge('suspended')}</div>
     <div class="suspband">${ic.ban}<div><b>${t('suspendedS')}.</b> ${t('profSuspBand')}</div></div>
     <div class="proftabs">${tabs.map((x,i)=>`<span class="proftab ${i===1?'on':''}">${x}</span>`).join('')}</div>
     <div class="profbody"><div class="shead">${ic.shield} ${t('discTitle')}</div>
      <div class="discrow s"><span class="di">${ic.ban}</span><div style="flex:1"><div class="dt">${t('dSusp')}</div><div class="dd">${t('dSuspMeta')}</div></div><span class="dtag">DISC-REG-2026-0042</span></div>
      <div class="discrow w"><span class="di">${ic.warn}</span><div style="flex:1"><div class="dt">${t('dWarn')}</div><div class="dd">${t('dWarnMeta')}</div></div><span class="dtag">WL-2026-0039</span></div>
     </div>
    </div>
   </div>
  </div>`;
}

// ── render ──
function render(){
 const stage=document.querySelector('.stage');
 let html;
 if(cur.screen==='sod') html=sodScreen();
 else if(cur.screen==='suspended') html=suspendedScreen();
 else if(cur.state==='self') html=selfFrame();
 else if(cur.state==='no-permission' || !DISC_ISSUE.includes(cur.role)) html=forbidFrame();
 else html=issueFlow();
 stage.innerHTML=`<div class="frame">${html}</div>`;
}

// ── switcher bar ──
function seg(id,items,key){const el=document.getElementById(id);el.innerHTML=items.map(it=>{const v=Array.isArray(it)?it[0]:it,l=Array.isArray(it)?it[1]:it;return `<button data-v="${v}">${l}</button>`;}).join('');el.querySelectorAll('button').forEach(b=>b.onclick=()=>{cur[key]=b.getAttribute('data-v');sync();});}
const AC={warning:'AC-DISC-01/02/04 · SOD-01/02 · UNI-06',suspension:'AC-DISC-01/02/03/04 · SOD-01/02 · UNI-06',sod:'AC-DISC-04 · SOD-01/02',suspended:'AC-DISC-03 · UNI-01 lifecycle'};
function sync(){
 document.documentElement.setAttribute('data-theme',cur.theme);
 document.documentElement.setAttribute('data-surface',cur.surface);
 [['screens','screen'],['states','state'],['roles','role'],['themes','theme'],['surfaces','surface'],['langs','lang']].forEach(([id,k])=>document.querySelectorAll('#'+id+' button').forEach(b=>b.classList.toggle('on',b.getAttribute('data-v')===cur[k])));
 document.getElementById('acline').innerHTML=`Covers <b>${AC[cur.screen]}</b> · ${cur.theme}/${cur.surface} · viewer ${cur.role}`;
 render();
}
seg('screens',[['warning','C8 Warning'],['suspension','C8 Suspension'],['sod','SoD block'],['suspended','Suspended']],'screen');
seg('states',[['empty','empty'],['drafted','drafted'],['loading','loading'],['success','success'],['error','error'],['no-permission','no-permission'],['self','self'],['offline','offline']],'state');
seg('roles',['R01','R02','R03','R04','R05','R06','R07','R08','R09','R10','R11','R12','R13'].map(r=>[r,r]),'role');
seg('themes',[['light','Light'],['dark','Dark'],['glass','Glass'],['reduced','Reduced']],'theme');
seg('surfaces',[['desktop','Desk'],['tablet','Tablet'],['mobile','Mobile'],['kiosk','Kiosk']],'surface');
seg('langs',[['en','EN'],['sw','SW']],'lang');
sync();
