// HCWOS extended data — approvals, training, grievances, payroll (Tanzania statutory).
// Approvals inbox — each item tagged by type so it can be scoped to a role's approval rights.
const APPROVALS = [
  { id:'AP-3012', type:'leave',       who:'Grace Ndaki',    no:'TMC-03190', site:'Nyanzaga', detail:'Annual leave · 9 days · 01–09 Jul', amount:'9 days',  raised:'2h ago',  cover:true },
  { id:'AP-3011', type:'overtime',    who:'Mohammed Said',  no:'TMC-01902', site:'Dar Yard', detail:'Overtime · 14.5 hrs · week 25',     amount:'14.5 hrs',raised:'3h ago' },
  { id:'AP-3010', type:'attendance',  who:'Peter Komba',    no:'TMC-02210', site:'Mwadui',   detail:'Attendance exception · clock outside geofence', amount:'1 day', raised:'4h ago' },
  { id:'AP-3009', type:'appraisal',   who:'Fatuma Ally',    no:'TMC-05533', site:'Nyanzaga', detail:'Q2 appraisal · rating 4 · sign-off', amount:'Rating 4', raised:'5h ago' },
  { id:'AP-3008', type:'recruitment', who:'REQ-Op-114',     no:'—',         site:'Nyanzaga', detail:'Requisition · Equipment Operator x6', amount:'6 posts', raised:'Yest' },
  { id:'AP-3007', type:'training',    who:'Esther Mushi',   no:'TMC-03741', site:'Geita Civil', detail:'Training nomination · Defensive driving', amount:'1 seat', raised:'Yest' },
  { id:'AP-3006', type:'promotion',   who:'Samuel Mlay',    no:'TMC-04102', site:'Dar Yard', detail:'Promotion · G9 → G10 · Senior Supervisor', amount:'Grade +1', raised:'2 days' },
  { id:'AP-3005', type:'transfer',    who:'Neema Joseph',   no:'TMC-05290', site:'Nyanzaga', detail:'Transfer · Nyanzaga → Mwadui', amount:'Site move', raised:'2 days' },
  { id:'AP-3004', type:'grievance',   who:'Anonymous',      no:'GRV-118',   site:'Mwadui',   detail:'Grievance outcome · shift allowance dispute', amount:'Outcome', raised:'3 days' },
  { id:'AP-3003', type:'salary',      who:'Rajesh Pillai',  no:'TMC-05011', site:'Dar Yard', detail:'Salary change · market adjustment', amount:'Confidential', raised:'3 days' },
  { id:'AP-3002', type:'requisition', who:'Workshop Dept',  no:'—',         site:'Dar Yard', detail:'Staff requisition · Fitter x2', amount:'2 posts', raised:'4 days' },
  { id:'AP-3001', type:'appointment', who:'Senior Engineer',no:'—',         site:'Group',    detail:'Senior appointment · Mining Engineer', amount:'Exec sign-off', raised:'4 days' },
];
const APPROVAL_LABELS = { leave:'Leave', overtime:'Overtime', attendance:'Attendance', appraisal:'Appraisal',
  recruitment:'Recruitment', training:'Training', promotion:'Promotion', transfer:'Transfer', grievance:'Grievance',
  salary:'Salary change', requisition:'Requisition', appointment:'Senior appointment' };

// Training & competency
const TRAINING = {
  compliance: 86, mandatoryDue: 42, certsExpiring: 11, seatsThisMonth: 64,
  courses: [
    { name:'OSHA Safety Induction',        cat:'Mandatory', enrolled:1077, complete:96, expiry:'Annual' },
    { name:'Defensive Driving',            cat:'Operational', enrolled:312, complete:78, expiry:'2 years' },
    { name:'Heavy Equipment Operation',    cat:'Competency', enrolled:412, complete:84, expiry:'Per authorisation' },
    { name:'First Aid & Emergency',        cat:'Mandatory', enrolled:188, complete:71, expiry:'2 years' },
    { name:'Environmental Awareness',      cat:'Mandatory', enrolled:1077, complete:88, expiry:'Annual' },
    { name:'Code of Conduct & Ethics',     cat:'Mandatory', enrolled:1077, complete:93, expiry:'Annual' },
  ],
  expiringCerts: [
    { who:'Daniel Otieno',  no:'TMC-02877', cert:'OSHA Medical',      site:'North Mara', date:'2026-07-10', days:17 },
    { who:'Joseph Mlimani', no:'TMC-04821', cert:'CAT 777 Authorisation', site:'Mwadui', date:'2026-07-22', days:29 },
    { who:'Samuel Mlay',    no:'TMC-04102', cert:'Defensive Driving', site:'Dar Yard',   date:'2026-07-18', days:25 },
  ],
};

// Grievances
const GRIEVANCES = [
  { id:'GRV-118', cat:'Allowance dispute', site:'Mwadui',   raised:'2026-06-18', stage:'Hearing',     sla:'On track', conf:true,  owner:'HR Officer' },
  { id:'GRV-117', cat:'Working conditions', site:'Nyanzaga', raised:'2026-06-14', stage:'Outcome',     sla:'Due 26 Jun',conf:false, owner:'Project HR' },
  { id:'GRV-116', cat:'Interpersonal',      site:'Dar Yard', raised:'2026-06-09', stage:'Closed',      sla:'Resolved',  conf:false, owner:'Supervisor' },
  { id:'GRV-115', cat:'Disciplinary appeal',site:'Mwadui',   raised:'2026-06-03', stage:'Investigation',sla:'At risk',  conf:true,  owner:'Head of HR' },
];
const GRIEVANCE_KPI = { open:6, slaOnTrack:4, atRisk:1, avgDays:7.4, closedYTD:23 };

// Payroll (Tanzania statutory — illustrative)
const PAYROLL = {
  cycle:'June 2026', runDate:'28 Jun', status:'In preparation',
  gross: 1_061_000_000, net: 742_700_000,
  statutory:[
    { code:'NSSF',  label:'NSSF (social security)', rate:'10% + 10%', amount:106_100_000, tone:'green' },
    { code:'PAYE',  label:'PAYE (income tax)',       rate:'Bands',     amount:148_540_000, tone:'green' },
    { code:'SDL',   label:'SDL (skills levy)',       rate:'3.5%',      amount:37_135_000,  tone:'green' },
    { code:'WCF',   label:'WCF (workers comp.)',     rate:'0.6%',      amount:6_366_000,   tone:'green' },
    { code:'HESLB', label:'HESLB (loan board)',      rate:'Per case',  amount:12_400_000,  tone:'yellow' },
  ],
  deductions:{ advances:18_200_000, union:2_100_000, other:5_400_000 },
  payslipStatus:[ {label:'Generated', n:1061}, {label:'Pending data', n:11}, {label:'On hold (suspended)', n:5} ],
};

Object.assign(window, { APPROVALS, APPROVAL_LABELS, TRAINING, GRIEVANCES, GRIEVANCE_KPI, PAYROLL });
