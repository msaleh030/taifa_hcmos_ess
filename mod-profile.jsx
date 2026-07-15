// Comprehensive employee profile panel — desktop drawer (HR), ESS & role mobile.
// selfView=true → employee viewing their OWN record: basic info only, sensitive
// fields secured, editable fields offer a "Request change" flow, system fields locked.
function PField({ label, value, mono, wide, locked, editable, requested, onRequest }){
  return <div className="prof-f" style={wide?{gridColumn:'1 / -1'}:null}>
    <div className="prof-fl">{label}{locked&&<Icon name="lock" size={10} style={{marginLeft:5,verticalAlign:'-1px',color:'var(--faint)'}}/>}</div>
    <div className={'prof-fv'+(mono?' num':'')}>{value||'—'}</div>
    {editable && (requested
      ? <span className="prof-req done"><Icon name="check" size={12}/>Change requested</span>
      : <button className="prof-req" onClick={onRequest}><Icon name="swap" size={12}/>Request change</button>)}
  </div>;
}
function PSection({ title, icon, children, cols=2, note }){
  return <div className="prof-sec">
    <div className="prof-sh"><Icon name={icon} size={15} style={{color:'var(--accent)'}}/>{title}
      {note&&<span className="prof-note">{note}</span>}</div>
    <div className="prof-grid" style={{gridTemplateColumns:`repeat(${cols},1fr)`}}>{children}</div>
  </div>;
}
function EmployeeProfile({ prof, money=false, onClose, selfView=false, onTransfer, onShareDoc, onDiscipline, onIdCard }){
  const p=prof.personal, em=prof.employment, k=prof.kin, c=prof.comp, lv=prof.leave, e=prof.base;
  const sx = (typeof useHStore!=='undefined') ? useHStore() : (window.HStore?HStore.get():{});
  const live = (window.HStore && HStore.employee(e.no)) || e;
  const storeDisc = (sx.disciplinary && sx.disciplinary[e.no]) || [];
  const discList = [...storeDisc.map(d=>({date:d.date,type:d.type,note:d.note})), ...prof.discipline];
  const statusTone = live.status==='Active'?'green':live.status==='On Leave'?'blue':'red';
  const [reqs,setReqs] = React.useState({});
  const req = (f) => setReqs(r=>({...r,[f]:true}));
  // apply approved self-service write-backs over the displayed record
  const ov = (window.HStore) ? HStore.profileEditsOf(e.no) : {};
  if(ov.phone) p.phone=ov.phone; if(ov.email) p.email=ov.email; if(ov.address) p.address=ov.address;
  if(ov.maritalStatus) p.maritalStatus=ov.maritalStatus; if(ov.bloodGroup) p.bloodGroup=ov.bloodGroup;
  if(ov.kinName) k.name=ov.kinName; if(ov.kinRelation) k.relation=ov.kinRelation; if(ov.kinPhone) k.phone=ov.kinPhone;
  const pendingCR = (sx.changeRequests||[]).filter(c=>c.no===e.no && c.status==='Pending');
  const reqMeta = { phone:['Phone',p.phone,'phone'], email:['Email',p.email,'email'], address:['Home address',p.address,'address'],
    marital:['Marital status',p.maritalStatus,'maritalStatus'], blood:['Blood group',p.bloodGroup,'bloodGroup'],
    kinName:['Next of kin',k.name,'kinName'], kinRel:['Kin relationship',k.relation,'kinRelation'], kinPhone:['Kin phone',k.phone,'kinPhone'] };
  const ed = (f) => { if(!selfView) return {}; const m=reqMeta[f]; const has=pendingCR.some(c=>c.field===(m?m[2]:f));
    return { editable:true, requested:has||!!reqs[f], onRequest:async()=>{ if(!m||!window.HStore) return;
      const to=await uiDialog({title:'Request '+m[0]+' change', message:'HR will review and approve this update.', input:true, default:m[1]||'', placeholder:'New '+m[0], icon:'swap', confirmLabel:'Request change'});
      if(to!=null && to.trim() && to.trim()!==(m[1]||'')){
        HStore.requestProfileChange({no:e.no,name:e.name,field:m[2],label:m[0],from:m[1]||'—',to:to.trim()}); req(f); } } }; };
  const photo = (window.HStore) ? HStore.profilePhoto(e.no) : null;
  const complete = (window.HStore) ? HStore.profileComplete(e.no) : true;
  const activity = (sx.activity && sx.activity[e.no]) || [];
  const onPhoto = async (ev)=>{ const f = ev.target.files && ev.target.files[0];
    if(f && window.cropImageToSquare){ try{ const d = await cropImageToSquare(f); HStore.setProfilePhoto(e.no, d, selfView?e.name:'HR'); }catch(_){} }
    ev.target.value=''; };

  return <div className="prof">
    <div className="prof-head">
      <div className="prof-id">
        <label className="prof-photo" title="Update profile photo">
          <Avatar name={e.name} size={54} photo={photo}/>
          <span className="prof-photo-cam"><Icon name="camera" size={12}/></span>
          <input type="file" accept="image/*" onChange={onPhoto} style={{display:'none'}}/>
        </label>
        <div className="prof-id-txt">
          <div className="prof-name">{e.name}</div>
          <div className="prof-role">{em.role} · {em.grade} · {em.site}</div>
        </div>
        {onClose && <button className="iconbtn prof-x" onClick={onClose}><Icon name="x" size={18}/></button>}
      </div>
      <div className="prof-chips">
        <span className={'pchip status-'+statusTone}><span className="dot"></span>{live.status}</span>
        <span className="pchip"><span className="k">ID</span><span className="v">{em.empNo}</span></span>
        <span className="pchip"><span className="k">Rotation</span><span className="v rot">{em.rotation}</span></span>
        {e.expat&&<span className="pchip status-yellow"><span className="dot"></span>Expatriate</span>}
        {!selfView && (complete
          ? <span className="pchip status-green"><span className="dot"></span>Profile complete</span>
          : <span className="pchip status-yellow"><span className="dot"></span>Profile incomplete</span>)}
      </div>
      {(onTransfer||onShareDoc||onDiscipline||onIdCard) && <div className="prof-actions">
        {onIdCard && <button className="btn sm" onClick={onIdCard}><Icon name="shield" size={14}/>ID card</button>}
        {onTransfer && <button className="btn sm" onClick={onTransfer}><Icon name="swap" size={14}/>Transfer</button>}
        {onShareDoc && <button className="btn sm" onClick={onShareDoc}><Icon name="doc" size={14}/>Share doc</button>}
        {onDiscipline && <button className="btn sm danger" onClick={onDiscipline}><Icon name="alert" size={14}/>Disciplinary</button>}
        {!selfView && (live.status==='Suspended'
          ? <button className="btn sm" onClick={()=>HStore.reinstateEmployee({no:e.no})}><Icon name="check" size={14}/>Reinstate</button>
          : <button className="btn sm danger" onClick={async()=>{ const r=await uiDialog({title:'Suspend '+e.name, message:'ESS access will be blocked and assets flagged for IT recovery.', input:true, placeholder:'Reason for suspension', danger:true, icon:'lock', confirmLabel:'Suspend'}); if(r!=null) HStore.suspendEmployee({no:e.no,reason:r}); }}><Icon name="lock" size={14}/>Suspend</button>)}
      </div>}
    </div>
    <div className="prof-body">
      {!selfView && pendingCR.length>0 && <div className="prof-sec">
        <div className="prof-sh"><Icon name="swap" size={15} style={{color:'var(--accent)'}}/>Self-service change requests<span className="prof-note">approve to write back to the record</span></div>
        <div style={{display:'flex',flexDirection:'column',gap:7}}>{pendingCR.map(cr=><div key={cr.id} className="prof-doc" style={{background:'var(--surface-2)',gap:9}}>
          <Icon name="users" size={14} style={{color:'var(--blue)',flexShrink:0}}/>
          <span style={{flex:1,minWidth:0,fontSize:12.5}}>{cr.label}: <span style={{textDecoration:'line-through',color:'var(--faint)'}}>{cr.from}</span> <span style={{color:'var(--accent)'}}>&rarr;</span> <b>{cr.to}</b></span>
          <button className="btn sm primary" onClick={()=>HStore.decideProfileChange(cr.id,'Approved')}>Approve</button>
          <button className="btn sm" onClick={()=>HStore.decideProfileChange(cr.id,'Rejected')}>Decline</button>
        </div>)}</div>
      </div>}
      {selfView && <div className="prof-banner">
        <Icon name="shield" size={15} style={{color:'var(--accent)'}}/>
        <span>This is your basic profile. Statutory IDs and pay are held securely by HR. You can
          <b> request changes</b> to your contact and next-of-kin details — HR reviews and approves them.</span>
      </div>}

      {selfView && !complete && <div className="prof-banner" style={{background:'var(--yellow-soft)',flexDirection:'column',alignItems:'stretch',gap:10}}>
        <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
          <Icon name="alert" size={15} style={{color:'#9A6B00',flexShrink:0,marginTop:1}}/>
          <span><b>Your profile is incomplete.</b> Add a profile photo and confirm your details to unlock leave, payslips, documents, policies and performance.</span>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <label className="btn sm primary" style={{cursor:'pointer'}}><Icon name="camera" size={14}/>Add photo
            <input type="file" accept="image/*" onChange={onPhoto} style={{display:'none'}}/></label>
          <button className="btn sm" onClick={()=>HStore.completeProfile(e.no, e.name)}><Icon name="check" size={14}/>Confirm my details</button>
        </div>
      </div>}

      <PSection title="Personal" icon="users">
        <PField label="Full name" value={p.fullName}/>
        <PField label="Date of birth" value={`${p.dob} (${p.age})`} mono/>
        <PField label="Gender" value={p.gender}/>
        <PField label="Marital status" value={p.maritalStatus} {...ed('marital')}/>
        <PField label="Nationality" value={p.nationality}/>
        <PField label="Blood group" value={p.bloodGroup} {...ed('blood')}/>
        <PField label="Phone" value={p.phone} mono {...ed('phone')}/>
        <PField label="Email" value={p.email} {...ed('email')}/>
        <PField label="Home address" value={p.address} wide {...ed('address')}/>
        <PField label="Languages" value={p.languages}/>
        <PField label="Religion" value={p.religion}/>
      </PSection>

      {selfView
        ? <div className="prof-sec">
            <div className="prof-sh"><Icon name="lock" size={15} style={{color:'var(--accent)'}}/>Statutory identifiers</div>
            <div className="prof-secured"><Icon name="shield" size={15}/>
              <span>NIDA, TIN and NSSF numbers are held securely by HR and are not shown here.
                Contact HR if an identifier needs correcting.</span></div>
          </div>
        : <PSection title="Statutory identifiers" icon="lock">
            <PField label="National ID (NIDA)" value={p.nida} mono wide locked/>
            <PField label="TIN" value={p.tin} mono locked/>
            <PField label="NSSF number" value={p.nssf} mono locked/>
          </PSection>}

      <PSection title="Next of kin" icon="heart">
        <PField label="Name" value={k.name} {...ed('kinName')}/>
        <PField label="Relationship" value={k.relation} {...ed('kinRel')}/>
        <PField label="Phone" value={k.phone} mono wide {...ed('kinPhone')}/>
      </PSection>

      <PSection title="Employment" icon="briefcase" note={selfView?'system-managed · read-only':null}>
        <PField label="Employee no." value={em.empNo} mono locked/>
        <PField label="Department" value={em.department} locked={selfView}/>
        <PField label="Position" value={em.role} locked={selfView}/>
        <PField label="Grade" value={em.grade} locked={selfView}/>
        <PField label="Site / location" value={em.site} locked={selfView}/>
        <PField label="Line manager" value={em.manager} locked={selfView}/>
        <PField label="Rotation" value={em.rotation} locked={selfView}/>
        <PField label="Contract type" value={em.contractType} locked={selfView}/>
        <PField label="Date joined" value={em.joined} mono locked={selfView}/>
        <PField label="Contract end" value={em.contract} mono locked={selfView}/>
        <PField label="Tenure" value={em.tenure}/>
        {!selfView && <PField label="Work permit" value={em.permit}/>}
      </PSection>

      {!selfView && money && <PSection title="Compensation" icon="money">
        <PField label="Grade band" value={c.band}/>
        <PField label="Basic salary" value={c.basic} mono/>
        <PField label="Pay mode" value={c.payMode}/>
        <PField label="Bank" value={c.bank}/>
        <PField label="Account" value={c.account} mono/>
      </PSection>}
      {selfView && <div className="prof-sec">
        <div className="prof-sh"><Icon name="money" size={15} style={{color:'var(--accent)'}}/>Pay</div>
        <div className="prof-secured"><Icon name="lock" size={15}/>
          <span>Salary and bank details are confidential. View your earnings on your monthly payslip.</span></div>
      </div>}

      <PSection title="Leave" icon="calendar">
        <PField label="Balance (days)" value={lv.balance} mono/>
        <PField label="Taken (YTD)" value={lv.taken} mono/>
        <PField label="Carry-over" value={lv.carryover} mono/>
        {!selfView && <PField label="Liability" value={lv.liability} mono/>}
      </PSection>

      <div className="prof-sec">
        <div className="prof-sh"><Icon name="doc" size={15} style={{color:'var(--accent)'}}/>Documents</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {prof.docs.map((d,i)=><div key={i} className="prof-doc">
            <Icon name="doc" size={15} style={{color:'var(--muted)'}}/><span>{d.name}</span>
            <Tag tone={d.tone} style={{marginLeft:'auto'}}>{d.tag}</Tag></div>)}
        </div>
      </div>

      <div className="prof-sec">
        <div className="prof-sh"><Icon name="award" size={15} style={{color:'var(--accent)'}}/>Training & certifications</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {prof.training.filter(t=>t.name!=='—').map((t,i)=><div key={i} className="prof-doc">
            <Icon name="award" size={15} style={{color:'var(--muted)'}}/><span>{t.name}</span>
            <Tag tone={t.status==='In progress'?'yellow':'green'} style={{marginLeft:'auto'}}>{t.status}</Tag></div>)}
        </div>
      </div>

      {!selfView && <div className="prof-sec">
        <div className="prof-sh"><Icon name="briefcase" size={15} style={{color:'var(--accent)'}}/>Company assets<span className="prof-note">IT-managed · lifecycle</span></div>
        {(window.HStore?HStore.assetsOf(e.no):[]).length
          ? <div style={{display:'flex',flexDirection:'column',gap:7}}>{HStore.assetsOf(e.no).map(a=>{ const due=HStore.assetDue(a); return <div key={a.id} className="prof-doc">
              <Icon name="briefcase" size={14} style={{color:'var(--muted)'}}/><span>{a.name} <span className="muted num" style={{fontSize:11}}>{a.serial}</span></span>
              <Tag tone={a.status==='Recover'?'red':a.status==='Replaced'?'grey':due?'yellow':'green'} style={{marginLeft:'auto'}}>{a.status==='Recover'?'Recover':a.status==='Replaced'?'Replaced':due?'Replace due':'In service'}</Tag></div>; })}</div>
          : <div className="muted" style={{fontSize:12.5}}>No assets assigned.</div>}
      </div>}

      <div className="prof-sec">
        <div className="prof-sh"><Icon name="shield" size={15} style={{color:'var(--accent)'}}/>HSEQ{!selfView&&' & conduct'}</div>
        <div className="prof-grid" style={{gridTemplateColumns:'repeat(2,1fr)'}}>
          <PField label="PPE" value={prof.hseq.ppe}/>
          <PField label="Last medical" value={prof.hseq.lastMedical} mono/>
          {!selfView && <PField label="Safety incidents" value={prof.hseq.incidents} mono/>}
          {!selfView && <PField label="Disciplinary records" value={discList.length} mono/>}
        </div>
        {!selfView && discList.length>0 && <div style={{marginTop:8,display:'flex',flexDirection:'column',gap:6}}>
          {discList.map((d,i)=><div key={i} className="prof-doc" style={{background:'var(--red-soft)'}}>
            <Icon name="alert" size={14} style={{color:'var(--red)'}}/><span>{d.type} · {d.note}</span>
            <span className="num muted" style={{marginLeft:'auto',fontSize:11}}>{d.date}</span></div>)}
        </div>}
      </div>
    </div>
  </div>;
}
window.EmployeeProfile = EmployeeProfile;
