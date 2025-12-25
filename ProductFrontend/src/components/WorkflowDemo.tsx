import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useWorkflow } from './WorkflowContext';
import { IntegrationSummary } from './IntegrationSummary';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  ArrowRight,
  Target,
  Shield,
  FileText,
  Activity,
  TrendingUp
} from 'lucide-react';

export const WorkflowDemo: React.FC = () => {
  const {
    workflows,
    getWorkflowMetrics,
    addWorkflow,
    updateWorkflow,
    notifications,
    userRole,
    setUserRole
  } = useWorkflow();

  const metrics = getWorkflowMetrics();

  const handleCreateSampleWorkflow = () => {
    addWorkflow({
      type: 'vulnerability',
      module: 'vulnerabilities',
      title: 'Demo: Critical Vulnerability Remediation',
      description: 'Sample workflow demonstrating cross-module integration',
      priority: 'critical',
      status: 'pending',
      assignee: 'Demo User',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      asset_id: 'AST-DEMO-001',
      tags: ['demo', 'critical', 'vulnerability']
    });
  };

  const handleCompleteWorkflow = (workflowId: string) => {
    updateWorkflow(workflowId, { status: 'completed' });
  };

  return (
    <Tabs defaultValue="demo" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="demo">Interactive Demo</TabsTrigger>
        <TabsTrigger value="summary">Implementation Summary</TabsTrigger>
        <TabsTrigger value="architecture">Technical Details</TabsTrigger>
      </TabsList>
      
      <TabsContent value="demo" className="space-y-6 mt-6">
        {/* Demo Header */}
        <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span>Workflow Integration Demo</span>
          </CardTitle>
          <CardDescription>
            This demo showcases the comprehensive workflow integration capabilities of CRV360
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button onClick={handleCreateSampleWorkflow}>
              Create Sample Workflow
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Role:</span>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as any)}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="analyst">Security Analyst</option>
                <option value="ciso">CISO</option>
                <option value="manager">IT Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Metrics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.in_progress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.critical}</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Workflows */}
      <Card>
        <CardHeader>
          <CardTitle>Active Workflows</CardTitle>
          <CardDescription>
            Current workflows across all security modules with cross-module integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflows.filter(w => w.status !== 'completed').map((workflow) => (
              <Card key={workflow.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={workflow.priority === 'critical' ? 'destructive' : 'secondary'}
                      >
                        {workflow.priority}
                      </Badge>
                      <Badge variant="outline">{workflow.module}</Badge>
                      <Badge 
                        variant={workflow.status === 'pending' ? 'secondary' : 'default'}
                      >
                        {workflow.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      {workflow.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateWorkflow(workflow.id, { status: 'in_progress' })}
                        >
                          Start
                        </Button>
                      )}
                      {workflow.status === 'in_progress' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleCompleteWorkflow(workflow.id)}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                  <h4 className="font-medium">{workflow.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{workflow.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Assigned to: {workflow.assignee || 'Unassigned'}</span>
                    <span>Due: {workflow.due_date ? new Date(workflow.due_date).toLocaleDateString() : 'No deadline'}</span>
                  </div>
                  {workflow.asset_id && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        Asset: {workflow.asset_id}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {workflows.filter(w => w.status !== 'completed').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active workflows</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={handleCreateSampleWorkflow}
                >
                  Create Sample Workflow
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>
            Real-time alerts and workflow updates across all modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => (
              <Alert key={notification.id} className={!notification.read ? 'border-l-4 border-l-blue-500' : ''}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>{notification.title}</strong>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{notification.module}</Badge>
                      <span>{new Date(notification.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Features */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cross-Module Integration</CardTitle>
            <CardDescription>
              How workflows connect different security modules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Shield className="h-6 w-6 text-blue-500" />
                <div className="flex-1">
                  <div className="font-medium">Asset Management</div>
                  <div className="text-sm text-muted-foreground">
                    Triggers vulnerability scans and compliance checks
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
                <div className="flex-1">
                  <div className="font-medium">Vulnerability Management</div>
                  <div className="text-sm text-muted-foreground">
                    Creates incidents and assigns remediation tasks
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Target className="h-6 w-6 text-green-500" />
                <div className="flex-1">
                  <div className="font-medium">Risk Dashboard</div>
                  <div className="text-sm text-muted-foreground">
                    Updates risk scores and compliance status
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role-Based Features</CardTitle>
            <CardDescription>
              Customized experience based on user role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline">CISO</Badge>
                  <span className="font-medium">Executive View</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Strategic dashboards, executive reports, high-level metrics
                </div>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline">Analyst</Badge>
                  <span className="font-medium">Operational View</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Detailed analysis, vulnerability management, incident response
                </div>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline">Manager</Badge>
                  <span className="font-medium">Team Management</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Team performance, resource allocation, task assignments
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Completion Progress</CardTitle>
          <CardDescription>
            Overall progress across all security workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Overall Completion Rate</span>
              <span className="font-medium">
                {metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0}%
              </span>
            </div>
            <Progress 
              value={metrics.total > 0 ? (metrics.completed / metrics.total) * 100 : 0} 
              className="h-3"
            />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-green-600">{metrics.completed}</div>
                <div className="text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">{metrics.in_progress}</div>
                <div className="text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-orange-600">{metrics.pending}</div>
                <div className="text-muted-foreground">Pending</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </TabsContent>
      
      <TabsContent value="summary" className="mt-6">
        <IntegrationSummary />
      </TabsContent>
      
      <TabsContent value="architecture" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Technical Architecture Overview</CardTitle>
            <CardDescription>
              Deep dive into the implementation details and system architecture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  <strong>Production-Ready Implementation:</strong> The CRV360 workflow integration 
                  uses modern React patterns, TypeScript, and enterprise-grade architecture principles 
                  for scalability and maintainability.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Core Technologies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>• <strong>React 18</strong> with TypeScript for type safety</div>
                      <div>• <strong>Context API</strong> for global state management</div>
                      <div>• <strong>Tailwind CSS v4</strong> for responsive design</div>
                      <div>• <strong>Radix UI</strong> for accessible components</div>
                      <div>• <strong>Lucide React</strong> for consistent iconography</div>
                      <div>• <strong>Recharts</strong> for data visualization</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Key Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>• <strong>Cross-module workflows</strong> with context preservation</div>
                      <div>• <strong>Real-time notifications</strong> with priority routing</div>
                      <div>• <strong>Role-based access control</strong> and UI customization</div>
                      <div>• <strong>Actionable insights</strong> with direct workflow creation</div>
                      <div>• <strong>Responsive design</strong> for desktop and mobile</div>
                      <div>• <strong>Professional styling</strong> with dark mode support</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Integration Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none text-sm">
                    <p>
                      The workflow integration system is designed to seamlessly connect all 9 security modules:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                      <li><strong>Asset & Network Management:</strong> Central hub for asset discovery, monitoring, and workflow initiation</li>
                      <li><strong>Vulnerability & Threat Intel:</strong> Automated vulnerability assessment and threat correlation</li>
                      <li><strong>Risk Exposure Dashboard:</strong> Real-time risk scoring and compliance tracking</li>
                      <li><strong>Policy & Compliance Tracker:</strong> Automated compliance monitoring and reporting</li>
                      <li><strong>Events & Alert Monitoring:</strong> Real-time event processing and alert management</li>
                      <li><strong>Phishing Intelligence:</strong> Email security and threat intelligence integration</li>
                      <li><strong>Phishing Simulation:</strong> Campaign management and user awareness training</li>
                      <li><strong>Incident Response Lite:</strong> Streamlined incident management and response</li>
                      <li><strong>Executive Report:</strong> Strategic dashboards and executive reporting</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Future Enhancements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="font-medium mb-2">Phase 2 - External Integrations</div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>• CrowdStrike API integration</div>
                        <div>• AWS GuardDuty connectivity</div>
                        <div>• Microsoft Sentinel integration</div>
                        <div>• Splunk SIEM connector</div>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium mb-2">Phase 3 - Advanced Features</div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>• Machine learning risk prediction</div>
                        <div>• Automated playbook execution</div>
                        <div>• Advanced analytics dashboard</div>
                        <div>• Mobile app companion</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};