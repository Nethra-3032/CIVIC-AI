import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ApplicationItem, ApplicationDiagnosis, RecoveryPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import { useVoiceAndAccessibility } from '../context/VoiceAndAccessibilityContext';
import { 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Check, 
  Download, 
  Mail, 
  FileText, 
  ShieldAlert, 
  ChevronRight, 
  ExternalLink,
  Layers,
  ArrowLeft,
  Send,
  MessageSquare
} from 'lucide-react';

interface RecoveryPageProps {
  applicationId: string;
  navigate: (path: string) => void;
}

export const RecoveryPage: React.FC<RecoveryPageProps> = ({ applicationId, navigate }) => {
  const { user } = useAuth();
  const { language } = useVoiceAndAccessibility();

  const [app, setApp] = useState<ApplicationItem | null>(null);
  const [diagnosis, setDiagnosis] = useState<ApplicationDiagnosis | null>(null);
  const [recoveryPlan, setRecoveryPlan] = useState<RecoveryPlan | null>(null);
  const [loading, setLoading] = useState(true);

  // Follow-up Generator State
  const [followUpLang, setFollowUpLang] = useState<'en' | 'ta'>('en');
  const [followUpData, setFollowUpData] = useState<any>(null);
  const [generatingFollowUp, setGeneratingFollowUp] = useState(false);
  const [copiedFollowUp, setCopiedFollowUp] = useState(false);

  // Grievance Generator State
  const [grievanceData, setGrievanceData] = useState<any>(null);
  const [generatingGrievance, setGeneratingGrievance] = useState(false);
  const [copiedGrievance, setCopiedGrievance] = useState(false);

  useEffect(() => {
    const runDiagnosis = async () => {
      setLoading(true);
      try {
        const appRes = await api.getApplicationDetail(applicationId);
        setApp(appRes);

        const diagRes = await api.diagnoseApplication(applicationId);
        setDiagnosis(diagRes.diagnosis);
        setRecoveryPlan(diagRes.recovery_plan);

        // Pre-generate follow-up
        const fu = await api.generateFollowUp(applicationId, 'College Nodal Officer', 'en');
        setFollowUpData(fu);
      } catch (e) {
        console.warn("Failed to diagnose", e);
      } finally {
        setLoading(false);
      }
    };
    runDiagnosis();
  }, [applicationId]);

  const handleSwitchFollowUpLang = async (lang: 'en' | 'ta') => {
    setFollowUpLang(lang);
    setGeneratingFollowUp(true);
    try {
      const fu = await api.generateFollowUp(applicationId, 'College Nodal Officer', lang);
      setFollowUpData(fu);
    } finally {
      setGeneratingFollowUp(false);
    }
  };

  const handleGenerateGrievance = async () => {
    setGeneratingGrievance(true);
    try {
      const grv = await api.generateGrievance(applicationId, 'District Collector & Welfare Officer');
      setGrievanceData(grv);
    } finally {
      setGeneratingGrievance(false);
    }
  };

  const handleCopyText = (text: string, isGrv: boolean = false) => {
    navigator.clipboard.writeText(text);
    if (isGrv) {
      setCopiedGrievance(true);
      setTimeout(() => setCopiedGrievance(false), 2000);
    } else {
      setCopiedFollowUp(true);
      setTimeout(() => setCopiedFollowUp(false), 2000);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !diagnosis) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-400 text-sm">
        Running AI Application Failure Diagnosis...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div>
        <button
          onClick={() => navigate('/applications')}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-400 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applications</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CIVIC RECOVER — COPILOT</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-1">AI Application Diagnosis & Recovery</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Application Ref: <span className="font-mono text-cyan-400">{applicationId}</span> • {app?.scheme_name}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Status Duration:</span>
            <span className="text-xs font-bold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-800">
              {diagnosis.status_duration}
            </span>
          </div>
        </div>
      </div>

      {/* 1. AI APPLICATION DIAGNOSIS CARD */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border-2 border-amber-500/50 shadow-2xl relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div className="lg:col-span-8 space-y-4">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
                PROBABLE BOTTLENECK DETECTED
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                {diagnosis.probable_bottleneck}
              </h2>
            </div>

            {/* Evidence Checklist */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-300">Evidence Derived from Application Data:</div>
              {diagnosis.evidence.map((ev, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start space-x-3 text-xs">
                  {ev.state === 'MATCHED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold text-white">{ev.label}:</span>{' '}
                    <span className="text-slate-300">{ev.detail}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/80 text-xs">
              <span className="font-bold text-amber-300 block mb-0.5">Recommended Next-Best Action:</span>
              <p className="text-slate-200">{diagnosis.recommended_action}</p>
            </div>
          </div>

          {/* Right Confidence Dial */}
          <div className="lg:col-span-4 p-5 rounded-2xl glass-card border border-amber-500/40 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">AI Confidence Level</span>
            <div className="text-4xl font-black text-amber-400 mt-2">{diagnosis.confidence}</div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Based on empirical portal timeline comparisons & e-attestation rules.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 italic">
              "Probable analysis based on available system rules. Final decision rests with the responsible authority."
            </div>
          </div>

        </div>
      </div>

      {/* 2. RECOVERY PLAN (STEP 1 - STEP 4) */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <span>Prescribed 4-Step Recovery Plan</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {recoveryPlan?.steps.map((st) => (
            <div key={st.step} className="glass-card p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-xs mb-2">
                  {st.step}
                </div>
                <h4 className="font-bold text-white text-sm">{st.title}</h4>
                <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">{st.desc}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-cyan-400">
                  {st.status || 'Active Step'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. AI FOLLOW-UP MESSAGE GENERATOR */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Mail className="w-5 h-5 text-cyan-400" />
              <span>Automated Institutional Follow-Up Drafter</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Generates an official, polite verification notice citing statutory circulars.
            </p>
          </div>

          {/* Bilingual Switcher */}
          <div className="flex items-center space-x-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <button
              onClick={() => handleSwitchFollowUpLang('en')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                followUpLang === 'en' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              English Notice
            </button>
            <button
              onClick={() => handleSwitchFollowUpLang('ta')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                followUpLang === 'ta' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              தமிழ் கடிதம்
            </button>
          </div>
        </div>

        {followUpData && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
              <span className="font-semibold text-slate-300">Subject: {followUpData.subject}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopyText(`${followUpData.subject}\n\n${followUpData.body}`)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-850 text-cyan-400 flex items-center space-x-1"
                >
                  {copiedFollowUp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFollowUp ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => handleDownload(`${followUpData.subject}\n\n${followUpData.body}`, `FollowUp_${applicationId}.txt`)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-850 text-cyan-400 flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .txt</span>
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={followUpData.body}
              rows={10}
              className="w-full bg-transparent font-mono text-xs text-slate-200 resize-none focus:outline-none leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* 4. ESCALATION ENGINE (3 TIERS) */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            <span>Official Bureaucracy Escalation Ladder</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured administrative recourse tiers strictly following published government citizen charters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded">
              Tier 1 • Institutional
            </span>
            <h4 className="font-bold text-white text-sm mt-2">College Nodal Officer</h4>
            <p className="text-slate-300 mt-1">Submit follow-up notice & verify portal enrollment queue.</p>
            <div className="mt-3 text-[11px] text-emerald-400 font-semibold">Current Recommended Action</div>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded">
              Tier 2 • District
            </span>
            <h4 className="font-bold text-white text-sm mt-2">District BC/MBC Welfare Officer</h4>
            <p className="text-slate-300 mt-1">Collectorate Public Grievance Day (Every Monday at Taluk/District HQ).</p>
            <div className="mt-3 text-[11px] text-slate-400">Unlocks if pending after 5 days</div>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded">
              Tier 3 • State Apex
            </span>
            <h4 className="font-bold text-white text-sm mt-2">Tamil Nadu CM Helpline 1100</h4>
            <p className="text-slate-300 mt-1">State Secretariat CM Cell grievance petition with blockchain audit proof.</p>
            <div className="mt-3">
              <button
                onClick={handleGenerateGrievance}
                className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1"
              >
                <span>Generate CM Cell Draft</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Grievance Petition Output Modal/Panel */}
        {grievanceData && (
          <div className="mt-4 p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-900/60">
              <span className="font-bold text-indigo-300">Formal Grievance Petition: {grievanceData.subject}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopyText(grievanceData.petition, true)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-850 text-indigo-300 flex items-center space-x-1"
                >
                  {copiedGrievance ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedGrievance ? 'Copied' : 'Copy Petition'}</span>
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={grievanceData.petition}
              rows={8}
              className="w-full bg-transparent font-mono text-xs text-slate-200 resize-none focus:outline-none"
            />
          </div>
        )}
      </div>

    </div>
  );
};
