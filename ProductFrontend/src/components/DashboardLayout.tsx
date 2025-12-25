import { useState, useEffect, useRef } from 'react';
import { useAuth, type UserRole } from './AuthContext';
import { useWorkflow } from './WorkflowContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from './ui/sidebar';
import { WorkflowNavigationHeader } from './WorkflowNavigationHeader';
import {
  Home,
  Shield,
  AlertTriangle,
  BarChart3,
  FileCheck,
  Bell,
  Zap,
  FileText,
  Settings,
  LogOut,
  Mail,
  Target
} from 'lucide-react';
import dsecureLogo from 'figma:asset/995e8b9dadafe1fa2984b7eb13aef6c50c9f5d7d.png';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentModule: string;
  onModuleChange: (module: string) => void;
}

const navigationItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'assets', label: 'Asset & Network Management', icon: Shield },
  { id: 'vulnerabilities', label: 'Vulnerability & Threat Intel', icon: AlertTriangle },
  { id: 'risk', label: 'Risk Exposure Dashboard', icon: BarChart3 },
  { id: 'compliance', label: 'Policy & Compliance Tracker', icon: FileCheck },
  { id: 'events', label: 'Events & Alert Monitoring', icon: Bell },
  { id: 'phishing', label: 'Phishing Intelligence', icon: Mail },
  { id: 'phishing-simulation', label: 'Phishing Simulation', icon: Target },
  { id: 'incident-response', label: 'Incident Response Lite', icon: Zap },
  { id: 'executive-report', label: 'Executive Report', icon: FileText },
];

const bottomNavigationItems = [
  { id: 'settings', label: 'Settings', icon: Settings },
];

// Role-based access control mapping (exactly as per your requirements)
const roleAccess: Record<UserRole, string[]> = {
  Admin: [
    'home', 'assets', 'vulnerabilities', 'risk', 'compliance',
    'events', 'phishing', 'phishing-simulation', 'incident-response',
    'executive-report', 'settings'
  ],
  CISO: [
    'home', 'risk', 'compliance', 'phishing-simulation', 'executive-report'
  ],
  Analyst: [
    'vulnerabilities', 'risk', 'phishing', 'incident-response'
  ]
};

export function DashboardLayout({ children, currentModule, onModuleChange }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { getWorkflowsByModule } = useWorkflow();
  const contentRef = useRef<HTMLDivElement>(null);

  // Get role from context OR localStorage (in case context loads slowly)
  const userRole: UserRole = (user?.role as UserRole) ||
    (localStorage.getItem('role') as UserRole) ||
    'Analyst'; // fallback

  const userName = user?.name || localStorage.getItem('name') || 'User';
  const userEmail = user?.email || localStorage.getItem('email') || '';

  // Filter navigation items based on role
  const allowedModules = roleAccess[userRole] || [];
  const filteredNavigationItems = navigationItems.filter(item =>
    allowedModules.includes(item.id)
  );
  const filteredBottomNavigationItems = bottomNavigationItems.filter(item =>
    allowedModules.includes(item.id)
  );

  // Reset scroll position when module changes
  useEffect(() => {
    requestAnimationFrame(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    });
  }, [currentModule]);

  // Enhanced alert counts with workflow integration
  const getAlertCount = (moduleId: string) => {
    const workflows = getWorkflowsByModule(moduleId);
    const criticalWorkflows = workflows.filter(w => w.priority === 'critical' && w.status !== 'completed');

    const baseAlerts: Record<string, number> = {
      'vulnerabilities': 23,
      'events': 7,
      'phishing': 12,
      'phishing-simulation': 5,
      'incident-response': 3
    };

    return (baseAlerts[moduleId] || 0) + criticalWorkflows.length;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar collapsible="icon" className="[&_[data-sidebar=sidebar]]:scrollbar-thin [&_[data-sidebar=sidebar]]:scrollbar-track-transparent [&_[data-sidebar=sidebar]]:scrollbar-thumb-border/20 [&_[data-sidebar=sidebar]]:hover:scrollbar-thumb-border/40">
          <SidebarHeader className="border-b border-sidebar-border">
            <div className="flex items-center gap-3 px-2 py-3">
              <div className="flex aspect-square size-12 items-center justify-center">
                <img
                  src={dsecureLogo}
                  alt="DSecure Logo"
                  className="size-12 object-contain"
                />
              </div>
              <div className="flex flex-col gap-1 leading-none">
                <span className="text-xl font-bold tracking-tight">CRV360</span>
                <span className="text-sm text-sidebar-foreground/80">A product of DSecure</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/20 hover:scrollbar-thumb-border/40">
            <SidebarMenu>
              {filteredNavigationItems.map((item) => {
                const Icon = item.icon;
                const alertCount = getAlertCount(item.id);
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onModuleChange(item.id)}
                      isActive={currentModule === item.id}
                    >
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                      {alertCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-auto text-xs h-5 min-w-5 px-1.5 font-medium"
                        >
                          {alertCount}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>

            <div className="mt-auto pt-4 border-t border-sidebar-border">
              <SidebarMenu>
                {filteredBottomNavigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => onModuleChange(item.id)}
                        isActive={currentModule === item.id}
                      >
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center gap-2 px-2 py-2 text-sm">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-sidebar-accent">
                    <span className="text-xs font-medium">
                      {userName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{userName}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs px-1.5 py-0 h-4 ${userRole === 'Admin' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                          userRole === 'CISO' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-green-100 text-green-800 border-green-200'
                          }`}
                      >
                        {userRole}
                      </Badge>
                    </div>
                    <span className="text-xs text-sidebar-foreground/70">{userEmail}</span>
                  </div>
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={logout}>
                  <LogOut className="size-4" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="font-semibold capitalize">{currentModule.replace('-', ' ')}</h1>
              </div>
            </div>
          </header>

          {/* Enhanced Workflow Navigation Header */}
          <WorkflowNavigationHeader
            currentModule={currentModule}
            onModuleChange={onModuleChange}
          />

          <div
            ref={contentRef}
            className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/20 hover:scrollbar-thumb-border/40"
          >
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}