import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVoiceAndAccessibility } from '../context/VoiceAndAccessibilityContext';
import { api } from '../services/api';
import { User, ShieldCheck, Mail, Phone, MapPin, GraduationCap, IndianRupee, Tag, CheckCircle2, Lock } from 'lucide-react';

interface ProfilePageProps {
  navigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ navigate }) => {
  const { user, profile, refreshProfile } = useAuth();
  const { language } = useVoiceAndAccessibility();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-bold mb-2">
          <User className="w-3.5 h-3.5" />
          <span>CITIZEN PROFILE</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Citizen Identity & Eligibility Profile</h1>
        <p className="text-sm text-slate-400 mt-1">
          Parameters utilized by CIVIC AI to calculate entitlement match scores.
        </p>
      </div>

      {/* Main Profile Panel */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl space-y-6">
        
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-600 to-indigo-600 flex items-center justify-center font-extrabold text-white text-2xl shadow-xl shadow-cyan-500/25">
              {user?.name?.charAt(0) || 'P'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                <span>{user?.email || '+91 98765 43210'}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Citizen Verified</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/onboarding')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-semibold"
          >
            Update Profile Wizard
          </button>
        </div>

        {/* Identity & Masked Aadhaar Data Security Pill */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <Lock className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="text-slate-400 block text-[11px]">Aadhaar Security Masking (DPDP Compliant):</span>
              <span className="font-mono font-bold text-white text-sm">
                {profile?.masked_aadhaar || 'XXXX XXXX 4821'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Bank NPCI Direct Benefit Transfer (DBT) Mapped</span>
          </div>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Education:</span>
            <span className="font-bold text-white text-sm mt-0.5 block">{profile?.education || 'College Student'}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Annual Household Income:</span>
            <span className="font-bold text-cyan-400 text-sm mt-0.5 block">₹{profile?.income?.toLocaleString() || '1,80,000'} / year</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Location / Domicile:</span>
            <span className="font-bold text-white text-sm mt-0.5 block">{profile?.district || 'Chennai'}, {profile?.state || 'Tamil Nadu'}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Community / Category:</span>
            <span className="font-bold text-white text-sm mt-0.5 block">{profile?.category || 'BC/MBC'}</span>
          </div>

        </div>

      </div>

    </div>
  );
};
