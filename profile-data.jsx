// Comprehensive employee bio-data — derived deterministically from the base record.
(function(){
  // ── Taifa employee numbering ──────────────────────────────────────────
  // Format:  TMCL-<LOC>-<SEQ>   e.g.  TMCL-MW-0007   (supersedes EN-1, governance 29 Jun 2026)
  //   TMCL  Taifa Mining & Civil Ltd (company prefix — NO year segment)
  //   LOC   location code where the employee was onboarded
  //   SEQ   4-digit zero-padded sequence that RESETS PER LOCATION
  // [TBC-NYZ]  RESOLVED — sample ID table is source of truth over register prose: Nyanzaga = NZ.
  // [TBC-ROLLOVER]        behaviour beyond 9999 per location is undefined — still open
  // [TBC-COMPANY-SEGMENT] company prefix segment still open — still open
  const LOC_CODE = { 'Mwadui':'MW','North Mara':'NM','Taifa HQ':'HO','Head Office':'HO',
    'Nyanzaga':'NZ',  // [TBC-NYZ] resolved 29 Jun 2026 — sample table wins
    // ── demo codes for units not yet in the governance LOC register ──
    'Dar Yard':'DY','Geita Civil':'GC','Load & Haul':'LH','TSF10':'TS','Kahama':'KA' };
  window.SITE_CODE = LOC_CODE;   // alias kept for existing callers
  window.genEmpNo = function(e){
    const code = LOC_CODE[e.site] || 'HO';
    const seq = (e.no.replace(/\D/g,'').slice(-4)).padStart(4,'0');
    return `TMCL-${code}-${seq}`;   // no year segment [EN-1 superseded]
  };
  window.EMP_NO_LEGEND = 'TMCL · company  ›  LOC location code {HO,MW,NM,NZ}  ›  4-digit seq (resets per location) · [TBC-ROLLOVER] >9999 · [TBC-COMPANY-SEGMENT]';
  // next number for a new joiner at a location (demo — sequence resets per location)
  window.nextEmpNo = function(site){
    const code = LOC_CODE[site] || 'HO';
    const seq = String(1 + Math.floor(Math.random()*60)).padStart(4,'0');
    return `TMCL-${code}-${seq}`;
  };
  // Synthesize an employee-style record for a manager role (managers are employees too).
  window.roleSelfRecord = function(role){
    const gradeMap={supervisor:'G9',super:'G11',pm:'G13',hod:'G14',hrofficer:'G9',hrhead:'G14',payroll:'G8',finance:'G13',sheq:'G12',ceo:'G16',employee:'G6'};
    const site = role.scope==='all' ? 'Taifa HQ' : role.scope;
    const seq = String(2900 + (role.id.charCodeAt(0)*7 % 900)).padStart(4,'0');
    return { no:'TMC-0'+seq, name:role.name, role:role.title, site, grade:gradeMap[role.id]||'G9',
      status:'Active', rotation:'Standard', contract:'2027-03-31', permit: role.expat?'2027-02-28':'—', medical:'Valid',
      leave: 14 + (role.id.length % 12) + 0.5, disc:0, joined:'2018-04-15', expat: !!role.expat };
  };

  const regions=['Shinyanga','Mwanza','Dar es Salaam','Tarime','Geita','Dodoma','Arusha','Mbeya','Tabora','Kigoma'];
  const districts=['Kishapu','Ilemela','Kinondoni','Rorya','Nyang\u2019hwale','Chamwino','Meru','Mbarali','Uyui','Kasulu'];
  const banks=['CRDB Bank','NMB Bank','NBC Bank','Stanbic'];
  const langs=['Swahili, English','Swahili, English, Sukuma','Swahili, English, Haya'];
  const relations=['Spouse','Parent','Sibling','Spouse'];
  const kinNames=['Neema J.','Hamisi A.','Fatuma S.','Baraka M.','Joyce P.','Said R.'];
  function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
  function pick(arr,h){return arr[h%arr.length];}
  function digits(h,n){let s=''+h;while(s.length<n)s+=(''+hash(s));return s.slice(0,n);}

  window.empProfile = function(e){
    const h=hash(e.no);
    const age=27+(h%22); const birthYear=2026-age;
    const gender = (h%5===0||/a$|e$/.test(e.name.split(' ').slice(-1)[0].toLowerCase())) && h%2===0 ? 'Female':'Male';
    const region=pick(regions,h); const dist=pick(districts,h>>3);
    const ytd=(e.leave>0? (24-e.leave) : 14+(h%8)).toFixed(1);
    return {
      base:e,
      personal:{
        fullName:e.name, dob:`${birthYear}-0${1+(h%9)}-${10+(h%18)}`, age, gender,
        maritalStatus: h%3===0?'Single':'Married',
        nationality:'Tanzanian', nida:digits(h,20).replace(/(\d{8})(\d{4})(\d{8})/, '$1-$2-$3'),
        tin:digits(h>>2,9).replace(/(\d{3})(\d{3})(\d{3})/,'$1-$2-$3'),
        nssf:'NSSF-'+digits(h>>5,9),
        phone:'+255 7'+(10+(h%80))+' '+digits(h>>7,3)+' '+digits(h>>9,3),
        email:e.name.toLowerCase().replace(/[^a-z]+/g,'.')+'@taifamining.tz',
        languages:pick(langs,h), bloodGroup:pick(['O+','A+','B+','AB+','O-'],h>>4),
        address:`${dist}, ${region}`, religion: h%2?'Christian':'Muslim',
      },
      kin:{ name:pick(kinNames,h), relation:pick(relations,h>>2), phone:'+255 6'+(20+(h%70))+' '+digits(h>>11,3)+' '+digits(h>>13,3) },
      employment:{
        empNo:window.genEmpNo(e), legacyNo:e.no, role:e.role, grade:e.grade, site:e.site, department: e.role.includes('HR')?'Human Resources':e.role.includes('HSEQ')?'SHEQ':'Operations',
        rotation:e.rotation, joined:e.joined, contract:e.contract, contractType: e.expat?'Fixed-term (expat)':'Permanent',
        manager:e.site==='Mwadui'?'Grace Ndaki':e.site==='Nyanzaga'?'Neema Joseph':'Samuel Mlay',
        status:e.status, permit:e.permit, tenure:(2026-parseInt(e.joined))+' yrs',
      },
      comp:{ band: e.grade+' · '+['Entry','Skilled','Senior','Lead'][h%4], basic:'TZS '+((280+(h%520))*1000).toLocaleString(),
        bank:pick(banks,h), account:'…'+digits(h>>6,4), payMode:'Bank transfer (Exact)' },
      leave:{ balance:e.leave, taken:ytd, liability:'TZS '+((e.leave*72000)|0).toLocaleString(), carryover:'0.0' },
      docs:[
        {name:'Employment contract', tag:'PDF', tone:'blue'},
        {name:'National ID (NIDA)', tag:'Verified', tone:'green'},
        {name:'OSHA medical certificate', tag:e.medical==='Valid'?'Valid':'Expiring', tone:e.medical==='Valid'?'green':'yellow'},
        {name:'Appointment letter', tag:'PDF', tone:'blue'},
        ...(e.expat?[{name:'Work & residence permit', tag:e.permit, tone:'yellow'}]:[]),
      ],
      training:[
        {name:'OSHA Safety Induction', status:'Complete'},
        {name:'Code of Conduct', status:'Acknowledged'},
        ...(e.role.includes('Operator')?[{name:e.role.includes('Operator')?'Equipment Authorisation':'—', status:e.name==='Joseph Mlimani'?'Authorised':'In progress'}]:[]),
        ...(e.role==='Driver'?[{name:'Defensive Driving', status:'Complete'}]:[]),
      ],
      discipline: e.disc>0 ? Array.from({length:e.disc}).map((_,i)=>({
        date:`2026-0${3+i}-1${i}`, type:i?'Final warning':'Verbal warning', note:'Attendance / conduct'})) : [],
      hseq:{ ppe:'Issued · in-date', lastMedical:'2026-0'+(1+(h%6))+'-12', incidents:e.disc>1?1:0 },
    };
  };

  // honour captured 360° new-joiner data over synthesized values
  const __origProfile = window.empProfile;
  window.empProfile = function(e){
    const p = __origProfile(e);
    if(e && e._bio){ const b=e._bio;
      p.personal = { ...p.personal, fullName:e.name, dob:b.dob||p.personal.dob, gender:b.gender||p.personal.gender,
        maritalStatus:b.maritalStatus||p.personal.maritalStatus, nationality:b.nationality||p.personal.nationality,
        phone:b.phone||p.personal.phone, email:b.email||p.personal.email, address:b.address||p.personal.address,
        bloodGroup:b.bloodGroup||p.personal.bloodGroup, languages:b.languages||p.personal.languages,
        religion:b.religion||p.personal.religion, nida:b.nida||p.personal.nida, tin:b.tin||p.personal.tin, nssf:b.nssf||p.personal.nssf };
      p.kin = { ...p.kin, name:b.kinName||p.kin.name, relation:b.kinRelation||p.kin.relation, phone:b.kinPhone||p.kin.phone };
      p.employment = { ...p.employment, department:b.department||p.employment.department,
        manager:b.manager||p.employment.manager, contractType:b.employmentType||p.employment.contractType };
    }
    return p;
  };
})();
