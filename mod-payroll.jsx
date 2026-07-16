// Module: Payroll (Tanzania statutory)
function Payroll({ role }){
  const st = useHStore();
  const m = HStore.metrics();
  const p = PAYROLL;
  const totalStat = p.statutory.reduce((a,s)=>a+s.amount,0);
  const totalDed = Object.values(p.deductions).reduce((a,b)=>a+b,0);
  const editable = !role.readonly;
  // ── live inputs from the attendance & leave chain ──
  const OT_RATE = 18000, DAY_RATE = 72000;
  const otHours = (typeof TOTAL_OT!=='undefined'?TOTAL_OT:0);
  const otCost = otHours*OT_RATE;
  const approvedLeave = st.leave.filter(l=>l.status==='Approved');
  const paidLeaveDays = approvedLeave.filter(l=>!/unpaid/i.test(l.type)).reduce((a,l)=>a+(l.days||0),0);
  const unpaidDays = approvedLeave.filter(l=>/unpaid/i.test(l.type)).reduce((a,l)=>a+(l.days||0),0);
  const unpaidDeduction = unpaidDays*DAY_RATE;
  const liveGross = p.gross + otCost - unpaidDeduction;
  return <div className="grid" style={{gap:16}}>
    <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(178px,1fr))'}}>
      <KPI icon="money" label="Gross pay" value={TZSm(p.gross)} sub={p.cycle+' · 1,061 staff'} trend="+1.8%" trendDir="up"/>
      <KPI icon="money" label="Net pay" value={TZSm(p.net)} sub="after statutory & deductions"/>
      <KPI icon="shield" label="Statutory total" value={TZSm(totalStat)} sub="NSSF · PAYE · SDL · WCF"/>
      <KPI icon="doc" label="Other deductions" value={TZSm(totalDed)} sub="advances · union · other"/>
      <KPI icon="clock" label="Run date" value={p.runDate} sub={p.status}/>
    </div>

    <Card>
      <CardH title="Payroll inputs — from attendance & leave" icon="clock" meta="live · feeds the Exact hand-off"
        action={editable && <button className="btn sm primary" style={{marginLeft:'auto'}} onClick={()=>toast('Recalculated from attendance · gross '+TZSm(liveGross))}><Icon name="swap" size={13}/>Recalculate from attendance</button>}/>
      <div className="card-p" style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12}}>
        {[['Headcount on payroll',m.headcount.toLocaleString(), m.newHires?('+'+m.newHires+' new'):'reconciled','users'],
          ['Overtime (MTD)',otHours.toLocaleString()+' hrs', TZSm(otCost)+' cost','trend'],
          ['Paid leave',paidLeaveDays+' days', 'approved this cycle','calendar'],
          ['Unpaid leave',unpaidDays+' days', '−'+TZSm(unpaidDeduction),'money'],
          ['Pending approvals',m.pendingLeave, 'before cut-off','check']].map((s,i)=>
          <div key={i} style={{padding:'11px 12px',borderRadius:9,background:'var(--surface-2)'}}>
            <div style={{display:'flex',alignItems:'center',gap:6,color:'var(--muted)',fontSize:11.5}}><Icon name={s[3]} size={13} style={{color:'var(--accent)'}}/>{s[0]}</div>
            <div className="num" style={{fontSize:18,fontWeight:700,margin:'3px 0'}}>{s[1]}</div>
            <div className="muted" style={{fontSize:11}}>{s[2]}</div></div>)}
      </div>
      <div style={{padding:'11px 20px',borderTop:'1px solid var(--border-2)',display:'flex',alignItems:'center',gap:8,fontSize:13}}>
        <Icon name="swap" size={14} style={{color:'var(--accent)'}}/><span className="muted">Computed gross = base + overtime − unpaid leave</span>
        <span className="num" style={{marginLeft:'auto',fontWeight:700,color:'var(--accent)'}}>{TZS(liveGross)}</span></div>
    </Card>

    <div className="grid" style={{gridTemplateColumns:'1.3fr 1fr'}}>
      <Card>
        <CardH title="Statutory contributions — Tanzania" icon="shield" meta={p.cycle}/>
        <table className="tbl"><thead><tr><th>Code</th><th>Contribution</th><th>Rate</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>{p.statutory.map((s,i)=><tr key={i}>
            <td><Tag tone={s.tone}>{s.code}</Tag></td>
            <td className="name">{s.label}</td>
            <td className="muted num">{s.rate}</td>
            <td className="num" style={{fontWeight:600}}>{TZS(s.amount)}</td>
            <td>{s.tone==='green'?<Tag tone="green" dot>Ready</Tag>:<Tag tone="yellow" dot>Review</Tag>}</td>
          </tr>)}</tbody></table>
        <div style={{padding:'11px 20px',borderTop:'1px solid var(--border-2)',display:'flex',alignItems:'center',fontSize:13}}>
          <span className="muted">Total statutory remittance</span>
          <span className="num" style={{marginLeft:'auto',fontWeight:700}}>{TZS(totalStat)}</span></div>
      </Card>

      <div className="grid" style={{gap:16}}>
        <Card>
          <CardH title="Payslip status" icon="doc" meta="secure delivery only"/>
          <div className="card-p" style={{display:'flex',flexDirection:'column',gap:11}}>
            {p.payslipStatus.map((s,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:9,fontSize:13}}>
              <span className="dotbadge" style={{background:['var(--green)','var(--yellow)','var(--red)'][i]}}/>
              <span className="muted">{s.label}</span><span className="num" style={{marginLeft:'auto',fontWeight:600}}>{s.n}</span></div>)}
            <div style={{fontSize:11.5,color:'var(--faint)',marginTop:2,display:'flex',gap:7,alignItems:'center'}}>
              <Icon name="lock" size={13}/>Open printing is a confidentiality breach — payslips are delivered in-app only.</div>
          </div>
        </Card>
        <Card>
          <CardH title="Hand-off to Exact" icon="swap"/>
          <div className="card-p" style={{display:'flex',flexDirection:'column',gap:10}}>
            <div style={{display:'flex',alignItems:'center',gap:9,fontSize:13}}><Icon name="check" size={15} style={{color:'var(--green)'}}/>Inputs reconciled to HR master</div>
            <div style={{display:'flex',alignItems:'center',gap:9,fontSize:13}}><Icon name="clock" size={15} style={{color:'var(--yellow)'}}/>Awaiting Finance sign-off</div>
            <div style={{display:'flex',gap:8,marginTop:6}}>
              {editable && <button className="btn primary sm" onClick={()=>toast('Payroll posted to Exact')}><Icon name="download" size={13}/>Post to Exact</button>}
              <button className="btn sm ghost">View mapping</button></div>
          </div>
        </Card>
      </div>
    </div>
  </div>;
}
window.Payroll = Payroll;
