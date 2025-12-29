import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Target,
  Clock,
  FileWarning,
  Award,
  Camera,
  Database,
  Settings,
  Zap,
  Building,
  ChevronRight,
  Activity,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';



// ============================================
// INTERFACES & TYPES
// ============================================

interface ComplianceModuleProps {
  onModuleChange?: (module: string) => void;
}

interface Framework {
  framework_id: string;
  name: string;
  compliance_percentage: number;
  status: string;
  compliant_count: number;
  partial_count: number;
  missing_count: number;
  total_requirements: number;
  next_review_date: string;
  days_until_review: number;
  trend: number;
  color: string;
}

interface Violation {
  violation_id: number;
  title: string;
  severity: string;
  framework: string;
  affected_assets_count: number;
  impact_summary: string;
  deadline: string;
  days_remaining: number;
  owner: string;
  status: string;
  remediation_steps?: Array<{
    step: number;
    description: string;
    completed: boolean;
  }>;
}

interface Action {
  action_id: number;
  priority: string;
  action_title: string;
  business_impact: string;
  timeline_days: number;
  effort_level: string;
  status: string;
  assigned_to?: string;
  taken_at?: string;
}

interface Evidence {
  evidence_type: string;
  total_count: number;
  coverage_quality: number;
  recent_count: number;
  outdated_count: number;
  overall_coverage_quality?: number;
  gap_count: number;
  last_gap_report_generated?: string;
}

interface Control {
  id: number;
  name: string;
  framework: string;
  maturity_score: number;
  max_score: number;
  effectiveness: number;
  tested: number;
  total: number;
  status: string;
  last_test: string;
}

interface ExecutiveKPIs {
  overall_compliance: {
    value: number;
    trend: number;
    target: number;
    status: string;
  };
  violations: {
    value: number;
    trend: number;
    critical: number;
    status: string;
  };
  controls_tested: {
    value: number;
    total: number;
    percentage: number;
    trend: number;
    status: string;
  };
  audit_readiness: {
    value: number;
    trend: number;
    days_to_audit: number;
    status: string;
  };
}

// ============================================
// FALLBACK DATA (SAFETY NET)
// ============================================

const FALLBACK_FRAMEWORKS: Framework[] = [
  { framework_id: 'iso27001', name: 'ISO 27001:2013', compliance_percentage: 82, status: 'Good', compliant_count: 94, partial_count: 12, missing_count: 8, total_requirements: 114, next_review_date: '2025-06-15', days_until_review: 124, trend: 5, color: 'blue' },
  { framework_id: 'soc2', name: 'SOC 2 Type II', compliance_percentage: 68, status: 'At Risk', compliant_count: 45, partial_count: 15, missing_count: 5, total_requirements: 65, next_review_date: '2025-03-01', days_until_review: 18, trend: -2, color: 'purple' },
  { framework_id: 'gdpr', name: 'GDPR', compliance_percentage: 91, status: 'Excellent', compliant_count: 88, partial_count: 8, missing_count: 3, total_requirements: 99, next_review_date: '2025-09-30', days_until_review: 215, trend: 1, color: 'green' }
];

const FALLBACK_VIOLATIONS: Violation[] = [
  { violation_id: 101, title: 'Unencrypted S3 Bucket Detected', severity: 'Critical', framework: 'ISO 27001', affected_assets_count: 3, impact_summary: 'Customer PII data exposed publicly.', deadline: '2025-02-28', days_remaining: 2, owner: 'DevOps Team', status: 'Open', remediation_steps: [{ step: 1, description: 'Enable AES-256 encryption', completed: false }] },
  { violation_id: 102, title: 'MFA Disabled on Admin Account', severity: 'High', framework: 'SOC 2', affected_assets_count: 1, impact_summary: 'Risk of unauthorized access to prod.', deadline: '2025-03-05', days_remaining: 7, owner: 'IT Security', status: 'In Progress', remediation_steps: [{ step: 1, description: 'Enforce MFA policy', completed: true }] }
];

const FALLBACK_ACTIONS: Action[] = [
  { action_id: 201, priority: 'High', action_title: 'Review User Access Logs', business_impact: 'Detect potential insider threats', timeline_days: 3, effort_level: 'Low', status: 'Open' },
  { action_id: 202, priority: 'Medium', action_title: 'Update Incident Response Plan', business_impact: 'Ensure compliance with SOC 2 CC7.3', timeline_days: 14, effort_level: 'Medium', status: 'Open' }
];

const FALLBACK_EVIDENCE: Evidence[] = [
  { evidence_type: 'documents', total_count: 145, coverage_quality: 88, recent_count: 120, outdated_count: 25, overall_coverage_quality: 85, gap_count: 12 },
  { evidence_type: 'screenshots', total_count: 340, coverage_quality: 92, recent_count: 310, outdated_count: 30, overall_coverage_quality: 85, gap_count: 12 },
  { evidence_type: 'configurations', total_count: 850, coverage_quality: 75, recent_count: 600, outdated_count: 250, overall_coverage_quality: 85, gap_count: 12 }
];

const FALLBACK_CONTROLS: Control[] = [
  { id: 1, name: 'Access Control (AC-1)', framework: 'NIST 800-53', maturity_score: 4.2, max_score: 5, effectiveness: 95, tested: 12, total: 12, status: 'Mature', last_test: '2025-01-15' },
  { id: 2, name: 'Data Encryption', framework: 'ISO 27001', maturity_score: 3.5, max_score: 5, effectiveness: 82, tested: 8, total: 10, status: 'Managed', last_test: '2025-01-20' }
];

const FALLBACK_KPIS: ExecutiveKPIs = {
  overall_compliance: { value: 78.5, trend: 3.2, target: 85, status: 'On Track' },
  violations: { value: 12, trend: -4, critical: 2, status: 'Improving' },
  controls_tested: { value: 45, total: 120, percentage: 37.5, trend: 5, status: 'Active' },
  audit_readiness: { value: 65, trend: 2, days_to_audit: 38, status: 'Warning' }
};

// ============================================
// MAIN COMPONENT
// ============================================

export function ComplianceModule({ onModuleChange }: ComplianceModuleProps = {}) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  // Initialize with Fallback Data so the UI isn't empty initially
  const [frameworks, setFrameworks] = useState<Framework[]>(FALLBACK_FRAMEWORKS);
  const [violations, setViolations] = useState<Violation[]>(FALLBACK_VIOLATIONS);
  const [actions, setActions] = useState<Action[]>(FALLBACK_ACTIONS);
  const [evidence, setEvidence] = useState<Evidence[]>(FALLBACK_EVIDENCE);
  const [controls, setControls] = useState<Control[]>(FALLBACK_CONTROLS);
  const [executiveKPIs, setExecutiveKPIs] = useState<ExecutiveKPIs | null>(FALLBACK_KPIS);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingViolationId, setLoadingViolationId] = useState<number | null>(null);
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Modal/Detail view states
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [showViolationModal, setShowViolationModal] = useState(false);

  // ============================================
  // LIFECYCLE HOOKS
  // ============================================

  useEffect(() => {
    fetchAllData();
  }, []);

  // ============================================
  // API FETCH FUNCTIONS
  // ============================================

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Helper to fetch with relative path
      const fetchWithFallback = async (endpoint: string) => {
        try {
          const res = await fetch(`${API_BASE}/api/compliance${endpoint}`);

          if (!res.ok) throw new Error('Not OK');
          return await res.json();
        } catch (e) {
          return null; // Return null on fail to keep fallback
        }
      };

      const [
        frameworksRes,
        violationsRes,
        actionsRes,
        evidenceRes,
        controlsRes,
        kpisRes
      ] = await Promise.all([
        fetchWithFallback('/frameworks'),
        fetchWithFallback('/violations'),
        fetchWithFallback('/actions'),
        fetchWithFallback('/evidence'),
        fetchWithFallback('/controls'),
        fetchWithFallback('/executive-kpis')
      ]);

      // Only update state if we got valid data back
      if (frameworksRes && frameworksRes.data) setFrameworks(frameworksRes.data);
      if (violationsRes && violationsRes.data) setViolations(violationsRes.data);
      if (actionsRes && actionsRes.data) setActions(actionsRes.data);
      if (evidenceRes && evidenceRes.data) setEvidence(evidenceRes.data);
      if (controlsRes && controlsRes.data) setControls(controlsRes.data);
      if (kpisRes && kpisRes.data) setExecutiveKPIs(kpisRes.data);

    } catch (err) {
      console.warn("Using fallback compliance data due to connection error");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // VIOLATION DETAILS API
  // ============================================

  const viewViolationDetails = async (violationId: number) => {
    setLoadingViolationId(violationId);
    try {
      // Check if it's a real ID or a fallback ID
      if (violationId > 1000) {
        // Real API call
        const response = await fetch(
          `${API_BASE}/api/compliance/violations/${violationId}`
        );

        if (response.ok) {
          const data = await response.json();
          setSelectedViolation(data.data);
          setShowViolationModal(true);
        } else {
          alert("Failed to load violation details");
        }
      } else {
        // Fallback Data
        const mockDetail = FALLBACK_VIOLATIONS.find(v => v.violation_id === violationId);
        if (mockDetail) {
          setSelectedViolation(mockDetail);
          setShowViolationModal(true);
        }
      }
    } catch (err) {
      console.error("Error fetching violation details:", err);
    } finally {
      setLoadingViolationId(null);
    }
  };

  // ============================================
  // TAKE ACTION API
  // ============================================

  const takeAction = async (actionId: number) => {
    setLoadingActionId(actionId);
    try {
      const response = await fetch(
        `${API_BASE}/api/compliance/actions/${actionId}/take-action`,

        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            assigned_to: "current_user"
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert("✅ Action taken successfully!");
        await fetchAllData();
      } else {
        // Simulate success for demo
        alert("✅ Action recorded (Demo Mode)");
        // Update local state to reflect change
        setActions(prev => prev.map(a => a.action_id === actionId ? { ...a, status: 'Closed' } : a));
      }
    } catch (err) {
      // Simulate success for demo
      alert("✅ Action recorded (Demo Mode)");
      setActions(prev => prev.map(a => a.action_id === actionId ? { ...a, status: 'Closed' } : a));
    } finally {
      setLoadingActionId(null);
    }
  };

  // ============================================
  // GENERATE GAP REPORT API
  // ============================================

  const generateGapReport = async () => {
    setGeneratingReport(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/compliance/evidence/generate-gap-report`,

        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (response.ok) {
        alert("✅ Gap report generated successfully!");
        await fetchAllData();
      } else {
        setTimeout(() => alert("✅ Gap report generated (Demo Mode)"), 1000);
      }
    } catch (err) {
      setTimeout(() => alert("✅ Gap report generated (Demo Mode)"), 1000);
    } finally {
      setGeneratingReport(false);
    }
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getSeverityColor = (severity: string): string => {
    const colorMap: { [key: string]: string } = {
      'Critical': 'bg-red-600 text-white border-red-700',
      'High': 'bg-orange-600 text-white border-orange-700',
      'Medium': 'bg-yellow-600 text-white border-yellow-700',
      'Low': 'bg-green-600 text-white border-green-700',
    };
    return colorMap[severity] || 'bg-gray-600 text-white border-gray-700';
  };

  const getMaturityColor = (score: number): string => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 4.0) return 'text-blue-600';
    if (score >= 3.5) return 'text-purple-600';
    if (score >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMaturityLabel = (status: string): string => {
    const colors: { [key: string]: string } = {
      'Optimized': 'bg-green-100 text-green-800 border-green-300',
      'Mature': 'bg-blue-100 text-blue-800 border-blue-300',
      'Managed': 'bg-purple-100 text-purple-800 border-purple-300',
      'Defined': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Developing': 'bg-orange-100 text-orange-800 border-orange-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getFrameworkColor = (color: string): { bg: string; border: string; text: string } => {
    const colorMap: { [key: string]: { bg: string; border: string; text: string } } = {
      'blue': { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-600' },
      'purple': { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-600' },
      'red': { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-600' },
      'green': { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-600' },
      'indigo': { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-600' },
    };
    return colorMap[color] || { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-600' };
  };

  // ============================================
  // STATIC DATA (Compliance Storyline & Risk Velocity)
  // ============================================

  const complianceStoryline = {
    title: "GDPR compliance requires immediate attention",
    description: "Overall compliance improved 3.2% this quarter, but GDPR gaps pose regulatory risk. SOX and PCI DSS remain strong. Next audit in 38 days.",
    urgency: "medium" as const,
    daysToNextAudit: 38
  };

  const riskVelocity = [
    { week: 'W1', score: 73.2, target: 85 },
    { week: 'W2', score: 75.1, target: 85 },
    { week: 'W3', score: 76.8, target: 85 },
    { week: 'W4', score: 78.3, target: 85 },
    { week: 'W5', score: 79.5, target: 85 }
  ];

  const velocityStoryline = "Compliance score improved 6.3 points over 5 weeks. Projected to reach 85% target in 3 weeks at current velocity.";

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* COMPLIANCE THREAT STORYLINE */}
      {/* ============================================ */}
      <Card className={`border-2 shadow-lg ${complianceStoryline.urgency === 'high' ? 'border-red-500 bg-red-50' :
        complianceStoryline.urgency === 'medium' ? 'border-yellow-500 bg-yellow-50' :
          'border-green-500 bg-green-50'
        }`}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className={`h-6 w-6 ${complianceStoryline.urgency === 'high' ? 'text-red-600' :
                  complianceStoryline.urgency === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`} />
                <h2 className={`text-2xl font-bold ${complianceStoryline.urgency === 'high' ? 'text-red-900' :
                  complianceStoryline.urgency === 'medium' ? 'text-yellow-900' :
                    'text-green-900'
                  }`}>
                  {complianceStoryline.title}
                </h2>
              </div>
              <p className={`text-lg ${complianceStoryline.urgency === 'high' ? 'text-red-800' :
                complianceStoryline.urgency === 'medium' ? 'text-yellow-800' :
                  'text-green-800'
                }`}>
                {complianceStoryline.description}
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-600">{complianceStoryline.daysToNextAudit}</div>
              <div className="text-sm text-muted-foreground">days to audit</div>
              <Badge className="bg-purple-600 text-white mt-2">
                <Clock className="h-3 w-3 mr-1" />
                Critical Timeline
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* EXECUTIVE KPIs */}
      {/* ============================================ */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Overall Compliance */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">
              {executiveKPIs?.overall_compliance?.value?.toFixed(1) || '0'}%
            </div>
            <div className="flex items-center space-x-1 text-xs mt-2">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-semibold">
                +{executiveKPIs?.overall_compliance?.trend}%
              </span>
              <span className="text-muted-foreground">this quarter</span>
            </div>
            <div className="mt-3">
              <Progress
                value={(executiveKPIs?.overall_compliance?.value || 0) / (executiveKPIs?.overall_compliance?.target || 100) * 100}
                className="h-2 bg-blue-200"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Target: {executiveKPIs?.overall_compliance?.target}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Violations */}
        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-600">{violations.length}</div>
            <div className="flex items-center space-x-1 text-xs mt-2">
              <ArrowDownRight className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-semibold">
                {executiveKPIs?.violations?.trend || 0} fewer
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
            <div className="mt-3">
              <Badge variant="destructive" className="text-xs">
                {executiveKPIs?.violations?.critical || 0} Critical
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Controls Tested */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Controls Tested</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <div className="text-4xl font-bold text-purple-600">
                {executiveKPIs?.controls_tested?.value || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                /{executiveKPIs?.controls_tested?.total || 0}
              </div>
            </div>
            <div className="flex items-center space-x-1 text-xs mt-2">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-semibold">
                +{executiveKPIs?.controls_tested?.trend || 0}
              </span>
              <span className="text-muted-foreground">this month</span>
            </div>
            <div className="mt-3">
              <Progress
                value={executiveKPIs?.controls_tested?.percentage || 0}
                className="h-2 bg-purple-200"
              />
              <div className="text-xs font-semibold text-purple-600 mt-1">
                {executiveKPIs?.controls_tested?.percentage || 0}% coverage
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Readiness */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Readiness</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              {executiveKPIs?.audit_readiness?.value || 0}%
            </div>
            <div className="flex items-center space-x-1 text-xs mt-2">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-semibold">
                +{executiveKPIs?.audit_readiness?.trend || 0}%
              </span>
              <span className="text-muted-foreground">this month</span>
            </div>
            <div className="mt-3">
              <div className="text-xs text-muted-foreground">
                Next audit in {executiveKPIs?.audit_readiness?.days_to_audit || 0} days
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================ */}
      {/* COMPLIANCE RISK VELOCITY */}
      {/* ============================================ */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span>Compliance Risk Velocity</span>
          </CardTitle>
          <CardDescription>5-week compliance trajectory and target convergence</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={riskVelocity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[60, 90]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ fill: '#22c55e', r: 5 }}
                name="Compliance Score"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#6b7280"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-800 italic">{velocityStoryline}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* FRAMEWORK TILES */}
      {/* ============================================ */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span>Compliance Frameworks</span>
          </CardTitle>
          <CardDescription>Status, gaps, and upcoming review dates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {frameworks.map((framework) => {
              const colors = getFrameworkColor(framework.color);
              return (
                <div
                  key={framework.framework_id}
                  className={`border-2 rounded-lg p-4 ${colors.bg} ${colors.border}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className={`font-bold text-lg ${colors.text}`}>{framework.name}</h4>
                      <Badge variant="outline" className="text-xs mt-1">
                        {framework.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${colors.text}`}>
                        {framework.compliance_percentage}%
                      </div>
                      <div className="flex items-center space-x-1 text-xs mt-1">
                        {getTrendIcon(framework.trend)}
                        <span className={framework.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                          {framework.trend > 0 ? '+' : ''}{framework.trend}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <Progress value={framework.compliance_percentage} className="h-3" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-white border rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-green-600">
                        {framework.compliant_count}
                      </div>
                      <div className="text-xs text-muted-foreground">Compliant</div>
                    </div>
                    <div className="bg-white border rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-yellow-600">
                        {framework.partial_count}
                      </div>
                      <div className="text-xs text-muted-foreground">Partial</div>
                    </div>
                    <div className="bg-white border rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-red-600">
                        {framework.missing_count}
                      </div>
                      <div className="text-xs text-muted-foreground">Missing</div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Next Review:</span>
                      <span className="text-xs font-semibold">
                        {new Date(framework.next_review_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">Days remaining:</span>
                      <Badge
                        variant={framework.days_until_review < 30 ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {framework.days_until_review} days
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* VIOLATIONS & CONTROLS */}
      {/* ============================================ */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Violations */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileWarning className="h-5 w-5 text-red-600" />
              <span>Compliance Violations</span>
            </CardTitle>
            <CardDescription>Prioritized list with impact summaries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {violations.length > 0 ? (
                violations.map((violation) => (
                  <div
                    key={violation.violation_id}
                    className="border-2 border-red-200 rounded-lg p-4 bg-red-50/30"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getSeverityColor(violation.severity)}>
                            {violation.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {violation.framework}
                          </Badge>
                        </div>
                        <h4 className="font-bold text-sm">{violation.title}</h4>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{violation.impact_summary}</p>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-white border rounded p-2 text-center">
                        <div className="text-lg font-bold text-purple-600">
                          {violation.affected_assets_count}
                        </div>
                        <div className="text-xs text-muted-foreground">Assets</div>
                      </div>
                      <div className="bg-white border rounded p-2 text-center">
                        <div className="text-lg font-bold text-orange-600">
                          {violation.days_remaining}
                        </div>
                        <div className="text-xs text-muted-foreground">Days left</div>
                      </div>
                      <div className="bg-white border rounded p-2 text-center">
                        <Badge
                          variant={violation.status === 'In Progress' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {violation.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Building className="h-3 w-3" />
                        <span>{violation.owner}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7"
                        onClick={() => viewViolationDetails(violation.violation_id)}
                        disabled={loadingViolationId === violation.violation_id}
                      >
                        {loadingViolationId === violation.violation_id ? (
                          <Loader className="h-3 w-3 mr-1 animate-spin" />
                        ) : null}
                        View Details
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No violations found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <span>Control Maturity</span>
            </CardTitle>
            <CardDescription>Control effectiveness and maturity scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {controls.length > 0 ? (
                controls.map((control) => (
                  <div
                    key={control.id}
                    className="border-2 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold">{control.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {control.framework}
                          </Badge>
                          <Badge className={`text-xs ${getMaturityLabel(control.status)}`}>
                            {control.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getMaturityColor(control.maturity_score)}`}>
                          {control.maturity_score}
                        </div>
                        <div className="text-xs text-muted-foreground">/{control.max_score}</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Effectiveness</span>
                        <span className="font-semibold">{control.effectiveness}%</span>
                      </div>
                      <Progress value={control.effectiveness} className="h-3" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{control.tested}/{control.total} controls tested</span>
                      <span>Last test: {control.last_test}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No controls found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================ */}
      {/* EVIDENCE INTELLIGENCE */}
      {/* ============================================ */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-indigo-600" />
            <span>Evidence Intelligence</span>
          </CardTitle>
          <CardDescription>Documentation coverage and quality metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600">
                {evidence.length > 0 ? evidence[0].overall_coverage_quality || 85.7 : 85.7}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">Coverage Quality</div>
              <Progress value={evidence.length > 0 ? evidence[0].overall_coverage_quality || 85.7 : 85.7} className="h-2 mt-2" />
            </div>
            {evidence.map((item) => {
              const textColor = item.evidence_type === "documents" ? "text-blue-600" :
                item.evidence_type === "screenshots" ? "text-purple-600" :
                  "text-green-600";
              const bgColor = item.evidence_type === "documents" ? "bg-blue-50" :
                item.evidence_type === "screenshots" ? "bg-purple-50" :
                  "bg-green-50";

              return (
                <div key={item.evidence_type} className={`border-2 rounded-lg p-4 ${bgColor}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {item.evidence_type === "documents" && (
                      <FileText className="h-5 w-5 text-blue-600" />
                    )}
                    {item.evidence_type === "screenshots" && (
                      <Camera className="h-5 w-5 text-purple-600" />
                    )}
                    {item.evidence_type === "configurations" && (
                      <Settings className="h-5 w-5 text-green-600" />
                    )}
                    <h4 className="font-semibold capitalize">{item.evidence_type}</h4>
                  </div>
                  <div className={`text-3xl font-bold ${textColor}`}>
                    {item.total_count}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Recent</div>
                      <div className="text-sm font-bold text-green-600">{item.recent_count}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Outdated</div>
                      <div className="text-sm font-bold text-red-600">{item.outdated_count}</div>
                    </div>
                  </div>
                  <Progress value={item.coverage_quality} className="h-2 mt-2" />
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-semibold text-yellow-900">
                  {evidence.length > 0 ? evidence[0].gap_count : 34} evidence gaps identified
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={generateGapReport}
                disabled={generatingReport}
              >
                {generatingReport ? (
                  <Loader className="h-4 w-4 mr-1 animate-spin" />
                ) : null}
                Generate Gap Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* CISO RECOMMENDED ACTIONS */}
      {/* ============================================ */}
      <Card className="shadow-lg border-2 border-purple-900 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-900">
            <Zap className="h-5 w-5" />
            <span>CISO Recommended Actions</span>
          </CardTitle>
          <CardDescription>Prioritized compliance actions with business impact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {actions.length > 0 ? (
              actions.map((action) => (
                <div
                  key={action.action_id}
                  className="border-2 border-purple-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={getSeverityColor(action.priority)}>
                          {action.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {action.timeline_days} days
                        </Badge>
                      </div>
                      <h4 className="font-bold">{action.action_title}</h4>
                      <p className="text-sm text-gray-700 mt-1">{action.business_impact}</p>
                    </div>
                    <Button
                      onClick={() => takeAction(action.action_id)}
                      disabled={loadingActionId === action.action_id || action.status !== 'Open'}
                      className="ml-4"
                    >
                      {loadingActionId === action.action_id ? (
                        <Loader className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-1" />
                      )}
                      {action.status === 'Open' ? 'Take Action' : 'Taken'}
                    </Button>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                    <span>Effort: {action.effort_level}</span>
                    <span>Status: {action.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Zap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recommended actions</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* VIOLATION DETAILS MODAL */}
      {/* ============================================ */}
      {showViolationModal && selectedViolation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 border-b">
              <div className="flex-1">
                <CardTitle className="flex items-center space-x-2">
                  <Badge className={getSeverityColor(selectedViolation.severity)}>
                    {selectedViolation.severity}
                  </Badge>
                  <span>{selectedViolation.title}</span>
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowViolationModal(false)}
                className="ml-4"
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <h4 className="font-semibold mb-2">Impact Summary</h4>
                <p className="text-sm text-gray-700">{selectedViolation.impact_summary}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Affected Assets</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedViolation.affected_assets_count}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Days Remaining</h4>
                  <p className="text-2xl font-bold text-orange-600">
                    {selectedViolation.days_remaining}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Remediation Steps</h4>
                <div className="space-y-2">
                  {selectedViolation.remediation_steps?.map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-sm">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step.completed ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'
                        }`}>
                        {step.step}
                      </div>
                      <div>
                        <p className={step.completed ? 'line-through text-gray-500' : ''}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center space-x-2 text-sm">
                  <Building className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">Owner: <strong>{selectedViolation.owner}</strong></span>
                </div>
                <div className="flex items-center space-x-2 text-sm mt-2">
                  <Badge variant={selectedViolation.status === 'In Progress' ? 'secondary' : 'outline'}>
                    {selectedViolation.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}