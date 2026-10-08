import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVoiceAndAccessibility } from '../context/VoiceAndAccessibilityContext';
import { api } from '../services/api';
import { BenefitScheme, ApplicationItem, NotificationItem } from '../types';
import { BenefitRadarVisual } from '../components/BenefitRadarVisual';
import { 
  Sparkles, 
  Compass, 
  FileText, 
  AlertTriangle, 
  Calendar, 
  FileCheck, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Zap,
  TrendingUp,
  Upload
} from 'lucide-react';

interface DashboardPageProps {
  navigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const { user, profile } = useAuth();
  const { language } = useVoiceAndAccessibility();

  const [schemes, setSchemes] = useState<BenefitScheme[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sc, apps, notifs] = await Promise.all([
          api.getBenefits(),
          api.getApplications(),
          api.getNotifications()
        ]);
        setSchemes(sc);
        setApplications(apps);
        setNotifications(notifs);
      } catch (e) {
        console.warn("Error fetching dashboard data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const oppScore = profile?.opportunity_score || 73;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. TOP GREETING & BENEFIT OPPORTUNITY SCORE HERO CARD */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/20 relative overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Greeting & Context */}
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 text-xs font-semibold border border-cyan-800">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'ta' ? 'அங்கீகரிக்கப்பட்ட குடிமக்கள் போர்டல்' : 'Verified Citizen Entitlement Portal'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {language === 'ta' ? `வணக்கம், ${user?.name || 'பிரியா'}` : `Good morning, ${user?.name || 'Priya Kumar'}`}
            </h1>

            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              {language === 'ta' 
                ? 'உங்கள் சுயவிவரத்தின்படி 4 அரசு உதவித்தொகை திட்டங்கள் கண்டறியப்பட்டுள்ளன. 1 விண்ணப்பத்தில் உடனடி நடவடிக்கை தேவைப்படுகிறது.'
                : 'You may be missing 4 potentially relevant welfare schemes. 1 scholarship application requires nodal officer follow-up.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/benefits')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center space-x-1.5 transition-all"
              >
                <span>{language === 'ta' ? 'அனைத்து பயன்களையும் காண்க' : 'Explore Entitled Schemes'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/documents')}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center space-x-1.5 transition-all"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>{language === 'ta' ? 'ஆவணங்களைப் புதுப்பிக்க' : 'Upload Income Certificate'}</span>
              </button>
            </div>
          </div>

          {/* Right Circular Animated Opportunity Score Gauge */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 glass-card rounded-2xl border border-slate-700/80">
            <div className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-2">
              {language === 'ta' ? 'பயன் வாய்ப்பு மதிப்பெண்' : 'Benefit Opportunity Score'}
            </div>

            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeDasharray={377}
                  strokeDashoffset={377 - (377 * oppScore) / 100}
                  className="text-cyan-400 transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{oppScore}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">out of 100</span>
              </div>
            </div>

            <div className="mt-2 text-center text-xs">
              <span className="text-emerald-400 font-semibold flex items-center justify-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>+8 pts upon Income renewal</span>
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. PRIORITY RECOVERY BOTTLENECK ALERT BANNER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border border-amber-500/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center flex-shrink-0 animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Action Required • 22 Days Delayed
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Application: CIVIC-2026-000128
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mt-0.5">
              Tamil Nadu Post-Matric Scholarship is awaiting Institution Verification
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              AI Failure Detector identified that your college scholarship desk has not e-signed your application for 22 days.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/recovery/CIVIC-2026-000128')}
          className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-500/20 transition-all flex-shrink-0"
        >
          <span>Open Recovery Copilot</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. SIX SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        <div 
          onClick={() => navigate('/benefits')}
          className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-2">
            <Compass className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">4</div>
          <div className="text-xs font-semibold text-slate-300 mt-0.5">Potential Benefits</div>
          <div className="text-[10px] text-emerald-400 mt-1">High eligibility match</div>
        </div>

        <div 
          onClick={() => navigate('/applications')}
          className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-sky-500/40 cursor-pointer transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center mb-2">
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{applications.length || 2}</div>
          <div className="text-xs font-semibold text-slate-300 mt-0.5">Applications</div>
          <div className="text-[10px] text-cyan-400 mt-1">1 Approved, 1 Pending</div>
        </div>

        <div 
          onClick={() => navigate('/recovery/CIVIC-2026-000128')}
          className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center mb-2">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-400">2</div>
          <div className="text-xs font-semibold text-slate-300 mt-0.5">Action Required</div>
          <div className="text-[10px] text-amber-300/80 mt-1">Nodal Officer & Income cert</div>
        </div>

        <div 
          onClick={() => navigate('/notifications')}
          className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-violet-500/40 cursor-pointer transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center mb-2">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">1</div>
          <div className="text-xs font-semibold text-slate-300 mt-0.5">Deadlines</div>
          <div className="text-[10px] text-violet-300 mt-1">Post-Matric Nov 15</div>
        </div>

        <div 
          onClick={() => navigate('/documents')}
          className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-2">
            <FileCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">5/6</div>
          <div className="text-xs font-semibold text-slate-300 mt-0.5">Documents</div>
          <div className="text-[10px] text-emerald-400 mt-1">82% Readiness</div>
        </div>

        <div 
          onClick={() => navigate('/security')}
          className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-2">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">12</div>
          <div className="text-xs font-semibold text-slate-300 mt-0.5">Blockchain Records</div>
          <div className="text-[10px] text-cyan-300 mt-1">Verifiable Hashes</div>
        </div>

      </div>

      {/* 4. SIGNATURE BENEFIT RADAR VISUAL */}
      <BenefitRadarVisual 
        schemes={schemes} 
        onSelectScheme={(id) => navigate(`/benefits/${id}`)}
        language={language}
      />

    </div>
  );
};
