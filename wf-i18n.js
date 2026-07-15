// F-slice spec · C2 Workforce Overview — bilingual strings (AC-UNI-07: no key/placeholder ever visible)
const T={en:{
 reg:'Config Registry', online:'Online', offline:'Offline',
 title:'Workforce Overview', org:'Taifa Mining · TMCL',
 orgWide:'Organisation-wide', siteScope:'Mwadui site',
 // stats
 headcount:'Headcount', active:'Active', onshift:'On shift now', onleave:'On leave today', newMonth:'New this month', approvals:'Open approvals',
 vsLast:'vs last month', ofHc:'of headcount',
 // composition
 compBySite:'Workforce by site', compByCat:'By employment type',
 cPerm:'Permanent', cContract:'Contract', cExpat:'Expatriate',
 sMwadui:'Mwadui', sNyanzaga:'Nyanzaga', sDar:'Dar Yard', sHead:'Head Office',
 // kpi strip
 kpiStrip:'Key indicators', viewScorecard:'Open scorecard',
 kRetention:'Retention', kTurnover:'Turnover MTD', kEss:'ESS adoption', kRecords:'Records complete', kAbsent:'Absenteeism',
 // approvals
 approvalsPanel:'Pending approvals', apLeave:'Leave requests', apProfile:'Profile edits', apTraining:'Training requests',
 apRoute:'routed to you', apReadonly:'Actions resume when back online',
 // activity
 activityPanel:'Recent activity', audit:'Audit',
 aDisc:'Disciplinary letter issued', aDiscW:'Peter Komba · TMCL-MW-2210',
 aLeave:'Leave approved', aLeaveW:'Grace Ndaki · 3 days',
 aJoiner:'New joiner onboarded', aJoinerW:'Amina Juma · TMCL-NZ-4471',
 aTransfer:'Transfer committed', aTransferW:'Joseph Mlimani → Nyanzaga',
 // scale / states
 scaleNote:'4 sites · 1,246 staff · live rollup', vhint:'+ 12 more rows · virtualised',
 emptyT:'No workforce data yet', emptyB:'Tenant provisioned. Import or onboard employees to populate the overview.',
 errT:'Couldn’t load the overview', errB:'The workforce service didn’t respond. Nothing was changed.', retry:'Retry',
 noPermT:'Overview isn’t available for your role', noPermB:'Field employees use the ESS app home — this console landing is role-scoped (A2 · AUTH-06).', goEss:'Open ESS home',
 offSnap:'Showing the last synced snapshot · 08:12', refreshed:'Refreshed · in sync',
 scopeNote:'The landing and its scope follow the signed-in role — site-scoped roles see only their sites (A2 · AUTH-06).',
 // R14 executive (read-only, aggregates only)
 execRO:'Read-only', readonlyTag:'Read-only', aggOnly:'Aggregate · no individual records',
 wageBill:'Wage bill (Jun)', wageBillVal:'TZS 1.24bn', liability:'Leave liability', liabilityVal:'TZS 186m',
 execReports:'Organisation reports', rHeadcount:'Headcount & composition', rWage:'Wage bill trend', rTurnover:'Turnover & retention', rSafety:'Safety & LTI',
 execExport:'Aggregate figures only — drill-down to individual pay or records is not available to this role',
 execBanner:'Executive read-only — organisation-wide summary. No approvals, no individual pay, bank or personal records.',
 execNote:'CEO / Executive view (LI-3 / LI-6): organisation-wide aggregates only — not site-scoped, no edit or approve, no individual pay/bank. Matches the backend, which omits pay for this role.',
 // role titles
 R01:'Employee', R02:'Supervisor', R03:'Superintendent', R04:'Project Manager', R05:'HR Officer', R06:'Project HR', R07:'Head of HR', R08:'Payroll Officer', R09:'Finance Manager', R10:'SHEQ Manager', R11:'Head of Department', R12:'IT Administrator', R13:'Field Employee (ESS)', R14:'CEO / Executive'
},sw:{
 reg:'Rejista ya Usanidi', online:'Mtandaoni', offline:'Nje ya mtandao',
 title:'Muhtasari wa Wafanyakazi', org:'Taifa Mining · TMCL',
 orgWide:'Shirika zima', siteScope:'Tovuti ya Mwadui',
 headcount:'Idadi ya wafanyakazi', active:'Hai', onshift:'Zamu sasa', onleave:'Likizo leo', newMonth:'Wapya mwezi huu', approvals:'Idhini wazi',
 vsLast:'ikilinganishwa na mwezi jana', ofHc:'ya jumla',
 compBySite:'Wafanyakazi kwa tovuti', compByCat:'Kwa aina ya ajira',
 cPerm:'Kudumu', cContract:'Mkataba', cExpat:'Mgeni',
 sMwadui:'Mwadui', sNyanzaga:'Nyanzaga', sDar:'Yadi ya Dar', sHead:'Makao Makuu',
 kpiStrip:'Viashiria vikuu', viewScorecard:'Fungua kadi ya alama',
 kRetention:'Kubaki', kTurnover:'Mauzo mwezi', kEss:'Matumizi ya ESS', kRecords:'Kumbukumbu kamili', kAbsent:'Kutokuwepo',
 approvalsPanel:'Idhini zinazosubiri', apLeave:'Maombi ya likizo', apProfile:'Mabadiliko ya wasifu', apTraining:'Maombi ya mafunzo',
 apRoute:'zimeelekezwa kwako', apReadonly:'Vitendo vitaendelea ukirejea mtandaoni',
 activityPanel:'Shughuli za hivi karibuni', audit:'Ukaguzi',
 aDisc:'Barua ya nidhamu imetolewa', aDiscW:'Peter Komba · TMCL-MW-2210',
 aLeave:'Likizo imeidhinishwa', aLeaveW:'Grace Ndaki · siku 3',
 aJoiner:'Mwajiriwa mpya amesajiliwa', aJoinerW:'Amina Juma · TMCL-NZ-4471',
 aTransfer:'Uhamisho umekamilika', aTransferW:'Joseph Mlimani → Nyanzaga',
 scaleNote:'Tovuti 4 · wafanyakazi 1,246 · muhtasari wa moja kwa moja', vhint:'+ safu 12 zaidi · zimehifadhiwa',
 emptyT:'Hakuna data ya wafanyakazi bado', emptyB:'Tenanti imeanzishwa. Ingiza au sajili wafanyakazi ili kujaza muhtasari.',
 errT:'Imeshindwa kupakia muhtasari', errB:'Huduma ya wafanyakazi haikujibu. Hakuna kilichobadilika.', retry:'Jaribu tena',
 noPermT:'Muhtasari haupatikani kwa jukumu lako', noPermB:'Wafanyakazi wa uwandani hutumia ukurasa wa ESS — ukurasa huu una mipaka ya jukumu (A2 · AUTH-06).', goEss:'Fungua ESS',
 offSnap:'Inaonyesha muhtasari uliohifadhiwa · 08:12', refreshed:'Imeonyeshwa upya · sawa',
 scopeNote:'Ukurasa na mipaka yake hufuata jukumu lililoingia — majukumu ya tovuti huona tovuti zao tu (A2 · AUTH-06).',
 execRO:'Kusoma tu', readonlyTag:'Kusoma tu', aggOnly:'Jumla · hakuna kumbukumbu binafsi',
 wageBill:'Jumla ya mishahara (Jun)', wageBillVal:'TZS bilioni 1.24', liability:'Dhima ya likizo', liabilityVal:'TZS milioni 186',
 execReports:'Ripoti za shirika', rHeadcount:'Idadi na muundo', rWage:'Mwenendo wa mishahara', rTurnover:'Mauzo na kubaki', rSafety:'Usalama na LTI',
 execExport:'Takwimu za jumla tu — kufikia mshahara au kumbukumbu za mtu binafsi hakuruhusiwi kwa jukumu hili',
 execBanner:'Mtendaji kusoma tu — muhtasari wa shirika zima. Hakuna idhini, hakuna mshahara, benki au kumbukumbu binafsi.',
 execNote:'Mwonekano wa Mkurugenzi Mtendaji (LI-3 / LI-6): jumla za shirika zima tu — si za tovuti, hakuna kuhariri au kuidhinisha, hakuna mshahara/benki binafsi. Inalingana na mfumo wa nyuma unaoficha mshahara kwa jukumu hili.',
 R01:'Mfanyakazi', R02:'Msimamizi', R03:'Meneja wa idara', R04:'Meneja wa mradi', R05:'Afisa HR', R06:'HR wa mradi', R07:'Mkuu wa HR', R08:'Afisa mishahara', R09:'Meneja fedha', R10:'Meneja SHEQ', R11:'Mkuu wa idara', R12:'Msimamizi TEHAMA', R13:'Mfanyakazi wa uwandani (ESS)', R14:'Mkurugenzi Mtendaji'
}};
window.T=T;
