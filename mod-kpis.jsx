// Module: KPI Scorecard — HR metrics aligned to the signed-in role's practical remit.
// All % values are computed live from real data points via kpiValues() (kpi-data.jsx).
function KpiCard({ k }){
  if(!k) return null;
  const st = kpiStatus(k);
  const tone = { green:'green', amber:'yellow', red:'red', neutral:'grey' }[st];
  const dotColor = { green:'var(--green)', amber:'var(--yellow)', red:'var(--red)', neutral:'var(--faint)' }[st];
  const barColor = { green:'var(--green)', amber:'var(--yellow)', red:'var(--red)', neutral:'var(--faint)' }[st];
  const showBar = k.unit==='%';
  const fill = showBar ? Math.max(2, Math.min(100, k.v)) : 0;
  const tickAt = (k.dir==='band') ? null : (showBar ? Math.min(100, k.t) : null);
  const statusLabel = { green:'On target', amber:'Watch', red:'Off target', neutral:'Tracking' }[st];
  return <Card className="card-p kcard">
    <div className="kh">
      <span className="kic"><Icon name={k.icon||'chart'} size={15}/></span>
      <div style={{flex:1,minWidth:0}}>
        <div className="knm">{k.name}</div>
        <div className="kfo">{k.formula}</div>
      </div>
      <span className="kdot" style={{background:dotColor}} title={statusLabel}></span>
    </div>
    <div className="kvrow">
      <div className="kv">{k.value}{k.sub&&<small className="ksub"> {k.sub}</small>}</div>
      <Tag tone={tone} dot>{statusLabel}</Tag>
    </div>
    {showBar
      ? <div className="ktrack"><i style={{width:fill+'%',background:barColor}}></i>
          {tickAt!=null && <span className="kmark" style={{left:tickAt+'%'}} title={'Target '+k.target}></span>}
          {k.dir==='band' && <><span className="kmark" style={{left:Math.min(100,k.band[0])+'%'}}></span><span className="kmark" style={{left:Math.min(100,k.band[1])+'%'}}></span></>}
        </div>
      : <div className="kbarless"></div>}
    <div className="ktgt"><span className="ktl">Target</span><span className="ktv">{k.target}</span></div>
  </Card>;
}

function KPIScorecard({ role }){
  useHStore(); // re-compute when store-driven KPIs (disciplinary, online leave, headcount) change
  const VAL = (typeof kpiValues==='function') ? kpiValues() : {};
  const ids = (ROLE_KPIS[role.id] || []);
  const merged = {};
  const list = ids.map(id=>{ const k={ id, ...KPIS[id], ...(VAL[id]||{}) }; merged[id]=k; return k; }).filter(k=>k.name);
  const scored = list.filter(k=>kpiStatus(k)!=='neutral');
  const counts = { green:0, amber:0, red:0 };
  scored.forEach(k=>{ counts[kpiStatus(k)]++; });
  const total = scored.length;
  const onTargetPct = total ? Math.round(counts.green/total*100) : 0;

  // group by category, preserving the workbook order
  const byCat = {};
  list.forEach(k=>{ (byCat[k.cat] = byCat[k.cat]||[]).push(k.id); });
  const cats = KPI_CAT_ORDER.filter(c=>byCat[c]);

  return <div className="grid" style={{gap:16}}>
    <div className="grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
      <KPI icon="chart" label="KPIs in your scorecard" value={list.length} sub={ROLE_KPI_SCOPE(role)}/>
      <KPI icon="check" label="On target" value={counts.green} sub={total?onTargetPct+'% of measured':'—'} trend={total?onTargetPct+'%':null} trendDir="up"/>
      <KPI icon="clock" label="Watch" value={counts.amber} sub="within 10% of target"/>
      <KPI icon="alert" label="Off target" value={counts.red} sub="needs action" trend={counts.red?'action':null} trendDir="dn"/>
    </div>

    <Card className="card-p" style={{padding:'13px 18px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
      <Icon name="award" size={16} style={{color:'var(--accent)'}}/>
      <b style={{fontSize:13}}>{role.title}</b>
      <span className="muted" style={{fontSize:12.5}}>· performance measured against annual targets — distinct from your live Workforce Overview</span>
      <span className="kleg" style={{marginLeft:'auto'}}>
        <span><span className="kdot" style={{background:'var(--green)'}}></span>On target</span>
        <span><span className="kdot" style={{background:'var(--yellow)'}}></span>Watch</span>
        <span><span className="kdot" style={{background:'var(--red)'}}></span>Off target</span>
      </span>
    </Card>

    {cats.map(cat=><div key={cat}>
      <SecH>{cat}</SecH>
      <div className="kpi-grid">{byCat[cat].map(id=><KpiCard key={id} k={merged[id]}/>)}</div>
    </div>)}
  </div>;
}
window.KPIScorecard = KPIScorecard;
