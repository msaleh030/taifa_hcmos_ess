// Config-driven per-role overview dashboard.
function AccessStrip({ role }){
  const items = [['View',role.access.view,'blue'],['Edit',role.access.edit,'green'],['Approve',role.access.approve,'yellow']];
  return <Card className="card-p" style={{padding:'13px 18px'}}>
    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:11}}>
      <Icon name="shield" size={15} style={{color:'var(--accent)'}}/>
      <b style={{fontSize:13}}>Your access</b>
      <span className="muted" style={{fontSize:12}}>· {role.title}{role.scope!=='all'&&' · '+role.scope}</span>
      {role.readonly&&<span className="ro-lock" style={{marginLeft:'auto'}}><Icon name="lock" size={12}/>read-only</span>}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
      {items.map((it,i)=><div key={i}>
        <Tag tone={it[2]}>{it[0]}</Tag>
        <div className="muted" style={{fontSize:12,marginTop:6,lineHeight:1.45}}>{it[1]}</div></div>)}
    </div>
  </Card>;
}

// ── Panels ──
function PApprovals({ role }){
  const items = APPROVALS.filter(a=>role.approves.includes(a.type)).slice(0,5);
  return <Card>
    <CardH title="Approvals awaiting you" icon="check" meta={items.length+' pending'}/>
    {items.length? <table className="tbl"><tbody>{items.map(a=><tr key={a.id}>
      <td style={{width:1}}><Tag tone="grey">{APPROVAL_LABELS[a.type]}</Tag></td>
      <td><div style={{fontWeight:600,fontSize:13}}>{a.who}</div><div className="muted" style={{fontSize:11.5}}>{a.detail}</div></td>
      <td style={{textAlign:'right',whiteSpace:'nowrap'}}>
        <button className="btn sm primary" style={{marginRight:5}} onClick={()=>toast('Approved · '+a.who)}>Approve</button><button className="btn sm" onClick={()=>toast('Declined · '+a.who,'x')}>Decline</button></td>
    </tr>)}</tbody></table> : <div className="empty">Nothing awaiting approval.</div>}
  </Card>;
}
function PAttendance({ role }){
  const sites = role.scope==='all'?SITES:SITES.filter(s=>s.name===role.scope);
  const max = Math.max(...sites.map(s=>s.hc));
  return <Card>
    <CardH title={role.scope==='all'?'Attendance by site':'Team attendance'} icon="clock" meta="clocked in today"/>
    <div className="card-p">{sites.map((s,i)=><HBar key={i} label={s.name} value={s.hc-s.onLeave} max={max}
      color="var(--green)" suffix={(s.hc-s.onLeave)+'/'+s.hc}/>)}
      <div style={{display:'flex',gap:8,marginTop:12,fontSize:11.5,color:'var(--faint)',alignItems:'center'}}>
        <Icon name="pin" size={13}/>GPS geofence · biometric · kiosk · offline sync</div>
    </div>
  </Card>;
}
function PLeaveReq(){
  return <Card>
    <CardH title="Leave requests" icon="calendar" meta="to process"/>
    <table className="tbl"><tbody>{LEAVE_REQUESTS.slice(0,5).map((r,i)=><tr key={i}>
      <td><RowName name={r.who} sub={r.site}/></td>
      <td><Tag tone={r.type==='Sick'?'yellow':'blue'}>{r.type}</Tag></td>
      <td className="num">{r.days}d</td>
      <td>{r.status==='Approved'?<Tag tone="green">Approved</Tag>:r.status==='Flagged'?<Tag tone="red">Flagged</Tag>:<Tag tone="grey">Pending</Tag>}</td>
    </tr>)}</tbody></table>
  </Card>;
}
function PTraining(){
  return <Card>
    <CardH title="Training compliance" icon="award" meta={TRAINING.compliance+'% overall'}/>
    <div className="card-p">{TRAINING.courses.slice(0,5).map((c,i)=><HBar key={i} label={c.name} value={c.complete} max={100}
      color={c.complete>=90?'var(--green)':c.complete>=75?'var(--yellow)':'var(--red)'} suffix={c.complete+'%'}/>)}</div>
  </Card>;
}
function PIncidents(){
  return <Card>
    <CardH title="Incident register" icon="alert" meta="recent"/>
    <table className="tbl"><tbody>{HSEQ_INCIDENTS.slice(0,5).map(x=><tr key={x.id}>
      <td className="num" style={{fontWeight:600,fontSize:12}}>{x.id}</td>
      <td>{x.type}<div className="muted" style={{fontSize:11}}>{x.site} · {x.date.slice(5)}</div></td>
      <td><Tag tone={x.sev==='High'?'red':x.sev==='Medium'?'yellow':'grey'}>{x.sev}</Tag></td>
      <td>{x.lti?<Tag tone="red" dot>{x.days}d LTI</Tag>:<span className="muted">—</span>}</td>
    </tr>)}</tbody></table>
  </Card>;
}
function PGrievances(){
  return <Card>
    <CardH title="Grievances" icon="flag" meta={GRIEVANCE_KPI.open+' open'}/>
    <table className="tbl"><tbody>{GRIEVANCES.map(g=><tr key={g.id}>
      <td className="num" style={{fontWeight:600,fontSize:12}}>{g.id}{g.conf&&<Icon name="lock" size={11} style={{marginLeft:5,color:'var(--faint)'}}/>}</td>
      <td>{g.cat}<div className="muted" style={{fontSize:11}}>{g.site}</div></td>
      <td><Tag tone={g.stage==='Closed'?'green':g.stage==='Outcome'?'blue':'yellow'}>{g.stage}</Tag></td>
      <td><span style={{fontSize:11.5,color:g.sla==='At risk'?'var(--red)':'var(--muted)'}}>{g.sla}</span></td>
    </tr>)}</tbody></table>
  </Card>;
}
function PRecruit(){
  return <Card>
    <CardH title="Recruitment pipeline" icon="briefcase" meta="open requisitions"/>
    <table className="tbl"><tbody>{RECRUITMENT.map((r,i)=><tr key={i}>
      <td className="name">{r.role}<div className="muted" style={{fontSize:11}}>{r.site}</div></td>
      <td><Tag tone={r.stage==='Offer'?'green':r.stage==='Medical (OSHA)'?'yellow':'blue'}>{r.stage}</Tag></td>
      <td className="num" style={{fontWeight:600}}>{r.cands}</td>
    </tr>)}</tbody></table>
  </Card>;
}
function PSiteWage({ role }){
  const money = role.money; const siteMax=Math.max(...SITES.map(s=>s.hc)); const wageMax=Math.max(...SITES.map(s=>s.wage));
  return <Card>
    <CardH title="Headcount & wage bill by site" icon="building" meta="May 2026"/>
    <div className="card-p">{SITES.map((s,i)=><div key={s.id} style={{padding:'8px 0',borderBottom:i<SITES.length-1?'1px solid var(--border-2)':'none'}}>
      <div style={{display:'flex',alignItems:'center',marginBottom:6}}><span style={{fontWeight:600,fontSize:13}}>{s.name}</span>
        <Tag tone="grey">{s.type}</Tag><span className="num" style={{marginLeft:'auto',fontWeight:600}}>{s.hc}</span></div>
      <div style={{display:'grid',gridTemplateColumns:money?'1fr 1fr':'1fr',gap:14}}>
        <HBar label="Headcount" value={s.hc} max={siteMax} color="var(--green)" suffix={s.hc}/>
        {money&&<HBar label="Wage" value={s.wage} max={wageMax} color="var(--blue)" suffix={TZSm(s.wage)}/>}
      </div></div>)}</div>
  </Card>;
}
function PRoleComp(){
  return <Card>
    <CardH title="Role composition" icon="users" meta={TOTAL_HC.toLocaleString()+' total'}/>
    <div className="card-p">{ROLE_COUNTS.slice(0,7).map((r,i)=><HBar key={i} label={r.role} value={r.count} max={ROLE_COUNTS[0].count}
      color={['var(--green)','var(--blue)','var(--yellow)'][i%3]} suffix={r.count}/>)}</div>
  </Card>;
}
function PExits(){
  return <Card>
    <CardH title="Exits & movements" icon="trend" meta="YTD"/>
    <div className="card-p stat-inline" style={{flexWrap:'wrap',gap:'18px 22px'}}>
      {[['Terminations',14],['Retrenchments',5],['New joiners',62],['Transfers',31],['Expatriates',25],['Promotions',9]].map((r,i)=>
        <div className="si" key={i} style={{minWidth:84}}><div className="v num">{r[1]}</div><div className="l">{r[0]}</div></div>)}
    </div>
  </Card>;
}
function PSafety(){
  return <Card>
    <CardH title="Safety (HSEQ)" icon="shield"/>
    <div className="card-p" style={{display:'flex',gap:16,alignItems:'center'}}>
      <Ring pct={Math.min(100,HSEQ_KPI.daysSinceLTI/30*100)} value={HSEQ_KPI.daysSinceLTI} label="days no LTI" color="var(--yellow)"/>
      <div style={{display:'flex',flexDirection:'column',gap:10,flex:1}}>
        {[['LTI year-to-date',HSEQ_KPI.ltiYTD],['Lost days',HSEQ_KPI.lostDays],['Incidents (MTD)',HSEQ_KPI.incidentsMTD],['Open WCF',HSEQ_KPI.openWCF]].map((r,i)=>
          <div key={i} style={{display:'flex',gap:9,fontSize:13}}><span className="muted">{r[0]}</span>
            <span className="num" style={{marginLeft:'auto',fontWeight:600}}>{r[1]}</span></div>)}
      </div></div>
  </Card>;
}
function PCompetency(){
  return <Card>
    <CardH title="Competency authorisation" icon="award" meta="Taifa + client sign-off"/>
    <table className="tbl"><tbody>{COMPETENCY.map((c,i)=><tr key={i}>
      <td><RowName name={c.who}/></td>
      <td><Tag tone="grey">{c.equip}</Tag></td>
      <td>{c.authed?<Tag tone="green">Authorised</Tag>:<Tag tone="yellow">{c.step}/{c.of}</Tag>}</td>
    </tr>)}</tbody></table>
  </Card>;
}
function PLabourCost(){
  const wageMax=Math.max(...SITES.map(s=>s.wage));
  return <Card>
    <CardH title="Labour cost by site" icon="money" meta="June · TZS"/>
    <div className="card-p">{SITES.map((s,i)=><HBar key={i} label={s.name} value={s.wage} max={wageMax} color="var(--blue)" suffix={TZSm(s.wage)}/>)}
      <div style={{display:'flex',justifyContent:'space-between',marginTop:12,paddingTop:10,borderTop:'1px solid var(--border-2)',fontSize:13}}>
        <span className="muted">Total wage bill</span><span className="num" style={{fontWeight:700}}>{TZSm(TOTAL_WAGE)}</span></div>
    </div>
  </Card>;
}
function PPayroll(){
  return <Card>
    <CardH title="Statutory contributions" icon="shield" meta={PAYROLL.cycle}/>
    <div className="card-p">{PAYROLL.statutory.map((s,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:10,
      padding:'8px 0',borderBottom:i<PAYROLL.statutory.length-1?'1px solid var(--border-2)':'none'}}>
      <Tag tone={s.tone}>{s.code}</Tag><span style={{fontSize:12.5}} className="muted">{s.rate}</span>
      <span className="num" style={{marginLeft:'auto',fontWeight:600}}>{TZSm(s.amount)}</span></div>)}</div>
  </Card>;
}
function PPayslip(){
  return <Card>
    <CardH title="Payslip status" icon="doc" meta={PAYROLL.cycle}/>
    <div className="card-p" style={{display:'flex',flexDirection:'column',gap:11}}>
      {PAYROLL.payslipStatus.map((p,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:9,fontSize:13}}>
        <span className="dotbadge" style={{background:['var(--green)','var(--yellow)','var(--red)'][i]}}/>
        <span className="muted">{p.label}</span><span className="num" style={{marginLeft:'auto',fontWeight:600}}>{p.n}</span></div>)}
      <button className="btn sm" style={{marginTop:4,alignSelf:'flex-start'}}><Icon name="download" size={13}/>Secure payslip batch</button>
    </div>
  </Card>;
}
function PIntegration(){
  return <Card>
    <CardH title="Exact hand-off" icon="swap" meta="next: 28 Jun"/>
    <div className="card-p" style={{display:'flex',flexDirection:'column',gap:9}}>
      {[['Extract approved HR data','done'],['Validate statutory rules','done'],['Generate Exact file','done'],['Finance sign-off','pending']].map((s,i)=>
        <div key={i} style={{display:'flex',alignItems:'center',gap:10,fontSize:13}}>
          <span style={{width:18,height:18,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
            background:s[1]==='done'?'var(--green)':'var(--yellow)',color:'#fff'}}>{s[1]==='done'?<Icon name="check" size={11}/>:<Icon name="clock" size={11}/>}</span>
          <span>{s[0]}</span><Tag tone={s[1]==='done'?'green':'yellow'} style={{marginLeft:'auto'}}>{s[1]}</Tag></div>)}
    </div>
  </Card>;
}

const PANELS = {
  approvals:{span:2,c:PApprovals}, attendance:{span:1,c:PAttendance}, leaveReq:{span:1,c:PLeaveReq},
  training:{span:1,c:PTraining}, incidents:{span:1,c:PIncidents}, grievances:{span:1,c:PGrievances},
  recruit:{span:1,c:PRecruit}, siteWage:{span:1,c:PSiteWage}, roleComp:{span:1,c:PRoleComp},
  exits:{span:1,c:PExits}, safety:{span:1,c:PSafety}, competency:{span:2,c:PCompetency},
  labourCost:{span:1,c:PLabourCost}, payroll:{span:1,c:PPayroll}, payslip:{span:1,c:PPayslip}, integration:{span:1,c:PIntegration},
};

const PANEL_SOURCE = {
  approvals:'approvals', attendance:'leave', leaveReq:'leave', training:'training', incidents:'hseq',
  grievances:'grievances', recruit:'performance', siteWage:'employees', roleComp:'employees',
  exits:'employees', safety:'hseq', competency:'hseq', labourCost:'payroll', payroll:'payroll',
  payslip:'payroll', integration:'integration',
};
const MODULE_LABEL = {
  approvals:'Approvals', leave:'Leave & Attendance', training:'Training', hseq:'HSEQ',
  grievances:'Grievances', performance:'Performance', employees:'Employees', payroll:'Payroll',
  integration:'Exact Integration', admin:'Security & Access', reports:'Reports',
};
function kpiTarget(k){
  const l=(k.label||'').toLowerCase();
  if(/approval/.test(l)) return 'approvals';
  if(/wage|labour cost|gross|net|nssf|paye|payslip|budget|statutory|pay\b/.test(l)) return 'payroll';
  if(/leave|liability|carry/.test(l)) return 'leave';
  if(/overtime|clock|attendance|labour today/.test(l)) return 'leave';
  if(/lti|incident|wcf|ppe|medical|safety/.test(l)) return 'hseq';
  if(/appraisal|recruit|promotion/.test(l)) return 'performance';
  if(/grievance/.test(l)) return 'grievances';
  if(/training|compliance/.test(l)) return 'training';
  if(/account|role|provision|audit|integrity/.test(l)) return 'admin';
  if(/headcount|workforce|employee|records|department|team|turnover|exits|promotions/.test(l)) return 'employees';
  return null;
}

function Dashboard({ role, onNavigate }){
  const st = useHStore();
  const m = HStore.metrics();
  const dash = role.dash || { kpis:[K.headcount,K.onLeave,K.wage,K.liability], panels:['siteWage','roleComp'] };
  const go = (id) => { if(onNavigate && role.pages.includes(id)) onNavigate(id); };
  const livePending = st.approvals.filter(a=>a.status==='Pending'&&(role.approves||[]).includes(a.type)).length
    + st.leave.filter(l=>(l.status==='Pending'||l.status==='Flagged')&&(l.approverRole===role.id||((role.approves||[]).includes('leave')&&!l.approverRole))).length;
  const liveVal = (k)=>{ const l=(k.label||'').toLowerCase();
    if(/headcount|workforce/.test(l) && /^[\d,]+$/.test(String(k.value).replace(/,/g,''))) return m.headcount.toLocaleString();
    if(/pending approvals/.test(l)) return livePending;
    return k.value; };
  const liveSub = (k)=>{ const l=(k.label||'').toLowerCase();
    if(/headcount|workforce/.test(l) && m.newHires>0) return `${m.newHires} new joiner${m.newHires>1?'s':''} this period`;
    return k.sub; };
  return <div className="grid" style={{gap:16}}>
    <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(178px,1fr))'}}>
      {dash.kpis.map((k,i)=>{ const tgt=kpiTarget(k); const can=tgt&&role.pages.includes(tgt);
        return <KPI key={i} icon={k.icon} label={k.label} value={liveVal(k)} unit={k.unit} sub={liveSub(k)} trend={k.trend} trendDir={k.trendDir}
          onClick={can?()=>go(tgt):null} source={can?MODULE_LABEL[tgt]:null}/>; })}
    </div>
    <AccessStrip role={role}/>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
      {dash.panels.map((pid,i)=>{ const P=PANELS[pid]; if(!P) return null; const C=P.c;
        const src=PANEL_SOURCE[pid]; const can=onNavigate&&src&&role.pages.includes(src);
        return <div key={i} style={{gridColumn:P.span===2?'1 / -1':'auto'}}><C role={role}/>
          {can && <button className="src-link" onClick={()=>go(src)}><Icon name="swap" size={11}/>Drill into {MODULE_LABEL[src]}<Icon name="chevR" size={12}/></button>}
        </div>; })}
    </div>
  </div>;
}
window.Dashboard = Dashboard;
