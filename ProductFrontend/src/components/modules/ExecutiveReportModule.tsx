import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
// import { toast } from 'sonner'; // Uncomment if installed
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Building,
  Award,
  Lightbulb,
  Eye,
  DollarSign,
  Clock,
  Target,
  Activity,
  Flag,
  Scale,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileText,
  Users,
  Zap,
  Download,
  Loader,
  Calendar
} from 'lucide-react';
import { Progress } from '../ui/progress';
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const EXEC_REPORT_API = `${API_BASE}/api/executive-report`;


// ============================================
// INTERFACES
// ============================================

interface Recommendation {
  title: string;
  priority: string;
  cost: string;
  timeline: string;
  impact_description: string;
  // UI specific fields (mapped or optional)
  description?: string;
  effort?: string;
  impact?: string;
  costRange?: string;
  riskReduction?: string;
  dependencies?: string[];
  projectedImpact?: string;
}

interface ReportData {
  report_id: string;
  reporting_period: string;
  overall_score: number;
  score_trend: number;
  summary: string;
  top_improvements: Array<{ area: string; impact: string; value: string }>;
  areas_of_concern: Array<{ area: string; impact: string; details: string }>;
  strategic_recommendations: Recommendation[];
}

interface ExecutiveReportModuleProps {
  onModuleChange?: (module: string) => void;
}

// ============================================
// FALLBACK DATA (DEMO MODE)
// ============================================

const FALLBACK_REPORT: ReportData = {
  report_id: 'REP-2024-12',
  reporting_period: 'December 2024',
  overall_score: 8.7,
  score_trend: 0.3,
  summary: "This month saw a 4% reduction in overall risk due to the successful patching of critical vulnerabilities in the Finance sector. However, cloud misconfigurations remain a concern.",
  top_improvements: [
    { area: 'Incident Response', impact: 'Reduced MTTR by 12%', value: '+12%' },
    { area: 'Patch Management', impact: 'Critical patch rate up 8%', value: '+8%' },
    { area: 'Phishing Resilience', impact: 'Click rate down to 3.2%', value: '+15%' }
  ],
  areas_of_concern: [
    { area: 'GDPR Compliance', impact: '-5%', details: 'Data inventory gaps identified' },
    { area: 'Cloud Security', impact: '-3%', details: '12 new S3 bucket exposures' },
    { area: 'Third-Party Risk', impact: '-2%', details: 'Vendor assessment backlog' }
  ],
  strategic_recommendations: [
    {
      title: 'Patch CVE-2024-12345',
      priority: 'Critical',
      cost: '$15K - $25K',
      timeline: '2-3 days',
      impact_description: '65% risk reduction',
      description: 'Critical RCE vulnerability in Apache HTTP Server affecting 23 production systems.',
      effort: 'Medium',
      riskReduction: '1.2 points',
      dependencies: ['IT Ops', 'Security Team'],
      projectedImpact: '65% risk reduction'
    },
    {
      title: 'Implement MFA for Admins',
      priority: 'High',
      cost: '$5K',
      timeline: '1 week',
      impact_description: 'Prevent credential theft',
      description: 'Enforce Multi-Factor Authentication for all administrative access points.',
      effort: 'Low',
      riskReduction: '0.8 points',
      dependencies: ['Identity Team'],
      projectedImpact: 'Prevent credential theft'
    }
  ]
};

export function ExecutiveReportModule({ onModuleChange }: ExecutiveReportModuleProps = {}) {
  // State
  const [reportPeriod, setReportPeriod] = useState('2024-12');
  const [reportType, setReportType] = useState('monthly');
  const [report, setReport] = useState<ReportData | null>(FALLBACK_REPORT);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // ============================================
  // DATA FETCHING
  // ============================================

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${EXEC_REPORT_API}/latest`);

      if (res.ok) {
        const data = await res.json();
        setReport(data.data);
      } else {
        // Keep fallback data if fetch fails
        console.warn("Using fallback report data");
      }
    } catch (err) {
      console.warn("Error loading executive report, using fallback");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // PDF EXPORT ACTION
  // ============================================

  const handleExportPDF = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${EXEC_REPORT_API}/export-pdf`);


      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Executive_Report_${report?.reporting_period || 'Latest'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Fallback for demo if backend endpoint is not ready
        window.print();
      }
    } catch (err) {
      console.error("PDF export error:", err);
      window.print(); // Fallback
    } finally {
      setDownloading(false);
    }
  };

  // ============================================
  // STATIC / MOCK DATA (Retained for Rich UI)
  // ============================================

  // Security Posture 6-Month Trend
  const postureTrend = [
    { month: 'Jul', score: 8.1 },
    { month: 'Aug', score: 8.3 },
    { month: 'Sep', score: 8.4 },
    { month: 'Oct', score: 8.4 },
    { month: 'Nov', score: 8.7 },
    { month: 'Dec', score: report?.overall_score || 8.7 }
  ];

  // Posture Factors
  const postureFactors = {
    improved: report?.top_improvements.map(i => ({
      factor: i.area, improvement: i.value, detail: i.impact
    })) || FALLBACK_REPORT.top_improvements.map(i => ({ factor: i.area, improvement: i.value, detail: i.impact })),
    worsened: report?.areas_of_concern.map(i => ({
      factor: i.area, decline: i.impact, detail: i.details
    })) || FALLBACK_REPORT.areas_of_concern.map(i => ({ factor: i.area, decline: i.impact, detail: i.details }))
  };

  // Strategic Recommendations
  const strategicRecommendations = (report?.strategic_recommendations || FALLBACK_REPORT.strategic_recommendations).map(rec => ({
    priority: rec.priority,
    impact: 'High',
    effort: rec.effort || 'Medium',
    title: rec.title,
    description: rec.description || `Initiative to address ${rec.impact_description}`,
    costRange: rec.cost,
    timeline: rec.timeline,
    riskReduction: rec.riskReduction || '1.0 points',
    dependencies: rec.dependencies || ['IT Ops'],
    projectedImpact: rec.projectedImpact || rec.impact_description
  }));

  // Top 3 Initiatives Requiring Leadership Support
  const leadershipInitiatives = strategicRecommendations.slice(0, 3);

  // Top Security Incidents with Full Context
  const topIncidents = [
    {
      id: 'INC-2024-0001',
      title: 'APT29 Campaign: Finance Network Lateral Movement',
      executiveSummary: 'Sophisticated adversary accessed financial systems via credential compromise. Successfully contained with no confirmed data loss.',
      impact_score: 9.2,
      businessImpact: 'Critical',
      businessImpactDetails: 'Customer PII and payment data at risk. Brand reputation impact. Regulatory notification required.',
      status: 'Contained',
      estimated_loss: '$50,000 - $150,000',
      resolution_time: '18 hours',
      regulatory_exposure: ['GDPR', 'PCI-DSS'],
      rootCause: 'Unpatched RDP vulnerability (CVE-2024-12345)',
      recurrenceRisk: 'Medium - Requires patch deployment and MFA enforcement',
      occurredDate: '2024-12-09',
      daysAgo: 0
    },
    {
      id: 'INC-2024-0003',
      title: 'Cloud Storage Data Exfiltration',
      executiveSummary: 'Unauthorized access to AWS S3 production bucket. Forensic investigation ongoing to determine data exposure scope.',
      impact_score: 8.8,
      businessImpact: 'High',
      businessImpactDetails: 'Proprietary business documents and customer contracts potentially exposed. Legal and PR teams engaged.',
      status: 'Investigation',
      estimated_loss: 'TBD - Under Assessment',
      resolution_time: 'Ongoing',
      regulatory_exposure: ['GDPR', 'SOX'],
      rootCause: 'Credential stuffing attack (under investigation)',
      recurrenceRisk: 'High - MFA gaps and privileged access controls needed',
      occurredDate: '2024-12-09',
      daysAgo: 0
    },
    {
      id: 'INC-2024-0002',
      title: 'Ransomware Attack: Development Environment',
      executiveSummary: 'Lockbit 3.0 ransomware successfully contained before encryption. Clean rebuild completed from verified backups.',
      impact_score: 8.1,
      businessImpact: 'Medium',
      businessImpactDetails: '18-hour development disruption. No production impact. Source code integrity verified.',
      status: 'Resolved',
      estimated_loss: '$5,000 - $15,000',
      resolution_time: '18 hours',
      regulatory_exposure: [],
      rootCause: 'Phishing email with malicious attachment',
      recurrenceRisk: 'Low - Email filtering enhanced, training completed',
      occurredDate: '2024-12-07',
      daysAgo: 2
    }
  ];

  // Critical Vulnerabilities with Enhanced Data
  const criticalVulnerabilities = [
    {
      id: 'CVE-2024-12345',
      title: 'Remote Code Execution in Apache HTTP Server',
      cvss_score: 9.8,
      affected_assets: 23,
      status: 'Open',
      days_open: 13,
      exploitationLikelihood: 'Very High',
      exposureScore: 95,
      affectedBusinessUnits: ['Finance', 'Customer Services', 'IT Operations'],
      publicExploitAvailable: true
    },
    {
      id: 'CVE-2024-11111',
      title: 'SQL Injection in MySQL Database',
      cvss_score: 8.1,
      affected_assets: 5,
      status: 'In Progress',
      days_open: 39,
      exploitationLikelihood: 'High',
      exposureScore: 78,
      affectedBusinessUnits: ['Development'],
      publicExploitAvailable: false
    },
    {
      id: 'CVE-2024-33333',
      title: 'Buffer Overflow in Network Service',
      cvss_score: 7.5,
      affected_assets: 8,
      status: 'Open',
      days_open: 27,
      exploitationLikelihood: 'Medium',
      exposureScore: 62,
      affectedBusinessUnits: ['IT Operations', 'Corporate IT'],
      publicExploitAvailable: true
    }
  ];

  // Patch Trend (Last 30 Days)
  const patchTrend = [
    { day: 5, patched: 3 },
    { day: 10, patched: 7 },
    { day: 15, patched: 12 },
    { day: 20, patched: 18 },
    { day: 25, patched: 24 },
    { day: 30, patched: 28 }
  ];

  // Business Units with Enhanced Risk Data
  const businessUnitRisks = [
    {
      unit: 'Finance',
      incidents: 3,
      risk_score: 8.9,
      riskTrend: 'worsening',
      trendChange: '+0.7',
      vulnerabilities: 45,
      complianceGaps: 8,
      complianceScore: 78,
      combinedExposure: 'Critical',
      details: '3 active incidents + 45 open vulns + 8 compliance gaps'
    },
    {
      unit: 'IT Operations',
      incidents: 5,
      risk_score: 7.2,
      riskTrend: 'stable',
      trendChange: '+0.1',
      vulnerabilities: 67,
      complianceGaps: 5,
      complianceScore: 85,
      combinedExposure: 'High',
      details: '5 active incidents + 67 open vulns + 5 compliance gaps'
    },
    {
      unit: 'Development',
      incidents: 2,
      risk_score: 6.1,
      riskTrend: 'improving',
      trendChange: '-0.3',
      vulnerabilities: 23,
      complianceGaps: 3,
      complianceScore: 92,
      combinedExposure: 'Medium',
      details: '2 active incidents + 23 open vulns + 3 compliance gaps'
    }
  ];

  // Compliance Frameworks with MoM Delta
  const complianceFrameworks = [
    {
      name: 'ISO 27001',
      status: 'Partially Compliant',
      score: 78.5,
      previousScore: 76.2,
      delta: '+2.3',
      failingControls: 12,
      topGaps: ['Access control review cadence', 'Vendor risk assessments', 'Encryption key rotation']
    },
    {
      name: 'NIST CSF',
      status: 'Compliant',
      score: 82.4,
      previousScore: 81.8,
      delta: '+0.6',
      failingControls: 8,
      topGaps: ['Supply chain risk management', 'Threat intelligence sharing', 'Asset inventory completeness']
    },
    {
      name: 'GDPR',
      status: 'Needs Attention',
      score: 68.1,
      previousScore: 73.5,
      delta: '-5.4',
      failingControls: 18,
      topGaps: ['Data mapping and inventory', 'Privacy impact assessments', 'Breach notification procedures', 'Data retention policies', 'Third-party processor agreements']
    },
    {
      name: 'SOX',
      status: 'Compliant',
      score: 85.3,
      previousScore: 84.7,
      delta: '+0.6',
      failingControls: 6,
      topGaps: ['Change management documentation', 'Segregation of duties', 'Access review evidence']
    }
  ];

  // Vulnerability Summary with Trends
  const vulnerabilitySummary = {
    total_open: 143,
    critical: { count: 19, trend: 'up', change: '+3' },
    high: { count: 34, trend: 'down', change: '-5' },
    medium: { count: 67, trend: 'up', change: '+8' },
    low: { count: 23, trend: 'down', change: '-2' },
    patched_this_month: 53,
    new_this_month: 28,
    patchVelocity: '4.2 days',
    backlogAging: '38 days average'
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'destructive';
      case 'in progress': return 'default';
      case 'investigation': return 'default';
      case 'contained': return 'secondary';
      case 'resolved': return 'outline';
      default: return 'outline';
    }
  };

  const getBusinessImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-300';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'low': return 'text-green-700 bg-green-100 border-green-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'compliant': return 'outline';
      case 'partially compliant': return 'secondary';
      case 'needs attention': return 'destructive';
      default: return 'outline';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'worsening': return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'down':
      case 'improving': return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getExposureColor = (exposure: string) => {
    switch (exposure.toLowerCase()) {
      case 'critical': return 'bg-red-600 text-white border-red-700';
      case 'high': return 'bg-orange-600 text-white border-orange-700';
      case 'medium': return 'bg-yellow-600 text-white border-yellow-700';
      case 'low': return 'bg-green-600 text-white border-green-700';
      default: return 'bg-gray-600 text-white border-gray-700';
    }
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

  if (!report) {
    return (
      <div className="flex items-center justify-center h-96 flex-col">
        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-muted-foreground">No executive report available for this period.</p>
        <Button variant="outline" className="mt-4" onClick={fetchReport}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* MAIN HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Executive Security Report</h1>
          <p className="text-muted-foreground">
            Board-level monthly cybersecurity assessment with strategic insights and business impact analysis
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-12">December 2024</SelectItem>
              <SelectItem value="2024-11">November 2024</SelectItem>
              <SelectItem value="2024-10">October 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportPDF} disabled={downloading}>
            {downloading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
            Export PDF
          </Button>
        </div>
      </div>

      {/* OVERALL SECURITY POSTURE - Enhanced */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2 text-2xl">
                <Award className="h-6 w-6 text-blue-600" />
                <span>Overall Security Posture</span>
              </CardTitle>
              <CardDescription>Organizational cybersecurity effectiveness and resilience rating</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Reporting Period</div>
              <div className="text-lg font-semibold">{report.reporting_period}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Posture Score with Trend */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <div className="text-6xl font-bold text-green-600">{report.overall_score}</div>
                <div className="text-3xl text-muted-foreground">/10</div>
              </div>
              <div className="flex items-center justify-center space-x-2 mb-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-lg font-semibold text-green-600">+{report.score_trend} from last month</span>
              </div>
              <div className="text-sm text-muted-foreground mb-3">Previous: {(report.overall_score - report.score_trend).toFixed(1)}</div>

              {/* 6-Month Trend Sparkline */}
              <div className="mt-4">
                <div className="text-xs text-muted-foreground mb-2">6-Month Trend</div>
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={postureTrend}>
                    <Line type="monotone" dataKey="score" stroke="#16a34a" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top 3 Improved Factors */}
            <div>
              <div className="font-semibold text-sm text-green-900 mb-3 flex items-center space-x-1">
                <TrendingUp className="h-4 w-4" />
                <span>Top Improvements</span>
              </div>
              <div className="space-y-2">
                {postureFactors.improved.map((factor, idx) => (
                  <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-green-900">{factor.factor}</span>
                      <Badge className="bg-green-600 text-white text-xs">{factor.improvement}</Badge>
                    </div>
                    <p className="text-xs text-green-700">{factor.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 3 Worsened Factors */}
            <div>
              <div className="font-semibold text-sm text-red-900 mb-3 flex items-center space-x-1">
                <TrendingDown className="h-4 w-4" />
                <span>Areas of Concern</span>
              </div>
              <div className="space-y-2">
                {postureFactors.worsened.map((factor, idx) => (
                  <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-red-900">{factor.factor}</span>
                      <Badge className="bg-red-600 text-white text-xs">{factor.decline}</Badge>
                    </div>
                    <p className="text-xs text-red-700">{factor.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Executive Interpretation */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
            <div className="flex items-start space-x-3">
              <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-900 mb-2 text-lg">Executive Interpretation</h4>
                <p className="text-blue-800 leading-relaxed">
                  {report.summary}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* STRATEGIC SECURITY RECOMMENDATIONS - Enhanced */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <span>Strategic Security Recommendations</span>
          </CardTitle>
          <CardDescription>Prioritized initiatives with business impact, cost, and resource requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Group by Impact/Effort */}
          <div className="space-y-5">
            {strategicRecommendations.map((rec, index) => (
              <div
                key={index}
                className={`border-2 rounded-lg p-5 ${rec.priority === 'Critical' ? 'border-red-300 bg-red-50/50' :
                  rec.priority === 'High' ? 'border-orange-300 bg-orange-50/50' :
                    'border-gray-300 bg-gray-50/50'
                  }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={rec.priority === 'Critical' ? 'destructive' : rec.priority === 'High' ? 'default' : 'secondary'} className="text-sm font-bold">
                        {rec.priority} Priority
                      </Badge>
                      <Badge variant="outline" className="text-sm">
                        {rec.impact} Impact
                      </Badge>
                      <Badge variant="outline" className="text-sm">
                        {rec.effort} Effort
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{rec.title}</h3>
                    <p className="text-gray-700 mb-3">{rec.description}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-3xl font-bold text-blue-600">{rec.projectedImpact}</div>
                    <div className="text-xs text-muted-foreground">Projected Impact</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div className="bg-white border rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Cost Range</div>
                    <div className="font-bold text-gray-900">{rec.costRange}</div>
                  </div>
                  <div className="bg-white border rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Timeline</div>
                    <div className="font-bold text-gray-900">{rec.timeline}</div>
                  </div>
                  <div className="bg-white border rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Risk Reduction</div>
                    <div className="font-bold text-green-600">{rec.riskReduction}</div>
                  </div>
                  <div className="bg-white border rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Dependencies</div>
                    <div className="font-bold text-gray-900">{rec.dependencies?.length || 1}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-1">Dependencies:</div>
                  <div className="flex flex-wrap gap-1">
                    {rec.dependencies?.map((dep, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Call to Action: Top 3 Initiatives */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-5">
            <div className="flex items-start space-x-3">
              <Flag className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold text-amber-900 mb-3 text-lg">Top 3 Initiatives Requiring Leadership Support</h4>
                <div className="space-y-2">
                  {leadershipInitiatives.map((initiative, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white border border-amber-200 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl font-bold text-amber-600">#{idx + 1}</div>
                        <div>
                          <div className="font-semibold text-gray-900">{initiative.title}</div>
                          <div className="text-sm text-gray-600">Cost: {initiative.costRange} • Timeline: {initiative.timeline}</div>
                        </div>
                      </div>
                      <Button size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TOP SECURITY INCIDENTS - Business Impact Focus */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Top Security Incidents</span>
          </CardTitle>
          <CardDescription>Business impact summaries of most significant security events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {topIncidents.map((incident, index) => (
              <div
                key={incident.id}
                className={`border-2 rounded-lg p-5 ${incident.businessImpact === 'Critical' ? 'border-red-300 bg-red-50/30' :
                  incident.businessImpact === 'High' ? 'border-orange-300 bg-orange-50/30' :
                    'border-yellow-300 bg-yellow-50/30'
                  }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="font-mono text-sm font-bold">
                      #{index + 1}
                    </Badge>
                    <span className="font-mono text-sm font-semibold">{incident.id}</span>
                    <Badge variant={getStatusColor(incident.status) as any}>
                      {incident.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{incident.daysAgo === 0 ? 'Today' : `${incident.daysAgo}d ago`}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2">{incident.title}</h3>
                <p className="text-gray-700 mb-4">{incident.executiveSummary}</p>

                <div className="grid gap-3 md:grid-cols-4 mb-4">
                  <div className="bg-white border-2 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Business Impact</div>
                    <Badge className={`${getBusinessImpactColor(incident.businessImpact)} border-2 font-bold text-sm`} variant="outline">
                      {incident.businessImpact}
                    </Badge>
                  </div>
                  <div className="bg-white border-2 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Financial Impact</div>
                    <div className="font-bold text-red-600">{incident.estimated_loss}</div>
                  </div>
                  <div className="bg-white border-2 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Impact Score</div>
                    <div className="text-2xl font-bold text-gray-900">{incident.impact_score}/10</div>
                  </div>
                  <div className="bg-white border-2 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Resolution Time</div>
                    <div className="font-bold text-gray-900">{incident.resolution_time}</div>
                  </div>
                </div>

                {incident.regulatory_exposure.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
                      <Scale className="h-4 w-4" />
                      <span>Regulatory Exposure</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {incident.regulatory_exposure.map((framework, idx) => (
                        <Badge key={idx} variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 font-semibold">
                          {framework}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white border rounded-lg p-3 mb-3">
                  <div className="text-sm font-semibold text-gray-700 mb-1">Root Cause</div>
                  <p className="text-sm text-gray-600">{incident.rootCause}</p>
                </div>

                <div className="bg-white border rounded-lg p-3">
                  <div className="text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>Recurrence Risk</span>
                  </div>
                  <p className="text-sm text-gray-600">{incident.recurrenceRisk}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CRITICAL VULNERABILITIES - Enhanced */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Shield className="h-5 w-5 text-purple-600" />
            <span>Critical Vulnerabilities</span>
          </CardTitle>
          <CardDescription>High-priority vulnerabilities requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criticalVulnerabilities.map((vuln, index) => (
              <div key={vuln.id} className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50/30">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="font-mono text-sm font-bold">#{index + 1}</Badge>
                    <span className="font-mono text-sm font-semibold">{vuln.id}</span>
                    <Badge variant={vuln.cvss_score >= 9 ? 'destructive' : 'default'} className="font-bold">
                      CVSS {vuln.cvss_score}
                    </Badge>
                    <Badge variant={getStatusColor(vuln.status) as any}>
                      {vuln.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{vuln.exposureScore}</div>
                    <div className="text-xs text-muted-foreground">Exposure Score</div>
                  </div>
                </div>

                <h4 className="font-bold text-lg mb-3">{vuln.title}</h4>

                <div className="grid gap-3 md:grid-cols-4 mb-3">
                  <div className="bg-white border rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Exploitation Likelihood</div>
                    <Badge className={`${vuln.exploitationLikelihood === 'Very High' ? 'bg-red-600' :
                      vuln.exploitationLikelihood === 'High' ? 'bg-orange-600' :
                        'bg-yellow-600'
                      } text-white font-bold`}>
                      {vuln.exploitationLikelihood}
                    </Badge>
                  </div>
                  <div className="bg-white border rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Affected Assets</div>
                    <div className="font-bold text-gray-900">{vuln.affected_assets} systems</div>
                  </div>
                  <div className="bg-white border rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Days Open</div>
                    <div className="font-bold text-red-600">{vuln.days_open} days</div>
                  </div>
                  <div className="bg-white border rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Public Exploit</div>
                    <div className="font-bold">
                      {vuln.publicExploitAvailable ? (
                        <span className="text-red-600">Yes</span>
                      ) : (
                        <span className="text-green-600">No</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Affected Business Units</div>
                  <div className="flex flex-wrap gap-2">
                    {vuln.affectedBusinessUnits.map((unit, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        <Building className="h-3 w-3 mr-1" />
                        {unit}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-5" />

          {/* Patch Trend (Last 30 Days) */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Patch Trend (Last 30 Days)</h4>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={patchTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="patched" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-sm text-muted-foreground mt-2">
              28 vulnerabilities patched this month • Average patch velocity: 4.2 days
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AT-RISK BUSINESS UNITS - Enhanced */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Building className="h-5 w-5 text-indigo-600" />
            <span>At-Risk Business Units</span>
          </CardTitle>
          <CardDescription>Departments with elevated security exposure and compliance gaps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {businessUnitRisks.map((unit, index) => (
              <div
                key={unit.unit}
                className={`border-3 rounded-lg p-5 ${unit.combinedExposure === 'Critical' ? 'border-red-400 bg-red-50/40' :
                  unit.combinedExposure === 'High' ? 'border-orange-400 bg-orange-50/40' :
                    'border-yellow-400 bg-yellow-50/40'
                  }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl font-bold text-gray-400">#{index + 1}</div>
                    <div>
                      <h3 className="text-xl font-bold flex items-center space-x-2">
                        <Building className="h-5 w-5" />
                        <span>{unit.unit}</span>
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={`${getExposureColor(unit.combinedExposure)} border-2 font-bold text-sm`}>
                          {unit.combinedExposure} Exposure
                        </Badge>
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(unit.riskTrend)}
                          <span className={`text-sm font-semibold ${unit.riskTrend === 'worsening' ? 'text-red-600' :
                            unit.riskTrend === 'improving' ? 'text-green-600' :
                              'text-gray-600'
                            }`}>
                            {unit.trendChange}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-red-600">{unit.risk_score}</div>
                    <div className="text-xs text-muted-foreground">Risk Score</div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-4 mb-3">
                  <div className="bg-white border-2 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-600">{unit.incidents}</div>
                    <div className="text-xs text-muted-foreground">Active Incidents</div>
                  </div>
                  <div className="bg-white border-2 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600">{unit.vulnerabilities}</div>
                    <div className="text-xs text-muted-foreground">Open Vulnerabilities</div>
                  </div>
                  <div className="bg-white border-2 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-orange-600">{unit.complianceGaps}</div>
                    <div className="text-xs text-muted-foreground">Compliance Gaps</div>
                  </div>
                  <div className="bg-white border-2 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{unit.complianceScore}%</div>
                    <div className="text-xs text-muted-foreground">Compliance Score</div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Combined Exposure:</strong> {unit.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* COMPLIANCE & VULNERABILITY SUMMARY (2 COLUMNS) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Compliance Framework Status - Enhanced */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Compliance Framework Status</CardTitle>
            <CardDescription>Month-over-month compliance progress and critical gaps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {complianceFrameworks.map((framework) => (
                <div key={framework.name} className="border-2 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg">{framework.name}</span>
                      <Badge variant={getComplianceStatusColor(framework.status) as any}>
                        {framework.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">{framework.score}%</span>
                        <div className={`flex items-center text-sm font-semibold ${parseFloat(framework.delta) > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {parseFloat(framework.delta) > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          <span>{framework.delta}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">MoM Change</div>
                    </div>
                  </div>

                  <Progress value={framework.score} className="h-2 mb-3" />

                  <div className="bg-gray-50 border rounded-lg p-3 mb-3">
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      Failing Controls: <span className="text-red-600">{framework.failingControls}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">Top Gaps:</div>
                    <div className="space-y-1">
                      {framework.topGaps.slice(0, 3).map((gap, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-xs">
                          <XCircle className="h-3 w-3 text-red-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{gap}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vulnerability Summary - Enhanced */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Vulnerability Summary</CardTitle>
            <CardDescription>Current vulnerability landscape with monthly trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border-2 rounded-lg bg-red-50">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <div className="text-3xl font-bold text-red-600">{vulnerabilitySummary.critical.count}</div>
                    {getTrendIcon(vulnerabilitySummary.critical.trend)}
                    <span className="text-sm font-semibold text-red-600">{vulnerabilitySummary.critical.change}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Critical</div>
                </div>
                <div className="text-center p-4 border-2 rounded-lg bg-orange-50">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <div className="text-3xl font-bold text-orange-600">{vulnerabilitySummary.high.count}</div>
                    {getTrendIcon(vulnerabilitySummary.high.trend)}
                    <span className="text-sm font-semibold text-orange-600">{vulnerabilitySummary.high.change}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">High</div>
                </div>
                <div className="text-center p-4 border-2 rounded-lg bg-yellow-50">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <div className="text-3xl font-bold text-yellow-600">{vulnerabilitySummary.medium.count}</div>
                    {getTrendIcon(vulnerabilitySummary.medium.trend)}
                    <span className="text-sm font-semibold text-yellow-600">{vulnerabilitySummary.medium.change}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Medium</div>
                </div>
                <div className="text-center p-4 border-2 rounded-lg bg-green-50">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <div className="text-3xl font-bold text-green-600">{vulnerabilitySummary.low.count}</div>
                    {getTrendIcon(vulnerabilitySummary.low.trend)}
                    <span className="text-sm font-semibold text-green-600">{vulnerabilitySummary.low.change}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Low</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg">
                  <span className="font-semibold">Total Open Vulnerabilities:</span>
                  <span className="text-xl font-bold">{vulnerabilitySummary.total_open}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="font-semibold text-green-900">Patched This Month:</span>
                  <span className="text-xl font-bold text-green-600">+{vulnerabilitySummary.patched_this_month}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <span className="font-semibold text-red-900">New This Month:</span>
                  <span className="text-xl font-bold text-red-600">+{vulnerabilitySummary.new_this_month}</span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{vulnerabilitySummary.patchVelocity}</div>
                  <div className="text-sm text-muted-foreground">Avg Patch Velocity</div>
                </div>
                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{vulnerabilitySummary.backlogAging}</div>
                  <div className="text-sm text-muted-foreground">Backlog Aging</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}