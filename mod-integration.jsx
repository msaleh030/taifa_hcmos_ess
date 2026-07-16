// Module: Integration — HR → Exact hand-off & statutory checks
function Integration({ canMoney }){
  const st = useHStore();
  const m = HStore.metrics();
  const checks = [
    { label:'NSSF (social security)',     status:'Matched', count:'1,077 / 1,077', tone:'green' },
    { label:'PAYE (income tax)',          status:'Matched', count:'1,077 / 1,077', tone:'green' },
    { label:'WCF (workers comp.)',        status:'Matched', count:'1,077 / 1,077', tone:'green' },
    { label:'TIN registration',           status:'3 missing', count:'1,074 / 1,077', tone:'yellow' },
    { label:'Bank details for transfer',  status:'Matched', count:'1,077 / 1,077', tone:'green' },
    { label:'Statutory deductions cap',   status:'1 review', count:'1,076 / 1,077', tone:'yellow' },
  ];
  const liveMoves = [
    ...st.newHires.map(e=>({ type:'Joiner', name:e.name, no:e.no, site:e.site, note:'New joiner · awaiting NSSF/TIN registration' })),
    ...st.leave.filter(l=>l.status==='Approved').slice(0,3).map(l=>({ type:'Change', name:l.who, no:l.no, site:l.site, note:`${l.type} leave approved · ${l.days}d · payroll noted` })),
  ];
  const movements = [...liveMoves,
    { type:'Joiner',  name:'Fatuma Ally',   no:'TMC-05533', site:'Nyanzaga', note:'Onboarding complete · NSSF registered' },
    { type:'Joiner',  name:'Neema Joseph',  no:'TMC-05290', site:'Nyanzaga', note:'Awaiting TIN · flagged to Finance' },
    { type:'Leaver',  name:'Peter Komba',   no:'TMC-02210', site:'Mwadui',   note:'Suspended · payroll hold applied' },
    { type:'Change',  name:'Samuel Mlay',   no:'TMC-04102', site:'Dar Yard', note:'Grade G9 · allowance update' },
  ];
  return <div className="grid" style={{gap:16}}>
    <div className="grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
      <KPI icon="trend" label="Next hand-off" value="28 Jun" sub="June pay cycle · HR → Exact"/>
      <KPI icon="users" label="Records in file" value={m.headcount.toLocaleString()} sub={'joiners '+(62+m.newHires)+' · leavers 19'}/>
      {canMoney
        ? <KPI icon="money" label="Wage bill (Jun)" value={TZSm(TOTAL_WAGE)} sub="for Exact processing" trend="+1.8%" trendDir="up"/>
        : <KPI icon="shield" label="Statutory checks" value="4 / 6" sub="2 items need review"/>}
      <KPI icon="check" label="Last hand-off" value="Clean" sub="May cycle · 0 rejects" trend="reconciled" trendDir="up"/>
    </div>

    <div className="grid" style={{gridTemplateColumns:'1fr 1fr'}}>
      <Card>
        <CardH title="HR → Exact hand-off" icon="trend" meta="REQ-027 · each pay cycle"/>
        <div className="card-p">
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16}}>
            <div className="intg-node">HCWOS<span>HR master</span></div>
            <div className="intg-flow"><div className="intg-line"/><span className="intg-pkt"/><div className="intg-cap num">Clean HR file</div></div>
            <div className="intg-node alt">Exact<span>Payroll</span></div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:9}}>
            {[['Extract approved HR data','done'],['Validate against statutory rules','done'],
              ['Generate agreed Exact file','done'],['Finance review & sign-off','pending'],['Post to Exact payroll','queued']].map((s,i)=>
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,fontSize:13}}>
                <span style={{width:18,height:18,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',
                  background:s[1]==='done'?'var(--green)':s[1]==='pending'?'var(--yellow)':'var(--surface-2)',
                  color:s[1]==='queued'?'var(--faint)':'#fff'}}>
                  {s[1]==='done'?<Icon name="check" size={12}/>:<span style={{fontSize:10,fontWeight:700}}>{i+1}</span>}</span>
                <span style={{color:s[1]==='queued'?'var(--faint)':'var(--text)'}}>{s[0]}</span>
                <Tag tone={s[1]==='done'?'green':s[1]==='pending'?'yellow':'grey'} style={{marginLeft:'auto'}}>{s[1]}</Tag></div>)}
          </div>
          <div style={{display:'flex',gap:8,marginTop:16}}>
            <button className="btn primary sm" onClick={()=>toast('Exact hand-off file generated')}><Icon name="download" size={13}/>Generate Exact file</button>
            <button className="btn sm ghost">View mapping</button></div>
        </div>
      </Card>

      <Card>
        <CardH title="Statutory & monthly checks" icon="shield" meta="joiners / leavers"/>
        <div className="card-p">{checks.map((c,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:10,
          padding:'9px 0',borderBottom:i<checks.length-1?'1px solid var(--border-2)':'none'}}>
          <Icon name={c.tone==='green'?'check':'alert'} size={15} style={{color:c.tone==='green'?'var(--green)':'var(--yellow)'}}/>
          <span style={{fontSize:13}}>{c.label}</span>
          <span className="num muted" style={{marginLeft:'auto',fontSize:11.5}}>{c.count}</span>
          <Tag tone={c.tone}>{c.status}</Tag></div>)}</div>
      </Card>
    </div>

    <Card>
      <CardH title="Joiners, leavers & changes — this cycle" icon="users" meta="reconciled to payroll"/>
      <table className="tbl"><thead><tr><th>Type</th><th>Employee</th><th>Site</th><th>Note</th><th></th></tr></thead>
        <tbody>{movements.map((m,i)=><tr key={i}>
          <td><Tag tone={m.type==='Joiner'?'green':m.type==='Leaver'?'red':'blue'}>{m.type}</Tag></td>
          <td><RowName name={m.name} sub={m.no}/></td>
          <td className="muted">{m.site}</td>
          <td className="muted" style={{fontSize:12.5}}>{m.note}</td>
          <td style={{textAlign:'right'}}>{m.note.includes('TIN')?<button className="btn sm">Resolve</button>:<Tag tone="grey">OK</Tag>}</td>
        </tr>)}</tbody></table>
      <div style={{padding:'11px 20px',borderTop:'1px solid var(--border-2)',color:'var(--faint)',fontSize:12,display:'flex',gap:8,alignItems:'center'}}>
        <Icon name="shield" size={14}/>Payroll stays on Exact — HCMOS™ provides a clean, read-only hand-off and analytics only (REQ-028).</div>
    </Card>
  </div>;
}
window.Integration = Integration;
