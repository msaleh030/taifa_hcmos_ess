// Slice 7 · KPI scorecard — bilingual catalogue + live compute (ports the app's HR KPI workbook)
// name/formula/target carry {en,sw}; target is a plain string where language-neutral. AC-UNI-07.
const KPIS={
 headcount_growth:{cat:'workforce',name:{en:'Headcount Growth',sw:'Ukuaji wa idadi ya wafanyakazi'},formula:{en:'Current HC − Previous HC',sw:'Idadi ya sasa − ya awali'},target:{en:'As per budget',sw:'Kadiri ya bajeti'},dir:'monitor',icon:'users'},
 turnover:{cat:'workforce',name:{en:'Employee Turnover Rate',sw:'Kiwango cha mauzo ya wafanyakazi'},formula:{en:'Leavers ÷ Avg HC × 100',sw:'Walioondoka ÷ wastani × 100'},target:'≤ 10%',v:8.2,t:10,dir:'down',unit:'%',icon:'trend'},
 termination:{cat:'workforce',name:{en:'Termination Rate',sw:'Kiwango cha kusitishwa'},formula:{en:'Terminations ÷ Avg HC × 100',sw:'Kusitishwa ÷ wastani × 100'},target:'< 10%',v:3.1,t:10,dir:'down',unit:'%',icon:'trend'},
 retention:{cat:'workforce',name:{en:'Retention Rate',sw:'Kiwango cha kubaki'},formula:{en:'Retained ÷ Total × 100',sw:'Waliobaki ÷ jumla × 100'},target:'≥ 90%',v:92.4,t:90,dir:'up',unit:'%',icon:'shield'},
 absenteeism:{cat:'workforce',name:{en:'Absenteeism Rate',sw:'Kiwango cha kutokuwepo'},formula:{en:'Lost workdays ÷ Total workdays × 100',sw:'Siku zilizopotea ÷ jumla × 100'},target:'≤ 2%',v:2.1,t:2,dir:'down',unit:'%',icon:'clock'},
 female_rep:{cat:'diversity',name:{en:'Female Representation',sw:'Uwakilishi wa wanawake'},formula:{en:'Female ÷ Total × 100',sw:'Wanawake ÷ jumla × 100'},target:'≥ 20%',v:18,t:20,dir:'up',unit:'%',icon:'users'},
 young_ratio:{cat:'diversity',name:{en:'Young Employee Ratio (<35)',sw:'Uwiano wa vijana (<35)'},formula:{en:'Under 35 ÷ Total × 100',sw:'Chini ya 35 ÷ jumla × 100'},target:'30–50%',v:44,band:[30,50],dir:'band',unit:'%',icon:'users'},
 localization:{cat:'diversity',name:{en:'Localization Ratio',sw:'Uwiano wa uzawa'},formula:{en:'Tanzanian ÷ Total × 100',sw:'Watanzania ÷ jumla × 100'},target:'≥ 95%',v:97.7,t:95,dir:'up',unit:'%',icon:'pin'},
 female_leadership:{cat:'diversity',name:{en:'Female Leadership Ratio',sw:'Uongozi wa wanawake'},formula:{en:'Female mgrs ÷ Total mgrs × 100',sw:'Wasimamizi wanawake ÷ jumla × 100'},target:'≥ 15%',v:12,t:15,dir:'up',unit:'%',icon:'award'},
 grievances_filed:{cat:'grievances',name:{en:'Grievances Filed',sw:'Malalamiko yaliyowasilishwa'},formula:{en:'Grievances ÷ HC × 100',sw:'Malalamiko ÷ idadi × 100'},target:'≤ 2%',v:0.5,t:2,dir:'down',unit:'%',icon:'flag'},
 grievance_resolution:{cat:'grievances',name:{en:'Grievance Resolution Rate',sw:'Kiwango cha kutatua malalamiko'},formula:{en:'Resolved ÷ Filed × 100',sw:'Yaliyotatuliwa ÷ yaliyowasilishwa × 100'},target:'≥ 95%',v:88,t:95,dir:'up',unit:'%',icon:'check'},
 disc_opened:{cat:'disciplinary',name:{en:'Disciplinary Cases Opened',sw:'Kesi za nidhamu zilizofunguliwa'},formula:{en:'Cases opened ÷ HC × 100',sw:'Kesi zilizofunguliwa ÷ idadi × 100'},target:'≤ 3%',v:1.2,t:3,dir:'down',unit:'%',icon:'alert'},
 disc_closure:{cat:'disciplinary',name:{en:'Disciplinary Closure Rate',sw:'Kiwango cha kufunga nidhamu'},formula:{en:'Closed ÷ Opened × 100',sw:'Zilizofungwa ÷ zilizofunguliwa × 100'},target:'≥ 95%',v:90,t:95,dir:'up',unit:'%',icon:'check'},
 appeal_rate:{cat:'disciplinary',name:{en:'Appeal Rate',sw:'Kiwango cha rufaa'},formula:{en:'Appeals ÷ Cases closed × 100',sw:'Rufaa ÷ kesi zilizofungwa × 100'},target:'≤ 10%',v:7,t:10,dir:'down',unit:'%',icon:'flag'},
 leave_utilization:{cat:'leave',name:{en:'Leave Utilization',sw:'Matumizi ya likizo'},formula:{en:'Leave taken ÷ Entitled × 100',sw:'Likizo iliyotumika ÷ haki × 100'},target:'≥ 80%',v:73,t:80,dir:'up',unit:'%',icon:'calendar'},
 time_to_fill:{cat:'recruitment',name:{en:'Time to Fill',sw:'Muda wa kujaza nafasi'},formula:{en:'Avg days to fill a vacancy',sw:'Wastani wa siku kujaza nafasi'},target:{en:'≤ 30 days',sw:'≤ siku 30'},v:27,t:30,dir:'down',unit:'days',icon:'clock'},
 cost_per_hire:{cat:'recruitment',name:{en:'Cost per Hire',sw:'Gharama kwa ajira'},formula:{en:'Recruitment cost ÷ No. of hires',sw:'Gharama ÷ idadi ya ajira'},target:{en:'Within budget',sw:'Ndani ya bajeti'},dir:'monitor',icon:'money'},
 offer_acceptance:{cat:'recruitment',name:{en:'Offer Acceptance Rate',sw:'Kiwango cha kukubali ofa'},formula:{en:'Accepted ÷ Total offers × 100',sw:'Zilizokubaliwa ÷ jumla × 100'},target:'≥ 90%',v:93,t:90,dir:'up',unit:'%',icon:'check'},
 internal_promotion:{cat:'talent',name:{en:'Internal Promotion Rate',sw:'Kiwango cha kupandishwa cheo'},formula:{en:'Internal promotions ÷ Filled × 100',sw:'Kupandishwa ndani ÷ zilizojazwa × 100'},target:'≥ 30%',v:34,t:30,dir:'up',unit:'%',icon:'trend'},
 succession:{cat:'talent',name:{en:'Succession Coverage',sw:'Uwepo wa warithi'},formula:{en:'Critical roles w/ successors ÷ Critical × 100',sw:'Nafasi muhimu zenye warithi ÷ jumla × 100'},target:'≥ 80%',v:72,t:80,dir:'up',unit:'%',icon:'users'},
 perf_review:{cat:'performance',name:{en:'Performance Review Completion',sw:'Ukamilishaji wa tathmini'},formula:{en:'Completed ÷ Scheduled × 100',sw:'Zilizokamilika ÷ zilizopangwa × 100'},target:'100%',v:74,t:100,dir:'up',unit:'%',icon:'award'},
 kpi_achievement:{cat:'performance',name:{en:'KPI Achievement Rate',sw:'Kiwango cha kufikia KPI'},formula:{en:'KPIs achieved ÷ Assigned × 100',sw:'KPI zilizofikiwa ÷ zilizotolewa × 100'},target:'≥ 85%',v:81,t:85,dir:'up',unit:'%',icon:'chart'},
 high_performer:{cat:'performance',name:{en:'High Performer Ratio',sw:'Uwiano wa wafanyakazi bora'},formula:{en:'High performers ÷ Total × 100',sw:'Bora ÷ jumla × 100'},target:{en:'Monitor',sw:'Fuatilia'},dir:'monitor',icon:'award'},
 training_completion:{cat:'learning',name:{en:'Training Completion Rate',sw:'Kiwango cha kukamilisha mafunzo'},formula:{en:'Completed ÷ Planned × 100',sw:'Yaliyokamilika ÷ yaliyopangwa × 100'},target:'≥ 90%',v:87,t:90,dir:'up',unit:'%',icon:'cap'},
 training_hours:{cat:'learning',name:{en:'Training Hours / Employee',sw:'Saa za mafunzo / mfanyakazi'},formula:{en:'Total training hours ÷ HC',sw:'Jumla ya saa ÷ idadi'},target:{en:'≥ 24 hrs/yr',sw:'≥ saa 24/mwaka'},v:22,t:24,dir:'up',unit:'hrs',icon:'cap'},
 satisfaction_score:{cat:'engagement',name:{en:'Employee Satisfaction',sw:'Kuridhika kwa wafanyakazi'},formula:{en:'Survey favourable %',sw:'Asilimia ya kuridhika'},target:'≥ 80%',v:82,t:80,dir:'up',unit:'%',icon:'heart'},
 satisfaction_5pt:{cat:'engagement',name:{en:'Satisfaction Score (5-pt)',sw:'Alama ya kuridhika (5)'},formula:{en:'Avg survey score',sw:'Wastani wa alama'},target:'≥ 4.0',v:4.1,t:4,dir:'up',unit:'/5',icon:'heart'},
 ess_adoption:{cat:'engagement',name:{en:'ESS Adoption Rate',sw:'Kiwango cha matumizi ya ESS'},formula:{en:'Active ESS users ÷ Total × 100',sw:'Watumiaji hai ÷ jumla × 100'},target:'≥ 90%',v:71,t:90,dir:'up',unit:'%',icon:'phone'},
 online_leave:{cat:'engagement',name:{en:'Online Leave Application Rate',sw:'Kiwango cha maombi ya likizo mtandaoni'},formula:{en:'ESS leave ÷ Total leave × 100',sw:'Likizo ESS ÷ jumla × 100'},target:'100%',v:84,t:100,dir:'up',unit:'%',icon:'calendar'},
 records_completeness:{cat:'compliance',name:{en:'Employee Records Completeness',sw:'Ukamilifu wa kumbukumbu'},formula:{en:'Complete records ÷ Total × 100',sw:'Kumbukumbu kamili ÷ jumla × 100'},target:'100%',v:98,t:100,dir:'up',unit:'%',icon:'doc'}
};
const KPI_CAT_ORDER=['workforce','diversity','grievances','disciplinary','leave','recruitment','talent','performance','learning','engagement','compliance'];

function kpiStatus(k){
 if(!k||k.dir==='monitor') return 'neutral';
 if(k.dir==='up')   return k.v>=k.t?'green':(k.v>=k.t*0.9?'amber':'red');
 if(k.dir==='down') return k.v<=k.t?'green':(k.v<=k.t*1.15?'amber':'red');
 if(k.dir==='band'){const[lo,hi]=k.band;return(k.v>=lo&&k.v<=hi)?'green':((k.v>=lo*0.9&&k.v<=hi*1.1)?'amber':'red');}
 return 'neutral';
}

// per-role KPI set (A2/A3 alignment — each role sees the KPIs it owns)
const ROLE_KPIS={
 employee:['perf_review','kpi_achievement','training_completion','leave_utilization','ess_adoption'],
 supervisor:['absenteeism','perf_review','kpi_achievement','training_completion','leave_utilization','grievances_filed'],
 super:['absenteeism','retention','perf_review','training_completion','internal_promotion','succession'],
 pm:['headcount_growth','turnover','absenteeism','retention','time_to_fill','grievance_resolution','disc_closure'],
 hod:['retention','turnover','succession','internal_promotion','perf_review','kpi_achievement','high_performer','cost_per_hire'],
 hrofficer:['records_completeness','time_to_fill','offer_acceptance','grievance_resolution','disc_closure','training_completion','leave_utilization','online_leave'],
 projhr:['records_completeness','absenteeism','leave_utilization','grievances_filed','grievance_resolution','disc_opened','online_leave'],
 hrhead:['headcount_growth','turnover','retention','absenteeism','female_rep','young_ratio','localization','female_leadership','grievance_resolution','disc_closure','appeal_rate','leave_utilization','time_to_fill','cost_per_hire','offer_acceptance','internal_promotion','succession','perf_review','kpi_achievement','training_completion','training_hours','satisfaction_score','satisfaction_5pt','ess_adoption','records_completeness'],
 payroll:['absenteeism','leave_utilization','records_completeness','cost_per_hire'],
 finance:['headcount_growth','turnover','absenteeism','cost_per_hire','leave_utilization'],
 sheq:['training_completion','training_hours','absenteeism'],
 ceo:['headcount_growth','turnover','retention','female_rep','localization','succession','internal_promotion','kpi_achievement','satisfaction_score','ess_adoption'],
 it:['ess_adoption','online_leave','records_completeness']
};
// R01–R13 → role key (R13 = ESS field employee; per A2/A3)
const R2ROLE={R01:'employee',R02:'supervisor',R03:'super',R04:'pm',R05:'hrofficer',R06:'projhr',R07:'hrhead',R08:'payroll',R09:'finance',R10:'sheq',R11:'hod',R12:'it',R13:'employee'};
const ROLE_TITLE={employee:{en:'Employee (ESS)',sw:'Mfanyakazi (ESS)'},supervisor:{en:'Supervisor',sw:'Msimamizi'},super:{en:'Superintendent',sw:'Meneja wa idara'},pm:{en:'Project Manager',sw:'Meneja wa mradi'},hod:{en:'Head of Department',sw:'Mkuu wa idara'},hrofficer:{en:'HR Officer',sw:'Afisa HR'},projhr:{en:'Project HR',sw:'HR wa mradi'},hrhead:{en:'Head of HR',sw:'Mkuu wa HR'},payroll:{en:'Payroll Officer',sw:'Afisa mishahara'},finance:{en:'Finance Manager',sw:'Meneja fedha'},sheq:{en:'SHEQ Manager',sw:'Meneja SHEQ'},ceo:{en:'CEO / COO',sw:'Mkurugenzi'},it:{en:'IT Administrator',sw:'Msimamizi TEHAMA'}};
const ROLE_SCOPE={employee:{en:'your personal metrics',sw:'takwimu zako binafsi'},supervisor:{en:'Mwadui · your team',sw:'Mwadui · timu yako'},super:{en:'Mwadui · your remit',sw:'Mwadui · eneo lako'},pm:{en:'Mwadui project',sw:'mradi wa Mwadui'},projhr:{en:'Mwadui · your remit',sw:'Mwadui · eneo lako'},hod:{en:'organisation-wide',sw:'shirika zima'},hrofficer:{en:'organisation-wide',sw:'shirika zima'},hrhead:{en:'organisation-wide',sw:'shirika zima'},payroll:{en:'organisation-wide',sw:'shirika zima'},finance:{en:'organisation-wide',sw:'shirika zima'},sheq:{en:'organisation-wide',sw:'shirika zima'},ceo:{en:'organisation-wide',sw:'shirika zima'},it:{en:'organisation-wide',sw:'shirika zima'}};

// inputs the KPI engine divides — the "data fed in" (slices 2–6)
const KPI_INPUTS={previousHC:1180,budgetHC:1276,voluntaryLeavers:83,terminationsYTD:14,retrenchments:5,lostWorkdays:1290,totalWorkdays:61400,
 femaleCount:226,under35Count:548,tanzanianCount:1218,femaleManagers:12,totalManagers:88,avgDaysToFill:27,offersAccepted:28,offersTotal:30,costPerHire:410000,
 internalPromotions:9,positionsFilled:26,criticalRoles:18,criticalWithSuccessor:13,kpisAchieved:81,kpisAssigned:100,totalTrainingHours:27412,
 surveyFavourable:82,surveyScore5:4.1,essActiveUsers:1010,smartphones:940,onlineLeaveBase:712,totalLeaveBase:842,completeRecords:1221,
 leaveTaken:27300,leaveEntitled:37380,discOpenedBase:14,discClosedBase:13,appealsBase:1,grievOpen:6,grievClosed:23,appraisalsComplete:74,appraisalsTotal:100,HC:1246};

// missing-input label per KPI, for the NOT-AVAILABLE state (LIAB-03: name the input)
const NA_INPUT={training_hours:{en:'total training hours',sw:'jumla ya saa za mafunzo'},succession:{en:'critical-role register',sw:'rejista ya nafasi muhimu'},female_leadership:{en:'manager headcount',sw:'idadi ya wasimamizi'},offer_acceptance:{en:'offers extended',sw:'ofa zilizotolewa'},cost_per_hire:{en:'recruitment cost',sw:'gharama ya ajira'}};

// live compute — returns { id: {value, v, sub} } localized to lang
function kpiValues(lang){
 const I=KPI_INPUTS, HC=I.HC, en=lang!=='sw';
 const W=en?{of:'of',lv:'leavers',avg:'avg',mgr:'managers',lost:'lost workdays',exp:'expatriates',within:'within budget',ph:'smartphones + kiosks',via:'via ESS',filed:'filed',res:'resolved',op:'cases opened',cl:'closed',ap:'appeal',off:'offers',fil:'filled',rol:'roles',done:'done',hy:'hrs/yr',plan:'plan',days:'days'}
  :{of:'kati ya',lv:'walioondoka',avg:'wastani',mgr:'wasimamizi',lost:'siku zilizopotea',exp:'wageni',within:'ndani ya bajeti',ph:'simu + vioski',via:'kupitia ESS',filed:'zimewasilishwa',res:'zimetatuliwa',op:'kesi zimefunguliwa',cl:'zimefungwa',ap:'rufaa',off:'ofa',fil:'zimejazwa',rol:'nafasi',done:'zimekamilika',hy:'saa/mwaka',plan:'mpango',days:'siku'};
 const r1=x=>Math.round(x*10)/10, pct=(n,d)=>d?n/d*100:0, C=n=>n.toLocaleString('en-US');
 const avgHC=(HC+I.previousHC)/2, leavers=I.voluntaryLeavers+I.terminationsYTD+I.retrenchments;
 const discOpened=I.discOpenedBase, grievTot=I.grievOpen+I.grievClosed, appTot=I.appraisalsTotal;
 const onlineNum=I.onlineLeaveBase, onlineDen=I.totalLeaveBase;
 const mk=(x,sub)=>({value:r1(x)+'%',v:r1(x),sub});
 const o={};
 o.headcount_growth={value:'+'+(HC-I.previousHC),v:HC-I.previousHC,sub:`+${I.budgetHC-I.previousHC} ${W.plan} · ${C(HC)} HC`};
 o.turnover=mk(pct(leavers,avgHC),`${leavers} ${W.lv} ÷ ${C(Math.round(avgHC))} ${W.avg}`);
 o.termination=mk(pct(I.terminationsYTD,avgHC),`${I.terminationsYTD} ${en?'terminations':'kusitishwa'}`);
 o.retention=mk(pct(I.previousHC-I.voluntaryLeavers,I.previousHC));
 o.absenteeism=mk(pct(I.lostWorkdays,I.totalWorkdays),`${C(I.lostWorkdays)} ${W.lost}`);
 o.female_rep=mk(pct(I.femaleCount,HC),`${I.femaleCount} ${W.of} ${C(HC)}`);
 o.young_ratio=mk(pct(I.under35Count,HC));
 o.localization=mk(pct(I.tanzanianCount,HC),`${HC-I.tanzanianCount} ${W.exp}`);
 o.female_leadership=mk(pct(I.femaleManagers,I.totalManagers),`${I.femaleManagers} ${W.of} ${I.totalManagers} ${W.mgr}`);
 o.grievances_filed=mk(pct(grievTot,HC),`${grievTot} ${W.filed}`);
 o.grievance_resolution=mk(pct(I.grievClosed,grievTot),`${I.grievClosed} ${W.of} ${grievTot} ${W.res}`);
 o.disc_opened=mk(pct(discOpened,HC),`${discOpened} ${W.op}`);
 o.disc_closure=mk(pct(I.discClosedBase,discOpened),`${I.discClosedBase} ${W.of} ${discOpened} ${W.cl}`);
 o.appeal_rate=mk(pct(I.appealsBase,I.discClosedBase),`${I.appealsBase} ${W.ap}`);
 o.leave_utilization=mk(pct(I.leaveTaken,I.leaveEntitled),`${C(I.leaveTaken)} ${W.of} ${C(I.leaveEntitled)} ${W.days}`);
 o.time_to_fill={value:I.avgDaysToFill+' '+W.days,v:I.avgDaysToFill,sub:''};
 o.cost_per_hire={value:'TZS '+Math.round(I.costPerHire/1000)+'k',sub:W.within};
 o.offer_acceptance=mk(pct(I.offersAccepted,I.offersTotal),`${I.offersAccepted} ${W.of} ${I.offersTotal} ${W.off}`);
 o.internal_promotion=mk(pct(I.internalPromotions,I.positionsFilled),`${I.internalPromotions} ${W.of} ${I.positionsFilled} ${W.fil}`);
 o.succession=mk(pct(I.criticalWithSuccessor,I.criticalRoles),`${I.criticalWithSuccessor} ${W.of} ${I.criticalRoles} ${W.rol}`);
 o.perf_review=mk(pct(I.appraisalsComplete,appTot),`${I.appraisalsComplete} ${W.of} ${appTot} ${W.done}`);
 o.kpi_achievement=mk(pct(I.kpisAchieved,I.kpisAssigned));
 o.high_performer={value:'14%',sub:en?'rated 4–5':'daraja 4–5'};
 o.training_completion=mk(87);
 o.training_hours={value:r1(I.totalTrainingHours/HC)+' '+W.hy,v:I.totalTrainingHours/HC,sub:''};
 o.satisfaction_score=mk(I.surveyFavourable);
 o.satisfaction_5pt={value:I.surveyScore5.toFixed(1)+' / 5',v:I.surveyScore5,sub:''};
 o.ess_adoption=mk(pct(I.essActiveUsers,HC),`${C(I.smartphones)} ${W.ph}`);
 o.online_leave=mk(pct(onlineNum,onlineDen),`${onlineNum} ${W.of} ${onlineDen} ${W.via}`);
 o.records_completeness=mk(pct(I.completeRecords,HC),`${C(I.completeRecords)} ${W.of} ${C(HC)}`);
 return o;
}
Object.assign(window,{KPIS,KPI_CAT_ORDER,kpiStatus,ROLE_KPIS,R2ROLE,ROLE_TITLE,ROLE_SCOPE,KPI_INPUTS,NA_INPUT,kpiValues});
