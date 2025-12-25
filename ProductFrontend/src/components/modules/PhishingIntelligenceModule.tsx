import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import {
  Mail,
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Globe,
  Target,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Eye,
  Ban,
  CheckCircle2,
  XCircle,
  Zap,
  Brain,
  Radio,
  AlertCircle,
  Loader
} from 'lucide-react';
import {
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
const API_BASE_URL = "http://localhost:8000/api/phishing";

// ============================================
// INTERFACES
// ============================================

interface PhishingCampaign {
  threat_id: string;
  campaign_name: string;
  impersonated_brand: string;
  status: string;
  severity: string;
  detected_at: string;
  attack_vector: string;
  targets_count: number;
  click_rate_estimate: number;
  indicators_of_compromise: {
    urls: string[];
    sender_domains: string[];
    subject_lines: string[];
  };
  remediation_status: {
    domain_takedown: boolean;
    email_gateway_block: boolean;
    browser_blocklist: boolean;
  };
}

interface PhishingStats {
  total_attempts: number;
  avg_click_rate: number;
  active_spoof_domains: number;
  critical_incidents: number;
}

interface PhishingIntelligenceModuleProps {
  onModuleChange?: (module: string) => void;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function PhishingIntelligenceModule({ onModuleChange }: PhishingIntelligenceModuleProps = {}) {

  // State Management
  const [campaigns, setCampaigns] = useState<PhishingCampaign[]>([]);
  const [stats, setStats] = useState<PhishingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ============================================
  // DATA FETCHING
  // ============================================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [intelligenceRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/intelligence`),
        fetch(`${API_BASE_URL}/intelligence/stats`)
      ]);

      if (intelligenceRes.ok) {
        const data = await intelligenceRes.json();
        setCampaigns(data.data || []);
      } else {
        throw new Error("Failed to fetch campaign intelligence");
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.data || null);
      } else {
        throw new Error("Failed to fetch statistics");
      }

    } catch (err) {
      console.error("Error fetching phishing data:", err);
      setError("Failed to connect to Phishing Intelligence Center.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ACTION HANDLERS
  // ============================================

  const blockDomain = async (threatId: string) => {
    setActionLoading(threatId);
    try {
      const res = await fetch(`${API_BASE_URL}/intelligence/${threatId}/block-domain`, {
        method: 'POST'
      });

      if (res.ok) {
        alert(`✅ Domain blocked successfully for threat ${threatId}`);
        fetchData(); // Refresh data to show updated status
      } else {
        alert("❌ Failed to block domain");
      }
    } catch (err) {
      alert("Error executing block action");
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-red-600';
      case 'takedown in progress': return 'bg-yellow-600';
      case 'resolved': return 'bg-green-600';
      case 'contained': return 'bg-blue-600'; // Added for consistency with original UI
      case 'monitored': return 'bg-purple-600'; // Added for consistency with original UI
      default: return 'bg-gray-600';
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

  const getRiskColor = (score: number) => {
    if (score >= 8.0) return 'text-red-600';
    if (score >= 6.0) return 'text-orange-600';
    if (score >= 4.0) return 'text-yellow-600';
    return 'text-green-600';
  };

  // ============================================
  // RICH MOCK DATA (For UI sections not yet in DB)
  // ============================================

  // 30-day Activity Trend
  const activityTrend = [
    { date: 'Dec 1', attempts: 89, clicks: 12, reports: 64 },
    { date: 'Dec 3', attempts: 94, clicks: 10, reports: 71 },
    { date: 'Dec 5', attempts: 102, clicks: 14, reports: 68 },
    { date: 'Dec 7', attempts: 87, clicks: 9, reports: 73 },
    { date: 'Dec 9', attempts: 91, clicks: 11, reports: 69 },
    { date: 'Dec 11', attempts: 98, clicks: 8, reports: 76 },
    { date: 'Dec 13', attempts: 105, clicks: 13, reports: 74 },
    { date: 'Dec 15', attempts: 96, clicks: 7, reports: 78 },
    { date: 'Dec 17', attempts: 103, clicks: 9, reports: 81 },
    { date: 'Dec 19', attempts: 110, clicks: 11, reports: 79 }
  ];

  const activityStoryline = "User click rate decreased 3.2% while report rate improved 8.5% over 30 days. Security awareness training is showing measurable impact. Response time improved to 9.2 minutes.";

  // User Behavior Distribution (Dynamic where possible)
  const userBehavior = [
    { name: 'Reported Correctly', value: 72.5, color: '#22c55e' },
    { name: 'Clicked Link', value: stats?.avg_click_rate || 8.3, color: '#ef4444' },
    { name: 'Ignored', value: 100 - 72.5 - (stats?.avg_click_rate || 8.3), color: '#6b7280' }
  ];

  // Malicious Domains (Static for now, could be dynamic later)
  const maliciousDomains = [
    {
      id: 1,
      domain: 'secure-portal-reset.com',
      spoofScore: 9.2,
      threatLevel: 92,
      detectionCount: 34,
      status: 'Blocked',
      aiInsight: 'High-fidelity spoof of company portal. Uses stolen SSL certificate. Credential harvesting confirmed.',
      blockedBy: 'DNS Filter',
      firstSeen: 'Dec 15',
      targetsC_Suite: true
    },
    {
      id: 2,
      domain: 'microsoft-update.org',
      spoofScore: 8.8,
      threatLevel: 88,
      detectionCount: 28,
      status: 'Monitored',
      aiInsight: 'Legitimate-looking Microsoft domain. Hosting fake Office 365 login page. Distributed via email.',
      blockedBy: 'Email Gateway',
      firstSeen: 'Dec 12',
      targetsC_Suite: false
    },
    {
      id: 3,
      domain: 'paypal-verification.net',
      spoofScore: 8.5,
      threatLevel: 85,
      detectionCount: 22,
      status: 'Blocked',
      aiInsight: 'PayPal impersonation with payment verification scam. Targets finance users.',
      blockedBy: 'Web Proxy',
      firstSeen: 'Dec 10',
      targetsC_Suite: false
    },
    {
      id: 4,
      domain: 'amazon-security-alert.com',
      spoofScore: 8.1,
      threatLevel: 81,
      detectionCount: 19,
      status: 'Active',
      aiInsight: 'Amazon spoof delivering fake security alerts. High user engagement. Immediate action required.',
      blockedBy: null,
      firstSeen: 'Dec 16',
      targetsC_Suite: false
    }
  ];

  // Most Targeted Users (Static for now)
  const targetedUsers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      role: 'CFO',
      riskScore: 8.7,
      targetingCount: 23,
      clicks: 3,
      reports: 18,
      suggestedAction: 'Enroll in executive protection program',
      department: 'Finance',
      isExecutive: true
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      role: 'VP Engineering',
      riskScore: 7.8,
      targetingCount: 19,
      clicks: 2,
      reports: 15,
      suggestedAction: 'Additional security awareness training',
      department: 'Engineering',
      isExecutive: true
    },
    {
      id: 3,
      name: 'Amit Patel',
      email: 'amit.patel@company.com',
      role: 'Accountant',
      riskScore: 7.2,
      targetingCount: 17,
      clicks: 4,
      reports: 11,
      suggestedAction: 'Review wire transfer protocols',
      department: 'Finance',
      isExecutive: false
    },
    {
      id: 4,
      name: 'Lisa Anderson',
      email: 'lisa.anderson@company.com',
      role: 'HR Manager',
      riskScore: 6.3,
      targetingCount: 14,
      clicks: 1,
      reports: 12,
      suggestedAction: 'Standard monitoring',
      department: 'Human Resources',
      isExecutive: false
    },
    {
      id: 5,
      name: 'David Wilson',
      email: 'david.wilson@company.com',
      role: 'IT Admin',
      riskScore: 5.9,
      targetingCount: 12,
      clicks: 1,
      reports: 10,
      suggestedAction: 'Maintain current training',
      department: 'IT Operations',
      isExecutive: false
    }
  ];

  // Incident Log (Grouped by Severity - Static for now)
  const incidents = {
    critical: [
      {
        id: 'PH-2024-0089',
        subject: 'URGENT: CEO Wire Transfer Approval',
        status: 'Active',
        severity: 'Critical',
        impact: 'Finance team targeted. $250K wire fraud attempt.',
        nextStep: 'Block sender domain, notify CFO',
        detectedAt: '2 hours ago',
        affectedUsers: 5
      },
      {
        id: 'PH-2024-0087',
        subject: 'Immediate Action Required: Account Suspended',
        status: 'Investigating',
        severity: 'Critical',
        impact: '34 users clicked malicious link. Credential reset required.',
        nextStep: 'Force password reset for affected users',
        detectedAt: '4 hours ago',
        affectedUsers: 34
      }
    ],
    high: [
      {
        id: 'PH-2024-0086',
        subject: 'Microsoft 365 Security Alert',
        status: 'Contained',
        severity: 'High',
        impact: 'Credential harvesting page. 12 submissions captured.',
        nextStep: 'Monitor for unauthorized access',
        detectedAt: '1 day ago',
        affectedUsers: 12
      },
      {
        id: 'PH-2024-0085',
        subject: 'IT Helpdesk: MFA Code Verification',
        status: 'Resolved',
        severity: 'High',
        impact: 'Social engineering attempt. No successful compromises.',
        nextStep: 'Close incident, document TTP',
        detectedAt: '2 days ago',
        affectedUsers: 8
      }
    ],
    medium: [
      {
        id: 'PH-2024-0084',
        subject: 'Payroll Documents Attached',
        status: 'Contained',
        severity: 'Medium',
        impact: 'Malicious macro attachments. All quarantined.',
        nextStep: 'Review email gateway rules',
        detectedAt: '3 days ago',
        affectedUsers: 19
      }
    ]
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 flex-col">
        <Loader className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-muted-foreground">Loading Phishing Intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-red-600 flex-col">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <p className="font-bold text-lg">System Error</p>
        <p>{error}</p>
        <Button onClick={fetchData} variant="outline" className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CISO SUMMARY PANEL */}
      <Card className="border-2 border-blue-900 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-900 flex items-center space-x-2">
            <Mail className="h-6 w-6" />
            <span>Phishing Intelligence Command Center</span>
          </CardTitle>
          <CardDescription className="text-lg">
            Executive overview of phishing threats, user behavior, and response effectiveness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-6">
            {/* Phishing Attempts */}
            <Card className="border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Phishing Attempts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats?.total_attempts || 2847}</div>
                <div className="flex items-center space-x-1 text-xs mt-1">
                  <ArrowUpRight className="h-3 w-3 text-red-600" />
                  <span className="text-red-600 font-semibold">+23</span>
                  <span className="text-muted-foreground">30 days</span>
                </div>
              </CardContent>
            </Card>

            {/* User Click Rate */}
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  User Click Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats?.avg_click_rate || 8.3}%</div>
                <div className="flex items-center space-x-1 text-xs mt-1">
                  <ArrowDownRight className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-semibold">3.2%</span>
                  <span className="text-muted-foreground">better</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Target: 5.0%</div>
              </CardContent>
            </Card>

            {/* User Report Rate */}
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  User Report Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">72.5%</div>
                <div className="flex items-center space-x-1 text-xs mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-semibold">+8.5%</span>
                  <span className="text-muted-foreground">improvement</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Target: 80.0%</div>
              </CardContent>
            </Card>

            {/* Avg Response Time */}
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Avg Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">9.2</div>
                <div className="text-xs text-muted-foreground">min</div>
                <div className="flex items-center space-x-1 text-xs mt-1">
                  <ArrowDownRight className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-semibold">2.8 min faster</span>
                </div>
              </CardContent>
            </Card>

            {/* Active Spoof Domains */}
            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Active Spoof Domains
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{stats?.active_spoof_domains || 34}</div>
                <div className="text-xs text-muted-foreground">monitored</div>
                <div className="flex items-center space-x-1 text-xs mt-1">
                  <ArrowUpRight className="h-3 w-3 text-red-600" />
                  <span className="text-red-600 font-semibold">+12</span>
                  <span className="text-muted-foreground">new</span>
                </div>
              </CardContent>
            </Card>

            {/* High Severity Unresolved */}
            <Card className="border-2 border-red-200 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Critical Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats?.critical_incidents || 7}</div>
                <div className="text-xs text-muted-foreground">active</div>
                <div className="flex items-center space-x-1 text-xs mt-1">
                  <ArrowDownRight className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-semibold">-3</span>
                  <span className="text-muted-foreground">resolved</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* ACTIVITY TREND */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 30-Day Trend Chart */}
        <Card className="shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>30-Day Activity Trend</span>
            </CardTitle>
            <CardDescription>Phishing attempts, clicks, and user reports over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={activityTrend}>
                <defs>
                  <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="attempts" stroke="#ef4444" fillOpacity={1} fill="url(#colorAttempts)" name="Attempts" />
                <Area type="monotone" dataKey="clicks" stroke="#f97316" fillOpacity={1} fill="url(#colorClicks)" name="Clicks" />
                <Area type="monotone" dataKey="reports" stroke="#22c55e" fillOpacity={1} fill="url(#colorReports)" name="Reports" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Radio className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800 italic">
                  User click rate decreased 3.2% while report rate improved 8.5% over 30 days. Security awareness training is showing measurable impact.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Behavior Donut */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span>User Behavior</span>
            </CardTitle>
            <CardDescription>Response distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={userBehavior}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={(entry) => `${entry.value.toFixed(1)}%`}
                >
                  {userBehavior.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {userBehavior.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <span className="text-lg font-bold" style={{ color: item.color }}>
                    {item.value.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CAMPAIGN INTELLIGENCE */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-red-600" />
            <span>Campaign Intelligence</span>
          </CardTitle>
          <CardDescription>Active phishing campaigns with threat context</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No active campaigns detected.</p>
            ) : (
              campaigns.map((campaign) => (
                <div
                  key={campaign.threat_id}
                  className="border-2 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-bold text-lg">{campaign.campaign_name}</h4>
                        <Badge className={`${getStatusColor(campaign.status)} text-white`}>
                          {campaign.status}
                        </Badge>
                        <Badge className={getSeverityColor(campaign.severity)}>
                          {campaign.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 italic mb-3">
                        Impersonating {campaign.impersonated_brand} via {campaign.attack_vector}.
                        Indicators: {campaign.indicators_of_compromise.urls.join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mb-3">
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-red-600">{campaign.targets_count}</div>
                      <div className="text-xs text-muted-foreground">Targeted Users</div>
                    </div>
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-600">{campaign.click_rate_estimate}%</div>
                      <div className="text-xs text-muted-foreground">Click Rate</div>
                    </div>
                    <div className="bg-gray-50 border-2 rounded-lg p-3 text-center">
                      <div className="text-xs text-muted-foreground mb-1">Detected</div>
                      <div className="text-xs font-semibold">{getTimeAgo(campaign.detected_at)}</div>
                    </div>
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 text-center flex items-center justify-center">
                      {campaign.remediation_status.domain_takedown ? (
                        <div className="flex flex-col items-center text-green-700">
                          <CheckCircle2 className="h-5 w-5 mb-1" />
                          <span className="text-xs font-bold">Domain Blocked</span>
                        </div>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => blockDomain(campaign.threat_id)}
                          disabled={actionLoading === campaign.threat_id}
                        >
                          {actionLoading === campaign.threat_id ? <Loader className="animate-spin h-4 w-4" /> : <Ban className="h-4 w-4 mr-1" />}
                          Block Domain
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* MALICIOUS DOMAINS & TARGETED USERS */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Malicious Domains */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-orange-600" />
              <span>Malicious Domains</span>
            </CardTitle>
            <CardDescription>Spoof domains with AI-generated insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {maliciousDomains.map((domain) => (
                <div
                  key={domain.id}
                  className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50/30"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-bold text-sm font-mono">{domain.domain}</h4>
                        {domain.targetsC_Suite && (
                          <Badge variant="destructive" className="text-xs">
                            C-Suite Target
                          </Badge>
                        )}
                      </div>
                      <Badge
                        className={
                          domain.status === 'Blocked' ? 'bg-green-600 text-white' :
                            domain.status === 'Monitored' ? 'bg-yellow-600 text-white' :
                              'bg-red-600 text-white'
                        }
                      >
                        {domain.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-orange-600">{domain.spoofScore}</div>
                      <div className="text-xs text-muted-foreground">Spoof Score</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Threat Level</span>
                      <span className="font-semibold">{domain.threatLevel}%</span>
                    </div>
                    <Progress value={domain.threatLevel} className="h-3" />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start space-x-2">
                      <Brain className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-800">{domain.aiInsight}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white border rounded p-2 text-center">
                      <div className="text-lg font-bold text-red-600">{domain.detectionCount}</div>
                      <div className="text-xs text-muted-foreground">Detections</div>
                    </div>
                    <div className="bg-white border rounded p-2 text-center">
                      <div className="text-xs text-muted-foreground mb-1">First Seen</div>
                      <div className="text-xs font-semibold">{domain.firstSeen}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mt-3">
                    {domain.status === 'Active' ? (
                      <Button variant="destructive" size="sm" className="flex-1">
                        <Ban className="h-4 w-4 mr-1" />
                        Block Domain
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="flex-1" disabled>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        {domain.blockedBy}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Targeted Users */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span>Most Targeted Users</span>
            </CardTitle>
            <CardDescription>High-risk individuals with recommended actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {targetedUsers.map((user) => (
                <div
                  key={user.id}
                  className={`border-2 rounded-lg p-4 ${user.isExecutive ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-bold">{user.name}</h4>
                        {user.isExecutive && (
                          <Badge variant="destructive" className="text-xs">
                            Executive
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{user.role} • {user.department}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getRiskColor(user.riskScore)}`}>
                        {user.riskScore}
                      </div>
                      <div className="text-xs text-muted-foreground">Risk Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-white border rounded p-2 text-center">
                      <div className="text-lg font-bold text-purple-600">{user.targetingCount}</div>
                      <div className="text-xs text-muted-foreground">Targeted</div>
                    </div>
                    <div className="bg-white border rounded p-2 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {user.clicks > 0 ? (
                          <XCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                        <span className={`text-lg font-bold ${user.clicks > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {user.clicks}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">Clicks</div>
                    </div>
                    <div className="bg-white border rounded p-2 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-lg font-bold text-green-600">{user.reports}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Reports</div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-3 w-3 text-blue-600" />
                      <span className="text-xs text-blue-800 font-semibold">{user.suggestedAction}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* INCIDENT LOG - EXECUTIVE VIEW */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Incident Log - Executive View</span>
          </CardTitle>
          <CardDescription>Recent phishing incidents grouped by severity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Critical Incidents */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant="destructive" className="font-bold">CRITICAL</Badge>
                <span className="text-sm text-muted-foreground">{incidents.critical.length} incidents</span>
              </div>
              <div className="space-y-3">
                {incidents.critical.map((incident) => (
                  <div
                    key={incident.id}
                    className="border-2 border-red-300 rounded-lg p-4 bg-red-50/30"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline" className="text-xs font-mono">{incident.id}</Badge>
                          <Badge className={
                            incident.status === 'Active' ? 'bg-red-600 text-white' :
                              incident.status === 'Investigating' ? 'bg-yellow-600 text-white' :
                                'bg-gray-600 text-white'
                          }>
                            {incident.status}
                          </Badge>
                        </div>
                        <h4 className="font-bold text-sm mb-1">{incident.subject}</h4>
                        <p className="text-sm text-gray-700 mb-2">{incident.impact}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">{incident.detectedAt}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-3 w-3 text-blue-600" />
                        <span className="text-xs text-blue-800 font-semibold">Next Step: {incident.nextStep}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{incident.affectedUsers} users affected</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* High Severity Incidents */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Badge className="bg-orange-600 text-white font-bold">HIGH</Badge>
                <span className="text-sm text-muted-foreground">{incidents.high.length} incidents</span>
              </div>
              <div className="space-y-3">
                {incidents.high.map((incident) => (
                  <div
                    key={incident.id}
                    className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50/30"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline" className="text-xs font-mono">{incident.id}</Badge>
                          <Badge className={
                            incident.status === 'Contained' ? 'bg-yellow-600 text-white' :
                              incident.status === 'Resolved' ? 'bg-green-600 text-white' :
                                'bg-gray-600 text-white'
                          }>
                            {incident.status}
                          </Badge>
                        </div>
                        <h4 className="font-bold text-sm mb-1">{incident.subject}</h4>
                        <p className="text-sm text-gray-700 mb-2">{incident.impact}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">{incident.detectedAt}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-3 w-3 text-blue-600" />
                        <span className="text-xs text-blue-800 font-semibold">Next Step: {incident.nextStep}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{incident.affectedUsers} users affected</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Medium Severity Incidents */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Badge className="bg-yellow-600 text-white font-bold">MEDIUM</Badge>
                <span className="text-sm text-muted-foreground">{incidents.medium.length} incident</span>
              </div>
              <div className="space-y-3">
                {incidents.medium.map((incident) => (
                  <div
                    key={incident.id}
                    className="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50/30"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline" className="text-xs font-mono">{incident.id}</Badge>
                          <Badge className="bg-yellow-600 text-white">
                            {incident.status}
                          </Badge>
                        </div>
                        <h4 className="font-bold text-sm mb-1">{incident.subject}</h4>
                        <p className="text-sm text-gray-700 mb-2">{incident.impact}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">{incident.detectedAt}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-3 w-3 text-blue-600" />
                        <span className="text-xs text-blue-800 font-semibold">Next Step: {incident.nextStep}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}