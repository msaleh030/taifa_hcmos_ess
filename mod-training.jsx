// Module: Training & Competency
function Training(){
  const store = useHStore();
  const t = TRAINING;
  const [nomForm,setNomForm] = React.useState(false);
  const tickets = store.training;
  const tone = { Pending:'yellow', Approved:'blue', Scheduled:'blue', Completed:'green', Rejected:'red' };
  const nextAction = { Pending:['Approved','Approve'], Approved:['Scheduled','Schedule seat'], Scheduled:['Completed','Mark complete'] };
  return <div className="grid" style={{gap:16}}>
    <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(178px,1fr))'}}>
      <KPI icon="award" label="Training compliance" value={t.compliance+'%'} sub="mandatory + competency" trend="+4%" trendDir="up"/>
      <KPI icon="alert" label="Mandatory due" value={t.mandatoryDue} sub="overdue or upcoming" trend="action" trendDir="dn"/>
      <KPI icon="shield" label="Certs expiring" value={t.certsExpiring} sub="next 30 days"/>
      <KPI icon="users" label="Seats this month" value={t.seatsThisMonth} sub="nominations & sessions"/>
    </div>

    <Card>
      <CardH title="Training requests from ESS" icon="award" meta="employee-submitted · manager/HR action flows back to ESS"
        action={<SyncBadge label="Live · ESS ⇄ HCMOS"/>}/>
      {tickets.length? <table className="tbl"><thead><tr><th>Employee</th><th>Course</th><th>Reason</th><th>Stage</th><th>Status</th><th></th></tr></thead>
        <tbody>{tickets.map(tk=><tr key={tk.id}>
          <td><RowName name={tk.name} sub={tk.site}/></td>
          <td className="name">{tk.course}</td>
          <td className="muted" style={{fontSize:12,maxWidth:200}}>{tk.reason}</td>
          <td className="muted" style={{fontSize:11.5}}>{tk.stage}</td>
          <td><Tag tone={tone[tk.status]}>{tk.status}</Tag>{tk.source==='ESS'&&<Tag tone="blue" style={{marginLeft:5}}>from ESS</Tag>}</td>
          <td style={{textAlign:'right',whiteSpace:'nowrap'}}>
            {nextAction[tk.status] && <>
              <button className="btn sm primary" style={{marginRight:5}} onClick={()=>HStore.updateTraining(tk.id,nextAction[tk.status][0])}>{nextAction[tk.status][1]}</button>
              {tk.status==='Pending' && <button className="btn sm" onClick={()=>HStore.updateTraining(tk.id,'Rejected')}>Decline</button>}</>}
            {tk.status==='Completed' && <Tag tone="green">Certificate on file</Tag>}
            {tk.status==='Rejected' && <Tag tone="red">Declined</Tag>}
          </td>
        </tr>)}</tbody></table>
        : <div className="empty">No training requests from employees yet.</div>}
    </Card>

    <div className="grid" style={{gridTemplateColumns:'1.4fr 1fr'}}>
      <Card>
        <CardH title="Course catalogue & completion" icon="award" meta="all sites"
          action={<button className="btn sm primary" style={{marginLeft:'auto'}} onClick={()=>setNomForm(true)}><Icon name="plus" size={13}/>Nominate</button>}/>
        <table className="tbl"><thead><tr><th>Course</th><th>Category</th><th>Enrolled</th><th>Completion</th><th>Validity</th></tr></thead>
          <tbody>{t.courses.map((c,i)=><tr key={i}>
            <td className="name">{c.name}</td>
            <td><Tag tone={c.cat==='Mandatory'?'red':c.cat==='Competency'?'yellow':'blue'}>{c.cat}</Tag></td>
            <td className="num muted">{c.enrolled.toLocaleString()}</td>
            <td><div style={{display:'flex',alignItems:'center',gap:9}}>
              <span className="bar" style={{width:90}}><i style={{width:c.complete+'%',background:c.complete>=90?'var(--green)':c.complete>=75?'var(--yellow)':'var(--red)'}}/></span>
              <span className="num" style={{fontSize:12,fontWeight:600}}>{c.complete}%</span></div></td>
            <td className="muted" style={{fontSize:12}}>{c.expiry}</td>
          </tr>)}</tbody></table>
      </Card>

      <Card>
        <CardH title="Certifications expiring" icon="shield" meta="OSHA · authorisations"/>
        <div className="card-p">{t.expiringCerts.map((c,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:11,
          padding:'10px 0',borderBottom:i<t.expiringCerts.length-1?'1px solid var(--border-2)':'none'}}>
          <Avatar name={c.who} size={30}/>
          <div style={{minWidth:0}}><div style={{fontWeight:600,fontSize:13}}>{c.who}</div>
            <div className="muted" style={{fontSize:11.5}}>{c.cert} · {c.site}</div></div>
          <div style={{textAlign:'right',marginLeft:'auto'}}><div className="num" style={{fontWeight:600,fontSize:12.5,
            color:c.days<=20?'var(--red)':'#9A6B00'}}>{c.days}d</div><div className="muted num" style={{fontSize:10.5}}>{c.date.slice(5)}</div></div>
        </div>)}
        <div style={{marginTop:12,padding:12,borderRadius:8,background:'var(--surface-2)',fontSize:12.5,color:'var(--muted)',display:'flex',gap:9,alignItems:'center'}}>
          <Icon name="award" size={15} style={{color:'var(--accent)'}}/>Links to the 6-step competency authorisation in HSEQ — no operator runs equipment without both sign-offs.</div>
        </div>
      </Card>
    </div>
    {nomForm && <FormModal title="Nominate for training" icon="award" submitLabel="Nominate"
      fields={[
        {key:'who',label:'Employee',type:'employee',required:true},
        {key:'course',label:'Course',type:'select',options:(typeof COURSE_CATALOGUE!=='undefined'?COURSE_CATALOGUE:['OSHA Safety Refresher']),required:true},
        {key:'when',label:'Target month',type:'text',default:'Jul 2026'},
        {key:'reason',label:'Reason',type:'textarea',wide:true,placeholder:'Why this nomination?'}]}
      onSubmit={vals=>{ toast(vals.who+' nominated · '+vals.course); }}
      onClose={()=>setNomForm(false)}/>
    }
  </div>;
}
window.Training = Training;
