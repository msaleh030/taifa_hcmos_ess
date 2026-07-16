// Smart QR ID cards — generated from employee data. Shared face renderer used by the
// HCM IdCardModal (print to PVC smart card / issue digital) and the ESS 3D flip card.
function idLogo(){ return (window.__resources && window.__resources.taifaLogo) || 'assets/taifa-logo.png'; }

function IdChip({ k }){
  return <svg width={34*k} height={26*k} viewBox="0 0 34 26" style={{display:'block'}}>
    <rect x="0.5" y="0.5" width="33" height="25" rx="4" fill="#E7C868"/>
    <rect x="0.5" y="0.5" width="33" height="25" rx="4" fill="url(#cg)" opacity="0.0"/>
    <g stroke="#A9842E" strokeWidth="1" fill="none">
      <line x1="0" y1="9" x2="12" y2="9"/><line x1="22" y1="9" x2="34" y2="9"/>
      <line x1="0" y1="17" x2="12" y2="17"/><line x1="22" y1="17" x2="34" y2="17"/>
      <rect x="12" y="6" width="10" height="14" rx="2"/>
      <line x1="17" y1="0" x2="17" y2="6"/><line x1="17" y1="20" x2="17" y2="26"/>
    </g>
  </svg>;
}

// One face of the ID card. side: 'front' | 'back'. w = card width in px.
function IdCardFace({ prof, photo, side='front', w=340 }){
  const e=prof.base, em=prof.employment, p=prof.personal;
  const k = w/340, h = w/1.586;
  const name=p.fullName||e.name, empNo=em.empNo, role=em.role, grade=em.grade, site=em.site, dept=em.department;
  const qrVal = 'https://verify.taifamining.tz/id/'+empNo;
  const pad = 16*k;

  if(side==='front'){
    return <div style={{width:w,height:h,borderRadius:16*k,overflow:'hidden',position:'relative',color:'#fff',
      background:'linear-gradient(135deg,#0E4D34 0%,#08311E 70%,#0B3E29 100%)',
      boxShadow:'0 18px 40px rgba(8,40,26,.35)',fontFamily:"'IBM Plex Sans',sans-serif"}}>
      <div style={{position:'absolute',right:-h*0.3,top:-h*0.3,width:h*0.9,height:h*0.9,borderRadius:'50%',background:'radial-gradient(circle,rgba(31,162,74,.35),transparent 70%)'}}></div>
      <div style={{position:'relative',padding:pad,height:'100%',display:'flex',flexDirection:'column'}}>
        <div style={{display:'flex',alignItems:'center',gap:8*k}}>
          <span style={{background:'#fff',borderRadius:6*k,padding:`${4*k}px ${7*k}px`,display:'inline-flex',alignItems:'center',boxShadow:'0 1px 3px rgba(0,0,0,.18)'}}>
            <img src={idLogo()} alt="Taifa" style={{height:13*k,display:'block'}}/>
          </span>
          <div style={{marginLeft:'auto',textAlign:'right'}}>
            <div style={{fontFamily:"'IBM Plex Mono'",fontSize:9*k,letterSpacing:2*k,color:'#9FE3BD',fontWeight:600}}>EMPLOYEE ID</div>
            <div style={{fontSize:8.5*k,color:'rgba(255,255,255,.65)'}}>Taifa Mining &amp; Civil</div>
          </div>
        </div>
        <div style={{display:'flex',gap:13*k,marginTop:13*k,flex:1}}>
          <div style={{width:62*k,height:78*k,borderRadius:8*k,overflow:'hidden',flexShrink:0,border:'2px solid rgba(255,255,255,.4)',
            background:photo?`center/cover url(${photo})`:'rgba(255,255,255,.12)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            {!photo && <span style={{fontWeight:700,fontSize:24*k,color:'#fff'}}>{initials(name)}</span>}
          </div>
          <div style={{minWidth:0,flex:1,display:'flex',flexDirection:'column'}}>
            <div style={{fontSize:17*k,fontWeight:700,letterSpacing:-.3*k,lineHeight:1.1,textWrap:'balance'}}>{name}</div>
            <div style={{fontSize:11*k,color:'#9FE3BD',marginTop:2*k,fontWeight:500}}>{role}</div>
            <div style={{marginTop:'auto',display:'flex',alignItems:'flex-end',gap:10*k}}>
              <IdChip k={k}/>
              <div style={{lineHeight:1.3}}>
                <div style={{fontSize:8*k,color:'rgba(255,255,255,.55)',textTransform:'uppercase',letterSpacing:1*k}}>ID No.</div>
                <div style={{fontFamily:"'IBM Plex Mono'",fontSize:11.5*k,fontWeight:600}}>{empNo}</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8*k,marginTop:9*k,fontSize:9.5*k,color:'rgba(255,255,255,.8)'}}>
          <span><b style={{color:'#fff'}}>{grade}</b> · {site}</span>
          <span style={{marginLeft:'auto',display:'flex',gap:3*k,alignItems:'center'}}>
            <span style={{width:24*k,height:4*k,borderRadius:2,background:'#1FA24A'}}></span>
            <span style={{width:24*k,height:4*k,borderRadius:2,background:'#FBC02D'}}></span>
            <span style={{width:24*k,height:4*k,borderRadius:2,background:'#0094D4'}}></span>
          </span>
        </div>
      </div>
    </div>;
  }

  // back
  return <div style={{width:w,height:h,borderRadius:16*k,overflow:'hidden',position:'relative',background:'#F4F6F7',color:'#15191D',
    border:'1px solid #E2E7EA',boxShadow:'0 18px 40px rgba(8,40,26,.25)',fontFamily:"'IBM Plex Sans',sans-serif"}}>
    <div style={{height:30*k,background:'#15191D',marginTop:14*k}}></div>
    <div style={{display:'flex',gap:13*k,padding:pad,paddingTop:12*k}}>
      <div style={{background:'#fff',padding:7*k,borderRadius:9*k,border:'1px solid #E2E7EA',flexShrink:0}}>
        <QR value={qrVal} size={86*k} margin={1} fg="#0E3D26"/>
      </div>
      <div style={{minWidth:0,fontSize:9.5*k,lineHeight:1.5,color:'#5C6770'}}>
        <div style={{fontWeight:700,fontSize:11*k,color:'#15191D'}}>Scan to verify identity</div>
        <div style={{marginTop:3*k}}>Holder: <b style={{color:'#15191D'}}>{name}</b></div>
        <div className="num" style={{color:'#15191D'}}>{empNo}</div>
        <div style={{marginTop:4*k}}>Dept: {dept}</div>
        <div>Issued 2026 · valid while employed</div>
      </div>
    </div>
    <div style={{position:'absolute',left:0,right:0,bottom:0,padding:`${8*k}px ${pad}px`,fontSize:8*k,color:'#8A949C',
      borderTop:'1px solid #EDF0F2',background:'#fff'}}>
      Property of Taifa Mining &amp; Civil. If found, return to the nearest site office. Tampering voids this card.
    </div>
  </div>;
}

// HCM: full ID-card preview with print (PVC smart card) + issue-digital actions.
function IdCardModal({ prof, photo, role, onClose }){
  const e=prof.base, em=prof.employment;
  const print = ()=>{ document.body.classList.add('idcard-printing');
    const done=()=>{ document.body.classList.remove('idcard-printing'); window.removeEventListener('afterprint',done); };
    window.addEventListener('afterprint',done); setTimeout(()=>window.print(),60); };
  const issue = ()=>{
    if(window.HStore){
      HStore.record({ actor: role?role.name:'HR', role: role?role.title:'HR Officer', action:'Update', entity:'ID Card',
        entityId: em.empNo, subject: e.name, reason:'Smart QR ID card issued · digital + print', changes:[{field:'ID card',before:'—',after:'Issued'}] });
      HStore.notify({ to:e.no, from: role?role.name:'HR', kind:'shield', title:'Digital ID card issued',
        body:'Your smart QR ID card is now available in the app — open “My ID”.', action:{tab:'id'} });
      HStore.notify({ to:'HCWOS', from: role?role.name:'HR', kind:'shield', title:'ID card issued', body:`${e.name} (${em.empNo}) — smart QR ID issued.`, action:{page:'employees'} });
    }
    window.toast('ID card issued · digital + ready to print', 'shield');
  };
  return <><div className="drawer-backdrop" style={{zIndex:62}} onClick={onClose}></div>
    <div role="dialog" style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:63,width:780,maxWidth:'94vw',
      maxHeight:'92vh',overflow:'auto',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:14,boxShadow:'0 24px 64px rgba(0,0,0,.3)'}}>
      <div style={{display:'flex',alignItems:'center',gap:11,padding:'17px 20px',borderBottom:'1px solid var(--border-2)'}}>
        <span style={{width:34,height:34,borderRadius:9,background:'var(--accent-soft)',color:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="shield" size={17}/></span>
        <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15}}>Employee ID card</div>
          <div className="muted" style={{fontSize:12}}>{e.name} · {em.empNo}</div></div>
        <button className="btn sm" onClick={print}><Icon name="download" size={14}/>Print smart card</button>
        <button className="btn sm primary" onClick={issue}><Icon name="phone" size={14}/>Issue digital ID</button>
        <button className="iconbtn" onClick={onClose}><Icon name="x" size={18}/></button>
      </div>
      <div className="idcard-print" style={{padding:24,display:'flex',gap:22,flexWrap:'wrap',justifyContent:'center',background:'var(--surface-2)'}}>
        <div><div className="muted" style={{fontSize:11,textAlign:'center',marginBottom:8,letterSpacing:'.04em',textTransform:'uppercase'}}>Front</div>
          <IdCardFace prof={prof} photo={photo} side="front" w={360}/></div>
        <div><div className="muted" style={{fontSize:11,textAlign:'center',marginBottom:8,letterSpacing:'.04em',textTransform:'uppercase'}}>Back</div>
          <IdCardFace prof={prof} photo={photo} side="back" w={360}/></div>
      </div>
      <div style={{padding:'13px 20px',fontSize:12.5,color:'var(--muted)',display:'flex',gap:8,alignItems:'center',borderTop:'1px solid var(--border-2)'}}>
        <Icon name="shield" size={15} style={{color:'var(--accent)'}}/>Generated from the employee record. Print on a PVC smart card or issue as a digital ID — both carry the same verifiable QR.
      </div>
    </div></>;
}

// ESS: interactive 3D flip card (tap to flip front ⇄ back).
function EssIdCard({ prof, photo }){
  const [flip,setFlip] = React.useState(false);
  const w = 300, h = w/1.586;
  return <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16}}>
    <div className="idc-scene" style={{width:w,height:h}}>
      <div className={'idc-3d'+(flip?' flip':'')+(flip?'':' idc-idle')} style={{width:w,height:h}} onClick={()=>setFlip(f=>!f)}>
        <div className="idc-face"><IdCardFace prof={prof} photo={photo} side="front" w={w}/></div>
        <div className="idc-face back"><IdCardFace prof={prof} photo={photo} side="back" w={w}/></div>
      </div>
    </div>
    <button onClick={()=>setFlip(f=>!f)} style={{display:'flex',alignItems:'center',gap:7,background:'#fff',border:'1px solid #E6EAEC',
      borderRadius:30,padding:'9px 16px',fontWeight:600,fontSize:13,color:'#15191D',cursor:'pointer'}}>
      <Icon name="swap" size={15}/>{flip?'Show front':'Flip to QR'}</button>
  </div>;
}

Object.assign(window, { IdCardFace, IdCardModal, EssIdCard });
