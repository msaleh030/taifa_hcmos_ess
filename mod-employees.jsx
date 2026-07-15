// Module: Employees / Core HR
const ALL_SITES = ['Mwadui','Nyanzaga','Dar Yard','North Mara','Geita Civil'];
const GRADES = ['G3','G4','G5','G6','G7','G8','G9','G10','G11','G12','G13','G14'];
const TODAY = '2026-06-24';
const NJ_MGR = { 'Mwadui':'Grace Ndaki','Nyanzaga':'Neema Joseph','Dar Yard':'Samuel Mlay','North Mara':'Samuel Mlay','Geita Civil':'Samuel Mlay' };
const NJ_DEPTS = ['Operations','Workshop','SHEQ','Human Resources','Finance','Engineering','Administration','Security'];

// 360° new-joiner capture — smart number, copy-from template, manager auto-fill, sanity checks.
function NewJoinerModal({ siteFilter, expat, onClose }){
  const startSite = siteFilter && siteFilter!=='All' ? siteFilter : 'Mwadui';
  const [v,setV] = React.useState({
    firstName:'', lastName:'', gender:'Male', dob:'', maritalStatus:'Single', nationality:expat?'':'Tanzanian',
    phone:'', email:'', address:'', bloodGroup:'O+', languages:expat?'English':'Swahili, English', religion:'Christian',
    nida:'', tin:'', nssf:'', kinName:'', kinRelation:'Spouse', kinPhone:'',
    site:startSite, department:'Operations', position:'', grade:expat?'G11':'G6', rotation:expat?'9wk-on-5-off':'7x7x7',
    employmentType:expat?'Expatriate':'Permanent', hireDate:TODAY, contractEnd:'', permit:'',
    homeCountry:'', passportNo:'', passportExpiry:'', visaType:'Work', visaExpiry:'', workPermitNo:'',
    residencePermitExpiry:'', taxStatus:'Non-resident', dependantsRelocating:'No', repatriation:'Annual flights',
  });
  const [seq] = React.useState(()=>String(4900+Math.floor(Math.random()*90)).padStart(4,'0'));
  const [touched,setTouched] = React.useState(false);
  const set = (k,val)=>setV(s=>({...s,[k]:val}));
  const code = (window.SITE_CODE&&SITE_CODE[v.site])||'HO';
  const empNo = `TMCL-${code}-${seq}`;
  // smart: auto line manager from site
  const manager = NJ_MGR[v.site]||'—';

  // copy-from existing employee → prefill employment template
  const copyFrom = (e)=>setV(s=>({...s, site:e.site, grade:e.grade, position:e.role, rotation:e.rotation,
    department:(e.role||'').includes('HR')?'Human Resources':(e.role||'').includes('HSEQ')?'SHEQ':'Operations',
    employmentType:e.expat?'Expatriate':'Permanent', contractEnd:e.contract||s.contractEnd }));

  const isDate=x=>/^\d{4}-\d{2}-\d{2}$/.test(x)&&!isNaN(Date.parse(x));
  const errs={};
  if(!v.firstName.trim()) errs.firstName='required';
  if(!v.lastName.trim()) errs.lastName='required';
  if(!isDate(v.dob)) errs.dob='YYYY-MM-DD'; else if(((Date.parse(TODAY)-Date.parse(v.dob))/3.15e10)<18) errs.dob='under 18';
  if(!/^\d{9}$/.test(v.tin.replace(/\D/g,''))) errs.tin='9 digits';
  if(!/\d{6,}/.test(v.phone)) errs.phone='phone';
  if(v.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) errs.email='invalid';
  if(!v.position.trim()) errs.position='required';
  if(!isDate(v.hireDate)) errs.hireDate='date';
  const isExpat = v.employmentType==='Expatriate';
  if(isExpat){
    if(!v.nationality.trim()) errs.nationality='required';
    if(!v.homeCountry.trim()) errs.homeCountry='required';
    if(!v.passportNo.trim()) errs.passportNo='required';
    if(!isDate(v.passportExpiry)) errs.passportExpiry='date';
    if(!isDate(v.visaExpiry)) errs.visaExpiry='date';
    if(!v.workPermitNo.trim()) errs.workPermitNo='required';
    if(!isDate(v.permit)) errs.permit='date';
    if(!isDate(v.residencePermitExpiry)) errs.residencePermitExpiry='date';
  } else {
    if(!/^\d{20}$/.test(v.nida.replace(/\D/g,''))) errs.nida='20 digits';
  }
  const valid = Object.keys(errs).length===0;

  const submit=()=>{ setTouched(true); if(!valid) return;
    const emp = { no:empNo, name:(v.firstName+' '+v.lastName).trim(), role:v.position, site:v.site, grade:v.grade,
      status:'Active', rotation:v.rotation, contract:v.contractEnd||'2027-12-31', permit:v.permit||'—',
      medical:'Valid', leave:0, disc:0, joined:v.hireDate, expat:v.employmentType==='Expatriate',
      _bio:{ ...v, empNo, manager } };
    HStore.addEmployee(emp); onClose();
  };

  const lab={fontSize:11,fontWeight:600,color:'var(--muted)',letterSpacing:'.02em'};
  const inp={padding:'8px 10px',border:'1px solid var(--border)',borderRadius:7,background:'var(--surface)',color:'var(--text)',fontSize:12.5,fontFamily:'inherit',width:'100%',boxSizing:'border-box'};
  const F=({k,label,type,opts,wide,ph})=><div style={{display:'flex',flexDirection:'column',gap:4,gridColumn:wide?'1 / -1':'auto'}}>
    <span style={lab}>{label}{errs[k]&&touched&&<span style={{color:'var(--red)'}}> · {errs[k]}</span>}</span>
    {opts? <select style={inp} value={v[k]} onChange={e=>set(k,e.target.value)}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select>
      : type==='textarea'? <textarea style={{...inp,minHeight:46,resize:'vertical'}} value={v[k]} placeholder={ph} onChange={e=>set(k,e.target.value)}/>
      : <input type={type==='date'?'date':'text'} style={inp} value={v[k]} placeholder={ph} onChange={e=>set(k,e.target.value)}/>}
  </div>;
  const Sec=({t})=><div style={{gridColumn:'1 / -1',display:'flex',alignItems:'center',gap:8,margin:'6px 0 0'}}>
    <span style={{fontSize:11.5,fontWeight:700,color:'var(--accent)',textTransform:'uppercase',letterSpacing:'.05em'}}>{t}</span>
    <span style={{flex:1,height:1,background:'var(--border-2)'}}/></div>;

  return <><div className="drawer-backdrop" style={{zIndex:60}} onClick={onClose}/>
    <div role="dialog" style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:61,width:680,maxWidth:'94vw',
      maxHeight:'92vh',overflow:'auto',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:14,boxShadow:'0 24px 64px rgba(0,0,0,.28)'}}>
      <div style={{display:'flex',alignItems:'center',gap:11,padding:'16px 20px',borderBottom:'1px solid var(--border-2)',position:'sticky',top:0,background:'var(--surface)',zIndex:2}}>
        <span style={{width:34,height:34,borderRadius:9,background:'var(--accent-soft)',color:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="users" size={17}/></span>
        <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15}}>{isExpat?'New expatriate joiner · 360° capture':'New joiner · 360° capture'}</div>
          <div className="muted" style={{fontSize:12}}>Auto employee no. <b className="num" style={{color:'var(--accent)'}}>{empNo}</b> (REQ-009)</div></div>
        <button className="iconbtn" onClick={onClose}><Icon name="x" size={18}/></button>
      </div>
      <div style={{padding:'14px 20px',display:'flex',gap:10,alignItems:'center',borderBottom:'1px solid var(--border-2)',background:'var(--surface-2)'}}>
        <Icon name="swap" size={15} style={{color:'var(--accent)'}}/>
        <span style={{fontSize:12,fontWeight:600}}>Smart fill — copy employment details from an existing employee:</span>
        <div style={{flex:1,maxWidth:260}}><EmployeePicker onPick={copyFrom} placeholder="Pick a template employee…"/></div>
      </div>
      <div style={{padding:20,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
        <Sec t="Personal"/>
        <F k="firstName" label="First name"/><F k="lastName" label="Last name"/><F k="gender" label="Gender" opts={['Male','Female']}/>
        <F k="dob" label="Date of birth" type="date"/><F k="maritalStatus" label="Marital status" opts={['Single','Married','Divorced','Widowed']}/><F k="nationality" label="Nationality"/>
        <F k="phone" label="Phone" ph="+255…"/><F k="email" label="Email"/><F k="bloodGroup" label="Blood group" opts={['O+','O-','A+','A-','B+','B-','AB+','AB-']}/>
        <F k="languages" label="Languages"/><F k="religion" label="Religion" opts={['Christian','Muslim','Other']}/><F k="address" label="Home address"/>
        <Sec t={isExpat?'Statutory identifiers (TIN / NSSF)':'Statutory identifiers'}/>
        {!isExpat && <F k="nida" label="NIDA (20 digits)"/>}
        <F k="tin" label="TIN (9 digits)"/><F k="nssf" label="NSSF no."/>
        <Sec t="Next of kin"/>
        <F k="kinName" label="Name"/><F k="kinRelation" label="Relationship" opts={['Spouse','Parent','Sibling','Child','Other']}/><F k="kinPhone" label="Phone"/>
        <Sec t="Employment"/>
        <F k="site" label="Site" opts={ALL_SITES}/><F k="department" label="Department" opts={NJ_DEPTS}/><F k="position" label="Position"/>
        <F k="grade" label="Grade" opts={GRADES}/><F k="rotation" label="Rotation" opts={['7x7x7','8-on-2-off','9-on-3-off','Standard','9wk-on-5-off']}/>
        <div style={{display:'flex',flexDirection:'column',gap:4}}><span style={lab}>Line manager <span className="muted">· auto</span></span>
          <div style={{...inp,background:'var(--surface-2)',color:'var(--muted)'}}>{manager}</div></div>
        <F k="employmentType" label="Employment type" opts={['Permanent','Fixed-term','Temporary','Expatriate']}/>
        <F k="hireDate" label="Hire date" type="date"/><F k="contractEnd" label="Contract end" type="date"/>
        {isExpat && <>
          <Sec t="Expatriate details · treated differently"/>
          <F k="homeCountry" label="Home country" ph="e.g. India"/>
          <F k="passportNo" label="Passport no."/>
          <F k="passportExpiry" label="Passport expiry" type="date"/>
          <F k="visaType" label="Visa type" opts={['Work','Business','Residence']}/>
          <F k="visaExpiry" label="Visa expiry" type="date"/>
          <F k="workPermitNo" label="Work permit no."/>
          <F k="permit" label="Work permit expiry" type="date"/>
          <F k="residencePermitExpiry" label="Residence permit expiry" type="date"/>
          <F k="taxStatus" label="Tax status" opts={['Non-resident','Resident']}/>
          <F k="dependantsRelocating" label="Dependants relocating" opts={['No','Yes']}/>
          <F k="repatriation" label="Repatriation / rotation flights" opts={['Annual flights','Bi-annual flights','None']}/>
          <div style={{gridColumn:'1 / -1',display:'flex',gap:8,alignItems:'center',padding:'9px 12px',borderRadius:8,background:'var(--accent-soft)',fontSize:11.5,color:'var(--muted)'}}>
            <Icon name="shield" size={14} style={{color:'var(--accent)'}}/>Permit, visa and passport expiries feed the compliance expiry-alerts automatically.</div>
        </>}
      </div>
      <div style={{display:'flex',gap:8,justifyContent:'space-between',alignItems:'center',padding:'14px 20px',borderTop:'1px solid var(--border-2)',position:'sticky',bottom:0,background:'var(--surface)'}}>
        <span className="muted" style={{fontSize:11.5}}>{valid?'All checks passed · ready to onboard':(touched?Object.keys(errs).length+' field(s) need attention':(isExpat?'Required: name, DOB, passport + expiry, work & residence permit expiries, home country, TIN, phone, position':'Required: name, DOB, NIDA, TIN, phone, position'))}</span>
        <div style={{display:'flex',gap:8}}>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" style={!valid&&touched?{opacity:.55}:null} onClick={submit}><Icon name="check" size={15}/>Onboard employee</button>
        </div>
      </div>
    </div></>;
}

// Validated employee-transfer dialog. Records site / role / grade moves to the audit trail.
function TransferModal({ emp, role, onClose }){
  const [toSite,setToSite] = React.useState(emp.site);
  const [toRole,setToRole] = React.useState(emp.role);
  const [toGrade,setToGrade] = React.useState(emp.grade);
  const [effective,setEffective] = React.useState(TODAY);
  const [reason,setReason] = React.useState('');
  const [approver,setApprover] = React.useState(role?role.name:'');
  const [touched,setTouched] = React.useState(false);

  const changed = toSite!==emp.site || toRole!==emp.role || toGrade!==emp.grade;
  const errors = {};
  if(!changed) errors.changed = 'Change at least one of site, position or grade.';
  if(!effective) errors.effective = 'Effective date is required.';
  else if(effective < TODAY) errors.effective = 'Effective date cannot be in the past.';
  if(reason.trim().length < 8) errors.reason = 'Give a reason (at least 8 characters) for the record.';
  if(!approver.trim()) errors.approver = 'An authorising manager is required.';
  const valid = Object.keys(errors).length===0;

  const submit = () => {
    setTouched(true);
    if(!valid) return;
    HStore.transfer({ emp, toSite, toRole, toGrade, effective, reason:reason.trim(),
      actor:approver.trim(), role:role?role.title:'HR' });
    onClose();
  };

  const fld = { display:'flex',flexDirection:'column',gap:5 };
  const lab = { fontSize:11.5,fontWeight:600,color:'var(--muted)',letterSpacing:'.02em' };
  const inp = { padding:'9px 11px',border:'1px solid var(--border)',borderRadius:8,background:'var(--surface)',
    color:'var(--text)',fontSize:13,fontFamily:'inherit',width:'100%' };
  const errStyle = { fontSize:11,color:'var(--red)',display:'flex',alignItems:'center',gap:4 };
  const showErr = (k) => touched && errors[k] && <span style={errStyle}><Icon name="alert" size={11}/>{errors[k]}</span>;
  const before = (label,v) => <span style={{fontSize:11.5,color:'var(--faint)'}}>was <b className="num" style={{color:'var(--muted)'}}>{v}</b></span>;

  return <><div className="drawer-backdrop" style={{zIndex:60}} onClick={onClose}/>
    <div role="dialog" style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:61,
      width:480,maxWidth:'92vw',maxHeight:'90vh',overflow:'auto',background:'var(--surface)',border:'1px solid var(--border)',
      borderRadius:14,boxShadow:'0 24px 64px rgba(0,0,0,.28)'}}>
      <div style={{display:'flex',alignItems:'center',gap:11,padding:'18px 20px',borderBottom:'1px solid var(--border-2)'}}>
        <span style={{width:34,height:34,borderRadius:9,background:'var(--accent-soft)',color:'var(--accent)',
          display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="swap" size={17}/></span>
        <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15}}>Transfer employee</div>
          <div className="muted" style={{fontSize:12}}>{emp.name} · <span className="num">{genEmpNo(emp)}</span></div></div>
        <button className="iconbtn" onClick={onClose}><Icon name="x" size={18}/></button>
      </div>
      <div style={{padding:20,display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <div style={{...fld,gridColumn:'1 / -1'}}><span style={lab}>DESTINATION SITE</span>
          <select style={inp} value={toSite} onChange={e=>setToSite(e.target.value)}>
            {ALL_SITES.map(s=><option key={s} value={s}>{s}</option>)}</select>
          {toSite!==emp.site && before('site',emp.site)}</div>
        <div style={fld}><span style={lab}>POSITION</span>
          <input style={inp} value={toRole} onChange={e=>setToRole(e.target.value)}/>
          {toRole!==emp.role && before('role',emp.role)}</div>
        <div style={fld}><span style={lab}>GRADE</span>
          <select style={inp} value={toGrade} onChange={e=>setToGrade(e.target.value)}>
            {GRADES.map(g=><option key={g} value={g}>{g}</option>)}</select>
          {toGrade!==emp.grade && before('grade',emp.grade)}</div>
        <div style={fld}><span style={lab}>EFFECTIVE DATE</span>
          <input type="date" min={TODAY} style={inp} value={effective} onChange={e=>setEffective(e.target.value)}/>
          {showErr('effective')}</div>
        <div style={fld}><span style={lab}>AUTHORISED BY</span>
          <input style={inp} value={approver} onChange={e=>setApprover(e.target.value)}/>
          {showErr('approver')}</div>
        <div style={{...fld,gridColumn:'1 / -1'}}><span style={lab}>REASON FOR TRANSFER</span>
          <textarea style={{...inp,minHeight:64,resize:'vertical'}} value={reason} onChange={e=>setReason(e.target.value)}
            placeholder="e.g. Operational redeployment to cover Dar Yard workshop surge"/>
          {showErr('reason')}{touched && errors.changed && <span style={errStyle}><Icon name="alert" size={11}/>{errors.changed}</span>}</div>
        <div style={{gridColumn:'1 / -1',display:'flex',alignItems:'center',gap:8,padding:'10px 12px',borderRadius:8,
          background:'var(--surface-2)',fontSize:11.5,color:'var(--muted)'}}>
          <Icon name="shield" size={14} style={{color:'var(--accent)'}}/>
          This action is written to the tamper-evident audit trail with before &rarr; after values (NFR-09).</div>
      </div>
      <div style={{display:'flex',gap:8,justifyContent:'flex-end',padding:'14px 20px',borderTop:'1px solid var(--border-2)'}}>
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className={'btn primary'+(touched&&!valid?' ':'')} style={touched&&!valid?{opacity:.55}:null} onClick={submit}>
          <Icon name="check" size={15}/>Record transfer</button>
      </div>
    </div></>;
}

function Employees({ siteFilter, money, role }){
  const st = useHStore();
  const [q,setQ] = React.useState('');
  const [tab,setTab] = React.useState('All');
  const [sel,setSel] = React.useState(null);
  React.useEffect(()=>{ if(st.focusEmp){ const e=HStore.employee(st.focusEmp); if(e){ setSel(empProfile(e)); } HStore.clearFocus(); } },[st.focusEmp]);
  const [xfer,setXfer] = React.useState(null);
  const [disc,setDisc] = React.useState(null);
  const [newNo,setNewNo] = React.useState(null);
  const [joiner,setJoiner] = React.useState(false);
  const [idcard,setIdcard] = React.useState(null);
  const canExpat = role && (role.id==='ceo' || role.id==='hrhead');
  const canTransfer = role && !role.readonly;
  const tabs = ['All','Active','On Leave',...(canExpat?['Expatriates']:[]),'Compliance'];
  const tabs2 = tabs;
  let rows = HStore.employees();
  if(siteFilter!=='All') rows = rows.filter(e=>e.site===siteFilter);
  if(tab==='Active') rows = rows.filter(e=>e.status==='Active');
  if(tab==='On Leave') rows = rows.filter(e=>e.status==='On Leave');
  if(tab==='Expatriates') rows = rows.filter(e=>e.expat);
  if(tab==='Compliance') rows = rows.filter(e=>e.medical==='Expiring'||e.disc>0);
  if(q) rows = rows.filter(e=>(e.name+e.no+e.role).toLowerCase().includes(q.toLowerCase()));
  const [pageRows, pager] = usePager(rows, 12);
  const exportEmps = ()=>exportCSV('employees.csv', ['Name','Emp No','Role','Grade','Site','Rotation','Contract end','Medical','Leave bal.','Status'],
    rows.map(e=>[e.name, genEmpNo(e), e.role, e.grade, e.site, e.rotation, e.contract, e.medical, e.leave, e.status]));

  return <div className="grid" style={{gap:16}}>
    <div className="grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
      <KPI icon="users" label="Records (filtered)" value={siteFilter==='All'?(TOTAL_HC+st.newHires.length).toLocaleString():SITES.find(s=>s.name===siteFilter)?.hc} sub={st.newHires.length?st.newHires.length+' new this period':'single source of truth'}/>
      <KPI icon="doc" label="Digital files" value="100%" sub="manual files retired"/>
      <KPI icon="alert" label="Compliance flags" value="9" sub="medicals · permits · discipline" trend="2 critical" trendDir="dn"/>
      <KPI icon="briefcase" label="Expatriates" value="25" sub="rotation tracked"/>
    </div>

    <Card>
      <div className="card-h">
        <div style={{display:'flex',gap:4}}>
          {tabs.map(t=><button key={t} className={'btn sm '+(tab===t?'primary':'ghost')} onClick={()=>setTab(t)}>{t}</button>)}
        </div>
        <div className="search" style={{marginLeft:'auto',width:200}}>
          <Icon name="search" size={15}/><input placeholder="Search name, ID, role…" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        <button className="btn sm ghost" onClick={exportEmps}><Icon name="download" size={14}/>Export</button>
        <button className="btn primary sm" onClick={()=>setJoiner(tab==='Expatriates'?'expat':true)}><Icon name="plus" size={14}/>{tab==='Expatriates'?'New expatriate':'New joiner'}</button>
      </div>
      {newNo && <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 20px',borderBottom:'1px solid var(--border-2)',
        background:'var(--accent-soft)',fontSize:12.5}}>
        <Icon name="check" size={15} style={{color:'var(--accent)'}}/>
        <span>Employee number auto-generated (REQ-009):</span>
        <b className="num" style={{color:'var(--accent)'}}>{newNo}</b>
        <span className="muted">{EMP_NO_LEGEND}</span>
        <button className="btn sm ghost" style={{marginLeft:'auto'}} onClick={()=>setNewNo(null)}>Dismiss</button>
      </div>}
      <table className="tbl"><thead><tr>
        <th>Employee</th><th>Emp. No</th><th>Role / Grade</th><th>Site</th><th>Rotation</th>
        <th>Contract</th><th>Medical</th><th>Leave bal.</th><th>Status</th><th></th></tr></thead>
        <tbody>{pageRows.map(e=><tr key={e.no} className="clickable" onClick={()=>setSel(empProfile(e))}>
          <td><RowName name={e.name} sub={e.expat?'Expatriate':('Joined '+e.joined)}/></td>
          <td className="num muted" style={{fontSize:11.5}}>{genEmpNo(e)}</td>
          <td>{e.role}<div className="muted" style={{fontSize:11.5}}>{e.grade}</div></td>
          <td className="muted">{e.site}</td>
          <td><Tag tone="grey">{e.rotation}</Tag></td>
          <td className="num">{e.contract}</td>
          <td>{e.medical==='Valid'?<Tag tone="green" dot>Valid</Tag>:<Tag tone="yellow" dot>Expiring</Tag>}</td>
          <td className="num" style={{fontWeight:600}}>{e.leave.toFixed(1)}</td>
          <td>{e.status==='Active'?<Tag tone="green">Active</Tag>:e.status==='On Leave'?<Tag tone="blue">On Leave</Tag>:<Tag tone="red">{e.status}</Tag>}</td>
          <td style={{textAlign:'right'}}><Icon name="chevR" size={15} style={{color:'var(--faint)'}}/></td>
        </tr>)}</tbody></table>
      {rows.length===0 && <div className="empty">No employees match this filter.</div>}
      {pager}
    </Card>

    <div className="grid" style={{gridTemplateColumns:'1fr 1fr'}}>
      <Card>
        <CardH title="Policy & SOP library" icon="doc" meta="19 HR policies · onboarding ack."/>
        <div className="card-p">{POLICIES.map((p,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'1fr 90px 38px',
          alignItems:'center',gap:12,padding:'8px 0',borderBottom:i<POLICIES.length-1?'1px solid var(--border-2)':'none'}}>
          <span style={{fontSize:13,fontWeight:500}}>{p.name}</span>
          <span className="bar"><i style={{width:p.ack+'%',background:p.ack>=90?'var(--green)':p.ack>=80?'var(--yellow)':'var(--red)'}}/></span>
          <span className="num" style={{fontSize:12,fontWeight:600,textAlign:'right'}}>{p.ack}%</span>
        </div>)}</div>
      </Card>
      <Card>
        <CardH title="Document & contract control" icon="shield" meta="versioned · access-controlled"/>
        <div className="card-p" style={{display:'flex',flexDirection:'column',gap:13}}>
          {[['Appointment letters generated (Jun)',62,'var(--green)'],['Route forms e-signed',38,'var(--blue)'],
            ['Job descriptions on file','94%','var(--green)'],['Disciplinary records logged',11,'var(--yellow)']].map((r,i)=>
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,fontSize:13.5,padding:'4px 0',borderBottom:'1px solid var(--border-2)'}}>
              <Icon name="doc" size={15} style={{color:'var(--accent)'}}/><span>{r[0]}</span>
              <span className="num" style={{marginLeft:'auto',fontWeight:600}}>{r[1]}</span></div>)}
          <div style={{display:'flex',gap:8}}><button className="btn sm" onClick={()=>toast('HR data exported to Exact')}><Icon name="download" size={13}/>Export to Exact</button>
            <button className="btn sm ghost" onClick={()=>toast('Opening audit trail…')}>Audit trail</button></div>
        </div>
      </Card>
    </div>

    {sel && <>
      <div className="drawer-backdrop" onClick={()=>setSel(null)}/>
      <div className="drawer-panel"><EmployeeProfile prof={sel} money={money} onClose={()=>setSel(null)}
        onTransfer={canTransfer?()=>setXfer(sel.base):null}
        onIdCard={()=>setIdcard(sel)}
        onShareDoc={canTransfer?()=>HStore.shareDocument({no:sel.base.no,name:sel.base.name,docName:'HR letter · '+new Date().toLocaleDateString('en-GB')}):null}
        onDiscipline={canTransfer?()=>setDisc(sel.base):null}/></div>
    </>}

    {idcard && <IdCardModal prof={idcard} photo={window.HStore?HStore.profilePhoto(idcard.base.no):null} role={role} onClose={()=>setIdcard(null)}/>}

    {xfer && <TransferModal emp={xfer} role={role} onClose={()=>{ setXfer(null); setSel(null); }}/>}
    {disc && <FormModal title={'Disciplinary · '+disc.name} icon="alert" submitLabel="Record"
      fields={[
        {key:'type',label:'Type',type:'select',options:['Verbal warning','Written warning','Final warning','Suspension'],required:true},
        {key:'date',label:'Date',type:'date',default:'2026-06-24',required:true},
        {key:'note',label:'Details',type:'textarea',wide:true,required:true,placeholder:'Nature of the matter…'}]}
      onSubmit={v=>HStore.recordDisciplinary({no:disc.no,name:disc.name,type:v.type,note:v.note,date:v.date})}
      onClose={()=>setDisc(null)}/>}
    {joiner && <NewJoinerModal siteFilter={siteFilter} expat={joiner==='expat'} onClose={()=>setJoiner(false)}/>}
  </div>;
}
window.Employees = Employees;
