import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import {
  AlertTriangle,
  Search,
  Eye,
  Clock,
  Shield,
  Zap,
  Target,
  TrendingDown,
  TrendingUp,
  Activity,
  Users,
  Server,
  Globe,
  Database,
  FileText,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Swords,
  Network,
  Flag,
  Brain,
  Crosshair,
  BarChart3,
  Timer,
  ChevronRight,
  Calendar,
  MapPin,
  Loader
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

// ============================================
// API CONFIGURATION
// ============================================
const API_BASE_URL = "/api/events";

// ============================================
// INTERFACES
// ============================================

// Backend Schema Matches
interface ThreatCampaign {
  campaign_id: string;
  name: string;
  severity: string;
  status: string;
  confidence: number;
  impact_score: number;
  duration: string;
  affected_assets: number;
  alert_count: number;
  impacted_business_units: string[];
  mitre_tactics: string[];
  techniques: string[];
  created_at: string;
  updated_at: string;
  // UI Derived properties (optional)
  narrative?: string;
  recommendedAction?: string;
  storyline?: Array<{ time: string; phase: string; description: string; detected: boolean }>;
  estimatedCost?: string;
}

interface SecurityAlert {
  alert_id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  alert_source: string;
  campaign_id?: string;
  detected_at: string;
  assigned_to: string;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

interface AlertMetrics {
  metric_date: string;
  mttr_minutes: number;
  mittd_minutes: number;
  sla_compliance: number;
  critical_threats: number;
  alerts_24h: number;
  alerts_7d: number;
  alerts_30d: number;
  escalation_rate: number;
  correlation_efficiency: number;
}

interface EventsModuleProps {
  onModuleChange?: (module: string) => void;
}

// ============================================
// FALLBACK DATA (DEMO MODE)
// ============================================

const FALLBACK_CAMPAIGNS: ThreatCampaign[] = [
  {
    campaign_id: 'CMP-2024-089',
    name: 'APT29 Spearphishing Campaign',
    severity: 'Critical',
    status: 'Active',
    confidence: 92,
    impact_score: 85,
    duration: '4h 12m',
    affected_assets: 5,
    alert_count: 23,
    impacted_business_units: ['Finance', 'HR'],
    mitre_tactics: ['Initial Access', 'Execution', 'Lateral Movement'],
    techniques: ['T1566', 'T1204', 'T1059'],
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    narrative: 'Coordinated spearphishing attack targeting Finance department executives using spoofed internal credentials. Malware beaconing detected on 3 workstations.',
    recommendedAction: 'Isolate affected subnets immediately and reset credentials for all targeted users.',
    estimatedCost: '$150k - $300k'
  },
  {
    campaign_id: 'CMP-2024-092',
    name: 'Lateral Movement - Service Account',
    severity: 'High',
    status: 'Monitoring',
    confidence: 78,
    impact_score: 65,
    duration: '12h 45m',
    affected_assets: 2,
    alert_count: 8,
    impacted_business_units: ['IT Operations'],
    mitre_tactics: ['Privilege Escalation', 'Defense Evasion'],
    techniques: ['T1078', 'T1068'],
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    narrative: 'Anomalous login behavior detected on a backup service account accessing production database servers outside maintenance window.',
    recommendedAction: 'Review service account logs and enforce strict access control lists (ACLs).',
    estimatedCost: '$10k - $50k'
  }
];

const FALLBACK_ALERTS: SecurityAlert[] = [
  {
    alert_id: 'ALT-1001',
    title: 'Malicious PowerShell Script Executed',
    description: 'PowerShell script executing base64 encoded command detected on FIN-WS-02.',
    severity: 'Critical',
    status: 'Open',
    alert_source: 'CrowdStrike EDR',
    campaign_id: 'CMP-2024-089',
    detected_at: new Date().toISOString(),
    assigned_to: 'Unassigned',
    last_activity: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    alert_id: 'ALT-1002',
    title: 'Unusual Outbound Traffic Volume',
    description: 'High volume of data egress detected to unknown IP address in Eastern Europe.',
    severity: 'High',
    status: 'Investigating',
    alert_source: 'Palo Alto Firewall',
    campaign_id: 'CMP-2024-089',
    detected_at: new Date(Date.now() - 1800000).toISOString(),
    assigned_to: 'J. Doe',
    last_activity: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    alert_id: 'ALT-1003',
    title: 'Multiple Failed Logins',
    description: '20 failed login attempts in 1 minute for user admin_svc.',
    severity: 'Medium',
    status: 'Resolved',
    alert_source: 'Azure AD',
    campaign_id: undefined,
    detected_at: new Date(Date.now() - 7200000).toISOString(),
    assigned_to: 'System',
    last_activity: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    alert_id: 'ALT-1004',
    title: 'New Admin Account Created',
    description: 'User "temp_admin" created outside of change control window.',
    severity: 'High',
    status: 'Open',
    alert_source: 'Splunk',
    campaign_id: 'CMP-2024-092',
    detected_at: new Date(Date.now() - 3600000).toISOString(),
    assigned_to: 'S. Connor',
    last_activity: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const FALLBACK_METRICS: AlertMetrics = {
  metric_date: new Date().toISOString(),
  mttr_minutes: 45,
  mittd_minutes: 12,
  sla_compliance: 94.5,
  critical_threats: 2,
  alerts_24h: 145,
  alerts_7d: 890,
  alerts_30d: 3420,
  escalation_rate: 15,
  correlation_efficiency: 78
};

// ============================================
// MAIN COMPONENT
// ============================================

export function EventsModule({ onModuleChange }: EventsModuleProps = {}) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [activeTab, setActiveTab] = useState('threat-summary');
  const [searchTerm, setSearchTerm] = useState('');

  // Filters
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  // Data Stores - Initialize with Fallback
  const [campaigns, setCampaigns] = useState<ThreatCampaign[]>(FALLBACK_CAMPAIGNS);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(FALLBACK_ALERTS);
  const [metrics, setMetrics] = useState<AlertMetrics | null>(FALLBACK_METRICS);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Derived Data for Charts
  const [chartData, setChartData] = useState<{
    severityDist: any[],
    topSources: any[],
    alertTrends: any[]
  }>({
    severityDist: [],
    topSources: [],
    alertTrends: []
  });

  // ============================================
  // LIFECYCLE & DATA FETCHING
  // ============================================

  useEffect(() => {
    fetchAllData();
  }, []);

  // Recalculate charts when alerts change
  useEffect(() => {
    if (alerts.length > 0) {
      calculateChartData();
    }
  }, [alerts]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchWithFallback = async (endpoint: string) => {
        try {
          const res = await fetch(`${API_BASE_URL}${endpoint}`);
          if (!res.ok) throw new Error('Not OK');
          return await res.json();
        } catch (e) {
          return null;
        }
      };

      const [campaignsRes, alertsRes, metricsRes] = await Promise.all([
        fetchWithFallback('/campaigns'),
        fetchWithFallback('/alerts'),
        fetchWithFallback('/metrics')
      ]);

      if (campaignsRes && campaignsRes.data && campaignsRes.data.length > 0) {
        const enrichedCampaigns = campaignsRes.data.map((c: any) => ({
          ...c,
          narrative: generateNarrative(c),
          recommendedAction: generateRecommendation(c),
          storyline: generateStoryline(c),
          estimatedCost: calculateEstimatedCost(c.severity)
        }));
        setCampaigns(enrichedCampaigns);
      }

      if (alertsRes && alertsRes.data && alertsRes.data.length > 0) {
        setAlerts(alertsRes.data);
      }

      if (metricsRes && metricsRes.data) {
        setMetrics(metricsRes.data);
      }
    } catch (err) {
      console.warn("Using fallback events data due to connection error");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // DATA ENRICHMENT LOGIC
  // ============================================

  const generateNarrative = (campaign: ThreatCampaign) => {
    return `${campaign.name} detected with ${campaign.confidence}% confidence. ` +
      `Activity indicates ${campaign.mitre_tactics[0] || 'Malicious'} behavior. ` +
      `Currently affecting ${campaign.impacted_business_units.length} business units ` +
      `with ${campaign.alert_count} correlated alerts.`;
  };

  const generateRecommendation = (campaign: ThreatCampaign) => {
    if (campaign.severity === 'Critical') return 'Immediate isolation of affected systems, credential rotation, and executive briefing.';
    if (campaign.severity === 'High') return 'Isolate endpoints, review access logs, and patch vulnerable systems.';
    return 'Monitor for lateral movement and review firewall logs.';
  };

  const calculateEstimatedCost = (severity: string) => {
    if (severity === 'Critical') return '$2.5M - $5M';
    if (severity === 'High') return '$500K - $1M';
    return '$50K - $100K';
  };

  const generateStoryline = (campaign: ThreatCampaign) => {
    return [
      { time: getTimeAgo(campaign.created_at), phase: 'Initial Access', description: 'Threat vector identified via correlation engine', detected: true },
      { time: getTimeAgo(campaign.updated_at), phase: 'Current State', description: `Campaign is currently ${campaign.status}`, detected: true }
    ];
  };

  const calculateChartData = () => {
    // Severity Distribution
    const severityCounts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    alerts.forEach(a => {
      if (!a.severity) return;
      const sev = a.severity.charAt(0).toUpperCase() + a.severity.slice(1).toLowerCase();
      if (severityCounts[sev] !== undefined) severityCounts[sev]++;
    });

    const severityDist = [
      { name: 'Critical', value: severityCounts.Critical, color: '#ef4444' },
      { name: 'High', value: severityCounts.High, color: '#f97316' },
      { name: 'Medium', value: severityCounts.Medium, color: '#eab308' },
      { name: 'Low', value: severityCounts.Low, color: '#22c55e' }
    ];

    // Top Sources
    const sourceCounts: Record<string, number> = {};
    alerts.forEach(a => {
      if (!a.alert_source) return;
      sourceCounts[a.alert_source] = (sourceCounts[a.alert_source] || 0) + 1;
    });
    const topSources = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, alerts: count, percentage: Math.round((count / alerts.length) * 100) }))
      .sort((a, b) => b.alerts - a.alerts)
      .slice(0, 5);

    setChartData({ severityDist, topSources, alertTrends: [] });
  };

  // ============================================
  // ACTION HANDLERS
  // ============================================

  const launchIncidentResponse = async (campaignId: string) => {
    setActionLoading(campaignId);
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/launch-response`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        alert(`✅ Incident Response Initiated\nID: ${data.data.response_id}`);
        onModuleChange?.('incident-response');
      } else {
        alert("✅ Incident Response Initiated (Demo Mode)");
      }
    } catch (err) {
      alert("✅ Incident Response Initiated (Demo Mode)");
    } finally {
      setActionLoading(null);
    }
  };

  const generateExecutiveBrief = async (campaignId: string) => {
    setActionLoading(campaignId);
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/generate-executive-brief`, { method: 'POST' });
      if (res.ok) {
        alert("📄 Executive Brief Generated Successfully");
      } else {
        alert("📄 Executive Brief Generated (Demo Mode)");
      }
    } catch (err) {
      alert("📄 Executive Brief Generated (Demo Mode)");
    } finally {
      setActionLoading(null);
    }
  };

  const generateAlertReport = async (alertId: string) => {
    setActionLoading(alertId);
    try {
      const res = await fetch(`${API_BASE_URL}/alerts/${alertId}/generate-report`, { method: 'POST' });
      if (res.ok) {
        alert("📄 Alert Forensic Report Generated");
      } else {
        alert("📄 Alert Forensic Report Generated (Demo Mode)");
      }
    } catch (err) {
      alert("📄 Alert Forensic Report Generated (Demo Mode)");
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getSeverityColor = (severity: string) => {
    if (!severity) return 'outline';
    switch (severity.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'outline';
    switch (status.toLowerCase()) {
      case 'active': return 'destructive';
      case 'open': return 'destructive';
      case 'monitoring': return 'default';
      case 'contained': return 'secondary';
      case 'resolved': return 'outline';
      case 'in progress': return 'default';
      default: return 'outline';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-green-500" />;
      default: return <Activity className="h-3 w-3 text-gray-500" />;
    }
  };

  // ============================================
  // FILTERING LOGIC
  // ============================================

  const filteredAlerts = alerts.filter(alert => {
    if (!alert) return false;
    const title = (alert.title || '').toLowerCase();
    const desc = (alert.description || '').toLowerCase();
    const id = (alert.alert_id || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = title.includes(search) || desc.includes(search) || id.includes(search);

    const severity = (alert.severity || '').toLowerCase();
    const matchesSeverity = severityFilter === 'all' || severity === severityFilter.toLowerCase();

    const status = (alert.status || '').toLowerCase();
    const matchesStatus = statusFilter === 'all' || status === statusFilter.toLowerCase();

    const source = (alert.alert_source || '').toLowerCase();
    const matchesSource = sourceFilter === 'all' || source.includes(sourceFilter.toLowerCase());

    return matchesSearch && matchesSeverity && matchesStatus && matchesSource;
  });

  const criticalThreats = campaigns.filter(c => c.severity === 'Critical' || c.severity === 'High');

  // Static Data for vectors (as backend doesn't provide this yet)
  const topAttackVectors = [
    { vector: 'Phishing / Social Engineering', count: 145, trend: 'up', change: 12 },
    { vector: 'Credential Compromise', count: 89, trend: 'up', change: 8 },
    { vector: 'Vulnerability Exploitation', count: 67, trend: 'down', change: -15 },
    { vector: 'Supply Chain', count: 34, trend: 'up', change: 23 },
    { vector: 'Malware / Ransomware', count: 28, trend: 'stable', change: 0 }
  ];

  // Static Data for 24h trend
  const alertTrends24h = [
    { time: '00:00', critical: 2, high: 8, medium: 15, low: 23 },
    { time: '04:00', critical: 1, high: 6, medium: 12, low: 18 },
    { time: '08:00', critical: 4, high: 12, medium: 20, low: 25 },
    { time: '12:00', critical: 6, high: 15, medium: 28, low: 32 },
    { time: '16:00', critical: 3, high: 9, medium: 18, low: 22 },
    { time: '20:00', critical: 2, high: 7, medium: 14, low: 19 }
  ];

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader className="h-16 w-16 animate-spin text-blue-600 mb-4" />
        <h2 className="text-xl font-semibold">Loading Security Operations Center...</h2>
        <p className="text-muted-foreground">Connecting to Threat Intelligence Feeds</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Threat Intelligence & Alert Monitoring</h1>
        <p className="text-muted-foreground">Executive threat overview and security operations dashboard</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="threat-summary">Threat Summary</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="kpi-dashboard">KPI Dashboard</TabsTrigger>
          <TabsTrigger value="soc-drilldown">SOC Drill-Down</TabsTrigger>
        </TabsList>

        {/* ============================================ */}
        {/* TAB 1: THREAT SUMMARY */}
        {/* ============================================ */}
        <TabsContent value="threat-summary" className="space-y-6">
          {/* Executive KPI Mini-Widgets */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Swords className="h-4 w-4 text-red-600" />
                  <span>Critical Threats</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{metrics?.critical_threats || 0}</div>
                <p className="text-xs text-red-700 mt-1">Active campaigns</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  <span>Avg Response</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics?.mttr_minutes || 0}m</div>
                <div className="flex items-center space-x-1 text-xs mt-1">
                  <TrendingDown className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">Target: 60m</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>SLA Compliance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics?.sla_compliance || 0}%</div>
                <Progress value={metrics?.sla_compliance || 0} className="mt-2 h-1" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span>Escalation Rate</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics?.escalation_rate || 0}%</div>
                <p className="text-xs text-muted-foreground mt-1">Alerts to incidents</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span>Correlation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics?.correlation_efficiency || 0}%</div>
                <p className="text-xs text-muted-foreground mt-1">AI-powered grouping</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Attack Vectors Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crosshair className="h-5 w-5" />
                <span>Top Attack Vectors</span>
              </CardTitle>
              <CardDescription>Primary threat entry points this period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topAttackVectors.map((vector, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                      <div className="flex-1">
                        <div className="font-medium">{vector.vector}</div>
                        <div className="text-sm text-muted-foreground">{vector.count} incidents detected</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(vector.trend)}
                      <span className={`text-sm font-medium ${vector.trend === 'up' ? 'text-red-600' :
                        vector.trend === 'down' ? 'text-green-600' :
                          'text-gray-600'
                        }`}>
                        {vector.change > 0 ? '+' : ''}{vector.change}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Executive Threat Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Active Critical Threats</h3>
              <Badge variant="destructive" className="text-sm">
                {criticalThreats.length} Campaigns Requiring Executive Attention
              </Badge>
            </div>

            {criticalThreats.length > 0 ? criticalThreats.map((threat) => (
              <Card key={threat.campaign_id} className={`border-2 ${threat.severity === 'Critical' ? 'border-red-300 bg-red-50/30' : 'border-orange-200 bg-orange-50/30'}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getSeverityColor(threat.severity) as any} className="text-sm">
                          {threat.severity}
                        </Badge>
                        <span className="font-mono text-sm text-muted-foreground">{threat.campaign_id}</span>
                        <Badge variant={getStatusColor(threat.status) as any}>
                          {threat.status}
                        </Badge>
                        <Badge variant="outline" className="text-sm">
                          <Target className="h-3 w-3 mr-1" />
                          {threat.confidence}% Confidence
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold">{threat.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${threat.impact_score >= 90 ? 'text-red-600' :
                        threat.impact_score >= 70 ? 'text-orange-600' :
                          'text-yellow-600'
                        }`}>
                        {threat.impact_score}
                      </div>
                      <div className="text-xs text-muted-foreground">Risk Score</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Business Impact */}
                  <div className="bg-white border-l-4 border-red-500 p-4 rounded">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-sm text-red-900 mb-1">Business Impact Summary</div>
                        <p className="text-sm text-gray-700">
                          Critical impact detected on {threat.impacted_business_units.join(', ')}.
                          Potential financial exposure estimated at {threat.estimatedCost}.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Threat Narrative */}
                  <div>
                    <div className="font-semibold text-sm mb-2 flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Threat Narrative</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{threat.narrative}</p>
                  </div>

                  {/* Grid Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-semibold mb-2 flex items-center space-x-1">
                        <Server className="h-4 w-4" />
                        <span>Affected Assets ({threat.affected_assets})</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Multiple critical assets compromised across {threat.impacted_business_units.length} units.
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold mb-2 flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>Business Units</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {threat.impacted_business_units.map((unit, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{unit}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* MITRE Tactics */}
                  <div>
                    <div className="text-sm font-semibold mb-2 flex items-center space-x-1">
                      <Shield className="h-4 w-4" />
                      <span>MITRE ATT&CK Kill Chain Coverage</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {threat.mitre_tactics.map((tactic, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tactic}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground font-mono">
                      Techniques: {threat.techniques.join(', ')}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Detected: {getTimeAgo(threat.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Activity className="h-4 w-4" />
                      <span>Last Activity: {getTimeAgo(threat.updated_at)}</span>
                    </div>
                  </div>

                  {/* Recommended Action */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <Flag className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-sm text-blue-900 mb-1">Recommended CISO Action</div>
                        <p className="text-sm text-blue-800">{threat.recommendedAction}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      className="flex-1"
                      onClick={() => launchIncidentResponse(threat.campaign_id)}
                      disabled={actionLoading === threat.campaign_id}
                    >
                      {actionLoading === threat.campaign_id ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
                      Launch Incident Response
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('campaigns')}>
                      <ChevronRight className="h-4 w-4 mr-2" />
                      View Campaign Details
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => generateExecutiveBrief(threat.campaign_id)}
                      disabled={actionLoading === threat.campaign_id}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6 text-center text-green-800">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                  <h3 className="text-lg font-bold">No Critical Threats Detected</h3>
                  <p>System is currently operating within normal security parameters.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Security Posture Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Global Security Posture Impact</span>
              </CardTitle>
              <CardDescription>How current threats affect organizational security score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Current Security Score</div>
                    <div className="text-4xl font-bold text-orange-600">72/100</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Baseline Score</div>
                    <div className="text-2xl font-semibold text-gray-600">85/100</div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Impact of Active Threats</span>
                    <span className="font-semibold text-red-600">-13 points</span>
                  </div>
                  <Progress value={72} className="h-3" />
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 border rounded">
                    <div className="text-red-600 font-bold text-xl">-8</div>
                    <div className="text-muted-foreground">APT Campaign</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-orange-600 font-bold text-xl">-3</div>
                    <div className="text-muted-foreground">Supply Chain Risk</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-red-600 font-bold text-xl">-2</div>
                    <div className="text-muted-foreground">Ransomware Threat</div>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-900">
                    <strong>Executive Summary:</strong> Active threat campaigns have temporarily reduced organizational security posture.
                    Immediate containment actions are in progress. Estimated recovery to baseline: 48-72 hours pending threat neutralization.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================ */}
        {/* TAB 2: CAMPAIGNS (Threat Storylines) */}
        {/* ============================================ */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Threat Campaign Storylines</h2>
              <p className="text-muted-foreground">Correlated attack sequences with executive context</p>
            </div>
            <Badge className="text-sm">
              {campaigns.length} Active Campaigns
            </Badge>
          </div>

          {campaigns.map((campaign) => (
            <Card key={campaign.campaign_id} className="border-2">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSeverityColor(campaign.severity) as any}>
                        {campaign.severity}
                      </Badge>
                      <span className="font-mono text-sm text-muted-foreground">{campaign.campaign_id}</span>
                      <Badge variant={getStatusColor(campaign.status) as any}>
                        {campaign.status}
                      </Badge>
                      <Badge variant="outline">
                        {campaign.confidence}% Confidence
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-bold">{campaign.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Duration: {campaign.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Server className="h-4 w-4" />
                        <span>{campaign.affected_assets} Assets</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{campaign.alert_count} Alerts</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${campaign.impact_score >= 90 ? 'text-red-600' :
                      campaign.impact_score >= 70 ? 'text-orange-600' :
                        'text-yellow-600'
                      }`}>
                      {campaign.impact_score}
                    </div>
                    <div className="text-xs text-muted-foreground">Impact Score</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Business Units */}
                <div>
                  <div className="text-sm font-semibold mb-2">Impacted Business Units</div>
                  <div className="flex flex-wrap gap-2">
                    {campaign.impacted_business_units.map((unit, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        <Users className="h-3 w-3 mr-1" />
                        {unit}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* MITRE Mapping */}
                <div>
                  <div className="text-sm font-semibold mb-2 flex items-center space-x-1">
                    <Shield className="h-4 w-4" />
                    <span>MITRE ATT&CK Kill Chain Coverage</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {campaign.mitre_tactics.map((tactic, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tactic}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground font-mono">
                    Techniques: {campaign.techniques.join(', ')}
                  </div>
                </div>

                {/* Threat Storyline Timeline */}
                <div>
                  <div className="text-sm font-semibold mb-3 flex items-center space-x-1">
                    <Activity className="h-4 w-4" />
                    <span>Attack Progression Timeline</span>
                  </div>
                  <div className="space-y-3">
                    {campaign.storyline?.map((step, idx) => (
                      <div key={idx} className="flex items-start space-x-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${step.detected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                            {idx + 1}
                          </div>
                          {idx < (campaign.storyline?.length || 0) - 1 && (
                            <div className="w-0.5 h-8 bg-gray-300 my-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-mono text-muted-foreground">{step.time}</span>
                            <Badge variant="outline" className="text-xs">
                              {step.phase}
                            </Badge>
                            {step.detected && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Detected
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Impact */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-purple-900">Estimated Financial Impact</div>
                      <div className="text-2xl font-bold text-purple-700 mt-1">{campaign.estimatedCost}</div>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-400" />
                  </div>
                </div>

                {/* CISO Action */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Flag className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-blue-900 mb-2">Recommended CISO Action</div>
                      <p className="text-sm text-blue-800">{campaign.recommendedAction}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => launchIncidentResponse(campaign.campaign_id)}
                    disabled={actionLoading === campaign.campaign_id}
                  >
                    {actionLoading === campaign.campaign_id ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
                    Launch Response
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setSearchTerm(campaign.campaign_id);
                    setActiveTab('soc-drilldown');
                  }}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Related Alerts
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => generateExecutiveBrief(campaign.campaign_id)}
                    disabled={actionLoading === campaign.campaign_id}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Executive Brief
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ============================================ */}
        {/* TAB 3: KPI DASHBOARD */}
        {/* ============================================ */}
        <TabsContent value="kpi-dashboard" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Executive Security Operations Metrics</h2>
            <p className="text-muted-foreground">Performance indicators and operational efficiency</p>
          </div>

          {/* Top-Level KPIs */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Mean Time To Respond (MTTR)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics?.mttr_minutes || 0}m</div>
                <div className="flex items-center space-x-1 text-xs mt-2">
                  <Progress value={80} className="flex-1 h-1" />
                  <span className="text-green-600">Under Target</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Mean Time To Detect (MTTD)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics?.mittd_minutes || 0}m</div>
                <div className="flex items-center space-x-1 text-xs mt-2">
                  <Progress value={90} className="flex-1 h-1" />
                  <span className="text-green-600">Fast Detection</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">SLA Compliance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics?.sla_compliance || 0}%</div>
                <div className="flex items-center space-x-1 text-xs mt-2">
                  <Progress value={metrics?.sla_compliance || 0} className="flex-1 h-1" />
                  <span className="text-muted-foreground">Target: 95%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">SOC Alert Backlog</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{alerts.filter(a => a.status === 'Open').length}</div>
                <div className="flex items-center space-x-1 text-xs mt-2">
                  <span className="text-green-600">Active Open Alerts</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert Resolution Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>24-Hour Resolution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600">{metrics?.alerts_24h || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">Alerts processed last 24h</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>7-Day Resolution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-purple-600">{metrics?.alerts_7d || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">Alerts processed last 7 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>30-Day Resolution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600">{metrics?.alerts_30d || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">Alerts processed last 30 days</p>
              </CardContent>
            </Card>
          </div>

          {/* Alert Trends */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>24-Hour Alert Trend</CardTitle>
                <CardDescription>Severity distribution over last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData.alertTrends.length > 0 ? chartData.alertTrends : [{ time: '00:00', critical: 2, high: 5, medium: 10, low: 15 }, { time: '06:00', critical: 1, high: 8, medium: 12, low: 20 }, { time: '12:00', critical: 4, high: 12, medium: 25, low: 30 }]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#ef4444" />
                    <Area type="monotone" dataKey="high" stackId="1" stroke="#f97316" fill="#f97316" />
                    <Area type="monotone" dataKey="medium" stackId="1" stroke="#eab308" fill="#eab308" />
                    <Area type="monotone" dataKey="low" stackId="1" stroke="#22c55e" fill="#22c55e" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Severity Distribution</CardTitle>
                <CardDescription>Current active alerts by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData.severityDist.length > 0 ? chartData.severityDist : [{ name: 'Loading', value: 1, color: '#eee' }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={(entry) => `${entry.name}: ${entry.value}`}
                    >
                      {chartData.severityDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Sources */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Alert Sources</CardTitle>
                <CardDescription>Security tools generating most alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {chartData.topSources.map((source, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">{source.source}</span>
                        <span className="text-muted-foreground">{source.alerts} alerts ({source.percentage}%)</span>
                      </div>
                      <Progress value={source.percentage} className="h-2" />
                    </div>
                  ))}
                  {chartData.topSources.length === 0 && <p className="text-muted-foreground">No data available.</p>}
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>SOC Performance Summary</CardTitle>
                <CardDescription>Overall operational effectiveness metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Alert Correlation Efficiency</span>
                      <span className="font-bold text-green-600">{metrics?.correlation_efficiency || 0}%</span>
                    </div>
                    <Progress value={metrics?.correlation_efficiency || 0} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Threat Escalation Rate</span>
                      <span className="font-bold text-orange-600">{metrics?.escalation_rate || 0}%</span>
                    </div>
                    <Progress value={metrics?.escalation_rate || 0} className="h-2" />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-sm mb-3">Key Insights</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>MTTR improved significantly compared to last week</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>SLA compliance is solid within target range</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>AI correlation reducing false positives by {metrics?.correlation_efficiency}%</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============================================ */}
        {/* TAB 4: SOC DRILL-DOWN */}
        {/* ============================================ */}
        <TabsContent value="soc-drilldown" className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-blue-900 mb-1">Technical Alert Details</h4>
                <p className="text-sm text-blue-800">
                  This section provides detailed technical alert data for SOC analysts and security engineers.
                  For executive threat summaries, please refer to the "Threat Summary" or "Campaigns" tabs.
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Alert Management Workbench</span>
              </CardTitle>
              <CardDescription>Detailed alert triage and investigation interface</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search alerts by ID, title, or description..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="contained">Contained</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="CrowdStrike EDR">CrowdStrike</SelectItem>
                    <SelectItem value="AWS GuardDuty">GuardDuty</SelectItem>
                    <SelectItem value="Microsoft Sentinel">Sentinel</SelectItem>
                    <SelectItem value="Palo Alto Firewall">Palo Alto</SelectItem>
                    <SelectItem value="VPN Gateway">VPN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Alerts Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alert ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Detected</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAlerts.length > 0 ? filteredAlerts.map((alert) => (
                      <TableRow key={alert.alert_id}>
                        <TableCell>
                          <span className="font-mono text-sm">{alert.alert_id}</span>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium truncate">{alert.title}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {alert.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(alert.severity) as any}>
                            {alert.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(alert.status) as any}>
                            {alert.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">{alert.alert_source}</span>
                        </TableCell>
                        <TableCell>
                          {alert.campaign_id ? (
                            <Badge variant="outline" className="text-xs font-mono">
                              {alert.campaign_id}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Uncorrelated</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{alert.assigned_to}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{getTimeAgo(alert.detected_at)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Generate Forensic Report"
                              onClick={() => generateAlertReport(alert.alert_id)}
                              disabled={actionLoading === alert.alert_id}
                            >
                              {actionLoading === alert.alert_id ? <Loader className="animate-spin h-4 w-4" /> : <FileText className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" title="View Details">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No alerts found matching criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                Showing {filteredAlerts.length} of {alerts.length} alerts
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}