import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { NotificationItem } from '../types';
import { useVoiceAndAccessibility } from '../context/VoiceAndAccessibilityContext';
import { Bell, Calendar, AlertTriangle, FileCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface NotificationsPageProps {
  navigate: (path: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ navigate }) => {
  const { language } = useVoiceAndAccessibility();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.warn("Failed to load notifications", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-bold mb-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>DEADLINE GUARDIAN</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Notifications & Alerts</h1>
        <p className="text-sm text-slate-400 mt-1">
          Proactive monitoring for application deadlines, renewal schedules, and institutional bottlenecks.
        </p>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((n) => {
          const isBottleneck = n.category === 'BOTTLENECK';
          const isDeadline = n.category === 'DEADLINE';
          const isUnread = n.is_read === 0;

          return (
            <div
              key={n.id}
              onClick={() => n.action_url && navigate(n.action_url)}
              className={`glass-panel p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                isUnread 
                  ? 'border-cyan-500/40 bg-slate-900/90 shadow-lg' 
                  : 'border-slate-800 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className={`p-2.5 rounded-xl mt-0.5 ${
                  isBottleneck 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                    : isDeadline
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                }`}>
                  {isBottleneck ? <AlertTriangle className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-950 text-slate-400">
                      {n.category}
                    </span>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    )}
                  </div>

                  <h3 className="font-bold text-white text-sm mt-1">
                    {language === 'ta' && n.title_ta ? n.title_ta : n.title}
                  </h3>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {language === 'ta' && n.message_ta ? n.message_ta : n.message}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                <span className="text-[10px] text-slate-500">
                  {new Date(n.created_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                
                {isUnread && (
                  <button
                    onClick={(e) => handleMarkRead(n.id, e)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
