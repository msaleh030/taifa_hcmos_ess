// Template-driven configuration — extracted from RailGrid/Taifa requirements workbooks
// (Time-Leave, Performance-Recruit, ESS). These drive the live flows and features.

// ── Leave types & accrual rules (Template 3 · Leave Types) ──
const LEAVE_TYPES = [
  { type:'Annual Leave',        code:'ANN',    paid:true,  accrual:'Monthly accrual', entitlement:'30', rate:'2.5/mo', carry:'7', docs:false, note:'Accrues pro-rata monthly · carry-over capped' },
  { type:'Sick Leave',          code:'SICK',   paid:true,  accrual:'Annual entitlement', entitlement:'126', rate:'—', carry:'0', docs:true,  note:'63 days full pay + 63 days half pay · medical certificate required' },
  { type:'Maternity Leave',     code:'MAT',    paid:true,  accrual:'Event based', entitlement:'84 / 100', rate:'—', carry:'0', docs:true,  note:'84 days (100 for twins) · lactation 2 paid hrs/day to 6 months' },
  { type:'Paternity Leave',     code:'PAT',    paid:true,  accrual:'Event based', entitlement:'3', rate:'—', carry:'0', docs:false, note:'3 paid days within 7 days of birth' },
  { type:'Compassionate Leave', code:'COMP',   paid:true,  accrual:'Event based', entitlement:'4', rate:'—', carry:'—', docs:true,  note:'Up to 7 days · death of close family' },
  { type:'Study Leave',         code:'STUDY',  paid:true,  accrual:'By approval', entitlement:'5', rate:'—', carry:'—', docs:true,  note:'Job-related study or exams · operational needs considered' },
  { type:'Unpaid Leave',        code:'UNP',    paid:false, accrual:'By approval', entitlement:'0', rate:'—', carry:'0', docs:true,  note:'Up to 30 days · extension by written agreement' },
  { type:'Medical Referral',    code:'MEDREF', paid:true,  accrual:'Event based', entitlement:'—', rate:'—', carry:'—', docs:true,  note:'Work-injury referral treated as business travel' },
];

// ── Approval routing (Template 3 · Approval Routing) ──
const LEAVE_ROUTE = [
  'Employee — Request', 'HR Officer — Verify balance', 'Supervisor — Recommend',
  'HoD / Project Manager — Approve', 'HR Manager — Approve', 'Final Approver — by category',
];
const LEAVE_ROUTE_RULE = 'Final approver depends on category — Junior project staff: Project Manager · Senior supervisors (Superintendent+): Head of HR · Expatriates: CEO.';

// ── Performance review cycles (Template 4 · Review Cycles) ──
const REVIEW_CYCLES = [
  { name:'FY26 Annual Performance', type:'Annual',    start:'01/07/2026', end:'30/06/2027', applies:'All employees' },
  { name:'FY26 Mid-Year Review',    type:'Bi-annual', start:'01/07/2026', end:'31/12/2026', applies:'All employees' },
  { name:'Q1 Performance Check-in', type:'Quarterly', start:'01/07/2026', end:'30/09/2026', applies:'Management / Supervisory' },
  { name:'Probation Review (30–180d)', type:'Probation', start:'From start date', end:'Day 30–180', applies:'New hires' },
];
const RATING_SCALE = [
  { v:5, label:'Outstanding',                 min:90, max:100, tone:'green'  },
  { v:4, label:'Exceeds Expectations',        min:75, max:89,  tone:'green'  },
  { v:3, label:'Meets Expectations',          min:60, max:74,  tone:'blue'   },
  { v:2, label:'Partially Meets Expectations',min:45, max:59,  tone:'yellow' },
  { v:1, label:'Unsatisfactory',              min:0,  max:45,  tone:'red'    },
];

// ── Recruitment (Template 4 · Requisition Workflow + Pipeline Stages) ──
const REQUISITION_WORKFLOW = [
  { no:1, step:'Requisition Raised',      role:'Requesting HoD',  sla:1 },
  { no:2, step:'HR Verification',         role:'Project HR',      sla:1 },
  { no:3, step:'Project Approval',        role:'Project Manager', sla:2 },
  { no:4, step:'Corporate Review',        role:'Corporate HoD',   sla:2 },
  { no:5, step:'HR Approval',             role:'Corporate HR',    sla:2 },
  { no:6, step:'Executive Approval',      role:'CEO',             sla:3 },
  { no:7, step:'Recruitment Activated',   role:'HR',              sla:1 },
];
const PIPELINE_STAGES = [
  'Requisition Approved','Vacancy Posted','Applications','Screening','Shortlisted','HR Interview',
  'Technical Assessment','Technical Interview','Final Interview','Reference Check','Medical (OSHA)',
  'Selected','Offer Approval','Offer Issued','Offer Accepted','Pre-Employment Clearance',
  'Ready for Onboarding','Joined','Probation Review','Confirmed',
];
const ONBOARDING_STEPS = [
  { no:1,  task:'Offer letter & contract',          owner:'HR',              timing:'Pre-start', sys:'System' },
  { no:2,  task:'Collect pre-employment documents',  owner:'HR',              timing:'Pre-start', sys:'System' },
  { no:3,  task:'Medical fitness / site clearance',  owner:'HR / HSE',        timing:'Pre-start', sys:'Manual' },
  { no:4,  task:'Create employee profile in HRMS',   owner:'HR',              timing:'Pre-start', sys:'System' },
  { no:5,  task:'Create email & system accounts',    owner:'IT',              timing:'Pre-start', sys:'System' },
  { no:6,  task:'Workstation, tools, PPE',           owner:'Supervisor / HSE',timing:'Day 1',     sys:'Manual' },
  { no:7,  task:'Welcome & company orientation',     owner:'HR',              timing:'Day 1',     sys:'Manual' },
  { no:8,  task:'Site induction & safety briefing',  owner:'HSE',             timing:'Day 1',     sys:'Manual' },
  { no:9,  task:'Departmental induction',            owner:'Supervisor / HoD',timing:'Week 1',    sys:'Manual' },
  { no:10, task:'Policy acknowledgement',            owner:'HR',              timing:'Week 1',    sys:'System' },
  { no:11, task:'Probation objectives & KPIs',       owner:'Supervisor',      timing:'Week 1',    sys:'System' },
  { no:12, task:'30 / 60 / 90-day check-ins',        owner:'Supervisor',      timing:'Month 1–3', sys:'System' },
  { no:13, task:'Confirmation of employment',        owner:'HoD & HR',        timing:'Post-probation', sys:'System' },
];

// ── ESS scope & manager approvals (Template 5) ──
const ESS_SCOPE = [
  { feature:'View Payslip',           enabled:true, mode:'View only', approval:false },
  { feature:'Request Leave',          enabled:true, mode:'Edit',      approval:true  },
  { feature:'View Leave Balance',     enabled:true, mode:'View only', approval:false },
  { feature:'Edit Profile (contact)', enabled:true, mode:'Edit',      approval:true  },
  { feature:'Clock In / Out',         enabled:true, mode:'Capture',   approval:false },
  { feature:'Submit Training Request',enabled:true, mode:'Edit',      approval:true  },
  { feature:'View Performance Reviews',enabled:true,mode:'View only', approval:false },
];
const MANAGER_APPROVALS = [
  { req:'Leave',                first:'Line Manager', second:'HR',      cond:'> 5 days',        sla:24,  esc:'Department Head' },
  { req:'Profile Change',       first:'HR',           second:'—',       cond:'Bank/address',    sla:24,  esc:'HR' },
  { req:'Timesheet',            first:'Line Manager', second:'—',       cond:'Always',          sla:24,  esc:'HR' },
  { req:'Overtime',             first:'Line Manager', second:'HR',      cond:'> 10 hours',      sla:24,  esc:'Department Head' },
  { req:'Training Request',     first:'Line Manager', second:'HR',      cond:'Always',          sla:72,  esc:'Department Head' },
  { req:'Bank Detail Change',   first:'HR Manager',   second:'—',       cond:'Always',          sla:24,  esc:'HR Director' },
];

// Course catalogue employees can request via ESS
const COURSE_CATALOGUE = [
  'OSHA Safety Refresher','Defensive Driving','Heavy Equipment Operation','First Aid & Emergency',
  'Environmental Awareness','Supervisory Skills','Excavator Authorisation','Confined Space Entry',
];

Object.assign(window, {
  LEAVE_TYPES, LEAVE_ROUTE, LEAVE_ROUTE_RULE, REVIEW_CYCLES, RATING_SCALE,
  REQUISITION_WORKFLOW, PIPELINE_STAGES, ONBOARDING_STEPS, ESS_SCOPE, MANAGER_APPROVALS, COURSE_CATALOGUE,
});

// ── ISO 9001:2015 policy library — key points employees must read before signing ──
// Extracted from Taifa Mining & Civils signed policy set (Rev.01, Feb 2025).
const POLICY_REV = 'Rev.01 · Feb 2025 · ISO 9001:2015';
const POLICIES_FULL = [
  { id:'COC', name:'Code of Conduct', cat:'Conduct', pages:10, points:[
    'Core values bind every employee: Performance, Innovation, Client focus, Teamwork and Trust.',
    'Highest integrity and consistency are required in all actions, at all times.',
    'The Code is the compulsory framework under which all other policies are issued.',
    'Belonging to Taifa Group means adhering to this Code unreservedly.' ] },
  { id:'ABC', name:'Anti-Bribery, Anti-Corruption & AML', cat:'Ethics', pages:16, points:[
    'Zero tolerance for bribes, kickbacks or facilitation payments — given or received.',
    'Gifts, hospitality, charitable and political donations must follow the stated limits and be recorded.',
    'Special care applies to dealings with public officials; no improper advantage may be offered.',
    'Suspected bribery, corruption or money-laundering must be reported through official channels.' ] },
  { id:'ANP', name:'Anti-Nepotism Policy', cat:'Ethics', pages:9, points:[
    'All appointments and promotions are made strictly on merit and fair competition.',
    'Employees must disclose any family or close personal relationship that could create a conflict of interest.',
    'Relatives may not supervise, or influence employment decisions about, one another.',
    'Undisclosed conflicts of interest are treated as a breach of conduct.' ] },
  { id:'CHL', name:'Child Labour Policy', cat:'Human Rights', pages:3, points:[
    'Operations and supply chains must be entirely free of child labour.',
    'Minimum working age is 14 — or the legal minimum where higher (ILO C138, UN CRC).',
    'No work that is hazardous or that interferes with a child\u2019s schooling is permitted.',
    'Applies to all employees, contractors, suppliers and partners across every site.' ] },
  { id:'HRT', name:'Human Rights Policy', cat:'Human Rights', pages:4, points:[
    'We respect the rights and dignity of all people and conduct business honestly, fairly and legally.',
    'Zero tolerance for child labour, forced labour and discrimination.',
    'Workers\u2019 right to form and join unions is respected.',
    'Guided by the UDHR, ILO fundamental principles and the UN Guiding Principles on Business & Human Rights.' ] },
  { id:'EEO', name:'Equal Employment Opportunity', cat:'Fair Work', pages:2, points:[
    'No discrimination on age, colour, disability, marital status, origin, race, religion, gender or other protected status.',
    'All employment decisions are based solely on qualifications and ability to do the job.',
    'Recruitment of women, minorities and persons with disabilities is actively encouraged.',
    'Applies to hiring, promotion, compensation, benefits and termination alike.' ] },
  { id:'GHD', name:'Gender, Harassment & Discrimination', cat:'Fair Work', pages:4, points:[
    'The workplace must be free of harassment and discrimination based on gender, identity or expression.',
    'Covers meetings, company platforms, work-related social media and travel.',
    'Verbal, physical or visual conduct that creates a hostile environment is prohibited.',
    'Reports are handled fairly and confidentially; retaliation is not tolerated.' ] },
  { id:'HIV', name:'HIV / AIDS Policy', cat:'Health', pages:5, points:[
    'HIV/AIDS is treated as any other serious illness — employees can keep working while managing it.',
    'Non-discrimination and confidentiality regardless of real or perceived HIV status.',
    'HIV-positive employees keep the same rights and benefits as everyone else.',
    'Gender equality, prevention and awareness are actively promoted.' ] },
  { id:'HRP', name:'HR Policy', cat:'HR', pages:4, points:[
    'Provides fair, transparent HR management compliant with law and industry standards.',
    'Recruitment is equal-opportunity; selection through requisition, screening, interview and assessment.',
    'New employees serve a probationary period assessed for confirmation.',
    'Salaries are paid monthly with statutory deductions (tax, social security).' ] },
  { id:'LVP', name:'Leave Policy', cat:'Leave', pages:4, points:[
    'All leave must be recorded on a leave form — no exceptions (emergency leave filed after the event).',
    'Entitlement: 28 days (contract), 30 days (permanent); expatriates per approved rotation.',
    'No annual leave in the first six months; thereafter pro-rata on earned days.',
    'Notice: emergency 1 day (max 3), two weeks\u2019 leave 14 days, one month\u2019s leave 30 days.' ] },
  { id:'LEN', name:'Leave Encashment Policy', cat:'Leave', pages:2, points:[
    'Only accrued annual leave is eligible for encashment.',
    'Minimum 28 accrued days required; subject to CEO approval.',
    'Paid at most once every 2 years, up to a maximum of 30 days.',
    'Leave encashment is taxable under the applicable Income Tax Regulations.' ] },
  { id:'REC', name:'Recruitment Policy', cat:'HR', pages:5, points:[
    'Recruitment is merit-based, attracting candidates aligned with company objectives and culture.',
    'Begins with departmental requisitions stating reason, number, JD and required qualifications.',
    'Job analysis defines duties, skills and working conditions for each role.',
    'Process includes screening, interviews, security screening and assessment — fair and unbiased.' ] },
  { id:'SUC', name:'Succession Plan Policy', cat:'HR', pages:4, points:[
    'Ensures timely filling of critical positions for business continuity.',
    'Identifies and nurtures high-potential employees for internal progression.',
    'Optimises labour cost by developing and retaining competent staff.',
    'HR facilitates and oversees the succession process across all departments.' ] },
  { id:'TRN', name:'Training Policy', cat:'HR', pages:5, points:[
    'Develops employees\u2019 skills for performance and career advancement.',
    'All new employees must attend new-employee orientation within three (3) days.',
    'HR Department and Heads of Department jointly own professional development.',
    'Training is administered consistently according to the documented procedure.' ] },
  { id:'CEP', name:'Community Engagement Plan', cat:'Community', pages:3, points:[
    'Engages local communities through education, skills development and job readiness.',
    'Partners with schools/colleges on internships and apprenticeships.',
    'Hiring is inclusive, equitable and bias-free, with broad local reach.',
    'Builds positive, long-term relationships with host communities.' ] },
];

// ── Payslip history (ME · illustrative TZS) ──
const PAYSLIPS = [
  { id:'PS-2606', period:'June 2026', date:'2026-06-28', status:'Pending', basic:980000, housing:240000, transport:120000, overtime:96000,
    paye:188000, nssf:134000, sdl:0, advances:0, net:1114000 },
  { id:'PS-2605', period:'May 2026', date:'2026-05-28', status:'Paid', basic:980000, housing:240000, transport:120000, overtime:144000,
    paye:196000, nssf:134000, sdl:0, advances:50000, net:1104000 },
  { id:'PS-2604', period:'April 2026', date:'2026-04-28', status:'Paid', basic:980000, housing:240000, transport:120000, overtime:72000,
    paye:180000, nssf:134000, sdl:0, advances:0, net:1098000 },
  { id:'PS-2603', period:'March 2026', date:'2026-03-28', status:'Paid', basic:960000, housing:240000, transport:120000, overtime:108000,
    paye:184000, nssf:132000, sdl:0, advances:0, net:1092000 },
];

Object.assign(window, { POLICY_REV, POLICIES_FULL, PAYSLIPS });
