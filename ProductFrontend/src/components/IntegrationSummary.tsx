import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { useWorkflow } from './WorkflowContext';
import {
  CheckCircle2,
  Activity,
  Shield,
  Target,
  Users,
  Bell,
  ArrowRight,
  Zap,
  FileText,
  Settings,
  AlertTriangle
} from 'lucide-react';

export const IntegrationSummary: React.FC = () => {
  const { userRole, workflows, notifications } = useWorkflow();

  const integrationFeatures = [
    {
      title: 'Enhanced Asset Management',
      description: 'Asset inventory with workflow integration, risk scoring, and cross-module actions',
      status: 'Implemented',
      icon: Shield,
      capabilities: [
        'Real-time asset discovery and monitoring',
        'Risk-based asset classification',
        'Direct workflow creation from asset details',
        'Cross-module navigation with context',
        'Role-based asset management dashboards'
      ]
    },
    {
      title: 'Workflow Context System',
      description: 'Comprehensive workflow management across all security modules',
      status: 'Implemented',
      icon: Activity,
      capabilities: [
        'Cross-module workflow tracking',
        'Real-time notifications and alerts',
        'Role-based access control',
        'Task assignment and collaboration',
        'Workflow metrics and analytics'
      ]
    },
    {
      title: 'Enhanced Navigation',
      description: 'Smart navigation with workflow awareness and quick actions',
      status: 'Implemented',
      icon: ArrowRight,
      capabilities: [
        'Context-aware module navigation',
        'Quick action menus for common tasks',
        'Critical workflow alerts',
        'Real-time notification system',
        'Role-based dashboard customization'
      ]
    },
    {
      title: 'Role-Based Customization',
      description: 'Tailored experiences for different user roles and responsibilities',
      status: 'Implemented',
      icon: Users,
      capabilities: [
        'CISO executive dashboards',
        'Security analyst operational views',
        'IT manager team management tools',
        'Admin system configuration access',
        'Customizable metrics and KPIs'
      ]
    },
    {
      title: 'Cross-Module Integration',
      description: 'Seamless data and workflow sharing between security modules',
      status: 'Implemented',
      icon: Target,
      capabilities: [
        'Asset-to-vulnerability linking',
        'Risk assessment automation',
        'Incident response workflows',
        'Compliance status tracking',
        'Executive reporting integration'
      ]
    }
  ];

  const moduleConnections = [
    {
      from: 'Asset Management',
      to: 'Vulnerability Assessment',
      description: 'Automatically triggers vulnerability scans for new or changed assets',
      icon: Shield
    },
    {
      from: 'Vulnerability Assessment',
      to: 'Incident Response',
      description: 'Creates incidents for critical vulnerabilities requiring immediate attention',
      icon: AlertTriangle
    },
    {
      from: 'Risk Dashboard',
      to: 'Compliance Tracker',
      description: 'Updates compliance status based on risk assessments and remediation',
      icon: Target
    },
    {
      from: 'All Modules',
      to: 'Executive Reporting',
      description: 'Aggregates data for comprehensive security posture reporting',
      icon: FileText
    }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Alert className="border-blue-200 bg-blue-50">
        <CheckCircle2 className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <strong>CRV360 Workflow Integration Complete!</strong> The enhanced cybersecurity dashboard 
          now features comprehensive workflow integration across all 9 security modules with 
          role-based customization and actionable insights.
        </AlertDescription>
      </Alert>

      {/* Current User Context */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Current User Context</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm text-muted-foreground">Current Role</div>
              <Badge variant="outline" className="mt-1">
                {userRole.toUpperCase()}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Active Workflows</div>
              <div className="text-lg font-semibold">{workflows.length}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Unread Notifications</div>
              <div className="text-lg font-semibold">{notifications.filter(n => !n.read).length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Features */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Summary</CardTitle>
          <CardDescription>
            Overview of all implemented workflow integration features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {integrationFeatures.map((feature, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <feature.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {feature.status}
                  </Badge>
                </div>
                <div className="ml-12">
                  <div className="text-sm font-medium mb-2">Key Capabilities:</div>
                  <div className="grid gap-1">
                    {feature.capabilities.map((capability, capIndex) => (
                      <div key={capIndex} className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span>{capability}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Module Connections */}
      <Card>
        <CardHeader>
          <CardTitle>Cross-Module Workflow Connections</CardTitle>
          <CardDescription>
            How different security modules integrate and share workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {moduleConnections.map((connection, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="flex items-center space-x-3 flex-1">
                  <connection.icon className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">{connection.from}</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center space-x-3 flex-1">
                  <div>
                    <div className="font-medium">{connection.to}</div>
                  </div>
                </div>
                <div className="flex-2 text-sm text-muted-foreground">
                  {connection.description}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Architecture */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Architecture</CardTitle>
          <CardDescription>
            Core components and technologies powering the workflow integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <span className="font-medium">WorkflowContext</span>
              </div>
              <p className="text-sm text-muted-foreground">
                React Context API for global workflow state management and cross-module communication
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Bell className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Notification System</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time alerts and notifications with priority-based routing and action requirements
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <ArrowRight className="h-4 w-4 text-green-600" />
                <span className="font-medium">Smart Navigation</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Context-aware navigation with workflow preservation and module integration
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Role-Based Access</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Granular permissions and customized experiences based on user roles and responsibilities
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">Action Framework</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Direct action buttons and workflow automation for converting insights into tasks
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Settings className="h-4 w-4 text-gray-600" />
                <span className="font-medium">Module Integration</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Seamless data sharing and workflow handoffs between all 9 security modules
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Ready for Production</CardTitle>
          <CardDescription className="text-green-700">
            The enhanced CRV360 platform is now ready for deployment with full workflow integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>✅ All 9 security modules integrated with workflow system</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>✅ Role-based dashboards for CISO, Analyst, and Manager personas</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>✅ Real-time notifications and cross-module navigation</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>✅ Actionable insights with direct workflow creation</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>✅ Comprehensive demo and documentation</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};