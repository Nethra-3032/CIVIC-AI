# CIVIC AI — Know What You're Entitled To.

> **Next-Generation Citizen Benefits & Application Recovery Platform**  
> Built for National-Level AI & Social Impact Hackathons.

---

## 🏛️ 1. Executive Summary

Traditional government portals ask:  
*"What department service are you looking for?"*  
**CIVIC AI asks:** *"What entitlements might you be missing?"*

Traditional tracking systems report:  
*"Status: Pending."*  
**CIVIC AI asks:** *"Why might it be pending, what evidence do we have, and what is your next best action?"*

CIVIC AI solves three systemic gaps in citizen welfare:
1. **CIVIC DISCOVER (Discovery Gap):** Proactively matches citizens with eligible central and state schemes (scholarships, pensions, housing, healthcare) based on demographic criteria.
2. **CIVIC APPLY (Application Gap):** Pre-submission readiness scoring (82%), AI document extraction, OCR validation, and risk checks before filing.
3. **CIVIC RECOVER (Recovery Gap):** Digital Bureaucracy GPS tracker, probable bottleneck diagnosis (e.g. 22-day delay at institutional verification desk with 78% confidence), 4-step recovery plan, automated bilingual follow-up drafter, and 3-tier escalation ladder.

---

## 🔐 2. Security Architecture — Zero Raw PII On-Chain

CIVIC AI strictly complies with the **Digital Personal Data Protection (DPDP) Act 2023**:

```
CITIZEN INTERFACE (Web / Voice)
       ↓  (TLS 1.3 Transport Encryption)
FASTAPI BACKEND & DATA MINIMIZATION LAYER
       ↓
OFF-CHAIN ENCRYPTED DATABASE (AES-256)
  • Masked Aadhaar (e.g., XXXX XXXX 4821)
  • Certificates & Verified Income Data
  • Sensitive Contact Details
       ↓
CRYPTOGRAPHIC HASHING ENGINE (SHA-256 / Keccak-256)
       ↓
IMMUTABLE BLOCKCHAIN AUDIT LEDGER (CivicAuditLedger.sol)
  • Anonymous User UUID Hash
  • Event Types (DOCUMENT_REGISTERED, APPLICATION_CREATED, CONSENT_GRANTED, etc.)
  • SHA-256 Data State Proof
  • Block Timestamp & Block Number
  • STRICT RULE: ZERO raw Aadhaar, phone, or bank details are stored on-chain!
```

---

## 🎙️ 3. Accessibility-First Voice Mode & Multilingual Engine

Designed specifically for elderly citizens, visually impaired users, and citizens with low digital literacy:
- **Speech Recognition:** Voice command intent routing ("Open my benefits", "Find scholarships", "Why is my application pending?", "Read this page").
- **Speech Synthesis (TTS):** Responses spoken aloud in natural Indian English and Tamil (`ta-IN`).
- **High Contrast Mode (WCAG AAA):** Instant 1-click black-and-yellow accessibility view.
- **Bilingual Content:** Scheme descriptions, criteria breakdowns, notifications, AI responses, and follow-up letters in both English and Tamil.

---

## 🚀 4. Quick Start & Execution Guide

### Prerequisites
- **Node.js**: v18+ (v24.11 installed)
- **Python**: v3.10+ (v3.11 installed)

### 1. Start the Backend API (FastAPI)
```bash
# In project root:
.\venv\Scripts\python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
- API Base: `http://127.0.0.1:8000`
- Interactive Swagger Docs: `http://127.0.0.1:8000/docs`
- Live WebSocket: `ws://127.0.0.1:8000/ws`

### 2. Start the Frontend (Vite + React)
```bash
# In frontend directory:
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
- Web Application URL: `http://127.0.0.1:5173/`

---

## 🎭 5. Hackathon Demo Personas & Credentials

For judging and evaluation, 1-click instant login buttons are built right into the UI:

| Persona | Role | Identifier | Password | Key Demo Features |
|---|---|---|---|---|
| **Priya Kumar** | Demo Citizen (19y, College Student) | `priya.kumar@example.com` or `+919876543210` | `demo123` | Benefit Opportunity Score 73/100, TN Post-Matric Scholarship stuck at College Desk for 22 days, AI Failure Detector, Bilingual Follow-up Generator |
| **S. Meenakshi** | Welfare Admin Officer | `admin@civic.gov.in` | `admin123` | Anonymized Gov Intelligence Observatory, District Benefit Gap Map, Recharts visual analytics, AI Policy Recommendations |

---

## 📁 6. Project Architecture

```
CIVIC AI/
├── backend/
│   ├── main.py              # FastAPI application, auth, REST endpoints, WebSocket
│   ├── database.py          # SQLite connection, schemas, SHA-256 hash utils
│   ├── seed.py              # Pre-seeded Tamil Nadu schemes, Priya Kumar profile & audit logs
│   └── civic_ai.db          # Database file with full state persistence
├── blockchain/
│   └── contracts/
│       └── CivicAuditLedger.sol # Solidity smart contract for immutable audit proofs
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, VoiceAssistantOrb, BenefitRadarVisual, BureaucracyGPS, BlockchainBadge, BottomNav
│   │   ├── context/         # AuthContext, VoiceAndAccessibilityContext
│   │   ├── pages/           # Landing, Login, Onboarding, Dashboard, Benefits, Documents, Applications, Recovery, Security, Admin
│   │   ├── services/api.ts  # Typed API client connecting to backend REST & WebSocket
│   │   ├── types/index.ts   # TypeScript data models
│   │   └── App.tsx          # Hash routing, real-time toasts, and universal layout
│   └── tailwind.config.js   # Tailored theme tokens, glassmorphism, animations
├── .env.example             # Configuration template
└── README.md                # Comprehensive documentation
```

---

## 🏆 7. Hackathon Judging Flow (The Golden Demo)

1. **Landing Page (`/`):**
   - Review hero tagline *"Know What You're Entitled To."*
   - Observe the 6-stage Citizen Journey: DISCOVER → CHECK → APPLY → TRACK → RECOVER → RECEIVE.
2. **Sign In (`/login`):**
   - Click the 1-click **Priya Kumar (Citizen)** card to sign in.
3. **Citizen Dashboard (`/dashboard`):**
   - Review the animated **Benefit Opportunity Score (73/100)** dial.
   - Inspect the **Action Required** priority alert: 22-day delay on Post-Matric Scholarship.
4. **Benefit Radar (`/benefits`):**
   - Explore matching schemes: **94% profile match** for TN Post-Matric Scholarship, **96% match** for Naan Mudhalvan free AI certification.
5. **Scheme Explainer & Copilot (`/benefits/sch_tn_postmatric`):**
   - Examine the green criteria match indicators (Age, Education, Income, Domicile).
   - Read the explainable AI justification and pre-submission checklist.
6. **Document Intelligence (`/documents`):**
   - Inspect the Document Readiness Score (82%).
   - See OCR extracted metadata, expiry warnings (28 days left on Income Certificate), and tamper-evident **Blockchain Verified** badges.
7. **Digital Bureaucracy GPS (`/applications/CIVIC-2026-000128`):**
   - View the active stage highlighted at *Institution Verification (College Desk)* with 22-day delay marker.
8. **AI Recovery Copilot (`/recovery/CIVIC-2026-000128`):**
   - Review the **Probable Bottleneck** (College Nodal Officer Institutional e-Attestation Pending).
   - Check the **78% confidence** score and empirical evidence points.
   - Switch between **English Notice** and **தமிழ் கடிதம்** to generate official follow-up letters.
   - Click **Copy** or **Download .txt**.
   - Review the 3-tier Escalation Ladder (College Desk → District BC Officer → TN CM Helpline 1100).
9. **Security Center & Audit Ledger (`/security`):**
   - Review granular DPDP consent toggles.
   - Inspect the on-chain table in `CivicAuditLedger` showing block IDs, transaction hashes, and SHA-256 data proofs.
   - Click **Export My Data** to download the portable JSON archive.
10. **Admin Intelligence Observatory (`/admin`):**
    - Switch to Admin Persona.
    - Review anonymized aggregate KPIs (2,430 Demo Citizens, 1,204 Applications, 8,214 Benefit Matches).
    - Inspect the Recharts trend graphs, District Benefit Gap Map, and automated AI Policy Insights.
11. **Voice AI Orb (Bottom Right):**
    - Click the floating **CIVIC AI** orb.
    - Ask questions in English or Tamil or tap the mic for live voice interaction.
