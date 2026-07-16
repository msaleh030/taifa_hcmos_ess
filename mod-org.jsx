// Module: Organization & Settings — companies, sites & codes, structure/organogram,
// and the system configuration registry. Owned by IT / Head of HR (read for CEO).

// ── Tanzania public-holiday calendar (config sample) ──
const TZ_HOLIDAYS_2026 = [
  ['01 Jan','New Year\u2019s Day'], ['12 Jan','Zanzibar Revolution Day'], ['07 Apr','Karume Day'],
  ['03 Apr','Good Friday'], ['06 Apr','Easter Monday'], ['26 Apr','Union Day'], ['01 May','Workers\u2019 Day'],
  ['20 Mar','Eid al-Fitr'], ['07 Jul','Saba Saba'], ['08 Aug','Nane Nane'], ['14 Oct','Nyerere Day'],
  ['09 Dec','Independence Day'], ['25 Dec','Christmas Day'], ['26 Dec','Boxing Day'],
];
const ORG_GRADES = [
  { g:'G1–G2',  band:'General labour',        min:'310k',  mid:'420k',  max:'560k' },
  { g:'G3–G5',  band:'Operators & drivers',   min:'520k',  mid:'780k',  max:'1.1M' },
  { g:'G6–G8',  band:'Skilled / supervisory', min:'1.0M',  mid:'1.6M',  max:'2.3M' },
  { g:'G9–G11', band:'Officers & engineers',  min:'2.1M',  mid:'3.4M',  max:'4.8M' },
  { g:'G12–G14',band:'Managers / heads',       min:'4.5M',  mid:'7.2M',  max:'11.0M' },
  { g:'G15–G16',band:'Executive',              min:'11.0M', mid:'18.0M', max:'28.0M' },
];

// ── Org tree from the role reporting lines (REPORTS_TO) ──
function buildOrgRoots(){
  const roles = (typeof ROLES!=='undefined'?ROLES:[]);
  const byName = {}; roles.forEach(r=>{ byName[r.name] = { role:r, children:[] }; });
  const roots = [];
  roles.forEach(r=>{
    const parent = (r.reportsTo||'').split('\u00b7')[0].split(' · ')[0].trim();
    if(byName[parent] && parent!==r.name) byName[parent].children.push(byName[r.name]);
    else roots.push(byName[r.name]);
  });
  return roots;
}
// annotate every node with its direct + total (descendant) report counts
function annotateOrg(node){
  let total = 0;
  node.children.forEach(c=>{ total += 1 + annotateOrg(c); });
  node._direct = node.children.length;
  node._total = total;
  return total;
}
// roll-up metrics for the smart-insight strip
function orgMetrics(roots){
  let positions=0, depth=0; const spans=[];
  (function walk(ns,d){ ns.forEach(n=>{ positions++; depth=Math.max(depth,d);
    if(n.children.length) spans.push(n.children.length); walk(n.children,d+1); }); })(roots,1);
  const sum = spans.reduce((a,b)=>a+b,0);
  return { positions, depth, managers:spans.length, ic:positions-spans.length,
    avgSpan: spans.length?(sum/spans.length):0, widest: spans.length?Math.max(...spans):0 };
}
function OrgNode({ node }){
  const r = node.role;
  return <li>
    <div className="org-card" title={r.dept+(node._direct?` · ${node._direct} direct / ${node._total} total reports`:'')}>
      <span className="ma" style={{background:colorFor(r.name),width:30,height:30,fontSize:11}}>{initials(r.name)}</span>
      <div style={{minWidth:0,textAlign:'left'}}>
        <div className="org-name">{r.name}</div>
        <div className="org-title">{r.title}</div>
        <div className="org-dept">{r.dept}{r.scope&&r.scope!=='all'?' · '+r.scope:''}</div>
      </div>
      {node._direct>0 && <span className="org-span" title={`${node._direct} direct · ${node._total} total`}>{node._direct}<small>▾</small></span>}
    </div>
    {node.children.length>0 && <ul>{node.children.map(c=><OrgNode key={c.role.id} node={c}/>)}</ul>}
  </li>;
}

function OrgSettings({ role, onNavigate }){
  const st = useHStore();
  const isIT = role && role.id==='it';
  const readOnly = role && (role.readonly || (!isIT && role.id!=='hrhead'));

  // ── companies ──
  const [companies,setCompanies] = React.useState([
    { name:'Taifa Group Holdings', code:'TGH', reg:'118-442-901', country:'Tanzania', kind:'Holding company', sites:'—', status:'Active' },
    { name:'Taifa Mining & Civil', code:'TMC', reg:'92-118-007',  country:'Tanzania', kind:'Operating company', sites:8, status:'Active', primary:true },
  ]);
  const [showCompany,setShowCompany] = React.useState(false);

  // ── sites & codes (sourced from the canonical SITES + SITE_CODE map) ──
  const codes = (typeof SITE_CODE!=='undefined') ? SITE_CODE : {};
  const baseSites = (typeof SITES!=='undefined'?SITES:[]).map(s=>(
    { name:s.name, code:codes[s.name]||'—', type:s.type, region:s.region, hc:s.hc, status:'Active', isNew:!!s.isNew }));
  const [extraSites,setExtraSites] = React.useState([]);
  const sites = [...baseSites, ...extraSites];
  const newCount = baseSites.filter(s=>s.isNew).length;
  const [showSite,setShowSite] = React.useState(false);

  // ── organogram ──
  const [orgGen,setOrgGen] = React.useState(false);
  const [orgStamp,setOrgStamp] = React.useState('2026-06-22 14:15');
  const [showOrgExport,setShowOrgExport] = React.useState(false);
  const roots = React.useMemo(buildOrgRoots,[orgGen]);
  roots.forEach(annotateOrg);
  const metrics = React.useMemo(()=>orgMetrics(roots),[orgGen]);
  const myEmail = (role && role.email) || 'admin@taifamining.tz';
  const headcountTotal = (typeof TOTAL_HC!=='undefined'?TOTAL_HC:0);

  // ── configuration registry ──
  const [sel,setSel] = React.useState(null);
  const depts = ['Operations','Human Resources','SHEQ','Finance','Payroll','Information Technology','Executive'];
  const CONFIG = [
    { id:'grades',     icon:'award',     name:'Grades & pay bands',        desc:'Salary structure & band min/mid/max', value:'G1–G16', count:6,  status:'Configured' },
    { id:'departments',icon:'briefcase', name:'Departments & cost centres', desc:'Functional units and GL cost centres', value:depts.length+' depts', count:depts.length, status:'Configured' },
    { id:'leave',      icon:'calendar',  name:'Leave types & accrual rules', desc:'Entitlement, accrual, carry-over caps', value:(typeof LEAVE_TYPES!=='undefined'?LEAVE_TYPES.length:0)+' types', count:(typeof LEAVE_TYPES!=='undefined'?LEAVE_TYPES.length:0), status:'Configured' },
    { id:'rotation',   icon:'swap',      name:'Rotation & shift patterns',  desc:'Field rosters and cycle definitions', value:(typeof ROTATIONS!=='undefined'?ROTATIONS.length:0)+' patterns', count:(typeof ROTATIONS!=='undefined'?ROTATIONS.length:0), status:'Configured' },
    { id:'numbering',  icon:'doc',       name:'Employee-number scheme',     desc:'Auto-generated staff ID format', value:'TMC-‹SITE›-‹YY›-‹SEQ›', status:'Configured' },
    { id:'holidays',   icon:'calendar',  name:'Public-holiday calendar',    desc:'Statutory holidays · pay & leave engine', value:TZ_HOLIDAYS_2026.length+' / 2026', count:TZ_HOLIDAYS_2026.length, status:'Configured' },
    { id:'approvals',  icon:'check',     name:'Approval workflows',         desc:'Routing & authority per request type', value:(typeof APPROVAL_LABELS!=='undefined'?Object.keys(APPROVAL_LABELS).length:0)+' flows', count:(typeof APPROVAL_LABELS!=='undefined'?Object.keys(APPROVAL_LABELS).length:0), status:'Configured' },
    { id:'roles',      icon:'shield',    name:'Roles & permissions',        desc:'Confidentiality matrix · access rights', value:(typeof ROLES!=='undefined'?ROLES.length:0)+' roles', count:(typeof ROLES!=='undefined'?ROLES.length:0), status:'Configured', go:'admin' },
    { id:'notifications',icon:'bell',    name:'Notification & reminder rules', desc:'Expiry alerts, escalations, channels', value:'On · 30/14/7d', status:'Configured' },
    { id:'documents',  icon:'clipboard', name:'Document categories',        desc:'Filing taxonomy & retention class', value:'9 categories', count:9, status:'Configured' },
    { id:'locale',     icon:'money',     name:'Locale, currency & language',desc:'Reporting currency and ESS languages', value:'TZS · EN / SW', status:'Configured' },
    { id:'retention',  icon:'lock',      name:'Data retention & privacy',   desc:'Record lifecycle & audit retention', value:'7 yrs · audit ∞', status:'Policy set' },
    { id:'integration',icon:'swap',      name:'Integrations',               desc:'Payroll, ERP & statutory connectors', value:'Exact Online', status:'Connected', go:'integration' },
  ];

  const addCompany = (v)=>{
    const code = (v.code||v.name.replace(/[^A-Za-z]/g,'').slice(0,3)).toUpperCase();
    setCompanies(cs=>[...cs, { name:v.name, code, reg:v.reg||'—', country:v.country||'Tanzania', kind:v.kind||'Operating company', sites:0, status:'Active' }]);
    if(window.HStore){ HStore.record({ actor:role?role.name:'IT', role:role?role.title:'IT', action:'Create', entity:'Company', entityId:code, subject:v.name,
      reason:`Company registered in group structure (${v.kind||'Operating company'})`, changes:[{field:'Company',before:'—',after:`${v.name} (${code})`}] });
      HStore.notify({ to:'HCWOS', from:role?role.name:'IT', kind:'building', title:'Company added', body:`${v.name} (${code}) registered in the group structure.`, action:{page:'org'} }); }
    window.toast(`Company added · ${v.name} (${code})`, 'building');
  };
  const addSite = (v)=>{
    const code = (v.code||v.name.replace(/[^A-Za-z]/g,'').slice(0,3)).toUpperCase();
    if(typeof SITE_CODE!=='undefined') SITE_CODE[v.name]=code; // assign the code globally
    setExtraSites(s=>[...s, { name:v.name, code, type:v.type||'Operation', region:v.region||'—', hc:0, status:'Provisioning', isNew:true }]);
    if(window.HStore){ HStore.record({ actor:role?role.name:'IT', role:role?role.title:'IT', action:'Create', entity:'Site', entityId:code, subject:v.name,
      reason:`Site provisioned · code ${code} assigned · numbering enabled`, changes:[{field:'Site',before:'—',after:`${v.name} (${code})`}] });
      HStore.notify({ to:'HCWOS', from:role?role.name:'IT', kind:'pin', title:'Site provisioned', body:`${v.name} added with code ${code} · numbering ready.`, action:{page:'org'} }); }
    window.toast(`Site added · code ${code} assigned`, 'pin');
  };
  const generateOrg = ()=>{
    setOrgGen(true);
    const d=new Date(); const p=n=>String(n).padStart(2,'0');
    const stamp = `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
    setOrgStamp(stamp);
    if(window.HStore) HStore.record({ actor:role?role.name:'IT', role:role?role.title:'IT', action:'Generate', entity:'Organogram', entityId:'ORG-CHART', subject:'Organization structure',
      reason:`Auto-generated from live reporting lines, roles, grades & sites`, changes:[{field:'Snapshot',before:'—',after:stamp}] });
    window.toast('Organogram generated from current structure', 'users');
  };
  const sendOrgExport = (fmt)=>{
    if(window.HStore){ HStore.record({ actor:role?role.name:'IT', role:role?role.title:'IT', action:'Export', entity:'Organogram', entityId:'ORG-CHART', subject:'Organization structure',
      reason:`Exported as ${fmt} · emailed strictly to ${myEmail}`, changes:[{field:'Format',before:'—',after:fmt}] });
      HStore.notify({ to:'HCWOS', from:role?role.name:'IT', kind:'doc', title:'Organogram exported', body:`Sent as ${fmt} to ${myEmail} (verified address only).`, action:{page:'org'} }); }
    window.toast(`Organogram emailed to you · ${fmt}`, 'check');
  };

  const tileTone = { Configured:'green', Connected:'green', 'Policy set':'blue' };

  return <div className="grid" style={{gap:16}}>
    {/* KPIs */}
    <div className="grid" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
      <KPI icon="building" label="Companies" value={companies.length} sub="group structure"/>
      <KPI icon="pin" label="Sites & operations" value={sites.length} sub={newCount+' newly provisioned'} trend={newCount+' new'} trendDir="up"/>
      <KPI icon="users" label="Headcount" value={headcountTotal.toLocaleString()} sub="across all units"/>
      <KPI icon="briefcase" label="Departments" value={depts.length} sub="functional units"/>
      <KPI icon="lock" label="Config groups" value={CONFIG.length} sub="all configured"/>
    </div>

    {/* Companies */}
    <Card>
      <CardH title="Companies" icon="building" meta="group & operating entities"
        action={!readOnly && <button className="btn sm primary" style={{marginLeft:'auto'}} onClick={()=>setShowCompany(true)}><Icon name="plus" size={14}/>Add company</button>}/>
      <table className="tbl"><thead><tr><th>Company</th><th>Code</th><th>Registration</th><th>Country</th><th>Type</th><th>Sites</th><th>Status</th></tr></thead>
        <tbody>{companies.map((c,i)=><tr key={i}>
          <td className="name">{c.name}{c.primary&&<Tag tone="blue" style={{marginLeft:7}}>primary</Tag>}</td>
          <td><Tag tone="grey" style={{fontFamily:'var(--mono)'}}>{c.code}</Tag></td>
          <td className="num muted">{c.reg}</td>
          <td className="muted">{c.country}</td>
          <td className="muted">{c.kind}</td>
          <td className="num">{c.sites}</td>
          <td><Tag tone="green" dot>{c.status}</Tag></td>
        </tr>)}</tbody></table>
    </Card>

    {/* Sites & codes */}
    <Card>
      <CardH title="Sites & operations — code register" icon="pin" meta="3-letter code drives employee numbering"
        action={!readOnly && <button className="btn sm primary" style={{marginLeft:'auto'}} onClick={()=>setShowSite(true)}><Icon name="plus" size={14}/>Add site</button>}/>
      <table className="tbl"><thead><tr><th>Site / unit</th><th>Code</th><th>Type</th><th>Region</th><th>Headcount</th><th>Status</th></tr></thead>
        <tbody>{sites.map((s,i)=><tr key={i} style={s.isNew?{background:'var(--accent-soft)'}:null}>
          <td className="name">{s.name}{s.isNew&&<Tag tone="green" style={{marginLeft:7}}>new</Tag>}</td>
          <td><span className="codechip">{s.code}</span></td>
          <td className="muted">{s.type}</td>
          <td className="muted">{s.region}</td>
          <td className="num">{s.hc?s.hc.toLocaleString():'—'}</td>
          <td>{s.status==='Active'?<Tag tone="green" dot>Active</Tag>:<Tag tone="yellow" dot>Provisioning</Tag>}</td>
        </tr>)}</tbody></table>
      <div className="card-p" style={{paddingTop:0,fontSize:11.5,color:'var(--muted)'}}>
        Newly assigned: <b>Load &amp; Haul → LNH</b> · <b>TSF10 → TSF</b> · <b>Taifa HQ → HQ</b>. Example staff ID: <span className="num">TMC-LNH-26-0001</span>.
      </div>
    </Card>

    {/* Organogram */}
    <Card>
      <CardH title="Organization structure — organogram" icon="users"
        meta={'auto-derived · last structure update · '+orgStamp}
        action={<div style={{marginLeft:'auto',display:'flex',gap:8,alignItems:'center'}}>
          {orgGen && <span className="tag t-green" style={{gap:5}}><Icon name="check" size={12}/>Up to date</span>}
          {orgGen && <button className="btn sm ghost" onClick={()=>setShowOrgExport(true)}><Icon name="download" size={14}/>Export &amp; email</button>}
          <button className="btn sm primary" onClick={generateOrg}><Icon name="swap" size={14}/>{orgGen?'Regenerate':'Autogenerate organogram'}</button>
        </div>}/>
      {!orgGen
        ? <div className="card-p"><div style={{border:'1px dashed var(--border)',borderRadius:10,padding:'34px 20px',textAlign:'center',color:'var(--muted)'}}>
            <Icon name="users" size={26} style={{color:'var(--faint)'}}/>
            <div style={{fontWeight:600,fontSize:14,marginTop:8,color:'var(--text)'}}>Generate the organogram from the live structure</div>
            <div style={{fontSize:12.5,marginTop:4}}>Reads the latest reporting lines, roles, grades and sites — computes span-of-control, depth and reporting roll-ups automatically. No manual drawing.</div>
            <button className="btn primary" style={{marginTop:14}} onClick={generateOrg}><Icon name="swap" size={15}/>Autogenerate now</button>
          </div></div>
        : <React.Fragment>
            <div className="card-p" style={{paddingBottom:0}}>
              <div className="org-insights">
                {[['Positions',metrics.positions,'users'],['Levels deep',metrics.depth,'chart'],['Managers',metrics.managers,'briefcase'],
                  ['Avg span',metrics.avgSpan.toFixed(1),'swap'],['Widest span',metrics.widest,'alert']].map((m,i)=>
                  <div key={i} className="org-insight"><Icon name={m[2]} size={14} style={{color:'var(--accent)'}}/>
                    <div><div className="num" style={{fontWeight:700,fontSize:17}}>{m[1]}</div>
                      <div style={{fontSize:10.5,color:'var(--faint)'}}>{m[0]}</div></div></div>)}
              </div>
            </div>
            <div className="card-p" style={{overflowX:'auto'}}>
              <div className="org-chart">
                <ul><li>
                  <div className="org-card org-board"><span className="ma" style={{background:'var(--text)',width:30,height:30,fontSize:11}}>BD</span>
                    <div style={{textAlign:'left'}}><div className="org-name">Board of Directors</div><div className="org-title">Governance</div></div></div>
                  <ul>{roots.map(n=><OrgNode key={n.role.id} node={n}/>)}</ul>
                </li></ul>
              </div>
            </div>
          </React.Fragment>}
    </Card>

    {/* Configuration registry */}
    <SecH>Configurable options</SecH>
    <div className="cfg-grid">
      {CONFIG.map(c=><button key={c.id} className={'cfg-tile'+(sel===c.id?' on':'')}
        onClick={()=>{ if(c.go && onNavigate){ onNavigate(c.go); } else setSel(sel===c.id?null:c.id); }}>
        <span className="cfg-ic"><Icon name={c.icon} size={17}/></span>
        <div style={{flex:1,minWidth:0}}>
          <div className="cfg-name">{c.name}</div>
          <div className="cfg-desc">{c.desc}</div>
          <div className="cfg-val">{c.value}</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
          <Tag tone={tileTone[c.status]||'grey'} dot>{c.status}</Tag>
          <Icon name={c.go?'chevR':'chevR'} size={14} style={{color:'var(--faint)',transform:c.go?'none':(sel===c.id?'rotate(90deg)':'none'),transition:'transform .15s'}}/>
        </div>
      </button>)}
    </div>

    {sel && <Card>
      <CardH title={(CONFIG.find(c=>c.id===sel)||{}).name} icon={(CONFIG.find(c=>c.id===sel)||{}).icon} meta="current configuration"
        action={<button className="btn sm ghost" style={{marginLeft:'auto'}} onClick={()=>setSel(null)}><Icon name="x" size={14}/>Close</button>}/>
      <div className="card-p">{renderConfigDetail(sel, { depts, readOnly })}</div>
    </Card>}

    {showCompany && <FormModal title="Add company" icon="building" submitLabel="Register company"
      onClose={()=>setShowCompany(false)} onSubmit={addCompany}
      fields={[
        { key:'name', label:'Company name', required:true, wide:true, placeholder:'e.g. Taifa Logistics Ltd' },
        { key:'code', label:'Code (3 letters)', placeholder:'auto from name' },
        { key:'reg', label:'Registration no.', placeholder:'BRELA / TIN' },
        { key:'country', label:'Country', type:'select', options:['Tanzania','Kenya','Zambia','DRC','Mozambique'] },
        { key:'kind', label:'Type', type:'select', options:['Operating company','Holding company','Joint venture','Branch'] },
      ]}/>}

    {showSite && <FormModal title="Add site / operation" icon="pin" submitLabel="Provision site"
      onClose={()=>setShowSite(false)} onSubmit={addSite}
      fields={[
        { key:'name', label:'Site / unit name', required:true, wide:true, placeholder:'e.g. Bulyanhulu Civil' },
        { key:'code', label:'Code (3 letters)', placeholder:'auto from name' },
        { key:'type', label:'Type', type:'select', options:['Mining operation (contract)','Civil works','Workshop / yard','Tailings storage facility · civil','Head office','Exploration / project'] },
        { key:'region', label:'Region', type:'select', options:['Shinyanga','Mwanza','Geita','Tarime','Dar es Salaam','Dodoma','Arusha','Tabora'] },
      ]}/>}

    {showOrgExport && <EmailExportModal title="Export organogram" subject="Organization structure · current snapshot"
      email={myEmail} onSend={sendOrgExport} onClose={()=>setShowOrgExport(false)}
      note="Delivered only to your verified Taifa address — never downloaded to this device. Every export is recorded in the audit trail."/>}
  </div>;
}

// ── per-group configuration detail ──
function renderConfigDetail(id, ctx){
  const muted = { color:'var(--muted)', fontSize:12.5 };
  if(id==='grades') return <table className="tbl"><thead><tr><th>Grade band</th><th>Description</th><th>Min</th><th>Midpoint</th><th>Max</th></tr></thead>
    <tbody>{ORG_GRADES.map((g,i)=><tr key={i}><td className="name">{g.g}</td><td className="muted">{g.band}</td>
      <td className="num">TZS {g.min}</td><td className="num">TZS {g.mid}</td><td className="num">TZS {g.max}</td></tr>)}</tbody></table>;
  if(id==='departments') return <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
    {ctx.depts.map((d,i)=><span key={i} className="tag t-grey" style={{padding:'6px 11px'}}><Icon name="briefcase" size={12}/>{d} · CC-{String(100+i*10)}</span>)}</div>;
  if(id==='leave') return <table className="tbl"><thead><tr><th>Leave type</th><th>Code</th><th>Paid</th><th>Entitlement</th><th>Carry</th></tr></thead>
    <tbody>{(typeof LEAVE_TYPES!=='undefined'?LEAVE_TYPES:[]).map((l,i)=><tr key={i} title={l.note}><td className="name">{l.type}</td>
      <td className="num muted">{l.code}</td><td>{l.paid?<Tag tone="green">Paid</Tag>:<Tag tone="grey">Unpaid</Tag>}</td>
      <td className="num">{l.entitlement} d</td><td className="num muted">{l.carry}</td></tr>)}</tbody></table>;
  if(id==='rotation') return <table className="tbl"><thead><tr><th>Pattern</th><th>Cycle</th><th>On roster</th></tr></thead>
    <tbody>{(typeof ROTATIONS!=='undefined'?ROTATIONS:[]).map((r,i)=><tr key={i}><td className="name">{r.label}</td>
      <td className="muted">{r.desc}</td><td className="num">{r.groups}</td></tr>)}</tbody></table>;
  if(id==='numbering') return <div style={{display:'flex',flexDirection:'column',gap:12}}>
    <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
      {[['TMC','company'],['SITE','site code'],['YY','year joined'],['SEQ','sequence']].map(([a,b],i)=><React.Fragment key={i}>
        <div style={{textAlign:'center'}}><div className="codechip" style={{fontSize:13,padding:'6px 12px'}}>{a}</div><div style={muted}>{b}</div></div>
        {i<3&&<Icon name="chevR" size={14} style={{color:'var(--faint)'}}/>}</React.Fragment>)}
    </div>
    <div style={muted}>Example: <span className="num" style={{color:'var(--text)',fontWeight:600}}>TMC-MWD-21-4821</span> · new units auto-resolve (LNH, TSF, HQ).</div>
  </div>;
  if(id==='holidays') return <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
    {TZ_HOLIDAYS_2026.map(([d,n],i)=><span key={i} className="tag t-grey" style={{padding:'6px 11px'}}><span className="num" style={{color:'var(--accent)'}}>{d}</span> {n}</span>)}</div>;
  if(id==='approvals') return <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
    {Object.values(typeof APPROVAL_LABELS!=='undefined'?APPROVAL_LABELS:{}).map((l,i)=><span key={i} className="tag t-grey" style={{padding:'6px 11px'}}><Icon name="check" size={12}/>{l}</span>)}</div>;
  if(id==='notifications') return <div style={{display:'flex',flexDirection:'column',gap:8}}>
    {[['Contract / permit expiry','30 / 14 / 7 days before','blue'],['Medical (OSHA) due','30 / 7 days before','blue'],
      ['Pending approval escalation','after 48h to next authority','yellow'],['Channels','In-app · ESS push · email digest','grey']].map((r,i)=>
      <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:i<3?'1px solid var(--border-2)':'none'}}>
        <Icon name="bell" size={15} style={{color:'var(--accent)'}}/><b style={{fontSize:13}}>{r[0]}</b>
        <span style={{marginLeft:'auto'}}><Tag tone={r[2]}>{r[1]}</Tag></span></div>)}</div>;
  // generic
  const generic = {
    documents:'9 filing categories — Contracts, Certificates, Medical, Disciplinary, ID, Licences, Appraisals, Policy, Other. Each maps to a retention class.',
    locale:'Reporting currency TZS · date format DD MMM YYYY · ESS available in English and Swahili (employee-selectable).',
    retention:'Active records retained 7 years post-exit per ELRA; the audit ledger is append-only and retained indefinitely (hash-chained, tamper-evident).',
  };
  return <div style={muted}>{generic[id]||'Configuration managed here. Changes are written to the tamper-evident audit trail.'}</div>;
}

window.OrgSettings = OrgSettings;
