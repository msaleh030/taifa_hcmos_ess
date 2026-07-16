// Module: Grievances
function Grievances(){
  const k = GRIEVANCE_KPI;
  const stages = ['Logged','Investigation','Hearing','Outcome','Closed'];
  const [extra,setExtra] = React.useState([]);
  const [form,setForm] = React.useState(false);
  const cases = [...extra, ...GRIEVANCES];
  return <div className="grid" style={{gap:16}}>
    <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(178px,1fr))'}}>
      <KPI icon="flag" label="Open cases" value={k.open} sub={k.atRisk+' at SLA risk'} trend="action" trendDir="dn"/>
      <KPI icon="check" label="On track" value={k.slaOnTrack} sub="within SLA"/>
      <KPI icon="clock" label="Avg resolution" value={k.avgDays} unit="days" sub="logged → closed" trend="-1.2d" trendDir="up"/>
      <KPI icon="shield" label="Closed (YTD)" value={k.closedYTD} sub="fair-process upheld"/>
    </div>

    <Card>
      <CardH title="Grievance cases" icon="flag" meta="confidentiality enforced"
        action={<button className="btn sm primary" style={{marginLeft:'auto'}} onClick={()=>setForm(true)}><Icon name="plus" size={13}/>Log grievance</button>}/>
      <table className="tbl"><thead><tr><th>Ref</th><th>Category</th><th>Site</th><th>Raised</th><th>Stage</th><th>SLA</th><th>Owner</th><th></th></tr></thead>
        <tbody>{cases.map(g=><tr key={g.id}>
          <td className="num" style={{fontWeight:600}}>{g.id}{g.conf&&<Icon name="lock" size={11} style={{marginLeft:5,color:'var(--faint)'}}/>}</td>
          <td>{g.cat}</td>
          <td className="muted">{g.site}</td>
          <td className="num muted">{g.raised.slice(5)}</td>
          <td><Tag tone={g.stage==='Closed'?'green':g.stage==='Outcome'?'blue':'yellow'}>{g.stage}</Tag></td>
          <td><span style={{fontSize:12.5,color:g.sla==='At risk'?'var(--red)':g.sla.includes('Due')?'#9A6B00':'var(--muted)'}}>{g.sla}</span></td>
          <td className="muted" style={{fontSize:12.5}}>{g.owner}</td>
          <td style={{textAlign:'right'}}><button className="btn sm">{g.stage==='Closed'?'View':'Manage'}</button></td>
        </tr>)}</tbody></table>
    </Card>

    <Card>
      <CardH title="Case workflow" icon="trend" meta="fair, consistent, confidential"/>
      <div className="card-p" style={{display:'flex',padding:'18px 20px'}}>
        {stages.map((s,i)=><div key={i} style={{flex:1,textAlign:'center',position:'relative'}}>
          <div style={{width:34,height:34,borderRadius:'50%',margin:'0 auto 8px',display:'flex',alignItems:'center',justifyContent:'center',
            background:i<3?'var(--accent-soft)':'var(--surface-2)',color:i<3?'var(--accent)':'var(--faint)',border:'1px solid var(--border)'}}>
            <Icon name={['doc','search','users','check','shield'][i]} size={16}/></div>
          <div style={{fontSize:12,fontWeight:600}}>{s}</div>
          <div className="muted" style={{fontSize:10.5}}>{[3,2,1,0,23][i]} {i===4?'closed':'active'}</div>
          {i<stages.length-1&&<div style={{position:'absolute',top:17,left:'62%',right:'-38%',height:2,background:'var(--border)'}}/>}
        </div>)}
      </div>
    </Card>

    {form && <FormModal title="Log grievance" icon="flag" submitLabel="Open case"
      fields={[
        {key:'cat',label:'Category',type:'select',options:['Allowance dispute','Working conditions','Interpersonal','Disciplinary appeal','Harassment','Other'],required:true},
        {key:'site',label:'Site',type:'select',options:['Mwadui','Nyanzaga','Dar Yard','North Mara','Geita Civil'],required:true},
        {key:'owner',label:'Assigned owner',type:'select',options:['HR Officer','Project HR','Supervisor','Head of HR']},
        {key:'conf',label:'Confidential',type:'checkbox',hint:'Restrict to HR'},
        {key:'detail',label:'Description',type:'textarea',wide:true,required:true,placeholder:'Summary of the grievance…'}]}
      onSubmit={vals=>{ const id='GRV-'+(119+extra.length);
        setExtra(x=>[{id,cat:vals.cat,site:vals.site,raised:'2026-06-24',stage:'Logged',sla:'On track',conf:!!vals.conf,owner:vals.owner||'HR Officer'},...x]);
        toast('Grievance logged · case '+id+' opened'); }}
      onClose={()=>setForm(false)}/>}
  </div>;
}
window.Grievances = Grievances;
