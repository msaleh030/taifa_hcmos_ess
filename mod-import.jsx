// Module: Data Migration — opening-balances import for go-live.
// Each dataset has a strict column spec (structure mapping) and per-cell + cross-field
// sanity checks. Flow per dataset: download template → upload CSV (or load sample) →
// validate → import only clean rows. Errors block; warnings inform.
(function(){
  const SITES_LIST = (typeof SITES!=='undefined'?SITES.map(s=>s.name):['Mwadui','Nyanzaga','Dar Yard','North Mara','Geita Civil']);
  const ROLE_IDS = (typeof ROLES!=='undefined'?ROLES.map(r=>r.id):[]);
  const TODAY = '2026-06-24';
  // ── validators ──
  const isDate = v => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v));
  const isNum = v => v!=='' && !isNaN(+v);
  const digits = (v,n) => new RegExp('^\\d{'+n+'}$').test(String(v).replace(/\D/g,''));
  const enumOf = arr => v => arr.includes(v);
  const req = v => v!==undefined && String(v).trim()!=='';

  const DS = [
    { id:'employee_master', name:'Employee master', icon:'users', format:'Excel (one row per employee)',
      provide:'All active staff core identity, posting and contact data.',
      cols:[
        {k:'empNo',label:'Employee no.',req:true,unique:true,check:v=>/^TMCL-/.test(v)?null:'must start TMCL-'},
        {k:'firstName',label:'First name',req:true},
        {k:'lastName',label:'Last name',req:true},
        {k:'gender',label:'Gender',req:true,check:v=>['M','F','Male','Female'].includes(v)?null:'M/F'},
        {k:'dob',label:'DOB',req:true,check:v=>isDate(v)?null:'YYYY-MM-DD'},
        {k:'nida',label:'NIDA',req:true,check:v=>digits(v,20)?null:'20 digits'},
        {k:'tin',label:'TIN',req:true,check:v=>digits(v,9)?null:'9 digits'},
        {k:'nssf',label:'NSSF no.',req:true},
        {k:'site',label:'Site',req:true,check:v=>SITES_LIST.includes(v)?null:'unknown site'},
        {k:'department',label:'Department',req:true},
        {k:'position',label:'Position',req:true},
        {k:'grade',label:'Grade',req:true,check:v=>/^G\d{1,2}$/.test(v)?null:'G#'},
        {k:'lineManager',label:'Line manager',req:false},
        {k:'employmentType',label:'Employment type',req:true,check:v=>['Permanent','Fixed-term','Temporary','Expatriate'].includes(v)?null:'Permanent/Fixed-term/Temporary/Expatriate'},
        {k:'hireDate',label:'Hire date',req:true,check:v=>!isDate(v)?'YYYY-MM-DD':(v>TODAY?'future date':null)},
        {k:'contact',label:'Contact',req:true,check:v=>/\d{6,}/.test(v)?null:'phone'},
        {k:'nextOfKin',label:'Next of kin',req:true},
      ] },
    { id:'leave_balances', name:'Leave balances', icon:'calendar', format:'Excel',
      provide:'Outstanding annual & sick days as at 30 Jun 2026, days taken and rotation.',
      cols:[
        {k:'empNo',label:'Employee no.',req:true,check:v=>/^TMCL-/.test(v)?null:'TMCL-'},
        {k:'annualDays',label:'Annual balance',req:true,check:v=>!isNum(v)?'number':(+v<0?'negative':(+v>60?'> cap 60':null))},
        {k:'sickDays',label:'Sick balance',req:true,check:v=>!isNum(v)?'number':(+v<0?'negative':(+v>126?'> 126':null))},
        {k:'daysTaken',label:'Days taken (YTD)',req:true,check:v=>isNum(v)&&+v>=0?null:'number ≥0'},
        {k:'rotation',label:'Rotation',req:true,check:enumOf(['7x7x7','8-on-2-off','9-on-3-off','8/2','9/3','Standard'])?null:null},
      ],
      colsFix:true },
    { id:'carry_over', name:'Carry-over', icon:'clock', format:'Excel',
      provide:'Brought-forward leave and the year it was earned (two-year cap).',
      cols:[
        {k:'empNo',label:'Employee no.',req:true,check:v=>/^TMCL-/.test(v)?null:'TMCL-'},
        {k:'days',label:'Carry-over days',req:true,check:v=>!isNum(v)?'number':(+v<0?'negative':(+v>30?'> cap 30':null))},
        {k:'yearEarned',label:'Year earned',req:true,check:v=>!/^\d{4}$/.test(v)?'YYYY':(+v<2024?'beyond 2-yr cap':(+v>2026?'future':null))},
      ] },
    { id:'contracts', name:'Contracts', icon:'doc', format:'Excel + scans',
      provide:'Active contract per employee with start and end dates.',
      cols:[
        {k:'empNo',label:'Employee no.',req:true,check:v=>/^TMCL-/.test(v)?null:'TMCL-'},
        {k:'type',label:'Contract type',req:true},
        {k:'startDate',label:'Start',req:true,check:v=>isDate(v)?null:'YYYY-MM-DD'},
        {k:'endDate',label:'End',req:true,check:v=>isDate(v)?null:'YYYY-MM-DD'},
      ],
      rowCheck:r=>(isDate(r.startDate)&&isDate(r.endDate)&&r.endDate<=r.startDate)?{col:'endDate',msg:'end ≤ start'}:null },
    { id:'permits_certs', name:'Permits / licences / certificates', icon:'shield', format:'Excel + scans',
      provide:'Operator licences, OSHA medicals, work permits — with expiry (drive alerts).',
      cols:[
        {k:'empNo',label:'Employee no.',req:true,check:v=>/^TMCL-/.test(v)?null:'TMCL-'},
        {k:'docType',label:'Document type',req:true,check:v=>['Operator licence','OSHA medical','Work permit','Driving licence'].includes(v)?null:'licence/medical/permit'},
        {k:'number',label:'Number',req:false},
        {k:'expiryDate',label:'Expiry',req:true,check:v=>isDate(v)?null:'YYYY-MM-DD'},
      ],
      rowWarn:r=>(isDate(r.expiryDate)&&r.expiryDate<TODAY)?{col:'expiryDate',msg:'already expired'}:null },
    { id:'disciplinary', name:'Disciplinary', icon:'alert', format:'Excel (confidential)',
      provide:'OPEN or ACTIVE disciplinary records only — no closed cases.',
      cols:[
        {k:'empNo',label:'Employee no.',req:true,check:v=>/^TMCL-/.test(v)?null:'TMCL-'},
        {k:'caseRef',label:'Case ref',req:true},
        {k:'type',label:'Type',req:true,check:v=>['Verbal warning','Written warning','Final warning','Suspension'].includes(v)?null:'verbal/written/final/suspension'},
        {k:'status',label:'Status',req:true,check:v=>['Open','Active'].includes(v)?null:'open/active only'},
        {k:'dateOpened',label:'Opened',req:true,check:v=>isDate(v)?null:'YYYY-MM-DD'},
      ] },
    { id:'org_structure', name:'Organisation structure', icon:'building', format:'Excel',
      provide:'Sites, departments, positions, reporting lines, cost centres.',
      cols:[
        {k:'site',label:'Site',req:true,check:v=>SITES_LIST.includes(v)?null:'unknown site'},
        {k:'department',label:'Department',req:true},
        {k:'position',label:'Position',req:true},
        {k:'headcount',label:'Headcount',req:true,check:v=>isNum(v)&&+v>=0?null:'number ≥0'},
        {k:'reportsTo',label:'Reports to',req:false},
        {k:'costCentre',label:'Cost centre',req:true},
      ] },
    { id:'salary_grades', name:'Salary grades', icon:'chart', format:'Excel (grading only)',
      provide:'Grade / scale structure — grading only; pay stays in Exact.',
      cols:[
        {k:'grade',label:'Grade',req:true,unique:true,check:v=>/^G\d{1,2}$/.test(v)?null:'G#'},
        {k:'band',label:'Band',req:true},
        {k:'scaleMin',label:'Scale min',req:true,check:v=>isNum(v)?null:'number'},
        {k:'scaleMax',label:'Scale max',req:true,check:v=>isNum(v)?null:'number'},
      ],
      rowCheck:r=>(isNum(r.scaleMin)&&isNum(r.scaleMax)&&+r.scaleMax<+r.scaleMin)?{col:'scaleMax',msg:'max < min'}:null },
    { id:'users_roles', name:'Users and roles', icon:'lock', format:'Excel',
      provide:'Named holders of each backend role (for provisioning & licences).',
      cols:[
        {k:'name',label:'Name',req:true},
        {k:'email',label:'Email',req:true,check:v=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)?null:'invalid email'},
        {k:'roleId',label:'Role',req:true,check:v=>ROLE_IDS.length&&!ROLE_IDS.includes(v)?'unknown role id':null},
        {k:'site',label:'Site / scope',req:false},
      ] },
    { id:'personal_files', name:'Personal-file documents', icon:'doc', format:'PDF / images', files:true,
      provide:'Scanned ID, contract and certificates for upload (PDF/JPG/PNG).' },
  ];

  // ── CSV helpers ──
  function toCSV(cols, rows){
    const head = cols.map(c=>c.k).join(',');
    const body = rows.map(r=>cols.map(c=>`"${(r[c.k]??'')}"`).join(',')).join('\n');
    return head + '\n' + body;
  }
  function download(name, text){
    const blob = new Blob([text],{type:'text/csv;charset=utf-8;'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); URL.revokeObjectURL(a.href);
  }
  function parseCSV(text){
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if(!lines.length) return [];
    const head = lines[0].split(',').map(h=>h.replace(/^"|"$/g,'').trim());
    return lines.slice(1).map(line=>{
      const cells = line.match(/("([^"]|"")*"|[^,]*)(,|$)/g)||[];
      const vals = cells.slice(0,head.length).map(c=>c.replace(/,$/,'').replace(/^"|"$/g,'').replace(/""/g,'"').trim());
      const o={}; head.forEach((h,i)=>o[h]=vals[i]??''); return o;
    });
  }

  // ── sample generators (mostly valid + a couple of seeded errors to prove checks) ──
  function sampleFor(ds){
    const E = (typeof EMPLOYEES!=='undefined'?EMPLOYEES:[]).slice(0,6);
    if(ds.id==='employee_master') return E.map((e,i)=>({
      empNo:(window.genEmpNo?genEmpNo(e):e.no), firstName:e.name.split(' ')[0], lastName:e.name.split(' ').slice(1).join(' '),
      gender:i%2?'Male':'Female', dob:'19'+(70+i)+'-04-1'+i, nida:i===2?'1234':('19'+(70+i)+'1010'+String(100000000+i*7).padStart(10,'0')).slice(0,20),
      tin:String(100000000+i).slice(0,9), nssf:'NSSF-'+(200000+i), site:i===4?'Kahama':e.site, department:'Operations',
      position:e.role, grade:e.grade, lineManager:'Grace Ndaki', employmentType:e.expat?'Expatriate':'Permanent',
      hireDate:e.joined, contact:'+25578'+(7000000+i), nextOfKin:'Next Kin '+i }));
    if(ds.id==='leave_balances') return E.map((e,i)=>({ empNo:(window.genEmpNo?genEmpNo(e):e.no), annualDays:i===1?'72':String(e.leave),
      sickDays:'120', daysTaken:i===3?'-2':'9', rotation:i===5?'fortnight':e.rotation }));
    if(ds.id==='carry_over') return E.slice(0,5).map((e,i)=>({ empNo:(window.genEmpNo?genEmpNo(e):e.no), days:i===0?'34':'5', yearEarned:i===2?'2021':'2025' }));
    if(ds.id==='contracts') return E.map((e,i)=>({ empNo:(window.genEmpNo?genEmpNo(e):e.no), type:'Permanent', startDate:e.joined, endDate:i===2?'2020-01-01':e.contract }));
    if(ds.id==='permits_certs') return E.slice(0,5).map((e,i)=>({ empNo:(window.genEmpNo?genEmpNo(e):e.no), docType:i===1?'Badge':'OSHA medical', number:'OSHA-'+i, expiryDate:i===0?'2026-01-10':'2026-09-12' }));
    if(ds.id==='disciplinary') return E.slice(0,3).map((e,i)=>({ empNo:(window.genEmpNo?genEmpNo(e):e.no), caseRef:'DISC-0'+i, type:'Written warning', status:i===2?'Closed':'Open', dateOpened:'2026-03-1'+i }));
    if(ds.id==='org_structure') return SITES_LIST.map((s,i)=>({ site:s, department:'Operations', position:'Equipment Operator', headcount:i===1?'-5':String(40+i*10), reportsTo:'Project Manager', costCentre:'CC-'+(100+i) }));
    if(ds.id==='salary_grades') return ['G3','G6','G9','G11','G14'].map((g,i)=>({ grade:g, band:['Entry','Skilled','Senior','Lead','Exec'][i], scaleMin:String(300000+i*200000), scaleMax:i===3?'400000':String(500000+i*200000) }));
    if(ds.id==='users_roles') return (typeof ROLES!=='undefined'?ROLES.slice(0,6):[]).map((r,i)=>({ name:r.name, email:i===2?'bad-email':r.email, roleId:i===4?'wizard':r.id, site:r.scope }));
    return [];
  }

  function validate(ds, rows){
    const errs=[]; const seen={};
    rows.forEach((r,ri)=>{
      ds.cols.forEach(c=>{
        const v=(r[c.k]??'').toString().trim();
        if(c.req && !req(v)){ errs.push({row:ri+1,col:c.k,level:'error',msg:'required'}); return; }
        if(v && c.check){ const m=c.check(v); if(m) errs.push({row:ri+1,col:c.k,level:'error',msg:m}); }
        if(c.unique && v){ (seen[c.k]=seen[c.k]||{}); if(seen[c.k][v]) errs.push({row:ri+1,col:c.k,level:'error',msg:'duplicate'}); seen[c.k][v]=1; }
      });
      if(ds.rowCheck){ const m=ds.rowCheck(r); if(m) errs.push({row:ri+1,col:m.col,level:'error',msg:m.msg}); }
      if(ds.rowWarn){ const m=ds.rowWarn(r); if(m) errs.push({row:ri+1,col:m.col,level:'warn',msg:m.msg}); }
    });
    const errRows = new Set(errs.filter(e=>e.level==='error').map(e=>e.row));
    return { errs, total:rows.length, errors:errs.filter(e=>e.level==='error').length,
      warnings:errs.filter(e=>e.level==='warn').length, valid:rows.length-errRows.size };
  }

  function DataMigration({ role }){
    const [st,setSt] = React.useState({}); // id -> {rows,report,imported}
    const [open,setOpen] = React.useState(null);
    const set = (id,patch)=>setSt(s=>({...s,[id]:{...(s[id]||{}),...patch}}));
    const fileRef = React.useRef(null);

    const counts = DS.reduce((a,ds)=>{ const s=st[ds.id]||{}; if(s.imported) a.done++; if(s.report) a.staged+=s.report.total; a.err+=(s.report?s.report.errors:0); return a; },{done:0,staged:0,err:0});

    const runValidate = (ds, rows) => { const report=validate(ds,rows); set(ds.id,{rows,report,imported:false}); };
    const onUpload = (ds, file) => { file.text().then(txt=>{ const rows=parseCSV(txt); runValidate(ds,rows); }); };
    const doImport = (ds) => { const s=st[ds.id]; if(!s||!s.report) return;
      set(ds.id,{imported:true, importedCount:s.report.valid});
      if(window.HStore&&HStore.notify) HStore.notify({to:'HCWOS',from:'Data Migration',kind:'download',
        title:'Opening balances imported', body:`${ds.name}: ${s.report.valid} rows imported, ${s.report.errors} rejected.`, action:{page:'migration'}});
      toast(`${ds.name} imported · ${s.report.valid} rows`,'check');
    };

    const cur = open ? DS.find(d=>d.id===open) : null;
    const curSt = cur ? (st[cur.id]||{}) : null;

    return <div className="grid" style={{gap:16}}>
      <div className="grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <KPI icon="download" label="Datasets" value={DS.length} sub="go-live opening balances"/>
        <KPI icon="check" label="Imported" value={counts.done} sub={'of '+DS.length+' datasets'} trend={counts.done===DS.length?'complete':null} trendDir="up"/>
        <KPI icon="doc" label="Rows staged" value={counts.staged} sub="validated this session"/>
        <KPI icon="alert" label="Validation errors" value={counts.err} sub="must be fixed before import" trend={counts.err?'action':'clean'} trendDir={counts.err?'dn':'up'}/>
      </div>

      <Card>
        <CardH title="Migration cockpit" icon="download" meta="template → upload → validate → import"
          action={<span className="muted" style={{marginLeft:'auto',fontSize:12}}>as at 30 Jun 2026</span>}/>
        <table className="tbl"><thead><tr><th>Dataset</th><th>What to provide</th><th>Format</th><th>Rows</th><th>Status</th><th></th></tr></thead>
          <tbody>{DS.map(ds=>{ const s=st[ds.id]||{}; const r=s.report;
            const status = s.imported?['Imported','green']:r?(r.errors?['Errors','red']:['Validated','blue']):['Pending','grey'];
            return <tr key={ds.id} className="clickable" onClick={()=>setOpen(ds.id)}>
              <td><div className="rowname"><span style={{width:30,height:30,borderRadius:8,background:'var(--accent-soft)',color:'var(--accent)',
                display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Icon name={ds.icon} size={16}/></span>
                <span className="name">{ds.name}</span></div></td>
              <td className="muted" style={{fontSize:12,maxWidth:340}}>{ds.provide}</td>
              <td className="muted" style={{fontSize:12}}>{ds.format}</td>
              <td className="num">{r?`${r.valid}/${r.total}`:'—'}</td>
              <td><Tag tone={status[1]}>{status[0]}</Tag>{r&&r.warnings>0&&<Tag tone="yellow" style={{marginLeft:5}}>{r.warnings} warn</Tag>}</td>
              <td style={{textAlign:'right'}}><Icon name="chevR" size={15} style={{color:'var(--faint)'}}/></td>
            </tr>; })}</tbody></table>
      </Card>

      {cur && <>
        <div className="drawer-backdrop" onClick={()=>setOpen(null)}/>
        <div className="drawer-panel"><div className="prof">
          <div className="prof-head">
            <span style={{width:46,height:46,borderRadius:11,background:'var(--accent-soft)',color:'var(--accent)',
              display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name={cur.icon} size={22}/></span>
            <div style={{flex:1,minWidth:0}}>
              <div className="prof-name">{cur.name}</div>
              <div className="prof-role">{cur.format}</div>
            </div>
            <button className="iconbtn" onClick={()=>setOpen(null)}><Icon name="x" size={18}/></button>
          </div>
          <div className="prof-body">
            <div className="prof-banner"><Icon name="shield" size={15} style={{color:'var(--accent)'}}/>
              <span>{cur.provide}</span></div>

            {cur.files
              ? <div className="prof-sec">
                  <div className="prof-sh"><Icon name="doc" size={15} style={{color:'var(--accent)'}}/>Document upload</div>
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {['Scanned national ID (NIDA)','Signed employment contract','OSHA medical certificate','Operator licence / certificates'].map((d,i)=>
                      <div key={i} className="prof-doc"><Icon name="doc" size={15} style={{color:'var(--muted)'}}/><span>{d}</span>
                        <Tag tone="grey" style={{marginLeft:'auto'}}>PDF/JPG/PNG</Tag></div>)}
                    <label className="btn sm" style={{alignSelf:'flex-start',cursor:'pointer'}}><Icon name="download" size={13}/>Upload files
                      <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" style={{display:'none'}} onChange={e=>{ const n=e.target.files.length; if(n){ set(cur.id,{imported:true,importedCount:n,report:{total:n,valid:n,errors:0,warnings:0,errs:[]}}); toast(n+' personal-file documents staged','doc'); } }}/></label>
                  </div>
                </div>
              : <>
                <div className="prof-sec">
                  <div className="prof-sh"><Icon name="grid" size={15} style={{color:'var(--accent)'}}/>Required columns
                    <span className="prof-note">{cur.cols.length} fields · * required</span></div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {cur.cols.map(c=><span key={c.k} className="tag t-grey" style={{fontSize:11}}>{c.label}{c.req&&<span style={{color:'var(--accent)'}}> *</span>}</span>)}
                  </div>
                </div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'4px 0 14px'}}>
                  <button className="btn sm" onClick={()=>download(cur.id+'_template.csv', toCSV(cur.cols, []))}><Icon name="download" size={13}/>Download template</button>
                  <label className="btn sm" style={{cursor:'pointer'}}><Icon name="download" size={13} style={{transform:'rotate(180deg)'}}/>Upload CSV
                    <input ref={fileRef} type="file" accept=".csv" style={{display:'none'}} onChange={e=>{ if(e.target.files[0]) onUpload(cur, e.target.files[0]); }}/></label>
                  <button className="btn sm ghost" onClick={()=>runValidate(cur, sampleFor(cur))}>Load sample data</button>
                </div>

                {curSt && curSt.report && <>
                  <div style={{display:'flex',gap:10,marginBottom:12}}>
                    {[['Rows',curSt.report.total,'grey'],['Valid',curSt.report.valid,'green'],['Errors',curSt.report.errors,'red'],['Warnings',curSt.report.warnings,'yellow']].map((s,i)=>
                      <div key={i} style={{flex:1,padding:'10px 12px',borderRadius:9,background:'var(--surface-2)',textAlign:'center'}}>
                        <div className="num" style={{fontSize:20,fontWeight:700,color:`var(--${s[2]==='grey'?'text':s[2]})`}}>{s[1]}</div>
                        <div className="muted" style={{fontSize:11}}>{s[0]}</div></div>)}
                  </div>
                  {curSt.report.errs.length>0
                    ? <div className="prof-sec"><div className="prof-sh"><Icon name="alert" size={15} style={{color:'var(--red)'}}/>Sanity-check findings</div>
                        <table className="tbl"><thead><tr><th>Row</th><th>Column</th><th>Level</th><th>Issue</th></tr></thead>
                          <tbody>{curSt.report.errs.slice(0,40).map((e,i)=><tr key={i}>
                            <td className="num">{e.row}</td><td className="muted">{e.col}</td>
                            <td><Tag tone={e.level==='error'?'red':'yellow'}>{e.level}</Tag></td>
                            <td>{e.msg}</td></tr>)}</tbody></table></div>
                    : <div className="prof-banner" style={{background:'var(--green-soft)'}}><Icon name="check" size={15} style={{color:'var(--green)'}}/>
                        <span>All {curSt.report.total} rows passed structure mapping and sanity checks.</span></div>}
                </>}
              </>}

            <div style={{display:'flex',gap:8,marginTop:16,paddingTop:14,borderTop:'1px solid var(--border-2)'}}>
              {curSt && curSt.imported
                ? <span className="tag t-green" style={{padding:'8px 12px'}}><Icon name="check" size={13}/> Imported · {curSt.importedCount} rows committed</span>
                : <button className="btn primary" disabled={!curSt||!curSt.report||curSt.report.errors>0}
                    style={(!curSt||!curSt.report||curSt.report.errors>0)?{opacity:.5}:null}
                    onClick={()=>doImport(cur)}><Icon name="check" size={15}/>Import {curSt&&curSt.report?curSt.report.valid:''} clean rows</button>}
              {curSt&&curSt.report&&curSt.report.errors>0&&<span className="muted" style={{fontSize:12,alignSelf:'center'}}>Fix {curSt.report.errors} error{curSt.report.errors>1?'s':''} to enable import.</span>}
            </div>
          </div>
        </div></div>
      </>}
    </div>;
  }
  window.DataMigration = DataMigration;
})();
