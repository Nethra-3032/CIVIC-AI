import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ApplicationItem } from '../types';
import { useVoiceAndAccessibility } from '../context/VoiceAndAccessibilityContext';
import { BureaucracyGPS } from '../components/BureaucracyGPS';
import { BlockchainBadge } from '../components/BlockchainBadge';
import { ArrowLeft, Sparkles, AlertTriangle, ShieldCheck, FileText, ChevronRight } from 'lucide-react';

interface ApplicationDetailPageProps {
  applicationId: string;
  navigate: (path: string) => void;
}

export const ApplicationDetailPage: React.FC<ApplicationDetailPageProps> = ({ applicationId, navigate }) => {
  const { language } = useVoiceAndAccessibility();
  const [app, setApp] = useState<ApplicationItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      setLoading(true);
      try {
        const data = await api.getApplicationDetail(applicationId);
        setApp(data);
      } catch (e) {
        console.warn("Failed to load application detail", e);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [applicationId]);

  if (loading || !app) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-400 text-sm">
        Loading Application Journey GPS...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back button */}
      <button
        onClick={() => navigate('/applications')}
        className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-400"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Applications</span>
      </button>

      {/* Bureaucracy GPS Interactive Visualizer */}
      <BureaucracyGPS
        applicationId={app.id}
        schemeName={app.scheme_name}
        stages={app.stages}
        diagnosis={app.diagnosis}
        onOpenRecovery={() => navigate(`/recovery/${app.id}`)}
        language={language}
      />

      {/* Meta Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 text-xs space-y-2">
          <h4 className="font-bold text-white text-sm">Application Metadata</h4>
          <div className="flex justify-between text-slate-400">
            <span>Reference ID:</span>
            <span className="font-mono text-cyan-400 font-bold">{app.id}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Submission Date:</span>
            <span className="text-white">{new Date(app.submitted_at * 1000).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Readiness Score at Submission:</span>
            <span className="text-emerald-400 font-bold">{app.readiness_score}%</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 text-xs space-y-2">
          <h4 className="font-bold text-white text-sm">On-Chain Audit Verification</h4>
          <p className="text-slate-400 text-[11px]">
            Every status transition is signed and stored as a cryptographic SHA-256 state proof on the development audit ledger.
          </p>
          <div className="pt-2">
            <BlockchainBadge 
              txHash={app.blockchain_tx}
              referenceCode={app.id}
              eventType="APPLICATION_STATUS_CHANGED"
            />
          </div>
        </div>

      </div>

    </div>
  );
};
