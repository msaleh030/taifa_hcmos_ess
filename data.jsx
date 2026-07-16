// HCWOS™ sample data — Taifa Mining & Civil. Numbers are illustrative.
const TZS = (n) => 'TZS ' + Math.round(n).toLocaleString('en-US');
const TZSm = (n) => 'TZS ' + (n/1e6).toFixed(1) + 'M';

const SITES = [
  { id: 'mwadui',   name: 'Mwadui',      type: 'Diamond mine',   region: 'Shinyanga',  hc: 412, onLeave: 38, ot: 1240, wage: 386_000_000, lti: 1, conn: 'low',   status: 'active', lat: -3.55, lng: 33.6, smartphones: 230 },
  { id: 'nyanzaga', name: 'Nyanzaga',    type: 'Gold project',   region: 'Mwanza',     hc: 329, onLeave: 41, ot: 980,  wage: 298_000_000, lti: 0, conn: 'med',   status: 'active', lat: -2.7,  lng: 32.6, smartphones: 50 },
  { id: 'daryard',  name: 'Dar Yard',    type: 'Workshop / yard',region: 'Dar es Salaam', hc: 176, onLeave: 12, ot: 1860, wage: 212_000_000, lti: 0, conn: 'high', status: 'active', lat: -6.82, lng: 39.27, smartphones: 176 },
  { id: 'northmara',name: 'North Mara',  type: 'Gold mine',      region: 'Tarime',     hc: 96,  onLeave: 9,  ot: 410,  wage: 104_000_000, lti: 0, conn: 'med',   status: 'active', lat: -1.46, lng: 34.45, smartphones: 70 },
  { id: 'geita',    name: 'Geita Civil', type: 'Civil works',    region: 'Geita',      hc: 64,  onLeave: 7,  ot: 230,  wage: 61_000_000,  lti: 0, conn: 'low',   status: 'active', lat: -2.87, lng: 32.23, smartphones: 28 },
  { id: 'loadhaul', name: 'Load & Haul', type: 'Mining operation', region: 'Shinyanga', hc: 88, onLeave: 7, ot: 410, wage: 96_000_000,  lti: 0, conn: 'med',  status: 'active', lat: -3.60, lng: 33.50, smartphones: 60, isNew: true },
  { id: 'tsf10',    name: 'TSF10',       type: 'Tailings (civil)', region: 'Geita',    hc: 47, onLeave: 4, ot: 150, wage: 52_000_000,  lti: 0, conn: 'low',  status: 'active', lat: -2.85, lng: 32.20, smartphones: 22, isNew: true },
  { id: 'taifahq',  name: 'Taifa HQ',    type: 'Head office',      region: 'Dar es Salaam', hc: 34, onLeave: 3, ot: 60, wage: 118_000_000, lti: 0, conn: 'high', status: 'active', lat: -6.81, lng: 39.28, smartphones: 34, isNew: true },
];
const DORMANT = ['Kahama Camp', 'Sekenke', 'Buzwagi Yard'];

const TOTAL_HC = SITES.reduce((a,s)=>a+s.hc,0); // 1246 (incl. new units)
const TOTAL_ONLEAVE = SITES.reduce((a,s)=>a+s.onLeave,0);
const TOTAL_WAGE = SITES.reduce((a,s)=>a+s.wage,0);
const TOTAL_OT = SITES.reduce((a,s)=>a+s.ot,0);
const LEAVE_LIABILITY = 1_184_000_000; // TZS

const ROLE_COUNTS = [
  { role: 'Equipment operators', count: 412 },
  { role: 'General labour',      count: 188 },
  { role: 'Site supervisors',    count: 96 },
  { role: 'Workshop / fitters',  count: 124 },
  { role: 'Workshop managers',   count: 18 },
  { role: 'HSEQ officers',       count: 22 },
  { role: 'Project HR / admin',  count: 41 },
  { role: 'Drivers',             count: 87 },
  { role: 'Engineering & tech',  count: 64 },
  { role: 'Expatriates',         count: 25 },
];

const EMPLOYEES = [
  { no:'TMC-04821', name:'Joseph Mlimani',   role:'Equipment Operator', site:'Mwadui',   grade:'G6', status:'Active',   rotation:'7x7x7',   contract:'2026-09-14', permit:'—',          medical:'Valid',   leave:18.5, disc:0, joined:'2021-03-02' },
  { no:'TMC-03190', name:'Grace Ndaki',      role:'Site Supervisor',    site:'Nyanzaga', grade:'G9', status:'Active',   rotation:'8-on-2-off',contract:'2026-07-30', permit:'—',         medical:'Valid',   leave:9.0,  disc:0, joined:'2018-11-19' },
  { no:'TMC-05011', name:'Rajesh Pillai',    role:'Workshop Manager',   site:'Dar Yard', grade:'G12',status:'Active',   rotation:'Standard', contract:'2026-06-30', permit:'2026-07-05',medical:'Valid',   leave:24.0, disc:0, joined:'2016-02-01', expat:true },
  { no:'TMC-04455', name:'Amina Hassan',     role:'HSEQ Officer',       site:'Mwadui',   grade:'G8', status:'Active',   rotation:'8-on-2-off',contract:'2027-01-12', permit:'—',         medical:'Valid',   leave:12.5, disc:0, joined:'2020-08-17' },
  { no:'TMC-02877', name:'Daniel Otieno',    role:'Driver',             site:'North Mara',grade:'G5',status:'Active',   rotation:'9-on-3-off',contract:'2026-06-28', permit:'—',        medical:'Expiring',leave:6.0,  disc:1, joined:'2019-05-23' },
  { no:'TMC-05290', name:'Neema Joseph',     role:'Project HR',         site:'Nyanzaga', grade:'G9', status:'Active',   rotation:'Standard', contract:'2027-03-01', permit:'—',         medical:'Valid',   leave:15.0, disc:0, joined:'2022-01-10' },
  { no:'TMC-01902', name:'Mohammed Said',    role:'Fitter',             site:'Dar Yard', grade:'G7', status:'Active',   rotation:'Standard', contract:'2026-07-02', permit:'—',         medical:'Valid',   leave:21.0, disc:0, joined:'2017-09-09' },
  { no:'TMC-04999', name:'Abhey Kumar',      role:'Engineer',           site:'Mwadui',   grade:'G11',status:'Active',   rotation:'9wk-on-5-off',contract:'2026-08-22',permit:'2026-06-29',medical:'Valid', leave:30.0, disc:0, joined:'2015-04-14', expat:true },
  { no:'TMC-03741', name:'Esther Mushi',     role:'Equipment Operator', site:'Geita Civil',grade:'G6',status:'On Leave',rotation:'7x7x7',  contract:'2027-02-18', permit:'—',         medical:'Valid',   leave:0.0,  disc:0, joined:'2020-12-03' },
  { no:'TMC-02210', name:'Peter Komba',      role:'General Labour',     site:'Mwadui',   grade:'G3', status:'Suspended',rotation:'Standard', contract:'2026-10-05', permit:'—',         medical:'Valid',   leave:4.5,  disc:2, joined:'2019-07-30' },
  { no:'TMC-05533', name:'Fatuma Ally',      role:'Equipment Operator', site:'Nyanzaga', grade:'G6', status:'Active',   rotation:'7x7x7',   contract:'2027-05-11', permit:'—',         medical:'Valid',   leave:11.0, disc:0, joined:'2023-02-27' },
  { no:'TMC-04102', name:'Samuel Mlay',      role:'Site Supervisor',    site:'Dar Yard', grade:'G9', status:'Active',   rotation:'Standard', contract:'2026-07-18', permit:'—',         medical:'Expiring',leave:19.5, disc:0, joined:'2018-06-06' },
];

// Contract / permit / licence expiry alerts
const EXPIRY_ALERTS = [
  { type:'Contract',        who:'Mohammed Said',   no:'TMC-01902', site:'Dar Yard', date:'2026-07-02', days:9,  sev:'warn' },
  { type:'Work permit',     who:'Abhey Kumar',     no:'TMC-04999', site:'Mwadui',   date:'2026-06-29', days:6,  sev:'crit' },
  { type:'Contract',        who:'Daniel Otieno',   no:'TMC-02877', site:'North Mara',date:'2026-06-28',days:5,  sev:'crit' },
  { type:'Medical (OSHA)',  who:'Daniel Otieno',   no:'TMC-02877', site:'North Mara',date:'2026-07-10',days:17, sev:'warn' },
  { type:'Driving licence', who:'Samuel Mlay',     no:'TMC-04102', site:'Dar Yard', date:'2026-07-18', days:25, sev:'info' },
  { type:'Work permit',     who:'Rajesh Pillai',   no:'TMC-05011', site:'Dar Yard', date:'2026-07-05', days:12, sev:'warn' },
  { type:'Contract',        who:'Grace Ndaki',     no:'TMC-03190', site:'Nyanzaga', date:'2026-07-30', days:37, sev:'info' },
];

const ROTATIONS = [
  { id:'7x7x7',        label:'7 on · 7 off · 7 on', groups:312, desc:'Two-week field cycle' },
  { id:'8-on-2-off',   label:'8 on · 2 off',         groups:268, desc:'Standard site roster' },
  { id:'9-on-3-off',   label:'9 on · 3 off',         groups:184, desc:'Extended field roster' },
  { id:'expat-9-5',    label:'9 weeks on · 5 off',   groups:25,  desc:'Expatriate rotation' },
];

// GPS geofenced clock-in feed (live console)
const CLOCKIN_FEED = [
  { name:'Joseph Mlimani', no:'TMC-04821', site:'Mwadui',   time:'05:58', method:'Geofence', state:'in',  inzone:true },
  { name:'Fatuma Ally',    no:'TMC-05533', site:'Nyanzaga', time:'06:01', method:'Kiosk',    state:'in',  inzone:true },
  { name:'Samuel Mlay',    no:'TMC-04102', site:'Dar Yard', time:'06:03', method:'Biometric',state:'in',  inzone:true },
  { name:'Peter Komba',    no:'TMC-02210', site:'Mwadui',   time:'06:07', method:'Geofence', state:'flag',inzone:false },
  { name:'Mohammed Said',  no:'TMC-01902', site:'Dar Yard', time:'06:09', method:'Biometric',state:'in',  inzone:true },
  { name:'Neema Joseph',   no:'TMC-05290', site:'Nyanzaga', time:'06:12', method:'Geofence', state:'in',  inzone:true },
  { name:'Daniel Otieno',  no:'TMC-02877', site:'North Mara',time:'06:14',method:'Geofence', state:'sync',inzone:true },
];

const LEAVE_REQUESTS = [
  { who:'Grace Ndaki',    no:'TMC-03190', site:'Nyanzaga', type:'Annual', from:'2026-07-01', to:'2026-07-09', days:9,  status:'Pending', cover:true },
  { who:'Joseph Mlimani', no:'TMC-04821', site:'Mwadui',   type:'Annual', from:'2026-06-28', to:'2026-07-04', days:7,  status:'Pending', cover:true },
  { who:'Amina Hassan',   no:'TMC-04455', site:'Mwadui',   type:'Sick',   from:'2026-06-23', to:'2026-06-25', days:3,  status:'Pending', cover:true },
  { who:'Esther Mushi',   no:'TMC-03741', site:'Geita Civil',type:'Annual',from:'2026-06-20',to:'2026-07-01', days:12, status:'Flagged',cover:false, reason:'Exceeds 14-day cap conflict / coverage' },
  { who:'Mohammed Said',  no:'TMC-01902', site:'Dar Yard', type:'Annual', from:'2026-07-10', to:'2026-07-16', days:7,  status:'Approved',cover:true },
];

const HSEQ_INCIDENTS = [
  { id:'INC-2026-041', site:'Mwadui',   date:'2026-06-19', type:'Near miss',    sev:'Low',    lti:false, days:0,  status:'Closed',  wcf:false, desc:'Reversing haul truck, spotter procedure breach' },
  { id:'INC-2026-040', site:'Dar Yard', date:'2026-06-15', type:'Injury',       sev:'Medium', lti:true,  days:4,  status:'Open',    wcf:true,  desc:'Hand laceration during grinding, workshop' },
  { id:'INC-2026-039', site:'Nyanzaga', date:'2026-06-11', type:'Environmental',sev:'Low',    lti:false, days:0,  status:'Closed',  wcf:false, desc:'Minor hydraulic oil spill, contained' },
  { id:'INC-2026-038', site:'Mwadui',   date:'2026-06-02', type:'Injury',       sev:'High',   lti:true,  days:11, status:'In review',wcf:true, desc:'Slip and fall, fractured wrist, plant area' },
  { id:'INC-2026-037', site:'North Mara',date:'2026-05-28',type:'Near miss',    sev:'Low',    lti:false, days:0,  status:'Closed',  wcf:false, desc:'Dropped object near walkway' },
];
const HSEQ_KPI = { daysSinceLTI: 4, ltiYTD: 2, lostDays: 15, trir: 0.74, incidentsMTD: 5, openWCF: 2 };

// Competency authorisation (REQ-040 six-step)
const COMPETENCY = [
  { who:'Joseph Mlimani', equip:'CAT 777 Haul Truck', step:5, of:6, taifa:true, client:true,  authed:true,  by:'Training Dept' },
  { who:'Fatuma Ally',    equip:'Komatsu Excavator',  step:4, of:6, taifa:true, client:false, authed:false, by:'Awaiting client assessment' },
  { who:'Esther Mushi',   equip:'CAT 777 Haul Truck', step:2, of:6, taifa:false,client:false, authed:false, by:'Initial practical assessment' },
  { who:'Peter Komba',    equip:'Wheel Loader',       step:1, of:6, taifa:false,client:false, authed:false, by:'Certificate verification' },
];

const RECRUITMENT = [
  { req:'REQ-Op-114', role:'Equipment Operator x6', site:'Nyanzaga', stage:'Medical (OSHA)',  cands:14, target:'2026-07-15' },
  { req:'REQ-Sup-22', role:'Site Supervisor',       site:'Mwadui',   stage:'Final interview', cands:3,  target:'2026-07-02' },
  { req:'REQ-Fit-09', role:'Fitter x2',             site:'Dar Yard', stage:'Shortlisting',    cands:21, target:'2026-07-20' },
  { req:'REQ-HR-04',  role:'Project HR Officer',    site:'Geita Civil',stage:'Offer',          cands:1,  target:'2026-06-30' },
];
const RECRUIT_STAGES = ['Requisition','Shortlisting','Interview','Medical (OSHA)','Offer','Onboarding'];

const APPRAISALS = { cycle:'Q2 2026', complete:74, inProgress:18, notStarted:8, avgRating:3.7,
  dist:[ {r:'5 — Outstanding',pct:8},{r:'4 — Exceeds',pct:26},{r:'3 — Meets',pct:48},{r:'2 — Partial',pct:14},{r:'1 — Below',pct:4} ] };

const POLICIES = [
  { name:'Code of Conduct',           ack:96 }, { name:'HSEQ Policy',        ack:91 },
  { name:'Leave & Rotation Policy',   ack:88 }, { name:'Disciplinary Code',  ack:84 },
  { name:'Data Privacy & IT Use',     ack:79 }, { name:'Anti-Bribery',       ack:93 },
];

// ESS (mobile) — logged-in employee
const ME = {
  name:'Joseph Mlimani', no:'TMC-04821', role:'Equipment Operator', site:'Mwadui',
  grade:'G6', rotation:'7 on · 7 off · 7 on', leaveBalance:18.5, leaveLiability:1_388_000,
  onShift:true, nextOff:'29 Jun', supervisor:'Grace Ndaki',
};

// ── Geofence zone config (SS-3 · CONFIRMED & versioned, registry v1.1 · 30 Jun 2026) ──
// Multi-zone per site. A clock-in is valid if inside ANY zone for the employee's site.
// Server re-validates against this set; device never trusted (AC-ATT-01). Versioned config, not hard-coded.
// Tolerance: accept if distance <= radius + reported device GPS accuracy [confirm], avoids false rejects at 100m zones.
const ATT_ZONES_VERSION = 'v1.1';
const ATT_ZONES = {
  MW: { site:'Mwadui', zones:[
    { name:'Workshop',   lat:-3.527972, lng:33.591528, r:300 },
    { name:'Production', lat:-3.524574, lng:33.591796, r:100, note:'biometric: ZKTeco on site, integration TBC' },
  ]},
  NM: { site:'North Mara', zones:[
    { name:'TSF',             lat:-1.478784, lng:34.504310, r:400 },
    { name:'Gokona Workshop', lat:-1.420831, lng:34.552759, r:200 },
    { name:'Gokona Admin',    lat:-1.421284, lng:34.553155, r:100 },
  ]},
  NZ: { site:'Nyanzaga', zones:[
    { name:'Nyanzaga', lat:-2.938408, lng:32.679158, r:800 },
  ]},
  HO: { site:'Head Office', zones:[], open:'[OPEN] no coordinates supplied — geofenced or ungated? Blocks HO clock-in until resolved.' },
};

Object.assign(window, {
  TZS, TZSm, SITES, DORMANT, TOTAL_HC, TOTAL_ONLEAVE, TOTAL_WAGE, TOTAL_OT, LEAVE_LIABILITY,
  ROLE_COUNTS, EMPLOYEES, EXPIRY_ALERTS, ROTATIONS, CLOCKIN_FEED, LEAVE_REQUESTS,
  HSEQ_INCIDENTS, HSEQ_KPI, COMPETENCY, RECRUITMENT, RECRUIT_STAGES, APPRAISALS, POLICIES, ME,
  ATT_ZONES, ATT_ZONES_VERSION,
});
