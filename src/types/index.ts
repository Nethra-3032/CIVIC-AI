export type Language = 'en' | 'ta';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'CITIZEN' | 'ADMIN';
}

export interface Profile {
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  age: number;
  dob?: string;
  state: string;
  district: string;
  education: string;
  employment: string;
  income: number;
  category: string;
  masked_aadhaar?: string;
  bank_verified?: number;
  opportunity_score: number;
  applications_count: number;
  documents_count: number;
  verified_docs: number;
  unread_notifs: number;
}

export interface BenefitScheme {
  id: string;
  name: string;
  name_ta: string;
  category: string;
  description: string;
  description_ta: string;
  benefit_summary: string;
  benefit_summary_ta: string;
  deadline?: string;
  official_source?: string;
  last_updated?: string;
  match_score?: number;
  reasons_matched?: Array<{ rule: string; text: string }>;
  reasons_unmatched?: Array<{ rule: string; text: string }>;
  missing_docs?: string[];
  application_status?: string | null;
  criteria?: {
    min_age?: number;
    max_age?: number;
    education_levels?: string[] | string;
    max_income?: number;
    states?: string[] | string;
    categories?: string[] | string;
    gender?: string;
    condition?: string;
  };
  documents?: Array<{ type: string; name: string; mandatory: boolean }>;
  workflow?: Array<{ step: number; title: string; tat_days?: number; note?: string }>;
  escalation?: Array<{ level: number; authority: string; action: string }>;
}

export interface ApplicationStage {
  stage: string;
  status: 'COMPLETED' | 'ACTIVE_PROCESSING' | 'ACTIVE_DELAYED' | 'ACTIVE_HEALTHY' | 'PENDING';
  date: string;
  actor: string;
  days_delayed?: number;
}

export interface ApplicationDiagnosis {
  application_id: string;
  probable_bottleneck: string;
  confidence: string;
  status_duration: string;
  evidence: Array<{ label: string; state: string; detail: string }>;
  recommended_action: string;
  disclaimer?: string;
}

export interface RecoveryPlan {
  steps: Array<{ step: number; title: string; desc: string; status?: string }>;
}

export interface ApplicationItem {
  id: string;
  scheme_id: string;
  scheme_name: string;
  status: 'PENDING' | 'UNDER_VERIFICATION' | 'APPROVED' | 'REJECTED';
  stage: string;
  readiness_score: number;
  submitted_at: number;
  updated_at: number;
  stages: ApplicationStage[];
  diagnosis?: ApplicationDiagnosis;
  recovery_plan?: RecoveryPlan;
  blockchain_tx?: string;
  scheme?: BenefitScheme;
}

export interface DocumentItem {
  id: string;
  user_id: string;
  doc_type: string;
  name: string;
  status: 'VERIFIED' | 'PENDING' | 'ATTENTION_REQUIRED' | 'EXPIRED';
  extracted_data?: Record<string, any>;
  doc_hash: string;
  expiry_date?: string;
  created_at: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  title_ta: string;
  message: string;
  message_ta: string;
  category: 'DEADLINE' | 'BOTTLENECK' | 'DOCUMENT' | 'SYSTEM';
  is_read: number;
  action_url?: string;
  created_at: number;
}

export interface AuditRecord {
  id: number;
  anonymous_user_hash: string;
  event_type: string;
  reference_code: string;
  data_hash: string;
  block_number: number;
  tx_hash: string;
  timestamp: number;
  network: string;
}

export interface AdminAnalytics {
  kpis: {
    total_citizens: number;
    total_applications: number;
    potential_benefits_matched: number;
    pending_applications: number;
    avg_processing_days: number;
    unresolved_bottlenecks: number;
    blockchain_verified_audits: number;
  };
  discovery_trends: Array<{ month: string; discoveries: number; applications: number; approvals: number }>;
  status_distribution: Array<{ name: string; value: number; color: string }>;
  missing_docs: Array<{ document: string; count: number; percentage: number }>;
  bottlenecks: Array<{ stage: string; avg_delay_days: number; affected_apps: number }>;
  regional_gap_map: Array<{ district: string; unclaimed_benefits: number; delay_rate: string; primary_issue: string }>;
}
