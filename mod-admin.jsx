// Module: Security & Access (IT / Admin)
function Admin({ role }){
  const st = useHStore();
  const [aType,setAType] = React.useState('all');   // all · user · system
  const [aAct,setAAct]   = React.useState('all');
  const [aq,setAq]       = React.useState('');
  const [showExport,setShowExport] = React.useState(false);
  const [assetForm,setAssetForm] = React.useState(false);
  const accessRows = (window.HStore?HStore.employees():[]);
  const [accessPageRows, accessPager] = usePager(accessRows, 8);
  const pendingAccess = Object.entries(st.access||{}).filter(([no,a])=>a.status==='pending');
  const dueCount = (st.assets||[]).filter(a=>HStore.assetDue(a)).length;
  const myEmail = (role && role.email) || 'audit@taifamining.tz';
  // Confidentiality / access matrix — derived from the canonical role set so it is
  // always truthful (12 backend roles + Employee/ESS). Security-correctness, not a fixed table.
  const mxRoles = (typeof ROLES!=='undefined'?ROLES:[]).filter(r=>!r.mobile);
  const mxMods = [['overview','Workforce Overview'],['employees','Employees'],['leave','Leave & Attendance'],
    ['performance','Performance'],['hseq','HSEQ'],['payroll','Payroll / Exact'],['reports','Reports'],['admin','Access & Audit']];
  const mxCell = (r, modId)=>{
    const has = modId==='payroll' ? (r.pages.includes('payroll')||r.pages.includes('integration')) : r.pages.includes(modId);
    if(!has) return 'N'; if(r.readonly) return 'R'; if(r.scope && r.scope!=='all') return 'S'; return 'F'; };
  const mxLabel = { F:['F','mx-f'], R:['R','mx-r'], S:['S','mx-f'], N:['–','mx-n'] };
  const provisioning = [
    { name:'Fatuma Ally',  no:'TMC-05533', role:'Equipment Operator', step:'Account active · ESS PIN issued', state:'done' },
    { name:'Neema Joseph', no:'TMC-05290', role:'Project HR',          step:'Awaiting line-manager approval',  state:'pending' },
    { name:'New requisition (REQ-Fit-09)', no:'—', role:'Fitter x2',  step:'Provision on offer acceptance',   state:'queued' },
  ];
  const integ = st.integrity;
  const isSys = (a)=> a.actor==='System' || a.role==='Automation';
  const sysCount = st.audit.filter(isSys).length;
  const userCount = st.audit.length - sysCount;
  const auditViewers = (typeof ROLES!=='undefined'?ROLES:[]).filter(r=>r.pages && (r.pages.includes('admin')||r.readonly));
  const actions = ['all', ...Array.from(new Set(st.audit.map(a=>a.action)))];
  let shown = [...st.audit].reverse();
  if(aType!=='all') shown = shown.filter(a=> aType==='system' ? isSys(a) : !isSys(a));
  if(aAct!=='all')  shown = shown.filter(a=>a.action===aAct);
  if(aq.trim()){ const q=aq.toLowerCase();
    shown = shown.filter(a=>(`${a.actor||''} ${a.subject||''} ${a.entity||''} ${a.entityId||''} ${a.reason||''}`).toLowerCase().includes(q)); }
  const ledger = shown;
  const [ledgerRows, ledgerPager] = usePager(shown, 12);
  const actionTone = { Transfer:'blue', Approve:'green', Reject:'red', Suspend:'red', Update:'yellow', Reset:'grey',
    Create:'green', Generate:'blue', Export:'blue', Document:'grey', Policy:'green', Training:'blue', Review:'blue', Schedule:'blue', Disciplinary:'red', Submit:'yellow' };
  const sendAuditExport = (fmt)=>{
    if(window.HStore) HStore.record({ actor:role?role.name:'IT Administrator', role:role?role.title:'IT', action:'Export', entity:'Audit log', entityId:'AUDIT-TRAIL', subject:'Governance export',
      reason:`Audit trail exported as ${fmt} · emailed strictly to ${myEmail} · ${shown.length} events`, changes:[{field:'Format',before:'—',after:fmt}] });
    window.toast(`Audit log emailed to you · ${fmt}`, 'check');
  };
  const offboard = [
    { name:'Peter Komba', no:'TMC-02210', task:'Recover laptop + site radio', status:'Open' },
    { name:'Ex-driver (TMC-01188)', no:'TMC-01188', task:'Disable AD account', status:'Done' },
  ];
  return <div className="grid" style={{gap:16}}>
    <div className="grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
      <KPI icon="users" label="Active accounts" value="1,061" sub="of 1,077 employees"/>
      <KPI icon="shield" label="Roles configured" value={(typeof ROLES!=='undefined'?ROLES.length:13)} sub={mxRoles.length+" backend + Employee (ESS)"}/>
      <KPI icon="alert" label="Pending provisioning" value="2" sub="awaiting approval"/>
      <KPI icon="doc" label="Audit events logged" value={st.audit.length} sub="append-only · hash-chained" trend={integ.ok?'integrity ok':'TAMPERED'} trendDir={integ.ok?'up':'dn'}/>
    </div>

    <Card>
      <CardH title="Role-based access matrix" icon="shield" meta={mxRoles.length+' backend roles · F full · R read · S site-scoped · – none'}/>
      <div className="card-p" style={{overflowX:'auto'}}>
        <table className="matrix"><thead><tr><th>Module</th>{mxRoles.map(r=><th key={r.id} title={r.title}>{r.initials}</th>)}</tr></thead>
          <tbody>{mxMods.map(([mid,label],i)=><tr key={i}><td>{label}</td>
            {mxRoles.map(r=>{ const c=mxCell(r,mid); return <td key={r.id}><span className={'mx '+mxLabel[c][1]} title={r.title}>{mxLabel[c][0]}</span></td>; })}
          </tr>)}</tbody></table>
        <div style={{display:'flex',gap:16,marginTop:12,fontSize:11.5,color:'var(--muted)'}}>
          <span><span className="mx mx-f">F</span> Full</span>
          <span><span className="mx mx-r">R</span> Read-only</span>
          <span><span className="mx mx-f">S</span> Site-scoped</span>
          <span><span className="mx mx-n">–</span> No access</span>
        </div>
      </div>
    </Card>

    <div className="grid" style={{gridTemplateColumns:'1fr 1fr'}}>
      <Card>
        <CardH title="User provisioning" icon="users" meta="REQ-029 · new-hire workflow"/>
        <div className="card-p">{provisioning.map((p,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:11,
          padding:'10px 0',borderBottom:i<provisioning.length-1?'1px solid var(--border-2)':'none'}}>
          <span style={{width:18,height:18,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',
            background:p.state==='done'?'var(--green)':p.state==='pending'?'var(--yellow)':'var(--surface-2)',color:p.state==='queued'?'var(--faint)':'#fff'}}>
            {p.state==='done'?<Icon name="check" size={11}/>:<Icon name="clock" size={11}/>}</span>
          <div style={{minWidth:0}}><div style={{fontWeight:600,fontSize:13}}>{p.name} <span className="muted num" style={{fontWeight:400,fontSize:11}}>{p.no}</span></div>
            <div className="muted" style={{fontSize:11.5}}>{p.role} · {p.step}</div></div>
          {p.state==='pending'&&<button className="btn sm primary" style={{marginLeft:'auto'}} onClick={()=>toast('Account provisioned · PIN issued')}>Approve</button>}
        </div>)}</div>
      </Card>
      <Card>
        <CardH title="Offboarding & asset recovery" icon="briefcase" meta="REQ-031"/>
        <div className="card-p">{offboard.map((o,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:11,
          padding:'10px 0',borderBottom:i<offboard.length-1?'1px solid var(--border-2)':'none'}}>
          <Avatar name={o.name} size={28}/>
          <div style={{minWidth:0}}><div style={{fontWeight:600,fontSize:13}}>{o.name}</div>
            <div className="muted" style={{fontSize:11.5}}>{o.task}</div></div>
          {o.status==='Open'?<Tag tone="yellow" style={{marginLeft:'auto'}}>Open</Tag>:<Tag tone="green" style={{marginLeft:'auto'}}>Done</Tag>}
        </div>)}
        <div style={{marginTop:12,padding:12,borderRadius:8,background:'var(--surface-2)',display:'flex',gap:9,alignItems:'center',fontSize:12.5,color:'var(--muted)'}}>
          <Icon name="phone" size={15} style={{color:'var(--accent)'}}/>24/7 support help line active · avg response 4 min (REQ-061)</div>
        </div>
      </Card>
    </div>

    {/* Governance & visibility — every action, human or automated, is captured & visible to the right roles */}
    <Card className="card-p" style={{padding:'14px 18px',display:'flex',alignItems:'center',gap:18,flexWrap:'wrap'}}>
      <div style={{display:'flex',alignItems:'center',gap:9}}>
        <span style={{width:32,height:32,borderRadius:9,background:'var(--accent-soft)',color:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="shield" size={17}/></span>
        <div><div style={{fontWeight:700,fontSize:13.5}}>Governance &amp; visibility</div>
          <div className="muted" style={{fontSize:11.5}}>every action captured · immutable · hash-chained</div></div>
      </div>
      <div style={{display:'flex',gap:20,marginLeft:'auto'}}>
        <div><div className="num" style={{fontWeight:700,fontSize:17,color:'var(--accent)'}}>100%</div><div style={{fontSize:10.5,color:'var(--faint)'}}>captured</div></div>
        <div><div className="num" style={{fontWeight:700,fontSize:17}}>{userCount}</div><div style={{fontSize:10.5,color:'var(--faint)'}}>user</div></div>
        <div><div className="num" style={{fontWeight:700,fontSize:17}}>{sysCount}</div><div style={{fontSize:10.5,color:'var(--faint)'}}>system</div></div>
      </div>
      <span className="muted" style={{fontSize:11.5,borderLeft:'1px solid var(--border)',paddingLeft:16}}>Full trail: IT &amp; Head&nbsp;of&nbsp;HR · exec org-wide · managers site-scoped</span>
    </Card>

    {/* User access administration — maker-checker, IT-managed end to end */}
    <Card>
      <CardH title="User access administration" icon="lock" meta="maker-checker · HR requests · IT approves"/>
      {pendingAccess.length>0 && <div className="card-p" style={{paddingBottom:4}}>
        {pendingAccess.map(([no,a])=>{ const e=HStore.employee(no); return <div key={no} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid var(--border-2)'}}>
          <Tag tone="yellow" dot>Pending</Tag>
          <div style={{flex:1,fontSize:13}}><b>{e?e.name:no}</b> <span className="muted">requested {a.level==='hcmos+ess'?'HCMOS + ESS':'ESS only'}{a.role?' · '+a.role:''} (maker: {a.maker||'HR'})</span></div>
          <button className="btn sm primary" onClick={()=>HStore.decideAccess(no,'Approved',role?role.name:'IT Administrator',role?role.title:'IT')}>Approve</button>
          <button className="btn sm" onClick={()=>HStore.decideAccess(no,'Rejected',role?role.name:'IT Administrator',role?role.title:'IT')}>Reject</button>
        </div>; })}
      </div>}
      <table className="tbl"><thead><tr><th>Employee</th><th>Site</th><th>Status</th><th>System role</th><th>Access</th><th>Account</th></tr></thead>
        <tbody>{accessPageRows.map(e=>{ const a=HStore.accessOf(e.no); const suspended=e.status==='Suspended';
          return <tr key={e.no}>
            <td><RowName name={e.name} sub={e.role}/></td>
            <td className="muted">{e.site}</td>
            <td>{suspended?<Tag tone="red" dot>Suspended</Tag>:<Tag tone="green" dot>Active</Tag>}</td>
            <td><select defaultValue={(ROLES.find(r2=>r2.title===a.role)||{}).id||''} disabled={suspended} onChange={ev=>ev.target.value&&HStore.assignUserRole({no:e.no,roleId:ev.target.value,actor:role?role.name:'IT Administrator'})}
              style={{padding:'5px 8px',border:'1px solid var(--border)',borderRadius:7,background:'var(--surface)',color:'var(--text)',fontSize:12,fontFamily:'inherit',maxWidth:140}}>
              <option value="">{a.role||'— assign role'}</option>
              {ROLES.map(r2=><option key={r2.id} value={r2.id}>{r2.title}</option>)}</select></td>
            <td><div className="sitefilter">{[['hcmos+ess','HCMOS+ESS'],['ess','ESS only'],['none','None']].map(([v,l])=>
              <button key={v} className={'pill '+(a.level===v?'on':'')} disabled={suspended&&v!=='none'} onClick={()=>HStore.setAccessLevel(e.no,v,role?role.name:'IT Administrator')}>{l}</button>)}</div></td>
            <td style={{whiteSpace:'nowrap'}}>{suspended
              ? <button className="btn sm" onClick={()=>HStore.reinstateEmployee({no:e.no,actor:role?role.name:'Head of HR',role:role?role.title:'HR'})}>Reinstate</button>
              : <><button className="btn sm danger" style={{marginRight:5}} onClick={async()=>{ const r=await uiDialog({title:'Suspend '+e.name, message:'ESS access will be blocked and assigned assets flagged for IT recovery.', input:true, placeholder:'Reason for suspension', danger:true, icon:'lock', confirmLabel:'Suspend'}); if(r!=null) HStore.suspendEmployee({no:e.no,reason:r,actor:role?role.name:'Head of HR',role:role?role.title:'HR'}); }}>Suspend</button>
                  <button className="iconbtn" style={{width:28,height:28}} title="De-provision user" onClick={async()=>{ if(await uiDialog({title:'De-provision '+e.name, message:'System access is revoked and assets flagged for recovery. This cannot be undone here.', danger:true, icon:'x', confirmLabel:'De-provision'})) HStore.deleteUser({no:e.no,actor:role?role.name:'IT Administrator'}); }}><Icon name="x" size={14}/></button></>}</td>
          </tr>; })}</tbody></table>
      {accessPager}
      <div className="card-p" style={{paddingTop:0,fontSize:11.5,color:'var(--muted)'}}>Backend (HCMOS) access requires an <b>Active</b> employee. Suspending auto-blocks ESS and flags assigned assets for IT recovery.</div>
    </Card>

    {/* Company assets — minimal register, lifecycle + intelligent replacement advice */}
    <Card>
      <CardH title="Company assets" icon="briefcase" meta="assigned · lifecycle · replacement advised"
        action={<button className="btn sm primary" style={{marginLeft:'auto'}} onClick={()=>setAssetForm(true)}><Icon name="plus" size={14}/>Assign asset</button>}/>
      <table className="tbl"><thead><tr><th>Asset</th><th>Holder</th><th>Serial</th><th>Issued</th><th>Lifecycle</th><th></th></tr></thead>
        <tbody>{(st.assets||[]).map(a=>{ const due=HStore.assetDue(a); const e=HStore.employee(a.no);
          return <tr key={a.id}>
            <td className="name">{a.name}<div className="muted" style={{fontSize:11}}>{a.type}</div></td>
            <td>{e?e.name:a.no}</td><td className="num muted">{a.serial}</td><td className="num muted">{a.issued}</td>
            <td>{a.status==='Recover'?<Tag tone="red" dot>Recover</Tag>:a.status==='Replaced'?<Tag tone="grey">Replaced</Tag>:due?<Tag tone="yellow"><Icon name="alert" size={11}/>Replace due</Tag>:<Tag tone="green" dot>In service</Tag>}<span className="muted" style={{fontSize:10.5,marginLeft:6}}>{a.lifespanMonths}mo</span></td>
            <td style={{whiteSpace:'nowrap',textAlign:'right'}}>{a.status==='Recover'?<button className="btn sm primary" onClick={()=>HStore.updateAsset(a.id,'Recovered')}>Recovered</button>:(due&&a.status!=='Replaced')?<button className="btn sm" onClick={()=>HStore.updateAsset(a.id,'Replaced')}>Replace</button>:null}</td>
          </tr>; })}</tbody></table>
      <div className="card-p" style={{paddingTop:0,fontSize:11.5,color:'var(--muted)',display:'flex',gap:7,alignItems:'center'}}>
        <Icon name="megaphone" size={14} style={{color:'var(--accent)'}}/>{dueCount?`${dueCount} asset${dueCount!==1?'s':''} past lifespan — IT advised to schedule replacement.`:'All assets within lifespan.'}</div>
    </Card>

    <SupportPanel/>

    <Card>
      <CardH title="Audit trail" icon="doc" meta="tamper-evident · before → after · hash-chained (NFR-09)"
        action={<div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8}}>
          <span className={'tag t-'+(integ.ok?'green':'red')} title={integ.checked?('Last checked '+integ.checked):'Not yet verified'} style={{gap:5}}>
            <Icon name={integ.ok?'shield':'alert'} size={12}/>{integ.ok?'Chain verified':('Broken at #'+integ.brokenAt)}</span>
          <button className="btn sm" onClick={()=>{ const r=HStore.verify(); toast(r.ok?'Integrity check passed · chain intact':'Integrity FAILED · record altered', r.ok?'check':'alert'); }}><Icon name="shield" size={13}/>Verify integrity</button>
          <button className="btn sm ghost" onClick={()=>setShowExport(true)}><Icon name="download" size={13}/>Export &amp; email</button>
          <button className="btn sm ghost" onClick={async()=>{ if(await uiDialog({title:'Reset demo data', message:'This clears all saved changes and restores the seed state.', danger:true, icon:'swap', confirmLabel:'Reset'})) HStore.reset(); }} title="Clear persisted demo state"><Icon name="swap" size={13}/>Reset demo</button>
        </div>}/>
      <div className="card-p" style={{paddingBottom:0,display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
        <div className="sitefilter">
          {[['all','All'],['user','User'],['system','System']].map(([v,l])=>
            <button key={v} className={'pill '+(aType===v?'on':'')} onClick={()=>setAType(v)}>{l}</button>)}
        </div>
        <select value={aAct} onChange={e=>setAAct(e.target.value)} style={{padding:'7px 10px',border:'1px solid var(--border)',borderRadius:8,background:'var(--surface)',color:'var(--text)',fontSize:12.5,fontFamily:'inherit'}}>
          {actions.map(a=><option key={a} value={a}>{a==='all'?'All actions':a}</option>)}
        </select>
        <div className="search" style={{flex:1,minWidth:180,maxWidth:320}}>
          <Icon name="search" size={14}/>
          <input placeholder="Search actor, record or reason…" value={aq} onChange={e=>setAq(e.target.value)}/>
        </div>
        <span className="meta">{shown.length} of {st.audit.length} events</span>
      </div>
      <table className="tbl"><thead><tr><th>User</th><th>Action</th><th>Record</th><th>Change</th><th>Time</th><th>Hash</th></tr></thead>
        <tbody>{ledgerRows.map((a)=><tr key={a.seq}>
          <td><div style={{display:'flex',alignItems:'center',gap:7}}><RowName name={a.actor} sub={a.role}/>
            {isSys(a)&&<Tag tone="blue" style={{flexShrink:0}}>system</Tag>}</div></td>
          <td><Tag tone={actionTone[a.action]||'grey'}>{a.action}</Tag></td>
          <td><div style={{fontSize:12.5,fontWeight:500}}>{a.subject||a.entity}</div>
            <div className="muted num" style={{fontSize:11}}>{a.entityId}</div></td>
          <td>{a.changes&&a.changes.length
            ? <div style={{display:'flex',flexDirection:'column',gap:3}}>{a.changes.map((c,j)=><div key={j} style={{fontSize:11.5}}>
                <span className="muted">{c.field}: </span><span style={{textDecoration:'line-through',color:'var(--faint)'}}>{c.before}</span>
                <span style={{margin:'0 4px',color:'var(--accent)'}}>&rarr;</span><b>{c.after}</b></div>)}
                {a.reason&&<div className="muted" style={{fontSize:10.5,marginTop:1}}>{a.reason}</div>}</div>
            : <span className="muted" style={{fontSize:11.5}}>{a.reason||'—'}</span>}</td>
          <td className="num muted" style={{fontSize:11,whiteSpace:'nowrap'}}>{a.ts.slice(5)}</td>
          <td className="num" style={{fontSize:10.5,color:'var(--faint)'}} title={'prev '+a.prevHash}>{a.hash}</td>
        </tr>)}
        {!ledger.length && <tr><td colSpan={6} className="muted" style={{textAlign:'center',padding:20,fontSize:12.5}}>No events match these filters.</td></tr>}
        </tbody></table>
      {ledgerPager}
    </Card>

    {showExport && <EmailExportModal title="Export audit log" subject={`Governance export · ${shown.length} events`}
      email={myEmail} formats={['PDF (signed)','Excel (XLSX)','CSV','JSON (chain)']} onSend={sendAuditExport} onClose={()=>setShowExport(false)}
      note="Tamper-evident export delivered only to your verified address. The export itself is recorded as an audit event."/>}

    {assetForm && <FormModal title="Assign company asset" icon="briefcase" submitLabel="Assign"
      onClose={()=>setAssetForm(false)} onSubmit={v=>HStore.assignAsset({no:v.employee_no||v.empNo,name:v.name,type:v.type,serial:v.serial,lifespanMonths:parseInt(v.lifespan)||36,actor:role?role.name:'IT Administrator',role:role?role.title:'IT'})}
      fields={[
        { key:'employee', label:'Assign to', type:'employee', required:true, wide:true },
        { key:'name', label:'Asset', required:true, wide:true, placeholder:'e.g. Laptop · Dell Latitude' },
        { key:'type', label:'Type', type:'select', options:['IT','Comms','PPE','Vehicle','Tools','Other'] },
        { key:'serial', label:'Serial / tag', placeholder:'auto if blank' },
        { key:'lifespan', label:'Lifespan (months)', type:'select', options:['12','24','36','48','60'] },
      ]}/>}
  </div>;
}
window.Admin = Admin;
