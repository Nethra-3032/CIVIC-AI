import React from 'react';
import { LayoutDashboard, Compass, FileCheck, FileText, Bot, User } from 'lucide-react';
import { useVoiceAndAccessibility } from '../context/VoiceAndAccessibilityContext';

interface BottomNavProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPath, navigate }) => {
  const { language } = useVoiceAndAccessibility();

  const tabs = [
    { path: '/dashboard', label: language === 'ta' ? 'முகப்பு' : 'Home', icon: LayoutDashboard },
    { path: '/benefits', label: language === 'ta' ? 'பயன்கள்' : 'Benefits', icon: Compass },
    { path: '/documents', label: language === 'ta' ? 'ஆவணங்கள்' : 'Docs', icon: FileCheck },
    { path: '/applications', label: language === 'ta' ? 'விண்ணப்பம்' : 'Apps', icon: FileText },
    { path: '/profile', label: language === 'ta' ? 'சுயவிவரம்' : 'Profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-slate-800 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentPath === tab.path || (tab.path !== '/' && currentPath.startsWith(tab.path));

        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
              isActive 
                ? 'text-cyan-400 font-bold scale-105' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
