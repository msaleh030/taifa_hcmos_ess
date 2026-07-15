// Module: Approvals (role-scoped inbox)
function Approvals({ role }){
  const store = useHStore();
  const allowed = role.approves || [];
  const [filter,setFilter] = React.useState('all');
  // live leave requests routed to THIS role (e.g. Asha→Richard) — clear once worked
  const leaveItems = store.leave.filter(l=>(l.status==='Pending'||l.status==='Flagged') &&
      (l.approverRole===role.id || (allowed.includes('leave') && !l.approverRole)))
    .map(l=>({ id:l.id, type:'leave', who:l.who, no:l.no, site:l.site,
      detail:`${l.type} · ${l.days} days · ${l.from.slice(5)}–${l.to.slice(5)}`, raised:l.source, cover:l.cover, _lv:true }));
  let items = [...leaveItems, ...store.approvals.filter(a=>a.status==='Pending' && allowed.includes(a.type))];
  const types = [...new Set(items.map(a=>a.type))];
  const shown = filter==='all'?items:items.filter(a=>a.type===filter);
  return <div className="grid" style={{gap:16}}>
    <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(178px,1fr))'}}>
      <KPI icon="check" label="Awaiting you" value={items.length} sub="pending decisions" trend="action" trendDir="dn"/>
      <KPI icon="clock" label="Oldest item" value="4 days" sub="senior appointment"/>
      <KPI icon="trend" label="Approved (MTD)" value="128" sub="by you & delegates" trend="+14" trendDir="up"/>
      <KPI icon="shield" label="Your authority" value={allowed.length} unit="types" sub={allowed.map(t=>APPROVAL_LABELS[t]).join(', ')}/>
    </div>
    <Card>
      <div className="card-h">
        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
          <button className={'btn sm '+(filter==='all'?'primary':'ghost')} onClick={()=>setFilter('all')}>All</button>
          {types.map(t=><button key={t} className={'btn sm '+(filter===t?'primary':'ghost')} onClick={()=>setFilter(t)}>{APPROVAL_LABELS[t]}</button>)}
        </div>
        <span className="meta" style={{marginLeft:'auto'}}>{shown.length} item{shown.length!==1?'s':''}</span>
      </div>
      {shown.length? <table className="tbl"><thead><tr><th>Ref</th><th>Type</th><th>Request</th><th>Detail</th><th>Raised</th><th></th></tr></thead>
        <tbody>{shown.map(a=><tr key={a.id}>
          <td className="num muted" style={{fontSize:12}}>{a.id}</td>
          <td><Tag tone={a._lv?'blue':'grey'}>{APPROVAL_LABELS[a.type]}</Tag></td>
          <td><div style={{fontWeight:600}}>{a.who}</div><div className="muted" style={{fontSize:11.5}}>{a.no&&a.no!=='—'?a.no+' · ':''}{a.site}</div></td>
          <td className="muted" style={{fontSize:12.5}}>{a.detail}{a.cover&&<Tag tone="green" style={{marginLeft:6}}>covered</Tag>}</td>
          <td className="muted num" style={{fontSize:11.5}}>{a.raised}</td>
          <td style={{textAlign:'right',whiteSpace:'nowrap'}}>
            <button className="btn sm primary" style={{marginRight:5}} onClick={()=>a._lv?HStore.setLeaveStatus(a.id,'Approved',role.name,role.title):HStore.decide(a.id,'Approved',role.name,role.title)}><Icon name="check" size={13}/>Approve</button>
            <button className="btn sm" onClick={()=>a._lv?HStore.setLeaveStatus(a.id,'Declined',role.name,role.title):HStore.decide(a.id,'Declined',role.name,role.title)}>Decline</button></td>
        </tr>)}</tbody></table>
        : <div className="empty">No items awaiting your approval. You're all caught up.</div>}
    </Card>
  </div>;
}
window.Approvals = Approvals;
