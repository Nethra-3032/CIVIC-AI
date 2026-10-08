import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AdminAnalytics } from '../types';
import { useAuth } from '../context/AuthContext';
import { useVoiceAndAccessibility } from '../context/VoiceAndAccessibilityContext';
import { 
  Users, 
  FileText, 
  Compass, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles, 
  ShieldAlert, 
  BarChart3, 
  PieChart as PieIcon, 
  MapPin, 
  ShieldCheck 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';

interface AdminDashboardPageProps {
  navigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const { language } = useVoiceAndAccessibility();

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [aData, iData] = await Promise.all([
          api.getAdminAnalytics(),
          api.getAdminInsights()
        ]);
        setAnalytics(aData);
        setInsights(iData);
      } catch (e) {
        console.warn("Error fetching admin analytics", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center text-slate-400 text-sm">
        Loading Government Intelligence Dashboard...
      </div>
    );
  }

  const { kpis, discovery_trends, status_distribution, missing_docs, bottlenecks, regional_gap_map } = analytics;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>CIVIC GOV — ANONYMIZED INTELLIGENCE</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Welfare Delivery & Bottleneck Observatory</h1>
          <p className="text-sm text-slate-400 mt-1">
            Aggregated institutional metrics with strict zero-PII anonymization.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>DPDP Privacy Anonymized Engine Active</span>
        </div>
      </div>

      {/* 1. TOP KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-2">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{kpis.total_citizens.toLocaleString()}</div>
          <div className="text-xs font-semibold text-slate-300 mt-0.5">Demo Citizens</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center mb-2">
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{kpis.total_applications.toLocaleString()}</div>
          <div className="text-xs font-semibold text-slate-300 mt-0.5">Applications</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-2">
            <Compass className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{kpis.potential_benefits_matched.toLocaleString()}</div>
          <div className="text-xs font-semibold text-slate-300 mt-0.5">Benefits Matched</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-400">{kpis.pending_applications}</div>
          <div className="text-xs font-semibold text-slate-300 mt-0.5">Pending Cases</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{kpis.avg_processing_days}d</div>
          <div className="text-xs font-semibold text-slate-300 mt-0.5">Avg Turnaround</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center mb-2">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{kpis.blockchain_verified_audits.toLocaleString()}</div>
          <div className="text-xs font-semibold text-slate-300 mt-0.5">Audit Hashes</div>
        </div>
      </div>

      {/* 2. RECHARTS VISUAL ANALYTICS: TREND & STATUS DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monthly Trend Area Chart */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 border border-slate-700/80 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-white text-base">Benefit Discovery vs Application Conversion</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly trajectory of proactive matches vs completed submissions</p>
            </div>
            <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-900">
              Real-time trend
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={discovery_trends}>
                <defs>
                  <linearGradient id="colorDisc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="discoveries" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorDisc)" name="Discoveries" />
                <Area type="monotone" dataKey="applications" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorApp)" name="Applications" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 border border-slate-700/80 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-white text-base">Application Stage Status</h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribution across pipeline stages</p>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={status_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {status_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-[11px]">
            {status_distribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="truncate max-w-[140px]">{item.name}</span>
                </div>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. COMMON BOTTLENECKS & MISSING DOCUMENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Bottleneck stages */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-base">Institutional Bottleneck Desks</h3>
            <span className="text-xs text-amber-400 font-bold">Avg Delays</span>
          </div>

          <div className="space-y-3 text-xs">
            {bottlenecks.map((b, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{b.stage}</h4>
                  <span className="text-[11px] text-slate-400">{b.affected_apps} active applications delayed</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-amber-400">{b.avg_delay_days}d</span>
                  <span className="text-[10px] text-slate-500 block">exceeds TAT</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Documents Breakdown */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-base">Primary Missing Documents</h3>
            <span className="text-xs text-slate-400 font-semibold">% Rejection Factor</span>
          </div>

          <div className="space-y-3 text-xs">
            {missing_docs.map((doc, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-slate-300 font-medium">
                  <span>{doc.document}</span>
                  <span className="font-bold text-cyan-400">{doc.percentage}% ({doc.count})</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-gradient-to-r from-cyan-500 to-sky-500 h-full rounded-full" style={{ width: `${doc.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. BENEFIT GAP MAP (TAMIL NADU REGIONAL DISTRIBUTION) */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <span>Benefit Gap Map (District Distribution)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Anonymized regional intelligence identifying welfare take-up disparities and friction points.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          {regional_gap_map.map((item, idx) => (
            <div key={idx} className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-sm">{item.district}</span>
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-900 font-bold text-[10px]">
                  Delay Rate: {item.delay_rate}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Unclaimed Benefit Pool:</span>
                <span className="font-bold text-cyan-400">{item.unclaimed_benefits.toLocaleString()} citizens</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px]">
                <span className="text-slate-500 block">Primary Friction Desk:</span>
                <span className="font-semibold text-slate-300">{item.primary_issue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. AI POLICY INSIGHTS */}
      {insights && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-indigo-500/30 space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Automated AI Policy Recommendations</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {insights.ai_policy_insights?.map((ins: any, idx: number) => (
              <div key={idx} className="glass-card p-4 rounded-2xl border border-indigo-900/60 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Severity: {ins.severity}
                </span>
                <h4 className="font-bold text-white text-sm">{ins.title}</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">{ins.impact}</p>
                <div className="pt-2 border-t border-slate-800 text-indigo-200 text-[11px]">
                  <strong>Action:</strong> {ins.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
