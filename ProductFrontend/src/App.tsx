import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import { WorkflowProvider } from './components/WorkflowContext';
import { LoginPage } from './components/LoginPage';
import { DashboardLayout } from './components/DashboardLayout';
import { HomePage } from './components/HomePage';
import { AssetManagementModule } from './components/modules/AssetManagementModule';
import { VulnerabilityModule } from './components/modules/VulnerabilityModule';
import { RiskDashboardModule } from './components/modules/RiskDashboardModule';
import { ComplianceModule } from './components/modules/ComplianceModule';
import { EventsModule } from './components/modules/EventsModule';
import { IncidentResponseModule } from './components/modules/IncidentResponseModule';
import { ExecutiveReportModule } from './components/modules/ExecutiveReportModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { PhishingIntelligenceModule } from './components/modules/PhishingIntelligenceModule';
import { PhishingSimulationModule } from './components/modules/PhishingSimulationModule';
import { Toaster } from './components/ui/sonner';
import BackendStatus from "./components/ui/BackendStatus";


function AppContent() {
  const { user, isLoading: authLoading } = useAuth();
  const [currentModule, setCurrentModule] = useState('home');
  const [isInitializing, setIsInitializing] = useState(true);

  // Check localStorage on mount to restore session
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');

    if (token && role && name && email) {
      // Session exists → auto-login via context if not already done
      // This ensures AuthContext picks up persisted session
      setIsInitializing(false);
    } else {
      setIsInitializing(false);
    }
  }, []);

  const renderModule = () => {
    switch (currentModule) {
      case 'home':
        return <HomePage onModuleChange={setCurrentModule} />;
      case 'assets':
        return <AssetManagementModule onModuleChange={setCurrentModule} />;
      case 'vulnerabilities':
        return <VulnerabilityModule onModuleChange={setCurrentModule} />;
      case 'risk':
        return <RiskDashboardModule onModuleChange={setCurrentModule} />;
      case 'compliance':
        return <ComplianceModule onModuleChange={setCurrentModule} />;
      case 'events':
        return <EventsModule onModuleChange={setCurrentModule} />;
      case 'phishing':
        return <PhishingIntelligenceModule onModuleChange={setCurrentModule} />;
      case 'phishing-simulation':
        return <PhishingSimulationModule onModuleChange={setCurrentModule} />;
      case 'incident-response':
        return <IncidentResponseModule onModuleChange={setCurrentModule} />;
      case 'executive-report':
        return <ExecutiveReportModule onModuleChange={setCurrentModule} />;
      case 'settings':
        return <SettingsModule onModuleChange={setCurrentModule} />;
      default:
        return <HomePage onModuleChange={setCurrentModule} />;
    }
  };

  // Show loading until we know if user is logged in
  if (isInitializing || authLoading) {
    return (
      <div className="size-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4 text-lg">Initializing CRV360...</p>
        </div>
      </div>
    );
  }

  // Not logged in → show login
  if (!user) {
    return <LoginPage />;
  }

  // Logged in → show full dashboard
  return (
    <DashboardLayout
      currentModule={currentModule}
      onModuleChange={setCurrentModule}
    >
      <div key={currentModule}>
        {renderModule()}
      </div>
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorkflowProvider>
        <AppContent />
        <Toaster position="top-right" richColors />
      </WorkflowProvider>
    </AuthProvider>
  );
}