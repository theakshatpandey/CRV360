import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Loader2 } from 'lucide-react';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertTriangle,
  Target,
  Activity,
  Globe,
  Building,
  Shield,
  Flame,
  Users,
  ExternalLink,
  CheckCircle,
  Clock,
  Info,
  DollarSign,
  Zap,
  FileWarning
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line
} from 'recharts';

interface RiskDashboardModuleProps {
  onModuleChange?: (module: string) => void;
}

// --- FALLBACK DATA CONSTANTS ---
// Defined outside the component to ensure they are available immediately

const FALLBACK_SUMMARY = {
  current: 7.2,
  previous: 7.5,
  change: -0.3,
  projected: 5.9,
  trend: 'improving',
  monthlyTrend: [
    { month: 'Jul', score: 8.1 },
    { month: 'Aug', score: 7.8 },
    { month: 'Sep', score: 7.6 },
    { month: 'Oct', score: 7.5 },
    { month: 'Nov', score: 7.4 },
    { month: 'Dec', score: 7.2 }
  ],
  top_drivers: ['Unpatched Vulns', 'Weak Access Controls', 'Cloud Misconfig'],
  monthly_story: "Risk decreased 4% this month driven by aggressive vulnerability patching and MFA rollout. Production systems remain the highest priority area."
};

const FALLBACK_POSTURE = [
  { factor: 'Vulnerabilities', current: 8.1, target: 5.0, industry: 6.8, peerGroup: 7.1, momChange: -0.3, keyFactors: 'Unpatched Apache servers, legacy OS versions' },
  { factor: 'Compliance', current: 6.8, target: 4.0, industry: 5.9, peerGroup: 6.2, momChange: +0.2, keyFactors: 'GDPR data inventory gaps, SOC 2 audit findings' },
  { factor: 'Threats', current: 7.5, target: 5.5, industry: 7.2, peerGroup: 7.4, momChange: +0.4, keyFactors: 'APT29 activity, ransomware campaigns' },
  { factor: 'Assets', current: 5.2, target: 4.5, industry: 6.1, peerGroup: 5.8, momChange: -0.1, keyFactors: 'Shadow IT discovery, IoT device sprawl' },
  { factor: 'Access Control', current: 6.9, target: 4.0, industry: 6.5, peerGroup: 6.7, momChange: -0.5, keyFactors: 'MFA coverage gaps, privileged access reviews' },
  { factor: 'Network Security', current: 7.3, target: 5.0, industry: 6.9, peerGroup: 7.0, momChange: -0.2, keyFactors: 'Exposed services, network segmentation' }
];

const FALLBACK_CATEGORY = [
  { name: 'Vulnerabilities', value: 35, color: '#ef4444', riskContribution: 2.52, businessImpact: 'High', trend: 'down', momChange: -3 },
  { name: 'Compliance Gaps', value: 25, color: '#f97316', riskContribution: 1.80, businessImpact: 'High', trend: 'up', momChange: +2 },
  { name: 'Threat Exposure', value: 25, color: '#eab308', riskContribution: 1.80, businessImpact: 'Medium', trend: 'up', momChange: +1 },
  { name: 'Asset Exposure', value: 15, color: '#22c55e', riskContribution: 1.08, businessImpact: 'Low', trend: 'down', momChange: -1 }
];

const FALLBACK_BUSINESS_UNITS = [
  { unit: 'Production Systems', risk: 8.5, assets: 89, vulnerabilities: 34, severity: 'Critical', riskContribution: 28.5, momChange: -0.2, trend: 'improving', assetCriticality: 95 },
  { unit: 'Corporate Network', risk: 7.1, assets: 234, vulnerabilities: 45, severity: 'High', riskContribution: 22.3, momChange: +0.3, trend: 'worsening', assetCriticality: 78 },
  { unit: 'Remote Endpoints', risk: 6.9, assets: 445, vulnerabilities: 67, severity: 'High', riskContribution: 19.8, momChange: -0.4, trend: 'improving', assetCriticality: 65 },
  { unit: 'Development Environment', risk: 6.2, assets: 67, vulnerabilities: 23, severity: 'Medium', riskContribution: 15.2, momChange: +0.1, trend: 'stable', assetCriticality: 52 },
  { unit: 'Cloud Infrastructure', risk: 5.8, assets: 156, vulnerabilities: 12, severity: 'Medium', riskContribution: 14.2, momChange: -0.3, trend: 'improving', assetCriticality: 88 }
];

const FALLBACK_INTERNAL_DRIVERS = [
  { rank: 1, category: 'Unpatched Systems', riskScore: 8.5, count: 89, correlation: 'INC-2024-0045', description: '89 production servers missing critical patches' },
  { rank: 2, category: 'Weak Authentication', riskScore: 7.8, count: 234, correlation: 'INC-2024-0031', description: '234 admin accounts without MFA' },
  { rank: 3, category: 'Cloud Misconfigurations', riskScore: 7.1, count: 67, correlation: null, description: '67 S3 buckets with public exposure' },
  { rank: 4, category: 'Data Access Controls', riskScore: 6.9, count: 45, correlation: null, description: 'Over-privileged access to customer databases' }
];

const FALLBACK_EXTERNAL_DRIVERS = [
  { rank: 1, category: 'APT29 Campaign Targeting', riskScore: 8.8, threatActor: 'APT29 (Cozy Bear)', description: 'Active targeting of Apache servers with CVE-2024-12345', correlation: 'INC-2024-0045' },
  { rank: 2, category: 'Exposed Services', riskScore: 8.1, threatActor: 'Multiple threat actors', description: '23 internet-facing services with known vulnerabilities', correlation: null },
  { rank: 3, category: 'Phishing Campaigns', riskScore: 7.2, threatActor: 'FIN7 (Carbanak)', description: 'Finance-themed phishing targeting employees', correlation: 'INC-2024-0039' },
  { rank: 4, category: 'Supply Chain Risk', riskScore: 6.5, threatActor: 'Nation-state actors', description: 'Third-party vendor security assessments overdue', correlation: null }
];

const FALLBACK_RECOMMENDATIONS = [
  { id: 1, priority: 'Critical', action: 'Patch CVE-2024-12345 on 23 production servers', description: 'Critical RCE vulnerability actively exploited by APT29.', currentRisk: 7.2, projectedRisk: 6.0, riskReduction: 1.2, effort: 'Medium', timeline: '2-3 days', cost: '$5,000', costCategory: 'low', threatsNeutralized: 3, exposuresClosed: 23, affected_assets: 23, businessUnits: ['Production Systems', 'IT Operations'], businessUnitImpact: 9.2, roi: 'High' },
  { id: 2, priority: 'Critical', action: 'Enable MFA for all administrative accounts', description: 'Eliminate authentication bypass risk and meet compliance requirements.', currentRisk: 7.2, projectedRisk: 6.3, riskReduction: 0.9, effort: 'Low', timeline: '1 week', cost: '$2,000', costCategory: 'low', threatsNeutralized: 5, exposuresClosed: 234, affected_assets: 145, businessUnits: ['Corporate Network', 'IT Operations'], businessUnitImpact: 8.5, roi: 'High' },
  { id: 3, priority: 'High', action: 'Implement network segmentation for IoT devices', description: 'Isolate IoT/OT devices to prevent lateral movement.', currentRisk: 7.2, projectedRisk: 6.4, riskReduction: 0.8, effort: 'High', timeline: '2-3 weeks', cost: '$25,000', costCategory: 'medium', threatsNeutralized: 2, exposuresClosed: 67, affected_assets: 67, businessUnits: ['Production Systems', 'Corporate Network'], businessUnitImpact: 7.8, roi: 'Medium' },
  { id: 4, priority: 'High', action: 'Update firewall rules to reduce exposed services', description: 'Close unnecessary open ports and restrict external access.', currentRisk: 7.2, projectedRisk: 6.6, riskReduction: 0.6, effort: 'Medium', timeline: '1-2 weeks', cost: '$8,000', costCategory: 'low', threatsNeutralized: 4, exposuresClosed: 89, affected_assets: 89, businessUnits: ['Production Systems', 'Cloud Infrastructure'], businessUnitImpact: 7.2, roi: 'High' },
  { id: 5, priority: 'Medium', action: 'Conduct third-party vendor security assessments', description: 'Complete overdue vendor risk assessments.', currentRisk: 7.2, projectedRisk: 6.8, riskReduction: 0.4, effort: 'Medium', timeline: '4-6 weeks', cost: '$15,000', costCategory: 'medium', threatsNeutralized: 1, exposuresClosed: 12, affected_assets: 34, businessUnits: ['All Business Units'], businessUnitImpact: 6.5, roi: 'Low' }
];

export function RiskDashboardModule({ onModuleChange }: RiskDashboardModuleProps = {}) {
  const [effortFilter, setEffortFilter] = useState('all');
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const [costFilter, setCostFilter] = useState('all');
  const [riskReductionFilter, setRiskReductionFilter] = useState('all');
  const [businessUnitFilter, setBusinessUnitFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Data states - Initialize with Fallback Data
  const [summary, setSummary] = useState<any>(FALLBACK_SUMMARY);
  const [posture, setPosture] = useState<any[]>(FALLBACK_POSTURE);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>(FALLBACK_CATEGORY);
  const [businessUnits, setBusinessUnits] = useState<any[]>(FALLBACK_BUSINESS_UNITS);
  const [internalDrivers, setInternalDrivers] = useState<any[]>(FALLBACK_INTERNAL_DRIVERS);
  const [externalDrivers, setExternalDrivers] = useState<any[]>(FALLBACK_EXTERNAL_DRIVERS);
  const [recommendations, setRecommendations] = useState<any[]>(FALLBACK_RECOMMENDATIONS);

  useEffect(() => {
    let isMounted = true;
    const fetchAllData = async () => {
      try {
        const fetchWithFallback = async (url: string) => {
          try {
            // Updated to use relative path for Proxy support
            const res = await fetch(`${API_BASE}${url}`);

            if (!res.ok) throw new Error('Not OK');
            return await res.json();
          } catch (e) {
            return null;
          }
        };

        const [
          summaryRes,
          postureRes,
          categoryRes,
          buRes,
          internalRes,
          externalRes,
          recRes
        ] = await Promise.all([
          fetchWithFallback('/api/risk/summary'),
          fetchWithFallback('/api/risk/posture'),
          fetchWithFallback('/api/risk/category-breakdown'),
          fetchWithFallback('/api/risk/business-units'),
          fetchWithFallback('/api/risk/internal-drivers'),
          fetchWithFallback('/api/risk/external-drivers'),
          fetchWithFallback('/api/risk/recommendations')
        ]);

        if (isMounted) {
          // Only overwrite fallback data if real data exists
          if (summaryRes) setSummary(summaryRes);
          if (postureRes && postureRes.categories && postureRes.categories.length > 0) setPosture(postureRes.categories);
          if (categoryRes && categoryRes.breakdown && categoryRes.breakdown.length > 0) setCategoryBreakdown(categoryRes.breakdown);
          if (buRes && buRes.units && buRes.units.length > 0) setBusinessUnits(buRes.units);
          if (internalRes && internalRes.drivers && internalRes.drivers.length > 0) setInternalDrivers(internalRes.drivers);
          if (externalRes && externalRes.drivers && externalRes.drivers.length > 0) setExternalDrivers(externalRes.drivers);
          if (recRes && recRes.recommendations && recRes.recommendations.length > 0) setRecommendations(recRes.recommendations);
        }
      } catch (err) {
        console.warn('Backend not available, using fallback data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllData();
    return () => { isMounted = false; };
  }, []);

  // Safe data accessors
  const currentSummary = summary || FALLBACK_SUMMARY;
  const currentPosture = posture.length > 0 ? posture : FALLBACK_POSTURE;
  const currentCategory = categoryBreakdown.length > 0 ? categoryBreakdown : FALLBACK_CATEGORY;
  const currentBusinessUnits = businessUnits.length > 0 ? businessUnits : FALLBACK_BUSINESS_UNITS;
  const currentInternalDrivers = internalDrivers.length > 0 ? internalDrivers : FALLBACK_INTERNAL_DRIVERS;
  const currentExternalDrivers = externalDrivers.length > 0 ? externalDrivers : FALLBACK_EXTERNAL_DRIVERS;
  const currentRecommendations = recommendations.length > 0 ? recommendations : FALLBACK_RECOMMENDATIONS;

  const overallRisk = {
    current: currentSummary.current || 7.2,
    previous: currentSummary.previous || 7.5,
    change: currentSummary.change || -0.3,
    projected: currentSummary.projected || 5.9,
    trend: currentSummary.trend || 'improving',
    monthlyTrend: currentSummary.monthlyTrend || FALLBACK_SUMMARY.monthlyTrend
  };

  const topRiskDrivers = currentSummary.top_drivers || FALLBACK_SUMMARY.top_drivers;
  const riskStoryline = currentSummary.monthly_story || FALLBACK_SUMMARY.monthly_story;

  const mttr = {
    days: currentSummary.time_to_remediate || 23,
    trend: 'improving',
    change: -5,
    target: 28
  };

  const riskVelocity = {
    percentage: currentSummary.risk_velocity || -12,
    trend: 'improving',
    monthlyVelocity: currentSummary.monthlyVelocity || [
      { month: 'Jul', velocity: -5 },
      { month: 'Aug', velocity: -8 },
      { month: 'Sep', velocity: -6 },
      { month: 'Oct', velocity: -10 },
      { month: 'Nov', velocity: -14 },
      { month: 'Dec', velocity: -12 }
    ]
  };

  const avgImprovementRate = 0.25;
  const avgGapToTarget = currentPosture.reduce((sum: number, f: any) => sum + (f.current - f.target), 0) / currentPosture.length;
  const monthsToTarget = Math.ceil(avgGapToTarget / avgImprovementRate);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getRiskLevelColor = (risk: number) => {
    if (risk >= 8) return 'text-red-600';
    if (risk >= 6) return 'text-orange-600';
    if (risk >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getBgRiskLevelColor = (risk: number) => {
    if (risk >= 8) return 'bg-red-50 border-red-300';
    if (risk >= 6) return 'bg-orange-50 border-orange-300';
    if (risk >= 4) return 'bg-yellow-50 border-yellow-300';
    return 'bg-green-50 border-green-300';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'worsening': return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'improving': return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getROIColor = (roi: string) => {
    switch (roi) {
      case 'High': return 'bg-green-600 text-white';
      case 'Medium': return 'bg-yellow-600 text-white';
      case 'Low': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const filteredRecommendations = (currentRecommendations || []).filter((rec: any) => {
    const matchesEffort = effortFilter === 'all' || rec.effort.toLowerCase() === effortFilter.toLowerCase();
    const matchesCost = costFilter === 'all' || rec.costCategory === costFilter;
    const matchesRiskReduction = riskReductionFilter === 'all' ||
      (riskReductionFilter === 'high' && rec.riskReduction >= 1.0) ||
      (riskReductionFilter === 'medium' && rec.riskReduction >= 0.5 && rec.riskReduction < 1.0) ||
      (riskReductionFilter === 'low' && rec.riskReduction < 0.5);
    const matchesBusinessUnit = businessUnitFilter === 'all' ||
      (rec.businessUnits || []).some((bu: string) => bu === businessUnitFilter);

    return matchesEffort && matchesCost && matchesRiskReduction && matchesBusinessUnit;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-lg text-muted-foreground">Loading Risk Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TOP SUMMARY CARDS */}
      <div className="grid gap-4 md:grid-cols-5">
        {/* Overall Risk Score */}
        <Card className="border-2 border-blue-200 bg-blue-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Risk Score</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <div className="text-4xl font-bold text-blue-600">{overallRisk.current}</div>
              <div className="text-sm text-muted-foreground">/10</div>
            </div>
            <div className="flex items-center space-x-1 text-xs mt-2">
              {getTrendIcon(overallRisk.trend)}
              <span className="text-green-600 font-semibold">{Math.abs(overallRisk.change)} pts</span>
              <span className="text-muted-foreground">MoM</span>
            </div>
            <div className="mt-3">
              <ResponsiveContainer width="100%" height={40}>
                <LineChart data={overallRisk.monthlyTrend}>
                  <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Projected Risk Score */}
        <Card className="border-2 border-green-200 bg-green-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Risk Score</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-gray-400 line-through">{overallRisk.current}</div>
                <ArrowDownRight className="h-5 w-5 text-green-600" />
                <div className="text-3xl font-bold text-green-600">{overallRisk.projected}</div>
              </div>
              <div className="text-xs text-muted-foreground">
                After recommended actions
              </div>
              <div className="text-xs font-semibold text-green-700">
                -{(overallRisk.current - overallRisk.projected).toFixed(1)} point reduction
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time to Remediate */}
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time to Remediate</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{mttr.days}</div>
            <div className="text-xs text-muted-foreground mt-1">days MTTR</div>
            <div className="flex items-center space-x-1 text-xs mt-2">
              {getTrendIcon(mttr.trend)}
              <span className="text-green-600 font-semibold">{Math.abs(mttr.change)} days</span>
              <span className="text-muted-foreground">better</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Target: {mttr.target} days
            </div>
          </CardContent>
        </Card>

        {/* Risk Velocity */}
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Velocity</CardTitle>
            <Activity className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{riskVelocity.percentage}%</div>
            <div className="text-xs text-muted-foreground mt-1">Rate of change</div>
            <div className="mt-3">
              <ResponsiveContainer width="100%" height={40}>
                <LineChart data={riskVelocity.monthlyVelocity}>
                  <Line type="monotone" dataKey="velocity" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-green-600 font-semibold mt-2">
              Risk decreasing
            </div>
          </CardContent>
        </Card>

        {/* Top 3 Risk Drivers */}
        <Card className="border-2 border-orange-200 bg-orange-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Risk Drivers</CardTitle>
            <Flame className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(topRiskDrivers || []).map((driver: string, idx: number) => (
                <div key={driver} className="flex items-center justify-between">
                  <span className="text-xs font-medium truncate">{driver}</span>
                  <Badge
                    variant={idx === 0 ? 'destructive' : idx === 1 ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {idx === 0 ? 'High' : idx === 1 ? 'High' : 'Medium'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Storyline */}
      <Card className="border-2 border-indigo-200 bg-indigo-50/30">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-indigo-900 mb-1">This Month's Risk Story</h4>
              <p className="text-sm text-indigo-800">{riskStoryline}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RISK POSTURE ANALYSIS */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span>Risk Posture Analysis</span>
          </CardTitle>
          <CardDescription>
            Current risk levels vs targets, industry benchmarks, and peer groups
            <span className="ml-2 text-green-600 font-semibold">
              • Projected to reach target in {monthsToTarget} months
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={450}>
            <RadarChart data={currentPosture}>
              <PolarGrid />
              <PolarAngleAxis dataKey="factor" />
              <PolarRadiusAxis angle={30} domain={[0, 10]} />
              <Radar name="Current" dataKey="current" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} strokeWidth={2} />
              <Radar name="Target" dataKey="target" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={2} />
              <Radar name="Industry Avg" dataKey="industry" stroke="#6b7280" fill="none" strokeDasharray="5 5" />
              <Radar name="Peer Group" dataKey="peerGroup" stroke="#3b82f6" fill="none" strokeDasharray="3 3" />
              <Tooltip content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border-2 rounded-lg p-3 shadow-lg">
                      <h4 className="font-bold mb-2">{data.factor}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between space-x-4">
                          <span>Current:</span>
                          <span className="font-bold text-red-600">{data.current}</span>
                        </div>
                        <div className="flex items-center justify-between space-x-4">
                          <span>Target:</span>
                          <span className="font-bold text-green-600">{data.target}</span>
                        </div>
                        <div className="flex items-center justify-between space-x-4">
                          <span>Industry:</span>
                          <span className="font-bold text-gray-600">{data.industry}</span>
                        </div>
                        <div className="flex items-center justify-between space-x-4">
                          <span>Peer Group:</span>
                          <span className="font-bold text-blue-600">{data.peerGroup}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">MoM:</span>
                          {data.momChange > 0 ? (
                            <Badge variant="destructive">+{data.momChange}</Badge>
                          ) : (
                            <Badge className="bg-green-600 text-white">
                              {data.momChange}
                            </Badge>
                          )}
                        </div>
                        <Separator className="my-2" />
                        <div className="bg-blue-50 p-2 rounded mt-2">
                          <div className="text-xs font-semibold text-blue-900 mb-1">Key Factors:</div>
                          <div className="text-xs text-blue-800">{data.keyFactors}</div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }} />
            </RadarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500/30 border-2 border-red-500 rounded" />
              <span className="text-sm font-medium">Current</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500/10 border-2 border-green-500 rounded" />
              <span className="text-sm font-medium">Target</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 bg-gray-600" style={{ borderStyle: 'dashed' }} />
              <span className="text-sm font-medium">Industry Avg</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 bg-blue-600" style={{ borderStyle: 'dashed' }} />
              <span className="text-sm font-medium">Peer Group</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RISK BY CATEGORY & BUSINESS UNIT */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Risk by Category */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Risk by Category</CardTitle>
            <CardDescription>Contribution to overall risk score and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={currentCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                >
                  {(currentCategory || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-6 space-y-3">
              {(currentCategory || []).map((entry, index) => (
                <div key={entry.name} className="border-2 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="font-semibold">{entry.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(entry.trend)}
                      <span className={`text-sm font-semibold ${entry.trend === 'up' ? 'text-red-600' : 'text-green-600'
                        }`}>
                        {entry.momChange > 0 ? '+' : ''}{entry.momChange}%
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-gray-50 rounded p-2 text-center">
                      <div className="text-xl font-bold text-gray-900">{entry.value}%</div>
                      <div className="text-muted-foreground">Contribution</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2 text-center">
                      <div className="text-xl font-bold text-purple-600">{entry.riskContribution.toFixed(2)}</div>
                      <div className="text-muted-foreground">Risk Score</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2 text-center">
                      <Badge
                        variant={entry.businessImpact === 'High' ? 'destructive' : entry.businessImpact === 'Medium' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {entry.businessImpact}
                      </Badge>
                      <div className="text-muted-foreground mt-1">Impact</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk by Business Unit */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Risk by Business Unit</CardTitle>
            <CardDescription>Department-level risk distribution and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(currentBusinessUnits || []).map((unit) => (
                <div
                  key={unit.unit}
                  className={`border-2 rounded-lg p-4 ${getBgRiskLevelColor(unit.risk)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold">{unit.unit}</h4>
                      <Badge variant={getPriorityColor(unit.severity) as any}>
                        {unit.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(unit.trend)}
                      <span className={`text-sm font-semibold ${unit.trend === 'worsening' ? 'text-red-600' :
                        unit.trend === 'improving' ? 'text-green-600' :
                          'text-gray-600'
                        }`}>
                        {unit.momChange > 0 ? '+' : ''}{unit.momChange}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getRiskLevelColor(unit.risk)}`}>
                        {unit.risk}
                      </div>
                      <div className="text-xs text-muted-foreground">Risk</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">{unit.riskContribution}%</div>
                      <div className="text-xs text-muted-foreground">Contribution</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{unit.assets}</div>
                      <div className="text-xs text-muted-foreground">Assets</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-orange-600">{unit.vulnerabilities}</div>
                      <div className="text-xs text-muted-foreground">Vulns</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-muted-foreground">Asset Criticality:</span>
                      <Progress value={unit.assetCriticality} className="h-2 w-20" />
                      <span className="font-bold">{unit.assetCriticality}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View BU Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* INTERNAL / EXTERNAL RISK FACTORS */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Internal Risk Drivers */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-indigo-600" />
              <span>Top Internal Risk Drivers</span>
            </CardTitle>
            <CardDescription>Internal vulnerabilities and exposures ranked by risk score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(currentInternalDrivers || []).map((driver) => (
                <div key={driver.rank} className="border-2 rounded-lg p-4 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl font-bold text-indigo-400">#{driver.rank}</div>
                      <div>
                        <h4 className="font-bold">{driver.category}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{driver.description}</p>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className={`text-2xl font-bold ${getRiskLevelColor(driver.riskScore)}`}>
                        {driver.riskScore}
                      </div>
                      <div className="text-xs text-muted-foreground">Risk</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="font-semibold">{driver.count}</span>
                      <span className="text-muted-foreground">issues</span>
                    </div>
                    {driver.correlation && (
                      <Badge variant="outline" className="text-xs">
                        <FileWarning className="h-3 w-3 mr-1" />
                        {driver.correlation}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top External Risk Drivers */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-red-600" />
              <span>Top External Risk Drivers</span>
            </CardTitle>
            <CardDescription>External threats and exposures with threat actor attribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(currentExternalDrivers || []).map((driver) => (
                <div key={driver.rank} className="border-2 border-red-200 rounded-lg p-4 bg-red-50/30">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl font-bold text-red-400">#{driver.rank}</div>
                      <div>
                        <h4 className="font-bold">{driver.category}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{driver.description}</p>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className={`text-2xl font-bold ${getRiskLevelColor(driver.riskScore)}`}>
                        {driver.riskScore}
                      </div>
                      <div className="text-xs text-muted-foreground">Risk</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                    <Badge variant="destructive" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {driver.threatActor}
                    </Badge>
                    {driver.correlation && (
                      <Badge variant="outline" className="text-xs">
                        <FileWarning className="h-3 w-3 mr-1" />
                        {driver.correlation}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RISK RECOMMENDATIONS */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Risk Recommendations</span>
          </CardTitle>
          <CardDescription>Prioritized actions to reduce organizational risk</CardDescription>

          {/* Filters */}
          <div className="grid gap-3 md:grid-cols-4 mt-4">
            <Select value={effortFilter} onValueChange={setEffortFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Effort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Efforts</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>

            <Select value={costFilter} onValueChange={setCostFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Cost" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Costs</SelectItem>
                <SelectItem value="low">Low (&lt; $10K)</SelectItem>
                <SelectItem value="medium">Medium ($10K-$20K)</SelectItem>
                <SelectItem value="high">High (&gt; $20K)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskReductionFilter} onValueChange={setRiskReductionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Risk Reduction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reductions</SelectItem>
                <SelectItem value="high">High (&gt; 1.0)</SelectItem>
                <SelectItem value="medium">Medium (0.5-1.0)</SelectItem>
                <SelectItem value="low">Low (&lt; 0.5)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={businessUnitFilter} onValueChange={setBusinessUnitFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Business Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Business Units</SelectItem>
                <SelectItem value="Production Systems">Production Systems</SelectItem>
                <SelectItem value="Corporate Network">Corporate Network</SelectItem>
                <SelectItem value="IT Operations">IT Operations</SelectItem>
                <SelectItem value="Cloud Infrastructure">Cloud Infrastructure</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(filteredRecommendations || []).map((rec: any) => (
              <div
                key={rec.id}
                className="border-2 border-purple-200 rounded-lg p-5 bg-purple-50/30"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={getPriorityColor(rec.priority) as any} className="font-bold">
                        {rec.priority}
                      </Badge>
                      <Badge className={`${getROIColor(rec.roi)} font-bold`}>
                        {rec.roi} ROI
                      </Badge>
                    </div>
                    <h4 className="font-bold text-lg mb-1">{rec.action}</h4>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xs text-muted-foreground mb-1">Post-Remediation Risk</div>
                    <div className="flex items-center space-x-2">
                      <div className="text-xl font-bold text-gray-400 line-through">{rec.currentRisk}</div>
                      <ArrowDownRight className="h-5 w-5 text-green-600" />
                      <div className="text-2xl font-bold text-green-600">{rec.projectedRisk}</div>
                    </div>
                  </div>
                </div>

                {/* Delta Visualization */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold">Risk Reduction</span>
                    <span className="font-bold text-green-600">-{rec.riskReduction} points</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600"
                      style={{ width: `${(rec.riskReduction / overallRisk.current) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-5 mb-4">
                  <div className="bg-white border-2 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-blue-600">{rec.businessUnitImpact}</div>
                    <div className="text-xs text-muted-foreground">BU Impact</div>
                  </div>
                  <div className="bg-white border-2 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-red-600">{rec.threatsNeutralized}</div>
                    <div className="text-xs text-muted-foreground">Threats Stopped</div>
                  </div>
                  <div className="bg-white border-2 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-purple-600">{rec.exposuresClosed}</div>
                    <div className="text-xs text-muted-foreground">Exposures Closed</div>
                  </div>
                  <div className="bg-white border-2 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-gray-900">{rec.cost}</div>
                    <div className="text-xs text-muted-foreground">Cost</div>
                  </div>
                  <div className="bg-white border-2 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-orange-600">{rec.timeline}</div>
                    <div className="text-xs text-muted-foreground">Timeline</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Affected Business Units</div>
                  <div className="flex flex-wrap gap-2">
                    {(rec.businessUnits || []).map((unit: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        <Building className="h-3 w-3 mr-1" />
                        {unit}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Effort: </span>
                      <span className="font-semibold">{rec.effort}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Assets: </span>
                      <span className="font-semibold">{rec.affected_assets}</span>
                    </div>
                  </div>
                  <Button size="sm">
                    <Zap className="h-4 w-4 mr-1" />
                    Implement Action
                  </Button>
                </div>
              </div>
            ))}

            {filteredRecommendations.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recommendations match your current filters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}