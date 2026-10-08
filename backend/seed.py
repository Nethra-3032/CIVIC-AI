import json
import time
import hashlib
from database import get_connection, init_db, hash_data, make_tx_hash

def seed():
    init_db()
    conn = get_connection()
    cursor = conn.cursor()

    # Check if already seeded
    cursor.execute("SELECT COUNT(*) as count FROM users")
    if cursor.fetchone()["count"] > 0:
        conn.close()
        return

    now = int(time.time())
    priya_id = "usr_priya_001"
    admin_id = "usr_admin_001"
    priya_user_hash = hash_data(f"{priya_id}:salt_civic_2026")

    # 1. Users (simple hash for demo, sha256 of demo123)
    pw_hash = hash_data("demo123")
    admin_pw = hash_data("admin123")
    cursor.execute("""
    INSERT INTO users (id, name, email, phone, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (priya_id, "Priya Kumar", "priya.kumar@example.com", "+919876543210", pw_hash, "CITIZEN", now - 86400 * 30))

    cursor.execute("""
    INSERT INTO users (id, name, email, phone, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (admin_id, "S. Meenakshi (Admin Officer)", "admin@civic.gov.in", "+919123456789", admin_pw, "ADMIN", now - 86400 * 60))

    # 2. Profiles
    cursor.execute("""
    INSERT INTO profiles (user_id, age, dob, state, district, education, employment, income, category, masked_aadhaar, bank_verified, opportunity_score, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        priya_id,
        19,
        "2007-04-12",
        "Tamil Nadu",
        "Chennai",
        "College Student",
        "Student",
        180000,
        "BC/MBC",
        "XXXX XXXX 4821",
        1,
        73,
        now
    ))

    # 3. Consents
    cursor.execute("""
    INSERT INTO consents (id, user_id, consent_profile, consent_documents, consent_matching, consent_diagnosis, consent_blockchain, updated_at)
    VALUES (?, ?, 1, 1, 1, 1, 1, ?)
    """, ("cns_priya_001", priya_id, now))

    # 4. Schemes (Comprehensive, authentic Tamil Nadu & Central schemes)
    schemes_data = [
        {
            "id": "sch_tn_postmatric",
            "name": "Tamil Nadu Post-Matric Scholarship (BC/MBC/DNC)",
            "name_ta": "தமிழ்நாடு பின்-மெட்ரிக் கல்வி உதவித்தொகை (BC/MBC)",
            "category": "Education",
            "description": "Financial assistance for tuition fees, maintenance charges, and exam fees for Backward Classes and Most Backward Classes students pursuing undergraduate degrees in recognized colleges.",
            "description_ta": "அங்கீகரிக்கப்பட்ட கல்லூரிகளில் பட்டப்படிப்பு பயிலும் பிற்படுத்தப்பட்ட மற்றும் மிகவும் பிற்படுத்தப்பட்ட வகுப்பு மாணவ-மாணவியருக்கான கல்வி கட்டண உதவித்தொகை.",
            "benefit_summary": "100% Tuition Fee waiver + ₹4,000/year annual maintenance allowance",
            "benefit_summary_ta": "100% கல்விக் கட்டண விலக்கு + ஆண்டு பராமரிப்பு உதவித்தொகை ₹4,000",
            "criteria_json": json.dumps({
                "min_age": 17,
                "max_age": 28,
                "education_levels": ["College Student", "Postgraduate", "Diploma"],
                "max_income": 250000,
                "states": ["Tamil Nadu"],
                "categories": ["BC/MBC", "SC/ST", "DNC"],
                "gender": "ALL"
            }),
            "documents_json": json.dumps([
                {"type": "Aadhaar", "name": "Aadhaar Card (Identity & Address)", "mandatory": True},
                {"type": "College_ID", "name": "College Bonafide Certificate / Student ID", "mandatory": True},
                {"type": "Income_Cert", "name": "Tahsildar Income Certificate (< ₹2.5 Lakh)", "mandatory": True},
                {"type": "Community_Cert", "name": "Community Certificate (BC/MBC)", "mandatory": True},
                {"type": "Bank_Passbook", "name": "Aadhaar-Linked Bank Account Passbook", "mandatory": True}
            ]),
            "workflow_json": json.dumps([
                {"step": 1, "title": "Application Submission", "tat_days": 1},
                {"step": 2, "title": "Portal Document Verification", "tat_days": 3},
                {"step": 3, "title": "Institution Verification", "tat_days": 7, "note": "College Principal & Nodal Officer desk approval"},
                {"step": 4, "title": "District Officer Verification", "tat_days": 10, "note": "District Backward Classes Welfare Officer"},
                {"step": 5, "title": "Sanction Order & Treasury Bill", "tat_days": 5},
                {"step": 6, "title": "DBT Direct Bank Transfer", "tat_days": 2}
            ]),
            "escalation_json": json.dumps([
                {"level": 1, "authority": "College Scholarship Nodal Officer", "action": "Submit verification grievance letter"},
                {"level": 2, "authority": "District BC/MBC Welfare Officer, Collectorate", "action": "District Public Grievance Day (Every Monday)"},
                {"level": 3, "authority": "Directorate of Backward Classes Welfare, Chennai / CM Helpline 1100", "action": "State CM Cell Portal formal complaint"}
            ]),
            "deadline": "2026-11-15",
            "official_source": "https://bcmbcmw.tn.gov.in",
            "last_updated": "2026-09-01"
        },
        {
            "id": "sch_pudhumai_penn",
            "name": "Moovalur Ramamirtham Ammaiyar Higher Education Assurance Scheme (Pudhumai Penn)",
            "name_ta": "மூவலூர் ராமாமிர்தம் அம்மையார் புதுமைப் பெண் திட்டம்",
            "category": "Education",
            "description": "Monthly financial assistance of ₹1,000 deposited directly into girl students' bank accounts who studied in Government schools from Classes 6 to 12 and enrolled in Higher Education.",
            "description_ta": "அரசுப் பள்ளிகளில் 6 முதல் 12-ம் வகுப்பு வரை படித்து உயர்கல்வி பயிலும் மாணவிகளுக்கு மாதம் ₹1,000 நிதியுதவி.",
            "benefit_summary": "₹1,000 per month deposited directly via Aadhaar DBT until degree completion",
            "benefit_summary_ta": "பட்டம் முடியும் வரை மாதம் ₹1,000 வங்கி கணக்கில் நேரடியாக செலுத்தப்படும்",
            "criteria_json": json.dumps({
                "min_age": 17,
                "max_age": 25,
                "education_levels": ["College Student", "Diploma"],
                "max_income": 9999999,
                "states": ["Tamil Nadu"],
                "categories": ["ALL"],
                "gender": "FEMALE",
                "condition": "Must have completed 6th to 12th in Tamil Nadu Government School"
            }),
            "documents_json": json.dumps([
                {"type": "Aadhaar", "name": "Aadhaar Card", "mandatory": True},
                {"type": "EMIS_Cert", "name": "EMIS School Transfer Certificate (Classes 6-12 Govt School)", "mandatory": True},
                {"type": "College_ID", "name": "College Admission Confirmation Slip", "mandatory": True},
                {"type": "Bank_Passbook", "name": "Individual Bank Account Details", "mandatory": True}
            ]),
            "workflow_json": json.dumps([
                {"step": 1, "title": "Online Registration via College", "tat_days": 2},
                {"step": 2, "title": "EMIS School Record Validation", "tat_days": 4},
                {"step": 3, "title": "Social Welfare Department Verification", "tat_days": 5},
                {"step": 4, "title": "Monthly DBT Generation", "tat_days": 1}
            ]),
            "escalation_json": json.dumps([
                {"level": 1, "authority": "College Principal / Social Welfare Coordinator", "action": "EMIS mapping review"},
                {"level": 2, "authority": "District Social Welfare Officer (DSWO)", "action": "Grievance petition submission"},
                {"level": 3, "authority": "Social Welfare & Women Empowerment Dept / Helpline 181", "action": "Toll-free 181 assistance"}
            ]),
            "deadline": "2026-10-31",
            "official_source": "https://pudhumaipenn.tn.gov.in",
            "last_updated": "2026-08-20"
        },
        {
            "id": "sch_cmchis_tn",
            "name": "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS - TN)",
            "name_ta": "முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம்",
            "category": "Healthcare",
            "description": "Cashless hospitalization coverage of up to ₹5,00,000 per family per year for 1,090 surgical procedures and 154 specialized therapies in empanelled hospitals.",
            "description_ta": "குடும்பத்திற்கு ஆண்டுக்கு ₹5,00,000 வரை கட்டணமில்லா மருத்துவ காப்பீடு சிகிச்சை.",
            "benefit_summary": "₹5,00,000/year family cashless coverage across private & govt tertiary hospitals",
            "benefit_summary_ta": "குடும்பத்திற்கு ஆண்டுக்கு ₹5,00,000 மருத்துவ காப்பீட்டு உதவி",
            "criteria_json": json.dumps({
                "min_age": 0,
                "max_age": 120,
                "education_levels": ["ALL"],
                "max_income": 120000,
                "states": ["Tamil Nadu"],
                "categories": ["ALL"],
                "gender": "ALL"
            }),
            "documents_json": json.dumps([
                {"type": "Smart_Ration_Card", "name": "Tamil Nadu Digital Smart Ration Card", "mandatory": True},
                {"type": "Income_Cert", "name": "VAO / Tahsildar Income Certificate (< ₹1.2 Lakh/year)", "mandatory": True},
                {"type": "Aadhaar", "name": "Aadhaar Cards of all Family Members", "mandatory": True}
            ]),
            "workflow_json": json.dumps([
                {"step": 1, "title": "Enrollment at District Kiosk / Taluk Office", "tat_days": 1},
                {"step": 2, "title": "Biometric & Ration Card Verification", "tat_days": 1},
                {"step": 3, "title": "Smart Health Card Issuance", "tat_days": 3}
            ]),
            "escalation_json": json.dumps([
                {"level": 1, "authority": "CMCHIS District Kiosk Manager", "action": "Kiosk verification status check"},
                {"level": 2, "authority": "CMCHIS 24x7 Toll-Free Call Centre 1800-425-3993", "action": "Helpline escalation"}
            ]),
            "deadline": "2026-12-31",
            "official_source": "https://cmchistn.com",
            "last_updated": "2026-07-15"
        },
        {
            "id": "sch_pm_surya_ghar",
            "name": "PM Surya Ghar: Muft Bijli Yojana",
            "name_ta": "பிரதம மந்திரி சூர்யா கர்: இலவச மின்சார திட்டம்",
            "category": "Housing & Energy",
            "description": "Central government subsidy of up to ₹78,000 for rooftop solar installation, delivering up to 300 units of free electricity every month for households.",
            "description_ta": "வீட்டு மேற்கூரை சோலார் அமைப்பிற்கு ₹78,000 வரை மானியம் மற்றும் மாதம் 300 யூனிட் வரை இலவச மின்சாரம்.",
            "benefit_summary": "Up to ₹78,000 direct subsidy + ₹1,500/month estimated power bill savings",
            "benefit_summary_ta": "₹78,000 வரை அரசு மானியம் + மாதம் ₹1,500 மின் கட்டண சேமிப்பு",
            "criteria_json": json.dumps({
                "min_age": 18,
                "max_age": 100,
                "education_levels": ["ALL"],
                "max_income": 9999999,
                "states": ["Tamil Nadu", "ALL"],
                "categories": ["ALL"],
                "gender": "ALL"
            }),
            "documents_json": json.dumps([
                {"type": "Electricity_Bill", "name": "Recent Electricity Bill (TANGEDCO Consumer No)", "mandatory": True},
                {"type": "Aadhaar", "name": "Aadhaar Card", "mandatory": True},
                {"type": "Bank_Passbook", "name": "Cancelled Cheque or Bank Passbook", "mandatory": True},
                {"type": "Roof_Ownership", "name": "House Tax Receipt / Ownership Proof", "mandatory": True}
            ]),
            "workflow_json": json.dumps([
                {"step": 1, "title": "Online Portal Registration", "tat_days": 1},
                {"step": 2, "title": "DISCOM Technical Feasibility Approval", "tat_days": 7},
                {"step": 3, "title": "Vendor Installation & Net-Meter Inspection", "tat_days": 15},
                {"step": 4, "title": "Subsidy Disbursement to Bank Account", "tat_days": 10}
            ]),
            "escalation_json": json.dumps([
                {"level": 1, "authority": "TANGEDCO Section Assistant Engineer", "action": "Net-meter inspection review"},
                {"level": 2, "authority": "National Portal Grievance Desk 15555", "action": "Central MNRE ticket"}
            ]),
            "deadline": "2026-12-31",
            "official_source": "https://pmsuryaghar.gov.in",
            "last_updated": "2026-09-10"
        },
        {
            "id": "sch_magalir_urimai",
            "name": "Kalaignar Magalir Urimai Thittam (Women Basic Income)",
            "name_ta": "கலைஞர் மகளிர் உரிமைத் திட்டம்",
            "category": "Welfare",
            "description": "Monthly economic entitlement of ₹1,000 provided to eligible women heads of families in Tamil Nadu to foster financial autonomy and recognize unpaid care work.",
            "description_ta": "குடும்பத் தலைவிகளுக்கு மாதம் ₹1,000 மகளிர் உரிமைத் தொகை வழங்கும் சமூக நலத் திட்டம்.",
            "benefit_summary": "₹1,000 deposited on the 15th of every month into bank account",
            "benefit_summary_ta": "மாதந்தோறும் 15-ம் தேதி வங்கி கணக்கில் ₹1,000",
            "criteria_json": json.dumps({
                "min_age": 21,
                "max_age": 100,
                "education_levels": ["ALL"],
                "max_income": 250000,
                "states": ["Tamil Nadu"],
                "categories": ["ALL"],
                "gender": "FEMALE",
                "condition": "Family must consume under 3,600 electricity units/year and own less than 5 acres wetland"
            }),
            "documents_json": json.dumps([
                {"type": "Smart_Ration_Card", "name": "Digital Smart Ration Card", "mandatory": True},
                {"type": "Aadhaar", "name": "Aadhaar Card", "mandatory": True},
                {"type": "Electricity_Bill", "name": "EB Consumer Number", "mandatory": True},
                {"type": "Bank_Passbook", "name": "Aadhaar-Linked Bank Account (NPCI Mapped)", "mandatory": True}
            ]),
            "workflow_json": json.dumps([
                {"step": 1, "title": "Camp Application at Ration Shop", "tat_days": 1},
                {"step": 2, "title": "Field Verification by Village Administrative Officer", "tat_days": 10},
                {"step": 3, "title": "SMS Confirmation & Direct Benefit Crediting", "tat_days": 5}
            ]),
            "escalation_json": json.dumps([
                {"level": 1, "authority": "e-Sevai Special Appeal Camp / Revenue Inspector", "action": "RDO Appeal application"},
                {"level": 2, "authority": "Revenue Divisional Officer (RDO) Appellate Authority", "action": "Official RDO review within 30 days"}
            ]),
            "deadline": "2026-11-30",
            "official_source": "https://kmut.tn.gov.in",
            "last_updated": "2026-08-15"
        },
        {
            "id": "sch_tnsdc_tech",
            "name": "Naan Mudhalvan - Free AI & Cloud Upskilling Program",
            "name_ta": "நான் முதல்வன் - இலவச AI & கிளவுட் திறன் மேம்பாட்டு திட்டம்",
            "category": "Employment",
            "description": "Free industry-recognized certifications in AI, Data Science, and Cloud Computing with placement guidance for college students in Tamil Nadu.",
            "description_ta": "கல்லூரி மாணவர்களுக்கான AI மற்றும் கிளவுட் தொழில்நுட்பங்களில் இலவச தொழிற்பயிற்சி.",
            "benefit_summary": "100% Free global certification vouchers (AWS/Google/Microsoft) + Campus placement drives",
            "benefit_summary_ta": "இலவச சான்றிதழ் + வளாக நேர்காணல் வழிகாட்டல்",
            "criteria_json": json.dumps({
                "min_age": 18,
                "max_age": 26,
                "education_levels": ["College Student", "Graduate"],
                "max_income": 9999999,
                "states": ["Tamil Nadu"],
                "categories": ["ALL"],
                "gender": "ALL"
            }),
            "documents_json": json.dumps([
                {"type": "College_ID", "name": "Student College ID / Roll Number", "mandatory": True},
                {"type": "Aadhaar", "name": "Aadhaar Card", "mandatory": True}
            ]),
            "workflow_json": json.dumps([
                {"step": 1, "title": "College Portal Enrolment", "tat_days": 1},
                {"step": 2, "title": "Skill Track Selection", "tat_days": 1},
                {"step": 3, "title": "Training & Assessment", "tat_days": 30}
            ]),
            "escalation_json": json.dumps([
                {"level": 1, "authority": "College Placement Coordinator", "action": "Portal enrollment unlock"},
                {"level": 2, "authority": "TNSDC Helpline 044-22501041", "action": "Direct support ticket"}
            ]),
            "deadline": "2026-10-25",
            "official_source": "https://naanmudhalvan.tn.gov.in",
            "last_updated": "2026-09-18"
        }
    ]

    for s in schemes_data:
        cursor.execute("""
        INSERT INTO schemes (id, name, name_ta, category, description, description_ta, benefit_summary, benefit_summary_ta, criteria_json, documents_json, workflow_json, escalation_json, deadline, official_source, last_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            s["id"], s["name"], s["name_ta"], s["category"], s["description"], s["description_ta"],
            s["benefit_summary"], s["benefit_summary_ta"], s["criteria_json"], s["documents_json"],
            s["workflow_json"], s["escalation_json"], s["deadline"], s["official_source"], s["last_updated"]
        ))

    # 5. Documents for Priya Kumar
    doc_1_hash = hash_data("priya_aadhaar_card_masked_4821")
    doc_2_hash = hash_data("priya_college_bonafide_chennai_arts_science")
    doc_3_hash = hash_data("priya_hsc_12th_marksheet_92pct")
    doc_4_hash = hash_data("priya_canara_bank_passbook_ifsc_cnrb")
    doc_5_hash = hash_data("priya_income_cert_2025_revenue_dept")

    docs = [
        ("doc_001", priya_id, "Aadhaar", "Aadhaar Card (UIDAI)", "VERIFIED", json.dumps({"name": "Priya Kumar", "dob": "12-04-2007", "gender": "Female", "state": "Tamil Nadu", "verified": True}), doc_1_hash, "2035-12-31", now - 86400 * 25),
        ("doc_002", priya_id, "College_ID", "College Bonafide Certificate", "VERIFIED", json.dumps({"institution": "Government Arts & Science College, Nandanam, Chennai", "course": "B.Sc Computer Science", "year": "2nd Year", "reg_no": "23CS1084"}), doc_2_hash, "2027-05-31", now - 86400 * 22),
        ("doc_003", priya_id, "Community_Cert", "Community Certificate (BC)", "VERIFIED", json.dumps({"community": "Backward Classes (BC)", "issuing_authority": "Tahsildar Mambalam", "cert_no": "TN-BC-2023-9941"}), doc_3_hash, "LIFETIME", now - 86400 * 20),
        ("doc_004", priya_id, "Bank_Passbook", "Canara Bank Savings Passbook", "VERIFIED", json.dumps({"bank": "Canara Bank", "branch": "T. Nagar Chennai", "npci_mapped": True, "aadhaar_linked": True}), doc_4_hash, "2030-01-01", now - 86400 * 20),
        ("doc_005", priya_id, "Income_Cert", "Revenue Dept Income Certificate", "ATTENTION_REQUIRED", json.dumps({"annual_income": "₹1,80,000", "issued_date": "2025-10-15", "alert": "Valid for 1 year. Certificate expires in 28 days on 15 Oct 2026. Renewal recommended for uninterrupted DBT.", "confidence": 0.94}), doc_5_hash, "2026-10-15", now - 86400 * 18)
    ]

    for d in docs:
        cursor.execute("""
        INSERT INTO documents (id, user_id, doc_type, name, status, extracted_data_json, doc_hash, expiry_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, d)

    # 6. Applications for Priya Kumar
    app_1_id = "CIVIC-2026-000128"
    app_1_tx = make_tx_hash(app_1_id, now - 86400 * 22)
    stages_1 = [
        {"stage": "Submitted", "status": "COMPLETED", "date": "12 Sep 2026", "actor": "Citizen (Priya Kumar)"},
        {"stage": "Document Verification", "status": "COMPLETED", "date": "15 Sep 2026", "actor": "State Central Portal"},
        {"stage": "Institution Verification", "status": "ACTIVE_DELAYED", "date": "16 Sep 2026 - Present", "actor": "College Scholarship Nodal Officer", "days_delayed": 22},
        {"stage": "District Verification", "status": "PENDING", "date": "Awaiting previous stage", "actor": "District BC Welfare Officer"},
        {"stage": "Approval & Sanction", "status": "PENDING", "date": "Awaiting previous stage", "actor": "Treasury Directorate"},
        {"stage": "Benefit Disbursement", "status": "PENDING", "date": "Awaiting previous stage", "actor": "Aadhaar Payment Bridge"}
    ]
    diag_1 = {
        "probable_bottleneck": "College Nodal Officer Institutional e-Attestation Pending",
        "confidence": "78%",
        "status_duration": "22 Days (Expected Turnaround Time: 7 Days)",
        "evidence": [
            {"label": "Citizen Submission", "state": "MATCHED", "detail": "All 5 required certificates uploaded & cryptographic hashes verified"},
            {"label": "System Check", "state": "MATCHED", "detail": "State scholarship portal batch job #BC-491 pending principal approval"},
            {"label": "Bottleneck Marker", "state": "FLAGGED", "detail": "No officer e-sign logged since 16 Sep 2026 (Exceeded norm by 15 days)"}
        ],
        "recommended_action": "Submit official verification request to College Nodal Officer quoting Application ID CIVIC-2026-000128.",
        "responsible_authority_disclaimer": "Probable bottleneck analysis is derived from available portal state rules. Official confirmation rests with the College Administration and District Welfare Directorate."
    }
    rec_plan_1 = {
        "steps": [
            {"step": 1, "title": "Contact College Nodal Officer", "desc": "Visit college scholarship cell or email nodal officer with Application ID CIVIC-2026-000128."},
            {"step": 2, "title": "Present Auto-Generated Follow-Up Notice", "desc": "Use CIVIC AI's pre-drafted letter citing government circular GO(Ms) No. 72 on scholarship timelines."},
            {"step": 3, "title": "Monitor for 5 Working Days", "desc": "If still unverified, system will unlock District Welfare Level-2 escalation."},
            {"step": 4, "title": "Lodge State CM Helpline Grievance", "desc": "Direct escalation to Tamil Nadu CM Cell 1100 portal with audit ledger proof."}
        ]
    }

    cursor.execute("""
    INSERT INTO applications (id, user_id, scheme_id, scheme_name, status, stage, readiness_score, submitted_at, updated_at, stages_json, diagnosis_json, recovery_plan_json, blockchain_tx)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        app_1_id,
        priya_id,
        "sch_tn_postmatric",
        "Tamil Nadu Post-Matric Scholarship (BC/MBC/DNC)",
        "PENDING",
        "Institution Verification",
        82,
        now - 86400 * 22,
        now - 86400 * 1,
        json.dumps(stages_1),
        json.dumps(diag_1),
        json.dumps(rec_plan_1),
        app_1_tx
    ))

    # Second application: Pudhumai Penn (Approved & on track)
    app_2_id = "CIVIC-2026-000842"
    app_2_tx = make_tx_hash(app_2_id, now - 86400 * 40)
    stages_2 = [
        {"stage": "Submitted", "status": "COMPLETED", "date": "10 Aug 2026", "actor": "Citizen (Priya Kumar)"},
        {"stage": "EMIS School Validation", "status": "COMPLETED", "date": "14 Aug 2026", "actor": "School Education Dept"},
        {"stage": "Social Welfare Verification", "status": "COMPLETED", "date": "20 Aug 2026", "actor": "DSWO Chennai"},
        {"stage": "Approved & Enrolled", "status": "COMPLETED", "date": "25 Aug 2026", "actor": "Social Welfare Directorate"},
        {"stage": "Monthly DBT Active", "status": "ACTIVE_HEALTHY", "date": "Disbursing ₹1,000 / month", "actor": "Canara Bank DBT"}
    ]
    cursor.execute("""
    INSERT INTO applications (id, user_id, scheme_id, scheme_name, status, stage, readiness_score, submitted_at, updated_at, stages_json, diagnosis_json, recovery_plan_json, blockchain_tx)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        app_2_id,
        priya_id,
        "sch_pudhumai_penn",
        "Moovalur Ramamirtham Ammaiyar Scheme (Pudhumai Penn)",
        "APPROVED",
        "Monthly DBT Active",
        100,
        now - 86400 * 40,
        now - 86400 * 10,
        json.dumps(stages_2),
        None,
        None,
        app_2_tx
    ))

    # 7. Notifications
    notifs = [
        ("notif_001", priya_id, "Scholarship Action Required: 22 Days at College Desk", "கல்வி உதவித்தொகை நடவடிக்கை தேவை: கல்லூரியில் 22 நாட்கள் நிலுவை", "Your Post-Matric Scholarship application is waiting at Institution Verification. Generate an AI follow-up message now.", "உங்கள் விண்ணப்பம் கல்லூரி சரிபார்ப்பில் நிலுவையில் உள்ளது. AI பின்தொடர்தல் கடிதத்தை உருவாக்கவும்.", "BOTTLENECK", 0, f"/recovery/{app_1_id}", now - 3600 * 2),
        ("notif_002", priya_id, "Income Certificate Renewal Approaching", "வருமானச் சான்றிதழ் புதுப்பிப்பு நெருங்குகிறது", "Your income certificate is valid until 15 Oct 2026 (28 days left). Renew soon to avoid renewal disruption.", "உங்கள் வருமானச் சான்றிதழ் அக் 15 அன்று காலாவதியாகிறது. புதுப்பிக்கவும்.", "DEADLINE", 0, "/documents", now - 3600 * 12),
        ("notif_003", priya_id, "New Benefit Match: Naan Mudhalvan Free Tech Certs", "புதிய திட்ட வாய்ப்பு: நான் முதல்வன் இலவச சான்றிதழ்", "96% profile match detected for AI & Cloud certification program.", "AI & கிளவுட் சான்றிதழ் திட்டத்திற்கு 96% தகுதி உள்ளது.", "SYSTEM", 1, "/benefits/sch_tnsdc_tech", now - 86400 * 2),
        ("notif_004", priya_id, "Pudhumai Penn Monthly DBT Credited: ₹1,000", "புதுமைப் பெண் மாத உதவித்தொகை வரவு வைக்கப்பட்டது: ₹1,000", "September month financial grant ₹1,000 credited to Canara Bank A/c ending 4821.", "செப்டம்பர் மாத நிதியுதவி ₹1,000 உங்கள் வங்கிக் கணக்கில் வரவு வைக்கப்பட்டது.", "SYSTEM", 1, f"/applications/{app_2_id}", now - 86400 * 7)
    ]
    for n in notifs:
        cursor.execute("""
        INSERT INTO notifications (id, user_id, title, title_ta, message, message_ta, category, is_read, action_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, n)

    # 8. Blockchain Audit Ledger Records (All verifiable, zero raw PII on chain!)
    audit_events = [
        (priya_user_hash, "CONSENT_GRANTED", "CNS-PRIYA-001", hash_data("Consent:Profile,Docs,Diagnosis,Blockchain"), 104201, make_tx_hash("CNS-PRIYA-001", now - 86400 * 30), now - 86400 * 30),
        (priya_user_hash, "DOCUMENT_REGISTERED", "DOC-AADHAAR-4821", doc_1_hash, 104202, make_tx_hash("DOC-AADHAAR-4821", now - 86400 * 25), now - 86400 * 25),
        (priya_user_hash, "DOCUMENT_VERIFIED", "DOC-AADHAAR-4821", hash_data(f"Verified:{doc_1_hash}"), 104205, make_tx_hash("VERIFY-AADHAAR", now - 86400 * 25), now - 86400 * 25),
        (priya_user_hash, "DOCUMENT_REGISTERED", "DOC-BONAFIDE-COLLEGE", doc_2_hash, 104210, make_tx_hash("DOC-BONAFIDE-COLLEGE", now - 86400 * 22), now - 86400 * 22),
        (priya_user_hash, "DOCUMENT_REGISTERED", "DOC-INCOME-CERT-2025", doc_5_hash, 104218, make_tx_hash("DOC-INCOME-CERT-2025", now - 86400 * 18), now - 86400 * 18),
        (priya_user_hash, "APPLICATION_CREATED", app_1_id, hash_data(f"AppCreate:{app_1_id}:sch_tn_postmatric"), 104225, app_1_tx, now - 86400 * 22),
        (priya_user_hash, "APPLICATION_STATUS_CHANGED", app_1_id, hash_data(f"StageChange:{app_1_id}:Institution Verification"), 104250, make_tx_hash("STAGE-CHG-128", now - 86400 * 16), now - 86400 * 16),
        (priya_user_hash, "APPLICATION_CREATED", app_2_id, hash_data(f"AppCreate:{app_2_id}:sch_pudhumai_penn"), 104110, app_2_tx, now - 86400 * 40),
        (priya_user_hash, "APPLICATION_STATUS_CHANGED", app_2_id, hash_data(f"StageChange:{app_2_id}:Monthly DBT Active"), 104190, make_tx_hash("STAGE-CHG-842", now - 86400 * 25), now - 86400 * 25)
    ]

    for ae in audit_events:
        cursor.execute("""
        INSERT INTO audit_ledger (anonymous_user_hash, event_type, reference_code, data_hash, block_number, tx_hash, timestamp, network)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Demo Blockchain Network')
        """, ae)

    conn.commit()
    conn.close()
    print("Database successfully initialized and seeded with demo citizen Priya Kumar, Tamil Nadu schemes, verifiable blockchain records, and application failure diagnosis data!")

if __name__ == "__main__":
    seed()
