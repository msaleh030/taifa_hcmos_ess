// Report preview — rearrange blocks (drag), then export to PDF or Excel.
function ReportPreview({ report, period, officialEmail='reports@taifamining.tz', onClose }){
  const [order,setOrder] = React.useState(['summary','table','chart','notes']);
  const [fmt,setFmt] = React.useState('PDF');
  const drag = React.useRef(null);
  const onDrop = (i) => { const from=drag.current; if(from===null||from===i) return;
    setOrder(o=>{ const n=[...o]; const [m]=n.splice(from,1); n.splice(i,0,m); return n; }); drag.current=null; };

  const tableHead = ['Site','Headcount','On leave','Overtime (hrs)','Wage (TZS)'];
  const tableRows = SITES.map(s=>[s.name, s.hc, s.onLeave, s.ot, s.wage]);

  const exportExcel = () => {
    const csv = [tableHead, ...tableRows.map(r=>r.map((v,i)=>i===4?v:v))]
      .map(r=>r.map(c=>`"${c}"`).join(',')).join('\n');
    const blob = new Blob([`HCWOS — ${report.name} (${period} · ${new Date().toLocaleDateString()})\n`+csv],{type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download = `${report.name} — ${period}.csv`; a.click(); URL.revokeObjectURL(a.href);
  };
  const exportPDF = () => {
    document.body.classList.add('report-printing');
    window.print();
    setTimeout(()=>document.body.classList.remove('report-printing'), 600);
  };

  const deliver = () => {
    if(fmt==='PDF') exportPDF(); else exportExcel();
    toast(`${report.name} (${fmt}) sent to ${officialEmail}`,'check');
  };

  const blocks = {
    summary: <div className="rp-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
      {[['Total headcount',TOTAL_HC.toLocaleString(),'users'],['On leave',TOTAL_ONLEAVE,'calendar'],['Overtime (MTD)',TOTAL_OT.toLocaleString()+' hrs','trend']].map((k,i)=>
        <div key={i} className="rp-kpi"><div className="rp-kpi-l"><Icon name={k[2]} size={14}/>{k[0]}</div>
          <div className="num rp-kpi-v">{k[1]}</div></div>)}</div>,
    table: <table className="tbl rp-tbl"><thead><tr>{tableHead.map(h=><th key={h}>{h}</th>)}</tr></thead>
      <tbody>{tableRows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j} className={j?'num':'name'}>{j===4?TZS(c):c}</td>)}</tr>)}
        <tr style={{fontWeight:700}}><td>Total</td><td className="num">{TOTAL_HC}</td><td className="num">{TOTAL_ONLEAVE}</td>
          <td className="num">{TOTAL_OT}</td><td className="num">{TZS(TOTAL_WAGE)}</td></tr></tbody></table>,
    chart: <div style={{padding:'4px 2px'}}>{SITES.map((s,i)=><HBar key={i} label={s.name} value={s.hc} max={Math.max(...SITES.map(x=>x.hc))} color="var(--green)" suffix={s.hc}/>)}</div>,
    notes: <div className="rp-notes">Prepared from the HCWOS single source of truth. Figures reconcile to the HR → Exact
      hand-off for the period. Standard field set enforced (REQ-049). Confidential — distribute per role-based access.</div>,
  };
  const titles = { summary:'Summary KPIs', table:'Data table', chart:'Headcount breakdown', notes:'Notes' };

  return <>
    <div className="drawer-backdrop" onClick={onClose}/>
    <div className="rp-modal report-print">
      <div className="rp-head">
        <span style={{width:34,height:34,borderRadius:8,background:'var(--accent-soft)',color:'var(--accent)',
          display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Icon name={report.icon} size={17}/></span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:700,fontSize:16}}>{report.name}</div>
          <div className="muted" style={{fontSize:12}}>{period} · Taifa Mining & Civil · {new Date().toLocaleDateString()}</div>
        </div>
        <div className="rp-actions">
          <button className="btn sm" onClick={exportExcel}><Icon name="download" size={13}/>Excel</button>
          <button className="btn sm" onClick={exportPDF}><Icon name="download" size={13}/>PDF</button>
          <button className="iconbtn" onClick={onClose}><Icon name="x" size={18}/></button>
        </div>
      </div>
      <div className="rp-deliver">
        <Icon name="lock" size={14} style={{color:'var(--accent)'}}/>
        <span style={{fontSize:12.5,fontWeight:600}}>Deliver report</span>
        <div style={{display:'flex',gap:3,marginLeft:6}}>
          {['PDF','Excel','CSV'].map(f=><button key={f} className={'btn sm '+(fmt===f?'primary':'ghost')} onClick={()=>setFmt(f)}>{f}</button>)}
        </div>
        <span style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:7,fontSize:12,color:'var(--muted)'}}>
          <Icon name="users" size={13}/>to <b className="num" style={{color:'var(--text)'}}>{officialEmail}</b>
          <span className="ro-lock"><Icon name="lock" size={11}/>official only</span></span>
        <button className="btn sm primary" onClick={deliver}><Icon name="swap" size={13}/>Send</button>
      </div>
      <div className="rp-hint rp-actions"><Icon name="swap" size={13}/>Drag blocks to rearrange, then export to PDF or Excel.</div>
      <div className="rp-body">
        {order.map((id,i)=><div key={id} className="rp-block" draggable
          onDragStart={()=>drag.current=i} onDragOver={e=>e.preventDefault()} onDrop={()=>onDrop(i)}>
          <div className="rp-block-h"><span className="rp-handle"><Icon name="grid" size={13}/></span>{titles[id]}</div>
          <div className="rp-block-b">{blocks[id]}</div>
        </div>)}
      </div>
    </div>
  </>;
}
window.ReportPreview = ReportPreview;
