import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BenefitScheme } from '../types';
import { useVoiceAndAccessibility } from '../context/VoiceAndAccessibilityContext';
import { 
  Compass, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Calendar, 
  ExternalLink,
  Sparkles,
  Layers
} from 'lucide-react';

interface BenefitsPageProps {
  navigate: (path: string) => void;
}

export const BenefitsPage: React.FC<BenefitsPageProps> = ({ navigate }) => {
  const { language } = useVoiceAndAccessibility();
  const [schemes, setSchemes] = useState<BenefitScheme[]>([]);
  const [category, setCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBenefits = async () => {
      setLoading(true);
      try {
        const data = await api.getBenefits(category);
        setSchemes(data);
      } catch (e) {
        console.warn("Failed to load benefits", e);
      } finally {
        setLoading(false);
      }
    };
    fetchBenefits();
  }, [category]);

  const categories = ['ALL', 'Education', 'Healthcare', 'Welfare', 'Housing & Energy', 'Employment'];

  const filteredSchemes = schemes.filter(s => {
    const nameMatch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-bold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>CIVIC DISCOVER</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Your Benefit Radar</h1>
          <p className="text-sm text-slate-400 mt-1">
            Personalized government schemes identified from state and central department rules.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schemes, tuition, solar..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              category === cat
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            {cat === 'ALL' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSchemes.map((scheme) => {
          const matchScore = scheme.match_score || 85;
          const isHighMatch = matchScore >= 85;

          return (
            <div
              key={scheme.id}
              className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                {/* Header Tag and Score */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {scheme.category}
                  </span>

                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-xs font-black text-white">{matchScore}% Match</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-white text-base mt-3 group-hover:text-cyan-300 transition-colors">
                  {language === 'ta' && scheme.name_ta ? scheme.name_ta : scheme.name}
                </h3>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {language === 'ta' && scheme.description_ta ? scheme.description_ta : scheme.description}
                </p>

                {/* Estimated Benefit Badge */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Estimated Benefit:</span>
                  <span className="font-semibold text-emerald-400 line-clamp-1">
                    {language === 'ta' && scheme.benefit_summary_ta ? scheme.benefit_summary_ta : scheme.benefit_summary}
                  </span>
                </div>

                {/* Criteria Checks Breakdown */}
                <div className="mt-3 space-y-1.5 text-xs">
                  {scheme.reasons_matched?.slice(0, 2).map((r, i) => (
                    <div key={i} className="flex items-center space-x-2 text-slate-300 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">{r.text}</span>
                    </div>
                  ))}

                  {scheme.missing_docs && scheme.missing_docs.length > 0 && (
                    <div className="flex items-center space-x-2 text-amber-300 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="truncate">Action: {scheme.missing_docs[0]} required</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Deadline: {scheme.deadline || 'Ongoing'}</span>
                </div>

                <button
                  onClick={() => navigate(`/benefits/${scheme.id}`)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-bold flex items-center space-x-1 transition-all"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
