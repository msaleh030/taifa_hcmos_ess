// Shared ESS mobile screens — used by BOTH the employee ESS and the back-end
// (manager) ESS so the design is identical. Each takes the signed-in employee
// record `me` ({no,name,site}) plus the host theme `C` and `wrap`/`card` styles.

function MobHeader({ title, sub, C, onBack }){
  return <div style={{padding:'4px 18px 12px',display:'flex',alignItems:'center',gap:10}}>
    {onBack && <button onClick={onBack} style={{background:'none',border:'none',cursor:'pointer',color:C.ink,padding:0,display:'flex'}}><Icon name="chevR" size={20} style={{transform:'rotate(180deg)'}}/></button>}
    <div><div style={{fontSize:21,fontWeight:700,letterSpacing:'-.02em'}}>{title}</div>
      {sub&&<div style={{color:C.mut,fontSize:12.5}}>{sub}</div>}</div></div>;
}

// ── Payslip: list + detailed slip + previous slips ──
function EssPayslip({ me, C, card, wrap, onBack }){
  useHStore();
  const slips = (typeof PAYSLIPS!=='undefined'?PAYSLIPS:[]);
  const [sel,setSel] = React.useState(slips[0]);
  const TZSn = n => 'TZS '+n.toLocaleString();
  if(sel){
    const earn = [['Basic salary',sel.basic],['Housing allowance',sel.housing],['Transport',sel.transport],['Overtime',sel.overtime]];
    const ded = [['PAYE (income tax)',sel.paye],['NSSF (10%)',sel.nssf],['Salary advance',sel.advances]].filter(d=>d[1]>0);
    const gross = earn.reduce((a,r)=>a+r[1],0);
    const dtot = ded.reduce((a,r)=>a+r[1],0);
    return <div style={wrap}><MobHeader title="Payslip" sub={sel.period} C={C} onBack={()=>setSel(null)}/>
      <div style={{padding:'0 16px 90px',display:'flex',flexDirection:'column',gap:12}}>
        <div style={{...card,background:`linear-gradient(135deg,${C.green},#168A3E)`,color:'#fff',border:'none'}}>
          <div style={{fontSize:11.5,opacity:.85}}>Net pay · {sel.period}</div>
          <div style={{fontFamily:"'IBM Plex Mono'",fontSize:28,fontWeight:700,margin:'3px 0'}}>{TZSn(sel.net)}</div>
          <div style={{display:'flex',gap:8,alignItems:'center',fontSize:11.5,opacity:.9}}>
            <Icon name={sel.status==='Paid'?'check':'clock'} size={13}/>{sel.status} · {sel.date}
            <span style={{marginLeft:'auto',background:'rgba(255,255,255,.18)',padding:'2px 8px',borderRadius:20,fontWeight:600}}>{sel.id}</span></div>
        </div>
        <div style={{...card}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>Earnings</div>
          {earn.map((r,i)=><div key={i} style={{display:'flex',padding:'6px 0',fontSize:13,borderTop:i?`1px solid ${C.bd}`:'none'}}>
            <span style={{color:C.mut}}>{r[0]}</span><span style={{marginLeft:'auto',fontFamily:"'IBM Plex Mono'",fontWeight:600}}>{r[1].toLocaleString()}</span></div>)}
          <div style={{display:'flex',padding:'8px 0 0',marginTop:6,borderTop:`2px solid ${C.bd}`,fontSize:13,fontWeight:700}}>
            <span>Gross</span><span style={{marginLeft:'auto',fontFamily:"'IBM Plex Mono'"}}>{gross.toLocaleString()}</span></div>
        </div>
        <div style={{...card}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>Deductions</div>
          {ded.map((r,i)=><div key={i} style={{display:'flex',padding:'6px 0',fontSize:13,borderTop:i?`1px solid ${C.bd}`:'none'}}>
            <span style={{color:C.mut}}>{r[0]}</span><span style={{marginLeft:'auto',fontFamily:"'IBM Plex Mono'",fontWeight:600,color:'#E5484D'}}>−{r[1].toLocaleString()}</span></div>)}
          <div style={{display:'flex',padding:'8px 0 0',marginTop:6,borderTop:`2px solid ${C.bd}`,fontSize:13,fontWeight:700}}>
            <span>Total deductions</span><span style={{marginLeft:'auto',fontFamily:"'IBM Plex Mono'"}}>−{dtot.toLocaleString()}</span></div>
        </div>
        <div style={{...card,background:'rgba(0,148,212,.06)',border:`1px solid rgba(0,148,212,.3)`,fontSize:12,color:C.mut,
          display:'flex',gap:8,alignItems:'center'}}><Icon name="lock" size={14} style={{color:C.blue}}/>Confidential · secure in-app delivery only. Open printing is a breach.</div>
      </div>
    </div>;
  }
  return <div style={wrap}><MobHeader title="My payslips" sub="secure delivery · history" C={C} onBack={onBack}/>
    <div style={{padding:'0 16px 90px',display:'flex',flexDirection:'column',gap:11}}>
      {slips.map((s,i)=><button key={s.id} onClick={()=>setSel(s)} style={{...card,textAlign:'left',cursor:'pointer',
        display:'flex',alignItems:'center',gap:12}}>
        <span style={{width:36,height:36,borderRadius:9,background:'rgba(31,162,74,.1)',color:C.green,display:'flex',
          alignItems:'center',justifyContent:'center'}}><Icon name="money" size={18}/></span>
        <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:13.5}}>{s.period}</div>
          <div style={{color:C.mut,fontSize:11.5}}>Net TZS {s.net.toLocaleString()} · {s.id}</div></div>
        <span style={{fontSize:10.5,fontWeight:700,padding:'2px 8px',borderRadius:20,
          color:s.status==='Paid'?C.green:'#9A6B00',background:s.status==='Paid'?'rgba(31,162,74,.12)':'rgba(251,192,45,.16)'}}>{s.status}</span>
        <Icon name="chevR" size={16} style={{color:C.mut}}/></button>)}
      <div style={{fontSize:11.5,color:C.mut,textAlign:'center',marginTop:4}}>Showing last {slips.length} pay periods</div>
    </div>
  </div>;
}

// ── Documents: HR-shared (pushed) + employee-uploaded ──
function EssDocuments({ me, C, card, wrap, onBack }){
  const store = useHStore();
  const docs = store.documents.filter(d=>d.no===me.no);
  const shared = docs.filter(d=>d.source==='HR');
  const mine = docs.filter(d=>d.source==='Employee');
  const Row = (d)=><div key={d.id} style={{...card,display:'flex',alignItems:'center',gap:12,padding:'13px 15px'}}>
    <span style={{width:34,height:34,borderRadius:9,background:d.source==='HR'?'rgba(0,148,212,.1)':'rgba(92,103,112,.1)',
      color:d.source==='HR'?C.blue:C.mut,display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="doc" size={17}/></span>
    <div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:13.5}}>{d.name}</div>
      <div style={{color:C.mut,fontSize:11}}>{d.source==='HR'?'Shared by '+d.from:'Uploaded by you'} · {d.date}</div></div>
    <span style={{fontSize:10.5,color:C.mut,fontWeight:600}}>{d.tag}</span></div>;
  return <div style={wrap}><MobHeader title="My documents" sub="shared by HR · uploaded by you" C={C} onBack={onBack}/>
    <div style={{padding:'0 16px 90px',display:'flex',flexDirection:'column',gap:11}}>
      <div style={{fontSize:11.5,fontWeight:700,color:C.mut,textTransform:'uppercase',letterSpacing:'.04em'}}>Shared by HR ({shared.length})</div>
      {shared.length?shared.map(Row):<div style={{...card,textAlign:'center',color:C.mut,fontSize:12.5,padding:18}}>Nothing shared yet.</div>}
      <div style={{fontSize:11.5,fontWeight:700,color:C.mut,textTransform:'uppercase',letterSpacing:'.04em',marginTop:6}}>Uploaded by me ({mine.length})</div>
      {mine.map(Row)}
      <button onClick={()=>HStore.uploadDocument({no:me.no,name:me.name,docName:'Certificate '+new Date().toLocaleDateString()})}
        style={{...card,border:`1.5px dashed ${C.bd}`,color:C.mut,fontWeight:600,cursor:'pointer',
        display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:'none'}}>
        <Icon name="plus" size={16}/>Upload a document</button>
    </div>
  </div>;
}

// ── ISO Policies: read key points, then sign ──
function EssPolicies({ me, C, card, wrap, onBack }){
  const store = useHStore();
  const all = (typeof POLICIES_FULL!=='undefined'?POLICIES_FULL:[]);
  const ack = store.policyAck[me.no]||{};
  const [open,setOpen] = React.useState(null);
  const [read,setRead] = React.useState(false);
  const signedCount = all.filter(p=>ack[p.id]).length;

  if(open){
    const p = open; const isSigned = !!ack[p.id];
    return <div style={wrap}><MobHeader title={p.name} sub={(typeof POLICY_REV!=='undefined'?POLICY_REV:'')} C={C} onBack={()=>{setOpen(null);setRead(false);}}/>
      <div style={{padding:'0 16px 90px',display:'flex',flexDirection:'column',gap:13}}>
        <div style={{...card}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
            <Icon name="doc" size={16} style={{color:C.blue}}/>
            <span style={{fontWeight:700,fontSize:13.5}}>Key points</span>
            <span style={{marginLeft:'auto',fontSize:11,color:C.mut}}>{p.pages} pages</span></div>
          {p.points.map((pt,i)=><div key={i} style={{display:'flex',gap:10,padding:'9px 0',borderTop:i?`1px solid ${C.bd}`:'none'}}>
            <span style={{width:20,height:20,borderRadius:'50%',background:'rgba(31,162,74,.12)',color:C.green,flexShrink:0,
              display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:11}}>{i+1}</span>
            <span style={{fontSize:13,lineHeight:1.5}}>{pt}</span></div>)}
        </div>
        {isSigned
          ? <div style={{...card,background:'rgba(31,162,74,.08)',border:`1px solid ${C.green}`,display:'flex',gap:10,alignItems:'center'}}>
              <Icon name="check" size={18} style={{color:C.green}}/>
              <div><div style={{fontWeight:700,fontSize:13.5}}>Signed</div>
                <div style={{color:C.mut,fontSize:11.5}}>Acknowledged on {ack[p.id].date}</div></div></div>
          : <>
            <label style={{...card,display:'flex',gap:11,alignItems:'flex-start',cursor:'pointer'}} onClick={()=>setRead(r=>!r)}>
              <span style={{width:22,height:22,borderRadius:6,border:`2px solid ${read?C.green:C.bd}`,background:read?C.green:'#fff',
                color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>{read&&<Icon name="check" size={14}/>}</span>
              <span style={{fontSize:12.5,lineHeight:1.5}}>I confirm I have <b>read and understood</b> the key points of the {p.name}, as required by ISO 9001:2015.</span></label>
            <button disabled={!read} onClick={()=>{HStore.signPolicy({no:me.no,name:me.name,policyId:p.id,policyName:p.name});setOpen(null);setRead(false);}}
              style={{background:read?C.green:'#ccc',color:'#fff',border:'none',borderRadius:12,padding:'14px',fontWeight:700,
                fontSize:14.5,cursor:read?'pointer':'default'}}>Sign &amp; acknowledge</button>
          </>}
      </div>
    </div>;
  }
  return <div style={wrap}><MobHeader title="Policies" sub="ISO 9001:2015 · read &amp; sign each" C={C} onBack={onBack}/>
    <div style={{padding:'0 16px 90px',display:'flex',flexDirection:'column',gap:11}}>
      <div style={{...card,display:'flex',alignItems:'center',gap:12,background:signedCount===all.length?'rgba(31,162,74,.08)':'rgba(251,192,45,.1)',
        border:`1px solid ${signedCount===all.length?C.green:'rgba(251,192,45,.5)'}`}}>
        <Icon name="shield" size={20} style={{color:signedCount===all.length?C.green:'#9A6B00'}}/>
        <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13.5}}>{signedCount} of {all.length} policies signed</div>
          <div style={{color:C.mut,fontSize:11.5}}>{signedCount===all.length?'All acknowledgements complete.':'Read the key points, then sign each policy.'}</div></div>
      </div>
      {all.map(p=>{ const s=!!ack[p.id]; return <button key={p.id} onClick={()=>setOpen(p)} style={{...card,textAlign:'left',cursor:'pointer',
        display:'flex',alignItems:'center',gap:12,borderColor:s?C.bd:'rgba(251,192,45,.45)'}}>
        <span style={{width:34,height:34,borderRadius:9,background:s?'rgba(31,162,74,.1)':'rgba(251,192,45,.14)',
          color:s?C.green:'#9A6B00',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name={s?'check':'doc'} size={17}/></span>
        <div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:13.5}}>{p.name}</div>
          <div style={{color:C.mut,fontSize:11}}>{p.cat} · {p.points.length} key points</div></div>
        <span style={{fontSize:10.5,fontWeight:700,padding:'2px 9px',borderRadius:20,
          color:s?C.green:'#9A6B00',background:s?'rgba(31,162,74,.12)':'rgba(251,192,45,.16)'}}>{s?'Signed':'Read & sign'}</span>
      </button>; })}
    </div>
  </div>;
}

// ── ESS notification centre ──
function EssNotifs({ me, C, card, wrap, onOpen, onBack, includeBroadcast }){
  const store = useHStore();
  const items = store.notifications.filter(n=>n.to===me.no || (includeBroadcast && n.to==='HCWOS'));
  return <div style={wrap}><MobHeader title="Notifications" sub="actions & updates from HCMOS" C={C} onBack={onBack}/>
    <div style={{padding:'0 16px 90px',display:'flex',flexDirection:'column',gap:10}}>
      {items.length? items.map(n=><button key={n.id} onClick={()=>{HStore.markNotifRead(n.id); if(n.action&&n.action.tab&&onOpen) onOpen(n.action.tab);}}
        style={{...card,textAlign:'left',cursor:'pointer',display:'flex',gap:11,alignItems:'flex-start',
          borderLeft:`3px solid ${n.read?C.bd:C.green}`}}>
        <span style={{width:32,height:32,borderRadius:9,background:'rgba(0,148,212,.1)',color:C.blue,flexShrink:0,
          display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name={n.kind} size={16}/></span>
        <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:13,display:'flex',gap:6}}>{n.title}
          {!n.read&&<span style={{width:7,height:7,borderRadius:'50%',background:C.green,marginTop:5}}/>}</div>
          <div style={{color:C.mut,fontSize:12,lineHeight:1.45}}>{n.body}</div>
          <div style={{color:C.mut,fontSize:10.5,marginTop:3}}>{n.from} · {n.ts.slice(5)}</div></div>
        {n.action&&n.action.tab&&<Icon name="chevR" size={15} style={{color:C.mut,marginTop:8}}/>}
      </button>) : <div style={{...card,textAlign:'center',color:C.mut,fontSize:13,padding:24}}>No notifications.</div>}
    </div>
  </div>;
}

// ── HCWOS console notification bell (top bar) ──
function NotifBell({ onNavigate }){
  const store = useHStore();
  const [open,setOpen] = React.useState(false);
  const items = store.notifications.filter(n=>n.to==='HCWOS');
  const unread = items.filter(n=>!n.read).length;
  return <div style={{position:'relative'}}>
    <button className="iconbtn" onClick={()=>setOpen(o=>!o)}><Icon name="bell" size={18}/>{unread>0&&<span className="dot"/>}</button>
    {open && <>
      <div style={{position:'fixed',inset:0,zIndex:40}} onClick={()=>setOpen(false)}/>
      <div style={{position:'absolute',right:0,top:'calc(100% + 8px)',width:340,maxHeight:420,overflowY:'auto',zIndex:41,
        background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,boxShadow:'0 18px 48px rgba(0,0,0,.2)'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'12px 14px',borderBottom:'1px solid var(--border-2)'}}>
          <b style={{fontSize:13.5}}>Notifications</b><span className="muted" style={{fontSize:12}}>{unread} unread</span>
          {unread>0&&<button className="btn sm ghost" style={{marginLeft:'auto'}} onClick={()=>HStore.markAllRead('HCWOS')}>Mark all read</button>}</div>
        {items.length? items.map(n=><button key={n.id} onClick={()=>{HStore.markNotifRead(n.id); if(n.action&&n.action.page&&onNavigate){onNavigate(n.action.page);} setOpen(false);}}
          style={{display:'flex',gap:10,width:'100%',textAlign:'left',padding:'11px 14px',background:n.read?'transparent':'var(--accent-soft)',
            border:'none',borderBottom:'1px solid var(--border-2)',cursor:'pointer'}}>
          <span style={{width:30,height:30,borderRadius:8,background:'var(--surface-2)',color:'var(--accent)',flexShrink:0,
            display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name={n.kind} size={15}/></span>
          <div style={{minWidth:0}}><div style={{fontWeight:600,fontSize:12.5}}>{n.title}</div>
            <div className="muted" style={{fontSize:11.5,lineHeight:1.4}}>{n.body}</div>
            <div className="muted" style={{fontSize:10.5,marginTop:2}}>{n.from} · {n.ts.slice(5)}</div></div>
        </button>) : <div className="empty" style={{padding:20}}>No notifications.</div>}
      </div>
    </>}
  </div>;
}

Object.assign(window, { MobHeader, EssPayslip, EssDocuments, EssPolicies, EssNotifs, NotifBell });
