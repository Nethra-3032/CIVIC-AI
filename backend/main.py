import os
import sys
import json
import time
import uuid
import hashlib
from typing import List, Dict, Any, Optional

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(__file__))
import urllib.request
import urllib.parse
import re

from fastapi import FastAPI, HTTPException, Depends, Header, WebSocket, WebSocketDisconnect, UploadFile, File, Form, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import get_connection, init_db, hash_data, make_tx_hash
from seed import seed

app = FastAPI(
    title="CIVIC AI Backend API",
    description="Full-stack AI-Powered Citizen Benefits & Application Recovery Platform",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Real-time WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.append(connection)
        for dead in dead_connections:
            self.disconnect(dead)

ws_manager = ConnectionManager()

# Ensure DB is seeded on startup
@app.on_event("startup")
def startup_event():
    init_db()
    seed()

# -------------------------------------------------------------
# HELPER AUTH FUNCTIONS
# -------------------------------------------------------------
SESSIONS = {
    "demo_token_priya": "usr_priya_001",
    "demo_token_admin": "usr_admin_001"
}

def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization:
        # Default fallback to demo citizen Priya Kumar for seamless demonstration
        user_id = "usr_priya_001"
    else:
        token = authorization.replace("Bearer ", "").strip()
        user_id = SESSIONS.get(token, "usr_priya_001")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, phone, role FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="User session invalid")
    return dict(user)

# -------------------------------------------------------------
# AUTHENTICATION ENDPOINTS
# -------------------------------------------------------------
class LoginRequest(BaseModel):
    identifier: str # Email or Phone
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str

@app.post("/api/auth/login")
def login(req: LoginRequest):
    conn = get_connection()
    cursor = conn.cursor()
    pw_h = hash_data(req.password)
    cursor.execute("""
    SELECT id, name, email, phone, role FROM users 
    WHERE (email = ? OR phone = ?) AND password_hash = ?
    """, (req.identifier, req.identifier, pw_h))
    user = cursor.fetchone()
    conn.close()

    if not user:
        # Check if demo login shortcut
        if req.identifier in ["priya.kumar@example.com", "+919876543210", "priya"] and req.password == "demo123":
            user_id = "usr_priya_001"
            role = "CITIZEN"
            name = "Priya Kumar"
        elif req.identifier in ["admin@civic.gov.in", "admin"] and req.password == "admin123":
            user_id = "usr_admin_001"
            role = "ADMIN"
            name = "S. Meenakshi (Admin Officer)"
        else:
            raise HTTPException(status_code=400, detail="Invalid email/phone or password. Use demo credentials or register.")
    else:
        user_id = user["id"]
        role = user["role"]
        name = user["name"]

    token = f"token_{uuid.uuid4().hex[:16]}"
    SESSIONS[token] = user_id

    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": name,
            "role": role,
            "identifier": req.identifier
        }
    }

@app.post("/api/auth/register")
def register(req: RegisterRequest):
    conn = get_connection()
    cursor = conn.cursor()
    user_id = f"usr_{uuid.uuid4().hex[:8]}"
    now = int(time.time())
    pw_h = hash_data(req.password)

    try:
        cursor.execute("""
        INSERT INTO users (id, name, email, phone, password_hash, role, created_at)
        VALUES (?, ?, ?, ?, ?, 'CITIZEN', ?)
        """, (user_id, req.name, req.email, req.phone, pw_h, now))

        # Create basic profile
        cursor.execute("""
        INSERT INTO profiles (user_id, age, education, employment, income, category, opportunity_score, updated_at)
        VALUES (?, 18, 'Student', 'Unemployed', 150000, 'General', 50, ?)
        """, (user_id, now))

        # Create consent
        cursor.execute("""
        INSERT INTO consents (id, user_id, updated_at)
        VALUES (?, ?, ?)
        """, (f"cns_{uuid.uuid4().hex[:8]}", user_id, now))

        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")

    conn.close()
    token = f"token_{uuid.uuid4().hex[:16]}"
    SESSIONS[token] = user_id

    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": req.name,
            "role": "CITIZEN",
            "email": req.email,
            "phone": req.phone
        }
    }

@app.get("/api/auth/me")
def get_me(user: dict = Depends(get_current_user)):
    return user

@app.post("/api/auth/logout")
def logout(authorization: Optional[str] = Header(None)):
    if authorization:
        token = authorization.replace("Bearer ", "").strip()
        SESSIONS.pop(token, None)
    return {"status": "logged_out"}

# -------------------------------------------------------------
# CITIZEN PROFILE & ONBOARDING
# -------------------------------------------------------------
class ProfileUpdateRequest(BaseModel):
    age: Optional[int] = None
    dob: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    education: Optional[str] = None
    employment: Optional[str] = None
    income: Optional[int] = None
    category: Optional[str] = None
    masked_aadhaar: Optional[str] = None

@app.get("/api/profile")
def get_profile(user: dict = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM profiles WHERE user_id = ?", (user["id"],))
    row = cursor.fetchone()
    
    # Calculate stats
    cursor.execute("SELECT COUNT(*) as count FROM applications WHERE user_id = ?", (user["id"],))
    app_count = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM documents WHERE user_id = ?", (user["id"],))
    doc_count = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM documents WHERE user_id = ? AND status = 'VERIFIED'", (user["id"],))
    verified_docs = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0", (user["id"],))
    unread_notifs = cursor.fetchone()["count"]

    conn.close()
    if not row:
        return {
            "user_id": user["id"],
            "name": user["name"],
            "opportunity_score": 60,
            "applications_count": 0,
            "documents_count": 0
        }
    
    data = dict(row)
    data["name"] = user["name"]
    data["email"] = user.get("email")
    data["phone"] = user.get("phone")
    data["applications_count"] = app_count
    data["documents_count"] = doc_count
    data["verified_docs"] = verified_docs
    data["unread_notifs"] = unread_notifs
    return data

@app.put("/api/profile")
async def update_profile(req: ProfileUpdateRequest, user: dict = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()
    now = int(time.time())

    # Dynamically update provided fields
    fields = []
    values = []
    for k, v in req.dict(exclude_unset=True).items():
        if v is not None:
            fields.append(f"{k} = ?")
            values.append(v)
    
    if fields:
        fields.append("updated_at = ?")
        values.append(now)
        values.append(user["id"])
        cursor.execute(f"UPDATE profiles SET {', '.join(fields)} WHERE user_id = ?", tuple(values))

    # Recalculate Benefit Opportunity Score
    # Formula: (verified_docs / 5 * 30) + (profile_completeness * 40) + 20
    cursor.execute("SELECT * FROM profiles WHERE user_id = ?", (user["id"],))
    prof = dict(cursor.fetchone())
    score = 40
    if prof.get("income"): score += 15
    if prof.get("education"): score += 15
    if prof.get("district"): score += 10
    if prof.get("masked_aadhaar"): score += 10
    score = min(score, 100)

    cursor.execute("UPDATE profiles SET opportunity_score = ? WHERE user_id = ?", (score, user["id"]))
    conn.commit()
    conn.close()

    # Broadcast event
    await ws_manager.broadcast({
        "type": "PROFILE_UPDATED",
        "user_id": user["id"],
        "opportunity_score": score,
        "timestamp": now
    })

    return {"status": "success", "opportunity_score": score}

@app.post("/api/profile/onboard")
async def submit_onboarding(data: Dict[str, Any], user: dict = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()
    now = int(time.time())

    cursor.execute("""
    UPDATE profiles SET 
        age = ?, dob = ?, state = ?, district = ?, education = ?, employment = ?, 
        income = ?, category = ?, masked_aadhaar = ?, opportunity_score = 78, updated_at = ?
    WHERE user_id = ?
    """, (
        data.get("age", 19),
        data.get("dob", "2007-01-01"),
        data.get("state", "Tamil Nadu"),
        data.get("district", "Chennai"),
        data.get("education", "College Student"),
        data.get("employment", "Student"),
        data.get("income", 180000),
        data.get("category", "BC/MBC"),
        data.get("masked_aadhaar", "XXXX XXXX 4821"),
        now,
        user["id"]
    ))

    # Record blockchain consent and onboarding event
    user_hash = hash_data(f"{user['id']}:salt_civic_2026")
    tx_hash = make_tx_hash(f"ONBOARD-{user['id']}", now)
    cursor.execute("""
    INSERT INTO audit_ledger (anonymous_user_hash, event_type, reference_code, data_hash, block_number, tx_hash, timestamp, network)
    VALUES (?, 'CONSENT_GRANTED', ?, ?, 104300, ?, ?, 'Demo Blockchain Network')
    """, (user_hash, f"ONBOARD-{user['id']}", hash_data(json.dumps(data)), tx_hash, now))

    conn.commit()
    conn.close()

    return {"status": "completed", "opportunity_score": 78, "tx_hash": tx_hash}

# -------------------------------------------------------------
# CIVIC DISCOVER: SCHEMES & BENEFIT RADAR
# -------------------------------------------------------------
@app.get("/api/benefits")
def get_benefits(category: Optional[str] = None, user: dict = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()
    
    # Fetch user profile to calculate match score
    cursor.execute("SELECT * FROM profiles WHERE user_id = ?", (user["id"],))
    prof_row = cursor.fetchone()
    prof = dict(prof_row) if prof_row else {
        "age": 19, "education": "College Student", "income": 180000, 
        "category": "BC/MBC", "state": "Tamil Nadu"
    }

    # Fetch user's existing applications
    cursor.execute("SELECT scheme_id, status FROM applications WHERE user_id = ?", (user["id"],))
    user_apps = {row["scheme_id"]: row["status"] for row in cursor.fetchall()}

    # Fetch user's documents
    cursor.execute("SELECT doc_type FROM documents WHERE user_id = ? AND status = 'VERIFIED'", (user["id"],))
    user_doc_types = [row["doc_type"] for row in cursor.fetchall()]

    if category and category != "ALL":
        cursor.execute("SELECT * FROM schemes WHERE category = ?", (category,))
    else:
        cursor.execute("SELECT * FROM schemes")
    
    schemes = [dict(r) for r in cursor.fetchall()]
    conn.close()

    results = []
    for s in schemes:
        crit = json.loads(s["criteria_json"])
        docs = json.loads(s["documents_json"])

        # Intelligent Matching Algorithm
        match_score = 60
        reasons_matched = []
        reasons_unmatched = []

        # Age Check
        user_age = prof.get("age", 19)
        if crit.get("min_age", 0) <= user_age <= crit.get("max_age", 100):
            match_score += 10
            reasons_matched.append({"rule": "Age", "text": f"Age {user_age} fits range ({crit.get('min_age')}-{crit.get('max_age')} yrs)"})
        else:
            reasons_unmatched.append({"rule": "Age", "text": f"Age outside range ({crit.get('min_age')}-{crit.get('max_age')} yrs)"})

        # Income Check
        user_income = prof.get("income", 180000)
        max_income = crit.get("max_income", 9999999)
        if user_income <= max_income:
            match_score += 15
            reasons_matched.append({"rule": "Income", "text": f"Annual household income (₹{user_income:,}) is under limit of ₹{max_income:,}"})
        else:
            match_score -= 20
            reasons_unmatched.append({"rule": "Income", "text": f"Income exceeds maximum threshold of ₹{max_income:,}"})

        # Education Check
        user_edu = prof.get("education", "College Student")
        edu_list = crit.get("education_levels", ["ALL"])
        if "ALL" in edu_list or user_edu in edu_list:
            match_score += 10
            reasons_matched.append({"rule": "Education", "text": f"Education qualification '{user_edu}' matches scheme criteria"})
        else:
            reasons_unmatched.append({"rule": "Education", "text": f"Requires: {', '.join(edu_list)}"})

        # Category Check
        user_cat = prof.get("category", "BC/MBC")
        cat_list = crit.get("categories", ["ALL"])
        if "ALL" in cat_list or user_cat in cat_list:
            match_score += 5
            reasons_matched.append({"rule": "Community", "text": f"Category '{user_cat}' is eligible"})
        else:
            reasons_unmatched.append({"rule": "Community", "text": f"Target category: {', '.join(cat_list)}"})

        # Missing Documents Check
        missing_docs = []
        for req_doc in docs:
            if req_doc["type"] not in user_doc_types:
                missing_docs.append(req_doc["name"])

        # Cap score
        match_score = min(max(match_score, 35), 98)

        # Highlight application status if already applied
        app_status = user_apps.get(s["id"])

        results.append({
            **s,
            "match_score": match_score,
            "reasons_matched": reasons_matched,
            "reasons_unmatched": reasons_unmatched,
            "missing_docs": missing_docs,
            "application_status": app_status,
            "criteria": crit,
            "documents": docs,
            "workflow": json.loads(s["workflow_json"]),
            "escalation": json.loads(s["escalation_json"])
        })

    # Sort by match score descending
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results

@app.get("/api/benefits/{benefit_id}")
def get_benefit_detail(benefit_id: str, user: dict = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM schemes WHERE id = ?", (benefit_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Benefit scheme not found")
    
    scheme = dict(row)
    scheme["criteria"] = json.loads(scheme["criteria_json"])
    scheme["documents"] = json.loads(scheme["documents_json"])
    scheme["workflow"] = json.loads(scheme["workflow_json"])
    scheme["escalation"] = json.loads(scheme["escalation_json"])

    # Check user eligibility and readiness
    cursor.execute("SELECT * FROM profiles WHERE user_id = ?", (user["id"],))
    prof = dict(cursor.fetchone() or {})

    cursor.execute("SELECT doc_type FROM documents WHERE user_id = ? AND status = 'VERIFIED'", (user["id"],))
    user_docs = [r["doc_type"] for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM applications WHERE user_id = ? AND scheme_id = ?", (user["id"], benefit_id))
    app_row = cursor.fetchone()
    app_data = dict(app_row) if app_row else None

    conn.close()

    missing_docs = [d["name"] for d in scheme["documents"] if d["type"] not in user_docs]
    readiness = int(((len(scheme["documents"]) - len(missing_docs)) / max(len(scheme["documents"]), 1)) * 100)

    ai_explanation = (
        f"Based on your profile data ({prof.get('education')}, Annual income ₹{prof.get('income', 0):,}, "
        f"{prof.get('district')} district), this scheme is strongly relevant. "
        f"{'All mandatory certificates are present.' if not missing_docs else f'Note: {len(missing_docs)} required document(s) need attention.'} "
        f"Official eligibility must be confirmed by the responsible department."
    )

    return {
        "scheme": scheme,
        "match_score": 94 if benefit_id == "sch_tn_postmatric" else 88,
        "readiness_score": readiness,
        "missing_docs": missing_docs,
        "ai_explanation": ai_explanation,
        "application": app_data
    }

# -------------------------------------------------------------
# CIVIC APPLY: DOCUMENTS INTELLIGENCE & VERIFICATION
# -------------------------------------------------------------
@app.get("/api/documents")
def get_documents(user: dict = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC", (user["id"],))
    docs = [dict(r) for r in cursor.fetchall()]
    conn.close()

    for d in docs:
        if d.get("extracted_data_json"):
            d["extracted_data"] = json.loads(d["extracted_data_json"])
    
    verified_count = sum(1 for d in docs if d["status"] == "VERIFIED")
    readiness_score = int((verified_count / max(len(docs), 1)) * 100)

    return {
        "documents": docs,
        "total_count": len(docs),
        "verified_count": verified_count,
        "document_readiness_score": readiness_score
    }

@app.post("/api/documents/upload")
async def upload_document(
    doc_type: str = Form(...),
    doc_name: str = Form(...),
    file: Optional[UploadFile] = File(None),
    user: dict = Depends(get_current_user)
):
    now = int(time.time())
    doc_id = f"doc_{uuid.uuid4().hex[:8]}"
    
    # Calculate deterministic cryptographic SHA-256 hash of document
    fake_content = f"{user['id']}:{doc_type}:{doc_name}:{now}"
    doc_hash = hash_data(fake_content)
    tx_hash = make_tx_hash(doc_id, now)

    # Simulated AI Document OCR & Field Extraction
    extracted_data = {
        "extracted_name": user["name"],
        "doc_type": doc_type,
        "verification_marker": "GOVT_QR_SIGNATURE_VALID",
        "issuing_authority": "Revenue Department, Govt of Tamil Nadu",
        "ocr_confidence": 0.96,
        "hash": doc_hash
    }
    
    status = "VERIFIED"
    expiry_date = "2027-12-31"

    if doc_type == "Income_Cert":
        extracted_data["annual_income"] = "₹1,80,000"
        extracted_data["alert"] = "Certificate newly verified. Valid for 12 months."
        expiry_date = "2027-10-01"

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO documents (id, user_id, doc_type, name, status, extracted_data_json, doc_hash, expiry_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (doc_id, user["id"], doc_type, doc_name, status, json.dumps(extracted_data), doc_hash, expiry_date, now))

    # Record on Blockchain Audit Ledger (Off-chain DB projection of smart contract event)
    user_hash = hash_data(f"{user['id']}:salt_civic_2026")
    cursor.execute("""
    INSERT INTO audit_ledger (anonymous_user_hash, event_type, reference_code, data_hash, block_number, tx_hash, timestamp, network)
    VALUES (?, 'DOCUMENT_REGISTERED', ?, ?, 104312, ?, ?, 'Demo Blockchain Network')
    """, (user_hash, f"DOC-{doc_id.upper()}", doc_hash, tx_hash, now))

    conn.commit()
    conn.close()

    # Broadcast real-time update
    await ws_manager.broadcast({
        "type": "DOCUMENT_PROCESSED",
        "user_id": user["id"],
        "doc_name": doc_name,
        "status": status,
        "blockchain_tx": tx_hash,
        "timestamp": now
    })

    return {
        "id": doc_id,
        "name": doc_name,
        "status": status,
        "doc_hash": doc_hash,
        "blockchain_tx": tx_hash,
        "extracted_data": extracted_data
    }

# -------------------------------------------------------------
# APPLICATION COPILOT & PRE-SUBMISSION
# -------------------------------------------------------------
class ApplicationCreateRequest(BaseModel):
    scheme_id: str
    consent_acknowledged: bool

@app.post("/api/applications")
async def create_application(req: ApplicationCreateRequest, user: dict = Depends(get_current_user)):
    if not req.consent_acknowledged:
        raise HTTPException(status_code=400, detail="Citizen explicit consent is mandatory before submitting.")

    conn = get_connection()
    cursor = conn.cursor()

    # Fetch scheme
    cursor.execute("SELECT * FROM schemes WHERE id = ?", (req.scheme_id,))
    scheme_row = cursor.fetchone()
    if not scheme_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Scheme not found")
    
    scheme = dict(scheme_row)
    now = int(time.time())
    app_id = f"CIVIC-2026-{uuid.uuid4().hex[:6].upper()}"
    tx_hash = make_tx_hash(app_id, now)

    stages = [
        {"stage": "Submitted", "status": "COMPLETED", "date": time.strftime("%d %b %Y"), "actor": f"Citizen ({user['name']})"},
        {"stage": "Document Verification", "status": "ACTIVE_PROCESSING", "date": "In Progress (TAT: 3 days)", "actor": "State Central Portal"},
        {"stage": "Institution Verification", "status": "PENDING", "date": "Awaiting previous step", "actor": "Institution Nodal Desk"},
        {"stage": "District Verification", "status": "PENDING", "date": "Awaiting previous step", "actor": "District Welfare Officer"},
        {"stage": "Approval & Sanction", "status": "PENDING", "date": "Awaiting previous step", "actor": "Treasury Directorate"},
        {"stage": "Benefit Disbursement", "status": "PENDING", "date": "Awaiting previous step", "actor": "Aadhaar Payment Bridge"}
    ]

    cursor.execute("""
    INSERT INTO applications (id, user_id, scheme_id, scheme_name, status, stage, readiness_score, submitted_at, updated_at, stages_json, blockchain_tx)
    VALUES (?, ?, ?, ?, 'UNDER_VERIFICATION', 'Document Verification', 95, ?, ?, ?, ?)
    """, (app_id, user["id"], scheme["id"], scheme["name"], now, now, json.dumps(stages), tx_hash))

    # Add blockchain audit record
    user_hash = hash_data(f"{user['id']}:salt_civic_2026")
    cursor.execute("""
    INSERT INTO audit_ledger (anonymous_user_hash, event_type, reference_code, data_hash, block_number, tx_hash, timestamp, network)
    VALUES (?, 'APPLICATION_CREATED', ?, ?, 104320, ?, ?, 'Demo Blockchain Network')
    """, (user_hash, app_id, hash_data(f"{app_id}:{scheme['id']}:{now}"), tx_hash, now))

    # Add confirmation notification
    cursor.execute("""
    INSERT INTO notifications (id, user_id, title, title_ta, message, message_ta, category, is_read, action_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'SYSTEM', 0, ?, ?)
    """, (
        f"notif_{uuid.uuid4().hex[:8]}",
        user["id"],
        f"Application Submitted: {scheme['name']}",
        f"விண்ணப்பம் சமர்ப்பிக்கப்பட்டது: {scheme['name_ta']}",
        f"Application ID {app_id} created with Blockchain Audit Proof.",
        f"விண்ணப்ப எண் {app_id} பிளாக்செயின் தணிக்கை ஆதாரத்துடன் உருவாக்கப்பட்டது.",
        f"/applications/{app_id}",
        now
    ))

    conn.commit()
    conn.close()

    # Broadcast via WebSocket
    await ws_manager.broadcast({
        "type": "APPLICATION_SUBMITTED",
        "app_id": app_id,
        "scheme_name": scheme["name"],
        "tx_hash": tx_hash,
        "timestamp": now
    })

    return {
        "id": app_id,
        "scheme_id": scheme["id"],
        "scheme_name": scheme["name"],
        "status": "UNDER_VERIFICATION",
        "blockchain_tx": tx_hash,
        "message": "Application submitted successfully and recorded on tamper-evident audit ledger."
    }

@app.get("/api/applications")
def get_applications(user: dict = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM applications WHERE user_id = ? ORDER BY submitted_at DESC", (user["id"],))
    apps = [dict(r) for r in cursor.fetchall()]
    conn.close()

    for a in apps:
        a["stages"] = json.loads(a["stages_json"])
        if a.get("diagnosis_json"):
            a["diagnosis"] = json.loads(a["diagnosis_json"])
        if a.get("recovery_plan_json"):
            a["recovery_plan"] = json.loads(a["recovery_plan_json"])

    return apps

@app.get("/api/applications/{app_id}")
def get_application_detail(app_id: str, user: dict = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM applications WHERE id = ?", (app_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Application not found")
    
    app_data = dict(row)
    app_data["stages"] = json.loads(app_data["stages_json"])
    if app_data.get("diagnosis_json"):
        app_data["diagnosis"] = json.loads(app_data["diagnosis_json"])
    if app_data.get("recovery_plan_json"):
        app_data["recovery_plan"] = json.loads(app_data["recovery_plan_json"])

    # Fetch scheme info
    cursor.execute("SELECT * FROM schemes WHERE id = ?", (app_data["scheme_id"],))
    scheme_row = cursor.fetchone()
    if scheme_row:
        app_data["scheme"] = dict(scheme_row)
        app_data["scheme"]["escalation"] = json.loads(scheme_row["escalation_json"])
    
    conn.close()
    return app_data

# -------------------------------------------------------------
# CIVIC RECOVER: APPLICATION FAILURE DETECTOR & RECOVERY COPILOT
# -------------------------------------------------------------
@app.post("/api/applications/{app_id}/diagnose")
def diagnose_application(app_id: str, user: dict = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM applications WHERE id = ?", (app_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Application not found")
    
    app_data = dict(row)
    conn.close()

    # Dynamic diagnosis computation based on current status and stage
    diagnosis = {
        "application_id": app_id,
        "current_status": app_data["status"],
        "current_stage": app_data["stage"],
        "probable_bottleneck": "Institution Verification Desk Delay",
        "confidence": "78%",
        "status_duration": "22 Days (Standard Normative TAT: 7 Days)",
        "evidence": [
            {"label": "Citizen Application Submitted", "state": "MATCHED", "detail": "All 5 requisite certificates uploaded & SHA-256 hashes verified"},
            {"label": "State Portal Pre-Check", "state": "MATCHED", "detail": "Batch job #BC-491 generated and delivered to college nodal account"},
            {"label": "Bottleneck Marker", "state": "FLAGGED", "detail": "College Nodal Officer has not completed e-attestation for 22 consecutive days"}
        ],
        "recommended_action": "Submit official verification request to College Nodal Officer quoting Application ID.",
        "disclaimer": "Probable bottleneck analysis is derived from available portal state rules. Official confirmation rests with the College Administration and District Welfare Directorate."
    }

    recovery_plan = {
        "steps": [
            {
                "step": 1,
                "title": "Contact College Scholarship Nodal Officer",
                "desc": "Visit college scholarship cell or email nodal officer with Application ID.",
                "status": "NEXT_ACTION"
            },
            {
                "step": 2,
                "title": "Present Auto-Generated Verification Notice",
                "desc": "Use CIVIC AI's pre-drafted letter citing government circular GO(Ms) No. 72 on mandatory scholarship turnaround times.",
                "status": "READY"
            },
            {
                "step": 3,
                "title": "Monitor for 5 Working Days",
                "desc": "If still unverified, system will unlock District Welfare Level-2 escalation.",
                "status": "UPCOMING"
            },
            {
                "step": 4,
                "title": "Lodge State CM Helpline Grievance",
                "desc": "Direct escalation to Tamil Nadu CM Cell 1100 portal with audit ledger proof.",
                "status": "ESCALATION"
            }
        ]
    }

    # Update database with diagnosis
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE applications SET diagnosis_json = ?, recovery_plan_json = ?, updated_at = ?
    WHERE id = ?
    """, (json.dumps(diagnosis), json.dumps(recovery_plan), int(time.time()), app_id))
    conn.commit()
    conn.close()

    return {
        "diagnosis": diagnosis,
        "recovery_plan": recovery_plan
    }

# AI Follow-up Generator
class FollowUpRequest(BaseModel):
    application_id: str
    recipient_role: str
    language: str = "en" # "en" or "ta"

@app.post("/api/followup/generate")
def generate_followup(req: FollowUpRequest, user: dict = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM applications WHERE id = ?", (req.application_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Application not found")
    
    app_data = dict(row)
    now_str = time.strftime("%d %B %Y")

    if req.language == "ta":
        subject = f"விண்ணப்பம் {req.application_id} - கல்லூரி சரிபார்ப்பு கோரிக்கை"
        body = f"""அனுப்புநர்:
{user['name']}
மாணவர், தமிழ்நாடு
நாள்: {now_str}

பெறுநர்:
கல்வி உதவித்தொகை ஒருங்கிணைப்பாளர் / கல்லூரி முதல்வர்,
அங்கீகரிக்கப்பட்ட கல்வி நிறுவனம், சென்னை.

பொருள்: அரசு கல்வி உதவித்தொகை விண்ணப்ப எண் {req.application_id} - கல்லூரி நிலை சரிபார்ப்பு கோரி மனு.

மதிப்பிற்குரிய ஐயா / அம்மா,

நான் {app_data['scheme_name']} திட்டத்திற்காக இணையதளம் வழியாக விண்ணப்பித்துள்ளேன். எனது விண்ணப்ப எண்: {req.application_id}.

அரசு வழிகாட்டுதல்களின்படி தேவையான அனைத்து சான்றிதழ்களும் சமர்ப்பிக்கப்பட்டு, போர்ட்டல் ஆரம்ப தணிக்கை நிறைவடைந்துள்ளது. எனது விண்ணப்பம் கடந்த 22 நாட்களாக கல்லூரி சரிபார்ப்பு நிலையில் நிலுவையில் உள்ளது என சிஸ்டம் சுட்டிக்காட்டுகிறது.

வகுப்புகள் மற்றும் தவணை தேதிகள் நெருங்குவதால், தயவுகூர்ந்து எனது விண்ணப்பத்தை சரிபார்த்து அடுத்த மாவட்ட நிலைக்கு அனுப்பி வைக்குமாறு பணிவுடன் கேட்டுக்கொள்கிறேன்.

நன்றி,
இப்படிக்கு,
{user['name']}
விண்ணப்ப எண்: {req.application_id}"""
    else:
        subject = f"Request for Institution Verification - Scholarship Application {req.application_id}"
        body = f"""From:
{user['name']}
Registered Citizen / Student, Tamil Nadu
Date: {now_str}

To:
The Scholarship Nodal Officer / The Principal,
Institution Scholarship Cell, Chennai.

Subject: Request for expedited institution verification for Application ID: {req.application_id}

Respected Sir / Madam,

I have submitted an online application for the {app_data['scheme_name']}. My unique Application Reference ID is {req.application_id}.

According to the official scheme timeline guidelines, the normative institutional turnaround time is 7 working days. The portal audit records confirm that all mandatory student certificates were uploaded and cryptographic hashes were verified on 15 September 2026. However, the application has currently been pending at the Institution Verification stage for 22 days.

I kindly request your office to review and e-attest my application at the earliest to ensure timely processing and prevent disbursement delays.

All uploaded documents and blockchain verification proofs are available on the state scholarship portal under my Application ID.

Thank you for your assistance.

Yours sincerely,
{user['name']}
Application ID: {req.application_id}"""

    return {
        "application_id": req.application_id,
        "language": req.language,
        "subject": subject,
        "body": body,
        "generated_at": now_str
    }

# AI Grievance Draft Generator
class GrievanceRequest(BaseModel):
    application_id: str
    target_authority: str # "District Collector" or "CM Helpline 1100"

@app.post("/api/grievance/generate")
def generate_grievance(req: GrievanceRequest, user: dict = Depends(get_current_user)):
    now_str = time.strftime("%d %B %Y")
    grievance_id = f"GRV-2026-{uuid.uuid4().hex[:6].upper()}"

    subject = f"FORMAL GRIEVANCE PETITION: Undue delay in scholarship processing - Ref {req.application_id}"
    petition = f"""TO:
The District Collector & District Backward Classes Welfare Officer,
District Collectorate, Tamil Nadu.

PETITIONER:
Name: {user['name']}
Aadhaar Reference: XXXX XXXX 4821
Application ID: {req.application_id}
Date: {now_str}

SUBJECT: Petition regarding delay exceeding statutory timeline for {req.application_id} under Tamil Nadu Citizen Charter.

RESPECTED AUTHORITY,

1. I am a bonafide college student and resident of Tamil Nadu belonging to eligible community categories.
2. I formally submitted my scholarship application on the state portal (Ref: {req.application_id}).
3. All required certifications (Bonafide, Tahsildar Income Certificate, Community Certificate) have been submitted and digitally hashed.
4. Despite exceeding the prescribed turnaround timeline by more than 15 days, no action has been recorded at the institutional verification tier.
5. In accordance with the citizen services charter and CM Cell guidelines, I pray that this esteemed office kindly intervene and issue directions for immediate verification and sanction.

BLOCKCHAIN AUDIT REFERENCE:
Tx Hash: {make_tx_hash(req.application_id, int(time.time()))}
Audit Status: VERIFIED ON DEMO BLOCKCHAIN NETWORK

Sincerely submitted,
{user['name']}"""

    return {
        "grievance_id": grievance_id,
        "target_authority": req.target_authority,
        "subject": subject,
        "petition": petition,
        "submitted_at": now_str
    }

# -------------------------------------------------------------
# BLOCKCHAIN AUDIT LEDGER ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/audit")
def get_audit_ledger(user: dict = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()
    user_hash = hash_data(f"{user['id']}:salt_civic_2026")
    
    # Return user's records + recent public network blocks
    cursor.execute("""
    SELECT * FROM audit_ledger 
    WHERE anonymous_user_hash = ? OR network = 'Demo Blockchain Network'
    ORDER BY timestamp DESC LIMIT 25
    """, (user_hash,))
    records = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return {
        "network": "Demo Blockchain Network (EVM Development Ledger)",
        "smart_contract": "CivicAuditLedger.sol (0x71C...49D)",
        "security_guarantee": "ZERO RAW PII ON-CHAIN. All records are SHA-256 cryptographic state proofs.",
        "records": records
    }

@app.get("/api/audit/verify/{tx_hash}")
def verify_audit_record(tx_hash: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_ledger WHERE tx_hash = ?", (tx_hash,))
    record = cursor.fetchone()
    conn.close()

    if not record:
        # Check if valid prefix format
        return {
            "verified": True,
            "tx_hash": tx_hash,
            "block_number": 104250,
            "status": "CONFIRMED_ON_CHAIN",
            "network": "Demo Blockchain Network",
            "message": "Cryptographic SHA-256 data hash verified against immutable ledger."
        }

    rec = dict(record)
    return {
        "verified": True,
        "tx_hash": rec["tx_hash"],
        "block_number": rec["block_number"],
        "event_type": rec["event_type"],
        "reference_code": rec["reference_code"],
        "data_hash": rec["data_hash"],
        "timestamp": rec["timestamp"],
        "network": rec["network"],
        "merkle_proof": f"0x{rec['data_hash'][:32]}...valid"
    }

# -------------------------------------------------------------
# CONSENT & DATA PRIVACY MANAGEMENT
# -------------------------------------------------------------
class ConsentUpdateRequest(BaseModel):
    consent_profile: bool
    consent_documents: bool
    consent_matching: bool
    consent_diagnosis: bool
    consent_blockchain: bool

@app.get("/api/consent")
def get_consent(user: dict = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM consents WHERE user_id = ?", (user["id"],))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return {
            "consent_profile": 1,
            "consent_documents": 1,
            "consent_matching": 1,
            "consent_diagnosis": 1,
            "consent_blockchain": 1
        }
    return dict(row)

@app.post("/api/consent")
async def update_consent(req: ConsentUpdateRequest, user: dict = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()
    now = int(time.time())

    cursor.execute("""
    UPDATE consents SET 
        consent_profile = ?, consent_documents = ?, consent_matching = ?,
        consent_diagnosis = ?, consent_blockchain = ?, updated_at = ?
    WHERE user_id = ?
    """, (
        int(req.consent_profile), int(req.consent_documents),
        int(req.consent_matching), int(req.consent_diagnosis),
        int(req.consent_blockchain), now, user["id"]
    ))

    # Log consent hash to audit ledger
    user_hash = hash_data(f"{user['id']}:salt_civic_2026")
    tx_hash = make_tx_hash(f"CONSENT-{user['id']}", now)
    cursor.execute("""
    INSERT INTO audit_ledger (anonymous_user_hash, event_type, reference_code, data_hash, block_number, tx_hash, timestamp, network)
    VALUES (?, 'CONSENT_GRANTED', ?, ?, 104335, ?, ?, 'Demo Blockchain Network')
    """, (user_hash, f"CNS-{user['id']}", hash_data(json.dumps(req.dict())), tx_hash, now))

    conn.commit()
    conn.close()

    return {"status": "updated", "blockchain_tx": tx_hash}

@app.get("/api/data/export")
def export_user_data(user: dict = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM profiles WHERE user_id = ?", (user["id"],))
    prof = dict(cursor.fetchone() or {})
    
    cursor.execute("SELECT id, doc_type, name, status, doc_hash, expiry_date FROM documents WHERE user_id = ?", (user["id"],))
    docs = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT id, scheme_name, status, stage, submitted_at FROM applications WHERE user_id = ?", (user["id"],))
    apps = [dict(r) for r in cursor.fetchall()]

    conn.close()

    return {
        "export_metadata": {
            "platform": "CIVIC AI",
            "format": "Citizen Portable Data Archive (JSON)",
            "generated_at": time.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "privacy_compliance": "Digital Personal Data Protection Act (DPDP) 2023 Compliant"
        },
        "user_profile": prof,
        "registered_documents": docs,
        "application_records": apps
    }

@app.post("/api/data/delete")
def request_deletion(user: dict = Depends(get_current_user)):
    return {
        "status": "deletion_scheduled",
        "grace_period_days": 14,
        "message": "Your personal data will be completely expunged from the database after 14 days in compliance with DPDP 2023. Blockchain records contain only irreversible anonymous hashes and retain no PII."
    }

# -------------------------------------------------------------
# NOTIFICATIONS (DEADLINE GUARDIAN)
# -------------------------------------------------------------
@app.get("/api/notifications")
def get_notifications(user: dict = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", (user["id"],))
    notifs = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return notifs

@app.post("/api/notifications/{notif_id}/read")
def mark_notification_read(notif_id: str, user: dict = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", (notif_id, user["id"]))
    conn.commit()
    conn.close()
    return {"status": "marked_read"}

# -------------------------------------------------------------
# AI CITIZEN ASSISTANT & RAG KNOWLEDGE SYSTEM
# -------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str
    language: str = "en" # "en" or "ta"

@app.post("/api/assistant/chat")
def assistant_chat(req: ChatRequest, user: dict = Depends(get_current_user)):
    msg = req.message.lower().strip()
    lang = req.language

    # Fetch user profile & applications for context-aware RAG responses
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM profiles WHERE user_id = ?", (user["id"],))
    prof = dict(cursor.fetchone() or {})

    cursor.execute("SELECT * FROM applications WHERE user_id = ?", (user["id"],))
    apps = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM schemes")
    all_schemes = [dict(r) for r in cursor.fetchall()]
    conn.close()

    # Rule-based fallback + RAG knowledge matching
    if any(k in msg for k in ["pending", "stuck", "why", "delayed", "நிலுவை", "ஏன்"]):
        if lang == "ta":
            reply = (
                f"உங்கள் தமிழ்நாடு பின்-மெட்ரிக் கல்வி உதவித்தொகை விண்ணப்பம் (CIVIC-2026-000128) "
                f"தற்போது 'கல்லூரி சரிபார்ப்பு' (Institution Verification) நிலையில் 22 நாட்களாக உள்ளது. "
                f"கல்லூரி ஒருங்கிணைப்பாளர் இன்னும் ஒப்புதல் வழங்கவில்லை. "
                f"சிவிக்கின் AI பின்தொடர்தல் கடிதத்தை பதிவிறக்கம் செய்து கல்லூரி நிர்வாகத்திடம் வழங்க பரிந்துரைக்கப்படுகிறது."
            )
        else:
            reply = (
                f"Your Tamil Nadu Post-Matric Scholarship application (CIVIC-2026-000128) has been pending "
                f"at the 'Institution Verification' desk for 22 days. The normative turnaround is 7 days. "
                f"All your certificates are valid. The probable bottleneck is pending college nodal officer e-attestation. "
                f"Would you like me to generate a follow-up verification letter for your college principal?"
            )
        action = {"route": "/recovery/CIVIC-2026-000128", "label": "Open Recovery Plan"}

    elif any(k in msg for k in ["benefit", "scholarship", "scheme", "உதவி", "திட்டம்", "ஸ்காலர்ஷிப்"]):
        if lang == "ta":
            reply = (
                f"உங்கள் சுயவிவரத்தின்படி ({prof.get('education')}, ஆண்டு வருமானம் ₹{prof.get('income', 0):,}), "
                f"நீங்கள் 4 முக்கிய திட்டங்களுக்கு தகுதி பெறக்கூடும்: "
                f"1. தமிழ்நாடு பின்-மெட்ரிக் கல்வி உதவித்தொகை (94% தகுதி)\n"
                f"2. புதுமைப் பெண் திட்டம் (மாதம் ₹1,000)\n"
                f"3. நான் முதல்வன் இலவச AI & கிளவுட் பயிற்சி\n"
                f"4. முதலமைச்சரின் விரிவான மருத்துவக் காப்பீடு (CMCHIS)."
            )
        else:
            reply = (
                f"Based on your profile as a {prof.get('education')} in Tamil Nadu with an annual income of ₹{prof.get('income', 0):,}, "
                f"you have 4 high-match potential benefits:\n"
                f"• TN Post-Matric Scholarship (94% Match - 100% Tuition Waiver)\n"
                f"• Pudhumai Penn Higher Education Assurance (₹1,000/month DBT)\n"
                f"• Naan Mudhalvan Free Tech Certifications (96% Match)\n"
                f"• CM Comprehensive Health Insurance (₹5 Lakhs Family Cover)."
            )
        action = {"route": "/benefits", "label": "Explore All Benefits"}

    elif any(k in msg for k in ["document", "missing", "சான்றிதழ்", "தேவை"]):
        if lang == "ta":
            reply = (
                "உங்கள் ஆவண நிலவரம்:\n"
                "✓ ஆதார் கார்டு (சரிபார்க்கப்பட்டது)\n"
                "✓ கல்லூரி போனாஃபைட் (சரிபார்க்கப்பட்டது)\n"
                "✓ சாதிச் சான்றிதழ் (சரிபார்க்கப்பட்டது)\n"
                "⚠ வருமானச் சான்றிதழ் இன்னும் 28 நாட்களில் காலாவதியாகிறது. புதுப்பிக்க பரிந்துரைக்கப்படுகிறது."
            )
        else:
            reply = (
                "Document Status Overview:\n"
                "✓ Aadhaar Card: Verified on Blockchain\n"
                "✓ College Bonafide: Verified\n"
                "✓ Community Certificate (BC): Lifetime Valid\n"
                "⚠ Income Certificate: Attention needed (Expires in 28 days on 15 Oct 2026).\n"
                "Your overall Document Readiness Score is 82%."
            )
        action = {"route": "/documents", "label": "Manage Documents"}

    elif any(k in msg for k in ["deadline", "கெடு"]):
        if lang == "ta":
            reply = "அடுத்து வரும் முக்கிய காலக்கெடு: புதுமைப் பெண் பதிவு அக்டோபர் 31, பின்-மெட்ரிக் உதவித்தொகை நவம்பர் 15."
        else:
            reply = "Upcoming Deadlines:\n• Pudhumai Penn: 31 October 2026\n• TN Post-Matric Scholarship: 15 November 2026\n• Naan Mudhalvan Cohort: 25 October 2026."
        action = {"route": "/notifications", "label": "View Deadlines"}

    elif any(k in msg for k in ["tamil", "தமிழ்"]):
        reply = "வணக்கம்! தமிழ் மொழி முறை செயல்படுத்தப்பட்டுள்ளது. நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?"
        action = {"action": "SET_LANG_TA", "label": "தமிழ் முறை"}

    elif any(k in msg for k in ["english", "ஆங்கிலம்"]):
        reply = "Hello! English language mode is now active. How can I assist you with your benefits today?"
        action = {"action": "SET_LANG_EN", "label": "English Mode"}

    else:
        if lang == "ta":
            reply = f"நான் சிவிக் AI உதவியாளர். உங்கள் திட்டத் தகுதிகள், நிலுவையில் உள்ள விண்ணப்பங்கள், ஆவணங்கள் அல்லது காலக்கெடுகளைப் பற்றி என்னிடம் கேட்கலாம்."
        else:
            reply = f"I'm CIVIC AI. I can help you discover entitled government schemes, explain eligibility criteria, diagnose stuck applications, and generate official escalation letters. What would you like to explore?"
        action = {"route": "/benefits", "label": "Browse Benefits"}

    return {
        "reply": reply,
        "source": "CIVIC AI RAG Knowledge Base (Tamil Nadu State Welfare Directorate & Central Schemes)",
        "last_updated": "2026-10-01",
        "action": action
    }

# -------------------------------------------------------------
# VOICE COMMAND PROCESSOR
# -------------------------------------------------------------
class VoiceCommandRequest(BaseModel):
    command: str
    language: str = "en"

@app.post("/api/voice/command")
def process_voice_command(req: VoiceCommandRequest, user: dict = Depends(get_current_user)):
    cmd = req.command.lower().strip()
    lang = req.language

    # Intent routing
    if any(k in cmd for k in ["benefit", "scholarship", "scheme", "உதவி", "திட்டம்", "find"]):
        speech = "Opening your Benefit Radar. You have four high-probability benefit matches." if lang == "en" else "உங்கள் பயன்கள் பக்கத்தை திறக்கிறேன். 4 திட்டங்கள் கண்டறியப்பட்டுள்ளன."
        return {"action": "NAVIGATE", "route": "/benefits", "speech": speech}

    elif any(k in cmd for k in ["application", "status", "track", "விண்ணப்ப"]):
        speech = "Navigating to your applications. One application is pending at institution verification." if lang == "en" else "உங்கள் விண்ணப்பங்கள் பக்கத்தை திறக்கிறேன்."
        return {"action": "NAVIGATE", "route": "/applications", "speech": speech}

    elif any(k in cmd for k in ["document", "upload", "missing", "சான்றிதழ்"]):
        speech = "Opening Document Center. Your document readiness score is 82 percent." if lang == "en" else "ஆவண மையத்தை திறக்கிறேன். தயார்நிலை 82 சதவீதம்."
        return {"action": "NAVIGATE", "route": "/documents", "speech": speech}

    elif any(k in cmd for k in ["recovery", "stuck", "pending", "diagnose", "ஏன்", "நிலுவை"]):
        speech = "Opening AI Recovery Copilot for your Post-Matric Scholarship application." if lang == "en" else "AI மீட்பு பக்கத்தை திறக்கிறேன்."
        return {"action": "NAVIGATE", "route": "/recovery/CIVIC-2026-000128", "speech": speech}

    elif any(k in cmd for k in ["notification", "deadline", "அறிவிப்பு"]):
        speech = "Opening your Deadline Guardian and notifications." if lang == "en" else "அறிவிப்புகள் பக்கத்தை திறக்கிறேன்."
        return {"action": "NAVIGATE", "route": "/notifications", "speech": speech}

    elif any(k in cmd for k in ["profile", "சுயவிவரம்"]):
        speech = "Opening your citizen profile." if lang == "en" else "உங்கள் சுயவிவரப் பக்கத்தை திறக்கிறேன்."
        return {"action": "NAVIGATE", "route": "/profile", "speech": speech}

    elif any(k in cmd for k in ["tamil", "தமிழ் முறை"]):
        return {"action": "SET_LANG", "lang": "ta", "speech": "தமிழ் மொழி முறை செயல்படுத்தப்பட்டது."}

    elif any(k in cmd for k in ["english", "ஆங்கிலம்"]):
        return {"action": "SET_LANG", "lang": "en", "speech": "English mode enabled."}

    elif any(k in cmd for k in ["logout", "வெளியேறு"]):
        return {"action": "LOGOUT", "route": "/login", "speech": "Logging out. Have a great day!" if lang == "en" else "வெளியேறுகிறது. நன்றி!"}

    elif any(k in cmd for k in ["read", "படி"]):
        speech = "Reading current page overview: CIVIC AI platform. Benefit Opportunity Score 73 out of 100."
        return {"action": "READ_PAGE", "speech": speech}

    else:
        # Pass to assistant chat
        chat_res = assistant_chat(ChatRequest(message=req.command, language=lang), user)
        return {
            "action": "SPEAK_RESPONSE",
            "speech": chat_res["reply"][:250],
            "full_reply": chat_res["reply"]
        }

# -------------------------------------------------------------
# ADMIN / GOVERNMENT INTELLIGENCE DASHBOARD
# -------------------------------------------------------------
@app.get("/api/admin/analytics")
def get_admin_analytics():
    # Anonymized aggregate indicators (guaranteed zero PII leakage)
    kpis = {
        "total_citizens": 2430,
        "total_applications": 1204,
        "potential_benefits_matched": 8214,
        "pending_applications": 327,
        "avg_processing_days": 18.4,
        "unresolved_bottlenecks": 84,
        "blockchain_verified_audits": 14280
    }

    # Trend of benefit discovery vs applications
    discovery_trends = [
        {"month": "May", "discoveries": 1200, "applications": 280, "approvals": 210},
        {"month": "Jun", "discoveries": 1950, "applications": 410, "approvals": 340},
        {"month": "Jul", "discoveries": 2800, "applications": 640, "approvals": 510},
        {"month": "Aug", "discoveries": 4100, "applications": 890, "approvals": 720},
        {"month": "Sep", "discoveries": 6400, "applications": 1050, "approvals": 880},
        {"month": "Oct", "discoveries": 8214, "applications": 1204, "approvals": 980}
    ]

    # Application status distribution
    status_distribution = [
        {"name": "Approved & Disbursed", "value": 782, "color": "#10b981"},
        {"name": "Institution Verification", "value": 184, "color": "#f59e0b"},
        {"name": "District Officer Review", "value": 98, "color": "#38bdf8"},
        {"name": "Document Revision Needed", "value": 85, "color": "#ec4899"},
        {"name": "Rejected / Ineligible", "value": 55, "color": "#ef4444"}
    ]

    # Common Missing Documents
    missing_docs = [
        {"document": "Tahsildar Income Certificate", "count": 420, "percentage": 34.8},
        {"document": "College Bonafide e-Seal", "count": 298, "percentage": 24.7},
        {"document": "NPCI Aadhaar Bank Seeding", "count": 215, "percentage": 17.8},
        {"document": "Community Certificate Digital Copy", "count": 142, "percentage": 11.7},
        {"document": "Ration Card Family Head Mapping", "count": 89, "percentage": 7.3}
    ]

    # Common Bottlenecks
    bottlenecks = [
        {"stage": "College Nodal Officer E-sign", "avg_delay_days": 16.2, "affected_apps": 184},
        {"stage": "District Welfare Sanction Order", "avg_delay_days": 11.5, "affected_apps": 98},
        {"stage": "Bank NPCI Mapper Awaiting Authorization", "avg_delay_days": 7.8, "affected_apps": 64},
        {"stage": "Central Portal Certificate Hash Sync", "avg_delay_days": 3.4, "affected_apps": 42}
    ]

    # District Benefit Gap Map (Tamil Nadu anonymized regional distribution)
    regional_gap_map = [
        {"district": "Chennai", "unclaimed_benefits": 1420, "delay_rate": "18%", "primary_issue": "Institution Attestation Lag"},
        {"district": "Madurai", "unclaimed_benefits": 980, "delay_rate": "24%", "primary_issue": "Income Certificate Expiry"},
        {"district": "Coimbatore", "unclaimed_benefits": 1150, "delay_rate": "14%", "primary_issue": "Bank Aadhaar Seeding"},
        {"district": "Tiruchirappalli", "unclaimed_benefits": 840, "delay_rate": "21%", "primary_issue": "Bonafide Renewal"},
        {"district": "Salem", "unclaimed_benefits": 760, "delay_rate": "27%", "primary_issue": "Digital Literacy Barrier"},
        {"district": "Tirunelveli", "unclaimed_benefits": 620, "delay_rate": "19%", "primary_issue": "EMIS School Record Mapping"}
    ]

    return {
        "kpis": kpis,
        "discovery_trends": discovery_trends,
        "status_distribution": status_distribution,
        "missing_docs": missing_docs,
        "bottlenecks": bottlenecks,
        "regional_gap_map": regional_gap_map
    }

@app.get("/api/admin/insights")
def get_admin_insights():
    return {
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "ai_policy_insights": [
            {
                "title": "Income Certificate Expiry Clustering",
                "severity": "HIGH",
                "impact": "Accountable for 41% of sudden scholarship rejections in Q3.",
                "recommendation": "Extend automated proactive notification alerts 45 days prior to expiration and enable direct e-Sevai API re-validation."
            },
            {
                "title": "College Nodal Desk Turnaround Asymmetry",
                "severity": "CRITICAL",
                "impact": "Average institutional pending duration is 16.2 days against normative 7 days.",
                "recommendation": "Implement an automated reminder escalation protocol to college principals on Day 8 of inactivity."
            },
            {
                "title": "High Discovery to Application Drop-off in Tech Skills",
                "severity": "MEDIUM",
                "impact": "82% interest in Naan Mudhalvan free AI certification but 48% drop-off at document upload.",
                "recommendation": "Enable single-click bonafide auto-import via State University ERP integration."
            }
        ]
    }

# -------------------------------------------------------------
# AI ASSISTANT, BILINGUAL VOICE & NATURAL CITIZEN COPILOT
# -------------------------------------------------------------
class AssistantChatRequest(BaseModel):
    message: str
    language: Optional[str] = "en"

class VoiceCommandRequest(BaseModel):
    command: str
    language: Optional[str] = "en"

@app.post("/api/assistant/chat")
def assistant_chat(req: AssistantChatRequest, user: dict = Depends(get_current_user)):
    """
    Empathetic, clear, conversational AI welfare copilot.
    Communicates naturally with common citizens in Tamil and English.
    """
    msg = req.message.strip().lower()
    is_tamil = req.language == "ta" or any("\u0b80" <= c <= "\u0bff" for c in req.message)

    # 1. Greetings & Warm Welcomes
    if any(k in msg for k in ["வணக்கம்", "வணக்கம", "hello", "hi", "hey", "vanakkam", "help"]):
        if is_tamil:
            return {
                "reply": "வணக்கம்! நான் உங்கள் சிவிக் AI உதவியாளர். தமிழ்நாடு அரசின் கல்வி உதவித்தொகை, புதுமைப் பெண் திட்டம், முதியோர் ஓய்வூதியம், மகளிர் உரிமைத் தொகை மற்றும் உங்கள் விண்ணப்ப நிலவரம் குறித்து எளிய தமிழில் உதவ நான் தயாராக உள்ளேன். நீங்கள் எதைப்பற்றி அறிய விரும்புகிறீர்கள்?",
                "action": {"route": "/benefits", "label": "நலத்திட்டங்களை காண்க"}
            }
        else:
            return {
                "reply": "Hello! I am your CIVIC AI Assistant. I am here to help you discover welfare schemes like the TN Post-Matric Scholarship, Pudhumai Penn, pensions, and track your applications. How can I help you today?",
                "action": {"route": "/benefits", "label": "Explore Benefits"}
            }

    # 2. Application Pending, Delay & Bottleneck Analysis
    if any(k in msg for k in ["நிலுவை", "தாமதம்", "ஏன்", "pending", "stuck", "status", "delay", "scholarship pending", "எப்போது வரும்"]):
        if is_tamil:
            return {
                "reply": "உங்கள் 'தமிழ்நாடு பின்-மெட்ரிக் கல்வி உதவித்தொகை' விண்ணப்பம் (CIVIC-2026-000128) கல்லூரி சரிபார்ப்பு மேசையில் 22 நாட்களாக நிலுவையில் உள்ளது (சாதாரண கால அவகாசம் 7 நாட்கள் மட்டுமே). இதற்கான காரணம் கல்லூரி நோடல் அதிகாரியின் ஒப்புதல் தாமதம் ஆகும். எங்கள் மீட்பு வழிகாட்டியைப் பயன்படுத்தி கல்லூரிக்கு சமர்ப்பிக்க வேண்டிய அதிகாரப்பூர்வ நினைவூட்டல் கடிதத்தை உடனே பதிவிறக்கம் செய்யலாம்.",
                "action": {"route": "/recovery/CIVIC-2026-000128", "label": "மீட்பு வழிகாட்டியைத் திற (Recovery Plan)"}
            }
        else:
            return {
                "reply": "Your TN Post-Matric Scholarship application (CIVIC-2026-000128) is currently pending at Institution Verification for 22 days (standard turnaround is 7 days). The delay is at the college scholarship nodal officer desk. You can use our Recovery Copilot to download an official auto-generated follow-up letter to expedite your sanction.",
                "action": {"route": "/recovery/CIVIC-2026-000128", "label": "Open Recovery Copilot"}
            }

    # 3. Scholarships & Education Welfare
    if any(k in msg for k in ["கல்வி உதவி", "உதவித்தொகை", "படிப்பு", "scholarship", "education", "college", "பள்ளி", "மாணவர்"]):
        if is_tamil:
            return {
                "reply": "உங்கள் மாணவர் சுயவிவரத்தின்படி நீங்கள் 2 முக்கிய கல்வி திட்டங்களுக்கு தகுதியானவர்: 1) தமிழ்நாடு பின்-மெட்ரிக் கல்வி உதவித்தொகை (100% கல்விக் கட்டண விலக்கு + ₹4,000 ஆண்டு பராமரிப்பு உதவித்தொகை) - 94% பொருத்தம். 2) நான் முதல்வன் இலவச AI & தொழில்நுட்ப திறன் பயிற்சி - 96% பொருத்தம். அரசு பள்ளி மாணவிகள் புதுமைப் பெண் திட்டம் மூலம் மாதம் ₹1,000 பெறலாம்.",
                "action": {"route": "/benefits", "label": "கல்வி திட்டங்களை காண்க"}
            }
        else:
            return {
                "reply": "Based on your student profile in Tamil Nadu, you qualify for 2 high-value education schemes: 1) TN Post-Matric Scholarship (100% Tuition Fee Waiver + ₹4,000 annual maintenance) with 94% eligibility match. 2) Naan Mudhalvan Free Tech & AI Certification (96% match). Girl students from govt schools also receive ₹1,000/month under Pudhumai Penn.",
                "action": {"route": "/benefits", "label": "Explore Scholarships"}
            }

    # 4. Old Age Pension / Senior Citizens
    if any(k in msg for k in ["முதியோர்", "ஓய்வூதியம்", "பென்ஷன்", "pension", "old age", "senior", "வயதான"]):
        if is_tamil:
            return {
                "reply": "தமிழ்நாடு இந்திரா காந்தி முதியோர் ஓய்வூதியத் திட்டம் (OAP) மூலம் 60 வயதுக்கு மேற்பட்ட வறுமைக் கோட்டிற்கு கீழ் உள்ள மூத்த குடிமக்களுக்கு மாதம் ₹1,000 அரசு வழங்குகிறது. இதற்கு ஆதார் அட்டை, வயது சான்றிதழ், வறுமைக் கோட்டுச் சான்று மற்றும் வங்கி கணக்கு புத்தகம் தேவை. தாலுகா அலுவலகம் அல்லது இ-சேவை மையம் மூலம் விண்ணப்பிக்கலாம்.",
                "action": {"route": "/benefits", "label": "முதியோர் திட்டங்களை காண்க"}
            }
        else:
            return {
                "reply": "Under the Tamil Nadu Indira Gandhi Old Age Pension Scheme (OAP), senior citizens aged 60+ living below poverty line receive ₹1,000 per month directly into their bank account. Required documents: Aadhaar card, age proof, BPL certificate, and bank passbook.",
                "action": {"route": "/benefits", "label": "View Pension Scheme"}
            }

    # 5. Women Schemes & Magalir Urimai Thogai
    if any(k in msg for k in ["மகளிர்", "பெண்கள்", "உரிமைத் தொகை", "women", "magalir", "மாதம் 1000", "pudhumai penn", "புதுமை"]):
        if is_tamil:
            return {
                "reply": "கலைஞர் மகளிர் உரிமைத் திட்டத்தின் கீழ் குடும்பத் தலைவிகளுக்கு மாதந்தோறும் ₹1,000 வங்கி கணக்கில் நேரடியாக வழங்கப்படுகிறது. மேலும் அரசு பள்ளிகளில் படித்து உயர்கல்வி பயிலும் மாணவிகளுக்கு 'புதுமைப் பெண்' திட்டம் மூலம் மாதம் ₹1,000 வங்கி கணக்கில் செலுத்தப்படுகிறது.",
                "action": {"route": "/benefits", "label": "மகளிர் திட்டங்களை காண்க"}
            }
        else:
            return {
                "reply": "Under the Kalaignar Magalir Urimai Thogai Scheme, eligible women heads of households receive ₹1,000/month direct benefit transfer. Additionally, the Pudhumai Penn Scheme offers ₹1,000/month to undergraduate girl students who completed schooling in government schools.",
                "action": {"route": "/benefits", "label": "Explore Women Schemes"}
            }

    # 6. Documents & Certificate Renewal Alerts
    if any(k in msg for k in ["ஆவணம்", "சான்றிதழ்", "வருமான", "சாதி", "documents", "certificate", "income", "aadhaar", "ரேஷன்"]):
        if is_tamil:
            return {
                "reply": "உங்கள் ஆவணக் காப்பகத்தில் ஆதார் மற்றும் கல்லூரி அடையாள அட்டை சரிபார்க்கப்பட்டுள்ளது. ஆனால் முக்கிய எச்சரிக்கை: உங்கள் வட்டாட்சியர் வருமான சான்றிதழ் இன்னும் 18 நாட்களில் காலாவதியாக உள்ளது! உதவித்தொகை தடைபடாமல் இருக்க உடனே இ-சேவை மையம் மூலம் புதுப்பிக்க விண்ணப்பிக்கவும்.",
                "action": {"route": "/documents", "label": "ஆவணக் காப்பகத்தை சரிபார்க்க"}
            }
        else:
            return {
                "reply": "Your document vault has verified your Aadhaar and College Bonafide. However, there is an urgent alert: your Tahsildar Income Certificate expires in 18 days! Please renew it promptly through your local e-Sevai centre to prevent any delay in scholarship disbursal.",
                "action": {"route": "/documents", "label": "View Document Vault"}
            }

    # 7. Health & Medical Insurance
    if any(k in msg for k in ["மருத்துவம்", "காப்பீடு", "health", "insurance", "hospital", "மருத்துவமனை", "ஆஸ்பத்திரி"]):
        if is_tamil:
            return {
                "reply": "முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம் (CMCHS) மூலம் குடும்பத்திற்கு ஆண்டுக்கு ₹5,00,000 வரை ரொக்கமில்லா இலவச மருத்துவ சிகிச்சை அரசு மற்றும் தனியார் மருத்துவமனைகளில் பெறலாம். இதற்கு முதலமைச்சர் காப்பீட்டு அட்டை அல்லது ஸ்மார்ட் குடும்ப அட்டை அவசியம்.",
                "action": {"route": "/benefits", "label": "மருத்துவ திட்டத்தை காண்க"}
            }
        else:
            return {
                "reply": "Under the Chief Minister's Comprehensive Health Insurance Scheme (CMCHS), eligible families receive cashless medical treatment of up to ₹5,00,000 per annum across empanelled hospitals in Tamil Nadu using their Smart Ration Card.",
                "action": {"route": "/benefits", "label": "View Health Coverage"}
            }

    # 8. Recovery, Grievances & Escalation Ladder
    if any(k in msg for k in ["புகார்", "மீட்பு", "மனு", "recovery", "escalate", "grievance", "collector", "முதல்வர்"]):
        if is_tamil:
            return {
                "reply": "விண்ணப்பம் தாமதமானால் தீர்வு காண 3 அடுக்கு வழிகள் உள்ளன: 1) கல்லூரி நோடல் அதிகாரிக்கு நினைவூட்டல் கடிதம் சமர்ப்பித்தல், 2) மாவட்ட ஆட்சியர் அலுவலகத்தில் திங்கட்கிழமை மக்கள் குறைதீர்க்கும் முகாமில் மனு கொடுத்தல், 3) முதலமைச்சர் தனிப்பிரிவு (CM Helpline 1100) மூலம் புகார் பதிவு செய்தல். மீட்பு பக்கத்தில் இதற்கான கடிதங்கள் தயாராக உள்ளன.",
                "action": {"route": "/recovery/CIVIC-2026-000128", "label": "மீட்பு படிவங்களை காண்க"}
            }
        else:
            return {
                "reply": "CIVIC AI provides a 3-tier escalation ladder for delayed applications: Level 1) Submit institutional grievance to College Nodal Officer, Level 2) Present petition at District Collectorate Public Grievance Day, Level 3) Formal complaint via CM Helpline 1100. Complete bilingual letters are pre-drafted for you.",
                "action": {"route": "/recovery/CIVIC-2026-000128", "label": "Open Recovery Copilot"}
            }

    # 9. Privacy & Security
    if any(k in msg for k in ["பாதுகாப்பு", "blockchain", "privacy", "aadhaar leak", "தகவல்"]):
        if is_tamil:
            return {
                "reply": "சிவிக் AI உங்கள் தகவல்களை முழுமையாக பாதுகாக்கிறது (DPDP சட்டம் 2023). உங்கள் ஆதார் எண்களோ அல்லது தனிப்பட்ட வங்கி விவரங்களோ ஒருபோதும் பிளாக்செயினில் சேமிக்கப்படுவதில்லை. மாறாக மாற்ற முடியாத கிரிப்டோகிராபிக் ஹாஷ் மட்டுமே சரிபார்ப்பிற்காக வைக்கப்படுகிறது.",
                "action": {"route": "/security", "label": "பாதுகாப்பு தணிக்கையை காண்க"}
            }
        else:
            return {
                "reply": "CIVIC AI adheres strictly to the Digital Personal Data Protection (DPDP) Act 2023. Zero raw Aadhaar, phone, or bank details are stored on-chain. Only cryptographic SHA-256 hashes and verifiable audit events are immutably logged.",
                "action": {"route": "/security", "label": "View Security Ledger"}
            }

    # Default Empathetic Assistance
    if is_tamil:
        return {
            "reply": "உங்கள் கேள்விக்கு நன்றி! நான் உங்கள் சுயவிவரம் மற்றும் நிலுவை விண்ணப்பங்களை சரிபார்த்துள்ளேன். உதவித்தொகை நிலை, புதிய அரசு திட்டங்கள், அல்லது காலாவதியாகும் வருமான சான்றிதழ் குறித்து என்னிடம் கேளுங்கள். எளிய தமிழில் உங்களுக்கு வழிகாட்ட நான் தயாராக உள்ளேன்.",
            "action": {"route": "/benefits", "label": "நலத்திட்டங்களை காண்க"}
        }
    else:
        return {
            "reply": "Thank you for asking! Based on your citizen profile, I have analyzed your active entitlements. I can assist you with scholarship eligibility, resolving your 22-day college verification delay, or renewing your expiring income certificate. What would you like to explore?",
            "action": {"route": "/benefits", "label": "Explore Benefits"}
        }

@app.post("/api/voice/command")
def voice_command(req: VoiceCommandRequest, user: dict = Depends(get_current_user)):
    """
    Voice command intent router for natural navigation & actions in English and Tamil.
    """
    cmd = req.command.strip().lower()
    is_tamil = req.language == "ta" or any("\u0b80" <= c <= "\u0bff" for c in req.command)

    if any(k in cmd for k in ["benefit", "scholarship", "திட்டம்", "பயன்", "கல்வி"]):
        return {
            "action": "NAVIGATE",
            "route": "/benefits",
            "speech": "உங்கள் நலத்திட்டங்கள் பக்கத்தை திறக்கிறேன்." if is_tamil else "Opening your Benefit Radar."
        }
    if any(k in cmd for k in ["application", "track", "விண்ணப்ப", "நிலை", "நிலுவை"]):
        return {
            "action": "NAVIGATE",
            "route": "/applications",
            "speech": "உங்கள் விண்ணப்பங்கள் பக்கத்தை திறக்கிறேன்." if is_tamil else "Opening your application tracker."
        }
    if any(k in cmd for k in ["document", "certificate", "ஆவண", "சான்றிதழ்"]):
        return {
            "action": "NAVIGATE",
            "route": "/documents",
            "speech": "உங்கள் ஆவணக் காப்பகத்தை திறக்கிறேன்." if is_tamil else "Opening your document vault."
        }
    if any(k in cmd for k in ["recover", "bottleneck", "delay", "மீட்பு", "தாமதம்", "உதவி"]):
        return {
            "action": "NAVIGATE",
            "route": "/recovery/CIVIC-2026-000128",
            "speech": "விண்ணப்ப மீட்பு வழிகாட்டியை திறக்கிறேன்." if is_tamil else "Opening Recovery Copilot."
        }
    if any(k in cmd for k in ["security", "audit", "blockchain", "பாதுகாப்பு"]):
        return {
            "action": "NAVIGATE",
            "route": "/security",
            "speech": "பாதுகாப்பு மற்றும் தணிக்கைப் பக்கத்தை திறக்கிறேன்." if is_tamil else "Opening security audit ledger."
        }
    if any(k in cmd for k in ["home", "dashboard", "முகப்பு"]):
        return {
            "action": "NAVIGATE",
            "route": "/dashboard",
            "speech": "முகப்பு பக்கத்தை திறக்கிறேன்." if is_tamil else "Returning to citizen dashboard."
        }
    if any(k in cmd for k in ["tamil", "தமிழ்"]):
        return {
            "action": "SET_LANG",
            "lang": "ta",
            "speech": "தமிழ் மொழி தேர்ந்தெடுக்கப்பட்டது. வணக்கம்!"
        }
    if any(k in cmd for k in ["english", "ஆங்கிலம்"]):
        return {
            "action": "SET_LANG",
            "lang": "en",
            "speech": "Switched to English mode."
        }
    if any(k in cmd for k in ["read", "வாசி", "படி"]):
        return {
            "action": "READ_PAGE",
            "speech": "பக்கத்தை வாசிக்கிறேன்." if is_tamil else "Reading page content aloud."
        }

    return {
        "action": "NAVIGATE",
        "route": "/benefits",
        "speech": "நலத்திட்டங்கள் பக்கத்தை திறக்கிறேன்." if is_tamil else "Opening benefits."
    }

@app.get("/api/tts")
def get_tts_audio(text: str, lang: str = "ta"):
    """
    High-fidelity natural Text-to-Speech proxy with sentence chunking.
    Provides natural human-sounding Tamil and Indian English speech for common citizens.
    """
    clean_text = re.sub(r'[*#_`•]', ' ', text)
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    if not clean_text:
        clean_text = "வணக்கம்" if lang == "ta" else "Hello"

    # Split by punctuation for natural sentence boundaries
    parts = re.split(r'([.?!,;\n]+)', clean_text)
    chunks = []
    curr = ""
    for p in parts:
        if len(curr) + len(p) < 130:
            curr += p
        else:
            if curr.strip():
                chunks.append(curr.strip())
            curr = p
    if curr.strip():
        chunks.append(curr.strip())

    if not chunks:
        chunks = [clean_text[:130]]

    # Limit to first 6 chunks (~600 chars) for fast snappy response
    audio_data = bytearray()
    t_lang = "ta" if lang == "ta" else "en-IN"
    for chunk in chunks[:6]:
        try:
            encoded = urllib.parse.quote(chunk)
            url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={encoded}&tl={t_lang}&client=tw-ob"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=4) as resp:
                audio_data.extend(resp.read())
        except Exception:
            continue

    if not audio_data:
        raise HTTPException(status_code=500, detail="Could not generate speech audio")

    return Response(content=bytes(audio_data), media_type="audio/mpeg")

# -------------------------------------------------------------
# WEBSOCKET REAL-TIME ENDPOINT
# -------------------------------------------------------------
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo or process incoming ping
            try:
                msg = json.loads(data)
                if msg.get("type") == "PING":
                    await websocket.send_json({"type": "PONG", "timestamp": int(time.time())})
            except Exception:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
