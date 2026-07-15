// Slice 10 · Tenant provisioning wizard (C21) — bilingual strings
const T={en:{
 reg:'registry v1.2',
 wizard:'Tenant provisioning', wizardSub:'Console · stand up a new tenant from registry config · C21',
 repeatNote:'Everything is seeded from registry config — standing up a new client is configuration, not a project. No manual database step (TEN-01).',
 noManual:'from registry config · no manual DB step',
 // step rail
 s_identity:'Identity', s_roles:'Roles & matrix', s_sites:'Sites & codes', s_leave:'Leave types',
 s_docs:'Document types', s_kpi:'KPI catalogue', s_statutory:'Statutory', s_review:'Review & confirm',
 // identity
 idTitle:'Company identity', idMintLbl:'company_id — minted & isolated', idMintVal:'9f3a1c7e · new tenant',
 idTenant:'Tenant name', idTenantVal:'Client Two Mining Ltd', idCode:'Tenant code', idCodeVal:'C2ML',
 idCountry:'Country', idCountryVal:'Tanzania', idCurrency:'Base currency', idCurrencyVal:'TZS',
 idTz:'Timezone', idTzVal:'Africa/Dar_es_Salaam (EAT)',
 idNote:'A fresh company_id isolates every row — RLS keys off it from the first seed (TEN-02).',
 // roles
 rolesTitle:'Roles & permission matrix', rolesSeed:'13 roles seeded (R01–R13)', matrixSeed:'permission matrix · 13 roles × 42 actions',
 matrixNote:'A2/A3 alignment seeded — landings, approval matrix and confidential-field scoping.',
 // sites
 sitesTitle:'Sites & location codes', numberFmt:'Staff-number format', numberFmtVal:'TMCL-<LOC>-<SEQ> · resets per location', codesLbl:'Location codes',
 // leave
 leaveTitle:'Leave types & rules', leaveNote:'Entitlement by rotation (LR-1), 30-day basis (LR-2), sick 63+63 + cert (LR-7), carry lapses 1 yr (LR-4).',
 // docs
 docsTitle:'Document types & expiry', docsNote:'Expiry-alert defaults seeded — DA-1 lead times and DA-2 notified role.',
 // kpi
 kpiTitle:'KPI catalogue & targets', kpiSeed:'30 KPIs seeded with targets', kpiCats:'11 categories · role-scoped',
 kpiNote:'Role-scoped sets and RAG targets from the HR-metrics workbook (registry v1.2).',
 // statutory
 statTitle:'Statutory parameters', statNote:'Statutory rates and the pay divisor seeded from registry — no hand entry.',
 // review
 reviewTitle:'Review & confirm', reviewNote:'Review every seed. Provisioning commits them in a single transaction — all or nothing.',
 provisionBtn:'Provision tenant', seeded:'seeded',
 tIdentity:'Identity', tRoles:'Roles', tMatrix:'Matrix', tSites:'Sites', tLeave:'Leave types', tDocs:'Doc types', tKpi:'KPIs', tStat:'Statutory',
 // states
 emptyTitle:'Step not seeded yet', emptyBody:'This step is populated from registry config when provisioning starts. Nothing is written until you confirm on the review step.',
 loadingTitle:'Seeding from registry…', loadingBody:'Minting the company_id and applying the registry configuration.',
 provisionedTitle:'Tenant provisioned', provisionedSub:'The company_id is active and every seed committed in one transaction. The tenant is ready — no manual step was needed.',
 rollbackTitle:'Provisioning failed — rolled back', rollbackBody:'A seed failed validation. The whole transaction was rolled back — no company_id, no roles, no config. There is no half-provisioned tenant. Fix and retry.',
 noPermTitle:'No access to provisioning', noPermBody:'Tenant provisioning is limited to the Head of HR, project HR lead and IT administrator (R07, R11, R12).', noPermWhy:'C21 · provisioning · viewer',
 offNote:'Offline — provisioning needs a connection to mint the company_id and seed config. Nothing runs offline.',
 largeTitle:'Full registry payload', largeMeta:'13 roles · 42 actions · 30 KPIs · 4 sites · virtualised',
 back:'Back', next:'Next step', retry:'Retry', cancel:'Cancel', na:'—'
},
sw:{
 reg:'rejista v1.2',
 wizard:'Usajili wa tenant', wizardSub:'Konsoli · anzisha tenant mpya kutoka mipangilio ya rejista · C21',
 repeatNote:'Kila kitu kinapangwa kutoka rejista — kuanzisha mteja mpya ni mipangilio, si mradi. Hakuna hatua ya mkono kwenye hifadhidata (TEN-01).',
 noManual:'kutoka rejista · hakuna hatua ya mkono',
 s_identity:'Utambulisho', s_roles:'Majukumu & matriki', s_sites:'Maeneo & misimbo', s_leave:'Aina za likizo',
 s_docs:'Aina za hati', s_kpi:'Katalogi ya KPI', s_statutory:'Kisheria', s_review:'Kagua & thibitisha',
 idTitle:'Utambulisho wa kampuni', idMintLbl:'company_id — imetengenezwa & imetengwa', idMintVal:'9f3a1c7e · tenant mpya',
 idTenant:'Jina la tenant', idTenantVal:'Client Two Mining Ltd', idCode:'Msimbo wa tenant', idCodeVal:'C2ML',
 idCountry:'Nchi', idCountryVal:'Tanzania', idCurrency:'Sarafu', idCurrencyVal:'TZS',
 idTz:'Saa za eneo', idTzVal:'Africa/Dar_es_Salaam (EAT)',
 idNote:'company_id mpya inatenga kila rekodi — RLS inaitumia tangu upangaji wa kwanza (TEN-02).',
 rolesTitle:'Majukumu & matriki ya ruhusa', rolesSeed:'Majukumu 13 yamepangwa (R01–R13)', matrixSeed:'matriki ya ruhusa · majukumu 13 × vitendo 42',
 matrixNote:'Upangaji wa A2/A3 — sehemu za kutua, matriki ya idhini na wigo wa siri.',
 sitesTitle:'Maeneo & misimbo', numberFmt:'Muundo wa namba ya mfanyakazi', numberFmtVal:'TMCL-<LOC>-<SEQ> · inaanza upya kwa eneo', codesLbl:'Misimbo ya maeneo',
 leaveTitle:'Aina za likizo & kanuni', leaveNote:'Haki kwa mzunguko (LR-1), msingi wa siku 30 (LR-2), ugonjwa 63+63 + cheti (LR-7), zilizohamishwa zinaisha mwaka 1 (LR-4).',
 docsTitle:'Aina za hati & muda wa mwisho', docsNote:'Chaguo-msingi za tahadhari zimepangwa — muda wa DA-1 na jukumu la DA-2.',
 kpiTitle:'Katalogi ya KPI & malengo', kpiSeed:'KPI 30 zimepangwa na malengo', kpiCats:'kategoria 11 · kwa jukumu',
 kpiNote:'Seti kwa jukumu na malengo ya RAG kutoka kitabu cha takwimu (rejista v1.2).',
 statTitle:'Vigezo vya kisheria', statNote:'Viwango vya kisheria na kigawanyo cha malipo vimepangwa kutoka rejista — hakuna kuingiza kwa mkono.',
 reviewTitle:'Kagua & thibitisha', reviewNote:'Kagua kila upangaji. Usajili unahifadhi kwa muamala mmoja — yote au hakuna.',
 provisionBtn:'Sajili tenant', seeded:'imepangwa',
 tIdentity:'Utambulisho', tRoles:'Majukumu', tMatrix:'Matriki', tSites:'Maeneo', tLeave:'Aina za likizo', tDocs:'Aina za hati', tKpi:'KPI', tStat:'Kisheria',
 emptyTitle:'Hatua haijapangwa bado', emptyBody:'Hatua hii inapangwa kutoka rejista usajili ukianza. Hakuna kinachoandikwa hadi uthibitishe kwenye hatua ya kagua.',
 loadingTitle:'Inapanga kutoka rejista…', loadingBody:'Inatengeneza company_id na kutumia mipangilio ya rejista.',
 provisionedTitle:'Tenant imesajiliwa', provisionedSub:'company_id iko hai na kila upangaji umehifadhiwa kwa muamala mmoja. Tenant iko tayari — hakuna hatua ya mkono iliyohitajika.',
 rollbackTitle:'Usajili umeshindwa — umebatilishwa', rollbackBody:'Upangaji mmoja umeshindwa uthibitisho. Muamala mzima umebatilishwa — hakuna company_id, majukumu, wala mipangilio. Hakuna tenant ya nusu. Rekebisha na jaribu tena.',
 noPermTitle:'Huna ufikiaji wa usajili', noPermBody:'Usajili wa tenant ni kwa Mkuu wa HR, kiongozi wa HR wa mradi na msimamizi wa TEHAMA (R07, R11, R12).', noPermWhy:'C21 · usajili · mtazamaji',
 offNote:'Nje ya mtandao — usajili unahitaji muunganisho kutengeneza company_id na kupanga mipangilio. Hakuna kinachoendeshwa nje ya mtandao.',
 largeTitle:'Mzigo kamili wa rejista', largeMeta:'majukumu 13 · vitendo 42 · KPI 30 · maeneo 4 · imepunguzwa',
 back:'Nyuma', next:'Hatua ijayo', retry:'Jaribu tena', cancel:'Ghairi', na:'—'
}};
window.T=T;
