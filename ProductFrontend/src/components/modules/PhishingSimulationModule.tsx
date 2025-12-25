import { useState, useEffect } from 'react';
import { useWorkflow } from '../WorkflowContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Progress } from '../ui/progress';
import {
  Mail,
  Send,
  Target,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  Eye,
  Plus,
  Play,
  Pause,
  Users,
  Activity,
  Brain,
  CheckCircle2,
  XCircle,
  MousePointer,
  MessageSquare,
  Key,
  Zap,
  Radio,
  ArrowUpRight,
  ArrowDownRight,
  Gauge,
  AlertCircle,
  Calendar,
  Filter,
  Loader,
  Lock
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// ============================================
// API CONFIGURATION
// ============================================
const API_BASE_URL = "http://localhost:8000/api/phishing-simulation";

// ============================================
// INTERFACES
// ============================================

interface SimulationCampaign {
  campaign_id: string;
  name: string;
  status: string;
  targets_count: number;
  click_rate: number;
  report_rate: number;
  credentials_captured: number;
  risk_score: number;
  start_date: string;
  template_id?: string; // Optional if joined
}

interface PhishingTemplate {
  template_id: string;
  name: string;
  category: string;
  difficulty: string;
  success_rate: number;
  tactics: string[];
  content_preview: string;
}

interface PhishingSimulationModuleProps {
  onModuleChange?: (module: string) => void;
}

export function PhishingSimulationModule({ onModuleChange }: PhishingSimulationModuleProps = {}) {
  const { addWorkflow } = useWorkflow();

  // State Management
  const [campaigns, setCampaigns] = useState<SimulationCampaign[]>([]);
  const [templates, setTemplates] = useState<PhishingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // UI State
  const [showNewCampaignDialog, setShowNewCampaignDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    campaignName: '',
    templateId: '',
    startDate: '',
    endDate: '',
    targetUsers: ''
  });

  // ============================================
  // DATA FETCHING
  // ============================================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campaignsRes, templatesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/campaigns`),
        fetch(`${API_BASE_URL}/templates`)
      ]);

      if (campaignsRes.ok) {
        const data = await campaignsRes.json();
        setCampaigns(data.data || []);
      }
      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data.data || []);
      }
    } catch (err) {
      console.error("Error loading simulation data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ACTIONS
  // ============================================

  const handleCreateCampaign = async () => {
    setActionLoading('create');
    try {
      // 1. Call Backend API
      const res = await fetch(`${API_BASE_URL}/campaigns/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.campaignName,
          template_id: formData.templateId,
          target_count: formData.targetUsers === 'all' ? 1247 : 50 // Mock logic for count
        })
      });

      if (res.ok) {
        // 2. Add to Workflow Context (Frontend State)
        addWorkflow({
          id: `sim-campaign-${Date.now()}`,
          title: `New Phishing Simulation: ${formData.campaignName}`,
          description: `Scheduled simulation campaign targeting ${formData.targetUsers}`,
          status: 'pending',
          priority: 'medium',
          assignedTo: 'Security Awareness Team'
        });

        alert("✅ Campaign Created Successfully!");
        setShowNewCampaignDialog(false);

        // 3. Reset Form
        setFormData({
          campaignName: '',
          templateId: '',
          startDate: '',
          endDate: '',
          targetUsers: ''
        });

        // 4. Refresh List
        fetchData();
      } else {
        alert("Failed to create campaign on server.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    } finally {
      setActionLoading(null);
    }
  };

  const previewTemplate = (template: PhishingTemplate) => {
    alert(`PREVIEW: ${template.name}\n\n${template.content_preview}`);
  };

  // ============================================
  // STATIC DATA (KPIs & Charts - Backend doesn't provide these yet)
  // ============================================

  const executiveKPIs = {
    humanRiskExposure: {
      score: 6.8,
      maxScore: 10,
      rating: 'Medium Risk',
      trend: -0.7,
      change: 'down'
    },
    failureSusceptibility: {
      value: 18.2,
      trend: -4.3,
      change: 'down',
      target: 10.0
    },
    resilienceRate: {
      value: 67.8,
      trend: +8.2,
      change: 'up',
      target: 80.0
    },
    credentialCompromise: {
      value: 34,
      trend: -12,
      change: 'down',
      risk: 'High'
    }
  };

  const threatStoryline = {
    title: "Executive-targeted attacks showing 4.3% click rate decrease",
    summary: "This month's simulations reveal improved awareness across finance and HR teams. However, 34 credential compromises occurred in CEO impersonation scenarios. High-risk user cluster identified: 12 users with 3+ failures.",
    keyDeviations: [
      "Finance team improved 12% in reporting suspicious emails",
      "Executive impersonation template remains most effective (32% click rate)",
      "IT department shows highest resilience (89% report rate)"
    ]
  };

  const behaviorTrend = [
    { day: 'Day 1', attempts: 85, clicks: 19, reports: 58 },
    { day: 'Day 2', attempts: 92, clicks: 17, reports: 64 },
    { day: 'Day 3', attempts: 78, clicks: 14, reports: 59 },
    { day: 'Day 4', attempts: 88, clicks: 16, reports: 67 },
    { day: 'Day 5', attempts: 95, clicks: 15, reports: 72 }
  ];

  const userResponseDistribution = [
    { name: 'Reported Correctly', value: 67.8, color: '#22c55e' },
    { name: 'Clicked Link', value: 18.2, color: '#ef4444' },
    { name: 'Ignored', value: 14.0, color: '#6b7280' }
  ];

  const highRiskUserCount = 12;

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-600';
      case 'completed': return 'bg-gray-600';
      case 'scheduled': return 'bg-blue-600';
      default: return 'bg-gray-400';
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'hard': return 'bg-red-600';
      case 'medium': return 'bg-yellow-600';
      case 'easy': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 7.0) return 'text-red-600';
    if (score >= 5.0) return 'text-orange-600';
    if (score >= 3.0) return 'text-yellow-600';
    return 'text-green-600';
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER BLOCK */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white rounded-lg p-8 shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <Shield className="h-10 w-10" />
          <h1 className="text-4xl font-bold">Phishing Simulation</h1>
        </div>
        <h2 className="text-xl text-blue-100">Human Risk & Awareness Dashboard</h2>
        <p className="text-blue-200 mt-2">Track, simulate, and strengthen organizational resilience to phishing threats.</p>
      </div>

      {/* EXECUTIVE KPI TILES */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Human Risk Exposure Index */}
        <Card className="border-2 border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center space-x-2">
              <Gauge className="h-4 w-4" />
              <span>Human Risk Exposure Index</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between mb-3">
              <div>
                <div className="text-5xl font-bold text-orange-600">
                  {executiveKPIs.humanRiskExposure.score}
                </div>
                <div className="text-sm text-muted-foreground">
                  /{executiveKPIs.humanRiskExposure.maxScore} scale
                </div>
              </div>
              <Badge className="bg-orange-600 text-white">
                {executiveKPIs.humanRiskExposure.rating}
              </Badge>
            </div>
            <Progress
              value={(executiveKPIs.humanRiskExposure.score / executiveKPIs.humanRiskExposure.maxScore) * 100}
              className="h-3 mb-2"
            />
            <div className="flex items-center space-x-1 text-xs">
              <ArrowDownRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600 font-semibold">
                {Math.abs(executiveKPIs.humanRiskExposure.trend)} points lower
              </span>
              <span className="text-muted-foreground">this quarter</span>
            </div>
          </CardContent>
        </Card>

        {/* Failure Susceptibility */}
        <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center space-x-2">
              <MousePointer className="h-4 w-4" />
              <span>Failure Susceptibility</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-red-600">
              {executiveKPIs.failureSusceptibility.value}%
            </div>
            <div className="text-sm text-muted-foreground mb-3">Click Rate</div>
            <div className="flex items-center space-x-1 text-xs mb-2">
              <ArrowDownRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600 font-semibold">
                {Math.abs(executiveKPIs.failureSusceptibility.trend)}%
              </span>
              <span className="text-muted-foreground">improvement</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Target: {executiveKPIs.failureSusceptibility.target}%
            </div>
          </CardContent>
        </Card>

        {/* Resilience Rate */}
        <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Resilience Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-green-600">
              {executiveKPIs.resilienceRate.value}%
            </div>
            <div className="text-sm text-muted-foreground mb-3">Report Rate</div>
            <div className="flex items-center space-x-1 text-xs mb-2">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600 font-semibold">
                +{executiveKPIs.resilienceRate.trend}%
              </span>
              <span className="text-muted-foreground">improvement</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Target: {executiveKPIs.resilienceRate.target}%
            </div>
          </CardContent>
        </Card>

        {/* Credential Compromise Count */}
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>Credential Compromises</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-purple-600">
              {executiveKPIs.credentialCompromise.value}
            </div>
            <div className="text-sm text-muted-foreground mb-3">This period</div>
            <div className="flex items-center space-x-1 text-xs mb-2">
              <ArrowDownRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600 font-semibold">
                {Math.abs(executiveKPIs.credentialCompromise.trend)} fewer
              </span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
            <Badge variant="destructive">
              {executiveKPIs.credentialCompromise.risk} Risk
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* THREAT STORYLINE PANEL */}
      <Card className="border-2 border-blue-900 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-900 flex items-center space-x-2">
            <Radio className="h-6 w-6" />
            <span>What&apos;s happening this month?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-900 mb-2">{threatStoryline.title}</h3>
            <p className="text-slate-700 leading-relaxed">{threatStoryline.summary}</p>
          </div>

          <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
            <h4 className="font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span>Key Deviations Detected</span>
            </h4>
            <ul className="space-y-2">
              {threatStoryline.keyDeviations.map((deviation, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{deviation}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* BEHAVIOR ANALYTICS SECTION */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 5-Day Trend Chart */}
        <Card className="shadow-lg lg:col-span-2 border-2 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>5-Day Behavior Trend</span>
            </CardTitle>
            <CardDescription>Simulation attempts, clicks, and reports over 5 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={behaviorTrend}>
                <defs>
                  <linearGradient id="colorAttemptsSim" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorClicksSim" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorReportsSim" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="attempts" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAttemptsSim)" name="Attempts" />
                <Area type="monotone" dataKey="clicks" stroke="#ef4444" fillOpacity={1} fill="url(#colorClicksSim)" name="Clicks" />
                <Area type="monotone" dataKey="reports" stroke="#22c55e" fillOpacity={1} fill="url(#colorReportsSim)" name="Reports" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Response Donut */}
        <Card className="shadow-lg border-2 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span>User Response Distribution</span>
            </CardTitle>
            <CardDescription>Response breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={userResponseDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={(entry) => `${entry.value}%`}
                >
                  {userResponseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {userResponseDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <span className="text-lg font-bold" style={{ color: item.color }}>
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-bold text-red-800">
                  {highRiskUserCount} high-risk users identified
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SIMULATION CAMPAIGN TABLE */}
      <Card className="shadow-lg border-2 border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span>Simulation Campaigns</span>
              </CardTitle>
              <CardDescription>Active, completed, and scheduled phishing simulations</CardDescription>
            </div>
            <Button
              onClick={() => setShowNewCampaignDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100">
                  <TableHead className="font-bold">Campaign Name</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Targets</TableHead>
                  <TableHead className="font-bold">Click Rate</TableHead>
                  <TableHead className="font-bold">Report Rate</TableHead>
                  <TableHead className="font-bold">Credentials</TableHead>
                  <TableHead className="font-bold">Risk Score</TableHead>
                  <TableHead className="font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.campaign_id} className="hover:bg-slate-50">
                    <TableCell>
                      <div>
                        <div className="font-semibold">{campaign.name}</div>
                        <div className="text-xs text-muted-foreground">{campaign.campaign_id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(campaign.status)} text-white`}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{campaign.targets_count}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MousePointer className="h-3 w-3 text-red-600" />
                        <span className="font-bold text-red-600">{campaign.click_rate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-3 w-3 text-green-600" />
                        <span className="font-bold text-green-600">{campaign.report_rate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={campaign.credentials_captured > 0 ? "destructive" : "outline"} className="font-bold">
                        {campaign.credentials_captured}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`text-lg font-bold ${getRiskScoreColor(campaign.risk_score)}`}>
                        {campaign.risk_score}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        {campaign.status === 'Active' && (
                          <Button variant="outline" size="sm">
                            <Pause className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* TEMPLATES GALLERY */}
      <Card id="template-gallery" className="shadow-lg border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-purple-600" />
            <span>Phishing Templates Gallery</span>
          </CardTitle>
          <CardDescription>Pre-built simulation templates with difficulty ratings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <div
                key={template.template_id}
                className={`border-2 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${selectedTemplate === template.template_id ? 'border-blue-600 bg-blue-50' : 'border-slate-200'
                  }`}
                onClick={() => setSelectedTemplate(template.template_id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1">{template.name}</h4>
                    <Badge variant="outline" className="text-xs mb-2">
                      {template.category}
                    </Badge>
                  </div>
                  <Badge className={`${getDifficultyColor(template.difficulty)} text-white`}>
                    {template.difficulty}
                  </Badge>
                </div>

                <div className="bg-slate-100 border rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Success Rate</span>
                    <span className="text-lg font-bold text-red-600">{template.success_rate}%</span>
                  </div>
                  <Progress value={template.success_rate} className="h-2" />
                </div>

                <div className="mb-3">
                  <div className="text-xs font-semibold text-muted-foreground mb-1">Tactics Used:</div>
                  <div className="flex flex-wrap gap-1">
                    {template.tactics.map((tactic, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tactic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); previewTemplate(template); }}>
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({ ...formData, templateId: template.template_id });
                      setShowNewCampaignDialog(true);
                    }}
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CREATE CAMPAIGN MODAL */}
      <Dialog open={showNewCampaignDialog} onOpenChange={setShowNewCampaignDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center space-x-2">
              <Zap className="h-6 w-6 text-blue-600" />
              <span>Create New Phishing Simulation Campaign</span>
            </DialogTitle>
            <DialogDescription>
              Configure your simulation campaign with target audience and timeline
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Campaign Name */}
            <div className="space-y-2">
              <Label htmlFor="campaignName" className="text-sm font-semibold">
                Campaign Name *
              </Label>
              <Input
                id="campaignName"
                placeholder="e.g., Q2 Executive Awareness Training"
                value={formData.campaignName}
                onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                className="border-2"
              />
            </div>

            {/* Template Select */}
            <div className="space-y-2">
              <Label htmlFor="template" className="text-sm font-semibold">
                Phishing Template *
              </Label>
              <Select
                value={formData.templateId}
                onValueChange={(value) => setFormData({ ...formData, templateId: value })}
              >
                <SelectTrigger className="border-2">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.template_id} value={template.template_id}>
                      <div className="flex items-center space-x-2">
                        <span>{template.name}</span>
                        <Badge className="text-xs" variant="outline">
                          {template.difficulty}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Pickers */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-semibold">
                  Start Date *
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="border-2 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-semibold">
                  End Date *
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="border-2 pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Target Users */}
            <div className="space-y-2">
              <Label htmlFor="targetUsers" className="text-sm font-semibold">
                Target User Group *
              </Label>
              <Select
                value={formData.targetUsers}
                onValueChange={(value) => setFormData({ ...formData, targetUsers: value })}
              >
                <SelectTrigger className="border-2">
                  <SelectValue placeholder="Select target group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees (1,247 users)</SelectItem>
                  <SelectItem value="executives">Executives (45 users)</SelectItem>
                  <SelectItem value="finance">Finance Team (89 users)</SelectItem>
                  <SelectItem value="hr">HR Department (67 users)</SelectItem>
                  <SelectItem value="it">IT Operations (134 users)</SelectItem>
                  <SelectItem value="sales">Sales Team (312 users)</SelectItem>
                  <SelectItem value="custom">Custom Group...</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Campaign Best Practices:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Schedule campaigns during business hours for realistic scenarios</li>
                    <li>Allow 2-3 weeks for user reporting and data collection</li>
                    <li>Follow up with targeted training for users who click</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowNewCampaignDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              onClick={handleCreateCampaign}
              disabled={!formData.campaignName || !formData.templateId || !formData.startDate || !formData.endDate || !formData.targetUsers || actionLoading === 'create'}
            >
              {actionLoading === 'create' ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
              Create Campaign
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}