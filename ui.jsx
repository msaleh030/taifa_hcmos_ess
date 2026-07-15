// Shared UI: icons + small components. Exports to window.
const I = {
  grid:'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11',
  calendar:'M8 2v4M16 2v4M3 9h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  shield:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  award:'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.2 13.9 7 22l5-3 5 3-1.2-8.1',
  pin:'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  bell:'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  search:'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  alert:'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01',
  clock:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  trend:'M22 7l-8.5 8.5-5-5L2 17M16 7h6v6',
  money:'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  doc:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h4',
  chart:'M3 3v18h18M7 16v-5M12 16V8M17 16v-8',
  building:'M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M9 7h.01M12 7h.01M9 11h.01M12 11h.01M9 15h.01M12 15h.01M19 21V11h-4',
  truck:'M1 3h15v13H1zM16 8h4l3 3v5h-7M5.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  check:'M20 6 9 17l-5-5',
  x:'M18 6 6 18M6 6l12 12',
  chevR:'M9 18l6-6-6-6',
  phone:'M5 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM10 18h.01',
  plus:'M12 5v14M5 12h14',
  download:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  filter:'M22 3H2l8 9.5V19l4 2v-8.5z',
  sun:'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  heart:'M19 14c1.5-1.5 3-3.4 3-5.5A5.5 5.5 0 0 0 12 5 5.5 5.5 0 0 0 2 8.5c0 2.1 1.5 4 3 5.5l7 7z',
  briefcase:'M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2',
  flag:'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7',
  lock:'M5 11h14a0 0 0 0 1 0 0v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a0 0 0 0 1 0 0zM8 11V7a4 4 0 0 1 8 0v4',
  logout:'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  swap:'M16 3l4 4-4 4M20 7H8M8 21l-4-4 4-4M4 17h12',
  clipboard:'M9 3h6a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2M9 14l2 2 4-4',
  wrench:'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2 2.6-2.6z',
  leaf:'M11 20A7 7 0 0 1 4 13c0-6 7-9 16-9 0 9-3 16-9 16zM4 21c2-7 7-10 12-11',
  cap:'M22 10 12 5 2 10l10 5 10-5zM6 12v5c0 1 2.7 2 6 2s6-1 6-2v-5M22 10v6',
  hardhat:'M4 17a8 8 0 0 1 16 0zM2 17h20v3H2zM9.5 9.2V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5v3.7',
  octagon:'M7.9 2h8.2L22 7.9v8.2L16.1 22H7.9L2 16.1V7.9zM12 8v4M12 16h.01',
  megaphone:'M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1zM15 8a4 4 0 0 1 0 8M18.5 5a8 8 0 0 1 0 14',
  camera:'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  idcard:'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM7.5 15a2.5 2.5 0 0 1 5 0M10 11.5a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2M15 9.5h4M15 12.5h4M15 15h2.5',
};
function Icon({ name, size=18, style, cls }){
  return <svg className={cls} width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
    style={style}>{(I[name]||'').split('M').filter(Boolean).map((d,i)=><path key={i} d={'M'+d}/>)}</svg>;
}

const COLORS = ['#1FA24A','#0094D4','#FBC02D','#7A5AE0','#E5484D','#E07B39','#2AA39A'];
const colorFor = (s='') => { let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return COLORS[h%COLORS.length]; };
const initials = (n='') => n.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();

function Avatar({ name, size=28, photo }){
  if(photo) return <span className="ma" title={name} style={{width:size,height:size,backgroundImage:`url(${photo})`,backgroundSize:'cover',backgroundPosition:'center',color:'transparent'}}></span>;
  return <span className="ma" style={{background:colorFor(name),width:size,height:size,fontSize:size*0.37}}>{initials(name)}</span>;
}
function RowName({ name, sub }){
  return <div className="rowname"><Avatar name={name}/><div><div className="name">{name}</div>
    {sub && <div className="muted" style={{fontSize:11.5}}>{sub}</div>}</div></div>;
}
function Tag({ tone='grey', children, dot, style }){
  return <span className={'tag t-'+tone} style={style}>{dot && <span className="dotbadge" style={{background:'currentColor'}}/>}{children}</span>;
}
function Card({ children, className='', style }){ return <div className={'card '+className} style={style}>{children}</div>; }
function CardH({ title, icon, meta, action }){
  return <div className="card-h">{icon && <Icon name={icon} size={16} style={{color:'var(--accent)'}}/>}
    <h3>{title}</h3>{meta && <span className="meta">{meta}</span>}{action}</div>;
}
function KPI({ icon, label, value, unit, sub, trend, trendDir, onClick, source }){
  return <Card className={'kpi'+(onClick?' kpi-nav':'')} style={onClick?{cursor:'pointer'}:null}>
    <div onClick={onClick} style={onClick?null:{pointerEvents:'auto'}}>
    <div className="lab"><Icon name={icon} size={16} cls="ic"/>{label}{onClick&&<Icon name="chevR" size={13} style={{marginLeft:'auto',color:'var(--faint)'}}/>}</div>
    <div className="val num">{value}{unit && <small> {unit}</small>}</div>
    <div className="sub">{trend && <span className={'trend '+(trendDir||'up')}>{trend}</span>}{sub}</div>
    {source && <div className="kpi-src"><Icon name="swap" size={10}/>source: {source}</div>}
    </div>
  </Card>;
}
function HBar({ label, value, max, color, suffix }){
  return <div className="hbar-row"><span className="muted" style={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{label}</span>
    <span className="track"><i style={{width:Math.min(100,value/max*100)+'%',background:color||'var(--accent)'}}/></span>
    <span className="num" style={{textAlign:'right',fontWeight:600}}>{suffix!==undefined?suffix:value}</span></div>;
}
function Ring({ pct, label, value, color }){
  return <div className="ring-chart" style={{'--p':pct, background:`conic-gradient(${color||'var(--accent)'} calc(var(--p)*1%), var(--surface-2) 0)`}}>
    <div className="hole"><div className="num" style={{fontSize:21,fontWeight:600}}>{value}</div>
    <div style={{fontSize:10.5,color:'var(--faint)'}}>{label}</div></div></div>;
}
function SecH({ children, action }){ return <div className="sec-h"><h2>{children}</h2><span className="ln"/>{action}</div>; }

// Autocomplete over existing employee records — pre-populates wherever an employee is chosen.
function EmployeePicker({ value, onPick, placeholder='Search employee by name or no.…' }){
  const [q,setQ] = React.useState(value||'');
  const [open,setOpen] = React.useState(false);
  const box = React.useRef(null);
  React.useEffect(()=>{ setQ(value||''); },[value]);
  React.useEffect(()=>{ const h=e=>{ if(box.current&&!box.current.contains(e.target)) setOpen(false); }; document.addEventListener('mousedown',h); return ()=>document.removeEventListener('mousedown',h); },[]);
  const list = (window.HStore?HStore.employees():(typeof EMPLOYEES!=='undefined'?EMPLOYEES:[]));
  const ql=q.trim().toLowerCase();
  const matches = (ql? list.filter(e=>(e.name+' '+e.no+' '+e.role+' '+e.site).toLowerCase().includes(ql)) : list).slice(0,8);
  const inp = { padding:'9px 11px',border:'1px solid var(--border)',borderRadius:8,background:'var(--surface)',color:'var(--text)',fontSize:13,fontFamily:'inherit',width:'100%',boxSizing:'border-box' };
  return <div ref={box} style={{position:'relative'}}>
    <input style={inp} value={q} placeholder={placeholder} onFocus={()=>setOpen(true)} onChange={e=>{setQ(e.target.value);setOpen(true);}}/>
    {open && <div style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,zIndex:70,maxHeight:240,overflowY:'auto',
      background:'var(--surface)',border:'1px solid var(--border)',borderRadius:9,boxShadow:'0 12px 32px rgba(0,0,0,.18)'}}>
      {matches.length? matches.map(e=><button key={e.no} type="button" onClick={()=>{ onPick&&onPick(e); setQ(e.name); setOpen(false); }}
        style={{display:'flex',gap:9,alignItems:'center',width:'100%',textAlign:'left',padding:'8px 11px',background:'none',border:'none',borderBottom:'1px solid var(--border-2)',cursor:'pointer'}}>
        <Avatar name={e.name} size={26}/>
        <div style={{minWidth:0}}><div style={{fontWeight:600,fontSize:13}}>{e.name}</div>
          <div className="muted" style={{fontSize:11}}>{e.no} · {e.role} · {e.site}</div></div></button>)
        : <div className="muted" style={{padding:'10px 12px',fontSize:12.5}}>No matching employee.</div>}
    </div>}
  </div>;
}

// Reusable data-capture form modal — drives the "right forms" across modules.
function FormModal({ title, icon='doc', fields=[], submitLabel='Save', onSubmit, onClose }){
  const init = {}; fields.forEach(f=>init[f.key] = f.default!==undefined?f.default:(f.type==='select'?(f.options&&f.options[0]||''):''));
  const [v,setV] = React.useState(init);
  const [touched,setTouched] = React.useState(false);
  const set = (k,val)=>setV(s=>({...s,[k]:val}));
  const pickEmp = (f,emp)=>setV(s=>{ const n={...s,[f.key]:emp.name,[f.key+'_no']:emp.no,_emp:emp};
    fields.forEach(ff=>{ if(ff.key==='site') n.site=emp.site; else if(ff.key==='grade') n.grade=emp.grade;
      else if(ff.key==='position') n.position=emp.role; else if(ff.key==='empNo') n.empNo=emp.no;
      else if(ff.key==='department') n.department=(emp.role||'').includes('HR')?'Human Resources':(emp.role||'').includes('HSEQ')?'SHEQ':'Operations'; });
    return n; });
  const missing = fields.filter(f=>f.required && !String(v[f.key]||'').trim()).map(f=>f.key);
  const inp = { padding:'9px 11px',border:'1px solid var(--border)',borderRadius:8,background:'var(--surface)',
    color:'var(--text)',fontSize:13,fontFamily:'inherit',width:'100%',boxSizing:'border-box' };
  const submit = ()=>{ setTouched(true); if(missing.length) return; onSubmit&&onSubmit(v); onClose&&onClose(); };
  return <><div className="drawer-backdrop" style={{zIndex:60}} onClick={onClose}/>
    <div role="dialog" style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:61,
      width:460,maxWidth:'92vw',maxHeight:'90vh',overflow:'auto',background:'var(--surface)',border:'1px solid var(--border)',
      borderRadius:14,boxShadow:'0 24px 64px rgba(0,0,0,.28)'}}>
      <div style={{display:'flex',alignItems:'center',gap:11,padding:'17px 20px',borderBottom:'1px solid var(--border-2)'}}>
        <span style={{width:34,height:34,borderRadius:9,background:'var(--accent-soft)',color:'var(--accent)',
          display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name={icon} size={17}/></span>
        <div style={{flex:1,fontWeight:700,fontSize:15}}>{title}</div>
        <button className="iconbtn" onClick={onClose}><Icon name="x" size={18}/></button>
      </div>
      <div style={{padding:20,display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        {fields.map(f=><div key={f.key} style={{display:'flex',flexDirection:'column',gap:5,gridColumn:f.wide?'1 / -1':'auto'}}>
          <span style={{fontSize:11.5,fontWeight:600,color:'var(--muted)',letterSpacing:'.02em'}}>{f.label.toUpperCase()}{f.required&&<span style={{color:'var(--accent)'}}> *</span>}</span>
          {f.type==='select'
            ? <select style={inp} value={v[f.key]} onChange={e=>set(f.key,e.target.value)}>{f.options.map(o=><option key={o} value={o}>{o}</option>)}</select>
            : f.type==='employee'
            ? <EmployeePicker value={v[f.key]} onPick={emp=>pickEmp(f,emp)}/>
            : f.type==='textarea'
            ? <textarea style={{...inp,minHeight:62,resize:'vertical'}} value={v[f.key]} placeholder={f.placeholder||''} onChange={e=>set(f.key,e.target.value)}/>
            : f.type==='checkbox'
            ? <label style={{display:'flex',gap:8,alignItems:'center',fontSize:13,cursor:'pointer'}}><input type="checkbox" checked={!!v[f.key]} onChange={e=>set(f.key,e.target.checked)}/>{f.hint||'Yes'}</label>
            : <input type={f.type==='date'?'date':'text'} style={inp} value={v[f.key]} placeholder={f.placeholder||''} onChange={e=>set(f.key,e.target.value)}/>}
          {touched && missing.includes(f.key) && <span style={{fontSize:11,color:'var(--red)'}}>Required</span>}
        </div>)}
      </div>
      <div style={{display:'flex',gap:8,justifyContent:'flex-end',padding:'14px 20px',borderTop:'1px solid var(--border-2)'}}>
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" onClick={submit}><Icon name="check" size={15}/>{submitLabel}</button>
      </div>
    </div></>;
}

// Secure export modal — output is delivered ONLY to the user's verified email, never
// downloaded to the device (confidentiality control). Used for organogram + audit exports.
function EmailExportModal({ title='Export & email', subject, email='', formats=['PDF','PNG image','SVG (vector)','Excel (XLSX)','PowerPoint','Visio (VSDX)'], note, onSend, onClose }){
  const [fmt,setFmt] = React.useState(formats[0]);
  const [sent,setSent] = React.useState(false);
  const send = ()=>{ setSent(true); onSend&&onSend(fmt); setTimeout(()=>{ onClose&&onClose(); }, 1300); };
  const chip = (active)=>({ padding:'9px 12px', borderRadius:9, fontSize:12.5, fontWeight:600, cursor:'pointer',
    border:'1px solid '+(active?'var(--accent)':'var(--border)'), background:active?'var(--accent-soft)':'var(--surface)',
    color:active?'var(--accent)':'var(--text)', fontFamily:'inherit' });
  return <><div className="drawer-backdrop" style={{zIndex:60}} onClick={onClose}/>
    <div role="dialog" style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:61,
      width:460,maxWidth:'92vw',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:14,boxShadow:'0 24px 64px rgba(0,0,0,.28)'}}>
      <div style={{display:'flex',alignItems:'center',gap:11,padding:'17px 20px',borderBottom:'1px solid var(--border-2)'}}>
        <span style={{width:34,height:34,borderRadius:9,background:'var(--accent-soft)',color:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="download" size={17}/></span>
        <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15}}>{title}</div>{subject&&<div className="muted" style={{fontSize:12}}>{subject}</div>}</div>
        <button className="iconbtn" onClick={onClose}><Icon name="x" size={18}/></button>
      </div>
      {sent
        ? <div style={{padding:'34px 20px',textAlign:'center'}}>
            <span style={{width:46,height:46,borderRadius:'50%',background:'var(--green-soft)',color:'var(--green)',display:'inline-flex',alignItems:'center',justifyContent:'center'}}><Icon name="check" size={24}/></span>
            <div style={{fontWeight:700,fontSize:15,marginTop:12}}>Sent as {fmt}</div>
            <div className="muted" style={{fontSize:12.5,marginTop:3}}>Delivered to <b style={{color:'var(--text)'}}>{email}</b> · logged to the audit trail.</div>
          </div>
        : <><div style={{padding:'18px 20px'}}>
            <div style={{fontSize:11.5,fontWeight:600,color:'var(--muted)',letterSpacing:'.03em',marginBottom:9}}>FORMAT</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>{formats.map(f=><button key={f} style={chip(fmt===f)} onClick={()=>setFmt(f)}>{f}</button>)}</div>
            <div style={{marginTop:16,display:'flex',gap:10,alignItems:'flex-start',padding:'12px 13px',borderRadius:10,background:'var(--surface-2)'}}>
              <Icon name="lock" size={16} style={{color:'var(--accent)',flexShrink:0,marginTop:1}}/>
              <div style={{fontSize:12.5,color:'var(--muted)',lineHeight:1.5}}>
                Delivered <b style={{color:'var(--text)'}}>strictly to your verified address</b><br/>
                <span className="num" style={{color:'var(--text)',fontWeight:600}}>{email||'—'}</span><br/>
                {note||'Not downloaded to this device — sent only to your registered email. Every export is recorded in the audit trail.'}
              </div>
            </div>
          </div>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end',padding:'14px 20px',borderTop:'1px solid var(--border-2)'}}>
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn primary" onClick={send} disabled={!email}><Icon name="logout" size={15}/>Email to me</button>
          </div></>}
    </div></>;
}

// WhatsApp-style smart auto-crop: center-cover crop any image to a precise square
// (so it always fills a circular avatar cleanly, no distortion). Returns a JPEG data URL.
function cropImageToSquare(file, size=320){
  return new Promise((resolve,reject)=>{
    if(!file){ reject(new Error('no file')); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = ()=>{
      const s = Math.min(img.width, img.height);          // largest centered square
      const sx = (img.width - s)/2, sy = (img.height - s)/2;
      const c = document.createElement('canvas'); c.width = c.height = size;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);  // cover crop
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = ()=>{ URL.revokeObjectURL(url); reject(new Error('image load failed')); };
    img.src = url;
  });
}

Object.assign(window, { Icon, Avatar, RowName, Tag, Card, CardH, KPI, HBar, Ring, SecH, FormModal, EmailExportModal, EmployeePicker, colorFor, initials, cropImageToSquare, DialogHost });

// ── Branded system dialog (replaces native prompt/confirm so pop-ups stay on-design) ──
// ── Excel-like table utilities: CSV export + pagination (keeps long lists clear as data grows) ──
window.exportCSV = function(filename, headers, rows){
  const esc = v => '"'+String(v==null?'':v).replace(/"/g,'""')+'"';
  const csv = [headers.map(esc).join(',')].concat(rows.map(r=>r.map(esc).join(','))).join('\r\n');
  const blob = new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),500);
};
function Pager({ page, pageSize, total, onPage }){
  const pages = Math.max(1, Math.ceil(total/pageSize));
  if(total<=pageSize) return null;
  const from = total?(page*pageSize+1):0, to = Math.min(total,(page+1)*pageSize);
  return <div className="pager">
    <span className="pager-info">{from}–{to} of {total}</span>
    <div className="pager-btns">
      <button className="pgb" disabled={page<=0} onClick={()=>onPage(0)} title="First">«</button>
      <button className="pgb" disabled={page<=0} onClick={()=>onPage(page-1)} title="Previous"><Icon name="chevR" size={13} style={{transform:'rotate(180deg)'}}/></button>
      <span className="pager-pg">{page+1} / {pages}</span>
      <button className="pgb" disabled={page>=pages-1} onClick={()=>onPage(page+1)} title="Next"><Icon name="chevR" size={13}/></button>
      <button className="pgb" disabled={page>=pages-1} onClick={()=>onPage(pages-1)} title="Last">»</button>
    </div>
  </div>;
}
window.Pager = Pager;
window.usePager = function(list, size=10){
  const [page,setPage] = React.useState(0);
  const total = list.length, pages = Math.max(1, Math.ceil(total/size)), p = Math.min(page, pages-1);
  const rows = list.slice(p*size, (p+1)*size);
  React.useEffect(()=>{ if(page>pages-1) setPage(0); }, [total]);
  return [rows, <Pager key="pg" page={p} pageSize={size} total={total} onPage={setPage}/>, p];
};

const __dialogListeners = new Set();
window.uiDialog = function(opts){ return new Promise(function(resolve){ __dialogListeners.forEach(function(fn){ fn(opts||{}, resolve); }); }); };
function DialogHost(){
  const [d,setD] = React.useState(null);
  const [val,setVal] = React.useState('');
  React.useEffect(()=>{ const fn=(opts,resolve)=>{ setVal(opts.default||''); setD({opts,resolve}); }; __dialogListeners.add(fn); return ()=>__dialogListeners.delete(fn); },[]);
  if(!d) return null;
  const o=d.opts, close=(r)=>{ d.resolve(r); setD(null); };
  const inp={padding:'10px 12px',border:'1px solid var(--border)',borderRadius:8,background:'var(--surface)',color:'var(--text)',fontSize:14,fontFamily:'inherit',width:'100%',boxSizing:'border-box',marginTop:12};
  return <><div className="drawer-backdrop" style={{zIndex:120}} onClick={()=>close(null)}></div>
    <div role="dialog" style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:121,width:382,maxWidth:'92vw',
      background:'var(--surface)',border:'1px solid var(--border)',borderRadius:14,boxShadow:'0 24px 64px rgba(0,0,0,.3)',overflow:'hidden'}}>
      <div style={{padding:'18px 20px 16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{width:34,height:34,borderRadius:9,flexShrink:0,background:o.danger?'var(--red-soft)':'var(--accent-soft)',color:o.danger?'var(--red)':'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name={o.icon||(o.danger?'alert':'shield')} size={17}/></span>
          <div style={{fontWeight:700,fontSize:15}}>{o.title||'Confirm'}</div>
        </div>
        {o.message&&<div style={{fontSize:13,color:'var(--muted)',lineHeight:1.5,marginTop:9}}>{o.message}</div>}
        {o.input&&<input autoFocus style={inp} value={val} placeholder={o.placeholder||''} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&close(o.input?val:true)}/>}
      </div>
      <div style={{display:'flex',gap:8,justifyContent:'flex-end',padding:'12px 20px',borderTop:'1px solid var(--border-2)',background:'var(--surface-2)'}}>
        <button className="btn ghost" onClick={()=>close(null)}>{o.cancelLabel||'Cancel'}</button>
        <button className="btn primary" style={o.danger?{background:'var(--red)',borderColor:'var(--red)',color:'#fff'}:null} onClick={()=>close(o.input?val:true)}>{o.confirmLabel||'Confirm'}</button>
      </div>
    </div></>;
}
