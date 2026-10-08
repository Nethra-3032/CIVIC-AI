import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VoiceAndAccessibilityProvider, useVoiceAndAccessibility } from './context/VoiceAndAccessibilityContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { VoiceAssistantOrb } from './components/VoiceAssistantOrb';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { BenefitsPage } from './pages/BenefitsPage';
import { BenefitDetailPage } from './pages/BenefitDetailPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ApplicationDetailPage } from './pages/ApplicationDetailPage';
import { RecoveryPage } from './pages/RecoveryPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SecurityConsentPage } from './pages/SecurityConsentPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// Toast Notification
interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert';
}

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.hash ? window.location.hash.replace('#', '') : '/';
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Hash router synchronization
  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash ? window.location.hash.replace('#', '') : '/';
      setCurrentPath(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Real-time WebSocket connection to FastAPI backend
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWs = () => {
      try {
        ws = new WebSocket('ws://127.0.0.1:8000/ws');
        
        ws.onopen = () => {
          console.log("WebSocket connected to CIVIC AI backend");
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'APPLICATION_SUBMITTED') {
              addToast({
                id: `t-${Date.now()}`,
                title: 'Application Recorded On-Chain',
                message: `Application ID ${data.app_id} confirmed on Demo Blockchain Network.`,
                type: 'success'
              });
            } else if (data.type === 'DOCUMENT_PROCESSED') {
              addToast({
                id: `t-${Date.now()}`,
                title: 'Certificate Hashed to Blockchain',
                message: `${data.doc_name} was verified and hashed to CivicAuditLedger.`,
                type: 'info'
              });
            }
          } catch (e) {
            console.warn(e);
          }
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connectWs, 5000);
        };
      } catch (err) {
        reconnectTimeout = setTimeout(connectWs, 5000);
      }
    };

    connectWs();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  const addToast = (toast: Toast) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 6000);
  };

  // Route Resolver
  const renderRoute = () => {
    // Dynamic matching
    if (currentPath.startsWith('/benefits/')) {
      const benefitId = currentPath.replace('/benefits/', '');
      return <BenefitDetailPage benefitId={benefitId} navigate={navigate} />;
    }
    if (currentPath.startsWith('/applications/')) {
      const appId = currentPath.replace('/applications/', '');
      return <ApplicationDetailPage applicationId={appId} navigate={navigate} />;
    }
    if (currentPath.startsWith('/recovery/')) {
      const appId = currentPath.replace('/recovery/', '');
      return <RecoveryPage applicationId={appId} navigate={navigate} />;
    }

    switch (currentPath) {
      case '/':
        return <LandingPage navigate={navigate} />;
      case '/login':
        return <LoginPage navigate={navigate} />;
      case '/register':
        return <RegisterPage navigate={navigate} />;
      case '/onboarding':
        return <OnboardingPage navigate={navigate} />;
      case '/dashboard':
        return <DashboardPage navigate={navigate} />;
      case '/benefits':
        return <BenefitsPage navigate={navigate} />;
      case '/documents':
        return <DocumentsPage navigate={navigate} />;
      case '/applications':
        return <ApplicationsPage navigate={navigate} />;
      case '/notifications':
        return <NotificationsPage navigate={navigate} />;
      case '/profile':
        return <ProfilePage navigate={navigate} />;
      case '/security':
      case '/consent':
        return <SecurityConsentPage navigate={navigate} />;
      case '/admin':
      case '/admin/analytics':
      case '/admin/insights':
        return <AdminDashboardPage navigate={navigate} />;
      default:
        return <LandingPage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative text-slate-100">
      
      {/* Top Navigation */}
      <Navbar currentPath={currentPath} navigate={navigate} />

      {/* Main Content View */}
      <main className="flex-1 pb-16 md:pb-6">
        {renderRoute()}
      </main>

      {/* Universal Floating AI Voice Orb */}
      <VoiceAssistantOrb navigate={navigate} />

      {/* Mobile Responsive Bottom Navigation */}
      <BottomNav currentPath={currentPath} navigate={navigate} />

      {/* Real-time Toast Notifications Hub */}
      <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto p-4 rounded-2xl glass-panel border border-cyan-500/40 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-white text-xs">{t.title}</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">{t.message}</p>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
                className="text-slate-400 hover:text-white text-xs ml-2"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <VoiceAndAccessibilityProvider>
        <AppContent />
      </VoiceAndAccessibilityProvider>
    </AuthProvider>
  );
};

export default App;
