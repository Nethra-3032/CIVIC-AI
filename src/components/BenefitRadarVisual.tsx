import React from 'react';
import { BenefitScheme } from '../types';
import { Compass, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface BenefitRadarVisualProps {
  schemes: BenefitScheme[];
  onSelectScheme: (id: string) => void;
  language: 'en' | 'ta';
}

export const BenefitRadarVisual: React.FC<BenefitRadarVisualProps> = ({ schemes, onSelectScheme, language }) => {
  const topSchemes = schemes.slice(0, 4);

  return (
    <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 relative overflow-hidden">
      {/* Background radial radar sweep animation */}
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full border border-cyan-500/10 pointer-events-none"></div>
      <div className="absolute -right-10 -top-10 w-60 h-60 rounded-full border border-cyan-500/20 pointer-events-none"></div>
      <div className="absolute right-0 top-0 w-40 h-40 rounded-full border border-cyan-500/30 pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        
        {/* Left: Summary Title & Opportunity Score Indicator */}
        <div className="max-w-md">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold mb-3">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span>{language === 'ta' ? 'செயலில் உள்ள பயன்கள் ரேடார்' : 'Active Benefit Radar'}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {language === 'ta' ? 'உங்களுக்கான உயர் வாய்ப்புத் திட்டங்கள்' : 'High-Probability Entitlement Matches'}
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {language === 'ta' 
              ? 'உங்கள் கல்வி, குடும்ப வருமானம் மற்றும் மாவட்ட விவரங்களின் அடிப்படையில் AI கண்டறிந்த திட்டங்கள்.'
              : 'CIVIC AI analyzed published government scheme criteria against your profile to detect entitlements you may be missing.'}
          </p>
        </div>

        {/* Right: Radar Scheme Orbit Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 max-w-2xl">
          {topSchemes.map((s, idx) => {
            const score = s.match_score || 85;
            const isTop = idx === 0;

            return (
              <div
                key={s.id}
                onClick={() => onSelectScheme(s.id)}
                className={`glass-card p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                  isTop 
                    ? 'border-cyan-500/50 bg-cyan-950/20 hover:border-cyan-400 shadow-lg shadow-cyan-500/10' 
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-850/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-900">
                      {s.category}
                    </span>
                    <h3 className="font-bold text-slate-100 text-sm mt-2 line-clamp-1 group-hover:text-cyan-300">
                      {language === 'ta' && s.name_ta ? s.name_ta : s.name}
                    </h3>
                  </div>
                  
                  {/* Circular Match Gauge */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-12 h-12 transform -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          className="text-slate-800"
                          fill="transparent"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeDasharray={125.6}
                          strokeDashoffset={125.6 - (125.6 * score) / 100}
                          className={score >= 90 ? 'text-emerald-400' : 'text-cyan-400'}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <span className="absolute text-[11px] font-extrabold text-white">
                        {score}%
                      </span>
                    </div>
                    <span className="text-[9px] uppercase font-semibold text-slate-400 mt-0.5">
                      {language === 'ta' ? 'தகுதி வாய்ப்பு' : 'Match'}
                    </span>
                  </div>
                </div>

                {/* Why matched pill */}
                <p className="text-xs text-slate-400 mt-2.5 line-clamp-1">
                  {language === 'ta' && s.benefit_summary_ta ? s.benefit_summary_ta : s.benefit_summary}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-emerald-400 text-[11px] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'ta' ? 'விதிமுறைகள் பொருந்துகின்றன' : 'Criteria Matched'}</span>
                  </div>
                  <div className="flex items-center text-cyan-400 text-xs font-semibold group-hover:translate-x-1 transition-transform">
                    <span>{language === 'ta' ? 'விவரம்' : 'Explore'}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
