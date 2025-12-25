import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { useWorkflow } from './WorkflowContext';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Users,
  Target,
  Shield,
  FileText,
  Settings,
  ExternalLink,
  Zap,
  Activity
} from 'lucide-react';

interface WorkflowNavigationHeaderProps {
  currentModule: string;
  onModuleChange: (module: string) => void;
}

export const WorkflowNavigationHeader: React.FC<WorkflowNavigationHeaderProps> = ({
  currentModule,
  onModuleChange
}) => {
  const {
    notifications,
    getUnreadNotifications,
    markNotificationAsRead,
    getWorkflowMetrics,
    getPendingCriticalWorkflows,
    userRole,
    navigateWithContext
  } = useWorkflow();

  const unreadNotifications = getUnreadNotifications();
  const workflowMetrics = getWorkflowMetrics();
  const criticalWorkflows = getPendingCriticalWorkflows();

  const handleNavigateToModule = (module: string, context?: any) => {
    if (context) {
      navigateWithContext(module, {
        from_module: currentModule,
        to_module: module,
        context
      });
    }
    onModuleChange(module);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ciso':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'analyst':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'manager':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getQuickActions = () => {
    const baseActions = [
      {
        label: 'Scan Assets',
        module: 'vulnerabilities',
        icon: Shield,
        description: 'Run vulnerability scan',
        urgent: criticalWorkflows.length > 0
      },
      {
        label: 'Create Incident',
        module: 'incident-response',
        icon: AlertTriangle,
        description: 'Report security incident',
        urgent: false
      },
      {
        label: 'Risk Assessment',
        module: 'risk',
        icon: Target,
        description: 'Review risk dashboard',
        urgent: workflowMetrics.overdue > 0
      },
      {
        label: 'Compliance Check',
        module: 'compliance',
        icon: CheckCircle2,
        description: 'Review compliance status',
        urgent: false
      }
    ];

    // Role-specific actions
    const roleActions = {
      ciso: [
        {
          label: 'Executive Report',
          module: 'executive-report',
          icon: FileText,
          description: 'Generate executive summary',
          urgent: false
        }
      ],
      analyst: [
        {
          label: 'Events Monitor',
          module: 'events',
          icon: Activity,
          description: 'Monitor security events',
          urgent: false
        }
      ],
      manager: [
        {
          label: 'Team Dashboard',
          module: 'assets',
          icon: Users,
          description: 'Manage team assets',
          urgent: false
        }
      ]
    };

    return [...baseActions, ...(roleActions[userRole] || [])];
  };

  const quickActions = getQuickActions();

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Current Module Info */}
      <div className="flex items-center space-x-4">
        <div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            {workflowMetrics.pending > 0 && (
              <Badge variant="outline">
                {workflowMetrics.pending} pending tasks
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions & Notifications */}
      <div className="flex items-center space-x-2">
        {/* Workflow Metrics Summary */}
        <div className="hidden md:flex items-center space-x-3 mr-4">
          <div className="text-xs text-center">
            <div className="font-semibold text-green-600">{workflowMetrics.completed}</div>
            <div className="text-muted-foreground">Completed</div>
          </div>
          <div className="text-xs text-center">
            <div className="font-semibold text-blue-600">{workflowMetrics.in_progress}</div>
            <div className="text-muted-foreground">Active</div>
          </div>
          <div className="text-xs text-center">
            <div className="font-semibold text-orange-600">{workflowMetrics.pending}</div>
            <div className="text-muted-foreground">Pending</div>
          </div>
          {workflowMetrics.overdue > 0 && (
            <div className="text-xs text-center">
              <div className="font-semibold text-red-600">{workflowMetrics.overdue}</div>
              <div className="text-muted-foreground">Overdue</div>
            </div>
          )}
        </div>

        {/* Quick Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Zap className="h-4 w-4 mr-1" />
              Quick Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <DropdownMenuItem
                  key={action.label}
                  onClick={() => handleNavigateToModule(action.module)}
                  className={action.urgent ? 'bg-red-50 hover:bg-red-100' : ''}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <Icon className={`h-4 w-4 ${action.urgent ? 'text-red-600' : 'text-muted-foreground'}`} />
                    <div className="flex-1">
                      <div className="font-medium">{action.label}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                    {action.urgent && (
                      <Badge variant="destructive" className="text-xs">
                        Urgent
                      </Badge>
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {unreadNotifications.length > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  variant="destructive"
                >
                  {unreadNotifications.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Notifications</h3>
                <Badge variant="outline">
                  {unreadNotifications.length} unread
                </Badge>
              </div>
            </div>
            <ScrollArea className="h-80">
              <div className="p-2">
                {notifications.length > 0 ? (
                  notifications.slice(0, 10).map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`mb-2 cursor-pointer transition-colors ${
                        !notification.read 
                          ? 'border-l-4 border-l-blue-500 bg-blue-50/50' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        markNotificationAsRead(notification.id);
                        handleNavigateToModule(notification.module);
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">{notification.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {notification.module}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {new Date(notification.timestamp).toLocaleTimeString()}
                              </span>
                              {notification.action_required && (
                                <Badge variant="outline" className="text-xs">
                                  Action Required
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications</p>
                  </div>
                )}
              </div>
            </ScrollArea>
            {notifications.length > 10 && (
              <div className="p-3 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleNavigateToModule('events')}
                >
                  View All Notifications
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Critical Workflows Alert */}
        {criticalWorkflows.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="destructive" size="sm" className="animate-pulse">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {criticalWorkflows.length} Critical
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <h3 className="font-semibold text-red-700">Critical Workflows</h3>
                </div>
                <div className="space-y-2">
                  {criticalWorkflows.slice(0, 3).map((workflow) => (
                    <Card key={workflow.id} className="border-red-200">
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">{workflow.title}</h4>
                            <Badge variant="destructive" className="text-xs">
                              {workflow.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {workflow.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Due: {workflow.due_date ? new Date(workflow.due_date).toLocaleDateString() : 'No deadline'}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs"
                              onClick={() => handleNavigateToModule(workflow.module, { workflow_id: workflow.id })}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Open
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {criticalWorkflows.length > 3 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleNavigateToModule('incident-response')}
                  >
                    View All Critical Workflows
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Settings */}
        <Button variant="ghost" size="sm" onClick={() => handleNavigateToModule('settings')}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};