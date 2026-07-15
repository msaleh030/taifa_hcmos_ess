// Module: Reports & Analytics (cross-module)
function Reports({ siteFilter, role }){
  const [period,setPeriod] = React.useState('Monthly');
  const [cat,setCat] = React.useState('All');
  const [q,setQ] = React.useState('');
  const [preview,setPreview] = React.useState(null);
  const [schedForm,setSchedForm] = React.useState(false);
  const officialEmail = (role && role.email) ? role.email.replace(/^[^@]+/, (role.dept||'reports').toLowerCase().replace(/[^a-z]+/g,'.')) : 'hr.reports@taifamining.tz';
  const reports = [
    { name:'Daily Site Report',          icon:'calendar', cat:'Operations', fields:'Headcount · attendance · OT · absences', freq:'Daily',   fmt:'PDF / XLS' },
    { name:'Consolidated Daily',         icon:'chart',    cat:'Operations', fields:'All sites rolled up, by day',           freq:'Daily',   fmt:'XLS' },
    { name:'Consolidated Monthly',       icon:'chart',    cat:'Operations', fields:'Month totals per site + group',          freq:'Monthly', fmt:'XLS / PDF' },
    { name:'HR KPI Report',              icon:'trend',    cat:'HR',         fields:'Turnover · absence · leave · headcount', freq:'Monthly', fmt:'PDF' },
    { name:'Route Form',                 icon:'doc',      cat:'HR',         fields:'Movement & sign-off trail',              freq:'On event',fmt:'PDF' },
    { name:'WCF Incident Report',        icon:'shield',   cat:'HSEQ',       fields:'Workers Compensation Fund submissions',  freq:'On event',fmt:'PDF' },
    { name:'Leave Liability Statement',  icon:'money',    cat:'Finance',    fields:'Outstanding leave monetised, by site',   freq:'Monthly', fmt:'XLS' },
    { name:'Overtime Consolidation',     icon:'clock',    cat:'Operations', fields:'OT hours & cost per site',               freq:'Monthly', fmt:'XLS' },
  ];
  const recent = [
    { name:'Consolidated Monthly — May 2026', who:'Auto-generated', when:'01 Jun 06:00', size:'412 KB' },
    { name:'HR KPI Report — May 2026',        who:'Hawa Yusuph',    when:'02 Jun 09:14', size:'288 KB' },
    { name:'WCF — INC-2026-040 (Dar Yard)',   who:'Amina Hassan',   when:'15 Jun 16:40', size:'96 KB'  },
    { name:'Daily Site Report — Mwadui',      who:'Auto-generated', when:'Today 06:05',  size:'74 KB'  },
  ];
  const cats = ['All','Operations','HR','HSEQ','Finance'];
  let shown = reports.filter(r=>cat==='All'||r.cat===cat);
  if(q) shown = shown.filter(r=>(r.name+r.fields+r.cat).toLowerCase().includes(q.toLowerCase()));
  return <div className="grid" style={{gap:16}}>
    <div className="grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
      <KPI icon="doc" label="Report templates" value={reports.length} sub="standardised field sets"/>
      <KPI icon="chart" label="Generated (MTD)" value="1,284" sub="across all sites"/>
      <KPI icon="clock" label="On-time delivery" value="99.1%" sub="daily reports, all sites" trend="+2.3%" trendDir="up"/>
      <KPI icon="building" label="Sites reporting" value="5 / 5" sub="no delays this week"/>
    </div>

    <Card>
      <div className="card-h"><Icon name="chart" size={16} style={{color:'var(--accent)'}}/><h3>Report library</h3>
        <div style={{marginLeft:'auto',display:'flex',gap:4}}>
          {['Weekly','Monthly','Annual'].map(p=><button key={p} className={'btn sm '+(period===p?'primary':'ghost')} onClick={()=>setPeriod(p)}>{p}</button>)}
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 20px',borderBottom:'1px solid var(--border-2)',flexWrap:'wrap'}}>
        <Icon name="filter" size={14} style={{color:'var(--faint)'}}/>
        <div style={{display:'flex',gap:4}}>{cats.map(c=><button key={c} className={'btn sm '+(cat===c?'primary':'ghost')} onClick={()=>setCat(c)}>{c}</button>)}</div>
        <div className="search" style={{marginLeft:'auto',width:210}}><Icon name="search" size={15}/>
          <input placeholder="Filter by metric or field…" value={q} onChange={e=>setQ(e.target.value)}/></div>
      </div>
      <table className="tbl"><thead><tr><th>Report</th><th>Category</th><th>Fields</th><th>Frequency</th><th>Format</th><th></th></tr></thead>
        <tbody>{shown.map((r,i)=><tr key={i}>
          <td><div className="rowname"><span style={{width:30,height:30,borderRadius:8,background:'var(--accent-soft)',
            color:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Icon name={r.icon} size={16}/></span>
            <span className="name">{r.name}</span></div></td>
          <td><Tag tone={r.cat==='HSEQ'?'red':r.cat==='Finance'?'yellow':r.cat==='HR'?'blue':'grey'}>{r.cat}</Tag></td>
          <td className="muted" style={{fontSize:12.5}}>{r.fields}</td>
          <td className="muted">{r.freq}</td>
          <td className="num muted" style={{fontSize:12}}>{r.fmt}</td>
          <td style={{textAlign:'right',whiteSpace:'nowrap'}}>
            <button className="btn sm" style={{marginRight:5}} onClick={()=>setPreview(r)}>Preview</button>
            <button className="btn sm primary" onClick={()=>setPreview(r)}><Icon name="download" size={13}/>{period}</button></td>
        </tr>)}</tbody></table>
      {shown.length===0 && <div className="empty">No reports match this filter.</div>}
      <div style={{padding:'11px 20px',borderTop:'1px solid var(--border-2)',color:'var(--faint)',fontSize:12,display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
        <Icon name="lock" size={14}/>Scope: <b style={{color:'var(--text)'}}>{siteFilter}</b> · period: <b style={{color:'var(--text)'}}>{period}</b>
        · exports delivered only to the official address <b style={{color:'var(--accent)'}} className="num">{officialEmail}</b> (REQ-049)</div>
    </Card>

    <div className="grid" style={{gridTemplateColumns:'1fr 1fr'}}>
      <Card>
        <CardH title="Recently generated" icon="download"/>
        <div className="card-p">{recent.map((r,i)=><div key={i} className="feed-row" style={{padding:'10px 0'}}>
          <span style={{width:30,height:30,borderRadius:8,background:'var(--surface-2)',display:'flex',alignItems:'center',
            justifyContent:'center',color:'var(--muted)'}}><Icon name="doc" size={16}/></span>
          <div style={{minWidth:0}}><div style={{fontWeight:600,fontSize:13}}>{r.name}</div>
            <div className="muted" style={{fontSize:11.5}}>{r.who} · {r.when}</div></div>
          <span className="num muted" style={{marginLeft:'auto',fontSize:11.5}}>{r.size}</span>
          <button className="btn sm ghost"><Icon name="download" size={14}/></button>
        </div>)}</div>
      </Card>
      <Card>
        <CardH title="Output by category" icon="chart" meta="this month"/>
        <div className="card-p">
          {[['Operations',640,'var(--green)'],['HR',388,'var(--blue)'],['Finance',182,'var(--yellow)'],['HSEQ',74,'var(--red)']].map((r,i)=>
            <HBar key={i} label={r[0]} value={r[1]} max={640} color={r[2]} suffix={r[1]}/>)}
          <div style={{marginTop:14,display:'flex',gap:8}}>
            <button className="btn sm" onClick={()=>setSchedForm(true)}><Icon name="plus" size={13}/>Schedule report</button>
            <button className="btn sm ghost">Manage templates</button></div>
        </div>
      </Card>
    </div>

    {preview && <ReportPreview report={preview} period={period} officialEmail={officialEmail} onClose={()=>setPreview(null)}/>}
    {schedForm && <FormModal title="Schedule report" icon="chart" submitLabel="Schedule"
      fields={[
        {key:'report',label:'Report',type:'select',options:reports.map(r=>r.name),required:true},
        {key:'freq',label:'Frequency',type:'select',options:['Daily','Weekly','Monthly','Quarterly'],required:true},
        {key:'fmt',label:'Format',type:'select',options:['PDF','Excel','CSV']},
        {key:'to',label:'Deliver to (official)',type:'text',default:officialEmail,required:true}]}
      onSubmit={vals=>{ toast(vals.report+' scheduled · '+vals.freq+' → '+vals.to); }}
      onClose={()=>setSchedForm(false)}/>}
  </div>;
}
window.Reports = Reports;
