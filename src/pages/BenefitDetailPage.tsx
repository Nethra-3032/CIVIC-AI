import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BenefitScheme } from '../types';
import { useAuth } from '../context/AuthContext';
import { useVoiceAndAccessibility } from '../context/VoiceAndAccessibilityContext';
import { BlockchainBadge } from '../components/BlockchainBadge';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  ExternalLink, 
  FileCheck, 
  ArrowRight,
  Info,
  Check,
  Send,
  Layers
} from 'lucide-react';

interface BenefitDetailPageProps {
  benefitId: string;
  navigate: (path: string) => void;
}

export const BenefitDetailPage: React.FC<BenefitDetailPageProps> = ({ benefitId, navigate }) => {
  const { user } = useAuth();
  const { language } = useVoiceAndAccessibility();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCopilot, setShowCopilot] = useState(false);
  const [copilotStep, setCopilotStep] = useState(1);
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<any>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await api.getBenefitDetail(benefitId);
        setData(res);
      } catch (e) {
        console.warn("Failed to load scheme detail", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [benefitId]);

  if (loading || !data) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-400 text-sm">
        Loading scheme eligibility and documents...
      </div>
    );
  }

  const { scheme, match_score, readiness_score, missing_docs, ai_explanation, application } = data;

  const handleCopilotSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.submitApplication(scheme.id, consentChecked);
      setSubmittedApp(res);
      setCopilotStep(4); // Success step
    } catch (e: any) {
      alert(e.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back button */}
      <button
        onClick={() => navigate('/benefits')}
        className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Benefit Radar</span>
      </button>

      {/* Hero Scheme Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800">
                {scheme.category}
              </span>
              <span className="text-xs text-slate-400">Official Department Scheme</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              {language === 'ta' && scheme.name_ta ? scheme.name_ta : scheme.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {language === 'ta' && scheme.description_ta ? scheme.description_ta : scheme.description}
            </p>
          </div>

          {/* Match Score Badge */}
          <div className="p-4 rounded-2xl glass-card border border-cyan-500/30 flex flex-col items-center justify-center min-w-[130px]">
            <span className="text-[10px] uppercase font-bold text-slate-400">Eligibility Match</span>
            <span className="text-3xl font-black text-cyan-400 mt-0.5">{match_score}%</span>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1">Potentially Eligible</span>
          </div>
        </div>

        {/* Benefit Summary Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400 block font-semibold text-[11px]">BENEFIT ENTITLEMENT:</span>
            <span className="text-emerald-400 font-bold text-sm">
              {language === 'ta' && scheme.benefit_summary_ta ? scheme.benefit_summary_ta : scheme.benefit_summary}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-slate-400">Deadline: {scheme.deadline || 'Ongoing'}</span>
            {scheme.official_source && (
              <a 
                href={scheme.official_source} 
                target="_blank" 
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-semibold"
              >
                <span>Portal Source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ELIGIBILITY EXPLAINER BREAKDOWN (Green / Yellow / Red Indicators) */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-700/80 space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Eligibility Criteria Explainer</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-300">Age Requirement</div>
              <div className="text-[11px] text-slate-500">Criteria: {scheme.criteria?.min_age || 17} - {scheme.criteria?.max_age || 30} Years</div>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Matched (Age 19)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-300">Education Level</div>
              <div className="text-[11px] text-slate-500">Degree: College Student (UG)</div>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Matched</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-300">Annual Household Income</div>
              <div className="text-[11px] text-slate-500">Ceiling: ₹2,50,000 / year</div>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Matched (₹1.8L)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-300">State of Residence</div>
              <div className="text-[11px] text-slate-500">Tamil Nadu Resident</div>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Matched</span>
            </div>
          </div>

        </div>

        {/* AI Explainer Box */}
        <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/80 text-xs">
          <div className="font-bold text-cyan-300 mb-1 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Why this recommendation?</span>
          </div>
          <p className="text-slate-300 leading-relaxed">{ai_explanation}</p>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center space-x-1">
            <Info className="w-3 h-3" />
            <span>Official eligibility must be confirmed by the responsible department authority.</span>
          </div>
        </div>
      </div>

      {/* REQUIRED DOCUMENTS CHECKLIST */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-700/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Document Checklist</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
            Readiness: {readiness_score}%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {scheme.documents?.map((doc: any, i: number) => {
            const isMissing = missing_docs?.includes(doc.name);
            return (
              <div
                key={i}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  isMissing 
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-200' 
                    : 'bg-slate-900/90 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  {isMissing ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  )}
                  <span>{doc.name}</span>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-950">
                  {isMissing ? 'Action Needed' : 'Uploaded'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ACTION TRIGGER BUTTONS */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        {application ? (
          <button
            onClick={() => navigate(`/applications/${application.id}`)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Already Applied — View GPS Tracker ({application.id})</span>
          </button>
        ) : (
          <button
            onClick={() => setShowCopilot(true)}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-xl shadow-cyan-500/25 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Prepare Application with AI Copilot</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* APPLICATION COPILOT PRE-SUBMISSION MODAL */}
      {showCopilot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-cyan-500/40 p-6 sm:p-8 shadow-2xl relative">
            
            {/* Copilot Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-cyan-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-white">CIVIC AI Application Copilot</h3>
              <p className="text-xs text-slate-400 mt-1">Pre-Submission Validation & Blockchain Audit Registration</p>
            </div>

            {/* Step 1: Pre-Submission Risk Check */}
            {copilotStep === 1 && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-slate-200 mb-1">Pre-Submission Risk Analysis:</div>
                  <div className="flex items-center space-x-2 text-amber-300 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Risk Level: <strong>MEDIUM (Tahsildar Income Certificate expires in 28 days)</strong></span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    CIVIC AI recommends uploading your renewed income certificate within 30 days to prevent scholarship disbursement holdups.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-200">Verified Profile Summary:</div>
                  <div className="text-[11px] text-slate-400">Citizen: {user?.name}</div>
                  <div className="text-[11px] text-slate-400">Category: BC/MBC • College Student</div>
                  <div className="text-[11px] text-slate-400">Aadhaar Mapping: XXXX XXXX 4821 (NPCI Validated)</div>
                </div>

                <button
                  onClick={() => setCopilotStep(2)}
                  className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                >
                  Continue to Citizen Consent
                </button>
              </div>
            )}

            {/* Step 2: Citizen Explicit Consent */}
            {copilotStep === 2 && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="font-bold text-slate-200">Mandatory Data Consent (DPDP 2023):</div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    By submitting this application, you authorize CIVIC AI to verify your eligibility against state databases and generate an immutable cryptographic hash on the Demo Blockchain Network. Raw Aadhaar is never written on-chain.
                  </p>
                  <label className="flex items-start space-x-2.5 pt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-cyan-600 focus:ring-0"
                    />
                    <span className="text-slate-200 text-xs font-semibold">
                      I give explicit consent to prepare this application and record an audit proof.
                    </span>
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCopilotStep(1)}
                    className="w-1/3 py-2.5 rounded-xl bg-slate-900 text-slate-300 font-semibold text-xs"
                  >
                    Back
                  </button>
                  <button
                    disabled={!consentChecked || submitting}
                    onClick={handleCopilotSubmit}
                    className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-cyan-500/20"
                  >
                    <span>{submitting ? 'Submitting & Hashing...' : 'Submit Official Application'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Submission Confirmation & Blockchain Proof */}
            {copilotStep === 4 && submittedApp && (
              <div className="space-y-4 text-xs text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">Application Successfully Submitted!</h4>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-left font-mono">
                  <div className="text-slate-400 text-[11px]">APPLICATION ID:</div>
                  <div className="text-cyan-400 font-bold text-sm">{submittedApp.id}</div>
                  <div className="mt-2 text-slate-400 text-[11px]">BLOCKCHAIN TX HASH:</div>
                  <div className="text-emerald-400 text-[10px] break-all">{submittedApp.blockchain_tx}</div>
                </div>

                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setShowCopilot(false);
                      navigate(`/applications/${submittedApp.id}`);
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5"
                  >
                    <span>Open Live GPS Tracking</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowCopilot(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
