import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVoiceAndAccessibility } from '../context/VoiceAndAccessibilityContext';
import { 
  ShieldCheck, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Eye, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  Compass, 
  FileText, 
  FileCheck, 
  ShieldAlert,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, profile, logout, loginAsPriya, loginAsAdmin } = useAuth();
  const { 
    language, 
    setLanguage, 
    isHighContrast, 
    toggleHighContrast, 
    isListening, 
    startListening, 
    stopListening,
    isSpeaking,
    stopSpeaking,
    readPageAloud 
  } = useVoiceAndAccessibility();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDemoSelector, setShowDemoSelector] = useState(false);

  const navLinks = [
    { path: '/dashboard', label: language === 'ta' ? 'டாஷ்போர்டு' : 'Dashboard', icon: LayoutDashboard },
    { path: '/benefits', label: language === 'ta' ? 'பயன்கள் ரேடார்' : 'Benefit Radar', icon: Compass },
    { path: '/documents', label: language === 'ta' ? 'ஆவணங்கள்' : 'Documents', icon: FileCheck },
    { path: '/applications', label: language === 'ta' ? 'விண்ணப்பங்கள்' : 'Applications', icon: FileText },
    { path: '/security', label: language === 'ta' ? 'பாதுகாப்பு & தணிக்கை' : 'Security & Audit', icon: ShieldCheck },
  ];

  if (user?.role === 'ADMIN') {
    navLinks.push({ path: '/admin', label: language === 'ta' ? 'அரசு நுண்ணறிவு' : 'Gov Intelligence', icon: ShieldAlert });
  }

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand & Tagline */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                CIVIC AI
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                Demo Network
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
              {language === 'ta' ? 'உங்களுக்கான அரசு உரிமைகளை அறிந்திடுங்கள்' : "Know What You're Entitled To"}
            </p>
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Actions, Language, Accessibility, Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Quick Voice Mode Button */}
          <button
            onClick={isListening ? stopListening : startListening}
            title={isListening ? "Listening... Click to stop" : "Start Voice Command"}
            className={`p-2 rounded-lg border transition-all flex items-center space-x-1 text-xs ${
              isListening 
                ? 'bg-red-500/20 border-red-500/60 text-red-300 animate-pulse'
                : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-cyan-400" />}
            <span className="hidden xl:inline">{isListening ? 'Listening' : 'Voice'}</span>
          </button>

          {/* Read Page Speaker Button */}
          <button
            onClick={isSpeaking ? stopSpeaking : readPageAloud}
            title={isSpeaking ? "Stop Speaking" : "Read Page Aloud"}
            className={`p-2 rounded-lg border transition-all ${
              isSpeaking
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 animate-pulse'
                : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-amber-300 hover:border-amber-500/40'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* High Contrast Toggle */}
          <button
            onClick={toggleHighContrast}
            title={isHighContrast ? "Normal Contrast" : "High Contrast Mode (WCAG)"}
            className={`p-2 rounded-lg border text-xs transition-all ${
              isHighContrast 
                ? 'bg-yellow-400 text-black border-yellow-300 font-bold'
                : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Language Switcher */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-700 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded transition-all ${
                language === 'en' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`px-2 py-1 rounded transition-all ${
                language === 'ta' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Notifications Bell */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white"
          >
            <Bell className="w-4 h-4" />
            {profile && profile.unread_notifs > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-extrabold flex items-center justify-center">
                {profile.unread_notifs}
              </span>
            )}
          </button>

          {/* Demo User Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setShowDemoSelector(!showDemoSelector)}
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-xs font-medium text-slate-300 hover:border-cyan-500/50"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="max-w-[100px] truncate">{user?.name || 'Priya Kumar'}</span>
              <span className="text-[10px] px-1 bg-slate-800 text-slate-400 rounded">
                {user?.role === 'ADMIN' ? 'Admin' : 'Citizen'}
              </span>
            </button>

            {showDemoSelector && (
              <div className="absolute right-0 mt-2 w-64 glass-panel rounded-xl shadow-2xl p-2 z-50 border border-slate-700 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="px-2 py-1 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  Select Demo Identity
                </div>
                <button
                  onClick={() => {
                    loginAsPriya();
                    setShowDemoSelector(false);
                    navigate('/dashboard');
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 flex items-center justify-between text-slate-200 mt-1"
                >
                  <div>
                    <div className="font-semibold text-cyan-400">Priya Kumar</div>
                    <div className="text-[10px] text-slate-400">College Student (Citizen) • ₹1.8L</div>
                  </div>
                  {user?.id === 'usr_priya_001' && <span className="text-emerald-400 font-bold">✓</span>}
                </button>
                <button
                  onClick={() => {
                    loginAsAdmin();
                    setShowDemoSelector(false);
                    navigate('/admin');
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 flex items-center justify-between text-slate-200 mt-1 border-t border-slate-800 pt-2"
                >
                  <div>
                    <div className="font-semibold text-indigo-400">S. Meenakshi</div>
                    <div className="text-[10px] text-slate-400">Welfare Admin Officer (Gov Dashboard)</div>
                  </div>
                  {user?.role === 'ADMIN' && <span className="text-emerald-400 font-bold">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* User Profile / Logout */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:border-cyan-500/50"
            >
              <UserIcon className="w-4 h-4" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-52 glass-panel rounded-xl shadow-2xl p-2 z-50 border border-slate-700 text-xs">
                <div className="px-3 py-2 border-b border-slate-800">
                  <div className="font-semibold text-slate-200">{user?.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user?.email || '+91 98765 43210'}</div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
                    className="w-full text-left px-3 py-1.5 rounded hover:bg-slate-800 text-slate-300"
                  >
                    {language === 'ta' ? 'சுயவிவரம்' : 'My Profile'}
                  </button>
                  <button
                    onClick={() => { setShowProfileMenu(false); navigate('/security'); }}
                    className="w-full text-left px-3 py-1.5 rounded hover:bg-slate-800 text-slate-300"
                  >
                    {language === 'ta' ? 'பாதுகாப்பு & அனுமதி' : 'Security & Consent'}
                  </button>
                  <button
                    onClick={() => { setShowProfileMenu(false); navigate('/onboarding'); }}
                    className="w-full text-left px-3 py-1.5 rounded hover:bg-slate-800 text-slate-300"
                  >
                    {language === 'ta' ? 'மறுவிவர சரிபார்ப்பு' : 'Run Onboarding Wizard'}
                  </button>
                </div>
                <div className="pt-1 border-t border-slate-800">
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                      navigate('/login');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded hover:bg-red-500/20 text-red-400 flex items-center space-x-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{language === 'ta' ? 'வெளியேறு' : 'Sign Out'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
