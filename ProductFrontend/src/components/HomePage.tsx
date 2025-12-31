const API_BASE = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  Activity,
  Target,
  CheckCircle,
  Clock,
  Server,
  BarChart3,
  FileText,
  Bell,
  Calendar as CalendarIcon,
  Eye,
  AlertCircle,
  FileWarning,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  DollarSign,
  Timer,
  ShieldCheck,
  Radio,
  Loader2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface HomePageProps {
  onModuleChange?: (module: string) => void;
}

// Types for API data
interface KeyMetric {
  value: number;
  max?: number;
  unit?: string;
  target?: number;
  status?: string;
  change?: number;
  change_direction?: 'up' | 'down';
  change_percentage?: number;
}

interface OperationalIndicator {
  value?: number;
  total?: number;
  critical?: number;
  medium?: number;
  count?: number;
  previous_count?: number;
  percentage?: number;
  note?: string;
  change_direction?: 'up' | 'down';
}

interface TrendData {
  day: string;
  risk: number;
  incidents: number;
  compliance: number;
}

interface CalendarEvent {
  title: string;
  date: string;
  priority: string;
  type: string;
}

interface ModuleHealth {
  module_id: string;
  name: string;
  status: string;
  alerts: number;
}

interface AlertSeverity {
  name: string;
  value: number;
  color: string;
}

interface TopRisk {
  title: string;
  priority: string;
  impact: number;
  likelihood: number;
  affected_assets: number;
  description: string;
}

export function HomePage({ onModuleChange }: HomePageProps = {}) {
  const { user } = useAuth();

  // State for all API data
  const [keyMetrics, setKeyMetrics] = useState<Record<string, KeyMetric>>({});
  const [operationalIndicators, setOperationalIndicators] = useState<Record<string, OperationalIndicator>>({});
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [moduleHealth, setModuleHealth] = useState<ModuleHealth[]>([]);
  const [alertsBySeverity, setAlertsBySeverity] = useState<AlertSeverity[]>([]);
  const [topRisks, setTopRisks] = useState<TopRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [
          metricsRes,
          indicatorsRes,
          trendsRes,
          calendarRes,
          moduleHealthRes,
          alertsRes,
          risksRes
        ] = await Promise.all([
          fetch(`${API_BASE}/api/metrics/key`).then(r => r.json()),

          // ✅ DISABLED UNTIL METRICS MODULE IS READY (Using Promise.resolve to keep array index correct)
          // fetch(`${API_BASE}/api/metrics/operational`).then(r => r.json()),
          Promise.resolve({}),

          // ✅ DISABLED UNTIL METRICS MODULE IS READY
          // fetch(`${API_BASE}/api/metrics/trends/5days`).then(r => r.json()),
          Promise.resolve({}),

          fetch(`${API_BASE}/api/calendar/upcoming`).then(r => r.json()),
          fetch(`${API_BASE}/api/metrics/module-health`).then(r => r.json()),
          fetch(`${API_BASE}/api/metrics/alerts/today`).then(r => r.json()),
          fetch(`${API_BASE}/api/risks/top`).then(r => r.json())
        ]);

        setKeyMetrics(metricsRes);
        setOperationalIndicators(indicatorsRes);
        setTrends(trendsRes?.trends || []);
        setCalendarEvents(calendarRes?.events || []);
        setModuleHealth(moduleHealthRes?.modules || []);
        setAlertsBySeverity([
          { name: 'Critical', value: alertsRes?.critical || 12, color: '#ef4444' },
          { name: 'High', value: alertsRes?.high || 34, color: '#f97316' },
          { name: 'Medium', value: alertsRes?.medium || 67, color: '#eab308' },
          { name: 'Low', value: alertsRes?.low || 43, color: '#22c55e' }
        ]);
        setTopRisks(risksRes?.risks || []);
      } catch (err) {
        console.error('Failed to fetch home data:', err);
        setError('Failed to load some dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Fallback data
  const fallbackKeyMetrics = {
    security_score: { value: 8.7, max: 10, status: 'Strong', change: 0.3, change_direction: 'up' },
    mttd: { value: 4.2, unit: 'h', target: 6, status: 'Beating target', change: 0.8, change_direction: 'down' },
    mttr: { value: 12.5, unit: 'h', target: 16, status: 'Beating target', change: 2.3, change_direction: 'down' },
    security_roi: { value: 3.2, unit: 'x', target: 2.5, status: 'Exceeding', change_percentage: 15 }
  };

  const fallbackOperational = {
    enterprise_risk: { value: 7.2, change: 4, change_direction: 'down', note: 'Risk decreased 4% this month' },
    active_incidents: { total: 7, critical: 2, medium: 5, note: '2 critical, 5 medium priority' },
    critical_vulnerabilities: { count: 23, previous_count: 31, note: 'Down from 31 last week' },
    compliance_score: { percentage: 87.3, note: 'On track for Q1 audit' }
  };

  const fallbackTrends = [
    { day: 'Mon', risk: 7.6, incidents: 12, compliance: 85.2 },
    { day: 'Tue', risk: 7.4, incidents: 9, compliance: 86.1 },
    { day: 'Wed', risk: 7.3, incidents: 8, compliance: 86.8 },
    { day: 'Thu', risk: 7.2, incidents: 7, compliance: 87.0 },
    { day: 'Fri', risk: 7.2, incidents: 7, compliance: 87.3 }
  ];

  const fallbackCalendar = [
    { title: 'SOC 2 Audit - Evidence Review', date: 'Dec 12', priority: 'high', type: 'audit' },
    { title: 'Quarterly Patch Cycle', date: 'Dec 15', priority: 'medium', type: 'patch' },
    { title: 'GDPR Compliance Review', date: 'Dec 18', priority: 'high', type: 'compliance' },
    { title: 'Incident Response Drill', date: 'Dec 20', priority: 'medium', type: 'drill' }
  ];

  const fallbackModuleHealth = [
    { module_id: 'assets', name: 'Asset & Network Management', status: 'Healthy', alerts: 2 },
    { module_id: 'vulnerabilities', name: 'Vulnerability & Threat Intel', status: 'Attention Needed', alerts: 23 },
    { module_id: 'risk', name: 'Risk Exposure Dashboard', status: 'Improving', alerts: 5 },
    { module_id: 'compliance', name: 'Policy & Compliance Tracker', status: 'Healthy', alerts: 8 },
    { module_id: 'events', name: 'Events & Alert Monitoring', status: 'Active', alerts: 18 },
    { module_id: 'incident-response', name: 'Incident Response Lite', status: 'Healthy', alerts: 3 }
  ];

  const fallbackAlerts = [
    { name: 'Critical', value: 12, color: '#ef4444' },
    { name: 'High', value: 34, color: '#f97316' },
    { name: 'Medium', value: 67, color: '#eab308' },
    { name: 'Low', value: 43, color: '#22c55e' }
  ];

  const fallbackTopRisks = [
    {
      title: 'Unpatched Apache Servers',
      priority: 'Critical',
      impact: 9.2,
      likelihood: 8.5,
      affected_assets: 23,
      description: 'CVE-2024-12345 actively exploited by APT29'
    },
    {
      title: 'Weak Authentication Controls',
      priority: 'High',
      impact: 8.5,
      likelihood: 7.2,
      affected_assets: 234,
      description: '234 admin accounts without MFA enabled'
    },
    {
      title: 'Cloud Storage Misconfigurations',
      priority: 'High',
      impact: 7.8,
      likelihood: 6.5,
      affected_assets: 67,
      description: 'Public S3 buckets exposing customer data'
    }
  ];

  // Use real data or fallback
  const metrics = { ...fallbackKeyMetrics, ...keyMetrics };
  const indicators = { ...fallbackOperational, ...operationalIndicators };
  const trendsData = trends.length > 0 ? trends : fallbackTrends;
  const calendarData = calendarEvents.length > 0 ? calendarEvents : fallbackCalendar;
  const moduleHealthData = moduleHealth.length > 0 ? moduleHealth : fallbackModuleHealth;
  const alertsData = alertsBySeverity.length > 0 ? alertsBySeverity : fallbackAlerts;
  const topRisksData = topRisks.length > 0 ? topRisks : fallbackTopRisks;

  const totalAlerts = alertsData.reduce((sum, item) => sum + item.value, 0);

  const getTrendIcon = (direction?: string) => {
    switch (direction) {
      case 'up': return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'down': return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-600 text-white';
      case 'High': return 'bg-orange-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const handleModuleClick = (moduleId: string) => {
    if (onModuleChange) {
      onModuleChange(moduleId);
    }
  };

  return (
    <div className="space-y-6">
      {/* STRATEGIC HEADER */}
      <Card className="border-2 border-blue-900 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-blue-900 mb-2">
                Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} — Your security command center awaits
              </h1>
              <p className="text-lg text-blue-700">
                Comprehensive oversight of your organization's security posture and operational readiness
              </p>
            </div>
            <div className="text-center">
              {loading ? (
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
              ) : (
                <>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <ShieldCheck className="h-8 w-8 text-green-600" />
                    <div>
                      <div className="text-5xl font-bold text-green-600">
                        {metrics.security_score.value}
                      </div>
                      <div className="text-sm text-muted-foreground">/10</div>
                    </div>
                  </div>
                  <Badge className="bg-green-600 text-white font-semibold">
                    {metrics.security_score.status}
                  </Badge>
                  <div className="flex items-center justify-center space-x-1 text-sm mt-2">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-semibold">+{metrics.security_score.change}</span>
                    <span className="text-muted-foreground">this month</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EXECUTIVE KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Mean Time to Detect */}
        <Card className="border-2 border-emerald-200 bg-emerald-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mean Time to Detect</CardTitle>
            <Eye className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mt-8" />
            ) : (
              <>
                <div className="text-4xl font-bold text-emerald-600">{metrics.mttd.value}{metrics.mttd.unit}</div>
                <div className="flex items-center space-x-1 text-xs mt-2">
                  <ArrowDownRight className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-semibold">{metrics.mttd.change}h faster</span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Target: {metrics.mttd.target}h</span>
                    <span className="font-semibold text-green-600">{metrics.mttd.status}</span>
                  </div>
                  <Progress value={(metrics.mttd.target! - metrics.mttd.value) / metrics.mttd.target! * 100} className="h-2 bg-emerald-200" />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Mean Time to Respond */}
        <Card className="border-2 border-blue-200 bg-blue-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mean Time to Respond</CardTitle>
            <Timer className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mt-8" />
            ) : (
              <>
                <div className="text-4xl font-bold text-blue-600">{metrics.mttr.value}{metrics.mttr.unit}</div>
                <div className="flex items-center space-x-1 text-xs mt-2">
                  <ArrowDownRight className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-semibold">{metrics.mttr.change}h faster</span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Target: {metrics.mttr.target}h</span>
                    <span className="font-semibold text-green-600">{metrics.mttr.status}</span>
                  </div>
                  <Progress value={(metrics.mttr.target! - metrics.mttr.value) / metrics.mttr.target! * 100} className="h-2 bg-blue-200" />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Security ROI */}
        <Card className="border-2 border-purple-200 bg-purple-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security ROI</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mt-8" />
            ) : (
              <>
                <div className="text-4xl font-bold text-purple-600">{metrics.security_roi.value}{metrics.security_roi.unit}</div>
                <div className="flex items-center space-x-1 text-xs mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-semibold">+{metrics.security_roi.change_percentage}%</span>
                  <span className="text-muted-foreground">vs target</span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Target: {metrics.security_roi.target}%</span>
                    <span className="font-semibold text-green-600">{metrics.security_roi.status}</span>
                  </div>
                  <Progress value={(metrics.security_roi.value / metrics.security_roi.target!) * 100} className="h-2 bg-purple-200" />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* OPERATIONAL INDICATORS */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span>Operational Indicators</span>
          </CardTitle>
          <CardDescription>Real-time security operations overview with narrative context</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border-2 rounded-lg p-4 bg-gray-50 animate-pulse">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-4">
              {/* Enterprise Risk */}
              <div className="border-2 rounded-lg p-4 bg-orange-50 border-orange-300 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleModuleClick('risk')}>
                <div className="flex items-center justify-between mb-3">
                  <Target className="h-5 w-5 text-orange-600" />
                  {getTrendIcon(indicators.enterprise_risk?.change_direction || 'down')}
                </div>
                <div className="mb-2">
                  <div className="flex items-baseline space-x-1">
                    <div className="text-3xl font-bold text-orange-600">
                      {indicators.enterprise_risk?.value || '7.2'}
                    </div>
                    <span className="text-sm text-muted-foreground">/10</span>
                  </div>
                  <div className="text-sm font-medium text-gray-700 mt-1">Enterprise Risk</div>
                </div>
                <div className="text-xs text-gray-600 italic">
                  {indicators.enterprise_risk?.note || 'Risk decreased 4% this month'}
                </div>
              </div>

              {/* Active Incidents */}
              <div className="border-2 rounded-lg p-4 bg-red-50 border-red-300 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleModuleClick('incident-response')}>
                <div className="flex items-center justify-between mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <Minus className="h-4 w-4 text-gray-600" />
                </div>
                <div className="mb-2">
                  <div className="text-3xl font-bold text-red-600">
                    {indicators.active_incidents?.total || '7'}
                  </div>
                  <div className="text-sm font-medium text-gray-700 mt-1">Active Incidents</div>
                </div>
                <div className="text-xs text-gray-600 italic">
                  {indicators.active_incidents?.note || '2 critical, 5 medium priority'}
                </div>
              </div>

              {/* Critical Vulnerabilities */}
              <div className="border-2 rounded-lg p-4 bg-purple-50 border-purple-300 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleModuleClick('vulnerabilities')}>
                <div className="flex items-center justify-between mb-3">
                  <Shield className="h-5 w-5 text-purple-600" />
                  {getTrendIcon('down')}
                </div>
                <div className="mb-2">
                  <div className="text-3xl font-bold text-purple-600">
                    {indicators.critical_vulnerabilities?.count || '23'}
                  </div>
                  <div className="text-sm font-medium text-gray-700 mt-1">Critical Vulnerabilities</div>
                </div>
                <div className="text-xs text-gray-600 italic">
                  {indicators.critical_vulnerabilities?.note || 'Down from 31 last week'}
                </div>
              </div>

              {/* Compliance Score */}
              <div className="border-2 rounded-lg p-4 bg-green-50 border-green-300 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleModuleClick('compliance')}>
                <div className="flex items-center justify-between mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  {getTrendIcon('up')}
                </div>
                <div className="mb-2">
                  <div className="text-3xl font-bold text-green-600">
                    {indicators.compliance_score?.percentage || '87.3'}%
                  </div>
                  <div className="text-sm font-medium text-gray-700 mt-1">Compliance Score</div>
                </div>
                <div className="text-xs text-gray-600 italic">
                  {indicators.compliance_score?.note || 'On track for Q1 audit'}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECURITY TRENDS & CALENDAR */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 5-Day Security Trends */}
        <Card className="shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>5-Day Security Trends</span>
            </CardTitle>
            <CardDescription>Risk, incidents, and compliance trajectory</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={trendsData}>
                    <defs>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="risk" stroke="#f97316" fillOpacity={1} fill="url(#colorRisk)" name="Risk Score" />
                    <Area type="monotone" dataKey="incidents" stroke="#ef4444" fillOpacity={1} fill="url(#colorIncidents)" name="Incidents" />
                    <Area type="monotone" dataKey="compliance" stroke="#22c55e" fillOpacity={1} fill="url(#colorCompliance)" name="Compliance %" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Radio className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800 italic">
                      Overall risk trending down while compliance improved 2.1% this week. Incident count reduced by 42% from Monday peak.
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Security Calendar */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-indigo-600" />
              <span>Security Calendar</span>
            </CardTitle>
            <CardDescription>Upcoming activities & deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {calendarData.map((event, idx) => (
                  <div key={idx} className="border-2 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start space-x-3">
                      <div className="bg-gray-500 text-white rounded-lg px-3 py-2 text-center flex-shrink-0">
                        <div className="text-xs font-semibold">{event.date.split(' ')[0]}</div>
                        <div className="text-lg font-bold">{event.date.split(' ')[1]}</div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{event.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">{event.type}</Badge>
                          {event.priority === 'high' && (
                            <Badge variant="destructive" className="text-xs">High Priority</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MODULE HEALTH & ALERTS */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Module Health */}
        <Card className="shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span>Module Health</span>
            </CardTitle>
            <CardDescription>System status and alert overview</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {moduleHealthData.map((module) => (
                  <div
                    key={module.module_id}
                    className="border-2 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleModuleClick(module.module_id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${module.alerts > 0 ? 'bg-red-500' : 'bg-green-500'}`} />
                        <Server className="h-5 w-5 text-purple-600" />
                        <div>
                          <h4 className="font-semibold">{module.name}</h4>
                          <p className="text-xs text-purple-600">{module.status}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {module.alerts > 0 ? (
                          <Badge variant="destructive" className="font-bold">
                            {module.alerts} alerts
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Healthy
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Security Alerts */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-red-600" />
              <span>Today's Security Alerts</span>
            </CardTitle>
            <CardDescription>Severity distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-gray-900">{totalAlerts}</div>
              <div className="text-sm text-muted-foreground">Total Alerts</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={alertsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={(entry) => entry.name}
                >
                  {alertsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {alertsData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <span className="text-lg font-bold" style={{ color: item.color }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TOP SECURITY RISKS */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileWarning className="h-5 w-5 text-red-600" />
            <span>Top Security Risks</span>
          </CardTitle>
          <CardDescription>Highest priority threats requiring executive attention</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {topRisksData.map((risk, idx) => (
                <div key={idx} className="border-2 border-red-200 rounded-lg p-5 bg-red-50/30">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-bold text-lg">{risk.title}</h4>
                        <Badge className={getPriorityColor(risk.priority)}>
                          {risk.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">{risk.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Impact</div>
                      <Progress value={risk.impact * 10} className="h-3 bg-red-200" />
                      <div className="text-sm font-bold text-red-600 mt-1">{risk.impact}/10</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Likelihood</div>
                      <Progress value={risk.likelihood * 10} className="h-3 bg-orange-200" />
                      <div className="text-sm font-bold text-orange-600 mt-1">{risk.likelihood}/10</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Affected Assets</div>
                      <div className="text-2xl font-bold text-purple-600">{risk.affected_assets}</div>
                    </div>
                  </div>

                  <Button variant="destructive" size="sm">
                    <Zap className="h-4 w-4 mr-1" />
                    Review & Remediate
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* EXECUTIVE ACTIONS */}
      <Card className="shadow-lg border-2 border-blue-900 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <Zap className="h-5 w-5" />
            <span>Executive Actions</span>
          </CardTitle>
          <CardDescription>Key CISO workflows and rapid response tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button className="bg-blue-900 hover:bg-blue-800 text-white" onClick={() => handleModuleClick('executive-report')}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Board Report
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleModuleClick('incident-response')}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Incident Command
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => handleModuleClick('compliance')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Compliance Dashboard
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleModuleClick('risk')}>
              <Target className="h-4 w-4 mr-2" />
              Risk Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}