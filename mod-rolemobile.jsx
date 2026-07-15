// Role mobile app — managers are employees too: management (Overview/Approvals)
// + personal employee self-service (Clock/Leave) + their own Profile.
function RoleMobileApp({ role }){
  const [tab,setTab] = React.useState('home');
  const [clocked,setClocked] = React.useState(true);
  const [rmLeaveType,setRmLeave] = React.useState('Annual Leave');
  const [rmCourse,setRmCourse] = React.useState((typeof COURSE_CATALOGUE!=='undefined'?COURSE_CATALOGUE[0]:''));
  const [rmReason,setRmReason] = React.useState('');
  const C = { green:'#1FA24A', blue:'#0094D4', ink:'#15191D', mut:'#5C6770', bg:'#F4F6F7', card:'#fff', bd:'#E6EAEC' };
  const store = useHStore();
  const items = store.approvals.filter(a=>a.status==='Pending' && role.approves.includes(a.type));
  // leave requests routed to THIS role (e.g. Asha→Richard) — appear until worked
  const pendingLeaves = store.leave ? store.leave.filter(l=>(l.status==='Pending'||l.status==='Flagged') && l.approverRole===role.id) : [];
  const leaveAsItems = pendingLeaves.map(l=>({ id:l.id, type:'leave', who:l.who, no:l.no, site:l.site,
    detail:`${l.type} · ${l.days} days · ${l.from.slice(5)}–${l.to.slice(5)}`, raised:l.source, _lv:true }));
  const apprItems = [...leaveAsItems, ...items];
  const appr = (typeof ROLES!=='undefined') ? ROLES.find(r=>role.reportsTo && role.reportsTo.includes(r.name)) : null;
  const kpis = (role.dash?role.dash.kpis:[]).slice(0,4);
  const self = roleSelfRecord(role);
  const myProf = empProfile(self);
  const me = { no:self.no, name:role.name, site: role.scope==='all'?'Dar Yard':role.scope };
  const myNotifs = store.notifications.filter(n=>n.to===me.no || n.to==='HCWOS');
  const rmPhoto = (window.HStore) ? HStore.profilePhoto(me.no) : null;
  const onDp = async (ev)=>{ const f=ev.target.files&&ev.target.files[0]; if(f&&window.cropImageToSquare){ try{ const d=await cropImageToSquare(f); HStore.setProfilePhoto(me.no,d,me.name); }catch(_){} } ev.target.value=''; };
  const myAct = (store.activity && store.activity[me.no]) || [];
  const ACT_C = { green:C.green, blue:C.blue, yellow:'#E69A00', red:'#E5484D', mut:C.mut };
  const unread = myNotifs.filter(n=>!n.read).length;
  const siteName = role.scope==='all'?'Dar es Salaam HQ':role.scope;
  const wrap = { fontFamily:"'IBM Plex Sans',sans-serif", flex:1, overflowY:'auto', background:C.bg, paddingTop:48, paddingBottom:92 };
  const card = { background:C.card, borderRadius:16, border:`1px solid ${C.bd}`, padding:14, boxShadow:'0 1px 2px rgba(16,24,32,.04)' };

  const head = (sub) => <div style={{background:`linear-gradient(135deg,${C.green},#168A3E)`,color:'#fff',padding:'18px 18px 20px',
    borderBottomLeftRadius:22,borderBottomRightRadius:22}}>
    <div style={{display:'flex',alignItems:'center',gap:11}}>
      <label title="Change profile photo" style={{position:'relative',cursor:'pointer',width:40,height:40,flexShrink:0}}>
        <span style={{width:40,height:40,borderRadius:'50%',display:'block',backgroundColor:'rgba(255,255,255,.2)',backgroundImage:rmPhoto?`url(${rmPhoto})`:'none',backgroundSize:'cover',backgroundPosition:'center',textAlign:'center',lineHeight:'40px',fontWeight:700,fontSize:14}}>{rmPhoto?'':role.initials}</span>
        <span style={{position:'absolute',right:-2,bottom:-2,width:17,height:17,borderRadius:'50%',background:'#fff',color:C.green,display:'flex',alignItems:'center',justifyContent:'center',border:`2px solid ${C.green}`}}><Icon name="camera" size={9}/></span>
        <input type="file" accept="image/*" onChange={onDp} style={{display:'none'}}/>
      </label>
      <div style={{minWidth:0}}><div style={{fontWeight:700,fontSize:15}}>{role.name}</div>
        <div style={{fontSize:12,opacity:.85}}>{sub||role.title}</div></div>
      <div style={{marginLeft:'auto'}}><LangSwitch dark scope="ess"/></div>
      <button onClick={()=>setTab('rmnotif')} style={{marginLeft:8,position:'relative',width:36,height:36,borderRadius:'50%',
        background:'rgba(255,255,255,.16)',border:'none',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
        <Icon name="bell" size={18}/>{unread>0&&<span style={{position:'absolute',top:5,right:6,minWidth:14,height:14,borderRadius:8,
          background:'#E5484D',fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 3px'}}>{unread}</span>}</button>
    </div>
    <div style={{marginTop:12,fontSize:11.5,opacity:.9,display:'flex',alignItems:'center',gap:6}}>
      <Icon name="briefcase" size={13}/>Reports to {role.reportsTo}</div>
  </div>;

  const home = <div style={wrap}>{head()}
    <div style={{padding:'15px 14px',display:'flex',flexDirection:'column',gap:12}}>
      <div style={{fontWeight:700,fontSize:14}}>My overview</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11}}>
        {kpis.map((k,i)=><div key={i} style={card}>
          <div style={{display:'flex',alignItems:'center',gap:6,color:C.mut,fontSize:11.5}}><Icon name={k.icon} size={14} style={{color:C.green}}/>{k.label}</div>
          <div style={{fontFamily:"'IBM Plex Mono'",fontSize:20,fontWeight:600,marginTop:6,letterSpacing:'-.02em'}}>{k.value}{k.unit?<span style={{fontSize:11}}> {k.unit}</span>:''}</div>
          <div style={{color:C.mut,fontSize:10.5,marginTop:2}}>{k.sub}</div></div>)}
      </div>
      <button onClick={()=>setTab('approvals')} style={{...card,display:'flex',alignItems:'center',gap:12,cursor:'pointer',textAlign:'left',
        borderColor:items.length?C.green:C.bd}}>
        <span style={{width:38,height:38,borderRadius:9,background:'rgba(31,162,74,.1)',color:C.green,
          display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="check" size={19}/></span>
        <div style={{flex:1}}><div style={{fontWeight:600,fontSize:14}}>Approvals</div>
          <div style={{color:C.mut,fontSize:12}}>{apprItems.length?apprItems.length+' awaiting your sign-off':'Nothing pending'}</div></div>
        <Icon name="chevR" size={16} style={{color:C.mut}}/></button>
      <div style={{...card}}>
        <div style={{fontWeight:700,fontSize:13.5,marginBottom:9}}>My activity history</div>
        {myAct.length ? myAct.slice(0,6).map((r,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',borderTop:i?`1px solid ${C.bd}`:'none'}}>
          <span style={{width:7,height:7,borderRadius:'50%',background:ACT_C[r.tone]||C.mut}}></span>
          <span style={{fontSize:13}}>{r.label}</span>
          <span style={{marginLeft:'auto',color:C.mut,fontSize:11,fontFamily:"'IBM Plex Mono'"}}>{new Date(r.ts).toLocaleDateString('en-GB',{day:'2-digit',month:'short'})}</span>
        </div>) : <div style={{color:C.mut,fontSize:12.5}}>Your clock-ins, requests and approvals will show here.</div>}
      </div>
    </div>
  </div>;

  const approvals = <div style={wrap}>{head('Approvals inbox')}
    <div style={{padding:'15px 14px',display:'flex',flexDirection:'column',gap:11}}>
      <div style={{fontWeight:700,fontSize:14}}>Awaiting you</div>
      {apprItems.length? apprItems.map(a=><div key={a.id} style={card}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:7}}>
          <span style={{fontSize:10.5,fontWeight:700,color:C.blue,background:'rgba(0,148,212,.1)',padding:'2px 8px',borderRadius:20}}>{APPROVAL_LABELS[a.type]}</span>
          <span style={{marginLeft:'auto',color:C.mut,fontSize:11}}>{a.raised}</span></div>
        <div style={{fontWeight:600,fontSize:14}}>{a.who}</div>
        <div style={{color:C.mut,fontSize:12.5,margin:'2px 0 11px'}}>{a.detail}</div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>a._lv?HStore.setLeaveStatus(a.id,'Approved',role.name,role.title):HStore.decide(a.id,'Approved',role.name,role.title)} style={{flex:1,background:C.green,color:'#fff',border:'none',borderRadius:9,padding:'10px',fontWeight:700,fontSize:13}}>Approve</button>
          <button onClick={()=>a._lv?HStore.setLeaveStatus(a.id,'Declined',role.name,role.title):HStore.decide(a.id,'Declined',role.name,role.title)} style={{flex:1,background:'#fff',color:C.ink,border:`1px solid ${C.bd}`,borderRadius:9,padding:'10px',fontWeight:600,fontSize:13}}>Decline</button>
        </div>
      </div>) : <div style={{...card,textAlign:'center',color:C.mut,fontSize:13,padding:24}}>
        No approvals are assigned to your role.</div>}
    </div>
  </div>;

  // personal ESS — managers are employees too
  const ess = <div style={wrap}>{head('My Employee Self-Service')}
    <div style={{padding:'15px 14px',display:'flex',flexDirection:'column',gap:12}}>
      <div style={{...card,display:'flex',alignItems:'center',gap:12,borderColor:clocked?C.green:C.bd,
        background:clocked?'rgba(31,162,74,.06)':C.card}}>
        <span style={{width:40,height:40,borderRadius:'50%',background:clocked?C.green:'#ddd',color:'#fff',
          display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name={clocked?'check':'clock'} size={20}/></span>
        <div style={{flex:1}}><div style={{fontWeight:600,fontSize:14}}>{clocked?'Clocked in · '+siteName:'Not clocked in'}</div>
          <div style={{color:C.mut,fontSize:12}}>{clocked?'06:42 · inside geofence':'Tap to clock in'}</div></div>
        <button onClick={()=>setClocked(!clocked)} style={{background:clocked?'#fff':C.green,color:clocked?'#E5484D':'#fff',
          border:`1px solid ${clocked?'#E5484D':C.green}`,borderRadius:9,padding:'8px 13px',fontWeight:600,fontSize:13}}>{clocked?'Clock out':'Clock in'}</button>
      </div>
      <div style={{display:'flex',gap:11}}>
        <div style={{...card,flex:1}}><div style={{color:C.mut,fontSize:11}}>Leave balance</div>
          <div style={{fontFamily:"'IBM Plex Mono'",fontSize:22,fontWeight:600,color:C.green}}>{self.leave.toFixed(1)}<span style={{fontSize:11}}> days</span></div></div>
        <div style={{...card,flex:1}}><div style={{color:C.mut,fontSize:11}}>Next payslip</div>
          <div style={{fontWeight:600,fontSize:14,marginTop:6}}>28 Jun 2026</div><div style={{color:C.mut,fontSize:11}}>secure delivery</div></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11}}>
        {[['calendar','Apply leave','rmleave'],['idcard','My ID card','rmid'],['award','Performance','rmperf'],
          ['award','My training','rmtrain'],['money','My payslips','rmpay'],['doc','My documents','rmdocs'],['shield','Policies','rmpol'],['phone','Help & support','rmsupport']].map((q,i)=>
          <button key={i} onClick={()=>setTab(q[2])} style={{...card,display:'flex',flexDirection:'column',gap:9,cursor:'pointer',textAlign:'left',border:`1px solid ${C.bd}`}}>
            <span style={{width:34,height:34,borderRadius:9,background:'rgba(0,148,212,.1)',color:C.blue,
              display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name={q[0]} size={18}/></span>
            <span style={{fontWeight:600,fontSize:13.5}}>{q[1]}</span></button>)}
      </div>
      <div style={{...card,fontSize:12.5,color:C.mut,display:'flex',gap:9,alignItems:'center'}}>
        <Icon name="shield" size={15} style={{color:C.green}}/>You report to {role.reportsTo} — your own leave & appraisals route there.</div>
    </div>
  </div>;

  const profile = <div className="mob-light" style={{height:'100%',paddingTop:44,background:'#F4F6F7'}}>
    <EmployeeProfile prof={myProf} money={false} selfView/></div>;

  // shared self-service screens (identical design to the employee ESS)
  const back = ()=>setTab('ess');
  const rmpay = <EssPayslip me={me} C={C} card={card} wrap={wrap} onBack={back}/>;
  const rmdocs = <EssDocuments me={me} C={C} card={card} wrap={wrap} onBack={back}/>;
  const rmpol = <EssPolicies me={me} C={C} card={card} wrap={wrap} onBack={back}/>;
  const rmnotif = <EssNotifs me={me} C={C} card={card} wrap={wrap} onBack={back} onOpen={setTab} includeBroadcast/>;
  const rmid = <div style={wrap}><MobHeader title="My ID card" sub="digital employee ID · tap to flip" C={C} onBack={back}/>
    <div style={{padding:'12px 14px 90px',display:'flex',justifyContent:'center'}}>
      {myProf ? <EssIdCard prof={myProf} photo={window.HStore?HStore.profilePhoto(me.no):null}/> : <div style={{color:C.mut,padding:30,textAlign:'center'}}>ID card unavailable.</div>}
    </div></div>;
  const rmsupport = <EssSupport me={me} C={C} card={card} wrap={wrap} onBack={back}/>;

  const myTr = store.training.filter(tk=>tk.no===me.no);
  const myRv = store.reviews.filter(r=>r.no===me.no && r.status!=='Draft');
  const rmleave = <div style={wrap}><MobHeader title="Apply for leave" sub={me.site} C={C} onBack={back}/>
    <div style={{padding:'0 14px 90px',display:'flex',flexDirection:'column',gap:12}}>
      <div style={{...card,padding:'13px 15px'}}><div style={{color:C.mut,fontSize:11,marginBottom:9,fontWeight:600}}>LEAVE TYPE</div>
        <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>{(typeof LEAVE_TYPES!=='undefined'?LEAVE_TYPES:[]).map(l=>
          <button key={l.code} onClick={()=>setRmLeave(l.type)} style={{padding:'7px 11px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',
            border:`1px solid ${rmLeaveType===l.type?C.green:C.bd}`,background:rmLeaveType===l.type?'rgba(31,162,74,.1)':'#fff',
            color:rmLeaveType===l.type?C.green:C.mut}}>{l.type.replace(' Leave','')}</button>)}</div></div>
      {[['From','01 Jul 2026'],['To','05 Jul 2026'],['Working days','5 days'],['Covering officer',role.reportsTo.split(' · ')[0]]].map((f,i)=>
        <div key={i} style={{...card,display:'flex',alignItems:'center',padding:'13px 15px'}}>
          <span style={{color:C.mut,fontSize:13}}>{f[0]}</span><span style={{marginLeft:'auto',fontWeight:600,fontSize:13.5}}>{f[1]}</span></div>)}
      <button onClick={()=>{HStore.addLeave({who:me.name,no:me.no,site:me.site,type:rmLeaveType.replace(' Leave',''),from:'2026-07-01',to:'2026-07-05',days:5,cover:true,
        approverRole:appr&&appr.id, approverName:appr&&appr.name, approverNo:appr&&roleSelfRecord(appr).no});back();}}
        style={{background:C.green,color:'#fff',border:'none',borderRadius:12,padding:'14px',fontWeight:700,fontSize:14.5,cursor:'pointer'}}>Submit request</button>
    </div></div>;

  const rmtrain = <div style={wrap}><MobHeader title="Training" sub="request a course" C={C} onBack={back}/>
    <div style={{padding:'0 14px 90px',display:'flex',flexDirection:'column',gap:12}}>
      <div style={{...card,display:'flex',flexDirection:'column',gap:11}}>
        <div style={{fontWeight:700,fontSize:13.5}}>New training request</div>
        <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>{(typeof COURSE_CATALOGUE!=='undefined'?COURSE_CATALOGUE:[]).map(c=>
          <button key={c} onClick={()=>setRmCourse(c)} style={{padding:'7px 10px',borderRadius:8,fontSize:11.5,fontWeight:600,cursor:'pointer',
            border:`1px solid ${rmCourse===c?C.green:C.bd}`,background:rmCourse===c?'rgba(31,162,74,.1)':'#fff',color:rmCourse===c?C.green:C.mut}}>{c}</button>)}</div>
        <textarea value={rmReason} onChange={e=>setRmReason(e.target.value)} placeholder="Justification…"
          style={{width:'100%',minHeight:56,borderRadius:10,border:`1px solid ${C.bd}`,padding:'10px',fontSize:13,fontFamily:'inherit',boxSizing:'border-box',resize:'vertical'}}/>
        <button disabled={rmReason.trim().length<6} onClick={()=>{HStore.submitTraining({no:me.no,name:me.name,site:me.site,course:rmCourse,reason:rmReason.trim()});setRmReason('');}}
          style={{background:rmReason.trim().length<6?'#ccc':C.green,color:'#fff',border:'none',borderRadius:10,padding:'13px',fontWeight:700,fontSize:14,cursor:rmReason.trim().length<6?'default':'pointer'}}>Submit request</button>
      </div>
      {myTr.length>0 && <div style={{...card}}>
        <div style={{fontWeight:600,fontSize:13.5,marginBottom:8}}>My tickets <span style={{fontSize:10.5,color:C.blue}}>⇄ synced with HCMOS</span></div>
        {myTr.map((tk,i)=><div key={tk.id} style={{display:'flex',alignItems:'center',gap:9,padding:'8px 0',borderTop:i?`1px solid ${C.bd}`:'none'}}>
          <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600}}>{tk.course}</div><div style={{color:C.mut,fontSize:11}}>{tk.stage}</div></div>
          <span style={{fontSize:11,fontWeight:700,color:tk.status==='Completed'?C.green:tk.status==='Rejected'?'#E5484D':tk.status==='Pending'?'#9A6B00':C.blue}}>{tk.status}</span></div>)}
      </div>}
    </div></div>;

  const rmperf = <div style={wrap}><MobHeader title="Performance" sub="your reviews" C={C} onBack={back}/>
    <div style={{padding:'0 14px 90px',display:'flex',flexDirection:'column',gap:12}}>
      {myRv.length? myRv.map(r=><div key={r.id} style={{...card,display:'flex',flexDirection:'column',gap:9}}>
        <div style={{fontWeight:700,fontSize:13.5}}>{r.cycle}</div>
        {r.rating&&<div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{width:34,height:34,borderRadius:8,background:C.green,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:16}}>{r.rating}</span>
          <span style={{fontWeight:700,fontSize:13.5}}>{r.label}</span></div>}
        {r.summary&&<div style={{fontSize:12.5,color:C.mut,lineHeight:1.5}}>{r.summary}</div>}
        {!r.ack&&<button onClick={()=>HStore.acknowledgeReview(r.id)} style={{background:C.green,color:'#fff',border:'none',borderRadius:10,padding:'11px',fontWeight:700,fontSize:13.5,cursor:'pointer'}}>Acknowledge</button>}
      </div>) : <div style={{...card,textAlign:'center',color:C.mut,fontSize:13,padding:24}}>No reviews published yet.</div>}
    </div></div>;

  const screen = {home,approvals,ess,profile,rmpay,rmdocs,rmpol,rmnotif,rmid,rmsupport,rmleave,rmtrain,rmperf}[tab];
  const tabs = [['home','grid','Home'],['approvals','check','Approvals'],['ess','clock','My ESS'],['profile','users','Profile']];
  return <div className="ess" style={{height:'100%'}}>
    {screen}
    <div style={{position:'absolute',bottom:0,left:0,right:0,background:'rgba(255,255,255,.94)',backdropFilter:'blur(10px)',
      borderTop:`1px solid ${C.bd}`,display:'flex',padding:'8px 6px 26px'}}>
      {tabs.map(t=><button key={t[0]} onClick={()=>setTab(t[0])} style={{flex:1,background:'none',border:'none',position:'relative',
        display:'flex',flexDirection:'column',alignItems:'center',gap:3,color:tab===t[0]?C.green:C.mut,cursor:'pointer'}}>
        <Icon name={t[1]} size={20}/><span style={{fontSize:10,fontWeight:600}}>{t[2]}</span>
        {t[0]==='approvals'&&apprItems.length>0&&<span style={{position:'absolute',top:-2,right:'50%',marginRight:-20,background:'#E5484D',
          color:'#fff',fontSize:9,fontWeight:700,borderRadius:20,padding:'1px 5px'}}>{apprItems.length}</span>}</button>)}
    </div>
  </div>;
}

function RoleMobile({ role }){
  return <div className="ess-wrap">
    <div className="ess-side">
      <SecH>Mobile · on the go</SecH>
      <p style={{color:'var(--muted)',fontSize:13.5,lineHeight:1.6,marginTop:14}}>
        {role.title}s manage <b>and</b> self-serve from one app. Managers are employees too — so alongside
        approvals and your overview, you clock in, apply for leave and view your own payslips and profile.
        You report to <b>{role.reportsTo}</b>.</p>
      <div className="grid" style={{gap:12,marginTop:8}}>
        {[['check','Approvals inbox','Approve or decline leave, overtime, recruitment and more — wherever you are.'],
          ['grid','Live overview','Your key KPIs at a glance, from the same source as the console.'],
          ['clock','My ESS','Clock-in, leave, payslips and documents — your own employee self-service.'],
          ['users','My profile','Your basic bio-data; request changes to contact details, just like any employee.']].map((f,i)=>
          <Card key={i} className="card-p" style={{display:'flex',gap:13,alignItems:'flex-start'}}>
            <span style={{width:34,height:34,borderRadius:9,background:'var(--accent-soft)',color:'var(--accent)',
              display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Icon name={f[0]} size={18}/></span>
            <div><div style={{fontWeight:600,fontSize:13.5}}>{f[1]}</div>
              <div style={{color:'var(--muted)',fontSize:12.5,marginTop:2,lineHeight:1.5}}>{f[2]}</div></div>
          </Card>)}
      </div>
    </div>
    <IOSDevice><RoleMobileApp role={role}/></IOSDevice>
  </div>;
}
window.RoleMobile = RoleMobile;
