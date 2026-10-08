import React from 'react';
import { ApplicationStage, ApplicationDiagnosis } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Circle, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Info, 
  ExternalLink 
} from 'lucide-react';

interface BureaucracyGPSProps {
  applicationId: string;
  schemeName: string;
  stages: ApplicationStage[];
  diagnosis?: ApplicationDiagnosis;
  onOpenRecovery?: () => void;
  language: 'en' | 'ta';
}

export const BureaucracyGPS: React.FC<BureaucracyGPSProps> = ({
  applicationId,
  schemeName,
  stages,
  diagnosis,
  onOpenRecovery,
  language
}) => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-700/80 shadow-2xl relative overflow-hidden">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-bold uppercase tracking-wider">
              {language === 'ta' ? 'டிஜிட்டல் ஜிபிஎஸ் டிராக்கர்' : 'Digital Bureaucracy GPS'}
            </span>
            <span className="text-xs text-slate-400 font-mono">Ref: {applicationId}</span>
          </div>
          <h3 className="text-xl font-extrabold text-white mt-1.5">{schemeName}</h3>
        </div>

        {diagnosis && (
          <button
            onClick={onOpenRecovery}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <AlertTriangle className="w-4 h-4 text-slate-950" />
            <span>{language === 'ta' ? 'AI தடங்கலை சரிசெய்ய' : 'Diagnose & Recover'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Visual GPS Progress Stepper */}
      <div className="py-8">
        <div className="relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-800 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 relative z-10">
            {stages.map((stage, idx) => {
              const isCompleted = stage.status === 'COMPLETED';
              const isDelayed = stage.status === 'ACTIVE_DELAYED';
              const isProcessing = stage.status === 'ACTIVE_PROCESSING' || stage.status === 'ACTIVE_HEALTHY';
              const isPending = stage.status === 'PENDING';

              return (
                <div 
                  key={idx} 
                  className={`flex flex-col items-center text-center p-3 rounded-xl transition-all ${
                    isDelayed 
                      ? 'glass-card border-2 border-amber-500/80 bg-amber-950/20 shadow-lg shadow-amber-500/10' 
                      : isProcessing
                      ? 'glass-card border-2 border-cyan-500/80 bg-cyan-950/20'
                      : 'bg-slate-900/40 border border-slate-800/80'
                  }`}
                >
                  {/* Icon Status Indicator */}
                  <div className="relative mb-2">
                    {isCompleted && (
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                    {isDelayed && (
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-500 text-amber-400 flex items-center justify-center animate-pulse">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                    )}
                    {isProcessing && (
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400 flex items-center justify-center animate-pulse">
                        <Clock className="w-5 h-5" />
                      </div>
                    )}
                    {isPending && (
                      <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 text-slate-500 flex items-center justify-center">
                        <Circle className="w-5 h-5" />
                      </div>
                    )}

                    <span className="absolute -bottom-1 -right-1 text-[10px] font-black w-4 h-4 rounded-full bg-slate-900 border border-slate-700 text-slate-300 flex items-center justify-center">
                      {idx + 1}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug">{stage.stage}</h4>
                  
                  {/* Status Badge */}
                  <div className="mt-1.5">
                    {isCompleted && (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">
                        {language === 'ta' ? 'நிறைவு' : 'Completed'}
                      </span>
                    )}
                    {isDelayed && (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800 animate-pulse">
                        {stage.days_delayed ? `${stage.days_delayed}d Delay` : 'Delayed'}
                      </span>
                    )}
                    {isProcessing && (
                      <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                        {language === 'ta' ? 'செயலில்' : 'Active'}
                      </span>
                    )}
                    {isPending && (
                      <span className="text-[10px] text-slate-500">
                        {language === 'ta' ? 'காத்திருக்கிறது' : 'Pending'}
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 mt-2 line-clamp-1">{stage.actor}</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">{stage.date}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Evidence Insight Box */}
      {diagnosis && (
        <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {language === 'ta' ? 'சாத்தியமான தாமத காரணம்' : 'Probable Bottleneck'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Confidence: {diagnosis.confidence}
                </span>
              </div>
              <p className="text-sm font-semibold text-white mt-0.5">
                {diagnosis.probable_bottleneck}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'ta' ? 'பரிந்துரைக்கப்பட்ட அடுத்த நடவடிக்கை:' : 'Recommended Action:'}{' '}
                <span className="text-amber-200">{diagnosis.recommended_action}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onOpenRecovery}
            className="w-full md:w-auto px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-500/30 text-xs font-bold whitespace-nowrap transition-all"
          >
            {language === 'ta' ? 'முழுமையான மீட்பு திட்டம் பார்க்க' : 'Open Recovery Action Plan'}
          </button>
        </div>
      )}

      {/* Authority Disclaimer */}
      <div className="mt-4 flex items-center space-x-2 text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 flex-shrink-0" />
        <span>
          {diagnosis?.disclaimer || "Probable bottleneck analysis is derived from available portal state rules. Final decision rests with the responsible authority."}
        </span>
      </div>

    </div>
  );
};
