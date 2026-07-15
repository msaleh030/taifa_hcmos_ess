
// Shared bi-directional store — HCWOS console & ESS read/write the SAME records.
// A leave raised in ESS shows in the console; an approval in the console flows back to ESS.
// Every mutation is written to a tamper-evident, hash-chained AUDIT LEDGER (NFR-09):
// each entry stores before→after values and a hash of (prevHash + payload), so any
// edit, deletion or re-ordering of history breaks the chain and is detected on verify.
(function(){
  let nextId = 4000;

  // ── integrity: FNV-1a hash of a string ──
  function fnv(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return (h>>>0).toString(16).padStart(8,'0'); }
  function payloadOf(e){ return [e.seq,e.ts,e.actor,e.action,e.entity,e.entityId,e.reason||'',JSON.stringify(e.changes||[])].join('|'); }
  function hashEntry(prevHash, e){ return fnv(prevHash + '·' + payloadOf(e)); }

  // seed audit — historical, already-chained events (incl. two transfers)
  const SEED = [
    { ts:'2026-06-18 09:24', actor:'Hawa Yusuph',  role:'Head of HR', action:'Transfer', entity:'Employee', entityId:'TMC-DAR-17-1902', subject:'Mohammed Said',
      reason:'Operational redeployment — Dar Yard workshop surge', changes:[{field:'Site',before:'Nyanzaga',after:'Dar Yard'},{field:'Line manager',before:'Neema Joseph',after:'Samuel Mlay'}] },
    { ts:'2026-06-19 11:02', actor:'Ali Mbaruk',   role:'CEO',        action:'Approve',  entity:'Leave',    entityId:'LV-3104', subject:'Mohammed Said',
      reason:'Within entitlement, cover confirmed', changes:[{field:'Status',before:'Pending',after:'Approved'}] },
    { ts:'2026-06-20 08:13', actor:'Rajesh Pillai',role:'Workshop Mgr',action:'Update',  entity:'Employee', entityId:'TMC-NMR-19-2877', subject:'Daniel Otieno',
      reason:'OSHA medical due', changes:[{field:'Medical',before:'Valid',after:'Expiring'}] },
    { ts:'2026-06-21 16:40', actor:'System',       role:'Automation', action:'Suspend',  entity:'Employee', entityId:'TMC-MWD-19-2210', subject:'Peter Komba',
      reason:'Disciplinary — second final warning', changes:[{field:'Status',before:'Active',after:'Suspended'}] },
    { ts:'2026-06-22 14:15', actor:'Hawa Yusuph',  role:'Head of HR', action:'Transfer', entity:'Employee', entityId:'TMC-GTA-20-3741', subject:'Esther Mushi',
      reason:'Grade progression after authorisation', changes:[{field:'Grade',before:'G5',after:'G6'}] },
  ];

  const audit = [];
  let prevHash = 'GENESIS';
  SEED.forEach((e,i)=>{ const entry={ seq:i+1, ...e, prevHash }; entry.hash=hashEntry(prevHash,entry); prevHash=entry.hash; audit.push(entry); });

  const state = {
    leave: (typeof LEAVE_REQUESTS!=='undefined'?LEAVE_REQUESTS:[]).map((r,i)=>({ id:'LV-'+(3100+i), ...r, source:'HCWOS' })),
    clock: { clockedIn:true, site:'Mwadui', since:'05:58' },
    empEdits: {},     // { [legacyNo]: { site, role, grade, status, manager } } — overrides applied over EMPLOYEES
    audit,            // append-only hash-chained ledger
    integrity: { ok:true, checked:null, brokenAt:null },
    // automated leave scheduling — HR-proposed windows that ESS users can accept,
    // chosen to draw down high balances (= leave liability) without breaking coverage.
    suggestions: [
      { id:'SUG-1', no:'TMC-04821', name:'Joseph Mlimani', site:'Mwadui', type:'Annual',
        from:'2026-07-14', to:'2026-07-22', days:7, cover:'Grace Ndaki', saves:7*72000, status:'Proposed',
        rationale:'Balance 18.5d · take 7 to stay under the 2-yr carry-over cap' },
    ],
    // Performance reviews — HCWOS (manager/HR) assigns & publishes; ESS RECEIVES the update.
    reviews: [
      { id:'PR-2001', no:'TMC-04821', name:'Joseph Mlimani', site:'Mwadui', cycle:'FY26 Mid-Year Review',
        reviewer:'Grace Ndaki', rating:4, label:'Exceeds Expectations', status:'Published', ack:false,
        summary:'Strong haul-truck output, good safety discipline. Develop mentoring of junior operators.', published:'2026-06-20' },
      { id:'PR-2002', no:'TMC-05533', name:'Fatuma Ally', site:'Nyanzaga', cycle:'FY26 Mid-Year Review',
        reviewer:'Neema Joseph', rating:3, label:'Meets Expectations', status:'Draft', ack:false, summary:'', published:null },
      { id:'PR-2003', no:'TMC-04102', name:'Samuel Mlay', site:'Dar Yard', cycle:'Q1 Performance Check-in',
        reviewer:'Rajesh Pillai', rating:4, label:'Exceeds Expectations', status:'Acknowledged', ack:true,
        summary:'Reliable supervision; ready for grade review.', published:'2026-06-12' },
    ],
    // Training tickets — ESS employee SUBMITS; HCWOS approves/schedules; ESS RECEIVES the update.
    training: [
      { id:'TR-5001', no:'TMC-03741', name:'Esther Mushi', site:'Geita Civil', course:'Defensive Driving',
        reason:'Required for site vehicle assignment', status:'Approved', source:'ESS', stage:'Manager approved · scheduling', raised:'2026-06-19' },
    ],
    // End-to-end NOTIFICATIONS — every action that needs someone flows here.
    //   to: employee number (ESS-directed) OR 'HCWOS' (console/manager-directed).
    notifications: [
      { id:'N-1', ts:'2026-06-20 09:10', to:'TMC-04821', from:'Grace Ndaki', kind:'award',
        title:'Performance review published', body:'Your FY26 Mid-Year review is ready — please read and acknowledge.', action:{tab:'perf'}, read:false },
      { id:'N-2', ts:'2026-06-21 14:02', to:'TMC-04821', from:'HR · HCWOS', kind:'doc',
        title:'Document shared by HR', body:'Your 2026 appointment addendum has been shared to My Documents.', action:{tab:'docs'}, read:false },
      { id:'N-3', ts:'2026-06-19 16:40', to:'HCWOS', from:'Esther Mushi', kind:'award',
        title:'Training request submitted', body:'Defensive Driving — awaiting manager approval.', action:{page:'training'}, read:true },
    ],
    // Documents — shared by HR (HCWOS) or uploaded by the employee (ESS).
    documents: [
      { id:'D-1', no:'TMC-04821', name:'Appointment addendum 2026', tag:'PDF', source:'HR', from:'HR · HCWOS', date:'2026-06-21', tone:'blue' },
      { id:'D-2', no:'TMC-04821', name:'Employment contract', tag:'PDF', source:'HR', from:'HR · HCWOS', date:'2021-03-02', tone:'blue' },
      { id:'D-3', no:'TMC-04821', name:'OSHA medical certificate', tag:'Valid', source:'HR', from:'Clinic', date:'2026-01-12', tone:'green' },
      { id:'D-4', no:'TMC-04821', name:'Drivers licence (scan)', tag:'Uploaded', source:'Employee', from:'You', date:'2026-05-30', tone:'grey' },
    ],
    // ISO policy read-&-sign register (per employee number → {signed,date}).
    policyAck: { 'TMC-04821': { COC:{date:'2025-03-04'}, ABC:{date:'2025-03-04'}, HRP:{date:'2025-03-05'} } },
    focusEmp: null,  // set by global search → Employees module opens that record
    essEmp: (function(){ try{ const v=localStorage.getItem('hcwos.essEmp'); return (v&&v!=='')?v:'TMC-04821'; }catch(e){ return 'TMC-04821'; } })(),
    newHires: [],  // employees created via New joiner — merged into the live roster
    // routed approval inbox — decisions clear items across HCWOS + ESS
    approvals: (typeof APPROVALS!=='undefined'?APPROVALS:[]).map(a=>({ ...a, status:'Pending' })),
    // per-employee ESS activity feed — records the EMPLOYEE's own clicks & actions (newest first)
    activity: { 'TMC-04821': [
      { label:'Leave approved · 5 days', tone:'green', kind:'calendar', ts: Date.now()-2*86400000 },
      { label:'Payslip available · May', tone:'blue',  kind:'money',    ts: new Date('2026-05-28T09:00:00').getTime() },
      { label:'Signed policy · Code of Conduct', tone:'green', kind:'shield', ts: new Date('2026-03-04T08:30:00').getTime() },
    ] },
    // per-employee disciplinary register — issued from HCWOS, surfaced on the employee record + ESS
    disciplinary: {},
    // per-employee profile state — photo + completeness (gates ESS self-service until confirmed)
    profiles: { 'TMC-04821': { photo:null, confirmedAt:'2026-01-15' } },
    // self-service change requests (ESS → HR approval → write-back to the record)
    changeRequests: [],
    profileEdits: {},   // { [no]: { phone, email, address, ... } } approved write-backs over the record
    // IT / Security & Access — per-employee system access (maker = HR, checker = IT)
    access: {
      'TMC-05011': { level:'hcmos+ess', status:'active', checker:'Rajesh Pillai', role:'IT Administrator' },
      'TMC-03190': { level:'hcmos+ess', status:'active', checker:'Rajesh Pillai', role:'Supervisor / Team Leader' },
      'TMC-05290': { level:'hcmos+ess', status:'active', checker:'Rajesh Pillai', role:'Project HR Officer' },
      'TMC-04821': { level:'ess', status:'active', checker:'Rajesh Pillai' },
      'TMC-04455': { level:'ess', status:'active' }, 'TMC-05533': { level:'ess', status:'active' }
    },
    // Company assets assigned to employees — lifecycle tracked, replacement advised
    assets: [
      { id:'AST-1', no:'TMC-04821', name:'Site radio · Motorola', type:'Comms',   serial:'MR-4821', issued:'2024-03-02', lifespanMonths:36, status:'In service' },
      { id:'AST-2', no:'TMC-05011', name:'Laptop · Dell Latitude', type:'IT',      serial:'DL-5011', issued:'2021-08-01', lifespanMonths:48, status:'In service' },
      { id:'AST-3', no:'TMC-04821', name:'PPE kit · Class 2',      type:'PPE',     serial:'PPE-4821',issued:'2025-11-01', lifespanMonths:12, status:'In service' }
    ],
    // 24/7 support tickets — raised from HCMOS or ESS, resolution tracked end-to-end
    tickets: [
      { id:'TK-1', by:'Joseph Mlimani', no:'TMC-04821', channel:'ESS', subject:'May payslip not visible', detail:'My May payslip is not showing in the app.', priority:'Normal', status:'In progress', ts:'2026-06-22 09:10', afterHours:false,
        updates:[ {ts:'2026-06-22 09:10', by:'System', note:'Logged · IT support notified'}, {ts:'2026-06-22 11:30', by:'IT Support', note:'Investigating payroll sync — ETA today'} ] }
    ],
  };
  let seq = audit.length;
  let sugSeq = 1;
  let revSeq = 2003;
  let trnSeq = 5001;
  let notifSeq = 3;
  let docSeq = 4;
  let discSeq = 0;
  let astSeq = 3;
  let tktSeq = 1;

  // ── PERSISTENCE: rehydrate from localStorage, snapshot on every change ──
  const PKEY = 'hcwos.state.v1';
  const PERSIST_KEYS = ['leave','empEdits','audit','integrity','suggestions','reviews','training',
    'notifications','documents','policyAck','newHires','essEmp','clock','approvals','activity','disciplinary','profiles','changeRequests','profileEdits','access','assets','tickets'];
  const maxIdNum = (arr,re) => arr.reduce((m,x)=>{ const n=parseInt(String(x.id||'').replace(re,'')); return n>m?n:m; },0);
  try{
    const saved = JSON.parse(localStorage.getItem(PKEY)||'null');
    if(saved && typeof saved==='object'){
      PERSIST_KEYS.forEach(k=>{ if(saved[k]!==undefined) state[k]=saved[k]; });
      if(state.audit && state.audit.length){ const last=state.audit[state.audit.length-1]; prevHash=last.hash; seq=last.seq; }
      sugSeq  = Math.max(sugSeq,  maxIdNum(state.suggestions||[], /\D/g));
      revSeq  = Math.max(revSeq,  maxIdNum(state.reviews||[], /\D/g));
      trnSeq  = Math.max(trnSeq,  maxIdNum(state.training||[], /\D/g));
      notifSeq= Math.max(notifSeq,maxIdNum(state.notifications||[], /\D/g));
      docSeq  = Math.max(docSeq,  maxIdNum(state.documents||[], /\D/g));
      discSeq = Object.values(state.disciplinary||{}).reduce((a,arr)=>a+(arr?arr.length:0),0);
      astSeq  = Math.max(astSeq,  maxIdNum(state.assets||[], /\D/g));
      tktSeq  = Math.max(tktSeq,  maxIdNum(state.tickets||[], /\D/g));
      nextId  = Math.max(nextId,  maxIdNum(state.leave||[], /\D/g)+1, 4000);
    }
  }catch(e){}
  function persist(){ try{ const o={}; PERSIST_KEYS.forEach(k=>o[k]=state[k]); localStorage.setItem(PKEY, JSON.stringify(o)); }catch(e){} }

  const listeners = new Set();
  const emit = () => { persist(); listeners.forEach(fn=>fn()); };

  // ── CROSS-DEVICE SYNC: a change in any other tab/window/device rehydrates this one ──
  // The store is the single source of truth; every surface (HCMOS + ESS) sees the same record.
  let crSeq = 0;
  window.addEventListener('storage', function(ev){
    if(ev.key!==PKEY || !ev.newValue) return;
    try{ const saved = JSON.parse(ev.newValue);
      if(saved && typeof saved==='object'){
        PERSIST_KEYS.forEach(k=>{ if(saved[k]!==undefined) state[k]=saved[k]; });
        if(state.audit && state.audit.length){ const last=state.audit[state.audit.length-1]; prevHash=last.hash; seq=last.seq; }
        listeners.forEach(fn=>fn());
      }
    }catch(e){}
  });

  function now(){ const d=new Date(); const p=n=>String(n).padStart(2,'0');
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }

  // append a new event onto the chain
  function log({ actor, role, action, entity, entityId, subject, reason, changes }){
    const entry = { seq:++seq, ts:now(), actor, role, action, entity, entityId, subject, reason:reason||'', changes:changes||[], prevHash };
    entry.hash = hashEntry(prevHash, entry);
    prevHash = entry.hash;
    state.audit = [...state.audit, entry];
    return entry;
  }

  // re-hash the whole chain and find the first broken link
  function verify(){
    let ph='GENESIS', brokenAt=null;
    for(const e of state.audit){
      const expect = hashEntry(ph, e);
      if(e.prevHash!==ph || e.hash!==expect){ brokenAt=e.seq; break; }
      ph=e.hash;
    }
    state.integrity = { ok:brokenAt===null, checked:now(), brokenAt };
    emit();
    return state.integrity;
  }

  const SITE_OF = { 'Mwadui':'Grace Ndaki','Nyanzaga':'Neema Joseph','Dar Yard':'Samuel Mlay','North Mara':'Samuel Mlay','Geita Civil':'Samuel Mlay' };

  // push a notification (does not emit by itself — callers emit)
  function pushNotif({ to, from, kind='bell', title, body, action }){
    const n = { id:'N-'+(++notifSeq), ts:now(), to, from, kind, title, body, action:action||null, read:false };
    state.notifications = [n, ...state.notifications];
    return n;
  }

  // record an ESS activity for one employee (does not emit by itself — callers emit).
  // de-dupes rapid identical repeats so a double-tap doesn't spam the feed.
  function pushActivity(no, label, tone='mut', kind='nav'){
    if(!no || !label) return;
    const list = state.activity[no] ? [...state.activity[no]] : [];
    const top = list[0];
    if(top && top.label===label && (Date.now()-top.ts)<4000) return;
    list.unshift({ label, tone, kind, ts: Date.now() });
    state.activity = { ...state.activity, [no]: list.slice(0,40) };
  }

  const HStore = {
    get: () => state,
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },

    // merged employee list: new hires + base record + any recorded edits + every role-holder
    // (rule: a backend/ESS user is an employee first — so all roles appear in the roster)
    employees: () => {
      const base = [ ...state.newHires, ...(typeof EMPLOYEES!=='undefined'?EMPLOYEES:[]).map(e => ({ ...e, ...(state.empEdits[e.no]||{}) })) ];
      const names = new Set(base.map(e=>e.name));
      const roleEmps = (typeof ROLES!=='undefined'?ROLES:[]).filter(r=>!names.has(r.name) && window.roleSelfRecord)
        .map(r=>{ const rec=roleSelfRecord(r); return { ...rec, ...(state.empEdits[rec.no]||{}) }; });
      return [ ...base, ...roleEmps ];
    },
    employee: (no) => { const nh=state.newHires.find(e=>e.no===no); if(nh) return nh;
      const b=(typeof EMPLOYEES!=='undefined'?EMPLOYEES:[]).find(e=>e.no===no); if(b) return {...b,...(state.empEdits[no]||{})};
      const r=(typeof ROLES!=='undefined'&&window.roleSelfRecord)?ROLES.map(roleSelfRecord).find(x=>x.no===no):null;
      return r?{...r,...(state.empEdits[no]||{})}:null; },
    addEmployee: (emp, actor='Ali Mbaruk', role='HR Officer') => {
      state.newHires = [emp, ...state.newHires];
      log({ actor, role, action:'Create', entity:'Employee', entityId:window.genEmpNo?window.genEmpNo(emp):emp.no, subject:emp.name,
        reason:`New joiner onboarded · ${emp.role} · ${emp.site}`, changes:[{field:'Record',before:'—',after:'Created'}] });
      pushNotif({ to:'HCWOS', from:actor, kind:'users', title:'New joiner onboarded',
        body:`${emp.name} (${emp.role}, ${emp.site}) added to the roster.`, action:{page:'employees'} });
      emit(); window.toast(`${emp.name} onboarded · record created`, 'check');
    },

    addLeave: (req) => { const id='LV-'+(nextId++);
      state.leave = [{ id, status:'Pending', source:'ESS', ...req }, ...state.leave];
      pushActivity(req.no, `Applied for ${req.type||'Annual'} leave · ${req.days} days`, 'yellow', 'calendar');
      log({ actor:req.who, role:'Employee (ESS)', action:'Submit', entity:'Leave', entityId:id, subject:req.who,
        reason:`${req.type||'Annual'} leave request · ${req.days} days${req.approverName?' · to '+req.approverName:''}`,
        changes:[{field:'Status',before:'—',after:'Pending approval'}] });
      // route to the approver: their HCWOS console + their ESS inbox
      pushNotif({ to:'HCWOS', from:req.who, kind:'calendar', title:'Leave request — approval needed',
        body:`${req.who} · ${req.type||'Annual'} ${req.days}d (${(req.from||'').slice(5)}→${(req.to||'').slice(5)})${req.approverName?' · routed to '+req.approverName:''}.`, action:{page:'approvals'} });
      if(req.approverNo) pushNotif({ to:req.approverNo, from:req.who, kind:'calendar', title:'Leave awaiting your approval',
        body:`${req.who} requested ${req.type||'Annual'} leave (${req.days} days). Approve or decline.`, action:{tab:'approvals'} });
      emit();
      window.toast(`Leave request sent${req.approverName?' to '+req.approverName:' to HR'} · ${req.days} days`, 'swap'); },
    setLeaveStatus: (id, status, actor='Ali Mbaruk', role='CEO') => {
      const r = state.leave.find(x=>x.id===id);
      state.leave = state.leave.map(x=>x.id===id?{...x,status}:x);
      log({ actor, role, action:status==='Approved'?'Approve':'Reject', entity:'Leave', entityId:id, subject:r&&r.who,
        reason:status==='Approved'?'Approved — entitlement & cover confirmed':'Rejected — coverage conflict',
        changes:[{field:'Status', before:r?r.status:'Pending', after:status}] });
      if(r) pushNotif({ to:r.no, from:actor, kind:'calendar', title:`Leave ${status.toLowerCase()}`,
        body:`Your ${r.type} leave (${r.from.slice(5)}→${r.to.slice(5)}) was ${status.toLowerCase()}.`, action:{tab:'leave'} });
      // the request has been worked — clear it from approver inboxes
      if(r) state.notifications = state.notifications.map(n=>(n.from===r.who && /Leave/.test(n.title) && !n.read)?{...n,read:true}:n);
      emit();
      window.toast(`Request ${status.toLowerCase()} · logged to audit trail`, status==='Approved'?'check':'x'); },

    // ── EMPLOYEE TRANSFER (validated upstream in the UI) ──
    transfer: ({ emp, toSite, toRole, toGrade, effective, reason, actor, role }) => {
      const cur = HStore.employee(emp.no) || emp;
      const changes = [];
      if(toSite && toSite!==cur.site) changes.push({ field:'Site', before:cur.site, after:toSite });
      if(toRole && toRole!==cur.role) changes.push({ field:'Position', before:cur.role, after:toRole });
      if(toGrade && toGrade!==cur.grade) changes.push({ field:'Grade', before:cur.grade, after:toGrade });
      const newMgr = SITE_OF[toSite||cur.site];
      const curMgr = SITE_OF[cur.site];
      if(toSite && toSite!==cur.site && newMgr!==curMgr) changes.push({ field:'Line manager', before:curMgr, after:newMgr });
      if(!changes.length) return { ok:false, error:'No change to record.' };

      state.empEdits = { ...state.empEdits, [emp.no]: { ...(state.empEdits[emp.no]||{}),
        ...(toSite?{site:toSite, manager:newMgr}:{}), ...(toRole?{role:toRole}:{}), ...(toGrade?{grade:toGrade}:{}) } };
      log({ actor, role, action:'Transfer', entity:'Employee', entityId:window.genEmpNo?window.genEmpNo(cur):cur.no, subject:cur.name,
        reason:`${reason}  ·  effective ${effective}`, changes });
      pushNotif({ to:cur.no, from:actor, kind:'swap', title:'You have been transferred',
        body:`${changes.map(c=>c.field+': '+c.after).join(' · ')} (effective ${effective}).`, action:{tab:'profile'} });
      emit();
      window.toast(`${cur.name} transferred · recorded to audit trail`, 'swap');
      return { ok:true, changes };
    },

    verify,
    reset: () => { try{ localStorage.removeItem(PKEY); }catch(e){} location.reload(); },
    // live organisation metrics — ripple new hires / leave into every KPI
    metrics: () => {
      const baseHC = (typeof TOTAL_HC!=='undefined'?TOTAL_HC:0);
      const baseOnLeave = (typeof TOTAL_ONLEAVE!=='undefined'?TOTAL_ONLEAVE:0);
      const headcount = baseHC + state.newHires.length;
      const pendingLeave = state.leave.filter(l=>l.status==='Pending'||l.status==='Flagged').length;
      const approvedLeave = state.leave.filter(l=>l.status==='Approved').length;
      const pendingApprovals = state.approvals.filter(a=>a.status==='Pending').length + pendingLeave;
      return { headcount, onLeave: baseOnLeave, pendingLeave, approvedLeave, pendingApprovals, newHires: state.newHires.length };
    },
    // decide a non-leave approval (advances/clears) — logged + notifies requester
    decide: (id, decision, actor='Ali Mbaruk', role='Approver') => {
      const a = state.approvals.find(x=>x.id===id); if(!a) return;
      state.approvals = state.approvals.map(x=>x.id===id?{...x,status:decision}:x);
      log({ actor, role, action:decision==='Approved'?'Approve':'Reject', entity:'Approval', entityId:id, subject:a.who,
        reason:`${(typeof APPROVAL_LABELS!=='undefined'&&APPROVAL_LABELS[a.type])||a.type}: ${a.detail}`,
        changes:[{field:'Status',before:'Pending',after:decision}] });
      pushNotif({ to:'HCWOS', from:actor, kind:'check', title:`${(typeof APPROVAL_LABELS!=='undefined'&&APPROVAL_LABELS[a.type])||a.type} ${decision.toLowerCase()}`,
        body:`${a.who} · ${a.detail} — ${decision.toLowerCase()} by ${actor}.`, action:{page:'approvals'} });
      emit(); window.toast(`${decision} · ${a.who}`, decision==='Approved'?'check':'x');
    },
    focusEmployee: (no) => { state.focusEmp = no; emit(); },
    clearFocus: () => { state.focusEmp = null; },
    // ── PROFILE: photo + completeness gate ──
    profilePhoto: (no) => (state.profiles[no]||{}).photo || null,
    profileComplete: (no) => !!((state.profiles[no]||{}).confirmedAt),
    setProfilePhoto: (no, dataURL, actor) => {
      const cur = state.profiles[no] || {};
      state.profiles = { ...state.profiles, [no]: { ...cur, photo:dataURL, confirmedAt: cur.confirmedAt || now().slice(0,10) } };
      const e = HStore.employee(no);
      log({ actor: actor || (e?e.name:'Employee'), role:'Employee (ESS)', action:'Update', entity:'Employee',
        entityId:(window.genEmpNo&&e)?window.genEmpNo(e):no, subject:e?e.name:no,
        reason:'Profile photo updated', changes:[{field:'Profile photo',before:'—',after:'Updated'}] });
      pushActivity(no, 'Updated profile photo', 'green', 'users');
      emit(); window.toast('Profile photo updated', 'check');
    },
    profileEditsOf: (no) => state.profileEdits[no] || {},
    // ── IT: ACCESS (maker-checker) · SUSPEND · ASSETS · SUPPORT ──
    accessOf: (no) => state.access[no] || { level:'ess', status:'active' },
    essBlocked: (no) => { const a=state.access[no]; const e=HStore.employee(no);
      return !!((a && (a.level==='none' || a.suspended)) || (e && e.status==='Suspended')); },
    requestAccess: ({ no, name, level, role, actor='Ali Mbaruk', actorRole='HR Officer' }) => {
      const e=HStore.employee(no);
      if(e && e.status!=='Active'){ window.toast('Only active employees can be granted access','x'); return; }
      state.access = { ...state.access, [no]:{ level, status:'pending', role, maker:actor } };
      log({ actor, role:actorRole, action:'Submit', entity:'Access', entityId:no, subject:name,
        reason:`Requested ${level==='hcmos+ess'?'HCMOS + ESS':'ESS only'} access${role?' · role '+role:''} — awaiting IT approval`, changes:[{field:'Access',before:'—',after:level}] });
      pushNotif({ to:'HCWOS', from:actor, kind:'lock', title:'Access request — IT approval', body:`${name}: ${level==='hcmos+ess'?'HCMOS + ESS':'ESS only'} access requested.`, action:{page:'admin'} });
      emit(); window.toast('Access request sent to IT (checker)','swap');
    },
    decideAccess: (no, decision, actor='Rajesh Pillai', role='IT Administrator') => {
      const a=state.access[no]; if(!a) return; const e=HStore.employee(no);
      state.access = { ...state.access, [no]:{ ...a, status:decision==='Approved'?'active':'rejected', checker:actor, ...(decision!=='Approved'?{level:'none'}:{}) } };
      log({ actor, role, action:decision==='Approved'?'Approve':'Reject', entity:'Access', entityId:no, subject:e?e.name:no, reason:`Access ${decision.toLowerCase()} by IT`, changes:[{field:'Access status',before:'Pending',after:decision}] });
      if(e) pushNotif({ to:no, from:actor, kind:'lock', title:`System access ${decision.toLowerCase()}`, body:`IT ${decision.toLowerCase()} your access request.`, action:{tab:'home'} });
      emit(); window.toast(`Access ${decision.toLowerCase()} · ${e?e.name:no}`, decision==='Approved'?'check':'x');
    },
    setAccessLevel: (no, level, actor='Rajesh Pillai', role='IT Administrator') => {
      const e=HStore.employee(no), prev=(state.access[no]||{}).level||'—';
      state.access = { ...state.access, [no]:{ level, status:'active', checker:actor } };
      log({ actor, role, action:'Update', entity:'Access', entityId:no, subject:e?e.name:no, reason:`Access set to ${level}`, changes:[{field:'Access',before:prev,after:level}] });
      emit(); window.toast('Access updated','check');
    },
    suspendEmployee: ({ no, reason, actor='Omid Karembeck', role='Head of HR' }) => {
      const e=HStore.employee(no); if(!e) return;
      state.empEdits = { ...state.empEdits, [no]:{ ...(state.empEdits[no]||{}), status:'Suspended' } };
      state.access  = { ...state.access,  [no]:{ ...(state.access[no]||{level:'ess'}), suspended:true } };
      state.assets  = state.assets.map(as=>as.no===no?{...as,status:'Recover'}:as);
      log({ actor, role, action:'Suspend', entity:'Employee', entityId:(window.genEmpNo?window.genEmpNo(e):no), subject:e.name,
        reason:`Suspended — ${reason||'pending review'} · ESS access blocked · IT asset recovery raised`, changes:[{field:'Status',before:e.status,after:'Suspended'}] });
      pushNotif({ to:no, from:actor, kind:'alert', title:'Account suspended', body:'Your ESS access has been suspended. Please contact HR.', action:{tab:'home'} });
      pushNotif({ to:'HCWOS', from:actor, kind:'alert', title:'Employee suspended', body:`${e.name} suspended — ESS blocked. IT to recover assigned assets.`, action:{page:'admin'} });
      pushActivity(no, 'Account suspended', 'red', 'alert');
      emit(); window.toast(`${e.name} suspended · ESS blocked · IT notified`, 'alert');
    },
    reinstateEmployee: ({ no, actor='Omid Karembeck', role='Head of HR' }) => {
      const e=HStore.employee(no); if(!e) return;
      state.empEdits = { ...state.empEdits, [no]:{ ...(state.empEdits[no]||{}), status:'Active' } };
      const a=state.access[no]||{level:'ess'}; const na={...a}; delete na.suspended; state.access={ ...state.access, [no]:na };
      log({ actor, role, action:'Update', entity:'Employee', entityId:(window.genEmpNo?window.genEmpNo(e):no), subject:e.name, reason:'Reinstated — ESS access restored', changes:[{field:'Status',before:'Suspended',after:'Active'}] });
      pushNotif({ to:no, from:actor, kind:'check', title:'Account reinstated', body:'Your ESS access has been restored.', action:{tab:'home'} });
      emit(); window.toast(`${e.name} reinstated`, 'check');
    },
    assetsOf: (no) => state.assets.filter(a=>a.no===no),
    assetDue: (a) => { try{ const m=(Date.now()-new Date(a.issued).getTime())/(1000*60*60*24*30.44); return m >= (a.lifespanMonths||36); }catch(e){ return false; } },
    assignAsset: ({ no, name, type, serial, lifespanMonths, actor='Rajesh Pillai', role='IT Administrator' }) => {
      const e=HStore.employee(no), id='AST-'+(++astSeq);
      state.assets = [{ id, no, name, type:type||'Device', serial:serial||('SN-'+id), issued:now().slice(0,10), lifespanMonths:lifespanMonths||36, status:'In service' }, ...state.assets];
      log({ actor, role, action:'Create', entity:'Asset', entityId:id, subject:e?e.name:no, reason:`Assigned ${name} (${serial||id})`, changes:[{field:'Asset',before:'—',after:name}] });
      pushNotif({ to:'HCWOS', from:actor, kind:'briefcase', title:'Asset assigned', body:`${name} → ${e?e.name:no}.`, action:{page:'admin'} });
      emit(); window.toast(`Asset assigned · ${name}`,'briefcase');
    },
    updateAsset: (id, status, actor='Rajesh Pillai', role='IT Administrator') => {
      const as=state.assets.find(x=>x.id===id); if(!as) return;
      state.assets = state.assets.map(x=>x.id===id?{...x,status}:x);
      log({ actor, role, action:'Update', entity:'Asset', entityId:id, subject:as.name, reason:`Asset ${status}`, changes:[{field:'Status',before:as.status,after:status}] });
      emit(); window.toast(`Asset ${status.toLowerCase()}`,'check');
    },
    submitTicket: ({ by, no, channel='ESS', subject, detail, priority='Normal', afterHours=false }) => {
      const id='TK-'+(++tktSeq);
      state.tickets = [{ id, by, no:no||null, channel, subject, detail:detail||'', priority, status:'Open', ts:now(), afterHours,
        updates:[{ ts:now(), by: afterHours?'After-hours AI':'System', note: afterHours?'Captured after-hours · triaged & routed to IT support queue':'Logged · IT support notified' }] }, ...state.tickets];
      pushNotif({ to:'HCWOS', from:by, kind:'phone', title:'Support ticket '+id, body:`${subject} · ${priority}${afterHours?' · after-hours':''}`, action:{page:'admin'} });
      if(no) pushActivity(no, `Raised support ticket ${id}`, 'blue', 'phone');
      emit(); window.toast(`Ticket ${id} submitted`,'check'); return id;
    },
    updateTicket: (id, status, note, actor='IT Support') => {
      const t=state.tickets.find(x=>x.id===id); if(!t) return;
      state.tickets = state.tickets.map(x=>x.id===id?{...x,status,updates:[...x.updates,{ts:now(),by:actor,note:note||status}]}:x);
      if(t.no) pushNotif({ to:t.no, from:actor, kind:'phone', title:`Ticket ${id} ${status.toLowerCase()}`, body:note||`Your ticket is now ${status.toLowerCase()}.`, action:{tab:'support'} });
      emit(); window.toast(`Ticket ${id} · ${status}`,'check');
    },
    ticketsFor: (no) => state.tickets.filter(t=>t.no===no),
    // end-to-end user administration — assign a system role (auto-maps access), or de-provision
    assignUserRole: ({ no, roleId, actor='Rajesh Pillai' }) => {
      const r=(typeof ROLES!=='undefined')?ROLES.find(x=>x.id===roleId):null; const level= roleId==='employee'?'ess':'hcmos+ess'; const e=HStore.employee(no);
      state.access = { ...state.access, [no]:{ level, status:'active', role:r?r.title:roleId, checker:actor } };
      log({ actor, role:'IT Administrator', action:'Update', entity:'Access', entityId:no, subject:e?e.name:no,
        reason:`Role mapped to ${r?r.title:roleId} · auto-access ${level==='hcmos+ess'?'HCMOS + ESS':'ESS only'}`, changes:[{field:'Role',before:'—',after:r?r.title:roleId}] });
      emit(); window.toast(`Role assigned · ${r?r.title:roleId}`,'check');
    },
    deleteUser: ({ no, actor='Rajesh Pillai' }) => {
      const e=HStore.employee(no);
      state.access = { ...state.access, [no]:{ level:'none', status:'deactivated', checker:actor } };
      state.assets = state.assets.map(a=>a.no===no?{...a,status:'Recover'}:a);
      log({ actor, role:'IT Administrator', action:'Reject', entity:'Access', entityId:no, subject:e?e.name:no,
        reason:'User de-provisioned · access revoked · assets flagged for recovery', changes:[{field:'Account',before:'Active',after:'De-provisioned'}] });
      pushNotif({ to:'HCWOS', from:actor, kind:'lock', title:'User de-provisioned', body:`${e?e.name:no} account removed by IT.`, action:{page:'admin'} });
      emit(); window.toast('User de-provisioned','x');
    },
    requestProfileChange: ({ no, name, field, label, from, to }) => {
      const id = 'CR-'+(++crSeq)+'-'+Date.now().toString().slice(-4);
      state.changeRequests = [{ id, no, name, field, label, from, to, status:'Pending', ts: now() }, ...state.changeRequests];
      log({ actor:name, role:'Employee (ESS)', action:'Submit', entity:'Change request', entityId:id, subject:name,
        reason:`Requested ${label} change: “${from}” → “${to}”`, changes:[{field:label, before:from, after:to}] });
      pushNotif({ to:'HCWOS', from:name, kind:'users', title:'Profile change request',
        body:`${name} requested a ${label} update — approve or decline.`, action:{page:'employees'} });
      pushActivity(no, `Requested ${label} change`, 'blue', 'users');
      emit(); window.toast('Change request sent to HR', 'swap');
    },
    decideProfileChange: (id, decision, actor='Ali Mbaruk', role='HR Officer') => {
      const cr = state.changeRequests.find(x=>x.id===id); if(!cr) return;
      state.changeRequests = state.changeRequests.map(x=>x.id===id?{...x,status:decision}:x);
      if(decision==='Approved'){
        state.profileEdits = { ...state.profileEdits, [cr.no]: { ...(state.profileEdits[cr.no]||{}), [cr.field]: cr.to } };
      }
      log({ actor, role, action:decision==='Approved'?'Approve':'Reject', entity:'Change request', entityId:id, subject:cr.name,
        reason:`${cr.label}: “${cr.from}” → “${cr.to}” ${decision.toLowerCase()}`,
        changes:[{field:cr.label, before:cr.from, after:decision==='Approved'?cr.to:cr.from}] });
      pushNotif({ to:cr.no, from:actor, kind:'users', title:`Profile change ${decision.toLowerCase()}`,
        body:`Your ${cr.label} update was ${decision.toLowerCase()}${decision==='Approved'?' — record updated.':'.'}`, action:{tab:'profile'} });
      emit(); window.toast(`Change ${decision.toLowerCase()} · ${cr.name}`, decision==='Approved'?'check':'x');
    },
    completeProfile: (no, actor) => {
      const cur = state.profiles[no] || {};
      if(cur.confirmedAt) return;
      state.profiles = { ...state.profiles, [no]: { ...cur, confirmedAt: now().slice(0,10) } };
      const e = HStore.employee(no);
      log({ actor: actor || (e?e.name:'Employee'), role:'Employee (ESS)', action:'Update', entity:'Employee',
        entityId:(window.genEmpNo&&e)?window.genEmpNo(e):no, subject:e?e.name:no,
        reason:'Profile reviewed & confirmed — record completed', changes:[{field:'Profile',before:'Incomplete',after:'Confirmed'}] });
      pushNotif({ to:'HCWOS', from:e?e.name:no, kind:'users', title:'Profile completed',
        body:`${e?e.name:no} confirmed their profile — self-service unlocked.`, action:{page:'employees'} });
      pushActivity(no, 'Confirmed profile details', 'green', 'users');
      emit(); window.toast('Profile confirmed · self-service unlocked', 'check');
    },
    // public audit hook — any module records a user/system action onto the hash-chained ledger
    record: ({ actor, role, action, entity, entityId, subject, reason, changes }) => {
      log({ actor, role, action, entity, entityId, subject, reason, changes }); emit();
    },
    // ESS activity feed — ESS calls this on the user's own clicks / section opens
    logActivity: ({ no, label, tone='mut', kind='nav' }) => { pushActivity(no, label, tone, kind); emit(); },
    setEssEmp: (no) => { state.essEmp = no; try{ localStorage.setItem('hcwos.essEmp',no); }catch(e){} emit(); },
    // ── AUTOMATED LEAVE SCHEDULING ──
    DAILY_RATE: 72000,
    propose: ({ no, name, site, type='Annual', from, to, days, cover, saves, rationale, actor='Leave Auto-Planner', role='System' }) => {
      if(state.suggestions.some(s=>s.no===no && s.from===from && s.status==='Proposed')) return { ok:false };
      const id = 'SUG-'+(++sugSeq);
      state.suggestions = [{ id, no, name, site, type, from, to, days, cover, saves, rationale, status:'Proposed' }, ...state.suggestions];
      log({ actor, role, action:'Schedule', entity:'Leave', entityId:id, subject:name,
        reason:`Auto-scheduled ${days}d (${from}→${to}) · proposed to employee · saves ~TZS ${saves.toLocaleString()}`,
        changes:[{ field:'Suggestion', before:'—', after:`${type} ${from}→${to}` }] });
      emit();
      window.toast(`Leave window proposed to ${name}`, 'calendar');
      return { ok:true, id };
    },
    acceptSuggestion: (id) => {
      const s = state.suggestions.find(x=>x.id===id); if(!s) return;
      state.suggestions = state.suggestions.map(x=>x.id===id?{...x,status:'Accepted'}:x);
      pushActivity(s.no, `Accepted suggested leave · ${s.days} days`, 'green', 'calendar');
      state.leave = [{ id:'LV-'+(nextId++), who:s.name, no:s.no, site:s.site, type:s.type,
        from:s.from, to:s.to, days:s.days, cover:true, status:'Pending', source:'ESS · auto-plan' }, ...state.leave];
      log({ actor:s.name, role:'Employee (ESS)', action:'Schedule', entity:'Leave', entityId:id, subject:s.name,
        reason:`Accepted suggested window ${s.from}→${s.to} · liability ↓ ~TZS ${s.saves.toLocaleString()}`,
        changes:[{ field:'Status', before:'Proposed', after:'Accepted — request raised' }] });
      pushNotif({ to:'HCWOS', from:s.name, kind:'calendar', title:'Suggested leave accepted',
        body:`${s.name} accepted the auto-scheduled window ${s.from.slice(5)}→${s.to.slice(5)}.`, action:{page:'leave'} });
      emit();
      window.toast('Suggested leave accepted · request sent to HR', 'check');
    },
    dismissSuggestion: (id) => {
      state.suggestions = state.suggestions.map(x=>x.id===id?{...x,status:'Dismissed'}:x);
      emit();
      window.toast('Suggestion dismissed', 'x');
    },

    // ── PERFORMANCE REVIEWS (HCWOS → ESS) ──
    assignReview: ({ no, name, site, cycle, reviewer, actor='Ali Mbaruk', role='HR Officer' }) => {
      const id = 'PR-'+(++revSeq);
      state.reviews = [{ id, no, name, site, cycle, reviewer, rating:null, label:'', status:'Draft', ack:false, summary:'', published:null }, ...state.reviews];
      log({ actor, role, action:'Review', entity:'Performance', entityId:id, subject:name,
        reason:`${cycle} review assigned · reviewer ${reviewer}`, changes:[{field:'Review',before:'—',after:'Draft created'}] });
      emit(); window.toast(`Review drafted for ${name}`, 'award'); return id;
    },
    setReviewRating: (id, rating, label, summary) => {
      state.reviews = state.reviews.map(r=>r.id===id?{...r,rating,label,summary:summary??r.summary}:r); emit();
    },
    publishReview: (id, actor='Grace Ndaki', role='Supervisor') => {
      const r = state.reviews.find(x=>x.id===id); if(!r) return;
      state.reviews = state.reviews.map(x=>x.id===id?{...x,status:'Published',published:now().slice(0,10)}:x);
      log({ actor, role, action:'Review', entity:'Performance', entityId:id, subject:r.name,
        reason:`${r.cycle} review published to ESS · rating ${r.rating??'—'}`,
        changes:[{field:'Status',before:r.status,after:'Published — visible in ESS'}] });
      pushNotif({ to:r.no, from:actor, kind:'award', title:'Performance review published',
        body:`Your ${r.cycle} review is ready — read and acknowledge.`, action:{tab:'perf'} });
      emit(); window.toast(`Review published · ${r.name} notified in ESS`, 'swap');
    },
    acknowledgeReview: (id) => {
      const r = state.reviews.find(x=>x.id===id); if(!r) return;
      state.reviews = state.reviews.map(x=>x.id===id?{...x,status:'Acknowledged',ack:true}:x);
      pushActivity(r.no, `Acknowledged ${r.cycle}`, 'blue', 'award');
      log({ actor:r.name, role:'Employee (ESS)', action:'Review', entity:'Performance', entityId:id, subject:r.name,
        reason:`Acknowledged ${r.cycle} review in ESS`, changes:[{field:'Status',before:'Published',after:'Acknowledged'}] });
      emit(); window.toast('Review acknowledged · synced to HCWOS', 'check');
    },

    // ── TRAINING TICKETS (ESS → HCWOS → ESS) ──
    submitTraining: ({ no, name, site, course, reason }) => {
      const id = 'TR-'+(++trnSeq);
      state.training = [{ id, no, name, site, course, reason, status:'Pending', source:'ESS', stage:'Awaiting line-manager approval', raised:now().slice(0,10) }, ...state.training];
      pushActivity(no, `Requested training · ${course}`, 'blue', 'award');
      log({ actor:name, role:'Employee (ESS)', action:'Training', entity:'Training', entityId:id, subject:name,
        reason:`Training request: ${course}`, changes:[{field:'Ticket',before:'—',after:'Submitted'}] });
      pushNotif({ to:'HCWOS', from:name, kind:'award', title:'Training request submitted',
        body:`${name} requested ${course} — awaiting approval.`, action:{page:'training'} });
      emit(); window.toast('Training request sent to your manager', 'award'); return id;
    },
    updateTraining: (id, status, actor='Ali Mbaruk', role='HR Officer') => {
      const t = state.training.find(x=>x.id===id); if(!t) return;
      const stageMap = { Approved:'Manager approved · scheduling', Scheduled:'Seat booked · date confirmed', Completed:'Completed · certificate on file', Rejected:'Declined — see notes' };
      state.training = state.training.map(x=>x.id===id?{...x,status,stage:stageMap[status]||x.stage}:x);
      log({ actor, role, action:'Training', entity:'Training', entityId:id, subject:t.name,
        reason:`Training ${t.course} → ${status} · synced to ESS`, changes:[{field:'Status',before:t.status,after:status}] });
      pushNotif({ to:t.no, from:actor, kind:'award', title:`Training ${status.toLowerCase()}`,
        body:`Your ${t.course} request is now ${status.toLowerCase()}.`, action:{tab:'training'} });
      emit(); window.toast(`Training ${status.toLowerCase()} · ${t.name} notified in ESS`, status==='Rejected'?'x':'check');
    },
    toggleClock: () => { const c=state.clock; state.clock = { ...c, clockedIn:!c.clockedIn,
      since: !c.clockedIn? new Date().toTimeString().slice(0,5):c.since }; 
      pushActivity(state.essEmp, state.clock.clockedIn?`Clocked in · ${state.clock.site}`:'Clocked out', state.clock.clockedIn?'green':'mut', 'clock');
      emit();
      window.toast(state.clock.clockedIn?'Clocked in · synced to HCWOS':'Clocked out · synced to HCWOS','clock'); },

    // ── DISCIPLINARY (employee pre-populated from profile) ──
    // Issuing a warning fans out across every workflow: it lands on the employee record,
    // generates the letter into ESS My Documents, notifies the employee + line manager + HR,
    // logs to the audit trail, and (for a suspension) flips employment status — all atomically.
    recordDisciplinary: ({ no, name, type, note, date, actor='Ali Mbaruk', role='HR Officer' }) => {
      const emp = HStore.employee(no);
      const site = emp ? emp.site : '';
      const mgr = SITE_OF[site] || 'Omid Karembeck';
      const when = date || now().slice(0,10);
      const entId = (window.genEmpNo && emp) ? window.genEmpNo(emp) : no;

      // 1) employee disciplinary register (shows on the employee record)
      const rec = { id:'DISC-'+(++discSeq), date:when, type, note:note||'', by:actor, ack:false };
      state.disciplinary = { ...state.disciplinary, [no]: [rec, ...(state.disciplinary[no]||[])] };

      // 2) audit trail (governance)
      log({ actor, role, action:'Disciplinary', entity:'Employee', entityId:entId, subject:name,
        reason:`${type} issued${note?' · '+note:''} · line manager ${mgr} notified`,
        changes:[{ field:'Disciplinary record', before:'—', after:`${type} (${when})` }] });

      // 3) automation — a suspension also flips employment status
      if(type==='Suspension'){
        state.empEdits = { ...state.empEdits, [no]: { ...(state.empEdits[no]||{}), status:'Suspended' } };
        log({ actor, role, action:'Suspend', entity:'Employee', entityId:entId, subject:name,
          reason:'Suspended pending disciplinary process', changes:[{ field:'Status', before: emp?emp.status:'Active', after:'Suspended' }] });
      }

      // 4) generate the warning letter into the employee's ESS My Documents
      const docId = 'D-'+(++docSeq);
      state.documents = [{ id:docId, no, name:`${type} letter · ${when}`, tag:'PDF', source:'HR', from:`HR · ${actor}`, date:when, tone:'red' }, ...state.documents];

      // 5) notifications — employee (ESS) + line manager & HR (console)
      pushNotif({ to:no, from:`HR · ${actor}`, kind:'alert', title:`Disciplinary: ${type}`,
        body:`A ${type.toLowerCase()} has been issued. The letter is in My Documents — please read and acknowledge.`, action:{tab:'docs'} });
      pushNotif({ to:'HCWOS', from:actor, kind:'alert', title:'Disciplinary recorded',
        body:`${type} issued to ${name}${site?' ('+site+')':''}. Line manager ${mgr} and HR notified.`, action:{page:'employees'} });

      // 6) employee ESS activity feed
      pushActivity(no, `${type} issued by HR`, 'red', 'alert');

      emit();
      window.toast(`${type} recorded · ${name} & ${mgr} notified`, 'alert');
    },

    // ── NOTIFICATIONS (end-to-end HCWOS ↔ ESS) ──
    notify: (n) => { pushNotif(n); emit(); },
    markNotifRead: (id) => { state.notifications = state.notifications.map(n=>n.id===id?{...n,read:true}:n); emit(); },
    markAllRead: (to) => { state.notifications = state.notifications.map(n=>n.to===to?{...n,read:true}:n); emit(); },

    // ── DOCUMENTS (HR shares from HCWOS → pushed to ESS as a notification; or employee uploads) ──
    shareDocument: ({ no, name, docName, tag='PDF', tone='blue', actor='HR · HCWOS', role='HR Officer' }) => {
      const id = 'D-'+(++docSeq);
      state.documents = [{ id, no, name:docName, tag, source:'HR', from:actor, date:now().slice(0,10), tone }, ...state.documents];
      log({ actor, role, action:'Document', entity:'Document', entityId:id, subject:name,
        reason:`Shared “${docName}” to employee ESS`, changes:[{field:'Document',before:'—',after:docName}] });
      pushNotif({ to:no, from:actor, kind:'doc', title:'Document shared by HR',
        body:`“${docName}” is now in your My Documents.`, action:{tab:'docs'} });
      emit(); window.toast(`Document shared · ${name} notified in ESS`, 'doc');
    },
    uploadDocument: ({ no, name, docName }) => {
      const id = 'D-'+(++docSeq);
      state.documents = [{ id, no, name:docName, tag:'Uploaded', source:'Employee', from:'You', date:now().slice(0,10), tone:'grey' }, ...state.documents];
      pushActivity(no, `Uploaded · ${docName}`, 'mut', 'doc');
      pushNotif({ to:'HCWOS', from:name, kind:'doc', title:'Document uploaded by employee',
        body:`${name} uploaded “${docName}” via ESS.`, action:{page:'employees'} });
      emit(); window.toast('Document uploaded · HR notified', 'doc');
    },

    // ── ISO POLICY READ & SIGN ──
    signPolicy: ({ no, name, policyId, policyName }) => {
      const cur = state.policyAck[no] || {};
      state.policyAck = { ...state.policyAck, [no]: { ...cur, [policyId]: { date:now().slice(0,10) } } };
      pushActivity(no, `Signed policy · ${policyName}`, 'green', 'shield');
      log({ actor:name, role:'Employee (ESS)', action:'Policy', entity:'Policy', entityId:policyId, subject:name,
        reason:`Read & signed: ${policyName} (${typeof POLICY_REV!=='undefined'?POLICY_REV:'ISO'})`,
        changes:[{field:'Acknowledgement',before:'Unsigned',after:'Signed'}] });
      pushNotif({ to:'HCWOS', from:name, kind:'shield', title:'Policy signed',
        body:`${name} read & signed “${policyName}”.`, action:{page:'employees'} });
      emit(); window.toast(`Signed · ${policyName}`, 'check');
    },
  };
  window.HStore = HStore;

  // hook: re-render on any store change
  window.useHStore = function(){
    const [,force] = React.useReducer(x=>x+1,0);
    React.useEffect(()=>HStore.subscribe(force),[]);
    return state;
  };

  // ── toasts ──
  const toastListeners = new Set();
  let tid = 0;
  window.toast = function(msg, icon='check'){
    const id = ++tid; toastListeners.forEach(fn=>fn({id,msg,icon}));
  };
  window.ToastHost = function(){
    const [items,setItems] = React.useState([]);
    React.useEffect(()=>{
      const fn = (t)=>{ setItems(x=>[...x,t]); setTimeout(()=>setItems(x=>x.filter(i=>i.id!==t.id)),2600); };
      toastListeners.add(fn); return ()=>toastListeners.delete(fn);
    },[]);
    return <div className="toast-wrap">{items.map(t=><div key={t.id} className="toast">
      <span className="tc"><Icon name={t.icon} size={12}/></span>{t.msg}</div>)}</div>;
  };

  // sync badge component
  window.SyncBadge = function({label='Live · ESS ⇄ HCMOS'}){
    return <span className="sync-badge"><span className="pulse"/>{label}</span>;
  };
})();
