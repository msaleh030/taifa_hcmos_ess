// 24/7 Support — hotline, email, after-hours AI intake, and ticketing (ESS + HCMOS).
window.SUPPORT = { phone:'+255795300400', phoneDisp:'+255 795 300 400', email:'support@railgrid.tz' };

// lightweight "intelligent" triage — classifies free text into category + priority
function triageTicket(text){
  const t=(text||'').toLowerCase();
  const urgent = /urgent|can'?t|cannot|blocked|locked|down|not work|fail|error|wrong pay|no pay|emergency/.test(t);
  let cat='General';
  if(/pay|salary|payslip|deduction|nssf|paye/.test(t)) cat='Payroll';
  else if(/leave|attendance|clock|roster|shift/.test(t)) cat='Leave & Attendance';
  else if(/login|password|pin|access|account|locked/.test(t)) cat='Access / Account';
  else if(/id card|card|qr/.test(t)) cat='ID / Records';
  else if(/laptop|phone|radio|device|asset|ppe/.test(t)) cat='Asset / Device';
  return { category:cat, priority: urgent?'High':'Normal' };
}
function isAfterHours(){ const h=new Date().getHours(); return h<8 || h>=17; }

// ESS support screen (works inside the device frame)
function EssSupport({ me, C, card, wrap, onBack }){
  const store = useHStore();
  const my = store.tickets.filter(t=>t.no===me.no);
  const [msg,setMsg] = React.useState('');
  const [reply,setReply] = React.useState(null);
  const S = window.SUPPORT;
  const send = ()=>{ const text=msg.trim(); if(text.length<6) return;
    const tri = triageTicket(text); const after = isAfterHours();
    const id = HStore.submitTicket({ by:me.name, no:me.no, channel:'ESS', subject:text.slice(0,60), detail:text, priority:tri.priority, afterHours:after });
    setReply({ id, ...tri, after }); setMsg('');
  };
  const Tk = ({t})=>{ const last=t.updates[t.updates.length-1];
    const tone = t.status==='Resolved'||t.status==='Closed'?C.green:t.status==='In progress'?C.blue:'#9A6B00';
    const bgT = tone===C.green?'rgba(31,162,74,.12)':tone===C.blue?'rgba(0,148,212,.12)':'rgba(251,192,45,.16)';
    return <div style={{...card,padding:'12px 14px'}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <span style={{fontFamily:"'IBM Plex Mono'",fontSize:11,color:C.mut}}>{t.id}</span>
        <span style={{marginLeft:'auto',fontSize:10.5,fontWeight:700,color:tone,background:bgT,padding:'2px 9px',borderRadius:20}}>{t.status}</span>
      </div>
      <div style={{fontWeight:600,fontSize:13,marginTop:4}}>{t.subject}</div>
      <div style={{color:C.mut,fontSize:11.5,marginTop:5,display:'flex',gap:6}}><Icon name="clock" size={12}/>{last.by}: {last.note}</div>
      {t.status==='Resolved' && <div style={{display:'flex',gap:7,marginTop:10}}>
        <button onClick={()=>HStore.updateTicket(t.id,'Closed','Confirmed resolved by '+me.name, me.name)} style={{flex:1,background:C.green,color:'#fff',border:'none',borderRadius:8,padding:'9px',fontWeight:700,fontSize:12.5,cursor:'pointer'}}>Confirm resolved</button>
        <button onClick={()=>HStore.updateTicket(t.id,'In progress','Reopened by '+me.name, me.name)} style={{background:'#fff',border:`1px solid ${C.bd}`,borderRadius:8,padding:'9px 13px',fontWeight:600,fontSize:12.5,cursor:'pointer'}}>Reopen</button>
      </div>}
    </div>; };

  return <div style={wrap}><MobHeader title="Help & support" sub="24/7 · we're here for you" C={C} onBack={onBack}/>
    <div style={{padding:'0 14px 90px',display:'flex',flexDirection:'column',gap:12}}>
      <a href={'tel:'+S.phone} style={{...card,background:`linear-gradient(135deg,${C.green},#168A3E)`,color:'#fff',textDecoration:'none',
        display:'flex',alignItems:'center',gap:13,padding:'16px'}}>
        <span style={{width:46,height:46,borderRadius:'50%',background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="phone" size={22}/></span>
        <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15}}>Call 24/7 support</div>
          <div style={{fontFamily:"'IBM Plex Mono'",fontSize:14,opacity:.95}}>{S.phoneDisp}</div></div>
        <Icon name="chevR" size={18}/>
      </a>
      <a href={'mailto:'+S.email} style={{...card,display:'flex',alignItems:'center',gap:11,textDecoration:'none',color:C.ink}}>
        <span style={{width:34,height:34,borderRadius:9,background:'rgba(0,148,212,.1)',color:C.blue,display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="doc" size={17}/></span>
        <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13.5}}>Email support</div><div style={{color:C.mut,fontSize:12}}>{S.email}</div></div>
      </a>

      <div style={{...card}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:9}}>
          <span style={{width:30,height:30,borderRadius:8,background:'rgba(31,162,74,.1)',color:C.green,display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="megaphone" size={16}/></span>
          <div><div style={{fontWeight:700,fontSize:13.5}}>Support assistant</div>
            <div style={{color:C.mut,fontSize:11}}>{isAfterHours()?'After hours — I\u2019ll capture & route it':'Online — raise a ticket here'}</div></div>
        </div>
        {reply
          ? <div style={{background:'rgba(31,162,74,.08)',border:`1px solid ${C.bd}`,borderRadius:10,padding:'11px 12px',fontSize:12.5,lineHeight:1.5}}>
              Thanks — I\u2019ve logged <b>{reply.id}</b> as <b>{reply.category}</b> ({reply.priority} priority).{reply.after?' It\u2019s after hours, so I\u2019ve captured the details and routed them to the IT support queue for first thing.':' IT support has been notified.'} You can track progress below.
              <button onClick={()=>setReply(null)} style={{display:'block',marginTop:9,background:C.green,color:'#fff',border:'none',borderRadius:8,padding:'8px 12px',fontWeight:600,fontSize:12.5,cursor:'pointer'}}>New request</button>
            </div>
          : <><textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Describe your issue (e.g. &lsquo;My May payslip won\u2019t open&rsquo;)\u2026"
              style={{width:'100%',minHeight:62,borderRadius:10,border:`1px solid ${C.bd}`,padding:'10px 12px',fontSize:13,fontFamily:'inherit',resize:'vertical',boxSizing:'border-box'}}/>
            <button disabled={msg.trim().length<6} onClick={send} style={{marginTop:9,width:'100%',background:msg.trim().length<6?'#ccc':C.green,color:'#fff',border:'none',borderRadius:10,padding:'12px',fontWeight:700,fontSize:13.5,cursor:msg.trim().length<6?'default':'pointer'}}>Submit ticket</button></>}
      </div>

      {my.length>0 && <div>
        <div style={{fontWeight:700,fontSize:13.5,margin:'2px 2px 8px'}}>My tickets <span style={{fontSize:10.5,color:C.blue,fontWeight:600}}>\u21c4 synced with HCMOS</span></div>
        <div style={{display:'flex',flexDirection:'column',gap:9}}>{my.map(t=><Tk key={t.id} t={t}/>)}</div>
      </div>}
    </div></div>;
}

// HCMOS support-desk panel (IT / support agents work tickets here)
function SupportPanel(){
  const store = useHStore();
  const [f,setF] = React.useState('open');
  const tickets = store.tickets.filter(t=> f==='all' ? true : f==='open' ? !['Resolved','Closed'].includes(t.status) : ['Resolved','Closed'].includes(t.status));
  const tone = { Open:'yellow', Acknowledged:'yellow', 'In progress':'blue', Resolved:'green', Closed:'grey' };
  return <Card>
    <CardH title="Support desk" icon="phone" meta={store.tickets.filter(t=>t.status!=='Resolved').length+' open · 24/7'}
      action={<div style={{marginLeft:'auto',display:'flex',gap:6}}>
        {[['open','Open'],['all','All'],['resolved','Resolved']].map(([v,l])=>
          <button key={v} className={'btn sm '+(f===v?'primary':'ghost')} onClick={()=>setF(v)}>{l}</button>)}</div>}/>
    <div className="card-p" style={{display:'flex',gap:10,alignItems:'center',fontSize:12.5,color:'var(--muted)',paddingBottom:0,flexWrap:'wrap'}}>
      <Icon name="phone" size={14} style={{color:'var(--accent)'}}/>Hotline <b className="num" style={{color:'var(--text)'}}>{SUPPORT.phoneDisp}</b>
      <span>·</span><Icon name="doc" size={14} style={{color:'var(--accent)'}}/><b style={{color:'var(--text)'}}>{SUPPORT.email}</b>
      <span style={{marginLeft:'auto'}} className="sync-badge"><span className="pulse"></span>after-hours AI intake active</span>
    </div>
    <table className="tbl"><thead><tr><th>Ticket</th><th>Raised by</th><th>Subject</th><th>Priority</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>{tickets.map(t=><tr key={t.id}>
        <td><div className="num" style={{fontSize:12,fontWeight:600}}>{t.id}</div><div className="muted" style={{fontSize:10.5}}>{t.channel}{t.afterHours?' · AI':''}</div></td>
        <td><div style={{fontWeight:600,fontSize:12.5}}>{t.by}</div><div className="muted num" style={{fontSize:10.5}}>{t.no||'—'}</div></td>
        <td style={{maxWidth:240}}><div style={{fontSize:12.5}}>{t.subject}</div>
          <div className="muted" style={{fontSize:10.5}}>{t.updates[t.updates.length-1].by}: {t.updates[t.updates.length-1].note}</div></td>
        <td><Tag tone={t.priority==='High'?'red':'grey'}>{t.priority}</Tag></td>
        <td><Tag tone={tone[t.status]||'grey'} dot>{t.status}</Tag></td>
        <td style={{whiteSpace:'nowrap'}}>{t.status==='Open'
          ? <button className="btn sm primary" onClick={()=>HStore.updateTicket(t.id,'Acknowledged','Acknowledged · IT support is on it')}>Acknowledge</button>
          : (t.status==='Acknowledged'||t.status==='In progress')
          ? <><button className="btn sm" style={{marginRight:5}} onClick={()=>HStore.updateTicket(t.id,'In progress','Investigating')}>Work</button>
              <button className="btn sm primary" onClick={()=>HStore.updateTicket(t.id,'Resolved','Resolved — awaiting requester confirmation')}>Resolve</button></>
          : t.status==='Resolved'
          ? <button className="btn sm" onClick={()=>HStore.updateTicket(t.id,'Closed','Closed by IT support')}>Close</button>
          : <span className="muted" style={{fontSize:11.5}}>closed</span>}</td>
      </tr>)}
      {!tickets.length && <tr><td colSpan={6} className="muted" style={{textAlign:'center',padding:18}}>No tickets in this view.</td></tr>}
      </tbody></table>
  </Card>;
}

Object.assign(window, { EssSupport, SupportPanel, triageTicket, isAfterHours });
