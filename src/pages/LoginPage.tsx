import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVoiceAndAccessibility } from '../context/VoiceAndAccessibilityContext';
import { Sparkles, Mail, Phone, Lock, ArrowRight, UserCheck, ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login, loginAsPriya, loginAsAdmin } = useAuth();
  const { language } = useVoiceAndAccessibility();

  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('priya.kumar@example.com');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(identifier, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Card */}
        <div className="glass-panel rounded-3xl p-8 border border-slate-700/80 shadow-2xl relative overflow-hidden">
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/25">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              {language === 'ta' ? 'CIVIC AI உள்நுழைவு' : 'Welcome to CIVIC AI'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'ta' ? 'அரசு நலத்திட்டங்களை அணுக உள்நுழையவும்' : 'Sign in to access citizen benefits & application recovery'}
            </p>
          </div>

          {/* Quick Demo Switchers Notice */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/80 mb-6 text-xs">
            <div className="text-cyan-300 font-bold mb-2 flex items-center space-x-1.5">
              <UserCheck className="w-4 h-4" />
              <span>Instant Hackathon Demo Login:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  loginAsPriya();
                  navigate('/dashboard');
                }}
                className="p-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-200 font-semibold text-[11px] text-left transition-all"
              >
                <div className="font-bold text-white">Priya Kumar</div>
                <div className="text-[10px] text-cyan-300/80">Citizen (19y, Student)</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  loginAsAdmin();
                  navigate('/admin');
                }}
                className="p-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-200 font-semibold text-[11px] text-left transition-all"
              >
                <div className="font-bold text-white">S. Meenakshi</div>
                <div className="text-[10px] text-indigo-300/80">Gov Admin Officer</div>
              </button>
            </div>
          </div>

          {/* Auth Method Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMethod('email');
                setIdentifier('priya.kumar@example.com');
              }}
              className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                method === 'email' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Continue with Email</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod('phone');
                setIdentifier('+919876543210');
              }}
              className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                method === 'phone' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Continue with Phone</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs mb-4">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                {method === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <div className="relative">
                <input
                  type={method === 'email' ? 'email' : 'tel'}
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={method === 'email' ? 'priya.kumar@example.com' : '+91 98765 43210'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 font-medium">Password / OTP</label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-cyan-400 hover:text-cyan-300 text-[11px]"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to CIVIC AI'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Create Citizen Profile
            </button>
          </div>

        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-sm rounded-2xl border border-slate-700 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center space-x-2">
              <KeyRound className="w-5 h-5 text-cyan-400" />
              <span>Password Recovery</span>
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Enter your registered email or phone to receive a secure OTP verification token.
            </p>
            {forgotSent ? (
              <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs mb-4 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Reset token sent! Check your device or use demo password: demo123</span>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter email or mobile number"
                  defaultValue="priya.kumar@example.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  onClick={() => setForgotSent(true)}
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                >
                  Send OTP Token
                </button>
              </div>
            )}
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => { setShowForgot(false); setForgotSent(false); }}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
