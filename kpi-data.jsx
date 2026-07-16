// HR KPI catalogue — sourced from "TAIFA MINING · Human Resources Metrics" workbook.
// Each KPI: category, formula, target (display + numeric), current value, direction for RAG.
//   dir: 'up' (higher better) · 'down' (lower better) · 'band' [lo,hi] · 'monitor' (track only)
// Values are illustrative, consistent with the rest of the demo data.
const KPIS = {
  // ── Workforce ──
  headcount_growth:{ cat:'Workforce', name:'Headcount Growth', formula:'Current HC − Previous HC', target:'As per budget', value:'1,246', sub:'net +24 vs +30 plan', dir:'monitor', icon:'users' },
  turnover:       { cat:'Workforce', name:'Employee Turnover Rate', formula:'Leavers ÷ Avg HC × 100', target:'≤ 10%', value:'8.2%', v:8.2, t:10, dir:'down', unit:'%', icon:'trend' },
  termination:    { cat:'Workforce', name:'Termination Rate', formula:'Terminations ÷ Avg HC × 100', target:'< 10%', value:'3.1%', v:3.1, t:10, dir:'down', unit:'%', icon:'trend' },
  retention:      { cat:'Workforce', name:'Retention Rate', formula:'Retained ÷ Total × 100', target:'≥ 90%', value:'92.4%', v:92.4, t:90, dir:'up', unit:'%', icon:'shield' },
  absenteeism:    { cat:'Workforce', name:'Absenteeism Rate', formula:'Lost workdays ÷ Total workdays × 100', target:'≤ 2%', value:'2.1%', v:2.1, t:2, dir:'down', unit:'%', icon:'clock' },
  // ── Diversity & Inclusion ──
  female_rep:     { cat:'Diversity & Inclusion', name:'Female Representation', formula:'Female ÷ Total × 100', target:'≥ 20%', value:'18.0%', v:18, t:20, dir:'up', unit:'%', icon:'users' },
  young_ratio:    { cat:'Diversity & Inclusion', name:'Young Employee Ratio (<35)', formula:'Under 35 ÷ Total × 100', target:'30–50%', value:'44%', v:44, band:[30,50], dir:'band', unit:'%', icon:'users' },
  localization:   { cat:'Diversity & Inclusion', name:'Localization Ratio', formula:'Tanzanian ÷ Total × 100', target:'≥ 95%', value:'97.7%', v:97.7, t:95, dir:'up', unit:'%', icon:'pin' },
  female_leadership:{ cat:'Diversity & Inclusion', name:'Female Leadership Ratio', formula:'Female managers ÷ Total managers × 100', target:'≥ 15%', value:'12%', v:12, t:15, dir:'up', unit:'%', icon:'award' },
  // ── Grievances ──
  grievances_filed:{ cat:'Grievances', name:'Grievances Filed', formula:'Grievances ÷ HC × 100', target:'≤ 2%', value:'0.5%', v:0.5, t:2, dir:'down', unit:'%', icon:'flag' },
  grievance_resolution:{ cat:'Grievances', name:'Grievance Resolution Rate', formula:'Resolved ÷ Filed × 100', target:'≥ 95%', value:'88%', v:88, t:95, dir:'up', unit:'%', icon:'check' },
  // ── Disciplinary ──
  disc_opened:    { cat:'Disciplinary', name:'Disciplinary Cases Opened', formula:'Cases opened ÷ HC × 100', target:'≤ 3%', value:'1.2%', v:1.2, t:3, dir:'down', unit:'%', icon:'alert' },
  disc_closure:   { cat:'Disciplinary', name:'Disciplinary Closure Rate', formula:'Closed ÷ Opened × 100', target:'≥ 95%', value:'90%', v:90, t:95, dir:'up', unit:'%', icon:'check' },
  appeal_rate:    { cat:'Disciplinary', name:'Appeal Rate', formula:'Appeals ÷ Cases closed × 100', target:'≤ 10%', value:'7%', v:7, t:10, dir:'down', unit:'%', icon:'flag' },
  // ── Leave & Attendance ──
  leave_utilization:{ cat:'Leave & Attendance', name:'Leave Utilization', formula:'Leave taken ÷ Leave entitled × 100', target:'≥ 80%', value:'73%', v:73, t:80, dir:'up', unit:'%', icon:'calendar' },
  // ── Recruitment ──
  time_to_fill:   { cat:'Recruitment', name:'Time to Fill', formula:'Avg days to fill a vacancy', target:'≤ 30 days', value:'27', sub:'days', v:27, t:30, dir:'down', unit:'days', icon:'clock' },
  cost_per_hire:  { cat:'Recruitment', name:'Cost per Hire', formula:'Recruitment cost ÷ No. of hires', target:'Within budget', value:'TZS 410k', sub:'within budget', dir:'monitor', icon:'money' },
  offer_acceptance:{ cat:'Recruitment', name:'Offer Acceptance Rate', formula:'Accepted ÷ Total offers × 100', target:'≥ 90%', value:'93%', v:93, t:90, dir:'up', unit:'%', icon:'check' },
  // ── Talent Management ──
  internal_promotion:{ cat:'Talent Management', name:'Internal Promotion Rate', formula:'Internal promotions ÷ Positions filled × 100', target:'≥ 30%', value:'34%', v:34, t:30, dir:'up', unit:'%', icon:'trend' },
  succession:     { cat:'Talent Management', name:'Succession Coverage', formula:'Critical roles with successors ÷ Critical roles × 100', target:'≥ 80%', value:'72%', v:72, t:80, dir:'up', unit:'%', icon:'users' },
  // ── Performance ──
  perf_review:    { cat:'Performance', name:'Performance Review Completion', formula:'Completed ÷ Scheduled × 100', target:'100%', value:'74%', v:74, t:100, dir:'up', unit:'%', icon:'award' },
  kpi_achievement:{ cat:'Performance', name:'KPI Achievement Rate', formula:'KPIs achieved ÷ KPIs assigned × 100', target:'≥ 85%', value:'81%', v:81, t:85, dir:'up', unit:'%', icon:'chart' },
  high_performer: { cat:'Performance', name:'High Performer Ratio', formula:'High performers ÷ Total × 100', target:'Monitor', value:'14%', dir:'monitor', icon:'award' },
  // ── Learning & Development ──
  training_completion:{ cat:'Learning & Development', name:'Training Completion Rate', formula:'Completed ÷ Planned × 100', target:'≥ 90%', value:'87%', v:87, t:90, dir:'up', unit:'%', icon:'cap' },
  training_hours: { cat:'Learning & Development', name:'Training Hours / Employee', formula:'Total training hours ÷ HC', target:'≥ 24 hrs/yr', value:'22', sub:'hrs/yr', v:22, t:24, dir:'up', unit:'hrs', icon:'cap' },
  // ── Engagement (ESS) ──
  satisfaction_score:{ cat:'Engagement', name:'Employee Satisfaction', formula:'Survey results (favourable %)', target:'≥ 80%', value:'82%', v:82, t:80, dir:'up', unit:'%', icon:'heart' },
  satisfaction_5pt:{ cat:'Engagement', name:'Satisfaction Score (5-pt)', formula:'Avg survey score', target:'≥ 4.0', value:'4.1', sub:'/ 5', v:4.1, t:4, dir:'up', unit:'/5', icon:'heart' },
  ess_adoption:   { cat:'Engagement', name:'ESS Adoption Rate', formula:'Active ESS users ÷ Total × 100', target:'≥ 90%', value:'71%', v:71, t:90, dir:'up', unit:'%', icon:'phone' },
  online_leave:   { cat:'Engagement', name:'Online Leave Application Rate', formula:'ESS leave requests ÷ Total leave × 100', target:'100%', value:'84%', v:84, t:100, dir:'up', unit:'%', icon:'calendar' },
  // ── Compliance ──
  records_completeness:{ cat:'Compliance', name:'Employee Records Completeness', formula:'Complete records ÷ Total × 100', target:'100%', value:'98%', v:98, t:100, dir:'up', unit:'%', icon:'doc' },
};

const KPI_CAT_ORDER = ['Workforce','Diversity & Inclusion','Grievances','Disciplinary','Leave & Attendance',
  'Recruitment','Talent Management','Performance','Learning & Development','Engagement','Compliance'];

// RAG status for a KPI
function kpiStatus(k){
  if(!k || k.dir==='monitor') return 'neutral';
  if(k.dir==='up')   return k.v>=k.t ? 'green' : (k.v>=k.t*0.9 ? 'amber' : 'red');
  if(k.dir==='down') return k.v<=k.t ? 'green' : (k.v<=k.t*1.15 ? 'amber' : 'red');
  if(k.dir==='band'){ const [lo,hi]=k.band; return (k.v>=lo&&k.v<=hi) ? 'green' : ((k.v>=lo*0.9&&k.v<=hi*1.1)?'amber':'red'); }
  return 'neutral';
}

// ── Per-role alignment — each role sees the KPIs it practically owns ──
const ROLE_KPIS = {
  employee:   ['perf_review','kpi_achievement','training_completion','leave_utilization','ess_adoption'],
  supervisor: ['absenteeism','perf_review','kpi_achievement','training_completion','leave_utilization','grievances_filed'],
  super:      ['absenteeism','retention','perf_review','training_completion','internal_promotion','succession'],
  pm:         ['headcount_growth','turnover','absenteeism','retention','time_to_fill','grievance_resolution','disc_closure'],
  hod:        ['retention','turnover','succession','internal_promotion','perf_review','kpi_achievement','high_performer'],
  hrofficer:  ['records_completeness','time_to_fill','offer_acceptance','grievance_resolution','disc_closure','training_completion','leave_utilization','online_leave'],
  projhr:     ['records_completeness','absenteeism','leave_utilization','grievances_filed','grievance_resolution','disc_opened','online_leave'],
  hrhead:     ['headcount_growth','turnover','retention','absenteeism','female_rep','young_ratio','localization','female_leadership',
               'grievance_resolution','disc_closure','appeal_rate','leave_utilization','time_to_fill','cost_per_hire','offer_acceptance',
               'internal_promotion','succession','perf_review','kpi_achievement','training_completion','training_hours',
               'satisfaction_score','satisfaction_5pt','ess_adoption','records_completeness'],
  payroll:    ['absenteeism','leave_utilization','records_completeness','cost_per_hire'],
  finance:    ['headcount_growth','turnover','absenteeism','cost_per_hire','leave_utilization'],
  sheq:       ['training_completion','training_hours','absenteeism'],
  ceo:        ['headcount_growth','turnover','retention','female_rep','localization','succession','internal_promotion','kpi_achievement','satisfaction_score','ess_adoption'],
  it:         ['ess_adoption','online_leave','records_completeness'],
};

const ROLE_KPI_SCOPE = (role) => {
  if(!role) return 'organisation-wide';
  if(role.id==='employee') return 'your personal metrics';
  return role.scope && role.scope!=='all' ? role.scope+' · your remit' : 'organisation-wide';
};

// ── ANALYTICS INPUTS ───────────────────────────────────────────────────────
// Raw numerators/denominators the KPI engine divides to get accurate % values.
// These are the "data fed in" — period figures that complement what the live app
// already tracks (headcount, appraisals, training, grievances, leave, disciplinary).
const KPI_INPUTS = {
  // workforce (period = rolling 12 months)
  previousHC: 1180, budgetHC: 1276,
  voluntaryLeavers: 83, terminationsYTD: 14, retrenchments: 5,   // leavers = 83+14+5 = 102
  lostWorkdays: 1290, totalWorkdays: 61400,                       // absenteeism 2.10%
  // diversity (organisation headcount split)
  femaleCount: 226, under35Count: 548, tanzanianCount: 1218, femaleManagers: 12, totalManagers: 88,
  // recruitment
  avgDaysToFill: 27, offersAccepted: 28, offersTotal: 30, costPerHire: 410000,
  // talent
  internalPromotions: 9, positionsFilled: 26, criticalRoles: 18, criticalWithSuccessor: 13,
  // performance
  kpisAchieved: 81, kpisAssigned: 100,
  // learning & development
  totalTrainingHours: 27412,
  // engagement
  surveyFavourable: 82, surveyScore5: 4.1, essActiveUsers: 1010,
  onlineLeaveBase: 712, totalLeaveBase: 842,
  // compliance
  completeRecords: 1221,
  // leave (organisation days, rolling 12 months)
  leaveTaken: 27300, leaveEntitled: 37380,
  // disciplinary (period base — live cases issued in-app are added on top)
  discOpenedBase: 14, discClosedBase: 13, appealsBase: 1,
};

// Compute live, accurate values for every KPI from real data points + inputs.
// Returns { [id]: { value, v, sub } } merged over the static catalogue at render.
function kpiValues(){
  const I = KPI_INPUTS;
  const st = (window.HStore ? HStore.get() : {});
  const HC = (window.HStore && HStore.metrics) ? HStore.metrics().headcount : (typeof TOTAL_HC!=='undefined'?TOTAL_HC:1246);
  const APP = (typeof APPRAISALS!=='undefined') ? APPRAISALS : { complete:74, inProgress:18, notStarted:8, dist:[] };
  const TRN = (typeof TRAINING!=='undefined') ? TRAINING : { compliance:87 };
  const GRV = (typeof GRIEVANCE_KPI!=='undefined') ? GRIEVANCE_KPI : { open:6, closedYTD:23 };
  const SS  = (typeof SITES!=='undefined') ? SITES : [];
  const phones = SS.reduce((a,s)=>a+(s.smartphones||0),0);
  const avgHC = (HC + I.previousHC)/2;
  const leavers = I.voluntaryLeavers + I.terminationsYTD + I.retrenchments;
  const r1 = x => Math.round(x*10)/10;
  const pct = (n,d) => d ? (n/d*100) : 0;
  const mk = (x, unit, sub) => { const v=r1(x); return { value: unit==='%' ? v+'%' : String(v)+(unit?(' '+unit):''), v, sub }; };

  // live signals from the store (respond to in-app actions)
  const liveDisc = st.disciplinary ? Object.values(st.disciplinary).reduce((a,arr)=>a+(arr?arr.length:0),0) : 0;
  const discOpened = I.discOpenedBase + liveDisc;
  const discClosed = I.discClosedBase;
  const lv = st.leave || [];
  const onlineNum = I.onlineLeaveBase + lv.filter(l=>/ESS/i.test(l.source||'')).length;
  const onlineDen = I.totalLeaveBase + lv.length;
  const appTot = APP.complete + APP.inProgress + APP.notStarted;
  const highPerf = (APP.dist||[]).filter(d=>/^\s*[45]/.test(d.r||'')).reduce((a,d)=>a+(d.pct||0),0);

  const o = {};
  o.headcount_growth = { value:'+'+(HC-I.previousHC), v:HC-I.previousHC, sub:`vs +${I.budgetHC-I.previousHC} plan · ${HC.toLocaleString()} HC` };
  o.turnover            = mk(pct(leavers, avgHC), '%', `${leavers} leavers ÷ ${Math.round(avgHC).toLocaleString()} avg`);
  o.termination         = mk(pct(I.terminationsYTD, avgHC), '%', `${I.terminationsYTD} terminations`);
  o.retention           = mk(pct(I.previousHC - I.voluntaryLeavers, I.previousHC), '%');
  o.absenteeism         = mk(pct(I.lostWorkdays, I.totalWorkdays), '%', `${I.lostWorkdays.toLocaleString()} lost workdays`);
  o.female_rep          = mk(pct(I.femaleCount, HC), '%', `${I.femaleCount} of ${HC.toLocaleString()}`);
  o.young_ratio         = mk(pct(I.under35Count, HC), '%');
  o.localization        = mk(pct(I.tanzanianCount, HC), '%', `${(HC-I.tanzanianCount)} expatriates`);
  o.female_leadership   = mk(pct(I.femaleManagers, I.totalManagers), '%', `${I.femaleManagers} of ${I.totalManagers} managers`);
  o.grievances_filed    = mk(pct(GRV.open + GRV.closedYTD, HC), '%', `${GRV.open+GRV.closedYTD} filed`);
  o.grievance_resolution= mk(pct(GRV.closedYTD, GRV.open + GRV.closedYTD), '%', `${GRV.closedYTD} of ${GRV.open+GRV.closedYTD} resolved`);
  o.disc_opened         = mk(pct(discOpened, HC), '%', `${discOpened} cases opened`);
  o.disc_closure        = mk(pct(discClosed, discOpened), '%', `${discClosed} of ${discOpened} closed`);
  o.appeal_rate         = mk(pct(I.appealsBase, discClosed), '%', `${I.appealsBase} appeal`);
  o.leave_utilization   = mk(pct(I.leaveTaken, I.leaveEntitled), '%', `${I.leaveTaken.toLocaleString()} of ${I.leaveEntitled.toLocaleString()} days`);
  o.time_to_fill        = { value:String(I.avgDaysToFill), v:I.avgDaysToFill, sub:'days' };
  o.cost_per_hire       = { value:'TZS '+Math.round(I.costPerHire/1000)+'k', sub:'within budget' };
  o.offer_acceptance    = mk(pct(I.offersAccepted, I.offersTotal), '%', `${I.offersAccepted} of ${I.offersTotal} offers`);
  o.internal_promotion  = mk(pct(I.internalPromotions, I.positionsFilled), '%', `${I.internalPromotions} of ${I.positionsFilled} filled`);
  o.succession          = mk(pct(I.criticalWithSuccessor, I.criticalRoles), '%', `${I.criticalWithSuccessor} of ${I.criticalRoles} roles`);
  o.perf_review         = mk(pct(APP.complete, appTot), '%', `${APP.complete} of ${appTot} done`);
  o.kpi_achievement     = mk(pct(I.kpisAchieved, I.kpisAssigned), '%');
  o.high_performer      = { value: r1(highPerf)+'%', sub:'rated 4–5' };
  o.training_completion = mk(TRN.compliance!=null?TRN.compliance:87, '%');
  o.training_hours      = { value:String(r1(I.totalTrainingHours/HC)), v:I.totalTrainingHours/HC, sub:'hrs/yr' };
  o.satisfaction_score  = mk(I.surveyFavourable, '%');
  o.satisfaction_5pt    = { value:I.surveyScore5.toFixed(1), v:I.surveyScore5, sub:'/ 5' };
  o.ess_adoption        = mk(pct(I.essActiveUsers, HC), '%', `${phones.toLocaleString()} smartphones + kiosks`);
  o.online_leave        = mk(pct(onlineNum, onlineDen), '%', `${onlineNum} of ${onlineDen} via ESS`);
  o.records_completeness= mk(pct(I.completeRecords, HC), '%', `${I.completeRecords.toLocaleString()} of ${HC.toLocaleString()}`);
  return o;
}

Object.assign(window, { KPIS, KPI_CAT_ORDER, kpiStatus, ROLE_KPIS, ROLE_KPI_SCOPE, KPI_INPUTS, kpiValues });
