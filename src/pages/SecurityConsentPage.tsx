import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuditRecord } from '../types';
import { BlockchainBadge } from '../components/BlockchainBadge';
import { 
  ShieldCheck, 
  Lock, 
  Download, 
  Trash2, 
  Check, 
  Layers, 
  Hash, 
  CheckCircle2, 
  ExternalLink,
  Info
} from 'lucide-react';

interface SecurityConsentPageProps {
  navigate: (path: string) => void;
}

export const SecurityConsentPage: React.FC<SecurityConsentPageProps> = ({ navigate }) => {
  const [consents, setConsents] = useState<Record<string, boolean>>({
    consent_profile: true,
    consent_documents: true,
    consent_matching: true,
    consent_diagnosis: true,
    consent_blockchain: true
  });
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedConsent, setSavedConsent] = useState(false);
  const [deletionRequested, setDeletionRequested] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cRes, aRes] = await Promise.all([
          api.getConsent(),
          api.getAuditLedger()
        ]);
        if (cRes) {
          setConsents({
            consent_profile: Boolean(cRes.consent_profile),
            consent_documents: Boolean(cRes.consent_documents),
            consent_matching: Boolean(cRes.consent_matching),
            consent_diagnosis: Boolean(cRes.consent_diagnosis),
            consent_blockchain: Boolean(cRes.consent_blockchain),
          });
        }
        setAuditRecords(aRes.records || []);
      } catch (e) {
        console.warn("Failed to load security data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleConsent = async (key: string) => {
    const updated = { ...consents, [key]: !consents[key] };
    setConsents(updated);
    try {
      await api.updateConsent(updated);
      setSavedConsent(true);
      setTimeout(() => setSavedConsent(false), 2000);
    } catch (e) {
      console.warn("Failed to update consent", e);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CIVIC_AI_Citizen_Archive_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Failed to export citizen data");
    }
  };

  const handleRequestDeletion = async () => {
    if (confirm("Are you sure you want to request data deletion? Your records will be queued for expungement under DPDP Act 2023.")) {
      const res = await api.requestDataDeletion();
      setDeletionRequested(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>CIVIC TRUST & DPDP 2023</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Your Data. Your Control.</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Full sovereign citizen control: granular processing permissions, zero PII on-chain guarantees, and verifiable tamper-evident audit logs.
        </p>
      </div>

      {/* 1. DATA PRIVACY & GRANULAR CONSENT MANAGEMENT */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Lock className="w-5 h-5 text-cyan-400" />
              <span>Granular Citizen Consent Matrix</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Toggle optional processing at any time.</p>
          </div>
          {savedConsent && (
            <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Saved & Hashed to Chain</span>
            </span>
          )}
        </div>

        <div className="space-y-3 text-xs">
          {[
            { key: 'consent_profile', label: 'Store citizen profile in AES-256 encrypted database', desc: 'Allows saving education, age, and household income parameters for fast re-applications.' },
            { key: 'consent_documents', label: 'Process uploaded certificates & perform OCR text analysis', desc: 'Allows AI text extraction to verify certificates and validate government QR seals.' },
            { key: 'consent_matching', label: 'Use profile parameters for proactive benefit matching', desc: 'Permits algorithmic scanning of published government rules against your income and district.' },
            { key: 'consent_diagnosis', label: 'Use application timeline info for AI bottleneck diagnosis', desc: 'Enables analysis of delay durations against normative citizen charters to recommend actions.' },
            { key: 'consent_blockchain', label: 'Anchor anonymous audit hashes onto Demo Blockchain Network', desc: 'Generates irreversible tamper-evident cryptographic proofs to verify procedural transparency.' },
          ].map((item) => (
            <div key={item.key} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <span className="font-bold text-white block text-sm">{item.label}</span>
                <span className="text-slate-400 text-xs block leading-relaxed">{item.desc}</span>
              </div>
              <input
                type="checkbox"
                checked={consents[item.key]}
                onChange={() => handleToggleConsent(item.key)}
                className="w-5 h-5 mt-1 rounded text-cyan-600 focus:ring-0 cursor-pointer accent-cyan-500 flex-shrink-0"
              />
            </div>
          ))}
        </div>

        {/* Data Portability & Right to Erasure */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportData}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold flex items-center space-x-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export My Data (JSON)</span>
            </button>
            <button
              onClick={handleRequestDeletion}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-800 text-red-400 font-bold flex items-center space-x-2 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Request Data Deletion</span>
            </button>
          </div>

          {deletionRequested && (
            <span className="text-amber-300 font-semibold text-xs">
              Deletion scheduled with 14-day statutory grace period.
            </span>
          )}
        </div>
      </div>

      {/* 2. BLOCKCHAIN AUDIT LEDGER TABLE */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>CivicAuditLedger — Immutable On-Chain Records</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified transactions on Demo Blockchain Network (Zero raw PII on-chain).
            </p>
          </div>
          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
            Smart Contract: CivicAuditLedger.sol
          </span>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-3 px-3">Block</th>
                <th className="py-3 px-3">Event Type</th>
                <th className="py-3 px-3">Reference Code</th>
                <th className="py-3 px-3">Cryptographic SHA-256 Hash</th>
                <th className="py-3 px-3">Transaction ID</th>
                <th className="py-3 px-3 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {auditRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-3 font-mono text-cyan-400 font-bold">#{rec.block_number}</td>
                  <td className="py-3 px-3 font-bold text-white text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {rec.event_type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300 text-[11px]">{rec.reference_code}</td>
                  <td className="py-3 px-3 font-mono text-slate-400 text-[10px]">
                    {rec.data_hash.substring(0, 16)}...
                  </td>
                  <td className="py-3 px-3 font-mono text-emerald-400 text-[10px]">
                    {rec.tx_hash.substring(0, 14)}...
                  </td>
                  <td className="py-3 px-3 text-right">
                    <BlockchainBadge 
                      txHash={rec.tx_hash}
                      referenceCode={rec.reference_code}
                      eventType={rec.event_type}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-2 text-[11px] text-slate-500 flex items-center space-x-1">
          <Info className="w-3.5 h-3.5" />
          <span>
            Every record is anchored to the development ledger and can be independently verified using Merkle hash proofs.
          </span>
        </div>

      </div>

    </div>
  );
};
