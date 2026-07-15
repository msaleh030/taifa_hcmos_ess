// SHEQ suite data — Safety, Health, Environment & Quality (Taifa Mining).
const HAZARDS = [
  { id:'HZ-204', site:'Mwadui',   desc:'Haul road dust — reduced visibility', cat:'Physical', likelihood:4, severity:3, controls:'Water bowser schedule; speed limits', owner:'Pit Supervisor', status:'Controlled' },
  { id:'HZ-203', site:'Dar Yard', desc:'Workshop grinding sparks near fuel store', cat:'Fire', likelihood:3, severity:5, controls:'Hot-work permit; relocate fuel; extinguishers', owner:'Workshop Mgr', status:'Action open' },
  { id:'HZ-202', site:'Nyanzaga', desc:'Manual handling — drill rods', cat:'Ergonomic', likelihood:3, severity:2, controls:'Mechanical aids; team lift SOP', owner:'Drill Lead', status:'Controlled' },
  { id:'HZ-201', site:'Mwadui',   desc:'Working at height — conveyor maintenance', cat:'Fall', likelihood:2, severity:5, controls:'Harness; permit; edge protection', owner:'Mech Supervisor', status:'Monitored' },
  { id:'HZ-200', site:'North Mara',desc:'Noise exposure — crusher area', cat:'Health', likelihood:4, severity:2, controls:'Hearing PPE; rotation; signage', owner:'HSEQ Officer', status:'Controlled' },
];
const INSPECTIONS = [
  { id:'INS-512', site:'Mwadui',   type:'Planned site walk', date:'2026-06-22', findings:3, closed:2, score:92, by:'A. Hassan' },
  { id:'INS-511', site:'Dar Yard', type:'Workshop 5S audit', date:'2026-06-20', findings:5, closed:3, score:84, by:'A. Hassan' },
  { id:'INS-510', site:'Nyanzaga', type:'Equipment pre-start', date:'2026-06-19', findings:1, closed:1, score:97, by:'R. Mchomvu' },
  { id:'INS-509', site:'Geita Civil',type:'Emergency drill', date:'2026-06-16', findings:2, closed:2, score:90, by:'A. Hassan' },
];
const PERMITS = [
  { id:'PTW-1208', type:'Hot work',        site:'Dar Yard', area:'Workshop bay 3', issued:'07:10', expires:'15:00', status:'Active',   holder:'M. Said' },
  { id:'PTW-1207', type:'Working at height',site:'Mwadui',  area:'Conveyor CV-2',  issued:'06:40', expires:'14:00', status:'Active',   holder:'S. Mlay' },
  { id:'PTW-1206', type:'Confined space',  site:'Nyanzaga', area:'Sump pit',       issued:'06:00', expires:'12:00', status:'Active',   holder:'D. Otieno' },
  { id:'PTW-1205', type:'Excavation',      site:'Geita Civil',area:'Trench T-4',   issued:'Yest',  expires:'Closed', status:'Closed',  holder:'F. Ally' },
  { id:'PTW-1204', type:'Electrical isolation',site:'Mwadui',area:'MCC room',      issued:'06:20', expires:'10:30', status:'Expiring', holder:'Abhey K.' },
];
const ENVIRONMENT = {
  kpis:[ {icon:'leaf',label:'Reportable spills (YTD)',value:1,sub:'contained · closed'},
    {icon:'leaf',label:'Water recycled',value:'71%',sub:'process water'},
    {icon:'leaf',label:'Dust exceedances (MTD)',value:2,sub:'PM10 monitoring'},
    {icon:'leaf',label:'Rehab area',value:'18.4',unit:'ha',sub:'progressive rehabilitation'} ],
  log:[ {item:'Hydrocarbon spill — 20L', site:'Nyanzaga', date:'2026-06-11', status:'Closed', tone:'green'},
    {item:'Dust PM10 exceedance', site:'Mwadui', date:'2026-06-09', status:'Monitoring', tone:'yellow'},
    {item:'Noise survey — crusher', site:'North Mara', date:'2026-06-05', status:'Action', tone:'yellow'},
    {item:'Waste manifest — hazardous', site:'Dar Yard', date:'2026-06-02', status:'Compliant', tone:'green'} ],
};
const OCC_HEALTH = {
  kpis:[ {icon:'heart',label:'Medicals valid',value:'97%',sub:'OSHA certified'},
    {icon:'alert',label:'Due / overdue',value:11,sub:'next 30 days'},
    {icon:'shield',label:'Fitness-for-duty',value:'99%',sub:'fit to work'},
    {icon:'doc',label:'Exposure cases',value:3,sub:'noise · dust monitoring'} ],
  surveillance:[ {prog:'Pre-employment medical', due:14, done:62, of:62},
    {prog:'Periodic medical (annual)', due:11, done:1031, of:1077},
    {prog:'Audiometry (noise-exposed)', due:6, done:188, of:212},
    {prog:'Spirometry (dust-exposed)', due:4, done:96, of:124} ],
};
const SHEQ_TRAINING = [
  { name:'Site safety induction', cat:'Mandatory', complete:96 },
  { name:'Working at height',     cat:'Competency', complete:82 },
  { name:'Confined space entry',  cat:'Competency', complete:74 },
  { name:'Fire & emergency',      cat:'Mandatory', complete:88 },
  { name:'First aid',             cat:'Competency', complete:71 },
  { name:'Incident investigation',cat:'Specialist', complete:64 },
];
const PPE = {
  compliance: 94,
  byType:[ {item:'Hard hats', pct:99},{item:'Safety boots', pct:98},{item:'Hi-vis', pct:97},
    {item:'Eye protection', pct:92},{item:'Hearing protection', pct:88},{item:'Respirators (dust)', pct:84},{item:'Gloves', pct:95} ],
  issues:[ {site:'Mwadui', open:4},{site:'Nyanzaga', open:7},{site:'Dar Yard', open:2},{site:'North Mara', open:3},{site:'Geita Civil', open:5} ],
};
const NCRS = [
  { id:'NCR-088', site:'Dar Yard', area:'Fabrication', desc:'Weld did not meet spec WPS-12', sev:'Major', status:'Open',     raised:'2026-06-18', owner:'QA Lead' },
  { id:'NCR-087', site:'Mwadui',   area:'Maintenance', desc:'Out-of-calibration torque wrench used', sev:'Minor', status:'In review', raised:'2026-06-15', owner:'Workshop Mgr' },
  { id:'NCR-086', site:'Nyanzaga', area:'Civil',       desc:'Concrete cube strength below target', sev:'Major', status:'Open',     raised:'2026-06-12', owner:'Site Engineer' },
  { id:'NCR-085', site:'Geita Civil',area:'Procurement',desc:'Material cert missing on delivery', sev:'Minor', status:'Closed',   raised:'2026-06-04', owner:'Stores' },
];
const TOOLBOX = {
  todayDone: 9, todayPlanned: 11, attendance: 92, streak: 4,
  recent:[ {topic:'Heat stress & hydration', site:'Mwadui',   crew:'Pit crew A', n:24, date:'Today 05:45'},
    {topic:'Reversing & spotters',     site:'Dar Yard', crew:'Workshop',   n:18, date:'Today 06:00'},
    {topic:'Manual handling',          site:'Nyanzaga', crew:'Drill team', n:15, date:'Today 06:10'},
    {topic:'Hand & power tools',       site:'North Mara',crew:'Maintenance',n:9, date:'Yest 06:00'},
    {topic:'Slips, trips & falls',     site:'Geita Civil',crew:'Civil gang',n:21,date:'Yest 06:15'} ],
};
Object.assign(window,{ HAZARDS, INSPECTIONS, PERMITS, ENVIRONMENT, OCC_HEALTH, SHEQ_TRAINING, PPE, NCRS, TOOLBOX });
