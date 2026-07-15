// Module: Leave & Attendance (rotations, GPS clock-in, leave liability)
function siteXY(s){
  // map lng/lat into 0-100 box for the SITES bounds (Tanzania)
  const x = (s.lng - 31.8)/(39.6-31.8)*88 + 6;
  const y = (s.lat - (-1.2))/((-7.2)-(-1.2))*82 + 9;
  return { x, y };
}
function Leave({ siteFilter, money=true }){
  const store = useHStore();
  const [live,setLive] = React.useState(CLOCKIN_FEED);
  // simulate a live punch arriving
  React.useEffect(()=>{
    const names=[['Esther Mushi','TMC-03741','Geita Civil','Geofence'],['Grace Ndaki','TMC-03190','Nyanzaga','Kiosk'],['Amina Hassan','TMC-04455','Mwadui','Geofence']];
    const id=setInterval(()=>{
      const n=names[Math.floor(Math.random()*names.length)];
      const t=new Date(); const tm=String(6).padStart(2,'0')+':'+String(15+Math.floor(Math.random()*44)).padStart(2,'0');
      setLive(p=>[{name:n[0],no:n[1],site:n[2],time:tm,method:n[3],state:Math.random()>0.85?'flag':'in',inzone:Math.random()>0.15},...p].slice(0,8));
    },3800);
    return ()=>clearInterval(id);
  },[]);
  // ── scope: site-scoped roles (e.g. Project Manager) see ONLY their site;
  //    all-site roles (e.g. Head of HR) see every site. ──
  const scoped = siteFilter && siteFilter!=='All';
  const sites = scoped ? SITES.filter(s=>s.name===siteFilter) : SITES;
  const fHC = sites.reduce((a,s)=>a+s.hc,0);
  const fLeave = sites.reduce((a,s)=>a+s.onLeave,0);
  const fOT = sites.reduce((a,s)=>a+s.ot,0);
  const onShift = fHC - fLeave;
  const fLiability = scoped ? Math.round(LEAVE_LIABILITY*(fHC/TOTAL_HC)) : LEAVE_LIABILITY;
  const scopeSub = scoped ? siteFilter+' only' : 'all sites';

  // ── automated scheduling: draw down high balances without breaking coverage ──
  const DR = HStore.DAILY_RATE;
  const sugByNo = {}; store.suggestions.forEach(s=>{ sugByNo[s.no]=s; });
  const candidates = EMPLOYEES.filter(e=>e.status==='Active' && e.leave>14 &&
      (siteFilter==='All'||e.site===siteFilter)).map(e=>{
    const days = Math.min(10, Math.max(5, Math.round(e.leave-11)));
    const sd = 8 + (parseInt(e.no.replace(/\D/g,'').slice(-2))%16);
    const ed = sd + days + 2;
    const from = `2026-07-${String(sd).padStart(2,'0')}`;
    const to   = `2026-0${ed>31?8:7}-${String(ed>31?ed-31:ed).padStart(2,'0')}`;
    return { e, days, from, to, saves:days*DR, sug:sugByNo[e.no] };
  });
  const drawdown = candidates.reduce((a,c)=>a+(c.sug&&c.sug.status!=='Dismissed'?0:c.saves),0);
  const proposeOne = (c)=>HStore.propose({ no:c.e.no, name:c.e.name, site:c.e.site, type:'Annual',
    from:c.from, to:c.to, days:c.days, cover:'Auto-assigned', saves:c.saves,
    rationale:`Balance ${c.e.leave}d · ${c.days}-day window keeps coverage` });
  return <div className="grid" style={{gap:16}}>
    <div className="grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
      <KPI icon="clock" label="Clocked in today" value={onShift.toLocaleString()} sub={'GPS · biometric · '+scopeSub} trend="98.2% on time" trendDir="up"/>
      <KPI icon="trend" label="Overtime (hrs, MTD)" value={fOT.toLocaleString()} sub={'auto-consolidated · '+scopeSub}/>
      <KPI icon="calendar" label="On leave" value={fLeave} sub="coverage rules enforced"/>
      {money
        ? <KPI icon="money" label="Leave liability" value={TZSm(fLiability)} sub="carry-over capped at 2 yrs" trend="-4.2%" trendDir="up"/>
        : <KPI icon="shield" label="Carry-over breaches" value="0" sub="2-year cap enforced" trend="compliant" trendDir="up"/>}
    </div>

    <div className="grid" style={{gridTemplateColumns:'1.25fr 1fr'}}>
      <Card>
        <CardH title="GPS geofenced clock-in — live console" icon="pin" meta={scoped?siteFilter+' · site-scoped':'REQ-062 · all sites'}/>
        <div className="card-p">
          <div className="map">
            {sites.map(s=>{const p=siteXY(s);const r=22+s.hc/12;return <div className="geo" key={s.id} style={{left:p.x+'%',top:p.y+'%'}}>
              <div className="ring" style={{width:r,height:r}}/><div className="pin"/>
              <div className="lab2">{s.name} <span className="num" style={{color:'var(--accent)'}}>{s.hc-s.onLeave}</span></div>
            </div>;})}
            <div style={{position:'absolute',left:12,bottom:10,fontSize:10.5,color:'var(--faint)',
              display:'flex',gap:12,background:'var(--surface)',padding:'5px 9px',borderRadius:6,border:'1px solid var(--border)'}}>
              <span><span className="dotbadge" style={{background:'var(--green)',marginRight:5}}/>Active geofence</span>
              <span>Pulse = live punches</span></div>
          </div>
          <div style={{maxHeight:180,overflowY:'auto',marginTop:4}}>
            {live.filter(c=>!scoped||c.site===siteFilter).map((c,i)=><div className="feed-row" key={i+c.no} style={{padding:'9px 0'}}>
              <Avatar name={c.name} size={26}/>
              <div style={{minWidth:0}}><div style={{fontWeight:600,fontSize:13}}>{c.name}</div>
                <div className="muted" style={{fontSize:11.5}}>{c.site} · {c.method}</div></div>
              <span className="num muted" style={{marginLeft:'auto',fontSize:12}}>{c.time}</span>
              {c.state==='flag'?<Tag tone="red" dot>Outside zone</Tag>:c.state==='sync'?<Tag tone="yellow" dot>Synced offline</Tag>:<Tag tone="green" dot>In zone</Tag>}
            </div>)}
            {scoped && !live.some(c=>c.site===siteFilter) && <div className="empty" style={{padding:'14px 0'}}>Awaiting punches from {siteFilter}…</div>}
          </div>
        </div>
      </Card>

      <div className="grid" style={{gap:16}}>
        <Card>
          <CardH title="Rotation patterns" icon="calendar" meta="configurable per group"/>
          <div className="card-p">{ROTATIONS.map((r,i)=><div key={r.id} style={{display:'flex',alignItems:'center',gap:12,
            padding:'10px 0',borderBottom:i<ROTATIONS.length-1?'1px solid var(--border-2)':'none'}}>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{r.label}</div>
              <div className="muted" style={{fontSize:11.5}}>{r.desc}</div></div>
            <div style={{textAlign:'right'}}><div className="num" style={{fontWeight:600}}>{r.groups}</div>
              <div className="muted" style={{fontSize:10.5}}>in pattern</div></div>
          </div>)}</div>
        </Card>
        <Card>
          <CardH title="Leave governance" icon="shield"/>
          <div className="card-p" style={{display:'flex',flexDirection:'column',gap:10}}>
            {[['Max 14 continuous days','enforced','green'],['Carry-over > 2 years','blocked','green'],
              ['Coverage rule (not all supervisors off)','active','green'],['No accrual to next year','on','green']].map((r,i)=>
              <div key={i} style={{display:'flex',alignItems:'center',gap:9,fontSize:13}}>
                <Icon name="check" size={15} style={{color:'var(--green)'}}/><span>{r[0]}</span>
                <Tag tone="green" style={{marginLeft:'auto'}}>{r[1]}</Tag></div>)}
          </div>
        </Card>
      </div>
    </div>

    <div className="grid" style={{gridTemplateColumns:'1.3fr 1fr'}}>
      <Card>
        <CardH title="Leave types & accrual rules" icon="calendar" meta="Tanzania ELRA · Taifa policy"/>
        <table className="tbl"><thead><tr><th>Leave type</th><th>Code</th><th>Paid</th><th>Accrual</th><th>Entitlement</th><th>Carry</th><th>Docs</th></tr></thead>
          <tbody>{LEAVE_TYPES.map((l,i)=><tr key={i} title={l.note}>
            <td className="name">{l.type}</td>
            <td className="num muted">{l.code}</td>
            <td>{l.paid?<Tag tone="green">Paid</Tag>:<Tag tone="grey">Unpaid</Tag>}</td>
            <td className="muted" style={{fontSize:12}}>{l.accrual}</td>
            <td className="num" style={{fontWeight:600}}>{l.entitlement}</td>
            <td className="num muted">{l.carry}</td>
            <td>{l.docs?<Icon name="doc" size={14} style={{color:'var(--accent)'}}/>:<span className="muted">—</span>}</td>
          </tr>)}</tbody></table>
      </Card>
      <Card>
        <CardH title="Approval routing" icon="shield" meta="Time & Leave · multi-step"/>
        <div className="card-p">{LEAVE_ROUTE.map((s,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:10,
          padding:'8px 0',borderBottom:i<LEAVE_ROUTE.length-1?'1px solid var(--border-2)':'none'}}>
          <span style={{width:22,height:22,borderRadius:'50%',background:i===LEAVE_ROUTE.length-1?'var(--accent)':'var(--accent-soft)',
            color:i===LEAVE_ROUTE.length-1?'#fff':'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',
            fontWeight:700,fontSize:11,flexShrink:0}}>{i+1}</span>
          <span style={{fontSize:13,fontWeight:i===LEAVE_ROUTE.length-1?600:500}}>{s}</span>
        </div>)}
          <div style={{marginTop:12,padding:11,borderRadius:8,background:'var(--surface-2)',fontSize:11.5,color:'var(--muted)',display:'flex',gap:8}}>
            <Icon name="shield" size={14} style={{color:'var(--accent)',flexShrink:0}}/>{LEAVE_ROUTE_RULE}</div>
        </div>
      </Card>
    </div>

    <Card>
      <CardH title="Automated leave scheduler" icon="calendar" meta="liability-aware · coverage-checked"
        action={<div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:10}}>
          <span className="muted" style={{fontSize:12}}>Potential draw-down <b className="num" style={{color:'var(--accent)'}}>{TZSm(drawdown)}</b></span>
          <button className="btn sm primary" onClick={()=>{ const todo=candidates.filter(c=>!c.sug); if(!todo.length){toast('All eligible windows already proposed');return;} todo.forEach(proposeOne); }}>
            <Icon name="swap" size={13}/>Propose all to ESS</button></div>}/>
      <div style={{padding:'10px 20px',borderBottom:'1px solid var(--border-2)',fontSize:12,color:'var(--muted)',display:'flex',gap:8,alignItems:'center'}}>
        <Icon name="shield" size={14} style={{color:'var(--accent)'}}/>The planner targets balances over 14 days, fits windows around rotations &amp; coverage, and nudges employees via ESS — reducing the company's monetised leave liability.</div>
      {candidates.length? <table className="tbl"><thead><tr><th>Employee</th><th>Site</th><th>Balance</th><th>Suggested window</th><th>Days</th><th>Liability ↓</th><th>Coverage</th><th></th></tr></thead>
        <tbody>{candidates.map((c,i)=><tr key={i}>
          <td><RowName name={c.e.name} sub={c.e.no}/></td>
          <td className="muted">{c.e.site}</td>
          <td className="num" style={{fontWeight:600,color:c.e.leave>20?'var(--red)':'inherit'}}>{c.e.leave.toFixed(1)}d</td>
          <td className="num">{c.from.slice(5)} → {c.to.slice(5)}</td>
          <td className="num" style={{fontWeight:600}}>{c.days}</td>
          <td className="num" style={{color:'var(--accent)',fontWeight:600}}>{TZSm(c.saves)}</td>
          <td><Tag tone="green" dot>Maintained</Tag></td>
          <td style={{textAlign:'right',whiteSpace:'nowrap'}}>
            {!c.sug? <button className="btn sm primary" onClick={()=>proposeOne(c)}><Icon name="swap" size={12}/>Propose</button>
              : c.sug.status==='Accepted'? <Tag tone="green">Accepted</Tag>
              : c.sug.status==='Dismissed'? <Tag tone="grey">Declined</Tag>
              : <Tag tone="blue">Proposed · ESS</Tag>}</td>
        </tr>)}</tbody></table>
        : <div className="empty">No balances above the 14-day threshold for this scope.</div>}
    </Card>

    <Card>
      <CardH title="Leave & sick-leave requests" icon="calendar" meta="auto-planned · coverage-checked"
        action={<div style={{marginLeft:'auto',display:'flex',gap:10,alignItems:'center'}}><SyncBadge/><button className="btn sm ghost">Leave planner</button></div>}/>
      <table className="tbl"><thead><tr><th>Employee</th><th>Site</th><th>Type</th><th>Dates</th><th>Days</th><th>Coverage</th><th>Status</th><th></th></tr></thead>
        <tbody>{store.leave.filter(r=>!scoped||r.site===siteFilter).map((r,i)=><tr key={r.id}>
          <td><RowName name={r.who} sub={r.no}/></td>
          <td className="muted">{r.site}</td>
          <td><Tag tone={r.type==='Sick'?'yellow':'blue'}>{r.type}</Tag></td>
          <td className="num">{r.from.slice(5)} → {r.to.slice(5)}</td>
          <td className="num" style={{fontWeight:600,color:r.days>14?'var(--red)':'inherit'}}>{r.days}</td>
          <td>{r.cover?<Tag tone="green" dot>Covered</Tag>:<Tag tone="red" dot>No cover</Tag>}</td>
          <td>{r.status==='Approved'?<Tag tone="green">Approved</Tag>:r.status==='Declined'?<Tag tone="red">Declined</Tag>:r.status==='Flagged'?<Tag tone="red">Flagged</Tag>:<Tag tone="grey">Pending</Tag>}{r.source==='ESS'&&<Tag tone="blue" style={{marginLeft:5}}>from ESS</Tag>}</td>
          <td style={{textAlign:'right',whiteSpace:'nowrap'}}>{(r.status==='Pending'||r.status==='Flagged')&&<><button className="btn sm primary" style={{marginRight:5}} onClick={()=>HStore.setLeaveStatus(r.id,'Approved')}>Approve</button><button className="btn sm" onClick={()=>HStore.setLeaveStatus(r.id,'Declined')}>Decline</button></>}</td>
        </tr>)}</tbody></table>
      {store.leave.some(r=>r.status==='Flagged')&&<div style={{padding:'10px 20px',borderTop:'1px solid var(--border-2)',
        display:'flex',gap:8,alignItems:'center',color:'#9A6B00',fontSize:12.5}}>
        <Icon name="alert" size={15}/>Esther Mushi: 12-day request conflicts with site coverage — planner suggests splitting.</div>}
    </Card>
  </div>;
}
window.Leave = Leave;
