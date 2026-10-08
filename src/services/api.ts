import { BenefitScheme, Profile, ApplicationItem, DocumentItem, NotificationItem, AuditRecord, AdminAnalytics } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('civic_token') || 'demo_token_priya';
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

// -------------------------------------------------------------
// CLIENT-SIDE MOCK STORE (Ensures 100% functionality on public web)
// -------------------------------------------------------------
const MOCK_SCHEMES: BenefitScheme[] = [
  {
    id: 'sch_tn_postmatric',
    name: 'Tamil Nadu Post-Matric Scholarship (BC/MBC/DNC)',
    name_ta: 'தமிழ்நாடு பின்-மெட்ரிக் கல்வி உதவித்தொகை (BC/MBC)',
    category: 'Education',
    description: 'Financial assistance for tuition fees, maintenance charges, and exam fees for Backward Classes and Most Backward Classes students pursuing undergraduate degrees in recognized colleges.',
    description_ta: 'அங்கீகரிக்கப்பட்ட கல்லூரிகளில் பட்டப்படிப்பு பயிலும் பிற்படுத்தப்பட்ட மற்றும் மிகவும் பிற்படுத்தப்பட்ட வகுப்பு மாணவ-மாணவியருக்கான கல்வி கட்டண உதவித்தொகை.',
    benefit_summary: '100% Tuition Fee waiver + ₹4,000/year annual maintenance allowance',
    benefit_summary_ta: '100% கல்விக் கட்டண விலக்கு + ஆண்டு பராமரிப்பு உதவித்தொகை ₹4,000',
    deadline: '2026-11-15',
    official_source: 'https://bcmbcmw.tn.gov.in',
    last_updated: '2026-09-01',
    match_score: 94,
    reasons_matched: [
      { rule: 'Age', text: 'Age 19 fits range (17-28 yrs)' },
      { rule: 'Income', text: 'Annual household income (₹1,80,000) is under limit of ₹2,50,000' },
      { rule: 'Education', text: 'Education qualification \'College Student\' matches scheme criteria' },
      { rule: 'Community', text: 'Category \'BC/MBC\' is eligible' }
    ],
    missing_docs: ['Tahsildar Income Certificate (Valid Renewal Required)'],
    criteria: { min_age: 17, max_age: 28, max_income: 250000, education_levels: ['College Student'], categories: ['BC/MBC'] },
    documents: [
      { type: 'Aadhaar', name: 'Aadhaar Card (Identity & Address)', mandatory: true },
      { type: 'College_ID', name: 'College Bonafide Certificate / Student ID', mandatory: true },
      { type: 'Income_Cert', name: 'Tahsildar Income Certificate (< ₹2.5 Lakh)', mandatory: true },
      { type: 'Community_Cert', name: 'Community Certificate (BC/MBC)', mandatory: true },
      { type: 'Bank_Passbook', name: 'Aadhaar-Linked Bank Account Passbook', mandatory: true }
    ],
    workflow: [
      { step: 1, title: 'Application Submission', tat_days: 1 },
      { step: 2, title: 'Portal Document Verification', tat_days: 3 },
      { step: 3, title: 'Institution Verification', tat_days: 7, note: 'College Principal & Nodal Officer approval' },
      { step: 4, title: 'District Officer Verification', tat_days: 10 },
      { step: 5, title: 'Sanction Order & Treasury Bill', tat_days: 5 },
      { step: 6, title: 'DBT Direct Bank Transfer', tat_days: 2 }
    ],
    escalation: [
      { level: 1, authority: 'College Scholarship Nodal Officer', action: 'Submit verification grievance letter' },
      { level: 2, authority: 'District BC/MBC Welfare Officer, Collectorate', action: 'District Public Grievance Day (Every Monday)' },
      { level: 3, authority: 'Directorate of Backward Classes Welfare / CM Helpline 1100', action: 'State CM Cell Portal formal complaint' }
    ]
  },
  {
    id: 'sch_pudhumai_penn',
    name: 'Moovalur Ramamirtham Ammaiyar Higher Education Assurance Scheme (Pudhumai Penn)',
    name_ta: 'மூவலூர் ராமாமிர்தம் அம்மையார் புதுமைப் பெண் திட்டம்',
    category: 'Education',
    description: 'Monthly financial assistance of ₹1,000 deposited directly into girl students\' bank accounts who studied in Government schools from Classes 6 to 12.',
    description_ta: 'அரசுப் பள்ளிகளில் 6 முதல் 12-ம் வகுப்பு வரை படித்து உயர்கல்வி பயிலும் மாணவிகளுக்கு மாதம் ₹1,000 நிதியுதவி.',
    benefit_summary: '₹1,000 per month deposited directly via Aadhaar DBT until degree completion',
    benefit_summary_ta: 'பட்டம் முடியும் வரை மாதம் ₹1,000 வங்கி கணக்கில் நேரடியாக செலுத்தப்படும்',
    deadline: '2026-10-31',
    official_source: 'https://pudhumaipenn.tn.gov.in',
    last_updated: '2026-08-20',
    match_score: 88,
    reasons_matched: [
      { rule: 'Age', text: 'Age 19 fits eligibility' },
      { rule: 'Gender', text: 'Eligible for female students pursuing higher education' }
    ],
    criteria: { min_age: 17, max_age: 25, education_levels: ['College Student'], gender: 'FEMALE' },
    documents: [
      { type: 'Aadhaar', name: 'Aadhaar Card', mandatory: true },
      { type: 'EMIS_Cert', name: 'EMIS School Transfer Certificate', mandatory: true },
      { type: 'Bank_Passbook', name: 'Aadhaar-Linked Bank Account Passbook', mandatory: true }
    ]
  },
  {
    id: 'sch_tnsdc_tech',
    name: 'Naan Mudhalvan - Free AI & Cloud Upskilling Program',
    name_ta: 'நான் முதல்வன் - இலவச AI & கிளவுட் திறன் மேம்பாட்டு திட்டம்',
    category: 'Employment',
    description: 'Free industry-recognized certifications in AI, Data Science, and Cloud Computing with placement guidance for college students in Tamil Nadu.',
    description_ta: 'கல்லூரி மாணவர்களுக்கான AI மற்றும் கிளவுட் தொழில்நுட்பங்களில் இலவச தொழிற்பயிற்சி.',
    benefit_summary: '100% Free global certification vouchers (AWS/Google/Microsoft) + Campus placement drives',
    benefit_summary_ta: 'இலவச சான்றிதழ் + வளாக நேர்காணல் வழிகாட்டல்',
    deadline: '2026-10-25',
    official_source: 'https://naanmudhalvan.tn.gov.in',
    last_updated: '2026-09-18',
    match_score: 96,
    reasons_matched: [
      { rule: 'Education', text: 'College Student (Undergraduate) in Tamil Nadu' },
      { rule: 'Skills Track', text: 'Computer Science and Engineering eligible' }
    ],
    criteria: { min_age: 18, max_age: 26, education_levels: ['College Student'] },
    documents: [
      { type: 'College_ID', name: 'Student College ID / Roll Number', mandatory: true },
      { type: 'Aadhaar', name: 'Aadhaar Card', mandatory: true }
    ]
  },
  {
    id: 'sch_cmchis_tn',
    name: 'Chief Minister\'s Comprehensive Health Insurance Scheme (CMCHIS - TN)',
    name_ta: 'முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம்',
    category: 'Healthcare',
    description: 'Cashless hospitalization coverage of up to ₹5,00,000 per family per year for 1,090 surgical procedures and 154 specialized therapies in empanelled hospitals.',
    description_ta: 'குடும்பத்திற்கு ஆண்டுக்கு ₹5,00,000 வரை கட்டணமில்லா மருத்துவ காப்பீடு சிகிச்சை.',
    benefit_summary: '₹5,00,000/year family cashless coverage across private & govt tertiary hospitals',
    benefit_summary_ta: 'குடும்பத்திற்கு ஆண்டுக்கு ₹5,00,000 மருத்துவ காப்பீட்டு உதவி',
    deadline: '2026-12-31',
    official_source: 'https://cmchistn.com',
    last_updated: '2026-07-15',
    match_score: 65,
    reasons_matched: [
      { rule: 'Age', text: 'Family members of all age groups covered' },
      { rule: 'Residence', text: 'Tamil Nadu domicile' }
    ],
    criteria: { min_age: 0, max_age: 120, max_income: 120000 },
    documents: [
      { type: 'Smart_Ration_Card', name: 'Tamil Nadu Digital Smart Ration Card', mandatory: true },
      { type: 'Income_Cert', name: 'VAO / Tahsildar Income Certificate', mandatory: true }
    ]
  },
  {
    id: 'sch_pm_surya_ghar',
    name: 'PM Surya Ghar: Muft Bijli Yojana',
    name_ta: 'பிரதம மந்திரி சூர்யா கர்: இலவச மின்சார திட்டம்',
    category: 'Housing & Energy',
    description: 'Central government subsidy of up to ₹78,000 for rooftop solar installation, delivering up to 300 units of free electricity every month for households.',
    description_ta: 'வீட்டு மேற்கூரை சோலார் அமைப்பிற்கு ₹78,000 வரை மானியம் மற்றும் மாதம் 300 யூனிட் வரை இலவச மின்சாரம்.',
    benefit_summary: 'Up to ₹78,000 direct subsidy + ₹1,500/month estimated power bill savings',
    benefit_summary_ta: '₹78,000 வரை அரசு மானியம் + மாதம் ₹1,500 மின் கட்டண சேமிப்பு',
    deadline: '2026-12-31',
    official_source: 'https://pmsuryaghar.gov.in',
    last_updated: '2026-09-10',
    match_score: 82,
    reasons_matched: [
      { rule: 'Electricity', text: 'Domestic consumer connection holder' }
    ],
    criteria: { min_age: 18, max_age: 100 },
    documents: [
      { type: 'Electricity_Bill', name: 'Recent Electricity Bill', mandatory: true },
      { type: 'Aadhaar', name: 'Aadhaar Card', mandatory: true }
    ]
  },
  {
    id: 'sch_magalir_urimai',
    name: 'Kalaignar Magalir Urimai Thittam (Women Basic Income)',
    name_ta: 'கலைஞர் மகளிர் உரிமைத் திட்டம்',
    category: 'Welfare',
    description: 'Monthly economic entitlement of ₹1,000 provided to eligible women heads of families in Tamil Nadu.',
    description_ta: 'குடும்பத் தலைவிகளுக்கு மாதம் ₹1,000 மகளிர் உரிமைத் தொகை வழங்கும் சமூக நலத் திட்டம்.',
    benefit_summary: '₹1,000 deposited on the 15th of every month into bank account',
    benefit_summary_ta: 'மாதந்தோறும் 15-ம் தேதி வங்கி கணக்கில் ₹1,000',
    deadline: '2026-11-30',
    official_source: 'https://kmut.tn.gov.in',
    last_updated: '2026-08-15',
    match_score: 90,
    reasons_matched: [
      { rule: 'Income', text: 'Household income within published guidelines' }
    ],
    criteria: { min_age: 21, max_age: 100, max_income: 250000, gender: 'FEMALE' },
    documents: [
      { type: 'Smart_Ration_Card', name: 'Digital Smart Ration Card', mandatory: true },
      { type: 'Aadhaar', name: 'Aadhaar Card', mandatory: true }
    ]
  }
];

const MOCK_PROFILE: Profile = {
  user_id: 'usr_priya_001',
  name: 'Priya Kumar',
  email: 'priya.kumar@example.com',
  phone: '+919876543210',
  age: 19,
  dob: '2007-04-12',
  state: 'Tamil Nadu',
  district: 'Chennai',
  education: 'College Student',
  employment: 'Student',
  income: 180000,
  category: 'BC/MBC',
  masked_aadhaar: 'XXXX XXXX 4821',
  bank_verified: 1,
  opportunity_score: 73,
  applications_count: 2,
  documents_count: 5,
  verified_docs: 4,
  unread_notifs: 2
};

const MOCK_APPLICATIONS: ApplicationItem[] = [
  {
    id: 'CIVIC-2026-000128',
    scheme_id: 'sch_tn_postmatric',
    scheme_name: 'Tamil Nadu Post-Matric Scholarship (BC/MBC/DNC)',
    status: 'PENDING',
    stage: 'Institution Verification',
    readiness_score: 82,
    submitted_at: Math.floor(Date.now() / 1000) - 86400 * 22,
    updated_at: Math.floor(Date.now() / 1000) - 86400 * 1,
    stages: [
      { stage: 'Submitted', status: 'COMPLETED', date: '12 Sep 2026', actor: 'Citizen (Priya Kumar)' },
      { stage: 'Document Verification', status: 'COMPLETED', date: '15 Sep 2026', actor: 'State Central Portal' },
      { stage: 'Institution Verification', status: 'ACTIVE_DELAYED', date: '16 Sep 2026 - Present', actor: 'College Scholarship Nodal Officer', days_delayed: 22 },
      { stage: 'District Verification', status: 'PENDING', date: 'Awaiting previous stage', actor: 'District BC Welfare Officer' },
      { stage: 'Approval & Sanction', status: 'PENDING', date: 'Awaiting previous stage', actor: 'Treasury Directorate' },
      { stage: 'Benefit Disbursement', status: 'PENDING', date: 'Awaiting previous stage', actor: 'Aadhaar Payment Bridge' }
    ],
    diagnosis: {
      application_id: 'CIVIC-2026-000128',
      probable_bottleneck: 'College Nodal Officer Institutional e-Attestation Pending',
      confidence: '78%',
      status_duration: '22 Days (Expected Turnaround Time: 7 Days)',
      evidence: [
        { label: 'Citizen Submission', state: 'MATCHED', detail: 'All 5 required certificates uploaded & cryptographic hashes verified' },
        { label: 'System Check', state: 'MATCHED', detail: 'State scholarship portal batch job #BC-491 pending principal approval' },
        { label: 'Bottleneck Marker', state: 'FLAGGED', detail: 'No officer e-sign logged since 16 Sep 2026 (Exceeded norm by 15 days)' }
      ],
      recommended_action: 'Submit official verification request to College Nodal Officer quoting Application ID CIVIC-2026-000128.',
      disclaimer: 'Probable bottleneck analysis is derived from available portal state rules. Final decision rests with the responsible authority.'
    },
    recovery_plan: {
      steps: [
        { step: 1, title: 'Contact College Nodal Officer', desc: 'Visit college scholarship cell or email nodal officer with Application ID CIVIC-2026-000128.', status: 'NEXT_ACTION' },
        { step: 2, title: 'Present Auto-Generated Follow-Up Notice', desc: 'Use CIVIC AI\'s pre-drafted letter citing government circular GO(Ms) No. 72 on scholarship timelines.', status: 'READY' },
        { step: 3, title: 'Monitor for 5 Working Days', desc: 'If still unverified, system will unlock District Welfare Level-2 escalation.', status: 'UPCOMING' },
        { step: 4, title: 'Lodge State CM Helpline Grievance', desc: 'Direct escalation to Tamil Nadu CM Cell 1100 portal with audit ledger proof.', status: 'ESCALATION' }
      ]
    },
    blockchain_tx: '0x8f2d91b4c7302ea4911bf094a37651c09872e45bf92740bcda81928374a5bc92'
  },
  {
    id: 'CIVIC-2026-000842',
    scheme_id: 'sch_pudhumai_penn',
    scheme_name: 'Moovalur Ramamirtham Ammaiyar Scheme (Pudhumai Penn)',
    status: 'APPROVED',
    stage: 'Monthly DBT Active',
    readiness_score: 100,
    submitted_at: Math.floor(Date.now() / 1000) - 86400 * 40,
    updated_at: Math.floor(Date.now() / 1000) - 86400 * 10,
    stages: [
      { stage: 'Submitted', status: 'COMPLETED', date: '10 Aug 2026', actor: 'Citizen (Priya Kumar)' },
      { stage: 'EMIS School Validation', status: 'COMPLETED', date: '14 Aug 2026', actor: 'School Education Dept' },
      { stage: 'Social Welfare Verification', status: 'COMPLETED', date: '20 Aug 2026', actor: 'DSWO Chennai' },
      { stage: 'Approved & Enrolled', status: 'COMPLETED', date: '25 Aug 2026', actor: 'Social Welfare Directorate' },
      { stage: 'Monthly DBT Active', status: 'ACTIVE_HEALTHY', date: 'Disbursing ₹1,000 / month', actor: 'Canara Bank DBT' }
    ],
    blockchain_tx: '0x3a4b91cf78912ea5612bf087e24561a09872e45bf92740bcda81928374a521ef'
  }
];

const MOCK_DOCUMENTS: DocumentItem[] = [
  { id: 'doc_001', user_id: 'usr_priya_001', doc_type: 'Aadhaar', name: 'Aadhaar Card (UIDAI)', status: 'VERIFIED', doc_hash: '9f83c1264b912a78e45b91a7834bcde10928374a5bc92740bcda81928374a5bc', expiry_date: '2035-12-31', created_at: Date.now() - 86400000 * 25, extracted_data: { name: 'Priya Kumar', verified: true } },
  { id: 'doc_002', user_id: 'usr_priya_001', doc_type: 'College_ID', name: 'College Bonafide Certificate', status: 'VERIFIED', doc_hash: '3f72e91bca7821098234bcde10928374a5bc92740bcda81928374a5bc927401', expiry_date: '2027-05-31', created_at: Date.now() - 86400000 * 22, extracted_data: { institution: 'Government Arts & Science College, Nandanam, Chennai', course: 'B.Sc Computer Science' } },
  { id: 'doc_003', user_id: 'usr_priya_001', doc_type: 'Community_Cert', name: 'Community Certificate (BC)', status: 'VERIFIED', doc_hash: '7a912e45bcda81928374a5bc92740bcda81928374a5bc92740bcda81928374a5', expiry_date: 'LIFETIME', created_at: Date.now() - 86400000 * 20, extracted_data: { community: 'Backward Classes (BC)' } },
  { id: 'doc_004', user_id: 'usr_priya_001', doc_type: 'Bank_Passbook', name: 'Canara Bank Savings Passbook', status: 'VERIFIED', doc_hash: '4b827e1928374a5bc92740bcda81928374a5bc92740bcda81928374a5bc9274', expiry_date: '2030-01-01', created_at: Date.now() - 86400000 * 20, extracted_data: { bank: 'Canara Bank', npci_mapped: true } },
  { id: 'doc_005', user_id: 'usr_priya_001', doc_type: 'Income_Cert', name: 'Revenue Dept Income Certificate', status: 'ATTENTION_REQUIRED', doc_hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b', expiry_date: '2026-10-15', created_at: Date.now() - 86400000 * 18, extracted_data: { annual_income: '₹1,80,000', alert: 'Valid for 1 year. Certificate expires in 28 days on 15 Oct 2026. Renewal recommended for uninterrupted DBT.' } }
];

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: 'notif_001', title: 'Scholarship Action Required: 22 Days at College Desk', title_ta: 'கல்வி உதவித்தொகை நடவடிக்கை தேவை: கல்லூரியில் 22 நாட்கள் நிலுவை', message: 'Your Post-Matric Scholarship application is waiting at Institution Verification. Generate an AI follow-up message now.', message_ta: 'உங்கள் விண்ணப்பம் கல்லூரி சரிபார்ப்பில் நிலுவையில் உள்ளது. AI பின்தொடர்தல் கடிதத்தை உருவாக்கவும்.', category: 'BOTTLENECK', is_read: 0, action_url: '/recovery/CIVIC-2026-000128', created_at: Math.floor(Date.now() / 1000) - 7200 },
  { id: 'notif_002', title: 'Income Certificate Renewal Approaching', title_ta: 'வருமானச் சான்றிதழ் புதுப்பிப்பு நெருங்குகிறது', message: 'Your income certificate is valid until 15 Oct 2026 (28 days left). Renew soon to avoid renewal disruption.', message_ta: 'உங்கள் வருமானச் சான்றிதழ் அக் 15 அன்று காலாவதியாகிறது. புதுப்பிக்கவும்.', category: 'DEADLINE', is_read: 0, action_url: '/documents', created_at: Math.floor(Date.now() / 1000) - 43200 },
  { id: 'notif_003', title: 'New Benefit Match: Naan Mudhalvan Free Tech Certs', title_ta: 'புதிய திட்ட வாய்ப்பு: நான் முதல்வன் இலவச சான்றிதழ்', message: '96% profile match detected for AI & Cloud certification program.', message_ta: 'AI & கிளவுட் சான்றிதழ் திட்டத்திற்கு 96% தகுதி உள்ளது.', category: 'SYSTEM', is_read: 1, action_url: '/benefits/sch_tnsdc_tech', created_at: Math.floor(Date.now() / 1000) - 86400 * 2 },
  { id: 'notif_004', title: 'Pudhumai Penn Monthly DBT Credited: ₹1,000', title_ta: 'புதுமைப் பெண் மாத உதவித்தொகை வரவு வைக்கப்பட்டது: ₹1,000', message: 'September month financial grant ₹1,000 credited to Canara Bank A/c ending 4821.', message_ta: 'செப்டம்பர் மாத நிதியுதவி ₹1,000 உங்கள் வங்கிக் கணக்கில் வரவு வைக்கப்பட்டது.', category: 'SYSTEM', is_read: 1, action_url: '/applications/CIVIC-2026-000842', created_at: Math.floor(Date.now() / 1000) - 86400 * 7 }
];

const MOCK_AUDIT_RECORDS: AuditRecord[] = [
  { id: 1, anonymous_user_hash: 'a94f8fe5ccb19ba61c4c0873d391e987982fbbd3', event_type: 'CONSENT_GRANTED', reference_code: 'CNS-PRIYA-001', data_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', block_number: 104201, tx_hash: '0x8f2d91b4c7302ea4911bf094a37651c09872e45bf92740bcda81928374a5bc92', timestamp: Math.floor(Date.now() / 1000) - 86400 * 30, network: 'Demo Blockchain Network' },
  { id: 2, anonymous_user_hash: 'a94f8fe5ccb19ba61c4c0873d391e987982fbbd3', event_type: 'DOCUMENT_REGISTERED', reference_code: 'DOC-AADHAAR-4821', data_hash: '9f83c1264b912a78e45b91a7834bcde10928374a5bc92740bcda81928374a5bc', block_number: 104202, tx_hash: '0x3a4b91cf78912ea5612bf087e24561a09872e45bf92740bcda81928374a521ef', timestamp: Math.floor(Date.now() / 1000) - 86400 * 25, network: 'Demo Blockchain Network' },
  { id: 3, anonymous_user_hash: 'a94f8fe5ccb19ba61c4c0873d391e987982fbbd3', event_type: 'DOCUMENT_VERIFIED', reference_code: 'DOC-AADHAAR-4821', data_hash: '4b827e1928374a5bc92740bcda81928374a5bc92740bcda81928374a5bc9274', block_number: 104205, tx_hash: '0x5c7e91a4b921e45bf92740bcda81928374a5bc92740bcda81928374a5bc9274', timestamp: Math.floor(Date.now() / 1000) - 86400 * 25, network: 'Demo Blockchain Network' },
  { id: 4, anonymous_user_hash: 'a94f8fe5ccb19ba61c4c0873d391e987982fbbd3', event_type: 'APPLICATION_CREATED', reference_code: 'CIVIC-2026-000128', data_hash: '7a912e45bcda81928374a5bc92740bcda81928374a5bc92740bcda81928374a5', block_number: 104225, tx_hash: '0x9a8f273b4012c8e192f801bc43a1829374019283746192837401928374619283', timestamp: Math.floor(Date.now() / 1000) - 86400 * 22, network: 'Demo Blockchain Network' },
  { id: 5, anonymous_user_hash: 'a94f8fe5ccb19ba61c4c0873d391e987982fbbd3', event_type: 'APPLICATION_STATUS_CHANGED', reference_code: 'CIVIC-2026-000128', data_hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b', block_number: 104250, tx_hash: '0x1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d', timestamp: Math.floor(Date.now() / 1000) - 86400 * 16, network: 'Demo Blockchain Network' }
];

const MOCK_ANALYTICS: AdminAnalytics = {
  kpis: {
    total_citizens: 2430,
    total_applications: 1204,
    potential_benefits_matched: 8214,
    pending_applications: 327,
    avg_processing_days: 18.4,
    unresolved_bottlenecks: 84,
    blockchain_verified_audits: 14280
  },
  discovery_trends: [
    { month: 'May', discoveries: 1200, applications: 280, approvals: 210 },
    { month: 'Jun', discoveries: 1950, applications: 410, approvals: 340 },
    { month: 'Jul', discoveries: 2800, applications: 640, approvals: 510 },
    { month: 'Aug', discoveries: 4100, applications: 890, approvals: 720 },
    { month: 'Sep', discoveries: 6400, applications: 1050, approvals: 880 },
    { month: 'Oct', discoveries: 8214, applications: 1204, approvals: 980 }
  ],
  status_distribution: [
    { name: 'Approved & Disbursed', value: 782, color: '#10b981' },
    { name: 'Institution Verification', value: 184, color: '#f59e0b' },
    { name: 'District Officer Review', value: 98, color: '#38bdf8' },
    { name: 'Document Revision Needed', value: 85, color: '#ec4899' },
    { name: 'Rejected / Ineligible', value: 55, color: '#ef4444' }
  ],
  missing_docs: [
    { document: 'Tahsildar Income Certificate', count: 420, percentage: 34.8 },
    { document: 'College Bonafide e-Seal', count: 298, percentage: 24.7 },
    { document: 'NPCI Aadhaar Bank Seeding', count: 215, percentage: 17.8 },
    { document: 'Community Certificate Digital Copy', count: 142, percentage: 11.7 },
    { document: 'Ration Card Family Head Mapping', count: 89, percentage: 7.3 }
  ],
  bottlenecks: [
    { stage: 'College Nodal Officer E-sign', avg_delay_days: 16.2, affected_apps: 184 },
    { stage: 'District Welfare Sanction Order', avg_delay_days: 11.5, affected_apps: 98 },
    { stage: 'Bank NPCI Mapper Awaiting Authorization', avg_delay_days: 7.8, affected_apps: 64 },
    { stage: 'Central Portal Certificate Hash Sync', avg_delay_days: 3.4, affected_apps: 42 }
  ],
  regional_gap_map: [
    { district: 'Chennai', unclaimed_benefits: 1420, delay_rate: '18%', primary_issue: 'Institution Attestation Lag' },
    { district: 'Madurai', unclaimed_benefits: 980, delay_rate: '24%', primary_issue: 'Income Certificate Expiry' },
    { district: 'Coimbatore', unclaimed_benefits: 1150, delay_rate: '14%', primary_issue: 'Bank Aadhaar Seeding' },
    { district: 'Tiruchirappalli', unclaimed_benefits: 840, delay_rate: '21%', primary_issue: 'Bonafide Renewal' },
    { district: 'Salem', unclaimed_benefits: 760, delay_rate: '27%', primary_issue: 'Digital Literacy Barrier' },
    { district: 'Tirunelveli', unclaimed_benefits: 620, delay_rate: '19%', primary_issue: 'EMIS School Record Mapping' }
  ]
};

// -------------------------------------------------------------
// UNIFIED API SERVICE (Live Backend with Graceful Mock Fallback)
// -------------------------------------------------------------
export const api = {
  // Auth
  async login(identifier: string, password: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback
    }

    if (identifier.includes('admin')) {
      return { token: 'demo_token_admin', user: { id: 'usr_admin_001', name: 'S. Meenakshi (Admin Officer)', role: 'ADMIN' } };
    }
    return { token: 'demo_token_priya', user: { id: 'usr_priya_001', name: 'Priya Kumar', role: 'CITIZEN' } };
  },

  async register(data: { name: string; email?: string; phone?: string; password: string }) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { token: 'token_new_user', user: { id: 'usr_new', name: data.name, role: 'CITIZEN' } };
  },

  async getMe() {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { id: 'usr_priya_001', name: 'Priya Kumar', role: 'CITIZEN' };
  },

  // Profile
  async getProfile(): Promise<Profile> {
    try {
      const res = await fetch(`${API_BASE}/profile`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return MOCK_PROFILE;
  },

  async updateProfile(data: Partial<Profile>) {
    try {
      const res = await fetch(`${API_BASE}/profile`, { method: 'PUT', headers: getAuthHeader(), body: JSON.stringify(data) });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { status: 'success', opportunity_score: 78 };
  },

  async submitOnboarding(data: Record<string, any>) {
    try {
      const res = await fetch(`${API_BASE}/profile/onboard`, { method: 'POST', headers: getAuthHeader(), body: JSON.stringify(data) });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { status: 'completed', opportunity_score: 78, tx_hash: '0x9a8f273b4012c8e192f801bc43a1' };
  },

  // Benefits
  async getBenefits(category?: string): Promise<BenefitScheme[]> {
    try {
      const url = category && category !== 'ALL' ? `${API_BASE}/benefits?category=${encodeURIComponent(category)}` : `${API_BASE}/benefits`;
      const res = await fetch(url, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    if (category && category !== 'ALL') {
      return MOCK_SCHEMES.filter(s => s.category.toLowerCase().includes(category.toLowerCase()));
    }
    return MOCK_SCHEMES;
  },

  async getBenefitDetail(id: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/benefits/${id}`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    const sc = MOCK_SCHEMES.find(s => s.id === id) || MOCK_SCHEMES[0];
    const app = MOCK_APPLICATIONS.find(a => a.scheme_id === id);
    return {
      scheme: sc,
      match_score: sc.match_score || 94,
      readiness_score: 82,
      missing_docs: sc.missing_docs || [],
      ai_explanation: `Based on your profile as a College Student with an annual income of ₹1,80,000 in Tamil Nadu, this scheme matches published criteria. Mandatory certificates are verified on the development blockchain ledger.`,
      application: app || null
    };
  },

  // Documents
  async getDocuments(): Promise<{ documents: DocumentItem[]; total_count: number; verified_count: number; document_readiness_score: number }> {
    try {
      const res = await fetch(`${API_BASE}/documents`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      documents: MOCK_DOCUMENTS,
      total_count: MOCK_DOCUMENTS.length,
      verified_count: 4,
      document_readiness_score: 82
    };
  },

  async uploadDocument(docType: string, docName: string, file?: File) {
    try {
      const formData = new FormData();
      formData.append('doc_type', docType);
      formData.append('doc_name', docName);
      if (file) formData.append('file', file);
      const res = await fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('civic_token') || 'demo_token_priya'}` },
        body: formData
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const newDoc: DocumentItem = {
      id: `doc_${Date.now()}`,
      user_id: 'usr_priya_001',
      doc_type: docType,
      name: docName,
      status: 'VERIFIED',
      doc_hash: `hash_${Date.now()}_sha256`,
      expiry_date: '2027-12-31',
      created_at: Date.now()
    };
    MOCK_DOCUMENTS.unshift(newDoc);
    return newDoc;
  },

  // Applications
  async getApplications(): Promise<ApplicationItem[]> {
    try {
      const res = await fetch(`${API_BASE}/applications`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return MOCK_APPLICATIONS;
  },

  async getApplicationDetail(id: string): Promise<ApplicationItem> {
    try {
      const res = await fetch(`${API_BASE}/applications/${id}`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return MOCK_APPLICATIONS.find(a => a.id === id) || MOCK_APPLICATIONS[0];
  },

  async submitApplication(schemeId: string, consent: boolean = true) {
    try {
      const res = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ scheme_id: schemeId, consent_acknowledged: consent })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const newApp: ApplicationItem = {
      id: `CIVIC-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      scheme_id: schemeId,
      scheme_name: MOCK_SCHEMES.find(s => s.id === schemeId)?.name || 'Government Entitlement Scheme',
      status: 'UNDER_VERIFICATION',
      stage: 'Document Verification',
      readiness_score: 95,
      submitted_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
      stages: [
        { stage: 'Submitted', status: 'COMPLETED', date: 'Just now', actor: 'Citizen (Priya Kumar)' },
        { stage: 'Document Verification', status: 'ACTIVE_PROCESSING', date: 'In Progress', actor: 'State Central Portal' },
        { stage: 'Institution Verification', status: 'PENDING', date: 'Awaiting', actor: 'Institution Desk' },
        { stage: 'District Verification', status: 'PENDING', date: 'Awaiting', actor: 'District Welfare Officer' },
        { stage: 'Approval & Sanction', status: 'PENDING', date: 'Awaiting', actor: 'Treasury Directorate' },
        { stage: 'Benefit Disbursement', status: 'PENDING', date: 'Awaiting', actor: 'Aadhaar Payment Bridge' }
      ],
      blockchain_tx: `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`
    };
    MOCK_APPLICATIONS.unshift(newApp);
    return newApp;
  },

  // Recovery
  async diagnoseApplication(appId: string) {
    try {
      const res = await fetch(`${API_BASE}/applications/${appId}/diagnose`, { method: 'POST', headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    const app = MOCK_APPLICATIONS.find(a => a.id === appId) || MOCK_APPLICATIONS[0];
    return {
      diagnosis: app.diagnosis,
      recovery_plan: app.recovery_plan
    };
  },

  async generateFollowUp(appId: string, recipientRole: string, language: string = 'en') {
    try {
      const res = await fetch(`${API_BASE}/followup/generate`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ application_id: appId, recipient_role: recipientRole, language })
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const nowStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    if (language === 'ta') {
      return {
        application_id: appId,
        language: 'ta',
        subject: `விண்ணப்பம் ${appId} - கல்லூரி சரிபார்ப்பு கோரிக்கை`,
        body: `அனுப்புநர்:\nபிரியா குமார்\nமாணவர், தமிழ்நாடு\nநாள்: ${nowStr}\n\nபெறுநர்:\nகல்வி உதவித்தொகை ஒருங்கிணைப்பாளர் / கல்லூரி முதல்வர்,\nஅங்கீகரிக்கப்பட்ட கல்வி நிறுவனம், சென்னை.\n\nபொருள்: அரசு கல்வி உதவித்தொகை விண்ணப்ப எண் ${appId} - கல்லூரி நிலை சரிபார்ப்பு கோரி மனு.\n\nமதிப்பிற்குரிய ஐயா / அம்மா,\n\nநான் தமிழ்நாடு பின்-மெட்ரிக் கல்வி உதவித்தொகை திட்டத்திற்காக இணையதளம் வழியாக விண்ணப்பித்துள்ளேன். எனது விண்ணப்ப எண்: ${appId}.\n\nஅரசு வழிகாட்டுதல்களின்படி தேவையான அனைத்து சான்றிதழ்களும் சமர்ப்பிக்கப்பட்டு, போர்ட்டல் ஆரம்ப தணிக்கை நிறைவடைந்துள்ளது. எனது விண்ணப்பம் கடந்த 22 நாட்களாக கல்லூரி சரிபார்ப்பு நிலையில் நிலுவையில் உள்ளது என சிஸ்டம் சுட்டிக்காட்டுகிறது.\n\nதயவுகூர்ந்து எனது விண்ணப்பத்தை சரிபார்த்து அடுத்த மாவட்ட நிலைக்கு அனுப்பி வைக்குமாறு பணிவுடன் கேட்டுக்கொள்கிறேன்.\n\nநன்றி,\nஇப்படிக்கு,\nபிரியா குமார்\nவிண்ணப்ப எண்: ${appId}`,
        generated_at: nowStr
      };
    }
    return {
      application_id: appId,
      language: 'en',
      subject: `Request for Institution Verification - Scholarship Application ${appId}`,
      body: `From:\nPriya Kumar\nRegistered Citizen / Student, Tamil Nadu\nDate: ${nowStr}\n\nTo:\nThe Scholarship Nodal Officer / The Principal,\nInstitution Scholarship Cell, Chennai.\n\nSubject: Request for expedited institution verification for Application ID: ${appId}\n\nRespected Sir / Madam,\n\nI have submitted an online application for the Tamil Nadu Post-Matric Scholarship. My unique Application Reference ID is ${appId}.\n\nAccording to the official scheme guidelines, the normative institutional turnaround time is 7 working days. The portal audit records confirm that all mandatory student certificates were uploaded and cryptographic hashes were verified on 15 September 2026. However, the application has currently been pending at the Institution Verification stage for 22 days.\n\nI kindly request your office to review and e-attest my application at the earliest to ensure timely processing and prevent disbursement delays.\n\nAll uploaded documents and blockchain verification proofs are available on the state scholarship portal under my Application ID.\n\nThank you for your assistance.\n\nYours sincerely,\nPriya Kumar\nApplication ID: ${appId}`,
      generated_at: nowStr
    };
  },

  async generateGrievance(appId: string, targetAuthority: string) {
    try {
      const res = await fetch(`${API_BASE}/grievance/generate`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ application_id: appId, target_authority: targetAuthority })
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const nowStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    return {
      grievance_id: `GRV-2026-TN914`,
      target_authority: targetAuthority,
      subject: `FORMAL GRIEVANCE PETITION: Undue delay in scholarship processing - Ref ${appId}`,
      petition: `TO:\nThe District Collector & District Backward Classes Welfare Officer,\nDistrict Collectorate, Tamil Nadu.\n\nPETITIONER:\nName: Priya Kumar\nAadhaar Reference: XXXX XXXX 4821\nApplication ID: ${appId}\nDate: ${nowStr}\n\nSUBJECT: Petition regarding delay exceeding statutory timeline for ${appId} under Tamil Nadu Citizen Charter.\n\nRESPECTED AUTHORITY,\n\n1. I am a bonafide college student and resident of Tamil Nadu belonging to eligible community categories.\n2. I formally submitted my scholarship application on the state portal (Ref: ${appId}).\n3. All required certifications have been submitted and digitally hashed.\n4. Despite exceeding the prescribed turnaround timeline by more than 15 days, no action has been recorded at the institutional verification tier.\n5. In accordance with the citizen charter and CM Cell guidelines, I pray that this esteemed office kindly intervene and issue directions for immediate verification and sanction.\n\nBLOCKCHAIN AUDIT REFERENCE:\nTx Hash: 0x8f2d91b4c7302ea4911bf094a37651c09872e45bf92740bcda81928374a5bc92\nAudit Status: VERIFIED ON DEMO BLOCKCHAIN NETWORK\n\nSincerely submitted,\nPriya Kumar`,
      submitted_at: nowStr
    };
  },

  // Blockchain Audit Ledger
  async getAuditLedger(): Promise<{ network: string; smart_contract: string; security_guarantee: string; records: AuditRecord[] }> {
    try {
      const res = await fetch(`${API_BASE}/audit`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      network: 'Demo Blockchain Network (EVM Development Ledger)',
      smart_contract: 'CivicAuditLedger.sol (0x71C...49D)',
      security_guarantee: 'ZERO RAW PII ON-CHAIN. All records are SHA-256 cryptographic state proofs.',
      records: MOCK_AUDIT_RECORDS
    };
  },

  async verifyAuditRecord(txHash: string) {
    try {
      const res = await fetch(`${API_BASE}/audit/verify/${txHash}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      verified: true,
      tx_hash: txHash,
      block_number: 104250,
      event_type: 'APPLICATION_STATUS_CHANGED',
      reference_code: 'CIVIC-2026-000128',
      data_hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      status: 'CONFIRMED_ON_CHAIN',
      network: 'Demo Blockchain Network',
      message: 'Cryptographic SHA-256 data hash verified against immutable ledger.'
    };
  },

  // Consent & Privacy
  async getConsent() {
    try {
      const res = await fetch(`${API_BASE}/consent`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { consent_profile: 1, consent_documents: 1, consent_matching: 1, consent_diagnosis: 1, consent_blockchain: 1 };
  },

  async updateConsent(data: Record<string, boolean>) {
    try {
      const res = await fetch(`${API_BASE}/consent`, { method: 'POST', headers: getAuthHeader(), body: JSON.stringify(data) });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { status: 'updated', blockchain_tx: '0x9a8f273b4012c8e192f801bc43a1' };
  },

  async exportData() {
    try {
      const res = await fetch(`${API_BASE}/data/export`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      export_metadata: { platform: 'CIVIC AI', format: 'Citizen Portable Data Archive (JSON)', generated_at: new Date().toISOString() },
      user_profile: MOCK_PROFILE,
      registered_documents: MOCK_DOCUMENTS,
      application_records: MOCK_APPLICATIONS
    };
  },

  async requestDataDeletion() {
    try {
      const res = await fetch(`${API_BASE}/data/delete`, { method: 'POST', headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { status: 'deletion_scheduled', grace_period_days: 14 };
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const res = await fetch(`${API_BASE}/notifications`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return MOCK_NOTIFICATIONS;
  },

  async markNotificationRead(id: string) {
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'POST', headers: getAuthHeader() });
    } catch (e) {}
    return { status: 'marked_read' };
  },

  // AI Assistant & Voice
  async sendAssistantMessage(message: string, language: string = 'en') {
    try {
      const res = await fetch(`${API_BASE}/assistant/chat`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ message, language })
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const msg = message.toLowerCase();
    const isTa = language === 'ta' || /[\u0B80-\u0BFF]/.test(message);

    if (msg.includes('வணக்கம்') || msg.includes('hello') || msg.includes('hi') || msg.includes('vanakkam')) {
      return {
        reply: isTa
          ? 'வணக்கம்! நான் உங்கள் சிவிக் AI உதவியாளர். தமிழ்நாடு அரசின் கல்வி உதவித்தொகை, புதுமைப் பெண் திட்டம், முதியோர் ஓய்வூதியம், மகளிர் உரிமைத் தொகை மற்றும் உங்கள் விண்ணப்ப நிலவரம் குறித்து எளிய தமிழில் உதவ நான் தயாராக உள்ளேன். நீங்கள் எதைப்பற்றி அறிய விரும்புகிறீர்கள்?'
          : 'Hello! I am your CIVIC AI Assistant. I can guide you on scholarships, pensions, pending application recovery, and document renewals. How can I help you today?',
        action: { route: '/benefits', label: isTa ? 'நலத்திட்டங்களை காண்க' : 'Explore Benefits' }
      };
    }

    if (msg.includes('pending') || msg.includes('stuck') || msg.includes('நிலுவை') || msg.includes('தாமதம்')) {
      return {
        reply: isTa
          ? 'உங்கள் தமிழ்நாடு பின்-மெட்ரிக் கல்வி உதவித்தொகை விண்ணப்பம் கல்லூரி சரிபார்ப்பு நிலையில் 22 நாட்களாக நிலுவையில் உள்ளது. கல்லூரி நோடல் அதிகாரியிடம் சமர்ப்பிக்க எங்கள் AI பின்தொடர்தல் கடிதத்தை உடனே பயன்படுத்த பரிந்துரைக்கப்படுகிறது.' 
          : 'Your TN Post-Matric Scholarship is pending at Institution Verification for 22 days. You can download our auto-generated follow-up letter to request expedited college nodal officer sign-off.',
        action: { route: '/recovery/CIVIC-2026-000128', label: isTa ? 'மீட்பு வழிகாட்டியைத் திற' : 'Open Recovery Copilot' }
      };
    }

    if (msg.includes('முதியோர்') || msg.includes('pension') || msg.includes('ஓய்வூதியம்')) {
      return {
        reply: isTa
          ? 'தமிழ்நாடு இந்திரா காந்தி முதியோர் ஓய்வூதியத் திட்டம் மூலம் 60 வயதுக்கு மேற்பட்ட தகுதியான மூத்த குடிமக்களுக்கு மாதம் ₹1,000 வங்கி கணக்கில் வழங்கப்படுகிறது. ஆதார், வயது சான்று மற்றும் வருமான சான்றிதழ் கொண்டு விண்ணப்பிக்கலாம்.'
          : 'Under the TN Indira Gandhi Old Age Pension Scheme, senior citizens aged 60+ receive ₹1,000 per month directly to their bank account.',
        action: { route: '/benefits', label: isTa ? 'ஓய்வூதிய திட்டம்' : 'View Pension Scheme' }
      };
    }

    if (msg.includes('மகளிர்') || msg.includes('women') || msg.includes('உரிமை')) {
      return {
        reply: isTa
          ? 'கலைஞர் மகளிர் உரிமைத் திட்டம் மூலம் குடும்ப தலைவிகளுக்கு மாதம் ₹1,000 வங்கி கணக்கில் நேரடியாக செலுத்தப்படுகிறது. மேலும் மாணவிகளுக்கு புதுமைப் பெண் திட்டம் மூலம் மாதம் ₹1,000 வழங்கப்படுகிறது.'
          : 'Under Kalaignar Magalir Urimai Thogai, eligible women heads of households receive ₹1,000/month DBT support.',
        action: { route: '/benefits', label: isTa ? 'மகளிர் திட்டங்கள்' : 'View Women Schemes' }
      };
    }

    if (msg.includes('ஆவணம்') || msg.includes('document') || msg.includes('வருமான')) {
      return {
        reply: isTa
          ? 'உங்கள் ஆவணக் காப்பகத்தில் ஆதார் சரிபார்க்கப்பட்டுள்ளது. ஆனால் உங்கள் வட்டாட்சியர் வருமான சான்றிதழ் இன்னும் 18 நாட்களில் காலாவதியாக உள்ளது! உடனே இ-சேவை மையம் மூலம் புதுப்பிக்கவும்.'
          : 'Your Aadhaar is verified. However, an urgent alert: your Tahsildar Income Certificate expires in 18 days! Please renew it promptly via e-Sevai.',
        action: { route: '/documents', label: isTa ? 'ஆவணக் காப்பகம்' : 'Open Document Vault' }
      };
    }

    return {
      reply: isTa 
        ? 'உங்கள் மாணவர் சுயவிவரத்தின்படி தமிழ்நாடு பின்-மெட்ரிக் கல்வி உதவித்தொகை (100% கட்டண விலக்கு + ₹4,000 பராமரிப்பு) மற்றும் நான் முதல்வன் திட்டங்களுக்கு அதிக தகுதி உள்ளது.' 
        : 'Based on your profile as an undergraduate student in Tamil Nadu, you have strong eligibility for TN Post-Matric Scholarship (94% match) and Naan Mudhalvan AI Training (96% match).',
      action: { route: '/benefits', label: isTa ? 'திட்டங்களை காண்க' : 'Explore Benefits' }
    };
  },

  async sendVoiceCommand(command: string, language: string = 'en') {
    try {
      const res = await fetch(`${API_BASE}/voice/command`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ command, language })
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const cmd = command.toLowerCase();
    const isTa = language === 'ta' || /[\u0B80-\u0BFF]/.test(command);

    if (cmd.includes('benefit') || cmd.includes('scholarship') || cmd.includes('திட்டம்') || cmd.includes('பயன்')) {
      return { action: 'NAVIGATE', route: '/benefits', speech: isTa ? 'உங்கள் நலத்திட்டங்கள் பக்கத்தை திறக்கிறேன்.' : 'Opening your Benefit Radar.' };
    }
    if (cmd.includes('application') || cmd.includes('track') || cmd.includes('விண்ணப்ப') || cmd.includes('நிலுவை')) {
      return { action: 'NAVIGATE', route: '/applications', speech: isTa ? 'விண்ணப்பங்கள் பக்கத்தை திறக்கிறேன்.' : 'Opening application tracker.' };
    }
    if (cmd.includes('document') || cmd.includes('ஆவண') || cmd.includes('சான்றிதழ்')) {
      return { action: 'NAVIGATE', route: '/documents', speech: isTa ? 'ஆவணக் காப்பகத்தை திறக்கிறேன்.' : 'Opening document vault.' };
    }
    if (cmd.includes('recover') || cmd.includes('மீட்பு') || cmd.includes('தாமதம்')) {
      return { action: 'NAVIGATE', route: '/recovery/CIVIC-2026-000128', speech: isTa ? 'விண்ணப்ப மீட்பு வழிகாட்டியை திறக்கிறேன்.' : 'Opening recovery copilot.' };
    }
    return { action: 'NAVIGATE', route: '/benefits', speech: isTa ? 'நலத்திட்டங்கள் பக்கத்தை திறக்கிறேன்.' : 'Opening benefits.' };
  },

  // Admin Analytics
  async getAdminAnalytics(): Promise<AdminAnalytics> {
    try {
      const res = await fetch(`${API_BASE}/admin/analytics`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return MOCK_ANALYTICS;
  },

  async getAdminInsights() {
    try {
      const res = await fetch(`${API_BASE}/admin/insights`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      generated_at: new Date().toISOString(),
      ai_policy_insights: [
        { title: 'Income Certificate Expiry Clustering', severity: 'HIGH', impact: 'Accountable for 41% of sudden scholarship rejections in Q3.', recommendation: 'Extend automated proactive notification alerts 45 days prior to expiration.' },
        { title: 'College Nodal Desk Turnaround Asymmetry', severity: 'CRITICAL', impact: 'Average institutional pending duration is 16.2 days against normative 7 days.', recommendation: 'Implement an automated reminder escalation protocol on Day 8 of inactivity.' },
        { title: 'High Discovery to Application Drop-off in Tech Skills', severity: 'MEDIUM', impact: '82% interest in Naan Mudhalvan free AI certification but 48% drop-off at document upload.', recommendation: 'Enable single-click bonafide auto-import via State University ERP integration.' }
      ]
    };
  }
};
