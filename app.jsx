// HCMOS™ — main shell with login + role-based access
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "nav": "side",
  "density": "comfortable",
  "accent": "#1FA24A"
}/*EDITMODE-END*/;

const MODULES = {
  overview:    { label:'Workforce Overview', icon:'grid',     title:'Workforce Overview',      sub:'Executive view · Taifa Mining & Civil · May 2026' },
  kpis:        { label:'KPI Scorecard',       icon:'chart',    title:'KPI Scorecard',           sub:'HR metrics aligned to your role · targets & RAG status' },
  employees:   { label:'Employees',          icon:'users',    title:'Employees',               sub:'Core HR · single source of truth across all sites', badge:9 },
  leave:       { label:'Leave & Attendance', icon:'calendar', title:'Leave & Attendance',      sub:'Rotations, GPS clock-in and leave governance' },
  performance: { label:'Performance',        icon:'award',    title:'Performance & Recruitment', sub:'Appraisal cycle and hiring pipeline' },
  hseq:        { label:'HSEQ',               icon:'shield',   title:'Health, Safety, Environment & Quality', sub:'Incidents, LTI and competency authorisation' },
  training:    { label:'Training',           icon:'award',    title:'Training & Competency',   sub:'Courses, compliance and certification validity' },
  grievances:  { label:'Grievances',         icon:'flag',     title:'Grievances',              sub:'Cases, fair process and SLA tracking' },
  approvals:   { label:'Approvals',          icon:'check',    title:'Approvals',               sub:'Decisions awaiting your sign-off' },
  payroll:     { label:'Payroll',            icon:'money',    title:'Payroll',                 sub:'Salaries, statutory deductions and payslips' },
  reports:     { label:'Reports',            icon:'chart',    title:'Reports & Analytics',     sub:'Standard reports and downloads across modules' },
  integration: { label:'Exact Integration',  icon:'swap',     title:'Exact Integration',       sub:'HR → payroll hand-off and statutory checks' },
  migration:   { label:'Data Migration',     icon:'download', title:'Data Migration · Opening Balances', sub:'Import go-live datasets · structure mapping & sanity checks' },
  admin:       { label:'Security & Access',  icon:'lock',     title:'Security & Access',       sub:'Provisioning, role matrix and audit trail' },
  org:         { label:'Organization & Settings', icon:'building', title:'Organization & Settings', sub:'Companies, sites, structure and system configuration' },
  mobile:      { label:'Mobile app',         icon:'phone',    title:'Mobile app',              sub:'Approve and monitor on the go — role-based' },
  ess:         { label:'ESS (mobile)',       icon:'phone',    title:'Employee Self-Service',   sub:'The employee-facing mobile app' },
};
const BODY = { overview:Dashboard, employees:Employees, leave:Leave, performance:Performance,
  hseq:HSEQ, training:Training, grievances:Grievances, approvals:Approvals, payroll:Payroll,
  reports:Reports, integration:Integration, migration:DataMigration, admin:Admin, org:OrgSettings, kpis:KPIScorecard, mobile:RoleMobile, ess:ESS };
const SITE_SCOPED = ['employees','leave','hseq','reports'];
// Grouped navigation — friendly, memorable enterprise IA. Each group renders only the modules a role can access.
const NAV_GROUPS = [
  { key:'work',   label:'Workspace',                items:['overview','kpis','approvals'] },
  { key:'hr',     label:'Core HR & Records',         items:['employees','org','grievances'] },
  { key:'time',   label:'Leave & Attendance',        items:['leave'] },
  { key:'talent', label:'Performance & Recruitment', items:['performance','training'] },
  { key:'sheq',   label:'Health, Safety & Quality',  items:['hseq'] },
  { key:'pay',    label:'Payroll & Finance',         items:['payroll','integration'] },
  { key:'insight',label:'Reports & Insights',        items:['reports'] },
  { key:'ess',    label:'Employee Self-Service',     items:['ess','mobile'] },
  { key:'admin',  label:'Administration',            items:['admin','migration'] },
];
const LS = 'hcwos.role';

// Topbar identity for the fullscreen ESS — reflects the currently-viewed employee.
function EssTopIdentity({ fallback }){
  const s = useHStore();
  const e = (window.HStore && HStore.employee(s.essEmp)) || null;
  const name = e ? e.name : fallback.name;
  const sub = e ? (e.no+' · '+e.role) : fallback.title;
  return <div className="userchip" style={{marginLeft:'auto'}}><span className="avatar">{initials(name)}</span>
    <div style={{minWidth:0}}><div style={{fontWeight:600,fontSize:13}}>{name}</div>
      <div style={{color:'var(--faint)',fontSize:11}}>{sub}</div></div></div>;
}

// Universal search — employees (existing records) + accessible modules.
function GlobalSearch({ role, pages, onNavigate }){
  const st = useHStore();
  const [q,setQ] = React.useState('');
  const [open,setOpen] = React.useState(false);
  const box = React.useRef(null);
  React.useEffect(()=>{ const h=e=>{ if(box.current&&!box.current.contains(e.target)) setOpen(false); }; document.addEventListener('mousedown',h); return ()=>document.removeEventListener('mousedown',h); },[]);
  const ql = q.trim().toLowerCase();
  const canEmp = pages.includes('employees');
  const emps = ql&&canEmp ? HStore.employees().filter(e=>(e.name+' '+e.no+' '+e.role+' '+e.site).toLowerCase().includes(ql)).slice(0,6) : [];
  const mods = ql ? pages.filter(p=>MODULES[p] && MODULES[p].label.toLowerCase().includes(ql)).slice(0,5) : [];
  const pickEmp = (e)=>{ onNavigate('employees'); HStore.focusEmployee(e.no); setQ(''); setOpen(false); };
  const pickMod = (p)=>{ onNavigate(p); setQ(''); setOpen(false); };
  return <div ref={box} className="search" style={{position:'relative'}}>
    <Icon name="search" size={15}/>
    <input placeholder="Search people & modules…" value={q} onFocus={()=>setOpen(true)} onChange={e=>{setQ(e.target.value);setOpen(true);}}/>
    {open && ql && <div style={{position:'absolute',top:'calc(100% + 8px)',left:0,width:330,zIndex:50,maxHeight:380,overflowY:'auto',
      background:'var(--surface)',border:'1px solid var(--border)',borderRadius:11,boxShadow:'0 18px 48px rgba(0,0,0,.2)'}}>
      {mods.length>0 && <div style={{padding:'8px 12px 4px',fontSize:10.5,fontWeight:700,color:'var(--faint)',textTransform:'uppercase',letterSpacing:'.05em'}}>Modules</div>}
      {mods.map(p=><button key={p} onClick={()=>pickMod(p)} style={{display:'flex',gap:9,alignItems:'center',width:'100%',textAlign:'left',
        padding:'8px 12px',background:'none',border:'none',cursor:'pointer'}}>
        <span style={{width:26,height:26,borderRadius:7,background:'var(--surface-2)',color:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name={MODULES[p].icon} size={14}/></span>
        <span style={{fontSize:13,fontWeight:500}}>{MODULES[p].label}</span></button>)}
      {emps.length>0 && <div style={{padding:'8px 12px 4px',fontSize:10.5,fontWeight:700,color:'var(--faint)',textTransform:'uppercase',letterSpacing:'.05em',borderTop:mods.length?'1px solid var(--border-2)':'none'}}>People</div>}
      {emps.map(e=><button key={e.no} onClick={()=>pickEmp(e)} style={{display:'flex',gap:9,alignItems:'center',width:'100%',textAlign:'left',
        padding:'8px 12px',background:'none',border:'none',cursor:'pointer'}}>
        <Avatar name={e.name} size={26}/>
        <div style={{minWidth:0}}><div style={{fontSize:13,fontWeight:600}}>{e.name}</div>
          <div className="muted" style={{fontSize:11}}>{e.no} · {e.role} · {e.site}</div></div></button>)}
      {!mods.length && !emps.length && <div className="muted" style={{padding:'12px',fontSize:12.5}}>No matches{canEmp?'':' · people search not in your access'}.</div>}
    </div>}
  </div>;
}

function App(){
  const [t,setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [roleId,setRoleId] = React.useState(()=>localStorage.getItem(LS)||null);
  const role = roleId ? roleById(roleId) : null;
  const [page,setPage] = React.useState(()=>{ const r=roleById(localStorage.getItem(LS)); return r?r.landing:'overview'; });
  const [site,setSite] = React.useState(()=>{ const r=roleById(localStorage.getItem(LS)); return r&&r.scope!=='all'?r.scope:'All'; });

  React.useEffect(()=>{
    const r=document.documentElement;
    r.setAttribute('data-theme',t.theme); r.setAttribute('data-density',t.density);
    r.style.setProperty('--accent',t.accent); r.style.setProperty('--accent-soft',t.accent+'1f');
  },[t.theme,t.density,t.accent]);

  const login = (id)=>{ const r=roleById(id); setRoleId(id); localStorage.setItem(LS,id);
    setPage(r.landing); setSite(r.scope==='all'?'All':r.scope); };
  const logout = ()=>{ setRoleId(null); localStorage.removeItem(LS); };

  if(!role) return <Login onLogin={login}/>;

  // employee → fullscreen mobile ESS
  if(role.mobile){
    return <div style={{height:'100vh',display:'flex',flexDirection:'column',background:'var(--bg)'}}>
      <div className="topbar" style={{flexShrink:0}}>
        <img src={(window.__resources&&window.__resources.taifaLogo)||"assets/taifa-logo.png"} alt="Taifa" style={{height:22}} className="brandlogo"/>
        <div className="page-s" style={{marginLeft:4}}>Employee Self-Service</div>
        <EssTopIdentity fallback={role}/>
        <LangSwitch scope="ess"/>
        <button className="btn sm ghost" onClick={logout}><Icon name="logout" size={15}/>Sign out</button>
      </div>
      <div className="content" style={{display:'flex',alignItems:'flex-start',justifyContent:'center'}}>
        <ESS/>
      </div>
      <TweakDock t={t} setTweak={setTweak}/>
      <ToastHost/>
      <DialogHost/>
    </div>;
  }

  const pages = role.mobile ? role.pages : [...role.pages, 'mobile'];
  const activePage = pages.includes(page) ? page : role.landing;
  const m = MODULES[activePage] || MODULES[role.landing];
  const pageSub = activePage==='overview' ? `${role.title} workspace · ${role.dept||'Taifa Mining & Civil'}` : m.sub;
  const Body = BODY[activePage] || Dashboard;
  const showSiteFilter = SITE_SCOPED.includes(activePage);
  const scoped = role.scope!=='all';
  const siteVal = scoped ? role.scope : site;

  const Logo = <div className="brand">
    <img src={(window.__resources&&window.__resources.taifaLogo)||"assets/taifa-logo.png"} alt="Taifa Mining & Civil"/>
    <div className="brand-sys">
      <span className="bs-mark">HCMOS<sup>™</sup></span>
      <span className="bs-desc">Human Capital Management OS</span>
    </div>
  </div>;

  const navButton = (pid)=><button key={pid} className={'navitem '+(activePage===pid?'on':'')} onClick={()=>setPage(pid)}>
    <Icon name={MODULES[pid].icon} size={18} cls="ic"/>{MODULES[pid].label}
    {MODULES[pid].badge&&<span className="badge">{MODULES[pid].badge}</span>}</button>;
  const navButtons = pages.map(navButton);
  const groupedNav = NAV_GROUPS.map(g=>{ const its=g.items.filter(i=>pages.includes(i)); if(!its.length) return null;
    return <div key={g.key} className="navsec"><div className="navgrp">{g.label}</div>{its.map(navButton)}</div>; });

  const UserChip = <div className="userchip" title="Current role">
    <span className="avatar">{role.initials}</span>
    <div style={{minWidth:0,flex:1}}><div style={{fontWeight:600,fontSize:13,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{role.name}</div>
      <div style={{color:'var(--faint)',fontSize:11}}>{role.title}</div></div>
    <button className="iconbtn" style={{width:30,height:30}} title="Sign out / switch role" onClick={logout}><Icon name="swap" size={15}/></button>
  </div>;

  return <div className="app" data-nav={t.nav}>
    <aside className="side">
      {Logo}
      <nav className="navlist">
        <div className="navgrp navtop">{role.scope==='all'?'All sites':role.scope}</div>
        {groupedNav}
      </nav>
      <div className="sideft">{UserChip}
        <div className="sys-stat"><span className="dot"></span>Secure session · ISO 9001 · v1.0</div>
      </div>
    </aside>

    <div className="topbar2">
      {Logo}<div className="topnav">{navButtons}</div>
      <div style={{marginLeft:'auto'}}>{UserChip}</div>
    </div>

    <main className="main">
      <header className="topbar">
        <div className="tb-title"><div className="page-t">{m.title}</div><div className="page-s">{pageSub}</div></div>
        <div className="tb-tools">
          <GlobalSearch role={role} pages={pages} onNavigate={setPage}/>
          <LangSwitch/>
          <NotifBell onNavigate={setPage}/>
          <span className="tb-div"></span>
          {role.readonly && <span className="ro-lock"><Icon name="lock" size={13}/>Read-only</span>}
          <div className="role-banner"><Icon name="shield" size={13}/>{role.title}{scoped&&<> · {role.scope}</>}</div>
        </div>
      </header>

      {showSiteFilter && <div style={{padding:'14px 24px 0',display:'flex',alignItems:'center',gap:10}}>
        <Icon name="filter" size={15} style={{color:'var(--faint)'}}/>
        {scoped
          ? <div className="sitefilter"><button className="pill on">{role.scope}</button>
              <span className="ro-lock" style={{marginLeft:4}}><Icon name="lock" size={12}/>scoped to your site</span></div>
          : <div className="sitefilter">
              <button className={'pill '+(site==='All'?'on':'')} onClick={()=>setSite('All')}>All sites</button>
              {SITES.map(s=><button key={s.id} className={'pill '+(site===s.name?'on':'')} onClick={()=>setSite(s.name)}>{s.name}</button>)}
            </div>}
      </div>}

      <div className="content">
        <Body siteFilter={siteVal} money={role.money} canMoney={role.money} role={role} onNavigate={setPage}/>
      </div>
    </main>

    <TweakDock t={t} setTweak={setTweak}/>
    <ToastHost/>
    <DialogHost/>
  </div>;
}

function TweakDock({ t, setTweak }){
  return <TweaksPanel>
    <TweakSection label="Theme"/>
    <TweakRadio label="Mode" value={t.theme} options={['light','dark']} onChange={v=>setTweak('theme',v)}/>
    <TweakColor label="Accent" value={t.accent} options={['#1FA24A','#0094D4','#FBC02D','#15191D']} onChange={v=>setTweak('accent',v)}/>
    <TweakSection label="Layout"/>
    <TweakRadio label="Navigation" value={t.nav} options={['side','top']} onChange={v=>setTweak('nav',v)}/>
    <TweakRadio label="Density" value={t.density} options={['comfortable','compact']} onChange={v=>setTweak('density',v)}/>
  </TweaksPanel>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
