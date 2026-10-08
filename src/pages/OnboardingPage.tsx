import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  IndianRupee, 
  Tag, 
  FileCheck 
} from 'lucide-react';

interface OnboardingPageProps {
  navigate: (path: string) => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ navigate }) => {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || 'Priya Kumar',
    age: 19,
    dob: '2007-04-12',
    state: 'Tamil Nadu',
    district: 'Chennai',
    education: 'College Student',
    employment: 'Student',
    income: 180000,
    category: 'BC/MBC',
    hasAadhaar: true,
    hasIncomeCert: true,
    hasBonafide: true,
    hasBankPassbook: true
  });

  const totalSteps = 8;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      await api.submitOnboarding(formData);
      await refreshProfile();
      navigate('/dashboard');
    } catch (e) {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        
        {/* Wizard Panel */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl relative">
          
          {/* Header Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-bold text-cyan-400">Step {step} of {totalSteps}</span>
              <span className="font-medium">{Math.round((step / totalSteps) * 100)}% Complete</span>
            </div>

            {/* Stepper Dots / Bars */}
            <div className="grid grid-cols-8 gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i + 1 <= step ? 'bg-gradient-to-r from-cyan-400 to-sky-500' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step 1: Name */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">What is your official name?</h3>
                  <p className="text-xs text-slate-400">Please provide your name as written in government certificates.</p>
                </div>
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-cyan-500"
                placeholder="Full Name"
              />
            </div>
          )}

          {/* Step 2: Age / Date of Birth */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Your Age & Date of Birth</h3>
                  <p className="text-xs text-slate-400">Used to match age-specific scholarships and youth schemes.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Age (Years)</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: State & District */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">State & District of Residence</h3>
                  <p className="text-xs text-slate-400">Enables location-based welfare and district quota matching.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:border-cyan-500"
                  >
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">District</label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:border-cyan-500"
                  >
                    <option value="Chennai">Chennai</option>
                    <option value="Madurai">Madurai</option>
                    <option value="Coimbatore">Coimbatore</option>
                    <option value="Tiruchirappalli">Tiruchirappalli</option>
                    <option value="Salem">Salem</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Education */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Current Education Level</h3>
                  <p className="text-xs text-slate-400">Identifies higher education fee waivers and stipends.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['School (10th / 12th)', 'College Student', 'Diploma / Polytechnic', 'Postgraduate', 'Graduated'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFormData({ ...formData, education: lvl })}
                    className={`p-3 rounded-xl border text-left font-medium transition-all ${
                      formData.education === lvl
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Employment */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Employment Status</h3>
                  <p className="text-xs text-slate-400">Filters skill programs, apprentice funds & unemployment support.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['Student', 'Unemployed Job Seeker', 'Self-Employed / Artisan', 'Salaried / Private Worker', 'Farmer'].map((emp) => (
                  <button
                    key={emp}
                    type="button"
                    onClick={() => setFormData({ ...formData, employment: emp })}
                    className={`p-3 rounded-xl border text-left font-medium transition-all ${
                      formData.employment === emp
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {emp}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Income */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Approximate Household Annual Income</h3>
                  <p className="text-xs text-slate-400">Crucial for means-tested welfare thresholds (under ₹2.5 Lakh).</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-slate-400">Selected Bracket:</span>
                  <span className="text-base font-extrabold text-cyan-400">₹{formData.income.toLocaleString()} / year</span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="500000"
                  step="10000"
                  value={formData.income}
                  onChange={(e) => setFormData({ ...formData, income: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                  <span>₹50,000</span>
                  <span>₹2,50,000 (Govt Limit)</span>
                  <span>₹5,00,000+</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Category */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Social Category / Community</h3>
                  <p className="text-xs text-slate-400">Welfare departments provide specific budget allocations.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['BC/MBC', 'SC/ST', 'Minority Community', 'General Category'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`p-3 rounded-xl border text-left font-medium transition-all ${
                      formData.category === cat
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 8: Documents Availability */}
          {step === 8 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Existing Certificates Available</h3>
                  <p className="text-xs text-slate-400">Select documents you already hold in paper or digital form.</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { key: 'hasAadhaar', label: 'Aadhaar Card (UIDAI)' },
                  { key: 'hasBonafide', label: 'College Bonafide / Student ID' },
                  { key: 'hasIncomeCert', label: 'Tahsildar Income Certificate' },
                  { key: 'hasBankPassbook', label: 'Aadhaar-Linked Bank Account Passbook' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-3 cursor-pointer hover:border-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={(formData as any)[item.key]}
                      onChange={(e) => setFormData({ ...formData, [item.key]: e.target.checked })}
                      className="w-4 h-4 rounded text-cyan-600 focus:ring-0 bg-slate-900 border-slate-700"
                    />
                    <span className="text-slate-200 font-medium">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="mt-8 pt-5 border-t border-slate-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center space-x-1.5 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-xs text-slate-500 hover:text-slate-400"
              >
                Skip for now
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center space-x-1.5 transition-all"
            >
              <span>{step === totalSteps ? (loading ? 'Calculating...' : 'Finish & Reveal Entitlements') : 'Save & Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
