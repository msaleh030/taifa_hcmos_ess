// Module: Employee Self-Service (mobile)
const ESS_MGR = { 'Mwadui':'Grace Ndaki','Nyanzaga':'Neema Joseph','Dar Yard':'Samuel Mlay','North Mara':'Samuel Mlay','Geita Civil':'Samuel Mlay' };
// relative time for the recent-activity feed
function essRelTime(ts){
  if(!ts) return '';
  const d = Date.now()-ts;
  if(d<0) return new Date(ts).toLocaleDateString('en-GB',{day:'2-digit',month:'short'});
  if(d<60000) return 'Just now';
  if(d<3600000) return Math.floor(d/60000)+' min ago';
  const dt=new Date(ts);
  if(dt.toDateString()===new Date().toDateString()) return 'Today '+dt.toTimeString().slice(0,5);
  const days=Math.floor(d/86400000);
  if(days===1) return 'Yesterday';
  if(days<7) return days+' days ago';
  return dt.toLocaleDateString('en-GB',{day:'2-digit',month:'short'});
}
function essMe(no){
  const e = (window.HStore?HStore.employee(no):null) || (typeof EMPLOYEES!=='undefined'&&EMPLOYEES.find(x=>x.no===no)) || null;
  if(!e) return ME;
  return { name:e.name, no:e.no, role:e.role, site:e.site, grade:e.grade, rotation:e.rotation,
    leaveBalance:e.leave, leaveLiability:Math.round((e.leave||0)*72000), onShift:true,
    nextOff:'29 Jun', supervisor:ESS_MGR[e.site]||'Grace Ndaki' };
}
function ESSApp(){
  const [tab,setTab] = React.useState('home');
  const store = useHStore();
  const meNo = store.essEmp || ME.no;
  const me = essMe(meNo);
  const myComplete = (window.HStore) ? HStore.profileComplete(meNo) : true;
  const myPhoto = (window.HStore) ? HStore.profilePhoto(meNo) : null;
  const switchTo = (no)=>{ HStore.setEssEmp(no); setTab('home'); };
  // navigation that records the user's own section opens into the activity feed
  const SECTION_LABEL = { clock:'Clock', leave:'Leave', docs:'Documents', payslip:'Payslip', perf:'Performance', training:'Training', policies:'Policies', profile:'Profile', id:'ID card', support:'Support' };
  const nav = (t)=>{ const l=SECTION_LABEL[t]; if(l) HStore.logActivity({ no:meNo, label:'Opened '+l, tone:'mut', kind:'nav' }); setTab(t); };
  const C = { green:'#1FA24A', blue:'#0094D4', ink:'#15191D', mut:'#5C6770', bg:'#F4F6F7', card:'#fff', bd:'#E6EAEC' };
  const wrap = { fontFamily:"'IBM Plex Sans',sans-serif", flex:1, overflowY:'auto', background:C.bg, paddingTop:50 };
  const card = { background:C.card, borderRadius:16, border:`1px solid ${C.bd}`, padding:15, boxShadow:'0 1px 2px rgba(16,24,32,.04)' };
  const [clocked0,setClocked] = React.useState(true);
  const clocked = store.clock.clockedIn;
  const myReqs = store.leave.filter(r=>r.no===me.no);
  const mySugs = store.suggestions.filter(s=>s.no===me.no && s.status==='Proposed');
  const myReviews = store.reviews.filter(r=>r.no===me.no && r.status!=='Draft');
  const newReview = myReviews.find(r=>r.status==='Published' && !r.ack);
  const myTraining = store.training.filter(tk=>tk.no===me.no);
  const myNotifs = store.notifications.filter(n=>n.to===me.no);
  const unread = myNotifs.filter(n=>!n.read).length;
  const myActivity = (store.activity && store.activity[me.no]) || [];
  const ACT_TONE = { green:C.green, blue:C.blue, yellow:'#E69A00', red:'#E5484D', mut:C.mut };
  // employee's own KPI scorecard (aligned to the ROLE_KPIS.employee remit)
  const essKpiTone = { green:'#1FA24A', yellow:'#E69A00', red:'#E5484D' };
  const [leaveType,setLeaveType] = React.useState('Annual Leave');
  const [course,setCourse] = React.useState(COURSE_CATALOGUE[0]);
  const [trReason,setTrReason] = React.useState('');
  const essAppr = (typeof ROLES!=='undefined') ? ROLES.find(r=>r.name===me.supervisor) : null;
  const meEmp = (typeof EMPLOYEES!=='undefined' && EMPLOYEES.find(x=>x.no===me.no)) || null;
  const meProf = meEmp ? empProfile(meEmp) : null;

  const Header = ({title,sub}) => <div style={{padding:'4px 18px 12px'}}>
    <div style={{fontSize:22,fontWeight:700,letterSpacing:'-.02em'}}>{title}</div>
    {sub&&<div style={{color:C.mut,fontSize:13}}>{sub}</div>}</div>;

  const home = <div style={wrap}>
    <div style={{background:`linear-gradient(135deg,${C.green},#168A3E)`,color:'#fff',padding:'20px 18px 22px',
      borderBottomLeftRadius:22,borderBottomRightRadius:22}}>
      <div style={{display:'flex',alignItems:'center',gap:11}}>
        <button onClick={()=>setTab('switch')} title="Switch employee" style={{width:42,height:42,borderRadius:'50%',backgroundColor:'rgba(255,255,255,.2)',backgroundImage:myPhoto?`url(${myPhoto})`:'none',backgroundSize:'cover',backgroundPosition:'center',display:'flex',
          alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:15,border:'none',color:'#fff',cursor:'pointer'}}>{myPhoto?'':initials(me.name)}</button>
        <button onClick={()=>setTab('switch')} style={{background:'none',border:'none',color:'#fff',textAlign:'left',cursor:'pointer',padding:0}}>
          <div style={{fontWeight:700,fontSize:16,display:'flex',alignItems:'center',gap:5}}>{me.name}<Icon name="chevR" size={14} style={{transform:'rotate(90deg)',opacity:.8}}/></div>
          <div style={{fontSize:12.5,opacity:.85}}>{me.role} · {me.no}</div></button>
        <div style={{marginLeft:'auto'}}><LangSwitch dark scope="ess"/></div>
        <button onClick={()=>setTab('notifs')} style={{marginLeft:8,position:'relative',width:38,height:38,borderRadius:'50%',
          background:'rgba(255,255,255,.16)',border:'none',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <Icon name="bell" size={19}/>{unread>0&&<span style={{position:'absolute',top:6,right:7,minWidth:15,height:15,borderRadius:9,
            background:'#E5484D',fontSize:9.5,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 3px'}}>{unread}</span>}</button>
      </div>
      <div style={{display:'flex',gap:10,marginTop:16}}>
        <div style={{flex:1,background:'rgba(255,255,255,.16)',borderRadius:12,padding:'10px 12px'}}>
          <div style={{fontSize:11,opacity:.85}}>Leave balance</div>
          <div style={{fontFamily:"'IBM Plex Mono'",fontSize:22,fontWeight:600}}>{me.leaveBalance}<span style={{fontSize:12}}> days</span></div></div>
        <div style={{flex:1,background:'rgba(255,255,255,.16)',borderRadius:12,padding:'10px 12px'}}>
          <div style={{fontSize:11,opacity:.85}}>Rotation</div>
          <div style={{fontSize:13.5,fontWeight:600,marginTop:5}}>{me.rotation}</div>
          <div style={{fontSize:11,opacity:.85}}>Next off · {me.nextOff}</div></div>
      </div>
    </div>
    <div style={{padding:'16px 16px 90px',display:'flex',flexDirection:'column',gap:12}}>
      <div style={{...card,display:'flex',alignItems:'center',gap:12,
        borderColor:clocked?C.green:C.bd,background:clocked?'rgba(31,162,74,.06)':C.card}}>
        <span style={{width:40,height:40,borderRadius:'50%',background:clocked?C.green:'#ddd',color:'#fff',
          display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name={clocked?'check':'clock'} size={20}/></span>
        <div style={{flex:1}}><div style={{fontWeight:600,fontSize:14}}>{clocked?'Clocked in · Mwadui':'Not clocked in'}</div>
          <div style={{color:C.mut,fontSize:12}}>{clocked?store.clock.since+' · inside geofence':'Tap to clock in'}</div></div>
        <button onClick={()=>nav('clock')} style={{background:clocked?'#fff':C.green,color:clocked?C.ink:'#fff',
          border:`1px solid ${clocked?C.bd:C.green}`,borderRadius:9,padding:'8px 14px',fontWeight:600,fontSize:13}}>{clocked?'View':'Clock in'}</button>
      </div>
      {!myComplete && <button onClick={()=>setTab('profile')} style={{...card,textAlign:'left',cursor:'pointer',
        border:'1px solid #E6A700',background:'rgba(251,192,45,.1)',display:'flex',alignItems:'center',gap:11}}>
        <span style={{width:34,height:34,borderRadius:9,background:'#E6A700',color:'#fff',display:'flex',
          alignItems:'center',justifyContent:'center'}}><Icon name="alert" size={17}/></span>
        <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13.5}}>Complete your profile</div>
          <div style={{color:C.mut,fontSize:11.5}}>Required to apply for leave, view payslips, documents &amp; more</div></div>
        <Icon name="chevR" size={18} style={{color:'#9A6B00'}}/></button>}
      {mySugs.length>0 && <button onClick={()=>setTab('leave')} style={{...card,textAlign:'left',cursor:'pointer',
        border:`1px solid ${C.green}`,background:'rgba(31,162,74,.06)',display:'flex',alignItems:'center',gap:11}}>
        <span style={{width:34,height:34,borderRadius:9,background:C.green,color:'#fff',display:'flex',
          alignItems:'center',justifyContent:'center'}}><Icon name="calendar" size={17}/></span>
        <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13.5}}>HR suggests {mySugs[0].days} days of leave</div>
          <div style={{color:C.mut,fontSize:11.5}}>{mySugs[0].from.slice(5)} → {mySugs[0].to.slice(5)} · tap to review</div></div>
        <Icon name="chevR" size={18} style={{color:C.green}}/></button>}
      {newReview && <button onClick={()=>setTab('perf')} style={{...card,textAlign:'left',cursor:'pointer',
        border:`1px solid ${C.blue}`,background:'rgba(0,148,212,.06)',display:'flex',alignItems:'center',gap:11}}>
        <span style={{width:34,height:34,borderRadius:9,background:C.blue,color:'#fff',display:'flex',
          alignItems:'center',justifyContent:'center'}}><Icon name="award" size={17}/></span>
        <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13.5}}>New performance review from HR</div>
          <div style={{color:C.mut,fontSize:11.5}}>{newReview.cycle} · tap to view &amp; acknowledge</div></div>
        <Icon name="chevR" size={18} style={{color:C.blue}}/></button>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {[['calendar','Apply leave','leave'],['idcard','My ID card','id'],['award','Performance','perf'],['award','Training','training'],['money','Payslip','payslip'],['doc','My documents','docs'],['shield','Policies','policies'],['phone','Help & support','support']].map((q,i)=>
          <button key={i} onClick={()=>nav(q[2])} style={{...card,textAlign:'left',cursor:'pointer',display:'flex',flexDirection:'column',gap:10}}>
            <span style={{width:34,height:34,borderRadius:9,background:'rgba(0,148,212,.1)',color:C.blue,
              display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name={q[0]} size={18}/></span>
            <span style={{fontWeight:600,fontSize:13.5}}>{q[1]}</span></button>)}
      </div>
      <div style={{...card}}>
        <div style={{fontWeight:600,fontSize:13.5,marginBottom:10}}>Recent activity</div>
        {myActivity.length ? myActivity.slice(0,3).map((r,i)=>
          <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',borderTop:i?`1px solid ${C.bd}`:'none'}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:ACT_TONE[r.tone]||C.mut}}/>
            <span style={{fontSize:13}}>{r.label}</span><span style={{marginLeft:'auto',color:C.mut,fontSize:11.5}}>{essRelTime(r.ts)}</span></div>)
          : <div style={{fontSize:12.5,color:C.mut,padding:'4px 0'}}>No activity yet — your clock-ins, requests and approvals show up here.</div>}
      </div>
    </div>
  </div>;

  const clock = <div style={wrap}><Header title="Clock in / out" sub="GPS geofence validated"/>
    <div style={{padding:'0 16px 90px',display:'flex',flexDirection:'column',gap:14}}>
      <div style={{...card,padding:0,overflow:'hidden'}}>
        <div style={{height:150,background:`radial-gradient(circle at 50% 45%, rgba(31,162,74,.18), ${C.bg})`,position:'relative'}}>
          <div style={{position:'absolute',left:'50%',top:'45%',transform:'translate(-50%,-50%)',width:120,height:120,
            borderRadius:'50%',border:`2px solid ${C.green}`,background:'rgba(31,162,74,.08)'}}/>
          <div style={{position:'absolute',left:'50%',top:'45%',transform:'translate(-50%,-50%)',width:14,height:14,
            borderRadius:'50%',background:C.green,border:'3px solid #fff',boxShadow:'0 1px 4px rgba(0,0,0,.3)'}}/>
          <div style={{position:'absolute',bottom:10,left:12,background:'#fff',borderRadius:8,padding:'5px 10px',
            fontSize:11.5,fontWeight:600,border:`1px solid ${C.bd}`}}>📍 Mwadui — inside zone</div>
        </div>
        <div style={{padding:15,display:'flex',gap:14}}>
          <div style={{flex:1}}><div style={{color:C.mut,fontSize:11}}>Status</div>
            <div style={{fontWeight:600,fontSize:14,color:C.green}}>{clocked?'On shift':'Off shift'}</div></div>
          <div style={{flex:1}}><div style={{color:C.mut,fontSize:11}}>Since</div>
            <div style={{fontWeight:600,fontSize:14,fontFamily:"'IBM Plex Mono'"}}>{clocked?store.clock.since:'—'}</div></div>
          <div style={{flex:1}}><div style={{color:C.mut,fontSize:11}}>Today</div>
            <div style={{fontWeight:600,fontSize:14,fontFamily:"'IBM Plex Mono'"}}>{clocked?'7h 12m':'0h'}</div></div>
        </div>
      </div>
      <button onClick={()=>HStore.toggleClock()} style={{background:clocked?'#fff':C.green,color:clocked?C.red||'#E5484D':'#fff',
        border:`1.5px solid ${clocked?'#E5484D':C.green}`,borderRadius:12,padding:'15px',fontWeight:700,fontSize:15,cursor:'pointer'}}>
        {clocked?'Clock out':'Clock in now'}</button>
      <div style={{...card,fontSize:12.5,color:C.mut}}>Offline punches are stored on your device and sync automatically when coverage returns (~70% at Mwadui).</div>
    </div>
  </div>;

  const leave = <div style={wrap}><Header title="Apply for leave"/>
    <div style={{padding:'0 16px 90px',display:'flex',flexDirection:'column',gap:14}}>
      {mySugs.map(s=><div key={s.id} style={{...card,border:`1px solid ${C.green}`,background:'rgba(31,162,74,.06)',
        display:'flex',flexDirection:'column',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:9}}>
          <span style={{width:30,height:30,borderRadius:8,background:C.green,color:'#fff',display:'flex',
            alignItems:'center',justifyContent:'center'}}><Icon name="calendar" size={16}/></span>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13.5}}>Suggested leave from HR</div>
            <div style={{color:C.mut,fontSize:11.5}}>Auto-scheduled to keep your balance healthy</div></div></div>
        <div style={{fontSize:13,lineHeight:1.5}}>Take <b>{s.days} days</b> ({s.from.slice(5)} → {s.to.slice(5)}). {s.rationale}.</div>
        <div style={{fontSize:11.5,color:C.mut}}>Cover: {s.cover} · within 14-day cap · no carry-over loss</div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>HStore.acceptSuggestion(s.id)} style={{flex:1,background:C.green,color:'#fff',border:'none',
            borderRadius:10,padding:'11px',fontWeight:700,fontSize:13.5,cursor:'pointer'}}>Accept &amp; apply</button>
          <button onClick={()=>HStore.dismissSuggestion(s.id)} style={{background:'#fff',color:C.mut,
            border:`1px solid ${C.bd}`,borderRadius:10,padding:'11px 16px',fontWeight:600,fontSize:13.5,cursor:'pointer'}}>Not now</button></div>
      </div>)}
      <div style={{...card,display:'flex',gap:14}}>
        <div style={{flex:1}}><div style={{color:C.mut,fontSize:11}}>Available</div>
          <div style={{fontFamily:"'IBM Plex Mono'",fontSize:22,fontWeight:600,color:C.green}}>{me.leaveBalance}</div></div>
        <div style={{flex:1}}><div style={{color:C.mut,fontSize:11}}>Taken (YTD)</div>
          <div style={{fontFamily:"'IBM Plex Mono'",fontSize:22,fontWeight:600}}>{meProf?meProf.leave.taken:'—'}</div></div>
        <div style={{flex:1}}><div style={{color:C.mut,fontSize:11}}>Monetised</div>
          <div style={{fontFamily:"'IBM Plex Mono'",fontSize:15,fontWeight:600,marginTop:5}}>{(me.leaveLiability/1e6).toFixed(2)}M</div></div>
      </div>
      <div style={{...card,padding:'13px 15px'}}>
        <div style={{color:C.mut,fontSize:11,marginBottom:9,fontWeight:600}}>LEAVE TYPE</div>
        <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>{LEAVE_TYPES.map(l=>
          <button key={l.code} onClick={()=>setLeaveType(l.type)} style={{padding:'7px 11px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',
            border:`1px solid ${leaveType===l.type?C.green:C.bd}`,background:leaveType===l.type?'rgba(31,162,74,.1)':'#fff',
            color:leaveType===l.type?C.green:C.mut}}>{l.type.replace(' Leave','')}</button>)}</div>
        <div style={{marginTop:9,fontSize:11.5,color:C.mut}}>{(LEAVE_TYPES.find(l=>l.type===leaveType)||{}).note}</div>
      </div>
      {[['From','01 Jul 2026'],['To','07 Jul 2026'],['Working days','7 days'],['Covering officer','Grace Ndaki']].map((f,i)=>
        <div key={i} style={{...card,display:'flex',alignItems:'center',padding:'13px 15px'}}>
          <span style={{color:C.mut,fontSize:13}}>{f[0]}</span>
          <span style={{marginLeft:'auto',fontWeight:600,fontSize:13.5}}>{f[1]}</span>
          <Icon name="chevR" size={16} style={{color:C.mut,marginLeft:8}}/></div>)}
      <div style={{...card,background:'rgba(251,192,45,.12)',border:'1px solid rgba(251,192,45,.4)',fontSize:12.5,
        color:'#7a5800',display:'flex',gap:8,alignItems:'center'}}>
        <Icon name="check" size={16}/>Within 14-day cap · coverage confirmed · no carry-over impact</div>
      <button onClick={()=>HStore.addLeave({who:me.name,no:me.no,site:'Mwadui',type:leaveType.replace(' Leave',''),from:'2026-07-01',to:'2026-07-07',days:7,cover:true,
        approverRole:essAppr&&essAppr.id, approverName:essAppr?essAppr.name:me.supervisor, approverNo:essAppr&&roleSelfRecord(essAppr).no})}
        style={{background:C.green,color:'#fff',border:'none',borderRadius:12,padding:'15px',fontWeight:700,fontSize:15,cursor:'pointer'}}>Submit request</button>
      {myReqs.length>0 && <div style={{...card}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
          <span style={{fontWeight:600,fontSize:13.5}}>My requests</span>
          <span style={{marginLeft:'auto',fontSize:10.5,fontWeight:600,color:C.blue,background:'rgba(0,148,212,.1)',padding:'2px 8px',borderRadius:20}}>⇄ synced with HR</span></div>
        {myReqs.map((r,i)=><div key={r.id} style={{display:'flex',alignItems:'center',gap:9,padding:'8px 0',borderTop:i?`1px solid ${C.bd}`:'none'}}>
          <div style={{minWidth:0}}><div style={{fontSize:13,fontWeight:500}}>{r.type} · {r.days} days</div>
            <div style={{color:C.mut,fontSize:11}}>{r.from.slice(5)} → {r.to.slice(5)}</div></div>
          <span style={{marginLeft:'auto',fontSize:11,fontWeight:700,padding:'2px 9px',borderRadius:20,
            color:r.status==='Approved'?C.green:r.status==='Declined'?'#E5484D':'#9A6B00',
            background:r.status==='Approved'?'rgba(31,162,74,.12)':r.status==='Declined'?'rgba(229,72,77,.12)':'rgba(251,192,45,.16)'}}>{r.status}</span>
        </div>)}
      </div>}
    </div>
  </div>;

  const docs = <EssDocuments me={me} C={C} card={card} wrap={wrap}/>;
  const payslip = <EssPayslip me={me} C={C} card={card} wrap={wrap}/>;
  const policies = <EssPolicies me={me} C={C} card={card} wrap={wrap}/>;
  const notifs = <EssNotifs me={me} C={C} card={card} wrap={wrap} onOpen={setTab}/>;

  const profile = <div className="mob-light" style={{height:'100%',paddingTop:44,background:'#F4F6F7'}}>
    {meProf ? <EmployeeProfile prof={meProf} money={false} selfView/> : <div style={{padding:40,textAlign:'center',color:C.mut}}>Profile unavailable.</div>}
  </div>;

  const perf = <div style={wrap}><Header title="Performance" sub="reviews published by your manager / HR"/>
    <div style={{padding:'0 16px 90px',display:'flex',flexDirection:'column',gap:12}}>
      {(()=>{ const myTrainDone = myTraining.length ? Math.round(myTraining.filter(t=>t.status==='Completed').length/myTraining.length*100) : 100;
        const myRating = (myReviews.find(r=>r.rating)||{}).rating || 0;
        const achv = myRating ? Math.round(myRating/5*100) : 0;
        const entitlement = 30;
        const taken = Math.max(0, Math.min(entitlement, Math.round((entitlement-(me.leaveBalance||0))*10)/10));
        const util = Math.round(taken/entitlement*100);
        const myKpis = [
          ['My KPI achievement', achv?achv+'%':'—','Target ≥ 85%', achv>=85?'green':(achv>=70?'yellow':'red')],
          ['Performance review', newReview?'Acknowledge':'Up to date','Target 100%', newReview?'yellow':'green'],
          ['Training completion', myTrainDone+'%','Target ≥ 90%', myTrainDone>=90?'green':'yellow'],
          ['Leave utilization', util+'%','Target ≥ 80%', util>=80?'green':(util>=60?'yellow':'red')],
          ['ESS engagement','Active','Self-service','green'] ];
        return <div style={{...card}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
            <span style={{fontWeight:700,fontSize:13.5}}>My KPIs</span>
            <span style={{marginLeft:'auto',fontSize:10.5,fontWeight:600,color:C.blue,background:'rgba(0,148,212,.1)',padding:'2px 8px',borderRadius:20}}>aligned to your role</span></div>
          {myKpis.map((r,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderTop:i?`1px solid ${C.bd}`:'none'}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:essKpiTone[r[3]],flexShrink:0}}/>
            <div style={{minWidth:0}}><div style={{fontSize:13,fontWeight:600}}>{r[0]}</div>
              <div style={{color:C.mut,fontSize:11}}>{r[2]}</div></div>
            <span style={{marginLeft:'auto',fontFamily:"'IBM Plex Mono'",fontWeight:700,fontSize:15,color:essKpiTone[r[3]]}}>{r[1]}</span>
          </div>)}
        </div>; })()}
      {myReviews.length? myReviews.map(r=><div key={r.id} style={{...card,display:'flex',flexDirection:'column',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:9}}>
          <span style={{width:34,height:34,borderRadius:9,background:'rgba(0,148,212,.1)',color:C.blue,display:'flex',
            alignItems:'center',justifyContent:'center'}}><Icon name="award" size={18}/></span>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13.5}}>{r.cycle}</div>
            <div style={{color:C.mut,fontSize:11.5}}>Reviewer · {r.reviewer}</div></div>
          <span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,
            color:r.ack?C.green:'#9A6B00',background:r.ack?'rgba(31,162,74,.12)':'rgba(251,192,45,.16)'}}>{r.ack?'Acknowledged':'New'}</span>
        </div>
        {r.rating && <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderTop:`1px solid ${C.bd}`,borderBottom:`1px solid ${C.bd}`}}>
          <span style={{width:38,height:38,borderRadius:9,background:C.green,color:'#fff',display:'flex',alignItems:'center',
            justifyContent:'center',fontWeight:700,fontSize:18}}>{r.rating}</span>
          <div><div style={{fontWeight:700,fontSize:14}}>{r.label}</div>
            <div style={{color:C.mut,fontSize:11.5}}>5-point scale · published {r.published}</div></div></div>}
        {r.summary && <div style={{fontSize:13,lineHeight:1.55,color:C.ink}}>{r.summary}</div>}
        {!r.ack && <button onClick={()=>HStore.acknowledgeReview(r.id)} style={{background:C.green,color:'#fff',border:'none',
          borderRadius:10,padding:'12px',fontWeight:700,fontSize:13.5,cursor:'pointer'}}>Acknowledge review</button>}
      </div>) : <div style={{...card,textAlign:'center',color:C.mut,fontSize:13,padding:24}}>No reviews published yet. Your manager's reviews appear here.</div>}
    </div>
  </div>;

  const training = <div style={wrap}><Header title="Training" sub="request a course — routed to your manager"/>
    <div style={{padding:'0 16px 90px',display:'flex',flexDirection:'column',gap:12}}>
      <div style={{...card,display:'flex',flexDirection:'column',gap:11}}>
        <div style={{fontWeight:700,fontSize:13.5}}>New training request</div>
        <div><div style={{color:C.mut,fontSize:11,marginBottom:7,fontWeight:600}}>COURSE</div>
          <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>{COURSE_CATALOGUE.map(c=>
            <button key={c} onClick={()=>setCourse(c)} style={{padding:'7px 10px',borderRadius:8,fontSize:11.5,fontWeight:600,cursor:'pointer',
              border:`1px solid ${course===c?C.green:C.bd}`,background:course===c?'rgba(31,162,74,.1)':'#fff',
              color:course===c?C.green:C.mut}}>{c}</button>)}</div></div>
        <div><div style={{color:C.mut,fontSize:11,marginBottom:7,fontWeight:600}}>JUSTIFICATION</div>
          <textarea value={trReason} onChange={e=>setTrReason(e.target.value)} placeholder="Why do you need this training?"
            style={{width:'100%',minHeight:60,borderRadius:10,border:`1px solid ${C.bd}`,padding:'10px 12px',fontSize:13,
              fontFamily:'inherit',resize:'vertical',boxSizing:'border-box'}}/></div>
        <div style={{fontSize:11.5,color:C.mut,display:'flex',gap:7,alignItems:'center'}}>
          <Icon name="shield" size={14} style={{color:C.green}}/>Requires manager approval (SLA 72h) · escalates to Department Head.</div>
        <button disabled={trReason.trim().length<6} onClick={()=>{HStore.submitTraining({no:me.no,name:me.name,site:'Mwadui',course,reason:trReason.trim()});setTrReason('');}}
          style={{background:trReason.trim().length<6?'#ccc':C.green,color:'#fff',border:'none',borderRadius:10,padding:'13px',
            fontWeight:700,fontSize:14,cursor:trReason.trim().length<6?'default':'pointer'}}>Submit request</button>
      </div>
      {myTraining.length>0 && <div style={{...card}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
          <span style={{fontWeight:600,fontSize:13.5}}>My training tickets</span>
          <span style={{marginLeft:'auto',fontSize:10.5,fontWeight:600,color:C.blue,background:'rgba(0,148,212,.1)',padding:'2px 8px',borderRadius:20}}>⇄ synced with HCMOS</span></div>
        {myTraining.map((tk,i)=><div key={tk.id} style={{display:'flex',alignItems:'center',gap:9,padding:'9px 0',borderTop:i?`1px solid ${C.bd}`:'none'}}>
          <div style={{minWidth:0,flex:1}}><div style={{fontSize:13,fontWeight:600}}>{tk.course}</div>
            <div style={{color:C.mut,fontSize:11}}>{tk.stage}</div></div>
          <span style={{fontSize:11,fontWeight:700,padding:'2px 9px',borderRadius:20,
            color:tk.status==='Completed'?C.green:tk.status==='Rejected'?'#E5484D':tk.status==='Pending'?'#9A6B00':C.blue,
            background:tk.status==='Completed'?'rgba(31,162,74,.12)':tk.status==='Rejected'?'rgba(229,72,77,.12)':tk.status==='Pending'?'rgba(251,192,45,.16)':'rgba(0,148,212,.12)'}}>{tk.status}</span>
        </div>)}
      </div>}
    </div>
  </div>;

  const switchScreen = <div style={wrap}><MobHeader title="Switch employee" sub="view any employee's ESS to verify sync" C={C}/>
    <div style={{padding:'0 16px 90px',display:'flex',flexDirection:'column',gap:9}}>
      <div style={{...card,background:'rgba(0,148,212,.06)',border:`1px solid rgba(0,148,212,.3)`,fontSize:12,color:C.mut,
        display:'flex',gap:8,alignItems:'center'}}><Icon name="shield" size={14} style={{color:C.blue}}/>Demo control — each employee sees only their own notifications, leave, reviews and documents.</div>
      {(window.HStore?HStore.employees():(typeof EMPLOYEES!=='undefined'?EMPLOYEES:[])).map(e=>{
        const un = store.notifications.filter(n=>n.to===e.no && !n.read).length;
        const on = e.no===me.no;
        return <button key={e.no} onClick={()=>switchTo(e.no)} style={{...card,display:'flex',alignItems:'center',gap:11,cursor:'pointer',
          textAlign:'left',border:`1px solid ${on?C.green:C.bd}`,background:on?'rgba(31,162,74,.06)':C.card}}>
          <Avatar name={e.name} size={32}/>
          <div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:13.5}}>{e.name}</div>
            <div style={{color:C.mut,fontSize:11}}>{e.no} · {e.role} · {e.site}</div></div>
          {un>0&&<span style={{minWidth:18,height:18,borderRadius:9,background:'#E5484D',color:'#fff',fontSize:10,fontWeight:700,
            display:'flex',alignItems:'center',justifyContent:'center',padding:'0 4px'}}>{un}</span>}
          {on&&<Icon name="check" size={17} style={{color:C.green}}/>}</button>;
      })}
    </div>
  </div>;

  const idScreen = <div style={wrap}><Header title="My ID card" sub="digital employee ID · tap to flip"/>
    <div style={{padding:'10px 16px 90px',display:'flex',justifyContent:'center'}}>
      {meProf ? <EssIdCard prof={meProf} photo={myPhoto}/> : <div style={{color:C.mut,padding:30,textAlign:'center'}}>ID card unavailable for this account.</div>}
    </div>
  </div>;
  const essSupport = <EssSupport me={me} C={C} card={card} wrap={wrap} onBack={()=>setTab('home')}/>;
  const blockedScreen = <div style={wrap}>
    <div style={{padding:'48px 26px',display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',gap:14}}>
      <span style={{width:64,height:64,borderRadius:'50%',background:'rgba(229,72,77,.12)',color:'#E5484D',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="lock" size={28}/></span>
      <div style={{fontWeight:700,fontSize:18}}>Self-service is suspended</div>
      <div style={{color:C.mut,fontSize:13.5,lineHeight:1.6,maxWidth:300}}>Your ESS access has been blocked. Please contact HR, or call 24/7 support for assistance.</div>
      <a href={'tel:'+window.SUPPORT.phone} style={{background:C.green,color:'#fff',borderRadius:12,padding:'13px 22px',fontWeight:700,fontSize:14,textDecoration:'none',display:'inline-flex',gap:8,alignItems:'center'}}><Icon name="phone" size={16}/>Call {window.SUPPORT.phoneDisp}</a>
    </div>
  </div>;
  const profileGate = <div style={wrap}>
    <div style={{padding:'44px 24px',display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',gap:14}}>
      <span style={{width:64,height:64,borderRadius:'50%',background:'rgba(251,192,45,.16)',color:'#9A6B00',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="lock" size={28}/></span>
      <div style={{fontWeight:700,fontSize:18}}>Complete your profile first</div>
      <div style={{color:C.mut,fontSize:13.5,lineHeight:1.6,maxWidth:300}}>To protect your records, leave, payslips, documents, policies and performance unlock once your profile is updated and confirmed.</div>
      <button onClick={()=>setTab('profile')} style={{background:C.green,color:'#fff',border:'none',borderRadius:12,padding:'13px 22px',fontWeight:700,fontSize:14,cursor:'pointer'}}>Update my profile</button>
    </div>
  </div>;
  const GATED = ['leave','payslip','docs','policies','perf'];
  let screen = {home,clock,leave,docs,profile,perf,training,payslip,policies,notifs,id:idScreen,support:essSupport,switch:switchScreen}[tab];
  if(GATED.includes(tab) && !myComplete) screen = profileGate;
  if((window.HStore && HStore.essBlocked(meNo)) && tab!=='switch' && tab!=='support') screen = blockedScreen;
  const tabs = [['home','grid','Home'],['clock','pin','Clock'],['leave','calendar','Leave'],['docs','doc','Docs'],['profile','users','Profile']];
  return <div className="ess" style={{height:'100%'}}>
    {screen}
    <div style={{position:'absolute',bottom:0,left:0,right:0,background:'rgba(255,255,255,.94)',backdropFilter:'blur(10px)',
      borderTop:`1px solid ${C.bd}`,display:'flex',padding:'8px 8px 26px'}}>
      {tabs.map(t=><button key={t[0]} onClick={()=>nav(t[0])} style={{flex:1,background:'none',border:'none',
        display:'flex',flexDirection:'column',alignItems:'center',gap:3,color:tab===t[0]?C.green:C.mut,cursor:'pointer'}}>
        <Icon name={t[1]} size={21}/><span style={{fontSize:10.5,fontWeight:600}}>{t[2]}</span></button>)}
    </div>
  </div>;
}

function ESS(){
  return <div className="ess-wrap">
    <div className="ess-side">
      <SecH>Employee Self-Service</SecH>
      <p style={{color:'var(--muted)',fontSize:13.5,lineHeight:1.6,marginTop:14}}>
        The ESS app gives every employee email + PIN access to their own record — no need to contact HR.
        Designed for low-bandwidth sites and shared kiosks (Nyanzaga: ~50 smartphones for 329 staff).</p>
      <div className="grid" style={{gap:12,marginTop:8}}>
        {[['pin','GPS geofenced clock-in','Validated against each site boundary; offline punches sync on reconnect.'],
          ['calendar','Self-service leave','See real-time balance, monetised value, and apply with coverage checks.'],
          ['money','Secure payslips','Delivered in-app only — open printing is treated as a confidentiality breach.'],
          ['doc','My documents','Upload EP documents; view contract, OSHA medical, and acknowledge policies.']].map((f,i)=>
          <Card key={i} className="card-p" style={{display:'flex',gap:13,alignItems:'flex-start'}}>
            <span style={{width:34,height:34,borderRadius:9,background:'var(--accent-soft)',color:'var(--accent)',
              display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Icon name={f[0]} size={18}/></span>
            <div><div style={{fontWeight:600,fontSize:13.5}}>{f[1]}</div>
              <div style={{color:'var(--muted)',fontSize:12.5,marginTop:2,lineHeight:1.5}}>{f[2]}</div></div>
          </Card>)}
      </div>
    </div>
    <IOSDevice>
      <ESSApp/>
    </IOSDevice>
  </div>;
}
window.ESS = ESS;
