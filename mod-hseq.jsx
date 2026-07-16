// Module: SHEQ — Safety, Health, Environment & Quality (sub-navigated suite)
function riskTone(s){ return s>=15?'red':s>=8?'yellow':'green'; }
const SHEQ_SITES = ['Mwadui','Nyanzaga','Dar Yard','North Mara','Geita Civil'];
const SHEQ_FORMS = {
  hazard:{ title:'Add hazard to register', icon:'shield', submit:'Add hazard', fields:[
    {key:'desc',label:'Hazard',type:'text',required:true,wide:true,placeholder:'Describe the hazard…'},
    {key:'site',label:'Site',type:'select',options:SHEQ_SITES,required:true},
    {key:'cat',label:'Category',type:'select',options:['Mechanical','Electrical','Chemical','Working at height','Manual handling','Environmental']},
    {key:'likelihood',label:'Likelihood (1–5)',type:'select',options:['1','2','3','4','5'],default:'3'},
    {key:'severity',label:'Severity (1–5)',type:'select',options:['1','2','3','4','5'],default:'3'},
    {key:'controls',label:'Controls',type:'textarea',wide:true,placeholder:'Existing / proposed controls'}]},
  inspections:{ title:'Schedule inspection', icon:'clipboard', submit:'Schedule', fields:[
    {key:'type',label:'Inspection type',type:'text',required:true,placeholder:'e.g. Site walk-down'},
    {key:'site',label:'Site',type:'select',options:SHEQ_SITES,required:true},
    {key:'date',label:'Date',type:'date',default:'2026-06-24',required:true},
    {key:'findings',label:'Expected findings',type:'text',default:'0'},
    {key:'by',label:'Inspector',type:'text',placeholder:'Name'}]},
  permits:{ title:'Issue permit to work', icon:'wrench', submit:'Issue permit', fields:[
    {key:'type',label:'Permit type',type:'select',options:['Hot work','Working at height','Confined space','Electrical','Excavation','Lifting'],required:true},
    {key:'site',label:'Site',type:'select',options:SHEQ_SITES,required:true},
    {key:'area',label:'Area',type:'text',placeholder:'Specific location'},
    {key:'holder',label:'Permit holder',type:'text',required:true},
    {key:'issued',label:'Issued',type:'text',default:'08:00'},
    {key:'expires',label:'Expires',type:'text',default:'17:00'}]},
  environment:{ title:'Log environmental event', icon:'leaf', submit:'Log event', fields:[
    {key:'item',label:'Event',type:'text',required:true,wide:true,placeholder:'e.g. Hydraulic oil spill, contained'},
    {key:'site',label:'Site',type:'select',options:SHEQ_SITES,required:true},
    {key:'date',label:'Date',type:'date',default:'2026-06-24',required:true},
    {key:'status',label:'Status',type:'select',options:['Contained','Monitoring','Reported','Closed']}]},
  health:{ title:'Book medical screening', icon:'heart', submit:'Book', fields:[
    {key:'who',label:'Employee',type:'employee',required:true},
    {key:'prog',label:'Programme',type:'select',options:['Audiometry','Spirometry','Vision','General medical','Biological monitoring']},
    {key:'site',label:'Site',type:'select',options:SHEQ_SITES},
    {key:'date',label:'Date',type:'date',default:'2026-06-30'}]},
  sheqtrain:{ title:'Schedule safety training', icon:'cap', submit:'Schedule', fields:[
    {key:'course',label:'Course',type:'text',required:true,placeholder:'e.g. Working at Height'},
    {key:'site',label:'Site',type:'select',options:SHEQ_SITES,required:true},
    {key:'date',label:'Date',type:'date',default:'2026-07-01'},
    {key:'seats',label:'Seats',type:'text',default:'12'}]},
  ppe:{ title:'Issue PPE', icon:'hardhat', submit:'Issue', fields:[
    {key:'who',label:'Employee',type:'employee',required:true},
    {key:'item',label:'PPE item',type:'select',options:['Hard hat','Safety boots','Hi-vis','Gloves','Goggles','Respirator','Ear protection'],required:true},
    {key:'site',label:'Site',type:'select',options:SHEQ_SITES}]},
  ncr:{ title:'Raise quality NCR', icon:'octagon', submit:'Raise NCR', fields:[
    {key:'area',label:'Area',type:'text',required:true,placeholder:'e.g. Concrete works'},
    {key:'site',label:'Site',type:'select',options:SHEQ_SITES,required:true},
    {key:'sev',label:'Severity',type:'select',options:['Minor','Major']},
    {key:'desc',label:'Description',type:'textarea',wide:true,required:true,placeholder:'Non-conformance detail'}]},
  toolbox:{ title:'Log toolbox talk', icon:'megaphone', submit:'Log talk', fields:[
    {key:'topic',label:'Topic',type:'text',required:true,placeholder:'e.g. Manual handling'},
    {key:'site',label:'Site',type:'select',options:SHEQ_SITES,required:true},
    {key:'crew',label:'Crew',type:'text',placeholder:'e.g. Day shift'},
    {key:'n',label:'Attended',type:'text',default:'0'}]},
};
function SHEQKpis({ items, cols=5 }){
  return <div className="grid" style={{gridTemplateColumns:`repeat(${cols},1fr)`,gap:16}}>
    {items.map((k,i)=><KPI key={i} icon={k.icon} label={k.label} value={k.value} unit={k.unit} sub={k.sub} trend={k.trend} trendDir={k.trendDir}/>)}
  </div>;
}

function SHEQ(){
  const [sec,setSec] = React.useState('command');
  const [incForm,setIncForm] = React.useState(false);
  const [xtraInc,setXtraInc] = React.useState([]);
  const [formKind,setFormKind] = React.useState(null);
  const [extras,setExtras] = React.useState({hazard:[],inspections:[],permits:[],environment:[],ncr:[],toolbox:[]});
  const addExtra = (kind,row)=>setExtras(e=>({...e,[kind]:[row,...(e[kind]||[])]}));
  const submitForm = (kind,v)=>{
    if(kind==='hazard') addExtra('hazard',{id:'HZ-'+(120+extras.hazard.length),desc:v.desc,site:v.site,cat:v.cat,likelihood:+v.likelihood,severity:+v.severity,controls:v.controls||'TBC',status:'Action open'});
    else if(kind==='inspections') addExtra('inspections',{id:'INSP-'+(40+extras.inspections.length),type:v.type,site:v.site,date:v.date||'2026-06-24',findings:+v.findings||0,closed:0,score:90,by:v.by||'SHEQ'});
    else if(kind==='permits') addExtra('permits',{id:'PTW-'+(60+extras.permits.length),type:v.type,site:v.site,area:v.area||'—',holder:v.holder,issued:v.issued||'08:00',expires:v.expires||'17:00',status:'Active'});
    else if(kind==='environment') addExtra('environment',{item:v.item,site:v.site,date:v.date||'2026-06-24',status:v.status||'Monitoring',tone:v.status==='Closed'?'green':v.status==='Reported'?'red':'yellow'});
    else if(kind==='ncr') addExtra('ncr',{id:'NCR-'+(50+extras.ncr.length),area:v.area,desc:v.desc,site:v.site,sev:v.sev||'Minor',status:'Open'});
    else if(kind==='toolbox') addExtra('toolbox',{topic:v.topic,site:v.site,crew:v.crew||'Crew',n:+v.n||0,date:'24 Jun'});
    const labels={hazard:'Hazard added to register',inspections:'Inspection scheduled',permits:'Permit to work issued',environment:'Environmental event logged',health:'Medical screening booked',sheqtrain:'Training session scheduled',ppe:'PPE issued · stock updated',ncr:'NCR raised · CAPA started',toolbox:'Toolbox talk logged'};
    toast(labels[kind]||'Saved', kind==='ncr'||kind==='environment'?'alert':'check');
  };
  const NAV = [
    ['command','grid','Command'], ['incidents','alert','Incidents'], ['hazard','shield','Hazard Register'],
    ['inspections','clipboard','Inspections'], ['permits','wrench','Permits to Work'], ['environment','leaf','Environment'],
    ['health','heart','Occupational Health'], ['training','cap','Training'], ['ppe','hardhat','PPE'],
    ['ncr','octagon','Quality NCRs'], ['toolbox','megaphone','Toolbox Talks'],
  ];

  const SITE_SAFETY = <Card>
    <CardH title="Safety performance by site" icon="chart"/>
    <div className="card-p">{SITES.map((s,i)=><div key={s.id} style={{padding:'9px 0',borderBottom:i<SITES.length-1?'1px solid var(--border-2)':'none'}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,fontSize:13}}>
        <span style={{fontWeight:600}}>{s.name}</span>
        {s.lti>0?<Tag tone="red">{s.lti} LTI</Tag>:<Tag tone="green">0 LTI</Tag>}
        <span className="muted num" style={{marginLeft:'auto',fontSize:11.5}}>{s.conn==='low'?'~70% coverage':'connected'}</span></div>
      <span className="bar"><i style={{width:(s.lti>0?60:100)+'%',background:s.lti>0?'var(--red)':'var(--green)'}}/></span>
    </div>)}</div>
  </Card>;

  const INCIDENT_TABLE = (full) => <Card>
    <CardH title="Incident & injury register" icon="alert" meta="REQ-052 / 053"
      action={full&&<button className="btn sm primary" style={{marginLeft:'auto'}} onClick={()=>setIncForm(true)}><Icon name="plus" size={13}/>Log incident</button>}/>
    <table className="tbl"><thead><tr><th>ID</th><th>Site</th><th>Date</th><th>Type</th><th>Severity</th><th>LTI</th><th>Status</th></tr></thead>
      <tbody>{[...xtraInc,...HSEQ_INCIDENTS].map(x=><tr key={x.id}>
        <td className="num" style={{fontWeight:600}}>{x.id}</td><td className="muted">{x.site}</td>
        <td className="num muted">{x.date.slice(5)}</td>
        <td>{x.type}{full&&<div className="muted" style={{fontSize:11}}>{x.desc}</div>}</td>
        <td><Tag tone={x.sev==='High'?'red':x.sev==='Medium'?'yellow':'grey'}>{x.sev}</Tag></td>
        <td>{x.lti?<Tag tone="red" dot>{x.days}d</Tag>:<span className="muted">—</span>}</td>
        <td>{x.status==='Closed'?<Tag tone="green">Closed</Tag>:x.status==='Open'?<Tag tone="yellow">Open</Tag>:<Tag tone="blue">In review</Tag>}</td>
      </tr>)}</tbody></table>
  </Card>;

  const SECTIONS = {
    command: <div className="grid" style={{gap:16}}>
      <SHEQKpis items={[
        {icon:'shield',label:'Days since LTI',value:HSEQ_KPI.daysSinceLTI,sub:'last: Dar Yard, 19 Jun'},
        {icon:'alert',label:'LTI (YTD)',value:HSEQ_KPI.ltiYTD,sub:HSEQ_KPI.lostDays+' lost days'},
        {icon:'trend',label:'TRIR',value:HSEQ_KPI.trir,sub:'per 200k hrs',trend:'-0.12',trendDir:'up'},
        {icon:'flag',label:'Incidents (MTD)',value:HSEQ_KPI.incidentsMTD,sub:'all categories'},
        {icon:'hardhat',label:'PPE compliance',value:PPE.compliance+'%',sub:'issued & in-date',trend:'+3%',trendDir:'up'},
      ]}/>
      <div className="grid" style={{gridTemplateColumns:'1.4fr 1fr'}}>{INCIDENT_TABLE(false)}{SITE_SAFETY}</div>
      <div className="grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        {[['Active permits',PERMITS.filter(p=>p.status!=='Closed').length,'wrench','permits'],
          ['Open hazards',HAZARDS.filter(h=>h.status==='Action open').length,'shield','hazard'],
          ['Open NCRs',NCRS.filter(n=>n.status!=='Closed').length,'octagon','ncr']].map((q,i)=>
          <Card key={i} className="card-p" style={{display:'flex',alignItems:'center',gap:13,cursor:'pointer'}} onClick={()=>setSec(q[3])}>
            <span style={{width:38,height:38,borderRadius:9,background:'var(--accent-soft)',color:'var(--accent)',
              display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name={q[2]} size={19}/></span>
            <div><div className="num" style={{fontSize:22,fontWeight:600}}>{q[1]}</div>
              <div className="muted" style={{fontSize:12}}>{q[0]}</div></div>
            <Icon name="chevR" size={16} style={{marginLeft:'auto',color:'var(--faint)'}}/></Card>)}
      </div>
    </div>,

    incidents: <div className="grid" style={{gap:16}}>
      <SHEQKpis cols={4} items={[
        {icon:'alert',label:'Incidents (MTD)',value:HSEQ_KPI.incidentsMTD,sub:'all categories'},
        {icon:'shield',label:'LTI (YTD)',value:HSEQ_KPI.ltiYTD,sub:HSEQ_KPI.lostDays+' lost days'},
        {icon:'doc',label:'Open WCF claims',value:HSEQ_KPI.openWCF,sub:'Workers Comp. Fund'},
        {icon:'check',label:'Closed (MTD)',value:'3',sub:'investigations complete'},
      ]}/>
      {INCIDENT_TABLE(true)}
    </div>,

    hazard: <div className="grid" style={{gap:16}}>
      <SHEQKpis cols={4} items={[
        {icon:'shield',label:'Hazards on register',value:HAZARDS.length+18,sub:'live, all sites'},
        {icon:'alert',label:'Action open',value:HAZARDS.filter(h=>h.status==='Action open').length+2,sub:'controls outstanding',trend:'action',trendDir:'dn'},
        {icon:'check',label:'Controlled',value:'88%',sub:'risk reduced to ALARP'},
        {icon:'trend',label:'High-risk (≥15)',value:HAZARDS.filter(h=>h.likelihood*h.severity>=15).length,sub:'priority review'},
      ]}/>
      <Card>
        <CardH title="Hazard register & risk assessment" icon="shield" meta="likelihood × severity"
          action={<button className="btn sm primary" style={{marginLeft:'auto'}} onClick={()=>setFormKind('hazard')}><Icon name="plus" size={13}/>Add hazard</button>}/>
        <table className="tbl"><thead><tr><th>ID</th><th>Hazard</th><th>Site</th><th>Category</th><th>Risk</th><th>Controls</th><th>Status</th></tr></thead>
          <tbody>{[...extras.hazard,...HAZARDS].map(h=>{const sc=h.likelihood*h.severity;return <tr key={h.id}>
            <td className="num" style={{fontWeight:600}}>{h.id}</td>
            <td className="name">{h.desc}</td><td className="muted">{h.site}</td>
            <td><Tag tone="grey">{h.cat}</Tag></td>
            <td><Tag tone={riskTone(sc)}>{sc} · {sc>=15?'High':sc>=8?'Med':'Low'}</Tag></td>
            <td className="muted" style={{fontSize:12}}>{h.controls}</td>
            <td>{h.status==='Action open'?<Tag tone="yellow">{h.status}</Tag>:<Tag tone="green">{h.status}</Tag>}</td>
          </tr>;})}</tbody></table>
      </Card>
    </div>,

    inspections: <div className="grid" style={{gap:16}}>
      <SHEQKpis cols={4} items={[
        {icon:'clipboard',label:'Inspections (MTD)',value:'34',sub:'planned + ad-hoc'},
        {icon:'check',label:'Avg score',value:'90%',sub:'compliance',trend:'+4%',trendDir:'up'},
        {icon:'alert',label:'Open findings',value:'5',sub:'across sites'},
        {icon:'trend',label:'On schedule',value:'96%',sub:'planned inspections'},
      ]}/>
      <Card>
        <CardH title="Inspections & audits" icon="clipboard" meta="findings & close-out"
          action={<button className="btn sm primary" style={{marginLeft:'auto'}} onClick={()=>setFormKind('inspections')}><Icon name="plus" size={13}/>New inspection</button>}/>
        <table className="tbl"><thead><tr><th>ID</th><th>Type</th><th>Site</th><th>Date</th><th>Findings</th><th>Score</th><th>By</th></tr></thead>
          <tbody>{[...extras.inspections,...INSPECTIONS].map(x=><tr key={x.id}>
            <td className="num" style={{fontWeight:600}}>{x.id}</td><td className="name">{x.type}</td>
            <td className="muted">{x.site}</td><td className="num muted">{x.date.slice(5)}</td>
            <td><Tag tone={x.closed<x.findings?'yellow':'green'}>{x.closed}/{x.findings} closed</Tag></td>
            <td><span className="num" style={{fontWeight:600,color:x.score>=90?'var(--green)':'#9A6B00'}}>{x.score}%</span></td>
            <td className="muted">{x.by}</td>
          </tr>)}</tbody></table>
      </Card>
    </div>,

    permits: <div className="grid" style={{gap:16}}>
      <SHEQKpis cols={4} items={[
        {icon:'wrench',label:'Active permits',value:PERMITS.filter(p=>p.status==='Active').length,sub:'open now'},
        {icon:'clock',label:'Expiring soon',value:PERMITS.filter(p=>p.status==='Expiring').length,sub:'within the hour',trend:'monitor',trendDir:'dn'},
        {icon:'check',label:'Closed today',value:PERMITS.filter(p=>p.status==='Closed').length,sub:'signed off'},
        {icon:'shield',label:'Permit types',value:'7',sub:'hot work · height · confined…'},
      ]}/>
      <Card>
        <CardH title="Permits to work" icon="wrench" meta="issue · monitor · close"
          action={<button className="btn sm primary" style={{marginLeft:'auto'}} onClick={()=>setFormKind('permits')}><Icon name="plus" size={13}/>Issue permit</button>}/>
        <table className="tbl"><thead><tr><th>Permit</th><th>Type</th><th>Site / area</th><th>Holder</th><th>Window</th><th>Status</th></tr></thead>
          <tbody>{[...extras.permits,...PERMITS].map(p=><tr key={p.id}>
            <td className="num" style={{fontWeight:600}}>{p.id}</td><td className="name">{p.type}</td>
            <td className="muted">{p.site} · {p.area}</td><td>{p.holder}</td>
            <td className="num muted">{p.issued} → {p.expires}</td>
            <td>{p.status==='Active'?<Tag tone="green" dot>Active</Tag>:p.status==='Expiring'?<Tag tone="yellow" dot>Expiring</Tag>:<Tag tone="grey">Closed</Tag>}</td>
          </tr>)}</tbody></table>
      </Card>
    </div>,

    environment: <div className="grid" style={{gap:16}}>
      <SHEQKpis cols={4} items={ENVIRONMENT.kpis}/>
      <Card>
        <CardH title="Environmental log" icon="leaf" meta="spills · dust · water · waste"
          action={<button className="btn sm primary" style={{marginLeft:'auto'}} onClick={()=>setFormKind('environment')}><Icon name="plus" size={13}/>Log event</button>}/>
        <table className="tbl"><thead><tr><th>Event</th><th>Site</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>{[...extras.environment,...ENVIRONMENT.log].map((e,i)=><tr key={i}>
            <td className="name">{e.item}</td><td className="muted">{e.site}</td><td className="num muted">{e.date.slice(5)}</td>
            <td><Tag tone={e.tone}>{e.status}</Tag></td></tr>)}</tbody></table>
      </Card>
    </div>,

    health: <div className="grid" style={{gap:16}}>
      <SHEQKpis cols={4} items={OCC_HEALTH.kpis}/>
      <Card>
        <CardH title="Medical surveillance programmes" icon="heart" meta="OSHA · exposure-based"
          action={<button className="btn sm primary" style={{marginLeft:'auto'}} onClick={()=>setFormKind('health')}><Icon name="plus" size={13}/>Book screening</button>}/>
        <div className="card-p">{OCC_HEALTH.surveillance.map((s,i)=><div key={i} style={{padding:'10px 0',borderBottom:i<OCC_HEALTH.surveillance.length-1?'1px solid var(--border-2)':'none'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,fontSize:13}}>
            <span style={{fontWeight:600}}>{s.prog}</span>
            {s.due>0&&<Tag tone="yellow">{s.due} due</Tag>}
            <span className="num muted" style={{marginLeft:'auto',fontSize:11.5}}>{s.done}/{s.of}</span></div>
          <span className="bar"><i style={{width:(s.done/s.of*100)+'%',background:s.done/s.of>=0.95?'var(--green)':'var(--yellow)'}}/></span>
        </div>)}</div>
      </Card>
    </div>,

    training: <div className="grid" style={{gap:16}}>
      <SHEQKpis cols={3} items={[
        {icon:'cap',label:'Safety training compliance',value:'82%',sub:'mandatory + competency'},
        {icon:'alert',label:'Due / overdue',value:'42',sub:'next 30 days',trend:'action',trendDir:'dn'},
        {icon:'award',label:'Operators authorised',value:COMPETENCY.filter(c=>c.authed).length+'/'+COMPETENCY.length,sub:'equipment competency'},
      ]}/>
      <div className="grid" style={{gridTemplateColumns:'1fr 1fr'}}>
        <Card><CardH title="Safety courses" icon="cap"
          action={<button className="btn sm primary" style={{marginLeft:'auto'}} onClick={()=>setFormKind('sheqtrain')}><Icon name="plus" size={13}/>Schedule</button>}/>
          <div className="card-p">{SHEQ_TRAINING.map((c,i)=><HBar key={i} label={c.name} value={c.complete} max={100}
            color={c.complete>=90?'var(--green)':c.complete>=75?'var(--yellow)':'var(--red)'} suffix={c.complete+'%'}/>)}</div></Card>
        <Card><CardH title="By category" icon="chart"/>
          <div className="card-p">{[['Mandatory',92,'var(--green)'],['Competency',76,'var(--yellow)'],['Specialist',64,'var(--blue)']].map((r,i)=>
            <HBar key={i} label={r[0]} value={r[1]} max={100} color={r[2]} suffix={r[1]+'%'}/>)}</div></Card>
      </div>
      <Card>
        <CardH title="Equipment competency & authorisation" icon="award" meta="REQ-040 · Taifa + client sign-off"/>
        <table className="tbl"><thead><tr><th>Operator</th><th>Equipment</th><th>Progress</th><th>Taifa</th><th>Client</th><th>Authorised</th></tr></thead>
          <tbody>{COMPETENCY.map((c,i)=><tr key={i}>
            <td><RowName name={c.who}/></td><td><Tag tone="grey"><Icon name="truck" size={12}/> {c.equip}</Tag></td>
            <td><div style={{display:'flex',alignItems:'center',gap:9}}>
              <span className="bar" style={{width:80}}><i style={{width:(c.step/c.of*100)+'%',background:c.authed?'var(--green)':'var(--blue)'}}/></span>
              <span className="num muted" style={{fontSize:11.5}}>{c.step}/{c.of}</span></div></td>
            <td>{c.taifa?<Tag tone="green" dot>Pass</Tag>:<Tag tone="grey" dot>Pending</Tag>}</td>
            <td>{c.client?<Tag tone="green" dot>Pass</Tag>:<Tag tone="grey" dot>Pending</Tag>}</td>
            <td>{c.authed?<Tag tone="green">Authorised</Tag>:<Tag tone="yellow">Not yet</Tag>}</td>
          </tr>)}</tbody></table>
      </Card>
    </div>,

    ppe: <div className="grid" style={{gap:16}}>
      <SHEQKpis cols={3} items={[
        {icon:'hardhat',label:'PPE compliance',value:PPE.compliance+'%',sub:'issued & in-date',trend:'+3%',trendDir:'up'},
        {icon:'alert',label:'Open issues',value:PPE.issues.reduce((a,b)=>a+b.open,0),sub:'replacements / fitting'},
        {icon:'check',label:'Stock cover',value:'OK',sub:'all categories'},
      ]}/>
      <div className="grid" style={{gridTemplateColumns:'1fr 1fr'}}>
        <Card><CardH title="Compliance by PPE type" icon="hardhat"
          action={<button className="btn sm primary" style={{marginLeft:'auto'}} onClick={()=>setFormKind('ppe')}><Icon name="plus" size={13}/>Issue PPE</button>}/>
          <div className="card-p">{PPE.byType.map((p,i)=><HBar key={i} label={p.item} value={p.pct} max={100}
            color={p.pct>=95?'var(--green)':p.pct>=88?'var(--yellow)':'var(--red)'} suffix={p.pct+'%'}/>)}</div></Card>
        <Card><CardH title="Open PPE issues by site" icon="building"/>
          <div className="card-p">{PPE.issues.map((p,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:9,
            padding:'9px 0',borderBottom:i<PPE.issues.length-1?'1px solid var(--border-2)':'none',fontSize:13}}>
            <span style={{fontWeight:600}}>{p.site}</span>
            <span className="num" style={{marginLeft:'auto',fontWeight:600}}>{p.open}</span>
            <span className="muted" style={{fontSize:11.5}}>open</span></div>)}</div></Card>
      </div>
    </div>,

    ncr: <div className="grid" style={{gap:16}}>
      <SHEQKpis cols={4} items={[
        {icon:'octagon',label:'Open NCRs',value:NCRS.filter(n=>n.status!=='Closed').length,sub:'quality non-conformance',trend:'action',trendDir:'dn'},
        {icon:'alert',label:'Major',value:NCRS.filter(n=>n.sev==='Major'&&n.status!=='Closed').length,sub:'priority CAPA'},
        {icon:'check',label:'Closed (YTD)',value:'41',sub:'corrective action verified'},
        {icon:'trend',label:'Avg close-out',value:'9.2',unit:'days',sub:'raise → verify'},
      ]}/>
      <Card>
        <CardH title="Quality non-conformance reports" icon="octagon" meta="CAPA workflow"
          action={<button className="btn sm primary" style={{marginLeft:'auto'}} onClick={()=>setFormKind('ncr')}><Icon name="plus" size={13}/>Raise NCR</button>}/>
        <table className="tbl"><thead><tr><th>NCR</th><th>Area</th><th>Description</th><th>Site</th><th>Severity</th><th>Status</th></tr></thead>
          <tbody>{[...extras.ncr,...NCRS].map(n=><tr key={n.id}>
            <td className="num" style={{fontWeight:600}}>{n.id}</td><td>{n.area}</td>
            <td className="muted" style={{fontSize:12.5}}>{n.desc}</td><td className="muted">{n.site}</td>
            <td><Tag tone={n.sev==='Major'?'red':'yellow'}>{n.sev}</Tag></td>
            <td>{n.status==='Closed'?<Tag tone="green">Closed</Tag>:n.status==='Open'?<Tag tone="yellow">Open</Tag>:<Tag tone="blue">In review</Tag>}</td>
          </tr>)}</tbody></table>
      </Card>
    </div>,

    toolbox: <div className="grid" style={{gap:16}}>
      <SHEQKpis cols={4} items={[
        {icon:'megaphone',label:'Talks today',value:TOOLBOX.todayDone+'/'+TOOLBOX.todayPlanned,sub:'crews briefed'},
        {icon:'users',label:'Attendance',value:TOOLBOX.attendance+'%',sub:'of rostered crew'},
        {icon:'trend',label:'Daily streak',value:TOOLBOX.streak,unit:'wks',sub:'100% sites briefed'},
        {icon:'doc',label:'Topics library',value:'48',sub:'rotating themes'},
      ]}/>
      <Card>
        <CardH title="Toolbox talks" icon="megaphone" meta="pre-shift safety briefings"
          action={<button className="btn sm primary" style={{marginLeft:'auto'}} onClick={()=>setFormKind('toolbox')}><Icon name="plus" size={13}/>Log talk</button>}/>
        <table className="tbl"><thead><tr><th>Topic</th><th>Site</th><th>Crew</th><th>Attended</th><th>When</th></tr></thead>
          <tbody>{[...extras.toolbox,...TOOLBOX.recent].map((t,i)=><tr key={i}>
            <td className="name">{t.topic}</td><td className="muted">{t.site}</td><td className="muted">{t.crew}</td>
            <td className="num" style={{fontWeight:600}}>{t.n}</td><td className="muted num" style={{fontSize:11.5}}>{t.date}</td>
          </tr>)}</tbody></table>
      </Card>
    </div>,
  };

  return <div className="sheq">
    <aside className="subrail">
      {NAV.map(n=><button key={n[0]} className={'navitem '+(sec===n[0]?'on':'')} onClick={()=>setSec(n[0])}>
        <Icon name={n[1]} size={17} cls="ic"/>{n[2]}</button>)}
    </aside>
    <div className="sheq-body">{SECTIONS[sec]}</div>
    {incForm && <FormModal title="Log safety incident" icon="alert" submitLabel="Open investigation"
      fields={[
        {key:'site',label:'Site',type:'select',options:['Mwadui','Nyanzaga','Dar Yard','North Mara','Geita Civil'],required:true},
        {key:'type',label:'Type',type:'select',options:['Near miss','Injury','Environmental','Property damage'],required:true},
        {key:'sev',label:'Severity',type:'select',options:['Low','Medium','High'],required:true},
        {key:'lti',label:'Lost-time injury',type:'checkbox',hint:'Yes'},
        {key:'date',label:'Date',type:'date',default:'2026-06-24',required:true},
        {key:'desc',label:'Description',type:'textarea',wide:true,required:true,placeholder:'What happened…'}]}
      onSubmit={vals=>{ const id='INC-2026-0'+(42+xtraInc.length);
        setXtraInc(x=>[{id,site:vals.site,date:vals.date||'2026-06-24',type:vals.type,sev:vals.sev,lti:!!vals.lti,days:vals.lti?1:0,status:'Open',wcf:!!vals.lti,desc:vals.desc},...x]);
        toast('Incident '+id+' logged · investigation opened','alert'); }}
      onClose={()=>setIncForm(false)}/>}
    {formKind && (()=>{ const f=SHEQ_FORMS[formKind]; return <FormModal title={f.title} icon={f.icon} submitLabel={f.submit}
      fields={f.fields} onSubmit={vals=>submitForm(formKind,vals)} onClose={()=>setFormKind(null)}/>; })()}
  </div>;
}
window.HSEQ = SHEQ;
window.SHEQ = SHEQ;
