// Module: Performance & Recruitment
function Performance(){
  const store = useHStore();
  const a = APPRAISALS;
  const [reqForm,setReqForm] = React.useState(false);
  const [revForm,setRevForm] = React.useState(false);
  const reviews = store.reviews;
  const statusTone = { Draft:'grey', Published:'blue', Acknowledged:'green' };
  return <div className="grid" style={{gap:16}}>
    <SecH>Performance appraisal — {a.cycle}</SecH>
    <div className="grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
      <KPI icon="award" label="Cycle completion" value={a.complete+'%'} sub={a.inProgress+'% in progress · '+a.notStarted+'% not started'} trend="quarterly" trendDir="up"/>
      <KPI icon="trend" label="Avg rating" value={a.avgRating} unit="/ 5" sub="5-point scale, all sites"/>
      <KPI icon="users" label="Reviews published to ESS" value={reviews.filter(r=>r.status!=='Draft').length} sub="employees notified"/>
      <KPI icon="check" label="Acknowledged" value={reviews.filter(r=>r.ack).length} sub="signed off by employee"/>
    </div>

    <div className="grid" style={{gridTemplateColumns:'1fr 1fr'}}>
      <Card>
        <CardH title="Goal & review cycles" icon="calendar" meta="FY26 · goal-setting → review"/>
        <table className="tbl"><thead><tr><th>Cycle</th><th>Type</th><th>Window</th><th>Applies to</th></tr></thead>
          <tbody>{REVIEW_CYCLES.map((c,i)=><tr key={i}>
            <td className="name">{c.name}</td>
            <td><Tag tone={c.type==='Annual'?'green':c.type==='Probation'?'yellow':'blue'}>{c.type}</Tag></td>
            <td className="num muted" style={{fontSize:12}}>{c.start} → {c.end}</td>
            <td className="muted" style={{fontSize:12.5}}>{c.applies}</td>
          </tr>)}</tbody></table>
      </Card>
      <Card>
        <CardH title="Rating scale" icon="chart" meta="5-point · standardised"/>
        <div className="card-p">{RATING_SCALE.map((r,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:11,
          padding:'9px 0',borderBottom:i<RATING_SCALE.length-1?'1px solid var(--border-2)':'none'}}>
          <span style={{width:26,height:26,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',
            fontWeight:700,fontSize:13,background:'var(--accent-soft)',color:'var(--accent)'}}>{r.v}</span>
          <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{r.label}</div></div>
          <Tag tone={r.tone}>{r.min}–{r.max}%</Tag>
        </div>)}</div>
      </Card>
    </div>

    <Card>
      <CardH title="Employee reviews" icon="award" meta="published reviews flow to the employee's ESS"
        action={<button className="btn sm primary" style={{marginLeft:'auto'}} onClick={()=>setRevForm(true)}><Icon name="plus" size={13}/>Assign review</button>}/>
      <table className="tbl"><thead><tr><th>Employee</th><th>Cycle</th><th>Reviewer</th><th>Rating</th><th>Status</th><th></th></tr></thead>
        <tbody>{reviews.map(r=><tr key={r.id}>
          <td><RowName name={r.name} sub={r.site}/></td>
          <td className="muted" style={{fontSize:12.5}}>{r.cycle}</td>
          <td className="muted">{r.reviewer}</td>
          <td>{r.rating? <Tag tone={RATING_SCALE.find(x=>x.v===r.rating)?.tone||'grey'}>{r.rating} · {r.label}</Tag> : <span className="muted">—</span>}</td>
          <td><Tag tone={statusTone[r.status]}>{r.status}{r.status==='Published'&&' · ESS'}</Tag></td>
          <td style={{textAlign:'right',whiteSpace:'nowrap'}}>
            {r.status==='Draft'
              ? <>{!r.rating && <button className="btn sm" style={{marginRight:5}} onClick={()=>HStore.setReviewRating(r.id,4,'Exceeds Expectations','Solid contribution this cycle.')}>Rate 4</button>}
                  <button className="btn sm primary" onClick={()=>HStore.publishReview(r.id)} disabled={!r.rating} style={!r.rating?{opacity:.5}:null}><Icon name="swap" size={12}/>Publish to ESS</button></>
              : r.status==='Published' ? <Tag tone="blue">Awaiting employee</Tag>
              : <Tag tone="green">Acknowledged</Tag>}
          </td>
        </tr>)}</tbody></table>
    </Card>

    <SecH>Recruitment</SecH>
    <div className="grid" style={{gridTemplateColumns:'1fr 1fr'}}>
      <Card>
        <CardH title="Requisition approval workflow" icon="briefcase" meta="7-step · SLA-tracked"/>
        <div className="card-p">{REQUISITION_WORKFLOW.map((s,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:11,
          padding:'8px 0',borderBottom:i<REQUISITION_WORKFLOW.length-1?'1px solid var(--border-2)':'none'}}>
          <span style={{width:22,height:22,borderRadius:'50%',background:'var(--accent-soft)',color:'var(--accent)',
            display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:11.5,flexShrink:0}}>{s.no}</span>
          <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{s.step}</div>
            <div className="muted" style={{fontSize:11.5}}>{s.role}</div></div>
          <Tag tone="grey">SLA {s.sla}d</Tag>
        </div>)}</div>
      </Card>
      <Card>
        <CardH title="Onboarding checklist" icon="clipboard" meta="new-hire · pre-start → confirmation"/>
        <div className="card-p" style={{maxHeight:332,overflowY:'auto'}}>{ONBOARDING_STEPS.map((s,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:10,
          padding:'7px 0',borderBottom:i<ONBOARDING_STEPS.length-1?'1px solid var(--border-2)':'none'}}>
          <Icon name="check" size={14} style={{color:'var(--green)',flexShrink:0}}/>
          <div style={{flex:1,minWidth:0}}><div style={{fontWeight:500,fontSize:12.5}}>{s.task}</div>
            <div className="muted" style={{fontSize:11}}>{s.owner} · {s.timing}</div></div>
          <Tag tone={s.sys==='System'?'blue':'grey'}>{s.sys}</Tag>
        </div>)}</div>
      </Card>
    </div>

    <Card>
      <CardH title="Open requisitions" icon="briefcase" meta="bias-controlled · OSHA medical step"
        action={<button className="btn sm primary" style={{marginLeft:'auto'}} onClick={()=>setReqForm(true)}><Icon name="plus" size={13}/>New requisition</button>}/>
      <table className="tbl"><thead><tr><th>Req.</th><th>Role</th><th>Site</th><th>Stage</th><th>Candidates</th><th>Target start</th><th></th></tr></thead>
        <tbody>{RECRUITMENT.map((r,i)=>{const idx=RECRUIT_STAGES.indexOf(r.stage);return <tr key={i}>
          <td className="num muted">{r.req}</td>
          <td className="name">{r.role}</td>
          <td className="muted">{r.site}</td>
          <td><div style={{display:'flex',alignItems:'center',gap:8}}>
            <span className="bar" style={{width:80}}><i style={{width:((idx+1)/RECRUIT_STAGES.length*100)+'%',
              background:r.stage==='Offer'?'var(--green)':'var(--blue)'}}/></span>
            <Tag tone={r.stage==='Offer'?'green':r.stage==='Medical (OSHA)'?'yellow':'blue'}>{r.stage}</Tag></div></td>
          <td className="num" style={{fontWeight:600}}>{r.cands}</td>
          <td className="num">{r.target.slice(5)}</td>
          <td style={{textAlign:'right'}}><button className="btn sm">Open</button></td>
        </tr>;})}</tbody></table>
      <div style={{display:'flex',gap:0,padding:'12px 20px',borderTop:'1px solid var(--border-2)',overflowX:'auto'}}>
        {PIPELINE_STAGES.map((s,i)=><div key={i} style={{flex:'0 0 auto',width:80,textAlign:'center',position:'relative'}}>
          <div style={{width:9,height:9,borderRadius:'50%',background:'var(--accent)',margin:'0 auto 6px',
            opacity:1-i*0.035}}/><div style={{fontSize:9.5,color:'var(--faint)',lineHeight:1.2}}>{s}</div>
          {i<PIPELINE_STAGES.length-1&&<div style={{position:'absolute',top:4,left:'60%',right:'-40%',height:2,background:'var(--border)'}}/>}
        </div>)}
      </div>
    </Card>
    {reqForm && <FormModal title="Raise job requisition" icon="briefcase" submitLabel="Route for approval"
      fields={[
        {key:'role',label:'Position',type:'text',required:true,placeholder:'e.g. Equipment Operator'},
        {key:'posts',label:'Posts',type:'text',default:'1',required:true},
        {key:'site',label:'Site',type:'select',options:['Mwadui','Nyanzaga','Dar Yard','North Mara','Geita Civil'],required:true},
        {key:'type',label:'Job type',type:'select',options:['Permanent','Fixed-term','Temporary']},
        {key:'reason',label:'Reason / justification',type:'textarea',wide:true,required:true,placeholder:'Why is this role needed?'}]}
      onSubmit={vals=>{ HStore.notify({to:'HCWOS',from:'Recruitment',kind:'briefcase',title:'Requisition raised',
        body:`${vals.posts} × ${vals.role} (${vals.site}) — routed for approval.`,action:{page:'approvals'}});
        toast('Requisition raised · routed for approval'); }}
      onClose={()=>setReqForm(false)}/>}
    {revForm && <FormModal title="Assign performance review" icon="award" submitLabel="Create draft"
      fields={[
        {key:'who',label:'Employee',type:'employee',required:true},
        {key:'site',label:'Site',type:'text'},
        {key:'cycle',label:'Cycle',type:'select',options:(typeof REVIEW_CYCLES!=='undefined'?REVIEW_CYCLES.map(c=>c.name):['FY26 Mid-Year Review']),required:true},
        {key:'reviewer',label:'Reviewer',type:'text',default:'Grace Ndaki',required:true}]}
      onSubmit={v=>{ if(!v.who_no) return; HStore.assignReview({no:v.who_no,name:v.who,site:v.site,cycle:v.cycle,reviewer:v.reviewer}); }}
      onClose={()=>setRevForm(false)}/>}
  </div>;
}
window.Performance = Performance;
