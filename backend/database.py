import sqlite3
import os
import json
import hashlib
import time
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "civic_ai.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Users
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'CITIZEN',
        created_at INTEGER NOT NULL
    )
    """)

    # Citizen Profiles
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS profiles (
        user_id TEXT PRIMARY KEY,
        age INTEGER,
        dob TEXT,
        state TEXT,
        district TEXT,
        education TEXT,
        employment TEXT,
        income INTEGER,
        category TEXT,
        masked_aadhaar TEXT,
        bank_verified INTEGER DEFAULT 1,
        opportunity_score INTEGER DEFAULT 73,
        updated_at INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    """)

    # Schemes
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS schemes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_ta TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        description_ta TEXT NOT NULL,
        benefit_summary TEXT NOT NULL,
        benefit_summary_ta TEXT NOT NULL,
        criteria_json TEXT NOT NULL,
        documents_json TEXT NOT NULL,
        workflow_json TEXT NOT NULL,
        escalation_json TEXT NOT NULL,
        deadline TEXT,
        official_source TEXT,
        last_updated TEXT
    )
    """)

    # Documents
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        doc_type TEXT NOT NULL,
        name TEXT NOT NULL,
        file_path TEXT,
        status TEXT NOT NULL, -- VERIFIED, PENDING, EXPIRED, ATTENTION_REQUIRED
        extracted_data_json TEXT,
        doc_hash TEXT NOT NULL,
        expiry_date TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    """)

    # Applications
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        scheme_id TEXT NOT NULL,
        scheme_name TEXT NOT NULL,
        status TEXT NOT NULL, -- PENDING, UNDER_VERIFICATION, APPROVED, REJECTED
        stage TEXT NOT NULL,
        readiness_score INTEGER DEFAULT 82,
        submitted_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        stages_json TEXT NOT NULL,
        diagnosis_json TEXT,
        recovery_plan_json TEXT,
        blockchain_tx TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(scheme_id) REFERENCES schemes(id)
    )
    """)

    # Consents
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS consents (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        consent_profile INTEGER DEFAULT 1,
        consent_documents INTEGER DEFAULT 1,
        consent_matching INTEGER DEFAULT 1,
        consent_diagnosis INTEGER DEFAULT 1,
        consent_blockchain INTEGER DEFAULT 1,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    """)

    # Notifications
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        title_ta TEXT NOT NULL,
        message TEXT NOT NULL,
        message_ta TEXT NOT NULL,
        category TEXT NOT NULL, -- DEADLINE, BOTTLENECK, DOCUMENT, SYSTEM
        is_read INTEGER DEFAULT 0,
        action_url TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    """)

    # Blockchain Audit Ledger (Off-chain DB projection of verifiable on-chain records)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_ledger (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        anonymous_user_hash TEXT NOT NULL,
        event_type TEXT NOT NULL,
        reference_code TEXT NOT NULL,
        data_hash TEXT NOT NULL,
        block_number INTEGER NOT NULL,
        tx_hash TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        network TEXT DEFAULT 'Demo Blockchain Network'
    )
    """)

    conn.commit()
    conn.close()

def hash_data(data: str) -> str:
    return hashlib.sha256(data.encode('utf-8')).hexdigest()

def make_tx_hash(reference: str, timestamp: int) -> str:
    h = hashlib.sha256(f"{reference}:{timestamp}:CIVIC_CHAIN_2026".encode('utf-8')).hexdigest()
    return f"0x{h[:64]}"
