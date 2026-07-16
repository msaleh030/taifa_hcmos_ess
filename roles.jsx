// HCWOS roles — TAIFA Mining ESS role-based access matrix (13 roles).
// Each role: scope, money, approves[] (approval rights), access{view,edit,approve},
// landing, pages[], and a dashboard spec (kpis[] + panels[]).
const K = {
  headcount:    { icon:'users',    label:'Total headcount', value:TOTAL_HC.toLocaleString(), sub:'8 active sites · 3 dormant' },
  onLeave:      { icon:'calendar', label:'On leave today', value:TOTAL_ONLEAVE, unit:'staff', sub:((TOTAL_ONLEAVE/TOTAL_HC)*100).toFixed(1)+'% of workforce' },
  wage:         { icon:'money',    label:'Monthly wage bill', value:TZSm(TOTAL_WAGE), sub:'HR → Exact hand-off · Jun', trend:'+1.8%', trendDir:'up' },
  liability:    { icon:'clock',    label:'Leave liability', value:TZSm(LEAVE_LIABILITY), sub:'outstanding leave, monetised', trend:'-4.2%', trendDir:'up' },
  turnover:     { icon:'trend',    label:'Turnover (YTD)', value:'4.1%', sub:'see KPI Scorecard', trend:'-0.6%', trendDir:'up' }, // owned by KPI Scorecard — not surfaced on dashboards
  ltiDays:      { icon:'shield',   label:'Days since LTI', value:HSEQ_KPI.daysSinceLTI, sub:'last: Dar Yard, 19 Jun' },
  ot:           { icon:'trend',    label:'Overtime (MTD)', value:TOTAL_OT.toLocaleString(), unit:'hrs', sub:'auto-consolidated' },
  clockedIn:    { icon:'clock',    label:'Clocked in today', value:(TOTAL_HC-TOTAL_ONLEAVE).toLocaleString(), sub:'GPS · biometric · kiosk', trend:'98.2%', trendDir:'up' },
};
// HSEQ read-only KPIs surfaced to NON-SHEQ roles (no module access — figures only).
const HQ = {
  lti:      { icon:'shield', label:'Days since LTI',  value:HSEQ_KPI.daysSinceLTI, sub:'group safety indicator' },
  medicals: { icon:'heart',  label:'Medicals valid',  value:'97%', sub:'OSHA certified', trend:'11 expiring', trendDir:'dn' },
  ppe:      { icon:'shield', label:'PPE compliance',   value:'94%', sub:'issued & in-date', trend:'+3%', trendDir:'up' },
  incidents:{ icon:'alert',  label:'Incidents (MTD)',  value:HSEQ_KPI.incidentsMTD, sub:HSEQ_KPI.ltiYTD+' LTI YTD' },
};
function siteLTI(site){ const s=SITES.find(x=>x.name===site); return { icon:'shield', label:'Days since LTI', value:s&&s.lti?0:HSEQ_KPI.daysSinceLTI, sub:site+' · site safety' }; }
function pending(types){ return APPROVALS.filter(a=>types.includes(a.type)).length; }

const ROLES = [
  { id:'employee', name:'Joseph Mlimani', initials:'JM', title:'Employee (ESS)', dept:'Equipment Operator — Mwadui',
    email:'joseph.mlimani@taifamining.tz', scope:'Mwadui', money:false, mobile:true, landing:'ess', pages:['ess'], approves:[],
    blurb:'Self-service on a phone — profile, payslips, leave, attendance, appraisals, training & grievances.',
    access:{ view:'Own profile, payslips, leave, attendance, appraisals, training, grievances',
             edit:'Contact details, next of kin, leave requests, grievances', approve:'No approval rights' } },

  { id:'supervisor', name:'Grace Ndaki', initials:'GN', title:'Supervisor / Team Leader', dept:'Field team — Mwadui',
    email:'grace.ndaki@taifamining.tz', scope:'Mwadui', money:false, landing:'overview',
    pages:['overview','leave','performance','training','approvals','reports'], approves:['leave','overtime','attendance','appraisal'],
    blurb:'Leads a field team — approves attendance, leave, overtime and appraisals.',
    access:{ view:'Team attendance, leave, performance, training', edit:'Leave, overtime, appraisals',
             approve:'Attendance exceptions, leave, overtime, appraisals' },
    dash:{ kpis:[
      { icon:'users',label:'My team',value:'24',sub:'Mwadui field crew' },
      { icon:'clock',label:'Clocked in',value:'22 / 24',sub:'2 on leave today', trend:'92%', trendDir:'up' },
      { icon:'check',label:'Pending approvals',value:pending(['leave','overtime','attendance','appraisal']),sub:'awaiting your sign-off', trend:'action', trendDir:'dn' },
      { icon:'award',label:'Appraisals due',value:'5',sub:'Q2 cycle · this week' } ],
      panels:['approvals','attendance','leaveReq'] } },

  { id:'super', name:'Yusuph Kabweza', initials:'YK', title:'Superintendent / Manager', dept:'Operations — Mwadui',
    email:'yusuph.kabweza@taifamining.tz', scope:'Mwadui', money:false, landing:'overview',
    pages:['overview','employees','leave','performance','training','approvals','reports'], approves:['leave','overtime','appraisal','training'],
    blurb:'Runs a department — approves leave, overtime, appraisals and training.',
    access:{ view:'Department employees, attendance, overtime, performance reports', edit:'Leave, overtime, appraisals, training',
             approve:'Leave, overtime, appraisals, training' },
    dash:{ kpis:[
      { icon:'users',label:'Department',value:'96',sub:'across 4 teams' },
      { icon:'trend',label:'Overtime (MTD)',value:'412',unit:'hrs',sub:'within budget' },
      { icon:'check',label:'Pending approvals',value:pending(['leave','overtime','appraisal','training']),sub:'awaiting sign-off', trend:'action', trendDir:'dn' },
      { icon:'award',label:'Appraisals due',value:'12',sub:'Q2 cycle · this week' } ],
      panels:['approvals','attendance','training'] } },

  { id:'pm', name:'Ramadhan Mchomvu', initials:'RM', title:'Project Manager', dept:'Mwadui Project',
    email:'ramadhan.mchomvu@taifamining.tz', scope:'Mwadui', money:false, landing:'overview',
    pages:['overview','employees','leave','performance','grievances','approvals','reports'], approves:['recruitment','leave','overtime','appraisal','grievance'],
    blurb:'Owns a project site — approves recruitment, leave, overtime, appraisals and grievance outcomes.',
    access:{ view:'All project employees, project labour reports, grievances · HSEQ figures (read-only)', edit:'Recruitment, leave, overtime, appraisals, grievance outcomes',
             approve:'Recruitment, leave, overtime, appraisals, grievance outcomes' },
    dash:{ kpis:[
      { icon:'users',label:'Project workforce',value:'412',sub:'Mwadui · 38 on leave' },
      { icon:'clock',label:'Labour today',value:'374',sub:'clocked in · 90.8%', trend:'on plan', trendDir:'up' },
      { icon:'flag',label:'Open grievances',value:'2',sub:'1 at risk' },
      { icon:'check',label:'Pending approvals',value:pending(['recruitment','leave','overtime','appraisal','grievance']),sub:'awaiting sign-off', trend:'action', trendDir:'dn' },
      { icon:'shield',label:'Days since LTI',value:HSEQ_KPI.daysSinceLTI,sub:'Mwadui site safety'} ],
      panels:['approvals','grievances','attendance','safety'] } },

  { id:'hod', name:'Hawa Yusuph', initials:'HY', title:'Head of Department', dept:'Mining & Civil',
    email:'hawa.yusuph@taifamining.tz', scope:'all', money:true, landing:'overview',
    pages:['overview','employees','performance','training','approvals','reports'], approves:['recruitment','leave','promotion','appraisal','training'],
    blurb:'Department head — approves recruitment, leave, promotions, appraisals and training.',
    access:{ view:'Department workforce, labour costs, recruitment', edit:'Recruitment, leave, promotions, appraisals, training',
             approve:'Recruitment, leave, promotions, appraisals, training' },
    dash:{ kpis:[
      { icon:'users',label:'Workforce',value:TOTAL_HC.toLocaleString(),sub:'all departments' },
      { icon:'money',label:'Labour cost (MTD)',value:TZSm(TOTAL_WAGE+TOTAL_OT*18000),sub:'wages + overtime', trend:'+2.1%', trendDir:'dn' },
      { icon:'briefcase',label:'Open recruitment',value:'4',sub:'requisitions in flight' },
      { icon:'award',label:'Promotions pending',value:'3',sub:'awaiting your approval' },
      { icon:'check',label:'Pending approvals',value:pending(['recruitment','leave','promotion','appraisal','training']),sub:'action required', trend:'action', trendDir:'dn' } ],
      panels:['approvals','recruit','labourCost'] } },

  { id:'hrofficer', name:'Ali Mbaruk', initials:'AM', title:'HR Officer', dept:'Human Resources',
    email:'ali.mbaruk@taifamining.tz', scope:'all', money:false, landing:'overview',
    pages:['overview','employees','leave','performance','training','grievances','reports'], approves:[],
    blurb:'Maintains employee records, contracts, leave and recruitment.',
    access:{ view:'Employee records, contracts, leave, recruitment', edit:'Maintain employee records and contracts',
             approve:'No approval rights' },
    dash:{ kpis:[
      { icon:'users',label:'Employee records',value:TOTAL_HC.toLocaleString(),sub:'single source of truth' },
      { icon:'alert',label:'Contracts expiring',value:'7',sub:'next 30 days', trend:'2 critical', trendDir:'dn' },
      { icon:'calendar',label:'Leave requests',value:'5',sub:'to process' },
      { icon:'briefcase',label:'Open recruitment',value:'4',sub:'OSHA medical stage' },
      HQ.medicals ],
      panels:['expiry','leaveReq','recruit'] } },

  { id:'projhr', name:'Neema Joseph', initials:'NJ', title:'Project HR Officer', dept:'Human Resources — Mwadui',
    email:'neema.joseph@taifamining.tz', scope:'Mwadui', money:false, landing:'overview',
    pages:['overview','employees','leave','performance','training','grievances','reports'], approves:['leave','appraisal'],
    blurb:'Site-based HR — employee records, leave and recruitment for one project. Receives site HSEQ figures (no module access).',
    access:{ view:'Site employee records, contracts, leave, recruitment · site HSEQ figures (read-only)',
             edit:'Maintain site employee records and contracts', approve:'Leave, appraisals (site)' },
    dash:{ kpis:[
      { icon:'users',label:'Site headcount',value:'412',sub:'Mwadui · single source' },
      { icon:'alert',label:'Contracts expiring',value:'3',sub:'next 30 days · Mwadui', trend:'1 critical', trendDir:'dn' },
      { icon:'calendar',label:'Leave requests',value:'2',sub:'to process' },
      siteLTI('Mwadui'),
      HQ.medicals ],
      panels:['expiry','leaveReq','attendance'] } },

  { id:'hrhead', name:'Omid Karembeck', initials:'OK', title:'Head of HR', dept:'Human Resources',
    email:'omid.karembeck@taifamining.tz', scope:'all', money:true, landing:'overview',
    pages:['overview','employees','leave','performance','training','grievances','approvals','reports','integration','migration','admin','org'],
    approves:['promotion','salary','requisition','transfer','appraisal'],
    blurb:'Full HR authority — approves promotions, salary changes, requisitions, transfers and policy.',
    access:{ view:'All employee and HR records', edit:'Promotions, salary changes, requisitions, transfers, senior appraisals, policy',
             approve:'Promotions, salary changes, requisitions, transfers, senior appraisals, policy changes' },
    dash:{ kpis:[ K.headcount, K.wage, K.liability, K.onLeave, HQ.medicals,
      { icon:'check',label:'Pending approvals',value:pending(['promotion','salary','requisition','transfer','appraisal']),sub:'HR sign-off', trend:'action', trendDir:'dn' } ],
      panels:['siteWage','roleComp','exits','expiry','approvals'] } },

  { id:'payroll', name:'Cecilia Mushi', initials:'CM', title:'Payroll Officer', dept:'Finance — Payroll',
    email:'cecilia.mushi@taifamining.tz', scope:'all', money:true, landing:'overview',
    pages:['overview','payroll','integration','reports'], approves:[],
    blurb:'Processes payroll transactions and statutory deductions.',
    access:{ view:'Salary, deductions, statutory contributions', edit:'Payroll transactions and statutory deductions',
             approve:'Payroll transactions and statutory deductions' },
    dash:{ kpis:[
      { icon:'money',label:'Gross pay (Jun)',value:TZSm(PAYROLL.gross),sub:'1,061 payslips' },
      { icon:'money',label:'Net pay',value:TZSm(PAYROLL.net),sub:'after deductions' },
      { icon:'shield',label:'NSSF',value:TZSm(106_100_000),sub:'10% + 10% employer' },
      { icon:'doc',label:'PAYE',value:TZSm(148_540_000),sub:'income tax bands' },
      { icon:'check',label:'Payslips ready',value:'1,061',sub:'11 pending · 5 on hold' } ],
      panels:['payroll','payslip','integration'] } },

  { id:'finance', name:'Omar Said', initials:'OS', title:'Finance Manager', dept:'Finance', readonly:true,
    email:'omar.said@taifamining.tz', scope:'all', money:true, landing:'overview',
    pages:['overview','payroll','integration','approvals','reports'], approves:['recruitment'],
    blurb:'Owns labour cost — approves payroll budgets and recruitment affordability.',
    access:{ view:'Payroll summaries, labour costs, statutory liabilities', edit:'Payroll budgets and recruitment affordability',
             approve:'Payroll budgets, recruitment affordability' },
    dash:{ kpis:[
      { icon:'money',label:'Wage bill (Jun)',value:TZSm(TOTAL_WAGE),sub:'5 sites', trend:'+1.8%', trendDir:'dn' },
      { icon:'trend',label:'Labour cost ratio',value:'31.4%',sub:'of project revenue' },
      { icon:'shield',label:'Statutory liability',value:TZSm(310_541_000),sub:'NSSF+PAYE+SDL+WCF' },
      { icon:'clock',label:'Leave liability',value:TZSm(LEAVE_LIABILITY),sub:'monetised', trend:'-4.2%', trendDir:'up' },
      { icon:'briefcase',label:'Budget variance',value:'+2.1%',sub:'vs June plan', trend:'review', trendDir:'dn' } ],
      panels:['labourCost','payroll','siteWage'] } },

  { id:'sheq', name:'Amina Hassan', initials:'AH', title:'SHEQ Manager', dept:'Safety, Health, Environment & Quality',
    email:'amina.hassan@taifamining.tz', scope:'all', money:false, landing:'overview',
    pages:['overview','hseq','training','reports'], approves:[],
    blurb:'Owns safety & compliance — medical records, certifications, incidents and PPE.',
    access:{ view:'Medical records, certifications, incidents, PPE', edit:'Maintain safety and compliance records',
             approve:'Safety and compliance records' },
    dash:{ kpis:[
      { icon:'shield',label:'Days since LTI',value:HSEQ_KPI.daysSinceLTI,sub:'last: Dar Yard, 19 Jun' },
      { icon:'alert',label:'Incidents (MTD)',value:HSEQ_KPI.incidentsMTD,sub:HSEQ_KPI.ltiYTD+' LTI YTD' },
      { icon:'doc',label:'Open WCF claims',value:HSEQ_KPI.openWCF,sub:'Workers Comp. Fund' },
      { icon:'check',label:'PPE compliance',value:'94%',sub:'issued & in-date', trend:'+3%', trendDir:'up' },
      { icon:'heart',label:'Medicals valid',value:'97%',sub:'OSHA certified', trend:'11 expiring', trendDir:'dn' } ],
      panels:['incidents','safety','competency'] } },

  { id:'ceo', name:'Richard Tainton', initials:'RT', title:'COO / CEO', dept:'Executive', readonly:true, expat:true,
    email:'richard.tainton@taifamining.tz', scope:'all', money:true, landing:'overview',
    pages:['overview','approvals','reports','org'], approves:['appointment','salary'],
    blurb:'Executive oversight — approves senior appointments, salary structures and appeals.',
    access:{ view:'All organizational dashboards and reports', edit:'Senior appointments, salary structures, appeals',
             approve:'Senior appointments, salary structures, appeals' },
    dash:{ kpis:[ K.headcount, K.wage, K.liability, K.ltiDays, K.clockedIn,
      { icon:'check',label:'Senior approvals',value:pending(['appointment','salary']),sub:'executive sign-off', trend:'action', trendDir:'dn' } ],
      panels:['siteWage','roleComp','safety','exits','approvals'] } },

  { id:'it', name:'Rajesh Pillai', initials:'RP', title:'IT Administrator', dept:'Information Technology',
    email:'rajesh.pillai@taifamining.tz', scope:'all', money:false, landing:'admin',
    pages:['admin','integration','migration','reports','org'], approves:['provisioning','access'],
    blurb:'System owner — provisioning, role-based access, audit-trail integrity and the Exact integration.',
    access:{ view:'All accounts, role matrix, audit trail, integration health',
             edit:'User provisioning, role assignments, access rights, system configuration',
             approve:'Account provisioning, access-right changes, de-provisioning' },
    dash:{ kpis:[
      { icon:'users',label:'Active accounts',value:'1,061',sub:'of 1,077 employees' },
      { icon:'shield',label:'Roles configured',value:'12',sub:'confidentiality matrix' },
      { icon:'alert',label:'Pending provisioning',value:'2',sub:'awaiting approval', trend:'action', trendDir:'dn' },
      { icon:'doc',label:'Audit integrity',value:'OK',sub:'hash-chained · verified' } ],
      panels:['approvals'] } },
];
const roleById = (id) => ROLES.find(r=>r.id===id);
// Org reporting lines — every role (managers included) reports to someone.
const REPORTS_TO = {
  employee:'Grace Ndaki · Supervisor', supervisor:'Yusuph Kabweza · Superintendent',
  super:'Ramadhan Mchomvu · Project Manager', pm:'Hawa Yusuph · Head of Department',
  hod:'Richard Tainton · COO/CEO', hrofficer:'Omid Karembeck · Head of HR',
  hrhead:'Richard Tainton · COO/CEO', payroll:'Omar Said · Finance Manager',
  finance:'Richard Tainton · COO/CEO', sheq:'Richard Tainton · COO/CEO', ceo:'Board of Directors',
  it:'Omid Karembeck · Head of HR', projhr:'Omid Karembeck · Head of HR',
};
ROLES.forEach(r=>{ r.reportsTo = REPORTS_TO[r.id]; });
// KPI scorecard — aligned per role; surfaced in nav right after the landing page (ESS employee gets it in-app).
ROLES.forEach(r=>{ if(!r.mobile && !r.pages.includes('kpis')){
  const i = r.pages.indexOf('overview');
  if(i>=0) r.pages.splice(i+1,0,'kpis'); else r.pages.unshift('kpis');
}});
window.ROLES = ROLES; window.roleById = roleById; window.REPORTS_TO = REPORTS_TO;
