import React from 'react';
import { useVoiceAndAccessibility } from '../context/VoiceAndAccessibilityContext';
import { 
  Sparkles, 
  ArrowRight, 
  Compass, 
  FileCheck, 
  AlertTriangle, 
  ShieldCheck, 
  Mic, 
  CheckCircle2, 
  HelpCircle, 
  TrendingUp, 
  Users, 
  Cpu, 
  ChevronRight,
  ExternalLink,
  Shield,
  Layers,
  Award
} from 'lucide-react';

interface LandingPageProps {
  navigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { language, startListening, readPageAloud } = useVoiceAndAccessibility();

  const journeySteps = [
    { title: 'DISCOVER', desc: language === 'ta' ? 'உரிமைகளை அறிந்திடுங்கள்' : 'Proactive matching', color: 'from-cyan-500 to-sky-600' },
    { title: 'CHECK', desc: language === 'ta' ? 'தகுதி விளக்கம்' : 'Eligibility explainer', color: 'from-sky-500 to-blue-600' },
    { title: 'APPLY', desc: language === 'ta' ? 'ஆவண வழிகாட்டல்' : 'AI pre-submission prep', color: 'from-blue-600 to-indigo-600' },
    { title: 'TRACK', desc: language === 'ta' ? 'டிஜிட்டல் ஜிபிஎஸ்' : 'Bureaucracy GPS', color: 'from-indigo-600 to-violet-600' },
    { title: 'RECOVER', desc: language === 'ta' ? 'தாமதத் தீர்வு' : 'Probable bottleneck diagnosis', color: 'from-amber-500 to-orange-600' },
    { title: 'RECEIVE', desc: language === 'ta' ? 'வங்கி உதவித்தொகை' : 'Direct DBT realization', color: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <div className="min-h-screen pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center relative z-10 max-w-4xl mx-auto">
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold mb-6 shadow-lg shadow-cyan-500/10">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>
              {language === 'ta' 
                ? 'AI அரசு நலத்திட்டங்கள் & விண்ணப்ப மீட்பு தளம்' 
                : 'Next-Gen Citizen Benefits & Application Recovery Platform'}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight sm:leading-none">
            CIVIC AI
          </h1>
          
          <div className="text-2xl sm:text-4xl font-extrabold mt-3 bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-400 bg-clip-text text-transparent">
            {language === 'ta' ? "உங்களுக்கான அரசு உரிமைகளை அறிந்திடுங்கள்." : "Know What You're Entitled To."}
          </div>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {language === 'ta' 
              ? 'திட்டங்களை கண்டறியுங்கள். விண்ணப்பங்களை தயார் செய்யுங்கள். தாமதங்களுக்கான காரணத்தை புரிந்து அடுத்த சரியான படியை எடுங்கள்.'
              : 'Discover benefits. Prepare applications. Understand delays. Take the next best step with explainable AI.'}
          </p>

          {/* Hero Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/benefits')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-600 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2"
            >
              <span>{language === 'ta' ? 'எனது பயன்களைக் கண்டறி' : 'Discover My Benefits'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700 hover:border-slate-600 transition-all"
            >
              {language === 'ta' ? 'உள்நுழைய (Demo)' : 'Sign In (Demo Priya)'}
            </button>

            <button
              onClick={startListening}
              className="px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 text-cyan-300 font-semibold text-sm border border-cyan-800/80 transition-all flex items-center space-x-2 shadow-sm"
            >
              <Mic className="w-4 h-4 text-cyan-400" />
              <span>{language === 'ta' ? 'குரல் முறை முயற்சி' : 'Try Voice Mode'}</span>
            </button>
          </div>

        </div>

        {/* 2. ANIMATED CITIZEN JOURNEY */}
        <div className="mt-16 relative z-10">
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {language === 'ta' ? 'முழுமையான குடிமக்கள் பாதை' : 'End-to-End Citizen Journey'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {journeySteps.map((step, idx) => (
              <div
                key={idx}
                className="glass-card p-4 rounded-xl border border-slate-800/90 hover:border-cyan-500/40 transition-all text-center flex flex-col items-center group"
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${step.color} flex items-center justify-center text-white font-black text-xs shadow-md mb-2 group-hover:scale-110 transition-transform`}>
                  {idx + 1}
                </div>
                <h4 className="font-extrabold text-white text-xs">{step.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PROBLEM VS CIVIC AI SOLUTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-cyan-400 mb-2">
            The Paradigm Shift
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            The problem isn't always the benefit. Sometimes, it's finding it.
          </h3>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Traditional portals expect citizens to know department jargon and wait in dark silence when applications get stuck. CIVIC AI bridges all three critical gaps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Gap 1 */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Gap 1</span>
            <h4 className="text-lg font-bold text-white mt-1">Discovery Gap</h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Citizens are unaware of scholarships, pensions, and subsidies they qualify for. CIVIC AI proactively matches personal profiles against published state criteria.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-cyan-400 flex items-center space-x-1">
              <span>Solution: CIVIC DISCOVER</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Gap 2 */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-sky-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4">
              <FileCheck className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Gap 2</span>
            <h4 className="text-lg font-bold text-white mt-1">Application Gap</h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Complex verification rules and missing certificates cause silent rejection. CIVIC AI extracts document data, checks readiness (82%), and flags pre-submission risks.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-sky-400 flex items-center space-x-1">
              <span>Solution: CIVIC APPLY</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Gap 3 */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Gap 3</span>
            <h4 className="text-lg font-bold text-white mt-1">Recovery Gap</h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Citizens see "Pending" without knowing why. CIVIC AI diagnoses the probable bottleneck (78% confidence), builds a recovery plan, and drafts bilingual follow-up letters.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-amber-400 flex items-center space-x-1">
              <span>Solution: CIVIC RECOVER</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </section>

      {/* 4. SECURITY & BLOCKCHAIN TRUST ARCHITECTURE */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="glass-panel rounded-3xl p-8 border border-emerald-500/20 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-semibold mb-3">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Raw PII On-Chain Architecture</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Tamper-Evident Blockchain Audit Proof
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                CIVIC AI guarantees maximum privacy under the Digital Personal Data Protection Act (DPDP). 
                Sensitive citizen credentials (Aadhaar, income, bank accounts, certificates) are strictly kept OFF-CHAIN in encrypted storage.
              </p>
              
              <div className="mt-5 space-y-2 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>On-Chain: Anonymous SHA-256 state hashes, consent hashes, and immutable timestamps.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Off-Chain: Encrypted database with role-based access control and masked identifiers.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Smart Contract: CivicAuditLedger.sol deployed on development network for zero-trust auditability.</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => navigate('/security')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all"
                >
                  <Shield className="w-4 h-4" />
                  <span>View Security Center & Audit Ledger</span>
                </button>
              </div>
            </div>

            {/* Architecture Flow Diagram */}
            <div className="glass-card p-5 rounded-2xl border border-slate-700/80 font-mono text-xs">
              <div className="text-slate-400 font-bold mb-3 pb-2 border-b border-slate-800 flex items-center justify-between">
                <span>SECURITY ARCHITECTURE PIPELINE</span>
                <span className="text-[10px] text-emerald-400">DPDP 2023 COMPLIANT</span>
              </div>

              <div className="space-y-2 text-slate-300 text-[11px]">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-cyan-400">1. Citizen Input</span> → Masked Aadhaar (XXXX XXXX 4821)
                </div>
                <div className="text-center text-slate-600">↓ TLS 1.3 Transport</div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-sky-400">2. Backend Enclave</span> → AES-256 Encrypted Off-chain Storage
                </div>
                <div className="text-center text-slate-600">↓ SHA-256 Cryptographic Hash Engine</div>
                <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800/80 text-emerald-300">
                  <span className="font-bold text-white">3. CivicAuditLedger</span> → Zero PII. Stores Keccak/SHA-256 Hash + Block ID
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. DEMO STATISTICS (CLEARLY MARKED) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
            Platform Demo Impact (Sample Data)
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-xl border border-slate-800 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400">2,430</div>
            <div className="text-xs text-slate-400 mt-1 font-semibold">Demo Citizens</div>
          </div>
          <div className="glass-panel p-5 rounded-xl border border-slate-800 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">8,214</div>
            <div className="text-xs text-slate-400 mt-1 font-semibold">Benefit Matches</div>
          </div>
          <div className="glass-panel p-5 rounded-xl border border-slate-800 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-400">1,204</div>
            <div className="text-xs text-slate-400 mt-1 font-semibold">Applications Tracked</div>
          </div>
          <div className="glass-panel p-5 rounded-xl border border-slate-800 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">327</div>
            <div className="text-xs text-slate-400 mt-1 font-semibold">Active Bottlenecks Diagnosed</div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold text-white">Frequently Asked Questions</h3>
          <p className="text-xs text-slate-400 mt-1">Everything you need to know about CIVIC AI</p>
        </div>

        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <h4 className="font-bold text-slate-100 text-sm">Does CIVIC AI guarantee official scheme approval?</h4>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              No. CIVIC AI marks schemes as "Potentially Eligible" based on published department rules. Official verification and sanction orders always remain with the responsible government authorities.
            </p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <h4 className="font-bold text-slate-100 text-sm">Is my personal Aadhaar or income stored on the public blockchain?</h4>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Never. The blockchain audit ledger records only one-way cryptographic SHA-256 hashes of document validity and application milestones. No sensitive personal information can ever be extracted from the ledger.
            </p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <h4 className="font-bold text-slate-100 text-sm">How does the Voice Mode assist visually impaired citizens?</h4>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Citizens can speak in both Tamil and English to ask for scholarships, inspect missing certificates, or hear complete page descriptions read aloud via browser speech synthesis.
            </p>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="pt-12 pb-8 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-300">CIVIC AI</span>
            <span>— Know What You're Entitled To.</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Tamil Nadu & National Citizen Services AI Platform • Demo Blockchain Network
          </div>
        </div>
      </footer>

    </div>
  );
};
