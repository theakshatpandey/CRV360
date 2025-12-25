import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface WorkflowAction {
  id: string;
  type: 'vulnerability' | 'compliance' | 'incident' | 'task' | 'security_scan' | 'maintenance';
  module: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignee?: string;
  due_date?: string;
  asset_id?: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  related_workflows?: string[];
}

export interface NotificationAction {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  module: string;
  action_required: boolean;
  timestamp: string;
  read: boolean;
}

export interface CrossModuleIntegration {
  from_module: string;
  to_module: string;
  context: any;
  workflow_id?: string;
  asset_id?: string;
}

interface WorkflowContextType {
  // Workflow Management
  workflows: WorkflowAction[];
  addWorkflow: (workflow: Omit<WorkflowAction, 'id' | 'created_at' | 'updated_at'>) => string;
  updateWorkflow: (id: string, updates: Partial<WorkflowAction>) => void;
  getWorkflowsByAsset: (assetId: string) => WorkflowAction[];
  getWorkflowsByModule: (module: string) => WorkflowAction[];
  getWorkflowsByStatus: (status: string) => WorkflowAction[];
  getPendingCriticalWorkflows: () => WorkflowAction[];
  
  // Cross-Module Navigation
  navigateWithContext: (targetModule: string, context: CrossModuleIntegration) => void;
  getNavigationContext: () => CrossModuleIntegration | null;
  clearNavigationContext: () => void;
  
  // Notifications
  notifications: NotificationAction[];
  addNotification: (notification: Omit<NotificationAction, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  getUnreadNotifications: () => NotificationAction[];
  
  // Role-based Access
  userRole: 'ciso' | 'analyst' | 'manager' | 'admin';
  setUserRole: (role: 'ciso' | 'analyst' | 'manager' | 'admin') => void;
  getUserPermissions: () => string[];
  
  // Analytics & Metrics
  getWorkflowMetrics: () => {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    overdue: number;
    critical: number;
  };
  getModuleActivityMetrics: () => Record<string, number>;
  
  // Asset Integration
  assetWorkflowMap: Record<string, string[]>;
  linkAssetToWorkflow: (assetId: string, workflowId: string) => void;
  unlinkAssetFromWorkflow: (assetId: string, workflowId: string) => void;
  
  // Module Communication
  sendModuleMessage: (fromModule: string, toModule: string, message: any) => void;
  getModuleMessages: (module: string) => any[];
  clearModuleMessages: (module: string) => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};

interface WorkflowProviderProps {
  children: ReactNode;
}

export const WorkflowProvider: React.FC<WorkflowProviderProps> = ({ children }) => {
  const [workflows, setWorkflows] = useState<WorkflowAction[]>([
    {
      id: 'WF-001',
      type: 'vulnerability',
      module: 'vulnerabilities',
      title: 'Patch Critical SQL Injection',
      description: 'CVE-2024-1234 requires immediate patching on web-server-01',
      priority: 'critical',
      status: 'pending',
      assignee: 'John Smith',
      due_date: '2024-01-15',
      asset_id: 'AST-001',
      created_at: '2024-01-10T10:00:00Z',
      updated_at: '2024-01-10T10:00:00Z',
      tags: ['security', 'critical', 'sql-injection'],
      related_workflows: ['WF-002']
    },
    {
      id: 'WF-002',
      type: 'compliance',
      module: 'compliance',
      title: 'PCI DSS Compliance Review',
      description: 'Quarterly compliance audit required for payment systems',
      priority: 'high',
      status: 'in_progress',
      assignee: 'Sarah Johnson',
      due_date: '2024-01-20',
      asset_id: 'AST-001',
      created_at: '2024-01-08T14:30:00Z',
      updated_at: '2024-01-12T09:15:00Z',
      tags: ['compliance', 'pci-dss', 'audit'],
      related_workflows: ['WF-001']
    },
    {
      id: 'WF-003',
      type: 'incident',
      module: 'incident-response',
      title: 'IoT Device Offline Investigation',
      description: 'Investigate why lobby camera lost network connectivity',
      priority: 'high',
      status: 'pending',
      assignee: 'Security Team',
      due_date: '2024-01-12',
      asset_id: 'AST-004',
      created_at: '2024-01-11T16:45:00Z',
      updated_at: '2024-01-11T16:45:00Z',
      tags: ['incident', 'iot', 'connectivity'],
      related_workflows: []
    }
  ]);

  const [notifications, setNotifications] = useState<NotificationAction[]>([
    {
      id: 'NOT-001',
      title: 'Critical Vulnerability Detected',
      message: 'SQL injection vulnerability found on web-server-01',
      type: 'error',
      module: 'vulnerabilities',
      action_required: true,
      timestamp: '2024-01-12T10:30:00Z',
      read: false
    },
    {
      id: 'NOT-002',
      title: 'Compliance Review Due',
      message: 'PCI DSS compliance review due in 3 days',
      type: 'warning',
      module: 'compliance',
      action_required: true,
      timestamp: '2024-01-12T09:00:00Z',
      read: false
    },
    {
      id: 'NOT-003',
      title: 'Asset Discovery Complete',
      message: '12 new assets discovered in network scan',
      type: 'success',
      module: 'assets',
      action_required: false,
      timestamp: '2024-01-12T08:15:00Z',
      read: true
    }
  ]);

  const [navigationContext, setNavigationContext] = useState<CrossModuleIntegration | null>(null);
  const [userRole, setUserRole] = useState<'ciso' | 'analyst' | 'manager' | 'admin'>('analyst');
  const [assetWorkflowMap, setAssetWorkflowMap] = useState<Record<string, string[]>>({
    'AST-001': ['WF-001', 'WF-002'],
    'AST-004': ['WF-003']
  });
  const [moduleMessages, setModuleMessages] = useState<Record<string, any[]>>({});

  // Workflow Management Functions
  const addWorkflow = (workflow: Omit<WorkflowAction, 'id' | 'created_at' | 'updated_at'>): string => {
    const id = `WF-${Date.now()}`;
    const now = new Date().toISOString();
    const newWorkflow: WorkflowAction = {
      ...workflow,
      id,
      created_at: now,
      updated_at: now
    };
    
    setWorkflows(prev => [...prev, newWorkflow]);
    
    // Add notification
    addNotification({
      title: 'New Workflow Created',
      message: `Workflow "${workflow.title}" has been created`,
      type: 'info',
      module: workflow.module,
      action_required: workflow.priority === 'critical'
    });
    
    // Link to asset if provided
    if (workflow.asset_id) {
      linkAssetToWorkflow(workflow.asset_id, id);
    }
    
    return id;
  };

  const updateWorkflow = (id: string, updates: Partial<WorkflowAction>) => {
    setWorkflows(prev => prev.map(w => 
      w.id === id 
        ? { ...w, ...updates, updated_at: new Date().toISOString() }
        : w
    ));
    
    // Add notification for status changes
    if (updates.status) {
      const workflow = workflows.find(w => w.id === id);
      if (workflow) {
        addNotification({
          title: 'Workflow Updated',
          message: `Workflow "${workflow.title}" status changed to ${updates.status}`,
          type: updates.status === 'completed' ? 'success' : 'info',
          module: workflow.module,
          action_required: false
        });
      }
    }
  };

  const getWorkflowsByAsset = (assetId: string): WorkflowAction[] => {
    return workflows.filter(w => w.asset_id === assetId);
  };

  const getWorkflowsByModule = (module: string): WorkflowAction[] => {
    return workflows.filter(w => w.module === module);
  };

  const getWorkflowsByStatus = (status: string): WorkflowAction[] => {
    return workflows.filter(w => w.status === status);
  };

  const getPendingCriticalWorkflows = (): WorkflowAction[] => {
    return workflows.filter(w => w.status === 'pending' && w.priority === 'critical');
  };

  // Cross-Module Navigation
  const navigateWithContext = (targetModule: string, context: CrossModuleIntegration) => {
    setNavigationContext(context);
    // In a real app, this would trigger navigation to the target module
    console.log(`Navigating to ${targetModule} with context:`, context);
  };

  const getNavigationContext = (): CrossModuleIntegration | null => {
    return navigationContext;
  };

  const clearNavigationContext = () => {
    setNavigationContext(null);
  };

  // Notification Management
  const addNotification = (notification: Omit<NotificationAction, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: NotificationAction = {
      ...notification,
      id: `NOT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const getUnreadNotifications = (): NotificationAction[] => {
    return notifications.filter(n => !n.read);
  };

  // Role-based Access
  const getUserPermissions = (): string[] => {
    const rolePermissions = {
      'ciso': ['view_all', 'create_workflows', 'assign_tasks', 'view_reports', 'manage_users', 'executive_actions'],
      'analyst': ['view_assets', 'create_workflows', 'manage_vulnerabilities', 'create_incidents', 'view_compliance'],
      'manager': ['view_team_assets', 'assign_tasks', 'view_team_reports', 'manage_team_workflows'],
      'admin': ['view_all', 'create_workflows', 'assign_tasks', 'view_reports', 'manage_users', 'system_admin']
    };
    
    return rolePermissions[userRole] || [];
  };

  // Analytics & Metrics
  const getWorkflowMetrics = () => {
    const total = workflows.length;
    const pending = workflows.filter(w => w.status === 'pending').length;
    const in_progress = workflows.filter(w => w.status === 'in_progress').length;
    const completed = workflows.filter(w => w.status === 'completed').length;
    const critical = workflows.filter(w => w.priority === 'critical').length;
    
    // Calculate overdue
    const now = new Date();
    const overdue = workflows.filter(w => {
      if (!w.due_date || w.status === 'completed') return false;
      return new Date(w.due_date) < now;
    }).length;
    
    return { total, pending, in_progress, completed, overdue, critical };
  };

  const getModuleActivityMetrics = (): Record<string, number> => {
    const moduleActivity: Record<string, number> = {};
    
    workflows.forEach(w => {
      moduleActivity[w.module] = (moduleActivity[w.module] || 0) + 1;
    });
    
    return moduleActivity;
  };

  // Asset Integration
  const linkAssetToWorkflow = (assetId: string, workflowId: string) => {
    setAssetWorkflowMap(prev => ({
      ...prev,
      [assetId]: [...(prev[assetId] || []), workflowId]
    }));
  };

  const unlinkAssetFromWorkflow = (assetId: string, workflowId: string) => {
    setAssetWorkflowMap(prev => ({
      ...prev,
      [assetId]: (prev[assetId] || []).filter(id => id !== workflowId)
    }));
  };

  // Module Communication
  const sendModuleMessage = (fromModule: string, toModule: string, message: any) => {
    const messageWithMetadata = {
      ...message,
      from: fromModule,
      timestamp: new Date().toISOString(),
      id: `MSG-${Date.now()}`
    };
    
    setModuleMessages(prev => ({
      ...prev,
      [toModule]: [...(prev[toModule] || []), messageWithMetadata]
    }));
  };

  const getModuleMessages = (module: string): any[] => {
    return moduleMessages[module] || [];
  };

  const clearModuleMessages = (module: string) => {
    setModuleMessages(prev => ({
      ...prev,
      [module]: []
    }));
  };

  const value: WorkflowContextType = {
    // Workflow Management
    workflows,
    addWorkflow,
    updateWorkflow,
    getWorkflowsByAsset,
    getWorkflowsByModule,
    getWorkflowsByStatus,
    getPendingCriticalWorkflows,
    
    // Cross-Module Navigation
    navigateWithContext,
    getNavigationContext,
    clearNavigationContext,
    
    // Notifications
    notifications,
    addNotification,
    markNotificationAsRead,
    getUnreadNotifications,
    
    // Role-based Access
    userRole,
    setUserRole,
    getUserPermissions,
    
    // Analytics & Metrics
    getWorkflowMetrics,
    getModuleActivityMetrics,
    
    // Asset Integration
    assetWorkflowMap,
    linkAssetToWorkflow,
    unlinkAssetFromWorkflow,
    
    // Module Communication
    sendModuleMessage,
    getModuleMessages,
    clearModuleMessages
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};