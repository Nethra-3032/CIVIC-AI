import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ApplicationItem } from '../types';
import { useVoiceAndAccessibility } from '../context/VoiceAndAccessibilityContext';
import { BlockchainBadge } from '../components/BlockchainBadge';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  ExternalLink,
  ShieldCheck,
  Sparkles,
  MapPin
} from 'lucide-react';

interface ApplicationsPageProps {
  navigate: (path: string) => void;
}

export const ApplicationsPage: React.FC<ApplicationsPageProps> = ({ navigate }) => {
  const { language } = useVoiceAndAccessibility();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true);
      try {
        const data = await api.getApplications();
        setApplications(data);
      } catch (e) {
        console.warn("Failed to load applications", e);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-bold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>CIVIC APPLY — TRACKING</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Application Journey Tracker</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time stage transparency with Digital Bureaucracy GPS & bottleneck diagnosis.
          </p>
        </div>

        <button
          onClick={() => navigate('/benefits')}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-600/20"
        >
          <span>Apply for New Benefit</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.map((app) => {
          const isPendingDelayed = app.status === 'PENDING' && app.stage.includes('Institution');
          const isApproved = app.status === 'APPROVED';

          return (
            <div
              key={app.id}
              className={`glass-panel rounded-2xl p-6 border transition-all ${
                isPendingDelayed 
                  ? 'border-amber-500/50 bg-amber-950/10 shadow-xl shadow-amber-500/5' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left info */}
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
                      {app.id}
                    </span>

                    {isApproved && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>APPROVED & ACTIVE</span>
                      </span>
                    )}

                    {isPendingDelayed && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-xs font-bold animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>DELAYED (22 Days at Desk)</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-extrabold text-white mt-1">{app.scheme_name}</h3>
                  
                  <div className="flex items-center space-x-4 text-xs text-slate-400 pt-1">
                    <span>Current Stage: <strong className="text-white">{app.stage}</strong></span>
                    <span>•</span>
                    <span>Submitted: {new Date(app.submitted_at * 1000).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {isPendingDelayed && (
                    <button
                      onClick={() => navigate(`/recovery/${app.id}`)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Diagnose Bottleneck & Recover</span>
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/applications/${app.id}`)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center space-x-1.5"
                  >
                    <span>Open GPS Timeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <BlockchainBadge 
                    txHash={app.blockchain_tx}
                    referenceCode={app.id}
                    eventType="APPLICATION_CREATED"
                  />
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
